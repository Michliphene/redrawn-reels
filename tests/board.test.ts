// The studio board reads the repo as it is: every episode gets every stage, and a next step or none.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
// @ts-expect-error plain ES module without types
import { board, STAGES } from '../scripts/board.mjs';

test('board: every episode has every stage, in pipeline order, with a known state', () => {
  const B = board();
  assert.ok(B.episodes.length > 0);
  for (const e of B.episodes) {
    assert.deepEqual(e.stages.map((s: { key: string }) => s.key), STAGES);
    for (const s of e.stages) assert.ok(['done', 'away', 'skip', 'todo', 'stale', 'warn', 'fail'].includes(s.state), `${e.id} ${s.key}: ${s.state}`);
    assert.ok(e.next === null || typeof e.next.stage === 'string');
  }
});

test('board: a remaster is tied to the episode whose voice it reuses', () => {
  const B = board();
  for (const e of B.episodes.filter((x: { remasterOf: string | null }) => x.remasterOf)) {
    assert.ok(B.episodes.some((o: { id: string; hasRemaster: boolean }) => o.id === e.remasterOf && o.hasRemaster), e.id);
  }
});

test('board: produced topics are not in the backlog', () => {
  const titles = board().backlog.map((b: { title: string }) => b.title.toLowerCase()).join(' | ');
  for (const made of ['alaska', 'korea', 'louisiana', 'netflix', "mcdonald"]) assert.ok(!titles.includes(made), made);
});

function checkout(t: import('node:test').TestContext) {
  const root = mkdtempSync(join(tmpdir(), 'studio-board-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (file: string, data: string) => {
    const dest = join(root, file);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, data);
  };
  for (const file of ['scripts/board.mjs', 'scripts/track.mjs', 'scripts/render-tools.mjs', 'scripts/validate.mjs', 'public/studio.json']) {
    const dest = join(root, file);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(new URL(`../${file}`, import.meta.url), dest);
  }
  cpSync(new URL('../src/lib', import.meta.url), join(root, 'src/lib'), { recursive: true });
  for (const id of ['test-reel', 'test-reel-v2']) {
    write(`public/episodes/${id}/episode.json`, JSON.stringify({ id, seriesId: 'receipts', episode: 2, title: id }));
  }
  write('docs/review/test-reel-pass1.md', 'Verdict: 10/10\nPostable: yes\n');
  for (const file of ['POST.md', 'POSTING.md', 'cover_3x4.jpg', 'cover_9x16.png']) write(`deliverables/test-reel/${file}`, 'legacy');
  const run = (script: string, ...args: string[]) => spawnSync(process.execPath, [`scripts/${script}.mjs`, ...args], { cwd: root, encoding: 'utf8' });
  const boardResult = (id: string, ...args: string[]) => {
    const result = run('board', id, '--json', ...args);
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  };
  return { root, write, run, boardResult };
}

test('board: legacy review and POST.md leave approval as a dash', (t) => {
  const { root, write, run, boardResult } = checkout(t);
  write('deliverables/test-reel/RELEASE.json', '{}');
  write('out/test-reel-v2.render.json', '{}');
  write('scripts/delivery.mjs', `
    import { appendFileSync } from 'node:fs';
    appendFileSync('status-calls.txt', process.argv[3] + '\\n');
    console.log(JSON.stringify({ status: 'ready', reason: 'other variant' }));
  `);

  const episode = boardResult('test-reel');
  assert.equal(episode.scores.reel, 10);
  assert.equal(episode.delivery.status, 'missing');
  assert.equal(episode.stages.find((stage: { key: string }) => stage.key === 'posted').cmd, '');
  for (const args of [['2'], ['2', '--json']]) {
    const ambiguous = run('board', ...args);
    assert.equal(ambiguous.status, 2);
    assert.match(ambiguous.stderr, /ambiguous/i);
  }
  assert.equal(existsSync(join(root, 'status-calls.txt')), false);

  const summary = run('board');
  assert.equal(summary.status, 0, summary.stderr);
  assert.match(summary.stdout.split(/\r?\n/).find((line) => /test-reel\s/.test(line)) ?? '', /–/);
  assert.equal(readFileSync(join(root, 'status-calls.txt'), 'utf8'), 'test-reel-v2\n');
});

test('board: an occupied render slot uses the delivery decision and a manual post takes precedence', (t) => {
  const { write, run, boardResult } = checkout(t);
  write('out/test-reel.render.json', '{}');
  const reason = 'Owner approval missing';
  write('scripts/delivery.mjs', `
    const args = ['status', 'test-reel', '--json', '--manifest=out/test-reel.render.json', '--approval=deliverables/test-reel/RELEASE.json'];
    if (JSON.stringify(process.argv.slice(2)) !== JSON.stringify(args)) process.exit(9);
    console.log(JSON.stringify({ status: 'blocked', reason: ${JSON.stringify(reason)} }));
    process.exitCode = 1;
  `);
  assert.deepEqual(boardResult('test-reel').delivery, { status: 'blocked', reason });
  assert.equal(boardResult('test-reel').next.stage, 'Delivery');

  const logged = run('track', 'posted', 'test-reel', 'ig', '--date', '2026-11-18');
  assert.equal(logged.status, 0, logged.stderr);
  const posted = boardResult('test-reel');
  assert.equal(posted.posts.instagram.date, '2026-11-18');
  assert.equal(posted.delivery.status, 'blocked');
  assert.equal(posted.next.stage, 'Update stats');
});

