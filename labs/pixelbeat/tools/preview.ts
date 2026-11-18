// Aperçu rapide sans Remotion : rend des beats précis en PNG (planche contact).
// Usage : npx tsx tools/preview.ts scores/demo.json 0,7.5,12,30,38,40.5,46,60 out/preview.png
import {readFileSync, mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {dirname} from 'node:path';
import {FB, W, H} from '../src/pixel/fb';
import {SCENES} from '../src/scenes';
import type {Score} from '../src/score/types';

const [scorePath, beatsArg, out = 'out/preview.png'] = process.argv.slice(2);
const score = JSON.parse(readFileSync(scorePath, 'utf8')) as Score;
const beats = beatsArg.split(',').map(Number);
const cols = Math.min(4, beats.length);
const rows = Math.ceil(beats.length / cols);
const gap = 4;
const SW = cols * (W + gap) - gap, SH = rows * (H + gap) - gap;
const sheet = new Uint32Array(SW * SH);
const tmp = new Uint32Array(W * H);
beats.forEach((b, k) => {
  const fb = new FB();
  SCENES[score.meta.scene](fb, score, b);
  fb.toRGBA(tmp);
  const ox = (k % cols) * (W + gap), oy = Math.floor(k / cols) * (H + gap);
  for (let y = 0; y < H; y++) sheet.set(tmp.subarray(y * W, y * W + W), (oy + y) * SW + ox);
});
mkdirSync(dirname(out), {recursive: true});
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${SW}x${SH}`, '-i', '-',
  '-vf', 'scale=iw*3:ih*3:flags=neighbor', out], {input: Buffer.from(sheet.buffer)});
console.log('ok', out);
