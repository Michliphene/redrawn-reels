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
      const picked = a.pickAt != null && t >= a.pickAt;
      const k = picked ? spring({ frame: (t - a.pickAt!) * FPS, fps: FPS, config: { damping: 11, stiffness: 220 } }) : 0;
      const draw = picked ? Math.min(1, (t - a.pickAt!) / 0.3) : 0;
      return (
        <div key={i} style={{ position: 'absolute', left: a.x ?? 560, top: a.y ?? 600, opacity: o, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {a.options.map((opt, j) => {
            const mine = j === a.pick;
            return (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: picked && !mine ? 1 - 0.55 * k : 1,
                background: theme.paper, padding: '10px 20px 8px 14px', boxShadow: '6px 6px 0 rgba(0,0,0,0.55)', transform: `rotate(${j % 2 ? 1.2 : -1}deg)` }}>
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
                  textDecoration: picked && !mine && k > 0.5 ? `line-through ${theme.stamp} 4px` : 'none' }}>{opt}</span>
              </div>
            );
          })}
        </div>
      );
    })}
  </>
);
