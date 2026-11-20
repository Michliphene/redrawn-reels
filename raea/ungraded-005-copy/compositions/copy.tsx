/**
 * UNGRADED #005 — "Ten copies beat one blank page" (episode `copy-to-learn`) · notebook art direction · raea
 * Voice, word timings and sources: public/episodes/copy-to-learn. timings.json is in SECONDS, words by beat; every cue
 * goes through `w(beat, word, n)`, which throws if a word is missing.
 *
 * The Rule Flip of #001 in the notebook world of the raea #004: a reporter's notebook on a desk, one page per scene,
 * ballpoint SVG textures redrawn every frame (the line boils every 3 frames), a 3D page turn between scenes, the
 * camera settling from the frame-0 tilt and going back to it at the end (loop). Pages: the duel (ten copies vs one
 * blank page) · the rule card (copy = cheating → copy = practice) · Franklin's Spectator exercise in two pages
 * (sourced, his Autobiography) · the line and "Picture this" · the duel again, which ends on frame 0.
 */
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "raea";
import { Entity, ToneMapping } from "raea/3d";
import { Cuboid, Cylinder, Cone, Mesh3d, Torus } from "raea/mesh";
import { StandardMaterial } from "raea/pbr";
import { AmbientLight, DirectionalLight, PointLight, SpotLight } from "raea/light";
import { Quat, Transform } from "raea/transform";
import { Camera3d } from "raea/camera";
import TIMINGS from "./timings.json";
import GLYPHS from "./glyphs.json";

/* ================================================================== tokens (studio: src/studio/tokens.ts, doodle kit) */
const FPS = 30, W = 1080, H = 1920;
const SAFE = { top: 250, bottom: 1440, left: 64, right: 1016, railFrom: 860, railX: 930 };
const ZONES = { hud: { top: 250 }, title: { top: 318 }, captions: { top: 1170, bottom: 1410 } };
const C = {
  paper: "#F7F2E4", grid: "#D3E3EE", margin: "#E98C93", ink: "#1E2A5A", pencil: "#6A6A80", red: "#D9344A",
  hl: "#FFE04A", mint: "#6FDDB8", tape: "rgba(233,212,160,0.92)", note: "#FFE77A",
};
const DUR = TIMINGS.duration + 0.5;
const TITLE = "Ten copies beat\none blank page";
const WHISPER = "Copy it. Compare it. Fix it.";
const SOURCE = "Benjamin Franklin, Autobiography (1791)";
const KEYWORDS = ["copies", "copies?", "blank", "cheating.", "zero.", "flip.", "copy", "faults,", "fixes", '"tolerable"', "practice.", "lessons.", "Zero."];

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

/* ================================================================== cues (by word) */
const NEVER = 1e9;
const CUE = {
  ten: w("hook", "Ten"), blank: w("hook", "one"),
  cheating: w("belief", "cheating."), homework: w("school", "homework,"), zero: w("school", "zero."), flip: w("flip", "flip."), nobody: w("rule", "Nobody"), make: w("rule", "make"),
  atTen: w("real", "ten."), ben: w("real", "Benjamin"), puts: w("notes", "puts"), days: w("rewrite", "Days"), own: w("goal", "own"), copyLine: w("line", "Copy"), apprentice: w("find", "apprentice,"), spectator: w("find", "Spectator,"), loves: w("find", "loves"), notes: w("notes", "notes"), away: w("notes", "away."),
  rewrites: w("rewrite", "rewrites"), compares: w("compare", "compares"), faults: w("compare", "faults,"), fixes: w("compare", "fixes"),
  night: w("when", "night,"), morning: w("when", "Early"), sunday: w("when", "On"), goal: w("goal", "goal?"), tolerable: w("goal", '"tolerable"'), poor: w("later", "Poor"),
  sign: w("line", "sign"), cheatingLine: w("line", "cheating."), learn: w("line", "learn?"), practice: w("line", "practice."),
  picture: w("picture", "Picture"), sketch: w("picture", "sketch."), memory: w("picture", "memory."), change: w("picture", "change"), signThat: w("picture", "sign"),
  endTen: w("count", "Ten"), lessons: w("count", "lessons."), scared: w("count", "scared"), endZero: w("count", "Zero."), reset: w("loop", "copy"),
};

/* ================================================================== pages (one scene = one page; a page turn between) */
type PageId = "open" | "rule" | "spectator" | "compare" | "practice" | "end";
const PAGES: { id: PageId; from: number }[] = [
  { id: "open", from: 0 }, { id: "rule", from: B("belief") + 0.25 }, { id: "spectator", from: B("real") - 0.12 },
  { id: "compare", from: B("rewrite") - 0.12 }, { id: "practice", from: B("line") - 0.12 }, { id: "end", from: B("count") - 0.12 },
];
const KICKERS = [
  { text: "The rule", from: PAGES[1].from, to: PAGES[2].from },
  { text: "A real one", from: PAGES[2].from, to: PAGES[4].from },
  { text: "The line", from: PAGES[4].from, to: B("picture") - 0.1 },
  { text: "Picture this", from: B("picture") - 0.1, to: PAGES[5].from },
];
const FLIP = { lead: 0.34, dur: 0.66 };
/** the page being turned now: index of the page that goes over the spiral, and its 0→1 progress */
function flipAt(t: number): { i: number; k: number } | null {
  for (let i = 1; i < PAGES.length; i++) {
    const a = PAGES[i].from - FLIP.lead;
    if (t >= a && t < a + FLIP.dur) return { i: i - 1, k: ease.inOut3(ramp(t, a, FLIP.dur)) };
  }
  return null;
}
const pageAt = (t: number) => { let k = 0; for (let i = 0; i < PAGES.length; i++) if (t >= PAGES[i].from - FLIP.lead + FLIP.dur * 0.5) k = i; return k; };

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
function sticky(x: number, y: number, text: string, o: { w?: number; rot?: number; s?: number; opacity?: number } = {}) {
  const { w: sw = 360, rot = -3, s = 1, opacity = 1 } = o;
  const lines: string[] = [];
  for (const wd of text.split(" ")) { const l = lines[lines.length - 1]; if (l && (l + " " + wd).length <= 18) lines[lines.length - 1] = l + " " + wd; else lines.push(wd); }
  const h = 60 + lines.length * 62;
  const body =
    `<rect x="6" y="8" width="${sw}" height="${h}" fill="#000000" opacity="0.12"/><rect x="0" y="0" width="${sw}" height="${h}" fill="${C.note}"/>` +
    `<rect x="${sw / 2 - 50}" y="-14" width="100" height="30" fill="#E9D4A0" opacity="0.9" transform="rotate(4 ${sw / 2} 0)"/>` +
    lines.map((l, i) => txt(l, 28, 78 + i * 62, 64, { font: "hand", anchor: "start", fill: C.ink })).join("");
  return g(body, `translate(${x} ${y}) rotate(${rot}) scale(${s.toFixed(3)})`, opacity);
}

