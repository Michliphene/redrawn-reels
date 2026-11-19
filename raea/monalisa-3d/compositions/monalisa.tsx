/**
 * THE GETAWAY — CASE 003 "Stolen from the Louvre" (the Mona Lisa, Paris 1911 → Florence 1913), built in raea
 * (Bevy through raea/3d), rendered locally. Only the text is kept from the Remotion episode getaway-003-monalisa:
 * the voice (Clyde), its word timings and the sourced facts (public/episodes/getaway-003-monalisa/SOURCES.md).
 *
 * One world, three sets, one camera:
 *   gallery (x 0)    the Salon wall, the painting in its gilt frame on four iron pegs, the crowd in the torch pool.
 *                    It gets its glass on "glass.", is lifted off on "lifts", hidden under the coat on "hides", the
 *                    figure walks out on "walks"; the empty wall and its pegs; a rope on "closes"; the queue on "crowds".
 *   map   (x 40)     a paper map on the desk (make-map.py), France and Italy in file beige; the front pages pulse on
 *                    "front"; Paris; the train drives the APPROX. corridor Paris → Lyon → Turin → Florence on "takes".
 *   room  (x -30)    Peruggia's room under a bare bulb: the trunk opens on "trunk." with the painting inside.
 *
 * Rules kept: every figure on screen is in SOURCES.md's facts table; people are SYMBOLIC pawns, the route is APPROX.,
 * the sentence "ACCOUNTS VARY"; one figure on screen once (the 20,000 is pinned, not captioned); every cue is timed
 * from timings.json (`w(beat, word)`), never by eye. Safe area: nothing readable above y 250, below 1440, right of 930.
 */
