#!/usr/bin/env node
// Export render-input cues in seconds, after the map composition's asset checks.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { compositionOf } from './validate.mjs';

const require = createRequire(import.meta.url);
const { schedule } = require('../src/lib/schedule.ts');
const { episodeMedia } = require('../src/lib/media.ts');

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const readJson = (filename) => JSON.parse(fs.readFileSync(path.join(publicDir, filename), 'utf8'));

function fileSize(filename) {
  const asset = path.join(publicDir, filename);
  try {
    const stat = fs.statSync(asset);
    if (!stat.isFile()) return undefined;
    fs.accessSync(asset, fs.constants.R_OK);
    return stat.size;
  } catch {
    return undefined;
  }
}

function hasFlag(code) {
  const filename = `assets/flags/${code}.svg`;
  if (fileSize(filename) === undefined) return false;
  return fs.readFileSync(path.join(publicDir, filename), 'utf8').includes('<svg');
}

// Mirror Episode metadata in Root.tsx. Static JSON and PNG response MIME types
// come from their extensions, so neither check inspects the file contents.
function filterMapAssets(spec) {
  const beats = spec.beats.map((beat) => {
    const actions = [];
    for (const action of beat.actions ?? []) {
      if (action.type === 'portrait' && (fileSize(`assets/portraits/${action.key}.jpg`) ?? 0) <= 1000) continue;
      if (action.emoji && fileSize(`assets/emoji/${action.emoji}.json`) === undefined &&
          fileSize(`assets/emoji/${action.emoji}.png`) === undefined) continue;
      if (action.type === 'flagSwap' && (!hasFlag(action.from) || !hasFlag(action.to))) continue;
      const kept = { ...action };
      if (kept.flag && !hasFlag(kept.flag)) delete kept.flag;
      actions.push(kept);
    }
    return { ...beat, actions };
  });
  return { ...spec, beats };
}

const [id, ...extra] = process.argv.slice(2);
const validDa = extra.length === 2 && extra[0] === '--da' && ['1', '2'].includes(extra[1]);
if (!id || !/^[a-z0-9][a-z0-9_-]*$/i.test(id) || (extra.length && !validDa)) {
  console.error('usage: node scripts/resolve-cues.mjs <episodeId> [--da 1|2]');
  process.exitCode = 2;
} else {
  try {
    const spec = readJson(`episodes/${id}/episode.json`);
    const media = episodeMedia(id, spec);
    const timings = readJson(media.timings);
    const composition = compositionOf(spec);
    const da = validDa ? Number(extra[1]) : spec.da ?? 1;
    const renderSpec = composition === 'Episode' ? filterMapAssets(spec) : spec;
    const resolved = schedule(renderSpec, timings, { composition, da });
    console.log(JSON.stringify({ id, audioId: media.audioId, composition, da, duration: timings.duration, ...resolved }, null, 2));
  } catch (error) {
    console.error(`${id}: ${error.message}`);
    process.exitCode = 1;
  }
}
