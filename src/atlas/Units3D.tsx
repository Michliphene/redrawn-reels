import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { TimedAction } from '../lib/types';
import type { AtlasWorld } from './world';
import type { Lift } from './lift';
import { ease, hash, pop, ramp } from '../studio/motion';
import { shotAt, type ShotKey, type Vec3 } from '../studio/three/rig';
import { W, H, STAGE_CENTER_Y, SAFE } from '../studio/tokens';
import { Mono } from '../studio/ui/Type';

/**
 * Tanks, soldiers and crowds as little game pieces standing on the map.
 * Same cue as DA v1 (`units`): `offset` and `approach` are still screen pixels, converted to table
 * distances with the camera of that moment — so a group shows THAT forces moved in, never a route.
 */
type U = Extract<TimedAction, { type: 'units' }>;
export type UnitGroup = { g: U; pos: [number, number]; from: [number, number]; y: number; u: number; k: number; fade: number; facing: number; moving: boolean; back: number; items: { x: number; z: number; s: number; d: number }[] };

const FULL_H = H + 2 * (H / 2 - STAGE_CENTER_Y);
const rad = (d: number) => (d * Math.PI) / 180;

export function unitGroups(world: AtlasWorld, actions: TimedAction[], keys: ShotKey[], t: number, lift: Lift): UnitGroup[] {
  const out: UnitGroup[] = [];
  (actions.filter((a) => a.type === 'units') as U[]).forEach((g, gi) => {
    const end = g.t + (g.hold ?? 4);
    if (t < g.t || t > end + 0.6) return;
    const s0 = shotAt(g.t + 0.4, keys);
    const ppx = (2 * s0.dist * Math.tan(rad(s0.fov) / 2) * (W / FULL_H)) / W; // table units per screen pixel, at the subject
    const sp = Math.max(0.35, Math.sin(rad(s0.pitch)));
    const a = world.project(g.at) ?? [0, 0];
    // screen right / screen down, expressed on the table for this camera angle
    const yw = rad(s0.yaw), rx = Math.cos(yw), rz = -Math.sin(yw), dnx = Math.sin(yw), dnz = Math.cos(yw);
    const onTable = (sx: number, sy: number): [number, number] => [sx * ppx * rx + ((sy * ppx) / sp) * dnx, sx * ppx * rz + ((sy * ppx) / sp) * dnz];
    const o = onTable(g.offset?.[0] ?? 0, g.offset?.[1] ?? 0), ap = onTable(g.approach?.[0] ?? 0, g.approach?.[1] ?? 0);
    const to: [number, number] = [a[0] + o[0], a[1] + o[1]];
    const from: [number, number] = [to[0] + ap[0], to[1] + ap[1]];
    const move = ease.out3(ramp(t, g.t, g.dur ?? 1.6));
    const back = g.retreatAt != null ? ease.in3(ramp(t, g.retreatAt, 1.4)) : 0;
    const k = move - back;
    const pos: [number, number] = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
    const u = (g.size ?? 34) * ppx;
    const n = g.count ?? 6, cols = Math.ceil(Math.sqrt(n * 1.6));
    const items = Array.from({ length: n }, (_, i) => {
      if (g.kind === 'crowd') {
        const ang = hash(gi * 97 + i * 13) * Math.PI * 2, r = (0.35 + 0.65 * hash(gi * 31 + i * 7 + 1)) * (g.spread ?? 70) * ppx;
        return { x: Math.cos(ang) * r, z: Math.sin(ang) * r, s: Math.min(1, pop(t, g.t + i * 0.05, 0.25)), d: hash(i) };
      }
      const row = Math.floor(i / cols), col = i % cols, step = g.kind === 'tanks' ? u * 1.9 : u * 1.0;
      const fx = (col - (cols - 1) / 2) * step + (row % 2) * step * 0.4, fz = (row * u * 1.35) / sp;
      return { x: fx * rx + fz * dnx, z: fx * rz + fz * dnz, s: 1, d: hash(gi * 11 + i) };
    });
    const id = world.pieceAt(to[0], to[1]);
    const dx = to[0] - from[0], dz = to[1] - from[1];
    out.push({
      g, pos, from, u, k, back, items,
      y: world.h + (id ? lift(id, t).y : 0),
      fade: Math.min(ramp(t, g.t, 0.3), 1 - ramp(t, end, 0.6)),
      facing: Math.atan2(-dz, dx || 1e-6),
      moving: k > 0.001 && k < 0.999,
    });
  });
  return out;
}

const box = new THREE.BoxGeometry(1, 1, 1);
const cyl = new THREE.CylinderGeometry(1, 1, 1, 8);
const ball = new THREE.SphereGeometry(1, 8, 6);

