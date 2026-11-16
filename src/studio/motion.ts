/**
 * Motion vocabulary shared by every engine. Everything is a pure function of time in seconds,
 * so a frame always renders the same way whatever order frames are rendered in.
 */
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** 0→1 progress of a window starting at t0 and lasting d seconds */
export const ramp = (t: number, t0: number, d: number) => clamp01((t - t0) / Math.max(1e-6, d));

export const ease = {
  out3: (x: number) => 1 - Math.pow(1 - x, 3),
  out5: (x: number) => 1 - Math.pow(1 - x, 5),
  in3: (x: number) => x * x * x,
  inOut3: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  /** overshoots then settles (c = how far past 1) */
  back: (x: number, c = 1.9) => 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2),
  /** two decaying bounces: a piece dropped on the table */
  bounce: (x: number) => {
    const n = 7.5625, d = 2.75;
    if (x < 1 / d) return n * x * x;
    if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
    if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
    return n * (x -= 2.625 / d) * x + 0.984375;
  },
};

/** 0→1 with overshoot, starting at t0 */
export const pop = (t: number, t0: number, d = 0.35) => (t < t0 ? 0 : ease.back(ramp(t, t0, d)));
/** eased 0→1 */
export const rise = (t: number, t0: number, d = 0.5) => ease.out3(ramp(t, t0, d));
/** opacity of something shown at t0 for `hold` seconds (hold undefined = stays) */
export const life = (t: number, t0: number, hold?: number, fadeIn = 0.15, fadeOut = 0.25) => {
  if (t < t0) return 0;
  const a = ramp(t, t0, fadeIn);
  return hold == null ? a : Math.min(a, 1 - ramp(t, t0 + hold, fadeOut));
};
/** 0→1→0 impulse: fast attack, slow release */
export const hit = (t: number, t0: number, attack = 0.1, release = 0.5) =>
  t < t0 ? 0 : t < t0 + attack ? (t - t0) / attack : 1 - ramp(t, t0 + attack, release);
/** a jump: up and back down on a parabola, 0 outside [t0, t0+d] */
export const hop = (t: number, t0: number, d = 0.45) => {
  const p = (t - t0) / d;
  return p <= 0 || p >= 1 ? 0 : 4 * p * (1 - p);
};

/** deterministic 0–1 hash of an integer (stable "random" per element) */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** slow organic drift in [-1, 1]; different `seed` = different curve */
export const drift = (t: number, seed = 0, speed = 1) =>
  (Math.sin(t * 0.61 * speed + seed * 1.7) + Math.sin(t * 0.37 * speed + seed * 4.1) * 0.6 + Math.sin(t * 1.13 * speed + seed * 2.3) * 0.25) / 1.85;
/** decaying camera shake amplitude 0→amount→0 */
export const shake = (t: number, t0: number, amount = 1, d = 0.7) => (t < t0 ? 0 : amount * (1 - ease.out3(ramp(t, t0, d))));

export const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(v.slice(0, 2), 16) / 255, parseInt(v.slice(2, 4), 16) / 255, parseInt(v.slice(4, 6), 16) / 255];
};
/** mix two hex colours in sRGB (good enough for flat art; avoids the grey midpoint by passing through white if asked) */
export const mixHex = (a: string, b: string, p: number): string => {
  const x = hexToRgb(a), y = hexToRgb(b);
  const c = x.map((v, i) => Math.round(lerp(v, y[i], clamp01(p)) * 255));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};
export const shade = (hex: string, k: number) => mixHex(hex, k < 0 ? '#000000' : '#ffffff', Math.abs(k));