/* ================================================================== the six pages */
const GROUND = 1095;
const ground = () => ink(seg([70, GROUND], [1010, GROUND], 10), { seed: 900, w: 5, c: C.pencil });

/* a sheet of paper with ruled scribble lines (top-left x, y), `k` = how much is written (0–1) */
function sheetDoodle(x: number, y: number, w: number, h: number, o: { seed: number; k?: number; lines?: number; neat?: boolean; fill?: string; rot?: number } = { seed: 1 }) {
  const { seed, k = 1, lines = 7, neat = false, fill = "#FFFFFF", rot = 0 } = o;
  let s = ink([[0, 0], [w, 0], [w, h], [0, h]], { seed, w: 4, fill, close: true, amp: 0.8 });
  const gap = (h - 70) / lines;
  for (let i = 0; i < lines; i++) {
    const kk = clamp01(k * lines - i);
    if (kk <= 0) break;
    const len = (w - 50) * (neat ? (i % 3 === 2 ? 0.7 : 0.95) : 0.55 + hash(seed + i) * 0.4);
    s += ink(seg([25, 45 + i * gap], [25 + len, 45 + i * gap], 4), { seed: seed + 10 + i, w: neat ? 3 : 4, c: neat ? C.pencil : C.ink, amp: neat ? 0.3 : 1.4, draw: kk });
  }
  return g(s, `translate(${f1(x)} ${f1(y)}) rotate(${rot})`);
}

/* duel: ten copies on the left, one blank page on the right (frame 0 and the end, which loops back to frame 0) */
let COVER = false; // the thumbnail composition: a "vs." between the two sides
function duelPage(t: number, mode: "open" | "end" | "still"): string {
  const live = mode !== "still";
  const at = (x: number) => (live ? x : NEVER);
  const vTen = at(mode === "open" ? CUE.ten : CUE.endTen), vZero = at(mode === "open" ? CUE.blank : CUE.endZero);
  const lessons = at(mode === "end" ? CUE.lessons : NEVER), scared = at(mode === "end" ? CUE.scared : NEVER);
  const reset = mode === "end" ? 1 - ramp(t, CUE.reset, 0.7) : 1; // the end fades the numbers out: the last frame is frame 0
  let s = ground();
  // the pile of copies, and the one who made them
  for (let k = 0; k < 10; k++) {
    const y = GROUND - 16 - k * 17, dx = ((k * 37) % 23) - 11;
    s += ink([[230 + dx, y], [400 + dx, y], [404 + dx, y + 13], [226 + dx, y + 13]], { seed: 4000 + k, w: 3.5, fill: "#FFFFFF", close: true, amp: 0.5 });
    if (t >= lessons) {
      const p = ramp(t, lessons + k * 0.05, 0.2);
      if (p > 0) s += ink([[410 + dx, y + 2], [420 + dx, y + 12], [438 + dx, y - 6]], { seed: 4020 + k, w: 4.5, c: "#18A57A", draw: p, opacity: reset });
    }
  }
  s += guy(130, GROUND, { s: 1.3, hero: true, seed: 4040, pose: { ...POSE.stand(t), armR: 60 + Math.sin(t * 2) * 6, mood: "smile" },
    props: (j) => g(ink([[-22, -28], [22, -28], [22, 24], [-22, 24]], { seed: 4041, w: 3, fill: "#FFFFFF", close: true, amp: 0.4 }), `translate(${f1(j.handR[0] + 14)} ${f1(j.handR[1] - 6)}) rotate(-8)`) });
  // the desk, the blank page, the one who waits
  const shiver = t >= scared && t < scared + 1.4 ? Math.sin(t * 60) * 3 : 0;
  s += ink([[600, 960], [930, 960]], { seed: 4050, w: 7 }) + ink([[625, 960], [625, GROUND]], { seed: 4051, w: 6 }) + ink([[905, 960], [905, GROUND]], { seed: 4052, w: 6 });
  s += ink([[780, 955], [900, 955], [890, 790], [790, 790]], { seed: 4053, w: 4, fill: "#FFFFFF", close: true, amp: 0.6 });
  s += guy(700 + shiver, GROUND, { s: 1.3, c: C.pencil, seed: 4060, pose: { ...POSE.desk(t >= vZero ? 0.5 : 0.15), armR: 70, armL: 80, mood: t >= vZero ? "sad" : "o" } });
  if (t >= scared) s += g(ink([[722, 842], [714, 860], [730, 860]], { seed: 4061, w: 3, c: "#4A8FD9", fill: "#BFE0FF", close: true, amp: 0.4 }), "", ramp(t, scared, 0.2) * reset);
  if (COVER) s += hand("vs.", 545, 1010, { size: 70, c: C.red });
  // the numbers
  if (t >= vTen) {
    const k = Math.min(1.1, pop(t, vTen, 0.35));
    s += g(cut("10", 0, 0, 150, C.ink) + hand(t >= lessons ? "lessons" : "copies", 0, 58, { size: 54, hl: t >= lessons ? C.mint : undefined }), `translate(315 ${GROUND - 250}) scale(${k.toFixed(3)})`, reset);
  }
  if (t >= vZero) {
    const k = Math.min(1.1, pop(t, vZero, 0.35));
    s += g(cut("0", 0, 0, 150, C.red) + hand("blank page", 0, 58, { size: 54 }), `translate(${COVER ? 840 : 780} ${GROUND - 410}) scale(${k.toFixed(3)})`, reset);
  }
  return s;
}

