#!/usr/bin/env node
// Pre-flight for an episode: catches what would break a render or a promise of the channel BEFORE any voice
// credit is spent. Errors stop the pipeline; warnings are things to look at.
//   node scripts/validate.mjs <episodeId> [<episodeId>…]     node scripts/validate.mjs --all [--strict]
// --strict turns warnings into a failing exit code. --draft checks cues against the script.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';

const require = createRequire(import.meta.url);
const { schedule, alignTimings } = require('../src/lib/schedule.ts');
const { episodeMedia } = require('../src/lib/media.ts');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EP = (id, f = '') => path.join(ROOT, 'public/episodes', id, f);
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const studio = readJson(path.join(ROOT, 'public/studio.json')).series;
const slug = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

const MAP_ACTIONS = new Set(['declare', 'pulse', 'label', 'marker', 'date', 'dissolve', 'allLabels', 'units', 'portrait', 'flagSwap', 'shake', 'ghost', 'path', 'bigNumber', 'archive', 'callout', 'region', 'sticker', 'chapter', 'recolor', 'reveal', 'conceal', 'pointer']);
const MONEY_ACTIONS = { product: ['pulse', 'ghost'], grid: ['fill', 'hint', 'rest'], bars: ['big', 'bar'], card: ['stat'], people: ['light'], lines: ['line'] };
const SAFE = { top: 250, bottom: 1440 };

export function seriesIdOf(spec) {
  if (spec.seriesId && studio[spec.seriesId]) return spec.seriesId;
  const k = slug(spec.series);
  for (const [id, e] of Object.entries(studio)) if (slug(id) === k || slug(e.name) === k || (e.legacyNames ?? []).some((n) => slug(n) === k)) return id;
  return Object.keys(studio).find((id) => studio[id].composition === spec.composition) ?? null;
}

/** same tokenisation as pipeline/tts.py: "{Display|spoken}" shows Display */
export function displayWords(say) {
  const out = [];
  for (const m of say.matchAll(/\{([^|}]+)\|([^}]+)\}([^\s{]*)|(\S+)/g)) {
    if (m[4]) out.push(m[4]);
    else { const dw = m[1].split(/\s+/), tail = m[3] ?? ''; if (dw.length === 1) out.push(dw[0] + tail); else { out.push(dw[0]); out.push(dw.slice(1).join(' ') + tail); } }
  }
  return out;
}
export const compositionOf = (spec, sid = seriesIdOf(spec)) =>
  spec.composition ?? (sid ? studio[sid].composition : 'Episode');

function scriptTimings(spec) {
  let cursor = 0;
  const beats = spec.beats.map(({ id, say }) => {
    const start = cursor;
    const words = displayWords(typeof say === 'string' ? say : '').map((w) => ({ w, start: cursor, end: ++cursor }));
    if (!words.length) cursor++;
    return { id, start, end: cursor, words };
  });
  return { duration: cursor, beats };
}

