#!/usr/bin/env node
// Génère le dashboard Obsidian du pipeline REDRAWN à partir de l'état réel des fichiers.
// Rien n'est saisi à la main : l'état de chaque étape est DÉDUIT des fichiers présents.
//
// Usage :  node scripts/dashboard.mjs        (ou  npm run dashboard)
// Écrit :  docs/DASHBOARD.md            vue d'ensemble (tableau épisodes × étapes + backlog)
//          docs/dashboard/<id>.md       une note par épisode (input/output de chaque étape)
//          docs/PIPELINE.canvas         schéma du flux (Obsidian Canvas)
// Seul état manuel (optionnel) : public/episodes/<id>/publish.json
//          {"tiktok":"https://…","instagram":"https://…","shorts":"https://…","date":"2026-01-31"}
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (...a) => path.join(ROOT, ...a);
const exists = (rel) => fs.existsSync(P(rel));
const read = (rel) => (exists(rel) ? fs.readFileSync(P(rel), 'utf8') : '');
const json = (rel) => { try { return JSON.parse(read(rel)); } catch { return null; } };
const list = (rel) => (exists(rel) ? fs.readdirSync(P(rel)) : []);
const write = (rel, txt) => { fs.mkdirSync(path.dirname(P(rel)), { recursive: true }); fs.writeFileSync(P(rel), txt); };

