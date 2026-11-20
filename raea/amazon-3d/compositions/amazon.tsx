/**
 * RECEIPTS #007 — "Where $100 at Amazon goes", built in raea (Bevy through raea/3d).
 * The text is the episode amazon-100: its voice, word timings and sourced figures
 * (public/episodes/amazon-100/SOURCES.md, Amazon 10-K FY2025). Per $100 of net sales, "our calc.".
 *
 *   hero   (x 0)   a stack of plain parcels on a plinth; on "never see" a server rack lights up in the dark behind it
 *   split  (x 14)  $100 = 100 identical cubes, 1 cube = $1, so volume reads honestly:
 *                  82 parcels on a pallet (shopping) on "$82" · 18 servers in a rack (AWS) on "$18"
 *                  a conveyor runs parcels out in front of the pallet on "Shipping alone cost $103B"
 *                  what each keeps lights lime: 4.79 parcels, 6.36 servers (the last cube lit in part)
 *                  then the two lime amounts stand as two columns between them; the AWS column is 57 % of the profit
 *   point          low on the boxes ("You see the boxes"), crane up the rack ("The money is in the cloud")
 *   loop           back to the parcels; the top box drops on "box", so the last frame meets frame 0
 *
 * Redundancy rule (owner): a figure is on screen ONCE. Figures pinned in the world are removed from the captions.
 * Every cue is timed from timings.json, never by eye.
 */
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "raea";
import { Bloom, DepthOfField, Entity, ToneMapping } from "raea/3d";
import { Cuboid, Cylinder, Mesh3d, Torus } from "raea/mesh";
import { Fog, StandardMaterial } from "raea/pbr";
import { AmbientLight, DirectionalLight, PointLight, Shadows, SpotLight } from "raea/light";
import { Quat, Transform } from "raea/transform";
import { Camera3d } from "raea/camera";
import { LinearRgba, Srgba } from "raea/color";
import TIMINGS from "./timings.json";

/* ------------------------------------------------------------------ house tokens */
const FPS = 30, W = 1080, H = 1920;
const P = { bg: "#03100B", glow: "#14402E", surface: "#245240", ink: "#F3F6EE", muted: "#8FA89B", lime: "#C8F53C", amber: "#FFB648", blue: "#7FB2FF", card: "#B4875A", tape: "#D9B98C", metal: "#1A232B", rail: "#3A4652" };
const SAFE = { top: 250, bottom: 1440, left: 64, right: 940, railX: 930 };
const DUR = TIMINGS.duration + 0.5;

/* ------------------------------------------------------------------ time helpers: everything is a function of t */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, at: number, d: number) => clamp01((t - at) / d);
const out3 = (x: number) => 1 - Math.pow(1 - x, 3);
const inOut3 = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outBack = (x: number, s = 1.6) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
type V3 = [number, number, number];
const lerp3 = (a: number[], b: number[], k: number) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)] as V3;
const hexMix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(lerp(v, y[i], clamp01(k))).toString(16).padStart(2, "0")).join("");
};
const glow = (hex: string, k: number) => LinearRgba.from(Srgba.hex(hex)).mul(k);
const life = (t: number, at: number, hold: number, fade = 0.2) => Math.min(ramp(t, at, fade), 1 - ramp(t, at + hold, fade));
const pop = (t: number, at: number) => Math.min(1.08, outBack(ramp(t, at, 0.3), 2));

type Word = { w: string; start: number; end: number };
const BEATS: Record<string, { start: number; end: number; words: Word[] }> = Object.fromEntries(TIMINGS.beats.map((b: any) => [b.id, b]));
const bare = (s: string) => s.replace(/[.,…:?]$/, "");
/** `w("shop", "$82")` is when "$82" is spoken in beat "shop" (trailing punctuation ignored). */
const w = (beat: string, word: string, n = 1) => {
  const ws = BEATS[beat].words.filter((x) => x.w === word || bare(x.w) === word);
  if (!ws.length) throw new Error(`no word "${word}" in beat ${beat}`);
  return (ws[n - 1] ?? ws[0]).start;
};
const B = (beat: string) => BEATS[beat].start;

/* ------------------------------------------------------------------ the money: per $100 of net sales (our calc.) */
const SHOP = 82, CLOUD = 18, SHOP_KEEP = 4.79, CLOUD_KEEP = 6.36;
const U = 0.42, GAP = 0.03, HALF = (U - GAP) / 2; // one cube = $1, the same size for parcels and servers

