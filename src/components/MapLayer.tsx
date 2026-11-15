import React, { useMemo } from 'react';
import { geoPath, geoGraticule10, GeoProjection } from 'd3-geo';
import { interpolate, interpolateColors } from 'remotion';
import type { GeoData, TimedAction } from '../lib/types';
import { theme, PALETTE, isFocus, isOutline } from '../lib/theme';

const FLASH = 0.25, SETTLE = 0.7;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Fill of a focus polity at time t: palette.start until its `declare`, then flash → its own colour. */
function fillAt(id: string, t: number, declares: TimedAction[], recolors: TimedAction[] = []): string {
  const r = recolors.find((a) => a.type === 'recolor' && a.ids.includes(id) && t >= a.t);
  if (r) return interpolateColors(t, [r.t, r.t + 0.12], [fillAt(id, r.t, declares), PALETTE.start]); // fast: avoids a grey RGB midpoint
  const d = declares.find((a) => a.type === 'declare' && a.id === id);
  if (!d || t < d.t) return PALETTE.start;
  const target = PALETTE.ids[id] ?? theme.accent;
  if (t < d.t + FLASH) return interpolateColors(t, [d.t, d.t + FLASH], [PALETTE.start, '#FFF6E0']);
  return interpolateColors(t, [d.t + FLASH, d.t + FLASH + SETTLE], ['#FFF6E0', target]);
}

