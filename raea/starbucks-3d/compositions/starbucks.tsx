/**
 * RECEIPTS #008 — "Inside a Starbucks cup", built in raea (Bevy through raea/3d).
 * Only the text comes from public/episodes/starbucks-10: the voice, its word timings and the sourced figures
 * (SOURCES.md, Starbucks 10-K FY2026). Per $10 of revenue, "our calc.".
 *
 *   cup   (x 0)   a takeaway cup. Hook: the lid pops and the foam glows (what Starbucks keeps).
 *                 "Let's pour it out": the cup lifts off and leaves the drink standing, a stack of layers, 1 unit = $1:
 *                 cup & food 3.23 · baristas 2.69 · rent 0.80 · store 1.05 · office 1.26 · foam (profit) 0.97
 *                 each layer takes its colour on its beat, its amount lands on the spoken number in a LEDGER hung from
 *                 the left margin, a hairline from each row to its layer.
 *   year  (x 24)  a field of cups; their foam lights in a wave (41,000 coffeehouses, $3.7B: in the captions).
 *   point (x 0)   back at the drink: the cup layer, then the three coffeehouse layers, light up; the rest dims.
 *
 * Layout change after #006 (owner): no horizontal slices, no meter. Redundancy rule: a figure is on screen ONCE at a
 * time; amounts pinned in the ledger are removed from the captions.
 */
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "raea";
import { Bloom, DepthOfField, Entity, ToneMapping } from "raea/3d";
import { ConicalFrustum, Cuboid, Cylinder, Mesh3d, Sphere } from "raea/mesh";
import { Fog, StandardMaterial } from "raea/pbr";
import { AmbientLight, DirectionalLight, PointLight, Shadows, SpotLight } from "raea/light";
import { Quat, Transform } from "raea/transform";
import { Camera3d } from "raea/camera";
import { LinearRgba, Srgba } from "raea/color";
import TIMINGS from "./timings.json";

/* ------------------------------------------------------------------ house tokens */
const FPS = 30, W = 1080, H = 1920;
const P = { bg: "#03100B", glow: "#14402E", surface: "#245240", ink: "#F3F6EE", muted: "#8FA89B", lime: "#C8F53C", red: "#FF6B5E", amber: "#FFB648", blue: "#7FB2FF", violet: "#B98CFF", grey: "#9AA89F", coffee: "#5A3C2A", paper: "#F1EEE6", kraft: "#B88A5E" };
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
const hexMix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(lerp(v, y[i], clamp01(k))).toString(16).padStart(2, "0")).join("");
};
const glow = (hex: string, k: number) => LinearRgba.from(Srgba.hex(hex)).mul(k);

type Word = { w: string; start: number; end: number };
const BEATS: Record<string, { start: number; end: number; words: Word[] }> = Object.fromEntries(TIMINGS.beats.map((b: any) => [b.id, b]));
/** `w("cup", "$3.23")` is when "$3.23" is spoken in beat "cup" (a trailing . , … : is ignored). */
const w = (beat: string, word: string, n = 1) => {
  const ws = BEATS[beat].words.filter((x) => x.w === word || x.w.replace(/[.,…:?]$/, "") === word);
  return (ws[n - 1] ?? ws[0]).start;
};
const B = (beat: string) => BEATS[beat].start;