/* ------------------------------------------------------------------ stations */
const SPLIT_X = 14;
const PAL = { x: 12.0, z: 0, cols: 5, rows: 4 }; // the pallet: 5 × 4 a layer, layers up
const RACK = { x: 16.3, z: 0, cols: 2 };         // the rack: 2 wide, 9 high
const COL = { shop: SPLIT_X - 0.25, cloud: SPLIT_X + 0.6 };
const PAL_Y0 = 0.16, RACK_Y0 = 0.12;
const parcelPos = (i: number): V3 => {
  const layer = Math.floor(i / (PAL.cols * PAL.rows)), r = i % (PAL.cols * PAL.rows);
  const cx = r % PAL.cols, cz = Math.floor(r / PAL.cols);
  return [PAL.x + (cx - (PAL.cols - 1) / 2) * U, PAL_Y0 + layer * U + U / 2, PAL.z + (cz - (PAL.rows - 1) / 2) * U];
};
const serverPos = (i: number): V3 => {
  const row = Math.floor(i / RACK.cols), cx = i % RACK.cols;
  return [RACK.x + (cx - (RACK.cols - 1) / 2) * U, RACK_Y0 + row * U + U / 2, RACK.z];
};
/** The cubes that light lime: the top ones of each pile, the last of them lit only in part. */
const keepShare = (i: number, n: number, keep: number) => clamp01(keep - (n - 1 - i));

/* ------------------------------------------------------------------ cue times */
const T = {
  never: w("hook", "never"),
  take: w("take", "Take"),
  hundred: w("take", "$100"),
  shop: w("shop", "$82"),
  cloud: w("cloud", "$18"),
  ship: w("ship", "Shipping"),
  shipFig: w("ship", "$103B"),
  shopKeep: w("shopkeep", "$4.79"),
  cloudKeep: w("cloudkeep", "$6.36"),
  share: w("share", "57%"),
  year: w("year", "$45.6B"),
  smaller: w("share", "smaller"),
  renting: w("year", "renting"),
  boxes: w("point", "boxes"),
  money: w("point", "money"),
  box: w("loop", "box"),
};

/* ------------------------------------------------------------------ camera */
type Shot = { t: number; pos: V3; look: V3; fov: number; d?: number };
/** A shot from where it looks: yaw from +z toward +x, pitch above the floor, distance. */
const shot = (t: number, target: V3, yaw: number, pitch: number, dist: number, fov: number, d = 1.0): Shot => {
  const y = (yaw * Math.PI) / 180, p = (pitch * Math.PI) / 180;
  return { t, look: target, fov, d, pos: [target[0] + dist * Math.sin(y) * Math.cos(p), target[1] + dist * Math.sin(p), target[2] + dist * Math.cos(y) * Math.cos(p)] };
};
const HERO = shot(0, [0.4, 1.75, 0], 22, 13, 15.5, 26);
const SHOTS: Shot[] = [
  HERO,
  shot(1.75, [0.4, 1.6, 0], 14, 10, 13.2, 26, 3.5),                     // slow push-in while the $717B sits
  shot(T.never - 0.35, [1.4, 1.6, -1.2], 4, 9, 20, 30, 0.9),            // the rack behind lights up
  shot(B("take") - 0.3, [SPLIT_X, 1.1, 0], -4, 24, 27, 30),
  shot(8.75, [SPLIT_X - 0.7, 1.0, 0], 9, 19, 23, 30, 3.4),             // drift onto the pallet: store, sellers, ads, Prime
  shot(T.cloud - 0.3, [SPLIT_X + 0.5, 1.1, 0], -12, 22, 24, 30, 0.8),  // over to the rack for "$18"
  shot(B("ship") - 0.25, [PAL.x + 0.6, 0.7, 1.4], -14, 15, 21, 30),
  shot(B("shopkeep") - 0.25, [PAL.x + 0.4, 1.0, 0], 8, 30, 19, 30),
  shot(B("cloudkeep") - 0.25, [SPLIT_X + 0.4, 1.3, 0], -8, 22, 25, 30),
  shot(T.smaller - 0.03, [SPLIT_X + 0.4, 1.4, 0], 12, 8, 22, 30, 0.01), // hard cut on "smaller": low, from the other side
  shot(B("year") - 0.25, [RACK.x - 0.9, 1.1, 0], -22, 14, 22, 30),
  shot(32.5, [RACK.x - 0.5, 1.4, 0], -36, 18, 17.5, 30, 3.8),           // slow orbit in on the rack, "from renting computers"
  shot(B("point") - 0.25, [PAL.x, 0.8, 0.4], 10, 7, 16, 30),
  shot(T.money - 0.2, [RACK.x - 0.4, 1.3, 0], -12, 26, 20, 30),
];
const OPEN: Shot = { t: 0, pos: [HERO.look[0] + (HERO.pos[0] - HERO.look[0]) * 0.95, HERO.look[1] + (HERO.pos[1] - HERO.look[1]) * 0.95, HERO.look[2] + (HERO.pos[2] - HERO.look[2]) * 0.95], look: HERO.look, fov: HERO.fov };
SHOTS.push({ ...OPEN, t: B("loop") - 0.2, d: 1.2 });
function cameraAt(t: number) {
  let k = 0;
  for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].t) k = i;
  const prev = SHOTS[Math.max(0, k - 1)], cur = SHOTS[k];
  const e = k === 0 ? 1 : inOut3(ramp(t, cur.t, cur.d ?? 1.0));
  let pos = lerp3(prev.pos, cur.pos, e), look = lerp3(prev.look, cur.look, e), fov = lerp(prev.fov, cur.fov, e);
  const c = inOut3(ramp(t, 0.05, 1.6)); // crane-in on the hook
  if (t < 1.7) { pos = lerp3(OPEN.pos, pos, c); look = lerp3(OPEN.look, look, c); }
  const still = 1 - ramp(t, DUR - 1.4, 1.0); // a slow orbit, none on the last frames so the loop meets frame 0
  const a = (Math.sin(t * 0.42) * 0.05 + Math.sin(t * 0.17 + 1) * 0.03) * still * (t < 1.7 ? c : 1);
  const dx = pos[0] - look[0], dz = pos[2] - look[2];
  pos = [look[0] + dx * Math.cos(a) - dz * Math.sin(a), pos[1] + Math.sin(t * 0.3) * 0.06 * still, look[2] + dx * Math.sin(a) + dz * Math.cos(a)];
  return { pos, look, fov };
}
/** World point → pixel of the 1080×1920 frame, through the same camera that renders it. */
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

