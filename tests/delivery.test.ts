import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const cli = path.resolve('scripts/delivery.mjs');
const api = () => import('../scripts/delivery.mjs');
const technical = { width: 1080, height: 1920, fps: 30, duration: 42, videoCodec: 'h264', audioCodec: 'aac', lufs: -14, truePeak: -1.2 };

function fixture(t: Parameters<Parameters<typeof test>[1]>[0], id = 'alaska-1867') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'redrawn-delivery-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const put = (name: string, content: string | object) => {
    const target = path.join(root, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, typeof content === 'string' ? content : JSON.stringify(content));
  };
  const ep = `public/episodes/${id}`;
  const kitDir = `deliverables/${id}`;
  const videoPath = `out/${id}.mp4`;
  const manifestPath = `out/${id}.render.json`;
  const approvalPath = `${kitDir}/RELEASE.json`;
  put(`${ep}/episode.json`, { id, episode: 2, title: id, beats: [{ id: 'hook', say: 'Look here.' }] });
  put(`${ep}/SOURCES.md`, 'Facts to review');
  put(`${ep}/CLAIMS.json`, { claims: [
    { id: 'main-claim', claim: 'Fixture claim', unit: 'USD', period: '2025' },
  ] });
  put(`${ep}/voice.wav`, 'voice A');
  put(`${ep}/music.wav`, 'music A');
  put(`${ep}/timings.json`, { duration: 42 });
  put('public/studio.json', { series: {} });
  put('src/index.ts', 'render entry');
  put('package-lock.json', {});
  put(videoPath, 'render A');
  put(`${kitDir}/POST.md`, 'Text A');
  put(`${kitDir}/cover_9x16.png`, 'cover A');
  put('docs/technical.md', 'Technical notes for render A');
  put('docs/viral.md', 'Virality notes for render A');
  return { root, put, id, ep, kitDir, videoPath, manifestPath, approvalPath };
}

async function reviewed(t: Parameters<Parameters<typeof test>[1]>[0], id?: string) {
  const f = fixture(t, id);
  const d = await api();
  const snap = d.snapshot(f.root, f.id, { engine: 'remotion', effectiveDa: 1, composition: 'Episode' });
  const manifest = d.capture(f.root, f.id, snap, f.videoPath, () => technical);
  f.put(f.manifestPath, manifest);
  const packet = d.releasePacket(f.root, f.id, f.manifestPath);
  function evidence(kind: string) {
    const folder = `out/review/${f.id}/${packet.videoSha256}`;
    f.put(`${folder}/${kind}.jpg`, 'sample');
    f.put(`${folder}/${kind}_status.json`, {
      episodeId: f.id, kind, status: 'complete', timeline: { renderInputsVerified: true }, missingMeasurements: [],
      videoSha256: packet.videoSha256, renderSha256: packet.renderSha256, inputsSha256: manifest.inputsSha256,
      artifacts: [{ path: `${kind}.jpg`, sha256: d.artifact(f.root, `${folder}/${kind}.jpg`).sha256 }],
    });
    return d.artifact(f.root, `${folder}/${kind}_status.json`);
  }
  const reviews = [
    { kind: 'technical', renderSha256: packet.renderSha256, videoSha256: manifest.video.sha256, reviewer: 'Test 1', status: 'complete', openP1: [], report: d.artifact(f.root, 'docs/technical.md'), evidence: evidence('technical') },
    { kind: 'virality', renderSha256: packet.renderSha256, videoSha256: manifest.video.sha256, reviewer: 'Test 2', status: 'complete', openP1: [], report: d.artifact(f.root, 'docs/viral.md'), evidence: evidence('virality') },
  ];
  const approval = {
    ...packet, reviews, owner: {
      by: 'Fixture owner', at: '2026-11-18T12:00:00Z', videoSha256: packet.videoSha256, kitSha256: packet.kit.sha256, renderSha256: packet.renderSha256,
      listening: true, rights: true,
      sources: { status: 'approved', sha256: packet.sourcesSha256, inventorySha256: packet.claimsSha256, claims: [
        { id: 'main-claim', claim: 'Fixture claim', reference: 'Primary source, p. 4', unit: 'USD', period: '2025' },
      ] },
    },
  };
  f.put(f.approvalPath, approval);
  return { ...f, d, manifest, approval };
}

