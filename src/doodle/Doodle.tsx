import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { schedule } from '../lib/schedule';
import type { Timings } from '../lib/types';
import { FPS, H, SAFE, ZONES, TYPE } from '../studio/tokens';
import { episodeTag, seriesOf } from '../studio/series';
import { displayCut, loadFonts, monoCut, serifCut } from '../studio/fonts';
import { drift, ease, hit, life, pop, ramp } from '../studio/motion';
import { fitDisplay } from '../studio/ui/Type';
import { paginate } from '../studio/ui/Captions';
import { Guides } from '../studio/ui/Finish';
import { Boil, C, Sticky } from './ink';
import { PANELS, climbAt, pilePt, type A } from './panels';

/**
 * The notebook ("doodle") art direction: the reel is one long sheet of squared paper; each scene is a page the
 * camera slides to, little ballpoint people act out every sentence, and on the cue `flip` the page is turned
 * over (the rules flip, literally). Same cue language as the other engines: scenes + beats + atWord cues.
 *   scene def: { type: duel|race|class|bin|shop|pile, side: front|back, slot: n, callout?: [x, y] }
 */
export type DoodleProps = { episodeId: string; spec?: any; timings?: Timings; cover?: boolean; guides?: boolean };
type Seg = { id: string; from: number; to: number; kicker?: string };
const PANEL = 1240;
const NO_SHADOW = { textShadow: 'none' } as const;

