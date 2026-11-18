import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
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
