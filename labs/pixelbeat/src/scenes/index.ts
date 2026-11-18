import type {FB} from '../pixel/fb';
import type {Score} from '../score/types';
import {drawChainReaction} from './chainReaction';

// Registre des scènes : une vidéo = une partition (JSON) + une scène (fonction pure).
// draw(fb, score, beat) doit être DÉTERMINISTE : même beat -> même image.
export type SceneDraw = (fb: FB, s: Score, beat: number) => void;

export const SCENES: Record<string, SceneDraw> = {
  'chain-reaction': drawChainReaction,
};
