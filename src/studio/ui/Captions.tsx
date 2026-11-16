import React, { useMemo } from 'react';
import { SAFE, ZONES, TYPE } from '../tokens';
import { displayCut } from '../fonts';
import { ease, ramp } from '../motion';
import type { Timings, Word } from '../../lib/types';

/**
 * DA v2 captions: one short phrase at a time (two lines max), each word landing when it is spoken.
 * Colour is not karaoke: only KEYWORDS take the accent — numbers, money, percentages and the words listed
 * in episode.json `keywords` — so the eye is sent to what matters. The band sits above the platform
 * interface and left of the like/share column, and hangs from the same left margin as the title:
 * words are revealed left to right, so a half-spoken line never looks off-centre.
 */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9$%]/g, '');
const isNumber = (w: string) => /\d/.test(w) || /^[$£€]/.test(w) || /%$/.test(w.replace(/[.,!?;:]+$/, ''));

type Page = { words: Word[]; lines: Word[][] };

function paginate(timings: Timings, maxChars: number, maxLines: number, hidden: Record<string, string[]>): Page[] {
  const pages: Page[] = [];
  const close = (ws: Word[]) => {
    if (!ws.length) return;
    // balanced lines: break where the two lines are closest in length
    const lines: Word[][] = [];
    const total = ws.map((w) => w.w).join(' ').length;
    if (total <= maxChars || ws.length === 1 || maxLines === 1) lines.push(ws);
    else {
      let best = 1, bestDiff = Infinity;
      for (let i = 1; i < ws.length; i++) {
        const a = ws.slice(0, i).map((w) => w.w).join(' ').length, b = ws.slice(i).map((w) => w.w).join(' ').length;
        if (a <= maxChars && b <= maxChars && Math.abs(a - b) < bestDiff) { best = i; bestDiff = Math.abs(a - b); }
      }
      lines.push(ws.slice(0, best), ws.slice(best));
    }
    pages.push({ words: ws, lines });
  };
  for (const b of timings.beats) {
    let cur: Word[] = [];
    for (const w of b.words.filter((x) => !(hidden[b.id] ?? []).includes(x.w))) {
      const len = cur.map((x) => x.w).join(' ').length + w.w.length + 1;
      if (cur.length && len > maxChars * maxLines - 2) { close(cur); cur = []; }
      cur.push(w);
      if (/[.,:;!?…—]$/.test(w.w)) { close(cur); cur = []; }
    }
    close(cur);
  }
  return pages;
}

export const Captions: React.FC<{ timings: Timings; t: number; accent: string; ink?: string; keywords?: string[]; hidden?: Record<string, string[]>; size?: number; align?: 'left' | 'center' }> =
  ({ timings, t, accent, ink = '#FFFFFF', keywords = [], hidden = {}, size = TYPE.caption, align = 'left' }) => {
    const left = SAFE.left, right = SAFE.railX, width = right - left;
    const maxChars = Math.floor(width / (size * 0.47));
    const pages = useMemo(() => paginate(timings, maxChars, 2, hidden), [timings, maxChars, hidden]);
    const keys = useMemo(() => new Set(keywords.map(norm)), [keywords]);
    const idx = pages.findIndex((p, i) => t >= p.words[0].start - 0.05 && (i === pages.length - 1 || t < pages[i + 1].words[0].start - 0.05));
    const page = pages[idx];
    if (!page || t > page.words[page.words.length - 1].end + 0.7) return null;
    const lineH = size * 1.02;
    const top = ZONES.captions.top + (ZONES.captions.bottom - ZONES.captions.top - lineH * page.lines.length) / 2;
    return (
      <div style={{ position: 'absolute', top, left, width, display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : 'center' }}>
        {page.lines.map((line, li) => (
          <div key={li} style={{ display: 'flex', gap: size * 0.24, height: lineH, alignItems: 'center', whiteSpace: 'nowrap' }}>
            {line.map((w, i) => {
              const key = isNumber(w.w) || keys.has(norm(w.w));
              const p = ease.back(ramp(t, w.start - 0.03, 0.16), key ? 2.6 : 1.4);
              return (
                <span key={i} style={{ ...displayCut(800, 75), fontSize: size, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-0.01em', display: 'inline-block',
                  color: key ? accent : ink, opacity: t >= w.start - 0.03 ? 1 : 0, transform: `translateY(${(1 - Math.min(1, p)) * 14}px) scale(${0.86 + 0.14 * p})`,
                  WebkitTextStroke: `${Math.round(size * 0.1)}px #05070c`, paintOrder: 'stroke fill', textShadow: '0 5px 0 rgba(0,0,0,0.55), 0 12px 26px rgba(0,0,0,0.6)' }}>{w.w}</span>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
