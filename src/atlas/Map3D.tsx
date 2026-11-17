import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { GeoData, TimedAction } from '../lib/types';
import { PALETTE, isFocus, isOutline, theme } from '../lib/theme';
import { fillAt } from '../components/MapLayer';
import { shapesOf, type AtlasWorld, type Piece } from './world';
import { clamp01, ease, ramp, shade } from '../studio/motion';
import type { Lift } from './lift';
import type { SeriesPalette } from '../studio/series';
import type { Shot } from '../studio/three/rig';

/**
 * The map as a board of pieces. Every feature of the episode's GeoJSON becomes a slab on the table;
 * the cue sheet moves them: `declare` makes a piece jump and take its colour, `dissolve` bursts the
 * subject apart and lets it settle back on its exact borders, `reveal`/`conceal` raise and sink pieces,
 * `ghost` hovers a comparison shape, `path` draws a ribbon. Same cues as the flat DA v1 map.
 */
type Geo = { body: THREE.BufferGeometry | null; edge: THREE.BufferGeometry };

function buildGeo(piece: Piece, h: number): Geo {
  let body: THREE.BufferGeometry | null = null;
  const shapes = shapesOf(piece);
  if (shapes.length) {
    body = new THREE.ExtrudeGeometry(shapes, { depth: h, bevelEnabled: false, curveSegments: 1 });
    body.rotateX(-Math.PI / 2);
  }
  const pos: number[] = [];
  const y = h + 0.0015;
  const ring = (r: [number, number][], closed: boolean) => {
    for (let i = 0; i < r.length - (closed ? 0 : 1); i++) { const a = r[i], b = r[(i + 1) % r.length]; pos.push(a[0], y, a[1], b[0], y, b[1]); }
  };
  for (const p of piece.polys) { ring(p.outer, true); p.holes.forEach((hh) => ring(hh, true)); }
  piece.lines.forEach((l) => ring(l, false));
  const edge = new THREE.BufferGeometry();
  edge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return { body, edge };
}

const Slab: React.FC<{ g: Geo; top: string; side: string; edge: string; pos?: [number, number, number]; scale?: [number, number, number]; opacity?: number; cast?: boolean; edgeOpacity?: number }> =
  ({ g, top, side, edge, pos = [0, 0, 0], scale = [1, 1, 1], opacity = 1, cast = true, edgeOpacity = 1 }) => {
    if (opacity <= 0.01) return null;
    const tr = opacity < 0.999;
    return (
      <group position={pos} scale={scale}>
        {g.body && (
          <mesh geometry={g.body} castShadow={cast && !tr} receiveShadow>
            <meshLambertMaterial attach="material-0" color={top} transparent={tr} opacity={opacity} depthWrite={!tr} />
            <meshLambertMaterial attach="material-1" color={side} transparent={tr} opacity={opacity} depthWrite={!tr} />
          </mesh>
        )}
        <lineSegments geometry={g.edge}><lineBasicMaterial color={edge} transparent={tr || edgeOpacity < 1} opacity={opacity * edgeOpacity} /></lineSegments>
      </group>
    );
  };

