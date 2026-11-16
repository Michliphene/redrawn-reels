import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { W, H, SAFE, ZONES } from '../tokens';

/** Last layer of every v2 frame: a little film grain so type and world sit in the same picture. */
export const Grain: React.FC<{ amount: number }> = ({ amount }) => {
  const f = useCurrentFrame();
  if (amount <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: amount, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
      <svg width={W} height={H}>
        <filter id="studio-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 10} stitchTiles="stitch" /></filter>
        <rect width={W} height={H} filter="url(#studio-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Debug overlay: draws the platform safe area and the fixed bands. Render a still with
 * `--props '{"guides":true}'` to check that nothing readable sits under the Reels/TikTok interface.
 */
export const Guides: React.FC = () => {
  const band = (name: string, z: { top: number; bottom: number }, c: string) => (
    <div key={name} style={{ position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: z.top, height: z.bottom - z.top, border: `2px dashed ${c}`, color: c, font: '700 22px monospace', boxSizing: 'border-box' }}>
      <span style={{ background: 'rgba(0,0,0,0.6)', padding: '2px 6px' }}>{name} {z.top}–{z.bottom}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: SAFE.top, background: 'rgba(255,0,80,0.28)' }} />
      <div style={{ position: 'absolute', left: 0, top: SAFE.bottom, width: W, height: H - SAFE.bottom, background: 'rgba(255,0,80,0.28)' }} />
      <div style={{ position: 'absolute', left: SAFE.railX, top: SAFE.railFrom, width: W - SAFE.railX, height: SAFE.bottom - SAFE.railFrom, background: 'rgba(255,0,80,0.28)' }} />
      {band('hud', ZONES.hud, '#7CFFB2')}{band('title', ZONES.title, '#FFD24D')}{band('stage', ZONES.stage, '#6FC3FF')}{band('captions', ZONES.captions, '#FF9DF5')}
    </AbsoluteFill>
  );
};
