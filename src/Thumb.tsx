import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { geoAzimuthalEqualArea, geoCentroid } from 'd3-geo';
import type { GeoData, EpisodeSpec, TimedAction } from './lib/types';
import { MapLayer } from './components/MapLayer';
import { setPalette, theme, isFocus, isOutline } from './lib/theme';

export type ThumbConfig = {
  kicker: string; main: string; badge?: string; badgeSub?: string;
  fit?: string[];            // feature ids to frame (default: all focus features)
  mapBox?: [number, number, number, number]; // x0,y0,x1,y1 of the map area
  mainSize?: number; mapSide?: 'right' | 'left';
  mapBoxV?: [number, number, number, number]; mainSizeV?: number;
  center?: [number, number]; // projection centre (default: centroid of the framed features; set it for a polar map)
};
/** The map as it stands on frame 0: declares and ghosts the hook gives with atTime 0 (none on older episodes). */
const frame0 = (spec: EpisodeSpec): TimedAction[] =>
  ((spec.beats[0]?.actions ?? []) as any[]).filter((a) => (a.type === 'declare' || a.type === 'ghost') && a.atTime === 0).map((a) => (a.type === 'ghost' ? { ...a, t: -1, hold: 99, beat: spec.beats[0].id } : { ...a, t: 0, beat: spec.beats[0].id }));
export type ThumbProps = { episodeId: string; spec?: EpisodeSpec & { thumb?: ThumbConfig; episode?: number }; geo?: GeoData };

