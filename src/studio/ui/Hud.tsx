import React from 'react';
import { SAFE, ZONES, TYPE, W } from '../tokens';
import { episodeTag, type SeriesDef } from '../series';
import { Display, Mono, Whisper, fitDisplay } from './Type';
import { ease, ramp } from '../motion';
import { GetawayBar } from '../brands/getaway';

const SAFE_W = SAFE.right - SAFE.left;

/** Top row of every v2 frame: series tag · episode · (right) whatever the engine counts. Always on screen. */
export const SeriesBar: React.FC<{ series: SeriesDef; episode?: number; right?: React.ReactNode; brand?: string }> = ({ series, episode, right, brand }) => {
  // a channel with its own identity draws its own bar (same band, same job)
  if (series.id === 'getaway') return <GetawayBar series={series} episode={episode} right={right} variant={brand} />;
  const ep = episodeTag(series, episode);
  return (
    <div style={{ position: 'absolute', top: ZONES.hud.top, left: SAFE.left, width: SAFE_W, height: ZONES.hud.bottom - ZONES.hud.top, display: 'flex', alignItems: 'center', gap: 16 }}>
      <Mono size={TYPE.hud} color={series.palette.bg} track={0.22} weight={800}
        style={{ background: series.palette.accent, padding: '9px 14px 8px 17px', borderRadius: 4, textShadow: 'none' }}>{series.name}</Mono>
      {ep && <Mono size={TYPE.hud} color={series.palette.accent} track={0.16}>{ep}</Mono>}
      <div style={{ flex: 1 }} />
      {right}
    </div>
  );
};

/**
 * Title block, left aligned under the series bar: one loud line set (auto-fitted to two or three lines)
 * and an optional quiet line. Used for the hook, the loop tail and covers.
 */
export const TitleBlock: React.FC<{ title: string; whisper?: string; series: SeriesDef; opacity?: number; t?: number; top?: number; max?: number; lines?: number; instant?: boolean }> =
  ({ title, whisper, series, opacity = 1, t = 99, top = ZONES.title.top, max = 124, lines = 3, instant = false }) => {
    if (opacity <= 0.01) return null;
    const size = fitDisplay(title, SAFE_W, lines, max);
    // `instant`: the quiet line is already there on frame 0 (it carries the case name for a paused feed)
    const inP = instant ? 1 : ease.out3(ramp(t, 0, 0.35));
    return (
      <div style={{ position: 'absolute', top, left: SAFE.left, width: SAFE_W, opacity }}>
        <Display size={size} color={series.palette.ink} style={{ textWrap: 'balance' } as React.CSSProperties}>{title}</Display>
        {whisper && <Whisper size={TYPE.whisper} color={series.palette.accent} style={{ marginTop: 14, opacity: inP, transform: `translateY(${(1 - inP) * 10}px)` }}>{whisper}</Whisper>}
      </div>
    );
  };

/** Chapter line: small loud label + quiet sentence. Replaces the title once the hook is over. */
export const Kicker: React.FC<{ text: string; whisper?: string; series: SeriesDef; opacity?: number; top?: number; size?: number }> =
  ({ text, whisper, series, opacity = 1, top = ZONES.title.top, size = 76 }) => {
    if (opacity <= 0.01) return null;
    return (
      <div style={{ position: 'absolute', top, left: SAFE.left, width: SAFE_W, opacity }}>
        <Display size={fitDisplay(text, SAFE_W, 2, size)} color={series.palette.ink} style={{ textWrap: 'balance' } as React.CSSProperties}>{text}</Display>
        {whisper && <Whisper size={TYPE.whisper - 6} color={series.palette.accent} style={{ marginTop: 10 }}>{whisper}</Whisper>}
      </div>
    );
  };

/** Soft darkening behind the title band and the caption band, so type stays readable on any world. */
export const ReadabilityBands: React.FC<{ bg: string; top?: number; bottom?: number }> = ({ bg, top = 0.8, bottom = 0.42 }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: '100%', pointerEvents: 'none',
    background: `linear-gradient(180deg, ${rgba(bg, top)} 0%, ${rgba(bg, top * 0.72)} 14%, ${rgba(bg, 0)} 33%, ${rgba(bg, 0)} 55%, ${rgba(bg, bottom)} 65%, ${rgba(bg, bottom)} 74%, ${rgba(bg, bottom * 0.5)} 82%, ${rgba(bg, bottom * 0.75)} 100%)` }} />
);

function rgba(hex: string, a: number): string {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}
