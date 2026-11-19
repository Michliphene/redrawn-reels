#!/usr/bin/env node
// Studio board: where every reel stands in the pipeline, what to do next, what is posted and how it performs.
//   node scripts/board.mjs              every episode, one line each + next action
//   node scripts/board.mjs <id>         one episode in detail
//   node scripts/board.mjs <id> --manifest <file> --approval <file>  inspect a selected release
//   node scripts/board.mjs --json       machine-readable
//   node scripts/board.mjs --md         writes docs/BOARD.md
//   node scripts/board.mjs --doctor     only the toolchain checks
// Delivery is diagnostic only. Posting and metrics come from tracker/posts.json (scripts/track.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { existingVoice } from './render-tools.mjs';
import { validate, seriesIdOf } from './validate.mjs';
import { readFormat, voiceLengthNote } from './format.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (...a) => path.join(ROOT, ...a);
const exists = (p) => fs.existsSync(p);
const mtime = (p) => (exists(p) ? fs.statSync(p).mtimeMs : 0);
const readJson = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const studio = readJson(P('public/studio.json')).series;

// ---------- stages ----------
// Each stage: { key, label, state: 'done'|'stale'|'todo'|'fail'|'skip'|'warn'|'away', note, cmd }
export const STAGES = ['sources', 'data', 'cues', 'voice', 'music', 'stills', 'render', 'review', 'kit', 'posted'];
const SHORT = { sources: 'Src', data: 'Map', cues: 'Pre', voice: 'Voi', music: 'Mus', stills: 'Sti', render: 'Ren', review: 'Rev', kit: 'Kit', posted: 'Pub' };
const LABEL = { sources: 'Sources', data: 'Map data', cues: 'Pre-flight', voice: 'Voice', music: 'Music', stills: 'Stills', render: 'Render', review: 'Review', kit: 'Post kit', posted: 'Publish' };

function walk(dir, re, acc = []) {
  if (!exists(dir)) return acc;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, re, acc); else if (re.test(f.name)) acc.push(p);
  }
  return acc;
}
let engineNewest = null;
const engineMtime = () => (engineNewest ??= Math.max(...walk(P('src'), /\.(ts|tsx)$/).map(mtime), mtime(P('pipeline/render.sh')), mtime(P('public/studio.json'))));

