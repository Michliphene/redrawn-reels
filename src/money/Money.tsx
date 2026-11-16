import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate, delayRender, continueRender } from 'remotion';
import { schedule } from '../lib/schedule';
import { FPS } from '../lib/theme';
import { Captions } from '../components/Captions';
import { Fx } from '../components/Fx';
import type { Timings } from '../lib/types';

/**
 * RECEIPTS — "where the money goes" reels. Second engine of this repo (the first is the map engine, Episode.tsx).
 * Lessons from REDRAWN baked in:
 *  - fixed screen zones, so cues can never overlap:  TOP 60–330 (badge, title/kicker) · STAGE 350–1340 (one scene)
 *    · CAPTIONS 1390–1600 · SOURCE 1660–1710. A scene only draws inside the stage.
 *  - no photos, no logos: everything is drawn here (no licences to clear, no rate-limited downloads).
 *  - every figure on screen comes from episode.json, which must mirror SOURCES.md.
 */
export const C = {
  bg: '#06120E', glow: '#103326', text: '#F3F6EE', muted: '#8FA89B', accent: '#C8F53C',
  cost: '#FF6B5E', ops: '#FFB648', cell: '#1C3B2F', cellStroke: '#2B5745', card: '#0F2A20',
};
const font = 'Montserrat';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const out3 = (x: number) => 1 - Math.pow(1 - x, 3);
const back = (x: number) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
/** 0→1 pop-in starting at t0 */
const pop = (t: number, t0: number, d = 0.35) => (t < t0 ? 0 : back(Math.min(1, (t - t0) / d)));
const fadeIn = (t: number, t0: number, d = 0.25) => interpolate(t, [t0, t0 + d], [0, 1], clamp);
/** visible window of a held element (hold undefined = stays) */
const life = (t: number, t0: number, hold?: number) => (hold == null ? fadeIn(t, t0, 0.15) : interpolate(t, [t0, t0 + 0.15, t0 + hold, t0 + hold + 0.25], [0, 1, 1, 0], clamp));

type A = { type: string; t: number; beat: string; [k: string]: any };
type SceneProps = { t: number; acts: A[]; def: any };

const fontWait = delayRender('Montserrat');
new FontFace('Montserrat', `url(${staticFile('fonts/Montserrat-VF.ttf')})`, { weight: '100 900' }).load()
  .then((f) => { document.fonts.add(f); continueRender(fontWait); });

