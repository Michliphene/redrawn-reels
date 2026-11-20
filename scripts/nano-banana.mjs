#!/usr/bin/env node
// Nano Banana (Google Gemini image models) plates for an episode — direct Gemini API, no third-party platform.
//   node scripts/nano-banana.mjs <episodeId> [--only key1,key2] [--force] [--model gemini-3-pro-image] [--dry]
// Reads public/episodes/<id>/plates.json:
//   { "model": "...", "aspect": "3:4", "style": "shared art-direction prompt",
//     "plates": [ { "key": "kyphi", "prompt": "...", "ref": "assets/...jpg" (optional reference image), "aspect": "9:16" } ] }
// Writes public/assets/ai/<id>/<key>.png and plates.log.json (model, prompt, date, provenance).
// Provenance is production metadata, never an automatic visual badge (docs/STUDIO.md §9).
// Key: GEMINI_API_KEY in the environment or in .env (never committed). Existing plates are kept unless --force.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const args = process.argv.slice(2);
const id = args[0];
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(`--${k}`);
if (!id || id.startsWith('--')) { console.error('usage: node scripts/nano-banana.mjs <episodeId> [--only a,b] [--force] [--model id] [--dry]'); process.exit(2); }

const env = (k) => {
  if (process.env[k]) return process.env[k];
  const f = path.join(ROOT, '.env');
  if (!fs.existsSync(f)) return undefined;
  const m = fs.readFileSync(f, 'utf8').match(new RegExp(`^${k}\\s*=\\s*"?([^"\\r\\n]+)"?`, 'm'));
  return m?.[1];
};

const specPath = path.join(ROOT, 'public/episodes', id, 'plates.json');
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
// Model ids (Gemini API, Nov 2026): gemini-3-pro-image = Nano Banana Pro (best for glass, labels, light),
// gemini-3.1-flash-image = Nano Banana 2 (faster, cheaper), gemini-3.1-flash-lite-image = Nano Banana 2 Lite.
const model = opt('model', spec.model ?? 'gemini-3-pro-image');
const only = opt('only')?.split(',');
const outDir = path.join(ROOT, 'public/assets/ai', id);
fs.mkdirSync(outDir, { recursive: true });
const logPath = path.join(outDir, 'plates.log.json');
const log = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, 'utf8')) : {};

const key = env('GEMINI_API_KEY');
if (!key && !flag('dry')) {
  console.error('GEMINI_API_KEY is not set. Create a key at https://aistudio.google.com/apikey and add a line\n  GEMINI_API_KEY=...\nto .env (it is git-ignored), then run again. --dry prints the prompts without calling the API.');
  process.exit(1);
}

const mime = (f) => (f.endsWith('.png') ? 'image/png' : f.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
let made = 0, kept = 0;
for (const p of spec.plates) {
  if (only && !only.includes(p.key)) continue;
  const out = path.join(outDir, `${p.key}.png`);
  if (fs.existsSync(out) && !flag('force')) { kept++; continue; }
  const prompt = [spec.style, p.prompt].filter(Boolean).join('\n\n');
  const parts = [{ text: prompt }];
  if (p.ref) {
    const ref = path.join(ROOT, 'public', p.ref);
    parts.push({ inline_data: { mime_type: mime(ref), data: fs.readFileSync(ref).toString('base64') } });
  }
  if (flag('dry')) { console.log(`--- ${p.key} (${model}, ${p.aspect ?? spec.aspect ?? '3:4'})\n${prompt}\n`); continue; }
  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: p.aspect ?? spec.aspect ?? '3:4' } },
  };
  const t0 = Date.now();
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body),
  });
  if (!res.ok) { console.error(`✗ ${p.key}: HTTP ${res.status} ${(await res.text()).slice(0, 400)}`); process.exitCode = 1; continue; }
  const json = await res.json();
  const img = json.candidates?.[0]?.content?.parts?.find((x) => x.inlineData || x.inline_data);
  const data = img?.inlineData?.data ?? img?.inline_data?.data;
  if (!data) { console.error(`✗ ${p.key}: no image in the answer (${json.candidates?.[0]?.finishReason ?? 'no candidate'})`); process.exitCode = 1; continue; }
  fs.writeFileSync(out, Buffer.from(data, 'base64'));
  log[p.key] = { model, prompt, ref: p.ref ?? null, date: new Date().toISOString(), provenance: 'synthetic illustration' };
  fs.writeFileSync(logPath, JSON.stringify(log, null, 1));
  made++;
  console.log(`✓ ${p.key} → ${path.relative(ROOT, out)} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}
if (!flag('dry')) console.log(`${made} plate(s) made, ${kept} kept (use --force to remake), model ${model}`);
