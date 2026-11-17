import React, { createContext, useContext } from 'react';
import { hash } from '../studio/motion';
import { handCut } from '../studio/fonts';

/**
 * The notebook kit: everything is drawn in ballpoint on squared paper, and every line "boils" (it is redrawn
 * with a new tremble every few frames, like a flip-book). All of it is a pure function of the frame.
 */
export const C = {
  paper: '#F7F2E4', grid: '#D3E3EE', margin: '#E98C93', ink: '#1E2A5A', pencil: '#6A6A80', red: '#D9344A',
  hl: '#FFE04A', mint: '#6FDDB8', tape: 'rgba(233,212,160,0.88)', note: '#FFE77A', paperBall: '#FBFAF5',
};

/** boil bucket: the tremble changes every 3 frames (10 fps line boil on a 30 fps film) */
export const Boil = createContext(0);
export const useBoil = () => useContext(Boil);
const J = (seed: number, b: number, amp: number) => (hash(seed * 12.9898 + b * 78.233) - 0.5) * 2 * amp;
export type Pt = [number, number];

export function wpath(pts: Pt[], seed: number, b: number, amp = 2, close = false): string {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${(p[0] + J(seed + i * 3.1, b, amp)).toFixed(1)} ${(p[1] + J(seed + i * 5.7 + 1, b, amp)).toFixed(1)}`).join(' ') + (close ? ' Z' : '');
}
export function circlePts(cx: number, cy: number, r: number, n = 16): Pt[] {
  return Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r] as Pt);
}
/** points along a straight segment, so a long line trembles along its length too */
export function seg(a: Pt, b: Pt, n = 6): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n] as Pt);
}

type LineProps = { pts: Pt[]; seed?: number; w?: number; c?: string; fill?: string; close?: boolean; amp?: number; dash?: string; draw?: number; opacity?: number };
/** a ballpoint stroke; `draw` 0→1 writes it on */
export const Ink: React.FC<LineProps> = ({ pts, seed = 1, w = 7, c = C.ink, fill = 'none', close = false, amp = 1.8, dash, draw, opacity }) => {
  const b = useBoil();
  const d = wpath(pts, seed, b, amp, close);
  const drawOn = draw != null && draw < 1;
  if (draw != null && draw <= 0) return null;
  return (
    <path d={d} fill={fill} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={opacity}
      {...(drawOn ? { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw! } : dash ? { strokeDasharray: dash } : {})} />
  );
};
export const Circle: React.FC<{ cx: number; cy: number; r: number; seed?: number; w?: number; c?: string; fill?: string; draw?: number }> = ({ cx, cy, r, seed = 3, w = 7, c = C.ink, fill = 'none', draw }) => (
  <Ink pts={circlePts(cx, cy, r, Math.max(12, Math.round(r / 3)))} seed={seed} w={w} c={c} fill={fill} close draw={draw} amp={Math.min(2, r * 0.06)} />
);

/** handwriting on the page */
export const Hand: React.FC<{ x: number; y: number; size?: number; c?: string; anchor?: 'start' | 'middle' | 'end'; rot?: number; children: React.ReactNode; opacity?: number; hl?: string }> =
  ({ x, y, size = 54, c = C.ink, anchor = 'middle', rot = 0, children, opacity = 1, hl }) => {
    const b = useBoil();
    const r = rot + J(x + y, b, 0.6);
    return (
      <g transform={`rotate(${r} ${x} ${y})`} opacity={opacity}>
        {hl && (() => { const w = String(children).length * size * 0.37 + 22, x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w + 11 : x - 11; return <rect x={x0} y={y - size * 0.5} width={w} height={size * 0.58} fill={hl} opacity={0.85} rx={6} />; })()}
        <text x={x} y={y} textAnchor={anchor} style={{ ...handCut, fontSize: size }} fill={c}>{children}</text>
      </g>
    );
  };

/* ------------------------------------------------------------------ the little guy */
export type Pose = { lean?: number; armL?: number; armR?: number; legL?: number; legR?: number; rot?: number; hip?: number; tilt?: number; mood?: 'smile' | 'sad' | 'o' | 'flat' };
export type Joints = { hip: Pt; sh: Pt; head: Pt; handL: Pt; handR: Pt; footL: Pt; footR: Pt; R: number };
const LEG = 58, BODY = 64, ARM = 50, HEAD = 24;
const rad = (d: number) => (d * Math.PI) / 180;
export function joints(p: Pose): Joints {
  const hip: Pt = [0, -LEG + (p.hip ?? 0)];
  const lean = rad(p.lean ?? 0);
  const sh: Pt = [hip[0] + Math.sin(lean) * BODY, hip[1] - Math.cos(lean) * BODY];
  const head: Pt = [sh[0] + Math.sin(lean) * (HEAD + 9), sh[1] - Math.cos(lean) * (HEAD + 9)];
  const limb = (o: Pt, a: number, L: number): Pt => [o[0] + Math.sin(rad(a)) * L, o[1] + Math.cos(rad(a)) * L];
  return { hip, sh, head, handL: limb(sh, p.armL ?? -12, ARM), handR: limb(sh, p.armR ?? 12, ARM), footL: limb(hip, p.legL ?? -8, LEG), footR: limb(hip, p.legR ?? 8, LEG), R: HEAD };
}

/**
 * A stick figure, feet at (x, y), facing right (dir 1) or left (-1). `hero` gets the highlighter head.
 * `children(j)` draws props in the guy's own frame (so a sign stays in his hand whatever he does).
 */
export const Guy: React.FC<{ x: number; y: number; s?: number; pose: Pose; dir?: 1 | -1; hero?: boolean; c?: string; seed?: number; opacity?: number; children?: (j: Joints) => React.ReactNode; behind?: (j: Joints) => React.ReactNode }> =
  ({ x, y, s = 1, pose, dir = 1, hero, c = C.ink, seed = 7, opacity = 1, children, behind }) => {
    const j = joints(pose);
    const [hx, hy] = j.head;
    const tilt = pose.tilt ?? 0;
    const mood = pose.mood ?? 'flat';
    return (
      <g transform={`translate(${x} ${y}) scale(${dir * s} ${s}) rotate(${pose.rot ?? 0})`} opacity={opacity}>
        {behind?.(j)}
        <Ink pts={[j.footL, j.hip, j.footR]} seed={seed} c={c} w={8} />
        <Ink pts={seg(j.hip, j.sh, 3)} seed={seed + 1} c={c} w={8} />
        <Ink pts={[j.handL, j.sh, j.handR]} seed={seed + 2} c={c} w={8} />
        <g transform={`rotate(${tilt} ${hx} ${hy})`}>
          <Circle cx={hx} cy={hy} r={HEAD} seed={seed + 3} c={c} w={7} fill={hero ? C.hl : C.paper} />
          <circle cx={hx + 5} cy={hy - 4} r={3.4} fill={c} />
          <circle cx={hx + 15} cy={hy - 4} r={3.4} fill={c} />
          {mood === 'smile' && <Ink pts={[[hx + 2, hy + 7], [hx + 9, hy + 12], [hx + 17, hy + 7]]} seed={seed + 4} c={c} w={3.5} amp={0.6} />}
          {mood === 'sad' && <Ink pts={[[hx + 2, hy + 12], [hx + 9, hy + 7], [hx + 17, hy + 12]]} seed={seed + 4} c={c} w={3.5} amp={0.6} />}
          {mood === 'o' && <circle cx={hx + 10} cy={hy + 10} r={4} fill="none" stroke={c} strokeWidth={3} />}
          {mood === 'flat' && <Ink pts={[[hx + 4, hy + 10], [hx + 16, hy + 10]]} seed={seed + 4} c={c} w={3.5} amp={0.5} />}
        </g>
        {children?.(j)}
      </g>
    );
  };

/** pose library — all pure functions of time / phase */
export const POSE = {
  stand: (t: number, k = 0): Pose => ({ armL: -10 + Math.sin(t * 1.9 + k) * 4, armR: 12 + Math.sin(t * 1.9 + k + 1) * 4, legL: -7, legR: 7 }),
  walk: (ph: number): Pose => ({ legL: 27 * Math.sin(ph), legR: -27 * Math.sin(ph), armL: -26 * Math.sin(ph), armR: 26 * Math.sin(ph), lean: 4 }),
  run: (ph: number): Pose => ({ legL: 44 * Math.sin(ph), legR: -44 * Math.sin(ph), armL: -58 * Math.sin(ph) + 20, armR: 58 * Math.sin(ph) + 20, lean: 15, mood: 'o' }),
  cheer: (t: number): Pose => ({ armL: -155 + 12 * Math.sin(t * 13), armR: 155 - 12 * Math.sin(t * 13), legL: -13, legR: 13, mood: 'smile' }),
  shrug: (): Pose => ({ armL: -62, armR: 62, legL: -7, legR: 7, tilt: 14, mood: 'flat' }),
  sit: (): Pose => ({ hip: 30, legL: 84, legR: 74, armL: 26, armR: 40, lean: -6, mood: 'sad' }),
  desk: (slump: number): Pose => ({ hip: 22, legL: 60, legR: 52, armL: 70 - slump * 30, armR: 80 - slump * 30, lean: 8 + slump * 26, tilt: slump * 18, mood: slump > 0.4 ? 'sad' : 'flat' }),
};
export const bob = (ph: number, a = 6) => -Math.abs(Math.sin(ph)) * a;

/* ------------------------------------------------------------------ props */
export const Plaster: React.FC<{ x: number; y: number; rot?: number; s?: number; opacity?: number }> = ({ x, y, rot = 0, s = 1, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
    <rect x={-17} y={-7} width={34} height={14} rx={6} fill="#F2C49A" stroke={C.ink} strokeWidth={2.5} />
    <rect x={-6} y={-7} width={12} height={14} fill="#E8AF80" stroke={C.ink} strokeWidth={2} />
  </g>
);
export const Bulb: React.FC<{ x: number; y: number; s?: number; lit?: boolean; seed?: number; opacity?: number }> = ({ x, y, s = 1, lit = true, seed = 11, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    {lit && [0, 1, 2, 3, 4].map((k) => { const a = rad(-160 + k * 35); return <Ink key={k} pts={[[Math.cos(a) * 30, Math.sin(a) * 30 - 4], [Math.cos(a) * 42, Math.sin(a) * 42 - 4]]} seed={seed + k} w={4} c={C.red} amp={0.6} />; })}
    <Circle cx={0} cy={-4} r={20} seed={seed} w={4.5} fill={lit ? C.hl : C.paper} />
    <Ink pts={[[-9, 15], [9, 15], [9, 25], [-9, 25]]} seed={seed + 9} w={4.5} fill={C.paper} close amp={0.6} />
  </g>
);
export const PaperBall: React.FC<{ x: number; y: number; r?: number; seed?: number; c?: string }> = ({ x, y, r = 20, seed = 5, c = C.ink }) => (
  <g>
    <Circle cx={x} cy={y} r={r} seed={seed} w={4} c={c} fill={C.paperBall} />
    <Ink pts={[[x - r * 0.5, y - r * 0.2], [x - r * 0.05, y + r * 0.25], [x + r * 0.45, y - r * 0.15]]} seed={seed + 2} w={2.6} c={c} amp={0.8} />
    <Ink pts={[[x - r * 0.2, y - r * 0.6], [x + r * 0.1, y - r * 0.15]]} seed={seed + 4} w={2.6} c={c} amp={0.8} />
  </g>
);
/** an unfolded note: what a crumpled failure becomes when you keep going */
export const Note: React.FC<{ x: number; y: number; s?: number; rot?: number; seed?: number }> = ({ x, y, s = 1, rot = 0, seed = 21 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <Ink pts={[[-22, -26], [22, -26], [22, 26], [-22, 26]]} seed={seed} w={3.5} fill="#FFFFFF" close amp={0.8} />
    {[-12, -2, 8].map((yy, k) => <Ink key={k} pts={[[-13, yy], [13 - k * 4, yy]]} seed={seed + k + 1} w={2.6} c={C.pencil} amp={0.5} />)}
    <circle cx={12} cy={17} r={6} fill={C.mint} stroke={C.ink} strokeWidth={2} />
  </g>
);
export const Coin: React.FC<{ x: number; y: number; seed?: number }> = ({ x, y, seed = 31 }) => (
  <g>
    <Circle cx={x} cy={y} r={17} seed={seed} w={4} fill={C.hl} />
    <text x={x} y={y + 9} textAnchor="middle" style={{ ...handCut, fontSize: 28 }} fill={C.ink}>$</text>
  </g>
);
export const Check: React.FC<{ x: number; y: number; s?: number; c?: string; draw?: number; seed?: number; w?: number }> = ({ x, y, s = 1, c = C.mint, draw, seed = 41, w = 12 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><Ink pts={[[-30, 0], [-8, 24], [34, -30]]} seed={seed} w={w} c={c} draw={draw} amp={1} /></g>
);
export const Cross: React.FC<{ x: number; y: number; s?: number; c?: string; draw?: number; seed?: number; w?: number }> = ({ x, y, s = 1, c = C.red, draw = 1, seed = 51, w = 9 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Ink pts={[[-20, -20], [20, 20]]} seed={seed} w={w} c={c} draw={Math.min(1, draw * 2)} amp={1} />
    <Ink pts={[[20, -20], [-20, 20]]} seed={seed + 1} w={w} c={c} draw={Math.max(0, draw * 2 - 1)} amp={1} />
  </g>
);
/** sticky note: the doodle world's callout */
export const Sticky: React.FC<{ x: number; y: number; w?: number; text: string; rot?: number; s?: number; opacity?: number }> = ({ x, y, w = 360, text, rot = -3, s = 1, opacity = 1 }) => {
  const words = text.split(' '), lines: string[] = [];
  for (const wd of words) { const l = lines[lines.length - 1]; if (l && (l + ' ' + wd).length <= 15) lines[lines.length - 1] = l + ' ' + wd; else lines.push(wd); }
  const h = 60 + lines.length * 62;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
      <rect x={6} y={8} width={w} height={h} fill="rgba(0,0,0,0.12)" />
      <rect x={0} y={0} width={w} height={h} fill={C.note} />
      <rect x={w / 2 - 50} y={-14} width={100} height={30} fill={C.tape} transform={`rotate(4 ${w / 2} 0)`} />
      {lines.map((l, i) => <text key={i} x={28} y={78 + i * 62} style={{ ...handCut, fontSize: 64 }} fill={C.ink}>{l}</text>)}
    </g>
  );
};
