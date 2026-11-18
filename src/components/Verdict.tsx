import React from 'react';
import { spring } from 'remotion';
import type { TimedAction } from '../lib/types';
import { FPS, theme } from '../lib/theme';
import { ramp } from '../studio/motion';

type A = Extract<TimedAction, { type: 'verdict' }>;

/**
 * The viewer's ballot (cue `verdict`): two or three typed tick boxes ("CAUGHT" / "NEVER FOUND"); on `pickWord`
 * a red cross is drawn into the right one and the others dim. Open on the hook, ticked on the payoff: the same
 * object frames the question and the answer, and the last frame differs from the first only by that cross.
 *   { "type": "verdict", "options": ["CAUGHT", "NEVER FOUND"], "pick": 1, "pickWord": "never", "atTime": 0, "hold": 4, "x": 540, "y": 600 }
 */
export const Verdicts: React.FC<{ t: number; actions: TimedAction[] }> = ({ t, actions }) => (
  <>
    {(actions.filter((a) => a.type === 'verdict') as A[]).map((a, i) => {
      const hold = a.hold ?? 4;
      const end = a.t + hold;
      if (t < a.t || t > end + 0.4) return null;
      const o = Math.min(a.t <= 0.05 ? 1 : ramp(t, a.t, 0.25), 1 - ramp(t, end, 0.4));
      const tw = theme.typewriter || theme.font;
      // one tick (pick/pickAt) or a split verdict (picks: several ticks, each with its own time and note)
      const picks = a.picks ?? (a.pick != null && a.pickAt != null ? [{ pick: a.pick, at: a.pickAt }] : []);
      const tickAt = (j: number) => picks.find((p) => p.pick === j && p.at != null && t >= p.at!);
      const split = picks.length > 1;
      const firstAt = Math.min(...picks.map((p) => p.at ?? Infinity));
      const picked = t >= firstAt;
      const k = picked && !split ? spring({ frame: (t - firstAt) * FPS, fps: FPS, config: { damping: 11, stiffness: 220 } }) : 0;
      return (
        <div key={i} style={{ position: 'absolute', left: a.x ?? 560, top: a.y ?? 600, opacity: o, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {a.options.map((opt, j) => {
            const tk = tickAt(j);
            const mine = split ? !!tk : j === a.pick;
            const draw = tk ? Math.min(1, (t - tk.at!) / 0.3) : 0;
            const pop = tk ? spring({ frame: (t - tk.at!) * FPS, fps: FPS, config: { damping: 10, stiffness: 230 } }) : 0;
            const note = tk && 'note' in tk ? (tk as any).note as string | undefined : undefined;
            return (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: picked && !mine && !split ? 1 - 0.55 * k : 1, position: 'relative',
                background: theme.paper, padding: '10px 20px 8px 14px', boxShadow: '6px 6px 0 rgba(0,0,0,0.55)', transform: `rotate(${j % 2 ? 1.2 : -1}deg) scale(${1 + 0.06 * Math.sin(Math.PI * Math.min(1, pop))})` }}>
                <svg width={44} height={44} viewBox="0 0 44 44" style={{ flex: 'none' }}>
                  <rect x={3} y={3} width={38} height={38} fill="none" stroke={theme.paperInk} strokeWidth={4} />
                  {mine && picked && (
                    <g stroke={theme.stamp} strokeWidth={7} strokeLinecap="round">
                      <line x1={8} y1={8} x2={8 + 28 * Math.min(1, draw * 2)} y2={8 + 28 * Math.min(1, draw * 2)} />
                      {draw > 0.5 && <line x1={36} y1={8} x2={36 - 28 * (draw - 0.5) * 2} y2={8 + 28 * (draw - 0.5) * 2} />}
                    </g>
                  )}
                </svg>
                <span style={{ fontFamily: tw, fontWeight: 700, fontSize: 34, letterSpacing: '0.08em', color: theme.paperInk, textTransform: 'uppercase', whiteSpace: 'nowrap',
                  textDecoration: picked && !mine && !split && k > 0.5 ? `line-through ${theme.stamp} 4px` : 'none' }}>{opt}</span>
                {note && (
                  <span style={{ position: 'absolute', left: '100%', marginLeft: 14, top: '50%', transform: `translateY(-50%) rotate(-4deg) scale(${0.6 + 0.4 * pop})`, opacity: Math.min(1, pop * 1.4),
                    fontFamily: theme.stampFont || tw, fontWeight: 900, fontSize: 30, color: theme.stamp, border: `4px solid ${theme.stamp}`, padding: '2px 10px', whiteSpace: 'nowrap',
                    letterSpacing: '0.06em', background: 'rgba(7,6,5,0.85)' }}>{note}</span>
                )}
              </div>
            );
          })}
        </div>
      );
    })}
  </>
);
