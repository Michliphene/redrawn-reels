/**
 * UNGRADED #007 — "14 reads lost to 3" (episode `reread-recall`) · study-desk art direction · raea
 *
 * Not the notebook of #004/#005, not the turntable of #006: one study desk under a lamp, two lanes. REREAD (left) has an
 * open book, RECALL (right) a closed book and a notepad. Each lane has a glass jar that holds up to 30 marbles: one
 * marble = one of the 30 "idea units" the researchers scored (marble counts are rounded, the % are the paper's).
 * The jars fill for the 5-minute test, the week passes as a day/night time-lapse (a desk calendar flips 7 days, the
 * lamp comes on at night), the jars drain to the 1-week scores, and the winner's ribbon changes lanes.
 * Behind the desk: a themed AI backdrop (art/, Nano Banana) on an opaque unlit card.
 * Every fact is in public/episodes/reread-recall/SOURCES.md.
 */
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "raea";
import { Entity, ToneMapping } from "raea/3d";
import { Cuboid, Cylinder, Mesh3d, Sphere, Torus } from "raea/mesh";
import { StandardMaterial } from "raea/pbr";
import { AmbientLight, DirectionalLight, PointLight, SpotLight } from "raea/light";
import { Quat, Transform } from "raea/transform";
import { Camera3d } from "raea/camera";
import { LinearRgba, Srgba } from "raea/color";
import TIMINGS from "./timings.json";
import GLYPHS from "./glyphs.json";

/* ================================================================== tokens */
const FPS = 30, W = 1080, H = 1920;
const SAFE = { top: 250, bottom: 1440, left: 64, right: 1016, railFrom: 860, railX: 930 };
const ZONES = { hud: { top: 250 }, title: { top: 318 }, captions: { top: 1170, bottom: 1410 } };
const C = {
  paper: "#F7F2E4", card: "#FFFDF6", back: "#EDE3CC", ink: "#1E2A5A", pencil: "#6A6A80", red: "#D9344A",
  hl: "#FFE04A", mint: "#6FDDB8", tape: "rgba(233,212,160,0.94)", note: "#FFE77A", gold: "#E8B530",
  amber: "#F0A93A", teal: "#2FA889",
};
const DUR = TIMINGS.duration + 1.7;
const TITLE = "14 reads\nlost to 3";
const WHISPER = "One week, two ways to study.";
const SOURCE = "Roediger & Karpicke, Psychological Science, 2006";
const SOURCE2 = "Dunlosky et al., Psych. Sci. Public Interest, 2013";
/* caption accents, keyed by beat (and "#n" for the nth occurrence); numbers are automatic */
const KEYWORDS = ["hook:fourteen", "hook:three.", "reread:fourteen", "five:win.", "week:flips.", "feel:knowing.", "feel:lasts.", "school:learn.", "careful:Careful:", "careful:high", "careful:low.", "do:check", "loop:group", "loop:one"];
const glow = (hex: string, k: number) => LinearRgba.from(Srgba.hex(hex)).mul(k);

/* ================================================================== time */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, at: number, d: number) => clamp01((t - at) / Math.max(1e-6, d));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = {
  out3: (x: number) => 1 - Math.pow(1 - x, 3),
  inOut3: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  back: (x: number, c = 1.9) => 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2),
};
const pop = (t: number, t0: number, d = 0.35) => (t < t0 ? 0 : ease.back(ramp(t, t0, d)));
const life = (t: number, t0: number, hold?: number, fadeIn = 0.15, fadeOut = 0.25) => {
  if (t < t0) return 0;
  const a = ramp(t, t0, fadeIn);
  return hold == null ? a : Math.min(a, 1 - ramp(t, t0 + hold, fadeOut));
};
const hit = (t: number, t0: number, attack = 0.1, release = 0.5) => (t < t0 ? 0 : t < t0 + attack ? (t - t0) / attack : 1 - ramp(t, t0 + attack, release));
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const drift = (t: number, seed = 0, speed = 1) =>
  (Math.sin(t * 0.61 * speed + seed * 1.7) + Math.sin(t * 0.37 * speed + seed * 4.1) * 0.6 + Math.sin(t * 1.13 * speed + seed * 2.3) * 0.25) / 1.85;
const rad = (d: number) => (d * Math.PI) / 180;

type Word = { w: string; start: number; end: number };
const BEATS: Record<string, { start: number; end: number; words: Word[] }> = Object.fromEntries(TIMINGS.beats.map((b: any) => [b.id, b]));
const strip = (s: string) => s.replace(/[.,…:?!"]+$/, "").replace(/^"/, "");
const w = (beat: string, word: string, n = 1) => {
  const exact = BEATS[beat]?.words.filter((x) => x.w === word) ?? [];
  const ws = exact.length ? exact : BEATS[beat]?.words.filter((x) => strip(x.w) === strip(word)) ?? [];
  if (!ws[n - 1]) throw new Error(`anchor missing: "${word}" #${n} in beat ${beat}`);
  return ws[n - 1].start;
};
const B = (beat: string) => BEATS[beat].start;

/* ================================================================== the ballpoint kit, as SVG strings (port of src/doodle/ink.tsx) */
type Pt = [number, number];
let BOIL = 0; // the tremble bucket, set per frame (changes every 3 frames)
const J = (seed: number, b: number, amp: number) => (hash(seed * 12.9898 + b * 78.233) - 0.5) * 2 * amp;
const f1 = (n: number) => n.toFixed(1);
const seg = (a: Pt, b: Pt, n = 6): Pt[] => Array.from({ length: n + 1 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n] as Pt);
const circlePts = (cx: number, cy: number, r: number, n = 16): Pt[] => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r] as Pt);
/** keep the first `k` (0–1) of a polyline's length: a stroke being written */
function partial(pts: Pt[], k: number): Pt[] {
  if (k >= 1 || pts.length < 2) return pts;
  const L: number[] = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const goal = L[L.length - 1] * k, out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (L[i] <= goal) { out.push(pts[i]); continue; }
    const u = (goal - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
    out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]);
    break;
  }
  return out;
}
type InkOpts = { seed?: number; w?: number; c?: string; fill?: string; close?: boolean; amp?: number; draw?: number; opacity?: number };
function ink(pts: Pt[], o: InkOpts = {}): string {
  const { seed = 1, w: sw = 7, c = C.ink, fill = "none", close = false, amp = 1.8, draw, opacity } = o;
  if (draw != null && draw <= 0) return "";
  let P: Pt[] = pts.map((p, i) => [p[0] + J(seed + i * 3.1, BOIL, amp), p[1] + J(seed + i * 5.7 + 1, BOIL, amp)]);
  const drawing = draw != null && draw < 1;
  if (drawing) P = partial(close ? [...P, P[0]] : P, draw!);
  const d = P.map((p, i) => `${i ? "L" : "M"}${f1(p[0])} ${f1(p[1])}`).join(" ") + (close && !drawing ? " Z" : "");
  return `<path d="${d}" fill="${drawing ? "none" : fill}" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${opacity != null ? ` opacity="${Math.max(0, opacity).toFixed(3)}"` : ""}/>`;
}
const circle = (cx: number, cy: number, r: number, o: InkOpts = {}) => ink(circlePts(cx, cy, r, Math.max(12, Math.round(r / 3))), { seed: 3, ...o, close: true, amp: Math.min(2, r * 0.06) });
const g = (body: string, tf = "", opacity?: number) => (body ? `<g${tf ? ` transform="${tf}"` : ""}${opacity != null && opacity < 1 ? ` opacity="${Math.max(0, opacity).toFixed(3)}"` : ""}>${body}</g>` : "");

