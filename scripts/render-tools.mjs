import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const isId = (value) => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value);
export const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
export const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
export const sha256 = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export const isEntry = (url) => process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(url);

export function runTool(executable, args, { cwd, env, capture = false }) {
  try {
    return execFileSync(executable, args, {
      cwd, env, encoding: 'utf8', windowsHide: true,
      stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    });
  } catch (error) {
    throw new Error(`${path.basename(executable)} ${path.basename(args[0] ?? '')} failed (${error.code ?? error.status ?? error.signal})`, {cause: error});
  }
}

export function episodeTarget(root, id, overrideDa) {
  if (!isId(id)) throw new Error('Invalid episode ID');
  const episodes = path.join(root, 'public/episodes');
  const spec = readJson(path.join(episodes, id, 'episode.json'));
  const audioId = spec.audio ?? id;
  if (!isId(audioId)) throw new Error('Invalid audio episode ID');
  const defaultDa = spec.da ?? 1;
  if (defaultDa !== 1 && defaultDa !== 2) throw new Error('Episode DA must be 1 or 2');
  const studio = readJson(path.join(root, 'public/studio.json')).series;
  const slug = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const series = Object.hasOwn(studio, spec.seriesId) ? studio[spec.seriesId] : Object.entries(studio)
    .find(([key, entry]) => [key, entry.name, ...(entry.legacyNames ?? [])].map(slug).includes(slug(spec.series)))?.[1];
  return {
    composition: spec.composition ?? series?.composition ?? 'Episode',
    da: overrideDa ?? defaultDa,
    audioId,
    audioDir: path.join(episodes, audioId),
  };
}

export function existingVoice(audioDir) {
  if (fs.existsSync(path.join(audioDir, '.voice.lock'))) throw new Error('Voice preparation is in progress');
  const voiceSha256 = sha256(path.join(audioDir, 'voice.wav'));
  const timingText = fs.readFileSync(path.join(audioDir, 'timings.json'), 'utf8').replaceAll('\r\n', '\n');
  const sha = {'voice.wav': voiceSha256, 'timings.json': createHash('sha256').update(timingText).digest('hex')};
  const timings = JSON.parse(timingText);
  if (!Number.isFinite(timings.duration) || timings.duration <= 0 || !Array.isArray(timings.beats)) {
    throw new Error('Invalid timings.json');
  }

  const provenance = path.join(audioDir, 'voice.provenance.json');
  if (!fs.existsSync(provenance)) {
    return {status: 'legacy-unverified', reportedEngine: timings.engine ?? null, sha256: sha};
  }

  const record = readJson(provenance);
  const engines = ['elevenlabs', 'kokoro'];
  if (record.schemaVersion !== 1 || !isDeepStrictEqual(record.sha256, sha) ||
      !engines.includes(record.request?.engine) || !engines.includes(record.effective?.engine)) {
    throw new Error('Voice provenance does not match the voice.wav and timings.json pair');
  }
  const spec = readJson(path.join(audioDir, 'episode.json'));
  const inputs = {
    voice: spec.voice ?? null,
    lexicon: spec.lexicon ?? null,
    beats: spec.beats.map((beat) => [beat.id, beat.say, beat.gapAfter ?? null]),
  };
  if (!isDeepStrictEqual(record.request.inputs, inputs)) {
    throw new Error('Voice provenance is stale for the current script or settings. Record explicitly with --synthesize.');
  }
  return {...record, status: record.effective.engine === record.request.engine ? 'verified' : 'fallback'};
}

export function localBrowser(root, env) {
  if (env.REMOTION_CHROME) {
    const specified = path.resolve(root, env.REMOTION_CHROME);
    if (!fs.statSync(specified, {throwIfNoEntry: false})?.isFile()) throw new Error('REMOTION_CHROME must identify a local browser executable');
    return specified;
  }
  const candidates = process.platform === 'win32'
    ? [env.LOCALAPPDATA, env.ProgramFiles, env['ProgramFiles(x86)']]
      .filter(Boolean).map((dir) => path.join(dir, 'Google/Chrome/Application/chrome.exe'))
    : ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome',
      '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  const names = process.platform === 'win32' ? ['chrome.exe', 'chrome-headless-shell.exe']
    : ['google-chrome', 'chromium', 'chromium-browser', 'chrome-headless-shell'];
  for (const dir of (env.PATH ?? env.Path ?? '').split(path.delimiter).filter(Boolean)) {
    candidates.push(...names.map((name) => path.join(dir, name)));
  }
  const cloud = '/opt/pw-browsers';
  if (process.platform === 'linux' && fs.existsSync(cloud)) {
    candidates.push(...fs.readdirSync(cloud).sort().reverse().filter((name) => name.startsWith('chromium_headless_shell-'))
      .map((name) => path.join(cloud, name, 'chrome-headless-shell-linux64/chrome-headless-shell')));
  }
  const browser = candidates.find((file) => fs.statSync(file, {throwIfNoEntry: false})?.isFile());
  if (!browser) throw new Error('Set REMOTION_CHROME to an installed Chrome or Chrome Headless Shell executable');
  return path.resolve(browser);
}

