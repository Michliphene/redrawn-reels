import React, { useEffect, useState } from 'react';
import { Img, staticFile, spring, interpolate, delayRender, continueRender, Sequence } from 'remotion';
import { Lottie, LottieAnimationData } from '@remotion/lottie';
import { GeoProjection } from 'd3-geo';
import type { TimedAction } from '../lib/types';
import { FPS, theme } from '../lib/theme';

type S = Extract<TimedAction, { type: 'sticker' }>;
type C = Extract<TimedAction, { type: 'chapter' }>;
type P = Extract<TimedAction, { type: 'pointer' }>;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Emoji: animated Noto Lottie (public/assets/emoji/<key>.json) if present, else Fluent 3D PNG (<key>.png). */
const Emoji: React.FC<{ k: string; size: number; lottie: boolean }> = ({ k, size, lottie }) => {
  const [data, setData] = useState<LottieAnimationData | null>(null);
  const [handle] = useState(() => (lottie ? delayRender(`lottie ${k}`) : null));
  useEffect(() => {
    if (!lottie || handle == null) return;
    fetch(staticFile(`assets/emoji/${k}.json`)).then((r) => r.json()).then((j) => { setData(j); continueRender(handle); })
      .catch(() => continueRender(handle));
  }, [k, lottie, handle]);
  if (lottie) return data ? <Lottie animationData={data} loop style={{ width: size, height: size }} /> : null;
  return <Img src={staticFile(`assets/emoji/${k}.png`)} style={{ width: size, height: size }} />;
};

export const Stickers: React.FC<{ t: number; actions: TimedAction[]; projection: GeoProjection; lottieKeys: string[] }> = ({ t, actions, projection, lottieKeys }) => (
  <>
    {(actions.filter((a) => a.type === 'sticker') as S[]).map((a, i) => {
      const hold = a.hold ?? 2.2; if (t < a.t - 0.05 || t > a.t + hold + 0.4) return null;
      const pop = spring({ frame: (t - a.t) * FPS, fps: FPS, config: { damping: 9, stiffness: 180 } });
      const out = interpolate(t, [a.t + hold, a.t + hold + 0.4], [1, 0], clamp);
      let x = a.x ?? 540, y = a.y ?? 900;
      if (a.at) { const p = projection(a.at); if (!p) return null; x = p[0] + (a.dx ?? 0); y = p[1] + (a.dy ?? 0); }
      const size = a.size ?? 170;
      const wob = Math.sin((t - a.t) * 6) * 6 * (1 - Math.min(1, (t - a.t) / 1.5));
      return (
        <Sequence key={i} from={Math.round(a.t * FPS)} layout="none">
          <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: out,
            transform: `scale(${pop * (0.9 + 0.1 * out)}) rotate(${wob + (a.tilt ?? 0)}deg)`, filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.55))' }}>
            <Emoji k={a.emoji} size={size} lottie={lottieKeys.includes(a.emoji)} />
            {a.text && <div style={{ position: 'absolute', top: size * 0.95, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap',
              fontFamily: 'Montserrat', fontWeight: 900, fontSize: 34, color: '#0B1120', background: theme.accent, padding: '4px 14px', borderRadius: 8 }}>{a.text}</div>}
          </div>
        </Sequence>
      );
    })}
  </>
);

/** Chapter chip under the date: emoji + 1–3 word heading; stays until the next chapter. */
export const Chapters: React.FC<{ t: number; actions: TimedAction[]; lottieKeys: string[] }> = ({ t, actions, lottieKeys }) => {
  const cs = (actions.filter((a) => a.type === 'chapter') as C[]).sort((a, b) => a.t - b.t);
  const idx = cs.findIndex((c, i) => t >= c.t && (i === cs.length - 1 || t < cs[i + 1].t));
  if (idx < 0) return null;
  const c = cs[idx];
  const s = spring({ frame: (t - c.t) * FPS, fps: FPS, config: { damping: 14, stiffness: 200 } });
  return (
    <div style={{ position: 'absolute', top: 300, width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(11,17,32,0.88)', border: `3px solid ${theme.accent}`,
        borderRadius: 50, padding: '6px 26px 6px 10px', transform: `translateY(${(1 - s) * -30}px) scale(${0.85 + 0.15 * s})`, opacity: s,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
        <Sequence from={Math.round(c.t * FPS)} layout="none"><Emoji k={c.emoji} size={64} lottie={lottieKeys.includes(c.emoji)} /></Sequence>
        <span style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 40, color: theme.text, letterSpacing: 2, textTransform: 'uppercase' }}>{c.text}</span>
      </div>
    </div>
  );
};

/** Arrow pointing at a place, with a short label ("THIS IS ALASKA"). */
export const Pointers: React.FC<{ t: number; actions: TimedAction[]; projection: GeoProjection }> = ({ t, actions, projection }) => (
  <>
    {(actions.filter((a) => a.type === 'pointer') as P[]).map((a, i) => {
      const hold = a.hold ?? 2.2; if (t < a.t || t > a.t + hold + 0.4) return null;
      const p = projection(a.at); if (!p) return null;
      const s = spring({ frame: (t - a.t) * FPS, fps: FPS, config: { damping: 11, stiffness: 160 } });
      const o = interpolate(t, [a.t + hold, a.t + hold + 0.4], [1, 0], clamp);
      const [dx, dy] = a.from ?? [220, -220];
      const bob = Math.sin((t - a.t) * 7) * 8;
      const tipX = p[0] + dx * 0.12, tipY = p[1] + dy * 0.12 + bob * 0.3;
      const tailX = p[0] + dx, tailY = p[1] + dy + bob;
      const ang = Math.atan2(tipY - tailY, tipX - tailX);
      const ex = tailX + (tipX - tailX) * s, ey = tailY + (tipY - tailY) * s;
      return (
        <div key={i} style={{ position: 'absolute', inset: 0, opacity: o }}>
          <svg width={1080} height={1920} style={{ position: 'absolute' }}>
            <line x1={tailX} y1={tailY} x2={ex} y2={ey} stroke="#000" strokeOpacity={0.5} strokeWidth={16} strokeLinecap="round" />
            <line x1={tailX} y1={tailY} x2={ex} y2={ey} stroke={theme.accent} strokeWidth={10} strokeLinecap="round" />
            <polygon points="0,-20 36,0 0,20" fill={theme.accent} stroke="#000" strokeWidth={2}
              transform={`translate(${ex} ${ey}) rotate(${(ang * 180) / Math.PI})`} />
          </svg>
          <div style={{ position: 'absolute', left: Math.min(Math.max(tailX, 200), 880), top: tailY + (dy < 0 ? -64 : 18),
            fontFamily: 'Montserrat', fontWeight: 900, fontSize: 40, color: '#0B1120', background: theme.accent, padding: '6px 18px', borderRadius: 10,
            whiteSpace: 'nowrap', transform: `translateX(-50%) scale(${s})` } as React.CSSProperties}>{a.text}</div>
        </div>
      );
    })}
  </>
);
