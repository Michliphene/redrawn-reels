import React from 'react';
import { Img, staticFile, spring, interpolate, Easing } from 'remotion';
import type { TimedAction } from '../lib/types';
import { FPS, theme } from '../lib/theme';

/** Data-episode charts driven by the same word-timed cue list as the map episodes. */
export type ThenNowChart = {
  type: 'thenNow'; title: string; legend: [string, string]; suffix?: string; decimals?: number;
  items: { k: string; label: string; unit?: string; emoji?: string; then: number; now: number }[];
};
export type LineChartSpec = {
  type: 'line'; title: string; suffix?: string; decimals?: number; signed?: boolean; yMin: number; yMax: number;
  xFrom: number; xTo: number; refY?: number; refLabel?: string;
  series: { k: string; label: string; color: string; emoji?: string; points: [number, number][] }[];
};
export type ChartSpec = ThenNowChart | LineChartSpec;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const GOOD = '#3DDC84', BAD = '#FF5A4E';
const fmt = (v: number, c: { suffix?: string; decimals?: number; signed?: boolean }) =>
  `${c.signed && v > 0.05 ? '+' : ''}${v.toFixed(c.decimals ?? 0)}${c.suffix ?? ''}`.replace('-', '−');

const Title: React.FC<{ text: string; s: number }> = ({ text, s }) => (
  <div style={{ position: 'absolute', top: 410, left: 60, right: 60, fontFamily: 'Montserrat', fontWeight: 900, fontSize: 58, lineHeight: 1.05,
    color: theme.text, opacity: s, transform: `translateY(${(1 - s) * 20}px)`, textShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>{text}</div>
);

// ---------------------------------------------------------------- then vs now board
const ThenNow: React.FC<{ c: ThenNowChart; t: number; t0: number; actions: TimedAction[] }> = ({ c, t, t0, actions }) => {
  const reveals = actions.filter((a) => a.type === 'reveal' && a.t >= t0 - 0.01) as Extract<TimedAction, { type: 'reveal' }>[];
  const focusA = (actions.filter((a) => a.type === 'focus' && a.t >= t0 - 0.01 && a.t <= t) as Extract<TimedAction, { type: 'focus' }>[]).slice(-1)[0];
  const focusT = focusA ? interpolate(t, [focusA.t, focusA.t + 0.35], [0, 1], clamp) : 0;
  const max = Math.max(...c.items.flatMap((i) => [i.then, i.now]));
  const top = 560, rowH = 128, labelW = 330, valueW = 175, chipW = 132, barMax = 960 - labelW - valueW - chipW - 30;
  const s = spring({ frame: (t - t0) * FPS, fps: FPS, config: { damping: 200 } });
  return (
    <>
      <Title text={c.title} s={s} />
      <div style={{ position: 'absolute', top: 492, left: 60 + labelW, display: 'flex', gap: 30, fontFamily: 'Montserrat', fontWeight: 800, fontSize: 28, opacity: s }}>
        <span style={{ color: theme.muted }}>▬ {c.legend[0]}</span><span style={{ color: theme.text }}>▬ {c.legend[1]}</span>
      </div>
      {c.items.map((it, idx) => {
        const r = reveals.find((a) => a.item === it.k);
        if (!r || t < r.t - 0.05) return null;
        const inT = spring({ frame: (t - r.t) * FPS, fps: FPS, config: { damping: 16, stiffness: 170 } });
        const thenT = interpolate(t, [r.t + 0.05, r.t + 0.6], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const nowT = interpolate(t, [r.t + 0.45, r.t + 1.15], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const chipT = spring({ frame: (t - r.t - 1.1) * FPS, fps: FPS, config: { damping: 10, stiffness: 190 } });
        const d = it.now / it.then - 1;
        const col = d > 0.02 ? BAD : d < -0.02 ? GOOD : theme.accent;
        const focused = focusA?.item === it.k;
        const dim = focusA && focusA.item && !focused ? 1 - 0.7 * focusT : 1;
        const y = top + idx * rowH;
        return (
          <div key={it.k} style={{ position: 'absolute', left: 60, top: y, width: 960, height: rowH - 16, display: 'flex', alignItems: 'center',
            opacity: inT * dim, transform: `translateX(${(1 - inT) * -80}px) scale(${focused ? 1 + 0.04 * focusT : 1})`,
            background: focused ? `rgba(255,90,78,${0.14 * focusT})` : 'rgba(255,255,255,0.03)', borderRadius: 18,
            outline: focused ? `3px solid rgba(255,90,78,${focusT})` : 'none' }}>
            <div style={{ width: labelW, display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 10, flexShrink: 0 }}>
              {it.emoji && <Img src={staticFile(`assets/emoji/${it.emoji}.png`)} style={{ width: 84, height: 84 }} />}
              <div>
                <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 38, color: theme.text, lineHeight: 1 }}>{it.label}</div>
                {it.unit && <div style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: 24, color: theme.muted, marginTop: 6 }}>{it.unit}</div>}
              </div>
            </div>
            <div style={{ width: barMax, position: 'relative', height: '100%', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 26, height: 22, borderRadius: 6, background: theme.muted, opacity: 0.6, width: (it.then / max) * barMax * thenT }} />
              <div style={{ position: 'absolute', top: 58, height: 30, borderRadius: 6, background: col, width: (it.now / max) * barMax * nowT, boxShadow: `0 0 24px ${col}66` }} />
            </div>
            <div style={{ width: chipW, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 30, color: '#0B1120', background: col, borderRadius: 10, padding: '4px 12px',
                opacity: chipT, transform: `scale(${0.4 + 0.6 * chipT})` }}>{fmt(d * 100, { suffix: '%', signed: true })}</div>
            </div>
            <div style={{ width: valueW, textAlign: 'right', paddingRight: 14, fontFamily: 'Montserrat', flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 26, color: theme.muted }}>{fmt(it.then * thenT, c)}</div>
              <div style={{ fontWeight: 900, fontSize: 36, color: theme.text }}>{fmt(it.now * nowT, c)}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- line chart with word-synced drawing
const LineChart: React.FC<{ c: LineChartSpec; t: number; t0: number; tEnd: number; startX?: number; actions: TimedAction[] }> = ({ c, t, t0, tEnd, startX, actions }) => {
  const L = 150, R = 950, T = 560, B = 1200;
  const sx = (x: number) => L + ((x - c.xFrom) / (c.xTo - c.xFrom)) * (R - L);
  const sy = (y: number) => B - ((y - c.yMin) / (c.yMax - c.yMin)) * (B - T);
  const draws = (actions.filter((a) => a.type === 'drawTo' && a.t >= t0 - 0.01 && a.t < tEnd) as Extract<TimedAction, { type: 'drawTo' }>[]).sort((a, b) => a.t - b.t);
  let xNow = startX ?? c.xFrom;
  for (const d of draws) {
    if (t < d.t) break;
    xNow = interpolate(t, [d.t, d.t + (d.dur ?? 0.9)], [xNow, d.x], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  }
  const marks = actions.filter((a) => a.type === 'mark' && a.t >= t0 - 0.01 && a.t < tEnd && t >= a.t) as Extract<TimedAction, { type: 'mark' }>[];
  const s = spring({ frame: (t - t0) * FPS, fps: FPS, config: { damping: 200 } });
  const step = (c.yMax - c.yMin) / 4;
  const ticks = Array.from({ length: 5 }, (_, k) => c.yMin + k * step);
  const years = [] as number[]; for (let y = Math.ceil(c.xFrom / 10) * 10; y <= c.xTo; y += 10) years.push(y);
  return (
    <>
      <Title text={c.title} s={s} />
      <svg width={1080} height={1920} style={{ position: 'absolute', opacity: s }}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={R} y1={sy(v)} y2={sy(v)} stroke="#fff" strokeOpacity={0.08} strokeWidth={2} />
            <text x={L - 16} y={sy(v) + 10} fill={theme.muted} fontFamily="Montserrat" fontWeight={700} fontSize={26} textAnchor="end">{fmt(v, c)}</text>
          </g>
        ))}
        {years.map((y) => <text key={y} x={sx(y)} y={B + 46} fill={theme.muted} fontFamily="Montserrat" fontWeight={700} fontSize={28} textAnchor="middle">{y}</text>)}
        {c.refY != null && (
          <g>
            <line x1={L} x2={R} y1={sy(c.refY)} y2={sy(c.refY)} stroke={theme.text} strokeOpacity={0.6} strokeWidth={3} strokeDasharray="12 10" />
            {c.refLabel && <text x={R} y={sy(c.refY) - 14} fill={theme.text} fillOpacity={0.75} fontFamily="Montserrat" fontWeight={800} fontSize={26} textAnchor="end">{c.refLabel}</text>}
          </g>
        )}
        {c.series.map((se) => {
          const pts = se.points.filter((p) => p[0] <= xNow);
          const nxt = se.points.find((p) => p[0] > xNow);
          const last = pts[pts.length - 1];
          if (last && nxt) pts.push([xNow, last[1] + ((nxt[1] - last[1]) * (xNow - last[0])) / (nxt[0] - last[0])]);
          if (pts.length < 2) return null;
          const d = pts.map((p, j) => `${j ? 'L' : 'M'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ');
          return <path key={se.k} d={d} fill="none" stroke={se.color} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 14px ${se.color}99)` }} />;
        })}
        {marks.map((m, i) => {
          const se = c.series.find((x) => x.k === m.series) ?? c.series[0];
          const p = se.points.reduce((a, b) => (Math.abs(b[0] - m.x) < Math.abs(a[0] - m.x) ? b : a));
          const k = spring({ frame: (t - m.t) * FPS, fps: FPS, config: { damping: 12, stiffness: 180 } });
          const px = sx(p[0]), py = sy(p[1]);
          const above = py - T > 150;
          const ly = above ? py - 120 : py + 120;
          const col = m.tone === 'bad' ? BAD : m.tone === 'good' ? GOOD : theme.accent;
          const w = m.text.length * 21 + 40;
          const lx = Math.min(Math.max(px, L + w / 2 - 40), R - w / 2 + 40);
          return (
            <g key={i} opacity={k}>
              <circle cx={px} cy={py} r={16 * k} fill={col} stroke="#0B1120" strokeWidth={4} />
              <line x1={px} x2={px} y1={above ? py - 22 : py + 22} y2={above ? ly + 22 : ly - 26} stroke={col} strokeWidth={4} strokeDasharray="8 6" />
              <rect x={lx - w / 2} y={ly - 30} width={w} height={56} rx={12} fill={col} transform={`translate(${lx} ${ly}) scale(${0.6 + 0.4 * k}) translate(${-lx} ${-ly})`} />
              <text x={lx} y={ly + 10} fill="#0B1120" fontFamily="Montserrat" fontWeight={900} fontSize={32} textAnchor="middle">{m.text}</text>
            </g>
          );
        })}
      </svg>
      {c.series.map((se) => {
        // emoji rides the head of each line, with its live value
        const pts = se.points;
        const i = pts.findIndex((p) => p[0] > xNow);
        const a = i <= 0 ? pts[Math.max(0, i === -1 ? pts.length - 1 : 0)] : pts[i - 1];
        const b = i <= 0 ? a : pts[i];
        const y = b === a ? a[1] : a[1] + ((b[1] - a[1]) * (xNow - a[0])) / (b[0] - a[0]);
        const x = Math.min(xNow, pts[pts.length - 1][0]);
        return (
          <div key={se.k} style={{ position: 'absolute', left: sx(x) - 40, top: sy(y) - 92, width: 80, textAlign: 'center', opacity: s }}>
            {se.emoji && <Img src={staticFile(`assets/emoji/${se.emoji}.png`)} style={{ width: 70, height: 70, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.6))' }} />}
            <div style={{ position: 'absolute', left: 78, top: 18, whiteSpace: 'nowrap', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 36,
              color: se.color, WebkitTextStroke: '6px #0B1120', paintOrder: 'stroke fill' }}>{fmt(y, c)}</div>
          </div>
        );
      })}
    </>
  );
};

/** Shows whichever chart was cued last; dims it while a callout / big number is on screen. */
export const ChartLayer: React.FC<{ t: number; actions: TimedAction[]; charts: Record<string, ChartSpec> }> = ({ t, actions, charts }) => {
  const shows = (actions.filter((a) => a.type === 'chart' || a.type === 'hideChart') as TimedAction[]).sort((a, b) => a.t - b.t);
  const idx = shows.findIndex((a, i) => t >= a.t - 0.01 && (i === shows.length - 1 || t < shows[i + 1].t));
  if (idx < 0) return null;
  const cur = shows[idx] as Extract<TimedAction, { type: 'chart' }>;
  if (cur.type !== 'chart') return null;
  const c = charts[cur.chart]; if (!c) return null;
  const tEnd = shows[idx + 1]?.t ?? 1e9;
  const overlays = actions.filter((a) => (a.type === 'callout' || a.type === 'bigNumber') && t >= a.t - 0.1 && t <= a.t + ((a as any).hold ?? 2.8) + 0.3);
  const dim = overlays.length ? 0.22 : 1;
  const fade = interpolate(t, [tEnd - 0.2, tEnd], [1, 0], clamp);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: dim * fade, filter: dim < 1 ? 'blur(3px)' : 'none' }}>
      {c.type === 'thenNow' ? <ThenNow c={c} t={t} t0={cur.t} actions={actions} />
        : <LineChart c={c} t={t} t0={cur.t} tEnd={tEnd} startX={cur.drawTo} actions={actions} />}
    </div>
  );
};
