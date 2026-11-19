import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as cues from '../src/lib/schedule';
import type { EpisodeSpec, Timings, Action } from '../src/lib/types';

const timings: Timings = {
  duration: 4,
  beats: [
    { id: 'a', start: 0.2, end: 2, words: [
      { w: 'First', start: 0.2, end: 0.5 },
      { w: 'South', start: 0.8, end: 1 },
      { w: 'South.', start: 1.3, end: 1.6 },
    ] },
    { id: 'b', start: 2.2, end: 4, words: [{ w: 'End.', start: 2.2, end: 2.8 }] },
  ],
};

const episode = (action?: Action): EpisodeSpec => ({
  id: 'fixture', series: 'REDRAWN', title: 'Test', data: 'test.json',
  timeline: { from: '1990', to: '1991' },
  beats: [{ id: 'a', say: 'First South South.', actions: action ? [action] : [] }, { id: 'b', say: 'End.' }],
});

test('beat IDs align shuffled timing records and reject missing or duplicate IDs', () => {
  const reverse = { ...timings, beats: [...timings.beats].reverse() };
  assert.equal(cues.schedule(episode({ type: 'shake' }), reverse).actions[0].t, 0.2);
  assert.throws(() => cues.schedule(episode(), { ...timings, beats: [timings.beats[0], { ...timings.beats[1], id: 'wrong' }] }), /timing.*beat b/i);
  assert.throws(() => cues.schedule(episode(), { ...timings, beats: [timings.beats[0], timings.beats[0]] }), /duplicate.*a/i);
});

test('rejects malformed timing arrays and invalid or non-chronological ranges', () => {
  for (const bad of [
    { ...timings, beats: [] },
    { ...timings, beats: null },
    { ...timings, duration: NaN },
    { ...timings, beats: [{ ...timings.beats[0], start: 3 }, timings.beats[1]] },
    { ...timings, beats: [timings.beats[0], { ...timings.beats[1], end: 4.5 }] },
    { ...timings, beats: [{ ...timings.beats[0], end: 2.3 }, timings.beats[1]] },
    { ...timings, beats: [{ ...timings.beats[0], words: undefined }, timings.beats[1]] },
    { ...timings, beats: [{ ...timings.beats[0], words: [] }, timings.beats[1]] },
    { ...timings, beats: [{ ...timings.beats[0], words: [...timings.beats[0].words].reverse() }, timings.beats[1]] },
    { ...timings, beats: [{ ...timings.beats[0], words: [{ w: 'First', start: 0, end: 0.5 }] }, timings.beats[1]] },
  ]) assert.throws(() => cues.schedule(episode(), bad as Timings), /timing/i);
});

test('exact token wins even when the requested occurrence is missing', () => {
  assert.throws(() => cues.schedule(episode({ type: 'shake', atWord: 'South', occurrence: 2 }), timings), /atWord.*South.*beat a/);
  assert.equal(cues.schedule(episode({ type: 'shake', atWord: 'sou', occurrence: 2 }), timings).actions[0].t, 1.3);
  assert.throws(() => cues.schedule(episode({ type: 'shake', atWord: 'South', occurrence: 0 }), timings), /occurrence/);
});

test('absolute time overrides atWord and anchors both follow-up cues', () => {
  const callout = { type: 'callout', text: 'x', atWord: 'First', atTime: 1, stampWord: 'End' } as const;
  const [resolved] = cues.schedule(episode(callout), timings).actions;
  assert.deepEqual([resolved.beat, resolved.type, resolved.t, 'stampAt' in resolved && resolved.stampAt], ['a', 'callout', 1, 2.2]);
  assert.throws(() => cues.schedule(episode({ ...callout, stampWord: 'First' }), timings), /stampWord.*First.*beat a/);
  assert.throws(() => cues.schedule(episode({ type: 'units', kind: 'troops', at: [0, 0], atWord: 'South.', retreatWord: 'First' }), timings), /retreatWord.*First.*beat a/);
  for (const atTime of [-1, 4.01, Infinity, '1']) {
    assert.throws(() => cues.schedule(episode({ ...callout, atTime } as Action), timings), /atTime/);
  }
});

