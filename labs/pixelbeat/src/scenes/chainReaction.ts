import {FB, W, H, hash, bayer} from '../pixel/fb';
import {C, UI} from '../pixel/palette';
import type {Score} from '../score/types';
import {
  beatPulse, countEvents, easeInCubic, easeOutBack, easeOutCubic, eventsOf, lastEvent, lastHitIndex,
  PANEL_TYPE_DELAY, progress, pulse, rollHits, typedChars,
} from '../score/timing';

const colorOf = (name: unknown) => (name === 'accent' ? UI.accent : name === 'muted' ? UI.muted : UI.white);

const fmtBig = (g: number) => {
  if (g <= 19) return String(2 ** g);
  const ex = Math.floor(g * Math.log10(2));
  return `${(2 ** g / 10 ** ex).toFixed(1)}×10^${ex}`;
};

// Fond commun : ciel de nuit tramé + étoiles qui scintillent SUR LES TEMPS.
const sky = (fb: FB, beat: number, seed: number, horizon = H) => {
  fb.gradientV(0, horizon, 'night', 0.2, 5.2 * (horizon / H));
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(hash(i, seed, 1) * W);
    const y = Math.floor(hash(i, seed, 2) * horizon * 0.8);
    const tw = beatPulse(beat + hash(i, seed, 3) * 4, 0.5);
    fb.set(x - fb.ox, y - fb.oy, tw > 0.4 ? UI.white : C('night', 6));
  }
};

const moderatorGrid = (fb: FB, beat: number, heat: number) => {
  for (let gy = 0; gy < 12; gy++)
    for (let gx = 0; gx < 7; gx++) {
      const x = 12 + gx * 26 + (gy % 2) * 13;
      const y = 20 + gy * 26;
      const p = beatPulse(beat - (gx + gy) * 0.06, 0.3);
      fb.disc(x, y, 1 + (p > 0.5 ? 1 : 0), C('uranium', 1 + heat * 3 + p));
    }
};

const CX = W / 2;
const CY = 168;

/** Position finale de la particule i : spirale dorée -> remplissage homogène de l'écran. */
const spot = (i: number) => {
  const a = i * 2.39996323;
  const r = Math.sqrt(i + 0.5) * 5.6;
  return [CX + Math.cos(a) * r, CY + Math.sin(a) * r * 1.25];
};

const reaction = (fb: FB, s: Score, beat: number) => {
  const seed = s.meta.seed;
  const gen = countEvents(s, 'split', beat);
  const heat = Math.min(1, Math.max(0, (gen - 12) / 12));
  fb.clear(C('night', 0));
  sky(fb, beat, seed);
  moderatorGrid(fb, beat, heat);

  // Chaleur : la scène vire au feu, en tramage, pendant la montée
  if (heat > 0) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
    if (bayer(x, y) < heat * 0.55 * (0.6 + 0.4 * (y / H))) fb.buf[y * W + x] = C('fire', 1 + Math.floor(heat * 2.5));

  if (gen === 0) {
    // Hook : un seul atome qui respire au tempo + le neutron qui arrive
    const p = beatPulse(beat);
    fb.sphere(CX, CY, 15 + p * 1.5, 'uranium', 0.05 + p * 0.25);
    fb.textCenter('U-235', CX, CY + 24, C('uranium', 4));
    const n = eventsOf(s, 'neutron')[0];
    const hit = eventsOf(s, 'hit')[0];
    if (n && hit && beat >= n.beat) {
      const k = progress(beat, n.beat, hit.beat, easeInCubic);
      const nx = -6 + (CX - 14 + 6) * k;
      for (let t = 1; t < 10; t++) fb.set(nx - t * 2, CY - 1, t < 4 ? UI.white : C('night', 6)); // traînée
      fb.disc(nx, CY, 2, UI.white);
    }
    const hp = hit ? pulse(beat, hit.beat, 1) : 0;
    if (hp > 0) fb.ring(CX, CY, 18 + (1 - hp) * 20, C('fire', 6));
    return;
  }

  // Réaction : 2^gen noyaux, chaque nouveau sort de son parent à l'instant du split
  const last = lastEvent(s, 'split', beat)!;
  const n = Math.min(2 ** gen, 640);
  const nPrev = Math.min(2 ** (gen - 1), 640);
  const t = progress(beat, last.beat, last.beat + 0.45, easeOutBack);
  const r = Math.max(1.5, Math.min(12, 22 / Math.sqrt(n)));
  for (let i = 0; i < n; i++) {
    const [tx, ty] = spot(i);
    let x = tx, y = ty;
    if (i >= nPrev) {
      const [px, py] = spot(i % Math.max(1, nPrev));
      x = px + (tx - px) * t; y = py + (ty - py) * t;
    }
    const ramp = i % 2 ? 'krypton' : 'barium';
    if (r >= 4) fb.sphere(x, y, r, ramp, 0.1);
    else fb.disc(x, y, r, C(ramp, 2 + (i % 3)));
    if (i >= nPrev && t < 1) fb.ring(x, y, r + 2 + t * 3, C('fire', 6)); // anneau jaune sur les nouveaux
  }

  // HUD compteur : saute à chaque split
  const sp = pulse(beat, last.beat, 0.3);
  fb.rect(30, 6, 120, 37, UI.black);
  fb.textCenter(`GENERATION ${gen}`, CX, 10, UI.muted, 1, null);
  fb.textCenter(fmtBig(gen), CX, 24 - Math.round(sp * 2), sp > 0.5 ? UI.accent : UI.white, 2, null);
};

