/**
 * UNGRADED #004 — "Michael Jordan was never cut" (episode `legends`) · notebook art direction · raea (React/TS → Bevy)
 * Voice, word timings and sources: public/episodes/legends (branch claude/exciting-gauss-kqc425). timings.json is in
 * SECONDS, words by beat; every cue goes through `w(beat, word, n)`, which throws if a word is missing.
 *
 * The world: a reporter's notebook on a wooden desk, spiral at the top, a ballpoint pen beside it, lit by a desk lamp.
 * Each scene is one page of the notebook. Its ballpoint drawing (stick figures, handwriting, stamps) is an SVG texture
 * redrawn every frame: the lines "boil" every 3 frames like a flip-book. Between stories the page is torn over the
 * spiral in 3D and the next one is underneath. The camera settles from a low tilt on frame 0, cranes up on each page
 * turn, and goes back to the frame-0 pose at the end (loop). Everything the viewer reads outside the page (series tag,
 * title, kickers, captions, source) is vector type in the overlay.
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
const TITLE = "Michael Jordan was never cut";
const WHISPER = "The legend is bigger than the failure.";
const SOURCE = "Sports Illustrated (2012) · NZ Herald · History.com";
const KEYWORDS = ["never", "cut", "twist.", "crushed.", "practises.", "no.", "rest.", "late,", "counted.", "smaller", "legends.", "movie."];

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

/* ================================================================== cues (episode.json actions, by word) */
const NEVER = 1e9;
const CUE = {
  stamp: w("hook", "cut"), unstamp: w("twist", "twist."), height: w("jv", "five"), cry: w("friend", "crushed."),
  practice: w("practice", "practises."), bubble: w("told", "got"),
  nos: w("book2", "Publisher"), kid: w("book3", "gives"), more: w("book4", "rest."), book: w("book5", "Harry"),
  age: w("late1", "man"), sign: w("late1", "deal."), myth: w("late2", "1,009"), callout: w("late3", "counted."),
  legends: w("good", "failures"), shrink: [w("small", "junior"), w("small", "pile"), w("small", "late")],
  turn: w("you", "It's"),
};
const NOS = { count: 12, dur: 2.6 }, AGE = { to: 62, dur: 1.8 }, CALLOUT = { text: "late still counts", hold: 1.6, at: [560, 420] as Pt };

