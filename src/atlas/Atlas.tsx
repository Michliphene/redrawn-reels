import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import type { GeoProjection } from 'd3-geo';
import type { EpisodeProps } from '../lib/types';
import { schedule } from '../lib/schedule';
import { applySkin, setPalette } from '../lib/theme';
import { FPS, ZONES, SAFE } from '../studio/tokens';
import { seriesOf } from '../studio/series';
import { FONT, loadFonts, setMonoFamily } from '../studio/fonts';
import { drift, ease, ramp, shake } from '../studio/motion';
import { lerpShot, makeCamera, projector, shotAt, type Shot, type ShotKey } from '../studio/three/rig';
import { PixelStage } from '../studio/look/PixelStage';
import { ReadabilityBands, SeriesBar, TitleBlock } from '../studio/ui/Hud';
import { Captions } from '../studio/ui/Captions';
import { Grain, Guides } from '../studio/ui/Finish';
import { makeWorld, resolveShot } from './world';
import { Map3D, TableLight } from './Map3D';
import { DateBlock, Rail, Tally } from './Header';
import { makeLift } from './lift';
import { Units3D, UnitCaptions, unitGroups } from './Units3D';
import { Labels } from '../components/Labels';
import { Portraits, type Credit } from '../components/Portrait';
import { FlagSwap } from '../components/FlagSwap';
import { Sfx } from '../components/Sfx';
import { BigNumbers, Archives, Callouts, GeoTexts } from '../components/Overlays';
import { Stickers, Pointers } from '../components/Stickers';
import { WantedPosters } from '../components/Wanted';
import { Vehicles3D, VehicleLabels, vehicleStates } from './Vehicles3D';
import { Props3D, PropLabels, propStates } from './Props3D';
import { Night } from '../components/Night';
import { Tickets } from '../components/Ticket';
import { Verdicts } from '../components/Verdict';

/**
 * REDRAWN, DA v2 ("tabletop"): the same cue sheet as the flat engine, played on a 3D table with a real camera.
 *   world  = low-res 3D map of pieces (PixelStage + Map3D)
 *   type   = one left-aligned header block (series bar, title → date + chapter, time rail) and captions,
 *            all inside the platform safe area
 *   cards  = the shared overlay components, skinned with the house fonts
 * Optional v2 fields of episode.json: `da: 2`, `whisper` (quiet line under the title), `keywords` (caption
 * words to highlight), `world: {center, thickness}`, and on a camera: `pitch`, `yaw`, `fov`, `roll`, `cut`.
 */
