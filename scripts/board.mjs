#!/usr/bin/env node
// Studio board: where every reel stands in the pipeline, what to do next, what is posted and how it performs.
//   npm run board                      every episode, one line each + next action
//   npm run board -- <id>              one episode in detail (every stage, why, the command to run)
//   npm run board -- --json            machine-readable (used by the Claude Code panel)
//   npm run board -- --md              writes docs/BOARD.md (a snapshot you can commit)
//   npm run board -- --doctor          only the toolchain checks
// Read-only: it never renders, records or posts anything. Posting/metrics come from tracker/posts.json
// (edit with `npm run track`).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validate, seriesIdOf } from './validate.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (...a) => path.join(ROOT, ...a);
const exists = (p) => fs.existsSync(p);
const mtime = (p) => (exists(p) ? fs.statSync(p).mtimeMs : 0);
const readJson = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const studio = readJson(P('public/studio.json')).series;

// ---------- stages ----------
// Each stage: { key, label, state: 'done'|'stale'|'todo'|'fail'|'skip'|'warn', note, cmd }
export const STAGES = ['sources', 'data', 'cues', 'voice', 'music', 'stills', 'render', 'review', 'kit', 'posted'];
const SHORT = { sources: 'Src', data: 'Map', cues: 'Pre', voice: 'Voi', music: 'Mus', stills: 'Sti', render: 'Ren', review: 'Rev', kit: 'Kit', posted: 'Pub' };
const LABEL = { sources: 'Sources', data: 'Map data', cues: 'Pre-flight', voice: 'Voice', music: 'Music', stills: 'Stills', render: 'Render', review: 'Review', kit: 'Post kit', posted: 'Publish' };