/* rule: the classroom, the card "copy = cheating" that flips to "copy = practice" */
function rulePage(t: number): string {
  let s = ground();
  // the card
  const inP = pop(t, CUE.cheating, 0.4), k = ramp(t, CUE.flip, 0.5), back = k >= 0.5, sx = Math.abs(Math.cos(k * Math.PI));
  const side = back ? { small: "out here", text: "COPY = PRACTICE", fill: C.mint, c: C.ink } : { small: "at school", text: "COPY = CHEATING", fill: "#FFFFFF", c: C.red };
  if (inP > 0.001)
    s += g(`<rect x="-362" y="-132" width="740" height="280" fill="#000000" opacity="0.12"/>` + ink([[-370, -140], [370, -140], [370, 140], [-370, 140]], { seed: 4100, w: 6, fill: side.fill, close: true }) +
      txt(side.small, -320, -66, 50, { fill: C.pencil, anchor: "start" }) + cut(side.text, 0, 62, 96, side.c),
      `translate(540 600) scale(${Math.max(0.001, sx * inP).toFixed(3)} ${inP.toFixed(3)}) rotate(${back ? 2 : -2})`);
  // two desks: the hero copies the neighbour's homework
  const copying = t >= CUE.homework, zero = t >= CUE.zero, cross = t >= CUE.nobody, made = t >= CUE.make;
  for (const [x0, seed] of [[180, 4110], [560, 4120]] as [number, number][]) {
    s += ink([[x0, 975], [x0 + 300, 975]], { seed, w: 7 }) + ink([[x0 + 20, 975], [x0 + 20, GROUND]], { seed: seed + 1, w: 6 }) + ink([[x0 + 280, 975], [x0 + 280, GROUND]], { seed: seed + 2, w: 6 });
    s += ink([[x0 + 160, 968], [x0 + 260, 968], [x0 + 252, 952], [x0 + 168, 952]], { seed: seed + 3, w: 3, fill: "#FFFFFF", close: true, amp: 0.4 });
  }
  const sad = zero && !made;
  const heroPose: Pose = { ...POSE.desk(sad ? 0.6 : 0.1), armR: 75, mood: sad ? "sad" : copying ? "o" : "flat" };
  if (copying && !zero) heroPose.lean = 18; // leaning over to the neighbour's page
  s += guy(260, GROUND, { s: 1.15, hero: true, seed: 4130, pose: made ? POSE.cheer(t) : heroPose });
  s += guy(640, GROUND, { s: 1.15, c: C.pencil, seed: 4140, pose: { ...POSE.desk(0.1), armR: 75, mood: "flat" } });
  if (copying && !cross) for (let k = 0; k < 6; k++) s += `<circle cx="${f1(lerp(330, 760, k / 5))}" cy="${f1(lerp(870, 945, k / 5) - Math.sin((k / 5) * Math.PI) * 40)}" r="5" fill="${C.pencil}" opacity="${ramp(t, CUE.homework + k * 0.06, 0.1).toFixed(2)}"/>`;
  if (zero) {
    const p = Math.min(1.12, pop(t, CUE.zero, 0.3));
    s += g(circle(0, 0, 58, { seed: 4150, w: 8, c: C.red }) + cut("0", 0, 36, 100, C.red) + (cross ? ink([[-80, -20], [-30, 25], [10, -15], [50, 30], [85, -10]], { seed: 4151, w: 11, draw: ramp(t, CUE.nobody, 0.3) }) : ""),
      `translate(400 845) rotate(-8) scale(${p.toFixed(3)})`);
  }
  return s;
}

/* spectator: school at ten, the apprentice, the London paper, notes, the book put away */
function spectatorPage(t: number): string {
  let s = ground();
  const schoolO = t < CUE.apprentice ? 1 : 1 - 0.7 * ramp(t, CUE.apprentice, 0.4);
  s += g(ink([[90, GROUND], [90, 860], [330, 860], [330, GROUND]], { seed: 4200, w: 5, fill: "#FFFFFF" }) + ink([[70, 870], [210, 760], [350, 870]], { seed: 4201, w: 5, fill: "#F3D7C8", close: true }) +
    ink([[180, GROUND], [180, 980], [240, 980], [240, GROUND]], { seed: 4202, w: 4 }) + hand("SCHOOL", 210, 845, { size: 40 }), "", schoolO);
  if (t >= CUE.atTen) s += hand("age 10", 120, 720, { size: 54, c: C.red, opacity: ramp(t, CUE.atTen, 0.2) * schoolO, anchor: "start" });
  const walk = ramp(t, CUE.atTen, 0.9), hx = lerp(210, 420, ease.inOut3(walk));
  const reading = t >= CUE.loves;
  s += guy(hx, GROUND, { s: 1.3, hero: true, seed: 4210, pose: walk > 0 && walk < 1 ? POSE.walk(t * 9) : reading ? { ...POSE.stand(t), armR: 70, armL: 60, mood: "smile" } : { ...POSE.stand(t), mood: "flat" } });
  if (t >= CUE.ben) s += hand("Ben Franklin", hx, 790, { size: 58, hl: C.hl, opacity: ramp(t, CUE.ben, 0.2) });
  if (t >= CUE.apprentice) s += hand("apprentice", hx, 850, { size: 50, c: C.ink, opacity: ramp(t, CUE.apprentice, 0.25) });
  // the book: The Spectator, vol. III; on "away." it slides into a box ("a few days")
  if (t >= CUE.spectator) {
    const away = ease.inOut3(ramp(t, CUE.puts, 0.5));
    const bx = lerp(760, 790, away), by = lerp(680, 1000, away), sc = Math.min(1.08, pop(t, CUE.spectator, 0.4)) * lerp(1, 0.45, away);
    s += g(ink([[-130, -170], [130, -170], [130, 170], [-130, 170]], { seed: 4220, w: 6, fill: "#9A6A3C", close: true }) + ink([[-110, -170], [-110, 170]], { seed: 4221, w: 4, c: "#5E3B1E" }) +
      txt("THE", 10, -84, 40, { font: "cut", fill: "#FFE7B0" }) + txt("SPECTATOR", 10, -26, 50, { font: "cut", fill: "#FFE7B0" }) + txt("vol. III", 10, 44, 48, { fill: "#FFE7B0" }) + txt("London", 10, 120, 40, { fill: "#F3D7A8" }),
      `translate(${f1(bx)} ${f1(by)}) rotate(4) scale(${sc.toFixed(3)})`);
    if (reading && t < CUE.notes) for (let k = 0; k < 3; k++) { const p = ((t - CUE.loves) * 0.6 + k / 3) % 1; s += heart(600 + k * 70, 500 - p * 90, 1 - p, 4230 + k); }
  }
  if (t >= CUE.notes) s += g(sheetDoodle(0, 0, 250, 250, { seed: 4240, k: ramp(t, CUE.notes + 0.1, 1.5), lines: 5, fill: C.note }) + hand("notes", 125, -20, { size: 46 }),
    "translate(300 470) rotate(-3)", ramp(t, CUE.notes, 0.2));
  if (t >= CUE.puts - 0.05) {
    s += ink([[660, 1060], [920, 1060], [920, 1090], [660, 1090]], { seed: 4250, w: 5, fill: "#D9B98C", close: true, amp: 0.6 }); // the box lid (front)
    if (t >= CUE.away) s += hand("a few days", 790, 950, { size: 52, c: C.ink, opacity: ramp(t, CUE.away, 0.2) });
  }
  return s;
}
const heart = (x: number, y: number, o: number, seed: number) =>
  ink([[x, y + 14], [x - 18, y - 2], [x - 12, y - 14], [x, y - 6], [x + 12, y - 14], [x + 18, y - 2]], { seed, w: 4, c: C.red, fill: "#F7A4AE", close: true, amp: 0.5, opacity: Math.max(0, o) });

