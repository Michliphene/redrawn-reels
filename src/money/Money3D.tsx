import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import * as THREE from 'three';
import { schedule } from '../lib/schedule';
import type { Timings } from '../lib/types';
import { FPS, SAFE, ZONES } from '../studio/tokens';
import { seriesOf, type SeriesDef } from '../studio/series';
import { loadFonts } from '../studio/fonts';
import { drift, ease, hit, hop, life, pop, ramp, shade } from '../studio/motion';
import { fitShot, lerpShot, makeCamera, projector, shotAt, type Rect, type Shot, type ShotKey, type Vec3 } from '../studio/three/rig';
import { PixelStage } from '../studio/look/PixelStage';
import { TableLight } from '../studio/three/Light';
import { Pawn } from '../atlas/Units3D';
import { Display, Mono } from '../studio/ui/Type';
import { Kicker, ReadabilityBands, SeriesBar, TitleBlock } from '../studio/ui/Hud';
import { Captions } from '../studio/ui/Captions';
import { Grain, Guides } from '../studio/ui/Finish';
import { PRODUCTS } from './props3d';

/**
 * RECEIPTS, DA v2 ("the counter"): the same cue sheet as the flat engine (`Money.tsx`), staged in ONE
 * continuous 3D set. Each scene of episode.json is a station on a counter; the camera travels from one
 * station to the next instead of cross-fading, and ends where it started (the product) for the loop.
 *   product → the hero object on a plinth      grid   → 100 tiles = $100, filled into stacks
 *   bars    → two columns rising               card   → a card standing on the counter
 *   people  → pawns that light up              lines  → type over the dimmed product
 * Numbers and labels are crisp type above the world; every figure still comes from episode.json.
 */
type A = { type: string; t: number; beat: string; [k: string]: any };
type Seg = { id: string; from: number; to: number; kicker?: string };
type StationProps = { t: number; acts: A[]; def: any; ox: number; from: number; series: SeriesDef };
export type Money3DProps = { episodeId: string; spec?: any; timings?: Timings; cover?: boolean; guides?: boolean };

const GAP = 22;
const box = new THREE.BoxGeometry(1, 1, 1);
const cyl = new THREE.CylinderGeometry(1, 1, 1, 24);
const SAFE_W = SAFE.right - SAFE.left;
const pal = (s: SeriesDef) => s.palette;

/* ------------------------------------------------------------------ stations (3D) */
const PLINTH = 0.34;
const ProductStation: React.FC<StationProps> = ({ t, def, ox, series }) => {
  const P = PRODUCTS[def.art ?? 'hotdog'] ?? PRODUCTS.hotdog;
  return (
    <group position={[ox, 0, 0]}>
      <mesh geometry={cyl} position={[0, PLINTH / 2, 0]} scale={[2.7, PLINTH, 2.7]} receiveShadow castShadow><meshLambertMaterial color={pal(series).surface} /></mesh>
      <mesh geometry={cyl} position={[0, PLINTH + 0.02, 0]} scale={[2.45, 0.04, 2.45]}><meshBasicMaterial color={pal(series).accent} /></mesh>
      <mesh geometry={cyl} position={[0, PLINTH + 0.03, 0]} scale={[2.32, 0.05, 2.32]} receiveShadow><meshLambertMaterial color={shade(pal(series).surface, 0.08)} /></mesh>
      <group position={[0, PLINTH + 0.06 + Math.sin(t * 1.7) * 0.06, 0]} rotation={[0, -0.5 + Math.sin(t * 0.55) * 0.3, 0]}><P.El /></group>
      {/* dressing: a stack of coins and the receipt, so the counter reads as a counter */}
      {[[3.5, 1.5, 5], [4.3, 2.2, 3], [3.2, 2.5, 1]].map(([x, z, n], k) => Array.from({ length: n }, (_, j) => (
        <mesh key={`${k}-${j}`} geometry={cyl} position={[x, 0.07 + j * 0.14, z]} scale={[0.42, 0.12, 0.42]} castShadow><meshLambertMaterial color={j % 2 ? '#E8B93A' : '#F4CE57'} /></mesh>
      )))}
      <group position={[3.9, 0.02, -2.6]} rotation={[0, -0.45, 0]}>
        <mesh geometry={box} scale={[1.5, 0.03, 3.4]} receiveShadow castShadow><meshLambertMaterial color="#EDF1E4" /></mesh>
        {[-1.2, -0.8, -0.4, 0, 0.4, 0.8].map((z, k) => <mesh key={k} geometry={box} position={[k % 2 ? -0.12 : 0, 0.02, z]} scale={[k % 2 ? 0.9 : 1.14, 0.02, 0.12]}><meshBasicMaterial color="#7C8A80" /></mesh>)}
        <mesh geometry={box} position={[0, 0.02, 1.3]} scale={[1.14, 0.02, 0.22]}><meshBasicMaterial color="#1B2A22" /></mesh>
      </group>
    </group>
  );
};

