import type { EpisodeSpec, Timings, TimedAction, Camera } from './types';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Resolve every action of every beat to an absolute time using word timings. */
export function schedule(spec: EpisodeSpec, timings: Timings) {
  const actions: TimedAction[] = [];
  const cameras: { t: number; cam: Camera }[] = [];
  const dates: { t: number; date: string }[] = [];
  spec.beats.forEach((b, i) => {
    const bt = timings.beats.find((x) => x.id === b.id) ?? timings.beats[i];
    if (b.camera) cameras.push({ t: Math.max(0, bt.start - 0.15), cam: b.camera });
    if (b.date) dates.push({ t: bt.start, date: b.date });
    for (const a of b.actions ?? []) {
      let t = bt.start;
      if ('atWord' in a && a.atWord) {
        // exact token (with punctuation) wins over prefix match; `occurrence` picks the n-th match (1-based)
        const exact = bt.words.filter((x) => x.w.toLowerCase() === a.atWord!.toLowerCase());
        const prefix = bt.words.filter((x) => norm(x.w).startsWith(norm(a.atWord!)));
        const pool = exact.length ? exact : prefix;
        const w = pool[((a as any).occurrence ?? 1) - 1];
        if (!w) throw new Error(`atWord "${a.atWord}" not found in beat ${b.id}`);
        t = w.start;
      }
      if (typeof (a as any).atTime === 'number') t = (a as any).atTime;
      const wordT = (word: string) => {
        for (const bb of timings.beats) { const w = bb.words.find((x) => x.start >= t - 0.01 && norm(x.w).startsWith(norm(word))); if (w) return w.start; }
        throw new Error(`word "${word}" not found after ${b.id}`);
      };
      const extra: Record<string, number> = {};
      if (a.type === 'units' && a.retreatWord) extra.retreatAt = wordT(a.retreatWord);
      if ((a.type === 'portrait' || a.type === 'callout' || a.type === 'wanted') && a.stampWord) extra.stampAt = wordT(a.stampWord);
      // later moments of one cue, each named by the word that triggers it (searched from the cue onwards)
      for (const [w, k] of [['stairsWord', 'stairsAt'], ['dropWord', 'dropAt'], ['strikeWord', 'strikeAt'], ['pickWord', 'pickAt'], ['openWord', 'openAt'], ['sinkWord', 'sinkAt']] as const) {
        const word = (a as any)[w]; if (typeof word === 'string') extra[k] = wordT(word);
      }
      const more: Record<string, unknown> = {};
      if (a.type === 'verdict' && a.picks) more.picks = a.picks.map((p) => ({ ...p, at: p.word ? wordT(p.word) : p.at ?? t }));
      actions.push({ ...a, ...extra, ...more, t, beat: b.id } as TimedAction);
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
