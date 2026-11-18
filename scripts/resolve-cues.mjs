#!/usr/bin/env node
// Export the authored cue sheet resolved against the real narration timings (seconds).
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

const [id, ...extra] = process.argv.slice(2);
if (!id || extra.length || !/^[a-z0-9][a-z0-9_-]*$/i.test(id)) {
  console.error('usage: node scripts/resolve-cues.mjs <episodeId>');
  process.exitCode = 2;
} else {
  try {
    const spec = readJson(`episodes/${id}/episode.json`);
    const media = episodeMedia(id, spec);
    const timings = readJson(media.timings);
    const composition = compositionOf(spec);
    const da = spec.da ?? 1;
    const resolved = schedule(spec, timings, { composition, da });
    console.log(JSON.stringify({ id, audioId: media.audioId, composition, da, duration: timings.duration, ...resolved }, null, 2));
  } catch (error) {
    console.error(`${id}: ${error.message}`);
    process.exitCode = 1;
  }
}
