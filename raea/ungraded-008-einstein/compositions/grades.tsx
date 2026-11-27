/**
 * UNGRADED #008 — "He failed. Not math." (episode `einstein-math`) · report-card board art direction · raea
 *
 * Not the notebook of #004/#005, the turntable of #006 or the desk of #007: a school record board on an 1890s classroom
 * wall (AI backdrop, art/, Nano Banana). Four wooden grade tiles roll over to show the 1895 entrance exam in parts (TOP,
 * TOP, LOW, LOW → FAIL stamp), then the 1896 Aarau certificate (6, 6, 6, 3). A 1–6 ruler rolls over for the old scale.
 * A redrawn headline clipping opens and closes the loop. Every fact is in public/episodes/einstein-math/SOURCES.md.
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
const DUR = TIMINGS.duration + 1.0;
const TITLE = "He failed.\nNot math.";
const WHISPER = "Einstein's real report card.";
const SOURCE = "W. Isaacson, TIME 2007 · Aarau certificate, 1896";
/* caption accents, keyed by beat (and "#n" for the nth occurrence); numbers are automatic */
const KEYWORDS = ["hook:failed", "hook:laughed.", "reply:never", "exam:fail?", "parts:top", "parts:fail.", "cert:three.", "scale:top", "theory:flipped", "theory:fails.", "school:verdict", "school:list.", "do:parts.", "loop:in.", "loop:three."];
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
const CUE = {
  real: w("hook", "real"), laughed: w("hook", "laughed."),
  y1935: w("reply", "1935"), never: w("reply", "never"), calculus: w("reply", "calculus."),
  where: w("exam", "where's"), y1895: w("exam", "1895."), sixteen: w("exam", "sixteen,"), early: w("exam", "early,"), poly: w("exam", "Polytechnic."),
  math: w("parts", "Math"), physics: w("parts", "physics:"), top: w("parts", "top"), langs: w("parts", "Languages"), rest: w("parts", "rest:"), overall: w("parts", "Overall:"), fail: w("parts", "fail."),
  director: w("aarau", "director"), finish: w("aarau", "finish"), aarau: w("aarau", "Aarau."),
  y1896: w("cert", "1896."), algebra: w("cert", "Algebra:"), six1: w("cert", "six.", 1), geometry: w("cert", "Geometry:"), six2: w("cert", "six.", 2),
  physics2: w("cert", "Physics:"), six3: w("cert", "six.", 3), french: w("cert", "French:"), three: w("cert", "three."),
  topGrade: w("scale", "top"),
  theory: w("theory", "theory"), flipped: w("theory", "flipped"), old: w("theory", "old"), sixes: w("theory", "sixes"), fails: w("theory", "fails."),
  verdict: w("school", "verdict"), outHere: w("school", "Out"), list: w("school", "list."),
  bad: w("do", "bad"), read: w("do", "Read"), parts: w("do", "parts."), failed: w("do", "failed."),
  gotIn: w("loop", "in."), french2: w("loop", "French:"), three2: w("loop", "three."), headline: w("loop", "headline?"), around: w("loop", "around."),
};

/* ================================================================== layout (world units, the chalk ledge at y = 0.42) */
const BOARD = { x: -0.08, y: 0.48, z: 0, w: 2.4, h: 1.9 };      // the record board on the wall
const ROW_Y = [98, 148, 198, 248];                                // row centres in the board's drawing units (y down)
const TILE = { s: 0.31, d: 0.09, xd: 292 };                       // grade tiles: size, depth, x in board drawing units
const bx = (xd: number) => BOARD.x - BOARD.w / 2 + xd / VB;
const by = (yd: number) => BOARD.y + BOARD.h - yd / VB;
const RULE = { x: -0.05, y: 0.45, z: 0.75, w: 2.3, h: 1.5 };
const KICKERS = [
  { text: "His answer", from: B("reply") + 0.05, to: B("exam") },
  { text: "Zurich · 1895 · age 16", from: CUE.y1895, to: B("aarau") },
  { text: "Plan B", from: B("aarau") + 0.05, to: B("cert") },
  { text: "Aarau certificate · 1896", from: B("cert") + 0.05, to: B("theory") },
  { text: "Where the myth comes from", from: B("theory") + 0.05, to: B("school") },
  { text: "Out here", from: CUE.outHere, to: B("do") },
  { text: "Do this", from: B("do") + 0.05, to: B("loop") },
  { text: "And then", from: B("loop") + 0.05, to: CUE.headline - 0.1 },
];