/* ------------------------------------------------------------------ the money: per $10, plain rounding adds to $10.00 */
type Layer = { id: string; len: number; color: string; label: string; colorAt: number; amountAt: number; amount: string; keep?: boolean; house?: boolean };
const LAYERS: Layer[] = [
  { id: "cup", len: 3.23, color: P.amber, label: "cup, milk, beans, food", colorAt: B("cup") + 0.05, amountAt: w("cup", "$3.23"), amount: "$3.23" },
  { id: "crew", len: 2.69, color: P.red, label: "baristas", colorAt: w("crew", "baristas'"), amountAt: w("crew", "$2.69"), amount: "$2.69", house: true },
  { id: "rent", len: 0.80, color: P.blue, label: "rent", colorAt: w("rent", "Rent"), amountAt: w("rent", "80¢"), amount: "80¢", house: true },
  { id: "store", len: 1.05, color: P.violet, label: "ads, delivery apps", colorAt: w("store", "$1.05"), amountAt: w("store", "$1.05"), amount: "$1.05", house: true },
  { id: "office", len: 1.26, color: P.grey, label: "office, gear, closures", colorAt: w("office", "$1.26"), amountAt: w("office", "$1.26"), amount: "$1.26" },
  { id: "keep", len: 0.97, color: P.lime, label: "Starbucks keeps", colorAt: w("keep", "97¢"), amountAt: w("keep", "97¢"), amount: "97¢", keep: true },
];
const CUM = LAYERS.map((_, i) => LAYERS.slice(0, i).reduce((s, l) => s + l.len, 0));

/* ------------------------------------------------------------------ the cup */
const CUP_X = 0, YEAR_X = 24;
const U = 0.62;                 // world units per $1 of height
const HT = 10 * U;              // the drink: 6.2
const BASE = 0.06;              // drink bottom above the floor
const RB = 1.02, RT = 1.36;     // drink radius at the bottom / top
const rAt = (y: number) => RB + ((RT - RB) * y) / HT;
// the foam stands a little proud of the rim: it shows as soon as the lid pops
const SHELL_H = HT - 0.18, SHELL_RB = RB + 0.07, SHELL_RT = RB + 0.07 + ((RT - RB) * SHELL_H) / HT;
const POUR_AT = w("open", "pour");
const LOOP_BACK = DUR - 1.9;    // the cup comes back down for the loop (camera settled before the title returns)
const layerMid = (i: number) => BASE + (CUM[i] + LAYERS[i].len / 2) * U;

/* ------------------------------------------------------------------ camera */
type Shot = { t: number; pos: V3; look: V3; fov: number };
const shot = (t: number, target: V3, yaw: number, pitch: number, dist: number, fov: number): Shot => {
  const y = (yaw * Math.PI) / 180, p = (pitch * Math.PI) / 180;
  return { t, look: target, fov, pos: [target[0] + dist * Math.sin(y) * Math.cos(p), target[1] + dist * Math.sin(p), target[2] + dist * Math.cos(y) * Math.cos(p)] };
};
const HERO = shot(0, [CUP_X - 2.9, 3.0, 0], 16, 14, 47, 30);
const SHOTS: Shot[] = [
  HERO,
  shot(POUR_AT - 0.2, [CUP_X - 2.0, 1.6, 0], -8, 10, 34, 30),
  shot(B("keep") - 0.3, [CUP_X - 1.7, 1.9, 0], -12, 12, 30, 30),
  shot(B("year") - 0.3, [YEAR_X, 0.6, -1.0], -14, 36, 25, 32),
  shot(B("point") - 0.3, [CUP_X - 2.0, 1.6, 0], 8, 9, 34, 30),
  { ...HERO, t: LOOP_BACK + 0.1 },
];
function cameraAt(t: number) {
  let k = 0;
  for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].t) k = i;
  const prev = SHOTS[Math.max(0, k - 1)], cur = SHOTS[k];
  const e = k === 0 ? 1 : inOut3(ramp(t, cur.t, 1.0));
  let pos = lerp3(prev.pos, cur.pos, e);
  const look = lerp3(prev.look, cur.look, e), fov = lerp(prev.fov, cur.fov, e);
  const still = Math.min(ramp(t, 0.6, 1.2), 1 - ramp(t, DUR - 1.15, 1.0)); // no orbit at both ends: the loop meets frame 0
  const a = (Math.sin(t * 0.42) * 0.05 + Math.sin(t * 0.17 + 1) * 0.03) * still;
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

