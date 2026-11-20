import React from 'react';
import { GeoProjection } from 'd3-geo';
import { interpolate, spring } from 'remotion';
import type { GeoData, TimedAction } from '../lib/types';
import { theme, FPS, REPUBLIC_COLORS, isFocus, isOutline, PALETTE } from '../lib/theme';
import { Flag } from './Flag';

export const FLAG_TODAY: Record<string, string> = { RUS:'ru', UKR:'ua', BLR:'by', EST:'ee', LVA:'lv', LTU:'lt', MDA:'md', GEO:'ge', ARM:'am', AZE:'az', KAZ:'kz', UZB:'uz', TKM:'tm', KGZ:'kg', TJK:'tj' };
const fmt = (d?: string) => {
  if (!d) return '';
  const [y, m, day] = d.split('-').map(Number);
  if (!m) return String(y);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

const Tag: React.FC<{ x: number; y: number; t: number; t0: number; hold: number; children: React.ReactNode; size?: number; sub?: string; dot?: boolean; plate?: boolean }> =
  ({ x, y, t, t0, hold, children, size = 44, sub, dot, plate }) => {
    if (t < t0 || t > t0 + hold + 0.4) return null;
    const s = t0 <= 0.05 ? 1 : spring({ frame: (t - t0) * FPS, fps: FPS, config: { damping: 14, stiffness: 160 } });
    const out = interpolate(t, [t0 + hold, t0 + hold + 0.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (
      <div style={{ position: 'absolute', left: Math.min(Math.max(x, 230), 850), top: y, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * s})`, opacity: s * out, textAlign: 'center', pointerEvents: 'none' }}>
        {dot && <div style={{ width: 18, height: 18, borderRadius: 9, background: theme.accent, margin: '0 auto 10px', boxShadow: `0 0 0 ${6 + 10 * (1 - s)}px rgba(255,201,77,0.25)` }} />}
        <div style={{ fontFamily: theme.font, fontWeight: 800, fontSize: size, color: theme.text, letterSpacing: 1, whiteSpace: 'nowrap',
          ...(plate ? { background: 'rgba(8,12,22,0.86)', padding: '4px 14px', borderRadius: theme.radius ? 8 : 0 } : {}),
          textShadow: '0 3px 12px rgba(0,0,0,0.85), 0 0 2px #000' }}>{children}</div>
        {sub && <div style={{ fontFamily: theme.font, fontWeight: 600, fontSize: size * 0.55, color: theme.accent, marginTop: 2, textShadow: '0 2px 8px #000', whiteSpace: 'nowrap' }}>{sub}</div>}
      </div>
    );
  };

/** Labels anchored to geography; they follow the camera because they are re-projected every frame. */
export const Labels: React.FC<{ geo: GeoData; projection: GeoProjection; t: number; actions: TimedAction[]; end: number; legend?: boolean; legendTop?: number; legendInset?: number; declutter?: boolean; legendOut?: number }> = ({ geo, projection, t, actions, end, legend = true, legendTop = 150, legendInset = 70, declutter = false, legendOut }) => {
  const byId = new Map(geo.features.map((f) => [f.id, f]));
  const pt = (ll: [number, number]) => projection(ll) ?? [-999, -999];
  const nodes: React.ReactNode[] = [];
  const allT = actions.find((x) => x.type === 'allLabels')?.t;
  actions.forEach((a, i) => {
    if (a.type === 'declare') {
      const f = byId.get(a.id); const ll = (f?.properties as any)?.label;
      if (!ll) return; const [x, y] = pt(ll);
      // shockwave ring in the republic's colour
      if (a.t > 0.05 && !(a as any).quiet && t >= a.t && t < a.t + 0.9) {
        const r = interpolate(t, [a.t, a.t + 0.9], [10, 190]);
        const o = interpolate(t, [a.t, a.t + 0.9], [0.9, 0]);
        nodes.push(<div key={`w${i}`} style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%',
          border: `6px solid ${(a as any).color ?? PALETTE.ids[a.id]}`, opacity: o, boxShadow: `0 0 30px ${(a as any).color ?? PALETTE.ids[a.id]}` }} />);
      }
      if ((a as any).noLabel) return;
      const big = ['EST', 'LVA', 'LTU', 'GEO'].includes(a.id);
      // declutter (DA v2): a name tag gives way as soon as a later one would land on top of it
      let room = 1e9;
      if (declutter) {
        for (const b of actions) {
          if (b.type !== 'declare' || b.t <= a.t || (b as any).noLabel) continue;
          const lb = (byId.get(b.id)?.properties as any)?.label; if (!lb) continue;
          const [bx, by] = pt(lb);
          if (Math.abs(bx - x) < 330 && Math.abs(by - y) < 96) { room = b.t - a.t - 0.05; break; }
        }
      }
      nodes.push(<Tag key={i} x={x} y={y - 40} t={t} t0={a.t} hold={Math.min(2.4, room, Math.max(0.3, (allT ?? 1e9) - a.t - 0.4))} sub={fmt(a.date ?? undefined) + (a.flagNote ? ` · ${a.flagNote}` : '')} size={big ? 52 : 40}>
        {a.flag && <Flag code={a.flag} h={big ? 56 : 44} t={t} style={{ marginRight: 12, verticalAlign: 'middle' }} />}
        <span style={{ verticalAlign: 'middle' }}>{(f!.properties as any).name}</span></Tag>);
    } else if (a.type === 'label') {
      const [x, y] = pt(a.at);
      nodes.push(<Tag key={i} x={x} y={y} t={t} t0={a.t} hold={a.hold ?? 2.5} size={a.size === 'xl' ? 120 : 48} plate={(a as any).plate}>{a.flag && <Flag code={a.flag} h={a.size === 'xl' ? 90 : 40} t={t} style={{ marginRight: 20, verticalAlign: 'middle' }} />}<span style={{ verticalAlign: 'middle' }}>{a.text}</span></Tag>);
    } else if (a.type === 'marker') {
      const [x, y] = pt(a.at);
      nodes.push(<Tag key={i} x={x} y={y + 22} t={t} t0={a.t} hold={a.hold ?? 2.5} size={42} dot>{a.text}</Tag>);
    } else if (a.type === 'allLabels') {
      // big polities labelled on the map, all 15 in a legend grid (small ones would collide)
      const sov = geo.features.filter((f) => isFocus(f) && !isOutline(f));
      sov.filter((f) => !legend || ['RUS', 'UKR', 'KAZ'].includes(String(f.id))).forEach((f, j) => {
        const [x, y] = pt((f.properties as any).label);
        nodes.push(<Tag key={`m${j}`} x={x} y={y} t={t} t0={a.t} hold={end - a.t} size={f.id === 'RUS' ? 46 : 30}>{(f.properties as any).name}</Tag>);
      });
      if (!legend) return;
      const order = ['RUS','UKR','BLR','EST','LVA','LTU','MDA','GEO','ARM','AZE','KAZ','UZB','TKM','KGZ','TJK'];
      nodes.push(
        <div key="legend" style={{ position: 'absolute', top: legendTop, left: legendInset, right: legendInset, opacity: legendOut != null ? interpolate(t, [legendOut, legendOut + 0.25], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 14px' }}>
          {order.map((id, j) => {
            const o = interpolate(t, [a.t + j * 0.07, a.t + j * 0.07 + 0.25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const f = byId.get(id);
            return (
              <div key={id} style={{ opacity: o, display: 'flex', alignItems: 'center', gap: 10, fontFamily: theme.font, fontWeight: 700, fontSize: 24, color: theme.text }}>
                <span style={{ width: 10, height: 30, borderRadius: 3, background: REPUBLIC_COLORS[id], flex: 'none' }} /><Flag code={FLAG_TODAY[id]} h={26} t={t} wave={0.4} />{(f?.properties as any)?.name}
              </div>
            );
          })}
        </div>
      );
    }
  });
  return <>{nodes}</>;
};
