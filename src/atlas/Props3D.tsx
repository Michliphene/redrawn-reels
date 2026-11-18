import React from 'react';
import * as THREE from 'three';
import type { TimedAction } from '../lib/types';
import type { AtlasWorld } from './world';
import { clamp01, ease, hash, ramp } from '../studio/motion';
import { type Shot, type Vec3 } from '../studio/three/rig';
import { W, H, STAGE_CENTER_Y, SAFE } from '../studio/tokens';
import { theme } from '../lib/theme';

/**
 * Objects standing ON the map (cue `prop`): evidence and set pieces of a case, drawn in the same low-poly 3D as
 * the pieces and the vehicles, so the information lives in the world instead of in a floating card.
 *   { "type": "prop", "kind": "vault", "at": [lon, lat], "size": 330, "atWord": "vault.", "hold": 6,
 *     "openWord": "Monday,", "openDur": 2.2, "open": 0.7, "caption": "VAULT · 2 FLOORS DOWN", "yaw": -20 }
 * kinds: `vault` (a wall of deposit-box doors that swing open in a scattered order: `open` = fraction opened — a
 *   SYMBOL, never a count), `diamonds` (a pile of cut stones; `sinkWord` sinks it into the table: gone),
 *   `sandwich` (half a sandwich, cut diagonally), `bags` (dumped rubbish bags), `envelopes` (scattered envelopes),
 *   `building` (a block standing on the map).
 * `size` is the object's width in screen pixels (it keeps that size whatever the camera does, like `vehicle`);
 * `drop: true` makes it fall onto the table with a bounce, otherwise it rises out of the table.
 */
type P = Extract<TimedAction, { type: 'prop' }>;
export type PropState = { p: P; pos: Vec3; u: number; rise: number; fade: number; sink: number; open: number; yaw: number; drop: number };

/** fall then two small bounces, 0 → 1 */
const bounce = (x: number) => { const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; };
const FULL_H = H + 2 * (H / 2 - STAGE_CENTER_Y);
const rad = (d: number) => (d * Math.PI) / 180;

export function propStates(world: AtlasWorld, actions: TimedAction[], t: number, shot: Shot): PropState[] {
  const out: PropState[] = [];
  const ppx = (2 * shot.dist * Math.tan(rad(shot.fov) / 2) * (W / FULL_H)) / W;
  for (const p of actions.filter((a) => a.type === 'prop') as P[]) {
    const end = p.t + (p.hold ?? 4);
    if (t < p.t || t > end + 0.6) continue;
    const q = world.project(p.at); if (!q) continue;
    const instant = p.t <= 0.05;
    const rise = instant ? 1 : p.drop ? 1 : ease.back(ramp(t, p.t, 0.55), 1.3);
    const drop = instant || !p.drop ? 0 : 1 - bounce(clamp01((t - p.t) / 0.75));
    const fade = 1 - ramp(t, end, 0.5);
    const sink = p.sinkAt != null ? ease.inOut3(ramp(t, p.sinkAt, 1.1)) : 0;
    const open = Math.max(p.openStart ?? 0, p.openAt != null ? (p.open ?? 1) * clamp01((t - p.openAt) / (p.openDur ?? 2)) : 0);
    const u = (p.size ?? 200) * ppx;
    out.push({ p, pos: [q[0], world.h, q[1]], u, rise, fade, sink, open, yaw: rad(p.yaw ?? 0), drop });
  }
  return out;
}

const box = new THREE.BoxGeometry(1, 1, 1);
const prism = new THREE.CylinderGeometry(1, 1, 1, 3);
const disc = new THREE.CylinderGeometry(1, 1, 1, 12);
const gem = new THREE.OctahedronGeometry(1, 0);
const ball = new THREE.SphereGeometry(1, 9, 7);

