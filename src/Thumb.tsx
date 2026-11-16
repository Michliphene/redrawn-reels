import React from 'react';
import { AbsoluteFill } from 'remotion';
import { geoAzimuthalEqualArea, geoCentroid } from 'd3-geo';
import type { GeoData, EpisodeSpec } from './lib/types';
import { MapLayer } from './components/MapLayer';
import { setPalette, theme, isFocus, isOutline } from './lib/theme';

export type ThumbConfig = {
  kicker: string; main: string; badge?: string; badgeSub?: string;
  fit?: string[];            // feature ids to frame (default: all focus features)
  mapBox?: [number, number, number, number]; // x0,y0,x1,y1 of the map area
  mainSize?: number; mapSide?: 'right' | 'left';
};
export type ThumbProps = { episodeId: string; spec?: EpisodeSpec & { thumb?: ThumbConfig; episode?: number }; geo?: GeoData };

/** 1920x1080 thumbnail (YouTube / landscape previews): big hook text + the episode's map, same palette as the reel. */
export const Thumb: React.FC<ThumbProps> = ({ spec, geo }) => {
  const cfg = spec!.thumb!;
  setPalette(spec!.palette);
  const [x0, y0, x1, y1] = cfg.mapBox ?? [900, 40, 1880, 1040];
  const ids = cfg.fit;
  const feats = geo!.features.filter((f) => (ids ? ids.includes(String(f.id)) : isFocus(f) && !isOutline(f)));
  const fc: any = { type: 'FeatureCollection', features: feats };
  const c = geoCentroid(fc) as [number, number];
  const projection = geoAzimuthalEqualArea().rotate([-c[0], -c[1]]).fitExtent([[x0, y0], [x1, y1]], fc).clipAngle(95);
  const epTag = spec!.episode != null ? `EP ${spec!.episode}` : '';
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 70% 50%, ${theme.seaGlow} 0%, ${theme.sea} 72%)`, fontFamily: 'Montserrat' }}>
      <MapLayer geo={geo!} projection={projection} t={0} actions={[]} width={1920} height={1080} />
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
