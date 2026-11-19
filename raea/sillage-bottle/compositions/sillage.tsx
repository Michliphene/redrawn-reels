/**
 * SILLAGE N°1 — "What's inside your perfume", built in raea (Bevy through raea/3d). No map: a perfume counter.
 * Only the text comes from the studio episode scent-001-bottle: the voice, its word timings and the sourced figures
 * (public/episodes/scent-001-bottle/SOURCES.md).
 *
 *   the bottle (0, 0, 0)  a thick glass flacon on a velvet plinth, empty at frame 0
 *   five notes            a ring of small pedestals around it, one per ingredient, each appears when it is named:
 *                         jasmine (heap of flowers), rose, vetiver roots, vanilla pods, patchouli leaves
 *   the pour              at the end of each note's beat a drop arcs into the bottle and a layer of the note's colour rises
 *   the lab               on "lab" a molecule descends over the bottle and glows
 *   the loop              the camera returns to frame 0 on "jasmine:"
 *
 * Countries are type, never a map. A figure is on screen once (a big number or a caption, not both).
 * Every cue is timed from timings.json (`w(beat, word)`), never by eye.
 */
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "raea";
import { Bloom, DepthOfField, Entity, ToneMapping, manifold } from "raea/3d";
import { Capsule3d, Cuboid, Cylinder, Mesh3d, Sphere, Torus } from "raea/mesh";
import { Fog, StandardMaterial } from "raea/pbr";
import { AmbientLight, DirectionalLight, PointLight, Shadows, SpotLight } from "raea/light";
import { Quat, Transform } from "raea/transform";
import { Camera3d } from "raea/camera";
import { LinearRgba, Srgba } from "raea/color";
import TIMINGS from "./timings.json";

/* ------------------------------------------------------------------ house tokens (series `scent`) */
const FPS = 30, W = 1080, H = 1920;
const P = {
  bg: "#0C0609", glow: "#3B1A28", velvet: "#2A1420", stone: "#45283A", ink: "#F8EFE9", muted: "#A9949C", accent: "#F4B6C2",
  gold: "#D9B26A", glass: "#F4E9EE",
  jasmine: "#EADBB0", rose: "#E68FA8", vetiver: "#93A86C", vanilla: "#C29A6B", patchouli: "#8C6444",
};
const SAFE = { top: 250, bottom: 1440, left: 64, right: 940, railX: 930 };
const DUR = TIMINGS.duration + 0.5;

/* ------------------------------------------------------------------ time helpers */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, at: number, d: number) => clamp01((t - at) / d);
const out3 = (x: number) => 1 - Math.pow(1 - x, 3);
const inOut3 = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outBack = (x: number, s = 1.6) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
type V3 = [number, number, number];
const lerp3 = (a: number[], b: number[], k: number) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)] as V3;
const glow = (hex: string, k: number) => LinearRgba.from(Srgba.hex(hex)).mul(k);
const life = (t: number, at: number, hold: number, fade = 0.2) => Math.min(ramp(t, at, fade), 1 - ramp(t, at + hold, fade));
const hash = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

type Word = { w: string; start: number; end: number };
const BEATS: Record<string, { start: number; end: number; words: Word[] }> = Object.fromEntries(TIMINGS.beats.map((b: any) => [b.id, b]));
const w = (beat: string, word: string, n = 1) => {
  const ws = BEATS[beat].words.filter((x) => x.w === word || x.w.replace(/[.,…:?]$/, "") === word);
  return (ws[n - 1] ?? ws[0]).start;
};
const B = (beat: string) => BEATS[beat].start;
const E = (beat: string) => BEATS[beat].end;

/* ------------------------------------------------------------------ the set */
const PLINTH_TOP = 0.5;
const BOT = { w: 1.5, h: 2.0, d: 0.95 };                    // glass body
const BOT_Y = PLINTH_TOP + BOT.h / 2 + 0.01;                 // its centre
const INNER = { w: 1.16, d: 0.62, floor: PLINTH_TOP + 0.2, h: 1.55 }; // the juice cavity
const RING = 4.4, PED_H = 1.35;

type Note = { id: string; name: string; where: string; color: string; angle: number; at: number; pour: number };
const NOTES: Note[] = [
  { id: "jasmine", name: "Jasmine", where: "Grasse · France", color: P.jasmine, angle: 34, at: w("grasse", "Grasse"), pour: E("grasse") - 0.55 },
  { id: "rose", name: "Rose", where: "Bulgaria · Turkey", color: P.rose, angle: 34 + 72, at: w("rose", "roses"), pour: E("rose") - 0.45 },
  { id: "vetiver", name: "Vetiver", where: "Haiti", color: P.vetiver, angle: 34 + 144, at: w("vetiver", "Haiti"), pour: E("vetiver") - 0.35 },
  { id: "vanilla", name: "Vanilla", where: "Madagascar", color: P.vanilla, angle: 34 + 216, at: w("vanilla", "Madagascar"), pour: E("vanilla") - 0.3 },
  { id: "patchouli", name: "Patchouli", where: "Indonesia", color: P.patchouli, angle: 34 + 288, at: w("patchouli", "Indonesia"), pour: E("patchouli") - 0.35 },
];
const rad = (d: number) => (d * Math.PI) / 180;
const ped = (n: Note): V3 => [RING * Math.sin(rad(n.angle)), 0, RING * Math.cos(rad(n.angle))];
const LAYER = INNER.h / NOTES.length;
const DROP_T = 0.55; // seconds a drop takes to arc into the bottle