import { AbsoluteFill, Audio, Composition, Img, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "raea";
import { Bloom, DepthOfField, Entity, ToneMapping } from "raea/3d";
import { Cuboid, Cylinder, Mesh3d, Plane3d, Sphere } from "raea/mesh";
import { Fog, StandardMaterial } from "raea/pbr";
import { AmbientLight, DirectionalLight, PointLight, Shadows, SpotLight } from "raea/light";
import { Quat, Transform } from "raea/transform";
import { Camera3d } from "raea/camera";
import { LinearRgba, Srgba } from "raea/color";
import TIMINGS from "./timings.json";

/* ------------------------------------------------------------------ house tokens (brand A "case file") */
const FPS = 30, W = 1080, H = 1920;
const P = { bg: "#070605", pool: "#1C1712", paper: "#E6D9BC", paperInk: "#1A1612", red: "#E0312B", stamp: "#C8231E", beige: "#C9B994", scenery: "#3A3127", muted: "#9A8E78", ink: "#F2EBDD", gilt: "#B8913F", wall: "#3A221B", iron: "#2C2926" };
const SAFE = { top: 250, bottom: 1440, left: 64, right: 930 };
const DUR = TIMINGS.duration + 0.6;

/* ------------------------------------------------------------------ time helpers: everything is a function of t */
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
const rnd = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const pop = (t: number, at: number) => Math.min(1.06, outBack(ramp(t, at, 0.3), 2));

type Word = { w: string; start: number; end: number };
const BEATS: Record<string, { start: number; end: number; words: Word[] }> = Object.fromEntries(TIMINGS.beats.map((b: any) => [b.id, b]));
const bare = (s: string) => s.replace(/[.,…:?!]+$/, "");
/** `w("theft", "lifts")` is when "lifts" is spoken in beat "theft" (trailing punctuation ignored). */
const w = (beat: string, word: string, n = 1) => {
  const ws = BEATS[beat].words.filter((x) => x.w === word || bare(x.w) === bare(word));
  if (!ws.length) throw new Error(`no word ${word} in ${beat}`);
  return (ws[n - 1] ?? ws[0]).start;
};
const B = (beat: string) => BEATS[beat].start;
const E = (beat: string) => BEATS[beat].end;

/* ------------------------------------------------------------------ stations */
const GX = 0, MX = 40, TX = -30;
const PW = 1.06, PH = 1.52;               // the panel, 53 × 77 cm in the ratio of the photo (607 × 865)
const PC: V3 = [GX, 2.55, -0.08];          // centre of the painting on the wall
const DOOR_X = GX + 5.6;
/** lon/lat → the table, the same projection as make-map.py (equirectangular, x × cos 46.5°, 1 unit = 1° of latitude). */
const MAP = { lon0: -10, lon1: 20, lat0: 36, lat1: 57, kx: Math.cos((46.5 * Math.PI) / 180) };
const MW = (MAP.lon1 - MAP.lon0) * MAP.kx, MH = MAP.lat1 - MAP.lat0;
const geo = (lon: number, lat: number, y = 0.06): V3 => [MX + (lon - (MAP.lon0 + MAP.lon1) / 2) * MAP.kx, y, -(lat - (MAP.lat0 + MAP.lat1) / 2)];
const PARIS = [2.3522, 48.8566], LYON = [4.835, 45.764], TURIN = [7.686, 45.07], FLORENCE = [11.2558, 43.7696];
const ROUTE = [PARIS, LYON, TURIN, FLORENCE].map(([lo, la]) => geo(lo, la, 0.05));

/* ------------------------------------------------------------------ the story's clock */
const T = {
  glass: w("who", "glass."), lifts: w("theft", "lifts"), hides: w("theft", "hides"), walks: w("theft", "walks"), out: w("theft", "out."),
  closes: w("crowds", "closes"), reopens: w("crowds", "reopens,"), crowds: w("crowds", "crowds"), empty: w("crowds", "empty"),
  admired: w("twist", "Admired,"), notYet: w("twist", "Not"), isnt: w("twist", "isn't"),
  front: w("press", "front"), pressTheft: w("press", "theft"),
  police: w("suspects", "Police"), picasso: w("suspects", "Picasso."), cleared: w("suspects", "cleared."),
  trunkOpen: w("trunk", "trunk."), two: w("trunk", "two"), room: w("trunk", "room"),
  takes: w("florence", "takes"), florence: w("florence", "Florence"),
  dealer: w("caught", "dealer"), cops: w("caught", "police."), caught: w("caught", "Caught."),
  some: w("patriot", "some"), outFree: w("patriot", "out"),
  back: w("end", "back"), whole: w("end", "whole"), world: w("end", "world"),
};

/* ------------------------------------------------------------------ camera: shots, cuts, a slow drift */
type Shot = { t: number; pos: V3; look: V3; fov: number; cut?: boolean; dur?: number };
const shot = (t: number, target: V3, yaw: number, pitch: number, dist: number, fov: number, extra: Partial<Shot> = {}): Shot => {
  const y = (yaw * Math.PI) / 180, p = (pitch * Math.PI) / 180;
  return { t, look: target, fov, pos: [target[0] + dist * Math.sin(y) * Math.cos(p), target[1] + dist * Math.sin(p), target[2] + dist * Math.cos(y) * Math.cos(p)], ...extra };
};
const HERO = shot(0, [GX - 0.6, PC[1] - 0.35, 0], -14, 5, 9, 32);
const SHOTS: Shot[] = [
  HERO,
  shot(B("who") - 0.1, [GX + 0.2, 2.35, 0], -8, 4, 7.6, 30),
  shot(B("theft") - 0.05, [GX + 0.5, 1.55, 0.5], 20, 4, 9.6, 32, { cut: true }),
  shot(T.walks - 0.15, [GX + 3.2, 1.55, 0.4], 24, 6, 8.6, 32, { dur: 1.1 }),
  shot(B("unnoticed") - 0.1, [GX, 2.45, 0], -3, 2, 6.4, 30, { dur: 0.9 }),
  shot(B("crowds") - 0.1, [GX, 1.9, 1.2], 9, 9, 11.5, 32),
  shot(B("twist") - 0.05, [GX + 0.3, 2.45, 0], -16, 4, 7.2, 30, { cut: true }),
  shot(B("press") - 0.15, geo(5.5, 47.2, 0), -4, 56, 31, 32, { dur: 1.2 }),
  shot(B("suspects") - 0.1, geo(2.6, 50.3, 0), 8, 54, 14, 30),
  shot(B("trunk") - 0.05, [TX, 0.62, 0.1], 14, 24, 5.6, 32, { cut: true }),
  shot(B("florence") - 0.05, geo(6.6, 46.0, 0), -6, 58, 25, 32, { cut: true }),
  shot(B("caught") - 0.1, geo(11.1, 43.6, 0), 10, 46, 7.5, 30),
  shot(B("patriot") - 0.1, geo(11.2, 43.5, 0), -10, 52, 10, 30),
  { ...HERO, t: B("end") - 0.05, cut: true },
];
const SHAKES: [number, number][] = [[T.lifts, 6], [T.picasso, 5], [T.cleared, 4], [T.caught, 8]];
function cameraAt(t: number) {
  let k = 0;
  for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].t) k = i;
  const prev = SHOTS[Math.max(0, k - 1)], cur = SHOTS[k];
  const e = k === 0 || cur.cut ? 1 : inOut3(ramp(t, cur.t, cur.dur ?? 1.0));
  let pos = lerp3(prev.pos, cur.pos, e), look = lerp3(prev.look, cur.look, e);
  const fov = lerp(prev.fov, cur.fov, e);
  // a slow drift that dies on the last second (the last frame meets frame 0) and starts from zero on frame 0
  const still = (1 - ramp(t, DUR - 1.2, 1.0)) * ramp(t, 0, 1.2);
  const a = (Math.sin(t * 0.42) * 0.035 + Math.sin(t * 0.17 + 1) * 0.02) * still;
  const dx = pos[0] - look[0], dz = pos[2] - look[2];
  pos = [look[0] + dx * Math.cos(a) - dz * Math.sin(a), pos[1] + Math.sin(t * 0.3) * 0.05 * still, look[2] + dx * Math.sin(a) + dz * Math.cos(a)];
  let sh = 0;
  for (const [at, amt] of SHAKES) sh += amt * 0.004 * (1 - ramp(t, at, 0.35)) * (t >= at ? 1 : 0);
  if (sh > 0) look = [look[0] + Math.sin(t * 91) * sh, look[1] + Math.cos(t * 77) * sh, look[2]];
  return { pos, look, fov };
}
type Cam = ReturnType<typeof cameraAt>;
/** World point → pixel of the 1080×1920 frame, through the same camera that renders it. */
function project(cam: Cam, p: V3): [number, number] {
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
const IMG = staticFile("img/monalisa.jpg");
const UPRIGHT = Quat.fromRotationX(Math.PI / 2); // a Plane3d (XZ, facing +Y) turned to face +Z

/** The painting in its gilt frame, facing +Z, centred on its own origin. `s` scales it, `alpha` < 1 is a memory. */
function Painting({ name, s = 1, alpha = 1, glass = 0 }: { name: string; s?: number; alpha?: number; glass?: number }) {
  const fw = 0.13, d = 0.07;
  const gilt = <StandardMaterial base_color={P.gilt} perceptual_roughness={0.32} metallic={0.85} />;
  const bars: [number, number, number, number][] = [
    [0, PH / 2 + fw / 2, PW / 2 + fw, fw / 2], [0, -PH / 2 - fw / 2, PW / 2 + fw, fw / 2],
    [-PW / 2 - fw / 2, 0, fw / 2, PH / 2], [PW / 2 + fw / 2, 0, fw / 2, PH / 2],
  ];
  if (s < 0.005) return null;
  return (
    <Entity transform={Transform.fromXyz(0, 0, 0).withScale([s, s, s])}>
      <Mesh3d name={`${name}-panel`} allowOverlap transform={{ translation: [0, 0, 0.01], rotation: UPRIGHT }}>
        <Plane3d half_size={[PW / 2, PH / 2]} />
        <StandardMaterial base_color={alpha < 1 ? Srgba.hex("#ffffff").with_alpha(alpha) : "#ffffff"} base_color_texture={IMG} perceptual_roughness={0.62} alpha_mode={alpha < 1 ? "Blend" : "Opaque"} />
      </Mesh3d>
      <Mesh3d name={`${name}-back`} allowOverlap transform={Transform.fromXyz(0, 0, -d / 2)}>
        <Cuboid half_size={[PW / 2, PH / 2, d / 2 - 0.005]} />
        <StandardMaterial base_color="#120D09" perceptual_roughness={0.8} />
      </Mesh3d>
      {alpha >= 1 && bars.map(([x, y, hx, hy], i) => (
        <Mesh3d key={i} name={`${name}-frame-${i}`} allowOverlap transform={Transform.fromXyz(x, y, 0.02)}>
          <Cuboid half_size={[hx, hy, d / 2 + 0.02]} />
          {gilt}
        </Mesh3d>
      ))}
      {glass > 0.01 && (
        <Mesh3d name={`${name}-glass`} allowOverlap transform={Transform.fromXyz(0, 0, 0.075 + (1 - glass) * 0.8)}>
          <Cuboid half_size={[PW / 2 + fw, PH / 2 + fw, 0.008]} />
          <StandardMaterial base_color={Srgba.hex("#CFE6F2").with_alpha(0.06 * glass)} alpha_mode="Blend" perceptual_roughness={0.05} metallic={0.1} />
        </Mesh3d>
      )}
    </Entity>
  );
}

/** A pawn of a person: symbolic, faceless, the same for everyone. */
function Figure({ name, pos, s = 1, color = "#14100D", turn = 0, bulk = 1 }: { name: string; pos: V3; s?: number; color?: string; turn?: number; bulk?: number }) {
  if (s < 0.005) return null;
  const mat = <StandardMaterial base_color={color} perceptual_roughness={0.7} />;
  return (
    <Entity transform={Transform.fromXyz(pos[0], pos[1], pos[2]).withRotation(Quat.fromEuler("XYZ", 0, turn, 0)).withScale([s, s, s])}>
      <Mesh3d name={`${name}-coat`} allowOverlap transform={Transform.fromXyz(0, 0.62, 0).withScale([bulk, 1, bulk])}>
        <Cylinder radius={0.24} half_height={0.62} />
        {mat}
      </Mesh3d>
      <Mesh3d name={`${name}-shoulders`} allowOverlap transform={Transform.fromXyz(0, 1.24, 0).withScale([1.15 * bulk, 0.55, 1 * bulk])}>
        <Sphere radius={0.25} />
        {mat}
      </Mesh3d>
      <Mesh3d name={`${name}-head`} allowOverlap transform={Transform.fromXyz(0, 1.55, 0)}>
        <Sphere radius={0.15} />
        {mat}
      </Mesh3d>
      <Mesh3d name={`${name}-hat`} allowOverlap transform={Transform.fromXyz(0, 1.66, 0)}>
        <Cylinder radius={0.2} half_height={0.015} />
        {mat}
      </Mesh3d>
    </Entity>
  );
}

/** The crowd in front of the wall: who is there, where they stand, when they come and go. */
function crowdAt(t: number): { pos: V3; s: number; turn: number }[] {
  const out: { pos: V3; s: number; turn: number }[] = [];
  const spot = (i: number, n: number, z0: number, depth: number): V3 => [GX + (i / Math.max(1, n - 1) - 0.5) * 5.4 + (rnd(i) - 0.5) * 0.5, 0, z0 + rnd(i + 40) * depth];
  // hook and end: twelve people admire her (fact 1 is about today; the set shows a full room)
  const endShown = t >= B("end") - 0.05;
  const hookN = t < B("who") ? 1 - ramp(t, B("who") - 0.3, 0.3) : endShown ? out3(ramp(t, T.whole - 0.05, 0.5)) : 0;
  for (let i = 0; i < 12; i++) if (hookN > 0.01) out.push({ pos: spot(i, 12, 1.5, 2.4), s: hookN, turn: (rnd(i + 9) - 0.5) * 0.5 });
  // crowds: sixteen line up in front of the empty wall
  if (t >= T.crowds - 0.1 && t < B("twist") - 0.05) {
    for (let i = 0; i < 16; i++) {
      const row = i % 2, col = Math.floor(i / 2);
      const k = out3(ramp(t, T.crowds + i * 0.06, 0.9));
      const target: V3 = [GX + (col / 7 - 0.5) * 5.6 + row * 0.3, 0, 1.3 + row * 0.9];
      out.push({ pos: [target[0], 0, lerp(7.5, target[2], k)], s: Math.min(1, k * 3), turn: 0 });
    }
  }
  // twist: only three admirers in 1911 (symbolic)
  if (t >= T.admired - 0.1 && t < B("press") + 0.6) {
    for (let i = 0; i < 3; i++) out.push({ pos: [GX - 1.6 + i * 1.5 + (rnd(i + 3) - 0.5) * 0.4, 0, 1.6 + rnd(i + 7) * 0.8], s: out3(ramp(t, T.admired + i * 0.12, 0.4)), turn: (rnd(i) - 0.5) * 0.6 });
  }
  return out;
}

function Gallery({ t }: { t: number }) {
  // painting state ------------------------------------------------------------------
  const onWallBefore = t < T.lifts;
  const lift = out3(ramp(t, T.lifts, 0.6));
  const hide = inOut3(ramp(t, T.hides, 0.9));
  const thiefAt = thiefPos(t);
  let ppos: V3 = PC, pscale = 1, palpha = 1, prot = 0;
  if (!onWallBefore && t < B("unnoticed")) {
    const lifted: V3 = [PC[0], PC[1] + 0.22, PC[2] + 0.7];
    const chest: V3 = [thiefAt[0], 1.0, thiefAt[2] + 0.1];
    ppos = hide > 0 ? lerp3(lifted, chest, hide) : lerp3(PC, lifted, lift);
    pscale = 1 - 0.85 * hide;
    prot = -0.25 * lift + 0.25 * hide;
    if (hide >= 1) pscale = 0;
  } else if (t >= B("unnoticed") && t < B("twist") - 0.05) pscale = 0;
  else if (t >= B("twist") - 0.05 && t < B("press") + 0.8) { palpha = 0.55 + 0.45 * (1 - ramp(t, B("twist"), 0.4)) * 0; pscale = out3(ramp(t, B("twist") - 0.05, 0.5)); }
  const glass = t < T.lifts ? out3(ramp(t, T.glass, 0.55)) * (t > B("who") ? 1 : 0) : 0;
  const glassAfter = t >= B("end") - 0.05 ? 1 : glass; // she goes back behind her glass
  const rope = Math.min(out3(ramp(t, T.closes, 0.5)), 1 - ramp(t, T.reopens, 0.4));
  const thiefS = t >= B("theft") - 0.05 && t < B("unnoticed") ? Math.min(out3(ramp(t, B("theft"), 0.4)), 1 - ramp(t, T.out + 0.45, 0.3)) : 0;
  return (
    <>
      <Mesh3d name="wall" transform={Transform.fromXyz(GX, 3.2, -0.3)}>
        <Cuboid half_size={[10, 3.2, 0.15]} />
        <StandardMaterial base_color={P.wall} perceptual_roughness={0.85} />
      </Mesh3d>
      <Mesh3d name="dado" transform={Transform.fromXyz(GX, 0.45, -0.12)}>
        <Cuboid half_size={[10, 0.45, 0.04]} />
        <StandardMaterial base_color="#1E130F" perceptual_roughness={0.6} />
      </Mesh3d>
      <Mesh3d name="cornice" transform={Transform.fromXyz(GX, 5.3, -0.1)}>
        <Cuboid half_size={[10, 0.06, 0.05]} />
        <StandardMaterial base_color={P.gilt} perceptual_roughness={0.4} metallic={0.7} />
      </Mesh3d>
      <Mesh3d name="doorway" transform={Transform.fromXyz(DOOR_X, 1.25, -0.13)}>
        <Cuboid half_size={[0.62, 1.25, 0.02]} />
        <StandardMaterial base_color="#3A2C1E" emissive={glow("#E9C88F", 0.55)} perceptual_roughness={0.9} />
      </Mesh3d>
      {/* the patch of wall she covered, and the four iron pegs she hung on */}
      <Mesh3d name="ghost-patch" transform={Transform.fromXyz(PC[0], PC[1], -0.145)}>
        <Cuboid half_size={[PW / 2 + 0.1, PH / 2 + 0.1, 0.002]} />
        <StandardMaterial base_color="#4A2C23" perceptual_roughness={0.9} />
      </Mesh3d>
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sy], i) => (
        <Mesh3d key={i} name={`peg-${i}`} transform={Transform.fromXyz(PC[0] + sx * (PW / 2 - 0.12), PC[1] + sy * (PH / 2 + 0.02) - (sy > 0 ? 0.1 : -0.04), -0.08).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}>
          <Cylinder radius={0.03} half_height={0.08} />
          <StandardMaterial base_color={P.iron} perceptual_roughness={0.45} metallic={0.9} />
        </Mesh3d>
      ))}
      <Entity transform={Transform.fromXyz(ppos[0], ppos[1], ppos[2] + 0.04).withRotation(Quat.fromEuler("XYZ", prot, 0, 0))}>
        <Painting name="mona" s={pscale} alpha={palpha} glass={glassAfter} />
      </Entity>
      {/* the rope across the closed gallery */}
      {rope > 0.01 && (
        <>
          {[-2.6, 2.6].map((x, i) => (
            <Mesh3d key={i} name={`post-${i}`} transform={Transform.fromXyz(GX + x, 0.5 * rope, 1.1)}>
              <Cylinder radius={0.05} half_height={0.5 * rope} />
              <StandardMaterial base_color={P.gilt} metallic={0.85} perceptual_roughness={0.3} />
            </Mesh3d>
          ))}
          <Mesh3d name="rope" transform={Transform.fromXyz(GX, 0.88 * rope, 1.1).withRotation(Quat.fromEuler("XYZ", 0, 0, Math.PI / 2))}>
            <Cylinder radius={0.035} half_height={2.6} />
            <StandardMaterial base_color={P.red} perceptual_roughness={0.6} emissive={glow(P.red, 0.4)} />
          </Mesh3d>
        </>
      )}
      <Figure name="thief" pos={thiefAt} s={thiefS} turn={thiefTurn(t)} bulk={1 + 0.12 * hide} color="#4A3526" />
      {crowdAt(t).map((c, i) => <Figure key={i} name={`crowd-${i}`} pos={c.pos} s={c.s} turn={c.turn} />)}
    </>
  );
}
function thiefPos(t: number): V3 {
  const start: V3 = [GX + 0.85, 0, 0.75];
  const a = inOut3(ramp(t, T.walks, 0.9));
  const b = inOut3(ramp(t, T.walks + 0.9, 0.55));
  const p = lerp3(start, [DOOR_X, 0, 0.6], a);
  return lerp3(p, [DOOR_X, 0, -0.25], b);
}
const thiefTurn = (t: number) => (t < T.walks ? 0.6 : lerp(Math.PI / 2, Math.PI, ramp(t, T.walks + 0.8, 0.3)));

