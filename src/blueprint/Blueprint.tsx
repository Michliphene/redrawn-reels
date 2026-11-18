import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { schedule } from '../lib/schedule';
import type { Timings } from '../lib/types';
import { FPS, H, SAFE, W, ZONES } from '../studio/tokens';
import { seriesOf } from '../studio/series';
import { displayCut, loadFonts, monoCut, serifCut } from '../studio/fonts';
import { drift, ease, hash, hit, life, pop, ramp } from '../studio/motion';
import { Display, Mono } from '../studio/ui/Type';
import { Kicker, SeriesBar, TitleBlock } from '../studio/ui/Hud';
import { Captions } from '../studio/ui/Captions';
import { Guides } from '../studio/ui/Finish';

/**
 * BLUEPRINT — motion-design art direction: one big engineering sheet (deep blue, cyan grid, white line work),
 * a 2D camera that pushes in and out between areas of the sheet, line work that draws itself, and transitions
 * where one element becomes the next. No figures, no 3D: diagrams, counts and type.
 *   scene def: { type: plane|flips, at: [x, y] (centre on the sheet), zoom }
 *   beat `camera`: { x, y, zoom } relative to the scene centre (a push-in on a detail)
 */
export type BlueprintProps = { episodeId: string; spec?: any; timings?: Timings; cover?: boolean; guides?: boolean };
type A = { type: string; t: number; beat: string; [k: string]: any };
type Seg = { id: string; from: number; to: number; kicker?: string };
type Cam = { x: number; y: number; z: number };

export const BP = {
  bg: '#07223D', bg2: '#0B2E52', minor: '#123D66', major: '#1D5A8E', line: '#E3F2FF', cyan: '#7FD6FF',
  amber: '#FFB547', red: '#FF5C61', faint: 'rgba(227,242,255,0.28)',
};
const SAFE_W = SAFE.right - SAFE.left;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerpCam = (a: Cam, b: Cam, p: number): Cam => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), p)) });

/* ------------------------------------------------------------------ line work */
const Draw: React.FC<{ d: string; p: number; w?: number; c?: string; fill?: string; fillO?: number; dash?: string }> = ({ d, p, w = 3, c = BP.line, fill = 'none', fillO = 1, dash }) => {
  if (p <= 0) return null;
  return (
    <g>
      {fill !== 'none' && <path d={d} fill={fill} opacity={fillO * ease.out3(ramp(p, 0.6, 0.4))} />}
      <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round"
        {...(p < 1 ? { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p } : dash ? { strokeDasharray: dash } : {})} />
    </g>
  );
};
const Label: React.FC<{ x: number; y: number; size?: number; c?: string; anchor?: 'start' | 'middle' | 'end'; o?: number; children: React.ReactNode; weight?: number }> = ({ x, y, size = 22, c = BP.cyan, anchor = 'start', o = 1, children, weight = 700 }) => (
  <text x={x} y={y} textAnchor={anchor} opacity={o} style={{ ...monoCut(weight), fontSize: size, letterSpacing: '0.12em', textTransform: 'uppercase' }} fill={c}>{children}</text>
);
const Hatch: React.FC<{ id: string; c: string }> = ({ id, c }) => (
  <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="none" /><line x1="0" y1="0" x2="0" y2="14" stroke={c} strokeWidth="5" /></pattern>
);