/* compare: the rewrite next to the original, faults circled and fixed, when he worked, his goal, the almanac */
const FAULTS: Pt[] = [[300, 650], [200, 745], [350, 840]];
function comparePage(t: number): string {
  let s = ground();
  const dim = 1 - 0.75 * ramp(t, CUE.goal, 0.4);
  // the writer at his desk
  s += ink([[60, 975], [380, 975]], { seed: 4300, w: 7 }) + ink([[85, 975], [85, GROUND]], { seed: 4301, w: 6 }) + ink([[355, 975], [355, GROUND]], { seed: 4302, w: 6 });
  s += guy(170, GROUND, { s: 1.15, hero: true, seed: 4310, pose: t >= CUE.fixes && t < CUE.night ? POSE.cheer(t) : { ...POSE.desk(0.15), armR: 75 + Math.sin(t * 12) * 8, mood: t >= CUE.faults && t < CUE.fixes ? "o" : "flat" } });
  // my copy (written from notes) and the original
  let sheets = sheetDoodle(110, 520, 360, 400, { seed: 4320, k: ramp(t, CUE.rewrites, 1.6), lines: 8 }) + hand("my copy", 290, 500, { size: 48 });
  if (t >= CUE.days && t < CUE.compares + 0.3) sheets += hand("a few days later", 290, 445, { size: 50, c: C.ink, hl: C.hl, opacity: Math.min(ramp(t, CUE.days, 0.2), 1 - ramp(t, CUE.compares, 0.3)) });
  if (t >= CUE.compares) {
    const p = ease.out3(ramp(t, CUE.compares, 0.4));
    sheets += g(sheetDoodle(0, 0, 360, 400, { seed: 4330, lines: 8, neat: true, fill: "#FBF6E8" }) + hand("original", 180, -20, { size: 48 }), `translate(${f1(lerp(1000, 550, p))} 520)`);
    sheets += hand("vs", 510, 730, { size: 52, c: C.pencil, opacity: p });
  }
  FAULTS.forEach(([x, y], i) => {
    const a = CUE.faults + i * 0.12, b = CUE.fixes + i * 0.12;
    if (t < a) return;
    const fixed = t >= b;
    sheets += circle(x, y, 34, { seed: 4340 + i, w: 6, c: C.red, opacity: fixed ? 1 - ramp(t, b, 0.25) * 0.7 : 1 });
    if (fixed) sheets += ink([[x + 22, y - 2], [x + 34, y + 12], [x + 60, y - 26]], { seed: 4350 + i, w: 7, c: "#18A57A", draw: ramp(t, b, 0.2) });
  });
  s += g(sheets, "", dim);
  // when: at night, early in the morning, on Sundays
  const icon = (at: number, x: number, body: string, label: string) =>
    t >= at ? g(body + hand(label, 0, 92, { size: 40, c: C.ink }), `translate(${x} 975) scale(${Math.min(1.1, pop(t, at, 0.3)).toFixed(3)})`, dim) : "";
  s += icon(CUE.night, 520, ink([[10, -50], [-20, -40], [-30, -10], [-18, 20], [12, 30], [-6, 6], [-8, -24]], { seed: 4360, w: 5, fill: "#FFE77A", close: true }), "night");
  s += icon(CUE.morning, 680, circle(0, -10, 30, { seed: 4361, w: 5, fill: "#FFC94A" }) + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * Math.PI * 2; return ink([[Math.cos(a) * 42, -10 + Math.sin(a) * 42], [Math.cos(a) * 58, -10 + Math.sin(a) * 58]], { seed: 4362 + i, w: 4, amp: 0.4 }); }).join(""), "morning");
  s += icon(CUE.sunday, 830, ink([[-42, -50], [42, -50], [42, 34], [-42, 34]], { seed: 4370, w: 5, fill: "#FFFFFF", close: true }) + `<rect x="-42" y="-50" width="84" height="22" fill="${C.red}"/>` + txt("SUN", 0, 22, 38, { font: "cut", fill: C.ink }), "Sundays");
  s += hand("Franklin", 230, 1150, { size: 44, c: C.pencil });
  // his goal, in his own words
  if (t >= CUE.goal) s += sticky(120, 520, t < CUE.tolerable ? "his goal:" : "his goal: “a tolerable English writer”", { w: 470, rot: -3, s: Math.min(1.08, pop(t, CUE.goal, 0.35)) });
  if (t >= CUE.own) s += hand("in his own words", 360, 830, { size: 46, c: C.pencil, opacity: ramp(t, CUE.own, 0.25) });
  // the almanac
  if (t >= CUE.poor)
    s += g(ink([[-130, -165], [130, -165], [130, 165], [-130, 165]], { seed: 4380, w: 6, fill: "#EFD9A0", close: true }) + ink([[-110, -165], [-110, 165]], { seed: 4381, w: 4, c: "#9A7A3C" }) +
      txt("Poor", 10, -90, 48) + txt("Richard’s", 10, -40, 48) + txt("ALMANACK", 10, 30, 50, { font: "cut", fill: C.red }) +
      circle(10, 100, 26, { seed: 4382, w: 4, fill: "#FFC94A" }),
      `translate(760 690) rotate(5) scale(${Math.min(1.1, pop(t, CUE.poor, 0.4)).toFixed(3)})`);
  return s;
}

