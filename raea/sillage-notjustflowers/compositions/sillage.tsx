/**
 * SILLAGE N°1 — "What's really in your perfume" (61 s), built in raea (Bevy through raea/3d).
 * The text comes from public/episodes/scent-001-notjustflowers (voice, word timings, SOURCES.md).
 *
 *   the set      a glass flacon on a velvet plinth at the centre of a ring of nine stations (radius RING)
 *   a station    one framed AI plate (gpt-image or Nano Banana, labelled on screen) and, beside it, a pedestal
 *                with the ingredient in 3D when there is one
 *   the bottle   fills one layer per ingredient (a drop arcs in at the end of its beat); on "lab" the three
 *                animal layers turn to the lab colour: the myth-bust happens inside the bottle
 *   the camera   goes round the ring, station to station; a cut on "whale's" (pattern interrupt); a top-down
 *                pull-back on the payoff; back to the frame-0 pose for the loop
 *
 * Every cue is timed from timings.json (`w(beat, word)`), never by eye. A figure is on screen once.
 */
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "raea";
import { Bloom, DepthOfField, Entity, ImagePlane, ToneMapping, manifold } from "raea/3d";
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
  bg: "#0C0609", velvet: "#2A1420", stone: "#45283A", ink: "#F8EFE9", muted: "#A9949C", accent: "#F4B6C2",
  gold: "#D9B26A", glass: "#F4E9EE",
  ambergris: "#BDB3A6", musk: "#8A6248", castoreum: "#5A3A28",
  jasmine: "#EADBB0", rose: "#E68FA8", vanilla: "#C29A6B", vetiver: "#93A86C",
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
const hexMix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(lerp(v, y[i], clamp01(k))).toString(16).padStart(2, "0")).join("");
};
const rad = (d: number) => (d * Math.PI) / 180;

type Word = { w: string; start: number; end: number };
const BEATS: Record<string, { start: number; end: number; words: Word[] }> = Object.fromEntries(TIMINGS.beats.map((b: any) => [b.id, b]));
const w = (beat: string, word: string, n = 1) => {
  const ws = BEATS[beat].words.filter((x) => x.w === word || x.w.replace(/[.,…:?!]$/, "") === word);
  if (!ws.length) throw new Error(`cue word "${word}" not in beat ${beat}`);
  return (ws[n - 1] ?? ws[0]).start;
};
const B = (beat: string) => BEATS[beat].start;
const E = (beat: string) => BEATS[beat].end;

/* ------------------------------------------------------------------ the set */
const PLINTH_TOP = 0.5;
const BOT = { w: 1.5, h: 2.0, d: 0.95 };
const BOT_Y = PLINTH_TOP + BOT.h / 2 + 0.01;
const INNER = { w: 1.16, d: 0.62, floor: PLINTH_TOP + 0.2, h: 1.55 };
const RING = 6, PED_H = 1.35, PLATE = { w: 1.65, h: 2.2, bottom: 1.7 };

type Obj = "none" | "lump" | "pod" | "molecule" | "jasmine" | "rose" | "vanilla" | "vetiver";
type Station = { id: string; name: string; where: string; plate: string; ai: string; angle: number; beat: string; obj: Obj;
  layer?: { color: string; animal: boolean }; at: number; pour: number };
