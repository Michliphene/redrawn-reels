import {C, PALETTE_RGBA, RampName, rampLen, UI} from './palette';
import {drawText, textWidth} from './font';

export const W = 180;
export const H = 320;
export const SCALE = 6; // 180x320 x6 = 1080x1920 (mesuré sur @bit_wonder : pixels de 6x6)

// Matrice de Bayer 4x4 : le tramage ordonné, stable d'une frame à l'autre (pas de grouillement).
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
export const bayer = (x: number, y: number) => BAYER[((y & 3) << 2) | (x & 3)];

/** Hash déterministe -> [0,1). Même seed = même vidéo, toujours. */
export const hash = (a: number, b = 0, c = 0) => {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** Bruit de valeur 1D lissé (pour bords organiques). */
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u;
};

export class FB {
  buf = new Uint8Array(W * H);
  ox = 0; // décalage caméra (entier !)
  oy = 0;

  clear(c: number) { this.buf.fill(c); }

  set(x: number, y: number, c: number) {
    x = Math.round(x + this.ox);
    y = Math.round(y + this.oy);
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    this.buf[y * W + x] = c;
  }

  rect(x: number, y: number, w: number, h: number, c: number) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }

  /** Mélange tramé de deux couleurs, t ∈ [0,1]. */
  dither(x: number, y: number, a: number, b: number, t: number) {
    this.set(x, y, bayer(Math.round(x + this.ox), Math.round(y + this.oy)) < t ? b : a);
  }

  /** Ciel / fond : dégradé vertical en bandes tramées sur une rampe. */
  gradientV(y0: number, y1: number, ramp: RampName, from: number, to: number) {
    for (let y = y0; y < y1; y++) {
      const v = from + ((to - from) * (y - y0)) / Math.max(1, y1 - y0 - 1);
      const lo = Math.floor(v);
      for (let x = 0; x < W; x++) this.dither(x - this.ox, y - this.oy, C(ramp, lo), C(ramp, lo + 1), v - lo);
    }
  }

  disc(cx: number, cy: number, r: number, c: number) {
    const r2 = r * r;
    for (let y = Math.floor(-r); y <= r; y++)
      for (let x = Math.floor(-r); x <= r; x++) if (x * x + y * y <= r2 + r * 0.8) this.set(cx + x, cy + y, c);
  }

  /** Sphère ombrée sur une rampe, lumière en haut à gauche, transitions tramées. */
  sphere(cx: number, cy: number, r: number, ramp: RampName, bright = 0) {
    const n = rampLen(ramp);
    const r2 = r * r;
    for (let y = Math.floor(-r); y <= r; y++)
      for (let x = Math.floor(-r); x <= r; x++) {
        const d2 = x * x + y * y;
        if (d2 > r2 + r * 0.8) continue;
        const z = Math.sqrt(Math.max(0, r2 - d2)) / r;
        const l = Math.max(0, (-x * 0.5 - y * 0.6 + z * 0.8 * r) / r); // lambert simplifié
        const v = Math.min(n - 1, Math.max(0, l * (n - 1) * 0.95 + bright * (n - 1)));
        const lo = Math.floor(v);
        this.dither(cx + x, cy + y, C(ramp, lo), C(ramp, lo + 1), v - lo);
      }
    // contour sombre 1px = lisibilité "sprite"
    this.ring(cx, cy, r + 1, C(ramp, 0));
  }

  ring(cx: number, cy: number, r: number, c: number) {
    const steps = Math.max(12, Math.ceil(r * 7));
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      this.set(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), c);
    }
  }

  /** Masse organique (nuage, feu) : rayon bruité + dégradé radial tramé sur une rampe. */
  blob(cx: number, cy: number, r: number, ramp: RampName, seed: number, wobble = 0.18, hot = 1,
    ramp2?: RampName, mix = 0) {
    // ramp2/mix : fondu TRAMÉ vers une 2e rampe (feu -> fumée) sans coupure brutale
    const n = rampLen(ramp);
    const n2 = ramp2 ? rampLen(ramp2) : n;
    for (let y = Math.floor(-r * 1.3); y <= r * 1.3; y++)
      for (let x = Math.floor(-r * 1.3); x <= r * 1.3; x++) {
        const a = Math.atan2(y, x);
        const rr = r * (1 - wobble + wobble * 2 * noise1((a + Math.PI) * 2.2, seed));
        const d = Math.sqrt(x * x + y * y);
        if (d > rr) continue;
        const k = 1 - d / rr; // 0 au bord, 1 au centre
        const lift = (-y / r) * 0.25 + (-x / r) * 0.1; // lumière haut-gauche
        const use2 = ramp2 && bayer(Math.round(cx + x + this.ox), Math.round(cy + y + this.oy)) < mix;
        const nn = use2 ? n2 : n;
        const v = Math.min(nn - 1, Math.max(0, (k * 0.85 + lift) * (nn - 1) * (use2 ? 1 : hot)));
        const lo = Math.floor(v);
        const rr2 = use2 ? ramp2! : ramp;
        this.set(cx + x, cy + y, bayer(Math.round(cx + x + this.ox) + 2, Math.round(cy + y + this.oy) + 1) < v - lo
          ? C(rr2, lo + 1) : C(rr2, lo));
      }
  }

  line(x0: number, y0: number, x1: number, y1: number, c: number) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  /** Texte avec ombre portée 1px (lisibilité sur n'importe quel fond). */
  text(t: string, x: number, y: number, c: number, scale = 1, shadow: number | null = UI.black) {
    if (shadow !== null) drawText((px, py) => this.set(px + 1, py + 1, shadow), t, x, y, scale);
    drawText((px, py) => this.set(px, py, c), t, x, y, scale);
  }

  textCenter(t: string, cx: number, y: number, c: number, scale = 1, shadow: number | null = UI.black) {
    this.text(t, Math.round(cx - (textWidth(t) * scale) / 2), y, c, scale, shadow);
  }

  /**
   * Encadré titre façon jeu vidéo, fixé à l'écran (ne tremble pas).
   * `open` 0→1 = largeur de la boîte ; `chars` = nb de caractères tapés (machine à écrire synchro).
   */
  panel(lines: [string, number][], cy: number, open: number, chars: number) {
    if (open <= 0) return;
    const sox = this.ox, soy = this.oy;
    this.ox = 0; this.oy = 0;
    const w = Math.min(W - 12, Math.max(...lines.map(([t]) => textWidth(t))) + 14);
    const h = lines.length * 10 + 8;
    const ww = Math.max(4, Math.round(w * Math.min(1, open)));
    const x0 = Math.round(W / 2 - ww / 2);
    const y0 = Math.round(cy - h / 2);
    this.rect(x0, y0, ww, h, UI.black);
    for (let i = 0; i < ww; i++) { this.set(x0 + i, y0, UI.border); this.set(x0 + i, y0 + h - 1, UI.border); }
    for (let j = 0; j < h; j++) { this.set(x0, y0 + j, UI.border); this.set(x0 + ww - 1, y0 + j, UI.border); }
    if (open >= 1) {
      let used = 0;
      lines.forEach(([t, c], i) => {
        const shown = t.slice(0, Math.max(0, chars - used));
        used += t.length;
        this.text(shown, Math.round(W / 2 - textWidth(t) / 2), y0 + 5 + i * 10, c, 1, null);
      });
    }
    this.ox = sox; this.oy = soy;
  }

  /** Flash plein écran tramé (t = intensité 0→1). */
  flash(t: number, c = UI.white) {
    if (t <= 0) return;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (bayer(x, y) < t) this.buf[y * W + x] = c;
  }

  /** Conversion vers RGBA (Uint32 little-endian). */
  toRGBA(out: Uint32Array) {
    for (let i = 0; i < this.buf.length; i++) out[i] = PALETTE_RGBA[this.buf[i]];
  }
}