/* ================================================================== the record board: one face per chapter, swapped by a quick vertical flip */
type Side = { at: number; id: string };
const SIDES: Side[] = [
  { at: -1, id: "record" }, { at: CUE.y1895 - 0.25, id: "exam" }, { at: B("aarau") - 0.1, id: "aarau" }, { at: B("cert") - 0.15, id: "cert" },
  { at: B("do") - 0.25, id: "exam" }, { at: B("loop") - 0.1, id: "in" }, { at: CUE.headline - 0.3, id: "record" },
];
const FLIP = 0.42;
function boardSide(t: number) {
  let i = 0;
  for (let j = 1; j < SIDES.length; j++) if (t >= SIDES[j].at + FLIP / 2) i = j;
  let sy = 1;
  for (let j = 1; j < SIDES.length; j++) { const f = ramp(t, SIDES[j].at, FLIP); if (f > 0 && f < 1) sy = Math.abs(Math.cos(Math.PI * ease.inOut3(f))); }
  return { id: SIDES[i].id, sy: Math.max(0.02, sy) };
}
const ROWS: Record<string, string[]> = {
  exam: ["Mathematics", "Physics", "Languages", "The rest"],
  cert: ["Algebra", "Geometry", "Physics", "French"],
};
function Board({ t }: { t: number }) {
  const { id, sy } = boardSide(t);
  const wv = BOARD.w * VB, hv = BOARD.h * VB;
  const circleLang = id === "exam" && t >= CUE.failed - 0.05 && t < B("loop");
  const state = `${id}-${+(t >= CUE.sixteen)}-${+(t >= CUE.finish)}-${+(t >= CUE.aarau)}-${+circleLang}-${+(t >= CUE.gotIn)}-${+(t >= CUE.three2)}-${+(t >= CUE.early && t < B("parts"))}-${+(id === "cert" && t >= CUE.sixes - 0.05)}`;
  const tex = texture(`board:${BOIL}-${state}`, () => {
    let s = ink([[6, 6], [wv - 6, 6], [wv - 6, hv - 6], [6, hv - 6]], { seed: 600, w: 4, fill: "#FBF6E6", close: true, amp: 0.5 });
    const head = (a: string, c: string, sub?: string) => {
      let h = ink([[6, 6], [wv - 6, 6], [wv - 6, 52], [6, 52]], { seed: 601, w: 4, fill: c, close: true, amp: 0.5 }) + cutTxt(a, 22, 40, 28, "#FFFFFF", "start");
      if (sub) h += hand(sub, wv - 20, 40, { size: 22, anchor: "end", c: "#FFFFFF" });
      return h;
    };
    const rows = (labels: string[]) => {
      let r = "";
      labels.forEach((lab, i) => {
        r += hand(lab, 26, ROW_Y[i] + 9, { size: 30, anchor: "start" });
        r += ink(seg([22, ROW_Y[i] + 19], [TILE.xd - 30, ROW_Y[i] + 19], 6), { seed: 610 + i, w: 2, c: "#C9BFA6", amp: 0.4 });
      });
      return r;
    };
    if (id === "record") {
      s += head("SCHOOL RECORD", C.pencil, "Einstein, A.");
      s += hand("born 1879, Ulm", 26, 100, { size: 28, anchor: "start", c: C.pencil });
    } else if (id === "exam") {
      s += head("ZURICH POLYTECHNIC", C.ink, t >= CUE.sixteen - 0.05 && t < B("parts") ? "age 16" : "entry exam");
      s += rows(ROWS.exam);
      if (t >= CUE.early && t < B("parts")) s += hand("2 years younger than the others", 26, 78, { size: 18, anchor: "start", c: C.red });
      if (circleLang) s += ink(Array.from({ length: 20 }, (_, i) => [140 + 125 * Math.cos((i / 19) * Math.PI * 2.1), ROW_Y[2] + 2 + 26 * Math.sin((i / 19) * Math.PI * 2.1)] as Pt), { seed: 620, w: 4, c: C.red, amp: 1.2 });
    } else if (id === "aarau") {
      s += head("THE DIRECTOR'S ADVICE", C.teal);
      if (t >= CUE.finish - 0.05) s += hand("“Finish high", 26, 104, { size: 32, anchor: "start" }) + hand("school first.”", 40, 140, { size: 32, anchor: "start" });
      if (t >= CUE.aarau - 0.1) s += cutTxt("AARAU, 1895–96", 26, 200, 30, C.ink, "start") + hand("one year, a small school", 26, 236, { size: 22, anchor: "start", c: C.pencil });
    } else if (id === "cert") {
      s += head("AARAU CERTIFICATE", C.ink, "1896");
      s += rows(ROWS.cert);
      if (t >= CUE.sixes - 0.05) for (let i = 0; i < 3; i++) s += hand("= worst?", TILE.xd - 36, ROW_Y[i] + 9, { size: 24, anchor: "end", c: C.red });
    } else {
      s += head("ZURICH POLYTECHNIC", C.teal, "autumn 1896");
      if (t >= CUE.gotIn - 0.05) s += cutTxt("ADMITTED", wv / 2 - 40, 120, 52, "#127E5E");
      s += hand("French", 26, ROW_Y[3] + 9, { size: 30, anchor: "start" });
      if (t >= CUE.three2 - 0.05) s += hand("(still)", 150, ROW_Y[3] + 9, { size: 24, anchor: "start", c: C.pencil });
    }
    return s;
  }, wv, hv);
  return (
    <>
      {/* the wooden frame and the chalk ledge stay put; the face flips */}
      <Mesh3d allowOverlap name="frame-t" transform={Transform.fromXyz(BOARD.x, BOARD.y + BOARD.h + 0.04, BOARD.z - 0.02)}><Cuboid half_size={[BOARD.w / 2 + 0.08, 0.05, 0.04]} /><M c="#5A3A22" r={0.6} /></Mesh3d>
      <Mesh3d allowOverlap name="frame-l" transform={Transform.fromXyz(BOARD.x - BOARD.w / 2 - 0.04, BOARD.y + BOARD.h / 2, BOARD.z - 0.02)}><Cuboid half_size={[0.05, BOARD.h / 2 + 0.08, 0.04]} /><M c="#5A3A22" r={0.6} /></Mesh3d>
      <Mesh3d allowOverlap name="frame-r" transform={Transform.fromXyz(BOARD.x + BOARD.w / 2 + 0.04, BOARD.y + BOARD.h / 2, BOARD.z - 0.02)}><Cuboid half_size={[0.05, BOARD.h / 2 + 0.08, 0.04]} /><M c="#5A3A22" r={0.6} /></Mesh3d>
      <Mesh3d allowOverlap name="ledge" transform={Transform.fromXyz(BOARD.x, BOARD.y - 0.06, BOARD.z + 0.06)}><Cuboid half_size={[BOARD.w / 2 + 0.16, 0.04, 0.12]} /><M c="#6B452A" r={0.55} /></Mesh3d>
      <Mesh3d allowOverlap name="back" transform={Transform.fromXyz(BOARD.x, BOARD.y + BOARD.h / 2, BOARD.z - 0.05)}><Cuboid half_size={[BOARD.w / 2, BOARD.h / 2, 0.01]} /><M c="#2E2A26" r={0.8} /></Mesh3d>
      <Mesh3d allowOverlap key={`board-${state}`} name={`board-${state}`} transform={Transform.fromXyz(BOARD.x, BOARD.y + BOARD.h / 2, BOARD.z).withScale([1, sy, 1])}>
        <Cuboid half_size={[BOARD.w / 2, BOARD.h / 2, 0.004]} />
        <StandardMaterial base_color="#FFFFFF" base_color_texture={tex.f} perceptual_roughness={0.9} />
      </Mesh3d>
    </>
  );
}