/** The paper map on the desk, the front pages, the corridor and the train, the pins and the pawns. */
function MapTable({ t }: { t: number }) {
  const pulse = life(t, T.front - 0.1, E("press") - T.front + 0.1, 0.2) * (0.35 + 0.25 * Math.sin((t - T.front) * 9));
  const route = ramp(t, T.takes, 2.2);
  const routeOn = t >= T.takes && t < B("caught") + 0.3 ? 1 - ramp(t, B("caught"), 0.3) : 0;
  return (
    <>
      <Mesh3d name="map-board" transform={Transform.fromXyz(MX, 0.01, 0)}>
        <Cuboid half_size={[MW / 2 + 0.35, 0.01, MH / 2 + 0.35]} />
        <StandardMaterial base_color="#0E0B08" perceptual_roughness={0.7} />
      </Mesh3d>
      <Mesh3d name="map" allowOverlap transform={Transform.fromXyz(MX, 0.025, 0)}>
        <Plane3d half_size={[MW / 2, MH / 2]} />
        <StandardMaterial base_color="#ffffff" base_color_texture={staticFile("map.png")} perceptual_roughness={0.8} />
      </Mesh3d>
      {pulse > 0.01 && (
        <Mesh3d name="press-pulse" allowOverlap transform={Transform.fromXyz(MX, 0.035, 0)}>
          <Plane3d half_size={[MW / 2, MH / 2]} />
          <StandardMaterial base_color={Srgba.hex("#ffffff").with_alpha(pulse)} base_color_texture={staticFile("press.png")} alpha_mode="Blend" unlit />
        </Mesh3d>
      )}
      {routeOn > 0.01 && <Route k={route} fade={routeOn} />}
      <Train t={t} />
      <Pin name="pin-paris" at={geo(PARIS[0], PARIS[1])} s={pinScale(t, "paris")} />
      <Pin name="pin-florence" at={geo(FLORENCE[0], FLORENCE[1])} s={pinScale(t, "florence")} />
      {/* the offer: she stands on the dealer's table in Florence */}
      {(() => {
        const s = t >= T.dealer && t < E("patriot") + 0.2 ? Math.min(out3(ramp(t, T.dealer, 0.4)), 1 - ramp(t, E("patriot"), 0.2)) : 0;
        const at = geo(FLORENCE[0] + 0.25, FLORENCE[1] + 0.18, 0);
        return s > 0.01 && (
          <Entity transform={Transform.fromXyz(at[0], 0.32 * s + 0.04, at[2]).withRotation(Quat.fromEuler("XYZ", -0.12, 0.2, 0))}>
            <Painting name="offer" s={0.36 * s} />
          </Entity>
        );
      })()}
      {/* police: three symbolic pawns walk up to Florence */}
      {[0, 1, 2].map((i) => {
        const k = out3(ramp(t, T.cops - 0.1 + i * 0.08, 0.7));
        const s = t >= T.cops - 0.15 && t < E("caught") + 0.25 ? Math.min(k * 3, 1 - ramp(t, E("caught"), 0.25)) : 0;
        const end = geo(FLORENCE[0] - 0.7 + i * 0.7, FLORENCE[1] - 0.75, 0);
        return <Figure key={i} name={`cop-${i}`} pos={[end[0], 0.03, lerp(end[2] + 2.0, end[2], k)]} s={0.36 * s} color="#1B2433" turn={Math.PI} />;
      })}
    </>
  );
}
function pinScale(t: number, which: "paris" | "florence") {
  if (which === "paris") {
    const a = t >= T.police - 0.1 && t < B("trunk") ? out3(ramp(t, T.police, 0.35)) : 0;
    const b = t >= B("florence") - 0.05 && t < B("caught") + 0.3 ? 1 - ramp(t, B("caught"), 0.3) : 0;
    return Math.max(a, b);
  }
  return t >= T.florence - 0.1 && t < E("patriot") + 0.2 ? Math.min(outBack(ramp(t, T.florence, 0.35), 2), 1 - ramp(t, E("patriot"), 0.2)) : 0;
}
function Pin({ name, at, s }: { name: string; at: V3; s: number }) {
  if (s < 0.01) return null;
  return (
    <Entity transform={Transform.fromXyz(at[0], 0.03, at[2]).withScale([s, s, s])}>
      <Mesh3d name={`${name}-stem`} allowOverlap transform={Transform.fromXyz(0, 0.35, 0)}>
        <Cylinder radius={0.025} half_height={0.35} />
        <StandardMaterial base_color="#CFC6B4" metallic={0.8} perceptual_roughness={0.3} />
      </Mesh3d>
      <Mesh3d name={`${name}-head`} allowOverlap transform={Transform.fromXyz(0, 0.74, 0)}>
        <Sphere radius={0.14} />
        <StandardMaterial base_color={P.red} perceptual_roughness={0.35} emissive={glow(P.red, 0.8)} />
      </Mesh3d>
      <Mesh3d name={`${name}-ring`} allowOverlap transform={Transform.fromXyz(0, 0.012, 0)}>
        <Cylinder radius={0.22} half_height={0.008} />
        <StandardMaterial base_color={P.red} emissive={glow(P.red, 0.6)} />
      </Mesh3d>
    </Entity>
  );
}
/** Arc length along ROUTE → point and heading. */
const SEG = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i][0], p[2] - ROUTE[i][2]));
const LEN = SEG.reduce((s, x) => s + x, 0);
function along(d: number): { p: V3; yaw: number } {
  let rest = Math.max(0, Math.min(LEN, d));
  for (let i = 0; i < SEG.length; i++) {
    if (rest <= SEG[i] || i === SEG.length - 1) {
      const a = ROUTE[i], b = ROUTE[i + 1], k = SEG[i] ? Math.min(1, rest / SEG[i]) : 0;
      return { p: lerp3(a, b, k), yaw: Math.atan2(-(b[2] - a[2]), b[0] - a[0]) };
    }
    rest -= SEG[i];
  }
  return { p: ROUTE[0], yaw: 0 };
}
function Route({ k, fade }: { k: number; fade: number }) {
  const dash = 0.32, gap = 0.2, upto = LEN * k;
  const n = Math.floor(upto / (dash + gap));
  return (
    <>
      {Array.from({ length: n + 1 }, (_, i) => {
        const d0 = i * (dash + gap), d1 = Math.min(upto, d0 + dash);
        if (d1 - d0 < 0.02) return null;
        const a = along(d0), b = along(d1);
        const c = lerp3(a.p, b.p, 0.5);
        const len = Math.hypot(b.p[0] - a.p[0], b.p[2] - a.p[2]);
        return (
          <Mesh3d key={i} name={`route-${i}`} allowOverlap transform={Transform.fromXyz(c[0], 0.05, c[2]).withRotation(Quat.fromEuler("XYZ", 0, Math.atan2(-(b.p[2] - a.p[2]), b.p[0] - a.p[0]), 0))}>
            <Cuboid half_size={[len / 2, 0.012, 0.05 * fade]} />
            <StandardMaterial base_color={P.red} emissive={glow(P.red, 1.4)} perceptual_roughness={0.5} />
          </Mesh3d>
        );
      })}
    </>
  );
}
/** A small steam train (loco + one carriage) driving the corridor on "takes". */
function Train({ t }: { t: number }) {
  const s = t >= T.takes - 0.1 && t < B("caught") + 0.3 ? Math.min(out3(ramp(t, T.takes - 0.1, 0.3)), 1 - ramp(t, B("caught"), 0.3)) : 0;
  if (s < 0.01) return null;
  const d = inOut3(ramp(t, T.takes, 2.6)) * LEN;
  const loco = along(d), car = along(d - 0.95);
  const dark = <StandardMaterial base_color="#16110D" perceptual_roughness={0.45} metallic={0.5} />;
  return (
    <>
      <Entity transform={Transform.fromXyz(loco.p[0], 0.05, loco.p[2]).withRotation(Quat.fromEuler("XYZ", 0, loco.yaw, 0)).withScale([s, s, s])}>
        <Mesh3d name="loco-cab" allowOverlap transform={Transform.fromXyz(-0.22, 0.3, 0)}>
          <Cuboid half_size={[0.16, 0.22, 0.2]} />
          {dark}
        </Mesh3d>
        <Mesh3d name="loco-boiler" allowOverlap transform={Transform.fromXyz(0.18, 0.22, 0).withRotation(Quat.fromEuler("XYZ", 0, 0, Math.PI / 2))}>
          <Cylinder radius={0.15} half_height={0.26} />
          {dark}
        </Mesh3d>
        <Mesh3d name="loco-stack" allowOverlap transform={Transform.fromXyz(0.33, 0.44, 0)}>
          <Cylinder radius={0.05} half_height={0.09} />
          {dark}
        </Mesh3d>
        <Mesh3d name="loco-band" allowOverlap transform={Transform.fromXyz(0.02, 0.22, 0).withRotation(Quat.fromEuler("XYZ", 0, 0, Math.PI / 2))}>
          <Cylinder radius={0.155} half_height={0.025} />
          <StandardMaterial base_color={P.red} emissive={glow(P.red, 0.6)} />
        </Mesh3d>
        <Mesh3d name="loco-lamp" allowOverlap transform={Transform.fromXyz(0.45, 0.24, 0)}>
          <Sphere radius={0.045} />
          <StandardMaterial base_color="#FFE7B0" emissive={glow("#FFE7B0", 6)} />
        </Mesh3d>
      </Entity>
      {d > 0.6 && (
        <Entity transform={Transform.fromXyz(car.p[0], 0.05, car.p[2]).withRotation(Quat.fromEuler("XYZ", 0, car.yaw, 0)).withScale([s, s, s])}>
          <Mesh3d name="carriage" allowOverlap transform={Transform.fromXyz(0, 0.24, 0)}>
            <Cuboid half_size={[0.34, 0.17, 0.18]} />
            <StandardMaterial base_color="#3B2A1C" perceptual_roughness={0.6} />
          </Mesh3d>
          <Mesh3d name="carriage-windows" allowOverlap transform={Transform.fromXyz(0, 0.28, 0)}>
            <Cuboid half_size={[0.28, 0.05, 0.182]} />
            <StandardMaterial base_color="#FFE0A0" emissive={glow("#FFE0A0", 1.5)} />
          </Mesh3d>
        </Entity>
      )}
    </>
  );
}

