// Palette fixe à RAMPES décalées en teinte (le secret du rendu "pro" en pixel art) :
// une ombre n'est pas juste plus sombre, elle tire vers le bleu/violet ; une lumière tire vers le jaune.
// On dessine en INDICES de palette, jamais en RGB libre -> zéro couleur parasite, zéro anti-aliasing.

const hex = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

export const RAMPS = {
  // du plus sombre au plus clair
  night: ['#04050d', '#090c1f', '#10163a', '#192257', '#243172', '#33408a', '#4c5299', '#6e66a8'],
  fire: ['#2a0a10', '#5e1418', '#a3201c', '#d9421f', '#ff7a2e', '#ffb84d', '#ffe08a', '#fff6d6'],
  smoke: ['#241a17', '#3a2a22', '#5e4636', '#8a6a4c', '#b8946e', '#e3c9a8'],
  ground: ['#140f0e', '#2a1f1a', '#3d2c22', '#5a4230', '#8c6a48', '#c9a77a'],
  uranium: ['#0d2410', '#163a14', '#2f6b1f', '#5fa82b', '#a9e34b', '#e8ff9e'],
  krypton: ['#1b1d5c', '#2f3696', '#4b55c4', '#7d8cf0', '#b7c5ff'],
  barium: ['#4a1030', '#8a2557', '#c94078', '#ff7aa8', '#ffc2d6'],
  ui: ['#000000', '#ffffff', '#ffd36b', '#d94a5a', '#9aa0c8'],
} as const;

export type RampName = keyof typeof RAMPS;

export const PALETTE: [number, number, number][] = [];
const offsets: Record<string, number> = {};
for (const [name, cols] of Object.entries(RAMPS)) {
  offsets[name] = PALETTE.length;
  for (const c of cols) PALETTE.push(hex(c));
}

/** Indice de palette pour la teinte `i` de la rampe (clampé). */
export const C = (ramp: RampName, i: number) => {
  const n = RAMPS[ramp].length;
  return offsets[ramp] + Math.max(0, Math.min(n - 1, Math.round(i)));
};
export const rampLen = (ramp: RampName) => RAMPS[ramp].length;

export const UI = {
  black: C('ui', 0),
  white: C('ui', 1),
  accent: C('ui', 2),
  border: C('ui', 3),
  muted: C('ui', 4),
};

// Pré-calcul RGBA pour le blit
export const PALETTE_RGBA = new Uint32Array(256);
{
  const le = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
  PALETTE.forEach(([r, g, b], i) => {
    PALETTE_RGBA[i] = le ? ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0 : ((r << 24) | (g << 16) | (b << 8) | 255) >>> 0;
  });
}