/* ------------------------------------------------------------------ 3D pieces */
/** A plain parcel: cardboard and a strip of tape over the top (no brand, no logo). */
function Parcel({ name, pos, s = 1, color = P.card, em = 0, size = HALF, spin = 0 }: { name: string; pos: V3; s?: number; color?: string; em?: number; size?: number; spin?: number }) {
  if (s <= 0.005) return null;
  return (
    <Entity transform={Transform.fromXyz(pos[0], pos[1], pos[2]).withRotation(Quat.fromEuler("XYZ", 0, spin, 0)).withScale([s, s, s])}>
      <Mesh3d name={name}>
        <Cuboid half_size={[size, size, size]} />
        <StandardMaterial base_color={color} perceptual_roughness={0.86} emissive={glow(P.lime, em)} />
      </Mesh3d>
      <Mesh3d name={`${name}-tape`} allowOverlap transform={Transform.fromXyz(0, size + 0.004, 0)}>
        <Cuboid half_size={[size * 0.22, 0.006, size + 0.004]} />
        <StandardMaterial base_color={em > 0.1 ? hexMix(P.tape, P.lime, 0.7) : P.tape} perceptual_roughness={0.4} />
      </Mesh3d>
    </Entity>
  );
}

/** A server: a dark metal unit with a row of status lights on its front. */
function Server({ name, pos, s = 1, lit = 1, keep = 0, blink = 0, raw = 0 }: { name: string; pos: V3; s?: number; lit?: number; keep?: number; blink?: number; raw?: number }) {
  if (s <= 0.005) return null;
  return (
    <Entity transform={Transform.fromXyz(pos[0], pos[1], pos[2]).withScale([s, s, s])}>
      <Mesh3d name={name}>
        <Cuboid half_size={[HALF, HALF, HALF]} />
        <StandardMaterial base_color={hexMix(hexMix(P.metal, "#2E5A1E", keep), P.card, raw)} perceptual_roughness={lerp(0.34, 0.86, raw)} metallic={0.75 * (1 - raw)} emissive={glow(P.lime, keep * 0.55)} />
      </Mesh3d>
      {[0, 1, 2].map((k) => (
        <Mesh3d key={k} name={`${name}-led-${k}`} allowOverlap transform={Transform.fromXyz(-HALF * 0.55 + k * 0.07, -HALF * 0.45, HALF + 0.004)}>
          <Cuboid half_size={[0.022, 0.012, 0.006]} />
          <StandardMaterial base_color={keep > 0.5 ? P.lime : P.blue} emissive={glow(keep > 0.5 ? P.lime : P.blue, lit * (2.2 + 1.6 * blink * (Math.sin((k + 1) * 7.3 + blink * 40) > 0 ? 1 : 0)))} />
        </Mesh3d>
      ))}
      {[-1, 1].map((sg) => (
        <Mesh3d key={sg} name={`${name}-vent-${sg}`} allowOverlap transform={Transform.fromXyz(HALF * 0.35, sg * HALF * 0.35, HALF + 0.003)}>
          <Cuboid half_size={[HALF * 0.45, 0.01, 0.004]} />
          <StandardMaterial base_color={P.rail} perceptual_roughness={0.5} metallic={0.6} />
        </Mesh3d>
      ))}
    </Entity>
  );
}