const GridStation: React.FC<StationProps> = ({ t, acts, ox, series }) => {
  const fills = acts.filter((a) => a.type === 'fill' || a.type === 'rest');
  const hint = acts.find((a) => a.type === 'hint');
  const color: (string | null)[] = Array(100).fill(null), born: number[] = Array(100).fill(0), rest: boolean[] = Array(100).fill(false);
  let off = 0;
  for (const a of fills) {
    const n = a.type === 'rest' ? 100 - off : a.count;
    for (let i = 0; i < n; i++) { const at = a.t + (i / n) * (a.type === 'rest' ? 0.12 : a.dur ?? 0.7); if (t >= at) { color[off + i] = a.color; born[off + i] = at; rest[off + i] = a.type === 'rest'; } }
    off += n;
  }
  const blink = hint && t >= hint.t && Math.sin((t - hint.t) * 14) > -0.2;
  return (
    <group position={[ox, 0, 0]}>
      {color.map((c, i) => {
        const x = (i % 10) - 4.5, z = Math.floor(i / 10) - 4.5;
        const up = c ? pop(t, born[i], 0.28) : 0;
        const h = 0.14 + (c ? 0.34 * up : 0) + (rest[i] ? 0.55 + 0.25 * Math.sin((t - born[i]) * 8) : 0) + (c ? hop(t, born[i], 0.3) * 0.5 : 0);
        return (
          <mesh key={i} geometry={box} position={[x, h / 2, z]} scale={[0.84, h, 0.84]} castShadow receiveShadow>
            <meshLambertMaterial color={c ?? (blink ? shade(pal(series).surface, 0.45) : pal(series).surface)} />
          </mesh>
        );
      })}
    </group>
  );
};

const BAR_H = 6.2, BAR_X = 3.0, BAR_W = 2.4;
const barGrow = (t: number, a: A) => ease.out3(ramp(t, a.t, 0.8));
const BarsStation: React.FC<StationProps> = ({ t, acts, def, ox, series }) => (
  <group position={[ox, 0, 0]}>
    <mesh geometry={box} position={[0, 0.06, 0]} scale={[10.4, 0.12, 4.2]} receiveShadow><meshLambertMaterial color={pal(series).surface} /></mesh>
    {acts.filter((a) => a.type === 'bar').map((a, i) => {
      if (t < a.t) return null;
      const h = Math.max(0.05, (a.value / def.max) * BAR_H * barGrow(t, a));
      return (
        <mesh key={i} geometry={box} position={[i === 0 ? -BAR_X : BAR_X, 0.12 + h / 2, 0]} scale={[BAR_W, h, BAR_W]} castShadow receiveShadow>
          <meshLambertMaterial color={a.color} />
        </mesh>
      );
    })}
  </group>
);

