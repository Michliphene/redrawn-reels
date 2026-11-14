import React from 'react';
import { spring } from 'remotion';
import type { TimedAction } from '../lib/types';
import { FPS, theme } from '../lib/theme';

/** "NEW COUNTRIES n/15" pill: +1 each time a republic changes colour. */
export const Counter: React.FC<{ t: number; actions: TimedAction[]; total: number; from: number }> = ({ t, actions, total, from }) => {
  if (t < from) return null;
  const ds = actions.filter((a) => a.type === 'declare').map((a) => a.t).sort((a, b) => a - b);
  const done = ds.filter((x) => x <= t);
  const n = done.length;
  const last = done[n - 1] ?? -10;
  const pop = 1 + 0.35 * (1 - spring({ frame: (t - last) * FPS, fps: FPS, config: { damping: 10, stiffness: 180 } }));
  return (
    <div style={{ position: 'absolute', top: 64, right: 50, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(11,17,32,0.85)',
      border: `2px solid ${theme.accent}`, borderRadius: 40, padding: '6px 20px' }}>
      <span style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 22, color: theme.muted, letterSpacing: 2 }}>NEW COUNTRIES</span>
      <span style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 38, color: theme.accent, transform: `scale(${pop})`, display: 'inline-block', minWidth: 80, textAlign: 'right' }}>
        {n}<span style={{ fontSize: 24, color: theme.muted }}>/{total}</span></span>
    </div>
  );
};