/** The hero: three parcels on a plinth; the top one drops back on "box" in the loop. A dark rack waits behind. */
const HERO_BOXES: { pos: V3; size: number; spin: number }[] = [
  { pos: [-0.35, 0.32 + 0.55, 0.15], size: 0.55, spin: 0.25 },
  { pos: [0.75, 0.32 + 0.42, -0.2], size: 0.42, spin: -0.4 },
  { pos: [0.1, 0.32 + 1.1 + 0.36, 0.05], size: 0.36, spin: 0.6 },
];
function Hero({ t }: { t: number }) {
  const drop = ramp(t, T.box - 0.25, 0.45);
  const gone = t >= B("loop") && t < T.box - 0.25; // the top box is in the air during the loop line
  return (
    <>
      <Mesh3d name="plinth" transform={Transform.fromXyz(0.2, 0.16, 0)}>
        <Cylinder radius={2.0} half_height={0.16} />
        <StandardMaterial base_color={P.surface} perceptual_roughness={0.42} metallic={0.15} />
      </Mesh3d>
      <Mesh3d name="plinth-ring" transform={Transform.fromXyz(0.2, 0.325, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}>
        <Torus major_radius={1.93} minor_radius={0.03} />
        <StandardMaterial base_color={P.lime} emissive={glow(P.lime, 2.4)} />
      </Mesh3d>
      {HERO_BOXES.map((b, i) => {
        let pos = b.pos;
        if (i === 2 && t >= B("loop")) {
          if (gone) return null;
          const k = 1 - drop; // falls from above, a small bounce on landing
          pos = [b.pos[0], b.pos[1] + 2.4 * k * k - 0.06 * Math.sin(Math.PI * ramp(t, T.box + 0.2, 0.2)), b.pos[2]];
        }
        return <Parcel key={i} name={`hero-box-${i}`} pos={pos} size={b.size} spin={b.spin + (i === 2 ? Math.sin(t * 0.5) * 0.02 : 0)} />;
      })}
      <HiddenRack t={t} />
    </>
  );
}

/** "Something you never see": a rack behind the parcels, in the dark until "never". */
function HiddenRack({ t }: { t: number }) {
  const on = Math.min(ramp(t, T.never, 0.35), 1 - ramp(t, B("take") + 0.4, 0.4));
  const rise = Math.min(out3(ramp(t, T.never - 0.25, 0.45)), 1 - ramp(t, B("take") + 0.6, 0.3));
  if (rise <= 0.005) return null; // not in the set before "never" nor in the loop, so frame 0 has only the parcels
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <Server key={i} name={`hidden-${i}`} pos={[2.4 + (i % 2) * U * 1.5, (0.12 + (Math.floor(i / 2) * U + U / 2) * 1.5) * rise, -3.6]} s={rise * 1.5} lit={0.05 + on} blink={on} />
      ))}
    </>
  );
}

