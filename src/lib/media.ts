export type RenderDirectionProps = { da?: number; requireDa?: number; webgl?: boolean };

export function episodeMedia(episodeId: string, spec?: { audio?: string }) {
  const audioId = spec?.audio ?? episodeId;
  const dir = `episodes/${audioId}`;
  return { audioId, timings: `${dir}/timings.json`, voice: `${dir}/voice.wav`, music: `${dir}/music.wav` };
}

/** Resolve the selected art direction and enforce an explicit render requirement. */
export function renderDirection(props: { da?: number; requireDa?: unknown }, specDa: number | undefined, webgl: boolean) {
  const da = props.da ?? specDa ?? 1;
  const { requireDa } = props;
  if (requireDa !== undefined) {
    if (requireDa !== 1 && requireDa !== 2) throw new Error('requireDa must be the number 1 or 2');
    if (requireDa !== da) throw new Error(`requireDa ${requireDa} must match the selected DA ${da}`);
    if (requireDa === 2 && !webgl) throw new Error('requireDa 2 needs WebGL, but the render browser could not create a WebGL context');
  }
  return { da, webgl };
}

export function deltaHookPreview(episodeId: string, enabled?: unknown) {
  return episodeId === 'delta-amex' && enabled === true
    ? { title: "The check behind Delta's miles", inset: 36, craneZoom: 0.14 }
    : undefined;
}
