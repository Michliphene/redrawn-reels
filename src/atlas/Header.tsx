import React from 'react';
import type { TimedAction } from '../lib/types';
import { dateToNum } from '../lib/schedule';
import { PALETTE } from '../lib/theme';
import { SAFE, ZONES } from '../studio/tokens';
import type { SeriesDef } from '../studio/series';
import { Display, Mono, Whisper } from '../studio/ui/Type';
import { ease, ramp, pop } from '../studio/motion';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const SAFE_W = SAFE.right - SAFE.left;

/** "03/15 NEW COUNTRIES" for the right side of the series bar: +1 each time a piece changes hands. */
export const Tally: React.FC<{ t: number; actions: TimedAction[]; total: number; label?: string; series: SeriesDef; from: number }> = ({ t, actions, total, label = 'NEW COUNTRIES', series, from }) => {
  if (t < from) return null;
  const ds = actions.filter((a) => a.type === 'declare').map((a) => a.t).filter((x) => x <= t);
  const last = ds.length ? Math.max(...ds) : -10;
  const k = 1 + 0.3 * (1 - Math.min(1, pop(t, last, 0.3)));
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
      <Mono size={22} color={series.palette.muted} track={0.12}>{label}</Mono>
      <Mono size={34} color={series.palette.accent} track={0.02} weight={800} style={{ transform: `scale(${k})`, transformOrigin: 'right center' }}>
        {String(ds.length).padStart(2, '0')}<span style={{ color: series.palette.muted, fontSize: 24 }}>/{total}</span>
      </Mono>
    </div>
  );
};

/** Thin time rail under the series bar: ticks every `step` years, one dot per dated event, a cursor that travels. */
export const Rail: React.FC<{ from: string; to: string; step?: number; dates: { t: number; date: string }[]; actions: TimedAction[]; t: number; series: SeriesDef; opacity?: number }> =
  ({ from, to, step = 1, dates, actions, t, series, opacity = 1 }) => {
    const a = dateToNum(from), b = dateToNum(to);
    const X = (d: string) => ((dateToNum(d) - a) / (b - a)) * SAFE_W;
    let cx = 0;
    for (let i = 0; i < dates.length; i++) {
      if (t < dates[i].t) break;
      const prev = i ? X(dates[i - 1].date) : 0;
      cx = prev + (X(dates[i].date) - prev) * ease.out3(ramp(t, dates[i].t, 0.8));
    }
    const years: string[] = [];
    for (let y = +from.slice(0, 4); y <= +to.slice(0, 4); y += step) years.push(`${y}-01-01`);
    const events = actions.filter((x) => x.type === 'declare' && !(x as any).instant) as Extract<TimedAction, { type: 'declare' }>[];
    const dateOf = (e: (typeof events)[number]) => e.date ?? [...dates].reverse().find((d) => d.t <= e.t + 0.01)?.date ?? from;
    const y = 14;
    return (
      <svg width={SAFE_W} height={48} style={{ position: 'absolute', left: SAFE.left, top: ZONES.hud.bottom + 6, opacity, overflow: 'visible' }}>
        <line x1={0} x2={SAFE_W} y1={y} y2={y} stroke={series.palette.muted} strokeWidth={3} opacity={0.4} />
        <line x1={0} x2={cx} y1={y} y2={y} stroke={series.palette.accent} strokeWidth={5} />
        {years.map((d, i) => (
          <g key={d}>
            <line x1={X(d)} x2={X(d)} y1={y - 7} y2={y + 7} stroke={series.palette.muted} strokeWidth={3} opacity={0.7} />
            {(i === 0 || i === years.length - 1 || years.length <= 7) && (
              <text x={X(d)} y={y + 30} fill={series.palette.muted} fontFamily="'JetBrains Mono', monospace" fontWeight={700} fontSize={18} letterSpacing={1.5}
                textAnchor={i === 0 ? 'start' : i === years.length - 1 ? 'end' : 'middle'}>{d.slice(0, 4)}</text>
            )}
          </g>
        ))}
        {events.map((e, i) => {
          const on = t >= e.t;
          return <rect key={i} x={X(dateOf(e)) - (on ? 6 : 4)} y={y - (on ? 6 : 4)} width={on ? 12 : 8} height={on ? 12 : 8} fill={on ? (PALETTE.ids[e.id] ?? series.palette.accent) : series.palette.surface} stroke={series.palette.bg} strokeWidth={2} />;
        })}
        <rect x={cx - 7} y={y - 7} width={14} height={14} fill={series.palette.ink} />
      </svg>
    );
  };

/**
 * When + what, as one left-aligned block: small date, huge year, one quiet line for the chapter.
 * Replaces the date badge, the chapter chip and the title card of DA v1.
 */
export const DateBlock: React.FC<{ dates: { t: number; date: string }[]; chapters: { t: number; text: string }[]; t: number; series: SeriesDef; opacity?: number; top?: number }> =
  ({ dates, chapters, t, series, opacity = 1, top = ZONES.title.top + 44 }) => {
    const cur = [...dates].reverse().find((d) => t >= d.t);
    const ch = [...chapters].reverse().find((c) => t >= c.t);
    if (opacity <= 0.01 || (!cur && !ch)) return null;
    const [y, m, d] = (cur?.date ?? '').split('-').map(Number);
    const p = cur ? ease.out3(ramp(t, cur.t, 0.3)) : 1;
    const cp = ch ? ease.out3(ramp(t, ch.t, 0.3)) : 0;
    return (
      <div style={{ position: 'absolute', left: SAFE.left, top, width: SAFE_W, opacity }}>
        {cur && (
          <div style={{ transform: `translateY(${(1 - p) * -14}px)`, opacity: p }}>
            <Mono size={30} color={series.palette.accent} track={0.18} style={{ height: 34 }}>{m ? `${d ? `${d} ` : ''}${MONTHS[m - 1]}` : ' '}</Mono>
            <Display size={150} color={series.palette.ink} style={{ marginTop: 2, letterSpacing: '-0.02em' }}>{y}</Display>
          </div>
        )}
        {ch && <Whisper size={50} color={series.palette.accent} style={{ marginTop: cur ? 4 : 0, opacity: cp, transform: `translateX(${(1 - cp) * -18}px)` }}>{ch.text}</Whisper>}
      </div>
    );
  };
