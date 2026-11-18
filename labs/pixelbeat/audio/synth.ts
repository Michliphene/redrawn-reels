// Synthé chiptune "sans dépendance" : lit la MÊME partition que l'image et écrit un WAV.
// Usage : npx tsx audio/synth.ts scores/demo.json public/audio/demo.wav
// Musique (batterie/basse/arpège/lead) pilotée par les sections, SFX pilotés par les événements.
// Comme tout part des mêmes beats, chaque son tombe sur la frame exacte de son visuel.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import type {Score, Section} from '../src/score/types';
import {PANEL_TYPE_DELAY, rollHits, typeTicks} from '../src/score/timing';

const [scorePath, outPath] = process.argv.slice(2);
const S = JSON.parse(readFileSync(scorePath, 'utf8')) as Score;
const SR = 48000;
const spb = 60 / S.meta.bpm; // secondes par beat
const total = Math.ceil((S.meta.lengthBeats * spb + 1.5) * SR);
const music = new Float32Array(total);
const sfx = new Float32Array(total);
const at = (beat: number) => Math.round(beat * spb * SR);
const mtof = (m: number) => 440 * 2 ** ((m - 69) / 12);

// ---------- oscillateurs façon NES ----------
const pulseOsc = (ph: number, duty: number) => ((ph % 1) < duty ? 1 : -1);
const triOsc = (ph: number) => { // triangle quantifié 16 pas = grain 8-bit
  const p = ph % 1;
  const v = p < 0.5 ? p * 4 - 1 : 3 - p * 4;
  return Math.round(v * 7.5) / 7.5;
};
let lfsr = 1;
const noiseStep = (short = false) => {
  const bit = (lfsr ^ (lfsr >> (short ? 6 : 1))) & 1;
  lfsr = (lfsr >> 1) | (bit << 14);
  return lfsr & 1 ? 1 : -1;
};

type Voice = {
  buf: Float32Array; start: number; dur: number; gain: number;
  freq: (t: number) => number; // Hz en fonction du temps (s)
  wave: 'pulse' | 'tri' | 'noise' | 'sine'; duty?: number; noiseRate?: number; shortNoise?: boolean;
  env?: (t: number, d: number) => number; lowpass?: (t: number) => number;
};
const play = (v: Voice) => {
  const n = Math.round(v.dur * SR);
  let ph = 0, held = 0, acc = 0, lp = 0;
  const env = v.env ?? ((t, d) => Math.min(1, t / 0.004) * Math.max(0, 1 - t / d));
  for (let i = 0; i < n; i++) {
    const idx = v.start + i;
    if (idx >= v.buf.length) break;
    const t = i / SR;
    const f = v.freq(t);
    let s: number;
    if (v.wave === 'noise') {
      acc += (v.noiseRate ?? f) / SR;
      while (acc >= 1) { acc -= 1; held = noiseStep(v.shortNoise); }
      s = held;
    } else {
      ph += f / SR;
      s = v.wave === 'pulse' ? pulseOsc(ph, v.duty ?? 0.5) : v.wave === 'tri' ? triOsc(ph) : Math.sin(ph * 2 * Math.PI);
    }
    if (v.lowpass) { const a = 1 - Math.exp((-2 * Math.PI * v.lowpass(t)) / SR); lp += a * (s - lp); s = lp; }
    v.buf[idx] += s * v.gain * env(t, v.dur);
  }
};

