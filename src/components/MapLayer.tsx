import React, { useMemo } from 'react';
import { geoPath, geoGraticule10, GeoProjection } from 'd3-geo';
import { interpolate, interpolateColors } from 'remotion';
import type { GeoData, TimedAction } from '../lib/types';
import { theme, REPUBLIC_COLORS } from '../lib/theme';

const FLASH = 0.25, SETTLE = 0.7;

/** Fill colour of a polity at time t, driven by `declare` actions (state change with a white flash). */
function fillAt(id: string, soviet: boolean, t: number, declares: TimedAction[]) {
  if (!soviet) return theme.land;
  const d = declares.find((a) => a.type === 'declare' && a.id === id);
  if (!d || t < d.t) return theme.union;
  const target = REPUBLIC_COLORS[String(id)] ?? theme.accent;
  if (t < d.t + FLASH) return interpolateColors(t, [d.t, d.t + FLASH], [theme.union, '#FFF6E0']);
  return interpolateColors(t, [d.t + FLASH, d.t + FLASH + SETTLE], ['#FFF6E0', target]);
}

export const MapLayer: React.FC<{ geo: GeoData; projection: GeoProjection; t: number; actions: TimedAction[] }> = ({ geo, projection, t, actions }) => {
  const path = geoPath(projection);
  const declares = useMemo(() => actions.filter((a) => a.type === 'declare'), [actions]);
  const pulses = actions.filter((a) => a.type === 'pulse') as Extract<TimedAction, { type: 'pulse' }>[];
  const dissolve = actions.find((a) => a.type === 'dissolve');
  const outlineOpacity = dissolve ? interpolate(t, [dissolve.t, dissolve.t + 1.2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  const outline = geo.features.find((f) => f.id === 'SOVIET_OUTLINE');
  const polities = geo.features.filter((f) => f.id !== 'SOVIET_OUTLINE');
  const others = polities.filter((f) => !(f.properties as any).soviet);
  const soviets = polities.filter((f) => (f.properties as any).soviet);
  // pulse: bright stroke that decays over 1s
  const pulseAmt = (id: string) => Math.max(0, ...pulses.filter((p) => p.ids.includes(id)).map((p) =>
    interpolate(t, [p.t, p.t + 0.15, p.t + 1.1], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })));
  const grat = path(geoGraticule10()) ?? '';
  // shatter: republics fly apart from the union's centre when it dissolves, then settle back (borders stay accurate)
  const shatter = dissolve ? interpolate(t, [dissolve.t - 0.1, dissolve.t + 0.35, dissolve.t + 2.2], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
  const centre = outline ? path.centroid(outline) : [540, 800];
  const offset = (f: any): string => {
    if (!shatter) return '';
    const [x, y] = path.centroid(f); const dx = x - centre[0], dy = y - centre[1]; const d = Math.hypot(dx, dy) || 1;
    const k = shatter * (f.id === 'RUS' ? 14 : 38);
    return `translate(${(dx / d) * k} ${(dy / d) * k})`;
  };
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>
      <path d={grat} fill="none" stroke="#1A2540" strokeWidth={1} />
      {others.map((f) => <path key={f.id} d={path(f) ?? ''} fill={theme.land} stroke={theme.landStroke} strokeWidth={1} />)}
      {outline && outlineOpacity > 0 && (
        <path d={path(outline) ?? ''} fill="none" stroke={theme.union} strokeWidth={14} opacity={0.55 * outlineOpacity} filter="url(#glow)" />
      )}
      {soviets.map((f) => (
        <path key={f.id} d={path(f) ?? ''} transform={offset(f)} fill={fillAt(String(f.id), true, t, declares)}
          stroke={pulseAmt(String(f.id)) > 0 ? '#FFFFFF' : '#0B1120'} strokeWidth={1.4 + pulseAmt(String(f.id)) * 5} strokeLinejoin="round" />
      ))}
      {outline && outlineOpacity > 0 && (
        <path d={path(outline) ?? ''} fill="none" stroke={theme.unionStroke} strokeWidth={2.5} opacity={outlineOpacity} />
      )}
    </svg>
  );
};
