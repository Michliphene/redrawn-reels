import React from 'react';
import { displayCut, monoCut, serifCut } from '../fonts';

/**
 * The three voices of a DA v2 frame. Use nothing else for text:
 *   <Display>  loud: titles, numbers, captions (condensed extra-bold, upper-case)
 *   <Whisper>  quiet: the second line that gives the meaning (serif italic, sentence case)
 *   <Mono>     data: series tag, counters, dates, sources (monospace, tracked, upper-case)
 */
const SHADOW = '0 3px 0 rgba(0,0,0,0.45), 0 10px 28px rgba(0,0,0,0.55)';

type P = { size: number; color?: string; style?: React.CSSProperties; children: React.ReactNode };

export const Display: React.FC<P & { stroke?: number; weight?: number; width?: number }> = ({ size, color = '#fff', stroke = 0, weight = 800, width = 75, style, children }) => (
  <div style={{ ...displayCut(weight, width), fontSize: size, lineHeight: 0.94, letterSpacing: '-0.012em', textTransform: 'uppercase', color,
    textShadow: SHADOW, ...(stroke ? { WebkitTextStroke: `${stroke}px #05070c`, paintOrder: 'stroke fill' } : {}), ...style }}>{children}</div>
);

export const Whisper: React.FC<P> = ({ size, color = '#fff', style, children }) => (
  <div style={{ ...serifCut, fontSize: size, lineHeight: 1.04, color, textShadow: '0 2px 0 rgba(0,0,0,0.4), 0 6px 20px rgba(0,0,0,0.6)', ...style }}>{children}</div>
);

export const Mono: React.FC<P & { weight?: number; track?: number }> = ({ size, color = '#fff', weight = 700, track = 0.14, style, children }) => (
  <div style={{ ...monoCut(weight), fontSize: size, lineHeight: 1, letterSpacing: `${track}em`, textTransform: 'uppercase', color, whiteSpace: 'nowrap',
    textShadow: '0 2px 6px rgba(0,0,0,0.7)', ...style }}>{children}</div>
);

/** Font size that lets `text` fit `lines` lines of `width` px in the condensed display cut (≈0.41 em per upper-case glyph). */
export function fitDisplay(text: string, width: number, lines: number, max: number, min = 56): number {
  const words = text.toUpperCase().split(/\s+/);
  for (let size = max; size >= min; size -= 4) {
    const perLine = Math.floor(width / (size * 0.41));
    let used = 1, cur = 0, ok = true;
    for (const w of words) {
      if (w.length > perLine) { ok = false; break; }
      if (cur && cur + 1 + w.length > perLine) { used++; cur = w.length; } else cur += (cur ? 1 : 0) + w.length;
    }
    if (ok && used <= lines) return size;
  }
  return min;
}
