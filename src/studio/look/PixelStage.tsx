import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useFrame, useThree } from '@react-three/fiber';
import { W, H, STAGE_CENTER_Y } from '../tokens';
import type { Look } from '../series';

/**
 * The world layer of a DA v2 frame: a real 3D scene rendered at low resolution, finished by one shader,
 * then upscaled with hard pixels to 1080×1920. Type and labels are drawn above it at full resolution —
 * the "low-res world, crisp type" signature.
 *
 * The finish never touches flat colours (a palette colour stays that exact colour, which also keeps the
 * video cheap to compress). It only shapes the LIGHT: distance fog and the spotlight falloff are cut into
 * a few steps and stippled with an ordered dither, and a 1-pixel ink line is drawn behind every silhouette.
 *
 * Low resolution is also what makes software WebGL fast enough on a GPU-less cloud machine.
 */
const POST_FRAG = /* glsl */ `
precision highp float;
#include <packing>
uniform sampler2D tScene;
uniform sampler2D tDepth;
uniform vec2 uRes, uCenter;
uniform vec3 uFog;
uniform float uNear, uFar, uFogNear, uFogFar, uLevels, uDither, uScan, uVignette, uOutline;
varying vec2 vUv;
vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0031308)), vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }
float bayer4(vec2 p) {
  int x = int(mod(p.x, 4.0)); int y = int(mod(p.y, 4.0)); int i = x + y * 4;
  float m = 5.0;
  if (i == 0) m = 0.0; else if (i == 1) m = 8.0; else if (i == 2) m = 2.0; else if (i == 3) m = 10.0;
  else if (i == 4) m = 12.0; else if (i == 5) m = 4.0; else if (i == 6) m = 14.0; else if (i == 7) m = 6.0;
  else if (i == 8) m = 3.0; else if (i == 9) m = 11.0; else if (i == 10) m = 1.0; else if (i == 11) m = 9.0;
  else if (i == 12) m = 15.0; else if (i == 13) m = 7.0; else if (i == 14) m = 13.0;
  return (m + 0.5) / 16.0 - 0.5;
}
float dist(vec2 uv) { return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, uNear, uFar); }
// a 0-1 amount turned into uLevels flat steps; between two steps the Bayer matrix stipples. 0 stays exactly 0.
float stipple(float v, float b) { float n = max(2.0, uLevels) - 1.0; return clamp(floor(v * n + 0.5 + b * uDither) / n, 0.0, 1.0); }
void main() {
  vec3 c = toSRGB(texture2D(tScene, vUv).rgb);
  float b = bayer4(gl_FragCoord.xy);
  float d = dist(vUv);
  vec2 px = 1.0 / uRes;
  // ink outline: this pixel sits just behind something clearly nearer
  float nearest = min(min(dist(vUv + vec2(px.x, 0.0)), dist(vUv - vec2(px.x, 0.0))), min(dist(vUv + vec2(0.0, px.y)), dist(vUv - vec2(0.0, px.y))));
  float edge = step(d * 0.004 + 0.002, d - nearest);
  c = mix(c, c * 0.3, edge * uOutline);
  // light falls off with distance and towards the corners — in steps, stippled, never as a smooth gradient
  float fog = smoothstep(uFogNear, uFogFar, d);
  c = mix(c, toSRGB(uFog), stipple(fog, b));
  vec2 v = (vUv - uCenter) * vec2(1.0, 1.2);
  c *= 1.0 - stipple(uVignette * smoothstep(0.28, 0.92, length(v)), b);
  c *= 1.0 - uScan * mod(floor(gl_FragCoord.y), 2.0);
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;
const POST_VERT = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const Finish: React.FC<{ look: Look; w: number; h: number; fog: [number, number]; bg: string }> = ({ look, w, h, fog, bg }) => {
  const { gl, scene, camera } = useThree();
  const rt = useMemo(() => {
    const t = new THREE.WebGLRenderTarget(w, h, { depthBuffer: true, magFilter: THREE.NearestFilter, minFilter: THREE.NearestFilter });
    t.texture.colorSpace = THREE.SRGBColorSpace; // 8-bit sRGB storage keeps the darks precise
    t.depthTexture = new THREE.DepthTexture(w, h);
    return t;
  }, [w, h]);
  const post = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: POST_VERT, fragmentShader: POST_FRAG, depthTest: false, depthWrite: false,
      uniforms: {
        tScene: { value: null }, tDepth: { value: null }, uRes: { value: new THREE.Vector2(w, h) }, uCenter: { value: new THREE.Vector2(0.5, 1 - STAGE_CENTER_Y / H) },
        uFog: { value: new THREE.Color(bg) }, uNear: { value: 0.05 }, uFar: { value: 600 }, uFogNear: { value: 10 }, uFogFar: { value: 40 },
        uLevels: { value: 6 }, uDither: { value: 1 }, uScan: { value: 0 }, uVignette: { value: 0 }, uOutline: { value: 0 },
      },
    });
    const s = new THREE.Scene();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    quad.frustumCulled = false;
    s.add(quad);
    return { scene: s, cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), mat };
  }, [w, h]);
  // priority 1: this component owns the render (scene → low-res target → finishing shader → canvas)
  useFrame(() => {
    const u = post.mat.uniforms, c = camera as THREE.PerspectiveCamera;
    u.tScene.value = rt.texture; u.tDepth.value = rt.depthTexture; u.uNear.value = c.near; u.uFar.value = c.far;
    u.uFog.value.set(bg); u.uFogNear.value = fog[0]; u.uFogFar.value = fog[1];
    u.uLevels.value = look.levels; u.uDither.value = look.dither; u.uScan.value = look.scan; u.uVignette.value = look.vignette; u.uOutline.value = look.outline;
    gl.setRenderTarget(rt); gl.clear(); gl.render(scene, camera);
    gl.setRenderTarget(null); gl.render(post.scene, post.cam);
  }, 1);
  return null;
};

/** Copies the camera computed in React (a pure function of the frame) onto the canvas camera before each render. */
const CameraSync: React.FC<{ cam: THREE.PerspectiveCamera }> = ({ cam }) => {
  const ref = useRef(cam); ref.current = cam;
  useFrame(({ camera }) => {
    const c = camera as THREE.PerspectiveCamera;
    c.copy(ref.current, false);
    c.updateMatrixWorld(true);
    c.updateProjectionMatrix();
  }, -10);
  return null;
};

export type PixelStageProps = {
  look: Look;
  camera: THREE.PerspectiveCamera;
  /** background and fog colour */
  bg: string;
  /** distance fog [start, full] in world units from the camera; fades the far table into the background */
  fog?: [number, number];
  /** 'basic' = hard pixel shadows (default), 'soft' = PCF soft */
  shadows?: 'basic' | 'soft' | false;
  children: React.ReactNode;
};

export const PixelStage: React.FC<PixelStageProps> = ({ look, camera, bg, fog, shadows = 'basic', children }) => {
  const w = Math.round(W / look.px), h = Math.round(H / look.px);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, overflow: 'hidden', imageRendering: 'pixelated', background: bg }}>
      <div style={{ width: w, height: h, transform: `scale(${W / w}, ${H / h})`, transformOrigin: '0 0' }}>
        <ThreeCanvas width={w} height={h} dpr={1} flat shadows={shadows === false ? false : shadows === 'soft' ? 'soft' : 'basic'}
          gl={{ antialias: false, alpha: false, powerPreference: 'default' }}>
          <CameraSync cam={camera} />
          <color attach="background" args={[bg]} />
          {children}
          <Finish look={look} w={w} h={h} fog={fog ?? [1e6, 2e6]} bg={bg} />
        </ThreeCanvas>
      </div>
    </div>
  );
};

/** True when this browser can create a WebGL2 context (checked once, before the composition mounts). */
export function probeWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') ?? c.getContext('webgl');
    const ok = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  } catch {
    return false;
  }
}