/** Flat ribbon along a polyline, at height y; `prog` 0–1 draws it progressively. */
function ribbon(points: [number, number][], hw: number, y: number): THREE.BufferGeometry {
  const pos: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    const dx = b[0] - a[0], dz = b[1] - a[1], d = Math.hypot(dx, dz) || 1, nx = (-dz / d) * hw, nz = (dx / d) * hw;
    pos.push(a[0] + nx, y, a[1] + nz, a[0] - nx, y, a[1] - nz, b[0] + nx, y, b[1] + nz, b[0] + nx, y, b[1] + nz, a[0] - nx, y, a[1] - nz, b[0] - nx, y, b[1] - nz);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

export const Map3D: React.FC<{ world: AtlasWorld; geo: GeoData; t: number; actions: TimedAction[]; pal: SeriesPalette; shot: Shot; lift: Lift }> = ({ world, geo, t, actions, pal, shot, lift }) => {
  const h = world.h, hLand = h * 0.28;
  const geos = useMemo(() => {
    const m = new Map<string, Geo>();
    for (const f of geo.features) {
      const id = String(f.id), piece = world.pieces.get(id)!;
      const subject = isFocus(f) || (f.properties as any)?.ghost;
      m.set(id, buildGeo(piece, isOutline(f) ? h * 0.45 : subject ? h : hLand));
    }
    return m;
  }, [geo, world, h, hLand]);
  const grat = useMemo(() => {
    const pos: number[] = [];
    for (const l of world.graticule) for (let i = 0; i < l.length - 1; i++) pos.push(l[i][0], 0.003, l[i][1], l[i + 1][0], 0.003, l[i + 1][1]);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); return g;
  }, [world]);

  // rivers (`properties.river`, LineString features): a flat ribbon lying on the land, drawn in PALETTE.static[id].
  // Its width is screen-constant (like a path), so a close shot does not turn the river into a moat.
  const riverWidth = Math.round(shot.dist * 40) / 4000; // quantised: rebuilt only when the camera distance changes enough
  const rivers = useMemo(() => geo.features.filter((f) => (f.properties as any)?.river).map((f) => {
    const id = String(f.id), piece = world.pieces.get(id)!;
    const hw = riverWidth * ((f.properties as any).width ?? 1) * 0.5;
    const pos: number[] = [];
    for (const l of piece.lines) pos.push(...(ribbon(l, hw, h + 0.003).getAttribute('position').array as Float32Array)); // above the subject slabs too
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return { id, g };
  }), [geo, world, h, riverWidth]);
  const declares = useMemo(() => actions.filter((a) => a.type === 'declare'), [actions]);
  const recolors = useMemo(() => actions.filter((a) => a.type === 'recolor'), [actions]);
  const pulses = actions.filter((a) => a.type === 'pulse') as Extract<TimedAction, { type: 'pulse' }>[];
  const ghosts = actions.filter((a) => a.type === 'ghost') as Extract<TimedAction, { type: 'ghost' }>[];
  const paths = actions.filter((a) => a.type === 'path') as Extract<TimedAction, { type: 'path' }>[];
  const dissolve = actions.find((a) => a.type === 'dissolve');
  const outline = geo.features.find(isOutline);
  const polities = geo.features.filter((f) => !isOutline(f) && !(f.properties as any)?.ghost);
  const focus = polities.filter(isFocus);
  const scenery = polities.filter((f) => !isFocus(f));
  const focusIds = focus.map((f) => String(f.id));
  const lastDeclare = focusIds.length && focusIds.every((id) => declares.some((d) => d.type === 'declare' && d.id === id))
    ? Math.max(...declares.filter((d) => d.type === 'declare' && focusIds.includes(d.id)).map((d) => d.t)) : null;
  const fadeAt = dissolve ? dissolve.t : lastDeclare;
  const footprint = fadeAt != null ? 1 - ease.inOut3(ramp(t, fadeAt + 0.4, 1.6)) : 1;
  const vis = (f: any) => {
    const id = String(f.id);
    const evs = actions.filter((a) => (a.type === 'reveal' || a.type === 'conceal') && (a as any).ids.includes(id) && a.t <= t).sort((a, b) => a.t - b.t);
    const last = evs[evs.length - 1];
    if (!last) return f.properties?.hidden ? 0 : 1;
    return last.type === 'reveal' ? ease.back(ramp(t, last.t, 0.6), 1.2) : 1 - ease.in3(ramp(t, last.t + 0.35, 0.5));
  };

  const unit = shot.dist * 0.01; // one "screen-constant" world unit, for annotation widths
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[shot.target[0], 0, shot.target[2]]} receiveShadow>
        <planeGeometry args={[shot.dist * 40, shot.dist * 40]} />
        <meshLambertMaterial color={pal.bgGlow} />
      </mesh>
      <lineSegments geometry={grat}><lineBasicMaterial color={pal.grid} /></lineSegments>

      {rivers.map((r) => <mesh key={r.id} geometry={r.g}><meshBasicMaterial color={PALETTE.static[r.id] ?? pal.grid} side={THREE.DoubleSide} /></mesh>)}

      {scenery.map((f) => {
        if ((f.properties as any)?.river) return null;
        const id = String(f.id), c = PALETTE.static[id];
        return <Slab key={id} g={geos.get(id)!} top={c ?? pal.surface} side={shade(c ?? pal.surface, -0.45)} edge={c ? shade(c, -0.6) : pal.surfaceEdge} cast={false} />;
      })}

      {outline && footprint > 0.01 && (
        <Slab g={geos.get(String(outline.id))!} top={shade(PALETTE.start, -0.55)} side={shade(PALETTE.start, -0.7)} edge={PALETTE.startStroke}
          scale={[1, Math.max(0.02, footprint), 1]} edgeOpacity={footprint} cast={false} />
      )}

      {focus.map((f) => {
        const id = String(f.id);
        const v = vis(f);
        if (v <= 0.01) return null;
        const top = fillAt(id, t, declares, recolors);
        const st = lift(id, t);
        const lit = pulses.some((p) => p.ids.includes(id) && t >= p.t && t < p.t + 0.9);
        return (
          <Slab key={id} g={geos.get(id)!} top={top} side={shade(top, -0.42)} edge={lit ? '#FFFFFF' : shade(top, -0.62)}
            pos={[st.dx, st.y, st.dz]} scale={[1, Math.max(0.02, v), 1]} />
        );
      })}

      {ghosts.map((g, i) => {
        const f = geo.features.find((x) => x.id === g.id); if (!f) return null;
        const hold = g.hold ?? 3;
        const o = Math.min(ramp(t, g.t, 0.4), 1 - ramp(t, g.t + hold, 0.5));
        if (t < g.t || o <= 0.01) return null;
        const piece = world.pieces.get(String(f.id))!;
        if ((f.properties as any)?.lines) {
          return <group key={`g${i}`} position={[0, 0.004, 0]}><lineSegments geometry={geos.get(String(f.id))!.edge}><lineBasicMaterial color="#FFFFFF" transparent opacity={0.9 * o} /></lineSegments></group>;
        }
        if ((g as any).area) {
          // an approximate AREA (e.g. a disputed drop zone): lies flat on the map, translucent, outlined in its colour —
          // it must never read as a pin or a solid object
          const col = g.color ?? '#F2994A';
          return <Slab key={`g${i}`} g={geos.get(String(f.id))!} top={col} side={col} edge={col} pos={[0, h * 1.02, 0]} scale={[1, 0.04, 1]}
            opacity={o * (0.26 + 0.06 * Math.sin(t * 3))} cast={false} edgeOpacity={3} />;
        }
        const s = 1 + 0.6 * (1 - ease.out3(ramp(t, g.t, 0.6)));
        const c = piece.centroid;
        return <Slab key={`g${i}`} g={geos.get(String(f.id))!} top={g.color ?? '#F2994A'} side={shade(g.color ?? '#F2994A', -0.4)} edge="#FFFFFF"
          pos={[c[0] * (1 - s), h * 1.5 + h * 0.3 * Math.sin(t * 2.2), c[1] * (1 - s)]} scale={[s, 0.35, s]} opacity={0.62 * o} cast={false} />;
      })}

      {paths.map((p, i) => {
        const end = p.t + (p.hold ?? 4);
        if (t < p.t || t > end + 0.5) return null;
        const pts: [number, number][] = [];
        const coords = p.coords;
        // great-circle resampling: 24 steps per leg
        for (let k = 0; k < coords.length - 1; k++) {
          const a = coords[k], b = coords[k + 1];
          for (let j = 0; j <= 24; j++) {
            if (k > 0 && j === 0) continue;
            const q = world.project(gc(a, b, j / 24)); if (q) pts.push(q);
          }
        }
        const from = (p as any).from ?? 0;
        const prog = from + (1 - from) * ease.inOut3(ramp(t, p.t, p.dur ?? 1.4));
        const o = 1 - ramp(t, end, 0.5);
        const hw = unit * ((p.width ?? 7) / 7) * 0.55;
        const g = ribbon(pts, hw, h * 1.25 + 0.004), gShadow = ribbon(pts, hw * 1.7, h * 1.25);
        const n = Math.max(0, Math.floor((pts.length - 1) * clamp01(prog))) * 6;
        g.setDrawRange(0, n); gShadow.setDrawRange(0, n);
        return (
          <group key={`p${i}`}>
            <mesh geometry={gShadow}><meshBasicMaterial color="#000000" transparent opacity={0.55 * o} side={THREE.DoubleSide} /></mesh>
            <mesh geometry={g}><meshBasicMaterial color={p.color ?? theme.accent} transparent={o < 1} opacity={o} side={THREE.DoubleSide} /></mesh>
          </group>
        );
      })}
    </>
  );
};

/** point at fraction f of the great circle from a to b (lon/lat degrees) */
function gc(a: [number, number], b: [number, number], f: number): [number, number] {
  const r = Math.PI / 180, la1 = a[1] * r, lo1 = a[0] * r, la2 = b[1] * r, lo2 = b[0] * r;
  const d = 2 * Math.asin(Math.sqrt(Math.sin((la2 - la1) / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) ** 2));
  if (d < 1e-9) return a;
  const A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d);
  const x = A * Math.cos(la1) * Math.cos(lo1) + B * Math.cos(la2) * Math.cos(lo2), y = A * Math.cos(la1) * Math.sin(lo1) + B * Math.cos(la2) * Math.sin(lo2), z = A * Math.sin(la1) + B * Math.sin(la2);
  return [Math.atan2(y, x) / r, Math.atan2(z, Math.hypot(x, y)) / r];
}

export { TableLight } from '../studio/three/Light';
