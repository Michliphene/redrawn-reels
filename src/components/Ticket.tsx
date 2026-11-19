import React from 'react';
import { interpolate, spring } from 'remotion';
import type { TimedAction } from '../lib/types';
import { FPS, theme } from '../lib/theme';

type A = Extract<TimedAction, { type: 'ticket' }>;

/**
 * A typed document (cue `ticket`): a paper stub whose lines are typed letter by letter, plus an optional
 * correction — a wrong version shown as a press cutting that a red line strikes out on `strikeWord`.
 *   { "type": "ticket", "head": "NORTHWEST ORIENT", "rows": [["FLIGHT", "305"], ["FROM", "PORTLAND"]],
 *     "big": "DAN COOPER", "note": "Reconstruction — not the original ticket", "wrong": "\"D.B. COOPER\"",
 *     "wrongBy": "THE PRESS", "strikeWord": "Not", "atWord": "ticket", "hold": 4.5 }
 * A reconstruction is labelled as one (`note`): the card shows sourced facts, never a facsimile of a real document.
 */
export const Tickets: React.FC<{ t: number; actions: TimedAction[] }> = ({ t, actions }) => (
  <>
    {(actions.filter((a) => a.type === 'ticket') as A[]).map((a, i) => {
      const hold = a.hold ?? 4;
      const end = a.t + hold;
      if (t < a.t || t > end + 0.5) return null;
      const s = spring({ frame: (t - a.t) * FPS, fps: FPS, config: { damping: 15, stiffness: 140 } });
      const out = interpolate(t, [end, end + 0.45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      const tw = theme.typewriter || theme.font, ink = theme.paperInk;
      const cps = a.cps ?? 34; // typed characters per second
      const all = [...(a.rows ?? []).map(([k, v]) => `${k} ${v}`), a.big ?? ''];
      let budget = Math.max(0, (t - a.t - 0.25) * cps);
      const typed = all.map((line) => { const n = Math.min(line.length, Math.floor(budget)); budget -= line.length; return n; });
      const cut = (txt: string, n: number) => txt.slice(0, Math.max(0, n));
      const caretOn = Math.floor(t * 3) % 2 === 0;
      const st = a.strikeAt != null ? Math.min(1, Math.max(0, (t - a.strikeAt) / 0.35)) : 0;
      const wrongIn = a.strikeAt != null ? spring({ frame: Math.max(0, t - a.strikeAt + 0.6) * FPS, fps: FPS, config: { damping: 12, stiffness: 180 } }) : 0;
      const Wd = a.w ?? 560;
      return (
        <div key={i} style={{ position: 'absolute', left: 540 - Wd / 2 - 40, top: a.y ?? 560, width: Wd, opacity: 1 - out,
          transform: `translateY(${(1 - s) * 160}px) rotate(${-3 + 1.5 * s}deg)` }}>
          <div style={{ background: theme.paper, padding: '18px 26px 16px', boxShadow: theme.shadow, position: 'relative',
            WebkitMaskImage: 'radial-gradient(circle at 0 50%, transparent 14px, #000 15px), radial-gradient(circle at 100% 50%, transparent 14px, #000 15px)',
            WebkitMaskComposite: 'source-in' as any }}>
            <div style={{ fontFamily: theme.font, fontWeight: 800, fontSize: 40, color: ink, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1 }}>{a.head}</div>
            {a.sub && <div style={{ fontFamily: tw, fontWeight: 700, fontSize: 18, color: ink, opacity: 0.7, letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 4 }}>{a.sub}</div>}
            <div style={{ borderTop: `3px dashed ${ink}`, opacity: 0.5, margin: '12px 0 10px' }} />
            {(a.rows ?? []).map(([k, v], r) => {
              const n = typed[r], full = `${k} ${v}`;
              const shown = cut(full, n);
              return (
                <div key={r} style={{ display: 'flex', gap: 14, fontFamily: tw, fontWeight: 700, fontSize: (a as any).rowSize ?? 26, color: ink, height: ((a as any).rowSize ?? 26) + 8, alignItems: 'baseline' }}>
                  <span style={{ width: (a as any).keyW ?? 120, flex: 'none', opacity: 0.6, fontSize: (a as any).rowSize ? (a as any).rowSize - 6 : 20, letterSpacing: '0.1em' }}>{shown.slice(0, k.length)}</span>
                  <span>{shown.slice(k.length + 1)}{n > 0 && n < full.length && caretOn ? '▌' : ''}</span>
                </div>
              );
            })}
            {a.big && (
              <div style={{ fontFamily: tw, fontWeight: 700, fontSize: 52, color: ink, marginTop: 8, letterSpacing: '0.02em', minHeight: 58 }}>
                {cut(a.big, typed[all.length - 1])}{typed[all.length - 1] > 0 && typed[all.length - 1] < a.big.length && caretOn ? '▌' : ''}
              </div>
            )}
            {a.note && <div style={{ fontFamily: tw, fontSize: 15, color: ink, opacity: 0.55, marginTop: 8 }}>{a.note}</div>}
          </div>
          {a.wrong && wrongIn > 0.01 && (
            <div style={{ position: 'absolute', right: -50, bottom: -96, transform: `rotate(5deg) scale(${0.7 + 0.3 * wrongIn})`, opacity: wrongIn,
              background: '#EFE9DC', padding: '10px 18px 8px', boxShadow: '6px 6px 0 rgba(0,0,0,0.55)' }}>
              {a.wrongBy && <div style={{ fontFamily: tw, fontWeight: 700, fontSize: 16, letterSpacing: '0.16em', color: '#555' }}>{a.wrongBy}</div>}
              <div style={{ position: 'relative', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', fontSize: 60, lineHeight: 1, color: '#111' }}>
                {a.wrong}
                <div style={{ position: 'absolute', left: -8, top: '52%', height: 9, width: `calc(${st * 100}% + ${st * 16}px)`, background: theme.stamp, transform: 'rotate(-4deg)', borderRadius: 3 }} />
              </div>
            </div>
          )}
        </div>
      );
    })}
  </>
);