/* ------------------------------------------------------------------ emphasis in the point beat */
// light each group on the noun that names it, not on the last word of the sentence
const THIRD_AT = w("point", "cup"), HALF_AT = w("point", "coffeehouse");
/** 1 = normal, <1 = dimmed, >1 = lit, for layer/row i at time t. */
function emphasis(t: number, i: number) {
  const third = ramp(t, THIRD_AT, 0.3), half = ramp(t, HALF_AT, 0.3);
  const end = 1 - ramp(t, LOOP_BACK - 0.2, 0.4);
  const L = LAYERS[i];
  let k = 1;
  if (third > 0) k = lerp(1, i === 0 ? 1.6 : 0.35, third * end);
  if (half > 0) k = lerp(k, L.house ? 1.6 : i === 0 ? 1 : 0.35, half * end);
  return k;
}

/* ------------------------------------------------------------------ 3D */
function Cup({ t }: { t: number }) {
  const lidPop = out3(ramp(t, w("hook", "97¢"), 0.35)) * (1 - inOut3(ramp(t, LOOP_BACK, 0.9)));
  const lift = inOut3(ramp(t, POUR_AT, 0.85)) * (1 - inOut3(ramp(t, LOOP_BACK, 0.9)));
  const shellY = BASE - 0.05 + lift * 11;
  const tilt = -lidPop * 0.5;
  return (
    <>
      <Mesh3d name="saucer" transform={Transform.fromXyz(CUP_X, 0.03, 0)}>
        <Cylinder radius={2.3} half_height={0.03} />
        <StandardMaterial base_color={P.surface} perceptual_roughness={0.4} metallic={0.15} />
      </Mesh3d>
      {/* the drink: one frustum per layer; brown until its beat, then its own colour */}
      {LAYERS.map((L, i) => {
        const y0 = CUM[i] * U, y1 = (CUM[i] + L.len) * U;
        const col = L.keep ? Math.max(ramp(t, w("hook", "97¢"), 0.3), ramp(t, L.colorAt, 0.3)) : ramp(t, L.colorAt, 0.3);
        const back = 1 - ramp(t, LOOP_BACK, 0.6); // the colours drain back for the loop
        const c = col * back; // all drain back to brown, the foam too: the last frame is frame 0
        const em = emphasis(t, i);
        const pop = 1 + 0.06 * Math.sin(Math.PI * ramp(t, L.amountAt, 0.4)) + (em > 1 ? 0.03 * (em - 1) : 0);
        const color = hexMix(P.coffee, L.color, c * (em < 1 ? lerp(0.35, 1, em) : 1));
        // "Almost three times what Starbucks keeps": the foam pulses once (the baristas' layer is already lit)
        const rehook = L.keep ? Math.sin(Math.PI * ramp(t, w("crew", "three"), 1.1)) : 0;
        const e = (L.keep ? 1.4 * c : 0.35 * c) * Math.max(em, 0.3) + (em > 1 ? 0.6 * (em - 1) : 0) + 2.2 * rehook;
        return (
          <Mesh3d key={L.id} name={`layer-${L.id}`} allowOverlap transform={Transform.fromXyz(CUP_X, BASE + (y0 + y1) / 2, 0).withScale([pop, 1, pop])}>
            <ConicalFrustum radius_bottom={rAt(y0)} radius_top={rAt(y1)} height={y1 - y0 - 0.02} />
            <StandardMaterial base_color={color} perceptual_roughness={L.keep ? 0.8 : 0.35} metallic={0.05} emissive={glow(L.color, e)} />
          </Mesh3d>
        );
      })}
      {/* the cup: paper shell + kraft sleeve, lifted off on "pour" and back down for the loop */}
      <Entity transform={Transform.fromXyz(CUP_X, shellY, 0)}>
        <Mesh3d name="shell" allowOverlap transform={Transform.fromXyz(0, SHELL_H / 2, 0)}>
          <ConicalFrustum radius_bottom={SHELL_RB} radius_top={SHELL_RT} height={SHELL_H} />
          <StandardMaterial base_color={P.paper} perceptual_roughness={0.55} />
        </Mesh3d>
        <Mesh3d name="sleeve" allowOverlap transform={Transform.fromXyz(0, SHELL_H * 0.42, 0)}>
          <ConicalFrustum radius_bottom={SHELL_RB + ((SHELL_RT - SHELL_RB) * 0.32) + 0.03} radius_top={SHELL_RB + ((SHELL_RT - SHELL_RB) * 0.52) + 0.03} height={SHELL_H * 0.2} />
          <StandardMaterial base_color={P.kraft} perceptual_roughness={0.8} />
        </Mesh3d>
        <Entity transform={Transform.fromXyz(lidPop * 2.1, SHELL_H + 0.34 + lidPop * 0.35, 0).withRotation(Quat.fromEuler("XYZ", 0, 0, tilt))}>
          <Mesh3d name="lid" allowOverlap transform={Transform.fromXyz(0, 0, 0)}>
            <Cylinder radius={SHELL_RT + 0.08} half_height={0.09} />
            <StandardMaterial base_color={P.paper} perceptual_roughness={0.4} />
          </Mesh3d>
          <Mesh3d name="lid-dome" allowOverlap transform={Transform.fromXyz(0, 0.16, 0)}>
            <ConicalFrustum radius_bottom={SHELL_RT - 0.05} radius_top={SHELL_RT - 0.35} height={0.22} />
            <StandardMaterial base_color={P.paper} perceptual_roughness={0.4} />
          </Mesh3d>
        </Entity>
      </Entity>
    </>
  );
}

