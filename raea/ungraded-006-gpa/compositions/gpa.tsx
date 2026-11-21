/**
 * UNGRADED #006 — "Google graded the grades" (episode `gpa-google`) · paper diorama art direction · raea
 *
 * Not the notebook of #004/#005: a lazy-susan turntable on a desk, six stations around it, and every stick figure,
 * sign and speech bubble is a paper cut-out standee (ballpoint drawing, white cut margin, blank back) that pops up
 * as its station turns to the camera and folds flat as it leaves. One continuous camera, no page turns; the table
 * turns a full circle, so the last station is the first one again (the loop).
 * Every fact is in public/episodes/gpa-google/SOURCES.md; the chart, the team of seven and the two applicants are
 * illustrative and labelled so.
 */
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "raea";
import { Entity, ToneMapping } from "raea/3d";
import { Cuboid, Cylinder, Mesh3d, Sphere, Torus } from "raea/mesh";
import { StandardMaterial } from "raea/pbr";
import { AmbientLight, DirectionalLight, PointLight, SpotLight } from "raea/light";
import { Quat, Transform } from "raea/transform";
import { Camera3d } from "raea/camera";
import TIMINGS from "./timings.json";
import GLYPHS from "./glyphs.json";

/* ================================================================== tokens */
const FPS = 30, W = 1080, H = 1920;
const SAFE = { top: 250, bottom: 1440, left: 64, right: 1016, railFrom: 860, railX: 930 };
const ZONES = { hud: { top: 250 }, title: { top: 318 }, captions: { top: 1170, bottom: 1410 } };
const C = {
  paper: "#F7F2E4", card: "#FFFDF6", back: "#EDE3CC", ink: "#1E2A5A", pencil: "#6A6A80", red: "#D9344A",
  hl: "#FFE04A", mint: "#6FDDB8", tape: "rgba(233,212,160,0.94)", note: "#FFE77A", gold: "#E8B530",
};
const DUR = TIMINGS.duration + 0.5;
const TITLE = "Google graded\nthe grades";
const WHISPER = "Their verdict, in their own words.";
const SOURCE = "Laszlo Bock to The New York Times, June 2013";
/* caption accents, keyed by beat (and "#n" for the nth occurrence), so a word is red only where it matters; numbers are automatic */
const KEYWORDS = ['hook:"Worthless."', "corr:correlation", 'years:"completely', 'years:unrelated"', "teaser:waste", "stopped:transcripts.", "line:line.", "line:cloud.", "school:questions.#2", "careful:Careful:", "travel:show.", "picture:built,", "picture:fixed.", "end:can."];

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


/* ================================================================== cues (by word) */
const NEVER = 1e9;
const CUE = {
  gpas: w("hook", "GPAs?"), worthless: w("hook", '"Worthless."'),
  bock: w("who", "Laszlo"), nyt: w("who", "York"), y2013: w("who", "2013."),
  noCorr: w("corr", '"No'), slight: w("corr", "slight"),
  years: w("years", "two"), unrelated: w("years", '"completely'), school1: w("years", "school."),
  teaser: w("teaser", "Brainteasers?"), waste: w("teaser", "waste"), smart: w("teaser", "smart."),
  stopped: w("stopped", "stopped"), transcripts: w("stopped", "transcripts."),
  teams: w("teams", "teams"), pct: w("teams", "14%"), noCollege: w("teams", "college"),
  lineUp: w("cloud", "Line"), byGpa: w("cloud", "GPA,"), job: w("cloud", "job."),
  ifGrades: w("line", "If"), aLine: w("line", "line."), cloud: w("line", "cloud."),
  answers: w("school", "answers"), find: w("school", "find"),
  careful: w("careful", "Careful:"), oneCo: w("careful", "company,"), oneInt: w("careful", "interview,"), y13b: w("careful", "2013."), plenty: w("careful", "Plenty"),
  travels: w("travel", "travels."), scored: w("travel", "scored."), show: w("travel", "show."),
  people: w("travel", "people"), picture: w("picture", "Picture"), four: w("picture", "4.0."), link: w("picture", "link"), built: w("picture", "built,"), broke: w("picture", "broke,"), fixed: w("picture", "fixed."),
  passed: w("end", "passed."), can: w("end", "can."),
  keep: w("loop", "keep"), build: w("loop", "Build"), because: w("loop", "Because"),
};

/* ================================================================== the turntable: six stations, one full turn */
type SId = "door" | "paper" | "bin" | "team" | "cloud" | "show";
const ST: { id: SId; from: number }[] = [
  { id: "door", from: 0 }, { id: "paper", from: B("who") + 0.05 }, { id: "bin", from: B("teaser") + 0.05 }, { id: "team", from: B("teams") + 0.05 },
  { id: "cloud", from: B("cloud") + 0.05 }, { id: "show", from: B("travel") + 0.05 }, { id: "door", from: CUE.because + 0.05 },
];
const TURN = { lead: 0.5, dur: 0.85 };
const THETA = (Math.PI * 2) / 6, R = 5.4;
const turnDur = (i: number) => (i === 5 ? 1.6 : TURN.dur); // the turn into "show" is the reel's crane move
const turnK = (t: number, i: number) => ease.inOut3(ramp(t, ST[i].from - TURN.lead, turnDur(i)));
/** the one wide shot: a crane-up pull-back over the whole table on the turn into "travel" */
const revAt = (t: number) => Math.sin(Math.PI * ramp(t, B("travel") - 0.4, 2.2));
let REVEAL = false; // while true, folded standees stay drawn (lying flat) so the whole table reads
const spin = (t: number) => { let s = 0; for (let i = 1; i < ST.length; i++) s += turnK(t, i); return s; };
/** when station slot `s` (0–5) is up: [rise, fold] windows */
function windows(s: number): [number, number][] {
  const rise = (i: number) => ST[i].from - TURN.lead + 0.12, fold = (i: number) => ST[i].from - TURN.lead + turnDur(i) * 0.45;
  if (s === 0) return [[-1, fold(1)], [rise(6), NEVER]];
  return [[rise(s), fold(s + 1)]];
}
/** pop-up amount (0 flat → 1 standing, overshoots a little) of an element of slot `s`, appearing on `at` (or with the station) */
function up(t: number, s: number, at: number | null = null, stagger = 0): number {
  let best = 0;
  for (const [rise, fold] of windows(s)) {
    const a = at == null ? rise + stagger : Math.max(at, rise);
    if (t < a) continue;
    const k = (a < 0 ? 1 : ease.back(ramp(t, a, 0.42), 1.5)) * (1 - ease.inOut3(ramp(t, fold, 0.3)));
    best = Math.max(best, k);
  }
  return best;
}
const KICKERS = [
  { text: "The interview", from: ST[1].from + 0.2, to: ST[2].from },
  { text: "Into the bin", from: ST[2].from + 0.2, to: ST[3].from },
  { text: "Some teams", from: ST[3].from + 0.2, to: ST[4].from },
  { text: "Illustration", from: ST[4].from + 0.2, to: CUE.careful - 0.1 },
  { text: "Careful", from: CUE.careful - 0.1, to: ST[5].from },
  { text: "Out here", from: ST[5].from + 0.2, to: CUE.picture - 0.1 },
  { text: "Picture this", from: CUE.picture - 0.1, to: ST[6].from },
];