const CardStation: React.FC<StationProps> = ({ t, def, ox, from, series }) => {
  const e = ease.back(ramp(t, from + 0.1, 0.6), 1.3);
  return (
    <group position={[ox, 2.05 - (1 - e) * 4, 0]} rotation={[-0.2, 0.22 + Math.sin(t * 0.9) * 0.1, -0.06]}>
      <mesh geometry={box} scale={[5.2, 3.3, 0.12]} castShadow><meshLambertMaterial color={shade(pal(series).surface, 0.06)} /></mesh>
      <mesh geometry={box} position={[0, 1.2, 0.07]} scale={[5.2, 0.9, 0.04]}><meshLambertMaterial color={pal(series).accent} /></mesh>
      <mesh geometry={box} position={[-1.75, -0.35, 0.07]} scale={[1.15, 1.45, 0.04]}><meshLambertMaterial color={shade(pal(series).surface, 0.3)} /></mesh>
      {[0, 1, 2].map((k) => <mesh key={k} geometry={box} position={[0.75 - k * 0.3, 0.2 - k * 0.5, 0.07]} scale={[2.9 - k * 0.6, 0.2, 0.04]}><meshLambertMaterial color={shade(pal(series).surface, 0.42)} /></mesh>)}
    </group>
  );
};

const peoplePos = (i: number, total: number): [number, number] => {
  const cols = total > 10 ? 10 : 5, sp = total > 10 ? 1.25 : 2.0, rows = Math.ceil(total / cols);
  return [((i % cols) - (cols - 1) / 2) * sp, (Math.floor(i / cols) - (rows - 1) / 2) * sp * 1.15];
};
const PeopleStation: React.FC<StationProps> = ({ t, acts, def, ox, series }) => {
  const a = acts.find((x) => x.type === 'light');
  return (
    <group position={[ox, 0, 0]}>
      {Array.from({ length: def.total }, (_, i) => {
        const [x, z] = peoplePos(i, def.total);
        const at = a ? a.t + i * 0.07 : 1e9, on = !!a && i < a.count && t >= at;
        return (
          <group key={i} position={[x, on ? hop(t, at, 0.35) * 0.8 : 0, z]} scale={def.total > 10 ? 1.6 : 2.7}>
            <Pawn c={on ? pal(series).accent : shade(pal(series).surface, 0.18)} />
          </group>
        );
      })}
    </group>
  );
};

const STATIONS: Record<string, React.FC<StationProps>> = { product: ProductStation, grid: GridStation, bars: BarsStation, card: CardStation, people: PeopleStation, lines: () => null };

/* ------------------------------------------------------------------ framing: what the camera must hold, and where */
const boxPts = (ox: number, w: number, y0: number, y1: number, d: number): Vec3[] =>
  [-1, 1].flatMap((sx) => [y0, y1].flatMap((y) => [-1, 1].map((sz) => [ox + (sx * w) / 2, y, (sz * d) / 2] as Vec3)));
function frameOf(def: any, ox: number): { pts: Vec3[]; rect: Rect; base: { pitch: number; yaw: number; fov: number } } {
  const L = SAFE.left + 30, R = SAFE.right - 30;
  switch (def.type) {
    case 'grid': return { pts: boxPts(ox, 9.9, 0, 0.6, 9.9), rect: { left: L, right: R, top: 585, bottom: 935 }, base: { pitch: 34, yaw: -12, fov: 24 } };
    case 'bars': return { pts: boxPts(ox, 10.4, 0, BAR_H + 0.3, 3), rect: { left: L, right: R - 100, top: 660, bottom: 965 }, base: { pitch: 11, yaw: -11, fov: 28 } };
    case 'card': return { pts: boxPts(ox, 5.6, 0.2, 3.9, 1.2), rect: { left: L + 60, right: R - 60, top: 590, bottom: 880 }, base: { pitch: 13, yaw: 16, fov: 26 } };
    case 'people': { const wide = def.total > 10; return { pts: boxPts(ox, wide ? 12.6 : 9.2, 0, wide ? 1.5 : 2.4, wide ? 2 : 2.6), rect: { left: L - 20, right: R + 20, top: 590, bottom: 880 }, base: { pitch: 24, yaw: -10, fov: 26 } }; }
    case 'lines': { const P = PRODUCTS[def.art ?? 'hotdog'] ?? PRODUCTS.hotdog; return { pts: boxPts(ox, P.w, PLINTH, PLINTH + P.h, P.d), rect: { left: L + 40, right: R - 40, top: 700, bottom: 1120 }, base: { pitch: 9, yaw: 28, fov: 34 } }; }
    default: { const P = PRODUCTS[def.art ?? 'hotdog'] ?? PRODUCTS.hotdog; return { pts: boxPts(ox, P.w, PLINTH, PLINTH + P.h, P.d), rect: { left: L + 90, right: R - 90, top: 615, bottom: 850 }, base: { pitch: 19, yaw: -22, fov: 26 } }; }
  }
}

