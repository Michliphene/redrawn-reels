import React from 'react';
import { interpolate } from 'remotion';
import { theme } from '../lib/theme';

/** Series tag (top-left) + title card shown during the hook. */
export const Brand: React.FC<{ series: string; title: string; t: number; titleUntil: number; end?: number }> = ({ series, title, t, titleUntil, end }) => {
  // visible on frame 0 (hook) and again on the last 0.4 s so the loop cut is seamless
  const o = Math.max(interpolate(t, [titleUntil - 0.3, titleUntil], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    end ? interpolate(t, [end - 0.45, end - 0.1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0);
  return (
    <>
      <div style={{ position: 'absolute', top: 70, left: 60, fontFamily: 'Montserrat', fontWeight: 900, fontSize: 30, letterSpacing: 8,
        color: '#0B1120', background: theme.accent, padding: '8px 18px', borderRadius: 6 }}>{series}</div>
      <div style={{ position: 'absolute', top: 170, width: '100%', textAlign: 'center', opacity: o, fontFamily: 'Montserrat', fontWeight: 900,
        fontSize: 92, color: theme.text, textTransform: 'uppercase', lineHeight: 1.05, textShadow: '0 6px 24px rgba(0,0,0,0.7)' }}>{title}</div>
    </>
  );
};