export function withOutputStage(directory, name, work) {
  fs.mkdirSync(directory, {recursive: true});
  const lock = path.join(directory, `.${name}.lock`);
  fs.mkdirSync(lock);
  try {
    const stage = fs.mkdtempSync(path.join(directory, `.${name}-`));
    try {
      return work(stage);
    } finally {
      fs.rmSync(stage, {recursive: true, force: true});
    }
  } finally {
    fs.rmdirSync(lock);
  }
}

export function captureOutput({ video, manifest, stagedVideo, stage, capture }) {
  const previous = path.join(stage, 'previous.mp4');
  const nextManifest = path.join(stage, 'next.render.json');
  const hasPrevious = fs.existsSync(video);
  if (hasPrevious) fs.copyFileSync(video, previous);
  fs.renameSync(stagedVideo, video);
  try {
    capture(video, nextManifest);
    fs.renameSync(nextManifest, manifest);
  } catch (error) {
    if (hasPrevious) fs.renameSync(previous, video);
    else fs.unlinkSync(video);
    throw error;
  }
}

export function generateMusic(root, id, duration, run = runTool) {
  if (!isId(id)) throw new Error('Invalid episode ID');
  if (!Number.isFinite(duration) || duration < 2) throw new Error('Music duration must be at least 2 seconds');
  const dir = path.join(root, 'public/episodes', id);
  const spec = readJson(path.join(dir, 'episode.json'));
  if (spec.audio) throw new Error('This episode uses shared audio. Generate music for the source episode explicitly.');
  if (fs.existsSync(path.join(dir, 'music.lock'))) throw new Error('music.lock protects the existing music');
  const left = [
    '0.16*sin(2*PI*55*t)*(0.6+0.4*sin(2*PI*t/16))', '0.10*sin(2*PI*110*t)',
    '0.07*sin(2*PI*130.81*t)*(0.5+0.5*sin(2*PI*t/8))', '0.06*sin(2*PI*164.81*t)*(0.5+0.5*sin(2*PI*t/11+1))',
    '0.05*sin(2*PI*196*t)*(0.5+0.5*sin(2*PI*t/13+2))', '0.035*sin(2*PI*246.94*t)*(0.5+0.5*sin(2*PI*t/7+3))',
  ].join('+');
  const right = [
    '0.16*sin(2*PI*55.2*t)*(0.6+0.4*sin(2*PI*t/16))', '0.10*sin(2*PI*110.3*t)',
    '0.07*sin(2*PI*130.6*t)*(0.5+0.5*sin(2*PI*t/9))', '0.06*sin(2*PI*165.1*t)*(0.5+0.5*sin(2*PI*t/12+1))',
    '0.05*sin(2*PI*196.3*t)*(0.5+0.5*sin(2*PI*t/14+2))', '0.035*sin(2*PI*247.2*t)*(0.5+0.5*sin(2*PI*t/6+3))',
  ].join('+');
  withOutputStage(dir, 'music', (stage) => {
    const file = path.join(stage, 'music.wav');
    run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi',
      '-i', `aevalsrc='${left}|${right}':s=48000:d=${duration}`,
      '-f', 'lavfi', '-i', `anoisesrc=c=pink:a=0.02:d=${duration}:r=48000`,
      '-filter_complex', '[1]lowpass=f=600,aformat=channel_layouts=stereo[n];[0][n]amix=inputs=2:normalize=0,' +
        `lowpass=f=2400,aecho=0.8:0.7:120|260:0.35|0.25,afade=t=in:d=1.5,afade=t=out:st=${duration - 2}:d=2,loudnorm=I=-26:TP=-3`,
      '-ar', '48000', file], {cwd: root});
    fs.renameSync(file, path.join(dir, 'music.wav'));
  });
  console.log(`music -> public/episodes/${id}/music.wav`);
}

if (isEntry(import.meta.url)) {
  try {
    const [command, id, duration = '62', ...extra] = process.argv.slice(2);
    if (command !== 'music' || !id || extra.length) throw new Error('Usage: node scripts/render-tools.mjs music <episode_id> [seconds]');
    generateMusic(ROOT, id, Number(duration));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