/* ------------------------------------------------------------------ the bomber, top view, centred on (0, 0); schematic, not a real type */
const FUSELAGE = 'M0 -330 C 34 -320 40 -260 40 -150 L 38 250 C 36 290 20 312 0 318 C -20 312 -36 290 -38 250 L -40 -150 C -40 -260 -34 -320 0 -330 Z';
const WING = 'M38 -70 L 455 -12 L 455 38 L 38 40 Z M-38 -70 L -455 -12 L -455 38 L -38 40 Z';
const TAIL = 'M36 240 L 175 268 L 175 302 L 36 296 Z M-36 240 L -175 268 L -175 302 L -36 296 Z';
const FIN = 'M-6 230 L 6 230 L 5 318 L -5 318 Z';
const ENGINES: [number, number][] = [[-275, -62], [-140, -78], [140, -78], [275, -62]];
const nacelle = (x: number, y: number) => `M${x - 26} ${y + 40} L ${x - 26} ${y - 22} C ${x - 26} ${y - 48} ${x + 26} ${y - 48} ${x + 26} ${y - 22} L ${x + 26} ${y + 40} Z`;
const COCKPIT = 'M-22 -268 C -18 -300 18 -300 22 -268 L 20 -238 L -20 -238 Z';
/** illustrative hit pattern: wings, fuselage middle, tail — never engines or cockpit */
const HOLES: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let i = 0; out.length < 58 && i < 2000; i++) {
    const r = hash(i * 3.7), u = hash(i * 7.1 + 2), v = hash(i * 11.3 + 5);
    let x = 0, y = 0;
    if (r < 0.55) { const side = u < 0.5 ? -1 : 1; x = side * (60 + v * 380); y = -52 + (x * side - 60) * 0.12 + hash(i * 5.3) * 70; }
    else if (r < 0.8) { x = (u - 0.5) * 60; y = -120 + v * 330; }
    else { const side = u < 0.5 ? -1 : 1; x = side * (45 + v * 125); y = 262 + hash(i * 9.9) * 30; }
    if (ENGINES.some(([ex, ey]) => Math.abs(x - ex) < 42 && Math.abs(y - ey) < 60)) continue;
    out.push([x, y]);
  }
  return out;
})();
type PlaneProps = { t: number; acts: A[]; o?: number };
const one = (acts: A[], type: string, t: number) => acts.find((a) => a.type === type && !(a.until != null && t >= a.until));
const all = (acts: A[], type: string, t: number) => acts.filter((a) => a.type === type && !(a.until != null && t >= a.until));