/* ================================================================== paper standees */
const VB = 150;        // drawing units (SVG viewBox) per world unit
const TPX = 2;         // texture pixels per drawing unit
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
        <Mesh3d key={`${d.name}-f-${stamp}`} name={`${d.name}-f-${stamp}`} allowOverlap transform={Transform.fromXyz(0, d.h / 2, 0.004)}>
          <Cuboid half_size={[d.w / 2, d.h / 2, 0.002]} />
          <StandardMaterial base_color="#FFFFFF" base_color_texture={tex.f} alpha_mode={{ Mask: 0.5 }} perceptual_roughness={0.92} />
        </Mesh3d>
        <Mesh3d key={`${d.name}-b-${stamp}`} name={`${d.name}-b-${stamp}`} allowOverlap transform={Transform.fromXyz(0, d.h / 2, -0.004)}>
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

/* ================================================================== station 0: the door (hook and loop) */
const CARD = { x: 0.2, y: 0.45, z: 0.42, w: 1.15, h: 1.3 };
const stampOn = (t: number) => (t < ST[1].from ? ramp(t, CUE.worthless + 0.08, 0.06) : 0);
function doorStation(t: number): JSX.Element[] {
  const k0 = up(t, 0), stampK = stampOn(t);
  const out: JSX.Element[] = [];
  out.push(<Standee key="door" d={{ name: "door", w: 1.9, h: 1.95, x: 0.35, z: -0.75, k: up(t, 0, null, 0), body: (wv, hv) =>
    ink([[30, hv - 8], [30, 70], [wv - 30, 70], [wv - 30, hv - 8]], { seed: 101, w: 7 }) +
    ink([[42, hv - 8], [42, 82], [wv * 0.58, 96], [wv * 0.58, hv - 8]], { seed: 102, w: 5, fill: "#E9EEF6", close: true }) +
    `<circle cx="${f1(wv * 0.5)}" cy="${f1(hv * 0.6)}" r="6" fill="${C.ink}"/>` +
    ink([[wv / 2 - 136, 8], [wv / 2 + 136, 8], [wv / 2 + 136, 58], [wv / 2 - 136, 58]], { seed: 103, w: 5, fill: C.hl, close: true, amp: 0.8 }) +
    cutTxt("GOOGLE · HIRING", wv / 2, 48, 34) }} />);
  out.push(<Standee key="hero0" d={{ name: "hero0", w: 1.0, h: 1.5, x: -0.78, z: 0.12, k: up(t, 0, null, 0.08), state: stampK > 0.5 ? "o" : "s", body: (wv, hv) =>
    fig(wv, hv, { hero: true, seed: 110, pose: { armL: -12, armR: 105, legL: -7, legR: 7, mood: stampK > 0.5 ? "o" : "smile" } }) }} />);
  out.push(<Standee key="card0" d={{ name: "card0", w: CARD.w, h: CARD.h, x: CARD.x, y: CARD.y, z: CARD.z, tilt: -0.05, k: up(t, 0, null, 0.14), mode: "scale", state: stampK > 0.5 ? "st" : "-", body: (wv, hv) => {
    let s = ink([[14, 14], [wv - 14, 14], [wv - 14, hv - 14], [14, hv - 14]], { seed: 120, w: 5, fill: "#FFFFFF", close: true, amp: 0.8 });
    s += cutTxt("REPORT CARD", wv / 2, 52, 26);
    ["Math", "English", "Science"].forEach((sub, i) => { s += hand(sub, 34, 84 + i * 22, { size: 20, anchor: "start", c: C.pencil }) + hand("A", wv - 40, 84 + i * 22, { size: 22, anchor: "end", c: C.red }); });
    s += cutTxt("GPA 4.0", wv / 2, hv - 20, 36, C.red);
    s += ink(circlePts(wv / 2, hv - 32, 66, 18).map(([x, y]) => [x, (y - (hv - 32)) * 0.4 + hv - 32] as Pt), { seed: 121, w: 4, c: C.red, close: true, amp: 1.2 });
    if (stampK > 0.5) s += g(ink([[-150, -34], [150, -34], [150, 30], [-150, 30]], { seed: 122, w: 6, c: C.red, close: true, amp: 1 }) + cutTxt('"WORTHLESS"', 0, 13, 34, C.red), `translate(${f1(wv / 2)} ${f1(hv * 0.5)}) rotate(-14)`, 0.92);
    return s;
  } }} />);
  // the rubber stamp: swings in from the camera side, hits the card on "Worthless.", lifts away
  // the rubber stamp hovers over the card from frame 0 (and again at the loop), hits it on "Worthless.", lifts back
  const ks = Math.min(1, up(t, 0, null, 0.2));
  if (ks > 0.01) {
    const a = ease.inOut3(ramp(t, CUE.worthless - 0.35, 0.35)), b = ease.inOut3(ramp(t, CUE.worthless + 0.15, 0.5));
    const hitK = t < ST[1].from ? a * (1 - b) : 0;
    const pos: V3 = [lerp(1.15, CARD.x, hitK), lerp(2.95, CARD.y + CARD.h * 0.5, hitK) + Math.sin(t * 2.1) * 0.04 * (1 - hitK), lerp(1.0, CARD.z + 0.16, hitK)];
    out.push(
      <Entity key="stamp" transform={Transform.fromXyz(...pos).withRotation(Quat.fromEuler("XYZ", Math.PI / 2 - 0.25 * (1 - hitK), 0, -0.24)).withScale([ks, ks, ks])}>
        <Mesh3d name="stamp-pad" transform={Transform.fromXyz(0, 0.05, 0)}><Cuboid half_size={[0.42, 0.06, 0.17]} /><M c="#8E2433" r={0.7} /></Mesh3d>
        <Mesh3d name="stamp-block" transform={Transform.fromXyz(0, 0.17, 0)}><Cuboid half_size={[0.44, 0.07, 0.19]} /><M c="#A87447" r={0.5} /></Mesh3d>
        <Mesh3d name="stamp-neck" transform={Transform.fromXyz(0, 0.36, 0)}><Cylinder radius={0.06} half_height={0.14} /><M c="#7A5232" r={0.5} /></Mesh3d>
        <Mesh3d name="stamp-knob" transform={Transform.fromXyz(0, 0.58, 0)}><Sphere radius={0.15} /><M c="#2A2A33" r={0.35} /></Mesh3d>
      </Entity>,
    );
  }
  return k0 >= 0 ? out : out;
}