/** A field of cups: their foam lights in a wave on "$3.7B". */
function Field({ t }: { t: number }) {
  const show = out3(ramp(t, B("year") - 0.4, 0.6));
  if (show <= 0.01 || t > B("point") + 1.2) return null;
  const wave = w("year", "$3.7B");
  const cups: JSX.Element[] = [];
  for (let gx = 0; gx < 9; gx++) for (let gz = 0; gz < 7; gz++) {
    const x = YEAR_X - 6 + gx * 1.5, z = -7.5 + gz * 1.5, k = gx * 7 + gz;
    const d = Math.hypot(gx - 4, gz - 5);
    const lit = ramp(t, wave + d * 0.08, 0.25);
    const rise = out3(ramp(t, B("year") - 0.4 + d * 0.04, 0.5));
    cups.push(
      <Entity key={k} transform={Transform.fromXyz(x, 0, z).withScale([1, Math.max(0.001, rise), 1])}>
        <Mesh3d name={`fc-${k}`} allowOverlap transform={Transform.fromXyz(0, 0.62, 0)}>
          <ConicalFrustum radius_bottom={0.36} radius_top={0.48} height={1.2} />
          <StandardMaterial base_color={P.paper} perceptual_roughness={0.55} />
        </Mesh3d>
        <Mesh3d name={`ff-${k}`} allowOverlap transform={Transform.fromXyz(0, 1.235, 0)}>
          <Cylinder radius={0.45} half_height={0.02} />
          <StandardMaterial base_color={hexMix(P.coffee, P.lime, lit)} emissive={glow(P.lime, 1.8 * lit)} />
        </Mesh3d>
      </Entity>,
    );
  }
  return (
    <>
      <Mesh3d name="field-base" transform={Transform.fromXyz(YEAR_X, 0.02, -3)}>
        <Cuboid half_size={[7.6, 0.02, 6.4]} />
        <StandardMaterial base_color="#0B241A" perceptual_roughness={0.5} />
      </Mesh3d>
      {show > 0 && cups}
    </>
  );
}