/** Peruggia's room in Paris: boards, a bare wall, a bulb, the trunk. The lid opens on "trunk.". */
function Room({ t }: { t: number }) {
  const open = inOut3(ramp(t, T.trunkOpen, 0.8));
  const lidAng = -1.85 * open;
  const hinge: V3 = [TX, 0.72, -0.5];
  const off = [0, 0.05, 0.51];
  const lidC: V3 = [hinge[0], hinge[1] + off[1] * Math.cos(lidAng) - off[2] * Math.sin(lidAng), hinge[2] + off[1] * Math.sin(lidAng) + off[2] * Math.cos(lidAng)];
  const leather = <StandardMaterial base_color="#4A2D19" perceptual_roughness={0.55} />;
  const brass = <StandardMaterial base_color="#A88435" metallic={0.85} perceptual_roughness={0.35} />;
  return (
    <>
      <Mesh3d name="room-floor" transform={Transform.fromXyz(TX, 0.01, 0)}>
        <Cuboid half_size={[5, 0.01, 4]} />
        <StandardMaterial base_color="#2B1D12" perceptual_roughness={0.75} />
      </Mesh3d>
      {Array.from({ length: 14 }, (_, k) => (
        <Mesh3d key={k} name={`board-${k}`} transform={Transform.fromXyz(TX - 5 + k * 0.72, 0.021, 0)}>
          <Cuboid half_size={[0.008, 0.002, 4]} />
          <StandardMaterial base_color="#140D08" perceptual_roughness={0.8} />
        </Mesh3d>
      ))}
      <Mesh3d name="room-wall" transform={Transform.fromXyz(TX, 2, -1.4)}>
        <Cuboid half_size={[5, 2, 0.1]} />
        <StandardMaterial base_color="#3C3024" perceptual_roughness={0.9} />
      </Mesh3d>
      <Mesh3d name="bulb" transform={Transform.fromXyz(TX + 0.4, 2.55, 0.2)}>
        <Sphere radius={0.07} />
        <StandardMaterial base_color="#FFE3A6" emissive={glow("#FFE3A6", 14)} />
      </Mesh3d>
      <Mesh3d name="bulb-cord" transform={Transform.fromXyz(TX + 0.4, 3.3, 0.2)}>
        <Cylinder radius={0.008} half_height={0.7} />
        <StandardMaterial base_color="#111" />
      </Mesh3d>
      <Mesh3d name="trunk-body" transform={Transform.fromXyz(TX, 0.36, 0)}>
        <Cuboid half_size={[0.9, 0.36, 0.5]} />
        {leather}
      </Mesh3d>
      <Mesh3d name="trunk-inside" allowOverlap transform={Transform.fromXyz(TX, 0.715, 0)}>
        <Cuboid half_size={[0.84, 0.006, 0.44]} />
        <StandardMaterial base_color="#160E08" perceptual_roughness={0.9} />
      </Mesh3d>
      {[-0.55, 0.55].map((x, i) => (
        <Mesh3d key={i} name={`trunk-band-${i}`} allowOverlap transform={Transform.fromXyz(TX + x, 0.36, 0)}>
          <Cuboid half_size={[0.05, 0.365, 0.505]} />
          {brass}
        </Mesh3d>
      ))}
      {/* she lies inside, turned on her side to fit */}
      {open > 0.02 && (
        <Entity transform={Transform.fromXyz(TX, 0.735, 0.0).withRotation(Quat.fromEuler("XYZ", -Math.PI / 2, 0, Math.PI / 2))}>
          <Painting name="in-trunk" s={0.5} />
        </Entity>
      )}
      <Entity transform={Transform.fromXyz(lidC[0], lidC[1], lidC[2]).withRotation(Quat.fromEuler("XYZ", lidAng, 0, 0))}>
        <Mesh3d name="trunk-lid" allowOverlap transform={Transform.fromXyz(0, 0, 0)}>
          <Cuboid half_size={[0.92, 0.05, 0.51]} />
          {leather}
        </Mesh3d>
        {[-0.55, 0.55].map((x, i) => (
          <Mesh3d key={i} name={`lid-band-${i}`} allowOverlap transform={Transform.fromXyz(x, 0, 0)}>
            <Cuboid half_size={[0.05, 0.055, 0.515]} />
            {brass}
          </Mesh3d>
        ))}
      </Entity>
    </>
  );
}

