import React from 'react';
import * as THREE from 'three';

/**
 * Low-poly products for RECEIPTS, built from primitives only (nothing downloaded, nothing to license).
 * Each model is about 3 units wide, sits on y = 0 and is meant to be seen at 360 px: keep shapes chunky.
 * A new product = one component here + one line in PRODUCTS.
 */
const cap = new THREE.CapsuleGeometry(1, 1, 3, 10);
const cyl = new THREE.CylinderGeometry(1, 1, 1, 14);
const box = new THREE.BoxGeometry(1, 1, 1);
const dome = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
const ball = new THREE.SphereGeometry(1, 8, 6);
const M: React.FC<{ c: string }> = ({ c }) => <meshLambertMaterial color={c} />;

export const HotDog: React.FC = () => (
  <group position={[0, 0.62, 0]}>
    {/* bun halves */}
    <mesh geometry={cap} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.34]} scale={[0.5, 1.75, 0.5]} castShadow><M c="#E7B565" /></mesh>
    <mesh geometry={cap} rotation={[0, 0, Math.PI / 2]} position={[0, 0, -0.34]} scale={[0.5, 1.75, 0.5]} castShadow><M c="#D89A45" /></mesh>
    {/* sausage, a little longer than the bun */}
    <mesh geometry={cap} rotation={[0, 0, Math.PI / 2]} position={[0, 0.3, 0]} scale={[0.36, 2.35, 0.36]} castShadow><M c="#C8452C" /></mesh>
    {/* mustard zigzag */}
    {Array.from({ length: 9 }, (_, i) => (
      <mesh key={i} geometry={box} position={[-1.2 + i * 0.3, 0.66, i % 2 ? 0.11 : -0.11]} rotation={[0, i % 2 ? 0.75 : -0.75, 0]} scale={[0.36, 0.1, 0.12]} castShadow><M c="#FFD23F" /></mesh>
    ))}
  </group>
);

export const Burger: React.FC = () => (
  <group>
    <mesh geometry={cyl} position={[0, 0.2, 0]} scale={[1.25, 0.4, 1.25]} castShadow><M c="#D9963F" /></mesh>
    <mesh geometry={cyl} position={[0, 0.56, 0]} scale={[1.32, 0.32, 1.32]} castShadow><M c="#5E3220" /></mesh>
    <mesh geometry={box} position={[0, 0.76, 0]} rotation={[0, Math.PI / 4, 0]} scale={[2.2, 0.08, 2.2]} castShadow><M c="#FFC93C" /></mesh>
    <mesh geometry={cyl} position={[0, 0.88, 0]} scale={[1.2, 0.14, 1.2]} castShadow><M c="#E5463B" /></mesh>
    <mesh geometry={cyl} position={[0, 1.02, 0]} scale={[1.4, 0.12, 1.4]} castShadow><M c="#6CC04A" /></mesh>
    <mesh geometry={dome} position={[0, 1.08, 0]} scale={[1.28, 0.95, 1.28]} castShadow><M c="#F0B055" /></mesh>
    {[[0.4, 0.2], [-0.5, 0.35], [0.1, -0.55], [-0.2, 0.75], [0.7, -0.35], [-0.75, -0.3], [0, 0]].map(([x, z], i) => (
      <mesh key={i} geometry={ball} position={[x, 1.08 + Math.sqrt(Math.max(0, 1 - (x * x + z * z) / 1.64)) * 0.95, z]} scale={[0.09, 0.05, 0.06]}><M c="#FFF3D6" /></mesh>
    ))}
  </group>
);

export const TV: React.FC = () => {
  const tri = React.useMemo(() => {
    const s = new THREE.Shape([new THREE.Vector2(-0.28, 0.36), new THREE.Vector2(0.4, 0), new THREE.Vector2(-0.28, -0.36)]);
    return new THREE.ShapeGeometry(s);
  }, []);
  return (
    <group>
      <mesh geometry={box} position={[0, 0.06, 0]} scale={[1.5, 0.12, 0.7]} castShadow><M c="#2B3A33" /></mesh>
      <mesh geometry={box} position={[0, 0.32, 0]} scale={[0.26, 0.5, 0.2]} castShadow><M c="#2B3A33" /></mesh>
      <mesh geometry={box} position={[0, 1.5, 0]} scale={[3.3, 1.95, 0.2]} castShadow><M c="#131C18" /></mesh>
      <mesh geometry={box} position={[0, 1.5, 0.105]} scale={[3.02, 1.68, 0.02]}><meshBasicMaterial color="#E5463B" /></mesh>
      <mesh geometry={cyl} position={[0, 1.5, 0.12]} rotation={[Math.PI / 2, 0, 0]} scale={[0.56, 0.02, 0.56]}><meshBasicMaterial color="#F6F1EA" /></mesh>
      <mesh geometry={tri} position={[0, 1.5, 0.14]}><meshBasicMaterial color="#E5463B" /></mesh>
      <mesh geometry={box} position={[-0.55, 0.86, 0.12]} scale={[1.6, 0.06, 0.02]}><meshBasicMaterial color="#F6F1EA" /></mesh>
    </group>
  );
};