/* practice: the line (signed = cheating, to learn = practice), then "Picture this": copy, from memory, one change */
function cat(cx: number, cy: number, o: { seed: number; draw: number; amp?: number; hat?: boolean }) {
  const { seed, draw, amp = 1.2, hat } = o;
  if (draw <= 0) return "";
  let s = circle(cx, cy, 56, { seed, w: 6, draw, amp });
  s += ink([[cx - 48, cy - 26], [cx - 40, cy - 86], [cx - 12, cy - 54]], { seed: seed + 1, w: 6, draw: ramp(draw, 0.3, 0.3), amp });
  s += ink([[cx + 12, cy - 54], [cx + 40, cy - 86], [cx + 48, cy - 26]], { seed: seed + 2, w: 6, draw: ramp(draw, 0.45, 0.3), amp });
  if (draw > 0.6) {
    s += `<circle cx="${cx - 20}" cy="${cy - 6}" r="6" fill="${C.ink}"/><circle cx="${cx + 20}" cy="${cy - 6}" r="6" fill="${C.ink}"/>`;
    s += ink([[cx - 8, cy + 14], [cx, cy + 22], [cx + 8, cy + 14]], { seed: seed + 3, w: 4, amp: amp * 0.5 });
    for (const d of [-1, 1]) s += ink([[cx + d * 24, cy + 18], [cx + d * 78, cy + 8]], { seed: seed + 4 + d, w: 3, amp }) + ink([[cx + d * 24, cy + 26], [cx + d * 76, cy + 34]], { seed: seed + 6 + d, w: 3, amp });
  }
  if (hat) s += ink([[cx - 26, cy - 50], [cx + 6, cy - 128], [cx + 30, cy - 46]], { seed: seed + 9, w: 5, c: C.red, fill: "#F7A4AE", close: true, amp });
  return s;
}
function practicePage(t: number): string {
  let s = ground();
  const shrink = ease.inOut3(ramp(t, CUE.picture, 0.5)), LS = 84;
  let lines = "";
  /* one row: `a` from `at0`, `b` (+ `rest` of the first half) from their cues; a row too wide breaks its second half below */
  const row = (y: number, first: string, firstAt: number, rest: string, restAt: number, second: string, secondAt: number, red: boolean) => {
    let r = "";
    if (t >= firstAt) r += hand(first, 90, y, { size: LS, anchor: "start", opacity: ramp(t, firstAt, 0.2) });
    const xr = 90 + measure(first + " ", LS, "hand");
    if (rest && t >= restAt) r += hand(rest, xr, y, { size: LS, anchor: "start", opacity: ramp(t, restAt, 0.2) });
    let x2 = xr + (rest ? measure(rest + " ", LS, "hand") : 0) + 10, y2 = y;
    if (x2 + measure(second, LS, "hand") + 80 > 990) { x2 = 150; y2 = y + 92; }
    const xm = x2 + measure(second, LS, "hand") + 30;
    if (t >= secondAt) r += hand(second, x2, y2, { size: LS, c: red ? C.red : C.ink, anchor: "start", hl: red ? undefined : C.mint, opacity: ramp(t, secondAt, 0.2) }) +
      (red ? ink([[xm, y2 - 50], [xm + 46, y2 + 6]], { seed: 4400, w: 9, c: C.red, draw: ramp(t, secondAt + 0.1, 0.15) }) + ink([[xm + 46, y2 - 50], [xm, y2 + 6]], { seed: 4401, w: 9, c: C.red, draw: ramp(t, secondAt + 0.2, 0.15) })
        : ink([[xm, y2 - 24], [xm + 20, y2 + 2], [xm + 62, y2 - 56]], { seed: 4402, w: 9, c: "#18A57A", draw: ramp(t, secondAt + 0.1, 0.2) }));
    return r;
  };
  lines += row(580, "copy", CUE.copyLine, "+ sign it", CUE.sign, "= cheating", CUE.cheatingLine, true);
  lines += row(800, "copy to learn", CUE.learn, "", NEVER, "= practice", CUE.practice, false);
  s += g(lines, `translate(90 ${f1(500 - 60 * shrink)}) scale(${(1 - 0.4 * shrink).toFixed(3)}) translate(-90 -500)`);
  // three frames
  if (t >= CUE.picture) {
    const frames: [number, string, number][] = [[80, "copy", CUE.sketch], [375, "from memory", CUE.memory], [670, "+ 1 change", CUE.change]];
    frames.forEach(([x, label, at], i) => {
      const o = ramp(t, CUE.picture + i * 0.15, 0.25);
      s += g(ink([[x, 815], [x + 230, 815], [x + 230, 1045], [x, 1045]], { seed: 4410 + i, w: 5, fill: "#FFFFFF", close: true, amp: 0.7 }) + hand(label, x + 115, 795, { size: 42, c: C.pencil }), "", o);
      s += cat(x + 115, 950, { seed: 4420 + i * 10, draw: ramp(t, at, 0.7), amp: i === 1 ? 2.4 : 1.2, hat: i === 2 });
    });
    if (t >= CUE.signThat) s += ink([[720, 1030], [740, 1010], [752, 1030], [770, 1006], [790, 1030], [830, 1016]], { seed: 4450, w: 5, c: C.red, draw: ramp(t, CUE.signThat, 0.5) }) +
      hand("me", 860, 1030, { size: 44, c: C.red, opacity: ramp(t, CUE.signThat + 0.4, 0.2) });
  }
  return s;
}