function reviews(id, epNo, seriesId, isRemaster) {
  const out = { reel: [], viral: [] };
  const dir = P('docs/review');
  const re = new RegExp(`^${id.replace(/[-]/g, '\\-')}-(virality-)?pass(\\d+)\\.md$`);
  for (const f of exists(dir) ? fs.readdirSync(dir) : []) {
    const m = f.match(re); if (!m) continue;
    const txt = fs.readFileSync(path.join(dir, f), 'utf8');
    const file = path.join(dir, f), pass = +m[2];
    if (m[1]) {
      const s = txt.match(/VIRALITY SCORE:\s*(\d+)\s*\/\s*100/) ?? txt.match(/\*\*TOTAL\*\*\s*\|\s*\*\*(\d+)\/100/);
      out.viral.push({ pass, score: s ? +s[1] : null, file, t: mtime(file) });
    } else {
      const s = txt.match(/Verdict:?\s*\**\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
      const ok = txt.match(/Postable:\s*\**\s*(yes|no)/i);
      out.reel.push({ pass, score: s ? +s[1] : null, postable: ok ? ok[1].toLowerCase() === 'yes' : null, file, t: mtime(file) });
    }
  }
  const legacy = epNo != null && !isRemaster ? (exists(P('docs')) ? fs.readdirSync(P('docs')) : []).find((f) => new RegExp(`REVIEW_ep${epNo}\\.md$`, 'i').test(f) && seriesId === 'redrawn') : null;
  const summary = P('docs', exists(P('docs', `REVIEW_${id}.md`)) || !legacy ? `REVIEW_${id}.md` : legacy);
  if (exists(summary)) {
    const txt = fs.readFileSync(summary, 'utf8');
    const scores = [...txt.matchAll(/Pass\s*(\d+):\s*(\d+(?:\.\d+)?)\s*\/\s*10/gi)];
    out.summary = { file: summary, t: mtime(summary), score: scores.length ? +scores.at(-1)[2] : null };
  }
  out.reel.sort((a, b) => a.pass - b.pass); out.viral.sort((a, b) => a.pass - b.pass);
  return out;
}

export function loadTracker() {
  return readJson(P('tracker/posts.json'), { posts: {} });
}

function deliveryDecision(id, { manifest, approval }) {
  if (!exists(path.resolve(ROOT, manifest))) {
    return { status: 'missing', reason: `No local render manifest ${manifest}` };
  }
  const args = ['status', id, '--json', `--manifest=${manifest}`, `--approval=${approval}`];
  const result = spawnSync(process.execPath, [P('scripts/delivery.mjs'), ...args], {
    cwd: ROOT, encoding: 'utf8', timeout: 10_000, windowsHide: true,
  });
  if (!result.error && !result.signal) {
    try {
      const { status, reason } = JSON.parse(result.stdout);
      if (typeof reason === 'string' && reason.trim() && (
        status === 'missing' || status === 'blocked' || (status === 'ready' && result.status === 0)
      )) return { status, reason };
    } catch {
      // An unavailable or invalid diagnostic cannot approve a release.
    }
  }
  return { status: 'blocked', reason: 'Delivery status unavailable. Check scripts/delivery.mjs for this episode.' };
}

/** the best-known numbers for one platform post: its latest stats snapshot */
const latest = (post) => (post?.stats?.length ? post.stats.at(-1) : null);

function episodeStatus(id, tracker, overrides) {
  const dir = P('public/episodes', id);
  const spec = readJson(path.join(dir, 'episode.json'), {});
  const sid = seriesIdOf(spec) ?? '?';
  const series = studio[sid] ?? { name: spec.series ?? '?', episodeTag: '#{n}' };
  const tag = spec.episode != null ? series.episodeTag.replace('{nnn}', String(spec.episode).padStart(3, '0')).replace('{n}', String(spec.episode)) : '';
  const audio = spec.audio ?? id;
  const adir = P('public/episodes', audio);
  const S = {};
  const set = (k, state, note = '', cmd = '') => (S[k] = { key: k, label: LABEL[k], state, note, cmd });

  // sources
  const src = path.join(dir, 'SOURCES.md');
  if (!exists(src)) set('sources', 'todo', 'no SOURCES.md (script, facts table, debated points, pinned comment)', `$EDITOR public/episodes/${id}/SOURCES.md`);
  else {
    const t = fs.readFileSync(src, 'utf8');
    const facts = (t.match(/^\|.*\|\s*$/gm) ?? []).length;
    set('sources', facts ? 'done' : 'warn', facts ? `${facts} table rows` : 'no facts table found');
  }

  // map data
  if (spec.data) {
    const prep = walk(P('scripts'), /^prep-.*\.mjs$/).find((p) => spec.data.includes(path.basename(p).slice(5, -4)));
    exists(P('public', spec.data)) ? set('data', 'done', spec.data) : set('data', 'todo', `${spec.data} missing`, prep ? `node ${path.relative(ROOT, prep)}` : `write scripts/prep-${id}.mjs`);
  } else set('data', 'skip', 'no map');

  // pre-flight
  const v = validate(id);
  if (v.errors.length) set('cues', 'fail', `${v.errors.length} ✗ · ${v.warnings.length} !`, `npm run validate ${id}`);
  else if (v.warnings.length) set('cues', 'warn', `${v.warnings.length} warning(s)`, `npm run validate ${id}`);
  else set('cues', 'done', 'clean');
  const issues = { errors: v.errors, warnings: v.warnings };

  // voice
  const timingFile = path.join(adir, 'timings.json');
  const tj = readJson(timingFile);
  const shared = audio !== id ? ` (shared with ${audio})` : '';
  if (!exists(path.join(adir, 'voice.wav')) || !exists(timingFile)) {
    set('voice', 'todo', `voice.wav or timings.json missing${shared}`, `pipeline/render.sh ${audio}`);
  } else {
    try {
      const voice = existingVoice(adir);
      const engine = voice.effective?.engine ?? voice.reportedEngine ?? '?';
      const duration = Number.isFinite(tj?.duration) ? `${tj.duration.toFixed(1)} s · ` : '';
      const status = voice.status === 'fallback' ? `fallback from ${voice.request.engine}` : voice.status;
      set('voice', voice.status === 'verified' ? 'done' : 'warn', `${duration}${engine}${shared} · ${status}`);
    } catch (error) {
      const stale = error.message.startsWith('Voice provenance is stale');
      set('voice', stale ? 'stale' : 'warn', `${stale ? error.message : `Voice probe unavailable · ${error.message}`}${shared}`);
    }
    const lengthNote = voiceLengthNote(readFormat(ROOT), id, tj?.duration);
    if (lengthNote) S.voice.note += ` · ${lengthNote}`;
  }

  // music
  if (exists(path.join(adir, 'music.lock'))) set('music', 'done', 'licensed (music.lock)');
  else if (exists(path.join(adir, 'music.wav'))) set('music', 'done', 'procedural bed');
  else set('music', 'todo', 'made by render.sh', `pipeline/render.sh ${id}`);

  // stills
  const sheet = P('out/stills', id, 'sheet.jpg');
  const inputs = Math.max(mtime(path.join(dir, 'episode.json')), mtime(path.join(adir, 'timings.json')), spec.data ? mtime(P('public', spec.data)) : 0);
  const R = reviews(id, spec.episode, sid, !!spec.audio);
  const reviewedBefore = !!(R.reel.length || R.viral.length || R.summary);
  if (!exists(sheet) && reviewedBefore) set('stills', 'away', 'made before; out/ is not committed', `npm run stills ${id} -- --n 12 --cols 6`);
  else if (!exists(sheet)) set('stills', 'todo', 'no contact sheet', `npm run stills ${id} -- --n 12 --cols 6`);
  else set('stills', mtime(sheet) < inputs ? 'stale' : 'done', mtime(sheet) < inputs ? 'cue sheet changed since' : path.relative(ROOT, sheet), `npm run stills ${id} -- --n 12 --cols 6`);

  // render
  const mp4 = P('out', `${id}.mp4`);
  const newestInput = Math.max(inputs, engineMtime());
  if (!exists(mp4) && reviewedBefore) set('render', 'away', 'historical render; no local MP4', `pipeline/render.sh ${id}`);
  else if (!exists(mp4)) set('render', 'todo', 'no out/' + id + '.mp4 in this checkout', `pipeline/render.sh ${id}`);
  else if (mtime(mp4) < newestInput) set('render', 'stale', 'older than its inputs', `pipeline/render.sh ${id}`);
  else set('render', 'done', `out/${id}.mp4 · ${(fs.statSync(mp4).size / 1e6).toFixed(1)} MB`);

  // review
  const lastReel = R.reel.at(-1), lastViral = R.viral.at(-1);
  const reelScore = lastReel?.score ?? R.summary?.score ?? null;
  const viralScore = lastViral?.score ?? null;
  const reviewT = Math.max(lastReel?.t ?? 0, lastViral?.t ?? 0, R.summary?.t ?? 0);
  if (!reviewT) set('review', 'todo', 'no review yet', 'run the reel-reviewer, then the virality-reviewer agent');
  else {
    const bits = [reelScore != null && `reel ${reelScore}/10`, viralScore != null && `viral ${viralScore}/100`, `${Math.max(R.reel.length, R.viral.length) || 1} pass(es)`].filter(Boolean).join(' · ');
    const stale = exists(mp4) && mtime(mp4) > reviewT;
    const notPostable = lastReel?.postable === false;
    set('review', stale ? 'stale' : notPostable ? 'warn' : 'done', bits + (stale ? ' · video re-rendered since' : notPostable ? ' · last pass: not postable' : ''), stale ? 'run the reel-reviewer again on the new render' : '');
  }

  // posting kit
  const kit = P('deliverables', id);
  const need = ['POSTING.md', 'cover_3x4.jpg', 'cover_9x16.png', 'POST.md'];
  const missing = need.filter((f) => !exists(path.join(kit, f)));
  if (missing.length === need.length) set('kit', 'todo', 'no local kit files');
  else if (missing.length) set('kit', 'warn', `missing ${missing.join(', ')}`);
  else set('kit', 'done', 'local kit files present');

  const deliverySelection = {
    manifest: overrides.manifest ?? `out/${id}.render.json`,
    approval: overrides.approval ?? `deliverables/${id}/RELEASE.json`,
  };
  const delivery = deliveryDecision(id, deliverySelection);

  // posted (tracker)
  const posts = tracker.posts?.[id] ?? {};
  const platforms = Object.keys(posts);
  const totals = { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, follows: 0 };
  let freshest = 0;
  for (const p of platforms) {
    const s = latest(posts[p]);
    if (s) { for (const k of Object.keys(totals)) totals[k] += +s[k] || 0; freshest = Math.max(freshest, Date.parse(s.at) || 0); }
  }
  if (!platforms.length) set('posted', 'todo', 'no manual post logged');
  else {
    const age = freshest ? Math.floor((Date.now() - freshest) / 864e5) : null;
    const note = `${platforms.join(', ')}${totals.views ? ` · ${fmt(totals.views)} views` : ''}${age != null ? ` · stats ${age} d old` : ' · no stats yet'}`;
    set('posted', age == null || age > 3 ? 'warn' : 'done', note, `node scripts/track.mjs stats ${id} <platform> views=… likes=… comments=… shares=… saves=…`);
  }

  let next;
  if (platforms.length) {
    next = S.posted.state === 'warn' ? { ...S.posted, label: 'Update stats' } : null;
  } else if (delivery.status === 'ready') {
    next = { label: 'Publish', note: 'Owner may publish the verified release and then log the post', cmd: '' };
  } else if (delivery.status === 'missing') {
    const prep = STAGES.filter((k) => k !== 'kit' && k !== 'posted').map((k) => S[k]);
    next = prep.find((s) => ['todo', 'stale', 'fail'].includes(s.state));
  }
  if (!platforms.length && !next) next = { label: 'Delivery', note: delivery.reason, cmd: '' };
  const doneCount = STAGES.filter((k) => ['done', 'skip', 'away'].includes(S[k].state)).length;
  const superseded = Object.keys(studio).length && fs.readdirSync(P('public/episodes')).some((d) => d !== id && readJson(P('public/episodes', d, 'episode.json'), {}).audio === id);
  return {
    id, series: series.name, seriesId: sid, tag, episode: spec.episode ?? null, title: spec.title ?? '', da: spec.da ?? 1,
    audio, remasterOf: spec.audio ?? null, hasRemaster: superseded, duration: tj?.duration ?? null,
    stages: STAGES.map((k) => S[k]), progress: `${doneCount}/${STAGES.length}`,
    scores: { reel: reelScore, viral: viralScore, viralHistory: R.viral.map((r) => r.score) },
    issues, delivery, deliverySelection, posts, totals, next: next ? { stage: next.label, note: next.note, cmd: next.cmd } : null,
  };
}

// ---------- backlog: topics not produced yet ----------
function backlog(episodes) {
  const made = episodes.map((e) => `${e.id} ${e.title}`.toLowerCase());
  const out = [];
  for (const [sid, file] of [['redrawn', 'docs/01_SERIES_AND_TOPICS.md'], ['receipts', 'docs/RECEIPTS_SERIES.md']]) {
    if (!exists(P(file))) continue;
    for (const line of fs.readFileSync(P(file), 'utf8').split('\n')) {
      const c = line.split('|').map((s) => s.trim());
      if (c.length < 5 || !/^\d+$/.test(c[1])) continue;
      const title = c[2];
      const key = (title.match(/[A-Z][a-zA-Z]{3,}/g) ?? []).map((w) => w.toLowerCase()).filter((w) => !['how', 'what', 'where', 'why', 'who'].includes(w));
      const produced = /produced/i.test(line) || key.some((k) => made.some((m) => m.includes(k)));
      if (!produced) out.push({ series: studio[sid]?.name ?? sid, seriesId: sid, n: c[1], title, hook: c[3].replace(/^"|"$/g, ''), risk: c.at(-2) });
    }
  }
  // REDRAWN's bible gives a publishing order ("Recommended publishing order … : 1, 4, 20, …"): follow it
  const orderLine = exists(P('docs/01_SERIES_AND_TOPICS.md')) && fs.readFileSync(P('docs/01_SERIES_AND_TOPICS.md'), 'utf8').match(/Recommended publishing order[^:]*:\s*([\d,\s]+)/);
  const rank = orderLine ? orderLine[1].split(',').map((x) => x.trim()) : [];
  const r = (b) => (b.seriesId === 'redrawn' && rank.includes(b.n) ? rank.indexOf(b.n) : 100 + +b.n);
  return out.sort((a, b) => a.seriesId.localeCompare(b.seriesId) || r(a) - r(b));
}

// ---------- toolchain ----------
function doctor() {
  const ok = (cmd, args) => { try { execFileSync(cmd, args, { stdio: 'ignore', cwd: ROOT, windowsHide: true, timeout: 5_000 }); return true; } catch { return false; } };
  const python = process.env.STUDIO_PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3');
  const chrome = (() => { try { return fs.readdirSync('/opt/pw-browsers').some((d) => d.startsWith('chromium_headless_shell')); } catch { return false; } })();
  return [
    { name: 'node_modules', ok: exists(P('node_modules/remotion')), fix: 'npm install (or scripts/setup.sh)' },
    { name: 'ffmpeg / ffprobe', ok: ok('ffmpeg', ['-version']) && ok('ffprobe', ['-version']), fix: 'apt-get install -y ffmpeg' },
    { name: `Python voice deps (${python})`, ok: ok(python, ['-c', 'import numpy, soundfile']), fix: 'Set STUDIO_PYTHON to an interpreter with numpy and soundfile' },
    { name: 'headless Chromium', ok: chrome || !!process.env.REMOTION_CHROME, fix: 'set REMOTION_CHROME' },
    { name: 'Kokoro fallback model', ok: exists(P('models')) && fs.readdirSync(P('models')).length > 0, fix: 'scripts/setup.sh (only needed without ElevenLabs)', optional: true },
  ];
}

const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n));