/* ------------------------------------------------------------------ type: three voices from one left margin */
const FONTS = `
@font-face { font-family: "Bricolage"; src: url("${staticFile("fonts/BricolageGrotesque-latin.ttf")}"); font-weight: 200 800; }
@font-face { font-family: "Instrument"; src: url("${staticFile("fonts/InstrumentSerif-Italic-latin.ttf")}"); font-style: italic; }
@font-face { font-family: "JBMono"; src: url("${staticFile("fonts/JetBrainsMono-latin.ttf")}"); }`;
const display = (size: number, color = P.ink): React.CSSProperties => ({ fontFamily: "Bricolage", fontWeight: 800, fontSize: size, lineHeight: 0.94, letterSpacing: "-0.01em", textTransform: "uppercase", color, textShadow: "0 4px 0 rgba(0,0,0,0.45)" });
const mono = (size: number, color = P.ink): React.CSSProperties => ({ fontFamily: "JBMono", fontWeight: 700, fontSize: size, letterSpacing: "0.08em", textTransform: "uppercase", color });
const abs = (left: number, top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left, top, ...extra });
const line = (x: number, y: number, wdt: number, hgt: number, color: string, o: number) => (
  <div style={abs(x, y, { width: Math.max(1, wdt), height: Math.max(1, hgt), background: color, opacity: o })} />
);

/** The ledger: one row per layer, hung from the left margin, a hairline to the layer's left edge. */
const ROW_GAP = 118, LEDGER_TOP = 500, LEDGER_BOTTOM = 1110, JOIN_X = 476;
function Ledger({ t, cam }: { t: number; cam: ReturnType<typeof cameraAt> }) {
  // back in the point beat only once the camera has settled on the cup
  const gone = Math.max(ramp(t, B("year") - 0.35, 0.25) * (1 - ramp(t, B("point") + 0.75, 0.3)), ramp(t, LOOP_BACK - 0.2, 0.35));
  if (gone >= 1) return null;
  // targets: each layer's centre on screen, then pushed apart so rows never touch (bottom row first)
  const ys = LAYERS.map((_, i) => project(cam, [CUP_X, layerMid(i), 0])[1]);
  const rows = ys.slice();
  for (let i = 1; i < rows.length; i++) rows[i] = Math.min(rows[i], rows[i - 1] - ROW_GAP);
  const lift = Math.max(0, LEDGER_TOP - rows[rows.length - 1]);
  for (let i = 0; i < rows.length; i++) rows[i] = Math.min(LEDGER_BOTTOM, rows[i] + lift);
  return (
    <>
      {LAYERS.map((L, i) => {
        const o = Math.min(ramp(t, L.colorAt, 0.2), 1 - gone);
        if (o <= 0) return null;
        const em = emphasis(t, i);
        const ro = o * (em < 1 ? lerp(0.3, 1, em) : 1);
        const amountO = ramp(t, L.amountAt, 0.12);
        const s = Math.min(1.08, outBack(ramp(t, L.amountAt, 0.3), 2));
        const y = rows[i], ly = ys[i];
        const [ex] = project(cam, [CUP_X - rAt(layerMid(i) - BASE) * 1.02, layerMid(i), 0.0]);
        const lineCol = em > 1 ? L.color : P.muted;
        return (
          <div key={L.id}>
            <div style={abs(SAFE.left, y - 56, { width: JOIN_X - SAFE.left - 14, opacity: ro })}>
              {/* the payoff row (what Starbucks keeps) is the loud one; each label wears its layer's colour */}
              <div style={{ ...display(L.keep ? 92 : 66, L.color), opacity: amountO, transform: `scale(${s})`, transformOrigin: "left bottom", height: L.keep ? 88 : 64, marginTop: L.keep ? -24 : 0 }}>{L.amount}</div>
              {/* the layer colour lightened toward ink + a shadow: 3:1 over the green floor (red alone measured 2.5:1) */}
              <div style={{ ...mono(27, hexMix(L.color, P.ink, 0.45)), marginTop: 6, whiteSpace: "nowrap", textShadow: "0 2px 0 rgba(0,0,0,0.6)" }}>{L.label}</div>
            </div>
            {line(JOIN_X - 6, y, 18, 2, lineCol, ro)}
            {line(JOIN_X + 12, Math.min(y, ly), 2, Math.abs(ly - y) + 2, lineCol, ro)}
            {line(JOIN_X + 12, ly, ex - JOIN_X - 18, 2, lineCol, ro)}
            {line(ex - 8, ly - 4, 10, 10, L.color, ro * 0.9)}
          </div>
        );
      })}
    </>
  );
}

