import React from 'react';
import { interpolate, Easing } from 'remotion';
import type { TimedAction } from '../lib/types';
import { dateToNum } from '../lib/schedule';
import { theme, PALETTE } from '../lib/theme';

/** Horizontal "frise": year ticks, one dot per dated event (coloured when it happens), animated cursor. */
export const Timeline: React.FC<{ from: string; to: string; step?: number; dates: { t: number; date: string }[]; actions: TimedAction[]; t: number; y?: number }> =
  ({ from, to, step = 1, dates, actions, t, y = 1700 }) => {
    const x0 = 90, x1 = 990, a = dateToNum(from), b = dateToNum(to);
    const X = (d: string) => x0 + ((dateToNum(d) - a) / (b - a)) * (x1 - x0);
    // cursor: eases from previous date to current one over 0.8s
    let cx = x0;
    for (let i = 0; i < dates.length; i++) {
      if (t < dates[i].t) break;
      const prev = i ? X(dates[i - 1].date) : x0;
      cx = interpolate(t, [dates[i].t, dates[i].t + 0.8], [prev, X(dates[i].date)], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
    }
    const years: string[] = [];
    for (let yy = +from.slice(0, 4); yy <= +to.slice(0, 4); yy += step) years.push(`${yy}-01-01`);
    const events = actions.filter((x) => x.type === 'declare') as Extract<TimedAction, { type: 'declare' }>[];
    const beatDate = (e: (typeof events)[number]) => e.date ?? [...dates].reverse().find((d) => d.t <= e.t + 0.01)?.date ?? from;
    return (
      <svg width={1080} height={160} style={{ position: 'absolute', left: 0, top: y - 60 }}>
        <line x1={x0} x2={x1} y1={60} y2={60} stroke={theme.muted} strokeWidth={3} opacity={0.5} />
        <line x1={x0} x2={cx} y1={60} y2={60} stroke={theme.accent} strokeWidth={6} strokeLinecap="round" />
        {years.map((d) => (
          <g key={d}>
            <line x1={X(d)} x2={X(d)} y1={44} y2={76} stroke={theme.muted} strokeWidth={3} />
            <text x={X(d)} y={118} fill={theme.muted} fontFamily={theme.font} fontWeight={700} fontSize={30} textAnchor="middle">{d.slice(0, 4)}</text>
          </g>
        ))}
        {events.map((e, i) => {
          const on = t >= e.t;
          const r = on ? interpolate(t, [e.t, e.t + 0.3], [16, 9], { extrapolateRight: 'clamp' }) : 6;
          return <circle key={i} cx={X(beatDate(e))} cy={60} r={r} fill={on ? (PALETTE.ids[e.id] ?? theme.accent) : '#3A4560'} stroke="#0B1120" strokeWidth={2} />;
        })}
        {!events.length && dates.map((d, i) => {
          const on = t >= d.t;
          return <circle key={`d${i}`} cx={X(d.date)} cy={60} r={on ? 9 : 6} fill={on ? theme.accent : '#3A4560'} stroke="#0B1120" strokeWidth={2} />;
        })}
        <circle cx={cx} cy={60} r={12} fill={theme.text} />
      </svg>
    );
  };
