import type {Score, ScoreEvent} from './types';

export const framesPerBeat = (s: Score) => (s.meta.fps * 60) / s.meta.bpm;

/** Avertit si le tempo ne tombe pas sur des frames entières (source de flou de synchro). */
export const checkGrid = (s: Score) => {
  const fpb = framesPerBeat(s);
  if (Math.abs((fpb * 2) - Math.round(fpb * 2)) > 1e-6) {
    console.warn(
      `[pixelbeat] ${s.meta.bpm} BPM @ ${s.meta.fps} fps = ${fpb.toFixed(3)} frames/beat : ` +
        `les croches ne tombent pas sur des frames entières. Préfère 90/100/120/150 BPM à 30 fps.`
    );
  }
};

export const beatToFrame = (s: Score, beat: number) => Math.round(beat * framesPerBeat(s));
export const frameToBeat = (s: Score, frame: number) => frame / framesPerBeat(s);
export const durationInFrames = (s: Score) => beatToFrame(s, s.meta.lengthBeats);

/** Événements d'un type donné, triés. */
export const eventsOf = (s: Score, type: string) =>
  s.events.filter((e) => e.type === type).sort((a, b) => a.beat - b.beat);

/** Dernier événement de ce type déjà déclenché à `beat` (ou undefined). */
export const lastEvent = (s: Score, type: string, beat: number): ScoreEvent | undefined => {
  let out: ScoreEvent | undefined;
  for (const e of eventsOf(s, type)) if (e.beat <= beat + 1e-9) out = e;
  return out;
};

export const countEvents = (s: Score, type: string, beat: number) =>
  eventsOf(s, type).filter((e) => e.beat <= beat + 1e-9).length;

/** Enveloppe d'impact : 1 pile sur l'événement, décroît sur `decayBeats`. */
export const pulse = (beat: number, at: number, decayBeats = 0.5) => {
  const d = beat - at;
  if (d < 0 || d > decayBeats) return 0;
  return Math.pow(1 - d / decayBeats, 2);
};

/** Somme des pulses de tous les événements d'un type. */
export const pulseOf = (s: Score, type: string, beat: number, decayBeats = 0.5) =>
  Math.min(1, eventsOf(s, type).reduce((acc, e) => acc + pulse(beat, e.beat, decayBeats), 0));

/** Pulse sur chaque temps (battement de fond). */
export const beatPulse = (beat: number, decay = 0.35) => pulse(beat - Math.floor(beat), 0, decay);

/** Progression 0→1 entre deux beats, avec easing. */
export const progress = (beat: number, from: number, to: number, ease: (x: number) => number = (x) => x) =>
  ease(Math.min(1, Math.max(0, (beat - from) / (to - from))));

export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInCubic = (x: number) => x * x * x;
export const easeOutBack = (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);

// ---------- Rythmes PARTAGÉS image/son ----------
// Ces fonctions sont importées à la fois par les scènes et par le synthé :
// une secousse, une lettre, un coup de caisse claire = le même beat, par construction.

/** Roulement de caisse claire de la montée : croches -> doubles -> triples, s'arrête 1/2 temps avant la fin. */
export const rollHits = (start: number, length: number) => {
  const out: number[] = [];
  const end = start + length - 0.5;
  let b = start;
  while (b < end - 1e-9) {
    out.push(b);
    const k = (b - start) / (length - 0.5);
    b += k < 0.5 ? 0.5 : k < 0.8 ? 0.25 : 0.125;
  }
  return out;
};

/** Index du dernier coup du roulement atteint (-1 avant le premier). */
export const lastHitIndex = (hits: number[], beat: number) => {
  let i = -1;
  while (i + 1 < hits.length && hits[i + 1] <= beat + 1e-9) i++;
  return i;
};

/** Machine à écrire : TYPE_CHARS caractères par double-croche, à partir de `start`. */
export const TYPE_CHARS = 3;
export const typedChars = (beat: number, start: number) =>
  beat < start ? 0 : (Math.floor((beat - start) * 4 + 1e-9) + 1) * TYPE_CHARS;
export const typeTicks = (start: number, totalChars: number) =>
  Array.from({length: Math.ceil(totalChars / TYPE_CHARS)}, (_, i) => start + i * 0.25);
/** Délai entre l'ouverture d'un encadré et la première lettre. */
export const PANEL_TYPE_DELAY = 1;

/** Section active. */
export const sectionAt = (s: Score, beat: number) =>
  s.sections.find((x) => beat >= x.start && beat < x.start + x.length);