/* ================================================================== grade tiles: wooden blocks that roll over (about X) to show a grade */
type TV = { v: string; c: string } | null;
const G = { top: { v: "TOP", c: "#127E5E" }, low: { v: "LOW", c: C.red }, six: { v: "6", c: "#127E5E" }, three: { v: "3", c: "#C77A12" } };
const BLANK_EXAM = B("aarau") - 0.15, BLANK_CERT = B("school") - 0.2, BLANK_DO = B("loop") - 0.15;
const TILE_EV: [number, TV][][] = [
  [[CUE.math, G.top], [BLANK_EXAM, null], [CUE.six1, G.six], [BLANK_CERT, null], [CUE.read, G.top], [BLANK_DO, null]],
  [[CUE.physics, G.top], [BLANK_EXAM + 0.06, null], [CUE.six2, G.six], [BLANK_CERT + 0.06, null], [CUE.read + 0.12, G.top], [BLANK_DO + 0.06, null]],
  [[CUE.langs, G.low], [BLANK_EXAM + 0.12, null], [CUE.six3, G.six], [BLANK_CERT + 0.12, null], [CUE.read + 0.24, G.low], [BLANK_DO + 0.12, null]],
  [[CUE.rest, G.low], [BLANK_EXAM + 0.18, null], [CUE.three, G.three], [BLANK_CERT + 0.18, null], [CUE.read + 0.36, G.low], [BLANK_DO + 0.18, null], [CUE.three2 - 0.05, G.three]],
];
const ROLL = 0.42;
const faceBody = (v: TV, flip: boolean) => (wv: number, hv: number) => {
  if (!v) return "";
  const inner = ink([[5, 5], [wv - 5, 5], [wv - 5, hv - 5], [5, hv - 5]], { seed: 640, w: 3, fill: "#FFFDF4", close: true, amp: 0.3 }) +
    cutTxt(v.v, wv / 2, hv / 2 + (v.v.length > 1 ? 8 : 15), v.v.length > 1 ? 21 : 40, v.c);
  return flip ? `<g transform="translate(${f1(wv)} 0) scale(-1 1)">${inner}</g>` : inner;
};
function Tile({ i, t }: { i: number; t: number }) {
  const side = boardSide(t).id;
  if (!(side === "exam" || side === "cert" || (side === "in" && i === 3))) return null;   // faces without rows carry no tiles
  const ev = TILE_EV[i];
  let turns = 1, cur = -1;                       // starts showing its back (blank)
  ev.forEach(([at], j) => { const f = ease.inOut3(ramp(t, at, ROLL)); turns += f; if (t >= at) cur = j; });
  // the face that will show event j is j % 2 (0 = front); each face keeps the latest value assigned to it
  const faceVal = (face: number): TV => { let v: TV = null; ev.forEach(([at, val], j) => { if (j % 2 === face && t >= at - 0.05) v = val; }); return v; };
  const fv = [faceVal(0), faceVal(1)];
  const x = bx(TILE.xd + 20), y = by(ROW_Y[i]);
  const k = Math.min(1, ramp(t, 0, 0.01) + 1);
  const faces = fv.map((v, face) => {
    if (!v) return null;
    const ws = TILE.s * VB, tex = texture(`tile:${v.v}:${face}`, () => faceBody(v, face === 1)(ws, ws), ws, ws);
    return (
      <Mesh3d allowOverlap key={`tf${face}-${v.v}`} name={`tile${i}-f${face}-${v.v}`} transform={Transform.fromXyz(0, 0, face === 0 ? TILE.d / 2 + 0.003 : -TILE.d / 2 - 0.003)}>
        <Cuboid half_size={[TILE.s / 2 - 0.01, TILE.s / 2 - 0.01, 0.002]} />
        <StandardMaterial base_color="#FFFFFF" base_color_texture={tex.f} perceptual_roughness={0.85} />
      </Mesh3d>
    );
  });
  void cur; void k;
  return (
    <Entity transform={Transform.fromXyz(x, y, BOARD.z + TILE.d / 2 + 0.02).withRotation(Quat.fromEuler("XYZ", -turns * Math.PI, 0, 0))}>
      <Mesh3d allowOverlap name={`tile${i}-wood`}><Cuboid half_size={[TILE.s / 2, TILE.s / 2, TILE.d / 2]} /><M c="#B07A45" r={0.5} /></Mesh3d>
      {faces}
    </Entity>
  );
}