function Overlay({ t, cam }: { t: number; cam: ReturnType<typeof cameraAt> }) {
  const hookEnd = BEATS.hook.end;
  const titleO = Math.max(1 - ramp(t, hookEnd - 0.25, 0.25), ramp(t, DUR - 0.75, 0.3)); // after the cup is back down and the camera has settled
  // the $10 is on screen from frame 0 (the stake) and again for the last second, in the same place: the loop meets frame 0
  const figO = Math.max(1 - ramp(t, POUR_AT - 0.2, 0.3), ramp(t, DUR - 1.15, 0.25));
  // hook: "They keep 97¢" — pinned on the foam the moment the lid pops
  const foamO = Math.min(ramp(t, w("hook", "97¢"), 0.15), 1 - ramp(t, POUR_AT - 0.2, 0.3));
  // left of the cup, level with the foam (above it would sit on the whisper line)
  const [fx, fy] = project(cam, [CUP_X - SHELL_RT - 0.25, BASE + HT - 0.2, 0]);
  const tagO = Math.min(ramp(t, POUR_AT, 0.3), 1 - ramp(t, B("year") - 0.35, 0.25)) + Math.min(ramp(t, B("point") + 0.75, 0.3), 1 - ramp(t, LOOP_BACK - 0.2, 0.35));
  const yearO = Math.min(ramp(t, B("year") + 0.2, 0.3), 1 - ramp(t, B("point") - 0.3, 0.25));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <style>{FONTS}</style>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 640, backgroundImage: "linear-gradient(180deg, rgba(3,16,11,0.86) 0%, rgba(3,16,11,0.55) 50%, rgba(3,16,11,0) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 1130, width: W, height: 790, backgroundImage: "linear-gradient(180deg, rgba(3,16,11,0) 0%, rgba(3,16,11,0.74) 20%, rgba(3,16,11,0.82) 100%)" }} />

      <div style={abs(SAFE.left, SAFE.top, { display: "flex", alignItems: "center", gap: 16 })}>
        <div style={{ ...mono(26, P.bg), background: P.lime, padding: "9px 14px 8px 17px", borderRadius: 4, letterSpacing: "0.22em" }}>RECEIPTS</div>
        <div style={mono(26, P.lime)}>#008</div>
      </div>

      {titleO > 0.01 && (
        <div style={abs(SAFE.left, 324, { width: SAFE.right - SAFE.left, opacity: titleO })}>
          <div style={display(112)}>Inside a<br />Starbucks cup</div>
          <div style={{ fontFamily: "Instrument", fontStyle: "italic", fontSize: 54, color: P.lime, marginTop: 14 }}>every cent from the 2026 annual report</div>
        </div>
      )}
      {figO > 0.01 && <div style={abs(SAFE.left, 900, { opacity: figO, ...display(214, P.lime) })}>$10</div>}
      {foamO > 0.01 && (
        <div style={abs(fx - 260, fy - 48, { width: 260, textAlign: "right", opacity: foamO, transform: `scale(${Math.min(1.08, outBack(ramp(t, w("hook", "97¢"), 0.3), 2))})`, transformOrigin: "right center" })}>
          <div style={display(96, P.lime)}>97¢</div>
        </div>
      )}
      {tagO > 0.01 && <div style={abs(SAFE.left, 330, { ...mono(28, P.muted), opacity: Math.min(1, tagO) })}>where your money goes</div>}
      {yearO > 0.01 && <div style={abs(SAFE.left, 330, { ...mono(28, P.muted), opacity: yearO })}>all of Starbucks · fiscal 2026</div>}

      <Ledger t={t} cam={cam} />

      <Captions t={t} />
      <div style={abs(SAFE.left, 1372, { ...mono(28, P.muted), letterSpacing: "0.02em", width: SAFE.railX - SAFE.left, whiteSpace: "nowrap" })}>Starbucks 10-K FY2026 (SEC) · per $10: our calc.</div>
    </AbsoluteFill>
  );
}

