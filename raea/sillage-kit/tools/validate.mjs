#!/usr/bin/env node
/**
 * SILLAGE pre-flight (P6 data coherence + P2/P3/P7 checks). Blocks the render on any ✗; prints ! warnings.
 *   node raea/sillage-kit/tools/validate.mjs raea/<project>
 * Reads <project>/compositions/{reel.json,timings.json}, public/episodes/<id>/{episode.json,SOURCES.md}, the kit tokens.
 * Checks: anchors resolve · one currency · one unit per quantity · displayed calculations recomputed · SOURCES VARY badge ·
 * on-screen figures present in SOURCES.md · type sizes ≥ minimums · worst-case contrast ≥ 4.5:1 on the scrims ·
 * text inside the safe area · caption pages that duplicate the title (hidden at render, listed here).
 * Node ≥ 23 runs the kit's .ts modules directly (type stripping).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { paginate, duplicates, numbersIn, worstContrast } from "../src/core.ts";
import { makeAnchors } from "../src/time.ts";

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TOK = JSON.parse(fs.readFileSync(path.join(KIT, "tokens.json"), "utf8"));
const proj = path.resolve(process.argv[2] ?? ".");
const R = JSON.parse(fs.readFileSync(path.join(proj, "compositions/reel.json"), "utf8"));
const T = JSON.parse(fs.readFileSync(path.join(proj, "compositions/timings.json"), "utf8"));
const epDir = path.resolve(proj, "../../public/episodes", R.id);
const EP = JSON.parse(fs.readFileSync(path.join(epDir, "episode.json"), "utf8"));
const SRC = fs.existsSync(path.join(epDir, "SOURCES.md")) ? fs.readFileSync(path.join(epDir, "SOURCES.md"), "utf8") : "";

let errors = 0, warns = 0;
const bad = (m) => { errors++; console.log(`  ✗ ${m}`); };
const warn = (m) => { warns++; console.log(`  ! ${m}`); };
const ok = (m) => console.log(`  ✓ ${m}`);
console.log(`SILLAGE pre-flight · ${R.id}`);

/* ---------- anchors */
const A = makeAnchors(T);
const at = (a, where) => { try { return A.at(a); } catch (e) { bad(`${where}: ${e.message}`); return NaN; } };
const shots = R.shots.map((s, i) => ({ ...s, from: i === 0 ? 0 : at(s.at ?? s.id, `shot ${s.id}`) }));
for (const s of R.shots) for (const e of s.text ?? []) if (e.at !== undefined) String(e.at).split("|").forEach((x) => at(x, `shot ${s.id} text "${e.v}"`));
for (const [a] of R.flacon?.level ?? []) at(a, "flacon.level");
for (const [a] of R.flacon?.petals ?? []) at(a, "flacon.petals");
for (const a of R.flacon?.sweeps ?? []) at(a, "flacon.sweeps");
if (R.flacon?.drop) at(R.flacon.drop, "flacon.drop");
for (const [a] of R.sfx ?? []) at(a, "sfx");
for (let i = 1; i < shots.length; i++) if (!(shots[i].from > shots[i - 1].from)) bad(`shot ${shots[i].id} starts before ${shots[i - 1].id}`);
if (!errors) ok("every anchor resolves, shots in order");

/* ---------- texts */
const say = EP.beats.map((b) => b.say.replace(/\{([^|}]*)\|[^}]*\}/g, "$1")).join(" ");
const screen = R.shots.flatMap((s) => (s.text ?? []).map((e) => ({ shot: s.id, ...e, v: e.v.replace(/\|/g, " ") })));
const allText = `${say} ${screen.map((e) => e.v).join(" ")}`;

/* ---------- one currency */
const CUR = { USD: /\$|\bdollars?\b|\bUSD\b/gi, EUR: /€|\beuros?\b|\bEUR\b/gi, GBP: /£|\bpounds?\b|\bGBP\b/gi };
const want = R.checks?.currency;
const found = Object.entries(CUR).filter(([, re]) => re.test(allText)).map(([k]) => k);
if (found.length > 1) bad(`several currencies in one episode: ${found.join(", ")} (convert to ${want ?? "one"} and label it "our conversion")`);
else if (want && found.length === 1 && found[0] !== want) bad(`currency is ${found[0]}, checks.currency says ${want}`);
else ok(`one currency${found[0] ? `: ${found[0]}` : ""}`);

