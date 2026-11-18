import * as THREE from 'three';
import { geoAzimuthalEqualArea, geoCentroid, geoPath, geoGraticule10 } from 'd3-geo';
import type { Camera, GeoData, LonLat } from '../lib/types';
import { isFocus, isOutline } from '../lib/theme';
import { fitShot, distForWidth, STAGE_RECT, type Shot, type Vec3 } from '../studio/three/rig';
import { W } from '../studio/tokens';

/**
 * The map as a physical object: every feature is projected ONCE onto a table (x = east, z = south, y = up)
 * and becomes a flat piece. The camera then moves over that table — the map itself never re-projects,
 * which is what gives real parallax, tilt and dolly moves.
 */
export const K = 10; // world units per radian (1° ≈ 0.1745 units)
type P2 = [number, number];
export type Piece = {
  id: string;
  /** outer rings with their holes, table coordinates [x, z] */
  polys: { outer: P2[]; holes: P2[][] }[];
  /** open polylines (LineString features) */
  lines: P2[][];
  centroid: P2;
  bbox: [number, number, number, number];
};
export type AtlasWorld = {
  center: LonLat;
  /** lon/lat → table [x, z]; null when the point is on the far side of the globe */
  project: (ll: LonLat) => P2 | null;
  point: (ll: LonLat, y?: number) => Vec3;
  pieces: Map<string, Piece>;
  graticule: P2[][];
  /** thickness of a subject piece, scaled to the subject's size */
  h: number;
  /** centroid of the whole subject (explosions push pieces away from it) */
  focusCentroid: P2;
  focusIds: string[];
  /** id of the subject piece under a table point, if any */
  pieceAt: (x: number, z: number) => string | null;
};