/* the sheet itself: paper, squared grid, red margin, the punched holes under the spiral */
const RINGS = Array.from({ length: 21 }, (_, i) => 70 + i * 47); // ring x in page px
const SHEET = (() => {
  let grid = "";
  for (let x = 54; x < W; x += 54) grid += `M${x} 0V${H}`;
  for (let y = 54; y < H; y += 54) grid += `M0 ${y}H${W}`;
  return `<rect width="${W}" height="${H}" fill="${C.paper}"/><path d="${grid}" stroke="${C.grid}" stroke-width="2"/>` +
    `<line x1="0" y1="96" x2="${W}" y2="96" stroke="${C.margin}" stroke-width="3"/><line x1="44" y1="0" x2="44" y2="${H}" stroke="${C.margin}" stroke-width="3"/>` +
    RINGS.map((x) => `<ellipse cx="${x}" cy="28" rx="11" ry="9" fill="#3B3528"/>`).join("");
})();
const TEX = { w: 1080, h: 1920 }; // one texel per page px (a new texture every frame: keep it lean)
function pageSvg(id: PageId, t: number): string {
  BOIL = Math.floor((t * FPS) / 3);
  USED = new Set();
  const body = id === "open" ? duelPage(t, t < PAGES[1].from ? "open" : "still") : id === "end" ? duelPage(t, "end") : id === "rule" ? rulePage(t) : id === "spectator" ? spectatorPage(t) : id === "compare" ? comparePage(t) : practicePage(t);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${TEX.w}" height="${TEX.h}" viewBox="0 0 ${W} ${H}">${glyphDefs()}${SHEET}${body}</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
const BACK_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="960" viewBox="0 0 ${W} ${H}">${SHEET.replace(/<ellipse[^>]*\/>/g, "")}</svg>`,
);

/* ================================================================== the world: desk, notebook, spiral, pen */
const U = 100;                               // page px per world unit
const PW = W / U, PH = H / U;                // 10.8 × 19.2
const DESK_Y = 0, STACK = 0.36, TOP = DESK_Y + 0.08 + STACK; // the page surface
const HINGE_Z = -PH / 2;                      // the spiral (top edge of the page)
const M = ({ c, r = 0.6, m = 0 }: { c: string; r?: number; m?: number }) => <StandardMaterial base_color={c} perceptual_roughness={r} metallic={m} />;

/** `stamp` must change whenever the drawing does: raea keeps a material's texture, so the front is remounted */
function Sheet({ id, t, y, angle = 0, name, stamp }: { id: PageId; t: number; y: number; angle?: number; name: string; stamp: string }) {
  return (
    <Entity transform={Transform.fromXyz(0, y, HINGE_Z).withRotation(Quat.fromEuler("XYZ", angle, 0, 0))}>
      <Mesh3d key={`${name}-front-${stamp}`} name={`${name}-front-${stamp}`} allowOverlap transform={Transform.fromXyz(0, 0.006, PH / 2)}>
        <Cuboid half_size={[PW / 2, 0.004, PH / 2]} />
        <StandardMaterial base_color="#FFFFFF" base_color_texture={pageSvg(id, t)} perceptual_roughness={0.88} />
      </Mesh3d>
      <Mesh3d name={`${name}-back`} allowOverlap transform={Transform.fromXyz(0, -0.002, PH / 2)}>
        <Cuboid half_size={[PW / 2, 0.004, PH / 2]} />
        <StandardMaterial base_color="#FFFFFF" base_color_texture={BACK_SVG} perceptual_roughness={0.9} />
      </Mesh3d>
    </Entity>
  );
}
function Notebook({ t, frame }: { t: number; frame: number }) {
  const fl = flipAt(t), cur = pageAt(t);
  const under = fl ? fl.i + 1 : cur;
  const turned = fl ? fl.i - 1 : cur - 1; // the last page already over the spiral (lies beyond the top edge)
  return (
    <>
      <Mesh3d name="desk" transform={Transform.fromXyz(0, DESK_Y - 0.3, 0)}><Cuboid half_size={[40, 0.3, 40]} /><M c="#7A4E2E" r={0.55} /></Mesh3d>
      {[-9, -3, 3, 9].map((x, k) => (
        <Mesh3d key={k} name={`desk-grain-${k}`} allowOverlap transform={Transform.fromXyz(x * 1.7, DESK_Y + 0.001, 0)}><Cuboid half_size={[0.03, 0.001, 40]} /><M c="#6A4126" r={0.6} /></Mesh3d>
      ))}
      <Mesh3d name="cover" transform={Transform.fromXyz(0, DESK_Y + 0.04, 0.12)}><Cuboid half_size={[PW / 2 + 0.22, 0.04, PH / 2 + 0.3]} /><M c="#24305A" r={0.7} /></Mesh3d>
      <Mesh3d name="stack" transform={Transform.fromXyz(0, DESK_Y + 0.08 + STACK / 2 - 0.004, 0)}><Cuboid half_size={[PW / 2 - 0.02, STACK / 2 - 0.004, PH / 2 - 0.02]} /><M c="#EDE5D0" r={0.95} /></Mesh3d>
      {RINGS.map((px, k) => (
        <Mesh3d key={k} name={`ring-${k}`} allowOverlap transform={Transform.fromXyz((px - W / 2) / U, TOP + 0.02, HINGE_Z - 0.02).withRotation(Quat.fromEuler("XYZ", 0, 0, Math.PI / 2))}>
          <Torus major_radius={0.3} minor_radius={0.04} />
          <StandardMaterial base_color="#B9BCC6" metallic={1} perceptual_roughness={0.28} />
        </Mesh3d>
      ))}
      {/* the pen, lying on the desk to the right of the notebook */}
      <Entity transform={Transform.fromXyz(PW / 2 + 1.6, DESK_Y + 0.17, 2.5).withRotation(Quat.fromEuler("XYZ", 0, 0.22, 0))}>
        <Mesh3d name="pen-body" transform={Transform.fromXyz(0, 0, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}><Cylinder radius={0.17} half_height={3.2} /><M c="#1E2A5A" r={0.3} /></Mesh3d>
        <Mesh3d name="pen-tip" transform={Transform.fromXyz(0, 0, 3.55).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}><Cone radius={0.17} height={0.7} /><M c="#C9CCD6" r={0.25} m={1} /></Mesh3d>
        <Mesh3d name="pen-clip" allowOverlap transform={Transform.fromXyz(0, 0.2, -2.2)}><Cuboid half_size={[0.04, 0.04, 0.9]} /><M c="#C9CCD6" r={0.25} m={1} /></Mesh3d>
      </Entity>
      {turned >= 0 && <Sheet name="turned" stamp={PAGES[turned].id} id={PAGES[turned].id} t={PAGES[turned + 1].from} y={TOP + 0.03} angle={-Math.PI + 0.02} />}
      <Sheet name="under" stamp={`${PAGES[under].id}-${frame}`} id={PAGES[under].id} t={t} y={TOP} />
      {fl && <Sheet name="flip" stamp={`${PAGES[fl.i].id}-${frame}`} id={PAGES[fl.i].id} t={t} y={TOP + 0.02} angle={-Math.PI * 0.985 * fl.k} />}
    </>
  );
}

/* ================================================================== camera */
type V3 = [number, number, number];
type Cam = { pos: V3; look: V3; fov: number };
const FOV = 30, REST = 10 / Math.tan(rad(FOV / 2)); // the page fills ~96% of the frame height at rest
function cameraAt(t: number): Cam {
  const settle = 1 - ease.inOut3(ramp(t, 0, 1.1)) + ease.inOut3(ramp(t, DUR - 0.6, 0.5));
  const fl = flipAt(t), lift = fl ? Math.sin(Math.PI * fl.k) : 0;
  const punch = hit(t, CUE.zero, 0.12, 0.6) * 0.035 + hit(t, CUE.tolerable, 0.12, 0.6) * 0.03 + hit(t, CUE.endZero, 0.12, 0.7) * 0.035;
  const kick = hit(t, CUE.flip, 0.15, 0.9) * 6; // the rules flip: the world swings ~6°
  const pitch = 84 - 14 * settle - 9 * lift, yaw = drift(t, 2, 0.6) * 1.1 + 4 * settle - 2.5 * lift + kick;
  const dist = REST * (1 + 0.05 * settle + 0.09 * lift - punch);
  const look: V3 = [0, TOP, 0.25 + 0.6 * settle];
  const y = rad(yaw), p = rad(pitch);
  return { look, fov: FOV, pos: [look[0] + dist * Math.sin(y) * Math.cos(p), look[1] + dist * Math.sin(p), look[2] + dist * Math.cos(y) * Math.cos(p)] };
}

/* ================================================================== overlay type */
const FONTS = `
@font-face { font-family: "BricolageCut"; src: url("${staticFile("fonts/BricolageCut.ttf")}"); }
@font-face { font-family: "Instrument"; src: url("${staticFile("fonts/InstrumentSerif-Italic-latin.ttf")}"); font-style: italic; }
@font-face { font-family: "JBMono"; src: url("${staticFile("fonts/JetBrainsMono-latin.ttf")}"); }`;
const abs = (left: number, top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left, top, ...extra });
const display = (size: number, c = C.ink): React.CSSProperties => ({ fontFamily: "BricolageCut", fontSize: size, lineHeight: 0.94, textTransform: "uppercase", color: c, letterSpacing: "-0.01em" });

/* notebook captions: ink words, keywords and numbers in red under a stroke of highlighter */
type Page = { words: Word[]; lines: Word[][] };
const CAP = { size: 90, hold: 0.5 };
/* pages of at most two lines, measured with the overlay's own font (BricolageCut, uppercase, 0.24 em word gap). A page
   ends on punctuation (a closing quote too); when one would overflow, it ends at the last clause anchor in BREAK_AFTER. */
const BREAK_AFTER = new Set(["line:work", "notes:notes", "find:write"]);
const WEAK_END = new Set(["the", "a", "an", "to", "his", "of", "he", "her", "in", "and", "is", "was", "that"]);
const PHRASE_END = /[.,:;!?…—]["”’]?$/;
const PAGES_CAP: Page[] = (() => {
  const maxW = SAFE.railX - SAFE.left, gap = CAP.size * 0.24;
  const wordW = (s: string) => measure(s.toUpperCase(), CAP.size, "cut") - 0.01 * CAP.size * Math.max(0, [...s].length - 1);
  const lineW = (ws: Word[]) => ws.reduce((a, x) => a + wordW(x.w), 0) + gap * Math.max(0, ws.length - 1);
  type W2 = Word & { brk: boolean };
  const split = (ws: W2[]): Word[][] | null => {
    if (ws.length === 1 || lineW(ws) <= maxW) return [ws];
    let best = -1, score = Infinity;
    for (let i = 1; i < ws.length; i++) {
      const prev = ws[i - 1].w;
      if (prev.startsWith('"')) continue; // never leave an opening quote at the end of a line
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
    for (const x0 of b.words as Word[]) {
      const x: W2 = { ...x0, brk: BREAK_AFTER.has(`${b.id}:${x0.w}`) };
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
/* page i stays until the next one starts, but is held whole for at least CAP.hold s after its last word */
const CAP_FROM = PAGES_CAP.map((p, i) => (i === 0 ? p.words[0].start - 0.05 : Math.max(p.words[0].start - 0.05, PAGES_CAP[i - 1].words[PAGES_CAP[i - 1].words.length - 1].start + CAP.hold)));
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9$%]/g, "");
const KEYS = new Set(KEYWORDS.map(norm));
function Captions({ t, backing }: { t: number; backing: number }) {
  if (t > DUR - 0.5 || t < B("belief") - 0.05) return null; // the hook line is the title: no caption under it
  const idx = PAGES_CAP.findIndex((p, i) => t >= CAP_FROM[i] && (i === PAGES_CAP.length - 1 || t < CAP_FROM[i + 1]));
  const page = PAGES_CAP[idx];
  if (!page || t > page.words[page.words.length - 1].end + 0.7) return null;
  const lineH = CAP.size * 1.04;
  const top = ZONES.captions.top + (ZONES.captions.bottom - ZONES.captions.top - lineH * page.lines.length) / 2;
  return (
    <div style={abs(SAFE.left, top, { width: SAFE.railX - SAFE.left })}>
      {backing > 0.01 && t >= page.words[0].start - 0.03 && <div style={abs(-24, -16, { width: SAFE.railX - SAFE.left + 24, height: lineH * page.lines.length + 32, background: C.paper, opacity: Math.min(1, backing * 2.5) })} />}
      {page.lines.map((line, li) => (
        <div key={li} style={{ position: "relative", display: "flex", flexDirection: "row", columnGap: CAP.size * 0.24, height: lineH, alignItems: "center" }}>
          {line.map((x, i) => {
            const key = /\d/.test(x.w) || KEYS.has(norm(x.w));
            const p = ease.back(ramp(t, x.start - 0.03, 0.16), 1.6);
            const hl = key ? ease.out3(ramp(t, x.start + 0.05, 0.22)) : 0;
            return (
              <div key={i} style={{ position: "relative", opacity: t >= x.start - 0.03 ? 1 : 0, transform: `translateY(${(1 - Math.min(1, p)) * 12}px)` }}>
                {hl > 0 && <div style={abs(-4, CAP.size * 0.5, { width: `${hl * 100}%`, height: CAP.size * 0.36, background: C.hl })} />}
                <div style={{ ...display(CAP.size, key ? C.red : C.ink), lineHeight: 1, position: "relative" }}>{x.w}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Overlay({ t }: { t: number }) {
  const hookEnd = BEATS.hook.end;
  const titleO = Math.max(1 - ramp(t, hookEnd - 0.25, 0.25), ramp(t, DUR - 0.45, 0.35));
  const fl = flipAt(t), backing = fl ? Math.sin(Math.PI * fl.k) : 0;
  const SAFE_W = SAFE.right - SAFE.left;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <style>{FONTS}</style>
      {/* a soft vignette, like the lamp falling off */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 58%, rgba(60,40,15,0.22) 100%)" }} />
      {/* HUD: a strip of masking tape with the series name */}
      <div style={abs(SAFE.left - 8, ZONES.hud.top, { height: 50, display: "flex", flexDirection: "row", alignItems: "center", columnGap: 14, paddingLeft: 18, paddingRight: 18, background: C.tape, transform: "rotate(-1.5deg)" })}>
        <div style={{ fontFamily: "JBMono", fontWeight: 800, fontSize: 26, letterSpacing: "0.2em", color: C.ink }}>UNGRADED</div>
        <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 26, letterSpacing: "0.14em", color: C.red }}>#005</div>
      </div>
      {titleO > 0.01 && (
        <div style={abs(SAFE.left, ZONES.title.top + 10, { width: SAFE_W, opacity: titleO })}>
          {backing > 0.01 && <div style={abs(-20, -10, { width: SAFE_W + 20, height: 280, background: C.paper, opacity: Math.min(1, backing * 2.5) })} />}
          <div style={{ ...display(108), position: "relative", whiteSpace: "pre-line" }}>{TITLE}</div>
          <div style={{ fontFamily: "Instrument", fontStyle: "italic", fontSize: 54, color: C.red, marginTop: 12, position: "relative" }}>{WHISPER}</div>
        </div>
      )}
      {KICKERS.map((s, i) => {
        if (t < s.from || t > s.to + 0.2 || titleO > 0.5) return null;
        const o = Math.min(ramp(t, Math.max(s.from + 0.08, hookEnd), 0.18), 1 - ramp(t, s.to - 0.2, 0.16), 1 - titleO);
        if (o <= 0.01) return null;
        return (
          <div key={i} style={abs(SAFE.left, ZONES.title.top + 10, { opacity: o })}>
            <div style={abs(0, 84 * 0.48, { width: "100%", height: 84 * 0.4, background: C.hl })} />
            <div style={{ ...display(84), position: "relative", paddingLeft: 6, paddingRight: 6 }}>{s.text}</div>
          </div>
        );
      })}
      <Captions t={t} backing={backing} />
      {t > 0.0 && <div style={abs(SAFE.left, ZONES.captions.bottom - 8, { width: SAFE.railX - SAFE.left, fontFamily: "JBMono", fontWeight: 600, fontSize: 24, letterSpacing: "0.04em", textTransform: "uppercase", color: C.ink, opacity: 0.62 })}>{SOURCE}</div>}
    </AbsoluteFill>
  );
}

/* ================================================================== the reel */
/** master trim: raea sums the tracks without a limiter, so the mix is kept under the ceiling here and brought to −14 LUFS by render.sh */
const MIX = 0.5;
function Copy() {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = cameraAt(t);
  const sfx: [number, string, number][] = [[0, "pop", 0.4]];
  for (let i = 1; i < PAGES.length; i++) sfx.push([PAGES[i].from - FLIP.lead, "whoosh", 0.45]);
  for (const [a, name, v] of [
    [CUE.ten, "pop", 0.4], [CUE.blank, "pop", 0.35], [CUE.cheating, "pop", 0.4], [CUE.zero, "stamp", 0.45], [CUE.flip, "whoosh", 0.55], [CUE.nobody, "pop", 0.3],
    [CUE.atTen, "pop", 0.3], [CUE.spectator, "pop", 0.4], [CUE.notes, "pop", 0.3], [CUE.away, "pop", 0.3], [CUE.compares, "pop", 0.35], [CUE.faults, "pop", 0.35], [CUE.fixes, "pop", 0.35],
    [CUE.night, "pop", 0.3], [CUE.morning, "pop", 0.3], [CUE.sunday, "pop", 0.3], [CUE.tolerable, "stamp", 0.4], [CUE.poor, "pop", 0.4],
    [CUE.cheatingLine, "pop", 0.35], [CUE.practice, "pop", 0.4], [CUE.sketch, "pop", 0.3], [CUE.memory, "pop", 0.3], [CUE.change, "pop", 0.3], [CUE.signThat, "pop", 0.3],
    [CUE.endTen, "pop", 0.4], [CUE.lessons, "pop", 0.4], [CUE.endZero, "stamp", 0.45],
  ] as [number, string, number][]) sfx.push([a, name, v]);
  return (
    <AbsoluteFill style={{ background: "#2B2B33" }}>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: rad(cam.fov) } }} />
      <ToneMapping mode="tony" exposure={0.6} />
      <AmbientLight brightness={520} color="#FFF4E6" />
      <DirectionalLight transform={Transform.fromXyz(-6, 16, 8).lookingAt([0, 0, 0])} illuminance={5200} color="#FFF3E2" shadow_maps_enabled soft_shadow_size={2} />
      <SpotLight transform={Transform.fromXyz(-9, 15, -6).lookingAt([0, TOP, 0])} intensity={9000000} outer_angle={0.75} inner_angle={0.35} color="#FFE7C2" shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(8, 9, 14)} intensity={1200000} color="#E8EEFF" range={40} />
      <Notebook t={t} frame={f} />
      <Overlay t={t} />
      {sfx.map(([a, name, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(a * FPS))} durationInFrames={FPS * 3} layout="none" name={`sfx-${name}-${i}`}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={v * MIX} />
        </Sequence>
      ))}
      <Audio src={staticFile("voice.wav")} volume={MIX} />
      <Audio src={staticFile("music.wav")} volume={(fr: number) => interpolate(fr / FPS, [0, 0.5, DUR - 3, DUR], [0, 0.18 * MIX, 0.18 * MIX, 0.24 * MIX], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
}

/* ================================================================== the thumbnail (9:16; the 3:4 grid crop is y 240–1680)
   The end page at "Zero." (10 lessons vs 0), seen from straight above, with the series tag, the title and a question. */
const COVER_T = CUE.endZero + 0.6;
function Cover() {
  COVER = true;
  const look: V3 = [0, TOP, 0.25], dist = REST * 1.0, p = rad(88.5);
  const pos: V3 = [look[0], look[1] + dist * Math.sin(p), look[2] + dist * Math.cos(p)];
  return (
    <AbsoluteFill style={{ background: "#2B2B33" }}>
      <Camera3d transform={Transform.fromXyz(...pos).lookingAt(look)} projection={{ Perspective: { fov: rad(FOV) } }} />
      <ToneMapping mode="tony" exposure={0.6} />
      <AmbientLight brightness={520} color="#FFF4E6" />
      <DirectionalLight transform={Transform.fromXyz(-6, 16, 8).lookingAt([0, 0, 0])} illuminance={5200} color="#FFF3E2" shadow_maps_enabled soft_shadow_size={2} />
      <SpotLight transform={Transform.fromXyz(-9, 15, -6).lookingAt([0, TOP, 0])} intensity={9000000} outer_angle={0.75} inner_angle={0.35} color="#FFE7C2" shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(8, 9, 14)} intensity={1200000} color="#E8EEFF" range={40} />
      <Notebook t={COVER_T} frame={0} />
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <style>{FONTS}</style>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 58%, rgba(60,40,15,0.22) 100%)" }} />
        <div style={abs(SAFE.left - 8, ZONES.hud.top + 40, { height: 56, display: "flex", flexDirection: "row", alignItems: "center", columnGap: 14, paddingLeft: 18, paddingRight: 18, background: C.tape, transform: "rotate(-1.5deg)" })}>
          <div style={{ fontFamily: "JBMono", fontWeight: 800, fontSize: 30, letterSpacing: "0.2em", color: C.ink }}>UNGRADED</div>
          <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 30, letterSpacing: "0.14em", color: C.red }}>#005</div>
        </div>
        <div style={abs(SAFE.left, ZONES.title.top + 50, { width: SAFE.railX - SAFE.left })}>
          <div style={{ ...display(116), whiteSpace: "pre-line" }}>{"Ten copies vs.\none blank page"}</div>
          <div style={{ fontFamily: "Instrument", fontStyle: "italic", fontSize: 60, color: C.red, marginTop: 14 }}>Which one teaches you more?</div>
        </div>
        <div style={abs(SAFE.left, 1330, { width: SAFE.railX - SAFE.left, fontFamily: "JBMono", fontWeight: 600, fontSize: 28, letterSpacing: "0.04em", textTransform: "uppercase", color: C.ink, opacity: 0.75 })}>Ben Franklin's method · his Autobiography</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

registerRoot(() => (
  <>
    <Composition id="copy" component={Copy} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />
    <Composition id="cover" component={Cover} width={W} height={H} fps={FPS} durationInFrames={1} />
  </>
));
