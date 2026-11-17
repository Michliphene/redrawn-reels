import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Shot } from './rig';

/**
 * Key light + ambient for tabletop worlds, tuned so a surface facing up shows exactly its palette colour
 * (shadows fall to 55 %). The shadow frustum follows the shot, so shadows stay sharp at any zoom.
 */
export const TableLight: React.FC<{ shot: Shot; azimuth?: number; elevation?: number }> = ({ shot, azimuth = -38, elevation = 52 }) => {
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight('#ffffff', 1);
    l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.0008; l.shadow.normalBias = 0.02;
    return l;
  }, []);
  const el = (elevation * Math.PI) / 180, az = (azimuth * Math.PI) / 180;
  const s = shot.dist * 0.9;
  light.intensity = (0.45 * Math.PI) / Math.sin(el);
  light.position.set(shot.target[0] + s * 2 * Math.cos(el) * Math.sin(az), s * 2 * Math.sin(el), shot.target[2] + s * 2 * Math.cos(el) * Math.cos(az));
  light.target.position.set(shot.target[0], 0, shot.target[2]);
  const cam = light.shadow.camera;
  cam.left = -s; cam.right = s; cam.top = s; cam.bottom = -s; cam.near = s * 0.2; cam.far = s * 5; cam.updateProjectionMatrix();
  return (
    <>
      <ambientLight intensity={0.55 * Math.PI} />
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  );
};
