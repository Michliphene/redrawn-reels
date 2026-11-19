import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { test, type TestContext } from 'node:test';
import { fileURLToPath } from 'node:url';
// @ts-expect-error plain ES module without types
import { runRender } from '../scripts/render.mjs';
// @ts-expect-error plain ES module without types
import { existingVoice } from '../scripts/render-tools.mjs';

function fixture(t: TestContext) {
  // Keep staging on the same volume as the output and exercise a path with spaces.
  const out = fileURLToPath(new URL('../out/', import.meta.url));
  fs.mkdirSync(out, { recursive: true });
  const root = fs.mkdtempSync(path.join(out, 'render test '));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (file: string, value: unknown) => {
    const p = path.join(root, file);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, typeof value === 'string' ? value : JSON.stringify(value));
  };
  write('public/studio.json', {series: {receipts: {name: 'New name', legacyNames: ['Receipts'], composition: 'Money'}}});
  write('public/episodes/cut/episode.json', {series: 'Receipts', da: 2, audio: 'original'});
  write('public/episodes/original/episode.json', {voice: {engine: 'elevenlabs'}, beats: [{id: 'intro', say: 'Hi.'}]});
  write('public/episodes/original/timings.json', {duration: 4, beats: [], say_hash: 'old-untrusted-stamp'});
  write('public/episodes/original/voice.wav', 'voice fixture');
  write('public/episodes/original/music.wav', 'music fixture');
  write('node_modules/@remotion/cli/package.json', {version: 'fixture', bin: {remotion: 'remotion-cli.js'}});
  write('scripts/delivery.mjs', '');
  write('browser.exe', '');
  const props = path.join(root, 'browser.exe');
  return {root, write, env: {REMOTION_CHROME: props, REMOTION_GL: 'angle'}};
}

test('existing-media route locks DA, reads shared media and snapshots before rendering', (t) => {
  const f = fixture(t);
  const calls: string[] = [];
  runRender(['cut', '--da', '1'], {...f, run: (exe: string, args: string[]) => {
    const command = args[0] === '-e' ? 'remotion' : path.basename(args[0] ?? '');
    calls.push(command === 'delivery.mjs' ? args[1] : command);
    if (args[0] === '-version') return 'ffmpeg version test';
    if (command === 'validate.mjs') return '';
    if (args[1] === 'snapshot') {
      assert.deepEqual(args.slice(2, 8), ['cut', '--engine', 'remotion', '--da', '1', '--output']);
      const recipe = JSON.parse(fs.readFileSync(args[10], 'utf8'));
      assert.equal(recipe.voice.status, 'legacy-unverified');
      assert.equal(recipe.audioId, 'original');
      fs.writeFileSync(args[8], '{}');
    } else if (command === 'remotion') {
      assert.equal(args[6], 'Money');
      assert.ok(args.includes('--props={"episodeId":"cut","da":1,"requireDa":1}'));
      fs.writeFileSync(args[7], 'raw');
    } else if (exe === 'ffmpeg') {
      fs.writeFileSync(args.at(-1)!, 'encoded');
    } else if (args[1] === 'capture') {
      assert.equal(fs.readFileSync(args[6], 'utf8'), 'encoded');
      fs.writeFileSync(args[8], '{}');
    } else assert.fail(`unexpected external process ${exe} ${args.join(' ')}`);
    return '';
  }});
  assert.deepEqual(calls, ['validate.mjs', '-version', '-version', 'snapshot', 'remotion', '-y', 'capture']);
  assert.ok(fs.existsSync(path.join(f.root, 'out/variants/cut-da1.mp4')));
  assert.ok(fs.existsSync(path.join(f.root, 'out/variants/cut-da1.render.json')));
  assert.ok(!fs.existsSync(path.join(f.root, 'out/cut.mp4')));
  assert.equal(fs.readFileSync(path.join(f.root, 'public/episodes/original/voice.wav'), 'utf8'), 'voice fixture');
  assert.ok(!fs.existsSync(path.join(f.root, 'public/episodes/original/voice.provenance.json')));
});

test('missing episode, missing shared voice, and synthesis on a remaster fail before rendering', (t) => {
  const f = fixture(t);
  const opts = {...f, run: () => assert.fail('must stop before calling a tool')};
  assert.throws(() => runRender(['missing'], opts), /episode.json/);
  assert.throws(() => runRender(['cut', '--synthesize'], opts), /shared audio/i);
  fs.unlinkSync(path.join(f.root, 'public/episodes/original/voice.wav'));
  assert.throws(() => runRender(['cut'], opts), /voice.wav/);
});

