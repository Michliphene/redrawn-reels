/**
 * RECEIPTS #006 — "Inside a Chipotle bill", built in raea (Bevy through raea/3d).
 * Only the text is kept from the Remotion episode chipotle-10: the voice, its word timings and the sourced figures
 * (public/episodes/chipotle-10/SOURCES.md, Chipotle 10-K FY2025). Per $10 of revenue, "our calc.".
 *
 *   hero   (x 0)   the foil burrito on a plinth; on "Under $3" an amber band lights its first 29.6 %
 *   cut    (x 12)  the burrito lies on the counter and is cut into pieces as long as each cost (1 unit = $1):
 *                  food 2.96 · crew 2.51 · rent 0.52 · store 1.47 · office 0.92 · profit 1.62
 *                  each piece takes its colour on its NAME and its amount on the NUMBER; a meter counts the $10 down
 *   year   (x 26)  two towers of $1B slabs: $11.9B revenue, $1.9B operating profit
 *   point  (x 12)  back at the pieces: they stand up into two towers, the food ($2.96) against the rest ($5.42, our calc.)
 *
 * Redundancy rule (owner): a figure is on screen ONCE. The amount pinned to a piece (or the meter) is removed from the
 * captions; the captions keep the words the voice says. Every cue is timed from timings.json, never by eye.
 */
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "raea";
import { Bloom, DepthOfField, Entity, ToneMapping } from "raea/3d";
import { Cuboid, Cylinder, Mesh3d, Sphere, Torus } from "raea/mesh";
import { Fog, StandardMaterial } from "raea/pbr";
import { AmbientLight, DirectionalLight, PointLight, Shadows, SpotLight } from "raea/light";
import { Quat, Transform } from "raea/transform";
import { Camera3d } from "raea/camera";
import { LinearRgba, Srgba } from "raea/color";
import TIMINGS from "./timings.json";

/* ------------------------------------------------------------------ house tokens */
const FPS = 30, W = 1080, H = 1920;
const P = { bg: "#03100B", glow: "#14402E", surface: "#245240", ink: "#F3F6EE", muted: "#8FA89B", lime: "#C8F53C", red: "#FF6B5E", amber: "#FFB648", blue: "#7FB2FF", violet: "#B98CFF", grey: "#9AA89F", foil: "#C9D1D6", tortilla: "#EBCB8B" };
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

type Word = { w: string; start: number; end: number };
const BEATS: Record<string, { start: number; end: number; words: Word[] }> = Object.fromEntries(TIMINGS.beats.map((b: any) => [b.id, b]));
/** `w("food", "$2.96")` is when "$2.96" is spoken in beat "food" (a trailing . , … is ignored). */
const w = (beat: string, word: string, n = 1) => {
  const ws = BEATS[beat].words.filter((x) => x.w === word || x.w.replace(/[.,…]$/, "") === word);
  return (ws[n - 1] ?? ws[0]).start;
};
const B = (beat: string) => BEATS[beat].start;

/* ------------------------------------------------------------------ the money: per $10, rounded so it adds to $10.00 */
type Piece = { id: string; len: number; color: string; name: string; label: string; nameAt: number; amountAt: number; amount: string | null; up: boolean; keep?: boolean; rest?: boolean };
const PIECES: Piece[] = [
  { id: "food", len: 2.96, color: P.amber, name: "food", label: "food, drinks, packaging", nameAt: w("food", "Food"), amountAt: w("food", "$2.96"), amount: "$2.96", up: true },
  { id: "crew", len: 2.51, color: P.red, name: "crew", label: "the crew", nameAt: w("crew", "crew"), amountAt: w("crew", "$2.51"), amount: "$2.51", up: false, rest: true },
  { id: "rent", len: 0.52, color: P.blue, name: "rent", label: "rent", nameAt: w("rent", "Rent"), amountAt: w("rent", "52¢"), amount: "52¢", up: true, rest: true },
  { id: "store", len: 1.47, color: P.violet, name: "store", label: "delivery, ads, card fees", nameAt: w("store", "store:"), amountAt: w("store", "$1.47"), amount: "$1.47", up: false, rest: true },
  { id: "office", len: 0.92, color: P.grey, name: "office", label: "head office, gear", nameAt: w("office", "head"), amountAt: w("office", "92¢"), amount: "92¢", up: true, rest: true },
  { id: "keep", len: 1.62, color: P.lime, name: "keep", label: "profit, before tax", nameAt: w("keep", "keeps"), amountAt: w("keep", "$1.62"), amount: null, up: false, keep: true },
];
const CUM = PIECES.map((_, i) => PIECES.slice(0, i).reduce((s, p) => s + p.len, 0));
const REST_TOTAL = PIECES.filter((p) => p.rest).reduce((s, p) => s + p.len, 0); // 5.42

