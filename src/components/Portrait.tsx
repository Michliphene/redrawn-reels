import React from 'react';
import { Img, staticFile, spring, interpolate } from 'remotion';
import type { TimedAction } from '../lib/types';
import { FPS, theme } from '../lib/theme';
import { PixelImg } from '../studio/look/PixelImg';

type P = Extract<TimedAction, { type: 'portrait' }>;
export type Credit = { artist: string; license: string; date: string; file: string };

/** Leader card: archive photo (licence-checked, credited on screen), name, role, optional stamp. */
export const Portraits: React.FC<{ t: number; actions: TimedAction[]; credits: Record<string, Credit> }> = ({ t, actions, credits }) => {
  const ps = actions.filter((a) => a.type === 'portrait') as P[];
  const slot: Record<string, number> = {};
  return (
    <>
      {ps.map((p, i) => {
        const end = p.t + (p.hold ?? 3);
        if (t < p.t || t > end + 0.5) return null;
        const side = p.side ?? 'left';
        const s = spring({ frame: (t - p.t) * FPS, fps: FPS, config: { damping: 15, stiffness: 140 } });
        const out = interpolate(t, [end, end + 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const idx = (slot[side + (p.row ?? 0)] = (slot[side + (p.row ?? 0)] ?? -1) + 1);
        const W = p.small ? 260 : 300;
        const x = side === 'left' ? theme.inset : side === 'right' ? 1080 - theme.inset - W : 540 - W / 2 + (p.col ?? 0) * (W + 20);
        const y = (p.y ?? 900) + (p.row ?? 0) * 0;
        const dir = side === 'right' ? 1 : -1;
        const tx = (1 - s) * dir * 420 + out * dir * 420;
        const c = credits[p.key];
        const stampOn = p.stamp && p.stampAt != null && t >= p.stampAt;
        const st = stampOn ? spring({ frame: (t - p.stampAt!) * FPS, fps: FPS, config: { damping: 9, stiffness: 200 } }) : 0;
        const color = interpolate(t, [p.t + 0.2, p.t + 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        void idx;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: W, transform: `translateX(${tx}px)`, opacity: 1 - out * 0.6 }}>
            <div style={{ position: 'relative', width: W, height: W * 1.18, borderRadius: theme.radius, overflow: 'hidden', border: `5px solid ${p.ring ?? theme.accent}`,
              boxShadow: theme.shadow, background: '#111' }}>
              {theme.photo === 'print' ? (
                <PixelImg src={staticFile(`assets/portraits/${p.key}.jpg`)} width={W} height={Math.round(W * 1.18)} tones={theme.photoTones} focus={p.focus ?? '50% 25%'} zoom={p.zoom ?? 1}
                  style={{ transform: `scale(${1.08 - 0.08 * Math.min(1, (t - p.t) / 3)})`, transformOrigin: p.focus ?? '50% 25%' }} />
              ) : (
              <Img src={staticFile(`assets/portraits/${p.key}.jpg`)} style={{ width: '100%', height: '100%', objectFit: 'cover',
                objectPosition: p.focus ?? '50% 25%', filter: `grayscale(${0.35 + 0.65 * color}) contrast(1.1)`,
                transform: `scale(${(p.zoom ?? 1) * (1.08 - 0.08 * Math.min(1, (t - p.t) / 3))})`, transformOrigin: p.focus ?? '50% 25%' }} />
              )}
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '40px 14px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.92))' }}>
                <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: p.small ? 30 : 34, color: '#fff', lineHeight: 1.05 }}>{p.name}</div>
                <div style={{ fontFamily: theme.font, fontWeight: 600, fontSize: p.small ? 24 : 26, color: '#FFC94D', marginTop: 3 }}>{p.role}</div>
              </div>
              {stampOn && (
                <div style={{ position: 'absolute', top: '32%', left: '50%', transform: `translate(-50%,-50%) rotate(-14deg) scale(${2.2 - 1.2 * st})`, opacity: st,
                  fontFamily: theme.font, fontWeight: 900, fontSize: 40, color: '#E8443A', border: '5px solid #E8443A', padding: '4px 12px', borderRadius: 6,
                  background: 'rgba(0,0,0,0.35)', letterSpacing: 3 }}>{p.stamp}</div>
              )}
            </div>
            {c && <div style={{ fontFamily: theme.font, fontSize: 17, color: 'rgba(255,255,255,0.75)', marginTop: 5, lineHeight: 1.2 }}>
              Photo: {c.artist.slice(0, 48)} · {c.license}</div>}
          </div>
        );
      })}
    </>
  );
};
