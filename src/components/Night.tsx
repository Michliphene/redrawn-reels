import React from 'react';
import type { TimedAction } from '../lib/types';
import { hash, ramp } from '../studio/motion';
import { W, H } from '../studio/tokens';

type N = Extract<TimedAction, { type: 'night' }>;

/**
 * Night falls on the world (cue `night`): the frame darkens except for a pool of light — a torch beam that follows
 * the first vehicle on screen (`follow: "vehicle"`) or stays on a place (`follow: [lon, lat]`) — with optional rain.
 *   { "type": "night", "atWord": "south,", "hold": 10, "level": 0.72, "follow": "vehicle", "radius": 260, "rain": false }
 * Drawn above the world and below every label, card and caption, so the type never gets darker.
 */
export const Night: React.FC<{ t: number; actions: TimedAction[]; spot: (n: N) => [number, number] | null }> = ({ t, actions, spot }) => (
  <>
    {(actions.filter((a) => a.type === 'night') as N[]).map((n, i) => {
      const end = n.t + (n.hold ?? 6);
      if (t < n.t || t > end + 0.8) return null;
      const o = Math.min(n.t <= 0.05 ? 1 : ramp(t, n.t, n.fadeIn ?? 0.8), 1 - ramp(t, end, 0.8)); // already dark on frame 0 (loop)
      const p = spot(n) ?? [W / 2, 845];
      const r = n.radius ?? 260;
      const lv = (n.level ?? 0.72) * o;
      return (
        <div key={i} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0,
            background: `radial-gradient(circle at ${p[0]}px ${p[1]}px, rgba(7,6,5,0) ${r * 0.55}px, rgba(7,6,5,${lv * 0.55}) ${r * 0.85}px, rgba(7,6,5,${lv}) ${r * 1.25}px)` }} />
          {n.rain && <Rain t={t - n.t} opacity={o} />}
        </div>
      );
    })}
  </>
);

/** Thin slanted streaks falling at different speeds; a pure function of time (deterministic). */
const Rain: React.FC<{ t: number; opacity: number }> = ({ t, opacity }) => (
  <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: opacity * 0.55 }}>
    {Array.from({ length: 90 }, (_, k) => {
      const sp = 1500 + hash(k * 7 + 1) * 900, len = 40 + hash(k * 3 + 2) * 50;
      const x0 = hash(k * 11 + 3) * (W + 300), y = ((hash(k * 5 + 4) * (H + 200) + t * sp) % (H + 200)) - 100;
      const x = x0 - (y + 100) * 0.18 - 100;
      return <line key={k} x1={x} y1={y} x2={x - len * 0.18} y2={y + len} stroke="#C9D3DA" strokeWidth={2 + (k % 3)} strokeLinecap="round" opacity={0.35 + 0.5 * hash(k * 13)} />;
    })}
  </svg>
);
