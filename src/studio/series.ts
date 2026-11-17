import studio from '../../public/studio.json';

/** How the world layer is finished: one recipe per series, applied to every frame of every episode. */
export type Look = {
  /** size of one world pixel on the 1080 px master (3 → the 3D world is rendered at 360×640 and upscaled, nearest) */
  px: number;
  /** number of flat steps the light falloff (fog, spotlight) is cut into; fewer = more retro */
  levels: number;
  /** ordered-dither amplitude between two steps (0 = hard bands, 1 = full Bayer stipple) */
  dither: number;
  /** strength of the 1-pixel ink line drawn behind silhouettes, 0–1 */
  outline: number;
  /** darkening of every other world row, 0–1 */
  scan: number;
  /** corner darkening, 0–1 */
  vignette: number;
  /** film grain opacity over the finished frame, 0–1. Off by default in DA 2: the stipple already textures the
   *  picture, and a full-frame noise filter costs render time and bitrate for almost nothing visible. */
  grain: number;
};

export type SeriesPalette = {
  /** far background / fog colour */
  bg: string;
  /** lit centre of the table */
  bgGlow: string;
  /** neutral surface of the world (land that is not the subject, table top) */
  surface: string;
  surfaceEdge: string;
  /** grid / guide lines on the table */
  grid: string;
  /** text */
  ink: string;
  muted: string;
  /** the one highlight colour (keywords, active numbers, series tag) */
  accent: string;
  /** secondary colours with a fixed meaning */
  danger: string;
  warn: string;
};

export type SeriesDef = {
  id: string;
  name: string;
  handle: string;
  tagline: string;
  composition: string;
  /** "EP {n}" or "#{nnn}" */
  episodeTag: string;
  palette: SeriesPalette;
  look: Look;
  /** series-bar variant ("A", "B"…); only channels with their own identity read it */
  brand?: string;
  /** the channel's own type: `mono` replaces JetBrains Mono for the data voice (e.g. a typewriter face) */
  type?: { mono?: string };
  /** extra colours of a channel's identity (paper, stamp ink…) */
  extra?: Record<string, string>;
};

type StudioEntry = { name: string; handle: string; tagline: string; legacyNames: string[]; composition: string; episodeTag: string; brand?: string };
const ENTRIES = (studio as unknown as { series: Record<string, StudioEntry> }).series;

const DESIGN: Record<string, { palette: SeriesPalette; look: Look; type?: SeriesDef['type']; extra?: Record<string, string> }> = {
  redrawn: {
    palette: {
      bg: '#05080F', bgGlow: '#16264A', surface: '#2B3759', surfaceEdge: '#141B30', grid: '#22335C',
      ink: '#F4F1EA', muted: '#8C93A8', accent: '#FFC94D', danger: '#E0565B', warn: '#F2994A',
    },
    look: { px: 3, levels: 7, dither: 1, outline: 0.8, scan: 0, vignette: 0.62, grain: 0 },
  },
  receipts: {
    palette: {
      bg: '#03100B', bgGlow: '#14402E', surface: '#245240', surfaceEdge: '#0C2018', grid: '#1D5740',
      ink: '#F3F6EE', muted: '#8FA89B', accent: '#C8F53C', danger: '#FF6B5E', warn: '#FFB648',
    },
    look: { px: 3, levels: 7, dither: 1, outline: 0.8, scan: 0, vignette: 0.5, grain: 0 },
  },
  // THE GETAWAY: a case file on a dark desk. Near-black ink, "evidence" red, beige file paper, typewriter annotations.
  getaway: {
    palette: {
      bg: '#070605', bgGlow: '#1C1712', surface: '#3A3127', surfaceEdge: '#14100C', grid: '#2A231B',
      ink: '#F1E8D6', muted: '#9A8E78', accent: '#E0312B', danger: '#E0312B', warn: '#D9A441',
    },
    look: { px: 3, levels: 6, dither: 1, outline: 0.9, scan: 0, vignette: 0.72, grain: 0 },
    type: { mono: 'Courier Prime' },
    extra: { paper: '#E6D9BC', paperEdge: '#B9A57E', paperInk: '#1A1612', stamp: '#C8231E' },
  },
};

export const SERIES: Record<string, SeriesDef> = Object.fromEntries(
  Object.entries(ENTRIES).map(([id, e]) => [id, { id, ...e, ...(DESIGN[id] ?? DESIGN.redrawn) }]),
);

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Series (= channel) of an episode. `channel` wins, then `seriesId`; otherwise the legacy `series` string is matched against ids,
 * current names and `legacyNames`, so episodes written before a channel was renamed keep resolving.
 */
export function seriesOf(spec: { channel?: string; seriesId?: string; series?: string; composition?: string } | undefined): SeriesDef {
  if (spec?.channel && SERIES[spec.channel]) return SERIES[spec.channel];
  if (spec?.seriesId && SERIES[spec.seriesId]) return SERIES[spec.seriesId];
  const key = slug(spec?.series ?? '');
  for (const [id, e] of Object.entries(ENTRIES)) {
    if (slug(id) === key || slug(e.name) === key || e.legacyNames.some((n) => slug(n) === key)) return SERIES[id];
  }
  const byComp = Object.values(SERIES).find((s) => s.composition === spec?.composition);
  return byComp ?? SERIES.redrawn;
}

/** "EP 3" / "#003" */
export function episodeTag(series: SeriesDef, n?: number): string | null {
  if (n == null) return null;
  return series.episodeTag.replace('{nnn}', String(n).padStart(3, '0')).replace('{n}', String(n));
}