/* ------------------------------------------------------------------ type: three voices from one left margin */
const FONTS = `
@font-face { font-family: "Bricolage"; src: url("${staticFile("fonts/BricolageGrotesque-latin.ttf")}"); font-weight: 200 800; }
@font-face { font-family: "Instrument"; src: url("${staticFile("fonts/InstrumentSerif-Italic-latin.ttf")}"); font-style: italic; }
@font-face { font-family: "Courier Prime"; src: url("${staticFile("fonts/CourierPrime-Regular-latin.ttf")}"); font-weight: 400; }
@font-face { font-family: "Courier Prime"; src: url("${staticFile("fonts/CourierPrime-Bold-latin.ttf")}"); font-weight: 700; }`;
const display = (size: number, color = P.ink): React.CSSProperties => ({ fontFamily: "Bricolage", fontWeight: 800, fontSize: size, lineHeight: 0.94, letterSpacing: "-0.01em", textTransform: "uppercase", color, textShadow: "0 4px 0 rgba(0,0,0,0.5)" });
const mono = (size: number, color = P.ink, weight = 700): React.CSSProperties => ({ fontFamily: "Courier Prime", fontWeight: weight, fontSize: size, letterSpacing: "0.06em", textTransform: "uppercase", color });
const whisper = (size: number, color = P.beige): React.CSSProperties => ({ fontFamily: "Instrument", fontStyle: "italic", fontSize: size, color, lineHeight: 1.05 });
const abs = (left: number, top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left, top, ...extra });
const clampX = (x: number, half: number) => Math.min(SAFE.right - half, Math.max(SAFE.left + half, x));

