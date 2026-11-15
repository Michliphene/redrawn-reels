import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate, delayRender, continueRender } from 'remotion';
import type { EpisodeProps } from './lib/types';
import { schedule } from './lib/schedule';
import { theme, FPS } from './lib/theme';
import { Captions } from './components/Captions';
import { Brand } from './components/Brand';
import { Fx } from './components/Fx';
import { Sfx } from './components/Sfx';
import { BigNumbers, Callouts } from './components/Overlays';
import { Stickers, Chapters } from './components/Stickers';
import { ChartLayer, type ChartSpec } from './components/Charts';

const fontWait = delayRender('Montserrat');
new FontFace('Montserrat', `url(${staticFile('fonts/Montserrat-VF.ttf')})`, { weight: '100 900' }).load()
  .then((f) => { document.fonts.add(f); continueRender(fontWait); });

// Stickers only use the projection for geo-anchored stickers; data episodes place them in screen px.
const noProjection = ((p: [number, number]) => p) as any;

/** Data reel (charts instead of a map) on the same cue/voice/caption engine as the map episodes. */
export const DataEpisode: React.FC<EpisodeProps & { data?: { charts: Record<string, ChartSpec> } }> = ({ episodeId, spec, timings, data, lottieKeys }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sched = useMemo(() => schedule(spec!, timings!), [spec, timings]);
  const hookEnd = timings!.beats[0].end;
  const end = timings!.duration + 0.5;
  // punch-in on the first frames + shake on impacts, applied to the chart layer
  const punch = interpolate(t, [0, 0.7], [1.05, 1], { extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3) });
  const amp = sched.actions.filter((a) => a.type === 'shake').reduce<number>((m, a) =>
    Math.max(m, interpolate(t, [a.t, a.t + 0.05, a.t + 0.6], [0, ((a as any).amount ?? 12) as number, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })), 0);
  const musicVol = (f: number) => interpolate(f / FPS, [0, 0.5, end - 3, end], [0.0, 0.2, 0.2, 0.28], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${theme.seaGlow} 0%, ${theme.sea} 72%)` }}>
      <AbsoluteFill style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.04) 2px, transparent 2px)',
        backgroundSize: '90px 90px', backgroundPosition: `0 ${-t * 12}px` }} />
      <AbsoluteFill style={{ transform: `scale(${punch}) translate(${Math.sin(t * 70) * amp}px, ${Math.cos(t * 55) * amp}px)` }}>
        {/* chart titles stay hidden while the hook title is up (and again on the loop seam) */}
        <ChartLayer t={t} actions={sched.actions} charts={data!.charts} titleFrom={t > end - 1 ? 1e9 : hookEnd} />
      </AbsoluteFill>
      <Stickers t={t} actions={sched.actions} projection={noProjection} lottieKeys={lottieKeys ?? []} />
      <Callouts t={t} actions={sched.actions} />
      <BigNumbers t={t} actions={sched.actions} />
      <Fx />
      {t > hookEnd && <Chapters t={t} actions={sched.actions} lottieKeys={lottieKeys ?? []} />}
      <Brand series={spec!.series} episode={(spec as any).episode} title={spec!.title} t={t} titleUntil={hookEnd} end={end} />
      <Captions timings={timings!} t={t} y={1410} hidden={Object.fromEntries(spec!.beats.filter((b: any) => b.hideCaptionWords).map((b: any) => [b.id, b.hideCaptionWords]))} />
      {/* source + disclaimer: always on screen (trust signal), just above the captions, clear of the platform caption overlay */}
      <div style={{ position: 'absolute', top: 1334, left: 60, right: 60, fontFamily: 'Montserrat', fontWeight: 600, fontSize: 21, lineHeight: 1.3,
        color: theme.muted, textShadow: '0 2px 6px #000', textAlign: 'center' }}>
        <div>Source: {spec!.source}</div>
        <div>{spec!.footnote ? `${spec!.footnote} · ` : ''}<span style={{ color: theme.text }}>{spec!.disclaimer ?? 'Not financial advice.'}</span></div>
      </div>
      <Sfx actions={sched.actions} />
      <Audio src={staticFile(`episodes/${episodeId}/voice.wav`)} />
      <Audio src={staticFile(`episodes/${episodeId}/music.wav`)} volume={musicVol} />
    </AbsoluteFill>
  );
};