/* ================================================================== station 1: the interview */
function paperStation(t: number): JSX.Element[] {
  const quoteState = t < CUE.years ? (t < CUE.slight ? "a" : "a2") : (t < CUE.unrelated ? "b" : "b2");
  return [
    <Standee key="nyt" d={{ name: "nyt", w: 1.45, h: 2.2, x: 0.78, z: -0.8, k: up(t, 1, CUE.nyt - 0.1), body: (wv, hv) =>
      ink([[wv / 2 - 6, hv - 8], [wv / 2 - 6, hv * 0.55]], { seed: 201, w: 6, c: C.pencil }) +
      ink([[14, 14], [wv - 14, 20], [wv - 18, hv * 0.62], [18, hv * 0.6]], { seed: 202, w: 5, fill: "#F2EFE6", close: true, amp: 1 }) +
      hand("NYT", 34, 62, { size: 46, anchor: "start" }) + hand("June 2013", wv - 28, 56, { size: 24, anchor: "end", c: C.red }) +
      ink(seg([30, 84], [wv - 32, 86], 6), { seed: 203, w: 3, c: C.ink }) +
      hand("interview", 34, 120, { size: 30, anchor: "start", c: C.pencil }) + lines(34, 148, 5, wv - 70, 22, 204) }} />,
    <Standee key="bock" d={{ name: "bock", w: 1.0, h: 1.55, x: -0.82, z: 0.05, k: up(t, 1, CUE.bock - 0.15), body: (wv, hv) =>
      fig(wv, hv, { seed: 210, pose: { armL: -14, armR: 40 + Math.sin(BOIL) * 3, legL: -7, legR: 7, mood: "flat" }, props: tie }) }} />,
    <Standee key="tag" d={{ name: "tag", w: 1.45, h: 0.5, x: -0.8, y: 1.68, z: 0.05, mode: "scale", k: up(t, 1, CUE.bock), body: (wv, hv) =>
      ink([[10, 10], [wv - 10, 10], [wv - 10, hv - 10], [10, hv - 10]], { seed: 220, w: 4, fill: C.hl, close: true, amp: 0.6 }) +
      hand("Laszlo Bock", wv / 2, 34, { size: 32 }) + hand("head of people, Google", wv / 2, 62, { size: 23, c: C.pencil }) }} />,
    <Standee key="quote" d={{ name: "quote", w: 1.85, h: 1.05, x: 0.32, y: 0.6, z: 0.3, mode: "scale", state: quoteState, k: up(t, 1, CUE.noCorr - 0.08) * (t >= CUE.years - 0.25 && t < CUE.years ? 1 - 0.85 * ease.inOut3(ramp(t, CUE.years - 0.25, 0.12)) : 1), body: (wv, hv) => {
      let s = bubble(wv, hv, "left", 230);
      if (quoteState[0] === "a") {
        s += cutTxt("“NO CORRELATION", wv / 2, 54, 30) + cutTxt("AT ALL.”", wv / 2, 84, 30);
        if (quoteState === "a2") s += hand("(a slight one for brand-new grads)", wv / 2, 104, { size: 18, c: C.pencil });
      } else {
        s += hand("after 2–3 years at Google,", wv / 2, 40, { size: 22, c: C.pencil });
        if (quoteState === "b2") s += cutTxt("“COMPLETELY", wv / 2, 72, 28) + cutTxt("UNRELATED”", wv / 2, 100, 28, C.red);
        else s += hand("vs. your grades…", wv / 2, 82, { size: 26 });
      }
      return s;
    } }} />,
  ];
}