/* ================================================================== the 1–6 scale ruler: it rolls over on "flipped" (the old way: 1 = best) */
function Ruler({ t }: { t: number }) {
  const k = pop(t, B("scale") - 0.1, 0.4) * (1 - ease.inOut3(ramp(t, B("school") - 0.3, 0.3)));
  if (k <= 0.01) return null;
  const turn = ease.inOut3(ramp(t, CUE.flipped - 0.05, 0.5));
  const L = { w: 2.1, h: 0.36, d: 0.06 };
  const wv = L.w * VB, hv = L.h * VB;
  const face = (oldWay: boolean) => texture(`ruler:${+oldWay}`, () => {
    let s = ink([[5, 5], [wv - 5, 5], [wv - 5, hv - 5], [5, hv - 5]], { seed: 660, w: 3, fill: oldWay ? "#F3E2D6" : "#FFF6D8", close: true, amp: 0.3 });
    for (let n = 1; n <= 6; n++) {
      const x = 24 + (n - 1) * ((wv - 48) / 5);
      const best = oldWay ? n === 1 : n === 6, worst = oldWay ? n === 6 : n === 1;
      s += cutTxt(`${n}`, x, 27, 24, best ? "#127E5E" : worst ? C.red : C.ink);
      if (best) s += hand("best", x, 44, { size: 16, c: "#127E5E" });
      if (worst) s += hand("worst", x, 44, { size: 16, c: C.red });
    }
    if (oldWay) s += hand("the old way", wv / 2, 44, { size: 16, c: C.pencil });
    return oldWay ? `<g transform="translate(${f1(wv)} 0) scale(-1 1)">${s}</g>` : s;
  }, wv, hv);
  const ff = face(false), fb = face(true);
  return (
    <Entity transform={Transform.fromXyz(BOARD.x, BOARD.y + 0.23, 0.42).withRotation(Quat.fromEuler("XYZ", -turn * Math.PI, 0, 0)).withScale([k, k, k])}>
      <Mesh3d allowOverlap name="ruler-wood"><Cuboid half_size={[L.w / 2, L.h / 2, L.d / 2]} /><M c="#C9A36A" r={0.5} /></Mesh3d>
      <Mesh3d allowOverlap name="ruler-f" transform={Transform.fromXyz(0, 0, L.d / 2 + 0.003)}><Cuboid half_size={[L.w / 2 - 0.01, L.h / 2 - 0.01, 0.002]} /><StandardMaterial base_color="#FFFFFF" base_color_texture={ff.f} perceptual_roughness={0.85} /></Mesh3d>
      <Mesh3d allowOverlap name="ruler-b" transform={Transform.fromXyz(0, 0, -L.d / 2 - 0.003)}><Cuboid half_size={[L.w / 2 - 0.01, L.h / 2 - 0.01, 0.002]} /><StandardMaterial base_color="#FFFFFF" base_color_texture={fb.f} perceptual_roughness={0.85} /></Mesh3d>
    </Entity>
  );
}

