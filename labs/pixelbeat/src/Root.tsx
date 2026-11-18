import React from 'react';
import {Composition} from 'remotion';
import {PixelStage, StageProps} from './PixelStage';
import {checkGrid, durationInFrames} from './score/timing';
import type {Score} from './score/types';
import demo from '../scores/demo.json';

const defaultScore = demo as unknown as Score;

export const Root: React.FC = () => (
  <Composition
    id="Reel"
    component={PixelStage}
    width={1080}
    height={1920}
    fps={defaultScore.meta.fps}
    durationInFrames={durationInFrames(defaultScore)}
    defaultProps={{score: defaultScore, withAudio: true} as StageProps}
    // La partition passée en --props pilote durée et fps : une seule composition pour toutes les vidéos.
    calculateMetadata={({props}) => {
      checkGrid(props.score);
      return {durationInFrames: durationInFrames(props.score), fps: props.score.meta.fps};
    }}
  />
);
