import React from 'react';
import { Img, staticFile, spring, interpolate, Easing, random } from 'remotion';
import { GeoProjection } from 'd3-geo';
import type { TimedAction } from '../lib/types';
import { FPS, theme } from '../lib/theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const life = (t: number, t0: number, hold: number) => interpolate(t, [t0, t0 + 0.25, t0 + hold, t0 + hold + 0.4], [0, 1, 1, 0], clamp);

const Coin: React.FC<{ size: number; spin: number }> = ({ size, spin }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ transform: `scaleX(${Math.cos(spin)})` }}>
    <circle cx="20" cy="20" r="18" fill="#E2B33C" stroke="#8A6414" strokeWidth="3" />
    <circle cx="20" cy="20" r="12" fill="none" stroke="#FFE08A" strokeWidth="2" />
    <text x="20" y="27" textAnchor="middle" fontSize="18" fontWeight="900" fill="#8A6414" fontFamily="Montserrat">$</text>
  </svg>
);

/** Rolling number (e.g. $7,200,000) with optional falling gold coins. */
export const BigNumbers: React.FC<{ t: number; actions: TimedAction[] }> = ({ t, actions }) => (
  <>
    {(actions.filter((a) => a.type === 'bigNumber') as Extract<TimedAction, { type: 'bigNumber' }>[]).map((a, i) => {
      const hold = a.hold ?? 3; if (t < a.t || t > a.t + hold + 0.4) return null;
      const o = a.from ? interpolate(t, [a.t + hold, a.t + hold + 0.4], [1, 0], clamp) : life(t, a.t, hold);
      const p = interpolate(t, [a.t, a.t + (a.dur ?? 1.1)], [a.from ?? 0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
      const v = (a.value * p).toLocaleString('en-US', { minimumFractionDigits: a.decimals ?? 0, maximumFractionDigits: a.decimals ?? 0 });
      const pop = a.from ? 1 : spring({ frame: (t - a.t) * FPS, fps: FPS, config: { damping: 12, stiffness: 160 } });
      const y = a.y ?? 1110;
      return (
        <div key={i} style={{ position: 'absolute', inset: 0, opacity: o }}>
          {a.coins && Array.from({ length: (a as any).coinsCount ?? 22 }, (_, k) => {
            const x = 60 + random(`cx${i}${k}`) * 960, delay = random(`cd${i}${k}`) * 1.2, sp = 700 + random(`cs${i}${k}`) * 500;
            const yy = -80 + (t - a.t - delay) * sp; if (t - a.t < delay || yy > 1950) return null;
            return <div key={k} style={{ position: 'absolute', left: x, top: yy }}><Coin size={44 + random(`cz${i}${k}`) * 30} spin={(t - a.t) * 8 + k} /></div>;
          })}
          <div style={{ position: 'absolute', top: y, width: '100%', textAlign: 'center', transform: `scale(${0.7 + 0.3 * pop})` }}>
            <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 150, color: theme.accent, lineHeight: 1, letterSpacing: -2,
              WebkitTextStroke: '4px #2a1d00', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.7)' }}>{a.prefix ?? ''}{v}{a.suffix ?? ''}</div>
            {a.label && <div style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 40, color: theme.text, marginTop: 6, letterSpacing: 4, textShadow: '0 3px 12px #000' }}>{a.label}</div>}
          </div>
        </div>
      );
    })}
  </>
);

/** Archive image card (painting, document, photo) with caption + credit and a slow push-in. */
export const Archives: React.FC<{ t: number; actions: TimedAction[] }> = ({ t, actions }) => (
  <>
    {(actions.filter((a) => a.type === 'archive') as Extract<TimedAction, { type: 'archive' }>[]).map((a, i) => {
      const hold = a.hold ?? 3; if (t < a.t || t > a.t + hold + 0.4) return null;
      const o = life(t, a.t, hold);
      const s = spring({ frame: (t - a.t) * FPS, fps: FPS, config: { damping: 15, stiffness: 120 } });
      const w = a.w ?? 900;
      return (
        <div key={i} style={{ position: 'absolute', left: (1080 - w) / 2, top: a.y ?? 760, width: w, opacity: o, transform: `translateY(${(1 - s) * 80}px) rotate(${(1 - s) * -3}deg)` }}>
          <div style={{ background: '#EFE6D2', padding: 14, borderRadius: 6, boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
            <div style={{ overflow: 'hidden', borderRadius: 2 }}>
              <Img src={staticFile(a.src)} style={{ width: '100%', display: 'block', filter: 'sepia(0.35) contrast(1.08)',
                transform: `scale(${1.04 + 0.08 * Math.min(1, (t - a.t) / hold)})`, transformOrigin: a.focus ?? '50% 50%' }} />
            </div>
            <div style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 28, color: '#1b1b1b', marginTop: 10 }}>{a.caption}</div>
            <div style={{ fontFamily: 'Montserrat', fontSize: 15, color: '#555', marginTop: 2 }}>{a.credit}</div>
          </div>
        </div>
      );
    })}
  </>
);

