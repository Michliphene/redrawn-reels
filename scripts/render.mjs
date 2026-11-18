#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, captureOutput, episodeTarget, existingVoice, generateMusic, isEntry, localBrowser,
  readJson, runTool, sha256, withOutputStage, writeJson,
} from './render-tools.mjs';

const usage = `Usage: node scripts/render.mjs <episode_id> [--da 1|2] [--crf 0-51] [--skip-validate]
       [--synthesize [--voice-engine elevenlabs|kokoro] [--allow-fallback] [--force-voice]]
       [--prepare-music]
Set REMOTION_CHROME to use a specific local browser, REMOTION_GL to select GL,
and STUDIO_PYTHON to select Python for explicit voice synthesis.`;

function options(argv) {
  const [id, ...args] = argv;
  const result = {id, crf: 18};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--da') {
      const value = args[++i];
      if (value !== '1' && value !== '2') throw new Error('--da must be 1 or 2');
      result.da = Number(value);
    } else if (arg === '--crf') {
      const value = args[++i];
      if (!/^\d+$/.test(value ?? '') || Number(value) > 51) throw new Error('--crf must be an integer from 0 to 51');
      result.crf = Number(value);
      result.crfOverride = true;
    } else if (arg === '--voice-engine') {
      result.voiceEngine = args[++i];
      if (!['elevenlabs', 'kokoro'].includes(result.voiceEngine)) throw new Error('--voice-engine must be elevenlabs or kokoro');
    } else if (arg === '--synthesize') result.synthesize = true;
    else if (arg === '--allow-fallback') result.allowFallback = true;
    else if (arg === '--force-voice') result.forceVoice = true;
    else if (arg === '--skip-validate') result.skipValidate = true;
    else if (arg === '--prepare-music') result.prepareMusic = true;
    else throw new Error(`Unknown render option: ${arg}`);
  }
  if (!result.synthesize && (result.voiceEngine || result.allowFallback || result.forceVoice)) {
    throw new Error('--voice-engine, --allow-fallback and --force-voice require --synthesize');
  }
  return result;
}