// ---------- théorie minimale ----------
const NOTE: Record<string, number> = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11};
const chordNotes = (name: string) => {
  const m = name.match(/^([A-G])([#b]?)(m?)/)!;
  const root = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return {root, tones: m[3] ? [0, 3, 7] : [0, 4, 7]};
};
const chordAt = (beat: number) => chordNotes(S.chords[Math.floor(beat / S.meta.beatsPerBar) % S.chords.length]);

// ---------- instruments ----------
const kick = (b: number, g = 0.9) => play({buf: music, start: at(b), dur: 0.16, gain: g, wave: 'sine',
  freq: (t) => 45 + 140 * Math.exp(-t * 35), env: (t, d) => Math.max(0, 1 - t / d) ** 1.5});
const snare = (b: number, g = 0.45) => {
  play({buf: music, start: at(b), dur: 0.14, gain: g, wave: 'noise', freq: () => 0, noiseRate: 18000});
  play({buf: music, start: at(b), dur: 0.08, gain: g * 0.6, wave: 'tri', freq: (t) => 190 - 300 * t});
};
const hat = (b: number, g = 0.16) => play({buf: music, start: at(b), dur: 0.035, gain: g, wave: 'noise',
  freq: () => 0, noiseRate: 40000, shortNoise: true});

const renderSection = (sec: Section) => {
  const m = sec.music;
  for (let bt = sec.start; bt < sec.start + sec.length; bt++) {
    const inBar = bt % S.meta.beatsPerBar;
    const ch = chordAt(bt);
    if (m.drums === 'four') { kick(bt); if (inBar % 2 === 1) snare(bt); hat(bt + 0.5); }
    if (m.drums === 'hats') { hat(bt + 0.5, 0.12); if (inBar === 0) kick(bt, 0.5); }
    if (m.drums === 'break') {
      if (inBar === 0 || (inBar === 2 && bt % 8 >= 4)) kick(bt);
      if (inBar === 2 && bt % 8 < 4) kick(bt + 0.5);
      if (inBar % 2 === 1) snare(bt);
      for (let q = 0; q < 4; q++) hat(bt + q * 0.25, q % 2 ? 0.08 : 0.13);
    }
    if (m.bass) {
      [0, 0.5].forEach((o, k) => play({buf: music, start: at(bt + o), dur: spb * 0.45, gain: 0.42, wave: 'tri',
        freq: () => mtof(33 + ch.root + (k === 1 && inBar === 3 ? 12 : 0))}));
    }
    if (m.arp) {
      for (let q = 0; q < 4; q++) {
        const tone = ch.tones[(bt * 4 + q) % 3] + (q === 3 ? 12 : 0);
        play({buf: music, start: at(bt + q * 0.25), dur: spb * 0.22, gain: 0.07, wave: 'pulse', duty: 0.25,
          freq: () => mtof(69 + ch.root + tone - 12)});
      }
    }
    if (m.lead && inBar % 2 === 0) {
      const tone = ch.tones[Math.floor((bt / 2) * 7) % 3];
      play({buf: music, start: at(bt), dur: spb * 1.8, gain: 0.08, wave: 'pulse', duty: 0.5,
        freq: (t) => mtof(81 + ch.root + tone) * (1 + 0.006 * Math.sin(t * 34)), // vibrato
        env: (t, d) => Math.min(1, t / 0.01) * (t > d - 0.08 ? (d - t) / 0.08 : 0.85)});
    }
  }
};

// ---------- SFX pilotés par les événements ----------
const PENTA = [0, 3, 5, 7, 10];
let splitIdx = 0;
const hitBeat = S.events.find((e) => e.type === 'hit')?.beat;
for (const e of [...S.events].sort((a, b) => a.beat - b.beat)) {
  const b = e.beat;
  switch (e.type) {
    case 'neutron': // souffle qui monte jusqu'à l'impact
      if (hitBeat !== undefined) play({buf: sfx, start: at(b), dur: (hitBeat - b) * spb, gain: 0.25, wave: 'noise',
        freq: () => 0, noiseRate: 12000, lowpass: (t) => 300 + t * 2500, env: (t, d) => (t / d) ** 2});
      break;
    case 'hit':
      play({buf: sfx, start: at(b), dur: 0.35, gain: 0.5, wave: 'pulse', duty: 0.5, freq: (t) => 880 * Math.exp(-t * 9)});
      play({buf: sfx, start: at(b), dur: 0.25, gain: 0.35, wave: 'noise', freq: () => 0, noiseRate: 9000});
      break;
    case 'split': { // un blip par génération, la hauteur grimpe : on ENTEND l'exponentielle
      const k = splitIdx++;
      const midi = 69 + PENTA[k % 5] + 12 * Math.min(2, Math.floor(k / 5 / 2));
      play({buf: sfx, start: at(b), dur: 0.11, gain: 0.22, wave: 'pulse', duty: 0.125,
        freq: (t) => mtof(midi) * (1 + 2 * Math.exp(-t * 60))});
      play({buf: sfx, start: at(b), dur: 0.02, gain: 0.2, wave: 'noise', freq: () => 0, noiseRate: 30000});
      break;
    }
    case 'riser': { // montée ; s'arrête une demi-temps AVANT le boom = le silence qui rend le drop énorme
      const len = ((e.length as number) - 0.5) * spb;
      play({buf: sfx, start: at(b), dur: len, gain: 0.35, wave: 'noise', freq: () => 0, noiseRate: 20000,
        lowpass: (t) => 200 + (t / len) ** 2 * 9000, env: (t, d) => (t / d) ** 1.5});
      play({buf: sfx, start: at(b), dur: len, gain: 0.12, wave: 'pulse', duty: 0.5,
        freq: (t) => 110 * 2 ** ((t / len) * 3), env: (t, d) => (t / d) ** 2});
      // roulement de caisse claire : MÊMES coups que la secousse et le compteur à l'image
      const hits = rollHits(b, e.length as number);
      hits.forEach((h, i) => {
        const g = 0.18 + 0.3 * (i / hits.length);
        play({buf: sfx, start: at(h), dur: 0.07, gain: g, wave: 'noise', freq: () => 0, noiseRate: 16000});
        play({buf: sfx, start: at(h), dur: 0.05, gain: g * 0.5, wave: 'tri', freq: (t) => 220 - 400 * t});
      });
      break;
    }
    case 'boom':
      play({buf: sfx, start: at(b), dur: 3.5, gain: 0.9, wave: 'noise', freq: () => 0, noiseRate: 6000,
        lowpass: (t) => 2500 * Math.exp(-t * 1.4) + 120, env: (t, d) => Math.max(0, 1 - t / d) ** 2});
      play({buf: sfx, start: at(b), dur: 2.2, gain: 1.0, wave: 'sine', freq: (t) => 28 + 70 * Math.exp(-t * 2.5),
        env: (t, d) => Math.max(0, 1 - t / d) ** 1.2});
      break;
    case 'title':
    case 'panel': {
      // "pop" à l'ouverture de la boîte + un tic par groupe de lettres (mêmes temps que l'image)
      play({buf: sfx, start: at(b), dur: 0.09, gain: 0.16, wave: 'pulse', duty: 0.25, freq: (t) => 440 + 2600 * t});
      const lines = (e.lines as (string | [string, string])[]).map((l) => (Array.isArray(l) ? l[0] : l));
      const total = lines.join('').length;
      typeTicks(b + PANEL_TYPE_DELAY, total).forEach((tb, i) => play({buf: sfx, start: at(tb), dur: 0.025,
        gain: 0.09, wave: 'pulse', duty: 0.5, freq: () => (i % 2 ? 1568 : 1760)}));
      break;
    }
  }
}
S.sections.forEach(renderSection);

// ---------- mixage ----------
const out = new Float32Array(total);
let peak = 0;
for (let i = 0; i < total; i++) {
  out[i] = Math.tanh((music[i] * 0.55 + sfx[i] * 0.8) * 1.2); // saturation douce = colle tout ensemble
  peak = Math.max(peak, Math.abs(out[i]));
}
const norm = 0.89 / (peak || 1); // -1 dBFS
const wav = Buffer.alloc(44 + total * 2);
wav.write('RIFF', 0); wav.writeUInt32LE(36 + total * 2, 4); wav.write('WAVE', 8); wav.write('fmt ', 12);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(SR, 24);
wav.writeUInt32LE(SR * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36);
wav.writeUInt32LE(total * 2, 40);
for (let i = 0; i < total; i++) wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[i] * norm)) * 32767), 44 + i * 2);
mkdirSync(dirname(outPath), {recursive: true});
writeFileSync(outPath, wav);
console.log(`ok ${outPath} — ${(total / SR).toFixed(1)} s, ${S.meta.bpm} BPM, ${splitIdx} splits`);