const riserPhase = (fb: FB, s: Score, beat: number) => {
  const rz = eventsOf(s, 'riser')[0];
  const len = rz.length as number;
  const hits = rollHits(rz.beat, len);
  const i = lastHitIndex(hits, beat);
  const k = (i + 1) / hits.length; // avance PAR COUP de caisse claire, pas en continu
  const silent = beat >= rz.beat + len - 0.5; // le demi-temps de silence : l'image se fige aussi
  // secousse : nouvelle position uniquement sur chaque coup du roulement (entiers = grille pixel)
  const amp = silent ? 0 : 6 * k;
  fb.ox = Math.round((hash(i, 9) - 0.5) * amp);
  fb.oy = Math.round((hash(i, 11) - 0.5) * amp);
  reaction(fb, s, rz.beat - 0.01);
  fb.flash(easeInCubic(k) * 0.85, C('fire', 7));
  const g = Math.round(24 + (Number(rz.toGeneration) - 24) * k);
  fb.ox = 0; fb.oy = 0;
  fb.rect(30, 6, 120, 37, UI.black);
  fb.textCenter(`GENERATION ${g}`, CX, 10, UI.muted, 1, null);
  fb.textCenter(fmtBig(g), CX, 24, UI.accent, 2, null);
};

const desert = (fb: FB, s: Score, beat: number) => {
  const seed = s.meta.seed;
  const boom = eventsOf(s, 'boom')[0].beat;
  const age = beat - boom;
  // Secousse : grosse à l'impact puis petite sur chaque temps fort (synchro grosse caisse)
  const shake = 5 * pulse(beat, boom, 3) + 1.2 * beatPulse(beat, 0.2);
  // nouvelle position seulement sur les doubles-croches = calée sur les charlestons du break
  const q = Math.floor(beat * 4 + 1e-9);
  fb.ox = Math.round((hash(q, 3) - 0.5) * shake);
  fb.oy = Math.round((hash(q, 5) - 0.5) * shake);

  const horizon = 232;
  fb.clear(C('night', 0));
  sky(fb, beat, seed, horizon);
  // montagnes
  for (let x = -8; x < W + 8; x++) {
    const h = 10 + 9 * Math.sin(x * 0.045 + 1) + 5 * Math.sin(x * 0.13);
    for (let y = horizon - h; y < horizon; y++) fb.set(x, y, C('night', 1));
  }
  // sol en strates
  const strata = [C('ground', 1), C('ground', 2), C('ground', 1), C('ground', 0)];
  for (let y = horizon; y < H + 8; y++) {
    const band = strata[Math.min(3, Math.floor((y - horizon) / 22))];
    for (let x = -8; x < W + 8; x++) fb.set(x, y, hash(x, y, seed) < 0.03 ? C('ground', 0) : band);
  }

  // Champignon
  const grow = progress(age, 0, 10, easeOutCubic);
  const cool = progress(age, 4, 22); // feu qui refroidit
  const smoke = progress(age, 7, 15); // fondu tramé feu -> fumée (pas de bascule brutale)
  const capY = horizon - 18 - grow * 120;
  const capR = 14 + grow * 26;
  // tige
  for (let y = Math.floor(capY); y < horizon; y++) {
    const w = 5 + (y - capY) * 0.06 + 3 * Math.sin(y * 0.2 + age * 2);
    for (let x = -w; x <= w; x++) {
      const v = 1 + 2 * (1 - Math.abs(x) / w) + (x < 0 ? 0.6 : 0);
      fb.set(CX + x, y, bayer(Math.round(CX + x + fb.ox), y + fb.oy) < smoke ? C('smoke', v) : C('fire', v + 1));
    }
  }
  // lumière au sol + onde de choc
  const glow = 1 - cool;
  for (let y = horizon; y < horizon + 30; y++)
    for (let x = 0; x < W; x++) {
      const d = Math.hypot((x - CX) / 2.6, y - horizon) / 34;
      if (d < 1 && bayer(x, y) < (1 - d) * glow) fb.set(x - fb.ox, y - fb.oy, C('fire', 3));
    }
  const wave = progress(age, 0, 6, easeOutCubic);
  if (wave < 1) for (let i = 0; i < 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    fb.set(CX + Math.cos(a) * wave * 110, horizon + 4 + Math.sin(a) * wave * 14, C('ground', 5));
  }
  // chapeau : plusieurs masses qui roulent
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + age * 0.15;
    const bx = CX + Math.cos(a) * capR * 0.55;
    const by = capY + Math.sin(a) * capR * 0.25;
    const br = capR * (0.55 + 0.1 * hash(k, seed));
    fb.blob(bx, by, br, 'fire', k + seed, 0.2, 1 - cool * 0.8, 'smoke', smoke);
  }
  fb.blob(CX, capY, capR * 0.6, 'fire', 99, 0.15, 1.15 - cool, 'smoke', smoke);

  fb.ox = 0; fb.oy = 0;
};