/* ================================================================== station 2: the bin (brainteasers, transcripts) */
const BIN = { x: 0.62, z: 0.42, r: 0.4, h: 0.85 };
const DESK = { x: -0.15, z: -0.35, top: 0.62 };
function binStation(t: number): JSX.Element[] {
  const k = up(t, 2, null, 0.1), out: JSX.Element[] = [];
  out.push(<Standee key="boss" d={{ name: "boss", w: 1.0, h: 1.7, x: -0.85, z: -0.05, k: up(t, 2, null, 0), state: t > CUE.smart ? "sm" : "-", body: (wv, hv) =>
    fig(wv, hv, { seed: 300, pose: { armL: -14, armR: t > CUE.waste - 0.3 && t < CUE.waste + 1.6 ? 140 : 60, legL: -7, legR: 7, mood: "smile", tilt: -8 }, props: crown }) }} />);
  if (t > CUE.smart - 0.05) out.push(<Standee key="smart" d={{ name: "smart", w: 1.0, h: 0.6, x: -0.55, y: 1.65, z: 0.05, mode: "scale", k: up(t, 2, CUE.smart - 0.05) * (1 - ease.inOut3(ramp(t, CUE.stopped - 0.35, 0.25))), body: (wv, hv) =>
    bubble(wv, hv, "left", 310, C.note) + hand("feels smart", wv / 2, 44, { size: 26 }) }} />);
  // the bin itself
  const bs = Math.min(1.05, k);
  if (bs > 0.01) out.push(
    <Entity key="bin" transform={Transform.fromXyz(BIN.x, 0, BIN.z).withScale([bs, bs, bs])}>
      <Mesh3d name="bin-body" transform={Transform.fromXyz(0, BIN.h / 2, 0)}><Cylinder radius={BIN.r} half_height={BIN.h / 2} /><M c="#3E5F8A" r={0.45} m={0.3} /></Mesh3d>
      <Mesh3d name="bin-hole" transform={Transform.fromXyz(0, BIN.h + 0.001, 0)}><Cylinder radius={BIN.r - 0.05} half_height={0.004} /><M c="#141820" r={0.9} /></Mesh3d>
      <Mesh3d name="bin-rim" transform={Transform.fromXyz(0, BIN.h, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}><Torus major_radius={BIN.r - 0.02} minor_radius={0.035} /><M c="#C9CCD6" r={0.3} m={1} /></Mesh3d>
    </Entity>,
  );
  // three brainteaser cards, thrown in on "waste"
  for (let i = 0; i < 3; i++) {
    const t0 = CUE.waste - 0.15 + i * 0.32, f = ramp(t, t0, 0.62);
    const held = up(t, 2, CUE.teaser + i * 0.1);
    if (held <= 0.01 || f >= 1) continue;
    const e = ease.inOut3(f);
    const sx = -0.42 + i * 0.12, sy = 1.25 + i * 0.07, sz = 0.2 + i * 0.05;
    const x = lerp(sx, BIN.x, e), z = lerp(sz, BIN.z, e), y = lerp(sy, BIN.h + 0.05, e) + Math.sin(Math.PI * e) * 0.9 - (f > 0.85 ? (f - 0.85) * 3 : 0);
    out.push(<Standee key={`q${i}`} d={{ name: `q${i}`, w: 0.62, h: 0.55, x, y, z, ry: e * 4 * (i % 2 ? 1 : -1), tilt: e * 5, mode: "scale", k: held * (f > 0 ? 1 - ramp(f, 0.85, 0.15) : 1), body: (wv, hv) =>
      ink([[10, 10], [wv - 10, 10], [wv - 10, hv - 10], [10, hv - 10]], { seed: 320 + i, w: 4, fill: "#FFFFFF", close: true, amp: 0.6 }) +
      cutTxt(["?", "?!", "??"][i], wv / 2, hv / 2 + 18, 52, C.red) + hand("brainteaser", wv / 2, hv - 16, { size: 17, c: C.pencil }) }} />);
  }
  // transcripts: a pile that slides into the bin on "transcripts."; the sign says who still gets asked
  for (let i = 0; i < 4; i++) {
    const t0 = CUE.transcripts - 0.1 + i * 0.13, f = ramp(t, t0, 0.55), e = ease.inOut3(f);
    const s = up(t, 2, CUE.stopped - 0.6);
    if (s <= 0.01 || f >= 1) continue;
    const x = lerp(DESK.x, BIN.x, e), z = lerp(DESK.z, BIN.z, e), y = lerp(DESK.top + 0.015 + i * 0.03, BIN.h + 0.1, e) + Math.sin(Math.PI * e) * 0.55 - (f > 0.8 ? (f - 0.8) * 2.5 : 0);
    out.push(
      <Entity key={`tr${i}`} transform={Transform.fromXyz(x, y, z).withRotation(Quat.fromEuler("XYZ", e * 0.8, 0.2 * i - 0.2 + e * 1.5, 0)).withScale([s, s, s])}>
        <Mesh3d name={`tr-${i}`} allowOverlap><Cuboid half_size={[0.36, 0.012, 0.46]} /><M c={i === 3 ? "#FFFFFF" : "#F1ECE0"} r={0.9} /></Mesh3d>
        {i === 3 && <Mesh3d name="tr-label" allowOverlap transform={Transform.fromXyz(0, 0.014, 0)}><Cuboid half_size={[0.3, 0.001, 0.08]} /><M c={C.red} r={0.8} /></Mesh3d>}
      </Entity>,
    );
  }
  const dk = Math.min(1, up(t, 2, null, 0.05));
  if (dk > 0.01) out.push(
    <Entity key="desk" transform={Transform.fromXyz(DESK.x, 0, DESK.z).withScale([dk, dk, dk])}>
      <Mesh3d name="desk-top" transform={Transform.fromXyz(0, DESK.top - 0.03, 0)}><Cuboid half_size={[0.48, 0.03, 0.32]} /><M c="#8A5A34" r={0.6} /></Mesh3d>
      {[[-0.42, -0.26], [0.42, -0.26], [-0.42, 0.26], [0.42, 0.26]].map(([lx, lz], j) => (
        <Mesh3d key={j} name={`desk-leg-${j}`} transform={Transform.fromXyz(lx, (DESK.top - 0.06) / 2, lz)}><Cylinder radius={0.03} half_height={(DESK.top - 0.06) / 2} /><M c="#5E3A22" r={0.6} /></Mesh3d>
      ))}
    </Entity>,
  );
  const itK = up(t, 2, CUE.teaser) * (1 - ease.inOut3(ramp(t, CUE.smart - 0.3, 0.2)));
  if (itK > 0.01) out.push(<Standee key="itag" d={{ name: "itag", w: 1.0, h: 0.38, x: -0.8, y: 1.85, z: 0.0, mode: "scale", k: itK, body: (wv, hv) =>
    ink([[8, 8], [wv - 8, 8], [wv - 8, hv - 8], [8, hv - 8]], { seed: 305, w: 4, fill: C.hl, close: true, amp: 0.6 }) + hand("interviewer", wv / 2, 40, { size: 28 }) }} />);
  const signK = up(t, 2, CUE.stopped - 0.1);
  if (signK > 0.01) out.push(<Standee key="tsign" d={{ name: "tsign", w: 1.75, h: 0.85, x: 0.0, y: 1.45, z: -0.55, mode: "scale", k: signK, state: `${q(ramp(t, CUE.transcripts + 0.1, 0.25))}`, body: (wv, hv) => {
    let s = ink([[12, 12], [wv - 12, 12], [wv - 12, hv - 12], [12, hv - 12]], { seed: 330, w: 5, fill: "#FFFFFF", close: true, amp: 0.8 });
    s += cutTxt("TRANSCRIPT, PLEASE", wv / 2, 52, 28);
    s += strike(30, wv - 30, 44, 331, ramp(t, CUE.transcripts + 0.1, 0.25));
    s += hand("unless you're a few years out of school", wv / 2, 92, { size: 19, c: C.pencil });
    return s;
  } }} />);
  return out;
}

/* ================================================================== station 3: some teams (one in seven, no cap) */
const TEAM_X = [-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2], ODD = 4;
function teamStation(t: number): JSX.Element[] {
  const lit = t >= CUE.pct;
  const out: JSX.Element[] = TEAM_X.map((x, i) => (
    <Standee key={`tm${i}`} d={{ name: `tm${i}`, w: 0.8, h: 1.35, x, z: i % 2 ? -0.32 : 0.12, k: up(t, 3, CUE.teams + i * 0.07), state: i === ODD && lit ? "lit" : "-", body: (wv, hv) =>
      guy(wv / 2, hv - 10, { s: 0.82, seed: 400 + i * 7, hero: i === ODD && lit, pose: { armL: -12 + (i % 3) * 6, armR: 12 + (i % 2) * 10, legL: -7, legR: 7, mood: i === ODD && lit ? "smile" : "flat" }, props: i === ODD ? undefined : gradCap(420 + i) }) }} />
  ));
  out.push(<Standee key="pct" d={{ name: "pct", w: 1.6, h: 1.15, x: 0.0, y: 1.35, z: -0.7, mode: "scale", k: up(t, 3, CUE.pct - 0.05), state: t >= CUE.noCollege ? "b" : "a", body: (wv, hv) => {
    let s = ink([[12, 12], [wv - 12, 12], [wv - 12, hv - 12], [12, hv - 12]], { seed: 440, w: 5, fill: "#FFFFFF", close: true, amp: 0.8 });
    s += cutTxt("14%", wv / 2, 84, 74, C.red);
    if (t >= CUE.noCollege) s += hand("no college background", wv / 2, 116, { size: 22 }) + hand("(drawn: 1 in 7)", wv / 2, 148, { size: 22, c: C.pencil });
    return s;
  } }} />);
  return out;
}

/* ================================================================== station 4: the cloud (illustration) */
const CH = { x0: -1.05, x1: 1.15, y0: 0.62, y1: 2.05, z: -0.42 };   // the plot area, world units on the board
const DOTS = Array.from({ length: 24 }, (_, i) => ({ gx: (i + 0.5) / 24 + (hash(i * 3.3) - 0.5) * 0.02, py: 0.08 + hash(i * 7.7 + 2) * 0.84, dz: 0.06 + hash(i * 1.9) * 0.22, hero: i % 6 === 2 }));
function cloudStation(t: number): JSX.Element[] {
  const out: JSX.Element[] = [];
  const kBoard = up(t, 4, null, 0);
  const lineDraw = ramp(t, CUE.ifGrades + 0.2, 0.5), cloudDraw = ramp(t, CUE.cloud, 0.45);
  const dim = t >= CUE.careful ? 1 : 0;
  out.push(<Standee key="board" d={{ name: "board", w: 2.9, h: 2.25, x: 0.05, z: CH.z, k: kBoard, state: `${q(lineDraw)}-${q(cloudDraw)}-${dim}`, body: (wv, hv) => {
    const X = (gx: number) => (CH.x0 - 0.05 + gx * (CH.x1 - CH.x0) + wv / 2 / VB - 0.05) * VB, Y = (gy: number) => hv - (CH.y0 + gy * (CH.y1 - CH.y0)) * VB;
    let s = ink([[10, 10], [wv - 10, 10], [wv - 10, hv - 10], [10, hv - 10]], { seed: 500, w: 5, fill: "#FFFFFF", close: true, amp: 0.8 });
    s += ink([[X(0), Y(1.02)], [X(0), Y(0)], [X(1.02), Y(0)]], { seed: 501, w: 6 });
    s += ink([[X(1.02) - 14, Y(0) - 10], [X(1.02), Y(0)], [X(1.02) - 14, Y(0) + 10]], { seed: 502, w: 5 }) + ink([[X(0) - 10, Y(1.02) + 14], [X(0), Y(1.02)], [X(0) + 10, Y(1.02) + 14]], { seed: 503, w: 5 });
    s += hand("GPA", X(1.0), Y(0) + 34, { size: 30, anchor: "end" });
    s += hand("does the job well", X(0) + 12, Y(1.02) + 6, { size: 24, anchor: "start" });
    s += hand("illustration, not Google's data", wv - 26, hv - 22, { size: 20, anchor: "end", c: C.red });
    if (lineDraw > 0) s += ink(seg([X(0.02), Y(0.04)], [X(0.98), Y(0.96)], 14), { seed: 504, w: 5, c: C.pencil, draw: lineDraw, amp: 0.6 }) + (lineDraw >= 1 ? hand("grades would predict", X(1.0), Y(0.98) - 8, { size: 19, anchor: "end", c: C.pencil }) : "");
    if (cloudDraw > 0) {
      const pts = circlePts(0, 0, 1, 22).map(([px, py], i) => [X(0.5) + px * (X(1) - X(0)) * 0.42 * (1 + 0.08 * Math.sin(i * 2.7)), Y(0.5) + py * (Y(0) - Y(1)) * 0.42 * (1 + 0.08 * Math.cos(i * 3.1))] as Pt);
      s += ink(pts, { seed: 505, w: 6, c: "#18A57A", close: true, draw: cloudDraw, amp: 2.4 });
    }
    return s;
  } }} />);
  // the people: lined up by GPA along the bottom, then lifted by how well they do the job → a cloud;
  // on "line." they slide onto the line grades would predict, then fall back into the cloud on "cloud."
  const lift = ease.inOut3(ramp(t, CUE.job - 0.15, 0.7));
  const toLine = ease.inOut3(ramp(t, CUE.aLine - 0.35, 0.4)) * (1 - ease.inOut3(ramp(t, CUE.cloud - 0.1, 0.45)));
  DOTS.forEach((d, i) => {
    const a = up(t, 4, CUE.lineUp + i * 0.035);
    if (a <= 0.01) return;
    const gy = lerp(lerp(0.02, d.py, lift), d.gx, toLine);
    const x = CH.x0 + d.gx * (CH.x1 - CH.x0), y = CH.y0 + gy * (CH.y1 - CH.y0), z = CH.z + d.dz;
    const s = Math.min(1.1, a) * (dim ? 0.8 : 1) * Math.pow(Math.min(1, kBoard), 4);
    out.push(
      <Mesh3d key={`dot${i}`} name={`dot-${i}`} allowOverlap transform={Transform.fromXyz(x, y, z).withScale([s, s, s])}><Sphere radius={0.055} /><M c={d.hero ? C.gold : C.ink} r={0.35} /></Mesh3d>,
    );
  });
  // school vs job, then the honesty tag
  const noteK = up(t, 4, CUE.answers - 0.1) * (1 - ease.inOut3(ramp(t, CUE.careful - 0.3, 0.25)));
  if (noteK > 0.01) out.push(<Standee key="sj" d={{ name: "sj", w: 1.55, h: 0.95, x: -0.55, y: 0.72, z: 0.6, tilt: 0.04, mode: "scale", k: noteK, state: t >= CUE.find ? "b" : "a", body: (wv, hv) =>
    ink([[10, 10], [wv - 10, 10], [wv - 10, hv - 10], [10, hv - 10]], { seed: 520, w: 4, fill: C.note, close: true, amp: 0.6 }) +
    hand("school: answer", 24, 50, { size: 28, anchor: "start" }) + hand("their questions", 44, 78, { size: 24, anchor: "start", c: C.pencil }) +
    (t >= CUE.find ? hand("job: find the questions", 24, 116, { size: 26, anchor: "start", c: "#127E5E" }) : "") }} />);
  const tagK = up(t, 4, CUE.careful - 0.05);
  if (tagK > 0.01) out.push(<Standee key="careful" d={{ name: "careful", w: 1.85, h: 1.1, x: 0.2, y: 0.7, z: 0.7, tilt: -0.04, mode: "scale", k: tagK, state: `${+(t >= CUE.oneCo)}${+(t >= CUE.oneInt)}${+(t >= CUE.y13b)}${+(t >= CUE.plenty)}`, body: (wv, hv) => {
    let s = ink([[40, 12], [wv - 12, 12], [wv - 12, hv - 12], [40, hv - 12], [12, hv / 2]], { seed: 530, w: 5, fill: "#FFFFFF", close: true, amp: 0.8 }) + circle(38, hv / 2, 7, { seed: 531, w: 3 });
    const items: [number, string][] = [[CUE.oneCo, "1 company"], [CUE.oneInt, "1 interview"], [CUE.y13b, "in 2013"]];
    items.forEach(([at, label], i) => { if (t >= at) s += hand(label, 66, 46 + i * 28, { size: 28, anchor: "start" }); });
    if (t >= CUE.plenty) s += hand("plenty still check grades", wv / 2 + 14, 140, { size: 24, c: C.red });
    return s;
  } }} />);
  return out;
}

/* ================================================================== station 5: what you can show */
const BLOCKS = [
  { x: 0, y: 0.15, c: "#6FDDB8" }, { x: 0.02, y: 0.45, c: "#FFE04A" }, { x: -0.01, y: 0.75, c: "#D9344A" }, { x: 0.01, y: 1.05, c: "#6FA8DD" },
];
function showStation(t: number): JSX.Element[] {
  const out: JSX.Element[] = [];
  const scoredK = ramp(t, CUE.scored + 0.05, 0.25);
  out.push(<Standee key="ask" d={{ name: "ask", w: 1.9, h: 0.95, x: 0.0, y: 1.45, z: -0.75, mode: "scale", k: up(t, 5, CUE.travels - 0.2), state: `${q(scoredK)}-${+(t >= CUE.show - 0.1)}`, body: (wv, hv) => {
    let s = ink([[12, 12], [wv - 12, 12], [wv - 12, hv - 12], [12, hv - 12]], { seed: 600, w: 5, fill: "#FFFFFF", close: true, amp: 0.8 });
    s += hand("What did you score?", wv / 2, 52, { size: 32, c: C.pencil }) + strike(40, wv - 40, 44, 601, scoredK);
    if (t >= CUE.show - 0.1) s += hand("What can you show?", wv / 2, 108, { size: 36, hl: C.mint });
    return s;
  } }} />);
  out.push(<Standee key="appA" d={{ name: "appA", w: 1.0, h: 1.5, x: -0.92, z: 0.0, k: up(t, 5, CUE.people), state: t >= CUE.keep ? "k" : "-", body: (wv, hv) =>
    fig(wv, hv, { seed: 610, pose: { armL: -14, armR: t >= CUE.keep ? 160 : 95, legL: -7, legR: 7, mood: t >= CUE.keep ? "smile" : "flat" } }) }} />);
  out.push(<Standee key="sheetA" d={{ name: "sheetA", w: 0.72, h: 0.82, x: -0.2, y: 0.85, z: 0.3, tilt: 0.06, mode: "scale", k: up(t, 5, CUE.four - 0.1) * (1 - ease.inOut3(ramp(t, CUE.keep, 0.3))), state: `${+(t >= CUE.passed)}`, body: (wv, hv) => {
    let s = ink([[10, 10], [wv - 10, 10], [wv - 10, hv - 10], [10, hv - 10]], { seed: 620, w: 4, fill: "#FFFFFF", close: true, amp: 0.6 }) + cutTxt("GPA", wv / 2, 58, 22) + cutTxt("4.0", wv / 2, 104, 44, C.red);
    if (t >= CUE.passed) s += hand("passed", wv / 2 - 10, 34, { size: 24, c: C.pencil }) + tick(wv - 40, 26, 621, ramp(t, CUE.passed, 0.2), C.pencil);
    return s;
  } }} />);
  out.push(<Standee key="appB" d={{ name: "appB", w: 1.0, h: 1.5, x: 0.95, z: -0.1, k: up(t, 5, CUE.people + 0.15), state: t > CUE.can ? "c" : "-", body: (wv, hv) =>
    fig(wv, hv, { hero: true, seed: 630, dir: -1, pose: { armL: -14, armR: t > CUE.can ? 150 : 70, legL: -7, legR: 7, mood: t > CUE.can ? "smile" : "flat" } }) }} />);
  // the thing they built: blocks stacked on "built,", the top one knocked off on "broke,", back on "fixed."
  const bx = 0.3, bz = 0.42;
  BLOCKS.forEach((b, i) => {
    const drop = ease.out3(ramp(t, CUE.link + i * 0.18, 0.3));
    const vis = up(t, 5, CUE.link + i * 0.18);
    if (vis <= 0.01) return;
    let x = bx + b.x, y = b.y + (1 - drop) * 0.8, rz = 0;
    if (i === 3) {
      const fall = ease.inOut3(ramp(t, CUE.broke, 0.35)) * (1 - ease.inOut3(ramp(t, CUE.fixed - 0.1, 0.4)));
      x += fall * 0.45; y = lerp(y, 0.15, fall); rz = -fall * 1.4;
    }
    const s = Math.min(1, vis);
    out.push(<Mesh3d key={`blk${i}`} name={`blk-${i}`} allowOverlap transform={Transform.fromXyz(x, y, bz).withRotation(Quat.fromEuler("XYZ", 0, 0.15 * i, rz)).withScale([s, s, s])}><Cuboid half_size={[0.16, 0.15, 0.16]} /><M c={b.c} r={0.5} /></Mesh3d>);
  });
  const flagK = up(t, 5, CUE.can - 0.05);
  if (flagK > 0.01) {
    out.push(<Mesh3d key="pole" name="flag-pole" transform={Transform.fromXyz(bx, 1.2 + 0.3 * flagK, bz).withScale([1, Math.max(0.01, flagK), 1])}><Cylinder radius={0.015} half_height={0.3} /><M c="#C9CCD6" r={0.3} m={1} /></Mesh3d>);
    out.push(<Standee key="flag" d={{ name: "flag", w: 0.75, h: 0.42, x: bx + 0.38, y: 1.42, z: bz, mode: "scale", k: flagK, body: (wv, hv) =>
      ink([[8, 8], [wv - 8, hv / 2], [8, hv - 8]], { seed: 640, w: 4, fill: C.mint, close: true, amp: 0.6 }) + cutTxt("CAN", wv * 0.38, hv / 2 + 10, 28) }} />);
  }
  return out;
}

/* ================================================================== the world */
type V3 = [number, number, number];
const STATIONS = [doorStation, paperStation, binStation, teamStation, cloudStation, showStation];
function Table({ t }: { t: number }) {
  const phi = spin(t) * THETA;
  return (
    <>
      <Mesh3d name="desk" transform={Transform.fromXyz(0, -0.62, 0)}><Cuboid half_size={[40, 0.3, 40]} /><M c="#6E4529" r={0.55} /></Mesh3d>
      {[-8, -3, 2, 7].map((x, k) => (
        <Mesh3d key={k} name={`grain-${k}`} allowOverlap transform={Transform.fromXyz(x * 1.9, -0.319, 0)}><Cuboid half_size={[0.03, 0.001, 40]} /><M c="#5E3A22" r={0.6} /></Mesh3d>
      ))}
      <Mesh3d name="base" transform={Transform.fromXyz(0, -0.24, 0)}><Cylinder radius={2.2} half_height={0.08} /><M c="#2E2A26" r={0.5} m={0.2} /></Mesh3d>
      <Entity transform={Transform.fromXyz(0, 0, 0).withRotation(Quat.fromEuler("XYZ", 0, -phi, 0))}>
        <Mesh3d name="disc" transform={Transform.fromXyz(0, -0.08, 0)}><Cylinder radius={R + 1.9} half_height={0.08} /><M c="#B08A5C" r={0.85} /></Mesh3d>
        {STATIONS.map((fn, i) => (
          <Entity key={i} transform={Transform.fromXyz(R * Math.sin(i * THETA), 0, R * Math.cos(i * THETA)).withRotation(Quat.fromEuler("XYZ", 0, i * THETA, 0))}>
            <Mesh3d name={`pad-${i}`} allowOverlap transform={Transform.fromXyz(0, 0.012, 0)}><Cylinder radius={2.25} half_height={0.01} /><M c={i % 2 ? "#9C7549" : "#A98253"} r={0.9} /></Mesh3d>
            {fn(t)}
          </Entity>
        ))}
      </Entity>
    </>
  );
}

/* ================================================================== camera: a fixed rig at the front of the table, breathing */
const FOV = 36;
function cameraAt(t: number): { pos: V3; look: V3 } {
  let turning = 0;
  for (let i = 1; i < ST.length; i++) turning = Math.max(turning, Math.sin(Math.PI * turnK(t, i)));
  const punch = hit(t, CUE.worthless + 0.1, 0.12, 0.7) * 0.07 + hit(t, CUE.pct, 0.12, 0.6) * 0.05 + hit(t, CUE.cloud, 0.12, 0.7) * 0.05 + hit(t, CUE.can, 0.12, 0.7) * 0.05;
  const shake = hit(t, CUE.worthless + 0.1, 0.03, 0.35);
  const away = ramp(t, ST[1].from - TURN.lead, TURN.dur) * (1 - turnK(t, 6)); // 0 at the door (hook and loop), 1 elsewhere
  const rev = revAt(t);
  const dist = 8.4 * (1 + 0.1 * turning * (1 - rev) - punch) * (1 + 0.06 * away) * (1 + 0.5 * rev);
  const pitch = rad(12 + 5 * away + 5 * turning * (1 - rev) + 24 * rev), yaw = rad(drift(t, 2, 0.6) * 2.2 + Math.sin(t * 47) * shake * 0.6);
  const look: V3 = [0, 1.22 + 0.15 * turning * (1 - rev) - 0.5 * away + 0.2 * rev, lerp(R - 0.05, R * 0.78, rev)];
  return { look, pos: [look[0] + dist * Math.sin(yaw) * Math.cos(pitch), look[1] + dist * Math.sin(pitch), look[2] + dist * Math.cos(yaw) * Math.cos(pitch)] };
}

/* ================================================================== overlay: captions on paper strips */
type Page = { words: Word[]; lines: Word[][] };
const CAP = { size: 84, hold: 0.5 };
const BREAK_AFTER = new Set(["years:years,", "picture:4.0.", "travel:scored.", "teams:people"]);
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
function TitleBlock({ size, o }: { size: number; o: number }) {
  return (
    <div style={abs(SAFE.left, ZONES.title.top + 10, { width: SAFE.right - SAFE.left, opacity: o })}>
      <div style={abs(-22, -14, { width: 700, height: size * 2 + 104, background: C.card, transform: "rotate(-1deg)", boxShadow: "0px 8px 0px rgba(40,25,10,0.25)" })} />
      <div style={{ ...display(size), position: "relative", whiteSpace: "pre-line" }}>{TITLE}</div>
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
      <Hud n="#006" />
      {titleO > 0.01 && <TitleBlock size={104} o={titleO} />}
      {KICKERS.map((s, i) => {
        if (t < s.from || t > s.to + 0.2 || titleO > 0.5) return null;
        const o = Math.min(ramp(t, s.from, 0.18), 1 - ramp(t, s.to - 0.2, 0.16), 1 - titleO);
        if (o <= 0.01) return null;
        return (
          <div key={i} style={abs(SAFE.left, ZONES.title.top + 10, { opacity: o, display: "flex", flexDirection: "row" })}>
            <div style={{ ...display(80), position: "relative", paddingLeft: 16, paddingRight: 16, paddingTop: 6, paddingBottom: 2, background: C.hl, transform: "rotate(-1.2deg)" }}>{s.text}</div>
          </div>
        );
      })}
      <Captions t={t} />
      <div style={abs(SAFE.left, ZONES.captions.bottom + 2, { width: SAFE.railX - SAFE.left, fontFamily: "JBMono", fontWeight: 600, fontSize: 26, letterSpacing: "0.04em", textTransform: "uppercase", color: C.ink, opacity: 0.9 })}>{SOURCE}</div>
    </AbsoluteFill>
  );
}

/* ================================================================== the reel */
const MIX = 0.5;
function Lights() {
  return (
    <>
      <ToneMapping mode="tony" exposure={0.6} />
      <AmbientLight brightness={360} color="#FFF1E0" />
      <DirectionalLight transform={Transform.fromXyz(-5, 14, 12).lookingAt([0, 0, R])} illuminance={3800} color="#FFF0DC" shadow_maps_enabled soft_shadow_size={2} />
      <SpotLight transform={Transform.fromXyz(-4, 9, R + 3).lookingAt([0, 0.8, R])} intensity={4200000} outer_angle={0.8} inner_angle={0.4} color="#FFE2B8" shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(6, 5, R + 6)} intensity={900000} color="#DCE6FF" range={30} />
    </>
  );
}
function Gpa() {
  const f = useCurrentFrame();
  const t = f / FPS;
  BOIL = Math.floor(f / 3) % 3;
  REVEAL = false;
  const cam = cameraAt(t);
  const sfx: [number, string, number][] = [[0, "pop", 0.35]];
  for (let i = 1; i < ST.length; i++) sfx.push([ST[i].from - TURN.lead, "whoosh", i === 5 ? 0.55 : 0.4]);
  for (const [a, name, v] of [
    [CUE.worthless + 0.1, "stamp", 0.55], [CUE.bock, "pop", 0.3], [CUE.noCorr, "pop", 0.35], [CUE.unrelated, "pop", 0.35],
    [CUE.waste, "whoosh", 0.3], [CUE.waste + 0.5, "pop", 0.3], [CUE.smart, "pop", 0.3], [CUE.transcripts + 0.1, "whoosh", 0.3],
    [CUE.pct, "stamp", 0.4], [CUE.lineUp, "pop", 0.25], [CUE.job, "whoosh", 0.3], [CUE.aLine, "pop", 0.3], [CUE.cloud, "pop", 0.4],
    [CUE.careful, "pop", 0.35], [CUE.plenty, "pop", 0.3], [CUE.scored, "pop", 0.3], [CUE.show, "pop", 0.35],
    [CUE.four, "pop", 0.3], [CUE.link, "pop", 0.3], [CUE.broke, "stamp", 0.35], [CUE.fixed, "pop", 0.35], [CUE.passed, "pop", 0.3], [CUE.can, "pop", 0.45],
  ] as [number, string, number][]) sfx.push([a, name, v]);
  return (
    <AbsoluteFill style={{ background: "#22201E" }}>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: rad(FOV) } }} />
      <Lights />
      <Table t={t} />
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

