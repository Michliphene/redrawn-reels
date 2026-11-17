import React from 'react';
import * as THREE from 'three';
import type { TimedAction } from '../lib/types';
import type { AtlasWorld } from './world';
import { clamp01, ease, ramp } from '../studio/motion';
import { type Shot, type Vec3 } from '../studio/three/rig';
import { W, H, STAGE_CENTER_Y, SAFE } from '../studio/tokens';
import { Mono } from '../studio/ui/Type';

/**
 * Vehicles that travel ON the world (cue `vehicle`): a low-poly jet flying a route above the table, its shadow on
 * the map, its rear airstair that can open, and an optional figure under a canopy that drops from it.
 *   { "type": "vehicle", "kind": "plane", "coords": [[lon,lat],…], "atWord": "south,", "dur": 4, "hold": 6,
 *     "size": 110, "alt": 2.2, "from": 0, "to": 1, "land": false, "stairsWord": "Rear", "dropWord": "jumps.", "caption": "FLIGHT 305" }
 * Like `units`, a vehicle is a SYMBOL: the route it flies is the cue's `coords` (label it APPROX. when it is not
 * documented) and the drop never reaches the ground — the figure fades out in the air, so no landing point is implied.
 * `size` is the plane's length in screen pixels (it keeps that size whatever the camera does).
 */
type V = Extract<TimedAction, { type: 'vehicle' }>;
export type VehicleState = {
  v: V; pos: Vec3; heading: number; bank: number; climb: number; u: number; fade: number; stairs: number;
  drop: { pos: Vec3; open: number; fade: number } | null;
};

const FULL_H = H + 2 * (H / 2 - STAGE_CENTER_Y);
const rad = (d: number) => (d * Math.PI) / 180;

/** point at fraction f of the great circle from a to b (lon/lat degrees) */
function gc(a: [number, number], b: [number, number], f: number): [number, number] {
  const r = Math.PI / 180, la1 = a[1] * r, lo1 = a[0] * r, la2 = b[1] * r, lo2 = b[0] * r;
  const d = 2 * Math.asin(Math.sqrt(Math.sin((la2 - la1) / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) ** 2));
  if (d < 1e-9) return a;
  const A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d);
  const x = A * Math.cos(la1) * Math.cos(lo1) + B * Math.cos(la2) * Math.cos(lo2), y = A * Math.cos(la1) * Math.sin(lo1) + B * Math.cos(la2) * Math.sin(lo2), z = A * Math.sin(la1) + B * Math.sin(la2);
  return [Math.atan2(y, x) / r, Math.atan2(z, Math.hypot(x, y)) / r];
}

/** the route as a table polyline with cumulative lengths */
function track(world: AtlasWorld, coords: [number, number][]) {
  const pts: [number, number][] = [];
  for (let k = 0; k < coords.length - 1; k++) for (let j = 0; j <= 24; j++) {
    if (k > 0 && j === 0) continue;
    const q = world.project(gc(coords[k], coords[k + 1], j / 24)); if (q) pts.push(q);
  }
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const at = (s: number): { p: [number, number]; dir: [number, number] } => {
    const L = cum[cum.length - 1], d = clamp01(s) * L;
    let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
    const a = pts[i - 1], b = pts[i], k = (d - cum[i - 1]) / Math.max(1e-9, cum[i] - cum[i - 1]);
    return { p: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], dir: [b[0] - a[0], b[1] - a[1]] };
  };
  return { at, length: cum[cum.length - 1] };
}

