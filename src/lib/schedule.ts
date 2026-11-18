import type { EpisodeSpec, Timings, TimedAction, Camera } from './types';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const prefixMatches = (word: string, cue: string) => norm(word).startsWith(norm(cue));

type CueSheet = Pick<EpisodeSpec, 'beats' | 'composition' | 'da' | 'scenes'>;

export function assertCueStructure(spec: CueSheet, composition = spec.composition, da = spec.da ?? 1) {
  if (!spec.beats?.length) throw new Error('episode has no beats');
  if (composition === 'Money') {
    const first = spec.beats[0];
    if (!first.scene || !Object.prototype.hasOwnProperty.call(spec.scenes ?? {}, first.scene) || !spec.scenes?.[first.scene]) {
      throw new Error(`first beat ${first.id} must select a declared scene`);
    }
  }
  if (composition === 'Episode' && da >= 2 && !spec.beats.some((b) => b.camera)) {
    throw new Error('DA 2 requires at least one Atlas camera');
  }
}

/** Order timing records by cue-sheet ID and validate the measured timeline. */
export function alignTimings(spec: Pick<CueSheet, 'beats'>, timings: Timings): Timings {
  if (!timings || !Number.isFinite(timings.duration) || timings.duration <= 0 || !Array.isArray(timings.beats)) {
    throw new Error('invalid timings: expected a positive duration and a beats array');
  }
  if (timings.beats.length !== spec.beats.length) {
    throw new Error(`timings.json has ${timings.beats.length} beats, episode.json has ${spec.beats.length}: re-run the voice`);
  }

  const byId = new Map<string, Timings['beats'][number]>();
  for (const beat of timings.beats) {
    if (typeof beat?.id !== 'string' || !beat.id.trim()) throw new Error('timings: beat ID is missing');
    if (byId.has(beat.id)) throw new Error(`timings: duplicate beat ID "${beat.id}"`);
    byId.set(beat.id, beat);
  }

  // Timing generation rounds word bounds and WAV duration separately to milliseconds.
  const maxEnd = timings.duration + 0.001 + Number.EPSILON * timings.duration;
  let previousEnd = 0;
  const beats = spec.beats.map(({ id }) => {
    const beat = byId.get(id);
    if (!beat) throw new Error(`timings: missing record for beat ${id}`);
    byId.delete(id);
    if (!Number.isFinite(beat.start) || !Number.isFinite(beat.end) ||
        beat.start < previousEnd || beat.end <= beat.start || beat.end > maxEnd) {
      throw new Error(`timings: invalid or non-chronological range for beat ${id}`);
    }
    if (!Array.isArray(beat.words) || !beat.words.length) throw new Error(`timings: missing words for beat ${id}`);
    let previousStart = beat.start;
    for (const word of beat.words) {
      if (typeof word?.w !== 'string' || !word.w.trim() || !Number.isFinite(word.start) ||
          !Number.isFinite(word.end) || word.start < previousStart || word.end < word.start || word.end > beat.end) {
        throw new Error(`timings: invalid or non-chronological word in beat ${id}`);
      }
      previousStart = word.start;
    }
    previousEnd = beat.end;
    return beat;
  });
  return { ...timings, beats };
}

type ScheduleOptions = { composition?: string; da?: number; scriptOnly?: boolean };

/** Resolve cues in source order. Draft preflight can use ordinal word positions instead of measured seconds. */
export function schedule(spec: CueSheet, timings: Timings, { composition, da, scriptOnly = false }: ScheduleOptions = {}) {
  assertCueStructure(spec, composition, da);
  const { beats, duration } = alignTimings(spec, timings);
  const allWords = beats.flatMap((beat) => beat.words);
  const actions: TimedAction[] = [];
  const cameras: { t: number; cam: Camera }[] = [];
  const dates: { t: number; date: string }[] = [];

  spec.beats.forEach((b, i) => {
    const bt = beats[i];
    if (b.camera) cameras.push({ t: Math.max(0, bt.start - 0.15), cam: b.camera });
    if (b.date) dates.push({ t: bt.start, date: b.date });
    for (const a of b.actions ?? []) {
      const { atWord, occurrence = 1, atTime } = a;
      if (!Number.isInteger(occurrence) || occurrence < 1) {
        throw new Error(`occurrence must be a positive integer in beat ${b.id} · ${a.type}`);
      }
      let t = bt.start;
      if (atWord !== undefined) {
        if (typeof atWord !== 'string' || !atWord.trim()) throw new Error(`invalid atWord in beat ${b.id} · ${a.type}`);
        const exact = bt.words.filter((x) => x.w.toLowerCase() === atWord.toLowerCase());
        const pool = exact.length ? exact : bt.words.filter((x) => prefixMatches(x.w, atWord));
        const word = pool[occurrence - 1];
        if (!word) throw new Error(`atWord "${atWord}" not found in beat ${b.id}${occurrence > 1 ? ` (occurrence ${occurrence})` : ''}`);
        t = word.start;
      }
      if (atTime !== undefined) {
        if (!Number.isFinite(atTime) || atTime < 0 || (!scriptOnly && atTime > duration)) {
          throw new Error(`invalid atTime in beat ${b.id} · ${a.type}: expected seconds within the narration`);
        }
        if (!scriptOnly) t = atTime;
      }

      const followTime = (key: 'retreatWord' | 'stampWord', cue: string) => {
        const start = scriptOnly && atTime !== undefined ? 0 : t;
        const word = typeof cue === 'string' && cue.trim()
          ? allWords.find((w) => w.start >= start && prefixMatches(w.w, cue))
          : undefined;
        if (!word) throw new Error(`${key} "${cue}" not found at or after the action in beat ${b.id}`);
        return word.start;
      };

      let extra: { retreatAt?: number; stampAt?: number } = {};
      if (a.type === 'units' && a.retreatWord !== undefined) extra = { retreatAt: followTime('retreatWord', a.retreatWord) };
      if ((a.type === 'portrait' || a.type === 'callout') && a.stampWord !== undefined) extra = { stampAt: followTime('stampWord', a.stampWord) };
      actions.push({ ...a, ...extra, t, beat: b.id });
      if (a.type === 'date') dates.push({ t, date: a.date });
      if (a.type === 'declare' && a.date) dates.push({ t, date: a.date });
    }
  });
  dates.sort((a, b) => a.t - b.t);
  return { actions, cameras, dates };
}

export type Schedule = ReturnType<typeof schedule>;

export const dateToNum = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return Date.UTC(y, (m || 7) - 1, day || 1); // year-only dates sit mid-year
};