const ICON = { ok: '✅', warn: '⚠️', todo: '⬜', na: '➖' };
let UP = '../';                                                        // préfixe relatif depuis la note en cours d'écriture
const md = (rel) => `[[${rel.replace(/\.md$/, '')}]]`;               // lien wiki Obsidian (notes .md)
const file = (rel) => `[${path.basename(rel) || rel}](${UP}${rel})`;   // lien relatif (json, wav, geojson, dossiers…)
const link = (rel) => (rel.endsWith('.md') ? md(rel) : /^[a-z]+ ?[/(]|^web|^flag-icons|[ ]/i.test(rel) && !exists(rel) ? rel : file(rel));
const links = (arr) => (arr.length ? arr.map(link).join('<br>') : '—');

// ── Backlog : table des sujets de docs/01_SERIES_AND_TOPICS.md ──────────────────────────────
function topics() {
  const txt = read('docs/01_SERIES_AND_TOPICS.md');
  const rows = [...txt.matchAll(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|/gm)]
    .map((m) => ({ n: +m[1], title: m[2].replace(/\*\*/g, ''), difficulty: m[5].replace(/\*\*/g, '') }));
  const order = (txt.match(/Recommended publishing order[^:]*:\s*([\d,\s]+)/i)?.[1] || '')
    .split(',').map((s) => +s.trim()).filter(Boolean);
  return { rows, order };
}
const TOPICS = topics();
const topicFor = (id) => {
  const key = id.split('-')[0].toLowerCase();
  return TOPICS.rows.find((t) => t.title.toLowerCase().includes(key));
};

// ── Analyse d'un épisode : 10 étapes avec leurs inputs/outputs ──────────────────────────────
function analyse(id) {
  const dir = `public/episodes/${id}`;
  const ep = json(`${dir}/episode.json`);
  const sources = read(`${dir}/SOURCES.md`);
  const timings = json(`${dir}/timings.json`);
  const topic = topicFor(id);
  const steps = [];
  const add = (name, state, detail, inputs, outputs) => steps.push({ name, state, detail, inputs, outputs });

  // 1 Sujet
  add('1 · Sujet', topic ? 'ok' : 'warn',
    topic ? `Sujet n°${topic.n} — difficulté données : ${topic.difficulty}` : 'Sujet introuvable dans la table des 20 sujets',
    ['docs/01_SERIES_AND_TOPICS.md'], [`${dir}/`]);

  // 2 Données carte
  const dataRel = ep?.data ? `public/${ep.data}` : '';
  const dataBase = ep?.data ? path.basename(ep.data, '.geojson') : '';
  const prep = list('scripts').filter((f) => /^prep-.*\.mjs$/.test(f) && dataBase && read(`scripts/${f}`).includes(dataBase));
  let nFeat = null;
  if (dataRel && exists(dataRel)) nFeat = json(dataRel)?.features?.length ?? null;
  add('2 · Données carte', dataRel && exists(dataRel) ? 'ok' : 'todo',
    dataRel && exists(dataRel) ? `${nFeat ?? '?'} entités${prep.length ? '' : ' · script prep introuvable'}` : 'geojson manquant',
    ['docs/02_DATA_SOURCES.md', ...prep.map((f) => `scripts/${f}`)], dataRel ? [dataRel] : []);

  // 3 Recherche & script
  const hasPinned = /pinned/i.test(sources);
  const hasFacts = /facts used|dates used|\| *claim *\|/i.test(sources);
  add('3 · Recherche & script', sources ? (hasPinned && hasFacts ? 'ok' : 'warn') : 'todo',
    sources ? `faits sourcés : ${hasFacts ? 'oui' : 'NON'} · commentaire épinglé : ${hasPinned ? 'oui' : 'NON'}` : 'SOURCES.md manquant',
    ['web / ouvrages de référence'], sources ? [`${dir}/SOURCES.md`] : []);

  // 4 Cue sheet
  const beats = ep?.beats?.length ?? 0;
  add('4 · Cue sheet', ep ? 'ok' : 'todo', ep ? `${beats} beats · épisode n°${ep.episode ?? '?'}` : 'episode.json manquant',
    [`${dir}/SOURCES.md`, dataRel].filter(Boolean), ep ? [`${dir}/episode.json`] : []);

  // 5 Assets référencés dans le cue sheet
  const raw = JSON.stringify(ep || {});
  const flags = [...new Set([...raw.matchAll(/"flag":"([^"]+)"/g)].map((m) => m[1]))];
  const portraits = [...new Set((ep?.beats ?? []).flatMap((b) => b.actions ?? [])
    .filter((a) => a.type === 'portrait' && a.key).map((a) => a.key))];
  const images = [...new Set([...raw.matchAll(/"src":"([^"]+)"/g)].map((m) => m[1]))];
  const missing = [
    ...flags.filter((f) => !exists(`public/assets/flags/${f}.svg`)).map((f) => `flag:${f}`),
    ...portraits.filter((k) => !exists(`public/assets/portraits/${k}.jpg`)).map((k) => `portrait:${k}`),
    ...images.filter((s) => !exists(`public/${s}`)).map((s) => `image:${s}`),
  ];
  const nAssets = flags.length + portraits.length + images.length;
  const credits = json('public/assets/portraits/credits.json') || {};
  const noCredit = portraits.filter((k) => exists(`public/assets/portraits/${k}.jpg`) && !credits[k]);
  add('5 · Assets', nAssets === 0 ? 'na' : missing.length || noCredit.length ? 'warn' : 'ok',
    nAssets === 0 ? 'aucun asset référencé'
      : `${flags.length} drapeaux · ${portraits.length} portraits · ${images.length} images`
        + (missing.length ? ` · MANQUANTS : ${missing.join(', ')}` : '')
        + (noCredit.length ? ` · sans crédit : ${noCredit.join(', ')}` : ''),
    ['flag-icons / Commons / Library of Congress', `${dir}/episode.json`],
    [...flags.filter((f) => !missing.includes(`flag:${f}`)).map((f) => `public/assets/flags/${f}.svg`),
      ...portraits.filter((k) => exists(`public/assets/portraits/${k}.jpg`)).map((k) => `public/assets/portraits/${k}.jpg`),
      ...images.filter((s) => exists(`public/${s}`)).map((s) => `public/${s}`)].slice(0, 5)
      .concat(['public/assets/portraits/credits.json']));

  // 6 Voix & musique
  const dur = timings?.duration;
  const hasVoice = exists(`${dir}/voice.wav`) && timings;
  const outOfRange = dur && (dur < 45 || dur > 58);
  add('6 · Voix & musique', hasVoice && exists(`${dir}/music.wav`) ? (outOfRange ? 'warn' : 'ok') : hasVoice ? 'warn' : 'todo',
    hasVoice ? `voix ${dur?.toFixed(1)} s${outOfRange ? ' (cible 45–58 s)' : ''} · moteur ${timings.engine ?? '?'} · musique ${exists(`${dir}/music.wav`) ? 'oui' : 'NON'}` : 'voix non générée',
    [`${dir}/episode.json`, 'pipeline/tts.py', 'pipeline/music.sh'],
    ['voice.wav', 'timings.json', 'music.wav'].filter((f) => exists(`${dir}/${f}`)).map((f) => `${dir}/${f}`));

  // 7 Rendu (out/ est ignoré par git → inférence si un review existe)
  const mp4 = `out/${id}.mp4`;
  const reviews = [...list('docs').filter((f) => f === `REVIEW_${id}.md`).map((f) => `docs/${f}`),
    ...list('docs/review').filter((f) => f.startsWith(`${id}-`)).map((f) => `docs/review/${f}`)].sort();
  const mp4Here = exists(mp4);
  const inferred = !mp4Here && reviews.length > 0;
  add('7 · Rendu', mp4Here || inferred ? 'ok' : 'todo',
    mp4Here ? `${(fs.statSync(P(mp4)).size / 1e6).toFixed(1)} Mo` : inferred ? 'mp4 absent de ce clone (out/ non commité) — déduit des reviews' : 'pas encore rendu',
    [`${dir}/voice.wav`, `${dir}/music.wav`, `${dir}/episode.json`, 'pipeline/render.sh'], mp4Here ? [mp4] : []);

  // 8 Review (accuracy + viralité)
  const passes = reviews.filter((r) => r.includes('/review/') && !r.includes('virality'));
  const viral = reviews.filter((r) => r.includes('virality'));
  const main = reviews.find((r) => r === `docs/REVIEW_${id}.md`);
  let score = null;
  const lastViral = viral[viral.length - 1];
  if (lastViral) {
    const t = read(lastViral);
    score = t.match(/(\d{2,3})\s*\/\s*100/)?.[1] ?? null;
  }
  add('8 · Review', main ? (viral.length ? 'ok' : 'warn') : reviews.length ? 'warn' : 'todo',
    reviews.length ? `reviewer ×${passes.length} · virality ×${viral.length}${score ? ` · dernier score ${score}/100` : ''}${main ? '' : ' · REVIEW_<id>.md manquant'}` : 'aucune review',
    [mp4, 'docs/VIRALITY_PLAYBOOK.md'], [main, ...passes.slice(-1), lastViral].filter(Boolean));

  // 9 Kit de publication
  const kit = ['POSTING.md', 'cover_9x16.png', 'cover_3x4.jpg'].filter((f) => exists(`deliverables/${id}/${f}`));
  add('9 · Kit de post', kit.length === 3 ? 'ok' : kit.length ? 'warn' : 'todo',
    kit.length ? `${kit.length}/3 fichiers` : 'aucun kit',
    [`${dir}/SOURCES.md`, 'docs/review/'], kit.map((f) => `deliverables/${id}/${f}`));

  // 10 Publication (seul état manuel)
  const pub = json(`${dir}/publish.json`);
  const platforms = pub ? ['tiktok', 'instagram', 'shorts'].filter((k) => pub[k]) : [];
  add('10 · Publié', platforms.length ? 'ok' : 'todo',
    platforms.length ? `${platforms.join(', ')}${pub.date ? ` · ${pub.date}` : ''}` : 'non publié (créer publish.json après le post)',
    [mp4, `deliverables/${id}/POSTING.md`], pub ? [`${dir}/publish.json`] : []);

  const done = steps.filter((s) => s.state === 'ok' || s.state === 'na').length;
  const next = steps.find((s) => s.state === 'todo' || s.state === 'warn');
  return { id, ep, steps, done, total: steps.length, next, score, dur, pub, topic };
}

// ── Rendu Markdown ──────────────────────────────────────────────────────────────────────────
const now = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
const ids = list('public/episodes').filter((d) => exists(`public/episodes/${d}/episode.json`) || exists(`public/episodes/${d}/SOURCES.md`)).sort();
const eps = ids.map(analyse).sort((a, b) => (a.ep?.episode ?? 99) - (b.ep?.episode ?? 99));

function episodeNote(e) {
  const title = e.ep?.title ?? e.id;
  const fm = ['---', `episode: ${e.ep?.episode ?? ''}`, `id: ${e.id}`, `title: "${title}"`, `progress: ${e.done}/${e.total}`,
    `status: ${e.done === e.total ? 'published' : e.next ? 'next:' + e.next.name.replace(/^\d+ · /, '').replace(/\s+/g, '_') : 'unknown'}`,
    e.dur ? `duration_s: ${e.dur.toFixed(1)}` : null, e.score ? `virality_score: ${e.score}` : null, `generated: ${now}`, '---']
    .filter(Boolean).join('\n');
  const rows = e.steps.map((s) =>
    `| ${s.name} | ${ICON[s.state]} | ${s.detail} | ${links(s.inputs)} | ${links(s.outputs)} |`).join('\n');
  return `${fm}

# EP ${e.ep?.episode ?? '?'} — ${title}

← [[DASHBOARD]] · [[PIPELINE.canvas|Schéma du pipeline]]

**Avancement : ${e.done}/${e.total}**${e.next ? ` · prochaine action : **${e.next.name}** — ${e.next.detail}` : ' · tout est fait 🎉'}

| Étape | État | Détail | Input | Output |
|---|---|---|---|---|
${rows}

> Note générée par \`scripts/dashboard.mjs\` — ne pas éditer à la main (écrasée à chaque run).
`;
}

function dashboard() {
  const head = '| EP | Titre | ' + (eps[0]?.steps ?? []).map((s) => s.name.split(' · ')[0]).join(' | ') + ' | Avancement | Prochaine action |';
  const sep = '|' + '---|'.repeat(4 + (eps[0]?.steps.length ?? 10));
  const body = eps.map((e) =>
    `| ${e.ep?.episode ?? '?'} | [[docs/dashboard/${e.id}\\|${e.ep?.title ?? e.id}]] | ${e.steps.map((s) => ICON[s.state]).join(' | ')} | ${e.done}/${e.total} | ${e.next ? `**${e.next.name.replace(/^\d+ · /, '')}**` : '—'} |`).join('\n');

  const legend = (eps[0]?.steps ?? []).map((s) => `- **${s.name.split(' · ')[0]}** ${s.name.split(' · ')[1]}`).join('\n');
  const alerts = eps.flatMap((e) => e.steps.filter((s) => s.state === 'warn').map((s) => `- EP ${e.ep?.episode ?? e.id} · ${s.name} — ${s.detail}`));

  const producedNums = new Set(eps.map((e) => e.topic?.n).filter(Boolean));
  const queue = TOPICS.order.filter((n) => !producedNums.has(n)).map((n) => TOPICS.rows.find((t) => t.n === n)).filter(Boolean);
  const backlog = queue.map((t, i) => `${i + 1}. **#${t.n}** ${t.title} — _${t.difficulty}_`).join('\n');

  return `---
cssclasses: [dashboard]
generated: ${now}
---

# 🗺️ REDRAWN — Dashboard

_Généré le ${now} par \`node scripts/dashboard.mjs\` · les états sont déduits des fichiers du repo._
Schéma du flux : [[PIPELINE.canvas|Pipeline (canvas)]] · Règles : [[CLAUDE]] · Bible : [[docs/01_SERIES_AND_TOPICS|Série & sujets]]

## Épisodes × étapes

${head}
${sep}
${body}

✅ fait · ⚠️ à vérifier · ⬜ à faire · ➖ sans objet — clique sur un titre pour voir l'input/output de chaque étape.

${legend}

## ⚠️ À regarder
${alerts.length ? alerts.join('\n') : '_Rien à signaler._'}

## 📋 Prochains sujets (ordre de publication recommandé)
${backlog || '_Backlog vide._'}

## Rafraîchir
\`\`\`bash
node scripts/dashboard.mjs   # ou : npm run dashboard
\`\`\`
Après un post, créer \`public/episodes/<id>/publish.json\` (\`{"tiktok":"…","instagram":"…","date":"AAAA-MM-JJ"}\`) pour passer l'étape 10 à ✅.
`;
}

// ── Canvas Obsidian : le flux avec ses I/O ─────────────────────────────────────────────────
function canvas() {
  const defs = [
    ['Sujet', 'IN docs/01_SERIES_AND_TOPICS.md\nOUT id d\'épisode'],
    ['Données carte', 'IN scripts/prep-<id>.mjs + Natural Earth\nOUT public/data/<id>.geojson'],
    ['Recherche & script', 'IN web, sources de référence\nOUT SOURCES.md (script, faits, commentaire épinglé)'],
    ['Cue sheet', 'IN SOURCES.md + geojson\nOUT episode.json'],
    ['Assets', 'IN Commons / LoC / flag-icons\nOUT assets/flags, portraits, credits.json'],
    ['Voix & musique', 'IN episode.json (say)\nOUT voice.wav, timings.json, music.wav\n(pipeline/tts.py, music.sh)'],
    ['Rendu', 'IN voix + musique + cue sheet\nOUT out/<id>.mp4 (−14 LUFS)\n(pipeline/render.sh)'],
    ['Review', 'IN mp4 + frames\nOUT REVIEW_<id>.md, passes reviewer + virality\n(/100)'],
    ['Kit de post', 'IN SOURCES.md + reviews\nOUT POSTING.md, covers 9:16 et 3:4'],
    ['Publié', 'IN mp4 + kit\nOUT TikTok / Instagram / Shorts\npublish.json'],
  ];
  const W = 340, H = 170, GAP = 80, perRow = 5;
  const nodes = defs.map(([t, body], i) => ({
    id: `s${i + 1}`, type: 'text', text: `## ${i + 1} · ${t}\n${body}`,
    x: (i % perRow) * (W + GAP), y: Math.floor(i / perRow) * (H + 160), width: W, height: H,
    color: String([1, 4, 5, 6, 3][Math.floor(i / 2) % 5]),
  }));
  nodes.push({ id: 'home', type: 'file', file: 'docs/DASHBOARD.md', x: 0, y: -260, width: 520, height: 200 });
  const edges = defs.slice(1).map((_, i) => {
    const sameRow = Math.floor(i / perRow) === Math.floor((i + 1) / perRow);
    return { id: `e${i + 1}`, fromNode: `s${i + 1}`, toNode: `s${i + 2}`,
      fromSide: sameRow ? 'right' : 'bottom', toSide: sameRow ? 'left' : 'top', toEnd: 'arrow' };
  });
  return JSON.stringify({ nodes, edges }, null, 2) + '\n';
}

write('docs/DASHBOARD.md', dashboard());
UP = '../../';
for (const e of eps) write(`docs/dashboard/${e.id}.md`, episodeNote(e));
UP = '../';
write('docs/PIPELINE.canvas', canvas());

console.log(`dashboard: ${eps.length} épisode(s)`);
for (const e of eps) console.log(`  EP ${e.ep?.episode ?? '?'} ${e.id.padEnd(16)} ${e.done}/${e.total}  ${e.steps.map((s) => ICON[s.state]).join('')}  ${e.next ? '→ ' + e.next.name : ''}`);
console.log('→ docs/DASHBOARD.md · docs/dashboard/*.md · docs/PIPELINE.canvas');