export function board(selection, overrides = {}) {
  if (!selection && (overrides.manifest !== undefined || overrides.approval !== undefined)) {
    throw new Error('Delivery overrides require a single episode selector.');
  }
  const allIds = fs.readdirSync(P('public/episodes')).filter((d) => exists(P('public/episodes', d, 'episode.json')));
  const ids = selection ? [selectEpisode(selection, allIds)] : allIds;
  const tracker = loadTracker();
  const episodes = ids.map((id) => episodeStatus(id, tracker, overrides))
    .sort((a, b) => a.seriesId.localeCompare(b.seriesId) || (a.episode ?? 99) - (b.episode ?? 99) || a.da - b.da);
  return { generatedAt: new Date().toISOString(), episodes, backlog: selection ? [] : backlog(episodes), doctor: selection ? [] : doctor() };
}

function selectEpisode(selection, ids) {
  if (ids.includes(selection)) return selection;
  const hits = /^\d+$/.test(selection) ? ids.filter((id) => readJson(P('public/episodes', id, 'episode.json'))?.episode === Number(selection)) : [];
  if (hits.length === 1) return hits[0];
  if (hits.length > 1) throw new Error(`Episode ${selection} is ambiguous: ${hits.join(', ')}. Use an exact episode ID.`);
  throw new Error(`No episode "${selection}"`);
}