/** A desk model airliner on a stand: generic white body, no livery, no logo (brand names stay text only). */
export const Plane: React.FC = () => {
  const wing = (side: 1 | -1) => (
    <group position={[-0.05, -0.12, 0]} rotation={[0, side * 0.42, 0]}>
      <mesh geometry={box} position={[0, 0, side * 1.05]} scale={[0.95, 0.09, 2.1]} castShadow><M c="#D5DCE2" /></mesh>
      <mesh geometry={box} position={[-0.38, 0.12, side * 2.05]} rotation={[0, 0, 0.1]} scale={[0.34, 0.3, 0.06]} castShadow><M c="#C8F53C" /></mesh>
      <mesh geometry={cyl} position={[0.32, -0.26, side * 0.85]} rotation={[0, 0, Math.PI / 2]} scale={[0.22, 0.72, 0.22]} castShadow><M c="#8D99A4" /></mesh>
      <mesh geometry={cyl} position={[0.69, -0.26, side * 0.85]} rotation={[0, 0, Math.PI / 2]} scale={[0.16, 0.03, 0.16]}><meshBasicMaterial color="#1B2A22" /></mesh>
    </group>
  );
  return (
    <group>
      {/* stand */}
      <mesh geometry={cyl} position={[0, 0.05, 0]} scale={[0.7, 0.1, 0.7]} castShadow><M c="#2B3A33" /></mesh>
      <mesh geometry={cyl} position={[0, 0.55, 0]} scale={[0.07, 0.95, 0.07]} castShadow><M c="#2B3A33" /></mesh>
      <group position={[0, 1.18, 0]} rotation={[0, 0, 0.06]}>
        {/* fuselage + nose */}
        <mesh geometry={cap} rotation={[0, 0, Math.PI / 2]} scale={[0.4, 1.2, 0.4]} castShadow><M c="#EEF1F4" /></mesh>
        <mesh geometry={box} position={[1.5, 0.15, 0]} rotation={[0, 0, -0.45]} scale={[0.22, 0.12, 0.5]}><meshBasicMaterial color="#1B2A22" /></mesh>
        {/* windows */}
        {Array.from({ length: 9 }, (_, i) => (
          <React.Fragment key={i}>
            <mesh geometry={box} position={[-1.15 + i * 0.3, 0.1, 0.39]} scale={[0.1, 0.11, 0.03]}><meshBasicMaterial color="#1B2A22" /></mesh>
            <mesh geometry={box} position={[-1.15 + i * 0.3, 0.1, -0.39]} scale={[0.1, 0.11, 0.03]}><meshBasicMaterial color="#1B2A22" /></mesh>
          </React.Fragment>
        ))}
        {wing(1)}{wing(-1)}
        {/* tail: fin + stabilisers */}
        <mesh geometry={box} position={[-1.45, 0.62, 0]} rotation={[0, 0, -0.5]} scale={[0.7, 0.95, 0.08]} castShadow><M c="#3A4A5C" /></mesh>
        <mesh geometry={box} position={[-1.62, 0.8, 0]} rotation={[0, 0, -0.5]} scale={[0.36, 0.22, 0.1]}><M c="#C8F53C" /></mesh>
        <mesh geometry={box} position={[-1.5, 0.08, 0]} scale={[0.5, 0.06, 1.6]} castShadow><M c="#D5DCE2" /></mesh>
      </group>
    </group>
  );
};

/** key of `scenes.<id>.art` → model and the box it fills (used to frame it) */
export const PRODUCTS: Record<string, { El: React.FC; w: number; h: number; d: number }> = {
  hotdog: { El: HotDog, w: 3.6, h: 1.5, d: 1.6 },
  burger: { El: Burger, w: 2.9, h: 2.1, d: 2.9 },
  tv: { El: TV, w: 3.4, h: 2.5, d: 0.9 },
  plane: { El: Plane, w: 4.0, h: 2.0, d: 3.6 },
};
