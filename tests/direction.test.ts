import { test } from 'node:test';
import assert from 'node:assert/strict';
import { directedShot, type Direction } from '../src/studio/direction';
import type { Shot } from '../src/studio/three/rig';

const s: Shot = { target: [1, 2, 3], dist: 20, pitch: 45, yaw: 0, fov: 30 };
test('held direction preserves framing, reveal starts close and settles, loop returns exactly', () => {
  const hold: Direction = { opening: 'hold', drift: 0 };
  assert.deepEqual(directedShot(s, s, 0, 40, hold), s);
  assert.deepEqual(directedShot(s, s, 15, 40, hold), s);
  const reveal: Direction = { opening: 'reveal', openingSeconds: 2, drift: 0 };
  assert.ok(directedShot(s, s, 0, 40, reveal).dist < s.dist);
  assert.equal(directedShot(s, s, 3, 40, reveal).dist, s.dist);
  assert.deepEqual(directedShot(s, s, 39.99, 40, reveal), directedShot(s, s, 0, 40, reveal));
});