export function vehicleStates(world: AtlasWorld, actions: TimedAction[], t: number, shot: Shot): VehicleState[] {
  const out: VehicleState[] = [];
  const ppx = (2 * shot.dist * Math.tan(rad(shot.fov) / 2) * (W / FULL_H)) / W; // table units per screen pixel now
  for (const v of actions.filter((a) => a.type === 'vehicle') as V[]) {
    const end = v.t + (v.hold ?? (v.dur ?? 3) + 1);
    const dropEnd = v.dropAt != null ? v.dropAt + 3.2 : -1;
    if (t < v.t || t > Math.max(end + 0.5, dropEnd)) continue;
    const tr = track(world, v.coords);
    const f0 = v.from ?? 0, f1 = v.to ?? 1;
    const k = f0 + (f1 - f0) * ease.inOut3(ramp(t, v.t, v.dur ?? 3));
    const here = tr.at(k), ahead = tr.at(Math.min(1, k + 0.02)), behind = tr.at(Math.max(0, k - 0.02));
    const u = (v.size ?? 110) * ppx;
    const land = v.land ? ease.inOut3(ramp(k, 0.55, 0.45)) : 0;
    const altK = (v.alt ?? 2.2) * (1 - land);
    const y = world.h + u * (0.12 + altK);
    const h1 = Math.atan2(-(ahead.p[1] - here.p[1]), ahead.p[0] - here.p[0] || 1e-9);
    const h0 = Math.atan2(-(here.p[1] - behind.p[1]), here.p[0] - behind.p[0] || 1e-9);
    let turn = h1 - h0; while (turn > Math.PI) turn -= 2 * Math.PI; while (turn < -Math.PI) turn += 2 * Math.PI;
    const moving = t < v.t + (v.dur ?? 3);
    const fade = Math.min(ramp(t, v.t - 0.001, v.t <= 0.05 ? 0.001 : 0.3), 1 - ramp(t, end, 0.5));
    let drop: VehicleState['drop'] = null;
    if (v.dropAt != null && t >= v.dropAt) {
      const kd = f0 + (f1 - f0) * ease.inOut3(ramp(v.dropAt, v.t, v.dur ?? 3));
      const at = tr.at(kd), yd0 = world.h + u * (0.12 + (v.alt ?? 2.2));
      const f = (t - v.dropAt) / 3.0; // 3 s of fall, then gone
      const side: [number, number] = [-at.dir[1], at.dir[0]], sl = Math.hypot(side[0], side[1]) || 1;
      const drift = u * 0.5 * Math.sin(f * 2.4);
      drop = {
        pos: [at.p[0] + (side[0] / sl) * drift, yd0 - u * 1.9 * ease.out3(clamp01(f)) - u * 0.25, at.p[1] + (side[1] / sl) * drift],
        open: ease.back(ramp(t, v.dropAt + 0.35, 0.4), 1.6),
        fade: 1 - ramp(f, 0.55, 0.45),
      };
    }
    out.push({
      v, pos: [here.p[0], y, here.p[1]], heading: h1, bank: moving ? Math.max(-0.6, Math.min(0.6, -turn * 6)) : 0, climb: land ? -0.12 : 0, u, fade,
      stairs: v.stairsAt != null ? ease.inOut3(ramp(t, v.stairsAt, 0.6)) : v.stairsOpen ? 1 : 0, drop,
    });
  }
  return out;
}

const box = new THREE.BoxGeometry(1, 1, 1);
const tube = new THREE.CylinderGeometry(1, 1, 1, 10).rotateZ(Math.PI / 2);
const nose = new THREE.SphereGeometry(1, 10, 8);
const dome = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
const line = new THREE.CylinderGeometry(1, 1, 1, 4);

/** A tri-jet with a T-tail and a ventral rear airstair, 1 unit long, nose towards +x. */
const Jet: React.FC<{ body: string; tail: string; stairs: number }> = ({ body, tail, stairs }) => (
  <group>
    <mesh geometry={tube} scale={[0.92, 0.062, 0.062]} castShadow><meshLambertMaterial color={body} /></mesh>
    <mesh geometry={nose} position={[0.46, 0, 0]} scale={[0.09, 0.058, 0.058]} castShadow><meshLambertMaterial color={body} /></mesh>
    <mesh geometry={tube} position={[0.0, -0.024, 0]} scale={[0.86, 0.02, 0.064]}><meshLambertMaterial color={tail} /></mesh>
    {[1, -1].map((s) => (
      <mesh key={s} geometry={box} position={[0.0, -0.02, s * 0.22]} rotation={[0, s * 0.5, 0]} scale={[0.16, 0.012, 0.46]} castShadow><meshLambertMaterial color={body} /></mesh>
    ))}
    {[1, -1].map((s) => (
      <mesh key={`e${s}`} geometry={tube} position={[-0.31, 0.03, s * 0.085]} scale={[0.15, 0.03, 0.03]} castShadow><meshLambertMaterial color="#8E8576" /></mesh>
    ))}
    <mesh geometry={box} position={[-0.4, 0.12, 0]} rotation={[0, 0, 0.35]} scale={[0.16, 0.2, 0.014]} castShadow><meshLambertMaterial color={tail} /></mesh>
    <mesh geometry={box} position={[-0.47, 0.215, 0]} rotation={[0, 0, 0]} scale={[0.09, 0.012, 0.32]} castShadow><meshLambertMaterial color={tail} /></mesh>
    {/* the rear airstair, hinged under the tail */}
    <group position={[-0.43, -0.055, 0]} rotation={[0, 0, 0.62 * stairs]}>
      <mesh geometry={box} position={[-0.08, 0, 0]} scale={[0.16, 0.012, 0.05]} castShadow><meshLambertMaterial color="#5B544A" /></mesh>
    </group>
  </group>
);

