import { ease, ramp } from './motion';
import { lerpShot, type Shot } from './three/rig';

/** Opt-in direction, independent of brand tokens. Old episodes keep their original camera path. */
export type Direction = {
  opening: 'hold' | 'reveal' | 'crane';
  openingSeconds?: number;
  drift?: number;
  light?: { azimuth?: number; elevation?: number };
  sound?: 'sparse';
};

export function directedShot(current: Shot, first: Shot, t: number, end: number, direction: Direction, cover = false): Shot {
  const pose = (s: Shot, k: number): Shot => direction.opening === 'hold' ? s : direction.opening === 'reveal'
    ? { ...s, dist: s.dist * (1 - 0.25 * k) }
    : { ...s, pitch: s.pitch - 12 * k, yaw: s.yaw + 18 * k, dist: s.dist * (1 - 0.24 * k) };
  let shot = pose(current, cover ? 0 : 1 - ease.inOut3(ramp(t, 0, direction.openingSeconds ?? 1.5)));
  const back = cover ? 0 : ease.inOut3(ramp(t, end - 0.62, 0.5));
  if (back > 0) shot = back === 1 ? pose(first, 1) : lerpShot(shot, pose(first, 1), back);
  // Zero motion at frame zero and loop join; deterministic at arbitrary render frames.
  return { ...shot, yaw: shot.yaw + Math.sin(t * 0.45) * (direction.drift ?? 0) * (1 - back) };
}