/* text as glyph outlines (usvg cannot load our fonts): `hand` = Caveat Bold, `cut` = Bricolage 800 / width 75 */
type Font = "hand" | "cut";
const GL = GLYPHS as unknown as Record<Font, { upm: number; glyphs: Record<string, [number, string]> }>;
let USED: Set<string> = new Set();
const gid = (f: Font, ch: string) => `${f[0]}${ch.codePointAt(0)}`;
function measure(s: string, size: number, font: Font) {
  const F = GL[font]; let a = 0;
  for (const ch of s) a += (F.glyphs[ch] ?? F.glyphs[" "])[0];
  return (a * size) / F.upm;
}
type TxtOpts = { font?: Font; anchor?: "start" | "middle" | "end"; fill?: string; opacity?: number; tracking?: number };
function txt(s: string, x: number, y: number, size: number, o: TxtOpts = {}): string {
  const { font = "hand", anchor = "middle", fill = C.ink, opacity, tracking = 0 } = o;
  const F = GL[font], k = size / F.upm;
  const width = measure(s, size, font) + tracking * size * Math.max(0, [...s].length - 1);
  const x0 = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
  let adv = 0, uses = "";
  for (const ch of s) {
    const gl = F.glyphs[ch] ?? F.glyphs[" "];
    if (ch !== " " && gl[1]) { USED.add(`${font}:${ch}`); uses += `<use xlink:href="#${gid(font, ch)}" x="${adv.toFixed(0)}"/>`; }
    adv += gl[0] + tracking * F.upm;
  }
  return g(`<g transform="translate(${f1(x0)} ${f1(y)}) scale(${k.toFixed(5)} ${(-k).toFixed(5)})" fill="${fill}">${uses}</g>`, "", opacity);
}
const glyphDefs = () => {
  let d = "";
  for (const key of USED) { const [font, ch] = [key.slice(0, key.indexOf(":")) as Font, key.slice(key.indexOf(":") + 1)]; d += `<path id="${gid(font, ch)}" d="${GL[font].glyphs[ch][1]}"/>`; }
  return `<defs>${d}</defs>`;
};
/** handwriting on the page (it trembles with the boil); `hl` = a highlighter stroke behind it */
function hand(s: string, x: number, y: number, o: { size?: number; c?: string; anchor?: "start" | "middle" | "end"; rot?: number; opacity?: number; hl?: string } = {}) {
  const { size = 54, c = C.ink, anchor = "middle", rot = 0, opacity = 1, hl } = o;
  const r = rot + J(x + y, BOIL, 0.6);
  let body = "";
  if (hl) {
    const ww = measure(s, size, "hand") + 22, x0 = anchor === "middle" ? x - ww / 2 : anchor === "end" ? x - ww + 11 : x - 11;
    body += `<rect x="${f1(x0)}" y="${f1(y - size * 0.5)}" width="${f1(ww)}" height="${f1(size * 0.58)}" rx="6" fill="${hl}" opacity="0.85"/>`;
  }
  body += txt(s, x, y, size, { font: "hand", anchor, fill: c });
  return g(body, `rotate(${r.toFixed(2)} ${f1(x)} ${f1(y)})`, opacity);
}
const cut = (s: string, x: number, y: number, size: number, fill: string, o: { anchor?: "start" | "middle" | "end"; opacity?: number } = {}) =>
  txt(s, x, y, size, { font: "cut", anchor: o.anchor ?? "middle", fill, opacity: o.opacity, tracking: -0.01 });

/* the little guy (feet at x, y), port of <Guy> */
type Pose = { lean?: number; armL?: number; armR?: number; legL?: number; legR?: number; rot?: number; hip?: number; tilt?: number; mood?: "smile" | "sad" | "o" | "flat" };
type Joints = { hip: Pt; sh: Pt; head: Pt; handL: Pt; handR: Pt; footL: Pt; footR: Pt; R: number };
const LEG = 58, BODY = 64, ARM = 50, HEAD = 24;
function joints(p: Pose): Joints {
  const hip: Pt = [0, -LEG + (p.hip ?? 0)], lean = rad(p.lean ?? 0);
  const sh: Pt = [hip[0] + Math.sin(lean) * BODY, hip[1] - Math.cos(lean) * BODY];
  const head: Pt = [sh[0] + Math.sin(lean) * (HEAD + 9), sh[1] - Math.cos(lean) * (HEAD + 9)];
  const limb = (o: Pt, a: number, L: number): Pt => [o[0] + Math.sin(rad(a)) * L, o[1] + Math.cos(rad(a)) * L];
  return { hip, sh, head, handL: limb(sh, p.armL ?? -12, ARM), handR: limb(sh, p.armR ?? 12, ARM), footL: limb(hip, p.legL ?? -8, LEG), footR: limb(hip, p.legR ?? 8, LEG), R: HEAD };
}
function guy(x: number, y: number, o: { s?: number; pose: Pose; dir?: 1 | -1; hero?: boolean; c?: string; seed?: number; opacity?: number; props?: (j: Joints) => string }) {
  const { s = 1, pose, dir = 1, hero, c = C.ink, seed = 7, opacity = 1, props } = o;
  const j = joints(pose), [hx, hy] = j.head, mood = pose.mood ?? "flat";
  const face =
    circle(hx, hy, HEAD, { seed: seed + 3, c, w: 7, fill: hero ? C.hl : C.paper }) +
    `<circle cx="${f1(hx + 5)}" cy="${f1(hy - 4)}" r="3.4" fill="${c}"/><circle cx="${f1(hx + 15)}" cy="${f1(hy - 4)}" r="3.4" fill="${c}"/>` +
    (mood === "smile" ? ink([[hx + 2, hy + 7], [hx + 9, hy + 12], [hx + 17, hy + 7]], { seed: seed + 4, c, w: 3.5, amp: 0.6 }) : "") +
    (mood === "sad" ? ink([[hx + 2, hy + 12], [hx + 9, hy + 7], [hx + 17, hy + 12]], { seed: seed + 4, c, w: 3.5, amp: 0.6 }) : "") +
    (mood === "o" ? `<circle cx="${f1(hx + 10)}" cy="${f1(hy + 10)}" r="4" fill="none" stroke="${c}" stroke-width="3"/>` : "") +
    (mood === "flat" ? ink([[hx + 4, hy + 10], [hx + 16, hy + 10]], { seed: seed + 4, c, w: 3.5, amp: 0.5 }) : "");
  const body =
    ink([j.footL, j.hip, j.footR], { seed, c, w: 8 }) + ink(seg(j.hip, j.sh, 3), { seed: seed + 1, c, w: 8 }) + ink([j.handL, j.sh, j.handR], { seed: seed + 2, c, w: 8 }) +
    g(face, `rotate(${pose.tilt ?? 0} ${f1(hx)} ${f1(hy)})`) + (props ? props(j) : "");
  return g(body, `translate(${f1(x)} ${f1(y)}) scale(${dir * s} ${s}) rotate(${pose.rot ?? 0})`, opacity);
}
const POSE = {
  stand: (t: number, k = 0): Pose => ({ armL: -10 + Math.sin(t * 1.9 + k) * 4, armR: 12 + Math.sin(t * 1.9 + k + 1) * 4, legL: -7, legR: 7 }),
  walk: (ph: number): Pose => ({ legL: 27 * Math.sin(ph), legR: -27 * Math.sin(ph), armL: -26 * Math.sin(ph), armR: 26 * Math.sin(ph), lean: 4 }),
  cheer: (t: number): Pose => ({ armL: -155 + 12 * Math.sin(t * 13), armR: 155 - 12 * Math.sin(t * 13), legL: -13, legR: 13, mood: "smile" }),
  desk: (slump: number): Pose => ({ hip: 22, legL: 60, legR: 52, armL: 70 - slump * 30, armR: 80 - slump * 30, lean: 8 + slump * 26, tilt: slump * 18, mood: slump > 0.4 ? "sad" : "flat" }),
};
const bob = (ph: number, a = 6) => -Math.abs(Math.sin(ph)) * a;

const FONTS = `
@font-face { font-family: "BricolageCut"; src: url("${staticFile("fonts/BricolageCut.ttf")}"); }
@font-face { font-family: "Instrument"; src: url("${staticFile("fonts/InstrumentSerif-Italic-latin.ttf")}"); font-style: italic; }
@font-face { font-family: "JBMono"; src: url("${staticFile("fonts/JetBrainsMono-latin.ttf")}"); }`;
const abs = (left: number, top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left, top, ...extra });
const display = (size: number, c = C.ink): React.CSSProperties => ({ fontFamily: "BricolageCut", fontSize: size, lineHeight: 0.94, textTransform: "uppercase", color: c, letterSpacing: "-0.01em" });


/* ================================================================== paper standees */
const VB = 150;        // drawing units (SVG viewBox) per world unit
const TPX = 3;         // texture pixels per drawing unit
/* the cut: a white margin around whatever is drawn (dilated alpha), and the blank paper back (margin only) */
const CUT = (id: string, back: boolean) =>
  `<filter id="${id}" x="-15%" y="-15%" width="130%" height="130%"><feMorphology operator="dilate" radius="9" in="SourceAlpha" result="d"/>` +
  `<feFlood flood-color="${back ? C.back : C.card}"/><feComposite in2="d" operator="in" result="m"/>` +
  (back ? "" : `<feMerge><feMergeNode in="m"/><feMergeNode in="SourceGraphic"/></feMerge>`) + `</filter>`;