export const Doodle: React.FC<DoodleProps> = ({ episodeId, spec, timings, cover, guides }) => {
  loadFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const series = seriesOf(spec);
  const end = timings!.duration + 0.5;
  const audioId = spec.audio ?? episodeId;
  const boil = Math.floor(frame / 3);

  const { segs, byScene, acts } = useMemo(() => {
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
    // loop: in the last 0.45 s every "light" is undone, so the last frame is the first frame
    for (const a of acts) if (a.type === 'light' || a.type === 'count') a.until = end - 0.45;
    const byScene: Record<string, A[]> = {};
    for (const a of acts) (byScene[sceneOfBeat[a.beat]] ??= []).push(a);
    return { segs, byScene, acts };
  }, [spec, timings, end]);

  const def = (id: string) => spec.scenes[id];
  const sideOf = (id: string) => def(id).side ?? 'front';
  const firstFrom = (id: string) => segs.find((s) => s.id === id)?.from ?? 0;

  // the page turn
  const flip = acts.find((a) => a.type === 'flip');
  const fa = flip ? 180 * ease.inOut3(ramp(t, flip.t, 0.62)) : 0;
  const sideNow = fa >= 90 ? 'back' : 'front';

  // camera: slide from page to page on the side that is up
  const iNow = Math.max(0, segs.findIndex((s) => t >= s.from - 0.01 && t < s.to));
  let iCam = iNow;
  if (sideOf(segs[iNow].id) !== sideNow) iCam = segs.findIndex((s, k) => k > iNow && sideOf(s.id) === sideNow);
  if (iCam < 0) iCam = iNow;
  const camSeg = segs[iCam], prev = segs[iCam - 1];
  let camX = def(camSeg.id).slot * PANEL;
  if (prev && sideOf(prev.id) === sideOf(camSeg.id) && iCam === iNow) {
    const p = ease.inOut3(ramp(t, camSeg.from - 0.35, 0.8));
    camX = (def(prev.id).slot + (def(camSeg.id).slot - def(prev.id).slot) * p) * PANEL;
  }
  const panMotion = prev && iCam === iNow && sideOf(prev.id) === sideOf(camSeg.id) ? Math.sin(Math.PI * ramp(t, camSeg.from - 0.35, 0.8)) : 0;

  // zooms: a settle on frame 0 (and back for the loop), and one punch-in when the climber stops
  const settle = cover ? 0 : 1 - ease.inOut3(ramp(t, 0, 1.1)) + ease.inOut3(ramp(t, end - 0.6, 0.5));
  const halt = acts.find((a) => a.type === 'halt');
  const pileId = Object.keys(spec.scenes).find((k) => def(k).type === 'pile');
  const punch = halt ? hit(t, halt.t, 0.35, 1.5) * 0.14 : 0;
  // punch anchored on the left margin: the count (top left) stays in frame, the climber comes closer
  const g0 = halt && pileId ? pilePt(climbAt(halt.t, byScene[pileId] ?? [])) : [540, 845];
  const hp = [64, 430]; void g0; // anchored just under the kicker: the zoom pushes the count down, never into the kicker
  const tilt = drift(t, 2, 0.6) * 0.35 + panMotion * 1.2;

  const renderSide = (side: 'front' | 'back') => {
    const ids = Object.keys(spec.scenes).filter((id) => sideOf(id) === side);
    const slots = Math.max(...ids.map((id) => def(id).slot)) + 1;
    return (
      <div style={{ position: 'absolute', left: -camX - 400, top: 0, width: slots * PANEL + 800, height: H, backgroundColor: C.paper,
        backgroundImage: `linear-gradient(${C.grid} 2px, transparent 2px), linear-gradient(90deg, ${C.grid} 2px, transparent 2px)`, backgroundSize: '54px 54px', backgroundPosition: '400px 0' }}>
        <svg width={slots * PANEL + 800} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g transform="translate(400 0)">
            {Array.from({ length: slots }, (_, k) => (
              <g key={k}>
                <line x1={k * PANEL + 44} y1={0} x2={k * PANEL + 44} y2={H} stroke={C.margin} strokeWidth={3} />
                {/* spiral binding between two pages: only seen while the camera slides */}
                {k < slots - 1 && Array.from({ length: 24 }, (_, r) => <ellipse key={r} cx={k * PANEL + 1160} cy={40 + r * 80} rx={34} ry={13} fill="none" stroke="#7B7F92" strokeWidth={6} />)}
              </g>
            ))}
            <defs><clipPath id="page"><rect x={-60} y={0} width={1210} height={H} /></clipPath></defs>
            {ids.map((id) => {
              const P = PANELS[def(id).type]; if (!P) return null;
              const own = byScene[id] ?? [];
              const call = own.filter((a) => a.type === 'callout');
              const [cx, cy] = def(id).callout ?? [520, 430];
              return (
                <g key={id} transform={`translate(${def(id).slot * PANEL} 0)`} clipPath="url(#page)">
                  <P t={t} acts={own} def={def(id)} from={firstFrom(id)} end={end} />
                  {call.map((a, i) => { const o = life(t, a.t, a.hold ?? 1.6); return o > 0 ? <Sticky key={i} x={a.x ?? cx} y={a.y ?? cy} text={a.text} rot={-3 + (i % 2) * 5} s={Math.min(1.08, pop(t, a.t, 0.35))} opacity={o} /> : null; })}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    );
  };

  const hookEnd = timings!.beats[0].end;
  const titleO = cover ? 1 : Math.max(1 - ramp(t, hookEnd - 0.25, 0.25), ramp(t, end - 0.45, 0.35));
  const SAFE_W = SAFE.right - SAFE.left;
  const musicVol = (f: number) => interpolate(f / FPS, [0, 0.5, end - 3, end], [0.0, 0.18, 0.18, 0.24], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sfx: { t: number; f: string; v: number }[] = [{ t: 0, f: 'pop', v: 0.4 }];
  segs.slice(1).forEach((s, i) => { if (s.id !== segs[i].id && sideOf(s.id) === sideOf(segs[i].id)) sfx.push({ t: s.from - 0.3, f: 'whoosh', v: 0.3 }); });
  for (const a of acts) if (!['walk', 'callout'].includes(a.type)) sfx.push({ t: a.t, f: a.type === 'flip' ? 'whoosh' : ['mark', 'halt', 'trip'].includes(a.type) ? 'stamp' : 'pop', v: a.type === 'flip' ? 0.6 : 0.4 });
  for (const a of acts) if (a.type === 'callout') sfx.push({ t: a.t, f: 'pop', v: 0.3 });
  const z = 1 + 0.07 * settle;

  return (
    <Boil.Provider value={boil}>
      <AbsoluteFill style={{ background: '#2B2B33' }}>
        <div style={{ position: 'absolute', inset: 0, perspective: 2600 }}>
          <div style={{ position: 'absolute', inset: 0, transformOrigin: '50% 50%',
            transform: `rotateX(${10 * settle}deg) rotateY(${fa < 90 ? fa : fa - 180}deg) scale(${1 - 0.1 * Math.sin((fa * Math.PI) / 180)})` }}>
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', transformOrigin: '0 0',
              transform: `translate(${hp[0]}px, ${hp[1]}px) scale(${1 + punch}) translate(${-hp[0]}px, ${-hp[1]}px) translate(540px, 845px) scale(${z}) rotate(${tilt}deg) translate(-540px, -845px)` }}>
              {renderSide(sideNow)}
            </div>
            {/* the page darkens as it turns edge-on */}
            <AbsoluteFill style={{ background: '#000', opacity: 0.35 * Math.sin((fa * Math.PI) / 180) }} />
          </div>
        </div>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(70,50,20,0.22) 100%)', pointerEvents: 'none' }} />

        {/* HUD: a strip of masking tape with the series name */}
        <div style={{ position: 'absolute', top: ZONES.hud.top, left: SAFE.left - 8, height: 50, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', background: C.tape, transform: 'rotate(-1.5deg)', boxShadow: '2px 3px 0 rgba(0,0,0,0.08)' }}>
          <span style={{ ...monoCut(800), fontSize: TYPE.hud, letterSpacing: '0.2em', color: C.ink }}>{series.name}</span>
          {spec.episode != null && <span style={{ ...monoCut(700), fontSize: TYPE.hud, letterSpacing: '0.14em', color: C.red }}>{episodeTag(series, spec.episode)}</span>}
        </div>
        {titleO > 0.01 && (
          <div style={{ position: 'absolute', top: ZONES.title.top + 10, left: SAFE.left, width: SAFE_W, opacity: titleO }}>
            <div style={{ ...displayCut(800, 75), fontSize: fitDisplay(spec.title, SAFE_W, 2, 116), lineHeight: 0.94, textTransform: 'uppercase', color: C.ink, ...NO_SHADOW }}>{spec.title}</div>
            {spec.whisper && <div style={{ ...serifCut, fontSize: TYPE.whisper, color: C.red, marginTop: 12 }}>{spec.whisper}</div>}
          </div>
        )}
        {!cover && segs.map((s, i) => {
          if (!s.kicker || t < s.from || t > s.to + 0.2 || titleO > 0.5) return null;
          const o = Math.min(ramp(t, Math.max(s.from + 0.08, hookEnd), 0.18), 1 - ramp(t, s.to - 0.2, 0.16), 1 - titleO);
          return (
            <div key={i} style={{ position: 'absolute', top: ZONES.title.top + 10, left: SAFE.left, opacity: o, ...displayCut(800, 75), fontSize: 84, lineHeight: 0.94, textTransform: 'uppercase', color: C.ink }}>
              <span style={{ background: `linear-gradient(transparent 52%, ${C.hl} 52%, ${C.hl} 90%, transparent 90%)${fa > 0 && fa < 180 ? `, ${C.paper}` : ''}`, padding: '0 6px' }}>{s.kicker}</span>
            </div>
          );
        })}
        {!cover && t < end - 0.5 && <NotebookCaptions timings={timings!} t={t} keywords={spec.keywords ?? []} backing={Math.sin((fa * Math.PI) / 180)} />}
        {spec.source && (!spec.sourceFrom || t >= firstFrom(spec.sourceFrom) - 0.01) && <div style={{ position: 'absolute', left: SAFE.left, top: ZONES.captions.bottom - 8, width: SAFE.railX - SAFE.left, ...monoCut(600), fontSize: 26, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.ink, opacity: 0.62, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spec.source}</div>}
        {guides && <Guides />}
        {sfx.map((c, i) => (
          <Sequence key={i} from={Math.max(0, Math.round(c.t * FPS))} durationInFrames={FPS * 3} layout="none"><Audio src={staticFile(`sfx/${c.f}.wav`)} volume={c.v} /></Sequence>
        ))}
        <Audio src={staticFile(`episodes/${audioId}/voice.wav`)} />
        <Audio src={staticFile(`episodes/${audioId}/music.wav`)} volume={musicVol} />
      </AbsoluteFill>
    </Boil.Provider>
  );
};

/** Captions in ballpoint: ink words, keywords and numbers under a stroke of highlighter. */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9$%]/g, '');
const NotebookCaptions: React.FC<{ timings: Timings; t: number; keywords: string[]; backing?: number }> = ({ timings, t, keywords, backing = 0 }) => {
  const size = 90, left = SAFE.left, width = SAFE.railX - SAFE.left;
  const maxChars = Math.floor(width / (size * 0.47));
  const pages = useMemo(() => paginate(timings, maxChars, 2, {}), [timings, maxChars]);
  const keys = useMemo(() => new Set(keywords.map(norm)), [keywords]);
  const idx = pages.findIndex((p, i) => t >= p.words[0].start - 0.05 && (i === pages.length - 1 || t < pages[i + 1].words[0].start - 0.05));
  const page = pages[idx];
  if (!page || t > page.words[page.words.length - 1].end + 0.7) return null;
  const lineH = size * 1.04;
  const top = ZONES.captions.top + (ZONES.captions.bottom - ZONES.captions.top - lineH * page.lines.length) / 2;
  return (
    <div style={{ position: 'absolute', top, left, width, display: 'flex', flexDirection: 'column' }}>
      {backing > 0.01 && <div style={{ position: 'absolute', left: -24, top: -16, right: 0, bottom: -16, background: C.paper, opacity: Math.min(1, backing * 2.5), boxShadow: '4px 6px 0 rgba(0,0,0,0.25)' }} />}
      {page.lines.map((line, li) => (
        <div key={li} style={{ position: 'relative', display: 'flex', gap: size * 0.24, height: lineH, alignItems: 'center', whiteSpace: 'nowrap' }}>
          {line.map((w, i) => {
            const key = /\d/.test(w.w) || keys.has(norm(w.w));
            const p = ease.back(ramp(t, w.start - 0.03, 0.16), 1.6);
            const hl = key ? ease.out3(ramp(t, w.start + 0.05, 0.22)) : 0;
            return (
              <span key={i} style={{ ...displayCut(800, 75), fontSize: size, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-0.01em', display: 'inline-block', color: key ? C.red : C.ink,
                opacity: t >= w.start - 0.03 ? 1 : 0, transform: `translateY(${(1 - Math.min(1, p)) * 12}px)`,
                background: key ? `linear-gradient(90deg, ${C.hl} ${hl * 100}%, transparent ${hl * 100}%) 0 62% / 100% 38% no-repeat` : undefined }}>{w.w}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