export function validate(id, { draft = false, da } = {}) {
  const errors = [], warnings = [];
  const E = (m) => errors.push(m), Wn = (m) => warnings.push(m);
  if (!fs.existsSync(EP(id, 'episode.json'))) return { id, errors: [`public/episodes/${id}/episode.json not found`], warnings };
  let spec;
  try { spec = readJson(EP(id, 'episode.json')); } catch (e) { return { id, errors: [`episode.json is not valid JSON: ${e.message}`], warnings }; }

  // identity
  if (spec.id !== id) E(`"id" is "${spec.id}" but the folder is "${id}"`);
  const sid = seriesIdOf(spec);
  if (!sid) E(`series "${spec.series}" is not in public/studio.json`);
  const comp = compositionOf(spec, sid);
  const effectiveDa = da ?? spec.da ?? 1;
  if (!spec.title) E('missing "title"'); else if (spec.title.length > 36) Wn(`title is ${spec.title.length} characters (aim for ≤ 36: it must fit two or three lines at full size)`);
  if (!Array.isArray(spec.beats) || !spec.beats.length) return { id, errors: [...errors, 'no beats'], warnings };

  // audio
  const media = episodeMedia(id, spec);
  if (spec.audio) {
    if (!fs.existsSync(EP(spec.audio, 'episode.json'))) E(`"audio": "${spec.audio}" does not exist`);
    else {
      const src = readJson(EP(spec.audio, 'episode.json'));
      if (src.beats.length !== spec.beats.length) E(`shares the audio of ${spec.audio} but has ${spec.beats.length} beats instead of ${src.beats.length}`);
      else src.beats.forEach((b, i) => { if (b.say !== spec.beats[i].say) E(`beat ${spec.beats[i].id}: "say" differs from ${spec.audio} (the voice is shared, so the script must be identical)`); });
    }
  } else if (!spec.voice) E('missing "voice" (or "audio" to reuse another episode\'s)');
  const timingPath = path.join(ROOT, 'public', media.timings);
  let timings;
  try {
    if (!draft && fs.existsSync(timingPath)) {
      timings = alignTimings(spec, readJson(timingPath));
      schedule(spec, timings, { composition: comp, da: effectiveDa });
    } else {
      if (!draft) Wn('no timings.json yet: cue words are checked against the script only');
      schedule(spec, scriptTimings(spec), { composition: comp, da: effectiveDa, scriptOnly: true });
    }
  } catch (error) {
    E(`${draft ? 'episode.json' : media.timings}: ${error.message}`);
  }

  // sources: the first promise of every channel
  let sources = '';
  if (!fs.existsSync(EP(id, 'SOURCES.md'))) E('SOURCES.md is missing: no figure may be shown without a source');
  else sources = fs.readFileSync(EP(id, 'SOURCES.md'), 'utf8');
  const srcNums = new Set((sources.replace(/,(?=\d{3})/g, '').match(/\d+(?:\.\d+)?/g) ?? []).flatMap((x) => [x, String(Number(x))]));
  const shown = [];
  const collect = (where, v) => { if (typeof v === 'string' || typeof v === 'number') shown.push([where, String(v)]); };

  // map data
  let featureIds = null;
  if (comp === 'Episode') {
    if (!spec.data) E('missing "data" (GeoJSON path)');
    else if (!fs.existsSync(path.join(ROOT, 'public', spec.data))) E(`map data public/${spec.data} not found (run its scripts/prep-*.mjs)`);
    else {
      const geo = readJson(path.join(ROOT, 'public', spec.data));
      featureIds = new Set(geo.features.map((f) => String(f.id)));
      for (const f of geo.features) if ((f.properties?.focus || f.properties?.soviet) && !f.properties?.label) Wn(`feature ${f.id} is a subject but has no properties.label [lon, lat]`);
    }
    if (!spec.timeline?.from || !spec.timeline?.to) E('missing "timeline" {from, to}');
  }
  if (comp === 'Money') {
    if (!spec.scenes || !Object.keys(spec.scenes).length) E('missing "scenes"');
    if (!spec.source) E('missing "source" (the line that stays on screen)'); else collect('source', spec.source);
    for (const [sidk, def] of Object.entries(spec.scenes ?? {})) {
      if (!MONEY_ACTIONS[def.type]) E(`scene "${sidk}": unknown type "${def.type}"`);
      for (const k of ['price', 'tag', 'cardTitle', 'cardSub']) collect(`scene ${sidk}.${k}`, def[k]);
    }
  }
  collect('title', spec.title);

  // beats and cues
  const seen = new Set();
  let scene = null;
  const perScene = {};
  spec.beats.forEach((b, i) => {
    if (!b.id) return E(`beat #${i} has no id`);
    if (seen.has(b.id)) E(`duplicate beat id "${b.id}"`);
    seen.add(b.id);
    if (!b.say || !b.say.trim()) E(`beat ${b.id}: empty "say"`);
    if (b.scene) { scene = b.scene; if (comp === 'Money' && !spec.scenes?.[scene]) E(`beat ${b.id}: scene "${scene}" is not declared in "scenes"`); }
    collect(`beat ${b.id}.kicker`, b.kicker);
    if (b.camera?.fit && featureIds && !['FOCUS', 'SOVIET'].includes(b.camera.fit) && !featureIds.has(b.camera.fit)) E(`beat ${b.id}: camera fit "${b.camera.fit}" is not a feature id`);
    for (const a of b.actions ?? []) {
      const where = `beat ${b.id} · ${a.type}`;
      if (comp === 'Episode' && !MAP_ACTIONS.has(a.type)) E(`${where}: unknown action type`);
      if (comp === 'Money') {
        const type = spec.scenes?.[scene]?.type;
        if (a.type !== 'callout' && MONEY_ACTIONS[type] && !MONEY_ACTIONS[type].includes(a.type)) E(`${where}: not an action of a "${type}" scene (${MONEY_ACTIONS[type].join(', ')}, callout)`);
        (perScene[scene] ??= []).push(a.type);
      }
      if (featureIds) {
        const ids = [a.id, ...(a.ids ?? [])].filter((x) => typeof x === 'string');
        if (['declare', 'pulse', 'ghost', 'recolor', 'reveal', 'conceal'].includes(a.type)) for (const x of ids) if (!featureIds.has(x)) E(`${where}: "${x}" is not a feature id of ${spec.data}`);
      }
      // assets (missing ones are skipped at render, never fatal: so say it now)
      for (const code of [a.flag, a.from, a.to].filter((x) => typeof x === 'string')) if (comp === 'Episode' && (a.type !== 'path') && !fs.existsSync(path.join(ROOT, 'public/assets/flags', `${code}.svg`))) Wn(`${where}: flag "${code}" has no public/assets/flags/${code}.svg (it will be skipped)`);
      if (a.type === 'portrait' && !fs.existsSync(path.join(ROOT, 'public/assets/portraits', `${a.key}.jpg`))) Wn(`${where}: portrait "${a.key}" has no image (the card will be skipped)`);
      if (a.emoji && !['json', 'png'].some((x) => fs.existsSync(path.join(ROOT, 'public/assets/emoji', `${a.emoji}.${x}`)))) Wn(`${where}: emoji "${a.emoji}" not in public/assets/emoji (it will be skipped)`);
      if (a.type === 'archive' && a.src && !fs.existsSync(path.join(ROOT, 'public', a.src))) Wn(`${where}: image public/${a.src} not found`);
      // layout: DA v2 keeps everything readable inside the platform safe area
      if (effectiveDa >= 2 && typeof a.y === 'number' && (a.y < SAFE.top || a.y > SAFE.bottom - 60)) Wn(`${where}: y=${a.y} is outside the safe area (${SAFE.top}–${SAFE.bottom}): the platform interface will cover it`);
      for (const k of ['text', 'label', 'sub', 'amount', 'value', 'big', 'caption', 'stamp', 'small', 'flagNote', 'date']) collect(`${where}.${k}`, a[k]);
    }
    if (b.date) collect(`beat ${b.id}.date`, b.date);
  });
  for (const [sc, types] of Object.entries(perScene)) {
    if (types.filter((x) => x === 'bar').length > 2) Wn(`scene "${sc}": more than 2 bars`);
    if (types.filter((x) => x === 'stat').length > 2) Wn(`scene "${sc}": more than 2 stats`);
  }

  // every figure on screen must be in SOURCES.md
  if (sources) {
    const missing = new Map();
    for (const [where, text] of shown) {
      const isDate = /\.date$/.test(where) && /^\d{4}(-\d\d-\d\d)?$/.test(text);
      const nums = isDate ? [text.slice(0, 4)] : (text.replace(/,(?=\d{3})/g, '').match(/\d+(?:\.\d+)?/g) ?? []);
      for (const n of nums) {
        // sourced = the same number is written in SOURCES.md, possibly in another unit (15000000 ↔ "15 million", 5.778 ↔ "5,778")
        const v = Number(n);
        const forms = isDate ? [n] : [1, 1e3, 1e6, 1e9, 1e-3, 1e-6, 1e-9].map((k) => String(Number((v * k).toPrecision(12))));
        if (!forms.some((f) => srcNums.has(f))) (missing.get(n) ?? missing.set(n, []).get(n)).push(where);
      }
    }
    for (const [n, wheres] of missing) Wn(`figure ${n} is on screen (${wheres.slice(0, 2).join('; ')}${wheres.length > 2 ? '…' : ''}) but not in SOURCES.md`);
  }

  // rhythm
  if (timings) {
    const hook = timings.beats[0];
    if (hook.end - hook.start > 4) Wn(`hook lasts ${(hook.end - hook.start).toFixed(1)} s (aim for ≤ 3.5 s)`);
    if (timings.duration < 28 || timings.duration > 75) Wn(`voice lasts ${timings.duration.toFixed(1)} s (aim for 40–58 s, or 61–70 s for a monetised TikTok cut)`);
  }
  if (effectiveDa >= 2 && spec.keywords && !Array.isArray(spec.keywords)) E('"keywords" must be a list of words');
  return { id, errors, warnings, series: sid, composition: comp, da: effectiveDa };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { all: { type: 'boolean' }, strict: { type: 'boolean' }, draft: { type: 'boolean' }, da: { type: 'string' } },
  });
  const { all, strict, draft, da } = values;
  if (da !== undefined && da !== '1' && da !== '2') { console.error('--da must be 1 or 2'); process.exit(2); }
  const ids = all ? fs.readdirSync(path.join(ROOT, 'public/episodes')).filter((d) => fs.existsSync(EP(d, 'episode.json'))).sort() : positionals;
  if (!ids.length) { console.error('usage: node scripts/validate.mjs <episodeId>… | --all [--strict] [--draft] [--da 1|2]'); process.exit(2); }
  let bad = 0, warned = 0;
  for (const id of ids) {
    const r = validate(id, { draft, da: da === undefined ? undefined : Number(da) });
    const tag = r.errors.length ? 'FAIL' : r.warnings.length ? 'warn' : ' ok ';
    console.log(`[${tag}] ${id}${r.series ? `  (${r.series} · ${r.composition} · DA ${r.da})` : ''}`);
    for (const e of r.errors) console.log(`    ✗ ${e}`);
    for (const w of r.warnings) console.log(`    ! ${w}`);
    if (r.errors.length) bad++;
    if (r.warnings.length) warned++;
  }
  console.log(`${ids.length} episode(s): ${bad} failing, ${warned} with warnings`);
  process.exit(bad || (strict && warned) ? 1 : 0);
}