const Chute: React.FC<{ open: number; canopy: string }> = ({ open, canopy }) => (
  <group>
    <mesh geometry={dome} position={[0, 0.55, 0]} scale={[0.32 * open + 0.02, 0.2 * open + 0.02, 0.32 * open + 0.02]} castShadow><meshLambertMaterial color={canopy} side={THREE.DoubleSide} /></mesh>
    {[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b], i) => (
      <mesh key={i} geometry={line} position={[a * 0.14 * open, 0.32, b * 0.14 * open]} rotation={[b * 0.5 * open, 0, -a * 0.5 * open]} scale={[0.006, 0.42, 0.006]}><meshBasicMaterial color="#1A1612" /></mesh>
    ))}
    <mesh geometry={line} position={[0, 0.05, 0]} scale={[0.04, 0.16, 0.04]} castShadow><meshLambertMaterial color="#1A1612" /></mesh>
    <mesh geometry={nose} position={[0, 0.16, 0]} scale={0.035} castShadow><meshLambertMaterial color="#1A1612" /></mesh>
  </group>
);

export const Vehicles3D: React.FC<{ states: VehicleState[]; body: string; tail: string; canopy: string }> = ({ states, body, tail, canopy }) => (
  <>
    {states.map((S, i) => (
      <group key={i}>
        {S.fade > 0.01 && (
          <group position={S.pos} rotation={[0, S.heading, 0]} scale={S.u * S.fade}>
            <group rotation={[S.bank, 0, S.climb]}><Jet body={body} tail={tail} stairs={S.stairs} /></group>
          </group>
        )}
        {S.drop && S.drop.fade > 0.01 && (
          <group position={S.drop.pos} scale={S.u * 0.6 * S.drop.fade}><Chute open={S.drop.open} canopy={canopy} /></group>
        )}
      </group>
    ))}
  </>
);

/** Crisp type pinned to the vehicles: the optional caption above the jet, and a "?" over the falling figure. */
export const VehicleLabels: React.FC<{ states: VehicleState[]; toPx: (p: Vec3) => [number, number]; ink: string; accent: string }> = ({ states, toPx, ink, accent }) => (
  <>
    {states.map((S, i) => {
      const cap = S.v.caption && S.fade > 0.05 ? toPx([S.pos[0], S.pos[1] + S.u * 0.5, S.pos[2]]) : null;
      const q = S.drop && S.drop.fade > 0.05 && S.drop.open > 0.2 ? toPx([S.drop.pos[0], S.drop.pos[1] + S.u * 0.75, S.drop.pos[2]]) : null;
      return (
        <React.Fragment key={i}>
          {cap && (
            <div style={{ position: 'absolute', left: Math.min(Math.max(cap[0], SAFE.left + 110), 930 - 110), top: cap[1] - 58, transform: 'translateX(-50%)', opacity: S.fade }}>
              <Mono size={22} track={0.1} color={ink} style={{ background: 'rgba(7,6,5,0.82)', padding: '6px 10px 5px', border: `2px solid ${ink}`, textShadow: 'none' }}>{S.v.caption}</Mono>
            </div>
          )}
          {q && (
            <div style={{ position: 'absolute', left: q[0], top: q[1] - 70, transform: `translateX(-50%) scale(${0.6 + 0.4 * S.drop!.open})`, opacity: S.drop!.fade,
              fontFamily: "'Studio Display', sans-serif", fontWeight: 800, fontSize: 84, lineHeight: 1, color: accent, WebkitTextStroke: '6px #070605', paintOrder: 'stroke fill' }}>?</div>
          )}
        </React.Fragment>
      );
    })}
  </>
);