test('a failed capture preserves the previous video and manifest', (t) => {
  const f = fixture(t);
  f.write('out/cut.mp4', 'previous video');
  f.write('out/cut.render.json', 'previous manifest');
  assert.throws(() => runRender(['cut'], {...f, run: (exe: string, args: string[]) => {
    if (args[1] === 'capture') throw new Error('inputs changed');
    if (args[0] === '-e') fs.writeFileSync(args[7], 'raw');
    if (exe === 'ffmpeg' && args[0] === '-y') fs.writeFileSync(args.at(-1)!, 'encoded');
    return '';
  }}), /inputs changed/);
  assert.equal(fs.readFileSync(path.join(f.root, 'out/cut.mp4'), 'utf8'), 'previous video');
  assert.equal(fs.readFileSync(path.join(f.root, 'out/cut.render.json'), 'utf8'), 'previous manifest');
});

test('raea refreshes prepared timings and keeps the check report when the checker fails', (t) => {
  const bash = process.env.STUDIO_BASH ?? (process.platform === 'win32' ? null : 'bash');
  if (!bash) return t.skip('Bash unavailable by default on Windows; set STUDIO_BASH to run this fixture');
  const f = fixture(t);
  const project = 'raea/apple-iphone-3d';
  const source = 'public/episodes/apple-iphone';
  for (const name of ['render.sh', 'setup.sh']) {
    f.write(project + '/' + name, fs.readFileSync(new URL('../' + project + '/' + name, import.meta.url), 'utf8').replaceAll('\r\n', '\n'));
  }
  f.write('scripts/render-tools.mjs', fs.readFileSync(new URL('../scripts/render-tools.mjs', import.meta.url), 'utf8'));
  f.write('scripts/format.mjs', fs.readFileSync(new URL('../scripts/format.mjs', import.meta.url), 'utf8'));
  f.write(source + '/timings.json', {duration: 4, beats: [], revision: 'latest'});
  f.write(source + '/voice.wav', 'new voice');
  f.write(source + '/music.wav', 'new music');
  f.write(project + '/compositions/timings.json', {revision: 'old'});
  f.write(project + '/media/voice.wav', 'old voice');
  f.write(project + '/out/storefront.mp4', 'previous video');
  f.write('public/sfx/tick.wav', 'tick');
  f.write('public/fonts/OFL.txt', 'OFL');
  f.write('public/fonts/LICENSES.md', 'licenses');
  const tool = (name: string, body: string) => {
    f.write('bin/' + name, '#!/usr/bin/env bash\nset -euo pipefail\n' + body + '\n');
    fs.chmodSync(path.join(f.root, 'bin', name), 0o755);
  };
  tool('ffmpeg', 'if [[ ${1:-} == -version ]]; then echo "ffmpeg mock"; else printf test > "${@: -1}"; fi');
  tool('python3', 'printf font > "${@: -1}"');
  tool('raea', [
    'case "$1" in',
    '  --version) echo "raea mock" ;;',
    '  render) grep -q latest compositions/timings.json || exit 44; if [[ $5 == --manifest ]]; then printf "{}" > "$6"; else printf mix > "$4"; fi ;;',
    '  check) printf "{\\"error\\":true}" > "${@: -1}"; echo "fixture check failed"; exit 43 ;;',
    'esac',
  ].join('\n').replace('[[ $5 == --manifest ]]', '[[ ${5:-} == --manifest ]]'));
  const result = spawnSync(bash, ['-c', 'export PATH="$PWD/bin:$PATH"; exec bash "$1"', 'bash', project + '/render.sh'], {
    cwd: f.root, encoding: 'utf8',
  });
  assert.equal(result.status, 43, result.error?.message ?? result.stderr);
  assert.match(result.stdout, /fixture check failed/);
  assert.equal(fs.readFileSync(path.join(f.root, project, 'out/storefront.mp4'), 'utf8'), 'previous video');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.root, project, 'out/storefront.check.json'), 'utf8')), {error: true});
});

test('a recorded fallback remains identifiable after a Windows checkout and rejects a changed script', (t) => {
  const {root, write} = fixture(t);
  const dir = 'public/episodes/original';
  const lfTimings = '{\n  "duration": 4,\n  "beats": []\n}';
  const spec = {voice: {engine: 'elevenlabs'}, beats: [{id: 'intro', say: 'Hi.'}]};
  const hash = (text: string) => createHash('sha256').update(text).digest('hex');
  write(dir + '/timings.json', lfTimings.replaceAll('\n', '\r\n'));
  write(dir + '/voice.provenance.json', {
    schemaVersion: 1,
    request: {engine: 'elevenlabs', inputs: {voice: spec.voice, lexicon: null, beats: [['intro', 'Hi.', null]]}},
    effective: {engine: 'kokoro'},
    sha256: {'voice.wav': hash('voice fixture'), 'timings.json': hash(lfTimings)},
  });
  const audio = path.join(root, dir);
  assert.equal(existingVoice(audio).status, 'fallback');
  write(dir + '/episode.json', {...spec, beats: [{id: 'intro', say: 'Bye.'}]});
  assert.throws(() => existingVoice(audio), /provenance is stale/i);
});