/* ================================================================== paper props: the headline clipping, his reply, the FAIL stamp, the rule card */
const clipK = (t: number) => (t < B("reply") ? 1 - ease.inOut3(ramp(t, B("reply") - 0.35, 0.35)) : pop(t, CUE.headline - 0.1, 0.4));
function Clipping({ t }: { t: number }) {
  const k = clipK(t);
  return <Standee key="clip" d={{ name: "clip", w: 2.35, h: 1.25, x: BOARD.x + 0.02, y: 0.62, z: 0.6, tilt: -0.035, mode: "hinge", k, state: `${+(t >= CUE.real - 0.05 && t < B("reply"))}-${+(t >= CUE.laughed && t < B("reply"))}`, body: (wv, hv) => {
    let s = ink([[8, 8], [wv - 8, 8], [wv - 8, hv - 8], [8, hv - 8]], { seed: 700, w: 3, fill: "#EEE8D6", close: true, amp: 0.6 });
    s += ink(seg([22, 34], [wv - 22, 34], 6), { seed: 701, w: 2, c: C.pencil, amp: 0.3 }) + hand("Ripley's Believe It or Not! column", wv / 2, 28, { size: 16, c: C.pencil });
    const L = ["GREATEST LIVING", "MATHEMATICIAN", "FAILED IN", "MATHEMATICS"];
    L.forEach((l, i) => { s += cutTxt(l, wv / 2, 66 + i * 28, 28, i >= 2 ? C.red : C.ink); });
    if (t >= CUE.real - 0.05 && t < B("reply")) s += hand("a real headline", wv - 30, hv - 12, { size: 18, anchor: "end", c: C.red });
    if (t >= CUE.laughed && t < B("reply")) s += hand("ha!", 40, hv - 12, { size: 26, anchor: "start", c: "#127E5E" });
    return s;
  } }} />;
}
function Reply({ t }: { t: number }) {
  const k = pop(t, CUE.y1935 - 0.15, 0.4) * (1 - ease.inOut3(ramp(t, B("exam") - 0.25, 0.3)));
  const quote = t >= CUE.never - 0.1;
  if (k <= 0.01) return null;
  const calc = t >= CUE.calculus - 0.1;
  return <Standee key="reply" d={{ name: "reply", w: 2.1, h: 1.1, x: BOARD.x + 0.05, y: 0.62, z: 0.55, tilt: 0.02, mode: "scale", k, state: `${+calc}-${+quote}`, body: (wv, hv) => {
    let s = bubble(wv, hv, "left", 720);
    if (!quote) s += hand("Princeton, 1935…", wv / 2, 70, { size: 30, c: C.pencil });
    if (quote) s += hand("“I never failed", wv / 2, 52, { size: 34 });
    if (quote) s += hand("in mathematics.”", wv / 2, 88, { size: 34 });
    s += hand("— Einstein, 1935", wv - 40, 112, { size: 18, anchor: "end", c: C.pencil });
    if (calc) s += hand("calculus before 15", wv / 2 - 10, 135, { size: 20, c: "#127E5E", hl: C.mint });
    return s;
  } }} />;
}
function Stamp({ t }: { t: number }) {
  const on1 = pop(t, CUE.fail - 0.05, 0.3) * (1 - ease.inOut3(ramp(t, CUE.finish - 0.35, 0.25)));
  const on2 = t >= B("do") ? (1 - ease.inOut3(ramp(t, CUE.read - 0.1, 0.3))) * ramp(t, B("do") + 0.1, 0.25) : 0;
  const k = Math.max(on1, on2);
  if (k <= 0.01) return null;
  const drop = t >= CUE.read - 0.1 ? ramp(t, CUE.read - 0.1, 0.3) * 0.5 : 0;
  return <Standee key="stamp" d={{ name: "stamp", w: 1.3, h: 0.5, x: BOARD.x - 0.3, y: 0.36 - drop, z: 0.45, tilt: 0.12, mode: "scale", k, state: "f", body: (wv, hv) =>
    ink([[8, 8], [wv - 8, 8], [wv - 8, hv - 8], [8, hv - 8]], { seed: 730, w: 7, c: C.red, fill: "#FBEFE6", close: true, amp: 0.8 }) + cutTxt("FAIL", wv / 2, hv / 2 + 22, 64, C.red) }} />;
}
function RuleCard({ t }: { t: number }) {
  const k = pop(t, B("school") - 0.15, 0.45) * (1 - ease.inOut3(ramp(t, B("do") - 0.3, 0.3)));
  if (k <= 0.01) return null;
  const f = ramp(t, CUE.outHere - 0.2, 0.4), e = ease.inOut3(f);
  const side = e >= 0.5 ? 1 : 0, ry = f > 0 && f < 1 ? (e < 0.5 ? e : e - 1) * Math.PI : 0;
  return <Standee key="rule" d={{ name: "rule", w: RULE.w, h: RULE.h, x: RULE.x, y: RULE.y, z: RULE.z, ry, mode: "hinge", k, state: `${side}-${+(t >= CUE.verdict)}-${+(t >= CUE.list)}`, body: (wv, hv) => {
    let s = ink([[14, 14], [wv - 14, 14], [wv - 14, hv - 14], [14, hv - 14]], { seed: 980 + side, w: 6, fill: "#FFFFFF", close: true, amp: 0.9 });
    const head = (a: string, c: string) => ink([[14, 14], [wv - 14, 14], [wv - 14, 60], [14, 60]], { seed: 990 + side, w: 5, fill: c, close: true, amp: 0.6 }) + cutTxt(a, 34, 50, 34, "#FFFFFF", "start");
    if (side === 0) {
      s += head("AT SCHOOL", C.pencil);
      s += cutTxt("A FAIL IS", wv / 2, 124, 52);
      if (t >= CUE.verdict - 0.05) s += hand("a verdict on you", wv / 2, 186, { size: 46, c: C.red });
    } else {
      s += head("OUT HERE", C.teal);
      s += cutTxt("A FAIL IS", wv / 2, 124, 52);
      if (t >= CUE.list - 0.1) s += hand("a list", wv / 2, 186, { size: 54, hl: C.mint });
    }
    return s;
  } }} />;
}