test('Alaska: a verified handoff returns the reviewed file and never replaces it', async (t) => {
  const f = await reviewed(t);
  const decision = f.d.deliveryStatus(f.root, f.id);
  assert.equal(decision.status, 'ready');
  assert.equal(decision.video.path, f.videoPath);
  const cliResult = spawnSync(process.execPath, [cli, 'verify', f.id], { cwd: f.root, encoding: 'utf8' });
  assert.equal(cliResult.status, 0, cliResult.stderr);
  assert.equal(fs.readFileSync(path.join(f.root, f.videoPath), 'utf8'), 'render A');
  f.put(f.videoPath, 'render B');
  const stale = spawnSync(process.execPath, [cli, 'verify', f.id], { cwd: f.root, encoding: 'utf8' });
  assert.equal(stale.status, 1);
  assert.match(stale.stderr, /video.*changed|video.*hash/i);
  assert.equal(fs.readFileSync(path.join(f.root, f.videoPath), 'utf8'), 'render B');
});

test('A changed recipe input blocks capture and invalidates an existing Alaska release', async (t) => {
  const f = await reviewed(t);
  const snap = f.d.snapshot(f.root, f.id, { engine: 'remotion', effectiveDa: 1, composition: 'Episode' });
  f.put(`${f.ep}/voice.wav`, 'voice B');
  assert.throws(() => f.d.capture(f.root, f.id, snap, f.videoPath, () => technical), /voice\.wav/);
  assert.match(f.d.deliveryStatus(f.root, f.id).reason, /voice\.wav/);
});

test('Delta: a pacing waiver cannot stand in for a primary-source visa', async (t) => {
  const f = await reviewed(t, 'delta-amex');
  f.approval.reviews[0].waivers = [{ code: 'hook-duration', reason: 'Figure on frame 0', at: 0, by: 'Reviewer' }];
  f.approval.owner.sources.status = 'pending';
  f.put(f.approvalPath, f.approval);
  assert.match(f.d.deliveryStatus(f.root, f.id).reason, /source.*approval/i);
  f.approval.owner.sources.status = 'approved';
  f.approval.owner.sources.claims[0].period = '';
  f.put(f.approvalPath, f.approval);
  assert.match(f.d.deliveryStatus(f.root, f.id).reason, /period/i);
});

test('A changed cover, edited review, or open P1 blocks delivery', async (t) => {
  const f = await reviewed(t);
  f.put(`${f.kitDir}/cover_9x16.png`, 'cover B');
  assert.match(f.d.deliveryStatus(f.root, f.id).reason, /kit.*changed/i);
  f.put(`${f.kitDir}/cover_9x16.png`, 'cover A');
  f.approval.reviews[0].openP1 = ['AK-1'];
  f.put(f.approvalPath, f.approval);
  assert.match(f.d.deliveryStatus(f.root, f.id).reason, /open P1/i);
  f.approval.reviews[0].openP1 = [];
  f.put(f.approvalPath, f.approval);
  f.put('docs/technical.md', 'Different report');
  assert.match(f.d.deliveryStatus(f.root, f.id).reason, /report.*changed/i);
});

test('A captured peak above the delivery profile remains blocked', async (t) => {
  const f = fixture(t);
  const d = await api();
  const snap = d.snapshot(f.root, f.id, { engine: 'remotion', effectiveDa: 1 });
  f.put(f.manifestPath, d.capture(f.root, f.id, snap, f.videoPath, () => ({ ...technical, truePeak: -0.88 })));
  assert.match(d.deliveryStatus(f.root, f.id).reason, /true peak/i);
});

