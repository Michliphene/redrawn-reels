#!/usr/bin/env node
// Contact sheet of an episode without rendering the video: one bundle, N stills, one sheet.
//   node scripts/stills.mjs <episodeId> [--times 0,2.5,10 | --n 8] [--da 2] [--scale 0.5] [--cols 4] [--props '{"cover":true}']
// Writes out/stills/<id>/f_<time>.jpg and out/stills/<id>/sheet.jpg. Use it before every full render.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition, openBrowser } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { compositionOf } from './validate.mjs';

const require = createRequire(import.meta.url);
const { episodeMedia, renderDirection } = require('../src/lib/media.ts');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const id = args[0];
if (!id || id.startsWith('--')) { console.error('usage: node scripts/stills.mjs <episodeId> [--times a,b,c | --n 8] [--da 2] [--scale 0.5]'); process.exit(2); }
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const epDir = path.join(ROOT, 'public/episodes', id);
const spec = JSON.parse(fs.readFileSync(path.join(epDir, 'episode.json'), 'utf8'));
const timings = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', episodeMedia(id, spec).timings), 'utf8'));
const FPS = 30, dur = timings.duration + 0.5;
const n = Number(opt('n', 8));
const times = opt('times') ? opt('times').split(',').map(Number) : Array.from({ length: n }, (_, i) => (i === 0 ? 0 : (dur - 0.3) * (i / (n - 1))));
const scale = Number(opt('scale', 0.5));
const extra = JSON.parse(opt('props', '{}'));
const da = args.includes('--da') ? Number(opt('da')) : extra.da ?? spec.da ?? 1;
if (extra.da !== undefined && extra.da !== da) throw new Error('--da and props.da must match');
renderDirection({ da, requireDa: extra.requireDa === undefined ? da : extra.requireDa }, spec.da, true);
const inputProps = { ...extra, episodeId: id, da, requireDa: da };
const composition = opt('comp', compositionOf(spec));
const outDir = path.join(ROOT, opt('out', `out/stills/${id}`));
fs.mkdirSync(outDir, { recursive: true });

const chrome = process.env.REMOTION_CHROME ?? (() => {
  const base = '/opt/pw-browsers';
  if (!fs.existsSync(base)) return undefined;
  const d = fs.readdirSync(base).find((x) => x.startsWith('chromium_headless_shell-'));
  return d ? path.join(base, d, 'chrome-headless-shell-linux64/chrome-headless-shell') : undefined;
})();
const chromiumOptions = { gl: process.env.REMOTION_GL ?? (process.platform === 'linux' ? 'swangle' : 'angle') };

const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'public'), onProgress: () => {} });
const files = [];
let browser;
try {
  browser = await openBrowser('chrome', { browserExecutable: chrome, chromiumOptions });
  const comp = await selectComposition({ serveUrl, id: composition, inputProps, puppeteerInstance: browser, chromiumOptions, browserExecutable: chrome });
  for (const t of times) {
    const frame = Math.min(comp.durationInFrames - 1, Math.max(0, Math.round(t * FPS)));
    const output = path.join(outDir, `f_${t.toFixed(2).padStart(6, '0')}.jpg`);
    await renderStill({ composition: comp, serveUrl, output, frame, inputProps, scale, imageFormat: 'jpeg', jpegQuality: 88, puppeteerInstance: browser, chromiumOptions, browserExecutable: chrome });
    files.push(output);
  }
} finally {
  try {
    await browser?.close({ silent: true });
  } finally {
    fs.rmSync(serveUrl, { recursive: true, force: true });
  }
}
const cols = Number(opt('cols', Math.min(files.length, 4)));
const rows = Math.ceil(files.length / cols);
const sheet = path.join(outDir, 'sheet.jpg');
const cell = (k, u) => (k === 0 ? '0' : Array(k).fill(u).join('+'));
const layout = files.map((_, i) => `${cell(i % cols, 'w0')}_${cell(Math.floor(i / cols), 'h0')}`).join('|');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...files.flatMap((f) => ['-i', f]), '-filter_complex',
  files.length === 1 ? '[0]copy' : `${files.map((_, i) => `[${i}]`).join('')}xstack=inputs=${files.length}:layout=${layout}:fill=black`,
  '-q:v', '3', sheet], { stdio: 'inherit' });
console.log(`${files.length} stills (${composition}, ${JSON.stringify(inputProps)}) in ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${path.relative(ROOT, sheet)} [${cols}x${rows}]`);
console.log(times.map((t) => t.toFixed(2)).join('  '));