// ---------- output ----------
const TTY = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (TTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const ICON = { away: c(90, '◌'), done: c(32, '●'), skip: c(90, '·'), todo: c(90, '○'), stale: c(33, '◐'), warn: c(33, '!'), fail: c(31, '✗') };
const APPROVAL = { ready: 'Ready', blocked: 'Blocked', missing: '–' };
const pad = (s, n) => { const len = [...s.replace(/\x1b\[[0-9;]*m/g, '')].length; return s + ' '.repeat(Math.max(0, n - len)); };

function printBoard(B) {
  console.log(c(1, `STUDIO BOARD`) + c(90, `  ${B.episodes.length} episodes · ${new Date(B.generatedAt).toLocaleString('en-GB')}`));
  console.log(c(90, ' '.repeat(33) + STAGES.map((k) => SHORT[k]).join(' ') + ' Approval') + c(90, '\n  legend: ● done  ◌ done elsewhere  ◐ stale  ! look  ✗ fail  ○ todo  · n/a  – no delivery decision'));
  let last = '';
  for (const e of B.episodes) {
    if (e.series !== last) { console.log('\n' + c(1, e.series)); last = e.series; }
    const dots = e.stages.map((s) => ' ' + ICON[s.state] + '  ').join('');
    const score = [e.scores.reel != null && `${e.scores.reel}/10`, e.scores.viral != null && `${e.scores.viral}`].filter(Boolean).join(' · ');
    const name = `${pad(e.tag, 5)} ${pad(e.id, 18)}${e.da >= 2 ? c(36, 'DA2') : c(90, 'DA1')}${e.hasRemaster ? c(90, '→v2') : '   '}`;
    console.log(` ${name} ${dots}${pad(APPROVAL[e.delivery.status], 9)} ${pad(c(35, score), 13)} ${e.next ? c(90, '→ ') + e.next.stage + c(90, ': ' + (e.next.cmd || e.next.note)) : c(32, '✓ post logged')}`);
  }
  const posted = B.episodes.filter((e) => Object.keys(e.posts).length);
  if (posted.length) {
    console.log('\n' + c(1, 'PERFORMANCE'));
    for (const e of [...posted].sort((a, b) => b.totals.views - a.totals.views)) {
      const t = e.totals, er = t.views ? (((t.likes + t.comments + t.shares + t.saves) / t.views) * 100).toFixed(1) : '–';
      console.log(`  ${pad(e.id, 20)} ${pad(fmt(t.views) + ' views', 13)} ${pad(`eng ${er}%`, 10)} shares ${fmt(t.shares)} · saves ${fmt(t.saves)} · +${fmt(t.follows)} follows  ${c(90, Object.keys(e.posts).join(', '))}`);
    }
  }
  const bad = B.doctor.filter((d) => !d.ok && !d.optional);
  console.log('\n' + c(1, 'TOOLCHAIN ') + (bad.length ? c(33, `${bad.length} missing: `) + bad.map((d) => `${d.name} (${d.fix})`).join(' · ') : c(32, 'ready')));
  if (B.backlog.length) {
    console.log(c(1, 'BACKLOG ') + c(90, `${B.backlog.length} topics not produced (node scripts/board.mjs --md lists them all)`));
    for (const sname of [...new Set(B.backlog.map((b) => b.series))]) console.log(`  ${pad(sname, 9)} ` + B.backlog.filter((b) => b.series === sname).slice(0, 3).map((b) => `${b.n} “${b.title}”`).join(c(90, ' · ')));
  }
}

function printOne(e) {
  console.log(c(1, `${e.series} ${e.tag} · ${e.title}`) + c(90, `  (${e.id} · DA ${e.da}${e.remasterOf ? ` · voice of ${e.remasterOf}` : ''})`));
  for (const s of e.stages) console.log(`  ${ICON[s.state]} ${pad(s.label, 11)} ${s.note}${s.cmd && s.state !== 'done' && s.state !== 'skip' ? c(90, `\n                ↳ ${s.cmd}`) : ''}`);
  console.log(`  ${pad('Approval', 13)} ${APPROVAL[e.delivery.status]} · ${e.delivery.reason}`);
  console.log(`  ${pad('Manifest', 13)} ${e.deliverySelection.manifest}`);
  console.log(`  ${pad('Release file', 13)} ${e.deliverySelection.approval}`);
  for (const x of e.issues.errors) console.log(c(31, `      ✗ ${x}`));
  for (const x of e.issues.warnings) console.log(c(33, `      ! ${x}`));
  if (e.scores.viralHistory.length > 1) console.log(c(90, `  virality across passes: ${e.scores.viralHistory.join(' → ')}`));
  for (const [p, post] of Object.entries(e.posts)) {
    const s = latest(post);
    console.log(`  ${pad(p, 10)} posted ${post.date ?? '?'} ${post.url ?? ''}` + (s ? c(90, `\n             ${s.at}: ${fmt(+s.views || 0)} views · ${s.likes ?? 0} likes · ${s.comments ?? 0} comments · ${s.shares ?? 0} shares · ${s.saves ?? 0} saves`) : ''));
  }
  console.log(e.next ? `\n  next → ${c(1, e.next.stage)}: ${e.next.cmd || e.next.note}` : `\n  ${c(32, '✓ nothing to do')}`);
}

function markdown(B) {
  const sym = { away: '◌', done: '●', skip: '·', todo: '○', stale: '◐', warn: '!', fail: '✗' };
  const L = [`# Studio board`, '', `Generated by \`node scripts/board.mjs --md\` on ${B.generatedAt.slice(0, 10)}. ● done · ◌ done before, absent locally · ◐ stale · ! look · ✗ fail · ○ todo · · n/a`, '',
    'Approval comes from the delivery diagnostic for the exact episode ID. A dash means the decision is missing. Review scores and local kit files describe production history.', '',
    'Delivery defaults to `out/<id>.render.json` and `deliverables/<id>/RELEASE.json`. For one episode, use `node scripts/board.mjs <id> --manifest <file> --approval <file>` to override either path. The detail view and JSON show both selected paths. Delivery checks local files. A manual post entry takes priority in the next-action column.', '',
    'The voice stage checks the local voice and timings against their provenance, including for shared audio. It flags legacy-unverified, fallback, stale and unavailable evidence. `--doctor` checks Python voice dependencies with `STUDIO_PYTHON`, or `python` on Windows and `python3` elsewhere.', '',
    'Use `node scripts/board.mjs <id>` for the delivery reason and `node scripts/track.mjs list` for the manual publication log. After an authorized post, use `node scripts/track.mjs posted <id> <platform> --url <url>` and record platform metrics with `node scripts/track.mjs stats <id> <platform> views=…`.', '',
    `| Series | # | Episode | DA | ${STAGES.map((k) => LABEL[k]).join(' | ')} | Approval | Reel | Viral | Next |`, `|${'---|'.repeat(STAGES.length + 8)}`];
  for (const e of B.episodes) {
    const step = e.next?.cmd || e.next?.note || '';
    const safeStep = step.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');
    const next = e.next ? `${e.next.stage} · ${e.next.cmd ? `\`${safeStep}\`` : safeStep}` : '✓ post logged';
    L.push(`| ${e.series} | ${e.tag} | \`${e.id}\` ${e.title} | ${e.da} | ${e.stages.map((s) => sym[s.state]).join(' | ')} | ${APPROVAL[e.delivery.status]} | ${e.scores.reel ?? ''} | ${e.scores.viral ?? ''} | ${next} |`);
  }
  L.push('', '## Backlog', '', '| Series | # | Topic | Hook | Risk |', '|---|---|---|---|---|');
  for (const b of B.backlog) L.push(`| ${b.series} | ${b.n} | ${b.title} | ${b.hook} | ${b.risk} |`);
  return L.join('\n') + '\n';
}