/** A typed paper tag pinned to a point of the world (places, labels, SYMBOLIC). */
function Tag({ cam, at, text, o, dy = -70, red = false, size = 30 }: { cam: Cam; at: V3; text: string; o: number; dy?: number; red?: boolean; size?: number }) {
  if (o <= 0.01) return null;
  const [px, py0] = project(cam, at);
  const py = Math.max(SAFE.top + 170 - dy, py0);
  const wdt = Math.min(SAFE.right - SAFE.left, text.length * size * 0.7 + 44);
  return (
    <div style={abs(clampX(px, wdt / 2) - wdt / 2, py + dy, { width: wdt, opacity: o, textAlign: "center" })}>
      <div style={{ ...mono(size, red ? P.paper : P.paperInk), display: "inline-block", background: red ? P.stamp : P.paper, padding: "6px 12px 4px", whiteSpace: "nowrap", boxShadow: "4px 5px 0 rgba(0,0,0,0.6)", transform: "rotate(-1.5deg)" }}>{text}</div>
    </div>
  );
}

/** A stamp: red border, red ink, tilted. */
const Stamp = ({ text, size, o, s = 1, rot = -6 }: { text: string; size: number; o: number; s?: number; rot?: number }) => (
  <div style={{ ...display(size, P.red), display: "inline-block", border: `${Math.max(4, size / 12)}px solid ${P.red}`, padding: `${size * 0.12}px ${size * 0.22}px ${size * 0.04}px`, transform: `rotate(${rot}deg) scale(${s})`, opacity: o, textShadow: "none", background: "rgba(7,6,5,0.35)" }}>{text}</div>
);

/** A typed paper document (published accounts, not an original). Characters appear at `cps`. */
function Ticket({ t, at, hold, head, sub, rows, big, bigAt, note, cps, top, width = 760, keyW = 230, rowSize = 32 }: { t: number; at: number; hold: number; head: string; sub: string; rows: [string, string][]; big?: string; bigAt?: number; note: string; cps: number; top: number; width?: number; keyW?: number; rowSize?: number }) {
  const o = life(t, at, hold, 0.2);
  if (o <= 0.01) return null;
  let budget = Math.floor((t - at) * cps);
  const typed = (s: string) => { const n = Math.max(0, Math.min(s.length, budget)); budget -= s.length; return s.slice(0, n); };
  return (
    <div style={abs(SAFE.left, top, { width, opacity: o, background: P.paper, padding: "26px 30px 22px", boxShadow: "8px 10px 0 rgba(0,0,0,0.6)", transform: `rotate(-1deg) translateY(${(1 - out3(ramp(t, at, 0.35))) * 40}px)` })}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `2px solid ${P.paperInk}`, paddingBottom: 8 }}>
        <span style={mono(34, P.paperInk)}>{head}</span>
        <span style={mono(22, "#5A4E3C", 400)}>{sub}</span>
      </div>
      {rows.map(([k, v], i) => (
        <div key={i} style={{ display: "flex", marginTop: 14 }}>
          <span style={{ ...mono(rowSize - 4, "#6B5D45", 400), width: keyW }}>{typed(k)}</span>
          <span style={mono(rowSize, P.paperInk)}>{typed(v)}</span>
        </div>
      ))}
      <div style={{ ...mono(19, "#6B5D45", 400), marginTop: 18, textTransform: "none", letterSpacing: "0.02em" }}>{note}</div>
      {big && bigAt !== undefined && t >= bigAt && (
        <div style={{ position: "absolute", right: 10, bottom: -62 }}><Stamp text={big} size={58} o={ramp(t, bigAt, 0.08)} s={1 + 0.4 * (1 - out3(ramp(t, bigAt, 0.25)))} /></div>
      )}
    </div>
  );
}

/** The verdict boxes: open on frame 0, ticked on the end. */
function Verdict({ t, o }: { t: number; o: number }) {
  if (o <= 0.01) return null;
  const opts = [
    { label: "CAUGHT", at: B("end") + 0.05 },
    { label: "RECOVERED", at: T.back },
    { label: "FAMOUS", at: T.world, note: "WORLDWIDE" },
  ];
  return (
    <div style={abs(SAFE.left, 1060, { opacity: o, display: "flex", gap: 30 })}>
      {opts.map((op, i) => {
        const on = t >= B("end") ? ramp(t, op.at, 0.12) : 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
            <div style={{ width: 40, height: 40, border: `4px solid ${P.paper}`, background: "rgba(7,6,5,0.5)", position: "relative" }}>
              {on > 0 && <div style={{ ...display(58, P.red), position: "absolute", left: 2, top: -16, opacity: on, textShadow: "none", transform: `scale(${1 + 0.5 * (1 - out3(ramp(t, op.at, 0.25)))})` }}>X</div>}
            </div>
            <span style={mono(32, on > 0 ? P.ink : P.paper)}>{op.label}</span>
            {op.note && on > 0 && <div style={{ position: "absolute", left: -6, top: -58 }}><Stamp text={op.note} size={30} o={on} rot={-4} /></div>}
          </div>
        );
      })}
    </div>
  );
}

/** The date line under the series bar: typed, it changes on the word. */
const DATES: [number, string][] = [
  [w("who", "Paris,"), "PARIS · 1911"], [w("theft", "August"), "21 AUG 1911"], [w("unnoticed", "day."), "22 AUG 1911"],
  [B("press"), "1911"], [T.two, "1913"], [w("florence", "December"), "DEC 1913"], [w("patriot", "He's"), "1914"],
];
function DateLine({ t }: { t: number }) {
  if (t < B("who") - 0.05 || t >= B("end") - 0.05) return null;
  let cur = DATES[0];
  for (const d of DATES) if (t >= d[0]) cur = d;
  const k = ramp(t, cur[0], 0.25);
  return (
    <div style={abs(SAFE.left, 330, { display: "flex", alignItems: "center", gap: 14 })}>
      <div style={{ width: 14, height: 14, background: P.red, borderRadius: 7 }} />
      <span style={{ ...mono(46, P.paper), opacity: 0.4 + 0.6 * k }}>{cur[1]}</span>
    </div>
  );
}