const VAULT = { cols: 10, rows: 6 };
/** Wall of deposit boxes, 1 unit wide, standing on its base, doors facing +z. */
const Vault: React.FC<{ open: number; steel: string; door: string; inside: string }> = ({ open, steel, door, inside }) => {
  const { cols, rows } = VAULT, w = 1, h = 0.62, d = 0.16, cw = w / cols, rh = h / rows;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c;
    const order = hash(i * 7.31 + 2); // scattered opening order
    const k = ease.out3(clamp01((open - order * 0.85) / 0.15));
    const x = -w / 2 + cw * (c + 0.5), y = rh * (r + 0.5) + 0.02;
    cells.push(
      <group key={i} position={[x, y, d / 2]}>
        {k > 0.02 && <mesh geometry={box} position={[0, 0, 0.002]} scale={[cw * 0.8, rh * 0.74, 0.002]}><meshBasicMaterial color={inside} /></mesh>}
        {/* the door, hinged on its left edge */}
        <group position={[-cw * 0.42, 0, 0.008]} rotation={[0, -1.9 * k, 0]}>
          <mesh geometry={box} position={[cw * 0.42, 0, 0]} scale={[cw * 0.84, rh * 0.8, 0.01]}><meshLambertMaterial color={door} /></mesh>
          <mesh geometry={box} position={[cw * 0.68, 0, 0.009]} scale={[cw * 0.1, rh * 0.22, 0.01]}><meshLambertMaterial color={steel} /></mesh>
        </group>
      </group>,
    );
  }
  return (
    <group>
      <mesh geometry={box} position={[0, h / 2 + 0.01, 0]} scale={[w + 0.05, h + 0.05, d]} castShadow><meshLambertMaterial color={steel} /></mesh>
      {cells}
    </group>
  );
};

const Diamonds: React.FC<{ n?: number; color: string }> = ({ n = 26, color }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const a = hash(i * 3.1) * Math.PI * 2, r = Math.sqrt(hash(i * 5.7 + 1)) * 0.42;
      const s = 0.06 + hash(i * 9.3 + 2) * 0.05;
      const y = s * 0.8 + (0.42 - r) * 0.35 * hash(i * 1.7 + 4);
      return (
        <mesh key={i} geometry={gem} position={[Math.cos(a) * r, y, Math.sin(a) * r * 0.8]} rotation={[hash(i) * 3, hash(i + 9) * 3, 0]} scale={[s, s * 1.25, s]} castShadow>
          <meshLambertMaterial color={i % 5 === 0 ? '#FFFFFF' : color} emissive={'#3A4650'} />
        </mesh>
      );
    })}
  </group>
);

/** Half a sandwich, cut on the diagonal (a triangular prism), salami showing at the cut. */
const Sandwich: React.FC<{ bread: string; crust: string; salami: string }> = ({ bread, crust, salami }) => (
  <group rotation={[0, 0.5, 0]}>
    {[0.04, 0.2].map((y, k) => (
      <mesh key={k} geometry={prism} position={[0, y, 0]} scale={[0.5, 0.1, 0.5]} castShadow><meshLambertMaterial color={k ? bread : crust} /></mesh>
    ))}
    <mesh geometry={prism} position={[0, 0.12, 0]} scale={[0.47, 0.06, 0.47]}><meshLambertMaterial color="#7FA34A" /></mesh>
    {[[0.12, 0.05], [-0.1, 0.16], [-0.06, -0.18], [0.2, -0.1]].map(([x, z], i) => (
      <mesh key={i} geometry={disc} position={[x, 0.13 + i * 0.004, z]} scale={[0.13, 0.03, 0.13]}><meshLambertMaterial color={salami} /></mesh>
    ))}
  </group>
);

const Bags: React.FC<{ color: string; tie: string }> = ({ color, tie }) => (
  <group>
    {[[-0.24, 0, 0.3], [0.2, 0.05, 0.36], [0.02, -0.25, 0.28]].map(([x, z, s], i) => (
      <group key={i} position={[x, s * 0.8, z]}>
        <mesh geometry={ball} scale={[s, s * 0.85, s * 0.9]} castShadow><meshLambertMaterial color={color} /></mesh>
        <mesh geometry={disc} position={[0, s * 0.9, 0]} scale={[s * 0.18, s * 0.3, s * 0.18]}><meshLambertMaterial color={tie} /></mesh>
      </group>
    ))}
  </group>
);

