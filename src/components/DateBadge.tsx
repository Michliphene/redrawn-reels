import React from 'react';
import { interpolate } from 'remotion';
import { theme } from '../lib/theme';

const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

/** Big date at the top; rolls when the date changes. */
export const DateBadge: React.FC<{ dates: { t: number; date: string }[]; t: number }> = ({ dates, t }) => {
  const cur = [...dates].reverse().find((d) => t >= d.t);
  if (!cur) return null;
  const [y, m, d] = cur.date.split('-').map(Number);
  const p = interpolate(t, [cur.t, cur.t + 0.35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', top: 150, width: '100%', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * -24}px)` }}>
      <div style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 38, letterSpacing: 6, color: theme.accent }}>{m ? `${MONTHS[m - 1]} ${d ?? ''}` : '\u00a0'}</div>
      <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 120, lineHeight: 1, color: theme.text, textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>{y}</div>
    </div>
  );
};