function Overlay({ t, cam, cover = false }: { t: number; cam: Cam; cover?: boolean }) {
  const hookEnd = E("hook");
  const titleO = Math.max(1 - ramp(t, hookEnd - 0.2, 0.25), ramp(t, B("end") + 0.15, 0.35));
  const figO = Math.min(life(t, 0.25, hookEnd - 0.25, 0.2), 1);
  const verdictO = Math.max(1 - ramp(t, hookEnd - 0.2, 0.25), ramp(t, B("end") - 0.05, 0.25));
  const paintingCredit = t < B("press") + 0.3 || t >= B("end") - 0.05 || (t >= B("trunk") && t < E("trunk"));
  const credit = t >= T.pressTheft && t < E("press") + 0.25 ? "Image: Puck, 18 Oct 1911 · Library of Congress"
    : t >= T.some - 0.1 && t < E("patriot") + 0.2 ? "Photo: Paris police, 1909 · public domain"
    : t >= B("florence") && t < E("patriot") ? "Route approximate · modern base map"
    : paintingCredit ? "Painting: Detroit Publishing Co. photo · LoC" : "";
  const peg = [PC[0] + PW / 2 - 0.12, PC[1] + PH / 2 - 0.08, -0.08] as V3;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <style>{FONTS}</style>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 760, backgroundImage: "linear-gradient(180deg, rgba(7,6,5,0.9) 0%, rgba(7,6,5,0.62) 42%, rgba(7,6,5,0) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 1060, width: W, height: 860, backgroundImage: "linear-gradient(180deg, rgba(7,6,5,0) 0%, rgba(7,6,5,0.74) 20%, rgba(7,6,5,0.86) 100%)" }} />

      {/* series bar, brand A: the typed beige tab + the red stamped case number */}
      <div style={abs(SAFE.left, SAFE.top - 4, { display: "flex", alignItems: "center", gap: 18 })}>
        <div style={{ background: P.paper, padding: "9px 18px 7px", transform: "rotate(-1.2deg)", boxShadow: "4px 5px 0 rgba(0,0,0,0.6)" }}>
          <span style={{ ...mono(28, P.paperInk), letterSpacing: "0.16em" }}>THE GETAWAY</span>
        </div>
        <div style={{ ...mono(26, P.stamp), border: `3px solid ${P.stamp}`, padding: "4px 10px 2px", transform: "rotate(-4deg)", background: "rgba(7,6,5,0.35)" }}>CASE 003</div>
      </div>

      {titleO > 0.01 && (
        <div style={abs(SAFE.left, 336, { width: SAFE.right - SAFE.left, opacity: titleO })}>
          <div style={display(108)}>Stolen from<br />the Louvre</div>
          <div style={{ ...whisper(50), marginTop: 14 }}>The Mona Lisa theft · Paris · 1911</div>
        </div>
      )}
      <DateLine t={t} />

      {/* hook: the 20,000 is pinned here, not captioned */}
      {figO > 0.01 && (
        <div style={abs(SAFE.left, 820, { opacity: figO, transform: `scale(${pop(t, 0.25)})`, transformOrigin: "left center" })}>
          <div style={display(150, P.paper)}>20,000</div>
          <div style={{ ...mono(30, P.beige), marginTop: 6 }}>visitors a day · today</div>
        </div>
      )}
      <Verdict t={t} o={verdictO} />

      {/* gallery labels */}
      <Tag cam={cam} at={[PC[0], PC[1] + PH / 2 + 0.25, 0]} text="HE FITTED HER GLASS CASE" o={life(t, T.glass - 0.1, E("who") - T.glass + 0.2, 0.2)} dy={-80} size={28} />
      <Tag cam={cam} at={[thiefPos(t)[0], 1.95, thiefPos(t)[2]]} text="THE THIEF · SYMBOLIC" o={life(t, T.walks, 1.3, 0.15)} dy={-70} size={26} />
      <Tag cam={cam} at={[PC[0], PC[1] + PH / 2 + 0.3, 0]} text="STOLEN · NOTICED A DAY LATER" o={life(t, w("unnoticed", "over"), E("unnoticed") - w("unnoticed", "over") + 0.1, 0.15)} dy={-90} red size={30} />
      <Tag cam={cam} at={[GX, 1.05, 1.1]} text="CLOSED · 1 WEEK" o={life(t, T.closes, T.reopens - T.closes + 0.2, 0.15)} dy={-110} red size={34} />
      <Tag cam={cam} at={peg} text="4 IRON PEGS" o={life(t, T.empty, E("crowds") - T.empty + 0.15, 0.15)} dy={-90} size={30} />
      <Tag cam={cam} at={[GX - 0.1, 1.95, 2.0]} text="1911 · NOT THE MOST VISITED · SYMBOLIC" o={life(t, T.admired + 0.3, E("twist") - T.admired - 0.2, 0.2)} dy={-60} size={22} />

      {/* twist callout */}
      {(() => {
        const o = life(t, T.isnt, E("twist") - T.isnt + 0.15, 0.2);
        if (o <= 0.01) return null;
        return (
          <div style={abs(SAFE.left, 830, { opacity: o, width: SAFE.right - SAFE.left, transform: `translateY(${(1 - out3(ramp(t, T.isnt, 0.3))) * 30}px)` })}>
            <div style={{ ...mono(28, P.beige) }}>In 1911</div>
            <div style={{ ...display(62, P.paper), marginTop: 6 }}>World's most<br />famous painting?</div>
            {t >= T.notYet && <div style={{ marginTop: 14, marginLeft: 330 }}><Stamp text="NOT YET" size={70} o={ramp(t, T.notYet, 0.08)} s={1 + 0.4 * (1 - out3(ramp(t, T.notYet, 0.25)))} /></div>}
          </div>
        );
      })()}

      {/* press: the Puck cartoon */}
      {(() => {
        const o = life(t, T.pressTheft - 0.05, E("press") - T.pressTheft + 0.2, 0.2);
        if (o <= 0.01) return null;
        return (
          <div style={abs(SAFE.left + 20, 560, { width: 780, opacity: o, background: P.paper, padding: 14, boxShadow: "8px 10px 0 rgba(0,0,0,0.6)", transform: `rotate(1.5deg) scale(${0.94 + 0.06 * out3(ramp(t, T.pressTheft, 0.4))})` })}>
            <Img src={staticFile("img/puck_louvre_1911.jpg")} style={{ width: 752, height: 488, objectFit: "cover", display: "block" }} />
            <div style={{ ...mono(22, P.paperInk, 400), marginTop: 10, textTransform: "none", letterSpacing: "0.01em" }}>"Daily scene in the Louvre" · Puck, New York · 18 Oct 1911</div>
          </div>
        );
      })()}

      {/* map tags */}
      <Tag cam={cam} at={geo(PARIS[0], PARIS[1], 0.9)} text="PARIS" o={pinScale(t, "paris") * (t < B("trunk") || t >= B("florence") ? 1 : 0)} dy={-80} size={30} />
      <Tag cam={cam} at={geo(FLORENCE[0], FLORENCE[1], 0.9)} text="FLORENCE" o={pinScale(t, "florence") * (1 - ramp(t, T.dealer - 0.2, 0.15))} dy={-80} size={30} />
      <Tag cam={cam} at={geo(1.6, 46.6, 0.1)} text="ROUTE · APPROX." o={life(t, T.takes + 0.6, E("florence") - T.takes - 0.3, 0.2)} dy={-20} size={24} />
      <Tag cam={cam} at={geo(FLORENCE[0] - 0.1, FLORENCE[1] - 0.2, 0.3)} text="POLICE · SYMBOLIC" o={life(t, T.cops + 0.1, E("caught") - T.cops - 0.2, 0.15)} dy={40} size={24} />

      {/* the two police files (reconstructions from published accounts) */}
      <Ticket t={t} at={T.police} hold={E("suspects") - T.police + 0.1} head="PARIS POLICE" sub="1911 · reconstruction" rows={[["ARRESTED", "G. APOLLINAIRE"], ["QUESTIONED", "P. PICASSO"]]} big="BOTH CLEARED" bigAt={T.cleared} note="From published accounts. Not an original document." cps={13} top={600} />
      <Ticket t={t} at={T.dealer} hold={T.caught - T.dealer - 0.1} head="FLORENCE" sub="Dec 1913 · reconstruction" rows={[["DEALER", "A. GERI"], ["BRINGS", "G. POGGI, UFFIZI"], ["THEN", "POLICE"]]} note="From published accounts. Not an original document." cps={30} top={590} keyW={170} rowSize={30} />
      {(() => {
        const o = life(t, T.caught, E("caught") - T.caught + 0.1, 0.06);
        if (o <= 0.01) return null;
        return (
          <div style={abs(SAFE.left, 560, { opacity: o })}>
            <Stamp text="ARRESTED" size={110} o={1} s={1 + 0.5 * (1 - out3(ramp(t, T.caught, 0.22)))} rot={-5} />
            <div style={{ ...mono(32, P.paper), marginTop: 18 }}>Florence · Dec 1913</div>
          </div>
        );
      })()}

      {/* the trunk */}
      <Tag cam={cam} at={[TX - 0.2, 1.0, -0.3]} text="HIS ROOM · PARIS" o={life(t, T.room, 1.4, 0.15)} dy={-170} size={30} />
      {(() => {
        const o = life(t, T.two, E("trunk") - T.two + 0.15, 0.12);
        if (o <= 0.01) return null;
        return <div style={abs(SAFE.left, 520, { opacity: o, transform: `scale(${pop(t, T.two)})`, transformOrigin: "left center" })}><div style={display(150, P.paper)}>28 months</div><div style={{ ...mono(28, P.beige), marginTop: 6 }}>in a trunk · Paris</div></div>;
      })()}

      {/* convicted: the police photo, printed on file paper */}
      {(() => {
        const o = life(t, T.some, E("patriot") - T.some + 0.1, 0.2);
        if (o <= 0.01) return null;
        return (
          <div style={abs(SAFE.left, 540, { width: 600, opacity: o, background: P.paper, padding: "20px 22px 18px", boxShadow: "8px 10px 0 rgba(0,0,0,0.6)", transform: `rotate(-1.5deg) translateY(${(1 - out3(ramp(t, T.some, 0.35))) * 40}px)` })}>
            <div style={display(64, P.paperInk)}>Convicted</div>
            <div style={{ ...mono(22, "#5A4E3C", 400), marginTop: 4 }}>Florence · June 1914</div>
            <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
              <Img src={staticFile("img/peruggia.jpg")} style={{ width: 200, height: 219, objectFit: "cover", display: "block" }} />
              <div>
                <div style={mono(28, P.paperInk)}>V. Peruggia</div>
                <div style={{ ...mono(22, P.paperInk, 400), marginTop: 10, textTransform: "none", letterSpacing: "0.01em", lineHeight: 1.25 }}>1 yr 15 days, cut to about 7 months.</div>
                <div style={{ ...mono(22, P.stamp), marginTop: 10 }}>Accounts vary.</div>
              </div>
            </div>
            {t >= T.outFree && <div style={{ position: "absolute", right: -18, bottom: -34 }}><Stamp text="OUT" size={78} o={ramp(t, T.outFree, 0.08)} s={1 + 0.4 * (1 - out3(ramp(t, T.outFree, 0.25)))} /></div>}
          </div>
        );
      })()}

      {!cover && <Captions t={t} />}
      {credit && <div style={abs(SAFE.left, 1404, { ...mono(19, P.muted, 400), textTransform: "none", letterSpacing: "0.02em", width: SAFE.right - SAFE.left })}>{credit}</div>}
    </AbsoluteFill>
  );
}