/* ---------- drawn art (original, no third-party asset) ---------- */
const HotDog: React.FC<{ w: number }> = ({ w }) => (
  <svg width={w} height={w * 0.5} viewBox="0 0 600 300">
    <defs>
      <linearGradient id="bun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2C078" /><stop offset="1" stopColor="#C98A3C" /></linearGradient>
      <linearGradient id="dog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E0603F" /><stop offset="1" stopColor="#9E2F1E" /></linearGradient>
    </defs>
    <ellipse cx="300" cy="278" rx="250" ry="14" fill="rgba(0,0,0,0.35)" />
    <rect x="50" y="70" width="500" height="150" rx="75" fill="#B87A30" />
    <rect x="14" y="92" width="572" height="104" rx="52" fill="url(#dog)" />
    <rect x="40" y="104" width="420" height="16" rx="8" fill="rgba(255,255,255,0.22)" />
    <path d="M70 142 q30 -44 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t40 0" fill="none" stroke="#FFD23F" strokeWidth="20" strokeLinecap="round" />
    <path d="M50 170 h500 a75 75 0 0 1 -75 80 h-350 a75 75 0 0 1 -75 -80z" fill="url(#bun)" />
    <path d="M90 200 h300" stroke="rgba(255,255,255,0.25)" strokeWidth="10" strokeLinecap="round" />
  </svg>
);
const Burger: React.FC<{ w: number }> = ({ w }) => (
  <svg width={w} height={w * 0.72} viewBox="0 0 500 360">
    <defs><linearGradient id="bt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F4B860" /><stop offset="1" stopColor="#D08A35" /></linearGradient></defs>
    <ellipse cx="250" cy="346" rx="200" ry="12" fill="rgba(0,0,0,0.35)" />
    <path d="M60 290 h380 a20 20 0 0 1 -20 40 h-340 a20 20 0 0 1 -20 -40z" fill="#D08A35" />
    <rect x="48" y="244" width="404" height="50" rx="25" fill="#6B3A22" />
    <path d="M40 232 l40 22 l40 -18 l40 22 l40 -18 l40 22 l40 -18 l40 22 l40 -18 l40 22 l40 -18 v-14 h-400z" fill="#FFC93C" />
    <path d="M44 210 q30 26 60 4 t60 4 t60 4 t60 4 t60 4 t60 4 t52 0 v14 h-412z" fill="#6CC04A" />
    <rect x="70" y="196" width="360" height="18" rx="9" fill="#E5463B" />
    <path d="M50 196 C50 70 140 30 250 30 C360 30 450 70 450 196 z" fill="url(#bt)" />
    {[[150, 90], [210, 70], [280, 72], [340, 95], [190, 125], [260, 120], [320, 140], [130, 150]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="9" ry="5" fill="#FFF3D6" transform={`rotate(${i * 20} ${x} ${y})`} />)}
  </svg>
);
const TV: React.FC<{ w: number }> = ({ w }) => (
  <svg width={w} height={w * 0.62} viewBox="0 0 600 372">
    <ellipse cx="300" cy="360" rx="190" ry="10" fill="rgba(0,0,0,0.35)" />
    <rect x="270" y="300" width="60" height="44" fill="#2B3A33" />
    <rect x="200" y="338" width="200" height="14" rx="7" fill="#2B3A33" />
    <rect x="10" y="10" width="580" height="300" rx="26" fill="#15201B" stroke="#3B4D44" strokeWidth="8" />
    <rect x="34" y="34" width="532" height="252" rx="14" fill="#E5463B" />
    <rect x="34" y="34" width="532" height="252" rx="14" fill="url(#scr)" />
    <defs><linearGradient id="scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="rgba(255,255,255,0.18)" /><stop offset="0.6" stopColor="rgba(0,0,0,0)" /><stop offset="1" stopColor="rgba(0,0,0,0.35)" /></linearGradient></defs>
    <circle cx="300" cy="160" r="70" fill="rgba(255,255,255,0.92)" />
    <path d="M280 122 L340 160 L280 198 Z" fill="#E5463B" />
    <rect x="70" y="252" width="460" height="10" rx="5" fill="rgba(255,255,255,0.35)" />
    <rect x="70" y="252" width="190" height="10" rx="5" fill="#fff" />
  </svg>
);
const Person: React.FC<{ on: number; s: number }> = ({ on, s }) => (
  <svg width={s} height={s * 1.25} viewBox="0 0 100 125" style={{ transform: `scale(${0.9 + 0.1 * on})` }}>
    <circle cx="50" cy="28" r="22" fill={on > 0.5 ? C.accent : C.cell} stroke={C.cellStroke} strokeWidth="3" />
    <path d="M10 122 q0 -62 40 -62 q40 0 40 62z" fill={on > 0.5 ? C.accent : C.cell} stroke={C.cellStroke} strokeWidth="3" />
  </svg>
);