/* ================================================================== pages (one scene = one page; a page turn between) */
type PageId = "open" | "nos" | "late" | "shrink" | "rule" | "end";
const PAGES: { id: PageId; from: number }[] = [
  { id: "open", from: 0 }, { id: "nos", from: B("book1") - 0.12 }, { id: "late", from: B("late1") - 0.12 },
  { id: "shrink", from: B("good") - 0.12 }, { id: "rule", from: B("you") - 0.12 }, { id: "end", from: B("loop") - 0.12 },
];
const KICKERS = [
  { text: "1 · The cut", from: B("jv") - 0.12, to: PAGES[1].from },
  { text: "2 · The no’s", from: PAGES[1].from, to: PAGES[2].from },
  { text: "3 · The late start", from: PAGES[2].from, to: PAGES[3].from },
  { text: "The good news", from: PAGES[3].from, to: PAGES[4].from },
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

/* ================================================================== the five pages (port of src/doodle/panels.tsx) */
const GROUND = 1095;
const ground = () => ink(seg([70, GROUND], [1010, GROUND], 10), { seed: 900, w: 5, c: C.pencil });

/* tryout: the team list, a short kid and a tall friend, the "cut" that wasn't. `live` = this page plays its cues */
const BOARD = { x: 560, y: 650, w: 370, h: 300 };
function tryoutPage(t: number, live: boolean): string {
  const at = (x: number) => (live ? x : NEVER);
  const stamp = at(CUE.stamp), unstamp = at(CUE.unstamp), height = at(CUE.height), cry = at(CUE.cry), practice = at(CUE.practice), bubble = at(CUE.bubble);
  const on = (x: number) => t >= x;
  const sad = on(cry) && !on(practice), shooting = on(practice);
  const ph = shooting ? ((t - practice) % 1.1) / 1.1 : 0;
  const shots = shooting ? Math.floor((t - practice) / 1.1) + 1 : 0;
  const hero: Pose = shooting ? { ...POSE.stand(t), armR: ph < 0.25 ? 170 : 150 - ph * 60, armL: ph < 0.25 ? 160 : 40, mood: "flat" }
    : sad ? { ...POSE.stand(t), armL: 10, armR: -10, tilt: 16, mood: "sad" } : { ...POSE.stand(t), mood: "flat" };
  const { x: bx, y: by, w: bw, h: bh } = BOARD;
  let s = ground();
  s += ink([[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]], { seed: 3000, w: 5, fill: "#FFFFFF", close: true });
  s += `<circle cx="${bx + bw / 2}" cy="${by + 8}" r="9" fill="${C.red}"/>`;
  s += hand("Varsity", bx + 30, by + 64, { size: 46, anchor: "start" }) + hand("JV", bx + 210, by + 64, { size: 46, anchor: "start" });
  for (let k = 0; k < 5; k++) s += ink([[bx + 30, by + 110 + k * 42], [bx + 150 - (k % 2) * 20, by + 110 + k * 42]], { seed: 3010 + k, w: 3, c: C.pencil, amp: 0.5 });
  for (let k = 0; k < 5; k++)
    s += k === 2 ? hand("Michael", bx + 210, by + 122 + k * 42, { size: 40, anchor: "start", hl: on(unstamp) ? C.hl : undefined })
      : ink([[bx + 210, by + 110 + k * 42], [bx + 330 - (k % 2) * 25, by + 110 + k * 42]], { seed: 3020 + k, w: 3, c: C.pencil, amp: 0.5 });
  if (on(stamp)) {
    const k = Math.min(1.15, pop(t, stamp, 0.25)), x = on(unstamp) ? ease.out3(ramp(t, unstamp, 0.3)) : 0;
    const body = `<rect x="-140" y="-62" width="280" height="124" rx="12" fill="none" stroke="${C.red}" stroke-width="10" opacity="0.9"/>` +
      cut("CUT", 0, 34, 110, C.red, { opacity: 0.9 }) + (x > 0 ? ink([[-160, -30], [-80, 20], [0, -20], [80, 30], [160, -10]], { seed: 3030, w: 12, draw: x }) : "");
    s += g(body, `translate(${bx + bw / 2} ${by + bh / 2}) rotate(-12) scale(${(k * (1 + (1 - Math.min(1, k)) * 0.6)).toFixed(3)})`);
  }
  if (on(unstamp)) s += hand("not cut: JV", bx + bw / 2, by + bh + 70, { size: 64, hl: C.mint, opacity: ramp(t, unstamp + 0.3, 0.2) });
  s += guy(190, GROUND, { s: 1.3, hero: true, seed: 3040, pose: hero });
  s += guy(390, GROUND, { s: 1.75, c: C.pencil, seed: 3050, pose: { ...POSE.stand(t, 1), mood: "smile" } });
  if (on(height)) s += hand(`5'9"`, 190, 790, { size: 52, c: C.red, opacity: ramp(t, height, 0.2) }) + hand(`6'7"`, 330, 668, { size: 52, opacity: ramp(t, height + 0.3, 0.2) });
  if (sad) for (let k = 0; k < 2; k++) { const p = ((t - cry) * 0.9 + k * 0.5) % 1; s += ink([[205 + k * 18, 860 + p * 60], [200 + k * 18, 878 + p * 60], [210 + k * 18, 878 + p * 60]], { seed: 3060 + k, w: 3, c: "#4A8FD9", fill: "#BFE0FF", close: true, amp: 0.4 }); }
  if (shooting) {
    const bxp = lerp(250, 470, ph), byp = 820 - Math.sin(ph * Math.PI) * 330;
    s += ink([[440, 600], [520, 600]], { seed: 3070, w: 6, c: C.red }) + ink([[445, 604], [460, 650], [500, 650], [515, 604]], { seed: 3071, w: 3, c: C.pencil });
    s += circle(bxp, byp, 20, { seed: 3072, w: 4, fill: "#F08A3C" });
    s += hand("practice: " + "|".repeat(Math.min(14, shots + 3)), 64, 1150, { size: 56, anchor: "start" });
  }
  if (on(bubble))
    s += g(ink([[60, 470], [470, 470], [470, 580], [260, 580], [220, 630], [215, 580], [60, 580]], { seed: 3080, w: 5, fill: "#FFFFFF", close: true }) + hand(`"I got cut."`, 265, 545, { size: 60 }), "", ramp(t, bubble, 0.2));
  return s;
}

/* nos: letters come back stamped NO, then a kid asks for more */
function nosPage(t: number): string {
  const n = NOS.count, step = NOS.dur / n;
  const got = t >= CUE.nos ? Math.min(n, Math.floor((t - CUE.nos) / step) + 1) : 0;
  const kidOn = t >= CUE.kid, moreOn = t >= CUE.more, bookOn = t >= CUE.book;
  let s = ground();
  s += guy(170, GROUND, { s: 1.45, hero: true, seed: 3100, pose: { ...POSE.desk(kidOn ? 0 : Math.min(0.6, got / 20)), armR: 75 + Math.sin(t * 12) * 8, mood: moreOn ? "smile" : got > 6 ? "sad" : "flat" } });
  s += ink([[70, 950], [380, 950]], { seed: 3110, w: 7 }) + ink([[100, 950], [100, GROUND]], { seed: 3111, w: 6 }) + ink([[350, 950], [350, GROUND]], { seed: 3112, w: 6 });
  for (let k = 0; k < got; k++) {
    const x = 520 + ((k * 41) % 90) - 45, y = 1060 - k * 22;
    const p = ease.out3(ramp(t, CUE.nos + k * step, 0.25));
    const body = ink([[-70, -40], [70, -40], [70, 40], [-70, 40]], { seed: 3120 + k, w: 3.5, fill: "#FFFFFF", close: true, amp: 0.6 }) +
      ink([[-70, -40], [0, 5], [70, -40]], { seed: 3140 + k, w: 2.5, c: C.pencil, amp: 0.5 }) + cut("NO", 0, 22, 44, C.red);
    s += g(body, `translate(${f1(lerp(900, x, p))} ${f1(lerp(500, y, p))}) rotate(${((k * 29) % 24) - 12})`);
  }
  if (got > 0 && !kidOn) s += hand(`no. ${got}`, 520, 720, { size: 64, c: C.red });
  if (kidOn) {
    const k = ease.out3(ramp(t, CUE.kid, 0.6));
    const pages = (j: Joints) => g(ink([[-30, -40], [30, -40], [30, 30], [-30, 30]], { seed: 3175, w: 3.5, fill: "#FFFFFF", close: true, amp: 0.5 }) +
      [-24, -10, 4].map((yy) => `<line x1="-20" y1="${yy}" x2="20" y2="${yy}" stroke="${C.pencil}" stroke-width="2.5"/>`).join(""), `translate(${f1(j.handR[0] + 6)} ${f1(j.handR[1] - 10)}) rotate(-10)`);
    s += g(guy(700, GROUND, { s: 1.5, c: C.pencil, seed: 3160, pose: { ...POSE.stand(t), armR: 70, mood: "flat" } }) +
      guy(860, GROUND, { s: 0.95, hero: true, seed: 3170, pose: { ...POSE.stand(t), armL: 70, armR: 80, mood: moreOn ? "smile" : "o" }, props: pages }), "", k);
  }
  if (moreOn)
    s += g(ink([[-150, -70], [150, -70], [150, 50], [30, 50], [0, 100], [-10, 50], [-150, 50]], { seed: 3180, w: 5, fill: "#FFFFFF", close: true }) + cut("MORE!", 0, 18, 92, C.red),
      `translate(760 640) scale(${Math.min(1.1, pop(t, CUE.more, 0.35)).toFixed(3)})`);
  if (bookOn)
    s += g(ink([[-130, -170], [130, -170], [130, 170], [-130, 170]], { seed: 3190, w: 6, fill: "#C9372C", close: true }) + ink([[-110, -170], [-110, 170]], { seed: 3191, w: 4, c: "#7A1F18" }) +
      txt("Harry", 10, -40, 64, { fill: "#FFE04A" }) + txt("Potter", 10, 30, 64, { fill: "#FFE04A" }) + ink([[-20, 80], [0, 110], [20, 80], [40, 110]], { seed: 3192, w: 4, c: "#FFE04A" }),
      `translate(420 640) rotate(-6) scale(${Math.min(1.1, pop(t, CUE.book, 0.4)).toFixed(3)})`);
  return s;
}

/* late: an age line to 62, a contract, and a number with no source */
function latePage(t: number): string {
  const a = t >= CUE.age ? AGE.to * ease.inOut3(ramp(t, CUE.age, AGE.dur)) : 0;
  const X0 = 110, X1 = 960, Y = 1000, ax = X0 + (X1 - X0) * (a / 80);
  const signOn = t >= CUE.sign;
  let s = ink(seg([X0, Y], [X1, Y], 12), { seed: 3200, w: 5 });
  for (const k of [0, 10, 20, 30, 40, 50, 60, 70, 80]) {
    const x = X0 + (X1 - X0) * (k / 80);
    s += ink([[x, Y - 12], [x, Y + 12]], { seed: 3210 + k, w: 3, c: C.pencil, amp: 0.4 }) + hand(String(k), x, Y + 56, { size: 38, c: C.pencil });
  }
  s += hand("age", X1 - 10, Y + 104, { size: 40, c: C.pencil, anchor: "end" });
  const walking = t >= CUE.age && a < AGE.to - 0.5;
  s += guy(ax, Y - 4 + (t >= CUE.age && a < AGE.to ? bob(t * 9, 5) : 0), { s: 1.25, hero: true, seed: 3220, pose: walking ? POSE.walk(t * 9) : signOn ? POSE.cheer(t) : { ...POSE.stand(t), mood: "flat" } });
  if (a > 1) s += cut(`age ${Math.round(a)}`, 64, 700, 150, C.ink, { anchor: "start" });
  if (signOn)
    s += g(ink([[-150, -130], [150, -130], [150, 130], [-150, 130]], { seed: 3230, w: 5, fill: "#FFFFFF", close: true }) + hand("franchise deal", 0, -74, { size: 42 }) +
      [-30, -2, 26].map((yy, i) => `<line x1="-110" y1="${yy}" x2="${110 - i * 30}" y2="${yy}" stroke="${C.pencil}" stroke-width="3"/>`).join("") +
      ink([[-100, 90], [-60, 64], [-30, 96], [10, 66], [40, 94], [90, 70]], { seed: 3231, w: 5, draw: ramp(t, CUE.sign + 0.3, 0.5) }) + hand("#1 · 1952", 0, 170, { size: 44, c: C.red }),
      `translate(780 700) rotate(4) scale(${Math.min(1.08, pop(t, CUE.sign, 0.35)).toFixed(3)})`);
  if (t >= CUE.myth) {
    const o = ramp(t, CUE.myth, 0.2), q = ramp(t, CUE.myth + 1.2, 0.3);
    s += g(`<rect x="50" y="420" width="575" height="320" fill="${C.paper}"/>` + cut("1,009 NO’S", 80, 560, 130, C.red, { anchor: "start", opacity: 1 - q * 0.45 }) +
      (q > 0 ? ink([[70, 520], [380, 500], [690, 530]], { seed: 3240, w: 11, draw: q }) : "") +
      hand("source? nobody can find one", 84, 640, { size: 54, anchor: "start", opacity: q }) +
      g(circle(0, 0, 34, { seed: 3241, w: 6 }) + ink([[24, 24], [62, 62]], { seed: 3242, w: 9 }), "translate(560 690)", q), "", o);
  }
  const co = life(t, CUE.callout, CALLOUT.hold);
  if (co > 0) s += sticky(CALLOUT.at[0], CALLOUT.at[1], CALLOUT.text, { rot: -3, s: Math.min(1.08, pop(t, CUE.callout, 0.35)), opacity: co });
  return s;
}

/* shrink: three big legends shrink into the small true versions */
function shrinkPage(t: number): string {
  let s = ground();
  if (t < CUE.legends) return s;
  const big = ["CUT!", "12 NO’S", "1,009 NO’S"], small = ["JV team", "a pile of no’s", "a late start"];
  big.forEach((b, i) => {
    const sh = t >= CUE.shrink[i] ? ease.inOut3(ramp(t, CUE.shrink[i], 0.5)) : 0;
    const y = 640 + i * 170, x = 540, k = Math.min(1.08, pop(t, CUE.legends + i * 0.15, 0.35));
    if (sh < 1) s += g(cut(b, 0, 40, 140, C.red), `translate(${x} ${y}) scale(${(k * (1 - 0.75 * sh)).toFixed(3)}) rotate(${(i - 1) * 3})`, 1 - sh);
    if (sh > 0) s += g(ink([[-170, -46], [170, -46], [170, 46], [-170, 46]], { seed: 3300 + i, w: 4, fill: C.note, close: true }) + hand(small[i], 0, 18, { size: 56 }),
      `translate(${x} ${y}) rotate(${(i - 1) * -3})`, sh);
  });
  return s;
}

/* rule: one card turned over (feels like → actually) */
function rulePage(t: number): string {
  const from = PAGES[4].from;
  const k = ramp(t, CUE.turn, 0.5), back = k >= 0.5, sx = Math.abs(Math.cos(k * Math.PI)), inP = pop(t, from + 0.1, 0.4);
  const side = back ? { small: "actually", text: "My setback\n= the middle", fill: C.mint, c: C.ink } : { small: "feels like", text: "My setback\n= the end", fill: "#FFFFFF", c: C.red };
  const lines = side.text.split("\n");
  let s = ground();
  if (inP > 0.001)
    s += g(`<rect x="-372" y="-212" width="760" height="440" fill="#000000" opacity="0.12"/>` + ink([[-380, -220], [380, -220], [380, 220], [-380, 220]], { seed: 1300, w: 6, fill: side.fill, close: true }) +
      txt(side.small, -330, -150, 54, { fill: C.pencil, anchor: "start" }) +
      lines.map((l, i) => cut(l, 0, -20 + i * 120 - (lines.length - 1) * 30, 112, side.c)).join(""),
      `translate(520 840) scale(${(Math.max(0.001, sx * inP)).toFixed(3)} ${inP.toFixed(3)}) rotate(${back ? 2 : -2})`);
  s += guy(150, GROUND, { s: 1.3, hero: true, seed: 1310, pose: back ? POSE.cheer(t) : { ...POSE.stand(t), armR: 120, mood: "flat" } });
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
  const body = id === "open" ? tryoutPage(t, true) : id === "end" ? tryoutPage(t, false) : id === "nos" ? nosPage(t) : id === "late" ? latePage(t) : id === "shrink" ? shrinkPage(t) : rulePage(t);
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
  const punch = hit(t, CUE.stamp, 0.12, 0.6) * 0.035 + hit(t, CUE.myth, 0.12, 0.6) * 0.03 + hit(t, CUE.turn, 0.12, 0.7) * 0.03;
  const pitch = 84 - 14 * settle - 9 * lift, yaw = drift(t, 2, 0.6) * 1.1 + 4 * settle - 2.5 * lift;
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
const CAP = { size: 90 };
const PAGES_CAP: Page[] = (() => {
  const maxChars = Math.floor((SAFE.railX - SAFE.left) / (CAP.size * 0.47));
  const out: Page[] = [];
  const close = (ws: Word[]) => {
    if (!ws.length) return;
    const lines: Word[][] = [], total = ws.map((x) => x.w).join(" ").length;
    if (total <= maxChars || ws.length === 1) lines.push(ws);
    else {
      let best = 1, bestDiff = Infinity;
      for (let i = 1; i < ws.length; i++) {
        const a = ws.slice(0, i).map((x) => x.w).join(" ").length, b = ws.slice(i).map((x) => x.w).join(" ").length;
        if (a <= maxChars && b <= maxChars && Math.abs(a - b) < bestDiff) { best = i; bestDiff = Math.abs(a - b); }
      }
      lines.push(ws.slice(0, best), ws.slice(best));
    }
    out.push({ words: ws, lines });
  };
  for (const b of TIMINGS.beats as any[]) {
    let cur: Word[] = [];
    for (const x of b.words as Word[]) {
      const len = cur.map((y) => y.w).join(" ").length + x.w.length + 1;
      if (cur.length && len > maxChars * 2 - 2) { close(cur); cur = []; }
      cur.push(x);
      if (/[.,:;!?…—]$/.test(x.w)) { close(cur); cur = []; }
    }
    close(cur);
  }
  return out;
})();
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9$%]/g, "");
const KEYS = new Set(KEYWORDS.map(norm));
function Captions({ t, backing }: { t: number; backing: number }) {
  if (t > DUR - 0.5) return null;
  const idx = PAGES_CAP.findIndex((p, i) => t >= p.words[0].start - 0.05 && (i === PAGES_CAP.length - 1 || t < PAGES_CAP[i + 1].words[0].start - 0.05));
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
        <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 26, letterSpacing: "0.14em", color: C.red }}>#004</div>
      </div>
      {titleO > 0.01 && (
        <div style={abs(SAFE.left, ZONES.title.top + 10, { width: SAFE_W, opacity: titleO })}>
          {backing > 0.01 && <div style={abs(-20, -10, { width: SAFE_W + 20, height: 280, background: C.paper, opacity: Math.min(1, backing * 2.5) })} />}
          <div style={{ ...display(108), position: "relative" }}>{TITLE}</div>
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
function Legends() {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = cameraAt(t);
  const sfx: [number, string, number][] = [[0, "pop", 0.4]];
  for (let i = 1; i < PAGES.length; i++) sfx.push([PAGES[i].from - FLIP.lead, "whoosh", 0.45]);
  for (const [a, name, v] of [
    [CUE.stamp, "stamp", 0.45], [CUE.unstamp, "pop", 0.4], [CUE.height, "pop", 0.35], [CUE.cry, "pop", 0.3], [CUE.practice, "pop", 0.35], [CUE.bubble, "pop", 0.35],
    [CUE.nos, "pop", 0.35], [CUE.kid, "pop", 0.35], [CUE.more, "pop", 0.4], [CUE.book, "stamp", 0.4],
    [CUE.age, "pop", 0.35], [CUE.sign, "pop", 0.4], [CUE.myth, "stamp", 0.45], [CUE.callout, "pop", 0.3],
    [CUE.legends, "pop", 0.4], [CUE.shrink[0], "pop", 0.35], [CUE.shrink[1], "pop", 0.35], [CUE.shrink[2], "pop", 0.35], [CUE.turn, "whoosh", 0.55],
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

registerRoot(() => <Composition id="legends" component={Legends} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />);