/* ------------------------------------------------------------------ type above the world, one layout per scene type */
const bump = (t: number, acts: A[], target: string) => 1 + acts.filter((a) => a.type === 'pulse' && a.target === target).reduce((m, a) => Math.max(m, hit(t, a.t, 0.1, 0.35) * 0.14), 0);
const Pill: React.FC<{ children: React.ReactNode; bg: string; color: string; size?: number; style?: React.CSSProperties }> = ({ children, bg, color, size = 30, style }) => (
  <Mono size={size} color={color} track={0.16} weight={800} style={{ display: 'inline-block', background: bg, padding: `${size * 0.32}px ${size * 0.5}px ${size * 0.28}px`, textShadow: 'none', boxShadow: '6px 6px 0 rgba(0,0,0,0.45)', ...style }}>{children}</Mono>
);
type OverlayProps = { t: number; acts: A[]; def: any; series: SeriesDef; toPx: (p: Vec3) => [number, number]; ox: number };

const ProductOverlay: React.FC<OverlayProps> = ({ t, acts, def, series }) => (
  <>
    <div style={{ position: 'absolute', left: SAFE.left, top: 870, transform: `scale(${bump(t, acts, 'price')})`, transformOrigin: 'left center' }}>
      <Display size={Math.min(214, (def.priceSize ?? 270) * 0.8)} color={pal(series).accent} style={{ letterSpacing: '-0.02em' }}>{def.price}</Display>
    </div>
    <div style={{ position: 'absolute', left: SAFE.left, top: 1078, transform: `scale(${bump(t, acts, 'tag')})`, transformOrigin: 'left center' }}>
      <Pill bg={pal(series).ink} color={pal(series).bg} size={32}>{def.tag}</Pill>
    </div>
    {acts.filter((a) => a.type === 'ghost').map((a, i) => {
      const o = life(t, a.t, a.hold); if (o <= 0) return null;
      return (
        <div key={i} style={{ position: 'absolute', right: 1080 - (def.ghostSafe ? SAFE.railX : SAFE.right), top: 880, opacity: o, transform: `rotate(5deg) scale(${pop(t, a.t)})`, transformOrigin: 'right center', background: pal(series).danger, padding: '14px 26px 12px', boxShadow: '8px 8px 0 rgba(0,0,0,0.5)', textAlign: 'center' }}>
          <Display size={118} color="#fff" style={{ textShadow: 'none' }}>{a.text}</Display>
          <Mono size={24} color="#fff" track={0.12} style={{ marginTop: 6, textShadow: 'none' }}>{a.label}</Mono>
        </div>
      );
    })}
  </>
);

const GridOverlay: React.FC<OverlayProps> = ({ t, acts, series }) => {
  const fills = acts.filter((a) => a.type === 'fill' || a.type === 'rest');
  const two = fills.length > 3;
  return (
    <>
      {fills.map((a, i) => {
        const o = ramp(t, a.t, 0.25); if (o <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', top: 952 + (two ? i % 3 : i) * 64, left: SAFE.left + (two && i >= 3 ? SAFE_W / 2 : 0), opacity: o, transform: `translateX(${(1 - ease.out3(o)) * -30}px)`, display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 36, height: 36, background: a.color, boxShadow: '4px 4px 0 rgba(0,0,0,0.45)', flex: 'none' }} />
            <Display size={two ? 56 : 66} color={a.color} style={{ minWidth: two ? 120 : 158 }}>{a.amount}</Display>
            <Mono size={two ? 23 : 30} color={pal(series).ink} track={0.06}>{a.label}</Mono>
          </div>
        );
      })}
    </>
  );
};

