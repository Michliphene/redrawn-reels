// Shared local preview session: one content-addressed JS bundle, live public assets, one browser.
// No remote dependency and no stale asset cache: public/ is served locally, never copied into the cache.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { openBrowser, selectComposition } from '@remotion/renderer';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, 'out/.preview-cache');
const filesIn = (dir) => fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
  .flatMap((e) => e.isDirectory() ? filesIn(path.join(dir, e.name)) : [path.join(dir, e.name)]);

// Serve the bundle and live assets on loopback. Byte ranges are required for audio seeking.
async function serveLocal(bundleDir) {
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
  const server = http.createServer((req, res) => {
    try {
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
      const url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const asset = url.startsWith('/public/');
      const base = asset ? path.join(ROOT, 'public') : bundleDir;
      const file = path.resolve(base, asset ? url.slice(8) : url === '/' ? 'index.html' : url.slice(1));
      if (!file.startsWith(base + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
      const size = fs.statSync(file).size;
      let start = 0, end = size - 1, status = 200;
      if (req.headers.range) {
        const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (!m || (!m[1] && !m[2])) { res.writeHead(416).end(); return; }
        start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
        end = m[1] && m[2] ? Math.min(size - 1, Number(m[2])) : size - 1;
        if (start > end || start >= size) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
        status = 206; res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
      }
      res.writeHead(status, { 'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream', 'Content-Length': Math.max(0, end - start + 1), 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
      if (req.method === 'HEAD' || size === 0) res.end();
      else fs.createReadStream(file, { start, end }).on('error', () => res.destroy()).pipe(res);
    } catch { if (!res.headersSent) res.writeHead(400); res.end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }) };
}
export function bundleKey() {
  const h = crypto.createHash('sha256').update('local-preview-v1');
  for (const p of [...filesIn(path.join(ROOT, 'src')), ...['package-lock.json', 'tsconfig.json', 'public/studio.json', 'scripts/render-session.mjs'].map((p) => path.join(ROOT, p))]) {
    h.update(path.relative(ROOT, p)).update(fs.readFileSync(p));
  }
  return h.digest('hex').slice(0, 20);
}

export function readEpisode(id) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error('Invalid episode id');
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'public/episodes', id, 'episode.json'), 'utf8'));
}

export async function openRenderSession(id, extra = {}, compositionOverride) {
  const started = performance.now();
  const spec = readEpisode(id);
  fs.mkdirSync(CACHE, { recursive: true });
  // Webpack rejects the ! in the app sandbox's default temp path on Windows.
  const tmp = path.join(CACHE, 'tmp'); fs.mkdirSync(tmp, { recursive: true });
  process.env.TMP = tmp; process.env.TEMP = tmp; process.env.TMPDIR = tmp;
  const key = bundleKey();
  const serveUrl = path.join(CACHE, key);
  if (path.dirname(serveUrl) !== CACHE) throw new Error('Cache must stay inside out/.preview-cache');
  const marker = path.join(serveUrl, '.ready');
  const cached = fs.existsSync(marker);
  if (!cached) {
    const empty = path.join(CACHE, 'empty-public'); fs.mkdirSync(empty, { recursive: true });
    await bundle({ entryPoint: path.join(ROOT, 'src/index.ts'), outDir: serveUrl, publicDir: empty, onProgress: () => {} });
    fs.writeFileSync(marker, key);
  }
  const bundleMs = performance.now() - started;
  const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/studio.json'), 'utf8')).series;
  const composition = compositionOverride ?? spec.composition ?? registry[spec.seriesId]?.composition ?? 'Episode';
  const chromiumOptions = { gl: process.env.REMOTION_GL ?? (process.platform === 'linux' ? 'swangle' : 'angle') };
  const browserExecutable = process.env.REMOTION_CHROME;
  const inputProps = { requireWebgl: true, ...extra, episodeId: id };
  const server = await serveLocal(serveUrl);
  let browser;
  try {
    browser = await openBrowser('chrome', { browserExecutable, chromiumOptions });
    const comp = await selectComposition({ serveUrl: server.url, id: composition, inputProps, puppeteerInstance: browser, chromiumOptions, browserExecutable });
    return { spec, comp, inputProps, options: { serveUrl: server.url, inputProps, puppeteerInstance: browser, chromiumOptions, browserExecutable },
      metrics: { bundleKey: key, cached, bundleMs: Math.round(bundleMs), gl: chromiumOptions.gl, copiedAssetBytes: 0 },
      close: async () => { try { await browser.close({ silent: true }); } finally { await server.close(); } } };
  } catch (e) { try { await browser?.close({ silent: true }); } finally { await server.close(); } throw e; }
}