/* ================================================================== the room: backdrop, floor */
const BG = { z: -3.2, w: 4.9, y: 1.25 };
function Room() {
  return (
    <>
      <Mesh3d allowOverlap name="bg" transform={Transform.fromXyz(0, BG.y, BG.z)}>
        <Cuboid half_size={[BG.w / 2, (BG.w * 8) / 9, 0.02]} />
        <StandardMaterial base_color="#BDBDBD" base_color_texture={staticFile("art/bg-class.png")} unlit />
      </Mesh3d>
    </>
  );
}

/* ================================================================== camera: a few held shots, eased between beats */
type Shot = { look: V3; dist: number; pitch: number; yaw: number };
const S0: Shot = { look: [BOARD.x, 1.0, 0.2], dist: 8.6, pitch: 5, yaw: 0 };
const SB: Shot = { look: [BOARD.x, 0.95, 0], dist: 8.0, pitch: 4, yaw: 0 };
const SHOTS: [number, Shot][] = [
  [0, S0],
  [B("reply") - 0.1, { look: [BOARD.x, 0.95, 0.4], dist: 7.6, pitch: 5, yaw: -3 }],
  [B("exam") - 0.15, SB],
  [B("parts") - 0.1, { ...SB, dist: 7.7, yaw: 3 }],
  [B("aarau") - 0.15, { ...SB, yaw: -2 }],
  [B("cert") - 0.15, { ...SB, dist: 7.7, yaw: 3 }],
  [B("scale") - 0.2, { look: [BOARD.x, 0.85, 0.3], dist: 7.9, pitch: 5, yaw: 0 }],
  [B("school") - 0.2, { look: [RULE.x, 0.9, RULE.z], dist: 7.6, pitch: 4, yaw: 0 }],
  [B("do") - 0.2, { ...SB, dist: 7.7, yaw: -3 }],
  [B("loop") - 0.1, SB],
  [CUE.headline - 0.2, S0],
];
const MOVE = 0.75;
function cameraAt(t: number): { pos: V3; look: V3 } {
  let cur = SHOTS[0][1];
  for (let i = 1; i < SHOTS.length; i++) {
    const [at, s] = SHOTS[i];
    if (t < at) break;
    const k = ease.inOut3(ramp(t, at, MOVE));
    cur = { look: [lerp(cur.look[0], s.look[0], k), lerp(cur.look[1], s.look[1], k), lerp(cur.look[2], s.look[2], k)], dist: lerp(cur.dist, s.dist, k), pitch: lerp(cur.pitch, s.pitch, k), yaw: lerp(cur.yaw, s.yaw, k) };
  }
  const punch = hit(t, CUE.fail, 0.1, 0.6) * 0.06 + hit(t, CUE.flipped, 0.12, 0.6) * 0.05 + hit(t, CUE.outHere, 0.12, 0.6) * 0.04 + hit(t, CUE.gotIn, 0.12, 0.6) * 0.04;
  const dist = cur.dist * (1 - punch), pitch = rad(cur.pitch), yaw = rad(cur.yaw + drift(t, 2, 0.6) * 1.2);
  const look = cur.look;
  return { look, pos: [look[0] + dist * Math.sin(yaw) * Math.cos(pitch), look[1] + dist * Math.sin(pitch), look[2] + dist * Math.cos(yaw) * Math.cos(pitch)] };
}

