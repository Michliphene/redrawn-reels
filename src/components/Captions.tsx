import React, { useMemo } from 'react';
import { spring } from 'remotion';
import type { Timings, Word } from '../lib/types';
import { theme, FPS } from '../lib/theme';

/** Split each beat into short pages (<= maxChars, break on punctuation) for word-by-word captions. */
function paginate(timings: Timings, maxChars = 22) {
  const pages: Word[][] = [];
  for (const b of timings.beats) {
    let cur: Word[] = [];
    for (const w of b.words) {
      const len = cur.map((x) => x.w).join(' ').length + w.w.length + 1;
      if (cur.length && len > maxChars) { pages.push(cur); cur = []; }
      cur.push(w);
      if (/[.,:;!?…]$/.test(w.w)) { pages.push(cur); cur = []; }
    }
    if (cur.length) pages.push(cur);
  }
  return pages;
}

export const Captions: React.FC<{ timings: Timings; t: number; y?: number }> = ({ timings, t, y = 1390 }) => {
  const pages = useMemo(() => paginate(timings), [timings]);
  const idx = pages.findIndex((p, i) => t >= p[0].start - 0.05 && (i === pages.length - 1 || t < pages[i + 1][0].start - 0.05));
  const page = pages[idx];
  if (!page || t > page[page.length - 1].end + 0.6) return null;
  return (
    <div style={{ position: 'absolute', top: y, left: 60, right: 60, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 22px' }}>
      {page.map((w, i) => {
        const on = t >= w.start;
        const active = on && (i === page.length - 1 ? t < w.end + 0.3 : t < page[i + 1].start);
        const s = spring({ frame: Math.max(0, (t - w.start) * FPS), fps: FPS, config: { damping: 12, stiffness: 220 } });
        return (
          <span key={i} style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 84, lineHeight: 1.12, textTransform: 'uppercase',
            color: active ? theme.accent : theme.text, opacity: on ? 1 : 0.0,
            transform: `scale(${on ? 0.85 + 0.15 * s : 0.85}) translateY(${on ? 0 : 10}px)`, display: 'inline-block',
            WebkitTextStroke: '3px #000', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.7)' }}>{w.w}</span>
        );
      })}
    </div>
  );
};