const Plane: React.FC<PlaneProps> = ({ t, acts }) => {
  const draw = acts.find((a) => a.type === 'draw');
  const d0 = draw ? draw.t : -5;
  const dp = (k: number) => ease.inOut3(ramp(t, d0 + k * 0.25, 1.1));
  const holes = one(acts, 'holes', t);
  const flip = one(acts, 'flip', t);
  const missing = one(acts, 'missing', t);
  const ghost = one(acts, 'ghost', t);
  const armours = all(acts, 'armour', t);
  const holeDim = flip ? 1 - 0.55 * ease.out3(ramp(t, flip.t, 0.5)) : 1;
  const plate = (part: string) => {
    const a = armours.find((x) => x.part === part); if (!a) return 0;
    const on = ease.back(ramp(t, a.t, 0.35), 1.4);
    const off = flip && part !== 'engines' && t >= flip.t ? ease.in3(ramp(t, flip.t, 0.4)) : 0;
    return Math.max(0, on - off);
  };
  return (
    <g>
      <defs><Hatch id="hAmber" c={BP.amber} /><Hatch id="hRed" c={BP.red} /></defs>
      {/* the planes that did not come back: ghosts drifting away, hits where the survivors have none */}
      {ghost && t >= ghost.t && [0, 1].map((k) => {
        const g = ramp(t, ghost.t + k * 0.25, 2.4), gx = (k ? 1 : -1) * (260 + 260 * g), gy = -320 - 380 * g;
        return (
          <g key={k} transform={`translate(${gx} ${gy}) scale(0.42) rotate(${(k ? 1 : -1) * (12 + 30 * g)})`} opacity={(1 - g) * 0.9}>
            {[FUSELAGE, WING, TAIL].map((d, i) => <path key={i} d={d} fill="none" stroke={BP.line} strokeWidth={5} strokeDasharray="14 10" />)}
            {ENGINES.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={20} fill={BP.red} />)}
          </g>
        );
      })}
      <Draw d={WING} p={dp(1)} w={3.5} fill={BP.bg2} />
      <Draw d={TAIL} p={dp(2)} w={3.5} fill={BP.bg2} />
      <Draw d={FUSELAGE} p={dp(0)} w={3.5} fill={BP.bg2} />
      <Draw d={FIN} p={dp(2)} w={3} />
      <Draw d={COCKPIT} p={dp(3)} w={3} />
      {ENGINES.map(([x, y], i) => <Draw key={i} d={nacelle(x, y)} p={dp(2 + i * 0.2)} w={3} fill={BP.bg} />)}
      {/* panel lines and dimension marks: the plan reads as a technical drawing */}
      {[-200, -60, 80, 200].map((y, i) => <Draw key={i} d={`M-40 ${y} L 40 ${y}`} p={dp(3)} w={1.5} c={BP.cyan} />)}
      <Draw d="M-455 120 L 455 120 M-455 108 L -455 132 M455 108 L 455 132" p={dp(4)} w={1.5} c={BP.cyan} />
      <Label x={0} y={152} anchor="middle" size={18} o={dp(4)}>schematic · not to scale</Label>
      {/* armour plates (the obvious answer, then the right one) */}
      {plate('wings') > 0 && <g opacity={Math.min(1, plate('wings'))} transform={`translate(0 ${(1 - Math.min(1, plate('wings'))) * -40})`}><path d={WING} fill="url(#hAmber)" stroke={BP.amber} strokeWidth={4} opacity={0.85} /></g>}
      {plate('body') > 0 && <g opacity={Math.min(1, plate('body'))}><rect x={-38} y={-130} width={76} height={340} fill="url(#hAmber)" stroke={BP.amber} strokeWidth={4} opacity={0.85} /></g>}
      {plate('tail') > 0 && <g opacity={Math.min(1, plate('tail'))}><path d={TAIL} fill="url(#hAmber)" stroke={BP.amber} strokeWidth={4} opacity={0.85} /></g>}
      {/* the holes */}
      {holes && HOLES.map(([x, y], i) => {
        const at = holes.t + (i / HOLES.length) * (holes.dur ?? 1.0);
        if (t < at) return null;
        const s = Math.min(1.3, pop(t, at, 0.22));
        return <g key={i} opacity={holeDim}><circle cx={x} cy={y} r={9 * s} fill={BP.red} /><circle cx={x} cy={y} r={14 * s} fill="none" stroke={BP.red} strokeWidth={1.5} opacity={0.6} /></g>;
      })}
      {/* where the survivors were NOT hit */}
      {missing && (() => {
        const m = ease.out3(ramp(t, missing.t, 0.4)), pulse = 0.6 + 0.4 * Math.sin((t - missing.t) * 6);
        return (
          <g opacity={m}>
            {ENGINES.map(([x, y], i) => <path key={i} d={nacelle(x, y)} fill="url(#hRed)" stroke={BP.red} strokeWidth={5} opacity={pulse} />)}
            <path d={COCKPIT} fill="url(#hRed)" stroke={BP.red} strokeWidth={5} opacity={pulse} />
            <Draw d="M140 -120 L 200 -300" p={ramp(t, missing.t + 0.2, 0.4)} w={2.5} c={BP.red} />
            <Label x={200} y={-318} anchor="middle" size={26} c={BP.red} o={ramp(t, missing.t + 0.5, 0.2)}>no holes here</Label>
          </g>
        );
      })()}
      {plate('engines') > 0 && <g opacity={Math.min(1, plate('engines'))}>{ENGINES.map(([x, y], i) => <path key={i} d={nacelle(x, y)} fill="url(#hAmber)" stroke={BP.amber} strokeWidth={5} />)}</g>}
    </g>
  );
};

/* ------------------------------------------------------------------ 1,024 coin flippers */
const N = 1024, COLS = 32, STEP = 25;
/** a fixed shuffle, so the survivors of each round are scattered, and index 0 of the shuffle wins */
const RANK: number[] = (() => { const ids = Array.from({ length: N }, (_, i) => i); ids.sort((a, b) => hash(a * 1.37 + 9) - hash(b * 1.37 + 9)); const r = new Array(N); ids.forEach((id, k) => { r[id] = k; }); return r; })();
const outRound = (i: number) => { const k = RANK[i]; if (k === 0) return 99; let r = 1; while ((k & ((1 << r) - 1)) === 0) r++; return r; };
const dotXY = (i: number): [number, number] => [((i % COLS) - (COLS - 1) / 2) * STEP, (Math.floor(i / COLS) - (COLS - 1) / 2) * STEP];
const WINNER = RANK.indexOf(0);
export const roundAt = (t: number, acts: A[]) => { const r = acts.find((a) => a.type === 'rounds'); return r ? Math.min(10, Math.floor(Math.max(0, t - r.t) / ((r.dur ?? 4.5) / 10)) + (t >= r.t ? 1 : 0)) : 0; };