/** The split: 82 parcels on a pallet, 18 servers in a rack, the conveyor, the lime keeps and their two columns. */
function Split({ t }: { t: number }) {
  const show = ramp(t, B("take") - 0.1, 0.4);
  if (show <= 0) return null;
  const toCols = out3(ramp(t, T.share - 0.15, 0.7));       // the lime amounts leave their piles for the columns
  const shopLit = out3(ramp(t, T.shopKeep, 0.6)) * (1 - toCols);
  const cloudLit = out3(ramp(t, T.cloudKeep, 0.6)) * (1 - toCols);
  const shine = t >= T.money ? out3(ramp(t, T.money, 0.5)) : 0; // "the money is in the cloud": the rack glows
  return (
    <>
      <Mesh3d name="split-base" transform={Transform.fromXyz(SPLIT_X, 0.03, 0)}>
        <Cuboid half_size={[5.4, 0.03, 2.0]} />
        <StandardMaterial base_color="#0B241A" perceptual_roughness={0.5} />
      </Mesh3d>
      <Mesh3d name="pallet" transform={Transform.fromXyz(PAL.x, 0.1, PAL.z)}>
        <Cuboid half_size={[PAL.cols * U / 2 + 0.06, 0.04, PAL.rows * U / 2 + 0.06]} />
        <StandardMaterial base_color="#8A6A45" perceptual_roughness={0.9} />
      </Mesh3d>
      {Array.from({ length: SHOP }, (_, i) => {
        const at = T.hundred + (i / SHOP) * 0.9;
        const k = out3(ramp(t, at, 0.28));
        if (k <= 0.005) return null;
        const p = parcelPos(i);
        const keep = keepShare(i, SHOP, SHOP_KEEP) * shopLit;
        const flash = life(t, T.shop - 0.05, 0.5, 0.15) * (1 - keep); // the pallet pulses amber on "$82"
        return <Parcel key={i} name={`parcel-${i}`} pos={[p[0], p[1] + (1 - k) * 1.6, p[2]]} s={1} color={hexMix(hexMix(P.card, P.amber, 0.5 * flash), "#7FA82A", keep)} em={keep * 0.9} />;
      })}
      {/* the rack: two posts and a roof, then 18 servers slid in from the front */}
      {[-1, 1].map((sg) => (
        <Mesh3d key={sg} name={`rack-post-${sg}`} transform={Transform.fromXyz(RACK.x + sg * (U + 0.05), RACK_Y0 + 9 * U / 2 + 0.05, RACK.z)}>
          <Cuboid half_size={[0.035, 9 * U / 2 + 0.05, HALF + 0.03]} />
          <StandardMaterial base_color={P.rail} perceptual_roughness={0.4} metallic={0.8} />
        </Mesh3d>
      ))}
      <Mesh3d name="rack-roof" transform={Transform.fromXyz(RACK.x, RACK_Y0 + 9 * U + 0.13, RACK.z)}>
        <Cuboid half_size={[U + 0.085, 0.03, HALF + 0.03]} />
        <StandardMaterial base_color={P.rail} perceptual_roughness={0.4} metallic={0.8} emissive={glow(P.lime, 1.2 * shine)} />
      </Mesh3d>
      <Mesh3d name="rack-foot" transform={Transform.fromXyz(RACK.x, RACK_Y0 / 2 + 0.03, RACK.z)}>
        <Cuboid half_size={[U + 0.085, RACK_Y0 / 2 - 0.0, HALF + 0.03]} />
        <StandardMaterial base_color={P.rail} perceptual_roughness={0.4} metallic={0.8} />
      </Mesh3d>
      {Array.from({ length: CLOUD }, (_, i) => {
        const at = T.hundred + 0.9 + (i / CLOUD) * 0.3;
        const k = out3(ramp(t, at, 0.3));
        const raw = 1 - ramp(t, T.cloud + (i / CLOUD) * 0.45, 0.2); // plain cardboard until "$18" makes it a server
        if (k <= 0.005) return null;
        const p = serverPos(i);
        const keep = keepShare(i, CLOUD, CLOUD_KEEP) * Math.max(cloudLit, shine); // only what AWS keeps, never the whole rack
        const wave = life(t, T.renting + Math.floor(i / RACK.cols) * 0.06, 0.25, 0.08); // an LED cascade up the rack on "renting"
        return <Server key={i} name={`server-${i}`} pos={[p[0], p[1], p[2] + (1 - k) * 1.6]} lit={k * (1 - raw) * (1 + 2.2 * wave)} keep={keep} raw={raw} blink={t > T.year ? 1 : 0.4} />;
      })}
      <Conveyor t={t} />
      <Columns t={t} k={toCols} />
    </>
  );
}

/** "Shipping alone cost $103B": a belt in front of the pallet runs parcels out of the frame. */
function Conveyor({ t }: { t: number }) {
  const on = Math.min(ramp(t, w("ship", "expensive") - 0.1, 0.4), 1 - ramp(t, B("shopkeep") + 0.2, 0.5));
  if (on <= 0.005) return null;
  const Z = 1.55, X0 = PAL.x - 4.2, X1 = PAL.x + 2.2;
  const speed = 1.6;
  return (
    <>
      <Mesh3d name="belt" transform={Transform.fromXyz((X0 + X1) / 2, 0.16 * on, Z)}>
        <Cuboid half_size={[(X1 - X0) / 2, 0.06, 0.32]} />
        <StandardMaterial base_color="#1B2A24" perceptual_roughness={0.75} />
      </Mesh3d>
      {Array.from({ length: 8 }, (_, i) => {
        const x = X1 - ((t * speed + i * 0.8) % (X1 - X0));
        const edge = Math.min(ramp(x, X0, 0.4), ramp(X1 - x, 0, 0.4));
        return <Parcel key={i} name={`belt-box-${i}`} pos={[x, 0.22 + HALF * 0.8 * on, Z]} s={0.8 * on * edge} spin={i * 0.7} />;
      })}
    </>
  );
}