/* ================================================================== the thumbnail: the door just after the stamp */
const COVER_T = CUE.worthless + 0.9;
function Cover() {
  const t = COVER_T;
  BOIL = 0;
  const look: V3 = [0.05, 1.2, R - 0.05], dist = 9.6, p = rad(15);
  const pos: V3 = [look[0], look[1] + dist * Math.sin(p), look[2] + dist * Math.cos(p)];
  return (
    <AbsoluteFill style={{ background: "#22201E" }}>
      <Camera3d transform={Transform.fromXyz(...pos).lookingAt(look)} projection={{ Perspective: { fov: rad(FOV) } }} />
      <Lights />
      <Table t={t} />
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <style>{FONTS}</style>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(25,15,5,0.45) 100%)" }} />
        <Hud n="#006" big />
        <div style={abs(SAFE.left, ZONES.title.top + 50, { width: SAFE.railX - SAFE.left })}>
          <div style={abs(-22, -14, { width: 780, height: 330, background: C.card, transform: "rotate(-1deg)", boxShadow: "0px 8px 0px rgba(40,25,10,0.25)" })} />
          <div style={{ ...display(112), position: "relative", whiteSpace: "pre-line" }}>{"Google checked\nyour GPA"}</div>
          <div style={{ fontFamily: "Instrument", fontStyle: "italic", fontSize: 56, color: C.red, marginTop: 12, position: "relative" }}>{WHISPER}</div>
        </div>
        <div style={abs(SAFE.left, 1360, { width: SAFE.railX - SAFE.left, fontFamily: "JBMono", fontWeight: 600, fontSize: 26, letterSpacing: "0.04em", textTransform: "uppercase", color: C.ink, opacity: 0.8 })}>Laszlo Bock · NYT interview, 2013</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

registerRoot(() => (
  <>
    <Composition id="gpa" component={Gpa} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />
    <Composition id="cover" component={Cover} width={W} height={H} fps={FPS} durationInFrames={1} />
  </>
));
