import React from 'react';
import { interpolate, Easing } from 'remotion';
import type { TimedAction } from '../lib/types';
import { Flag } from './Flag';

type F = Extract<TimedAction, { type: 'flagSwap' }>;
const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) } as const;

/** Flagpole: one flag comes down, another goes up (e.g. Kremlin, 25 Dec 1991). */
export const FlagSwap: React.FC<{ t: number; actions: TimedAction[] }> = ({ t, actions }) => {
  const f = actions.find((a) => a.type === 'flagSwap') as F | undefined;
  if (!f || t < f.t - 0.4) return null;
  const top = 380, bottom = 1240, h = 210;
  const appear = interpolate(t, [f.t - 0.4, f.t, f.t + (f.hold ?? 4.6), f.t + (f.hold ?? 4.6) + 0.5], [0, 1, 1, 0], c);
  if (t > f.t + (f.hold ?? 4.6) + 0.5) return null;
  const down = interpolate(t, [f.t, f.t + 1.6], [top, bottom - h], c);
  const downOp = interpolate(t, [f.t + 1.3, f.t + 1.7], [1, 0], c);
  const up = interpolate(t, [f.t + 1.7, f.t + 3.4], [bottom - h, top], c);
  const upOp = interpolate(t, [f.t + 1.6, f.t + 1.9], [0, 1], c);
  const x = f.x ?? 700;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: appear }}>
      <div style={{ position: 'absolute', left: x, top: top - 30, width: 10, height: bottom - top + 60, borderRadius: 5,
        background: 'linear-gradient(90deg,#8a8f99,#e4e6ea,#8a8f99)', boxShadow: '0 0 20px rgba(0,0,0,0.6)' }} />
      <div style={{ position: 'absolute', left: x - 5, top: top - 44, width: 20, height: 20, borderRadius: 10, background: '#d9b44a' }} />
      <Flag code={f.from} h={h} t={t} style={{ position: 'absolute', left: x + 10, top: down, opacity: downOp }} />
      <Flag code={f.to} h={h} t={t} style={{ position: 'absolute', left: x + 10, top: up, opacity: upOp }} />
      {f.caption && <div style={{ position: 'absolute', left: x - 260, top: bottom + 40, width: 520, textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 800,
        fontSize: 30, color: '#fff', opacity: upOp, textShadow: '0 2px 10px #000' }}>{f.caption}</div>}
    </div>
  );
};
