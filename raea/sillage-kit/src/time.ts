/** Time, easing and word anchors. timings.json is in SECONDS, words grouped by beat. */
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ramp = (t: number, at: number, d: number) => clamp01((t - at) / Math.max(1e-6, d));
export const out3 = (x: number) => 1 - Math.pow(1 - x, 3);
export const inOut3 = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const inOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const rad = (d: number) => (d * Math.PI) / 180;
export const hash = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export type V3 = [number, number, number];

export type Word = { w: string; start: number; end: number };
export type Beat = { id: string; start: number; end: number; words: Word[] };
export type Timings = { duration: number; beats: Beat[] };

const strip = (s: string) => s.replace(/[.,…:;?!"”“]+$/, "").replace(/^["“]/, "");

/**
 * Anchors are strings, so they can live in reel.json and be checked by tools/validate.mjs:
 *   "start"                 → 0
 *   "beat"                  → the beat's start − lead (cuts land just before the line)
 *   "beat:word" / "beat:word#2" → that word's start (exact token, or without trailing punctuation)
 *   "beat:end"              → the beat's end
 *   any of these + "+0.3" / "-0.2" → offset in seconds
 */
export function makeAnchors(T: Timings, lead = 0.12) {
  const beats: Record<string, Beat> = Object.fromEntries(T.beats.map((b) => [b.id, b]));
  const word = (beat: string, w: string, n = 1) => {
    const ws = beats[beat]?.words.filter((x) => x.w === w || strip(x.w) === w) ?? [];
    if (!ws[n - 1]) throw new Error(`anchor missing: "${w}" #${n} in beat ${beat}`);
    return ws[n - 1].start;
  };
  const at = (a: string | number | undefined, fallback = 0): number => {
    if (a === undefined) return fallback;
    if (typeof a === "number") return a;
    const m = /^(.*?)([+-]\d+(?:\.\d+)?)?$/.exec(a.trim())!;
    const base = m[1], off = m[2] ? parseFloat(m[2]) : 0;
    if (base === "start") return off;
    if (base === "end") return T.duration + off;
    const [beat, rest] = base.split(":");
    if (!beats[beat]) throw new Error(`anchor: no beat "${beat}" (${a})`);
    if (rest === undefined) return beats[beat].start - lead + off;
    if (rest === "end") return beats[beat].end + off;
    const [w, n] = rest.split("#");
    return word(beat, w, n ? parseInt(n, 10) : 1) + off;
  };
  return { beats, word, at };
}