/* ------------------------------------------------------------------ camera */
type Shot = { t: number; pos: V3; look: V3; fov: number };
const shot = (t: number, target: V3, yaw: number, pitch: number, dist: number, fov: number): Shot => {
  const y = rad(yaw), p = rad(pitch);
  return { t, look: target, fov, pos: [target[0] + dist * Math.sin(y) * Math.cos(p), target[1] + dist * Math.sin(p), target[2] + dist * Math.cos(y) * Math.cos(p)] };
};
/** a two-shot: the note's pedestal in front, the bottle beside it */
const noteShot = (t: number, n: Note, dist = 10.5): Shot => {
  const p = ped(n);
  return shot(t, [p[0] * 0.72, 1.75, p[2] * 0.72], n.angle - 32, 12, dist, 32);
};
const HERO = noteShot(0, NOTES[0], 10.5);
const SHOTS: Shot[] = [
  HERO,
  noteShot(B("rose") - 0.2, NOTES[1]),
  noteShot(B("vetiver") - 0.2, NOTES[2]),
  noteShot(B("vanilla") - 0.2, NOTES[3]),
  noteShot(B("patchouli") - 0.2, NOTES[4]),
  shot(B("pullback") - 0.15, [0, 1.3, 0], 214, 30, 22, 34),
  shot(B("twist") - 0.1, [0, 3.0, 0], 8, 8, 11.5, 34),
];
const OPEN: Shot = { ...HERO, t: 0, pos: lerp3(HERO.look, HERO.pos, 0.9) };
SHOTS.push({ ...OPEN, t: DUR - 1.15 });
function cameraAt(t: number) {
  let k = 0;
  for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].t) k = i;
  const prev = SHOTS[Math.max(0, k - 1)], cur = SHOTS[k];
  const e = k === 0 ? 1 : inOut3(ramp(t, cur.t, 1.0));
  // travel round the bottle (yaw interpolated about the centre), not through it
  const ang = (s: Shot) => Math.atan2(s.pos[0] - s.look[0], s.pos[2] - s.look[2]);
  const flat = (s: Shot) => Math.hypot(s.pos[0] - s.look[0], s.pos[2] - s.look[2]);
  let a0 = ang(prev), a1 = ang(cur);
  while (a1 - a0 > Math.PI) a1 -= 2 * Math.PI;
  while (a1 - a0 < -Math.PI) a1 += 2 * Math.PI;
  const look = lerp3(prev.look, cur.look, e);
  const a = lerp(a0, a1, e), r = lerp(flat(prev), flat(cur), e), hgt = lerp(prev.pos[1] - prev.look[1], cur.pos[1] - cur.look[1], e);
  let pos: V3 = [look[0] + r * Math.sin(a), look[1] + hgt, look[2] + r * Math.cos(a)];
  let fov = lerp(prev.fov, cur.fov, e);
  const c = inOut3(ramp(t, 0.05, 1.6)); // push-in on the hook
  if (t < 1.7) pos = lerp3(OPEN.pos, pos, c);
  const still = 1 - ramp(t, DUR - 1.15, 1.0); // slow drift, none on the last frames so the loop meets frame 0
  const d = (Math.sin(t * 0.42) * 0.045 + Math.sin(t * 0.17 + 1) * 0.03) * still * (t < 1.7 ? c : 1);
  const dx = pos[0] - look[0], dz = pos[2] - look[2];
  pos = [look[0] + dx * Math.cos(d) - dz * Math.sin(d), pos[1] + Math.sin(t * 0.3) * 0.05 * still, look[2] + dx * Math.sin(d) + dz * Math.cos(d)];
  return { pos, look, fov };
}
function project(cam: { pos: V3; look: V3; fov: number }, p: V3): [number, number] {
  const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norm = (a: number[]) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const f = norm(sub(cam.look, cam.pos)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
  const v = sub(p, cam.pos), z = dot(v, f);
  const tan = Math.tan((cam.fov * Math.PI) / 360);
  return [(dot(v, r) / (z * tan * (W / H)) * 0.5 + 0.5) * W, (0.5 - (dot(v, u) / (z * tan)) * 0.5) * H];
}

/* ------------------------------------------------------------------ solids, built once */
const GLASS = manifold.roundedBox(BOT.w, BOT.h, BOT.d, 0.16);
const SHOULDER = manifold.roundedBox(0.62, 0.16, 0.5, 0.05);
const CAP = manifold.roundedBox(0.7, 0.62, 0.7, 0.07);
const PLINTH = manifold.roundedBox(3.2, PLINTH_TOP, 2.4, 0.08);
const LABEL_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="256"><rect width="512" height="256" fill="#F4ECE4"/>` +
  `<rect x="14" y="14" width="484" height="228" fill="none" stroke="#2A1420" stroke-width="3"/>` +
  `<line x1="150" y1="98" x2="362" y2="98" stroke="#2A1420" stroke-width="3"/><line x1="150" y1="158" x2="362" y2="158" stroke="#2A1420" stroke-width="3"/>` +
  `<path d="M256 108 L276 128 L256 148 L236 128 Z" fill="#B8865A"/></svg>`,
);

/* ------------------------------------------------------------------ the bottle */
function Bottle({ t }: { t: number }) {
  const sway = Math.sin(t * 0.8) * 0.02;
  return (
    <>
      <Mesh3d name="plinth" shape={PLINTH} transform={Transform.fromXyz(0, PLINTH_TOP / 2, 0)}>
        <StandardMaterial base_color={P.stone} perceptual_roughness={0.38} metallic={0.1} />
      </Mesh3d>
      {([[0, 1.2, 1.6, 0.02], [0, -1.2, 1.6, 0.02], [1.6, 0, 0.02, 1.2], [-1.6, 0, 0.02, 1.2]] as const).map(([x, z, hx, hz], k) => (
        <Mesh3d key={k} name={`plinth-trim-${k}`} allowOverlap transform={Transform.fromXyz(x, PLINTH_TOP - 0.06, z)}>
          <Cuboid half_size={[hx, 0.02, hz]} />
          <StandardMaterial base_color={P.gold} perceptual_roughness={0.25} metallic={1} />
        </Mesh3d>
      ))}
      <Entity transform={Transform.fromXyz(0, 0, 0).withRotation(Quat.fromEuler("XYZ", 0, sway, 0))}>
        {/* the juice: one layer per note poured so far, stacked from the floor of the cavity */}
        {NOTES.map((n, i) => {
          const g = out3(ramp(t, n.pour + DROP_T - 0.05, 0.6));
          if (g <= 0.002) return null;
          const hgt = LAYER * g;
          const y0 = INNER.floor + i * LAYER;
          const slosh = Math.sin((t - n.pour) * 9) * 0.06 * (1 - ramp(t, n.pour + DROP_T, 1.2));
          return (
            <Mesh3d key={n.id} name={`juice-${n.id}`} allowOverlap transform={Transform.fromXyz(0, y0 + hgt / 2, 0).withRotation(Quat.fromEuler("XYZ", 0, 0, slosh))}>
              <Cuboid half_size={[INNER.w / 2, Math.max(0.005, hgt / 2 - 0.004), INNER.d / 2]} />
              <StandardMaterial base_color={n.color} perceptual_roughness={0.15} metallic={0} emissive={glow(n.color, 0.35)} />
            </Mesh3d>
          );
        })}
        <Mesh3d name="glass" allowOverlap shape={GLASS} transform={Transform.fromXyz(0, BOT_Y, 0)}>
          <StandardMaterial base_color={P.glass} perceptual_roughness={0.04} metallic={0} specular_transmission={0.93} ior={1.25} thickness={0.06}
            attenuation_color="#F6DCE6" attenuation_distance={2.5} reflectance={0.6} />
        </Mesh3d>
        <Mesh3d name="label" allowOverlap transform={Transform.fromXyz(0, BOT_Y - 0.15, BOT.d / 2 + 0.004)}>
          <Cuboid half_size={[0.44, 0.22, 0.004]} />
          <StandardMaterial base_color="#FFFFFF" base_color_texture={LABEL_SVG} perceptual_roughness={0.7} />
        </Mesh3d>
        <Mesh3d name="shoulder" allowOverlap shape={SHOULDER} transform={Transform.fromXyz(0, PLINTH_TOP + BOT.h + 0.07, 0)}>
          <StandardMaterial base_color={P.glass} perceptual_roughness={0.05} specular_transmission={0.9} ior={1.5} thickness={0.2} />
        </Mesh3d>
        <Mesh3d name="collar" allowOverlap transform={Transform.fromXyz(0, PLINTH_TOP + BOT.h + 0.21, 0)}>
          <Cylinder radius={0.2} half_height={0.08} />
          <StandardMaterial base_color={P.gold} perceptual_roughness={0.22} metallic={1} />
        </Mesh3d>
        <Mesh3d name="cap" allowOverlap shape={CAP} transform={Transform.fromXyz(0, PLINTH_TOP + BOT.h + 0.6, 0)}>
          <StandardMaterial base_color="#1A0C12" perceptual_roughness={0.18} metallic={0.2} clearcoat={1} clearcoat_perceptual_roughness={0.05} />
        </Mesh3d>
      </Entity>
    </>
  );
}

/* ------------------------------------------------------------------ the notes, each a small still life on a pedestal */
const Mat = ({ c, r = 0.55, m = 0, e = 0 }: { c: string; r?: number; m?: number; e?: number }) => (
  <StandardMaterial base_color={c} perceptual_roughness={r} metallic={m} emissive={glow(c, e)} />
);

function Flower({ id, at, s = 1, petal = "#FBF6EA", heart = "#E8C66A", n = 5, rot = 0 }: { id: string; at: V3; s?: number; petal?: string; heart?: string; n?: number; rot?: number }) {
  return (
    <Entity transform={Transform.fromXyz(...at).withRotation(Quat.fromEuler("XYZ", 0, rot, 0)).withScale([s, s, s])}>
      {Array.from({ length: n }, (_, k) => {
        const a = (k / n) * Math.PI * 2;
        return (
          <Mesh3d key={k} name={`${id}-p${k}`} allowOverlap transform={Transform.fromXyz(Math.sin(a) * 0.15, 0, Math.cos(a) * 0.15).withRotation(Quat.fromEuler("YXZ", a, 0.25, 0)).withScale([0.62, 0.16, 1])}>
            <Sphere radius={0.17} />
            <Mat c={petal} r={0.6} />
          </Mesh3d>
        );
      })}
      <Mesh3d name={`${id}-heart`} allowOverlap transform={Transform.fromXyz(0, 0.03, 0)}>
        <Sphere radius={0.06} />
        <Mat c={heart} r={0.5} e={0.3} />
      </Mesh3d>
    </Entity>
  );
}

function Rose({ id, at, s = 1 }: { id: string; at: V3; s?: number }) {
  const rings = [{ n: 7, r: 0.26, y: 0.0, tilt: 0.9, sc: 1 }, { n: 6, r: 0.17, y: 0.06, tilt: 0.55, sc: 0.8 }, { n: 4, r: 0.08, y: 0.11, tilt: 0.25, sc: 0.6 }];
  return (
    <Entity transform={Transform.fromXyz(...at).withScale([s, s, s])}>
      {rings.flatMap((rg, j) => Array.from({ length: rg.n }, (_, k) => {
        const a = (k / rg.n) * Math.PI * 2 + j * 0.4;
        return (
          <Mesh3d key={`${j}-${k}`} name={`${id}-r${j}-${k}`} allowOverlap transform={Transform.fromXyz(Math.sin(a) * rg.r, rg.y, Math.cos(a) * rg.r).withRotation(Quat.fromEuler("YXZ", a, rg.tilt, 0)).withScale([0.95 * rg.sc, 0.2 * rg.sc, 0.7 * rg.sc])}>
            <Sphere radius={0.26} />
            <Mat c={j === 2 ? "#D46F8C" : P.rose} r={0.55} />
          </Mesh3d>
        );
      }))}
    </Entity>
  );
}

function NoteObject({ n, t }: { n: Note; t: number }) {
  const p = ped(n);
  const show = outBack(ramp(t, n.at - 0.1, 0.5), 1.4);
  const top = PED_H + 0.02;
  const bob = Math.sin(t * 1.3 + n.angle) * 0.04;
  const glowOn = life(t, n.at - 0.1, n.pour + DROP_T - n.at + 0.2, 0.25);
  const spin = rad(n.angle) + t * 0.25;
  const s = Math.max(0.001, show);
  const body = (() => {
    switch (n.id) {
      case "jasmine": return null; // its heap is drawn by <JasmineRain>
      case "rose": return (
        <>
          <Rose id="rose-a" at={[0, top + 0.32 + bob, 0]} s={1.15} />
          <Rose id="rose-b" at={[0.5, top + 0.18, 0.25]} s={0.72} />
          <Rose id="rose-c" at={[-0.45, top + 0.16, -0.2]} s={0.62} />
        </>
      );
      case "vetiver": return (
        <Entity transform={Transform.fromXyz(0, top + 0.55 + bob, 0).withRotation(Quat.fromEuler("XYZ", 0, spin, 0.15))}>
          {Array.from({ length: 13 }, (_, k) => {
            const a = k * 2.4, r = 0.05 + 0.12 * hash(k + 3);
            return (
              <Mesh3d key={k} name={`root-${k}`} allowOverlap transform={Transform.fromXyz(Math.sin(a) * r, -0.05 * hash(k), Math.cos(a) * r).withRotation(Quat.fromEuler("XYZ", (hash(k + 9) - 0.5) * 0.35, 0, (hash(k + 5) - 0.5) * 0.35))}>
                <Cylinder radius={0.028} half_height={0.5 + 0.12 * hash(k + 1)} />
                <Mat c={k % 3 ? "#A88B5E" : "#7E6A44"} r={0.85} />
              </Mesh3d>
            );
          })}
          <Mesh3d name="root-tie" allowOverlap transform={Transform.fromXyz(0, 0.08, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}>
            <Torus major_radius={0.19} minor_radius={0.035} />
            <Mat c={P.vetiver} r={0.6} />
          </Mesh3d>
        </Entity>
      );
      case "vanilla": return (
        <Entity transform={Transform.fromXyz(0, top + 0.12 + bob * 0.5, 0).withRotation(Quat.fromEuler("XYZ", 0, spin, 0))}>
          {[-0.17, 0, 0.17].map((x, k) => (
            <Mesh3d key={k} name={`pod-${k}`} allowOverlap transform={Transform.fromXyz(x, k === 1 ? 0.1 : 0, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0.15 * (k - 1), 0))}>
              <Capsule3d radius={0.07} half_length={0.62} />
              <Mat c="#3A2416" r={0.4} m={0.1} />
            </Mesh3d>
          ))}
          <Flower id="vanilla-flower" at={[0.05, 0.28, 0.25]} s={1.1} petal="#F3E7B8" heart="#D9B44A" n={6} />
        </Entity>
      );
      case "patchouli": return (
        <Entity transform={Transform.fromXyz(0, top + 0.05 + bob, 0).withRotation(Quat.fromEuler("XYZ", 0, spin, 0))}>
          <Mesh3d name="patch-stem" allowOverlap transform={Transform.fromXyz(0, 0.45, 0)}>
            <Cylinder radius={0.03} half_height={0.45} />
            <Mat c="#4E5A2E" r={0.7} />
          </Mesh3d>
          {Array.from({ length: 6 }, (_, k) => {
            const a = k * 2.1, y = 0.25 + k * 0.12;
            return (
              <Mesh3d key={k} name={`leaf-${k}`} allowOverlap transform={Transform.fromXyz(Math.sin(a) * 0.22, y, Math.cos(a) * 0.22).withRotation(Quat.fromEuler("YXZ", a, 0.5, 0)).withScale([0.55, 0.08, 1])}>
                <Sphere radius={0.3} />
                <Mat c={k % 2 ? "#5E7A3A" : "#6E8C44"} r={0.6} />
              </Mesh3d>
            );
          })}
        </Entity>
      );
    }
  })();
  return (
    <Entity transform={Transform.fromXyz(p[0], 0, p[2])}>
      <Mesh3d name={`ped-${n.id}`} transform={Transform.fromXyz(0, PED_H / 2, 0)}>
        <Cylinder radius={0.8} half_height={PED_H / 2} />
        <StandardMaterial base_color={P.stone} perceptual_roughness={0.4} metallic={0.1} emissive={glow(n.color, 0.0)} />
      </Mesh3d>
      <Mesh3d name={`ped-ring-${n.id}`} allowOverlap transform={Transform.fromXyz(0, PED_H + 0.004, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}>
        <Torus major_radius={0.77} minor_radius={0.022} />
        <StandardMaterial base_color={n.color} emissive={glow(n.color, 0.4 + 2.2 * glowOn)} />
      </Mesh3d>
      {body && <Entity transform={Transform.fromXyz(0, 0, 0).withScale([s, s, s])}>{body}</Entity>}
    </Entity>
  );
}

/** The hook: about a ton of flowers for one kilo of oil — jasmine rains onto its pedestal and stays there as a heap. */
const HEAP = Array.from({ length: 34 }, (_, i) => {
  const a = i * 2.39996, r = 0.62 * Math.sqrt((i + 0.5) / 34);
  const layer = r < 0.25 ? 0.3 : r < 0.45 ? 0.17 : 0.06;
  return { i, x: Math.sin(a) * r, z: Math.cos(a) * r, y: PED_H + 0.06 + layer + 0.04 * hash(i), at: -0.9 + hash(i + 40) * 3.3, rot: hash(i + 7) * 6.28, s: 0.75 + 0.35 * hash(i + 2) };
});
function JasmineRain({ t }: { t: number }) {
  const p = ped(NOTES[0]);
  return (
    <Entity transform={Transform.fromXyz(p[0], 0, p[2])}>
      {HEAP.map((f) => {
        const k = ramp(t, f.at, 0.75);
        if (k <= 0) return null;
        const fall = 1 - out3(k);
        const y = f.y + fall * 6.5;
        const wob = fall * Math.sin(t * 5 + f.i) * 0.25;
        return <Flower key={f.i} id={`jas-${f.i}`} at={[f.x + wob, y, f.z]} s={f.s} rot={f.rot + fall * 3} />;
      })}
    </Entity>
  );
}

/** At the end of each note's beat a drop arcs from the pedestal into the neck of the bottle. */
function Drops({ t }: { t: number }) {
  return (
    <>
      {NOTES.map((n) => {
        const k = ramp(t, n.pour, DROP_T);
        if (k <= 0 || k >= 1) return null;
        const p = ped(n);
        const from: V3 = [p[0] * 0.92, PED_H + 1.0, p[2] * 0.92];
        const to: V3 = [0, PLINTH_TOP + BOT.h + 0.3, 0];
        const pos = lerp3(from, to, inOut3(k));
        pos[1] += Math.sin(Math.PI * k) * 1.4;
        return (
          <Mesh3d key={n.id} name={`drop-${n.id}`} allowOverlap transform={Transform.fromXyz(...pos).withScale([0.8, 1.15, 0.8])}>
            <Sphere radius={0.16} />
            <StandardMaterial base_color={n.color} perceptual_roughness={0.1} emissive={glow(n.color, 1.8)} />
          </Mesh3d>
        );
      })}
    </>
  );
}

/** "molecules made in a lab": a ball-and-stick molecule descends over the bottle and glows. */
function Molecule({ t }: { t: number }) {
  const at = w("twist", "molecules");
  const k = out3(ramp(t, at - 0.15, 0.7));
  const gone = ramp(t, B("loop") + 0.1, 0.4);
  const s = Math.max(0.001, k * (1 - gone));
  if (s <= 0.002) return null;
  const lit = ramp(t, w("twist", "lab"), 0.25);
  const ATOMS: V3[] = [[0.75, 0.25, 0], [-0.7, 0.3, 0.2], [0.1, -0.7, 0.35], [0.05, 0.6, -0.65], [-0.2, -0.15, 0.85]];
  const y = PLINTH_TOP + BOT.h + 1.75 + (1 - k) * 2.5;
  return (
    <Entity transform={Transform.fromXyz(0, y, 0).withRotation(Quat.fromEuler("XYZ", t * 0.6, t * 0.9, 0)).withScale([s, s, s])}>
      <Mesh3d name="mol-core" allowOverlap>
        <Sphere radius={0.32} />
        <StandardMaterial base_color={P.accent} perceptual_roughness={0.2} metallic={0.3} emissive={glow(P.accent, 0.4 + 2.6 * lit)} />
      </Mesh3d>
      {ATOMS.map((a, i) => {
        const len = Math.hypot(...a);
        // a rod from the core to the atom: a cylinder along y, turned so y points along a
        const yaw = Math.atan2(a[0], a[2]), pitch = Math.acos(a[1] / len);
        return (
          <Entity key={i} transform={Transform.fromXyz(0, 0, 0)}>
            <Mesh3d name={`mol-rod-${i}`} allowOverlap transform={Transform.fromXyz(a[0] / 2, a[1] / 2, a[2] / 2).withRotation(Quat.fromEuler("YXZ", yaw, pitch, 0))}>
              <Cylinder radius={0.05} half_height={len / 2} />
              <StandardMaterial base_color={P.ink} perceptual_roughness={0.3} metallic={0.8} />
            </Mesh3d>
            <Mesh3d name={`mol-atom-${i}`} allowOverlap transform={Transform.fromXyz(...a)}>
              <Sphere radius={0.17} />
              <StandardMaterial base_color={i % 2 ? P.ink : "#BFC6D6"} perceptual_roughness={0.15} metallic={0.9} emissive={glow(P.accent, 0.8 * lit)} />
            </Mesh3d>
          </Entity>
        );
      })}
    </Entity>
  );
}

/* ------------------------------------------------------------------ type: three voices from one left margin */
const FONTS = `
@font-face { font-family: "Bricolage"; src: url("${staticFile("fonts/BricolageGrotesque-latin.ttf")}"); font-weight: 200 800; }
@font-face { font-family: "Instrument"; src: url("${staticFile("fonts/InstrumentSerif-Italic-latin.ttf")}"); font-style: italic; }
@font-face { font-family: "JBMono"; src: url("${staticFile("fonts/JetBrainsMono-latin.ttf")}"); }`;
const display = (size: number, color = P.ink): React.CSSProperties => ({ fontFamily: "Bricolage", fontWeight: 800, fontSize: size, lineHeight: 0.94, letterSpacing: "-0.01em", fontStretch: "75%", fontVariationSettings: "'wdth' 75", textTransform: "uppercase", color, textShadow: "0 4px 0 rgba(0,0,0,0.45)" });
const mono = (size: number, color = P.ink): React.CSSProperties => ({ fontFamily: "JBMono", fontWeight: 700, fontSize: size, letterSpacing: "0.12em", textTransform: "uppercase", color });
const whisper = (size: number, color = P.ink): React.CSSProperties => ({ fontFamily: "Instrument", fontStyle: "italic", fontSize: size, color, lineHeight: 1.1 });
const abs = (left: number, top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left, top, ...extra });
const clampX = (x: number, half: number) => Math.min(SAFE.right - half, Math.max(SAFE.left + half, x));
const popS = (t: number, at: number) => Math.min(1.06, outBack(ramp(t, at, 0.3), 2));
type Cam = ReturnType<typeof cameraAt>;

/** The note's name and where it grows, pinned above its pedestal while it is the subject; all five on the pull-back. */
function NoteTag({ t, cam, n, i }: { t: number; cam: Cam; n: Note; i: number }) {
  const solo = life(t, n.at, (NOTES[i + 1]?.at ?? B("pullback")) - n.at - 0.45, 0.2);
  const all = life(t, w("pullback", "Six") + 0.15 * i, B("twist") - w("pullback", "Six") - 0.15 * i - 0.1, 0.2);
  const o = Math.max(solo, all);
  if (o <= 0.01) return null;
  const small = all > solo;
  const p = ped(n);
  const [px, py] = project(cam, [p[0], PED_H + (small ? 1.2 : 1.1), p[2]]);
  const wdt = small ? 300 : 460;
  return (
    <div style={abs(clampX(px, wdt / 2) - wdt / 2, py - (small ? 70 : 150), { width: wdt, textAlign: "center", opacity: o, transform: `scale(${small ? 1 : popS(t, n.at)})`, transformOrigin: "center bottom" })}>
      <div style={display(small ? 46 : 92, n.color)}>{n.name}</div>
      <div style={{ ...mono(small ? 20 : 27), marginTop: small ? 4 : 10 }}>{n.where}</div>
    </div>
  );
}

/** A figure block hung from the left margin in the stage band (one per beat at most). */
function Figure({ t, at, until, big, label, color = P.accent }: { t: number; at: number; until: number; big: string; label: string; color?: string }) {
  const o = life(t, at, until - at, 0.2);
  if (o <= 0.01) return null;
  return (
    <div style={abs(SAFE.left, 318, { opacity: o, transform: `scale(${popS(t, at)})`, transformOrigin: "left center", width: SAFE.right - SAFE.left })}>
      <div style={display(176, color)}>{big}</div>
      <div style={{ ...mono(28), marginTop: 10, maxWidth: 760, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function Overlay({ t, cam }: { t: number; cam: Cam }) {
  const hookEnd = BEATS.hook.end;
  const titleO = Math.max(1 - ramp(t, hookEnd + 0.1, 0.25), ramp(t, DUR - 1.3, 0.35));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <style>{FONTS}</style>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 760, backgroundImage: "linear-gradient(180deg, rgba(12,6,9,0.88) 0%, rgba(12,6,9,0.6) 45%, rgba(12,6,9,0) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 1010, width: W, height: 910, backgroundImage: "linear-gradient(180deg, rgba(12,6,9,0) 0%, rgba(12,6,9,0.82) 17%, rgba(12,6,9,0.86) 100%)" }} />

      <div style={abs(SAFE.left, SAFE.top, { display: "flex", alignItems: "center", gap: 16 })}>
        <div style={{ ...mono(26, P.bg), background: P.accent, padding: "9px 14px 8px 17px", borderRadius: 4, letterSpacing: "0.22em" }}>SILLAGE</div>
        <div style={mono(26, P.accent)}>N°1</div>
      </div>

      {titleO > 0.01 && (
        <div style={abs(SAFE.left, 324, { width: SAFE.right - SAFE.left, opacity: titleO })}>
          <div style={display(112)}>What's inside<br />your perfume</div>
          <div style={{ ...whisper(54, P.accent), marginTop: 14 }}>six countries, one bottle</div>
        </div>
      )}
      {/* hook: the ratio sits under the title, the flowers fall behind it */}
      {(() => {
        const o = life(t, 0.4, hookEnd - 0.1, 0.2);
        if (o <= 0.01) return null;
        return (
          <div style={abs(SAFE.left, 640, { opacity: o, transform: `scale(${popS(t, 0.4)})`, transformOrigin: "left center" })}>
            <div style={display(150, P.jasmine)}>≈1,000 kg</div>
            <div style={{ ...mono(28), marginTop: 8 }}>of flowers → 1 kg of jasmine oil</div>
          </div>
        );
      })()}

      <Figure t={t} at={w("grasse", "UNESCO")} until={E("grasse") + 0.15} big="UNESCO" label="2018 · Grasse's perfume know-how, intangible cultural heritage" color={P.jasmine} />
      <Figure t={t} at={w("vetiver", "half")} until={E("vetiver") + 0.15} big="≈50%" label="of the world's vetiver oil" color={P.vetiver} />
      <Figure t={t} at={w("vanilla", "biggest")} until={E("vanilla") + 0.15} big="No. 1" label="vanilla grower in the world" color={P.vanilla} />
      <Figure t={t} at={w("patchouli", "Estimates")} until={E("patchouli") + 0.15} big="Up to 90%" label="of the world's patchouli · estimates" color={P.accent} />

      {NOTES.map((n, i) => <NoteTag key={n.id} t={t} cam={cam} n={n} i={i} />)}

      <Figure t={t} at={w("twist", "molecules")} until={B("loop") + 0.05} big="Made in a lab" label="synthetic molecules, blended with the naturals" />

      <Captions t={t} />
      <div style={abs(SAFE.left, 1384, { ...mono(22, P.muted), letterSpacing: "0.04em", width: SAFE.railX - SAFE.left, whiteSpace: "nowrap" })}>Sources in the pinned comment · shares vary by year</div>
    </AbsoluteFill>
  );
}

/** Captions from the transcript. A figure already shown big is not repeated here. */
const HIDE = new Set(["grasse:2018", "patchouli:90%"]);
const PHRASES: Word[][] = (() => {
  const out: Word[][] = [];
  for (const b of TIMINGS.beats as any[]) {
    let cur: Word[] = [], len = 0;
    for (const x of b.words as Word[]) {
      if (HIDE.has(`${b.id}:${x.w.replace(/[.,…:?]$/, "")}`)) {
        if (/[.,…:?]$/.test(x.w) && cur.length) { out.push(cur); cur = []; len = 0; }
        continue;
      }
      if (cur.length && len + x.w.length > 20) { out.push(cur); cur = []; len = 0; }
      cur.push(x); len += x.w.length + 1;
      if (/[.,…:?]$/.test(x.w) && len > 9) { out.push(cur); cur = []; len = 0; }
    }
    if (cur.length) out.push(cur);
  }
  return out;
})();
const KEYWORDS: Record<string, string> = { jasmine: P.jasmine, grasse: P.jasmine, bulgaria: P.rose, turkey: P.rose, haiti: P.vetiver, vetiver: P.vetiver, madagascar: P.vanilla, vanilla: P.vanilla, indonesia: P.accent, patchouli: P.accent, lab: P.accent, unesco: P.jasmine };
function Captions({ t }: { t: number }) {
  const i = PHRASES.findIndex((p, k) => t >= p[0].start - 0.05 && t < (PHRASES[k + 1]?.[0].start ?? 1e9) - 0.05 && t < p[p.length - 1].end + 0.6 && t < DUR - 0.5);
  if (i < 0) return null;
  const p = PHRASES[i];
  return (
    <div style={abs(SAFE.left, 1170, { width: SAFE.railX - SAFE.left, display: "flex", flexWrap: "wrap", columnGap: 22, rowGap: 4 })}>
      {p.map((x, k) => {
        const on = t >= x.start - 0.04;
        const hot = KEYWORDS[x.w.replace(/[.,…:?]$/, "").toLowerCase()];
        return <span key={k} style={{ ...display(84, on ? (hot ?? P.ink) : P.muted), textShadow: "0 4px 0 rgba(0,0,0,0.6), 0 0 14px rgba(12,6,9,0.95), 0 0 4px rgba(12,6,9,1)" }}>{x.w}</span>;
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ the frame */
function Sillage001() {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = cameraAt(t);
  const focus = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
  const sfx: [number, string, number][] = [
    [0.1, "rumble", 0.25], ...SHOTS.slice(1, -1).map((s) => [s.t + 0.1, "whoosh", 0.3] as [number, string, number]),
    ...NOTES.map((n) => [n.at, "pop", 0.4] as [number, string, number]), ...NOTES.map((n) => [n.pour + DROP_T - 0.05, "pop", 0.25] as [number, string, number]),
    [w("grasse", "UNESCO"), "stamp", 0.45], [w("vetiver", "half"), "stamp", 0.45], [w("patchouli", "Estimates"), "stamp", 0.45], [w("twist", "lab"), "boom", 0.35],
  ];
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: (cam.fov * Math.PI) / 180 } }}>
        <DepthOfField focal_distance={focus} aperture_f_stops={3.2} />
      </Camera3d>
      <ToneMapping mode="tony" exposure={0.15} />
      <Bloom intensity={0.3} threshold={0.9} />
      <Shadows distance={60} firstCascade={25} mapSize={2048} />
      <AmbientLight brightness={160} color="#E0A8C0" />
      <DirectionalLight transform={Transform.fromXyz(-6, 12, 7).lookingAt([0, 0, 0])} illuminance={2600} color="#FFE9DC" shadow_maps_enabled soft_shadow_size={2} />
      <SpotLight transform={Transform.fromXyz(2.2, 8.5, 4.5).lookingAt([0, 1.4, 0])} intensity={4200000} outer_angle={0.42} inner_angle={0.18} color="#FFF2E6" shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(-1.5, 3.2, -2.6)} intensity={900000} color={P.accent} range={9} />
      {NOTES.map((n) => {
        const p = ped(n);
        const on = life(t, n.at - 0.1, n.pour + DROP_T - n.at + 0.4, 0.3);
        return (
          <SpotLight key={n.id} transform={Transform.fromXyz(p[0] * 1.1, 6.5, p[2] * 1.1).lookingAt([p[0], PED_H, p[2]])} intensity={600000 + 2600000 * on} outer_angle={0.36} inner_angle={0.16} color="#FFF4EA" />
        );
      })}
      <Fog color={P.bg} near={focus * 1.15} far={focus * 2.9} />
      <Mesh3d name="floor" transform={Transform.fromXyz(0, -0.05, 0)}>
        <Cuboid half_size={[80, 0.05, 80]} />
        <StandardMaterial base_color={P.velvet} perceptual_roughness={0.92} />
      </Mesh3d>
      <Bottle t={t} />
      {NOTES.map((n) => <NoteObject key={n.id} n={n} t={t} />)}
      <JasmineRain t={t} />
      <Drops t={t} />
      <Molecule t={t} />

      <Overlay t={t} cam={cam} />

      {sfx.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(at * FPS))} durationInFrames={FPS * 3} layout="none" name={`sfx-${name}-${i}`}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} />
        </Sequence>
      ))}
      <Audio src={staticFile("voice.wav")} volume={0.62} />
      <Audio src={staticFile("music.wav")} volume={(fr: number) => interpolate(fr / FPS, [0, 0.5, DUR - 3, DUR], [0, 0.13, 0.13, 0.18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
}

registerRoot(() => <Composition id="sillage" component={Sillage001} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />);
