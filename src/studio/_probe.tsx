import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export const Probe3D: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#0B1120' }}>
      <ThreeCanvas width={1080} height={1920} camera={{ position: [0, 3, 6], fov: 40 }} shadows>
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 8, 3]} intensity={2} castShadow />
        <mesh rotation={[0.4, f / 20, 0]} castShadow><boxGeometry args={[2, 2, 2]} /><meshStandardMaterial color="#E0565B" /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial color="#1F2738" /></mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