/** 1920x1080 thumbnail (YouTube / landscape previews): big hook text + the episode's map, same palette as the reel. */
export const Thumb: React.FC<ThumbProps> = ({ spec, geo }) => {
  const { width, height } = useVideoConfig();
  if (height > width) return <ThumbVertical spec={spec} geo={geo} episodeId="" />;
  const cfg = spec!.thumb!;
  setPalette(spec!.palette);
  const [x0, y0, x1, y1] = cfg.mapBox ?? [900, 40, 1880, 1040];
  const ids = cfg.fit;
  const feats = geo!.features.filter((f) => (ids ? ids.includes(String(f.id)) : isFocus(f) && !isOutline(f)));
  const fc: any = { type: 'FeatureCollection', features: feats };
  const c = cfg.center ?? (geoCentroid(fc) as [number, number]);
  const projection = geoAzimuthalEqualArea().rotate([-c[0], -c[1]]).fitExtent([[x0, y0], [x1, y1]], fc).clipAngle(95);
  const epTag = spec!.episode != null ? `EP ${spec!.episode}` : '';
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 70% 50%, ${theme.seaGlow} 0%, ${theme.sea} 72%)`, fontFamily: 'Montserrat' }}>
      <MapLayer geo={geo!} projection={projection} t={0} actions={frame0(spec!)} width={1920} height={1080} />
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(11,17,32,0.96) 0%, rgba(11,17,32,0.88) 34%, rgba(11,17,32,0) 56%)' }} />
      <div style={{ position: 'absolute', top: 60, left: 80, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: 9, color: '#0B1120', background: theme.accent, padding: '10px 24px', borderRadius: 8 }}>{spec!.series}</div>
        {epTag && <div style={{ fontWeight: 900, fontSize: 38, letterSpacing: 5, color: theme.accent, border: `4px solid ${theme.accent}`, padding: '6px 18px', borderRadius: 8 }}>{epTag}</div>}
      </div>
      <div style={{ position: 'absolute', left: 80, top: 250, width: 960 }}>
        <div style={{ fontWeight: 800, fontSize: 64, lineHeight: 1.08, color: theme.accent, textTransform: 'uppercase', letterSpacing: 2, textShadow: '0 4px 16px rgba(0,0,0,0.7)' }}>{cfg.kicker}</div>
        <div style={{ fontWeight: 900, fontSize: cfg.mainSize ?? 190, lineHeight: 0.98, color: '#fff', textTransform: 'uppercase', marginTop: 18, letterSpacing: -2,
          WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>{cfg.main}</div>
      </div>
      {cfg.badge && (
        <div style={{ position: 'absolute', left: 80, bottom: 70, display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ fontWeight: 900, fontSize: 150, lineHeight: 1, color: '#0B1120', background: theme.accent, padding: '10px 36px', borderRadius: 24, boxShadow: '0 14px 36px rgba(0,0,0,0.55)' }}>{cfg.badge}</div>
          {cfg.badgeSub && <div style={{ fontWeight: 800, fontSize: 52, lineHeight: 1.1, color: '#fff', textShadow: '0 4px 14px #000', maxWidth: 420 }}>{cfg.badgeSub}</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};

/** 1080x1920 phone cover. Everything sits inside the Instagram grid 3:4 crop (y 240–1680) so one file serves
 *  TikTok cover, Reels cover and the profile grid. Layout: badge, kicker, huge hook, map, price badge. */
const ThumbVertical: React.FC<ThumbProps> = ({ spec, geo }) => {
  const cfg = spec!.thumb!;
  setPalette(spec!.palette);
  const [x0, y0, x1, y1] = cfg.mapBoxV ?? [70, 760, 1010, 1420];
  const ids = cfg.fit;
  const feats = geo!.features.filter((f) => (ids ? ids.includes(String(f.id)) : isFocus(f) && !isOutline(f)));
  const fc: any = { type: 'FeatureCollection', features: feats };
  const c = cfg.center ?? (geoCentroid(fc) as [number, number]);
  const projection = geoAzimuthalEqualArea().rotate([-c[0], -c[1]]).fitExtent([[x0, y0], [x1, y1]], fc).clipAngle(95);
  const epTag = spec!.episode != null ? `EP ${spec!.episode}` : '';
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 60%, ${theme.seaGlow} 0%, ${theme.sea} 70%)`, fontFamily: 'Montserrat' }}>
      <MapLayer geo={geo!} projection={projection} t={0} actions={frame0(spec!)} width={1080} height={1920} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,17,32,0.97) 0%, rgba(11,17,32,0.9) 36%, rgba(11,17,32,0) 46%, rgba(11,17,32,0) 72%, rgba(11,17,32,0.92) 80%)' }} />
      <div style={{ position: 'absolute', top: 290, width: '100%', display: 'flex', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 36, letterSpacing: 8, color: '#0B1120', background: theme.accent, padding: '8px 22px', borderRadius: 8 }}>{spec!.series}</div>
        {epTag && <div style={{ fontWeight: 900, fontSize: 34, letterSpacing: 5, color: theme.accent, border: `4px solid ${theme.accent}`, padding: '4px 16px', borderRadius: 8 }}>{epTag}</div>}
      </div>
      <div style={{ position: 'absolute', top: 390, left: 50, right: 50, textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 64, color: theme.accent, textTransform: 'uppercase', letterSpacing: 2, textShadow: '0 4px 16px rgba(0,0,0,0.7)' }}>{cfg.kicker}</div>
        <div style={{ fontWeight: 900, fontSize: cfg.mainSizeV ?? 168, lineHeight: 0.95, color: '#fff', textTransform: 'uppercase', marginTop: 8, letterSpacing: -2,
          WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>{cfg.main}</div>
      </div>
      {cfg.badge && (
        <div style={{ position: 'absolute', top: 1450, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 130, lineHeight: 1, color: '#0B1120', background: theme.accent, padding: '8px 40px', borderRadius: 24, boxShadow: '0 14px 36px rgba(0,0,0,0.55)' }}>{cfg.badge}</div>
          {cfg.badgeSub && <div style={{ fontWeight: 800, fontSize: 46, color: '#fff', textShadow: '0 4px 14px #000', textTransform: 'uppercase', letterSpacing: 1 }}>{cfg.badgeSub}</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};