/** Big statement box, optional stamp (e.g. "LATER MYTH"). */
export const Callouts: React.FC<{ t: number; actions: TimedAction[] }> = ({ t, actions }) => (
  <>
    {(actions.filter((a) => a.type === 'callout') as Extract<TimedAction, { type: 'callout' }>[]).map((a, i) => {
      const hold = a.hold ?? 2.8; if (t < a.t || t > a.t + hold + 0.4) return null;
      const o = life(t, a.t, hold);
      const s = spring({ frame: (t - a.t) * FPS, fps: FPS, config: { damping: 13, stiffness: 170 } });
      const st = a.stampAt != null && t >= a.stampAt ? spring({ frame: (t - a.stampAt) * FPS, fps: FPS, config: { damping: 9, stiffness: 200 } }) : 0;
      return (
        <div key={i} style={{ position: 'absolute', top: a.y ?? 1000, width: '100%', display: 'flex', justifyContent: 'center', opacity: o }}>
          <div style={{ position: 'relative', background: 'rgba(11,17,32,0.92)', border: `4px solid ${theme.accent}`, borderRadius: 16, padding: '22px 40px',
            transform: `scale(${0.8 + 0.2 * s})`, textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: a.size ?? 84, color: theme.text, lineHeight: 1 }}>{a.text}</div>
            {a.sub && <div style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 30, color: theme.accent, marginTop: 10 }}>{a.sub}</div>}
            {st > 0 && <div style={{ position: 'absolute', right: -30, top: -40, transform: `rotate(12deg) scale(${2.2 - 1.2 * st})`, opacity: st,
              fontFamily: 'Montserrat', fontWeight: 900, fontSize: 38, color: '#E8443A', border: '5px solid #E8443A', borderRadius: 6, padding: '2px 12px',
              background: 'rgba(11,17,32,0.9)', letterSpacing: 2, whiteSpace: 'nowrap' }}>{a.stamp}</div>}
          </div>
        </div>
      );
    })}
  </>
);

/** Region names (approximate areas, italic) and labels attached to paths. */
export const GeoTexts: React.FC<{ t: number; actions: TimedAction[]; projection: GeoProjection }> = ({ t, actions, projection }) => (
  <>
    {actions.map((a, i) => {
      let at: [number, number] | undefined, text = '', hold = 3, italic = false;
      if (a.type === 'region') { at = a.at; text = a.text; hold = a.hold ?? 3.5; italic = true; }
      else if (a.type === 'path' && a.label && a.labelAt) { at = a.labelAt; text = a.label; hold = a.hold ?? 4; }
      else if (a.type === 'ghost' && a.label) return null;
      else return null;
      if (t < a.t || t > a.t + hold + 0.4) return null;
      const p = projection(at!); if (!p) return null;
      const o = life(t, a.t + (a.type === 'path' ? 0.6 : 0), hold);
      return (
        <div key={i} style={{ position: 'absolute', left: Math.min(Math.max(p[0], 150), 930), top: p[1], transform: 'translate(-50%,-50%)', opacity: o,
          fontFamily: 'Montserrat', fontWeight: italic ? 700 : 800, fontStyle: italic ? 'italic' : 'normal', fontSize: italic ? 34 : 30,
          color: italic ? '#F6E7C1' : theme.text, whiteSpace: 'nowrap', textShadow: '0 2px 8px #000, 0 0 2px #000', letterSpacing: italic ? 1 : 0.5,
          background: italic ? 'none' : 'rgba(11,17,32,0.8)', padding: italic ? 0 : '4px 12px', borderRadius: 6 }}>{text}</div>
      );
    })}
  </>
);