function World({ t }: { t: number }) {
  return (
    <>
      <Room />
      <Board t={t} />
      {[0, 1, 2, 3].map((i) => <Tile key={i} i={i} t={t} />)}
      <Ruler t={t} />
      <Stamp t={t} />
      <Reply t={t} />
      <Clipping t={t} />
      <RuleCard t={t} />
    </>
  );
}


/* ================================================================== overlay: captions on paper strips */
type Page = { words: Word[]; lines: Word[][] };
const CAP = { size: 84, hold: 0.5 };
const BREAK_AFTER = new Set(['hook:mathematics."', "school:you.", "theory:scale."]);
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
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <style>{FONTS}</style>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(25,15,5,0.45) 100%)" }} />
      <Hud n="#008" />
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
      <div style={abs(SAFE.left, ZONES.captions.bottom + 2, { width: SAFE.railX - SAFE.left, fontFamily: "JBMono", fontWeight: 600, fontSize: 24, letterSpacing: "0.03em", textTransform: "uppercase", color: "#FFFDF6", opacity: 0.9, whiteSpace: "nowrap" })}>{t >= B("theory") - 0.1 && t < B("school") ? "Theory: Open Culture 2025 · Ripley's 2024" : SOURCE}</div>
    </AbsoluteFill>
  );
}

