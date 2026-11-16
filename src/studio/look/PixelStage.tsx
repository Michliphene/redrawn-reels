import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useFrame, useThree } from '@react-three/fiber';
import { W, H } from '../tokens';
import type { Look } from '../series';

/**
 * The world layer of a DA v2 frame: a real 3D scene rendered at low resolution, finished by one shader
 * (ordered dither + posterise + scanlines + vignette), then upscaled with hard pixels to 1080×1920.
 * Type and labels are drawn above it at full resolution — the "low-res world, crisp type" signature.
 *
 * Low resolution is also what makes software WebGL fast enough on a GPU-less cloud machine.
 */
const POST_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tScene;
uniform vec2 uRes;
uniform float uLevels, uDither, uScan, uVignette;
varying vec2 vUv;
vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0031308)), vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }
float bayer4(vec2 p) {
  int x = int(mod(p.x, 4.0)); int y = int(mod(p.y, 4.0)); int i = x + y * 4;
  float m = 0.0;
  if (i == 0) m = 0.0; else if (i == 1) m = 8.0; else if (i == 2) m = 2.0; else if (i == 3) m = 10.0;
  else if (i == 4) m = 12.0; else if (i == 5) m = 4.0; else if (i == 6) m = 14.0; else if (i == 7) m = 6.0;
  else if (i == 8) m = 3.0; else if (i == 9) m = 11.0; else if (i == 10) m = 1.0; else if (i == 11) m = 9.0;
  else if (i == 12) m = 15.0; else if (i == 13) m = 7.0; else if (i == 14) m = 13.0; else m = 5.0;
  return (m + 0.5) / 16.0 - 0.5;
}
void main() {
  vec3 c = toSRGB(texture2D(tScene, vUv).rgb);
  vec2 d = vUv - vec2(0.5, 0.44);
  c *= 1.0 - uVignette * smoothstep(0.25, 0.95, length(d * vec2(1.0, 1.25)));
  float steps = max(2.0, uLevels) - 1.0;
  c = floor(c * steps + 0.5 + bayer4(gl_FragCoord.xy) * uDither) / steps;
  c *= 1.0 - uScan * mod(floor(gl_FragCoord.y), 2.0);
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;
const POST_VERT = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const Finish: React.FC<{ look: Look; w: number; h: number }> = ({ look, w, h }) => {
  const { gl, scene, camera } = useThree();
  const rt = useMemo(() => {
    const t = new THREE.WebGLRenderTarget(w, h, { depthBuffer: true, magFilter: THREE.NearestFilter, minFilter: THREE.NearestFilter });
    t.texture.colorSpace = THREE.SRGBColorSpace; // 8-bit sRGB storage: no banding in the darks before the dither
    return t;
  }, [w, h]);
  const post = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: POST_VERT, fragmentShader: POST_FRAG, depthTest: false, depthWrite: false,
      uniforms: { tScene: { value: null }, uRes: { value: new THREE.Vector2(w, h) }, uLevels: { value: 24 }, uDither: { value: 1 }, uScan: { value: 0 }, uVignette: { value: 0 } },
    });
    const s = new THREE.Scene();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    quad.frustumCulled = false;
    s.add(quad);
    return { scene: s, cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), mat };
  }, [w, h]);
  // priority 1: this component owns the render (scene → low-res target → finishing shader → canvas)
  useFrame(() => {
    const u = post.mat.uniforms;
    u.tScene.value = rt.texture; u.uLevels.value = look.levels; u.uDither.value = look.dither; u.uScan.value = look.scan; u.uVignette.value = look.vignette;
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
  /** linear fog [near, far] in world units; fades the far table into the background */
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
          {fog && <fog attach="fog" args={[bg, fog[0], fog[1]]} />}
          {children}
          <Finish look={look} w={w} h={h} />
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
