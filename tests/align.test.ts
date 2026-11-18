// The WhisperX voice check (pipeline/align.py): its pure helpers run without whisperx installed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const py = (code: string) =>
  JSON.parse(execFileSync('python3', ['-c', `import sys, json; sys.path.insert(0, 'pipeline'); from align import *\n${code}`], { encoding: 'utf8' }));

test('align: numbers left in the script are compared the way a voice reads them', () => {
  const r = py(`print(json.dumps([norm("March 30, after"), norm("the 49th state"), norm("in 1867,"), norm("over 4,000 miles"), norm("St Petersburg")]))`);
  assert.deepEqual(r, [
    ['march', 'thirtieth', 'after'],
    ['the', 'forty', 'ninth', 'state'],
    ['in', 'eighteen', 'sixty', 'seven'],
    ['over', 'four', 'thousand', 'miles'],
    ['saint', 'petersburg'],
  ]);
});

test('align: a mangled name is flagged, spelling noise and a swapped "the" are not', () => {
  const r = py(`
ep = {"voice": {}, "beats": [{"id": "swap", "say": "Kaesong, once in the South. Sokcho, once in the North. Every one agrees."}]}
heard = [(w, i * 0.3) for i, w in enumerate("kaysong once in a south saksho once in the north everyone agrees".split())]
print(json.dumps(compare(expected_words(ep), heard)))`);
  const [, issues] = r;
  assert.equal(issues.length, 1);
  assert.equal(issues[0].script, 'Sokcho,');
  assert.equal(issues[0].heard, 'saksho');
});

test('align: words with no time get one between their neighbours', () => {
  const r = py(`print(json.dumps(fill_gaps([{"start": 1.0, "end": 1.2}, {}, {"start": 1.6, "end": 1.8}], 0, 2)))`);
  assert.ok(r[1].start > 1.2 && r[1].end <= 1.6, JSON.stringify(r[1]));
});