const Tank: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh geometry={box} position={[0, 0.11, 0.26]} scale={[1.06, 0.2, 0.15]} castShadow><meshLambertMaterial color="#161B26" /></mesh>
    <mesh geometry={box} position={[0, 0.11, -0.26]} scale={[1.06, 0.2, 0.15]} castShadow><meshLambertMaterial color="#0d1016" /></mesh>
    <mesh geometry={box} position={[0, 0.26, 0]} scale={[0.98, 0.2, 0.5]} castShadow><meshLambertMaterial color={c} /></mesh>
    <mesh geometry={box} position={[-0.08, 0.44, 0]} scale={[0.44, 0.18, 0.34]} castShadow><meshLambertMaterial color={c} /></mesh>
    <mesh geometry={box} position={[0.4, 0.45, 0]} scale={[0.56, 0.07, 0.07]} castShadow><meshLambertMaterial color="#0d1016" /></mesh>
  </group>
);
export const Pawn: React.FC<{ c: string; head?: string }> = ({ c, head }) => (
  <group>
    <mesh geometry={cyl} position={[0, 0.3, 0]} scale={[0.17, 0.6, 0.17]} castShadow><meshLambertMaterial color={c} /></mesh>
    <mesh geometry={ball} position={[0, 0.74, 0]} scale={0.18} castShadow><meshLambertMaterial color={head ?? c} /></mesh>
  </group>
);

/** dashes on the table from where the group came from to where it is now */
function dashes(from: [number, number], to: [number, number], y: number, w: number, dash: number, phase: number): THREE.BufferGeometry {
  const dx = to[0] - from[0], dz = to[1] - from[1], len = Math.hypot(dx, dz);
  const pos: number[] = [];
  if (len > 1e-6) {
    const ux = dx / len, uz = dz / len, nx = -uz * w, nz = ux * w;
    for (let s = -dash * 2 + (phase % (dash * 2)); s < len; s += dash * 2) {
      const a = Math.max(0, s), b = Math.min(len, s + dash);
      if (b <= a) continue;
      const ax = from[0] + ux * a, az = from[1] + uz * a, bx = from[0] + ux * b, bz = from[1] + uz * b;
      pos.push(ax + nx, y, az + nz, ax - nx, y, az - nz, bx + nx, y, bz + nz, bx + nx, y, bz + nz, ax - nx, y, az - nz, bx - nx, y, bz - nz);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return g;
}

export const Units3D: React.FC<{ groups: UnitGroup[]; t: number }> = ({ groups, t }) => (
  <>
    {groups.map((G, gi) => {
      const { g, u } = G;
      const dark = g.color ?? '#56627A';
      const s = (g.kind === 'tanks' ? u * 1.55 : g.kind === 'troops' ? u * 1.35 : u * 1.2) * G.fade;
      const trail = g.kind !== 'crowd' && (g.approach?.[0] || g.approach?.[1]) ? dashes(G.from, G.pos, G.y + 0.004, u * 0.12, u * 0.55, t * u * 1.8) : null;
      return (
        <group key={gi}>
          {trail && <mesh geometry={trail}><meshBasicMaterial color="#FFFFFF" transparent opacity={0.8 * (1 - G.back) * G.fade} side={THREE.DoubleSide} /></mesh>}
          {G.items.map((it, i) => {
            const bob = G.moving ? Math.abs(Math.sin((t + it.d) * 16)) * u * 0.08 : 0;
            return (
              <group key={i} position={[G.pos[0] + it.x, G.y + bob, G.pos[1] + it.z]} rotation={[0, g.kind === 'crowd' ? it.d * 6 : G.facing, 0]} scale={s * it.s}>
                {g.kind === 'tanks' ? <Tank c={dark} /> : g.kind === 'troops' ? <Pawn c={dark} /> : <Pawn c="#F4F1EA" head="#E9D9BD" />}
              </group>
            );
          })}
        </group>
      );
    })}
  </>
);

/** The caption of each group, as crisp type pinned above the pieces. */
export const UnitCaptions: React.FC<{ groups: UnitGroup[]; toPx: (p: Vec3) => [number, number] }> = ({ groups, toPx }) => (
  <>
    {groups.filter((G) => G.g.caption).map((G, i) => {
      const civil = G.g.kind === 'crowd';
      const [x, y] = toPx([G.pos[0], G.y + G.u * (civil ? 0 : 2.4), G.pos[1]]);
      return (
        <div key={i} style={{ position: 'absolute', left: Math.min(Math.max(x, SAFE.left + 150), SAFE.right - 150), top: civil ? y + 54 : y - 64, transform: 'translateX(-50%)', opacity: G.fade }}>
          <Mono size={24} track={0.1} color={civil ? '#05070c' : '#fff'} style={{ background: civil ? '#F4F1EA' : '#05070c', padding: '8px 12px 7px', border: civil ? 'none' : '2px solid #fff', textShadow: 'none', boxShadow: '5px 5px 0 rgba(0,0,0,0.45)' }}>{G.g.caption}</Mono>
        </div>
      );
    })}
  </>
);