const Envelopes: React.FC<{ paper: string; mark: string }> = ({ paper, mark }) => (
  <group>
    {Array.from({ length: 6 }, (_, i) => (
      <group key={i} position={[(hash(i * 2.3) - 0.5) * 0.8, 0.01 + i * 0.012, (hash(i * 4.1) - 0.5) * 0.5]} rotation={[0, hash(i * 6.7) * 2.4, 0]}>
        <mesh geometry={box} scale={[0.34, 0.01, 0.2]} castShadow><meshLambertMaterial color={paper} /></mesh>
        <mesh geometry={box} position={[0.08, 0.007, 0.04]} scale={[0.1, 0.004, 0.05]}><meshBasicMaterial color={mark} /></mesh>
      </group>
    ))}
  </group>
);

const Building: React.FC<{ wall: string; window: string }> = ({ wall, window: win }) => (
  <group>
    <mesh geometry={box} position={[0, 0.35, 0]} scale={[0.7, 0.7, 0.45]} castShadow><meshLambertMaterial color={wall} /></mesh>
    {Array.from({ length: 12 }, (_, i) => (
      <mesh key={i} geometry={box} position={[-0.24 + (i % 4) * 0.16, 0.16 + Math.floor(i / 4) * 0.2, 0.227]} scale={[0.08, 0.1, 0.005]}><meshBasicMaterial color={win} /></mesh>
    ))}
  </group>
);

export const Props3D: React.FC<{ states: PropState[]; pal: { ink: string; accent: string; surface: string; muted: string } }> = ({ states, pal }) => (
  <>
    {states.map((S, i) => {
      if (S.fade <= 0.01 || S.sink >= 0.999) return null;
      const k = S.p.kind;
      const sc = S.u * S.fade;
      const y = S.pos[1] + S.drop * S.u * 1.6 - S.sink * S.u * 0.7;
      const paper = theme.paper || '#E6D9BC';
      return (
        <group key={i} position={[S.pos[0], y, S.pos[2]]} rotation={[0, S.yaw, 0]} scale={[sc, sc * (S.p.drop ? 1 : Math.max(0.02, S.rise)), sc]}>
          {k === 'vault' && <Vault open={S.open} steel="#3E3A33" door="#BDB5A2" inside={pal.accent} />}
          {k === 'diamonds' && <Diamonds color="#CFE3EE" />}
          {k === 'sandwich' && <Sandwich bread="#E3BF7A" crust="#B98A45" salami="#B5332B" />}
          {k === 'bags' && <Bags color="#4A4740" tie={pal.accent} />}
          {k === 'envelopes' && <Envelopes paper={paper} mark={pal.accent} />}
          {k === 'building' && <Building wall="#8C7F64" window="#F1D98A" />}
        </group>
      );
    })}
  </>
);

/** Evidence tags pinned above the props: a paper tag on a red string, typed. */
export const PropLabels: React.FC<{ states: PropState[]; toPx: (p: Vec3) => [number, number] }> = ({ states, toPx }) => (
  <>
    {states.map((S, i) => {
      if (!S.p.caption || S.fade < 0.05 || S.sink > 0.6) return null;
      const lift = S.p.kind === 'vault' ? 0.78 : S.p.kind === 'building' ? 0.85 : 0.5;
      const [x, y] = toPx([S.pos[0], S.pos[1] + S.u * lift, S.pos[2]]);
      const left = Math.min(Math.max(x, SAFE.left + 150), 930 - 150);
      return (
        <div key={i} style={{ position: 'absolute', left, top: y - (S.p.captionDy ?? 70), transform: `translateX(-50%) rotate(${S.p.kind === 'vault' ? 0 : -3}deg)`, opacity: S.fade * (S.p.drop ? ramp(S.drop === 0 ? 1 : 0, 0, 1) : clamp01((S.rise - 0.6) / 0.4)) }}>
          <div style={{ position: 'absolute', left: '50%', top: '100%', width: 3, height: Math.max(0, (S.p.captionDy ?? 70) - 46), background: theme.stamp || '#C8231E' }} />
          <div style={{ background: theme.paper || '#E6D9BC', color: theme.paperInk || '#1A1612', fontFamily: theme.typewriter || 'monospace', fontWeight: 700, fontSize: 25,
            letterSpacing: '0.08em', padding: '7px 14px 5px', boxShadow: '6px 6px 0 rgba(0,0,0,0.55)', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{S.p.caption}</div>
        </div>
      );
    })}
  </>
);