/** The two lime amounts as columns of cubes ($1 a cube): shopping 4.79 against AWS 6.36. */
function Columns({ t, k }: { t: number; k: number }) {
  const fade = 1 - ramp(t, B("point") - 0.1, 0.4);
  if (k <= 0.005 || fade <= 0) return null;
  const cols = [
    { id: "shop", x: COL.shop, v: SHOP_KEEP, color: P.card },
    { id: "cloud", x: COL.cloud, v: CLOUD_KEEP, color: P.metal },
  ];
  return (
    <>
      {cols.map((c) => {
        const h = c.v * U * k;
        const big = c.id === "cloud" ? life(t, T.share + 0.05, 1.6, 0.25) : 0;
        return (
          // a unit mesh scaled to height: raea keeps a mesh's first-frame geometry in a sequential render
          <Mesh3d key={c.id} name={`col-${c.id}`} transform={Transform.fromXyz(c.x, 0.06 + h / 2, 0).withScale([fade, Math.max(0.005, h), fade])}>
            <Cuboid half_size={[HALF, 0.5, HALF]} />
            <StandardMaterial base_color={hexMix(c.color, P.lime, 0.75)} perceptual_roughness={0.35} metallic={0.2} emissive={glow(P.lime, 0.8 + 1.2 * big)} />
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
const display = (size: number, color = P.ink): React.CSSProperties => ({ fontFamily: "Bricolage", fontWeight: 800, fontSize: size, lineHeight: 0.94, letterSpacing: "-0.01em", textTransform: "uppercase", color, textShadow: "0 4px 0 rgba(0,0,0,0.45)" });
const mono = (size: number, color = P.ink): React.CSSProperties => ({ fontFamily: "JBMono", fontWeight: 700, fontSize: size, letterSpacing: "0.12em", textTransform: "uppercase", color });
const abs = (left: number, top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left, top, ...extra });
const clampX = (x: number, half: number) => Math.min(SAFE.right - half, Math.max(SAFE.left + half, x));
type Cam = ReturnType<typeof cameraAt>;

/** A figure pinned above a point of the world: amount (Display) over its name (Mono). */
function Pin({ t, cam, at, until, world, value, label, color, size = 92, width = 360, dx = 0 }: { t: number; cam: Cam; at: number; until: number; world: V3; value: string; label: string; color: string; size?: number; width?: number; dx?: number }) {
  const o = Math.min(ramp(t, at, 0.18), 1 - ramp(t, until, 0.25));
  if (o <= 0) return null;
  const [px, py] = project(cam, world);
  const top = Math.max(440, Math.min(1150 - size, py - size - 80));
  if (px < 40 || px > W - 40 || py < 300 || py > 1500) return null; // its anchor is out of the shot
  return (
    <div style={abs(clampX(px + dx, width / 2) - width / 2, top, { width, textAlign: "center", opacity: o, transform: `scale(${pop(t, at)})`, transformOrigin: "center bottom" })}>
      <div style={display(size, color)}>{value}</div>
      <div style={{ ...mono(25), marginTop: 8 }}>{label}</div>
    </div>
  );
}

function Overlay({ t, cam }: { t: number; cam: Cam }) {
  const hookEnd = BEATS.hook.end;
  const titleO = Math.max(1 - ramp(t, B("take") - 0.3, 0.25), ramp(t, DUR - 1.3, 0.35));
  const figO = life(t, w("hook", "$717B") - 0.05, T.never - 0.3 - w("hook", "$717B"), 0.2); // frame 0 has no figure, so neither has the last frame
  const hundredO = Math.min(ramp(t, w("take", "$100"), 0.2), 1 - ramp(t, B("share") - 0.2, 0.25));
  const pallet: V3 = [PAL.x, PAL_Y0 + 5 * U, 0];
  const rackTop: V3 = [RACK.x, RACK_Y0 + 9 * U + 0.2, 0];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <style>{FONTS}</style>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 720, backgroundImage: "linear-gradient(180deg, rgba(3,16,11,0.86) 0%, rgba(3,16,11,0.6) 45%, rgba(3,16,11,0) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 1110, width: W, height: 810, backgroundImage: "linear-gradient(180deg, rgba(3,16,11,0) 0%, rgba(3,16,11,0.72) 22%, rgba(3,16,11,0.8) 100%)" }} />

      <div style={abs(SAFE.left, SAFE.top, { display: "flex", alignItems: "center", gap: 16 })}>
        <div style={{ ...mono(26, P.bg), background: P.lime, padding: "9px 14px 8px 17px", borderRadius: 4, letterSpacing: "0.22em" }}>RECEIPTS</div>
        <div style={mono(26, P.lime)}>#007</div>
      </div>

      {titleO > 0.01 && (
        <div style={abs(SAFE.left, 324, { width: SAFE.right - SAFE.left, opacity: titleO })}>
          <div style={display(112)}>Where $100 at<br />Amazon goes</div>
          <div style={{ fontFamily: "Instrument", fontStyle: "italic", fontSize: 54, color: P.lime, marginTop: 14 }}>most of the profit isn’t in the boxes</div>
        </div>
      )}

      {/* hook: the $717B is the only figure */}
      {figO > 0.01 && (
        <div style={abs(SAFE.left, 650, { opacity: figO, transform: `scale(${0.85 + 0.15 * pop(t, w("hook", "$717B") - 0.05)})`, transformOrigin: "left center" })}>
          <div style={display(150, P.lime)}>$717B</div>
          <div style={{ ...mono(28), marginTop: 10 }}>Amazon's sales · 2025</div>
        </div>
      )}

      {hundredO > 0.01 && (
        <div style={abs(SAFE.left, 324, { opacity: hundredO })}>
          <div style={mono(30, P.muted)}>Amazon's sales · 2025</div>
          <div style={{ ...mono(26, P.muted), marginTop: 10 }}>1 cube = $1</div>
        </div>
      )}

      <Pin t={t} cam={cam} at={T.shop} until={B("ship") - 0.1} world={pallet} value="$82" label="shopping" color={P.amber} />
      <Pin t={t} cam={cam} at={T.cloud} until={B("ship") - 0.1} world={rackTop} value="$18" label="AWS" color={P.blue} />
      <Pin t={t} cam={cam} at={T.shipFig} until={B("shopkeep") - 0.1} world={pallet} value="$103B" label="shipping · 2025" color={P.ink} width={420} />
      <Pin t={t} cam={cam} at={T.shopKeep} until={T.share - 0.25} world={pallet} value="$4.79" label="shopping keeps" color={P.lime} />
      <Pin t={t} cam={cam} at={T.cloudKeep} until={T.share - 0.25} world={rackTop} value="$6.36" label="AWS keeps" color={P.lime} />
      <Pin t={t} cam={cam} at={T.share} until={B("year") + 0.2} world={[COL.cloud, CLOUD_KEEP * U + 0.75, 0]} value="57%" label="of operating profit" color={P.lime} size={130} width={460} />
      <Pin t={t} cam={cam} at={T.year} until={B("point") - 0.1} world={rackTop} value="$45.6B" label="AWS operating profit · 2025" color={P.lime} width={520} />

      {[{ x: COL.shop, v: SHOP_KEEP, name: "shopping" }, { x: COL.cloud, v: CLOUD_KEEP, name: "AWS" }].map((c) => {
        const o = Math.min(ramp(t, T.share + 0.3, 0.25), 1 - ramp(t, B("point") - 0.1, 0.3));
        if (o <= 0) return null;
        const [px, py] = project(cam, [c.x, c.v * U + 0.15, 0]);
        return <div key={c.name} style={abs(px - 90, py - 40, { width: 180, textAlign: "center", opacity: o, ...mono(24, P.lime) })}>{c.name}</div>;
      })}
      <Captions t={t} />
      <div style={abs(SAFE.left, 1372, { ...mono(26, P.muted), letterSpacing: "0.04em", width: SAFE.railX - SAFE.left, whiteSpace: "nowrap" })}>Amazon 10-K FY2025 (SEC) · per $100: our calc.</div>
    </AbsoluteFill>
  );
}

/** Captions from the transcript. Figures pinned in the world are NOT repeated here (one figure, one place). */
const HIDE = new Set(["hook:$717B", "shop:$82", "cloud:$18", "ship:$103B", "shopkeep:$4.79", "cloudkeep:$6.36", "share:57%", "year:$45.6B"]);
const PHRASES: Word[][] = (() => {
  const out: Word[][] = [];
  for (const b of TIMINGS.beats as any[]) {
    let cur: Word[] = [], len = 0;
    for (const x of b.words as Word[]) {
      if (HIDE.has(`${b.id}:${bare(x.w)}`)) {
        if (cur.length) { out.push(cur); cur = []; len = 0; } // a dropped figure always closes the phrase
        continue;
      }
      cur.push(x); len += x.w.length + 1;
      if (/[.,…:?]$/.test(x.w) && len > 9) { out.push(cur); cur = []; len = 0; }
    }
    if (cur.length) out.push(cur);
  }
  // a phrase longer than 26 characters splits into balanced parts (no orphan word on a line of its own)
  const chars = (p: Word[]) => p.reduce((n, x) => n + x.w.length + 1, 0);
  return out.flatMap((p) => {
    const n = Math.ceil(chars(p) / 27);
    if (n <= 1) return [p];
    const parts: Word[][] = [[]], target = chars(p) / n;
    let acc = 0;
    for (const x of p) {
      if (acc >= target * parts.length - x.w.length / 2 && parts.length < n && parts[parts.length - 1].length) parts.push([]);
      parts[parts.length - 1].push(x); acc += x.w.length + 1;
    }
    return parts;
  });
})();
const KEYWORDS = ["never", "keeps", "smaller", "cloud"];
function Captions({ t }: { t: number }) {
  const i = PHRASES.findIndex((p, k) => t >= p[0].start - 0.05 && t < (PHRASES[k + 1]?.[0].start ?? 1e9) - 0.05 && t < p[p.length - 1].end + 0.6 && t < DUR - 0.5);
  if (i < 0) return null;
  const p = PHRASES[i];
  return (
    <div style={abs(SAFE.left, 1185, { width: SAFE.railX - SAFE.left, display: "flex", flexWrap: "wrap", columnGap: 22, rowGap: 4 })}>
      {p.map((x, k) => {
        const on = t >= x.start - 0.04;
        const hot = KEYWORDS.includes(bare(x.w).toLowerCase());
        return <span key={k} style={{ ...display(84, on ? (hot ? P.lime : P.ink) : P.muted) }}>{x.w}</span>;
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ the frame */
function Amazon007() {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = cameraAt(t);
  const focus = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
  const sfx: [number, string, number][] = [[0, "boom", 0.35], ...SHOTS.slice(1, -1).map((s) => [s.t + 0.1, "whoosh", 0.3] as [number, string, number]),
    [T.never, "stamp", 0.45], [T.shop, "pop", 0.5], [T.cloud, "pop", 0.5], [T.shipFig, "pop", 0.45], [T.shopKeep, "stamp", 0.55], [T.cloudKeep, "stamp", 0.55],
    [T.share, "stamp", 0.6], [T.year, "pop", 0.5], [T.money, "stamp", 0.5], [T.box + 0.2, "pop", 0.4]];
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: (cam.fov * Math.PI) / 180 } }}>
        <DepthOfField focal_distance={focus} aperture_f_stops={2.8} />
      </Camera3d>
      <ToneMapping mode="tony" exposure={0.2} />
      <Bloom intensity={0.35} threshold={0.9} />
      <Shadows distance={110} firstCascade={40} mapSize={2048} />
      <AmbientLight brightness={140} color="#9FE0C0" />
      <DirectionalLight transform={Transform.fromXyz(cam.look[0] - 5, 12, 8).lookingAt([cam.look[0], 0, 0])} illuminance={5200} color="#FFF1D8" shadow_maps_enabled soft_shadow_size={2} />
      <SpotLight transform={Transform.fromXyz(1.5, 7, 4).lookingAt([0.2, 0.8, 0])} intensity={3800000} outer_angle={0.46} inner_angle={0.22} color="#FFF4E0" shadow_maps_enabled />
      <SpotLight transform={Transform.fromXyz(SPLIT_X, 14, 6).lookingAt([SPLIT_X, 0.6, 0])} intensity={9000000} outer_angle={0.62} inner_angle={0.3} color="#FFF4E0" shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(RACK.x + 1, 5, 3)} intensity={900000} color="#B8D4FF" range={14} />
      <Fog color={P.bg} near={focus * 1.2} far={focus * 2.8} />
      <Mesh3d name="floor" transform={Transform.fromXyz(10, -0.05, 0)}>
        <Cuboid half_size={[200, 0.05, 200]} />
        <StandardMaterial base_color={P.glow} perceptual_roughness={0.38} />
      </Mesh3d>
      {Array.from({ length: 20 }, (_, k) => (
        <Mesh3d key={`sx-${k}`} name={`seam-x-${k}`} transform={Transform.fromXyz(-12 + k * 2.5, 0.002, 0)}>
          <Cuboid half_size={[0.012, 0.002, 30]} />
          <StandardMaterial base_color="#1D5740" perceptual_roughness={0.6} />
        </Mesh3d>
      ))}
      {Array.from({ length: 12 }, (_, k) => (
        <Mesh3d key={`sz-${k}`} name={`seam-z-${k}`} transform={Transform.fromXyz(10, 0.002, -15 + k * 2.5)}>
          <Cuboid half_size={[60, 0.002, 0.012]} />
          <StandardMaterial base_color="#1D5740" perceptual_roughness={0.6} />
        </Mesh3d>
      ))}
      <Hero t={t} />
      <Split t={t} />

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

registerRoot(() => <Composition id="amazon" component={Amazon007} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />);
