import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import * as THREE from 'three';
import { schedule } from '../lib/schedule';
import type { Timings } from '../lib/types';
import { FPS, SAFE, ZONES } from '../studio/tokens';
import { seriesOf, type SeriesDef } from '../studio/series';
import { loadFonts } from '../studio/fonts';
import { drift, ease, hit, hop, life, mixHex, pop, ramp, shade } from '../studio/motion';
import { dollyZoom, fitShot, lerpShot, makeCamera, projector, shotAt, type Rect, type Shot, type ShotKey, type Vec3 } from '../studio/three/rig';
import { PixelStage } from '../studio/look/PixelStage';
import { TableLight } from '../studio/three/Light';
import { Pawn } from '../atlas/Units3D';
import { Display, Mono } from '../studio/ui/Type';
import { Kicker, ReadabilityBands, SeriesBar, TitleBlock } from '../studio/ui/Hud';
import { Captions } from '../studio/ui/Captions';
import { Grain, Guides } from '../studio/ui/Finish';

/**
 * UNGRADED — "the rules school never taught". Third engine of the studio (after the map and the counter).
 * Same contract as `Money3D`: one continuous 3D set, one station per scene of episode.json, the camera
 * travels from station to station and returns to the first one for the loop. Everything is drawn from
 * primitives (nothing downloaded). Scene types and their cues (also listed in scripts/validate.mjs):
 *   papers  five test papers          mark (a red ✗ on the next paper, the grade drops) · flip (the papers turn over) · clear · pass
 *   stacks  two towers of cubes       stack {side,count,value,label,color:'ink'} · light {side, dim, lightLabel via stack}
 *   trials  three pedestals           launch {outcome: flop|ignored|sale, label} · learn
 *   road    a road of tiles + a pawn  walk {to} · halt · big {value,label,sub}
 *   lines   type over another scene   line {small,text,strike}   (scene.over = the scene it plays over)
 * `callout` works in every scene.
 */
type A = { type: string; t: number; beat: string; [k: string]: any };
type Seg = { id: string; from: number; to: number; kicker?: string };
type StationProps = { t: number; acts: A[]; def: any; ox: number; series: SeriesDef };
export type MindsetProps = { episodeId: string; spec?: any; timings?: Timings; cover?: boolean; guides?: boolean };

const GAP = 26;
const box = new THREE.BoxGeometry(1, 1, 1);
const cyl = new THREE.CylinderGeometry(1, 1, 1, 20);
const SAFE_W = SAFE.right - SAFE.left;
const pal = (s: SeriesDef) => s.palette;
const sat = (t: number, t0: number, d: number) => ease.out3(ramp(t, t0, d));