const TEX = new Map<string, { f: string; b: string }>();
function texture(key: string, body: () => string, wv: number, hv: number) {
  const hitTex = TEX.get(key);
  if (hitTex) return hitTex;
  USED = new Set();
  const inner = body();
  const tw = Math.min(1024, Math.round(wv * TPX)), th = Math.round((hv * tw) / wv);
  const mk = (back: boolean) =>
    "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${tw}" height="${th}" viewBox="0 0 ${f1(wv)} ${f1(hv)}">${glyphDefs()}${CUT("c", back)}` +
      `<g transform="translate(0 ${f1(hv)}) scale(1 -1)"><g filter="url(#c)">${inner}</g></g></svg>`);
  const out = { f: mk(false), b: mk(true) };
  if (TEX.size > 400) TEX.clear();
  TEX.set(key, out);
  return out;
}
type SD = { name: string; w: number; h: number; x: number; z: number; y?: number; ry?: number; tilt?: number; k: number; mode?: "hinge" | "scale"; state?: string; body: (wv: number, hv: number) => string };
function Standee({ d }: { d: SD }) {
  if (d.k <= 0.01 && !(REVEAL && d.mode !== "scale")) return null;
  const wv = d.w * VB, hv = d.h * VB;
  const stamp = `${BOIL}-${d.state ?? ""}`;
  const tex = texture(`${d.name}:${stamp}`, () => d.body(wv, hv), wv, hv);
  const hinge = d.mode === "scale" ? 0 : (1 - Math.max(0, d.k)) * Math.PI * 0.49;
  const s = d.mode === "scale" ? Math.max(0.001, d.k) : 1;
  return (
    <Entity transform={Transform.fromXyz(d.x, d.y ?? 0, d.z).withRotation(Quat.fromEuler("XYZ", 0, d.ry ?? 0, 0))}>
      <Entity transform={Transform.fromXyz(0, 0, 0).withRotation(Quat.fromEuler("XYZ", hinge, 0, d.tilt ?? 0)).withScale([s, s, s])}>
        <Mesh3d allowOverlap key={`${d.name}-f-${stamp}`} name={`${d.name}-f-${stamp}`} allowOverlap transform={Transform.fromXyz(0, d.h / 2, 0.004)}>
          <Cuboid half_size={[d.w / 2, d.h / 2, 0.002]} />
          <StandardMaterial base_color="#FFFFFF" base_color_texture={tex.f} alpha_mode={{ Mask: 0.5 }} perceptual_roughness={0.92} />
        </Mesh3d>
        <Mesh3d allowOverlap key={`${d.name}-b-${stamp}`} name={`${d.name}-b-${stamp}`} allowOverlap transform={Transform.fromXyz(0, d.h / 2, -0.004)}>
          <Cuboid half_size={[d.w / 2, d.h / 2, 0.002]} />
          <StandardMaterial base_color="#FFFFFF" base_color_texture={tex.b} alpha_mode={{ Mask: 0.5 }} perceptual_roughness={0.95} />
        </Mesh3d>
      </Entity>
    </Entity>
  );
}
const M = ({ c, r = 0.6, m = 0 }: { c: string; r?: number; m?: number }) => <StandardMaterial base_color={c} perceptual_roughness={r} metallic={m} />;
const q = (b: number) => Math.round(b * 12) / 12; // a drawing progress, quantised so textures repeat

/* ------------------------------------------------------------------ drawing helpers (drawing units, y down) */
const cutTxt = (s: string, x: number, y: number, size: number, fill = C.ink, anchor: "start" | "middle" | "end" = "middle") => txt(s, x, y, size, { font: "cut", anchor, fill, tracking: -0.01 });
/** a figure filling a standee: feet at the bottom centre */
const fig = (wv: number, hv: number, o: Parameters<typeof guy>[2]) => guy(wv / 2, hv - 10, o);
const tie = (j: Joints) => ink([[j.sh[0] - 2, j.sh[1] + 4], [j.sh[0] + 6, j.sh[1] + 30], [j.sh[0] - 1, j.sh[1] + 38], [j.sh[0] - 8, j.sh[1] + 30]], { seed: 77, w: 4, c: C.red, fill: C.red, close: true, amp: 0.5 });
const crown = (j: Joints) => { const [x, y] = j.head; return ink([[x - 20, y - 18], [x - 22, y - 46], [x - 9, y - 32], [x, y - 52], [x + 9, y - 32], [x + 22, y - 46], [x + 20, y - 18]], { seed: 78, w: 5, c: C.ink, fill: C.gold, close: true, amp: 0.6 }); };
const gradCap = (seed: number) => (j: Joints) => {
  const [x, y] = j.head;
  return ink([[x - 34, y - 26], [x, y - 40], [x + 34, y - 26], [x, y - 14]], { seed, w: 5, fill: C.ink, close: true, amp: 0.5 }) +
    ink([[x + 4, y - 27], [x + 26, y - 20], [x + 28, y - 2]], { seed: seed + 1, w: 3.5, c: C.gold, amp: 0.4 });
};
const bubble = (wv: number, hv: number, tail: "left" | "right" | "none", seed: number, fill = "#FFFFFF") => {
  const pad = 14, bh = hv - (tail === "none" ? pad : 46);
  const pts: Pt[] = [[pad + 20, pad], [wv - pad - 20, pad], [wv - pad, pad + 20], [wv - pad, bh - 20], [wv - pad - 20, bh]];
  if (tail === "right") pts.push([wv * 0.72, bh], [wv * 0.82, hv - pad], [wv * 0.6, bh]);
  if (tail === "left") pts.push([wv * 0.4, bh], [wv * 0.18, hv - pad], [wv * 0.28, bh]);
  pts.push([pad + 20, bh], [pad, bh - 20], [pad, pad + 20]);
  return ink(pts, { seed, w: 5, fill, close: true, amp: 1.2 });
};
const lines = (x: number, y: number, n: number, len: number, gap: number, seed: number, k = 1) => {
  let s = "";
  for (let i = 0; i < n; i++) {
    const kk = clamp01(k * n - i);
    if (kk <= 0) break;
    s += ink(seg([x, y + i * gap], [x + len * (0.6 + hash(seed + i) * 0.4), y + i * gap], 4), { seed: seed + i, w: 3.5, c: C.pencil, amp: 0.8, draw: kk });
  }
  return s;
};
const strike = (x0: number, x1: number, y: number, seed: number, k: number) => ink(seg([x0, y + 4], [x1, y - 8], 5), { seed, w: 7, c: C.red, draw: k });
const tick = (x: number, y: number, seed: number, k: number, c = "#18A57A") => ink([[x, y], [x + 16, y + 18], [x + 46, y - 22]], { seed, w: 8, c, draw: k });
const FOV = 36;

let REVEAL = false; // used by the standee kit (folded standees stay drawn while true); always false here
type V3 = [number, number, number];

/* ================================================================== cues (by word) */
const NEVER = 1e9;
const CUE = {
  fourteen: w("hook", "fourteen"), three: w("hook", "three."), weekLater: w("hook", "week"), who: w("hook", "who"),
  y2006: w("study", "2006,"), students: w("study", "180"), text: w("study", "text."),
  g1: w("reread", "Group"), fiveMin: w("reread", "five"), again1: w("reread", "again.", 1), again2: w("reread", "again.", 2), about14: w("reread", "fourteen"),
  g2: w("recall", "Group"), once: w("recall", "once,"), closes: w("recall", "closes"), writes: w("recall", "writes"), threeT: w("recall", "Three"), noCorr: w("recall", "corrections."),
  fiveLater: w("five", "Five"), win: w("five", "win."), p83: w("five", "83%"), p71: w("five", "71%."),
  surer: w("sure", "surer"), nextWeek: w("sure", "week."),
  wait: w("week", "wait"), flips: w("week", "flips."),
  p40: w("flip", "40%."), p61: w("flip", "61%."),
  knowing: w("feel", "knowing."), lasts: w("feel", "lasts."),
  checks: w("school", "checks"), outHere: w("school", "Out"), howLearn: w("school", "how"),
  careful: w("careful", "Careful:"), lab: w("careful", "lab,"), college: w("careful", "college"), shortT: w("careful", "texts."),
  review: w("careful", "review"), practice: w("careful", "Practice"), high: w("careful", "high"), rereadLow: w("careful", "Rereading:"), low: w("careful", "low."),
  close: w("do", "close"), write: w("do", "Write"), check: w("do", "check"),
  tryIt: w("loop", "Try"), scroll: w("loop", "scrolling"), howMany: w("loop", "How"),
};
const PHASE = (t: number): "pre" | "five" | "week" => (t < CUE.fiveLater - 0.15 || t >= CUE.tryIt ? "pre" : t < CUE.wait ? "five" : "week");

/* ================================================================== layout (world units, desk top at y = 0) */
const LANE = 0.72;                    // lane centres at x = ∓LANE (REREAD left, RECALL right)
const JAR = { z: -0.32, r: 0.3, h: 0.86 };
const CARD = { w: 1.2, h: 0.95, y: 0.6, z: JAR.z + JAR.r + 0.06 };
const BOOK = { z: 0.78 };
const RULE = { x: 0, z: 1.05, w: 2.3, h: 1.55 };
const KICKERS = [
  { text: "The study", from: B("study") + 0.1, to: B("reread") },
  { text: "Group 1 · reread", from: B("reread") + 0.05, to: B("recall") },
  { text: "Group 2 · recall", from: B("recall") + 0.05, to: B("five") },
  { text: "Test · 5 min later", from: B("five") + 0.05, to: CUE.wait - 0.1 },
  { text: "1 week later · new students", from: CUE.wait - 0.1, to: B("feel") },
  { text: "The flip", from: B("feel") + 0.05, to: CUE.outHere - 0.1 },
  { text: "Out here", from: CUE.outHere, to: B("careful") },
  { text: "Careful", from: B("careful"), to: B("do") },
  { text: "Do this", from: B("do") + 0.05, to: B("loop") },
  { text: "Pop quiz", from: B("loop") + 0.05, to: DUR - 0.6 },
];

/* ================================================================== marbles: one per idea unit (30 per jar) */
const SLOTS: V3[] = (() => {
  const out: V3[] = [];
  for (let layer = 0; out.length < 30; layer++) {
    const y = 0.09 + layer * 0.128, rot = layer % 2 ? Math.PI / 6 : 0;
    out.push([0, y + 0.01, 0]);
    for (let k = 0; k < 6 && out.length < 30; k++) out.push([Math.cos(rot + (k * Math.PI) / 3) * 0.152, y + (hash(layer * 7 + k) - 0.5) * 0.02, Math.sin(rot + (k * Math.PI) / 3) * 0.152]);
  }
  return out;
})();
/** each marble's [in, out] times: the 5-min fill, the week's drain (top marbles first), and the reset for the loop */
function marbleTimes(fill: number, keep: number, fillEnd: number, drainEnd: number): [number, number][] {
  const out: [number, number][] = [];
  const f0 = CUE.fiveLater + 0.05, d0 = CUE.wait + 0.1;
  for (let i = 0; i < fill; i++) {
    const tin = f0 + (i / Math.max(1, fill - 1)) * (fillEnd - f0);
    const tout = i >= keep ? d0 + ((fill - 1 - i) / Math.max(1, fill - keep - 1)) * (drainEnd - d0) : CUE.tryIt + 0.1 + ((keep - 1 - i) / keep) * 0.7;
    out.push([tin, tout]);
  }
  return out;
}
const MT_L = marbleTimes(25, 12, CUE.p83 - 0.05, CUE.p40 - 0.05);   // 83% → 40% of 30 (rounded: 25 → 12)
const MT_R = marbleTimes(21, 18, CUE.p71 - 0.05, CUE.p61 - 0.05);   // 71% → 61% of 30 (rounded: 21 → 18)
const countAt = (mt: [number, number][], t: number) => mt.filter(([a, b]) => t >= a + 0.3 && t < b).length;

function Jar({ x, t, mt, c, name }: { x: number; t: number; mt: [number, number][]; c: string; name: string }) {
  const out: JSX.Element[] = [];
  mt.forEach(([tin, tout], i) => {
    if (t < tin || t > tout + 0.5) return;
    const [sx, sy, sz] = SLOTS[i];
    const fall = ease.out3(ramp(t, tin, 0.3)), bounce = Math.sin(Math.PI * ramp(t, tin + 0.3, 0.18)) * 0.025;
    const leave = ease.inOut3(ramp(t, tout, 0.5));
    const y = lerp(sy + 1.25, sy, fall) + bounce + leave * 0.95, s = 1 - leave;
    if (s <= 0.01) return;
    out.push(
      <Mesh3d allowOverlap key={`${name}-m${i}`} name={`${name}-m${i}`} allowOverlap transform={Transform.fromXyz(x + sx + leave * (hash(i) - 0.5) * 0.6, y, JAR.z + sz).withScale([s, s, s])}>
        <Sphere radius={0.07} />
        <StandardMaterial base_color={c} perceptual_roughness={0.18} metallic={0.05} clearcoat={1} />
      </Mesh3d>,
    );
  });
  return (
    <>
      <Mesh3d allowOverlap name={`${name}-base`} transform={Transform.fromXyz(x, 0.012, JAR.z)}><Cylinder radius={JAR.r + 0.01} half_height={0.012} /><StandardMaterial base_color={Srgba.hex("#DDEFF5").with_alpha(0.55)} alpha_mode="Blend" perceptual_roughness={0.05} /></Mesh3d>
      {out}
      <Mesh3d allowOverlap name={`${name}-glass`} transform={Transform.fromXyz(x, JAR.h / 2, JAR.z)}><Cylinder radius={JAR.r} half_height={JAR.h / 2} /><StandardMaterial base_color={Srgba.hex("#E4F4FA").with_alpha(0.16)} alpha_mode="Blend" perceptual_roughness={0.04} /></Mesh3d>
      <Mesh3d allowOverlap name={`${name}-rim`} transform={Transform.fromXyz(x, JAR.h, JAR.z).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}><Torus major_radius={JAR.r} minor_radius={0.022} /><StandardMaterial base_color={Srgba.hex("#E8F6FB").with_alpha(0.6)} alpha_mode="Blend" perceptual_roughness={0.05} /></Mesh3d>
    </>
  );
}

/* ================================================================== the two cards above the jars */
const tally = (x: number, y: number, n: number, lit: number, seed: number) => {
  let s = "";
  for (let i = 0; i < n; i++) {
    const grp = Math.floor(i / 5), k = i % 5, gx = x + grp * 46;
    const on = i < lit;
    s += k < 4
      ? ink([[gx + k * 9, y], [gx + k * 9 + 2, y + 30]], { seed: seed + i, w: 5, c: on ? C.red : C.ink, amp: 0.8 })
      : ink([[gx - 5, y + 24], [gx + 34, y + 6]], { seed: seed + i, w: 5, c: on ? C.red : C.ink, amp: 0.8 });
  }
  return s;
};
function laneCard(side: "L" | "R", t: number): JSX.Element | null {
  const L = side === "L", ph = PHASE(t);
  const reads = L ? clamp01((t - CUE.fiveMin) / (CUE.about14 + 0.25 - CUE.fiveMin)) : 0;
  const lit = L && t >= CUE.fiveMin && t < B("recall") ? Math.round(reads * 14) : 0;
  const tests = !L && t >= CUE.writes - 0.1 && t < B("five") ? Math.min(3, 1 + Math.floor((t - CUE.writes + 0.1) / ((CUE.noCorr - CUE.writes) / 3))) : 0;
  const pctAt = L ? (ph === "five" ? CUE.p83 : CUE.p40) : (ph === "five" ? CUE.p71 : CUE.p61);
  const pct = ph === "five" ? (L ? "83%" : "71%") : (L ? "40%" : "61%");
  const showPct = ph !== "pre" && t >= pctAt - 0.05;
  const sure = ph === "five" && t >= CUE.surer - 0.05;
  const feel = t >= (L ? CUE.knowing : CUE.lasts) - 0.1 && t < B("school") + 0.3;
  const quiz = L && t >= CUE.tryIt - 0.05;
  const state = `${ph}-${lit}-${tests}-${+showPct}-${+sure}-${+feel}-${+quiz}`;
  const k = 1 - 0.85 * ease.inOut3(ramp(t, B("school") - 0.1, 0.3)) * (1 - ease.inOut3(ramp(t, B("do") - 0.2, 0.4)));
  return (
    <Standee key={`card${side}`} d={{ name: `card${side}`, w: CARD.w, h: CARD.h, x: L ? -LANE : LANE, y: CARD.y, z: CARD.z, tilt: L ? 0.03 : -0.03, mode: "scale", k, state, body: (wv, hv) => {
      let s = ink([[12, 12], [wv - 12, 12], [wv - 12, hv - 12], [12, hv - 12]], { seed: L ? 700 : 720, w: 5, fill: "#FFFFFF", close: true, amp: 0.8 });
      s += ink([[12, 12], [wv - 12, 12], [wv - 12, 50], [12, 50]], { seed: L ? 701 : 721, w: 4, fill: L ? C.amber : C.teal, close: true, amp: 0.6 });
      s += cutTxt(L ? "REREAD" : "RECALL", 26, 42, 30, "#FFFFFF", "start");
      if (ph !== "pre" || !L) s += hand(ph === "pre" ? "1 sitting" : ph === "five" ? "5 min" : "1 week", wv - 20, 40, { size: 22, anchor: "end", c: "#FFFFFF" });
      if (ph === "pre") {
        if (L) {
          s += hand(quiz ? "read it ×?" : "read it ×14", 22, 94, { size: 34, anchor: "start" });
          if (!quiz) s += tally(18, 104, 14, lit, 740);
        } else {
          s += hand("read it ×3", 22, 94, { size: 34, anchor: "start" });
          s += hand(t >= CUE.closes - 0.1 && t < B("five") + 1 ? `then recall it ×${Math.max(1, tests)}` : "", 22, 128, { size: 22, anchor: "start", c: tests ? "#127E5E" : C.pencil });
        }
      } else {
        s += showPct ? cutTxt(pct, wv / 2, 112, 70, L ? (ph === "five" ? C.ink : C.red) : ph === "week" ? "#127E5E" : C.ink) : hand("…", wv / 2, 104, { size: 60, c: C.pencil });
        if (sure) s += hand(`feel sure: ${L ? "4.8" : "4.0"}/7`, wv / 2, hv - 26, { size: 28, c: C.pencil });
        if (feel) s += hand(L ? "feels like knowing" : "what lasts", wv / 2, hv - 14, { size: 24, c: L ? C.pencil : "#127E5E", hl: L ? undefined : C.mint });
      }
      return s;
    } }} />
  );
}
/** the winner's rosette: on the rereaders' card at "win.", on the testers' card from "61%." */
function Rosette({ t }: { t: number }) {
  const onL = t >= CUE.win - 0.05 && t < CUE.flips + 0.1, onR = t >= CUE.p61 && t < B("school") - 0.1;
  if (!onL && !onR) return null;
  const at = onL ? CUE.win - 0.05 : CUE.p61, x = onL ? -LANE : LANE;
  const k = pop(t, at, 0.4) * (onL ? 1 - ease.inOut3(ramp(t, CUE.flips - 0.15, 0.25)) : 1);
  return <Standee key={`ros${onL ? "L" : "R"}`} d={{ name: `ros${onL ? "L" : "R"}`, w: 0.5, h: 0.62, x: onL ? x + CARD.w / 2 - 0.12 : x - CARD.w / 2 + 0.12, y: CARD.y + CARD.h - 0.12, z: CARD.z + 0.06, tilt: -0.12, mode: "scale", k, body: (wv, hv) =>
    ink([[wv * 0.32, hv * 0.55], [wv * 0.18, hv - 8], [wv * 0.42, hv * 0.62]], { seed: 801, w: 4, fill: C.red, close: true, amp: 0.4 }) +
    ink([[wv * 0.68, hv * 0.55], [wv * 0.82, hv - 8], [wv * 0.58, hv * 0.62]], { seed: 802, w: 4, fill: C.red, close: true, amp: 0.4 }) +
    circle(wv / 2, hv * 0.36, wv * 0.36, { seed: 803, w: 5, fill: C.gold }) + cutTxt("WINS", wv / 2, hv * 0.36 + 9, 24) }} />;
}

/* ================================================================== the week: a desk calendar between the jars */
const WEEK = { from: () => CUE.wait - 0.05, to: () => CUE.flips + 0.15 };
const dayAt = (t: number) => 1 + Math.min(6, Math.floor(7 * ramp(t, WEEK.from(), WEEK.to() - WEEK.from())));
function Calendar({ t }: { t: number }) {
  const k = pop(t, CUE.wait - 0.25, 0.35) * (1 - ease.inOut3(ramp(t, B("feel") - 0.2, 0.3)));
  if (k <= 0.01) return null;
  const d = t < WEEK.from() ? 0 : dayAt(t);
  return <Standee key="cal" d={{ name: "cal", w: 0.6, h: 0.66, x: 0, y: 0.02, z: CARD.z + 0.22, mode: "scale", k, state: `${d}`, body: (wv, hv) =>
    ink([[10, 10], [wv - 10, 10], [wv - 10, hv - 10], [10, hv - 10]], { seed: 820, w: 4, fill: "#FFFFFF", close: true, amp: 0.6 }) +
    ink([[10, 10], [wv - 10, 10], [wv - 10, 34], [10, 34]], { seed: 821, w: 4, fill: C.red, close: true, amp: 0.5 }) +
    cutTxt("DAY", wv / 2, 30, 20, "#FFFFFF") + cutTxt(d ? `${d}` : "0", wv / 2, hv - 22, 64) }} />;
}

/* ================================================================== the books */
const PAGE_TEX = (() => {
  BOIL = 0;
  return texture("page", () => ink([[4, 4], [146, 4], [146, 196], [4, 196]], { seed: 900, w: 2, fill: "#FBF8EF", close: true, amp: 0 }) + lines(16, 26, 8, 116, 20, 901), 150, 200).f;
})();
function Page({ name, x, z, rz, s = 1 }: { name: string; x: number; z: number; rz: number; s?: number }) {
  return (
    <Entity transform={Transform.fromXyz(x, 0.075, z).withRotation(Quat.fromEuler("XYZ", 0, 0, rz))}>
      <Mesh3d allowOverlap name={name} transform={Transform.fromXyz(0.2 * s, 0, 0)}><Cuboid half_size={[0.2, 0.004, 0.27]} /><StandardMaterial base_color="#FFFFFF" base_color_texture={PAGE_TEX} perceptual_roughness={0.9} /></Mesh3d>
    </Entity>
  );
}
function Books({ t }: { t: number }) {
  const out: JSX.Element[] = [];
  const bx = -LANE, closeK = ease.inOut3(ramp(t, CUE.close - 0.05, 0.45)) * (1 - ease.inOut3(ramp(t, CUE.tryIt + 0.3, 0.4)));
  // REREAD: an open book; one page turns over and over while they reread (≈14 times over the beat)
  out.push(<Mesh3d allowOverlap key="bl-cover-l" name="bl-cover-l" transform={Transform.fromXyz(bx - 0.21, 0.02, BOOK.z)}><Cuboid half_size={[0.22, 0.02, 0.29]} /><M c="#B9442F" r={0.7} /></Mesh3d>);
  out.push(<Mesh3d allowOverlap key="bl-pages-l" name="bl-pages-l" transform={Transform.fromXyz(bx - 0.2, 0.055, BOOK.z)}><Cuboid half_size={[0.2, 0.016, 0.27]} /><M c="#F4EEDD" r={0.9} /></Mesh3d>);
  out.push(<Page key="bl-p-l" name="bl-p-l" x={bx} z={BOOK.z} rz={Math.PI} />);
  out.push(
    <Entity key="bl-right" transform={Transform.fromXyz(bx, 0.0, BOOK.z).withRotation(Quat.fromEuler("XYZ", 0, 0, closeK * Math.PI * 0.98))}>
      <Mesh3d allowOverlap name="bl-cover-r" transform={Transform.fromXyz(0.21, 0.02, 0)}><Cuboid half_size={[0.22, 0.02, 0.29]} /><M c="#B9442F" r={0.7} /></Mesh3d>
      <Mesh3d allowOverlap name="bl-pages-r" transform={Transform.fromXyz(0.2, 0.055, 0)}><Cuboid half_size={[0.2, 0.016, 0.27]} /><M c="#F4EEDD" r={0.9} /></Mesh3d>
      <Page name="bl-p-r" x={0} z={0} rz={0} />
    </Entity>,
  );
  const flipN = 14, f0 = CUE.fiveMin - 0.1, f1 = CUE.about14 + 0.2;
  const u = ramp(t, f0, f1 - f0) * flipN, fk = t > f0 && t < f1 ? ease.inOut3(u - Math.floor(u)) : 0;
  if (fk > 0.01) out.push(<Page key="bl-flip" name="bl-flip" x={bx} z={BOOK.z} rz={fk * Math.PI} />);
  // RECALL: the book is closed after one read (on "closes"), the notepad gets three rounds of writing
  const rx = LANE - 0.3, openK = 1 - ease.inOut3(ramp(t, CUE.closes - 0.1, 0.35));
  const openB = t < B("recall") ? 0 : openK;
  out.push(<Mesh3d allowOverlap key="br-cover" name="br-cover" transform={Transform.fromXyz(rx, 0.02, BOOK.z - 0.05).withRotation(Quat.fromEuler("XYZ", 0, 0.25, 0))}><Cuboid half_size={[0.22, 0.02, 0.29]} /><M c="#2E6B8F" r={0.7} /></Mesh3d>);
  out.push(<Mesh3d allowOverlap key="br-pages" name="br-pages" transform={Transform.fromXyz(rx, 0.06, BOOK.z - 0.05).withRotation(Quat.fromEuler("XYZ", 0, 0.25, 0))}><Cuboid half_size={[0.2, 0.022, 0.27]} /><M c="#F4EEDD" r={0.9} /></Mesh3d>);
  out.push(
    <Entity key="br-lid" transform={Transform.fromXyz(rx - 0.22 * Math.cos(0.25), 0.085, BOOK.z - 0.05 + 0.22 * Math.sin(0.25)).withRotation(Quat.fromEuler("XYZ", 0, 0.25, -openB * Math.PI * 0.85))}>
      <Mesh3d allowOverlap name="br-top" transform={Transform.fromXyz(0.22, 0.01, 0)}><Cuboid half_size={[0.22, 0.016, 0.29]} /><M c="#2E6B8F" r={0.7} /></Mesh3d>
    </Entity>,
  );
  // the notepad: lines are written in three rounds during "writes … Three times", again on "Write" (do)
  const round = (a: number, b: number) => clamp01((t - a) / Math.max(0.1, b - a));
  const r1 = t < B("five") ? round(CUE.writes, CUE.noCorr + 0.4) * 3 : t >= CUE.write - 0.05 && t < CUE.tryIt + 0.3 ? round(CUE.write, CUE.check) : 0;
  const ln = Math.min(1, r1 - Math.floor(Math.min(r1, 2.999)));
  const nState = `${Math.floor(Math.min(r1, 2.999))}-${q(ln)}-${+(t >= CUE.check && t < CUE.tryIt + 0.3)}`;
  out.push(<Standee key="pad" d={{ name: "pad", w: 0.62, h: 0.78, x: LANE + 0.28, y: 0.02, z: BOOK.z + 0.06, ry: -0.2, tilt: 0.04, mode: "scale", k: 1 - ease.inOut3(ramp(t, B("five") - 0.2, 0.35)) * (1 - ease.inOut3(ramp(t, B("do") - 0.3, 0.35))), state: nState, body: (wv, hv) => {
    let s = ink([[8, 8], [wv - 8, 8], [wv - 8, hv - 8], [8, hv - 8]], { seed: 940, w: 4, fill: "#FFFBE8", close: true, amp: 0.5 });
    s += ink([[8, 26], [wv - 8, 26]], { seed: 941, w: 3, c: C.red, amp: 0.3 });
    s += lines(16, 46, 4, wv - 34, 16, 942 + Math.floor(Math.min(r1, 2.999)) * 9, r1 > 0 ? ln : 1);
    if (t >= CUE.check && t < CUE.tryIt + 0.3) s += tick(wv - 50, 70, 950, ramp(t, CUE.check, 0.25), C.red);
    return s;
  } }} />);
  // the pencil follows the writing
  const writing = (t >= CUE.writes - 0.1 && t < CUE.noCorr + 0.5) || (t >= CUE.write - 0.1 && t < CUE.check + 0.3);
  const px = LANE + 0.3 + (writing ? Math.sin(t * 9) * 0.12 : 0.28), pz = BOOK.z + 0.2 + (writing ? (ln - 0.5) * 0.2 : 0.1);
  out.push(
    <Entity key="pencil" transform={Transform.fromXyz(px, writing ? 0.28 : 0.03, pz).withRotation(Quat.fromEuler("XYZ", writing ? 0.5 : Math.PI / 2, 0.6, writing ? -0.3 : 0))}>
      <Mesh3d allowOverlap name="pencil-body"><Cylinder radius={0.022} half_height={0.24} /><M c={C.gold} r={0.5} /></Mesh3d>
      <Mesh3d allowOverlap name="pencil-tip" transform={Transform.fromXyz(0, -0.25, 0)}><Sphere radius={0.02} /><M c="#2A2A33" r={0.4} /></Mesh3d>
    </Entity>,
  );
  return <>{out}</>;
}

/* ================================================================== the rule card (school, careful): it flips for each idea */
function RuleCard({ t }: { t: number }) {
  const k = pop(t, B("school") - 0.15, 0.45) * (1 - ease.inOut3(ramp(t, B("do") - 0.25, 0.35)));
  if (k <= 0.01) return null;
  const flips = [CUE.outHere - 0.2, CUE.careful - 0.2, CUE.review - 0.2];
  let side = 0, ry = 0;
  flips.forEach((at, i) => { const f = ramp(t, at, 0.4); if (f > 0) { const e = ease.inOut3(f); if (e >= 0.5) side = i + 1; ry = f >= 1 ? 0 : (e < 0.5 ? e : e - 1) * Math.PI; } });
  const state = `${side}-${+(t >= CUE.lab)}${+(t >= CUE.college)}${+(t >= CUE.shortT)}-${+(t >= CUE.high)}${+(t >= CUE.low)}`;
  return <Standee key="rule" d={{ name: "rule", w: RULE.w, h: RULE.h, x: RULE.x, y: 0.02, z: RULE.z, ry, mode: "hinge", k, state, body: (wv, hv) => {
    let s = ink([[14, 14], [wv - 14, 14], [wv - 14, hv - 14], [14, hv - 14]], { seed: 980 + side, w: 6, fill: "#FFFFFF", close: true, amp: 0.9 });
    const head = (txt0: string, c: string) => ink([[14, 14], [wv - 14, 14], [wv - 14, 60], [14, 60]], { seed: 990 + side, w: 5, fill: c, close: true, amp: 0.6 }) + cutTxt(txt0, 34, 50, 34, "#FFFFFF", "start");
    if (side === 0) {
      s += head("AT SCHOOL", C.pencil);
      s += cutTxt("A TEST", wv / 2, 124, 56) + cutTxt("CHECKS WHAT", wv / 2, 172, 40) + cutTxt("YOU LEARNED", wv / 2, 212, 40);
    } else if (side === 1) {
      s += head("OUT HERE", C.teal);
      s += cutTxt("THE TEST", wv / 2, 124, 56) + hand("is how you learn", wv / 2, 190, { size: 50, hl: C.mint });
    } else if (side === 2) {
      s += head("CAREFUL", C.red);
      const items: [number, string][] = [[CUE.lab, "one lab"], [CUE.college, "college students"], [CUE.shortT, "short texts"]];
      items.forEach(([at, label], i) => { if (t >= at) s += hand(`· ${label}`, 40, 108 + i * 44, { size: 40, anchor: "start" }); });
    } else {
      s += head("2013 REVIEW", C.ink);
      s += hand("practice tests", 40, 118, { size: 42, anchor: "start" });
      if (t >= CUE.high) s += cutTxt("HIGH", wv - 40, 120, 42, "#127E5E", "end");
      s += hand("rereading", 40, 186, { size: 42, anchor: "start" });
      if (t >= CUE.low) s += cutTxt("LOW", wv - 40, 188, 42, C.red, "end");
    }
    return s;
  } }} />;
}

/* ================================================================== the desk, the lamp, the backdrop */
const BG = { z: -4.2, w: 10.5, y: 2.4 };
const nightAt = (t: number) => {
  const a = WEEK.from(), b = WEEK.to();
  if (t < a - 0.2 || t > b + 0.4) return 0;
  const env = Math.min(ramp(t, a - 0.2, 0.3), 1 - ramp(t, b, 0.4));
  return env * (0.4 - 0.15 * Math.cos(Math.PI * 2 * 7 * ramp(t, a, b - a)));
};
const mixHex = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(lerp(v, y[i], k)).toString(16).padStart(2, "0")).join("");
};
function Desk({ t }: { t: number }) {
  const night = nightAt(t);
  return (
    <>
      <Mesh3d allowOverlap name="bg" transform={Transform.fromXyz(0, BG.y, BG.z)}>
        <Cuboid half_size={[BG.w / 2, (BG.w * 8) / 9, 0.02]} />
        <StandardMaterial base_color={mixHex("#B8B8B8", "#2C3658", night)} base_color_texture={staticFile("art/bg-study.png")} unlit />
      </Mesh3d>
      <Mesh3d allowOverlap name="desk-top" transform={Transform.fromXyz(0, -0.06, 2.6)}><Cuboid half_size={[3.4, 0.06, 4.4]} /><M c="#8A5A34" r={0.55} /></Mesh3d>
      <Mesh3d allowOverlap name="desk-edge" transform={Transform.fromXyz(0, -0.13, 6.99)}><Cuboid half_size={[3.4, 0.07, 0.02]} /><M c="#5E3A22" r={0.6} /></Mesh3d>
      {[-2.2, -0.9, 0.5, 1.9].map((x, k) => (
        <Mesh3d allowOverlap key={k} name={`grain-${k}`} allowOverlap transform={Transform.fromXyz(x, 0.0005, 2.6)}><Cuboid half_size={[0.012, 0.0005, 4.39]} /><M c="#76482A" r={0.6} /></Mesh3d>
      ))}
      {/* the desk lamp, back left: its bulb glows when the room goes dark */}
      <Entity transform={Transform.fromXyz(-1.55, 0, -1.55)}>
        <Mesh3d allowOverlap name="lamp-base"><Cylinder radius={0.2} half_height={0.03} /><M c="#2A2A33" r={0.35} m={0.6} /></Mesh3d>
        <Mesh3d allowOverlap name="lamp-arm" transform={Transform.fromXyz(0.1, 0.55, 0).withRotation(Quat.fromEuler("XYZ", 0, 0, -0.35))}><Cylinder radius={0.022} half_height={0.56} /><M c="#2A2A33" r={0.35} m={0.6} /></Mesh3d>
        <Mesh3d allowOverlap name="lamp-shade" transform={Transform.fromXyz(0.42, 1.06, 0.12).withRotation(Quat.fromEuler("XYZ", 0.3, 0, -1.0))}><Cylinder radius={0.17} half_height={0.13} /><M c="#D9344A" r={0.45} m={0.2} /></Mesh3d>
        <Mesh3d allowOverlap name="lamp-bulb" transform={Transform.fromXyz(0.55, 0.97, 0.16)}><Sphere radius={0.07} /><StandardMaterial base_color="#FFF1C8" emissive={glow("#FFE3A6", 2 + 10 * night)} /></Mesh3d>
      </Entity>
    </>
  );
}

/* ================================================================== camera: a few held shots, eased between beats */
type Shot = { look: V3; dist: number; pitch: number; yaw: number };
const S0: Shot = { look: [0, 0.68, -0.1], dist: 8.6, pitch: 15, yaw: 0 };
const SHOTS: [number, Shot][] = [
  [0, S0],
  [B("study") - 0.1, { look: [0, 0.68, -0.1], dist: 8.3, pitch: 16, yaw: -2 }],
  [B("reread") - 0.15, { look: [-LANE + 0.05, 0.55, 0.25], dist: 5.6, pitch: 18, yaw: -7 }],
  [B("recall") - 0.15, { look: [LANE + 0.1, 0.55, 0.3], dist: 5.6, pitch: 18, yaw: 7 }],
  [B("five") - 0.15, { look: [0, 0.66, -0.1], dist: 8.2, pitch: 15, yaw: 0 }],
  [CUE.wait - 0.2, { look: [0, 0.72, -0.2], dist: 9.2, pitch: 20, yaw: 0 }],
  [CUE.flips, { look: [0, 0.66, -0.1], dist: 7.9, pitch: 15, yaw: 0 }],
  [B("school") - 0.2, { look: [0, 0.55, RULE.z], dist: 7.7, pitch: 9, yaw: 0 }],
  [B("do") - 0.2, { look: [0.12, 0.45, 0.35], dist: 7.5, pitch: 24, yaw: 0 }],
  [B("loop") + 0.2, { look: [0, 0.68, -0.1], dist: 8.4, pitch: 15, yaw: 0 }],
  [DUR - 0.9, S0],
];
const MOVE = 0.75;
function cameraAt(t: number): { pos: V3; look: V3 } {
  let cur = SHOTS[0][1];
  for (let i = 1; i < SHOTS.length; i++) {
    const [at, s] = SHOTS[i];
    if (t < at) break;
    const k = ease.inOut3(ramp(t, at, i === SHOTS.length - 1 ? 0.85 : MOVE));
    cur = { look: [lerp(cur.look[0], s.look[0], k), lerp(cur.look[1], s.look[1], k), lerp(cur.look[2], s.look[2], k)], dist: lerp(cur.dist, s.dist, k), pitch: lerp(cur.pitch, s.pitch, k), yaw: lerp(cur.yaw, s.yaw, k) };
  }
  const punch = hit(t, CUE.win, 0.12, 0.6) * 0.05 + hit(t, CUE.flips, 0.1, 0.6) * 0.07 + hit(t, CUE.p61, 0.12, 0.6) * 0.05 + hit(t, CUE.outHere, 0.12, 0.6) * 0.04;
  const dist = cur.dist * (1 - punch), pitch = rad(cur.pitch), yaw = rad(cur.yaw + drift(t, 2, 0.6) * 1.4);
  const look = cur.look;
  return { look, pos: [look[0] + dist * Math.sin(yaw) * Math.cos(pitch), look[1] + dist * Math.sin(pitch), look[2] + dist * Math.cos(yaw) * Math.cos(pitch)] };
}

function World({ t }: { t: number }) {
  return (
    <>
      <Desk t={t} />
      <Jar x={-LANE} t={t} mt={MT_L} c={C.amber} name="jl" />
      <Jar x={LANE} t={t} mt={MT_R} c={C.teal} name="jr" />
      {laneCard("L", t)}
      {laneCard("R", t)}
      <Rosette t={t} />
      <Calendar t={t} />
      <Books t={t} />
      <RuleCard t={t} />
    </>
  );
}

/* ================================================================== overlay: captions on paper strips */
type Page = { words: Word[]; lines: Word[][] };
const CAP = { size: 84, hold: 0.5 };
const BREAK_AFTER = new Set(["hook:three.", "careful:agrees.", "school:learned."]);
const WEAK_END = new Set(["the", "a", "an", "to", "his", "of", "he", "her", "in", "and", "is", "was", "that", "by", "for", "how", "you"]);
const PHRASE_END = /[.,:;!?…—]["”’]?$/;
const KEYS = new Set(KEYWORDS);
const PAGES_CAP: Page[] = (() => {
  const maxW = SAFE.railX - SAFE.left - 40, gap = CAP.size * 0.24;
  const wordW = (s: string) => measure(s.toUpperCase(), CAP.size, "cut") - 0.01 * CAP.size * Math.max(0, [...s].length - 1);
  const lineW = (ws: Word[]) => ws.reduce((a, x) => a + wordW(x.w), 0) + gap * Math.max(0, ws.length - 1);
  type W2 = Word & { brk: boolean; key: boolean };
  const split = (ws: W2[]): Word[][] | null => {
    if (ws.length === 1 || lineW(ws) <= maxW) return [ws];
    let best = -1, score = Infinity;
    for (let i = 1; i < ws.length; i++) {
      const prev = ws[i - 1].w;
      if (prev.startsWith('"')) continue;
      const a = lineW(ws.slice(0, i)), b = lineW(ws.slice(i));
      if (a > maxW || b > maxW) continue;
      const sc = Math.abs(a - b) - (ws[i - 1].brk ? 400 : 0) - (PHRASE_END.test(prev) ? 150 : 0) + (WEAK_END.has(prev.toLowerCase()) ? 250 : 0);
      if (sc < score) { score = sc; best = i; }
    }
    return best < 0 ? null : [ws.slice(0, best), ws.slice(best)];
  };
  const out: Page[] = [];
  const close = (ws: W2[]) => { if (ws.length) out.push({ words: ws, lines: split(ws) ?? [ws] }); };
  for (const b of TIMINGS.beats as any[]) {
    let cur: W2[] = [];
    const seen: Record<string, number> = {};
    for (const x0 of b.words as Word[]) {
      const n = (seen[x0.w] = (seen[x0.w] ?? 0) + 1);
      const x: W2 = { ...x0, brk: BREAK_AFTER.has(`${b.id}:${x0.w}`), key: /\d/.test(x0.w) || KEYS.has(`${b.id}:${x0.w}`) || KEYS.has(`${b.id}:${x0.w}#${n}`) };
      if (cur.length && !split([...cur, x])) {
        let j = cur.length - 1;
        for (let i = cur.length - 1; i >= 0; i--) if (cur[i].brk) { j = i; break; }
        close(cur.slice(0, j + 1)); cur = cur.slice(j + 1);
      }
      cur.push(x);
      if (PHRASE_END.test(x.w)) { close(cur); cur = []; }
    }
    close(cur);
  }
  return out;
})();
const CAP_FROM = PAGES_CAP.map((p, i) => (i === 0 ? p.words[0].start - 0.05 : Math.max(p.words[0].start - 0.05, PAGES_CAP[i - 1].words[PAGES_CAP[i - 1].words.length - 1].start + CAP.hold)));
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9$%]/g, "");
function Captions({ t }: { t: number }) {
  if (t > DUR - 0.5) return null;
  const idx = PAGES_CAP.findIndex((p, i) => t >= CAP_FROM[i] && (i === PAGES_CAP.length - 1 || t < CAP_FROM[i + 1]));
  const page = PAGES_CAP[idx];
  if (!page || t > page.words[page.words.length - 1].end + 0.7) return null;
  const lineH = CAP.size * 1.16;
  const top = ZONES.captions.top + (ZONES.captions.bottom - ZONES.captions.top - lineH * page.lines.length) / 2;
  const appear = ease.back(ramp(t, CAP_FROM[idx], 0.18), 1.4);
  return (
    <div style={abs(SAFE.left, top, { width: SAFE.railX - SAFE.left })}>
      {page.lines.map((line, li) => (
        <div key={li} style={{ position: "relative", height: lineH, display: "flex", flexDirection: "row" }}>
          <div style={{ position: "relative", display: "flex", flexDirection: "row", columnGap: CAP.size * 0.24, alignItems: "center", height: lineH - 10, paddingLeft: 20, paddingRight: 20, background: C.card, transform: `rotate(${(li % 2 ? 0.8 : -0.9) + (idx % 3) * 0.3}deg) scale(${Math.min(1, 0.9 + 0.1 * appear)})`, boxShadow: "0px 6px 0px rgba(40,25,10,0.25)" }}>
            {line.map((x, i) => {
              const key = (x as any).key as boolean;
              const p = ease.back(ramp(t, x.start - 0.03, 0.16), 1.6);
              const hl = key ? ease.out3(ramp(t, x.start + 0.05, 0.22)) : 0;
              return (
                <div key={i} style={{ position: "relative", opacity: t >= x.start - 0.03 ? 1 : 0.18, transform: `translateY(${(1 - Math.min(1, p)) * 10}px)` }}>
                  {hl > 0 && <div style={abs(-4, CAP.size * 0.5, { width: `${hl * 100}%`, height: CAP.size * 0.36, background: C.hl })} />}
                  <div style={{ ...display(CAP.size, key ? C.red : C.ink), lineHeight: 1, position: "relative" }}>{x.w}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}


function Hud({ n, big = false }: { n: string; big?: boolean }) {
  return (
    <div style={abs(SAFE.left - 8, ZONES.hud.top + (big ? 40 : 0), { height: big ? 56 : 50, display: "flex", flexDirection: "row", alignItems: "center", columnGap: 14, paddingLeft: 18, paddingRight: 18, background: C.tape, transform: "rotate(-1.5deg)" })}>
      <div style={{ fontFamily: "JBMono", fontWeight: 800, fontSize: big ? 30 : 26, letterSpacing: "0.2em", color: C.ink }}>UNGRADED</div>
      <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: big ? 30 : 26, letterSpacing: "0.14em", color: "#A3162B" }}>{n}</div>
    </div>
  );
}
function TitleBlock({ size, o, title = TITLE }: { size: number; o: number; title?: string }) {
  return (
    <div style={abs(SAFE.left, ZONES.title.top + 10, { width: SAFE.right - SAFE.left, opacity: o })}>
      <div style={abs(-22, -14, { width: 640, height: size * 2 + 104, background: C.card, transform: "rotate(-1deg)", boxShadow: "0px 8px 0px rgba(40,25,10,0.25)" })} />
      <div style={{ ...display(size), position: "relative", whiteSpace: "pre-line" }}>{title}</div>
      <div style={{ fontFamily: "Instrument", fontStyle: "italic", fontSize: 48, color: C.red, marginTop: 10, position: "relative" }}>{WHISPER}</div>
    </div>
  );
}
function Overlay({ t }: { t: number }) {
  const hookEnd = BEATS.hook.end + 0.2;
  const titleO = Math.max(1 - ramp(t, hookEnd - 0.25, 0.25), ramp(t, DUR - 0.45, 0.35));
  const src = t >= CUE.review - 0.1 && t < B("do") ? SOURCE2 : SOURCE;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <style>{FONTS}</style>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(25,15,5,0.45) 100%)" }} />
      <Hud n="#007" />
      {titleO > 0.01 && <TitleBlock size={104} o={titleO} />}
      {KICKERS.map((s, i) => {
        if (t < s.from || t > s.to + 0.2 || titleO > 0.5) return null;
        const o = Math.min(ramp(t, s.from, 0.18), 1 - ramp(t, s.to - 0.2, 0.16), 1 - titleO);
        if (o <= 0.01) return null;
        return (
          <div key={i} style={abs(SAFE.left, ZONES.title.top + 10, { opacity: o, display: "flex", flexDirection: "row" })}>
            <div style={{ ...display(76), position: "relative", paddingLeft: 16, paddingRight: 16, paddingTop: 6, paddingBottom: 2, background: C.hl, transform: "rotate(-1.2deg)" }}>{s.text}</div>
          </div>
        );
      })}
      <Captions t={t} />
      <div style={abs(SAFE.left, ZONES.captions.bottom + 2, { width: SAFE.railX - SAFE.left, fontFamily: "JBMono", fontWeight: 600, fontSize: 24, letterSpacing: "0.03em", textTransform: "uppercase", color: "#FFFDF6", opacity: 0.9, whiteSpace: "nowrap" })}>{src}</div>
    </AbsoluteFill>
  );
}

/* ================================================================== the reel */
const MIX = 0.5;
function Lights({ t }: { t: number }) {
  const night = nightAt(t), day = 1 - night;
  return (
    <>
      <ToneMapping mode="tony" exposure={0.6} />
      <AmbientLight brightness={140 + 220 * day} color={mixHex("#FFF1E0", "#9FB0E8", night)} />
      <DirectionalLight transform={Transform.fromXyz(-5 + 10 * night, 12, 9).lookingAt([0, 0, 0])} illuminance={600 + 3200 * day} color="#FFF0DC" shadow_maps_enabled soft_shadow_size={2} />
      <SpotLight transform={Transform.fromXyz(-3, 8, 5).lookingAt([0, 0.6, 0])} intensity={900000 + 2600000 * day} outer_angle={0.8} inner_angle={0.4} color="#FFE2B8" shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(-1.4, 1.05, -0.8)} intensity={250000 + 1600000 * night} color="#FFD79A" range={12} shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(5, 4, 6)} intensity={700000 * day + 150000} color="#DCE6FF" range={30} />
    </>
  );
}
function Recall() {
  const f = useCurrentFrame();
  const t = f / FPS;
  BOIL = Math.floor(f / 3) % 3;
  const cam = cameraAt(t);
  const sfx: [number, string, number][] = [[0, "pop", 0.3]];
  for (const [at] of SHOTS.slice(2, -1)) sfx.push([at, "whoosh", 0.3]);
  MT_L.forEach(([a, b], i) => { if (i % 2 === 0) sfx.push([a + 0.3, "pop", 0.12]); if (b < CUE.tryIt && i % 2 === 0) sfx.push([b, "pop", 0.1]); });
  MT_R.forEach(([a], i) => { if (i % 2 === 1) sfx.push([a + 0.3, "pop", 0.12]); });
  for (let d = 0; d < 7; d++) sfx.push([WEEK.from() + (d / 7) * (WEEK.to() - WEEK.from()), "pop", 0.22]);
  for (const [a, name, v] of [
    [CUE.fourteen, "pop", 0.3], [CUE.three, "pop", 0.3], [CUE.closes, "pop", 0.3], [CUE.win, "stamp", 0.4], [CUE.p83, "pop", 0.3], [CUE.p71, "pop", 0.3],
    [CUE.wait - 0.2, "rumble", 0.35], [CUE.flips, "stamp", 0.5], [CUE.p40, "pop", 0.35], [CUE.p61, "pop", 0.4],
    [CUE.outHere - 0.2, "whoosh", 0.35], [CUE.careful - 0.2, "whoosh", 0.3], [CUE.review - 0.2, "whoosh", 0.3], [CUE.high, "pop", 0.3], [CUE.low, "stamp", 0.35],
    [CUE.close, "stamp", 0.3], [CUE.check, "pop", 0.35], [CUE.howMany, "pop", 0.3],
  ] as [number, string, number][]) sfx.push([a, name, v]);
  return (
    <AbsoluteFill style={{ background: "#22201E" }}>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: rad(FOV) } }} />
      <Lights t={t} />
      <World t={t} />
      <Overlay t={t} />
      {sfx.map(([a, name, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(a * FPS))} durationInFrames={FPS * 3} layout="none" name={`sfx-${name}-${i}`}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={v * MIX} />
        </Sequence>
      ))}
      <Audio src={staticFile("voice.wav")} volume={MIX} />
      <Audio src={staticFile("music.wav")} volume={(fr: number) => interpolate(fr / FPS, [0, 0.5, DUR - 3, DUR], [0, 0.16 * MIX, 0.16 * MIX, 0.22 * MIX], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
}

/* ================================================================== the thumbnail: the jars just after the flip */
const COVER_T = CUE.p61 + 0.6;
function Cover() {
  const t = COVER_T;
  BOIL = 0;
  const look: V3 = [0, 0.66, -0.1], dist = 7.9, p = rad(15);
  const pos: V3 = [look[0], look[1] + dist * Math.sin(p), look[2] + dist * Math.cos(p)];
  return (
    <AbsoluteFill style={{ background: "#22201E" }}>
      <Camera3d transform={Transform.fromXyz(...pos).lookingAt(look)} projection={{ Perspective: { fov: rad(FOV) } }} />
      <Lights t={t} />
      <World t={t} />
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <style>{FONTS}</style>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(25,15,5,0.45) 100%)" }} />
        <Hud n="#007" big />
        <div style={abs(SAFE.left, ZONES.title.top + 50, { width: SAFE.railX - SAFE.left })}>
          <div style={abs(-22, -14, { width: 700, height: 330, background: C.card, transform: "rotate(-1deg)", boxShadow: "0px 8px 0px rgba(40,25,10,0.25)" })} />
          <div style={{ ...display(112), position: "relative", whiteSpace: "pre-line" }}>{"Reread it 14×.\nRemembered less."}</div>
          <div style={{ fontFamily: "Instrument", fontStyle: "italic", fontSize: 56, color: C.red, marginTop: 12, position: "relative" }}>Which one do you do?</div>
        </div>
        <div style={abs(SAFE.left, 1360, { width: SAFE.railX - SAFE.left, fontFamily: "JBMono", fontWeight: 600, fontSize: 26, letterSpacing: "0.04em", textTransform: "uppercase", color: "#FFFDF6", opacity: 0.85 })}>Roediger & Karpicke · 2006 study</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

registerRoot(() => (
  <>
    <Composition id="recall" component={Recall} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />
    <Composition id="cover" component={Cover} width={W} height={H} fps={FPS} durationInFrames={1} />
  </>
));
