#!/usr/bin/env node
// Render only the requested interval, with existing audio. No TTS, downloads or publication.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { renderMedia } from '@remotion/renderer';
import { openRenderSession, ROOT, readEpisode } from './render-session.mjs';
import { validate } from './validate.mjs';

const args = process.argv.slice(2), id = args[0];
const opt = (k, d) => args.includes(`--${k}`) ? args[args.indexOf(`--${k}`) + 1] : d;
try {
  readEpisode(id ?? '');
  const from = Number(opt('from', 0)), seconds = Number(opt('seconds', 8)), scale = Number(opt('scale', 0.5));
  if (!Number.isFinite(from) || from < 0 || !Number.isFinite(seconds) || seconds <= 0 || seconds > 75 || !Number.isFinite(scale) || scale <= 0 || scale > 1) throw new Error('from >= 0; seconds > 0 and <= 75; scale > 0 and <= 1');
  const check = validate(id);
  if (check.errors.length) throw new Error(check.errors.join('\n'));
  check.warnings.forEach((w) => console.warn('! ' + w));
  const extra = JSON.parse(opt('props', '{}'));
  const start = performance.now(), s = await openRenderSession(id, extra);
  try {
    const first = Math.round(from * s.comp.fps), last = Math.min(s.comp.durationInFrames - 1, first + Math.round(seconds * s.comp.fps) - 1);
    if (first > last) throw new Error('Excerpt starts after the end of this episode');
    const output = path.resolve(ROOT, opt('out', `out/previews/${id}-${first}-${last}.mp4`));
    if (!output.startsWith(path.join(ROOT, 'out') + path.sep)) throw new Error('Preview output must stay in out/');
    fs.mkdirSync(path.dirname(output), { recursive: true });
    const raw = output.replace(/\.mp4$/, '.raw.mp4');
    if (raw === output) throw new Error('Preview output must end in .mp4');
    await renderMedia({ ...s.options, composition: s.comp, outputLocation: raw, frameRange: [first, last],
      codec: 'h264', crf: 20, scale, concurrency: 2, logLevel: 'error' });
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', output]);
    fs.unlinkSync(raw);
    const metrics = { ...s.metrics, episode: id, first, last, frames: last - first + 1, scale,
      elapsedSeconds: +(performance.now() / 1000 - start / 1000).toFixed(2), output };
    fs.writeFileSync(output + '.json', JSON.stringify(metrics, null, 2));
    console.log(JSON.stringify(metrics, null, 2));
  } finally { await s.close(); }
} catch (e) { console.error(e.message); process.exitCode = 1; }