test('a renderable episode needs an opening Money scene or an Atlas camera', () => {
  const spec = episode();
  assert.throws(() => cues.schedule({ ...spec, composition: 'Money', scenes: { later: {} }, beats: [spec.beats[0], { ...spec.beats[1], scene: 'later' }] }, timings), /first beat.*scene/i);
  assert.throws(() => cues.schedule({ ...spec, composition: 'Episode', da: 2 }, timings), /DA 2.*camera/i);
});

test('reviewer CLI exports canonical cues and shared audio identity', () => {
  const run = (id: string) => JSON.parse(execFileSync(process.execPath, ['scripts/resolve-cues.mjs', id], { encoding: 'utf8' }));
  const remaster = run('apple-iphone-v2');
  assert.equal(remaster.audioId, 'apple-iphone');
  assert.ok(remaster.actions.length > 0);
  assert.ok(remaster.actions.every((a: { beat: string; type: string; t: number }) => a.beat && a.type && Number.isFinite(a.t)));
  const alaska = run('alaska-1867');
  assert.ok(alaska.actions.some((a: { atTime?: number; t: number }) => a.atTime === 0 && a.t === 0));
  const unknown = spawnSync(process.execPath, ['scripts/resolve-cues.mjs', 'unknown-episode'], { encoding: 'utf8' });
  assert.notEqual(unknown.status, 0);
  assert.equal(unknown.stdout, '');
});

test('reviewer CLI reflects the selected DA and drops the missing USSR portrait and flag assets', () => {
  const run = (...args: string[]) => JSON.parse(execFileSync(process.execPath, ['scripts/resolve-cues.mjs', 'ussr-1991-v2', ...args], { encoding: 'utf8' }));
  assert.equal(run().da, 2);
  for (const da of [1, 2]) {
    const result = run('--da', String(da));
    assert.equal(result.da, da);
    const portraits = result.actions.filter((a: Action) => a.type === 'portrait').map((a: { key: string }) => a.key);
    assert.ok(portraits.includes('gorbachev'));
    for (const key of ['landsbergis', 'kravchuk', 'shushkevich']) assert.ok(!portraits.includes(key), key);
    const georgia = result.actions.find((a: { beat: string; type: string }) => a.beat === 'geo' && a.type === 'declare');
    assert.ok(georgia);
    assert.ok(!('flag' in georgia));
  }
});

test('reviewer CLI accepts only a single explicit DA of 1 or 2', () => {
  for (const args of [['--da'], ['--da', '0'], ['--da', '3'], ['--da', '02'], ['--da', '2', '--da', '1']]) {
    const result = spawnSync(process.execPath, ['scripts/resolve-cues.mjs', 'ussr-1991-v2', ...args], { encoding: 'utf8' });
    assert.equal(result.status, 2, result.stderr);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /--da.*1.*2/);
  }
});