const Flips: React.FC<PlaneProps> = ({ t, acts }) => {
  const spawn = one(acts, 'spawn', t), winner = one(acts, 'winner', t), reveal = one(acts, 'reveal', t), fly = one(acts, 'fly', t);
  if (!spawn) return null;
  const round = roundAt(t, acts);
  const rr = acts.find((a) => a.type === 'rounds');
  const per = (rr?.dur ?? 4.5) / 10;
  const [wx, wy] = dotXY(WINNER);
  return (
    <g>
      {Array.from({ length: N }, (_, i) => {
        const [x, y] = dotXY(i);
        const born = spawn.t + (Math.hypot(x, y) / 560) * 0.9;
        if (t < born) return null;
        const s = Math.min(1.25, pop(t, born, 0.25));
        const out = outRound(i);
        const tOut = rr ? rr.t + (out - 1) * per : 1e9;
        const dead = out <= round;
        const fade = dead ? ramp(t, tOut, 0.35) : 0;
        if (i === WINNER) return null;
        const rv = reveal ? ease.out3(ramp(t, reveal.t + (hash(i) * 0.6), 0.4)) : 0;
        return (
          <g key={i}>
            {(!dead || fade < 1) && <circle cx={x} cy={y} r={7.5 * s} fill={dead ? BP.red : BP.line} opacity={1 - fade} />}
            {dead && <circle cx={x} cy={y} r={7} fill="none" stroke={rv > 0 ? BP.cyan : BP.faint} strokeWidth={1.6} opacity={0.35 + 0.65 * rv} />}
          </g>
        );
      })}
      {/* the one who flipped ten heads */}
      {(() => {
        const born = spawn.t;
        if (t < born) return null;
        const w = winner ? ease.back(ramp(t, winner.t, 0.5), 1.5) : 0;
        const f = fly ? ease.inOut3(ramp(t, fly.t, 1.1)) : 0;
        const x = lerp(wx, 0, Math.max(w > 0 ? 1 : 0, 0)) * (1 - f) + 0 * f, y = lerp(wy, 0, w > 0 ? Math.min(1, w) : 0) - f * 900;
        const r = 7.5 + 46 * Math.min(1, w);
        return (
          <g transform={`translate(${winner ? x : wx} ${winner ? y : wy})`}>
            {w > 0 && f < 0.3 && [0, 1, 2].map((k) => <circle key={k} r={r + 20 + k * 22 + Math.sin(t * 4 + k) * 4} fill="none" stroke={BP.amber} strokeWidth={2} opacity={(0.6 - k * 0.18) * (1 - f / 0.3)} />)}
            {f > 0.05
              ? <g transform={`scale(${0.12 + 0.05 * (1 - f)}) rotate(0)`} opacity={1 - ramp(f, 0.8, 0.2)}><path d={FUSELAGE} fill={BP.amber} /><path d={WING} fill={BP.amber} /><path d={TAIL} fill={BP.amber} /></g>
              : <circle r={r} fill={w > 0 ? BP.amber : BP.line} />}
          </g>
        );
      })()}
    </g>
  );
};

const SCENES: Record<string, React.FC<PlaneProps>> = { plane: Plane, flips: Flips };

