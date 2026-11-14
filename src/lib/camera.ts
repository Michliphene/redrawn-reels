import { geoAzimuthalEqualArea, geoInterpolate, geoCentroid, GeoProjection } from 'd3-geo';
import { Easing, interpolate } from 'remotion';
import type { Camera, GeoData, LonLat } from './types';
import { W, isFocus, isOutline } from './theme';

/** Camera state: rotation centre (lon/lat), scale, and pixel offset of that centre from the map anchor. */
export type CamState = { center: LonLat; scale: number; off: [number, number] };
export const MAP_BOX = { top: 330, bottom: 1300 }; // vertical band where the map is framed
const ANCHOR: [number, number] = [W / 2, (MAP_BOX.top + MAP_BOX.bottom) / 2];

export function resolveCamera(cam: Camera, geo: GeoData): CamState {
  if (cam.fit) {
    const feats = geo.features.filter((f) => (cam.fit === 'SOVIET' || cam.fit === 'FOCUS' ? isFocus(f) && !isOutline(f) : f.id === cam.fit));
    const fc = { type: 'FeatureCollection', features: feats } as any;
    const c = geoCentroid(fc) as LonLat;
    const pad = (cam.pad ?? 0.04) * W;
    const p = geoAzimuthalEqualArea().rotate([-c[0], -c[1]]).fitExtent([[pad, MAP_BOX.top], [W - pad, MAP_BOX.bottom]], fc);
    const [tx, ty] = p.translate();
    return { center: c, scale: p.scale(), off: [tx - ANCHOR[0], ty - ANCHOR[1]] };
  }
  const span = cam.span ?? 30;
  return { center: cam.center!, scale: W / ((span * Math.PI) / 180), off: [0, 0] };
}

/** Eased travelling between camera keyframes (great-circle pan + log zoom). */
export function cameraAt(t: number, keys: { t: number; state: CamState; dur: number }[]): CamState {
  let cur = keys[0].state;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (t < k.t) break;
    const p = interpolate(t, [k.t, k.t + k.dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
    const from = cur;
    const ll = geoInterpolate(from.center, k.state.center)(p) as LonLat;
    cur = {
      center: ll,
      scale: Math.exp(interpolate(p, [0, 1], [Math.log(from.scale), Math.log(k.state.scale)])),
      off: [interpolate(p, [0, 1], [from.off[0], k.state.off[0]]), interpolate(p, [0, 1], [from.off[1], k.state.off[1]])],
    };
  }
  return cur;
}

export function projectionFor(s: CamState): GeoProjection {
  return geoAzimuthalEqualArea()
    .rotate([-s.center[0], -s.center[1]])
    .scale(s.scale)
    .translate([ANCHOR[0] + s.off[0], ANCHOR[1] + s.off[1]])
    .clipAngle(95)
    .clipExtent([[-40, -40], [W + 40, 1960]]);
}