const loopOut = (fb: FB, s: Score, beat: number) => {
  const lp = eventsOf(s, 'loop')[0];
  if (!lp || beat < lp.beat) return;
  const k = progress(beat, lp.beat, s.meta.lengthBeats);
  fb.flash(easeInCubic(k), C('night', 0));
  if (k > 0.6) {
    const p = beatPulse(beat);
    const a = progress(k, 0.6, 1);
    fb.sphere(CX, CY, (15 + p * 1.5) * a, 'uranium', 0.05 + p * 0.25);
  }
};

const panels = (fb: FB, s: Score, beat: number) => {
  // ouverture en 1/2 temps, lettres sur les doubles-croches (mêmes fonctions que le synthé)
  const show = (lines: [string, number][], start: number, until: number) => {
    if (beat < start || beat > until) return;
    const open = progress(beat, start, start + 0.5) * (1 - progress(beat, until - 0.5, until));
    fb.panel(lines, 60, open, typedChars(beat, start + PANEL_TYPE_DELAY));
  };
  for (const e of eventsOf(s, 'panel'))
    show((e.lines as [string, string][]).map(([t, c]) => [t, colorOf(c)]), e.beat, e.until as number);
  const ti = eventsOf(s, 'title')[0];
  if (ti) show((ti.lines as string[]).map((t, i) => [t, i ? UI.accent : UI.white]), ti.beat, (ti.until as number) ?? 7.5);
};

export const drawChainReaction = (fb: FB, s: Score, beat: number) => {
  const rz = eventsOf(s, 'riser')[0];
  const boom = eventsOf(s, 'boom')[0].beat;
  if (beat < rz.beat) reaction(fb, s, beat);
  else if (beat < boom) riserPhase(fb, s, beat);
  else desert(fb, s, beat);

  // Flash d'impact pile sur le temps du boom
  const fl = eventsOf(s, 'flash')[0];
  if (fl) fb.flash(pulse(beat, fl.beat, 2), UI.white);

  panels(fb, s, beat);
  loopOut(fb, s, beat);
  // watermark discret (comme @BITWONDER sous le compteur)
  fb.textCenter('@PIXELBEAT', CX, H - 12, C('night', 5), 1, null);
};