test('board: an explicit ready decision wins over local stage heuristics', (t) => {
  const { write, boardResult } = checkout(t);
  write('out/test-reel.render.json', '{}');
  write('scripts/delivery.mjs', `console.log(JSON.stringify({ status: 'ready', reason: 'Verified release' }));`);
  const episode = boardResult('test-reel');
  assert.deepEqual(episode.delivery, { status: 'ready', reason: 'Verified release' });
  assert.equal(episode.next.stage, 'Publish');

  write('scripts/delivery.mjs', `console.log(JSON.stringify({ status: 'ready', reason: 'Verified release' })); process.exitCode = 1;`);
  assert.equal(boardResult('test-reel').delivery.status, 'blocked');
});

test('board: a single episode shows and checks only the selected manifest and approval', (t) => {
  const { write, run, boardResult } = checkout(t);
  const manifest = 'exports/alternate cut.render.json';
  const approval = 'exports/alternate release.json';
  const args = [`--manifest=${manifest}`, `--approval=${approval}`];
  write(manifest, '{}');
  write(approval, '{}');
  write('scripts/delivery.mjs', `
    const args = ${JSON.stringify(['status', 'test-reel', '--json', ...args])};
    if (JSON.stringify(process.argv.slice(2)) !== JSON.stringify(args)) process.exit(9);
    console.log(JSON.stringify({ status: 'ready', reason: 'Selected release verified' }));
  `);

  const selected = boardResult('test-reel', ...args);
  assert.equal(selected.delivery.status, 'ready');
  assert.deepEqual(selected.deliverySelection, { manifest, approval });
  const detail = run('board', '--manifest', manifest, 'test-reel', '--approval', approval);
  assert.equal(detail.status, 0, detail.stderr);
  assert.ok(detail.stdout.includes(manifest) && detail.stdout.includes(approval));

  assert.equal(boardResult('test-reel').delivery.status, 'missing');
  write('out/test-reel.render.json', '{}');
  const missing = boardResult('test-reel', '--manifest=exports/missing.render.json');
  assert.equal(missing.delivery.status, 'missing');
  assert.deepEqual(missing.deliverySelection, { manifest: 'exports/missing.render.json', approval: 'deliverables/test-reel/RELEASE.json' });
  for (const invalid of [[...args, '--json'], ['--md', ...args], ['test-reel', '--manifest'], ['test-reel', 'test-reel-v2', ...args]]) {
    assert.equal(run('board', ...invalid).status, 2, invalid.join(' '));
  }
});

test('board: shared voice distinguishes legacy, verified, stale, and unavailable evidence', (t) => {
  const { write, boardResult } = checkout(t);
  const base = 'public/episodes/test-reel';
  const source = { id: 'test-reel', seriesId: 'receipts', episode: 2, title: 'Test reel', beats: [{ id: 'hook', say: 'Hello.' }] };
  const wav = 'test voice';
  const timings = JSON.stringify({ duration: 42, beats: [], engine: 'elevenlabs', say_hash: 'old-fingerprint' });
  const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');
  write(`${base}/episode.json`, JSON.stringify(source));
  write('public/episodes/test-reel-v2/episode.json', JSON.stringify({ ...source, id: 'test-reel-v2', audio: 'test-reel' }));
  write(`${base}/voice.wav`, wav);
  write(`${base}/timings.json`, timings);
  const voice = () => boardResult('test-reel-v2').stages.find((stage: { key: string }) => stage.key === 'voice');
  const legacy = voice();
  assert.equal(legacy.state, 'warn');
  assert.match(legacy.note, /shared with test-reel.*legacy-unverified/i);

  write(`${base}/voice.provenance.json`, JSON.stringify({
    schemaVersion: 1,
    sha256: { 'voice.wav': sha256(wav), 'timings.json': sha256(timings) },
    request: { engine: 'elevenlabs', inputs: { voice: null, lexicon: null, beats: [['hook', 'Hello.', null]] } },
    effective: { engine: 'elevenlabs' },
  }));
  assert.equal(voice().state, 'done');
  write(`${base}/episode.json`, JSON.stringify({ ...source, beats: [{ id: 'hook', say: 'Changed.' }] }));
  const stale = voice();
  assert.equal(stale.state, 'stale');
  assert.match(stale.note, /stale.*script/i);
  write(`${base}/voice.wav`, 'mismatching voice');
  const unavailable = voice();
  assert.equal(unavailable.state, 'warn');
  assert.match(unavailable.note, /unavailable.*does not match/i);
});

test('board doctor: shows the configured Python and platform default', (t) => {
  const { root } = checkout(t);
  const env = { ...process.env };
  delete env.STUDIO_PYTHON;
  const python = process.platform === 'win32' ? 'python' : 'python3';
  const doctor = (env: NodeJS.ProcessEnv) => spawnSync(process.execPath, ['scripts/board.mjs', '--doctor'], { cwd: root, encoding: 'utf8', env });
  const defaultDoctor = doctor(env);
  assert.equal(defaultDoctor.status, 0, defaultDoctor.stderr);
  assert.ok(defaultDoctor.stdout.includes(`Python voice deps (${python})`));

  const configured = join(root, 'unavailable studio python');
  const customDoctor = doctor({ ...env, STUDIO_PYTHON: configured });
  assert.equal(customDoctor.status, 0, customDoctor.stderr);
  assert.ok(customDoctor.stdout.includes(`✗ Python voice deps (${configured})`));
});
