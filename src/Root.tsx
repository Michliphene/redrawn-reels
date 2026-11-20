import React from 'react';
import { Composition, staticFile } from 'remotion';
import { Episode } from './Episode';
import { Thumb } from './Thumb';
import { Money } from './money/Money';
import { probeWebGL } from './studio/look/PixelStage';
import type { EpisodeProps } from './lib/types';
import { W, H, FPS } from './lib/theme';

const getJson = async (p: string) => (await fetch(staticFile(p))).json();
const checkedWebGL = (props: any, spec: any) => {
  const webgl = probeWebGL();
  if (!webgl && props.requireWebgl && (props.da ?? spec.da ?? 1) >= 2) throw new Error('DA 2 preview requires WebGL; refusing a misleading DA 1 fallback. Check REMOTION_GL.');
  return webgl;
};

export const Root: React.FC = () => (
  <>
  <Composition id="ThumbV" component={Thumb as any} width={1080} height={1920} fps={30} durationInFrames={1}
    defaultProps={{ episodeId: 'louisiana-1803' }}
    calculateMetadata={async ({ props }) => {
      const p = props as any;
      const spec = await getJson(`episodes/${p.episodeId}/episode.json`);
      const geo = await getJson(spec.data);
      return { props: { ...p, spec, geo } };
    }} />
  <Composition id="Thumb" component={Thumb as any} width={1920} height={1080} fps={30} durationInFrames={1}
    defaultProps={{ episodeId: 'louisiana-1803' }}
    calculateMetadata={async ({ props }) => {
      const p = props as any;
      const spec = await getJson(`episodes/${p.episodeId}/episode.json`);
      const geo = await getJson(spec.data);
      return { props: { ...p, spec, geo } };
    }} />
  <Composition
    id="Money"
    component={Money as any}
    width={W} height={H} fps={FPS} durationInFrames={FPS * 60}
    defaultProps={{ episodeId: 'costco-hotdog' }}
    calculateMetadata={async ({ props }) => {
      const p = props as any;
      const spec = await getJson(`episodes/${p.episodeId}/episode.json`);
      const timings = await getJson(`episodes/${spec.audio ?? p.episodeId}/timings.json`);
      return { durationInFrames: Math.ceil((timings.duration + 0.5) * FPS), props: { ...p, spec, timings, webgl: checkedWebGL(p, spec) } };
    }}
  />
  <Composition
    id="Episode"
    component={Episode as any}
    width={W} height={H} fps={FPS} durationInFrames={FPS * 60}
    defaultProps={{ episodeId: 'ussr-1991' } as EpisodeProps}
    calculateMetadata={async ({ props }) => {
      const p = props as EpisodeProps;
      const spec = await getJson(`episodes/${p.episodeId}/episode.json`);
      // `audio` lets a remaster or an alternative cut reuse another episode's voice, timings and music
      const timings = await getJson(`episodes/${spec.audio ?? p.episodeId}/timings.json`);
      const geo = await getJson(spec.data);
      const credits = await getJson('assets/portraits/credits.json').catch(() => ({}));
      // only keep portrait cues whose image actually exists (pipeline never breaks on a missing asset)
      const keys = [...new Set(spec.beats.flatMap((b: any) => (b.actions ?? []).filter((a: any) => a.type === 'portrait').map((a: any) => a.key)))] as string[];
      const ok = new Set<string>();
      await Promise.all(keys.map(async (k) => { const r = await fetch(staticFile(`assets/portraits/${k}.jpg`)); if (r.ok && (await r.blob()).size > 1000) ok.add(k); }));
      for (const b of spec.beats) b.actions = (b.actions ?? []).filter((a: any) => a.type !== 'portrait' || ok.has(a.key));
      // emoji: lottie (.json) if available, else png; drop stickers/chapters whose emoji is missing
      const emo = [...new Set(spec.beats.flatMap((b: any) => b.actions.filter((a: any) => a.emoji).map((a: any) => a.emoji)))] as string[];
      const lottieKeys: string[] = []; const pngKeys = new Set<string>();
      await Promise.all(emo.map(async (k) => {
        const j = await fetch(staticFile(`assets/emoji/${k}.json`)); if (j.ok && (j.headers.get('content-type') ?? '').includes('json')) { lottieKeys.push(k); return; }
        const pn = await fetch(staticFile(`assets/emoji/${k}.png`)); if (pn.ok && (pn.headers.get('content-type') ?? '').includes('image')) pngKeys.add(k);
      }));
      for (const b of spec.beats) b.actions = b.actions.filter((a: any) => !a.emoji || lottieKeys.includes(a.emoji) || pngKeys.has(a.emoji));
      (p as any).lottieKeys = lottieKeys;
      // same for flags: drop a flag reference whose SVG is missing (and the flag swap if one side is missing)
      const codes = [...new Set(spec.beats.flatMap((b: any) => b.actions.flatMap((a: any) => [a.flag, a.from, a.to].filter(Boolean))))] as string[];
      const okF = new Set<string>();
      await Promise.all(codes.map(async (c) => { const r = await fetch(staticFile(`assets/flags/${c}.svg`)); if (r.ok && (await r.text()).includes('<svg')) okF.add(c); }));
      for (const b of spec.beats) {
        b.actions = b.actions.filter((a: any) => a.type !== 'flagSwap' || (okF.has(a.from) && okF.has(a.to)));
        for (const a of b.actions) if (a.flag && !okF.has(a.flag)) delete a.flag;
      }
      return { durationInFrames: Math.ceil((timings.duration + 0.5) * FPS), props: { ...p, spec, timings, geo, credits, lottieKeys: (p as any).lottieKeys, webgl: checkedWebGL(p, spec) } };
    }}
  />
  </>
);