/* ------------------------------------------------------------------ composition */
export const Blueprint: React.FC<BlueprintProps> = ({ episodeId, spec, timings, cover, guides }) => {
  loadFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const series = seriesOf(spec);
  const end = timings!.duration + 0.5;
  const audioId = spec.audio ?? episodeId;

  const { segs, byScene, acts, keys } = useMemo(() => {
    const sch = schedule(spec, timings!);
    const acts = sch.actions as unknown as A[];
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
    // loop: every state goes back to frame 0 while the title returns
    for (const a of acts) if (a.type !== 'draw') a.until = end - 0.45;
    const byScene: Record<string, A[]> = {};
    for (const a of acts) (byScene[sceneOfBeat[a.beat]] ??= []).push(a);
    // camera keys: scene centre at each scene change, plus beat cameras (push-ins) relative to that centre
    const keys: { t: number; cam: Cam }[] = [];
    let curScene = '';
    spec.beats.forEach((b: any, i: number) => {
      const bt = timings!.beats[i];
      const sid = sceneOfBeat[b.id], def = spec.scenes[sid];
      const base: Cam = { x: def.at[0] + (def.look?.[0] ?? 0), y: def.at[1] + (def.look?.[1] ?? 0), z: def.zoom ?? 1 };
      const c = b.camera ? { x: base.x + (b.camera.x ?? 0), y: base.y + (b.camera.y ?? 0), z: b.camera.zoom ?? base.z } : base;
      if (sid !== curScene || b.camera || (i > 0 && spec.beats[i - 1].camera)) keys.push({ t: i === 0 ? 0 : Math.max(0, bt.start - 0.35), cam: c });
      curScene = sid;
    });
    return { segs, byScene, acts, keys };
  }, [spec, timings, end]);

  // camera: eased travel between keys, with a pull-back in the middle of a long move (the motion-design "push")
  let cam = keys[0].cam;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i]; if (t < k.t) break;
    const prev = cam, d = Math.hypot(k.cam.x - prev.x, k.cam.y - prev.y);
    const p = ease.inOut3(ramp(t, k.t, d > 600 ? 1.1 : 0.8));
    const c = lerpCam(prev, k.cam, p);
    cam = p >= 1 ? k.cam : { ...c, z: c.z * (1 - (d > 600 ? 0.45 : 0.08) * Math.sin(Math.PI * p)) };
  }
  // opening push-in and the loop back to it
  const open = cover ? 0 : 1 - ease.inOut3(ramp(t, 0, 1.2));
  const back = ease.inOut3(ramp(t, end - 0.6, 0.5));
  const z = cam.z * (1 - 0.18 * open - 0.18 * back);
  const rot = (drift(t, 4, 0.5) * 0.6) * (cover ? 0 : 1);
  const cx = W / 2, cy = 845;

  const hookEnd = timings!.beats[0].end;
  const titleO = cover ? 1 : Math.max(1 - ramp(t, hookEnd - 0.25, 0.25), ramp(t, end - 0.45, 0.35));
  const tag = acts.find((a) => a.type === 'tag');
  const memo = acts.find((a) => a.type === 'memo');
  const lines = acts.filter((a) => a.type === 'line');
  const ask = acts.find((a) => a.type === 'ask');
  const interview = acts.find((a) => a.type === 'interview');
  const flipsId = Object.keys(spec.scenes).find((k) => spec.scenes[k].type === 'flips');
  const flipsActs = flipsId ? byScene[flipsId] ?? [] : [];
  const spawn = flipsActs.find((a) => a.type === 'spawn');
  const round = roundAt(t, flipsActs);
  const flipsSeg = segs.filter((s) => s.id === flipsId);
  const inFlips = flipsSeg.some((s) => t >= s.from + 0.3 && t < s.to - 0.1);

  const lineO = lines.length ? Math.min(ramp(t, lines[0].t, 0.25), 1 - ramp(t, lines[0].until ?? 1e9, 0.2), 1 - ramp(t, segs.find((s) => lines[0].t >= s.from && lines[0].t < s.to)!.to - 0.15, 0.2)) : 0;
  const musicVol = (f: number) => interpolate(f / FPS, [0, 0.5, end - 3, end], [0.0, 0.2, 0.2, 0.26], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sfx: { t: number; f: string; v: number }[] = [{ t: 0, f: 'boom', v: 0.5 }];
  keys.slice(1).forEach((k) => sfx.push({ t: k.t, f: 'whoosh', v: 0.25 }));
  for (const a of acts) if (!['draw', 'rounds', 'tag'].includes(a.type)) sfx.push({ t: Math.max(0, a.t), f: ['holes', 'missing', 'winner'].includes(a.type) ? 'stamp' : 'pop', v: 0.4 });
  const r = flipsActs.find((a) => a.type === 'rounds');
  if (r) for (let k = 0; k < 10; k++) sfx.push({ t: r.t + k * ((r.dur ?? 4.5) / 10), f: 'pop', v: 0.22 });

  return (
    <AbsoluteFill style={{ background: BP.bg }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id="gMinor" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke={BP.minor} strokeWidth="1.2" /></pattern>
            <pattern id="gMajor" width="200" height="200" patternUnits="userSpaceOnUse"><rect width="200" height="200" fill="url(#gMinor)" /><path d="M200 0H0V200" fill="none" stroke={BP.major} strokeWidth="2" /></pattern>
            <radialGradient id="vig" cx="50%" cy="44%" r="75%"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
          </defs>
          <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${z}) translate(${-cam.x} ${-cam.y})`}>
            <rect x={-6000} y={-6000} width={14000} height={14000} fill="url(#gMajor)" />
            {Object.keys(spec.scenes).map((id) => {
              const def = spec.scenes[id], S = SCENES[def.type];
              if (!S) return null;
              return <g key={id} transform={`translate(${def.at[0]} ${def.at[1]})`}><S t={t} acts={byScene[id] ?? []} /></g>;
            })}
          </g>
          <rect width={W} height={H} fill="url(#vig)" />
        </svg>
      </div>

      {/* type above the sheet */}
      {tag && life(t, tag.t, tag.hold ?? 5) > 0 && (
        <div style={{ position: 'absolute', left: SAFE.left, top: ZONES.title.top + 130, opacity: life(t, tag.t, tag.hold ?? 5), border: `2px solid ${BP.amber}`, padding: '10px 16px 8px', background: 'rgba(7,34,61,0.85)' }}>
          <Mono size={24} color={BP.amber} track={0.12}>{tag.text}</Mono>
        </div>
      )}
      {memo && life(t, memo.t, memo.hold ?? 4) > 0 && (() => {
        const o = life(t, memo.t, memo.hold ?? 4), chars = Math.floor(ramp(t, memo.t + 0.2, 1.4) * memo.text.length);
        return (
          <div style={{ position: 'absolute', left: SAFE.left, top: 1000, width: SAFE.railX - SAFE.left - 20, opacity: o, transform: `translateY(${(1 - ease.out3(ramp(t, memo.t, 0.4))) * 40}px) rotate(-1deg)`, background: '#F2EAD6', padding: '20px 26px', boxShadow: '10px 12px 0 rgba(0,0,0,0.35)' }}>
            <div style={{ ...monoCut(700), fontSize: 20, letterSpacing: '0.1em', color: '#7A2E2E' }}>{memo.small}</div>
            <div style={{ ...monoCut(600), fontSize: 30, lineHeight: 1.3, color: '#1D1D1D', marginTop: 10, minHeight: 80 }}>{memo.text.slice(0, chars)}<span style={{ opacity: chars < memo.text.length ? 1 : 0 }}>▌</span></div>
          </div>
        );
      })()}
      {spawn && inFlips && (
        <div style={{ position: 'absolute', left: SAFE.left, top: ZONES.title.top + 110, opacity: ramp(t, spawn.t, 0.2) * (1 - lineO) }}>
          <Display size={150} color={round >= 10 ? BP.amber : BP.line}>{(N >> round).toLocaleString('en-US')}</Display>
          <Mono size={26} color={BP.cyan} track={0.12} style={{ marginTop: 10 }}>{round === 0 ? 'people · 10 coin flips each' : round >= 10 ? '10 heads in a row · pure chance' : `round ${round} · heads stay in`}</Mono>
        </div>
      )}
      {interview && life(t, interview.t, interview.hold ?? 2.4) > 0 && (
        <div style={{ position: 'absolute', left: SAFE.left, top: 1020, opacity: life(t, interview.t, interview.hold ?? 2.4), transform: `scale(${Math.min(1.05, pop(t, interview.t))})`, transformOrigin: 'left center', borderLeft: `8px solid ${BP.amber}`, padding: '8px 22px', background: 'rgba(7,34,61,0.9)' }}>
          <Mono size={22} color={BP.cyan} track={0.14}>{interview.small}</Mono>
          <div style={{ ...serifCut, fontSize: 64, color: BP.line, marginTop: 6 }}>{interview.text}</div>
        </div>
      )}
      {lineO > 0 && <AbsoluteFill style={{ background: BP.bg, opacity: 0.55 * lineO }} />}
      {lineO > 0 && (
        <div style={{ position: 'absolute', left: SAFE.left, top: 560, width: SAFE_W, opacity: lineO, display: 'flex', flexDirection: 'column', gap: 34 }}>
          {lines.map((a, i) => (
            <div key={i} style={{ opacity: ramp(t, a.t, 0.15), transform: `translateX(${(1 - ease.out3(ramp(t, a.t, 0.35))) * -60}px)` }}>
              <Mono size={26} color={BP.cyan} track={0.16}>{a.small}</Mono>
              <Display size={a.size ?? 92} color={a.color === 'amber' ? BP.amber : BP.line} style={{ marginTop: 8 }}>{a.text}</Display>
            </div>
          ))}
        </div>
      )}
      {ask && life(t, ask.t, ask.hold ?? 2.4) > 0 && (
        <div style={{ position: 'absolute', left: SAFE.left, top: ZONES.title.top + 20, width: SAFE.railX - SAFE.left, opacity: life(t, ask.t, ask.hold ?? 2.4), display: 'flex', flexWrap: 'wrap', gap: '0 22px' }}>
          {String(ask.text).split(' ').map((w, i) => (
            <span key={i} style={{ ...displayCut(800, 75), fontSize: 96, lineHeight: 1, textTransform: 'uppercase', color: i >= String(ask.text).split(' ').length - 2 ? BP.red : BP.line, display: 'inline-block', opacity: ramp(t, ask.t + i * 0.09, 0.12), transform: `translateY(${(1 - ease.back(ramp(t, ask.t + i * 0.09, 0.3))) * 30}px)` }}>{w}</span>
          ))}
        </div>
      )}

      <SeriesBar series={series} episode={spec.episode} />
      <TitleBlock title={spec.title} whisper={spec.whisper} series={series} opacity={titleO} t={t} top={ZONES.title.top + 6} max={112} />
      {!cover && segs.map((s, i) => {
        if (!s.kicker || t < s.from || t > s.to + 0.2 || titleO > 0.5) return null;
        const o = Math.min(ramp(t, Math.max(s.from + 0.08, hookEnd), 0.18), 1 - ramp(t, s.to - 0.2, 0.16), 1 - titleO);
        return <Kicker key={i} text={s.kicker} series={series} opacity={o} top={ZONES.title.top + 6} size={80} />;
      })}
      {!cover && t < end - 0.5 && <Captions timings={timings!} t={t} accent={BP.amber} ink={BP.line} keywords={spec.keywords ?? []} />}
      {spec.source && <Mono size={24} color={BP.cyan} track={0.06} weight={600} style={{ position: 'absolute', left: SAFE.left, top: ZONES.captions.bottom - 4, width: SAFE.railX - SAFE.left, overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.8 }}>{spec.source}</Mono>}
      {guides && <Guides />}
      {sfx.map((c, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(c.t * FPS))} durationInFrames={FPS * 3} layout="none"><Audio src={staticFile(`sfx/${c.f}.wav`)} volume={c.v} /></Sequence>
      ))}
      <Audio src={staticFile(`episodes/${audioId}/voice.wav`)} />
      <Audio src={staticFile(`episodes/${audioId}/music.wav`)} volume={musicVol} />
    </AbsoluteFill>
  );
};