const NB = "AI illustration · Nano Banana", GPT = "AI illustration · gpt-image";
const ST: Station[] = [
  { id: "whale", name: "Sperm whale", where: "", plate: "p_whale.jpg", ai: GPT, angle: 0, beat: "hook", obj: "none", at: w("hook", "whale's"), pour: 0 },
  { id: "ambergris", name: "Ambergris", where: "from the sperm whale", plate: "p_ambergris.jpg", ai: NB, angle: 40, beat: "ambergris", obj: "lump",
    layer: { color: P.ambergris, animal: true }, at: w("ambergris", "ambergris"), pour: E("fixative") - 0.75 },
  { id: "musk", name: "Musk", where: "from the musk deer", plate: "p_musk.jpg", ai: NB, angle: 80, beat: "musk", obj: "pod",
    layer: { color: P.musk, animal: true }, at: w("musk", "Musk"), pour: E("musk") - 0.75 },
  { id: "beaver", name: "Castoreum", where: "from the beaver", plate: "p_beaver.jpg", ai: GPT, angle: 120, beat: "beaver", obj: "none",
    layer: { color: P.castoreum, animal: true }, at: w("beaver", "Castoreum"), pour: E("beaver") - 0.75 },
  { id: "lab", name: "The lab", where: "synthetic molecules", plate: "p_lab.jpg", ai: GPT, angle: 160, beat: "twist", obj: "molecule", at: w("twist", "today"), pour: 0 },
  { id: "jasmine", name: "Jasmine", where: "Grasse · France", plate: "p_jasmine.jpg", ai: NB, angle: 200, beat: "jasmine", obj: "jasmine",
    layer: { color: P.jasmine, animal: false }, at: w("jasmine", "jasmine"), pour: E("jasmine") - 0.75 },
  { id: "rose", name: "Rose", where: "Bulgaria · Turkey", plate: "p_rose.jpg", ai: NB, angle: 240, beat: "rose", obj: "rose",
    layer: { color: P.rose, animal: false }, at: w("rose", "rose"), pour: E("rose") - 0.75 },
  { id: "vanilla", name: "Vanilla", where: "pollinated by hand", plate: "p_vanilla.jpg", ai: GPT, angle: 280, beat: "vanilla", obj: "vanilla",
    layer: { color: P.vanilla, animal: false }, at: w("vanilla", "Vanilla"), pour: E("vanilla") - 0.75 },
  { id: "vetiver", name: "Vetiver", where: "Haiti", plate: "p_vetiver.jpg", ai: NB, angle: 320, beat: "vetiver", obj: "vetiver",
    layer: { color: P.vetiver, animal: false }, at: w("vetiver", "vetiver"), pour: E("vetiver") - 0.75 },
];
const LAYERS = ST.filter((s) => s.layer);
const LAYER_H = INNER.h / LAYERS.length;
const DROP_T = 0.75;
const LAB_AT = w("twist", "lab");
/** a point of station s: u along the ring (camera's right), r out from the centre */
const at = (s: Station, u: number, r: number, y: number): V3 => {
  const a = rad(s.angle);
  return [r * Math.sin(a) + u * Math.cos(a), y, r * Math.cos(a) - u * Math.sin(a)];
};
const plateU = (s: Station) => (s.obj === "none" ? 0 : -1.0);
const PED_U = 1.0;