/** Captions from the transcript. Figures already on screen are NOT repeated here (one figure, one place). */
const HIDE = new Set(["hook:$10", "hook:97¢", "cup:$3.23", "crew:$2.69", "rent:80¢", "store:$1.05", "office:$1.26", "keep:97¢"]);
const PHRASES: Word[][] = (() => {
  const out: Word[][] = [];
  for (const b of TIMINGS.beats as any[]) {
    let cur: Word[] = [], len = 0;
    for (const x of b.words as Word[]) {
      // a hidden figure always ends the phrase (its value is on screen elsewhere)
      if (HIDE.has(`${b.id}:${x.w.replace(/[.,…:?]$/, "")}`)) {
        if (cur.length) { out.push(cur); cur = []; len = 0; }
        continue;
      }
      // up to two caption lines (~30 characters), never across a sentence end
      if (cur.length && len + x.w.length > 30) { out.push(cur); cur = []; len = 0; }
      cur.push(x); len += x.w.length + 1;
      if (/[.…?]$/.test(x.w)) { out.push(cur); cur = []; len = 0; }
    }
    if (cur.length) out.push(cur);
  }
  return out;
})();
const KEYWORDS = ["keep", "keeps", "three", "third", "half"];
function Captions({ t }: { t: number }) {
  const i = PHRASES.findIndex((p, k) => t >= p[0].start - 0.05 && t < (PHRASES[k + 1]?.[0].start ?? 1e9) - 0.05 && t < p[p.length - 1].end + 0.6 && t < DUR - 0.5);
  if (i < 0) return null;
  const p = PHRASES[i];
  return (
    <div style={abs(SAFE.left, 1185, { width: SAFE.railX - SAFE.left, display: "flex", flexWrap: "wrap", columnGap: 22, rowGap: 4 })}>
      {p.map((x, k) => {
        const on = t >= x.start - 0.04;
        const hot = KEYWORDS.includes(x.w.replace(/[.,…:?]$/, "").toLowerCase());
        // words still to come: a lighter grey than P.muted, to keep 3:1 over the cup's warm layers
        return <span key={k} style={{ ...display(84, on ? (hot ? P.lime : P.ink) : "#B4C6BB") }}>{x.w}</span>;
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ the frame */
function Starbucks008() {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = cameraAt(t);
  const focus = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
  const sfx: [number, string, number][] = [[0, "boom", 0.35], ...SHOTS.slice(1, -1).map((s) => [s.t + 0.1, "whoosh", 0.32] as [number, string, number]),
    [w("hook", "97¢"), "stamp", 0.5], [POUR_AT, "whoosh", 0.5], ...LAYERS.filter((l) => !l.keep).map((l) => [l.amountAt, "pop", 0.45] as [number, string, number]),
    [LAYERS[5].amountAt, "stamp", 0.6], [w("year", "$3.7B"), "rumble", 0.4], [THIRD_AT, "pop", 0.45], [w("point", "half."), "stamp", 0.5], [LOOP_BACK, "whoosh", 0.35]];
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
      <SpotLight transform={Transform.fromXyz(CUP_X + 2, 12, 6).lookingAt([CUP_X, 3, 0])} intensity={7000000} outer_angle={0.5} inner_angle={0.24} color="#FFF4E0" shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(YEAR_X - 2, 9, 6)} intensity={2200000} color="#E4FFB0" range={24} />
      <Fog color={P.bg} near={focus * 1.2} far={focus * 2.8} />
      <Mesh3d name="floor" transform={Transform.fromXyz(12, -0.05, 0)}>
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
        <Mesh3d key={`sz-${k}`} name={`seam-z-${k}`} transform={Transform.fromXyz(12, 0.002, -15 + k * 2.5)}>
          <Cuboid half_size={[60, 0.002, 0.012]} />
          <StandardMaterial base_color="#1D5740" perceptual_roughness={0.6} />
        </Mesh3d>
      ))}
      <Cup t={t} />
      <Field t={t} />

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

registerRoot(() => <Composition id="starbucks" component={Starbucks008} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />);
