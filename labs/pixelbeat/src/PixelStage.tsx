import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {FB, H, W} from './pixel/fb';
import {frameToBeat} from './score/timing';
import type {Score} from './score/types';
import {SCENES} from './scenes';

export type StageProps = {score: Score; withAudio?: boolean};

export const PixelStage: React.FC<StageProps> = ({score, withAudio = true}) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const draw = SCENES[score.meta.scene];
    if (!draw) throw new Error(`Scène inconnue : ${score.meta.scene}`);
    const fb = new FB();
    draw(fb, score, frameToBeat(score, frame));
    const ctx = ref.current!.getContext('2d')!;
    const img = ctx.createImageData(W, H);
    fb.toRGBA(new Uint32Array(img.data.buffer));
    ctx.putImageData(img, 0, 0);
  }, [frame, score]);

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {/* Rendu natif 180x320, agrandi x6 SANS lissage : la netteté vient de là. */}
      <canvas
        ref={ref}
        width={W}
        height={H}
        style={{width: '100%', height: '100%', imageRendering: 'pixelated'}}
      />
      {withAudio ? <Audio src={staticFile(`audio/${score.meta.id}.wav`)} /> : null}
    </AbsoluteFill>
  );
};