export const MapLayer: React.FC<{ geo: GeoData; projection: GeoProjection; t: number; actions: TimedAction[] }> = ({ geo, projection, t, actions }) => {
  const path = geoPath(projection);
  const declares = useMemo(() => actions.filter((a) => a.type === 'declare'), [actions]);
  const pulses = actions.filter((a) => a.type === 'pulse') as Extract<TimedAction, { type: 'pulse' }>[];
  const ghosts = actions.filter((a) => a.type === 'ghost') as Extract<TimedAction, { type: 'ghost' }>[];
  const paths = actions.filter((a) => a.type === 'path') as Extract<TimedAction, { type: 'path' }>[];
  const dissolve = actions.find((a) => a.type === 'dissolve');
  // outline fades when the union dissolves, or once every focus polity has changed hands
  const focusIds = geo.features.filter((f) => isFocus(f) && !isOutline(f)).map((f) => String(f.id));
  const lastDeclare = focusIds.every((id) => declares.some((d) => d.type === 'declare' && d.id === id))
    ? Math.max(...declares.filter((d) => d.type === 'declare' && focusIds.includes(d.id)).map((d) => d.t)) : null;
  const fadeAt = dissolve ? dissolve.t : lastDeclare;
  const outlineOpacity = fadeAt != null ? interpolate(t, [fadeAt, fadeAt + 1.2], [1, 0], clamp) : 1;
  const outline = geo.features.find(isOutline);
  const polities = geo.features.filter((f) => !isOutline(f) && !(f.properties as any)?.ghost);
  const base = polities.filter((f) => !isFocus(f) && !PALETTE.static[String(f.id)]);
  const statics = polities.filter((f) => !isFocus(f) && PALETTE.static[String(f.id)]);
  const focus = polities.filter(isFocus);
  // hidden focus features appear on `reveal`, visible ones fade on `conceal` (e.g. 1945 zones -> today's states)
  const vis = (f: any) => {
    const id = String(f.id);
    const r = actions.find((a) => a.type === 'reveal' && a.ids.includes(id));
    const c = actions.find((a) => a.type === 'conceal' && a.ids.includes(id));
    let o = f.properties?.hidden ? (r ? interpolate(t, [r.t, r.t + 0.6], [0, 1], clamp) : 0) : 1;
    if (c) o *= interpolate(t, [c.t + 0.6, c.t + 1.0], [1, 0], clamp); // old shapes fade only once the new ones are opaque
    return o;
  };
  const pulseAmt = (id: string) => Math.max(0, ...pulses.filter((p) => p.ids.includes(id)).map((p) => interpolate(t, [p.t, p.t + 0.15, p.t + 1.1], [0, 1, 0], clamp)));
  const grat = path(geoGraticule10()) ?? '';
  const shatter = dissolve ? interpolate(t, [dissolve.t - 0.1, dissolve.t + 0.35, dissolve.t + 2.2], [0, 1, 0], clamp) : 0;
  const centre = outline ? path.centroid(outline as any) : [540, 800];
  const offset = (f: any): string => {
    if (!shatter) return '';
    const [x, y] = path.centroid(f); const dx = x - centre[0], dy = y - centre[1]; const d = Math.hypot(dx, dy) || 1;
    const k = shatter * (f.id === 'RUS' ? 14 : 38);
    return `translate(${(dx / d) * k} ${(dy / d) * k})`;
  };
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7" /></filter></defs>
      <path d={grat} fill="none" stroke="#1A2540" strokeWidth={1} />
      {base.map((f) => <path key={String(f.id)} d={path(f as any) ?? ''} fill={theme.land} stroke={theme.landStroke} strokeWidth={1} />)}
      {statics.map((f) => <path key={String(f.id)} d={path(f as any) ?? ''} fill={PALETTE.static[String(f.id)]} stroke="#0B1120" strokeWidth={1.2} />)}
      {outline && outlineOpacity > 0 && (
        <path d={path(outline as any) ?? ''} fill="none" stroke={PALETTE.start} strokeWidth={14} opacity={0.55 * outlineOpacity} filter="url(#glow)" />
      )}
      {focus.filter((f) => vis(f) > 0).map((f) => (
        <path key={String(f.id)} d={path(f as any) ?? ''} opacity={vis(f)} transform={offset(f)} fill={fillAt(String(f.id), t, declares, actions.filter((a) => a.type === 'recolor'))}
          stroke={pulseAmt(String(f.id)) > 0 ? '#FFFFFF' : '#0B1120'} strokeWidth={1.4 + pulseAmt(String(f.id)) * 5} strokeLinejoin="round" />
      ))}
      {outline && outlineOpacity > 0 && <path d={path(outline as any) ?? ''} fill="none" stroke={PALETTE.startStroke} strokeWidth={2.5} opacity={outlineOpacity} />}
      {ghosts.map((g, i) => {
        const f = geo.features.find((x) => x.id === g.id); if (!f) return null;
        const o = interpolate(t, [g.t, g.t + 0.5, g.t + (g.hold ?? 3), g.t + (g.hold ?? 3) + 0.5], [0, 1, 1, 0], clamp);
        if (o <= 0) return null;
        const s = interpolate(t, [g.t, g.t + 0.6], [1.6, 1], clamp);
        const [cx, cy] = path.centroid(f as any);
        if ((f.properties as any)?.lines) return <path key={`g${i}`} d={path(f as any) ?? ''} fill="none" stroke="#FFFFFF" strokeWidth={2.5} opacity={0.85 * o} />;
        return <path key={`g${i}`} d={path(f as any) ?? ''} fill={g.color ?? '#F2994A'} fillOpacity={0.55 * o} stroke="#fff" strokeWidth={4} strokeDasharray="14 10"
          opacity={o} transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`} />;
      })}
      {paths.map((p, i) => {
        const end = p.t + (p.hold ?? 4);
        if (t < p.t || t > end + 0.5) return null;
        const prog = interpolate(t, [p.t, p.t + (p.dur ?? 1.4)], [(p as any).from ?? 0, 1], clamp); // `from` lets a path start partly drawn (frame 0)
        const o = interpolate(t, [end, end + 0.5], [1, 0], clamp);
        const d = path({ type: 'LineString', coordinates: p.coords } as any) ?? '';
        return (
          <g key={`p${i}`} opacity={o}>
            <path d={d} fill="none" stroke="#000" strokeOpacity={0.5} strokeWidth={(p.width ?? 7) + 5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog} strokeLinecap="round" />
            <path d={d} fill="none" stroke={p.color ?? theme.accent} strokeWidth={p.width ?? 7} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog} strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
};
