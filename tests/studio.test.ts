// Fast checks of the logic every render depends on. Run with `npm test` (no browser, no network).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schedule } from '../src/lib/schedule';
import { seriesOf, episodeTag, SERIES } from '../src/studio/series';
import { fitShot, makeCamera, projector, shotAt, dollyZoom, STAGE_RECT, type Vec3 } from '../src/studio/three/rig';
import { hexToRgb, shade, life, hop } from '../src/studio/motion';
import { SAFE, ZONES } from '../src/studio/tokens';
// @ts-expect-error plain ES module without types
import { validate, displayWords } from '../scripts/validate.mjs';

const timings = { duration: 4, beats: [{ id: 'a', start: 0.2, end: 2, words: [{ w: 'The', start: 0.2, end: 0.4 }, { w: 'South', start: 0.5, end: 0.8 }, { w: 'and', start: 0.9, end: 1 }, { w: 'South.', start: 1.2, end: 1.6 }] }, { id: 'b', start: 2.2, end: 3.6, words: [{ w: 'Then', start: 2.2, end: 2.5 }, { w: 'it', start: 2.6, end: 2.7 }, { w: 'ends.', start: 2.8, end: 3.4 }] }] };
const spec = (actions: any[]) => ({ id: 'x', series: 'REDRAWN', title: 't', data: '', timeline: { from: '1990', to: '1991' }, beats: [{ id: 'a', say: 'The South and South.', actions }, { id: 'b', say: 'Then it ends.' }] }) as any;

test('cue words: an exact token wins over a prefix, occurrence picks the n-th match', () => {
  const s = schedule(spec([{ type: 'shake', atWord: 'South.' }, { type: 'shake', atWord: 'South' }, { type: 'shake', atWord: 'sou', occurrence: 2 }]), timings);
  assert.deepEqual(s.actions.map((a) => a.t), [1.2, 0.5, 1.2]);
});

test('cue words: a word that is never spoken stops the render with a clear message', () => {
  assert.throws(() => schedule(spec([{ type: 'shake', atWord: 'North' }]), timings), /atWord "North" not found in beat a/);
});

test('cue words: stamp and retreat words may come from a later beat', () => {
  const s = schedule(spec([{ type: 'callout', text: 'x', atWord: 'The', stamp: 'S', stampWord: 'ends' }]), timings);
  assert.equal((s.actions[0] as any).stampAt, 2.8);
});

test('cue words: a split verdict ticks each box on its own word; props open and sink on theirs', () => {
  const s = schedule(spec([
    { type: 'verdict', options: ['CAUGHT', 'NEVER FOUND'], atWord: 'The', picks: [{ pick: 0, word: 'South.', note: 'THE MEN' }, { pick: 1, word: 'ends' }] },
    { type: 'prop', kind: 'vault', at: [0, 0], atWord: 'The', openWord: 'and', sinkWord: 'Then' },
  ]), timings);
  assert.deepEqual((s.actions[0] as any).picks.map((p: any) => p.at), [0.5, 2.8]);
  assert.equal((s.actions[1] as any).openAt, 0.9);
  assert.equal((s.actions[1] as any).sinkAt, 2.2);
});

test('series registry: old names, ids and compositions all resolve; unknown falls back', () => {
  assert.equal(seriesOf({ series: 'REDRAWN' }).id, 'redrawn');
  assert.equal(seriesOf({ series: 'Receipts' }).id, 'receipts');
  assert.equal(seriesOf({ seriesId: 'receipts', series: 'anything' }).id, 'receipts');
  assert.equal(seriesOf({ series: 'renamed later', composition: 'Money' }).id, 'receipts');
  assert.equal(seriesOf(undefined).id, 'redrawn');
  assert.equal(episodeTag(SERIES.redrawn, 3), 'EP 3');
  assert.equal(episodeTag(SERIES.receipts, 3), '#003');
  assert.equal(episodeTag(SERIES.receipts), null);
});

test('camera fit: the subject always lands inside the stage band, as large as it can be', () => {
  const pts: Vec3[] = [[-6, 0, -2], [6, 0, -2], [6, 0.2, 2], [-6, 0.2, 2], [0, 0.2, 0]];
  for (const base of [{ pitch: 60, yaw: 0, fov: 26 }, { pitch: 22, yaw: -25, fov: 34 }, { pitch: 88, yaw: 40, fov: 20 }]) {
    const px = pts.map(projector(makeCamera(fitShot(pts, base))));
    const l = Math.min(...px.map((p) => p[0])), r = Math.max(...px.map((p) => p[0])), t = Math.min(...px.map((p) => p[1])), b = Math.max(...px.map((p) => p[1]));
    assert.ok(l >= STAGE_RECT.left - 2 && r <= STAGE_RECT.right + 2 && t >= STAGE_RECT.top - 2 && b <= STAGE_RECT.bottom + 2, `outside the stage at ${JSON.stringify(base)}`);
    const fill = Math.max((r - l) / (STAGE_RECT.right - STAGE_RECT.left), (b - t) / (STAGE_RECT.bottom - STAGE_RECT.top));
    assert.ok(fill > 0.97, `subject only fills ${(fill * 100).toFixed(0)} % at ${JSON.stringify(base)}`);
  }
});

