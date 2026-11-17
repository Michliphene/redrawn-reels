import React from 'react';
import { Img, interpolate, spring, staticFile } from 'remotion';
import type { TimedAction } from '../lib/types';
import { FPS, theme } from '../lib/theme';
import { PixelImg } from '../studio/look/PixelImg';

type A = Extract<TimedAction, { type: 'wanted' }>;

/**
 * Wanted poster: a paper sheet pinned over the world — header, the image (printed on the paper in its own
 * ink when the art direction prints photos), the name, one or two typed lines, the image credit, an optional stamp.
 * It is a design device, not a reproduction of an official document: the header defaults to "WANTED", and the
 * credit line says where the image comes from. Reusable by any series (skinned through `theme`).
 *   { "type": "wanted", "key": "cooper_sketch", "name": "DAN COOPER", "lines": ["Alias. Real name unknown."],
 *     "credit": "FBI composite sketch · public domain", "side": "right", "y": 560, "stamp": "NEVER FOUND", "stampWord": "never" }
 * The image is public/assets/portraits/<key>.jpg (missing image → the poster shows an empty frame with "NO PHOTO").
 */
export const WantedPosters: React.FC<{ t: number; actions: TimedAction[] }> = ({ t, actions }) => (
  <>
    {(actions.filter((a) => a.type === 'wanted') as A[]).map((a, i) => {
      const hold = a.hold ?? 3.5;
      const end = a.t + hold;
      if (t < a.t || t > end + 0.5) return null;
      const W = a.w ?? 420;
      const side = a.side ?? 'right';
      const x = side === 'left' ? theme.inset : side === 'center' ? 540 - W / 2 : 1080 - theme.inset - W - 40;
      const s = a.t <= 0.05 ? 1 : spring({ frame: (t - a.t) * FPS, fps: FPS, config: { damping: 14, stiffness: 150 } }); // on frame 0 it is already pinned (loop)
      const out = interpolate(t, [end, end + 0.45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      const tilt = (a.tilt ?? 2.5) * (1 - 0.4 * s);
      const stampOn = a.stamp && a.stampAt != null && t >= a.stampAt;
      const st = stampOn ? spring({ frame: (t - a.stampAt!) * FPS, fps: FPS, config: { damping: 9, stiffness: 210 } }) : 0;
      const imgH = Math.round(W * 0.86);
      const tw = theme.typewriter || theme.font;
      const ink = theme.paperInk;
      return (
        <div key={i} style={{ position: 'absolute', left: x, top: a.y ?? 560, width: W, opacity: 1 - out,
          transform: `translateY(${(1 - s) * 140 + out * 60}px) rotate(${tilt}deg)`, transformOrigin: '50% 0%' }}>
          {/* pin */}
          <div style={{ position: 'absolute', left: W / 2 - 11, top: -9, width: 22, height: 22, borderRadius: 11, background: theme.stamp, boxShadow: '0 3px 0 rgba(0,0,0,0.6)', zIndex: 2 }} />
          <div style={{ background: theme.paper, padding: '18px 22px 14px', boxShadow: theme.shadow, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontFamily: theme.font, fontWeight: 800, fontSize: W * 0.25, lineHeight: 0.9, color: ink, textAlign: 'center', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{a.head ?? 'WANTED'}</div>
            {a.headSub && <div style={{ fontFamily: tw, fontWeight: 700, fontSize: 21, color: ink, textAlign: 'center', marginTop: 4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{a.headSub}</div>}
            <div style={{ height: 3, background: ink, margin: '10px 0 12px' }} />
            <div style={{ width: W - 44, height: imgH, background: ink, overflow: 'hidden', position: 'relative' }}>
              {a.key && (theme.photo === 'print'
                ? <PixelImg src={staticFile(`assets/portraits/${a.key}.jpg`)} width={W - 44} height={imgH} tones={[ink, mix(ink, theme.paper, 0.35), mix(ink, theme.paper, 0.7), theme.paper]} focus={a.focus ?? '50% 35%'} zoom={a.zoom ?? 1} />
                : <Img src={staticFile(`assets/portraits/${a.key}.jpg`)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: a.focus ?? '50% 35%', filter: 'grayscale(1) contrast(1.15) sepia(0.25)' }} />)}
            </div>
            <div style={{ fontFamily: theme.font, fontWeight: 800, fontSize: W * 0.13, lineHeight: 1, color: ink, marginTop: 12, textTransform: 'uppercase' }}>{a.name}</div>
            {(a.lines ?? []).map((l, k) => (
              <div key={k} style={{ fontFamily: tw, fontWeight: 700, fontSize: 22, lineHeight: 1.15, color: ink, marginTop: k ? 2 : 6 }}>{l}</div>
            ))}
            {a.credit && <div style={{ fontFamily: tw, fontWeight: 400, fontSize: 15, color: mix(ink, theme.paper, 0.45), marginTop: 10 }}>{a.credit}</div>}
            {stampOn && (
              <div style={{ position: 'absolute', left: '50%', top: '46%', transform: `translate(-50%,-50%) rotate(-16deg) scale(${2.3 - 1.3 * st})`, opacity: st * 0.94,
                fontFamily: theme.stampFont || theme.font, fontWeight: 900, fontSize: a.stampSize ?? 58, color: theme.stamp, border: `6px solid ${theme.stamp}`, padding: '4px 16px',
                letterSpacing: '0.06em', whiteSpace: 'nowrap', textTransform: 'uppercase', mixBlendMode: 'multiply' }}>{a.stamp}</div>
            )}
          </div>
        </div>
      );
    })}
  </>
);

function mix(a: string, b: string, k: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.replace('#', '').padEnd(6, '0').slice(i - 1, i + 1), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, '0')).join('');
}