/* ---------- one unit per quantity: "<mass> of X" uses only the allowed nouns */
const massOf = R.checks?.units?.massOf;
if (massOf) {
  const hits = [...allText.matchAll(/\b(tonnes?|tons?|kilos?|kg|grams?|g|t)\s+of\s+([a-z']+)/gi)].map((m) => [m[0], m[2].toLowerCase()]);
  const off = hits.filter(([, n]) => !massOf.includes(n));
  if (off.length) bad(`quantity named two ways: ${[...new Set(off.map((h) => `"${h[0]}"`))].join(", ")} (allowed after "<mass> of": ${massOf.join(", ")})`);
  else ok(`one unit per quantity (${[...new Set(hits.map((h) => h[1]))].join(", ")})`);
}

/* ---------- calculations recomputed */
for (const c of R.checks?.calcs ?? []) {
  if (!/^[\d\s.+\-*/()]+$/.test(c.expr)) { bad(`calc "${c.what}": expression must be numbers and + - * / ( ) only`); continue; }
  const v = Function(`return (${c.expr})`)(), shown = parseFloat(String(c.shown).replace(/,/g, ""));
  const rel = Math.abs(v - shown) / Math.max(1e-9, Math.abs(v));
  if (rel > (c.tolerance ?? 0.01)) bad(`calc "${c.what}": ${c.expr} = ${v.toFixed(2)}, screen says ${c.shown} (${(rel * 100).toFixed(1)} % off)`);
  else ok(`calc "${c.what}": ${c.expr} = ${v.toFixed(2)} ≈ ${c.shown}`);
  if (!screen.some((e) => e.v.includes(String(c.shown)))) warn(`calc "${c.what}": ${c.shown} is not on screen`);
}
if (R.checks?.calcs?.length && !screen.some((e) => /our calculation/i.test(e.v))) bad(`computed figures but no "our calculation" badge on screen`);

/* ---------- SOURCES VARY */
for (const id of R.checks?.sourcesVary ?? []) {
  const s = R.shots.find((x) => x.id === id);
  if (!s?.text?.some((e) => /vary|disputed/i.test(e.v))) bad(`shot ${id}: sources disagree but no "SOURCES VARY" badge`);
  else ok(`shot ${id}: SOURCES VARY badge`);
}

/* ---------- figures on screen are in SOURCES.md */
if (!SRC) warn("no SOURCES.md for this id yet");
else for (const e of screen) for (const n of numbersIn(e.v.replace(/[–-]/g, " "))) {
  if (n < 10 && !/\d/.test(e.v)) continue;
  const forms = [String(n), n.toLocaleString("en-US"), n.toFixed(2)];
  if (!forms.some((f) => SRC.includes(f))) warn(`shot ${e.shot}: "${e.v}" — ${n} not found in SOURCES.md`);
}

/* ---------- type sizes */
const MIN = { stat: TOK.type.stat.min, count: TOK.type.stat.min, title: TOK.type.title.min, whisper: TOK.type.whisper.min, label: TOK.type.label.min, badge: TOK.type.label.min };
for (const [k, s] of Object.entries(TOK.type)) if (s.size < s.min) bad(`tokens.type.${k}: ${s.size}px < minimum ${s.min}px`);
for (const e of screen) if (e.size !== undefined && e.size < MIN[e.t]) bad(`shot ${e.shot}: "${e.v}" at ${e.size}px < ${MIN[e.t]}px minimum for ${e.t}`);

/* ---------- layout: estimated stack height, safe area, contrast on the scrim at the text's lowest line */
const H = TOK.canvas.height, Lt = TOK.layout, S = TOK.safe, sc = TOK.scrim;
const lineH = (e) => {
  const n = e.v.split("\n").length, ty = TOK.type[e.t === "count" ? "stat" : e.t === "badge" ? "label" : e.t];
  const size = e.size ?? ty.size;
  return e.t === "badge" ? 70 : n * size * (ty.line ?? 1.1) + (e.t === "label" ? 12 : e.t === "whisper" ? 10 : 0);
};
const topAlpha = (y) => { const hold = H * sc.top.to, fade = H * sc.top.fadeTo; return y <= hold ? sc.top.alpha - (sc.top.alpha - sc.top.alpha * 0.92) * (y / hold) : Math.max(0, sc.top.alpha * 0.92 * (1 - (y - hold) / (fade - hold))); };
const botAlpha = (y) => { const y0 = H * sc.bottom.from, full = Lt.captionTop; return y <= y0 ? 0 : y <= full ? sc.bottom.alpha * 0.93 * ((y - y0) / (full - y0)) : sc.bottom.alpha * 0.93 + (sc.bottom.alpha * 0.07 * (y - full)) / (H - full); };
if (Lt.textTop < S.top || Lt.logoY < S.top) bad(`text starts above the safe top (${S.top}px)`);
if (Lt.right > S.right) bad(`text runs into the right band (${Lt.right} > ${S.right})`);
if (Lt.captionBottom > S.bottom) bad(`captions run into the bottom band (${Lt.captionBottom} > ${S.bottom})`);
const colors = { stat: "cream", count: "cream", title: "cream", whisper: "cream", label: "goldLight", badge: "gold" };
for (const s of R.shots) {
  let y = Lt.textTop;
  for (const e of s.text ?? []) {
    y += lineH(e);
    const c = worstContrast(TOK.color[colors[e.t]], sc.top.color, topAlpha(y - 10));
    if (c < sc.minContrast) bad(`shot ${s.id}: "${e.v.split("\n")[0]}" ends at y≈${Math.round(y)}, contrast on the top scrim ${c.toFixed(2)}:1 < ${sc.minContrast} (worst case)`);
  }
  if (y > Lt.captionTop - 30) warn(`shot ${s.id}: title stack reaches y≈${Math.round(y)}, into the caption band (${Lt.captionTop})`);
}
const capC = worstContrast(TOK.color.cream, sc.bottom.color, botAlpha(Lt.captionTop + 20));
if (capC < sc.minContrast) bad(`captions: contrast on the bottom scrim ${capC.toFixed(2)}:1 < ${sc.minContrast} (worst case)`);
else ok(`contrast ≥ ${sc.minContrast}:1 in the worst case (captions ${capC.toFixed(1)}:1)`);

/* ---------- captions that only repeat the title (they are hidden at render) */
const pages = paginate(T.beats.flatMap((b) => b.words), TOK.type.caption.maxChars, TOK.type.caption.maxLines);
for (const p of pages) {
  const t0 = p[0][0].start, s = shots.reduce((k, x) => (t0 >= x.from ? x : k), shots[0]);
  const txt = p.flat().map((x) => x.w).join(" "), on = (s.text ?? []).map((e) => e.v.replace(/\|/g, " ")).join(" ");
  const d = duplicates(txt, on);
  if (d) warn(`caption "${txt}" repeats the title of shot ${s.id} (${d}): hidden at render`);
  for (const line of p) if (line.map((x) => x.w).join(" ").length > TOK.type.caption.maxChars + 6) warn(`caption line too long: "${line.map((x) => x.w).join(" ")}"`);
}

/* ---------- loop */
const first = R.shots[0], last = R.shots[R.shots.length - 1];
if (last.kind !== first.kind || (last.kind === "flacon" && last.camera !== "return")) bad(`loop: the last shot must return to the first (kind ${first.kind}, camera "return")`);
const lv = R.flacon?.level ?? [];
if (lv.length && Math.abs(lv[lv.length - 1][1] - lv[0][1]) > 1e-6) bad(`loop: the flacon ends at level ${lv[lv.length - 1][1]}, starts at ${lv[0][1]}`);
const pk = R.flacon?.petals ?? [];
if (pk.length && pk[pk.length - 1][1] !== 0) bad(`loop: petals must lift away before the end (last petals keyframe → 0)`);

console.log(`${errors ? "✗" : "✓"} ${errors} error(s), ${warns} warning(s)`);
process.exit(errors ? 1 : 0);
