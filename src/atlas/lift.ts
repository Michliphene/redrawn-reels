import type { TimedAction } from '../lib/types';
import type { AtlasWorld } from './world';
import { ease, hash, hop, ramp } from '../studio/motion';

/**
 * Where a subject piece is at time t (how high it stands, how far the burst has pushed it).
 * One function, used by the map itself and by everything standing on it (units, markers).
 */
export type PieceState = { y: number; dx: number; dz: number; burst: number };
export function makeLift(world: AtlasWorld, actions: TimedAction[]) {
  const declares = actions.filter((a) => a.type === 'declare') as Extract<TimedAction, { type: 'declare' }>[];
  const pulses = actions.filter((a) => a.type === 'pulse') as Extract<TimedAction, { type: 'pulse' }>[];
  const dissolve = actions.find((a) => a.type === 'dissolve');
  const h = world.h;
  return (id: string, t: number): PieceState => {
    const i = world.focusIds.indexOf(id);
    const piece = world.pieces.get(id);
    if (i < 0 || !piece) return { y: 0, dx: 0, dz: 0, burst: 0 };
    const d = declares.find((a) => a.id === id);
    // each country that has declared stands at its own height: borders stay exact, pieces read as separate
    const rest = d && t >= d.t ? h * (0.18 + 0.55 * hash(i + 3)) * ease.out3(ramp(t, d.t + 0.25, 0.5)) : 0;
    const jump = Math.max(0, ...declares.filter((a) => a.id === id).map((a) => hop(t, a.t, 0.5))) * h * 2.4;
    const pulse = Math.max(0, ...pulses.filter((p) => p.ids.includes(id)).map((p) => hop(t, p.t, 0.38))) * h * 1.1;
    // burst: pieces fly apart from the subject's centre, then settle back on their exact borders
    const burst = dissolve ? (t < dissolve.t ? 0 : t < dissolve.t + 0.35 ? ease.out3(ramp(t, dissolve.t, 0.35)) : 1 - ease.inOut3(ramp(t, dissolve.t + 0.35, 1.9))) : 0;
    return {
      y: rest + jump + pulse + burst * h * (1.2 + hash(i) * 2.4),
      dx: (piece.centroid[0] - world.focusCentroid[0]) * 0.2 * burst,
      dz: (piece.centroid[1] - world.focusCentroid[1]) * 0.2 * burst,
      burst,
    };
  };
}
export type Lift = ReturnType<typeof makeLift>;