const BarsOverlay: React.FC<OverlayProps> = ({ t, acts, def, series, toPx, ox }) => (
  <>
    {acts.filter((a) => a.type === 'big').map((a, i) => (
      <div key={i} style={{ position: 'absolute', left: SAFE.left, top: 452, opacity: ramp(t, a.t, 0.15), transform: `scale(${Math.min(1.08, pop(t, a.t))})`, transformOrigin: 'left center', display: 'flex', alignItems: 'baseline', gap: 20 }}>
        <Display size={128} color={pal(series).ink}>{a.value}</Display>
        <Mono size={24} color={pal(series).muted} track={0.1}>{a.label}</Mono>
      </div>
    ))}
    {acts.filter((a) => a.type === 'bar').map((a, i) => {
      if (t < a.t) return null;
      const g = barGrow(t, a), x = ox + (i === 0 ? -BAR_X : BAR_X);
      const top = toPx([x, 0.12 + (a.value / def.max) * BAR_H * g, 0]), foot = toPx([x, 0.12, BAR_W / 2]);
      return (
        <React.Fragment key={i}>
          <div style={{ position: 'absolute', left: top[0], top: top[1] - 104, transform: 'translateX(-50%)', opacity: ramp(t, a.t, 0.2) }}>
            <Display size={86} color={a.color} stroke={8}>{a.prefix ?? '$'}{(a.value * g).toFixed(a.decimals ?? 1)}{a.suffix ?? 'B'}</Display>
          </div>
          <div style={{ position: 'absolute', left: foot[0], top: foot[1] + 20, transform: 'translateX(-50%)', opacity: ramp(t, a.t, 0.2), width: 270, textAlign: 'center' }}>
            <Mono size={22} color={pal(series).ink} track={0.05} style={{ whiteSpace: 'normal', lineHeight: 1.25 }}>{a.label}</Mono>
          </div>
        </React.Fragment>
      );
    })}
  </>
);

const Stat: React.FC<{ a: A; t: number; left: number; top: number; series: SeriesDef; size?: number }> = ({ a, t, left, top, series, size = 132 }) => (
  <div style={{ position: 'absolute', left, top, opacity: ramp(t, a.t, 0.15), transform: `scale(${Math.min(1.1, pop(t, a.t))})`, transformOrigin: 'left center' }}>
    <Display size={size} color={pal(series).accent}>{a.value ?? a.big}</Display>
    <Mono size={27} color={pal(series).ink} track={0.1} style={{ marginTop: 10 }}>{a.label}</Mono>
    {a.sub && <Mono size={20} color={pal(series).muted} track={0.06} weight={600} style={{ marginTop: 8 }}>{a.sub}</Mono>}
  </div>
);
const CardOverlay: React.FC<OverlayProps> = ({ t, acts, def, series, toPx, ox }) => {
  const at = toPx([ox - 0.3, 3.25, 0.2]);
  return (
  <>{def.cardText && (
      <div style={{ position: 'absolute', left: at[0], top: at[1], transform: 'translate(-50%, -50%) rotate(-3deg)', textAlign: 'center' }}>
        <Mono size={34} color={pal(series).bg} track={0.18} weight={800} style={{ textShadow: 'none' }}>{def.cardTitle}</Mono>
      </div>
    )}{acts.filter((a) => a.type === 'stat').map((a, i) => <Stat key={i} a={a} t={t} left={SAFE.left + i * (SAFE_W / 2)} top={900} series={series} />)}</>
  );
};
const PeopleOverlay: React.FC<OverlayProps> = ({ t, acts, series }) => {
  const a = acts.find((x) => x.type === 'light');
  return a ? <Stat a={{ ...a, t: a.t + 0.45 }} t={t} left={SAFE.left} top={890} series={series} size={150} /> : null;
};
const LinesOverlay: React.FC<OverlayProps> = ({ t, acts, series }) => (
  <div style={{ position: 'absolute', left: SAFE.left, top: 590, width: SAFE_W, display: 'flex', flexDirection: 'column', gap: 44 }}>
    {acts.filter((a) => a.type === 'line').map((a, i) => {
      const struck = a.strike ? ease.out3(ramp(t, a.t + 0.5, 0.25)) : 0;
      return (
        <div key={i} style={{ opacity: ramp(t, a.t, 0.15), transform: `scale(${Math.min(1.06, pop(t, a.t))})`, transformOrigin: 'left center' }}>
          <Mono size={28} color={pal(series).muted} track={0.14}>{a.small}</Mono>
          <div style={{ position: 'relative', display: 'inline-block', marginTop: 10 }}>
            <Display size={Math.min(132, (a.size ?? 120) * 0.95)} color={a.color ?? pal(series).ink} style={{ opacity: 1 - struck * 0.45 }}>{a.text}</Display>
            {a.strike && <div style={{ position: 'absolute', left: -8, top: '46%', height: 13, width: `calc(${struck * 100}% + ${struck * 16}px)`, background: pal(series).danger, boxShadow: '4px 4px 0 rgba(0,0,0,0.4)' }} />}
          </div>
        </div>
      );
    })}
  </div>
);
const OVERLAYS: Record<string, React.FC<OverlayProps>> = { product: ProductOverlay, grid: GridOverlay, bars: BarsOverlay, card: CardOverlay, people: PeopleOverlay, lines: LinesOverlay };