const area = (r: P2[]) => { let a = 0; for (let i = 0, n = r.length; i < n; i++) { const p = r[i], q = r[(i + 1) % n]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
const inside = (pt: P2, r: P2[]) => {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const a = r[i], b = r[j];
    if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < ((b[0] - a[0]) * (pt[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
};
const bboxOf = (r: P2[]): [number, number, number, number] => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  return [x0, y0, x1, y1];
};
/** drop points closer than eps to the previous kept point (keeps shapes, removes sub-pixel detail) */
const thin = (r: P2[], eps: number): P2[] => {
  if (r.length < 4) return r;
  const out: P2[] = [r[0]];
  for (let i = 1; i < r.length; i++) { const l = out[out.length - 1]; if (Math.hypot(r[i][0] - l[0], r[i][1] - l[1]) >= eps) out.push(r[i]); }
  return out;
};

/** Run a geometry through d3 (clipping, great-circle resampling) and collect the projected rings. */
function projectGeometry(geometry: any, projection: any): { closed: P2[][]; open: P2[][] } {
  const closed: P2[][] = [], open: P2[][] = [];
  let cur: P2[] | null = null;
  const flush = (isClosed: boolean) => { if (cur && cur.length > 1) (isClosed ? closed : open).push(cur); cur = null; };
  const ctx = {
    beginPath() {}, arc() {}, rect() {},
    moveTo(x: number, y: number) { flush(false); cur = [[x, y]]; },
    lineTo(x: number, y: number) { cur?.push([x, y]); },
    closePath() { flush(true); },
  };
  geoPath(projection, ctx as any)(geometry);
  flush(false);
  return { closed, open };
}

function toPiece(id: string, geometry: any, projection: any, eps: number, minArea: number): Piece {
  const { closed, open } = projectGeometry(geometry, projection);
  const rings = closed.map((r) => thin(r, eps)).filter((r) => r.length >= 3).map((r) => ({ r, a: Math.abs(area(r)), bb: bboxOf(r) })).filter((x) => x.a >= minArea).sort((p, q) => q.a - p.a);
  // nesting by containment (independent of winding order): even depth = land, odd depth = hole of its parent
  const polys: { outer: P2[]; holes: P2[][]; a: number; bb: number[] }[] = [];
  for (const x of rings) {
    const pt = x.r[0];
    let parent: (typeof polys)[number] | null = null, inHole = false;
    for (const p of polys) {
      if (pt[0] < p.bb[0] || pt[0] > p.bb[2] || pt[1] < p.bb[1] || pt[1] > p.bb[3]) continue;
      if (inside(pt, p.outer)) { parent = p; inHole = p.holes.some((hh) => inside(pt, hh)); if (!inHole) break; parent = null; }
    }
    if (parent && !inHole) parent.holes.push(x.r);
    else polys.push({ outer: x.r, holes: [], a: x.a, bb: x.bb });
  }
  const all = polys.flatMap((p) => p.outer).concat(open.flat());
  const bb = all.length ? bboxOf(all) : [0, 0, 0, 0] as [number, number, number, number];
  // centroid of the largest polygon (a country's mainland), not of its bounding box
  const main = polys[0]?.outer ?? open[0] ?? [[0, 0]];
  const c: P2 = [main.reduce((s, p) => s + p[0], 0) / main.length, main.reduce((s, p) => s + p[1], 0) / main.length];
  return { id, polys: polys.map(({ outer, holes }) => ({ outer, holes })), lines: open.map((l) => thin(l, eps)), centroid: c, bbox: bb };
}

export function makeWorld(geo: GeoData, opts: { center?: LonLat; thickness?: number } = {}): AtlasWorld {
  const focus = geo.features.filter((f) => isFocus(f) && !isOutline(f) && !(f.properties as any)?.ghost);
  const fc = { type: 'FeatureCollection', features: focus.length ? focus : geo.features } as any;
  const center = opts.center ?? (geoCentroid(fc) as LonLat);
  const projection = geoAzimuthalEqualArea().rotate([-center[0], -center[1]]).scale(K).translate([0, 0]).clipAngle(128).precision(0.02);
  const project = (ll: LonLat) => projection(ll) as P2 | null;
  const pieces = new Map<string, Piece>();
  for (const f of geo.features) {
    const subject = isFocus(f) || isOutline(f) || (f.properties as any)?.ghost;
    // the subject keeps its detail; scenery is thinned (a 70 k-point coastline costs frames, not looks, at 360 px)
    pieces.set(String(f.id), toPiece(String(f.id), f.geometry, projection, subject ? 0.004 : 0.012, subject ? 0.00002 : 0.0006));
  }
  const fb = focus.length ? focus.map((f) => pieces.get(String(f.id))!.bbox) : [...pieces.values()].map((p) => p.bbox);
  const x0 = Math.min(...fb.map((b) => b[0])), z0 = Math.min(...fb.map((b) => b[1])), x1 = Math.max(...fb.map((b) => b[2])), z1 = Math.max(...fb.map((b) => b[3]));
  const size = Math.max(x1 - x0, z1 - z0, 0.5);
  const graticule = projectGeometry(geoGraticule10(), projection).open.map((l) => thin(l, 0.05));
  return {
    center, project, pieces, graticule,
    point: (ll, y = 0) => { const p = project(ll); return p ? [p[0], y, p[1]] : [9999, y, 9999]; },
    h: Math.min(0.15, Math.max(0.045, size * 0.016)) * (opts.thickness ?? 1),
    focusCentroid: [(x0 + x1) / 2, (z0 + z1) / 2],
    focusIds: focus.map((f) => String(f.id)),
    pieceAt: (x, z) => {
      for (const f of focus) {
        if ((f.properties as any)?.hidden) continue;
        const pc = pieces.get(String(f.id))!;
        if (x < pc.bbox[0] || x > pc.bbox[2] || z < pc.bbox[1] || z > pc.bbox[3]) continue;
        if (pc.polys.some((p) => inside([x, z], p.outer) && !p.holes.some((hh) => inside([x, z], hh)))) return pc.id;
      }
      return null;
    },
  };
}

/** Lens and angle chosen from how wide the view is: wide = steeper (reads as a map), close = lower (reads as a place). */
export function autoAngle(spanDeg: number): { pitch: number; fov: number } {
  const p = Math.min(1, Math.max(0, (Math.log(spanDeg) - Math.log(6)) / (Math.log(90) - Math.log(6))));
  return { pitch: 44 + 16 * p, fov: 32 - 6 * p };
}

type Cam3 = Camera & { pitch?: number; yaw?: number; fov?: number; roll?: number; cut?: boolean };
/** Translate a cue-sheet camera ({fit} or {center, span}) into a tabletop shot. */
export function resolveShot(cam: Cam3, world: AtlasWorld): Shot {
  if (cam.fit) {
    const ids = cam.fit === 'SOVIET' || cam.fit === 'FOCUS' ? world.focusIds : [cam.fit];
    const pts: Vec3[] = [];
    for (const id of ids) {
      const pc = world.pieces.get(id); if (!pc) continue;
      for (const poly of pc.polys) { const step = Math.max(1, Math.floor(poly.outer.length / 80)); for (let i = 0; i < poly.outer.length; i += step) pts.push([poly.outer[i][0], world.h, poly.outer[i][1]]); }
    }
    if (pts.length) {
      const b = [Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[2])), Math.max(...pts.map((p) => p[2]))];
      const spanDeg = (Math.max(b[1] - b[0], b[3] - b[2]) / K) * (180 / Math.PI);
      const auto = autoAngle(spanDeg);
      const pad = (cam.pad ?? 0.04) * W;
      const rect = { left: STAGE_RECT.left + pad, right: STAGE_RECT.right - pad, top: STAGE_RECT.top, bottom: STAGE_RECT.bottom };
      return fitShot(pts, { pitch: cam.pitch ?? auto.pitch, yaw: cam.yaw ?? 0, fov: cam.fov ?? auto.fov, roll: cam.roll ?? 0 }, rect);
    }
  }
  const span = cam.span ?? 30;
  const auto = autoAngle(span);
  const fov = cam.fov ?? auto.fov;
  const c = world.project(cam.center ?? world.center) ?? [0, 0];
  // a close shot (< 1°, a city) aims at the table's surface: half the slab's thickness is a large share of a short camera distance
  return { target: [c[0], world.h * (span < 1 ? 1 : 0.5), c[1]], dist: distForWidth(((span * Math.PI) / 180) * K, fov), pitch: cam.pitch ?? auto.pitch, yaw: cam.yaw ?? 0, fov, roll: cam.roll ?? 0 };
}

/** Shape list for an extrusion; shape space is (x, −z) so that rotating −90° about X lays it on the table. */
export function shapesOf(piece: Piece): THREE.Shape[] {
  return piece.polys.map((p) => {
    const s = new THREE.Shape(p.outer.map(([x, z]) => new THREE.Vector2(x, -z)));
    s.holes = p.holes.map((hh) => new THREE.Path(hh.map(([x, z]) => new THREE.Vector2(x, -z))));
    return s;
  });
}
