import * as THREE from 'three';
import { W, H, STAGE_CENTER_Y, ZONES, SAFE } from '../tokens';
import { clamp01, ease, lerp } from '../motion';

/**
 * Camera language for "tabletop" worlds: the subject lies on a table (y = 0, x = east, z = south)
 * and the camera orbits a point of that table. A shot is five numbers, so cue sheets can keyframe it.
 */
export type Vec3 = [number, number, number];
export type Shot = {
  /** point of the table the camera looks at */
  target: Vec3;
  /** camera–target distance, world units */
  dist: number;
  /** degrees above the table (90 = straight down, 20 = low dramatic angle) */
  pitch: number;
  /** degrees around the target; 0 keeps north (−z) at the top of the frame */
  yaw: number;
  /** vertical field of view in degrees (small = flat map, large = strong perspective) */
  fov: number;
  /** degrees of dutch tilt */
  roll?: number;
};
export type ShotKey = { t: number; dur: number; shot: Shot; cut?: boolean };

const rad = (d: number) => (d * Math.PI) / 180;
/** The optical centre sits at the middle of the stage band, not the middle of the frame. */
const SHIFT = H / 2 - STAGE_CENTER_Y;
const FULL_H = H + 2 * SHIFT;

export function makeCamera(s: Shot): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(s.fov, W / FULL_H, 0.05, 600);
  const p = rad(Math.min(89.5, Math.max(2, s.pitch))), y = rad(s.yaw);
  cam.position.set(
    s.target[0] + s.dist * Math.cos(p) * Math.sin(y),
    s.target[1] + s.dist * Math.sin(p),
    s.target[2] + s.dist * Math.cos(p) * Math.cos(y),
  );
  cam.lookAt(s.target[0], s.target[1], s.target[2]);
  if (s.roll) cam.rotateZ(rad(s.roll));
  cam.setViewOffset(W, FULL_H, 0, 2 * SHIFT, W, H);
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();
  return cam;
}

/** World point → pixel of the 1080×1920 frame (far off-screen if the point is behind the camera). */
export function projector(cam: THREE.PerspectiveCamera): (p: Vec3) => [number, number] {
  const v = new THREE.Vector3();
  return (p) => {
    v.set(p[0], p[1], p[2]).applyMatrix4(cam.matrixWorldInverse);
    if (v.z > -cam.near) return [-9999, -9999];
    v.applyMatrix4(cam.projectionMatrix);
    return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H];
  };
}

export function lerpShot(a: Shot, b: Shot, p: number): Shot {
  return {
    target: [lerp(a.target[0], b.target[0], p), lerp(a.target[1], b.target[1], p), lerp(a.target[2], b.target[2], p)],
    dist: Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), p)),
    pitch: lerp(a.pitch, b.pitch, p), yaw: lerp(a.yaw, b.yaw, p), fov: lerp(a.fov, b.fov, p),
    roll: lerp(a.roll ?? 0, b.roll ?? 0, p),
  };
}

/** Eased travelling between keyframes; `cut` jumps on the frame (a new angle = a re-hook). */
export function shotAt(t: number, keys: ShotKey[]): Shot {
  let cur = keys[0].shot;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (t < k.t) break;
    const p = k.cut || k.dur <= 0 ? 1 : ease.inOut3(clamp01((t - k.t) / k.dur));
    cur = lerpShot(cur, k.shot, p);
  }
  return cur;
}

export type Rect = { left: number; right: number; top: number; bottom: number };
export const STAGE_RECT: Rect = { left: SAFE.left + 16, right: SAFE.right - 16, top: ZONES.stage.top, bottom: ZONES.stage.bottom };

/**
 * Closest shot (for a given angle) that keeps every point inside `rect`, centred on it.
 * Used for `camera: {fit: …}` cues: the subject always lands in the stage band, whatever its shape.
 */
export function fitShot(points: Vec3[], base: { pitch: number; yaw: number; fov: number; roll?: number }, rect: Rect = STAGE_RECT): Shot {
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]), zs = points.map((p) => p[2]);
  let target: Vec3 = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2];
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs), 0.01);
  const boxOf = (shot: Shot) => {
    const pr = projector(makeCamera(shot));
    const pts = points.map(pr);
    return { l: Math.min(...pts.map((q) => q[0])), r: Math.max(...pts.map((q) => q[0])), t: Math.min(...pts.map((q) => q[1])), b: Math.max(...pts.map((q) => q[1])) };
  };
  const rw = rect.right - rect.left, rh = rect.bottom - rect.top, cx = (rect.left + rect.right) / 2, cy = (rect.top + rect.bottom) / 2;
  let dist = span * 3;
  for (let pass = 0; pass < 4; pass++) {
    // distance: the projected box must be no larger than the rect
    let lo = span * 0.05, hi = span * 400;
    for (let i = 0; i < 40; i++) {
      const mid = Math.sqrt(lo * hi);
      const b = boxOf({ ...base, target, dist: mid });
      if (b.r - b.l <= rw && b.b - b.t <= rh && b.l > -9000) hi = mid; else lo = mid;
    }
    dist = hi;
    // centre: slide the target on the table until the projected box is centred in the rect
    const shot = { ...base, target, dist };
    const b = boxOf(shot);
    const ex = (b.l + b.r) / 2 - cx, ey = (b.t + b.b) / 2 - cy;
    if (Math.abs(ex) < 1 && Math.abs(ey) < 1) break;
    const pr0 = projector(makeCamera(shot)), e = span * 0.01;
    const o = pr0(target), px = pr0([target[0] + e, target[1], target[2]]), pz = pr0([target[0], target[1], target[2] + e]);
    const a11 = (px[0] - o[0]) / e, a21 = (px[1] - o[1]) / e, a12 = (pz[0] - o[0]) / e, a22 = (pz[1] - o[1]) / e;
    const det = a11 * a22 - a12 * a21;
    if (Math.abs(det) < 1e-9) break;
    target = [target[0] + (ex * a22 - ey * a12) / det, target[1], target[2] + (-ex * a21 + ey * a11) / det];
  }
  return { ...base, target, dist };
}

/** Distance at which `width` world units span the frame width (for `camera: {center, span}` cues). */
export const distForWidth = (width: number, fov: number) => width / (2 * Math.tan(rad(fov) / 2) * (W / FULL_H));

/** Dolly zoom: change the lens while keeping the subject the same size ("the tower never moves"). */
export const dollyZoom = (s: Shot, fov: number): Shot => ({ ...s, fov, dist: (s.dist * Math.tan(rad(s.fov) / 2)) / Math.tan(rad(fov) / 2) });