export const Atlas: React.FC<EpisodeProps & { credits?: Record<string, Credit>; cover?: boolean; guides?: boolean; brand?: string }> = ({ episodeId, spec, timings, geo, credits, lottieKeys, cover, guides, brand }) => {
  loadFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const series = seriesOf(spec);
  const pal = series.palette;
  setPalette(spec!.palette);
  applySkin({ font: `'${FONT.displayCondensed}', '${FONT.legacy}'`, text: pal.ink, muted: pal.muted, accent: pal.accent, radius: 0, shadow: '10px 10px 0 rgba(0,0,0,0.5)', inset: SAFE.left,
    photo: 'print', photoTones: [pal.bg, pal.surfaceEdge, pal.surface, pal.muted, pal.ink],
    // a channel's own identity (paper, stamp ink, typewriter); nothing here for a series without `extra`
    ...(series.extra ? { cardBg: 'rgba(7,6,5,0.94)', stamp: series.extra.stamp, stampBg: 'rgba(7,6,5,0.88)', paper: series.extra.paper, paperInk: series.extra.paperInk } : {}),
    ...(series.type?.mono ? { typewriter: `'${series.type.mono}', monospace`, stampFont: `'${series.type.mono}', monospace` } : {}) });
  setMonoFamily(series.type?.mono);
  const sx = spec as any;
  const audioId = sx.audio ?? episodeId;

  const sched = useMemo(() => {
    const sc = schedule(spec!, timings!);
    // A cut is a new place: anything pinned to the old place (labels, markers, units, paths…) ends just before it.
    const cuts = sc.cameras.filter((c) => (c.cam as any).cut).map((c) => c.t);
    const HOLD: Record<string, number> = { label: 2.5, marker: 2.5, units: 4, region: 3.5, pointer: 3, sticker: 2.2, ghost: 3, path: 4 };
    for (const a of sc.actions as any[]) {
      if (!(a.type in HOLD) || (a.type === 'sticker' && !a.at)) continue;
      const cut = cuts.find((c) => c > a.t + 0.2);
      if (cut != null) a.hold = Math.max(0.2, Math.min(a.hold ?? HOLD[a.type], cut - a.t - 0.42));
    }
    return sc;
  }, [spec, timings]);
  const world = useMemo(() => makeWorld(geo!, sx.world ?? {}), [geo, sx.world]);
  const keys: ShotKey[] = useMemo(() => sched.cameras.map((c) => ({ t: c.t, dur: c.cam.dur ?? 1.1, shot: resolveShot(c.cam as any, world), cut: (c.cam as any).cut })), [sched, world]);
  const lift = useMemo(() => makeLift(world, sched.actions), [world, sched]);
  const end = timings!.duration + 0.5;
  const hookEnd = timings!.beats[0].end;

  // Camera life. Frame 0 is a low crane shot across the table (the map reads as an object at once),
  // it rises to the reading angle during the hook, drifts slowly for the whole reel, shakes on impacts,
  // and returns to the frame-0 pose in the last half second so the loop cut is invisible.
  const crane = (s: Shot, k: number): Shot => ({ ...s, pitch: s.pitch - (s.pitch - 21) * k, yaw: s.yaw + 17 * k, dist: s.dist * (1 - 0.42 * k) });
  const open = crane(keys[0].shot, 1);
  const k0 = cover ? 0 : 1 - ease.inOut3(ramp(t, 0.1, 1.7));
  let shot = crane(shotAt(t, keys), k0);
  const back = ease.inOut3(ramp(t, end - 0.62, 0.5));
  if (back > 0) shot = lerpShot(shot, open, back);
  const impacts = sched.actions.filter((a) => a.type === 'shake' || a.type === 'dissolve');
  const amp = impacts.reduce((m, a) => Math.max(m, shake(t, a.t, ((a as any).amount ?? 14) / 14)), 0);
  shot = {
    ...shot,
    yaw: shot.yaw + drift(t, 1, 0.8) * 2.2 * (1 - back) + Math.sin(t * 61) * amp * 0.8,
    pitch: shot.pitch + drift(t, 2, 0.8) * 1.2 * (1 - back) + Math.cos(t * 53) * amp * 0.7,
    roll: (shot.roll ?? 0) + Math.sin(t * 47) * amp * 1.0,
  };
  const cam = makeCamera(shot);
  const toPx = projector(cam);
  const projection = ((ll: [number, number]) => toPx(world.point(ll, world.h))) as unknown as GeoProjection;
  const groups = unitGroups(world, sched.actions, keys, t, lift);
  const vehicles = vehicleStates(world, sched.actions, t, shot);
  const props = propStates(world, sched.actions, t, shot);
  const ex = series.extra ?? {};

  const beatIdx = Math.max(0, timings!.beats.findIndex((b, i) => t >= b.start - 0.15 && (i === timings!.beats.length - 1 || t < timings!.beats[i + 1].start - 0.15)));
  const beat = spec!.beats[beatIdx] as any;
  const legendAt = sched.actions.find((a) => a.type === 'allLabels')?.t;
  const legendOn = legendAt != null && t >= legendAt && (spec!.legend ?? true);
  const titleO = cover ? 1 : Math.max(1 - ramp(t, hookEnd - 0.3, 0.3), ramp(t, end - 0.45, 0.35));
  const headO = cover ? 0 : Math.min(ramp(t, hookEnd, 0.3), 1 - ramp(t, end - 0.5, 0.3)) * (legendOn ? 1 - ramp(t, legendAt!, 0.3) : 1);
  const chapters = useMemo(() => sched.actions.filter((a) => a.type === 'chapter').map((a) => ({ t: a.t, text: (a as any).text as string })), [sched]);
  const musicVol = (f: number) => interpolate(f / FPS, [0, 0.5, end - 3, end], [0.0, 0.22, 0.22, 0.3], { extrapolateRight: 'clamp' });
  const hidden = useMemo(() => Object.fromEntries(spec!.beats.filter((b: any) => b.hideCaptionWords).map((b: any) => [b.id, b.hideCaptionWords])), [spec]);

  return (
    <AbsoluteFill style={{ background: pal.bg }}>
      <PixelStage look={series.look} camera={cam} bg={pal.bg} fog={[shot.dist * 1.12, shot.dist * 3.1]}>
        <TableLight shot={shot} />
        <Map3D world={world} geo={geo!} t={t} actions={sched.actions} pal={pal} shot={shot} lift={lift} />
        <Units3D groups={groups} t={t} />
        <Props3D states={props} pal={pal} />
        <Vehicles3D states={vehicles} body={ex.paper ?? pal.ink} tail={pal.accent} canopy={ex.paper ?? pal.ink} />
      </PixelStage>
      <ReadabilityBands bg={pal.bg} />
      <Night t={t} actions={sched.actions} spot={(n) => {
        if (n.follow === 'vehicle') { const v = vehicles.find((x) => x.fade > 0.05); return v ? toPx(v.pos) : null; }
        return Array.isArray(n.follow) ? projection(n.follow) as [number, number] : null;
      }} />

      <GeoTexts t={t} actions={sched.actions} projection={projection} />
      <Labels geo={geo!} projection={projection} t={t} actions={sched.actions} end={end} legend={spec!.legend ?? true} legendTop={ZONES.title.top + 44} legendInset={SAFE.left} declutter legendOut={end - 0.6} />
      <UnitCaptions groups={groups} toPx={toPx} />
      <PropLabels states={props} toPx={toPx} />
      <VehicleLabels states={vehicles} toPx={toPx} ink={pal.ink} accent={pal.accent} />
      <Pointers t={t} actions={sched.actions} projection={projection} />
      <Stickers t={t} actions={sched.actions} projection={projection} lottieKeys={lottieKeys ?? []} />
      <FlagSwap t={t} actions={sched.actions} />
      <Archives t={t} actions={sched.actions} />
      <Portraits t={t} actions={sched.actions} credits={credits ?? {}} />
      <WantedPosters t={t} actions={sched.actions} />
      <Tickets t={t} actions={sched.actions} />
      <Verdicts t={t} actions={sched.actions} />
      <Callouts t={t} actions={sched.actions} />
      <BigNumbers t={t} actions={sched.actions} />

      <SeriesBar series={series} episode={sx.episode} brand={brand}
        right={spec!.counter !== false && !cover ? <Tally t={t} actions={sched.actions} total={spec!.counter?.total ?? 15} label={spec!.counter?.label} series={series} from={hookEnd} /> : undefined} />
      {!cover && !beat?.hideTimeline && spec!.timeline && (
        <Rail from={spec!.timeline.from} to={spec!.timeline.to} step={spec!.timeline.step} dates={sched.dates} actions={sched.actions} t={t} series={series} opacity={ramp(t, hookEnd - 0.2, 0.4) * (1 - ramp(t, end - 0.5, 0.3))} />
      )}
      <TitleBlock title={spec!.title} whisper={sx.whisper} series={series} opacity={titleO} t={t} instant={!!sx.whisperOnFrame0} top={ZONES.title.top + (cover ? 0 : 6)} />
      {!beat?.hideDate && <DateBlock dates={sched.dates} chapters={beat?.hideChapter ? [] : chapters} t={t} series={series} opacity={headO} />}
      {!cover && <Captions timings={timings!} t={t} accent={pal.accent} ink={pal.ink} keywords={sx.keywords ?? []} hidden={hidden} />}

      <Grain amount={series.look.grain} />
      {guides && <Guides />}
      <Sfx actions={sched.actions} />
      <Audio src={staticFile(`episodes/${audioId}/voice.wav`)} />
      <Audio src={staticFile(`episodes/${audioId}/music.wav`)} volume={musicVol} />
    </AbsoluteFill>
  );
};