/** Captions from the transcript. The 20,000 is pinned in the hook, so it is not repeated here. */
const HIDE = new Set(["hook:20,000"]);
const PHRASES: Word[][] = (() => {
  const out: Word[][] = [];
  for (const b of TIMINGS.beats as any[]) {
    let cur: Word[] = [], len = 0;
    for (const x of (b.words as Word[]).filter((x) => !HIDE.has(`${b.id}:${x.w}`))) {
      if (cur.length && len + x.w.length > 19) { out.push(cur); cur = []; len = 0; }
      cur.push(x); len += x.w.length + 1;
      if (/[.,…:?]$/.test(x.w) && len > 9) { out.push(cur); cur = []; len = 0; }
    }
    if (cur.length) out.push(cur);
  }
  return out;
})();
const KEYWORDS = ["took", "walks", "nobody", "empty", "famous", "picasso", "trunk", "caught", "patriot", "whole", "world"];
function Captions({ t }: { t: number }) {
  const i = PHRASES.findIndex((p, k) => t >= p[0].start - 0.05 && t < (PHRASES[k + 1]?.[0].start ?? 1e9) - 0.05 && t < p[p.length - 1].end + 0.6);
  if (i < 0) return null;
  const p = PHRASES[i];
  return (
    <div style={abs(SAFE.left, 1190, { width: SAFE.right - SAFE.left, display: "flex", flexWrap: "wrap", columnGap: 22, rowGap: 4 })}>
      {p.map((x, k) => {
        const on = t >= x.start - 0.04;
        const hot = KEYWORDS.includes(bare(x.w).toLowerCase());
        return <span key={k} style={{ ...display(80, on ? (hot ? P.red : P.ink) : P.muted) }}>{x.w}</span>;
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ the frame */
function Monalisa003({ cover = false }: { cover?: boolean }) {
  const f = useCurrentFrame();
  const t = cover ? 2.9 : f / FPS;
  const cam = cameraAt(t);
  const focus = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
  const cuts = SHOTS.slice(1).map((s) => [s.t + 0.02, s.cut ? "boom" : "whoosh", s.cut ? 0.28 : 0.3] as [number, string, number]);
  const sfx: [number, string, number][] = [
    ...cuts, [T.glass, "pop", 0.4], [T.lifts, "rumble", 0.45], [T.walks, "whoosh", 0.35], [T.closes, "stamp", 0.4],
    [T.notYet, "stamp", 0.6], [T.front, "pop", 0.45], [T.cleared, "stamp", 0.55], [T.trunkOpen, "rumble", 0.5], [T.two, "pop", 0.45],
    [T.takes, "rumble", 0.4], [T.florence, "pop", 0.4], [T.caught, "stamp", 0.7], [T.outFree, "stamp", 0.55],
    [B("end") + 0.05, "pop", 0.4], [T.back, "pop", 0.4], [T.world, "stamp", 0.55],
  ];
  const atMap = Math.abs(cam.look[0] - MX) < 15, atRoom = Math.abs(cam.look[0] - TX) < 10;
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: (cam.fov * Math.PI) / 180 } }}>
        <DepthOfField focal_distance={focus} aperture_f_stops={atMap ? 5.6 : 2.4} />
      </Camera3d>
      <ToneMapping mode="tony" exposure={0.15} />
      <Bloom intensity={0.3} threshold={0.95} />
      <Shadows distance={90} firstCascade={30} mapSize={2048} />
      <AmbientLight brightness={55} color="#C9A77A" />
      <DirectionalLight transform={Transform.fromXyz(cam.look[0] - 4, 14, 9).lookingAt([cam.look[0], 0, 0])} illuminance={atMap ? 2600 : 700} color="#FFE9C8" shadow_maps_enabled soft_shadow_size={2} />
      {/* the torch pool on the painting */}
      <SpotLight transform={Transform.fromXyz(GX + 1.2, 6.2, 5.5).lookingAt([PC[0], PC[1] - 0.4, 0])} intensity={7500000} outer_angle={0.42} inner_angle={0.2} color="#FFE2B0" shadow_maps_enabled />
      <SpotLight transform={Transform.fromXyz(GX - 3, 7, 7).lookingAt([GX, 0.5, 1.8])} intensity={1400000} outer_angle={0.7} inner_angle={0.35} color="#C7B08A" />
      <PointLight transform={Transform.fromXyz(DOOR_X, 1.6, 0.5)} intensity={180000} color="#E9C88F" range={6} />
      {/* the desk lamp over the map */}
      <SpotLight transform={Transform.fromXyz(MX - 3, 30, 12).lookingAt([MX + 1, 0, -1])} intensity={90000000} outer_angle={0.62} inner_angle={0.3} color="#FFE7C2" shadow_maps_enabled />
      {/* the bare bulb in his room */}
      <PointLight transform={Transform.fromXyz(TX + 0.4, 2.45, 0.2)} intensity={atRoom ? 520000 : 0} color="#FFD98F" range={12} shadow_maps_enabled />
      <Fog color={P.bg} near={focus * 1.4} far={focus * 3.2} />
      <Mesh3d name="floor" transform={Transform.fromXyz(5, -0.05, 0)}>
        <Cuboid half_size={[200, 0.05, 200]} />
        <StandardMaterial base_color={P.pool} perceptual_roughness={0.5} />
      </Mesh3d>
      <Gallery t={t} />
      <MapTable t={t} />
      <Room t={t} />

      <Overlay t={t} cam={cam} cover={cover} />

      {sfx.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(at * FPS))} durationInFrames={FPS * 3} layout="none" name={`sfx-${name}-${i}`}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.55} />
        </Sequence>
      ))}
      <Audio src={staticFile("voice.wav")} volume={0.62} />
      <Audio src={staticFile("music.wav")} volume={(fr: number) => interpolate(fr / FPS, [0, 0.5, DUR - 3, DUR], [0, 0.16, 0.16, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
}

/** The cover: frame 0's shot at 2.9 s (title, the painting, 20,000, the open boxes), no caption. */
const Cover = () => <Monalisa003 cover />;
registerRoot(() => (
  <>
    <Composition id="monalisa" component={Monalisa003} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />
    <Composition id="monalisa-cover" component={Cover} width={W} height={H} fps={FPS} durationInFrames={1} />
  </>
));
