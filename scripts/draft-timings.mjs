#!/usr/bin/env node
// Estimated word timings for an episode that has no voice yet, so stills can be made from a script draft
// without spending voice credits.  node scripts/draft-timings.mjs <episodeId>
// The file is marked "engine": "draft-estimate" and there is no voice.wav, so pipeline/tts.py always records
// the real voice over it at render time (its skip rule needs both timings.json and voice.wav).
import fs from 'node:fs';
import path from 'node:path';
import { displayWords } from './validate.mjs';

const id = process.argv[2];
if (!id) { console.error('usage: node scripts/draft-timings.mjs <episodeId>'); process.exit(2); }
const dir = path.join('public/episodes', id);
const spec = JSON.parse(fs.readFileSync(path.join(dir, 'episode.json'), 'utf8'));
if (fs.existsSync(path.join(dir, 'voice.wav'))) { console.error('this episode has a recorded voice: refusing to overwrite its timings'); process.exit(1); }
// Brian at speed 1.12 measured on published episodes: ~0.33 s per short word, longer words scale with letters
const WORD = (w) => 0.16 + 0.035 * w.replace(/[^\p{L}\p{N}]/gu, '').length;
const PUNCT = (w) => (/[.!?:]$/.test(w) ? 0.28 : /[,;]$/.test(w) ? 0.14 : 0.04);
let t = 0.25;
const beats = spec.beats.map((b) => {
  const words = displayWords(b.say).map((w) => {
    const spoken = /\d/.test(w) ? 0.55 : WORD(w);
    const o = { w, start: +t.toFixed(3), end: +(t + spoken).toFixed(3) };
    t += spoken + PUNCT(w);
    return o;
  });
  const out = { id: b.id, start: words[0].start, end: words.at(-1).end, words };
  t += 0.28;
  return out;
});
const duration = +(t + 0.2).toFixed(3);
fs.writeFileSync(path.join(dir, 'timings.json'), JSON.stringify({ duration, engine: 'draft-estimate', beats }, null, 1));
console.log(`${id}: draft timings, ${duration}s, ${beats.length} beats (no voice recorded)`);