/* ------------------------------------------------------------------ papers */
const SHEET_X = (i: number) => (i - 2) * 2.05;
const sheetMarks = (acts: A[]) => acts.filter((a) => a.type === 'mark');
const clearAt = (acts: A[]) => acts.find((a) => a.type === 'clear' || a.type === 'flip')?.t ?? 1e9;
/** index of the grade letter shown at time t (0 = best) */
const gradeIndex = (t: number, acts: A[], def: any) => {
  if (t >= clearAt(acts)) return -1;
  const n = sheetMarks(acts).filter((a) => t >= a.t).length;
  return Math.min(n, (def.grades?.length ?? 5) - 1);
};
const PapersStation: React.FC<StationProps> = ({ t, acts, ox, series }) => {
  const marks = sheetMarks(acts), clr = clearAt(acts), pass = acts.find((a) => a.type === 'pass'), flip = acts.find((a) => a.type === 'flip');
  return (
    <group position={[ox, 0, 0]}>
      <mesh geometry={box} position={[0, 0.08, 0.2]} scale={[11, 0.16, 3.4]} receiveShadow castShadow><meshLambertMaterial color={pal(series).surface} /></mesh>
      {Array.from({ length: 5 }, (_, i) => {
        const m = marks[i];
        const isPass = !!pass && (pass.index ?? 4) === i && t >= pass.t;
        const mk = m ? pop(t, m.t, 0.3) * (flip ? 1 : 1 - ease.out3(ramp(t, clr, 0.35))) : 0;
        const pp = isPass ? pop(t, pass!.t, 0.4) : 0;
        const f0 = flip ? flip.t + i * 0.09 : 1e9, f = ease.inOut3(ramp(t, f0, 0.5));
        const lift = (m ? hop(t, m.t, 0.35) * 0.5 : 0) + hop(t, f0, 0.5) * 1.1;
        return (
          <group key={i} position={[SHEET_X(i), 1.37 + lift + pp * 0.25, 0]} rotation={[-0.16, f * Math.PI, 0]}>
            {/* the back of every paper: what the same attempt is worth out here */}
            <mesh geometry={box} position={[0, 0, -0.05]} scale={[1.6, 2.15, 0.02]}><meshBasicMaterial color={pal(series).accent} /></mesh>
            <group position={[0, 0.05, -0.08]} scale={[-1.6, 1.6, 1]}>
              <mesh geometry={box} position={[-0.22, -0.1, 0]} rotation={[0, 0, -Math.PI / 4]} scale={[0.42, 0.2, 0.05]}><meshBasicMaterial color={pal(series).bg} /></mesh>
              <mesh geometry={box} position={[0.18, 0.1, 0]} rotation={[0, 0, Math.PI / 4]} scale={[0.95, 0.2, 0.05]}><meshBasicMaterial color={pal(series).bg} /></mesh>
            </group>
            <mesh geometry={box} scale={[1.75, 2.3, 0.08]} castShadow receiveShadow><meshLambertMaterial color={isPass ? mixHex('#F5F2FF', pal(series).accent, 0.85 * pp) : '#EFEAFB'} /></mesh>
            {[0.78, 0.46, 0.14].map((y, k) => <mesh key={k} geometry={box} position={[-0.1 + (k === 2 ? -0.2 : 0), y, 0.05]} scale={[1.25 - (k === 2 ? 0.4 : 0), 0.11, 0.03]}><meshBasicMaterial color="#9C95B8" /></mesh>)}
            {mk > 0.01 && [Math.PI / 4, -Math.PI / 4].map((r, k) => (
              <mesh key={k} geometry={box} position={[0.2, -0.55, 0.08]} rotation={[0, 0, r]} scale={[1.05 * mk, 0.2 * mk, 0.05]}><meshBasicMaterial color={pal(series).danger} /></mesh>
            ))}
            {pp > 0.01 && (
              <group position={[0.1, -0.5, 0.08]} scale={pp}>
                <mesh geometry={box} position={[-0.22, -0.1, 0]} rotation={[0, 0, -Math.PI / 4]} scale={[0.42, 0.2, 0.05]}><meshBasicMaterial color={pal(series).bg} /></mesh>
                <mesh geometry={box} position={[0.18, 0.1, 0]} rotation={[0, 0, Math.PI / 4]} scale={[0.95, 0.2, 0.05]}><meshBasicMaterial color={pal(series).bg} /></mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ stacks */
const CUBE_H = 0.62, TOWER_X = 3.3, CUBE_W = 1.45;
/** cube i of a tower: two columns once there are more than five, so ten failures read as a mass, not a needle */
const cubeAt = (i: number, n: number): [number, number] => (n > 5 ? [(i % 2 ? 0.76 : -0.76), Math.floor(i / 2)] : [0, i]);
const towerRows = (n: number) => (n > 5 ? Math.ceil(n / 2) : n);
const stackOf = (acts: A[], side: string) => acts.find((a) => a.type === 'stack' && a.side === side);
const lightOf = (acts: A[], side: string, t = 0) => acts.find((a) => a.type === 'light' && a.side === side && !(a.until != null && t >= a.until));
const StacksStation: React.FC<StationProps> = ({ t, acts, ox, series }) => (
  <group position={[ox, 0, 0]}>
    <mesh geometry={box} position={[0, 0.06, 0]} scale={[10.6, 0.12, 4]} receiveShadow><meshLambertMaterial color={pal(series).surface} /></mesh>
    {(['left', 'right'] as const).map((side) => {
      const s = stackOf(acts, side), l = lightOf(acts, side, t), x = side === 'left' ? -TOWER_X : TOWER_X;
      if (!s) return null;
      const n = s.count ?? 0;
      return (
        <group key={side} position={[x, 0.12, 0]}>
          {n === 0 && <mesh geometry={box} position={[0, 0.03, 0]} scale={[1.9, 0.06, 1.9]}><meshBasicMaterial color={pal(series).danger} /></mesh>}
          {Array.from({ length: n }, (_, i) => {
            const at = s.t + i * 0.13, on = !!l && t >= l.t + i * 0.07;
            if (t < at) return null;
            const up = pop(t, at, 0.3);
            const flash = on ? hit(t, l!.t + i * 0.07, 0.08, 0.35) * 0.5 : 0;
            // a lit cube becomes a lesson (accent); a dimmed one is squashed flat: it taught nothing
            const sq = on && l!.dim ? ease.out3(ramp(t, l!.t, 0.35)) : 0;
            const base = s.color === 'ink' ? pal(series).ink : pal(series).danger;
            const c = on ? (l!.dim ? pal(series).muted : pal(series).accent) : base;
            const h = CUBE_H * up * (1 - 0.8 * sq) * (s.tall ?? 1), [cx, row] = cubeAt(i, n), w = (n > 1 ? CUBE_W : 2.1) * up * (1 + 0.25 * sq);
            return (
              <mesh key={i} geometry={box} position={[cx, h / 2 + row * (CUBE_H + 0.05) + hop(t, at, 0.3) * 0.5, 0]} scale={[w, h, w]} castShadow receiveShadow>
                <meshLambertMaterial color={mixHex(c, '#ffffff', flash)} />
              </mesh>
            );
          })}
        </group>
      );
    })}
  </group>
);

/* ------------------------------------------------------------------ trials */
const PED_X = (i: number) => (i - 1) * 4.0, PL = 0.34;
const launches = (acts: A[]) => acts.filter((a) => a.type === 'launch');
const TrialsStation: React.FC<StationProps> = ({ t, acts, ox, series }) => {
  const L = launches(acts), learn = acts.find((a) => a.type === 'learn');
  const P = pal(series);
  return (
    <group position={[ox, 0, 0]}>
      <mesh geometry={box} position={[0, 0.06, 0]} scale={[12, 0.12, 4]} receiveShadow><meshLambertMaterial color={shade(P.surface, -0.15)} /></mesh>
      {/* shop front: striped awning on two posts */}
      {Array.from({ length: 12 }, (_, k) => (
        <mesh key={`aw${k}`} geometry={box} position={[-5.5 + k + 0.5, 4.3, -1.7]} rotation={[0.5, 0, 0]} scale={[1, 0.12, 1.5]} castShadow><meshLambertMaterial color={k % 2 ? P.ink : P.danger} /></mesh>
      ))}
      {[-5.6, 5.6].map((x) => <mesh key={x} geometry={box} position={[x, 2.1, -2.2]} scale={[0.22, 4.2, 0.22]} castShadow><meshLambertMaterial color={shade(P.surface, 0.2)} /></mesh>)}
      {[0, 1, 2].map((i) => {
        const a = L[i], x = PED_X(i);
        const born = a ? pop(t, a.t, 0.35) : 0;
        const out = a?.outcome ?? 'flop';
        const tip = a && out === 'flop' ? sat(t, a.t + 0.55, 0.4) : 0;
        const color = !a ? P.surface : out === 'flop' ? mixHex(P.surface, P.danger, sat(t, a.t + 0.5, 0.3)) : out === 'ignored' ? shade(P.surface, 0.12) : mixHex(P.surface, P.accent, sat(t, a.t + 0.4, 0.3));
        return (
          <group key={i} position={[x, 0, 0]}>
            <mesh geometry={cyl} position={[0, PL / 2 + 0.12, 0]} scale={[1.45, PL, 1.45]} receiveShadow castShadow><meshLambertMaterial color={shade(P.surface, 0.08)} /></mesh>
            <mesh geometry={cyl} position={[0, PL + 0.14, 0]} scale={[1.3, 0.04, 1.3]}><meshBasicMaterial color={a ? color : P.grid} /></mesh>
            {a && (
              <group position={[tip * 0.55, PL + 0.14 + 0.65 * born * (1 - tip * 0.25) + (out === 'ignored' ? -0.08 * sat(t, a.t + 0.5, 0.5) : 0), 0]} rotation={[0, 0.5, -tip * 1.15]} scale={[born, born * (out === 'ignored' ? 1 - 0.18 * sat(t, a.t + 0.5, 0.5) : 1), born]}>
                <mesh geometry={box} scale={[1.2, 1.2, 1.2]} castShadow><meshLambertMaterial color={color} /></mesh>
                <mesh geometry={box} position={[0, 0.62, 0]} scale={[0.5, 0.05, 1.22]}><meshBasicMaterial color={P.ink} /></mesh>
              </group>
            )}
            {a && out === 'sale' && [0, 1, 2].map((j) => {
              const at = a.t + 0.6 + j * 0.22; if (t < at) return null;
              return <mesh key={j} geometry={cyl} position={[1.35 + (j % 2) * 0.1, 0.2 + j * 0.15 + hop(t, at, 0.4) * 0.9, 0.5]} scale={[0.42, 0.12, 0.42]} castShadow><meshLambertMaterial color="#F4CE57" /></mesh>;
            })}
            {learn && a && t >= learn.t + i * 0.14 && (
              <mesh geometry={box} position={[0, 3.2 + Math.sin(t * 2.6 + i) * 0.12, 0]} rotation={[0.5, t * 1.4 + i, 0.4]} scale={[0.55 * pop(t, learn.t + i * 0.14, 0.35), 0.55 * pop(t, learn.t + i * 0.14, 0.35), 0.55 * pop(t, learn.t + i * 0.14, 0.35)]}><meshBasicMaterial color={P.accent} /></mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ road */
const TILES = 12, TILE_X = (i: number) => (i - (TILES - 1) / 2) * 1.3, ROAD_VIEW = 3;
/** pawn position along the road in tile units, a pure function of time */
const pawnAt = (t: number, acts: A[]) => {
  let p = 0;
  for (const a of acts.filter((x) => x.type === 'walk')) if (t >= a.t) p += (a.to - p) * ease.inOut3(ramp(t, a.t, a.dur ?? 1.4));
  return p;
};
const RoadStation: React.FC<StationProps> = ({ t, acts, ox, series }) => {
  const P = pal(series), p = pawnAt(t, acts), halt = acts.find((x) => x.type === 'halt');
  const walks = acts.filter((x) => x.type === 'walk');
  const resume = halt ? walks.find((w) => w.t > halt.t) : undefined;
  const bar = halt ? pop(t, halt.t, 0.3) * (resume ? 1 - ease.in3(ramp(t, resume.t, 0.5)) : 1) : 0;
  return (
    <group position={[ox, 0, 0]}>
      {Array.from({ length: TILES }, (_, i) => {
        const passed = p >= i + 0.5;
        const k = Math.max(0, Math.min(1, p - i));
        return (
          <mesh key={i} geometry={box} position={[TILE_X(i), 0.1, 0]} scale={[1.12, 0.2 + k * 0.1, 1.12]} castShadow receiveShadow>
            <meshLambertMaterial color={passed ? P.accent : mixHex(P.surface, P.danger, i === 0 ? 0.9 : 0.78)} />
          </mesh>
        );
      })}
      <group position={[TILE_X(0) + p * 1.3, 0.2 + Math.abs(Math.sin(p * Math.PI * 1.0)) * 0.22, 0]} scale={2.1}><Pawn c={P.ink} head={P.accent} /></group>
      {bar > 0.01 && <mesh geometry={box} position={[TILE_X(0) + p * 1.3 + 1.5, 0.2 + 1.3 * bar, 0]} scale={[0.35, 2.6 * bar, 2.2]} castShadow><meshLambertMaterial color={P.danger} /></mesh>}
    </group>
  );
};

const STATIONS: Record<string, React.FC<StationProps>> = { papers: PapersStation, stacks: StacksStation, trials: TrialsStation, road: RoadStation, lines: () => null };

/* ------------------------------------------------------------------ framing */
const boxPts = (ox: number, w: number, y0: number, y1: number, d: number): Vec3[] =>
  [-1, 1].flatMap((sx) => [y0, y1].flatMap((y) => [-1, 1].map((sz) => [ox + (sx * w) / 2, y, (sz * d) / 2] as Vec3)));
function frameOf(def: any, ox: number): { pts: Vec3[]; rect: Rect; base: { pitch: number; yaw: number; fov: number } } {
  const L = SAFE.left + 30, R = SAFE.right - 30;
  switch (def.type) {
    case 'papers': return { pts: boxPts(ox, 10.2, 0, 2.7, 2.6), rect: { left: L, right: R, top: 600, bottom: 925 }, base: { pitch: 17, yaw: -14, fov: 26 } };
    case 'stacks': return { pts: boxPts(ox, 10, 0, 4.3, 3.2), rect: { left: L + 10, right: R - 10, top: 660, bottom: 1010 }, base: { pitch: 15, yaw: -12, fov: 28 } };
    case 'trials': return { pts: boxPts(ox, 11.6, 0, 4.6, 3.4), rect: { left: L - 10, right: R + 10, top: 610, bottom: 960 }, base: { pitch: 18, yaw: -16, fov: 26 } };
    default: return { pts: boxPts(ox + TILE_X(ROAD_VIEW), 8 * 1.3, 0, 2.6, 1.8), rect: { left: L - 30, right: R + 30, top: 600, bottom: 905 }, base: { pitch: 17, yaw: -24, fov: 32 } };
  }
}

/* ------------------------------------------------------------------ type above the world */
type OverlayProps = { t: number; acts: A[]; def: any; series: SeriesDef; toPx: (p: Vec3) => [number, number]; ox: number };
const GRADE_COLORS = (s: SeriesDef, k: number, n: number) => mixHex(s.palette.accent, s.palette.danger, n <= 1 ? 0 : k / (n - 1));

const PapersOverlay: React.FC<OverlayProps> = ({ t, acts, def, series }) => {
  const grades: string[] = def.grades ?? ['A', 'B', 'C', 'D', 'F'];
  const g = gradeIndex(t, acts, def);
  const lastMark = Math.max(0, ...sheetMarks(acts).filter((a) => t >= a.t).map((a) => a.t));
  const o = g < 0 ? 1 - ramp(t, clearAt(acts), 0.2) : 1;
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: SAFE.left, top: 946, opacity: o }}>
      <Mono size={26} color={pal(series).muted} track={0.2}>{def.gradeLabel ?? 'Grade'}</Mono>
      <div style={{ transform: `scale(${1 + hit(t, lastMark, 0.08, 0.3) * 0.16})`, transformOrigin: 'left center', marginTop: 8 }}>
        <Display size={170} color={GRADE_COLORS(series, Math.max(0, g), grades.length)}>{grades[Math.max(0, g)]}</Display>
      </div>
    </div>
  );
};

const StacksOverlay: React.FC<OverlayProps> = ({ t, acts, series, toPx, ox }) => (
  <>
    {(['left', 'right'] as const).map((side) => {
      const s = stackOf(acts, side), l = lightOf(acts, side, t);
      if (!s) return null;
      const x = ox + (side === 'left' ? -TOWER_X : TOWER_X), n = s.count ?? 0;
      const top = toPx([x, 0.12 + towerRows(n) * (CUBE_H + 0.05) * (s.tall ?? 1) + 0.1, 0]), foot = toPx([x, 0.12, 1.6]);
      const lit = !!l && t >= l.t;
      const shown = ramp(t, s.t, 0.25);
      return (
        <React.Fragment key={side}>
          <div style={{ position: 'absolute', left: top[0], top: Math.max(ZONES.title.bottom + 20, top[1] - 118), transform: `translateX(-50%) scale(${Math.min(1.1, pop(t, s.t, 0.35))})`, opacity: shown }}>
            <Display size={104} color={lit ? (l!.dim ? pal(series).danger : pal(series).accent) : s.color === 'ink' ? pal(series).ink : pal(series).danger} stroke={7}>{lit && s.lightValue != null ? s.lightValue : s.value ?? n}</Display>
          </div>
          <div style={{ position: 'absolute', left: foot[0], top: foot[1] + 26, transform: 'translateX(-50%)', opacity: shown, width: 330, textAlign: 'center' }}>
            <Mono size={30} color={pal(series).ink} track={0.08} style={{ whiteSpace: 'normal', lineHeight: 1.25 }}>{lit && s.lightLabel ? s.lightLabel : s.label}</Mono>
          </div>
        </React.Fragment>
      );
    })}
  </>
);

const TrialsOverlay: React.FC<OverlayProps> = ({ t, acts, series, toPx, ox }) => (
  <>
    {launches(acts).slice(0, 3).map((a, i) => {
      const foot = toPx([ox + PED_X(i), 0, 1.5]);
      const color = a.outcome === 'sale' ? pal(series).accent : a.outcome === 'flop' ? pal(series).danger : shade(pal(series).muted, 0.45);
      return (
        <div key={i} style={{ position: 'absolute', left: foot[0], top: foot[1] + 22, transform: `translateX(-50%) scale(${Math.min(1.08, pop(t, a.t + 0.2, 0.3))})`, opacity: ramp(t, a.t + 0.2, 0.2), textAlign: 'center', width: 240 }}>
          <Mono size={26} color={color} track={0.06} weight={800} style={{ whiteSpace: 'normal', lineHeight: 1.2 }}>{a.label}</Mono>
        </div>
      );
    })}
  </>
);

const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US');
const RoadOverlay: React.FC<OverlayProps> = ({ t, acts, series }) => (
  <>
    {acts.filter((a) => a.type === 'big').map((a, i) => {
      const v = a.value * ease.out3(ramp(t, a.t, a.dur ?? 1.8));
      return (
        <div key={i} style={{ position: 'absolute', left: SAFE.left, top: 936, opacity: ramp(t, a.t, 0.15), transform: `scale(${Math.min(1.06, pop(t, a.t))})`, transformOrigin: 'left center' }}>
          <Display size={150} color={pal(series).accent} stroke={6}>{fmtInt(v)}</Display>
          <Mono size={30} color={pal(series).ink} track={0.1} style={{ marginTop: 10 }}>{a.label}</Mono>
          {a.sub && <Mono size={26} color={pal(series).ink} track={0.06} weight={600} style={{ marginTop: 10, opacity: 0.85 }}>{a.sub}</Mono>}
        </div>
      );
    })}
  </>
);

const LinesOverlay: React.FC<OverlayProps> = ({ t, acts, series }) => (
  <div style={{ position: 'absolute', left: SAFE.left, top: 330, width: SAFE_W, display: 'flex', flexDirection: 'column', gap: 34 }}>
    {acts.filter((a) => a.type === 'line').map((a, i) => {
      const struck = a.strike ? ease.out3(ramp(t, a.t + 0.9, 0.25)) : 0;
      return (
        <div key={i} style={{ opacity: ramp(t, a.t, 0.15), transform: `scale(${Math.min(1.06, pop(t, a.t))})`, transformOrigin: 'left center' }}>
          <Mono size={28} color={pal(series).muted} track={0.14}>{a.small}</Mono>
          <div style={{ position: 'relative', display: 'inline-block', marginTop: 10 }}>
            <Display size={Math.min(112, a.size ?? 104)} color={a.color ?? pal(series).ink} style={{ opacity: 1 - struck * 0.45 }}>{a.text}</Display>
            {a.strike && <div style={{ position: 'absolute', left: -8, top: '46%', height: 13, width: `calc(${struck * 100}% + ${struck * 16}px)`, background: pal(series).danger, boxShadow: '4px 4px 0 rgba(0,0,0,0.4)' }} />}
          </div>
        </div>
      );
    })}
  </div>
);
const OVERLAYS: Record<string, React.FC<OverlayProps>> = { papers: PapersOverlay, stacks: StacksOverlay, trials: TrialsOverlay, road: RoadOverlay, lines: LinesOverlay };

/* ------------------------------------------------------------------ composition */
export const Mindset3D: React.FC<MindsetProps> = ({ episodeId, spec, timings, cover, guides }) => {
  loadFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const series = seriesOf(spec);
  const P = series.palette;
  const end = timings!.duration + 0.5;
  const audioId = spec.audio ?? episodeId;

  const { segs, byScene, acts, origin, keys } = useMemo(() => {
    const acts = schedule(spec, timings!).actions as unknown as A[];
    const sceneOfBeat: Record<string, string> = {}; const segs: Seg[] = [];
    let cur = '';
    spec.beats.forEach((b: any, i: number) => {
      const bt = timings!.beats[i]; const from = i === 0 ? 0 : bt.start - 0.12;
      if (b.scene) cur = b.scene;
      sceneOfBeat[b.id] = cur;
      const last = segs[segs.length - 1];
      if (last && last.id === cur && (b.kicker ?? last.kicker) === last.kicker) last.to = end + 1;
      else { if (last) last.to = from; segs.push({ id: cur, from, to: end + 1, kicker: b.kicker ?? (last && last.id === cur ? last.kicker : undefined) }); }
    });
    const byScene: Record<string, A[]> = {};
    for (const a of acts) (byScene[sceneOfBeat[a.beat]] ??= []).push(a);
    // loop: in the last 0.45 s (title back on screen) the lit/dimmed towers return to their frame-0 colours
    for (const a of acts) if (a.type === 'light') a.until = end - 0.45;
    // one station per scene; a `lines` scene is played over the station named in `over`
    const ids = Object.keys(spec.scenes);
    const origin: Record<string, number> = {}; let slot = 0;
    for (const id of ids) if (spec.scenes[id].type !== 'lines') origin[id] = slot++ * GAP;
    for (const id of ids) if (!(id in origin)) origin[id] = origin[spec.scenes[id].over];
    const defOf = (id: string) => (spec.scenes[id].type === 'lines' ? { ...spec.scenes[spec.scenes[id].over], ...spec.scenes[id], type: spec.scenes[spec.scenes[id].over].type } : spec.scenes[id]);
    const shotOf = (id: string): Shot => {
      const f = frameOf(defOf(id), origin[id]);
      const lines = spec.scenes[id].type === 'lines';
      const base = lines ? { ...f.base, pitch: f.base.pitch + 6, yaw: f.base.yaw + 20, fov: f.base.fov } : f.base;
      return fitShot(f.pts, { ...base, ...(spec.scenes[id].camera ?? {}) }, lines ? { ...f.rect, top: 790, bottom: 1080 } : f.rect);
    };
    const keys: ShotKey[] = [];
    segs.forEach((s, i) => { if (i === 0 || segs[i - 1].id !== s.id) keys.push({ t: Math.max(0, s.from - (i ? 0.3 : 0)), dur: 0.95, shot: shotOf(s.id) }); });
    return { segs, byScene, acts, origin, keys };
  }, [spec, timings, end]);

  const hookEnd = timings!.beats[0].end;
  const seg = segs.find((s) => t >= s.from - 0.01 && t < s.to) ?? segs[segs.length - 1];

  const crane = (s: Shot, k: number): Shot => ({ ...s, pitch: s.pitch - 7 * k, yaw: s.yaw + 12 * k, dist: s.dist * (1 - 0.22 * k) });
  const open = crane(keys[0].shot, 1);
  let shot = crane(shotAt(t, keys), cover ? 0 : 1 - ease.inOut3(ramp(t, 0.1, 1.5)));
  const back = ease.inOut3(ramp(t, end - 0.62, 0.5));
  if (back > 0) shot = lerpShot(shot, open, back);
  const roadId = Object.keys(spec.scenes).find((k) => spec.scenes[k].type === 'road');
  if (roadId) {
    const rs = segs.filter((s) => s.id === roadId);
    if (rs.length) {
      const w = Math.min(ramp(t, rs[0].from - 0.3, 0.95), 1 - ramp(t, rs[rs.length - 1].to - 0.3, 0.95));
      const follow = Math.max(0, (pawnAt(t, byScene[roadId] ?? []) - ROAD_VIEW) * 1.3) * w;
      shot = { ...shot, target: [shot.target[0] + follow, shot.target[1], shot.target[2]] };
    }
  }
  // two signature moves, one each: the world tilts when the rules flip, and a dolly zoom when you stop
  const flipA = acts.find((a) => a.type === 'flip'), haltA = acts.find((a) => a.type === 'halt');
  if (flipA) shot = { ...shot, roll: (shot.roll ?? 0) + Math.sin(ramp(t, flipA.t, 1.1) * Math.PI) * 6 * (1 - ramp(t, flipA.t + 0.55, 0.55)) };
  const fogDist = shot.dist;
  if (haltA) shot = dollyZoom(shot, shot.fov * (1 + 0.9 * hit(t, haltA.t, 0.55, 1.4)));
  shot = { ...shot, yaw: shot.yaw + (drift(t, 3, 0.7) * 2 + Math.sin((t - seg.from) * 0.5) * 6) * (1 - back), pitch: shot.pitch + drift(t, 5, 0.7) * 0.8 * (1 - back) };
  const cam = makeCamera(shot);
  const toPx = projector(cam);

  const titleO = cover ? 1 : Math.max(1 - ramp(t, hookEnd - 0.25, 0.25), ramp(t, end - 0.45, 0.35));
  const musicVol = (f: number) => interpolate(f / FPS, [0, 0.5, end - 3, end], [0.0, 0.2, 0.2, 0.28], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sfx: { t: number; f: string; v: number }[] = [{ t: 0, f: 'boom', v: 0.6 }];
  segs.slice(1).forEach((s, i) => { if (s.id !== segs[i].id) sfx.push({ t: s.from, f: 'whoosh', v: 0.35 }); });
  for (const a of acts) if (a.type !== 'walk') sfx.push({ t: a.t, f: ['mark', 'clear'].includes(a.type) ? 'stamp' : a.type === 'halt' ? 'rumble' : a.type === 'flip' ? 'whoosh' : 'pop', v: a.type === 'halt' ? 0.6 : 0.45 });
  const dim = segs.reduce((m, s) => (spec.scenes[s.id].type === 'lines' ? Math.max(m, Math.min(ramp(t, s.from, 0.3), 1 - ramp(t, s.to - 0.05, 0.25))) : m), 0);

  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <PixelStage look={series.look} camera={cam} bg={P.bg} fog={[fogDist * 1.25, fogDist * 3.6]}>
        <TableLight shot={shot} azimuth={-42} elevation={50} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[shot.target[0], 0, 0]} receiveShadow>
          <planeGeometry args={[2400, 2400]} />
          <meshLambertMaterial color={P.bgGlow} />
        </mesh>
        <FloorLines color={P.grid} around={shot.target[0]} />
        {Object.keys(spec.scenes).map((id) => {
          const def = spec.scenes[id]; const S = STATIONS[def.type];
          if (!S || def.type === 'lines') return null;
          // a station reads the cues of its own scene and of any `lines` scene played over it
          const own = [...(byScene[id] ?? []), ...Object.keys(spec.scenes).filter((k) => spec.scenes[k].over === id).flatMap((k) => byScene[k] ?? [])];
          return <S key={id} t={t} acts={own} def={def} ox={origin[id]} series={series} />;
        })}
      </PixelStage>
      <ReadabilityBands bg={P.bg} />
      {dim > 0 && <AbsoluteFill style={{ background: P.bg, opacity: 0.3 * dim }} />}

      {segs.map((s, i) => {
        if (t < s.from - 0.01 || t > s.to + 0.2) return null;
        const prevSame = i > 0 && segs[i - 1].id === s.id, nextSame = i < segs.length - 1 && segs[i + 1].id === s.id;
        const o = Math.min(i === 0 || prevSame ? 1 : ramp(t, s.from + 0.25, 0.25), nextSame ? (t < s.to ? 1 : 0) : 1 - ramp(t, s.to - 0.12, 0.2));
        if (o <= 0) return null;
        const def = spec.scenes[s.id]; const O = OVERLAYS[def.type];
        // the type of a scene is drawn from that scene's cues, plus (papers) the cues given in the scenes it hosts
        const own = def.type === 'lines' ? byScene[s.id] ?? [] : [...(byScene[s.id] ?? []), ...Object.keys(spec.scenes).filter((k) => spec.scenes[k].over === s.id).flatMap((k) => byScene[k] ?? [])];
        return O ? <AbsoluteFill key={i} style={{ opacity: o }}><O t={t} acts={own} def={def} series={series} toPx={toPx} ox={origin[s.id]} /></AbsoluteFill> : null;
      })}
      {acts.filter((a) => a.type === 'callout').map((a, i) => {
        const sg = segs.find((s) => a.t >= s.from - 0.01 && a.t < s.to)!;
        const o = Math.min(life(t, a.t, a.hold ?? 2), 1 - ramp(t, sg.to - 0.15, 0.15)); if (o <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: SAFE.left, top: a.y != null ? Math.min(a.y, 1082) : spec.scenes[sg.id]?.type === 'road' ? 640 : 1082, maxWidth: SAFE_W - 60, opacity: o, transform: `scale(${Math.min(1.06, pop(t, a.t))})`, transformOrigin: 'left center',
            background: a.color ?? P.accent, padding: '12px 20px 8px', boxShadow: '8px 8px 0 rgba(0,0,0,0.5)' }}>
            <Display size={Math.min(56, (a.size ?? 58) * 1.04)} color={P.bg} style={{ textShadow: 'none' }}>{a.text}</Display>
          </div>
        );
      })}

      <SeriesBar series={series} episode={spec.episode} />
      <TitleBlock title={spec.title} whisper={spec.whisper} series={series} opacity={titleO} t={t} top={ZONES.title.top + 6} max={112} />
      {!cover && segs.map((s, i) => {
        if (!s.kicker || t < s.from || t > s.to + 0.2 || titleO > 0.5) return null;
        const o = Math.min(ramp(t, Math.max(s.from, hookEnd), 0.2), 1 - ramp(t, s.to - 0.1, 0.2), 1 - titleO);
        return <Kicker key={i} text={s.kicker} series={series} opacity={o} top={ZONES.title.top + 6} size={84} />;
      })}
      {!cover && <Captions timings={timings!} t={t} accent={P.accent} ink={P.ink} keywords={spec.keywords ?? []} />}
      {spec.source && <Mono size={24} color={P.muted} track={0.06} weight={600} style={{ position: 'absolute', left: SAFE.left, top: ZONES.captions.bottom + 6, width: SAFE.railX - SAFE.left, overflow: 'hidden', textOverflow: 'ellipsis' }}>{spec.source}</Mono>}

      <Grain amount={series.look.grain} />
      {guides && <Guides />}
      {sfx.map((c, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(c.t * FPS))} durationInFrames={FPS * 3} layout="none"><Audio src={staticFile(`sfx/${c.f}.wav`)} volume={c.v} /></Sequence>
      ))}
      <Audio src={staticFile(`episodes/${audioId}/voice.wav`)} />
      <Audio src={staticFile(`episodes/${audioId}/music.wav`)} volume={musicVol} />
    </AbsoluteFill>
  );
};

/** Floor joints: what makes a camera move readable on an otherwise plain surface. */
const FloorLines: React.FC<{ color: string; around: number }> = ({ color, around }) => {
  const geo = useMemo(() => {
    const pos: number[] = [], R = 70, step = 2;
    for (let i = -R; i <= R; i += step) pos.push(i, 0.004, -R, i, 0.004, R, -R, 0.004, i, R, 0.004, i);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); return g;
  }, []);
  return <lineSegments geometry={geo} position={[Math.round(around / 2) * 2, 0, 0]}><lineBasicMaterial color={color} /></lineSegments>;
};