export function runRender(argv, { root = ROOT, env = process.env, run = runTool } = {}) {
  if (!argv.length || argv[0] === '--help') {
    console.log(usage);
    return;
  }

  const opt = options(argv);
  const {id} = opt;
  const {composition, da, audioId, audioDir} = episodeTarget(root, id, opt.da);
  if (audioId !== id && (opt.synthesize || opt.prepareMusic)) {
    throw new Error(`Episode ${id} uses shared audio from ${audioId}. Prepare that episode explicitly.`);
  }
  const music = path.join(audioDir, 'music.wav');
  let voice = opt.synthesize ? null : existingVoice(audioDir);
  if (!opt.prepareMusic && !fs.statSync(music, {throwIfNoEntry: false})?.size) {
    throw new Error(`Missing music.wav for ${audioId}. Prepare music on the audio source episode.`);
  }

  const delivery = path.join(root, 'scripts/delivery.mjs');
  if (!fs.existsSync(delivery)) throw new Error('scripts/delivery.mjs is required to snapshot and capture the render');
  const chrome = localBrowser(root, env);
  const gl = env.REMOTION_GL ?? (process.platform === 'linux' ? 'swangle' : 'angle');
  const cliPackage = readJson(path.join(root, 'node_modules/@remotion/cli/package.json'));
  const variant = opt.da !== undefined || opt.crfOverride;
  const name = variant ? `${id}-da${da}${opt.crfOverride ? `-crf${opt.crf}` : ''}` : id;
  const output = path.join(root, variant ? 'out/variants' : 'out');
  const inputProps = {episodeId: id, da, requireDa: da};

  return withOutputStage(output, name, (stage) => {
    const invoke = (executable, args, settings = {}) => run(executable, args, {cwd: root, env, ...settings});
    const node = (args, settings) => invoke(process.execPath, args, settings);
    const preflight = [path.join(root, 'scripts/validate.mjs'), id, '--da', String(da)];
    if (!opt.skipValidate) node(opt.synthesize ? [...preflight, '--draft'] : preflight);
    const ffmpeg = String(invoke('ffmpeg', ['-version'], {capture: true})).split(/\r?\n/, 1)[0];
    const ffprobe = String(invoke('ffprobe', ['-version'], {capture: true})).split(/\r?\n/, 1)[0];

    if (opt.synthesize) {
      invoke(env.STUDIO_PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3'), [
        path.join(root, 'pipeline/tts.py'), id, '--synthesize',
        ...(opt.voiceEngine ? ['--engine', opt.voiceEngine] : []),
        ...(opt.allowFallback ? ['--allow-fallback'] : []),
        ...(opt.forceVoice ? ['--force'] : []),
      ]);
      voice = existingVoice(audioDir);
      if (!opt.skipValidate) node(preflight);
    }
    if (opt.prepareMusic && !fs.existsSync(music)) {
      const duration = readJson(path.join(audioDir, 'timings.json')).duration;
      generateMusic(root, id, duration + 1, invoke);
    }
    if (voice.status !== 'verified') console.warn(`Voice for ${audioId}: ${voice.status}`);

    const recipe = path.join(stage, 'recipe.json');
    const snapshot = path.join(stage, 'snapshot.json');
    const raw = path.join(stage, 'raw.mp4');
    const encoded = path.join(stage, 'encoded.mp4');
    const emptyEnv = path.join(stage, 'empty.env');
    fs.writeFileSync(emptyEnv, '');
    const version = {node: process.version, remotion: cliPackage.version, ffmpeg, ffprobe};
    const renderOptions = {codec: 'h264', crf: opt.crf, concurrency: 4, imageFormat: 'jpeg'};
    const audioOptions = {filter: 'loudnorm=I=-14:TP=-1.5:LRA=11', codec: 'aac', bitrate: '192k'};
    writeJson(recipe, {
      composition, inputProps, audioId, voice, gl, toolVersions: version,
      browser: {executable: path.basename(chrome), sha256: sha256(chrome)}, renderOptions, audioOptions,
      ...(variant ? {variantId: name} : {}),
      ...(opt.skipValidate ? {preflightSkipped: true} : {}),
    });
    node([delivery, 'snapshot', id, '--engine', 'remotion', '--da', String(da), '--output', snapshot, '--recipe', recipe]);

    // Call the installed CLI's exported entry point without the executable wrapper's implicit dotenv load.
    const cli = "require('@remotion/cli').cli().then(() => process.exit(0), (error) => { console.error(error); process.exit(1); });";
    const args = ['-e', cli, '--', 'remotion', 'render', 'src/index.ts', composition, raw,
      `--props=${JSON.stringify(inputProps)}`, `--browser-executable=${chrome}`, `--gl=${gl}`, `--env-file=${emptyEnv}`,
      `--codec=${renderOptions.codec}`, `--crf=${renderOptions.crf}`, `--concurrency=${renderOptions.concurrency}`,
      `--image-format=${renderOptions.imageFormat}`, '--log=error', '--skip-skills'];
    const renderEnv = {...env, TMP: stage, TEMP: stage, TMPDIR: stage};
    node(args, {env: renderEnv});

    invoke('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-c:v', 'copy', '-af', audioOptions.filter,
      '-c:a', audioOptions.codec, '-b:a', audioOptions.bitrate, '-movflags', '+faststart', encoded]);

    const video = path.join(output, `${name}.mp4`);
    const manifest = path.join(output, `${name}.render.json`);
    captureOutput({
      video, manifest, stagedVideo: encoded, stage,
      capture: (videoPath, manifestPath) => node([delivery, 'capture', id, '--snapshot', snapshot,
        '--video', videoPath, '--manifest', manifestPath]),
    });
    console.log(`done -> ${path.relative(root, video)}`);
    return {video, manifest};
  });
}

if (isEntry(import.meta.url)) {
  try {
    const argv = process.argv.slice(2);
    runRender(argv);
    if (!argv.length) process.exitCode = 2;
  } catch (error) {
    console.error(`render: ${error.message}`);
    process.exitCode = 1;
  }
}