/* ================================================================== the reel */
const MIX = 0.5;
function Lights() {
  return (
    <>
      <ToneMapping mode="tony" exposure={0.48} />
      <AmbientLight brightness={340} color="#FFF1E0" />
      <DirectionalLight transform={Transform.fromXyz(4, 10, 9).lookingAt([0, 1, 0])} illuminance={3600} color="#FFF0DC" shadow_maps_enabled soft_shadow_size={2} />
      <SpotLight transform={Transform.fromXyz(-3, 6, 6).lookingAt([0, 1.2, 0])} intensity={3200000} outer_angle={0.8} inner_angle={0.4} color="#FFE2B8" shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(5, 4, 6)} intensity={800000} color="#DCE6FF" range={30} />
    </>
  );
}
function Grades() {
  const f = useCurrentFrame();
  const t = f / FPS;
  BOIL = Math.floor(f / 3) % 3;
  const cam = cameraAt(t);
  const sfx: [number, string, number][] = [[0, "stamp", 0.3]];
  for (const [at] of SHOTS.slice(2, -1)) sfx.push([at, "whoosh", 0.25]);
  for (const s of SIDES.slice(1)) sfx.push([s.at, "whoosh", 0.3]);
  TILE_EV.forEach((ev) => ev.forEach(([at, v]) => sfx.push([at + 0.2, "pop", v ? 0.32 : 0.12])));
  for (const [a, name, v] of [
    [CUE.laughed, "pop", 0.3], [CUE.never - 0.25, "pop", 0.3], [CUE.calculus, "pop", 0.25], [CUE.fail, "stamp", 0.5],
    [B("scale") - 0.1, "pop", 0.3], [CUE.flipped - 0.05, "whoosh", 0.4], [CUE.outHere - 0.2, "whoosh", 0.35], [CUE.read - 0.1, "rumble", 0.3],
    [CUE.gotIn, "stamp", 0.4], [CUE.headline - 0.1, "stamp", 0.45],
  ] as [number, string, number][]) sfx.push([a, name, v]);
  return (
    <AbsoluteFill style={{ background: "#22201E" }}>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: rad(FOV) } }} />
      <Lights />
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

/* ================================================================== the thumbnail: the 1896 certificate, 6 6 6 3 */
const COVER_T = CUE.three + 0.5;
function Cover() {
  const t = COVER_T;
  BOIL = 0;
  const look: V3 = [BOARD.x, 1.62, 0], dist = 9.0, p = rad(4);
  const pos: V3 = [look[0], look[1] + dist * Math.sin(p), look[2] + dist * Math.cos(p)];
  return (
    <AbsoluteFill style={{ background: "#22201E" }}>
      <Camera3d transform={Transform.fromXyz(...pos).lookingAt(look)} projection={{ Perspective: { fov: rad(FOV) } }} />
      <Lights />
      <World t={t} />
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <style>{FONTS}</style>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(25,15,5,0.45) 100%)" }} />
        <Hud n="#008" big />
        <div style={abs(SAFE.left, ZONES.title.top + 50, { width: SAFE.railX - SAFE.left })}>
          <div style={abs(-22, -14, { width: 760, height: 330, background: C.card, transform: "rotate(-1deg)", boxShadow: "0px 8px 0px rgba(40,25,10,0.25)" })} />
          <div style={{ ...display(112), position: "relative", whiteSpace: "pre-line" }}>{"Einstein never\nfailed math."}</div>
          <div style={{ fontFamily: "Instrument", fontStyle: "italic", fontSize: 56, color: C.red, marginTop: 12, position: "relative" }}>{WHISPER}</div>
        </div>
        <div style={abs(SAFE.left, 1360, { width: SAFE.railX - SAFE.left, fontFamily: "JBMono", fontWeight: 600, fontSize: 26, letterSpacing: "0.04em", textTransform: "uppercase", color: "#FFFDF6", opacity: 0.85 })}>Aarau certificate · 1896 · 6 = best</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

registerRoot(() => (
  <>
    <Composition id="grades" component={Grades} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />
    <Composition id="cover" component={Cover} width={W} height={H} fps={FPS} durationInFrames={1} />
  </>
));
