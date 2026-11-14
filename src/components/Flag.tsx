import React from 'react';
import { Img, staticFile } from 'remotion';

/** Flag that waves (cheap 3D skew), from public/assets/flags/<code>.svg */
export const Flag: React.FC<{ code: string; h: number; t: number; wave?: number; style?: React.CSSProperties }> = ({ code, h, t, wave = 1, style }) => {
  const a = Math.sin(t * 5.5) * 7 * wave, b = Math.sin(t * 5.5 + 1.3) * 3 * wave;
  return (
    <div style={{ perspective: 400, display: 'inline-block', ...style }}>
      <Img src={staticFile(`assets/flags/${code}.svg`)} style={{ height: h, width: h * 1.5, objectFit: 'fill', display: 'block', borderRadius: 3,
        transform: `rotateY(${a}deg) skewY(${b}deg)`, boxShadow: '0 6px 16px rgba(0,0,0,0.6)',
        maskImage: 'linear-gradient(100deg, #000 0%, rgba(0,0,0,0.85) 40%, #000 60%, rgba(0,0,0,0.8) 100%)' }} />
    </div>
  );
};