/* ------------------------------------------------------------------ camera */
type Shot = { t: number; pos: V3; look: V3; fov: number; cut?: boolean };
const shot = (t: number, target: V3, yaw: number, pitch: number, dist: number, fov: number, cut = false): Shot => {
  const y = rad(yaw), p = rad(pitch);
  return { t, look: target, fov, cut, pos: [target[0] + dist * Math.sin(y) * Math.cos(p), target[1] + dist * Math.sin(p), target[2] + dist * Math.cos(y) * Math.cos(p)] };
};
const stationShot = (t: number, s: Station, cut = false) => shot(t, at(s, 0, RING, 2.55), s.angle - 8, 8, 12, 34, cut);
const HERO = shot(0, [0, 1.85, 0], 20, 15, 5.4, 48);
const S = (id: string) => ST.find((s) => s.id === id)!;
const SHOTS: Shot[] = [
  HERO,
  stationShot(w("hook", "whale's") - 0.05, S("whale"), true),
  stationShot(B("ambergris") + 0.6, S("ambergris")),
  shot(B("fixative") - 0.1, [0, 1.5, 0], 62, 12, 5.4, 34),
  stationShot(B("musk") - 0.1, S("musk")),
  stationShot(B("beaver") - 0.1, S("beaver")),
  stationShot(B("twist") - 0.1, S("lab")),
  shot(B("flowers") - 0.1, [0, 1.8, 0], 220, 16, 12.5, 34),
  stationShot(B("jasmine") - 0.1, S("jasmine")),
  stationShot(B("rose") - 0.1, S("rose")),
  stationShot(B("vanilla") - 0.1, S("vanilla")),
  stationShot(B("vetiver") - 0.1, S("vetiver")),
  shot(B("pullback") - 0.1, [Math.sin(rad(20)) * 1.3, 0.8, Math.cos(rad(20)) * 1.3], 20, 62, 33, 34),
];
const OPEN: Shot = { ...HERO, t: 0, pos: lerp3(HERO.look, HERO.pos, 0.93) };
SHOTS.push({ ...OPEN, t: DUR - 1.15 });
function cameraAt(t: number) {
  let k = 0;
  for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].t) k = i;
  const prev = SHOTS[Math.max(0, k - 1)], cur = SHOTS[k];
  const e = k === 0 || cur.cut ? 1 : inOut3(ramp(t, cur.t, 1.0));
  // travel round the centre of the ring (azimuth of the camera about the origin), so moves arc instead of cutting through
  const az = (p: V3) => Math.atan2(p[0], p[2]);
  let a0 = az(prev.pos), a1 = az(cur.pos);
  while (a1 - a0 > Math.PI) a1 -= 2 * Math.PI;
  while (a1 - a0 < -Math.PI) a1 += 2 * Math.PI;
  const r0 = Math.hypot(prev.pos[0], prev.pos[2]), r1 = Math.hypot(cur.pos[0], cur.pos[2]);
  const a = lerp(a0, a1, e), r = lerp(r0, r1, e);
  let pos: V3 = [r * Math.sin(a), lerp(prev.pos[1], cur.pos[1], e), r * Math.cos(a)];
  const look = lerp3(prev.look, cur.look, e);
  const fov = lerp(prev.fov, cur.fov, e);
  const c = inOut3(ramp(t, 0.05, 1.6)); // push-in on the hook
  if (t < SHOTS[1].t) pos = lerp3(OPEN.pos, pos, c);
  const still = 1 - ramp(t, DUR - 1.15, 1.0);
  const d = (Math.sin(t * 0.42) * 0.04 + Math.sin(t * 0.17 + 1) * 0.025) * still * (t < 1.7 ? c : 1);
  const dx = pos[0] - look[0], dz = pos[2] - look[2];
  pos = [look[0] + dx * Math.cos(d) - dz * Math.sin(d), pos[1] + Math.sin(t * 0.3) * 0.05 * still, look[2] + dx * Math.sin(d) + dz * Math.cos(d)];
  return { pos, look, fov };
}
type Cam = ReturnType<typeof cameraAt>;
function project(cam: Cam, p: V3): [number, number, number] {
  const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norm = (a: number[]) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const f = norm(sub(cam.look, cam.pos)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
  const v = sub(p, cam.pos), z = dot(v, f);
  const tan = Math.tan((cam.fov * Math.PI) / 360);
  return [(dot(v, r) / (z * tan * (W / H)) * 0.5 + 0.5) * W, (0.5 - (dot(v, u) / (z * tan)) * 0.5) * H, z];
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
const Mat = ({ c, r = 0.55, m = 0, e = 0 }: { c: string; r?: number; m?: number; e?: number }) => (
  <StandardMaterial base_color={c} perceptual_roughness={r} metallic={m} emissive={glow(c, e)} />
);

/* ------------------------------------------------------------------ the bottle */
function Bottle({ t }: { t: number }) {
  const lab = out3(ramp(t, LAB_AT - 0.1, 0.9));
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
      {LAYERS.map((s, i) => {
        const g = out3(ramp(t, s.pour + DROP_T - 0.05, 0.6));
        if (g <= 0.002) return null;
        const hgt = LAYER_H * g;
        const y0 = INNER.floor + i * LAYER_H;
        const slosh = Math.sin((t - s.pour) * 9) * 0.05 * (1 - ramp(t, s.pour + DROP_T, 1.2));
        const toLab = s.layer!.animal ? lab : 0;
        const col = hexMix(s.layer!.color, P.accent, toLab);
        return (
          <Mesh3d key={s.id} name={`juice-${s.id}`} allowOverlap transform={Transform.fromXyz(0, y0 + hgt / 2, 0).withRotation(Quat.fromEuler("XYZ", 0, 0, slosh))}>
            <Cuboid half_size={[INNER.w / 2, Math.max(0.005, hgt / 2 - 0.003), INNER.d / 2]} />
            <StandardMaterial base_color={col} perceptual_roughness={0.15} emissive={glow(col, 0.3 + 1.6 * toLab * (0.75 + 0.25 * Math.sin(t * 5 + i)))} />
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
        <StandardMaterial base_color={P.glass} perceptual_roughness={0.05} specular_transmission={0.9} ior={1.25} thickness={0.05} />
      </Mesh3d>
      <Mesh3d name="collar" allowOverlap transform={Transform.fromXyz(0, PLINTH_TOP + BOT.h + 0.21, 0)}>
        <Cylinder radius={0.2} half_height={0.08} />
        <StandardMaterial base_color={P.gold} perceptual_roughness={0.22} metallic={1} />
      </Mesh3d>
      <Mesh3d name="cap" allowOverlap shape={CAP} transform={Transform.fromXyz(0, PLINTH_TOP + BOT.h + 0.6, 0)}>
        <StandardMaterial base_color="#1A0C12" perceptual_roughness={0.18} metallic={0.2} clearcoat={1} clearcoat_perceptual_roughness={0.05} />
      </Mesh3d>
    </>
  );
}

/* ------------------------------------------------------------------ the ingredients */
function Flower({ id, at: p, s = 1, petal = "#FBF6EA", heart = "#E8C66A", n = 5, rot = 0 }: { id: string; at: V3; s?: number; petal?: string; heart?: string; n?: number; rot?: number }) {
  return (
    <Entity transform={Transform.fromXyz(...p).withRotation(Quat.fromEuler("XYZ", 0, rot, 0)).withScale([s, s, s])}>
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
function Rose({ id, at: p, s = 1 }: { id: string; at: V3; s?: number }) {
  const rings = [{ n: 7, r: 0.26, y: 0.0, tilt: 0.9, sc: 1 }, { n: 6, r: 0.17, y: 0.06, tilt: 0.55, sc: 0.8 }, { n: 4, r: 0.08, y: 0.11, tilt: 0.25, sc: 0.6 }];
  return (
    <Entity transform={Transform.fromXyz(...p).withScale([s, s, s])}>
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
const HEAP = Array.from({ length: 30 }, (_, i) => {
  const a = i * 2.39996, r = 0.62 * Math.sqrt((i + 0.5) / 30);
  const layer = r < 0.25 ? 0.3 : r < 0.45 ? 0.17 : 0.06;
  return { i, x: Math.sin(a) * r, z: Math.cos(a) * r, y: PED_H + 0.06 + layer + 0.04 * hash(i), rot: hash(i + 7) * 6.28, s: 0.75 + 0.35 * hash(i + 2) };
});
function Molecule({ id, t, lit, s = 1 }: { id: string; t: number; lit: number; s?: number }) {
  const ATOMS: V3[] = [[0.75, 0.25, 0], [-0.7, 0.3, 0.2], [0.1, -0.7, 0.35], [0.05, 0.6, -0.65], [-0.2, -0.15, 0.85]];
  return (
    <Entity transform={Transform.fromXyz(0, 0, 0).withRotation(Quat.fromEuler("XYZ", t * 0.6, t * 0.9, 0)).withScale([s, s, s])}>
      <Mesh3d name={`${id}-core`} allowOverlap>
        <Sphere radius={0.32} />
        <StandardMaterial base_color={P.accent} perceptual_roughness={0.2} metallic={0.3} emissive={glow(P.accent, 0.4 + 2.6 * lit)} />
      </Mesh3d>
      {ATOMS.map((a, i) => {
        const len = Math.hypot(...a);
        const yaw = Math.atan2(a[0], a[2]), pitch = Math.acos(a[1] / len);
        return (
          <Entity key={i} transform={Transform.fromXyz(0, 0, 0)}>
            <Mesh3d name={`${id}-rod-${i}`} allowOverlap transform={Transform.fromXyz(a[0] / 2, a[1] / 2, a[2] / 2).withRotation(Quat.fromEuler("YXZ", yaw, pitch, 0))}>
              <Cylinder radius={0.05} half_height={len / 2} />
              <StandardMaterial base_color={P.ink} perceptual_roughness={0.3} metallic={0.8} />
            </Mesh3d>
            <Mesh3d name={`${id}-atom-${i}`} allowOverlap transform={Transform.fromXyz(...a)}>
              <Sphere radius={0.17} />
              <StandardMaterial base_color={i % 2 ? P.ink : "#BFC6D6"} perceptual_roughness={0.15} metallic={0.9} emissive={glow(P.accent, 0.8 * lit)} />
            </Mesh3d>
          </Entity>
        );
      })}
    </Entity>
  );
}

function Ingredient({ s, t }: { s: Station; t: number }) {
  const top = PED_H + 0.02;
  const bob = Math.sin(t * 1.3 + s.angle) * 0.04;
  const spin = t * 0.25 + s.angle;
  switch (s.obj) {
    case "lump": return (
      <Entity transform={Transform.fromXyz(0, top + 0.28 + bob, 0).withRotation(Quat.fromEuler("XYZ", 0.2, spin, 0.1))}>
        {[[0, 0, 0, 0.34], [0.26, -0.05, 0.08, 0.24], [-0.24, -0.06, -0.05, 0.22], [0.05, 0.12, -0.2, 0.2], [-0.08, -0.1, 0.22, 0.18]].map(([x, y, z, r], k) => (
          <Mesh3d key={k} name={`lump-${k}`} allowOverlap transform={Transform.fromXyz(x, y, z).withScale([1.1, 0.8, 1])}>
            <Sphere radius={r} />
            <Mat c={k % 2 ? "#D8D0C4" : P.ambergris} r={0.75} />
          </Mesh3d>
        ))}
      </Entity>
    );
    case "pod": return (
      <Entity transform={Transform.fromXyz(0, top + 0.3 + bob, 0).withRotation(Quat.fromEuler("XYZ", 0, spin, 0))}>
        <Mesh3d name="pod" allowOverlap transform={Transform.fromXyz(0, 0, 0).withScale([1, 0.85, 1])}><Sphere radius={0.3} /><Mat c={P.musk} r={0.9} /></Mesh3d>
        <Mesh3d name="pod-ring" allowOverlap transform={Transform.fromXyz(0, 0.18, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}><Torus major_radius={0.16} minor_radius={0.05} /><Mat c="#5E4030" r={0.8} /></Mesh3d>
      </Entity>
    );
    case "molecule": return (
      <Entity transform={Transform.fromXyz(0, top + 0.95 + bob, 0)}>
        <Molecule id="mol" t={t} lit={ramp(t, LAB_AT, 0.3)} s={0.75} />
      </Entity>
    );
    case "jasmine": return (
      <>{HEAP.map((f) => <Flower key={f.i} id={`jas-${f.i}`} at={[f.x, f.y, f.z]} s={f.s} rot={f.rot} />)}</>
    );
    case "rose": return (
      <>
        <Rose id="rose-a" at={[0, top + 0.32 + bob, 0]} s={1.15} />
        <Rose id="rose-b" at={[0.45, top + 0.18, 0.25]} s={0.72} />
        <Rose id="rose-c" at={[-0.4, top + 0.16, -0.2]} s={0.62} />
      </>
    );
    case "vanilla": return (
      <Entity transform={Transform.fromXyz(0, top + 0.12 + bob * 0.5, 0).withRotation(Quat.fromEuler("XYZ", 0, spin, 0))}>
        {[-0.17, 0, 0.17].map((x, k) => (
          <Mesh3d key={k} name={`pod-v-${k}`} allowOverlap transform={Transform.fromXyz(x, k === 1 ? 0.1 : 0, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0.15 * (k - 1), 0))}>
            <Capsule3d radius={0.07} half_length={0.62} />
            <Mat c="#3A2416" r={0.4} m={0.1} />
          </Mesh3d>
        ))}
        <Flower id="vanilla-flower" at={[0.05, 0.28, 0.25]} s={1.1} petal="#F3E7B8" heart="#D9B44A" n={6} />
      </Entity>
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
    default: return null;
  }
}

/** One station: the framed plate standing on the floor ring, and the pedestal with its ingredient. */
function StationPiece({ s, t }: { s: Station; t: number }) {
  const show = outBack(ramp(t, s.at - 0.6, 0.6), 1.3); // the ingredient pops up as its beat arrives
  const lit = life(t, s.at - 0.4, (s.pour || E(s.beat)) + DROP_T - s.at + 0.6, 0.3);
  const pu = plateU(s);
  const pc = at(s, pu, RING - 0.35, PLATE.bottom + PLATE.h / 2);
  const back = at(s, pu, RING - 0.39, PLATE.bottom + PLATE.h / 2);
  const ped = at(s, PED_U, RING + 0.15, 0);
  const col = s.layer?.color ?? P.accent;
  const sc = Math.max(0.001, show);
  return (
    <>
      <Entity transform={Transform.fromXyz(...back).withRotation(Quat.fromEuler("XYZ", 0, rad(s.angle), 0))}>
        <Mesh3d name={`frame-${s.id}`} allowOverlap>
          <Cuboid half_size={[PLATE.w / 2 + 0.07, PLATE.h / 2 + 0.07, 0.03]} />
          <StandardMaterial base_color="#1A0C12" perceptual_roughness={0.6} />
        </Mesh3d>
        {([[0, PLATE.h / 2 + 0.05, PLATE.w / 2 + 0.07, 0.025], [0, -PLATE.h / 2 - 0.05, PLATE.w / 2 + 0.07, 0.025], [PLATE.w / 2 + 0.05, 0, 0.025, PLATE.h / 2 + 0.07], [-PLATE.w / 2 - 0.05, 0, 0.025, PLATE.h / 2 + 0.07]] as const).map(([x, y, hx, hy], k) => (
          <Mesh3d key={k} name={`frame-${s.id}-gold-${k}`} allowOverlap transform={Transform.fromXyz(x, y, 0.035)}>
            <Cuboid half_size={[hx, hy, 0.012]} />
            <StandardMaterial base_color={P.gold} perceptual_roughness={0.3} metallic={0.9} emissive={glow(P.gold, 0.3 * lit)} />
          </Mesh3d>
        ))}
      </Entity>
      <ImagePlane src={staticFile(`plates/${s.plate}`)} width={PLATE.w} height={PLATE.h} position={pc} rotation={[0, rad(s.angle), 0]} />
      <Mesh3d name={`easel-${s.id}`} transform={Transform.fromXyz(...at(s, pu, RING - 0.45, PLATE.bottom / 2))}>
        <Cuboid half_size={[0.05, PLATE.bottom / 2, 0.05]} />
        <StandardMaterial base_color={P.gold} perceptual_roughness={0.3} metallic={0.9} />
      </Mesh3d>
      {s.obj !== "none" && (
        <Entity transform={Transform.fromXyz(...ped)}>
          <Mesh3d name={`ped-${s.id}`} transform={Transform.fromXyz(0, PED_H / 2, 0)}>
            <Cylinder radius={0.8} half_height={PED_H / 2} />
            <StandardMaterial base_color={P.stone} perceptual_roughness={0.4} metallic={0.1} />
          </Mesh3d>
          <Mesh3d name={`ped-ring-${s.id}`} allowOverlap transform={Transform.fromXyz(0, PED_H + 0.004, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}>
            <Torus major_radius={0.77} minor_radius={0.022} />
            <StandardMaterial base_color={col} emissive={glow(col, 0.4 + 2.2 * lit)} />
          </Mesh3d>
          <Entity transform={Transform.fromXyz(0, PED_H * (1 - sc), 0).withScale([sc, sc, sc])}>
            <Ingredient s={s} t={t} />
          </Entity>
        </Entity>
      )}
    </>
  );
}

/** The hook: what everybody expects — jasmine flowers falling round the bottle. */
const RAIN = Array.from({ length: 22 }, (_, i) => {
  const side = i % 4, k = hash(i + 11);
  const x = side < 2 ? (side ? 1 : -1) * (1.05 + 0.4 * k) : (k - 0.5) * 2.6;
  const z = side >= 2 ? (side === 2 ? 1 : -1) * (0.75 + 0.35 * k) : (hash(i + 3) - 0.5) * 1.8;
  return { i, x, z, at: -0.8 + hash(i + 40) * 3.0, rot: hash(i + 7) * 6.28, s: 0.7 + 0.3 * hash(i + 2) };
});
function Rain({ t }: { t: number }) {
  return (
    <>
      {RAIN.map((f) => {
        const k = ramp(t, f.at, 0.8);
        if (k <= 0) return null;
        const fall = 1 - out3(k);
        return <Flower key={f.i} id={`rain-${f.i}`} at={[f.x + fall * Math.sin(t * 5 + f.i) * 0.25, PLINTH_TOP + 0.06 + fall * 6, f.z]} s={f.s} rot={f.rot + fall * 3} />;
      })}
    </>
  );
}

function Drops({ t }: { t: number }) {
  return (
    <>
      {LAYERS.map((s) => {
        const k = ramp(t, s.pour, DROP_T);
        if (k <= 0 || k >= 1) return null;
        const from = s.obj === "none" ? at(s, plateU(s), RING - 0.6, PLATE.bottom + 0.4) : at(s, PED_U, RING, PED_H + 1.0);
        const to: V3 = [0, PLINTH_TOP + BOT.h + 0.3, 0];
        const pos = lerp3(from, to, inOut3(k));
        pos[1] += Math.sin(Math.PI * k) * 2.2;
        return (
          <Mesh3d key={s.id} name={`drop-${s.id}`} allowOverlap transform={Transform.fromXyz(...pos).withScale([0.8, 1.15, 0.8])}>
            <Sphere radius={0.17} />
            <StandardMaterial base_color={s.layer!.color} perceptual_roughness={0.1} emissive={glow(s.layer!.color, 1.8)} />
          </Mesh3d>
        );
      })}
    </>
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
const popS = (t: number, a: number) => Math.min(1.06, outBack(ramp(t, a, 0.3), 2));

/** While a station is the subject: its name (Display) + where (Mono) under the pedestal top, and the AI label under its plate. */
function StationTags({ t, cam, s, i }: { t: number; cam: Cam; s: Station; i: number }) {
  const until = SHOTS.find((sh) => sh.t > s.at + 0.6)?.t ?? B("pullback");
  const solo = life(t, s.at, until - s.at - 0.25, 0.2);
  const all = life(t, w("pullback", "Whales,") + 0.08 * i, B("loop") - w("pullback", "Whales,") - 0.08 * i, 0.2);
  const out: JSX.Element[] = [];
  // the AI label sits under the plate whenever the plate is big on screen
  const [lx, ly, lz] = project(cam, at(s, plateU(s) - PLATE.w / 2 + 0.06, RING - 0.3, PLATE.bottom + PLATE.h - 0.06));
  const plateBig = lz > 0 && lz < 16 && lx > 0 && lx < W;
  const aiO = life(t, Math.min(s.at, SHOTS.filter((sh) => sh.t <= s.at + 0.6).at(-1)?.t ?? s.at), until - s.at + 0.3, 0.2);
  if (plateBig && aiO > 0.01 && ly < SAFE.bottom - 30) {
    out.push(<div key="ai" style={abs(Math.max(SAFE.left, lx), ly, { opacity: aiO, ...mono(15, P.ink), letterSpacing: "0.06em", background: "rgba(12,6,9,0.72)", padding: "4px 7px 3px", whiteSpace: "nowrap" })}>{s.ai}</div>);
  }
  const o = Math.max(solo, all);
  if (o > 0.01) {
    const small = all > solo;
    const anchor = s.obj === "none" ? at(s, plateU(s), RING - 0.3, PLATE.bottom + PLATE.h + 0.35) : at(s, PED_U, RING + 0.15, PED_H + 1.05);
    const [px, py] = project(cam, anchor);
    if (small && (py < 380 || py > 1140)) return <>{out}</>;
    const wdt = small ? 260 : 440;
    out.push(
      <div key="tag" style={abs(clampX(px, wdt / 2) - wdt / 2, py - (small ? 60 : 118), { width: wdt, textAlign: "center", opacity: o, transform: `scale(${small ? 1 : popS(t, s.at)})`, transformOrigin: "center bottom" })}>
        <div style={display(small ? 38 : 76, s.layer?.color ?? P.accent)}>{s.name}</div>
        {!small && s.where && <div style={{ ...mono(24), marginTop: 8 }}>{s.where}</div>}
      </div>,
    );
  }
  return <>{out}</>;
}

/** A figure block hung from the left margin under the series bar (one per beat at most). */
function Figure({ t, at: a, until, big, label, color = P.accent, size = 168 }: { t: number; at: number; until: number; big: string; label: string; color?: string; size?: number }) {
  const o = life(t, a, until - a, 0.2);
  if (o <= 0.01) return null;
  return (
    <div style={abs(SAFE.left, 318, { opacity: o, transform: `scale(${popS(t, a)})`, transformOrigin: "left center", width: SAFE.right - SAFE.left })}>
      <div style={display(size, color)}>{big}</div>
      <div style={{ ...mono(27), marginTop: 10, maxWidth: 780, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function Overlay({ t, cam }: { t: number; cam: Cam }) {
  const titleO = Math.max(1 - ramp(t, w("hook", "whale's") - 0.1, 0.2), ramp(t, DUR - 1.3, 0.35));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <style>{FONTS}</style>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 760, backgroundImage: "linear-gradient(180deg, rgba(12,6,9,0.9) 0%, rgba(12,6,9,0.62) 42%, rgba(12,6,9,0) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 1010, width: W, height: 910, backgroundImage: "linear-gradient(180deg, rgba(12,6,9,0) 0%, rgba(12,6,9,0.82) 17%, rgba(12,6,9,0.86) 100%)" }} />

      <div style={abs(SAFE.left, SAFE.top, { display: "flex", alignItems: "center", gap: 16 })}>
        <div style={{ ...mono(26, P.bg), background: P.accent, padding: "9px 14px 8px 17px", borderRadius: 4, letterSpacing: "0.22em" }}>SILLAGE</div>
        <div style={mono(26, P.accent)}>N°1</div>
      </div>
      {titleO > 0.01 && (
        <div style={abs(SAFE.left, 324, { width: SAFE.right - SAFE.left, opacity: titleO })}>
          <div style={display(108)}>What's really<br />in your perfume</div>
          <div style={{ ...whisper(50, P.accent), marginTop: 14 }}>a whale, a deer, a beaver and a ton of flowers</div>
        </div>
      )}

      <Figure t={t} at={w("ambergris", "float")} until={E("ambergris") + 0.1} big="Years at sea" label="ambergris can drift for years before it washes up" color={P.ambergris} size={150} />
      <Figure t={t} at={w("fixative", "last")} until={E("fixative") + 0.15} big="Fixative" label="it slows evaporation: the scent lasts on skin" color={P.ambergris} />
      <Figure t={t} at={w("musk", "1979,")} until={E("musk") + 0.15} big="1979" label="the musk deer is protected (CITES)" color={P.musk} />
      <Figure t={t} at={w("beaver", "Yes,")} until={E("beaver") + 0.1} big="Yes, beavers" label="castoreum: from the beaver's castor sacs, for leather notes" color={P.castoreum === "#5A3A28" ? "#B07A55" : P.castoreum} size={150} />
      <Figure t={t} at={LAB_AT} until={E("twist") + 0.2} big="Made in a lab" label="almost all animal notes are synthetic today" />
      <Figure t={t} at={w("jasmine", "ton")} until={E("jasmine") + 0.15} big="≈1,000 kg" label="of flowers for 1 kg of jasmine oil, picked by hand" color={P.jasmine} />
      <Figure t={t} at={w("rose", "two")} until={E("rose") + 0.15} big="2 countries" label="make most of the world's rose oil" color={P.rose} size={150} />
      <Figure t={t} at={w("vanilla", "1841.")} until={E("vanilla") + 0.15} big="1841" label="Edmond Albius, 12, finds how to pollinate vanilla by hand" color={P.vanilla} />
      <Figure t={t} at={w("vetiver", "half")} until={E("vetiver") + 0.15} big="≈50%" label="of the world's vetiver oil comes from Haiti" color={P.vetiver} />

      {ST.map((s, i) => <StationTags key={s.id} t={t} cam={cam} s={s} i={i} />)}

      <Captions t={t} />
      <div style={abs(SAFE.left, 1384, { ...mono(21, P.muted), letterSpacing: "0.04em", width: SAFE.railX - SAFE.left, whiteSpace: "nowrap" })}>Sources in the pinned comment · images: AI illustrations</div>
    </AbsoluteFill>
  );
}

/** Captions from the transcript; a figure already shown big is not repeated. */
const HIDE = new Set(["musk:1979", "vanilla:1841"]);
const PHRASES: Word[][] = (() => {
  const out: Word[][] = [];
  for (const b of TIMINGS.beats as any[]) {
    let cur: Word[] = [], len = 0;
    for (const x of b.words as Word[]) {
      if (HIDE.has(`${b.id}:${x.w.replace(/[.,…:?!]$/, "")}`)) {
        if (/[.,…:?!]$/.test(x.w) && cur.length) { out.push(cur); cur = []; len = 0; }
        continue;
      }
      if (cur.length && len + x.w.length > 20) { out.push(cur); cur = []; len = 0; }
      cur.push(x); len += x.w.length + 1;
      if (/[.,…:?!]$/.test(x.w) && len > 9) { out.push(cur); cur = []; len = 0; }
    }
    if (cur.length) out.push(cur);
  }
  return out;
})();
const KEYWORDS: Record<string, string> = {
  whale: P.accent, "whale's": P.accent, ambergris: P.ambergris, musk: "#C49A7C", deer: "#C49A7C", castoreum: "#C49A7C", beavers: "#C49A7C",
  lab: P.accent, real: P.accent, jasmine: P.jasmine, grasse: P.jasmine, bulgaria: P.rose, turkey: P.rose, vanilla: P.vanilla, hand: P.vanilla,
  albius: P.vanilla, haiti: P.vetiver, vetiver: P.vetiver, roots: P.vetiver,
};
function Captions({ t }: { t: number }) {
  const i = PHRASES.findIndex((p, k) => t >= p[0].start - 0.05 && t < (PHRASES[k + 1]?.[0].start ?? 1e9) - 0.05 && t < p[p.length - 1].end + 0.6 && t < DUR - 0.5);
  if (i < 0) return null;
  const p = PHRASES[i];
  return (
    <div style={abs(SAFE.left, 1170, { width: SAFE.railX - SAFE.left, display: "flex", flexWrap: "wrap", columnGap: 22, rowGap: 4 })}>
      {p.map((x, k) => {
        const on = t >= x.start - 0.04;
        const hot = KEYWORDS[x.w.replace(/[.,…:?!]$/, "").toLowerCase()];
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
    [0.1, "rumble", 0.25], [w("hook", "whale's"), "boom", 0.45],
    ...SHOTS.slice(2, -1).map((s) => [s.t + 0.1, "whoosh", 0.28] as [number, string, number]),
    ...ST.slice(1).map((s) => [s.at, "pop", 0.38] as [number, string, number]),
    ...LAYERS.map((s) => [s.pour + DROP_T - 0.05, "pop", 0.22] as [number, string, number]),
    [w("musk", "1979,"), "stamp", 0.45], [w("beaver", "Yes,"), "stamp", 0.45], [LAB_AT, "boom", 0.4],
    [w("jasmine", "ton"), "stamp", 0.45], [w("vanilla", "1841."), "stamp", 0.45], [w("vetiver", "half"), "stamp", 0.45],
  ];
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: (cam.fov * Math.PI) / 180 } }}>
        <DepthOfField focal_distance={focus} aperture_f_stops={4} />
      </Camera3d>
      <ToneMapping mode="tony" exposure={0.2} />
      <Bloom intensity={0.3} threshold={0.9} />
      <Shadows distance={70} firstCascade={25} mapSize={2048} />
      <AmbientLight brightness={170} color="#E0A8C0" />
      <DirectionalLight transform={Transform.fromXyz(-6, 14, 7).lookingAt([0, 0, 0])} illuminance={2400} color="#FFE9DC" shadow_maps_enabled soft_shadow_size={2} />
      <SpotLight transform={Transform.fromXyz(2.2, 8.5, 4.5).lookingAt([0, 1.4, 0])} intensity={4200000} outer_angle={0.42} inner_angle={0.18} color="#FFF2E6" shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(-1.5, 3.2, -2.6)} intensity={900000} color={P.accent} range={9} />
      {ST.filter((s) => s.obj !== "none").map((s) => {
        const p = at(s, PED_U, RING + 0.15, 0);
        const on = life(t, s.at - 0.4, (s.pour || E(s.beat)) - s.at + 1.2, 0.3);
        return <SpotLight key={s.id} transform={Transform.fromXyz(p[0] * 1.15, 7, p[2] * 1.15).lookingAt([p[0], PED_H, p[2]])} intensity={500000 + 2600000 * on} outer_angle={0.36} inner_angle={0.16} color="#FFF4EA" />;
      })}
      <Fog color={P.bg} near={focus * 1.2} far={focus * 3.2} />
      <Mesh3d name="floor" transform={Transform.fromXyz(0, -0.05, 0)}>
        <Cuboid half_size={[90, 0.05, 90]} />
        <StandardMaterial base_color={P.velvet} perceptual_roughness={0.92} />
      </Mesh3d>
      <Bottle t={t} />
      {ST.map((s) => <StationPiece key={s.id} s={s} t={t} />)}
      <Rain t={t} />
      <Drops t={t} />

      <Overlay t={t} cam={cam} />

      {sfx.map(([a, name, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(a * FPS))} durationInFrames={FPS * 3} layout="none" name={`sfx-${name}-${i}`}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} />
        </Sequence>
      ))}
      <Audio src={staticFile("voice.wav")} volume={0.62} />
      <Audio src={staticFile("music.wav")} volume={(fr: number) => interpolate(fr / FPS, [0, 0.5, DUR - 3, DUR], [0, 0.13, 0.13, 0.18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
}

registerRoot(() => <Composition id="sillage" component={Sillage001} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />);
