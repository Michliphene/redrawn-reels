import React, { useMemo } from 'react';
import { geoOrthographic, geoPath, geoCircle, geoGraticule10 } from 'd3-geo';
import type { GeoData } from '../lib/types';
import type { CamState } from '../lib/camera';
import { theme, PALETTE, isFocus, isOutline } from '../lib/theme';
import { W } from '../lib/theme';

/** Small globe (top-right) showing where on Earth the camera is looking. */
export const Locator: React.FC<{ geo: GeoData; cam: CamState; t: number; size?: number }> = ({ geo, cam, size = 190 }) => {
  const land = useMemo(() => geo.features.filter((f) => !isOutline(f) && !(f.properties as any)?.ghost), [geo]);
  const proj = geoOrthographic().rotate([-cam.center[0], -Math.min(60, Math.max(-60, cam.center[1]))]).scale(size / 2 - 4).translate([size / 2, size / 2]).clipAngle(90);
  const path = geoPath(proj);
  const spanDeg = Math.min(80, ((W / cam.scale) * 180) / Math.PI / 2);
  const view = geoCircle().center(cam.center).radius(Math.max(2, spanDeg))();
  return (
    <div style={{ position: 'absolute', top: 54, right: 40, width: size, height: size, filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.6))' }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 3} fill="#0E1A33" stroke={theme.accent} strokeWidth={3} />
        <path d={path(geoGraticule10()) ?? ''} fill="none" stroke="#1E2C4D" strokeWidth={0.8} />
        {land.map((f) => (
          <path key={String(f.id)} d={path(f as any) ?? ''} stroke="none"
            fill={isFocus(f) ? PALETTE.start : PALETTE.static[String(f.id)] ?? '#3A4560'} />
        ))}
        <path d={path(view) ?? ''} fill="rgba(255,201,77,0.18)" stroke={theme.accent} strokeWidth={2.5} />
      </svg>
      <div style={{ position: 'absolute', bottom: -26, width: '100%', textAlign: 'center', fontFamily: theme.font, fontWeight: 800, fontSize: 24,
        color: theme.muted, letterSpacing: 2 }}>YOU ARE HERE</div>
    </div>
  );
};