test('camera: a cut jumps, a move eases, a dolly zoom keeps the subject size', () => {
  const a = { target: [0, 0, 0] as Vec3, dist: 10, pitch: 50, yaw: 0, fov: 30 }, b = { ...a, dist: 20, yaw: 20 };
  assert.equal(shotAt(1.0, [{ t: 0, dur: 1, shot: a }, { t: 1, dur: 1, shot: b, cut: true }]).dist, 20);
  const mid = shotAt(1.5, [{ t: 0, dur: 1, shot: a }, { t: 1, dur: 1, shot: b }]);
  assert.ok(mid.dist > 10 && mid.dist < 20 && mid.yaw > 0 && mid.yaw < 20);
  const dz = dollyZoom(a, 60);
  assert.ok(Math.abs(dz.dist * Math.tan((60 * Math.PI) / 360) - a.dist * Math.tan((30 * Math.PI) / 360)) < 1e-9);
});

test('colours: hex and rgba() strings both parse (the map engine produces rgba)', () => {
  assert.deepEqual(hexToRgb('#ff0000'), [1, 0, 0]);
  assert.deepEqual(hexToRgb('rgba(255, 0, 0, 1)'), [1, 0, 0]);
  assert.equal(shade('rgb(200,100,0)', -0.5), '#643200');
  assert.deepEqual(hexToRgb('not a colour'), [1, 0, 1]);
});

test('motion helpers are zero outside their window', () => {
  assert.equal(life(0.5, 1, 2), 0); assert.equal(life(4, 1, 2), 0); assert.equal(life(2, 1, 2), 1);
  assert.equal(hop(0.9, 1), 0); assert.equal(hop(2, 1), 0); assert.ok(hop(1.2, 1) > 0.9);
});

test('layout tokens: every band sits inside the platform safe area, in order', () => {
  const bands = [ZONES.hud, ZONES.title, ZONES.stage, ZONES.captions];
  for (const z of bands) assert.ok(z.top >= SAFE.top && z.bottom <= SAFE.bottom && z.top < z.bottom);
  assert.ok(ZONES.hud.bottom <= ZONES.title.top && ZONES.stage.bottom <= ZONES.captions.top);
});

test('script markup: {Display|spoken} shows the display words', () => {
  assert.deepEqual(displayWords('{March 1990|March, nineteen ninety}: Lithuania goes first.'), ['March', '1990:', 'Lithuania', 'goes', 'first.']);
  assert.deepEqual(displayWords('It costs {$1.50|a dollar fifty}.'), ['It', 'costs', '$1.50.']);
});

test('every episode in the repo passes the pre-flight without errors', () => {
  for (const id of ['ussr-1991', 'ussr-1991-v2', 'alaska-1867', 'louisiana-1803', 'korea-1945', 'costco-hotdog', 'costco-hotdog-v2', 'netflix-100', 'mcdonalds-rent']) {
    assert.deepEqual(validate(id).errors, [], id);
  }
});

test('pre-flight: a remaster must keep the script of the episode whose voice it reuses', () => {
  const r = validate('ussr-1991-v2');
  assert.equal(r.da, 2); assert.equal(r.series, 'redrawn');
});

test('channels: `channel` picks the series, wins over seriesId/series; REDRAWN stays the default', () => {
  assert.equal(seriesOf({ channel: 'getaway' }).id, 'getaway');
  assert.equal(seriesOf({ channel: 'getaway', seriesId: 'redrawn', series: 'REDRAWN' }).id, 'getaway');
  assert.equal(seriesOf({ series: 'The Getaway' }).id, 'getaway');
  assert.equal(seriesOf({ series: 'REDRAWN' }).id, 'redrawn');
  assert.equal(episodeTag(SERIES.getaway, 1), 'CASE 001');
  // the REDRAWN palette is untouched by the new channel
  assert.equal(SERIES.redrawn.palette.accent, '#FFC94D');
  assert.equal(SERIES.redrawn.type, undefined);
});