test('Numerical requests refuse ambiguous episode numbers before reaching the filesystem gate', async (t) => {
  const f = fixture(t);
  f.put('public/episodes/other/episode.json', { id: 'other', episode: 2 });
  const result = spawnSync(process.execPath, [cli, 'verify', '2'], { cwd: f.root, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ambiguous.*alaska-1867.*other/i);
});

test('Posting kit uses the registry and keeps distinct platform copy when present', (t) => {
  const f = fixture(t, 'delta-amex');
  f.put(`${f.ep}/episode.json`, { id: f.id, seriesId: 'receipts', episode: 5, title: 'Delta' });
  f.put('public/studio.json', { series: { receipts: {
    name: 'RECEIPTS', composition: 'Money', episodeTag: '#{nnn}', tagline: 'Follow the money.',
  } } });
  f.put(`${f.kitDir}/POSTING.md`, '## TikTok description\nTikTok cut.\n## Instagram description\nInstagram cut.\n## Pinned comment\nSource link.');
  f.put('pipeline/posting_kit.py', fs.readFileSync('pipeline/posting_kit.py', 'utf8'));
  const python = process.env.STUDIO_PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3');
  const result = spawnSync(python, ['pipeline/posting_kit.py', f.id], { cwd: f.root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const kit = fs.readFileSync(path.join(f.root, f.kitDir, 'POST.md'), 'utf8');
  assert.match(kit, /RECEIPTS #005/);
  assert.match(kit, /\(TikTok\)\s+TikTok cut/);
  assert.match(kit, /\(Instagram\)\s+Instagram cut/);
  assert.match(kit, /RECEIPTS: Follow the money/);
});

test('A replaced image invalidates the evidence attached to an unchanged review', async (t) => {
  const f = await reviewed(t);
  f.put(`out/review/${f.id}/${f.manifest.video.sha256}/technical.jpg`, 'different sample');
  assert.match(f.d.deliveryStatus(f.root, f.id).reason, /technical evidence artifact.*changed/i);
});

test('Inspect reports the captured recipe identity independently of the delivery profile', async (t) => {
  const f = fixture(t);
  const d = await api();
  const snap = d.snapshot(f.root, f.id, { engine: 'remotion', effectiveDa: 1 });
  const manifest = d.capture(f.root, f.id, snap, f.videoPath, () => ({ ...technical, duration: 5 }));
  f.put(f.manifestPath, manifest);
  const result = spawnSync(process.execPath, [cli, 'inspect', f.id], { cwd: f.root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).inputsSha256, manifest.inputsSha256);
});

test('A new manifest for the same MP4 cannot reuse the old reviewer or owner sign-off', async (t) => {
  const f = await reviewed(t);
  f.put(f.manifestPath, { ...f.manifest, capturedAt: '2026-11-19T10:00:00Z' });
  const packet = f.d.releasePacket(f.root, f.id, f.manifestPath);
  const approval = { ...f.approval, ...packet };
  for (const review of approval.reviews) {
    const data = JSON.parse(fs.readFileSync(path.join(f.root, review.evidence.path), 'utf8'));
    f.put(review.evidence.path, { ...data, renderSha256: packet.renderSha256 });
    review.evidence = f.d.artifact(f.root, review.evidence.path);
  }
  f.put(f.approvalPath, approval);
  assert.match(f.d.deliveryStatus(f.root, f.id).reason, /stale technical review/i);
  for (const review of approval.reviews) review.renderSha256 = packet.renderSha256;
  f.put(f.approvalPath, approval);
  assert.match(f.d.deliveryStatus(f.root, f.id).reason, /owner approval/i);
});

test('Alaska: the source visa must cover the recorded claim ids and compare their units', async (t) => {
  const f = await reviewed(t);
  const sources = f.approval.owner.sources;
  sources.claims[0].id = 'unrelated';
  f.put(f.approvalPath, f.approval);
  assert.match(f.d.deliveryStatus(f.root, f.id).reason, /claim.*unrelated/i);
  sources.claims[0].id = 'main-claim';
  sources.claims[0].unit = 'cents';
  f.put(f.approvalPath, f.approval);
  assert.match(f.d.deliveryStatus(f.root, f.id).reason, /unit.*main-claim/i);
});