test('reviewer CLI applies Root’s local asset predicates before resolving action words', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'studio-cues-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const file of ['scripts/resolve-cues.mjs', 'scripts/validate.mjs', 'scripts/format.mjs', 'src/lib/media.ts', 'src/lib/schedule.ts', 'public/studio.json']) {
    const dest = join(root, file);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(file, dest);
  }
  const write = (file: string, contents: string) => {
    const dest = join(root, 'public', file);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, contents);
  };
  write('episodes/fixture/episode.json', JSON.stringify({
    ...episode(),
    beats: [{ ...episode().beats[0], actions: [
      { type: 'portrait', key: 'fits' },
      { type: 'portrait', key: 'tiny', atWord: 'Unspoken' },
      { type: 'chapter', text: 'lottie', emoji: 'lottie' },
      { type: 'sticker', text: 'png', emoji: 'png' },
      { type: 'chapter', text: 'missing', emoji: 'missing', atWord: 'Unspoken' },
      { type: 'flagSwap', from: 'valid', to: 'valid' },
      { type: 'flagSwap', from: 'valid', to: 'invalid', atWord: 'Unspoken' },
      { type: 'declare', id: 'a', flag: 'invalid' },
      { type: 'declare', id: 'b', flag: 'valid' },
    ] }, episode().beats[1]],
  }));
  write('episodes/fixture/timings.json', JSON.stringify(timings));
  write('assets/portraits/fits.jpg', 'x'.repeat(1001));
  write('assets/portraits/tiny.jpg', 'x'.repeat(1000));
  write('assets/emoji/lottie.json', 'Root checks MIME regardless of the JSON body');
  mkdirSync(join(root, 'public/assets/emoji/png.json'));
  write('assets/emoji/png.png', 'Root checks MIME regardless of the PNG body');
  write('assets/flags/valid.svg', '<?xml version="1.0"?><svg/>');
  write('assets/flags/invalid.svg', '<html>not an SVG</html>');

  const run = (...args: string[]) => spawnSync(process.execPath, ['scripts/resolve-cues.mjs', 'fixture', ...args], { cwd: root, encoding: 'utf8' });
  const flat = run('--da', '1');
  assert.equal(flat.status, 0, flat.stderr);
  assert.deepEqual(JSON.parse(flat.stdout).actions, [
    { type: 'portrait', key: 'fits', beat: 'a', t: 0.2 },
    { type: 'chapter', text: 'lottie', emoji: 'lottie', beat: 'a', t: 0.2 },
    { type: 'sticker', text: 'png', emoji: 'png', beat: 'a', t: 0.2 },
    { type: 'flagSwap', from: 'valid', to: 'valid', beat: 'a', t: 0.2 },
    { type: 'declare', id: 'a', beat: 'a', t: 0.2 },
    { type: 'declare', id: 'b', flag: 'valid', beat: 'a', t: 0.2 },
  ]);
  const atlas = run('--da', '2');
  assert.equal(atlas.status, 1);
  assert.match(atlas.stderr, /DA 2.*camera/i);
});

test('remaster voice, music and timing paths use the same audio identity', async () => {
  const { episodeMedia } = await import('../src/lib/media');
  assert.deepEqual(episodeMedia('remaster', { audio: 'original' }), {
    audioId: 'original', timings: 'episodes/original/timings.json', voice: 'episodes/original/voice.wav', music: 'episodes/original/music.wav',
  });
  assert.equal(episodeMedia('standalone', {}).voice, 'episodes/standalone/voice.wav');
});

test('required DA is numeric, agrees with the selected DA, and fails closed without WebGL', async () => {
  const { renderDirection } = await import('../src/lib/media');
  assert.deepEqual(renderDirection({}, 2, false), { da: 2, webgl: false });
  assert.deepEqual(renderDirection({ da: 1, requireDa: 1 }, 2, false), { da: 1, webgl: false });
  assert.deepEqual(renderDirection({ da: 2, requireDa: 2 }, 1, true), { da: 2, webgl: true });
  assert.throws(() => renderDirection({ da: 2, requireDa: 2 }, 2, false), /WebGL/);
  assert.throws(() => renderDirection({ da: 1, requireDa: 2 }, 2, true), /match/);
  for (const requireDa of ['2', 0, 3, null]) assert.throws(() => renderDirection({ requireDa }, 2, true), /requireDa/);
});

test('Delta creative config requires explicit opt-in and is scoped to Delta', async () => {
  const { deltaHookPreview } = await import('../src/lib/media');
  const spec = JSON.parse(readFileSync('public/episodes/delta-amex/episode.json', 'utf8'));
  assert.equal(deltaHookPreview(spec.id), undefined);
  assert.equal(deltaHookPreview('apple-iphone', true), undefined);
  assert.equal(deltaHookPreview(spec.id, 'true'), undefined);
  const preview = deltaHookPreview(spec.id, true);
  assert.ok(preview && !preview.title.includes('$8.2B') && preview.inset > 0 && preview.craneZoom < 0.34);
});