/** Python's say_hash (pipeline/tts.py), computed by Python itself so the two never drift. */
function voiceHashes(ids) {
  try {
    const out = execFileSync('python3', ['-c', `
import sys, json; sys.path.insert(0, 'pipeline')
from tts import say_hash
for i in sys.argv[1:]:
    try: print(i, say_hash(json.load(open(f'public/episodes/{i}/episode.json'))))
    except Exception: print(i, '-')
`, ...ids], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
    return Object.fromEntries(out.trim().split('\n').map((l) => l.split(' ')));
  } catch { return {}; }
}

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

/** the best-known numbers for one platform post: its latest stats snapshot */
const latest = (post) => (post?.stats?.length ? post.stats.at(-1) : null);

function episodeStatus(id, hashes, tracker) {
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
  const tj = readJson(path.join(adir, 'timings.json'));
  const hasVoice = exists(path.join(adir, 'voice.wav')) && tj;
  if (!hasVoice) set('voice', 'todo', audio !== id ? `shared voice ${audio} not recorded` : 'not recorded', `pipeline/render.sh ${audio}`);
  else {
    const want = hashes[audio], have = tj.say_hash;
    const dur = tj.duration ? `${tj.duration.toFixed(1)} s · ${tj.engine ?? '?'}` : '';
    const shared = audio !== id ? ` (shared with ${audio})` : '';
    if (!have) set('voice', 'done', `${dur}${shared} · pre-fingerprint take`);
    else if (want && want !== '-' && want !== have) set('voice', 'stale', `script changed since the take${shared}`, `pipeline/render.sh ${audio}`);
    else set('voice', 'done', `${dur}${shared}`);
    if (tj.duration && (tj.duration < 40 || tj.duration > 58)) S.voice.note += tj.duration > 70 ? ' · too long' : tj.duration > 58 ? ' · over 58 s (TikTok cut only)' : ' · under 40 s';
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
  if (!exists(mp4) && reviewedBefore) set('render', 'away', 'rendered before; re-render here to post (out/ is not committed)', `pipeline/render.sh ${id}`);
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
  const need = ['POSTING.md', 'cover_3x4.jpg', 'cover_9x16.png'];
  const missing = need.filter((f) => !exists(path.join(kit, f)));
  if (missing.length === need.length) set('kit', 'todo', 'no kit', `/post ${id}`);
  else if (missing.length) set('kit', 'warn', `missing ${missing.join(', ')}`, `/post ${id}`);
  else set('kit', exists(path.join(kit, 'POST.md')) ? 'done' : 'warn', exists(path.join(kit, 'POST.md')) ? 'POST.md ready' : 'POST.md not generated', `pipeline/post.sh ${id}`);

  // posted (tracker)
  const posts = tracker.posts?.[id] ?? {};
  const platforms = Object.keys(posts);
  const totals = { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, follows: 0 };
  let freshest = 0;
  for (const p of platforms) {
    const s = latest(posts[p]);
    if (s) { for (const k of Object.keys(totals)) totals[k] += +s[k] || 0; freshest = Math.max(freshest, Date.parse(s.at) || 0); }
  }
  if (!platforms.length) set('posted', 'todo', `not posted · after posting: npm run track -- posted ${id} <tiktok|instagram|youtube> --url <url>`, `/post ${id}  (your go)`);
  else {
    const age = freshest ? Math.floor((Date.now() - freshest) / 864e5) : null;
    const note = `${platforms.join(', ')}${totals.views ? ` · ${fmt(totals.views)} views` : ''}${age != null ? ` · stats ${age} d old` : ' · no stats yet'}`;
    set('posted', age == null || age > 3 ? 'warn' : 'done', note, `npm run track -- stats ${id} <platform> views=… likes=… comments=… shares=… saves=…`);
  }

  // next action: the first stage that is not done, in pipeline order; a posted reel only needs its numbers
  const order = platforms.length ? ['posted'] : STAGES;
  let next = order.map((k) => S[k]).find((s) => s && ['todo', 'stale', 'fail'].includes(s.state))
    ?? order.map((k) => S[k]).find((s) => s && s.state === 'warn' && s.cmd);
  if (next && platforms.length) next = { ...next, label: 'Update stats' };
  const doneCount = STAGES.filter((k) => ['done', 'skip', 'away'].includes(S[k].state)).length;
  const superseded = Object.keys(studio).length && fs.readdirSync(P('public/episodes')).some((d) => d !== id && readJson(P('public/episodes', d, 'episode.json'), {}).audio === id);
  return {
    id, series: series.name, seriesId: sid, tag, episode: spec.episode ?? null, title: spec.title ?? '', da: spec.da ?? 1,
    audio, remasterOf: spec.audio ?? null, hasRemaster: superseded, duration: tj?.duration ?? null,
    stages: STAGES.map((k) => S[k]), progress: `${doneCount}/${STAGES.length}`,
    scores: { reel: reelScore, viral: viralScore, viralHistory: R.viral.map((r) => r.score) },
    issues, posts, totals, next: next ? { stage: next.label, note: next.note, cmd: next.cmd } : null,
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
  const ok = (cmd, args) => { try { execFileSync(cmd, args, { stdio: 'ignore', cwd: ROOT }); return true; } catch { return false; } };
  const chrome = (() => { try { return fs.readdirSync('/opt/pw-browsers').some((d) => d.startsWith('chromium_headless_shell')); } catch { return false; } })();
  return [
    { name: 'node_modules', ok: exists(P('node_modules/remotion')), fix: 'npm install (or scripts/setup.sh)' },
    { name: 'ffmpeg / ffprobe', ok: ok('ffmpeg', ['-version']) && ok('ffprobe', ['-version']), fix: 'apt-get install -y ffmpeg' },
    { name: 'python voice deps (numpy, soundfile)', ok: ok('python3', ['-c', 'import numpy, soundfile']), fix: 'pip install numpy soundfile (scripts/setup.sh)' },
    { name: 'headless Chromium', ok: chrome || !!process.env.REMOTION_CHROME, fix: 'set REMOTION_CHROME' },
    { name: 'WhisperX (voice check, Kokoro word times)', ok: ok('python3', ['-c', 'import whisperx']), fix: 'scripts/setup.sh --asr', optional: true },
    { name: 'Kokoro fallback model', ok: exists(P('models')) && fs.readdirSync(P('models')).length > 0, fix: 'scripts/setup.sh (only needed without ElevenLabs)', optional: true },
  ];
}

const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n));

export function board() {
  const ids = fs.readdirSync(P('public/episodes')).filter((d) => exists(P('public/episodes', d, 'episode.json')));
  const hashes = voiceHashes(ids);
  const tracker = loadTracker();
  const episodes = ids.map((id) => episodeStatus(id, hashes, tracker))
    .sort((a, b) => a.seriesId.localeCompare(b.seriesId) || (a.episode ?? 99) - (b.episode ?? 99) || a.da - b.da);
  return { generatedAt: new Date().toISOString(), episodes, backlog: backlog(episodes), doctor: doctor() };
}

// ---------- output ----------
const TTY = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (TTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const ICON = { away: c(90, '◌'), done: c(32, '●'), skip: c(90, '·'), todo: c(90, '○'), stale: c(33, '◐'), warn: c(33, '!'), fail: c(31, '✗') };
const pad = (s, n) => { const len = [...s.replace(/\x1b\[[0-9;]*m/g, '')].length; return s + ' '.repeat(Math.max(0, n - len)); };

function printBoard(B) {
  console.log(c(1, `STUDIO BOARD`) + c(90, `  ${B.episodes.length} episodes · ${new Date(B.generatedAt).toLocaleString('en-GB')}`));
  console.log(c(90, ' '.repeat(33) + STAGES.map((k) => SHORT[k]).join(' ')) + c(90, '\n  legend: ● done  ◌ done elsewhere  ◐ stale  ! look  ✗ fail  ○ todo  · n/a'));
  let last = '';
  for (const e of B.episodes) {
    if (e.series !== last) { console.log('\n' + c(1, e.series)); last = e.series; }
    const dots = e.stages.map((s) => ' ' + ICON[s.state] + '  ').join('');
    const score = [e.scores.reel != null && `${e.scores.reel}/10`, e.scores.viral != null && `${e.scores.viral}`].filter(Boolean).join(' · ');
    const name = `${pad(e.tag, 5)} ${pad(e.id, 18)}${e.da >= 2 ? c(36, 'DA2') : c(90, 'DA1')}${e.hasRemaster ? c(90, '→v2') : '   '}`;
    console.log(` ${name} ${dots}${pad(c(35, score), 13)} ${e.next ? c(90, '→ ') + e.next.stage + c(90, ': ' + (e.next.cmd || e.next.note)) : c(32, '✓ live')}`);
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
    console.log(c(1, 'BACKLOG ') + c(90, `${B.backlog.length} topics not produced (npm run board -- --md lists them all)`));
    for (const sname of [...new Set(B.backlog.map((b) => b.series))]) console.log(`  ${pad(sname, 9)} ` + B.backlog.filter((b) => b.series === sname).slice(0, 3).map((b) => `${b.n} “${b.title}”`).join(c(90, ' · ')));
  }
}

function printOne(e) {
  console.log(c(1, `${e.series} ${e.tag} · ${e.title}`) + c(90, `  (${e.id} · DA ${e.da}${e.remasterOf ? ` · voice of ${e.remasterOf}` : ''})`));
  for (const s of e.stages) console.log(`  ${ICON[s.state]} ${pad(s.label, 11)} ${s.note}${s.cmd && s.state !== 'done' && s.state !== 'skip' ? c(90, `\n                ↳ ${s.cmd}`) : ''}`);
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
  const L = [`# Studio board`, '', `Generated by \`npm run board -- --md\` on ${B.generatedAt.slice(0, 10)}. ● done · ◌ done before, not in this checkout · ◐ stale · ! look · ✗ fail · ○ todo · · n/a`, '',
    `| Series | # | Episode | DA | ${STAGES.map((k) => LABEL[k]).join(' | ')} | Reel | Viral | Next |`, `|${'---|'.repeat(STAGES.length + 7)}`];
  for (const e of B.episodes) L.push(`| ${e.series} | ${e.tag} | \`${e.id}\` ${e.title} | ${e.da} | ${e.stages.map((s) => sym[s.state]).join(' | ')} | ${e.scores.reel ?? ''} | ${e.scores.viral ?? ''} | ${e.next ? `${e.next.stage}: \`${e.next.cmd || e.next.note}\`` : '✓'} |`);
  L.push('', '## Backlog', '', '| Series | # | Topic | Hook | Risk |', '|---|---|---|---|---|');
  for (const b of B.backlog) L.push(`| ${b.series} | ${b.n} | ${b.title} | ${b.hook} | ${b.risk} |`);
  return L.join('\n') + '\n';
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const B = board();
  const id = args.find((a) => !a.startsWith('--'));
  if (args.includes('--json')) console.log(JSON.stringify(id ? B.episodes.find((e) => e.id === id) ?? null : B, null, 1));
  else if (args.includes('--md')) { fs.writeFileSync(P('docs/BOARD.md'), markdown(B)); console.log('wrote docs/BOARD.md'); }
  else if (args.includes('--doctor')) for (const d of B.doctor) console.log(`${d.ok ? ICON.done : d.optional ? ICON.todo : ICON.fail} ${pad(d.name, 40)} ${d.ok ? '' : c(90, d.fix)}`);
  else if (id) { const e = B.episodes.find((x) => x.id === id || String(x.episode) === id); if (!e) { console.error(`no episode "${id}"`); process.exit(2); } printOne(e); }
  else printBoard(B);
}