function changedScript(t: TestContext) {
  const f = fixture(t);
  for (const file of ['scripts/validate.mjs', 'scripts/format.mjs', 'src/lib/schedule.ts', 'src/lib/media.ts']) {
    f.write(file, fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8'));
  }
  const episode = 'public/episodes/original';
  f.write(episode + '/episode.json', {
    id: 'original', seriesId: 'receipts', da: 2, title: 'A script with an added beat',
    source: 'A sourced fact', voice: {engine: 'kokoro'}, scenes: {primary: {type: 'card'}},
    beats: [{id: 'intro', say: 'Hi.', scene: 'primary'}, {id: 'added', say: 'Again.'}],
  });
  f.write(episode + '/SOURCES.md', 'A sourced fact');
  const intro = {id: 'intro', start: 0, end: 1, words: [{w: 'Hi.', start: 0, end: 1}]};
  const added = {id: 'added', start: 1, end: 2, words: [{w: 'Again.', start: 1, end: 2}]};
  f.write(episode + '/timings.json', {duration: 4, beats: [intro]});
  return {
    ...f,
    record: () => f.write(episode + '/timings.json', {duration: 4, beats: [intro, added]}),
    validate: (...args: string[]) => spawnSync(process.execPath, ['scripts/validate.mjs', 'original', ...args], {
      cwd: f.root, encoding: 'utf8',
    }),
  };
}

test('draft validation ignores stale timing files and applies the chosen art direction', (t) => {
  const f = changedScript(t);
  assert.equal(f.validate().status, 1);
  assert.match(f.validate().stdout, /timings.json has 1 beats, episode.json has 2/);
  const draft = f.validate('--draft', '--da', '1');
  assert.equal(draft.status, 0, draft.stdout + draft.stderr);
  assert.match(draft.stdout, /DA 1/);

  const file = 'public/episodes/original/episode.json';
  const spec = JSON.parse(fs.readFileSync(path.join(f.root, file), 'utf8'));
  spec.keywords = 'DA 2 requires a list';
  f.write(file, spec);
  assert.equal(f.validate('--draft', '--da', '1').status, 0);
  assert.match(f.validate('--draft').stdout, /keywords.*must be a list/);
  spec.beats[1].actions = [{type: 'callout', atWord: 'absent'}];
  f.write(file, spec);
  const invalid = f.validate('--draft');
  assert.equal(invalid.status, 1);
  assert.match(invalid.stdout, /atWord "absent" not found/);
});

test('synthesis validates the script first and then the new timings in the selected DA', (t) => {
  const f = changedScript(t);
  const calls: string[] = [];
  const run = (_exe: string, args: string[]) => {
    if (args[0] === '-version') return 'FFmpeg fixture';
    const command = path.basename(args[0]);
    if (command === 'validate.mjs') {
      const draft = args.includes('--draft');
      calls.push(draft ? 'draft' : 'timed');
      const result = f.validate(...args.slice(2));
      if (result.status !== 0) throw new Error(result.stdout + result.stderr);
      assert.match(result.stdout, /DA 1/);
    } else if (command === 'tts.py') {
      calls.push('synthesize');
      f.record();
    } else if (args[1] === 'snapshot') {
      calls.push('snapshot');
      throw new Error('reached snapshot');
    } else assert.fail('unexpected tool: ' + command);
    return '';
  };

  assert.throws(() => runRender(['original', '--da', '1'], {...f, run}), /timings.json has 1 beats/);
  assert.deepEqual(calls.splice(0), ['timed']);

  assert.throws(() => runRender(['original', '--synthesize', '--da', '1'], {...f, run}), /reached snapshot/);
  assert.deepEqual(calls, ['draft', 'synthesize', 'timed', 'snapshot']);
});

test('a failed timed preflight after synthesis stops before snapshot', (t) => {
  const f = changedScript(t);
  let synthesized = false;
  const run = (_exe: string, args: string[]) => {
    if (args[0] === '-version') return '';
    if (path.basename(args[0]) === 'tts.py') {
      synthesized = true;
      return '';
    }
    if (path.basename(args[0]) !== 'validate.mjs') assert.fail('must stop before rendering');
    const result = f.validate(...args.slice(2));
    if (result.status !== 0) {
      assert.equal(synthesized, true, 'timed validation should run after synthesis');
      throw new Error('invalid synthesized timings: ' + result.stdout);
    }
    return '';
  };
  assert.throws(() => runRender(['original', '--synthesize'], {...f, run}), /invalid synthesized timings:.*FAIL/s);
});

test('a render with preflight skipped records that choice in its recipe', (t) => {
  const f = fixture(t);
  assert.throws(() => runRender(['cut', '--skip-validate'], {...f, run: (_exe: string, args: string[]) => {
    if (args[0] === '-version') return '';
    assert.equal(args[1], 'snapshot');
    const recipe = JSON.parse(fs.readFileSync(args[10], 'utf8'));
    assert.equal(recipe.preflightSkipped, true);
    throw new Error('reached snapshot');
  }}), /reached snapshot/);
});