/* ---------- scenes (each draws only inside the stage: y 350–1340) ---------- */
const bump = (t: number, acts: A[], target: string) => 1 + acts.filter((a) => a.type === 'pulse' && a.target === target).reduce((m, a) => Math.max(m, interpolate(t, [a.t, a.t + 0.12, a.t + 0.45], [0, 0.14, 0], clamp)), 0);
const Product: React.FC<SceneProps> = ({ t, acts, def }) => (
  <>
    <div style={{ position: 'absolute', top: 400, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `rotate(-6deg) translateY(${Math.sin(t * 2.2) * 8}px)` }}>{def.art === 'tv' ? <TV w={640} /> : def.art === 'burger' ? <Burger w={520} /> : <HotDog w={720} />}</div>
    <div style={{ position: 'absolute', top: 800, left: 0, right: 0, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: def.priceSize ?? 270, lineHeight: 1, color: C.accent, textShadow: '0 10px 40px rgba(0,0,0,0.6)', transform: `scale(${bump(t, acts, 'price')})` }}>{def.price}</div>
    <div style={{ position: 'absolute', top: 1080, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${bump(t, acts, 'tag')})` }}>
      <div style={{ fontFamily: font, fontWeight: 900, fontSize: 54, letterSpacing: 6, color: C.bg, background: C.text, padding: '10px 34px', borderRadius: 14 }}>{def.tag}</div>
    </div>
    {acts.filter((a) => a.type === 'ghost').map((a, i) => {
      const o = life(t, a.t, a.hold); if (o <= 0) return null;
      return (
        <div key={i} style={{ position: 'absolute', top: 380, right: 50, opacity: o, transform: `rotate(9deg) scale(${pop(t, a.t)})`, background: C.cost, borderRadius: 22, padding: '14px 30px', textAlign: 'center', fontFamily: font, color: '#fff', boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ fontWeight: 900, fontSize: 120, lineHeight: 1 }}>{a.text}</div>
          <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: 2 }}>{a.label}</div>
        </div>
      );
    })}
  </>
);

const Grid: React.FC<SceneProps> = ({ t, acts }) => {
  const fills = acts.filter((a) => a.type === 'fill' || a.type === 'rest');
  const cell = 64, gap = 8, x0 = 184, y0 = 360;
  const color: (string | null)[] = Array(100).fill(null); const born: number[] = Array(100).fill(0); const pulse: boolean[] = Array(100).fill(false);
  const hint = acts.find((a) => a.type === 'hint');
  let off = 0;
  for (const a of fills) {
    const n = a.type === 'rest' ? 100 - off : a.count;
    for (let i = 0; i < n; i++) { const at = a.t + (i / n) * (a.type === 'rest' ? 0.1 : a.dur ?? 0.7); if (t >= at) { color[off + i] = a.color; born[off + i] = at; pulse[off + i] = a.type === 'rest'; } }
    off += n;
  }
  return (
    <>
      {color.map((c, i) => {
        const s = c ? 0.7 + 0.3 * pop(t, born[i], 0.25) : 1;
        const p = pulse[i] ? 1 + 0.12 * Math.sin((t - born[i]) * 9) : 1;
        return <div key={i} style={{ position: 'absolute', left: x0 + (i % 10) * (cell + gap), top: y0 + Math.floor(i / 10) * (cell + gap), width: cell, height: cell, borderRadius: 12,
          background: c ?? C.cell, border: `3px solid ${c ?? (hint && t >= hint.t && Math.sin((t - hint.t) * 14) > -0.2 ? C.text : C.cellStroke)}`, transform: `scale(${s * p})`, boxShadow: pulse[i] ? `0 0 34px ${c}` : 'none', zIndex: pulse[i] ? 2 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 900, fontSize: 28, color: c ? 'rgba(0,0,0,0.45)' : C.muted }}>$</div>;
      })}
      {fills.map((a, i) => {
        const o = fadeIn(t, a.t); if (o <= 0) return null;
        // up to 3 rows: one column; 4–6 rows: two compact columns (stays above the captions band at 1390)
        const compact = fills.length > 3;
        const top = compact ? 1092 + (i % 3) * 78 : 1096 + i * 82;
        const left = compact ? (i < 3 ? 70 : 560) : 184;
        return (
          <div key={i} style={{ position: 'absolute', top, left, width: compact ? 470 : undefined, right: compact ? undefined : 60, opacity: o, transform: `translateX(${(1 - out3(o)) * -40}px)`, display: 'flex', alignItems: 'center', gap: compact ? 14 : 22, fontFamily: font }}>
            <div style={{ width: compact ? 36 : 46, height: compact ? 36 : 46, borderRadius: 9, background: a.color, flexShrink: 0 }} />
            <div style={{ fontWeight: 900, fontSize: compact ? 52 : 62, color: a.color, minWidth: compact ? 110 : 190 }}>{a.amount}</div>
            <div style={{ fontWeight: 700, fontSize: compact ? 32 : 40, color: C.text, lineHeight: 1.05 }}>{a.label}</div>
          </div>
        );
      })}
    </>
  );
};

const Bars: React.FC<SceneProps> = ({ t, acts, def }) => (
  <>
    {acts.filter((a) => a.type === 'big').map((a, i) => (
      <div key={i} style={{ position: 'absolute', top: 360, left: 70, right: 70, display: 'flex', alignItems: 'baseline', gap: 22, fontFamily: font, opacity: fadeIn(t, a.t, 0.15), transform: `scale(${pop(t, a.t)})`, transformOrigin: 'left center' }}>
        <span style={{ fontWeight: 900, fontSize: 150, lineHeight: 1, color: C.text }}>{a.value}</span>
        <span style={{ fontWeight: 700, fontSize: 38, color: C.muted, whiteSpace: 'nowrap' }}>{a.label}</span>
      </div>
    ))}
    {acts.filter((a) => a.type === 'bar').map((a, i) => {
      if (t < a.t) return null;
      const g = out3(Math.min(1, (t - a.t) / 0.8));
      const w = (a.value / def.max) * 940 * g;
      return (
        <div key={i} style={{ position: 'absolute', top: 570 + i * 320, left: 70, right: 70, fontFamily: font }}>
          <div style={{ fontWeight: 800, fontSize: 52, color: C.text, opacity: fadeIn(t, a.t), marginBottom: 14 }}>{a.label}</div>
          {/* a short bar can't hold its number: the number then sits right of the bar, in the bar colour */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ height: 170, width: Math.max(w, 24 * g), background: a.color, borderRadius: 18, display: 'flex', alignItems: 'center', paddingLeft: 26, boxSizing: 'border-box', overflow: 'hidden', boxShadow: `0 0 40px ${a.color}55`, flexShrink: 0 }}>
              {(a.value / def.max) * 940 >= 300 && <span style={{ fontWeight: 900, fontSize: 124, color: C.bg, whiteSpace: 'nowrap' }}>{a.prefix ?? '$'}{(a.value * g).toFixed(a.decimals ?? 1)}{a.suffix ?? 'B'}</span>}
            </div>
            {(a.value / def.max) * 940 < 300 && <span style={{ fontWeight: 900, fontSize: 124, color: a.color, whiteSpace: 'nowrap', opacity: g }}>{a.prefix ?? '$'}{(a.value * g).toFixed(a.decimals ?? 1)}{a.suffix ?? 'B'}</span>}
          </div>
        </div>
      );
    })}
  </>
);

const Card: React.FC<SceneProps> = ({ t, acts, def }) => {
  const e = out3(interpolate(t, [def._from, def._from + 0.5], [0, 1], clamp));
  return (
    <>
      <div style={{ position: 'absolute', top: 400, left: 160, width: 760, height: 470, borderRadius: 40, transform: `translateY(${(1 - e) * 300}px) rotate(${-5 + Math.sin(t * 1.6) * 1.2}deg)`, opacity: e,
        background: `linear-gradient(135deg, #17402F 0%, ${C.card} 60%)`, border: `4px solid ${C.accent}`, boxShadow: '0 30px 70px rgba(0,0,0,0.6)', fontFamily: font, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 110, background: C.accent }} />
        <div style={{ position: 'absolute', top: 24, left: 40, fontWeight: 900, fontSize: 56, letterSpacing: 8, color: C.bg }}>{def.cardTitle ?? 'MEMBER'}</div>
        <div style={{ position: 'absolute', top: 170, left: 40, width: 150, height: 180, borderRadius: 18, background: C.cell, border: `3px solid ${C.cellStroke}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}><Person on={1} s={130} /></div>
        {[0, 1, 2].map((k) => <div key={k} style={{ position: 'absolute', top: 190 + k * 54, left: 230, width: [440, 340, 250][k], height: 26, borderRadius: 13, background: 'rgba(243,246,238,0.28)' }} />)}
        <div style={{ position: 'absolute', bottom: 30, left: 40, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: C.muted }}>{def.cardSub ?? 'PAID YEARLY'}</div>
      </div>
      {acts.filter((a) => a.type === 'stat').map((a, i) => (
        <div key={i} style={{ position: 'absolute', top: 960, left: i === 0 ? 60 : 550, width: 470, height: 340, borderRadius: 30, background: C.card, border: `3px solid ${C.cellStroke}`, opacity: fadeIn(t, a.t, 0.15), transform: `scale(${pop(t, a.t)})`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: font, textAlign: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: 124, lineHeight: 1, color: C.accent }}>{a.value}</div>
          <div style={{ fontWeight: 800, fontSize: 40, color: C.text, marginTop: 14, padding: '0 20px' }}>{a.label}</div>
          {a.sub && <div style={{ fontWeight: 700, fontSize: 30, color: C.muted, marginTop: 8 }}>{a.sub}</div>}
        </div>
      ))}
    </>
  );
};

const People: React.FC<SceneProps> = ({ t, acts, def }) => {
  const a = acts.find((x) => x.type === 'light');
  return (
    <>
      {Array.from({ length: def.total }).map((_, i) => {
        const on = a && i < a.count ? pop(t, a.t + i * 0.07, 0.25) : 0;
        // up to 10 people: 5 per row, big; more: 10 per row, small (keeps the big number clear at y≈930)
        const wide = def.total > 10, cols = wide ? 10 : 5;
        return <div key={i} style={{ position: 'absolute', left: wide ? 70 + (i % cols) * 96 : 95 + (i % cols) * 182, top: wide ? 470 + Math.floor(i / cols) * 190 : 400 + Math.floor(i / cols) * 250 }}><Person on={on} s={wide ? 84 : 160} /></div>;
      })}
      {a && <div style={{ position: 'absolute', top: 930, left: 0, right: 0, textAlign: 'center', fontFamily: font, opacity: fadeIn(t, a.t + 0.5), transform: `scale(${pop(t, a.t + 0.5)})` }}>
        <div style={{ fontWeight: 900, fontSize: 150, lineHeight: 1.05, color: C.accent }}>{a.big}</div>
        <div style={{ fontWeight: 800, fontSize: 46, color: C.text, marginTop: 10 }}>{a.label}</div>
        {a.sub && <div style={{ fontWeight: 700, fontSize: 34, color: C.muted, marginTop: 10 }}>{a.sub}</div>}
      </div>}
    </>
  );
};

const Lines: React.FC<SceneProps> = ({ t, acts }) => (
  <div style={{ position: 'absolute', top: 470, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 80, alignItems: 'center', fontFamily: font, textAlign: 'center' }}>
    {acts.filter((a) => a.type === 'line').map((a, i) => (
      <div key={i} style={{ opacity: fadeIn(t, a.t, 0.15), transform: `scale(${pop(t, a.t)})` }}>
        <div style={{ fontWeight: 800, fontSize: 50, color: C.muted, letterSpacing: 3 }}>{a.small}</div>
        <div style={{ fontWeight: 900, fontSize: a.size ?? 120, lineHeight: 1.05, color: a.color ?? C.text, textDecoration: a.strike && t > a.t + 0.5 ? 'line-through' : 'none', textDecorationColor: C.cost, textDecorationThickness: 12 }}>{a.text}</div>
      </div>
    ))}
  </div>
);

const SCENES: Record<string, React.FC<SceneProps>> = { product: Product, grid: Grid, bars: Bars, card: Card, people: People, lines: Lines };

/* ---------- composition ---------- */
export type MoneyProps = { episodeId: string; spec?: any; timings?: Timings; cover?: boolean };

export const Money: React.FC<MoneyProps> = ({ episodeId, spec, timings, cover }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const end = timings!.duration + 0.5;
  const { segs, byScene, acts } = useMemo(() => {
    const acts = schedule(spec, timings!).actions as unknown as A[];
    const sceneOfBeat: Record<string, string> = {}; const segs: { id: string; from: number; to: number; kicker?: string }[] = [];
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
    return { segs, byScene, acts };
  }, [spec, timings]);
  const hookEnd = timings!.beats[0].end;
  const titleO = Math.max(interpolate(t, [hookEnd - 0.25, hookEnd], [1, 0], clamp), interpolate(t, [end - 0.45, end - 0.1], [0, 1], clamp), cover ? 1 : 0);
  const punch = interpolate(t, [0, 0.6], [1.12, 1], { ...clamp, easing: out3 });
  const musicVol = (f: number) => interpolate(f / FPS, [0, 0.5, end - 3, end], [0.0, 0.2, 0.2, 0.28], clamp);
  const sfx: { t: number; f: string; v: number }[] = [{ t: 0, f: 'boom', v: 0.6 }];
  segs.slice(1).forEach((s, i) => { if (s.id !== segs[i].id) sfx.push({ t: s.from, f: 'whoosh', v: 0.35 }); });
  for (const a of acts) if (a.type !== 'pulse' && a.type !== 'hint') sfx.push({ t: a.t, f: a.type === 'ghost' || a.type === 'rest' ? 'stamp' : 'pop', v: a.type === 'rest' ? 0.7 : 0.45 });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${C.glow} 0%, ${C.bg} 72%)` }}>
      {/* STAGE — one scene at a time; a scene keeps its state when we come back to it */}
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        {segs.map((s, i) => {
          if (t < s.from - 0.01 || t > s.to + 0.25) return null;
          const prevSame = i > 0 && segs[i - 1].id === s.id, nextSame = i < segs.length - 1 && segs[i + 1].id === s.id;
          const o = Math.min(i === 0 || prevSame ? 1 : fadeIn(t, s.from, 0.22), nextSame ? (t < s.to ? 1 : 0) : interpolate(t, [s.to, s.to + 0.2], [1, 0], clamp));
          const Scene = SCENES[spec.scenes[s.id].type];
          const def = { ...spec.scenes[s.id], _from: segs.find((x) => x.id === s.id)!.from };
          return <AbsoluteFill key={i} style={{ opacity: o, transform: i === 0 || prevSame ? undefined : `translateY(${(1 - out3(o)) * 40}px)` }}><Scene t={t} acts={byScene[s.id] ?? []} def={def} /></AbsoluteFill>;
        })}
      </AbsoluteFill>
      {/* callouts: one slot at the bottom of the stage (y 1200–1330) */}
      {acts.filter((a) => a.type === 'callout').map((a, i) => {
        // a callout never outlives its scene (REDRAWN lesson: overlays lingering into the next idea)
        const seg = segs.find((s) => a.t >= s.from - 0.01 && a.t < s.to)!;
        const o = Math.min(life(t, a.t, a.hold ?? 2), interpolate(t, [seg.to - 0.15, seg.to], [1, 0], clamp)); if (o <= 0) return null;
        return <div key={i} style={{ position: 'absolute', top: a.y ?? 1215, left: 50, right: 50, display: 'flex', justifyContent: 'center', opacity: o, transform: `scale(${pop(t, a.t)})` }}>
          <div style={{ fontFamily: font, fontWeight: 900, fontSize: a.size ?? 58, color: C.bg, background: a.color ?? C.accent, padding: '16px 34px', borderRadius: 18, textAlign: 'center', lineHeight: 1.1, boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}>{a.text}</div>
        </div>;
      })}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(6,18,14,0) 68%, rgba(6,18,14,0.9) 80%)' }} />
      <Fx />
      {/* TOP — series badge, title on the hook, then one kicker per chapter */}
      <div style={{ position: 'absolute', top: 70, left: 60, fontFamily: font, fontWeight: 900, fontSize: 30, letterSpacing: 8, color: C.bg, background: C.accent, padding: '8px 18px', borderRadius: 6 }}>{spec.series}</div>
      {spec.episode != null && <div style={{ position: 'absolute', top: 70, left: 330, fontFamily: font, fontWeight: 900, fontSize: 30, letterSpacing: 4, color: C.accent, border: `3px solid ${C.accent}`, padding: '5px 14px', borderRadius: 6 }}>#{String(spec.episode).padStart(3, '0')}</div>}
      <div style={{ position: 'absolute', top: 160, left: 50, right: 50, textAlign: 'center', opacity: titleO, fontFamily: font, fontWeight: 900, fontSize: 84, lineHeight: 1.05, color: C.text, textTransform: 'uppercase', textShadow: '0 6px 24px rgba(0,0,0,0.7)' }}>{spec.title}</div>
      {!cover && segs.map((s, i) => {
        if (!s.kicker || t < s.from || t > s.to + 0.2 || titleO > 0.5) return null;
        const o = Math.min(fadeIn(t, Math.max(s.from, hookEnd), 0.2), interpolate(t, [s.to, s.to + 0.2], [1, 0], clamp), 1 - titleO);
        return <div key={i} style={{ position: 'absolute', top: 190, left: 50, right: 50, textAlign: 'center', opacity: o, fontFamily: font, fontWeight: 900, fontSize: 68, lineHeight: 1.08, color: C.text, textTransform: 'uppercase' }}>{s.kicker}</div>;
      })}
      {!cover && <Captions timings={timings!} t={t} accent={C.accent} />}
      {/* SOURCE — always on screen (trust signal; full list in the pinned comment) */}
      <div style={{ position: 'absolute', top: 1664, left: 60, right: 60, textAlign: 'center', fontFamily: font, fontWeight: 700, fontSize: 28, color: C.muted, letterSpacing: 1 }}>{spec.source}</div>
      {sfx.map((c, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(c.t * FPS))} durationInFrames={FPS * 3} layout="none"><Audio src={staticFile(`sfx/${c.f}.wav`)} volume={c.v} /></Sequence>
      ))}
      <Audio src={staticFile(`episodes/${episodeId}/voice.wav`)} />
      <Audio src={staticFile(`episodes/${episodeId}/music.wav`)} volume={musicVol} />
    </AbsoluteFill>
  );
};
