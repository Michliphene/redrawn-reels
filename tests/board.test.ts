// The studio board reads the repo as it is: every episode gets every stage, and a next step or none.
import { test } from 'node:test';
import assert from 'node:assert/strict';
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