function main(args) {
  const { values, positionals } = parseArgs({ args, allowPositionals: true, options: {
    manifest: { type: 'string' }, approval: { type: 'string' }, json: { type: 'boolean' },
    md: { type: 'boolean' }, doctor: { type: 'boolean' },
  } });
  const [id] = positionals;
  const { manifest, approval } = values;
  if (positionals.length > 1) throw new Error('Select a single episode.');
  if (manifest?.trim() === '' || approval?.trim() === '') throw new Error('Delivery paths must be non-empty.');
  if ((values.md || values.doctor) && (id || manifest !== undefined || approval !== undefined)) {
    throw new Error('Use --md and --doctor without an episode selector or delivery overrides.');
  }
  if (values.doctor) {
    for (const d of doctor()) console.log(`${d.ok ? ICON.done : d.optional ? ICON.todo : ICON.fail} ${pad(d.name, 40)} ${d.ok ? '' : c(90, d.fix)}`);
    return;
  }
  const B = board(id, { manifest, approval });
  if (values.json) console.log(JSON.stringify(id ? B.episodes[0] : B, null, 1));
  else if (values.md) { fs.writeFileSync(P('docs/BOARD.md'), markdown(B)); console.log('wrote docs/BOARD.md'); }
  else if (id) printOne(B.episodes[0]);
  else printBoard(B);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 2; }
}
