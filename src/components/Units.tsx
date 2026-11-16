import React from 'react';
import { GeoProjection } from 'd3-geo';
import { interpolate, Easing, random } from 'remotion';
import type { TimedAction } from '../lib/types';
import { Soldier, Tank, Person } from './Icons';
import { theme } from '../lib/theme';

type U = Extract<TimedAction, { type: 'units' }>;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Symbolic army / crowd groups anchored to a place. Approach vectors are in screen px: they show
 *  *that* forces moved in, never a precise route (we don't claim routes we can't source). */
export const Units: React.FC<{ projection: GeoProjection; t: number; actions: TimedAction[] }> = ({ projection, t, actions }) => {
  const groups = actions.filter((a) => a.type === 'units') as U[];
  return (
    <>
      {groups.map((g, gi) => {
        const end = g.t + (g.hold ?? 4);
        if (t < g.t || t > end + 0.6) return null;
        const [px, py] = projection(g.at) ?? [-999, -999];
        const [tx, ty] = [px + (g.offset?.[0] ?? 0), py + (g.offset?.[1] ?? 0)]; // symbolic screen offset around the place
        const [dx, dy] = g.approach ?? [0, 0];
        const move = interpolate(t, [g.t, g.t + (g.dur ?? 1.6)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const back = g.retreatAt != null ? interpolate(t, [g.retreatAt, g.retreatAt + 1.4], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
        const k = move - back; // 0 = at start (offset), 1 = on target
        const fade = interpolate(t, [g.t, g.t + 0.3, end, end + 0.6], [0, 1, 1, 0], clamp);
        const cx = tx + dx * (1 - k), cy = ty + dy * (1 - k);
        const n = g.count ?? 6, size = g.size ?? 34;
        const color = g.kind === 'crowd' ? '#F4F1EA' : g.color ?? '#161A22';
        const cols = Math.ceil(Math.sqrt(n * 1.6));
        const items = Array.from({ length: n }, (_, i) => {
          if (g.kind === 'crowd') {
            // ring of people that grows around the point
            const a = random(`a${gi}${i}`) * Math.PI * 2, r = (0.35 + 0.65 * random(`r${gi}${i}`)) * (g.spread ?? 70);
            const appear = interpolate(t, [g.t + i * 0.05, g.t + i * 0.05 + 0.25], [0, 1], clamp);
            return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.6, s: appear, d: 0 };
          }
          const row = Math.floor(i / cols), col = i % cols;
          const sp = g.kind === 'tanks' ? size * 1.9 : size * 0.75;
          return { x: (col - (cols - 1) / 2) * sp + (row % 2) * sp * 0.4, y: row * size * 0.8, s: 1, d: random(`d${gi}${i}`) };
        });
        const moving = k > 0 && k < 1;
        const flip = dx > 0; // facing direction of travel
        return (
          <div key={gi} style={{ position: 'absolute', left: 0, top: 0, opacity: fade }}>
            {g.kind !== 'crowd' && (dx || dy) && move > 0 && (
              <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
                <line x1={tx + dx} y1={ty + dy} x2={cx} y2={cy} stroke="#FFFFFF" strokeWidth={8} strokeDasharray="18 14"
                  strokeDashoffset={-t * 60} opacity={0.75 * (1 - back)} strokeLinecap="round" />
                <circle cx={cx} cy={cy} r={10} fill="#fff" opacity={0.8 * (1 - back)} />
              </svg>
            )}
            {items.map((it, i) => {
              const bob = moving ? Math.sin((t + it.d) * 18) * 2.5 : 0;
              const x = cx + it.x, y = cy + it.y - size + bob;
              return (
                <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,0) scale(${it.s})`, filter: g.kind === 'crowd' ? 'drop-shadow(0 0 2px #000) drop-shadow(0 3px 4px rgba(0,0,0,0.8))' : 'drop-shadow(0 0 2.5px #fff) drop-shadow(0 0 1px #fff) drop-shadow(0 5px 6px rgba(0,0,0,0.8))' }}>
                  {g.kind === 'tanks' ? <Tank size={size} color={color} flip={flip} />
                    : g.kind === 'troops' ? <Soldier size={size} color={color} step={moving ? Math.sin((t + it.d) * 18) * 2 : 0} />
                      : <Person size={size} color={color} />}
                </div>
              );
            })}
            {g.caption && (
              <div style={{ position: 'absolute', left: Math.min(Math.max(cx, 200), 880), top: g.kind === 'crowd' ? cy + 110 : cy - size * 2.4, transform: 'translateX(-50%)',
                fontFamily: theme.font, fontWeight: 800, fontSize: 32, background: g.kind === 'crowd' ? 'rgba(245,241,234,0.95)' : 'rgba(22,26,34,0.92)', color: g.kind === 'crowd' ? '#0B1120' : '#fff', border: g.kind === 'crowd' ? 'none' : '2px solid #fff',
                padding: '6px 14px', borderRadius: 6, whiteSpace: 'nowrap', letterSpacing: 1 }}>{g.caption}</div>
            )}
          </div>
        );
      })}
    </>
  );
};