/* ------------------------------------------------------------------ composition */
export const Money3D: React.FC<Money3DProps> = ({ episodeId, spec, timings, cover, guides }) => {
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
    // one station per scene along the counter; `lines` scenes are played over the product
    const ids = Object.keys(spec.scenes);
    const hero = ids.find((id) => spec.scenes[id].type === 'product');
    const origin: Record<string, number> = {}; let slot = 0;
    for (const id of ids) if (spec.scenes[id].type !== 'lines' || !hero) origin[id] = slot++ * GAP;
    for (const id of ids) if (!(id in origin)) origin[id] = origin[hero!];
    const shotOf = (id: string): Shot => {
      const def = spec.scenes[id];
      const f = frameOf(def.type === 'lines' && hero ? { ...def, art: spec.scenes[hero].art } : def, origin[id]);
      return fitShot(f.pts, { ...f.base, ...(def.camera ?? {}) }, { ...f.rect, ...(def.rect ?? {}) });
    };
    const keys: ShotKey[] = [];
    segs.forEach((s, i) => { if (i === 0 || segs[i - 1].id !== s.id) keys.push({ t: Math.max(0, s.from - (i ? 0.3 : 0)), dur: 0.95, shot: shotOf(s.id) }); });
    return { segs, byScene, acts, origin, keys };
  }, [spec, timings, end]);

  const hookEnd = timings!.beats[0].end;
  const seg = segs.find((s) => t >= s.from - 0.01 && t < s.to) ?? segs[segs.length - 1];
  const segType = spec.scenes[seg.id].type as string;

  // camera: station to station, a crane-in on the hook, a slow orbit around whatever is on stage, back to frame 0 for the loop
  const crane = (s: Shot, k: number): Shot => ({ ...s, pitch: s.pitch - 9 * k, yaw: s.yaw + 26 * k, dist: s.dist * (1 - 0.34 * k) });
  const open = crane(keys[0].shot, 1);
  let shot = crane(shotAt(t, keys), cover ? 0 : 1 - ease.inOut3(ramp(t, 0.1, 1.5)));
  const back = ease.inOut3(ramp(t, end - 0.62, 0.5));
  if (back > 0) shot = lerpShot(shot, open, back);
  const orbit = segType === 'grid' ? 3 : 7;
  shot = { ...shot, yaw: shot.yaw + (drift(t, 3, 0.7) * 2 + Math.sin((t - seg.from) * 0.5) * orbit) * (1 - back), pitch: shot.pitch + drift(t, 5, 0.7) * 0.8 * (1 - back) };
  const cam = makeCamera(shot);
  const toPx = projector(cam);

  const titleO = cover ? 1 : Math.max(1 - ramp(t, hookEnd - 0.25, 0.25), ramp(t, end - 0.45, 0.35));
  const musicVol = (f: number) => interpolate(f / FPS, [0, 0.5, end - 3, end], [0.0, 0.2, 0.2, 0.28], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sfx: { t: number; f: string; v: number }[] = [{ t: 0, f: 'boom', v: 0.6 }];
  segs.slice(1).forEach((s, i) => { if (s.id !== segs[i].id) sfx.push({ t: s.from, f: 'whoosh', v: 0.35 }); });
  for (const a of acts) if (a.type !== 'pulse' && a.type !== 'hint') sfx.push({ t: a.t, f: a.type === 'ghost' || a.type === 'rest' ? 'stamp' : 'pop', v: a.type === 'rest' ? 0.7 : 0.45 });
  const firstFrom = (id: string) => segs.find((x) => x.id === id)?.from ?? 0;
  const dim = segs.reduce((m, s) => (spec.scenes[s.id].type === 'lines' ? Math.max(m, Math.min(ramp(t, s.from, 0.3), 1 - ramp(t, s.to - 0.05, 0.25))) : m), 0);

  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <PixelStage look={series.look} camera={cam} bg={P.bg} fog={[shot.dist * 1.25, shot.dist * 3.6]}>
        <TableLight shot={shot} azimuth={-42} elevation={50} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[shot.target[0], 0, 0]} receiveShadow>
          <planeGeometry args={[900, 900]} />
          <meshLambertMaterial color={P.bgGlow} />
        </mesh>
        <CounterLines color={P.grid} around={shot.target[0]} />
        {Object.keys(spec.scenes).map((id) => {
          const def = spec.scenes[id]; const S = STATIONS[def.type];
          if (!S || def.type === 'lines') return null;
          return <S key={id} t={t} acts={byScene[id] ?? []} def={def} ox={origin[id]} from={firstFrom(id)} series={series} />;
        })}
      </PixelStage>
      <ReadabilityBands bg={P.bg} />
      {dim > 0 && <AbsoluteFill style={{ background: P.bg, opacity: 0.62 * dim }} />}

      {/* one scene's type at a time; it leaves with its scene */}
      {segs.map((s, i) => {
        if (t < s.from - 0.01 || t > s.to + 0.2) return null;
        const prevSame = i > 0 && segs[i - 1].id === s.id, nextSame = i < segs.length - 1 && segs[i + 1].id === s.id;
        const o = Math.min(i === 0 || prevSame ? 1 : ramp(t, s.from + 0.25, 0.25), nextSame ? (t < s.to ? 1 : 0) : 1 - ramp(t, s.to - 0.12, 0.2));
        if (o <= 0) return null;
        const def = spec.scenes[s.id]; const O = OVERLAYS[def.type];
        return O ? <AbsoluteFill key={i} style={{ opacity: o }}><O t={t} acts={byScene[s.id] ?? []} def={def} series={series} toPx={toPx} ox={origin[s.id]} /></AbsoluteFill> : null;
      })}
      {acts.filter((a) => a.type === 'callout').map((a, i) => {
        const sg = segs.find((s) => a.t >= s.from - 0.01 && a.t < s.to)!;
        const o = Math.min(life(t, a.t, a.hold ?? 2), 1 - ramp(t, sg.to - 0.15, 0.15)); if (o <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: SAFE.left, top: a.y != null ? Math.min(a.y, 1082) : 1082, maxWidth: SAFE_W - 60, opacity: o, transform: `scale(${Math.min(1.06, pop(t, a.t))})`, transformOrigin: 'left center',
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
      {/* the source never leaves the screen: it is the promise of the channel */}
      <Mono size={20} color={P.muted} track={0.06} weight={600} style={{ position: 'absolute', left: SAFE.left, top: ZONES.captions.bottom + 6, width: SAFE.railX - SAFE.left, overflow: 'hidden', textOverflow: 'ellipsis' }}>{spec.source}</Mono>

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

/** Tile joints of the counter: they are what makes a camera move readable on an otherwise plain surface. */
const CounterLines: React.FC<{ color: string; around: number }> = ({ color, around }) => {
  const geo = useMemo(() => {
    const pos: number[] = [], R = 70, step = 2;
    for (let i = -R; i <= R; i += step) pos.push(i, 0.004, -R, i, 0.004, R, -R, 0.004, i, R, 0.004, i);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); return g;
  }, []);
  return <lineSegments geometry={geo} position={[Math.round(around / 2) * 2, 0, 0]}><lineBasicMaterial color={color} /></lineSegments>;
};
