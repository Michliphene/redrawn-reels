import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate, delayRender, continueRender } from 'remotion';
import type { EpisodeProps } from './lib/types';
import { schedule } from './lib/schedule';
import { resolveCamera, cameraAt, projectionFor } from './lib/camera';
import { theme, FPS } from './lib/theme';
import { MapLayer } from './components/MapLayer';
import { Labels } from './components/Labels';
import { Captions } from './components/Captions';
import { Timeline } from './components/Timeline';
import { DateBadge } from './components/DateBadge';
import { Brand } from './components/Brand';
import { Units } from './components/Units';
import { Portraits, Credit } from './components/Portrait';
import { FlagSwap } from './components/FlagSwap';
import { Counter } from './components/Counter';
import { Fx } from './components/Fx';
import { Sfx } from './components/Sfx';
import { BigNumbers, Archives, Callouts, GeoTexts } from './components/Overlays';
import { setPalette } from './lib/theme';

// self-hosted font (OFL) so renders never depend on the network
const fontWait = delayRender('Montserrat');
new FontFace('Montserrat', `url(${staticFile('fonts/Montserrat-VF.ttf')})`, { weight: '100 900' }).load()
  .then((f) => { document.fonts.add(f); continueRender(fontWait); });

export const Episode: React.FC<EpisodeProps & { credits?: Record<string, Credit> }> = ({ episodeId, spec, timings, geo, credits }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  setPalette(spec!.palette);
  const sched = useMemo(() => schedule(spec!, timings!), [spec, timings]);
  const camKeys = useMemo(() => sched.cameras.map((c) => ({ t: c.t, dur: c.cam.dur ?? 1.1, state: resolveCamera(c.cam, geo!) })), [sched, geo]);
  // camera shake on impacts (coup, dissolution) + punch-in on the very first frames (hook)
  const shakes = sched.actions.filter((a) => a.type === 'shake' || a.type === 'dissolve');
  const amp = shakes.reduce<number>((m, a) => Math.max(m, interpolate(t, [a.t, a.t + 0.05, a.t + 0.7], [0, ((a as any).amount ?? 14) as number, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })), 0);
  const cam = cameraAt(t, camKeys);
  const punch = interpolate(t, [0, 0.7], [1.18, 1], { extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3) });
  const projection = projectionFor({ ...cam, scale: cam.scale * punch, off: [cam.off[0] + Math.sin(t * 70) * amp, cam.off[1] + Math.cos(t * 55) * amp] });
  const hookEnd = timings!.beats[0].end;
  const end = timings!.duration + 0.5;
  const lastBeatStart = timings!.beats[timings!.beats.length - 1].start;
  // music ducks under the voice, swells slightly at the end
  const musicVol = (f: number) => interpolate(f / FPS, [0, 0.5, end - 3, end], [0.0, 0.22, 0.22, 0.3], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, ${theme.seaGlow} 0%, ${theme.sea} 70%)` }}>
      <MapLayer geo={geo!} projection={projection} t={t} actions={sched.actions} />
      {/* readability gradients for top text and bottom captions */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,17,32,0.9) 0%, rgba(11,17,32,0) 18%, rgba(11,17,32,0) 62%, rgba(11,17,32,0.92) 78%)' }} />
      <GeoTexts t={t} actions={sched.actions} projection={projection} />
      <Labels geo={geo!} projection={projection} t={t} actions={sched.actions} end={end} legend={spec!.legend ?? true} />
      <Units projection={projection} t={t} actions={sched.actions} />
      <FlagSwap t={t} actions={sched.actions} />
      <Archives t={t} actions={sched.actions} />
      <Portraits t={t} actions={sched.actions} credits={credits ?? {}} />
      <Callouts t={t} actions={sched.actions} />
      <BigNumbers t={t} actions={sched.actions} />
      <Fx />
      {spec!.counter !== false && <Counter t={t} actions={sched.actions} total={spec!.counter?.total ?? 15} label={spec!.counter?.label} from={hookEnd} />}
      <Brand series={spec!.series} title={spec!.title} t={t} titleUntil={hookEnd} />
      {t > hookEnd && t < lastBeatStart && <DateBadge dates={sched.dates} t={t} />}
      <Captions timings={timings!} t={t} />
      <Timeline from={spec!.timeline.from} to={spec!.timeline.to} step={spec!.timeline.step} dates={sched.dates} actions={sched.actions} t={t} />
      <Sfx actions={sched.actions} />
      <Audio src={staticFile(`episodes/${episodeId}/voice.wav`)} />
      <Audio src={staticFile(`episodes/${episodeId}/music.wav`)} volume={musicVol} />
    </AbsoluteFill>
  );
};
