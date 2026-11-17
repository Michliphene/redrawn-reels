import React from 'react';
import { SAFE, ZONES } from '../tokens';
import { episodeTag, type SeriesDef } from '../series';
import { displayCut, monoCut } from '../fonts';

/**
 * THE GETAWAY — series bar. Two identities were proposed to the owner (stills: deliverables/getaway-001-dbcooper/brand_*.jpg):
 *   A "case file":  a beige file-folder tab typed on a typewriter, the case number stamped in red beside it
 *   B "evidence":   a red evidence label in the display face, a dotted escape route ending in an X, the file
 *                   number typed in paper beige
 * `studio.json` → series.getaway.brand picks the default; a render prop `brand` previews the other one.
 */
const SAFE_W = SAFE.right - SAFE.left;

export const GetawayBar: React.FC<{ series: SeriesDef; episode?: number; right?: React.ReactNode; variant?: string }> = ({ series, episode, right, variant }) => {
  const v = (variant ?? series.brand ?? 'A').toUpperCase();
  const x = series.extra ?? {};
  const ep = episodeTag(series, episode);
  const h = ZONES.hud.bottom - ZONES.hud.top;
  return (
    <div style={{ position: 'absolute', top: ZONES.hud.top, left: SAFE.left, width: SAFE_W, height: h, display: 'flex', alignItems: 'center', gap: 18 }}>
      {v === 'B' ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: series.palette.accent, padding: '6px 16px 5px 12px', boxShadow: '5px 5px 0 rgba(0,0,0,0.55)' }}>
            <RouteGlyph color={series.palette.ink} />
            <span style={{ ...displayCut(800, 75), fontSize: 36, lineHeight: 1, letterSpacing: '0.04em', color: series.palette.ink, textTransform: 'uppercase' }}>{series.name}</span>
          </div>
          {ep && <span style={{ ...monoCut(700), fontSize: 26, letterSpacing: '0.12em', color: x.paper ?? series.palette.ink, textTransform: 'uppercase', textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>{ep.replace('CASE', 'FILE Nº')}</span>}
        </>
      ) : (
        <>
          <div style={{ position: 'relative', background: x.paper, padding: '9px 18px 7px', transform: 'rotate(-1.2deg)', boxShadow: '4px 5px 0 rgba(0,0,0,0.6)',
            clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' }}>
            <span style={{ ...monoCut(700), fontSize: 28, letterSpacing: '0.16em', color: x.paperInk, textTransform: 'uppercase' }}>{series.name}</span>
          </div>
          {ep && (
            <div style={{ ...monoCut(700), fontSize: 26, letterSpacing: '0.1em', color: x.stamp ?? series.palette.accent, border: `3px solid ${x.stamp ?? series.palette.accent}`,
              padding: '4px 10px 2px', transform: 'rotate(-4deg)', textTransform: 'uppercase', opacity: 0.95, textShadow: 'none', background: 'rgba(7,6,5,0.35)' }}>{ep}</div>
          )}
        </>
      )}
      <div style={{ flex: 1 }} />
      {right}
    </div>
  );
};

/** A dotted escape route that ends in an X: the channel's mark. */
export const RouteGlyph: React.FC<{ color: string; size?: number }> = ({ color, size = 30 }) => (
  <svg width={size * 1.5} height={size} viewBox="0 0 45 30">
    <path d="M3 25 C 12 25, 12 8, 22 10 S 30 22, 36 9" fill="none" stroke={color} strokeWidth="3.4" strokeDasharray="2 5" strokeLinecap="round" />
    <path d="M33 3 L43 13 M43 3 L33 13" stroke={color} strokeWidth="4" strokeLinecap="round" />
  </svg>
);