/* ------------------------------------------------------------------ stations */
const CUT_X = 12, YEAR_X = 26, R = 1.0, GAP = 0.5, PLINTH_TOP = 0.32;
const CUT_AT = w("open", "cut");
const TOWER_FOOD_X = CUT_X - 2.3, TOWER_REST_X = CUT_X + 1.9;

/** Centre of piece i lying on the counter (x), parted by GAP once cut. */
const lyingX = (i: number, parted: number) => CUT_X - (10 + 5 * GAP * parted) / 2 + CUM[i] + i * GAP * parted + PIECES[i].len / 2;
/** Where piece i stands in the point beat: the food alone on the left, the four cost pieces stacked on the right. */
const standing = (i: number): V3 => {
  if (i === 0) return [TOWER_FOOD_X, PIECES[0].len / 2, 0];
  const below = PIECES.slice(1, i).reduce((s, p) => s + p.len, 0);
  return [TOWER_REST_X, below + PIECES[i].len / 2 + (i - 1) * 0.03, 0];
};

/* ------------------------------------------------------------------ camera */
type Shot = { t: number; pos: V3; look: V3; fov: number };
/** A shot from where it looks: yaw from +z toward +x, pitch above the floor, distance. */
const shot = (t: number, target: V3, yaw: number, pitch: number, dist: number, fov: number): Shot => {
  const y = (yaw * Math.PI) / 180, p = (pitch * Math.PI) / 180;
  return { t, look: target, fov, pos: [target[0] + dist * Math.sin(y) * Math.cos(p), target[1] + dist * Math.sin(p), target[2] + dist * Math.cos(y) * Math.cos(p)] };
};
const HERO = shot(0, [0.2, -0.45, 0.1], 24, 14, 19.5, 30);
const SHOTS: Shot[] = [
  HERO,
  shot(B("open") - 0.3, [CUT_X, 0.1, 0], -5, 26, 47, 30),
  shot(B("keep") - 0.3, [CUT_X + 1.2, 0.2, 0], -9, 34, 38, 30),
  shot(B("year") - 0.3, [YEAR_X, 1.2, 0], -12, 11, 31, 34),
  shot(B("point") - 0.3, [CUT_X - 0.2, 1.4, 0], -10, 12, 30, 32),
];
const OPEN: Shot = { t: 0, pos: [HERO.look[0] + (HERO.pos[0] - HERO.look[0]) * 1.25, HERO.look[1] + (HERO.pos[1] - HERO.look[1]) * 1.25, HERO.look[2] + (HERO.pos[2] - HERO.look[2]) * 1.25], look: HERO.look, fov: HERO.fov };
SHOTS.push({ ...OPEN, t: DUR - 1.15 });
function cameraAt(t: number) {
  let k = 0;
  for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].t) k = i;
  const prev = SHOTS[Math.max(0, k - 1)], cur = SHOTS[k];
  const e = k === 0 ? 1 : inOut3(ramp(t, cur.t, 1.0));
  let pos = lerp3(prev.pos, cur.pos, e), look = lerp3(prev.look, cur.look, e), fov = lerp(prev.fov, cur.fov, e);
  const c = inOut3(ramp(t, 0.05, 1.6)); // crane-in on the hook
  if (t < 1.7) { pos = lerp3(OPEN.pos, pos, c); look = lerp3(OPEN.look, look, c); }
  const still = 1 - ramp(t, DUR - 1.15, 1.0); // a slow orbit, none on the last frames so the loop meets frame 0
  const a = (Math.sin(t * 0.42) * 0.05 + Math.sin(t * 0.17 + 1) * 0.03) * still * (t < 1.7 ? c : 1);
  const dx = pos[0] - look[0], dz = pos[2] - look[2];
  pos = [look[0] + dx * Math.cos(a) - dz * Math.sin(a), pos[1] + Math.sin(t * 0.3) * 0.06 * still, look[2] + dx * Math.sin(a) + dz * Math.cos(a)];
  return { pos, look, fov };
}
/** World point → pixel of the 1080×1920 frame, through the same camera that renders it (labels pinned to pieces). */
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
/** The hero: a foil burrito on a plinth; on "Under $3" an amber band lights the first 29.6 % of its length. */
function Hero({ t }: { t: number }) {
  const HL = 1.9;
  const band = life(t, w("hook", "$3"), B("open") - w("hook", "$3") + 0.1, 0.25);
  const fade = 1 - ramp(t, B("open") + 0.2, 0.5);
  return (
    <>
      <Mesh3d name="plinth" transform={Transform.fromXyz(0, PLINTH_TOP / 2, 0)}>
        <Cylinder radius={2.0} half_height={PLINTH_TOP / 2} />
        <StandardMaterial base_color={P.surface} perceptual_roughness={0.42} metallic={0.15} />
      </Mesh3d>
      <Mesh3d name="plinth-ring" transform={Transform.fromXyz(0, PLINTH_TOP + 0.005, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}>
        <Torus major_radius={1.93} minor_radius={0.03} />
        <StandardMaterial base_color={P.lime} emissive={glow(P.lime, 2.4)} />
      </Mesh3d>
      <Entity transform={Transform.fromXyz(0, PLINTH_TOP + 0.78 + Math.sin(t * 1.4) * 0.03, 0).withRotation(Quat.fromEuler("XYZ", 0, -0.35 + Math.sin(t * 0.6) * 0.14, 0.04))}>
        <Mesh3d name="burrito" transform={Transform.fromXyz(0, 0, 0).withRotation(Quat.fromEuler("XYZ", 0, 0, Math.PI / 2))}>
          <Cylinder radius={0.62} half_height={HL} />
          <StandardMaterial base_color={P.foil} perceptual_roughness={0.26} metallic={0.92} />
        </Mesh3d>
        <Mesh3d name="burrito-nose" allowOverlap transform={Transform.fromXyz(-HL, 0, 0).withScale([0.55, 1, 1])}>
          <Sphere radius={0.62} />
          <StandardMaterial base_color={P.foil} perceptual_roughness={0.26} metallic={0.92} />
        </Mesh3d>
        <Mesh3d name="burrito-open" allowOverlap transform={Transform.fromXyz(HL + 0.04, 0, 0).withRotation(Quat.fromEuler("XYZ", 0, 0, Math.PI / 2))}>
          <Cylinder radius={0.56} half_height={0.1} />
          <StandardMaterial base_color={P.tortilla} perceptual_roughness={0.7} />
        </Mesh3d>
        {Array.from({ length: 5 }, (_, i) => (
          <Mesh3d key={i} name={`crimp-${i}`} transform={Transform.fromXyz(-1.35 + i * 0.62, 0.6, 0).withRotation(Quat.fromEuler("XYZ", 0, 0, 0.12 * (i % 2 ? 1 : -1)))}>
            <Cuboid half_size={[0.24, 0.025, 0.2]} />
            <StandardMaterial base_color="#E4E9EC" perceptual_roughness={0.3} metallic={0.8} />
          </Mesh3d>
        ))}
        {band * fade > 0.01 && (
          <Mesh3d name="food-band" allowOverlap transform={Transform.fromXyz(-HL + 0.296 * HL, 0, 0).withRotation(Quat.fromEuler("XYZ", 0, 0, Math.PI / 2)).withScale([1, 1, 1])}>
            <Cylinder radius={0.645} half_height={0.296 * HL} />
            <StandardMaterial base_color={P.amber} perceptual_roughness={0.35} emissive={glow(P.amber, 2.2 * band * fade)} />
          </Mesh3d>
        )}
      </Entity>
    </>
  );
}

/** The cut: the burrito is laid on the counter whole, parted on "cut", each piece coloured on its name, then it stands up. */
function Cut({ t }: { t: number }) {
  const show = outBack(ramp(t, B("open") + 0.05, 0.45), 1.3);
  if (show <= 0.005) return null;
  const parted = out3(ramp(t, CUT_AT, 0.55));
  const flash = life(t, CUT_AT - 0.05, 0.35, 0.08); // the foil seams flash when it opens
  return (
    <>
      <Mesh3d name="board" transform={Transform.fromXyz(CUT_X, 0.05, 0)}>
        <Cuboid half_size={[7.4, 0.05, 2.4]} />
        <StandardMaterial base_color="#0B241A" perceptual_roughness={0.5} />
      </Mesh3d>
      {PIECES.map((p, i) => {
        const col = ramp(t, p.nameAt, 0.3);
        const color = hexMix(P.foil, p.color, col);
        const stand = out3(ramp(t, p.rest ? w("point", "restaurant") + (i - 1) * 0.1 : p.id === "food" ? w("point", "food") : B("point"), 0.7));
        const gone = p.keep ? out3(ramp(t, B("point") + 0.1, 0.5)) : 0;
        const hopY = 0.7 * Math.sin(Math.PI * ramp(t, p.nameAt, 0.45));
        const lie: V3 = [lyingX(i, parted), 0.1 + R + hopY + (p.keep ? 0.25 * col * (0.7 + 0.3 * Math.sin(t * 6)) : 0), 0];
        const up = standing(i);
        const pos = lerp3(lie, [up[0], up[1] + 0.06, up[2]], stand);
        pos[1] += Math.sin(Math.PI * stand) * 1.4;
        const s = Math.max(0.001, show * (1 - gone));
        const em = (p.keep ? 1.6 * col : 0) + 0.9 * flash * (1 - col);
        const ang = (Math.PI / 2) * (1 - stand);
        const rot = Quat.fromEuler("XYZ", 0, 0, ang);
        const len = p.len - 0.05;
        return (
          <Entity key={p.id} transform={Transform.fromXyz(pos[0], pos[1], pos[2]).withScale([s, s, s])}>
            <Mesh3d name={`piece-${p.id}`} allowOverlap transform={Transform.fromXyz(0, 0, 0).withRotation(rot)}>
              <Cylinder radius={R} half_height={len / 2} />
              <StandardMaterial base_color={color} perceptual_roughness={0.3} metallic={col > 0.5 ? 0.25 : 0.9} emissive={glow(p.color, em)} />
            </Mesh3d>
            {parted > 0.1 && [-1, 1].map((sg) => (
              <Mesh3d key={sg} name={`face-${p.id}-${sg}`} allowOverlap transform={Transform.fromXyz(-Math.sin(ang) * ((sg * len) / 2), Math.cos(ang) * ((sg * len) / 2), 0).withRotation(rot)}>
                <Cylinder radius={R * 0.93} half_height={0.012} />
                <StandardMaterial base_color={P.tortilla} perceptual_roughness={0.7} />
              </Mesh3d>
            ))}
          </Entity>
        );
      })}
    </>
  );
}

/** $11.9B of revenue against $1.9B of operating profit: one slab per $1B, so the height reads as a count of money. */
function Year({ t }: { t: number }) {
  const towers = [
    { x: YEAR_X - 1.5, v: 11.926, at: w("year", "Across"), color: P.ink, em: 0.0, name: "revenue" },
    { x: YEAR_X + 1.5, v: 1.936, at: w("year", "$1.9B"), color: P.lime, em: 0.9, name: "profit" },
  ];
  const SL = 0.42;
  return (
    <>
      <Mesh3d name="year-base" transform={Transform.fromXyz(YEAR_X, 0.04, 0)}>
        <Cuboid half_size={[3.6, 0.04, 1.8]} />
        <StandardMaterial base_color="#0B241A" perceptual_roughness={0.5} />
      </Mesh3d>
      {towers.map((tw) => {
        const g = out3(ramp(t, tw.at, 0.9));
        const slabs = Math.ceil(tw.v * g);
        return Array.from({ length: slabs }, (_, k) => {
          const bot = k * SL, top = Math.min(tw.v * g, k + 1) * SL;
          if (top - bot < 0.02) return null;
          return (
            <Mesh3d key={`${tw.name}-${k}`} name={`${tw.name}-${k}`} allowOverlap transform={Transform.fromXyz(tw.x, 0.08 + (bot + top) / 2, 0).withScale([1, (top - bot - 0.03) / (SL - 0.03), 1])}>
              <Cuboid half_size={[0.9, (SL - 0.03) / 2, 0.9]} />
              <StandardMaterial base_color={tw.color} perceptual_roughness={0.32} metallic={0.4} emissive={glow(tw.color, tw.em)} />
            </Mesh3d>
          );
        });
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

/** A label pinned to a piece: amount (Display) and name (Mono), on one block, above or below the piece. */
function PieceLabel({ t, cam, p, i }: { t: number; cam: ReturnType<typeof cameraAt>; p: Piece; i: number }) {
  const parted = out3(ramp(t, CUT_AT, 0.55));
  const gone = ramp(t, w("year", "Across") - 0.3, 0.25); // the labels leave with the pieces' station and never return
  const o = Math.min(ramp(t, p.nameAt, 0.2), 1 - gone);
  if (o <= 0) return null;
  const x = lyingX(i, parted);
  const hop = 0.7 * Math.sin(Math.PI * ramp(t, p.nameAt, 0.45));
  const wdt = 270;
  const [px, py] = p.up ? project(cam, [x, 0.1 + 2 * R + hop + 0.55, 0]) : project(cam, [x, 0.1 + hop * 0, R + 0.35]);
  const amountO = p.amount ? ramp(t, p.amountAt, 0.15) : 0;
  const s = p.amount ? Math.min(1.08, outBack(ramp(t, p.amountAt, 0.3), 2)) : 1;
  return (
    <div style={abs(clampX(px, wdt / 2) - wdt / 2, 0, { width: wdt, textAlign: "center", opacity: o, ...(p.up ? { top: py - 142 } : { top: py + 6 }) })}>
      {!p.up && <div style={{ ...mono(25), lineHeight: 1.15 }}>{p.label}</div>}
      {p.amount && <div style={{ ...display(76, p.color), opacity: amountO, transform: `scale(${s})`, transformOrigin: p.up ? "center bottom" : "center top", height: 76 }}>{p.amount}</div>}
      {p.up && <div style={{ ...mono(25), lineHeight: 1.15, marginTop: 8 }}>{p.label}</div>}
    </div>
  );
}

/** What is left of the $10 — it counts down as each piece's amount is spoken, and ends on what Chipotle keeps. */
function Meter({ t }: { t: number }) {
  const o = Math.min(ramp(t, B("open") + 0.3, 0.3), 1 - ramp(t, w("year", "Across") - 0.3, 0.25));
  if (o <= 0) return null;
  const spent = PIECES.filter((p) => !p.keep).reduce((s, p) => s + p.len * out3(ramp(t, p.amountAt, 0.5)), 0);
  const keep = ramp(t, PIECES[5].amountAt, 0.01) > 0;
  const left = Math.max(0, 10 - spent);
  const pop = keep ? Math.min(1.08, outBack(ramp(t, PIECES[5].amountAt, 0.3), 2)) : 1;
  return (
    <div style={abs(SAFE.left, 318, { opacity: o })}>
      <div style={mono(30, keep ? P.lime : P.muted)}>{keep ? "Chipotle keeps" : "Left of your $10"}</div>
      <div style={{ ...display(150, keep ? P.lime : P.ink), transform: `scale(${pop})`, transformOrigin: "left center", marginTop: 6 }}>${left.toFixed(2)}</div>
    </div>
  );
}

/** The point: the food tower against the restaurant tower (our calculation). */
function Point({ t, cam }: { t: number; cam: ReturnType<typeof cameraAt> }) {
  const tops = [
    { at: w("point", "third"), x: TOWER_FOOD_X, y: PIECES[0].len, value: "$2.96", label: "the food", color: P.amber },
    { at: w("point", "twice"), x: TOWER_REST_X, y: REST_TOTAL + 0.1, value: "$5.42", label: "the restaurant · our calc.", color: P.ink },
  ];
  return (
    <>
      {tops.map((tp, i) => {
        const o = Math.min(ramp(t, tp.at, 0.2), 1 - ramp(t, B("loop") + 0.1, 0.3));
        if (o <= 0) return null;
        const [px, py] = project(cam, [tp.x, tp.y + 0.7, 0]);
        const wdt = 360;
        return (
          <div key={i} style={abs(clampX(px, wdt / 2) - wdt / 2, py - 130, { width: wdt, textAlign: "center", opacity: o, transform: `scale(${Math.min(1.08, outBack(ramp(t, tp.at, 0.3), 2))})`, transformOrigin: "center bottom" })}>
            <div style={display(92, tp.color)}>{tp.value}</div>
            <div style={{ ...mono(25), marginTop: 6 }}>{tp.label}</div>
          </div>
        );
      })}
    </>
  );
}

function YearLabels({ t, cam }: { t: number; cam: ReturnType<typeof cameraAt> }) {
  const SL = 0.42;
  const items = [
    { at: w("year", "Across") + 0.9, x: YEAR_X - 1.5, h: 11.926 * SL, value: "$11.9B", label: "revenue · 2025", color: P.ink },
    // the profit figure is the one the voice says ($1.9B stays in the captions): the tower is named, not numbered
    { at: w("year", "$1.9B") + 0.9, x: YEAR_X + 1.5, h: 1.936 * SL, value: "", label: "operating profit", color: P.lime },
  ];
  return (
    <>
      {items.map((it, i) => {
        const o = Math.min(ramp(t, it.at, 0.2), 1 - ramp(t, B("point") - 0.3, 0.25));
        if (o <= 0) return null;
        const [px, py] = project(cam, [it.x, it.h + 0.5, 0]);
        const wdt = it.value ? 400 : 330;
        return (
          <div key={i} style={abs(clampX(px, wdt / 2) - wdt / 2 + (it.value ? 0 : 40), py - (it.value ? 128 : 70), { width: wdt, textAlign: "center", opacity: o, transform: `scale(${Math.min(1.08, outBack(ramp(t, it.at, 0.3), 2))})`, transformOrigin: "center bottom" })}>
            {it.value && <div style={display(92, it.color)}>{it.value}</div>}
            <div style={{ ...(it.value ? mono(25) : mono(34, it.color)), marginTop: it.value ? 6 : 0 }}>{it.label}</div>
          </div>
        );
      })}
    </>
  );
}

function Overlay({ t, cam }: { t: number; cam: ReturnType<typeof cameraAt> }) {
  const hookEnd = BEATS.hook.end;
  const titleO = Math.max(1 - ramp(t, hookEnd - 0.25, 0.25), ramp(t, DUR - 0.5, 0.35));
  const figO = Math.max(life(t, 0.35, hookEnd - 0.35 + 0.3, 0.2), ramp(t, B("loop") - 0.05, 0.25) * (1 - ramp(t, DUR - 0.3, 0.3)));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <style>{FONTS}</style>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 720, backgroundImage: "linear-gradient(180deg, rgba(3,16,11,0.86) 0%, rgba(3,16,11,0.6) 45%, rgba(3,16,11,0) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 1110, width: W, height: 810, backgroundImage: "linear-gradient(180deg, rgba(3,16,11,0) 0%, rgba(3,16,11,0.72) 22%, rgba(3,16,11,0.8) 100%)" }} />

      <div style={abs(SAFE.left, SAFE.top, { display: "flex", alignItems: "center", gap: 16 })}>
        <div style={{ ...mono(26, P.bg), background: P.lime, padding: "9px 14px 8px 17px", borderRadius: 4, letterSpacing: "0.22em" }}>RECEIPTS</div>
        <div style={mono(26, P.lime)}>#006</div>
      </div>

      {titleO > 0.01 && (
        <div style={abs(SAFE.left, 324, { width: SAFE.right - SAFE.left, opacity: titleO })}>
          <div style={display(112)}>Inside a<br />Chipotle bill</div>
          <div style={{ fontFamily: "Instrument", fontStyle: "italic", fontSize: 54, color: P.lime, marginTop: 14 }}>every cent from the 2025 annual report</div>
        </div>
      )}

      {/* hook: the $10 is the only figure; the "under $3" is the amber band on the burrito itself */}
      {figO > 0.01 && (
        <div style={abs(SAFE.left, 880, { opacity: figO, transform: `scale(${Math.min(1.05, outBack(ramp(t, 0.35, 0.35), 2))})`, transformOrigin: "left center" })}>
          <div style={display(214, P.lime)}>$10</div>
        </div>
      )}

      <Meter t={t} />
      {PIECES.map((p, i) => <PieceLabel key={p.id} t={t} cam={cam} p={p} i={i} />)}
      <YearLabels t={t} cam={cam} />
      <Point t={t} cam={cam} />

      <Captions t={t} />
      <div style={abs(SAFE.left, 1412, { ...mono(24, P.muted), letterSpacing: "0.05em", width: SAFE.railX - SAFE.left })}>Source: Chipotle 10-K (SEC filing), fiscal 2025 · per $10: our calc.</div>
    </AbsoluteFill>
  );
}

/** Captions from the transcript. Figures already pinned in the world are NOT repeated here (one figure, one place). */
const HIDE = new Set(["hook:$10", "food:$2.96", "crew:$2.51", "rent:52¢", "store:$1.47", "office:92¢", "keep:$1.62"]);
const PHRASES: Word[][] = (() => {
  const out: Word[][] = [];
  for (const b of TIMINGS.beats as any[]) {
    let cur: Word[] = [], len = 0;
    for (const x of (b.words as Word[]).filter((x) => !HIDE.has(`${b.id}:${x.w.replace(/[.,…]$/, "")}`))) {
      if (cur.length && len + x.w.length > 20) { out.push(cur); cur = []; len = 0; }
      cur.push(x); len += x.w.length + 1;
      if (/[.,…:?]$/.test(x.w) && len > 9) { out.push(cur); cur = []; len = 0; }
    }
    if (cur.length) out.push(cur);
  }
  return out;
})();
const KEYWORDS = ["food", "crew", "rent", "keeps", "restaurant", "third", "twice"];
function Captions({ t }: { t: number }) {
  const i = PHRASES.findIndex((p, k) => t >= p[0].start - 0.05 && t < (PHRASES[k + 1]?.[0].start ?? 1e9) - 0.05 && t < p[p.length - 1].end + 0.6);
  if (i < 0) return null;
  const p = PHRASES[i];
  return (
    <div style={abs(SAFE.left, 1185, { width: SAFE.railX - SAFE.left, display: "flex", flexWrap: "wrap", columnGap: 22, rowGap: 4 })}>
      {p.map((x, k) => {
        const on = t >= x.start - 0.04;
        const hot = KEYWORDS.includes(x.w.replace(/[.,…:?]$/, "").toLowerCase());
        return <span key={k} style={{ ...display(84, on ? (hot ? P.lime : P.ink) : P.muted) }}>{x.w}</span>;
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ the frame */
function Chipotle006() {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = cameraAt(t);
  const focus = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
  const sfx: [number, string, number][] = [[0, "boom", 0.35], ...SHOTS.slice(1, -1).map((s) => [s.t + 0.1, "whoosh", 0.32] as [number, string, number]),
    [w("hook", "$3"), "stamp", 0.5], [CUT_AT, "stamp", 0.6], ...PIECES.filter((p) => p.amount).map((p) => [p.amountAt, "pop", 0.45] as [number, string, number]),
    [PIECES[5].amountAt, "stamp", 0.6], [w("year", "$1.9B"), "pop", 0.5], [w("point", "third"), "pop", 0.45], [w("point", "twice"), "stamp", 0.5]];
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
      <SpotLight transform={Transform.fromXyz(1.5, 7, 4).lookingAt([0, 0.6, 0])} intensity={3800000} outer_angle={0.46} inner_angle={0.22} color="#FFF4E0" shadow_maps_enabled />
      <SpotLight transform={Transform.fromXyz(CUT_X, 14, 6).lookingAt([CUT_X, 0.4, 0])} intensity={9000000} outer_angle={0.62} inner_angle={0.3} color="#FFF4E0" shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(YEAR_X - 2, 8, 6)} intensity={1800000} color="#E4FFB0" range={20} />
      <Fog color={P.bg} near={focus * 1.2} far={focus * 2.8} />
      <Mesh3d name="floor" transform={Transform.fromXyz(14, -0.05, 0)}>
        <Cuboid half_size={[200, 0.05, 200]} />
        <StandardMaterial base_color={P.glow} perceptual_roughness={0.38} />
      </Mesh3d>
      {Array.from({ length: 24 }, (_, k) => (
        <Mesh3d key={`sx-${k}`} name={`seam-x-${k}`} transform={Transform.fromXyz(-12 + k * 2.5, 0.002, 0)}>
          <Cuboid half_size={[0.012, 0.002, 30]} />
          <StandardMaterial base_color="#1D5740" perceptual_roughness={0.6} />
        </Mesh3d>
      ))}
      {Array.from({ length: 12 }, (_, k) => (
        <Mesh3d key={`sz-${k}`} name={`seam-z-${k}`} transform={Transform.fromXyz(14, 0.002, -15 + k * 2.5)}>
          <Cuboid half_size={[60, 0.002, 0.012]} />
          <StandardMaterial base_color="#1D5740" perceptual_roughness={0.6} />
        </Mesh3d>
      ))}
      <Hero t={t} />
      <Cut t={t} />
      <Year t={t} />

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

registerRoot(() => <Composition id="chipotle" component={Chipotle006} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />);
