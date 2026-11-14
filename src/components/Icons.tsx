import React from 'react';
// Original pictograms (drawn for this project, no third-party rights).

export const Soldier: React.FC<{ size: number; color: string; step?: number }> = ({ size, color, step = 0 }) => (
  <svg width={size * 0.6} height={size} viewBox="0 0 24 40" style={{ overflow: 'visible' }}>
    <path d="M6 7 Q12 0 18 7 L18 9 L6 9 Z" fill={color} />{/* helmet */}
    <circle cx="12" cy="11" r="3.4" fill={color} />
    <path d="M7 15 h10 l1 12 h-12 z" fill={color} />{/* torso */}
    <rect x="17.5" y="9" width="1.8" height="16" fill={color} transform="rotate(12 18 17)" />{/* rifle */}
    <rect x={7.5 + step} y="27" width="3.6" height="12" rx="1.5" fill={color} />
    <rect x={12.9 - step} y="27" width="3.6" height="12" rx="1.5" fill={color} />
  </svg>
);

export const Tank: React.FC<{ size: number; color: string; flip?: boolean }> = ({ size, color, flip }) => (
  <svg width={size * 1.6} height={size} viewBox="0 0 64 40" style={{ transform: flip ? 'scaleX(-1)' : undefined, overflow: 'visible' }}>
    <rect x="4" y="24" width="56" height="12" rx="6" fill={color} />{/* tracks */}
    {[12, 22, 32, 42, 52].map((x) => <circle key={x} cx={x} cy="30" r="3.4" fill="rgba(0,0,0,0.35)" />)}
    <path d="M8 24 L14 16 H50 L56 24 Z" fill={color} />{/* hull */}
    <path d="M22 16 Q24 8 34 8 Q42 8 42 16 Z" fill={color} />{/* turret */}
    <rect x="40" y="10" width="22" height="3.2" rx="1.2" fill={color} />{/* barrel */}
  </svg>
);

export const Person: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size * 0.55} height={size} viewBox="0 0 22 40">
    <circle cx="11" cy="7" r="6" fill={color} />
    <path d="M2 40 V22 Q2 15 11 15 Q20 15 20 22 V40 Z" fill={color} />
  </svg>
);
