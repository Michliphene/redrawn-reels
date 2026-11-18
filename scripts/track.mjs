#!/usr/bin/env node
// Posting log + performance numbers, one file for the whole studio: tracker/posts.json (committed).
// Nothing here talks to a platform: you (or Claude, on your word) write down what was posted and the numbers.
//   npm run track -- posted <id|EP n> <platform> [--url <url>] [--date YYYY-MM-DD] [--title "…"] [--cover <file>]
//   npm run track -- stats  <id|EP n> <platform> views=12000 likes=800 comments=40 shares=60 saves=120 follows=25
//                                   [avg=21.4 (avg watch s)] [retention=63 (% watched)] [--at YYYY-MM-DD]
//   npm run track -- unpost <id> <platform>            remove a post entered by mistake
//   npm run track -- list                              every post, latest numbers, rates
// platform: tiktok (tt) · instagram (ig, reels) · youtube (yt, shorts) · any other name is kept as typed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'tracker/posts.json');
const ALIAS = { tt: 'tiktok', tiktok: 'tiktok', ig: 'instagram', insta: 'instagram', instagram: 'instagram', reels: 'instagram', yt: 'youtube', youtube: 'youtube', shorts: 'youtube' };
const METRICS = ['views', 'likes', 'comments', 'shares', 'saves', 'follows', 'avg', 'retention'];
const today = () => new Date().toISOString().slice(0, 10);

const load = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return { _: 'Posting log. Edit with `npm run track` (see scripts/track.mjs). One entry per episode id and platform; stats are dated snapshots, newest last.', posts: {} }; } };
const save = (db) => { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(db, null, 1) + '\n'); };

function resolve(arg) {
  const eps = fs.readdirSync(path.join(ROOT, 'public/episodes')).filter((d) => fs.existsSync(path.join(ROOT, 'public/episodes', d, 'episode.json')));
  if (eps.includes(arg)) return arg;
  const n = arg.replace(/^(ep|#)\s*/i, '');
  if (/^\d+$/.test(n)) {
    const hits = eps.filter((d) => JSON.parse(fs.readFileSync(path.join(ROOT, 'public/episodes', d, 'episode.json'), 'utf8')).episode === +n);
    if (hits.length === 1) return hits[0];
    die(hits.length ? `episode ${n} is ambiguous: ${hits.join(' · ')} — use the id` : `no episode ${n}`);
  }
  die(`no episode "${arg}" in public/episodes`);
}
function die(m) { console.error('!! ' + m); process.exit(2); }
const flag = (args, name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const plat = (p) => (p ? ALIAS[p.toLowerCase()] ?? p.toLowerCase() : die('platform missing (tiktok, instagram, youtube)'));
const fmt = (n) => (n == null ? '–' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n));
const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) + '%' : '–');

export function rates(s) {
  const v = +s.views || 0;
  return { engagement: v ? ((+s.likes || 0) + (+s.comments || 0) + (+s.shares || 0) + (+s.saves || 0)) / v : null, shareRate: v ? (+s.shares || 0) / v : null, saveRate: v ? (+s.saves || 0) / v : null, followRate: v ? (+s.follows || 0) / v : null };
}

const [cmd, ...rest] = process.argv.slice(2);
const db = load();
db.posts ??= {};

if (cmd === 'posted') {
  const id = resolve(rest[0] ?? die('episode missing')), p = plat(rest[1]);
  const prev = db.posts[id]?.[p];
  db.posts[id] = { ...(db.posts[id] ?? {}), [p]: { ...(prev ?? { stats: [] }), date: flag(rest, 'date') ?? prev?.date ?? today(), url: flag(rest, 'url') ?? prev?.url ?? null, ...(flag(rest, 'title') ? { title: flag(rest, 'title') } : {}), ...(flag(rest, 'cover') ? { cover: flag(rest, 'cover') } : {}) } };
  save(db); console.log(`${prev ? 'updated' : 'logged'}: ${id} on ${p} (${db.posts[id][p].date})`);
} else if (cmd === 'stats') {
  const id = resolve(rest[0] ?? die('episode missing')), p = plat(rest[1]);
  const post = db.posts[id]?.[p] ?? die(`${id} is not logged on ${p}: npm run track -- posted ${id} ${p} --url …`);
  const snap = { at: flag(rest, 'at') ?? today() };
  for (const kv of rest.slice(2)) {
    const m = kv.match(/^(\w+)=([\d.,]+)([kKmM]?)$/); if (!m) continue;
    if (!METRICS.includes(m[1])) die(`unknown metric "${m[1]}" (${METRICS.join(', ')})`);
    snap[m[1]] = Math.round(parseFloat(m[2].replace(',', '.')) * ({ k: 1e3, m: 1e6 }[m[3].toLowerCase()] ?? 1) * 100) / 100;
  }
  if (Object.keys(snap).length === 1) die('no metric given (views=… likes=… …)');
  const i = post.stats.findIndex((s) => s.at === snap.at);
  if (i >= 0) post.stats[i] = { ...post.stats[i], ...snap }; else post.stats.push(snap);
  post.stats.sort((a, b) => a.at.localeCompare(b.at));
  save(db);
  const r = rates(post.stats.at(-1));
  console.log(`${id} · ${p} · ${snap.at}: ${fmt(snap.views)} views · engagement ${pct(r.engagement ?? 0, 1)} · shares ${pct(r.shareRate ?? 0, 1)} · saves ${pct(r.saveRate ?? 0, 1)}`);
} else if (cmd === 'unpost') {
  const id = resolve(rest[0] ?? die('episode missing')), p = plat(rest[1]);
  if (!db.posts[id]?.[p]) die(`${id} is not logged on ${p}`);
  delete db.posts[id][p]; if (!Object.keys(db.posts[id]).length) delete db.posts[id];
  save(db); console.log(`removed ${id} on ${p}`);
} else if (cmd === 'list' || !cmd) {
  const rows = Object.entries(db.posts).flatMap(([id, ps]) => Object.entries(ps).map(([p, post]) => ({ id, p, post, s: post.stats?.at(-1) ?? {} })));
  if (!rows.length) { console.log('nothing logged yet: npm run track -- posted <id> <platform> --url <url>'); process.exit(0); }
  console.log('episode               platform    posted       views    eng    share   save   follow  last stats');
  for (const { id, p, post, s } of rows.sort((a, b) => (+b.s.views || 0) - (+a.s.views || 0))) {
    const r = rates(s);
    console.log(`${id.padEnd(21)} ${p.padEnd(11)} ${String(post.date ?? '?').padEnd(12)} ${fmt(s.views).padStart(6)}  ${pct(r.engagement ?? 0, 1).padStart(6)}  ${pct(r.shareRate ?? 0, 1).padStart(6)} ${pct(r.saveRate ?? 0, 1).padStart(6)} ${pct(r.followRate ?? 0, 1).padStart(6)}  ${s.at ?? '–'}`);
  }
} else die(`unknown command "${cmd}" (posted, stats, unpost, list)`);
