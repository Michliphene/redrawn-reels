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
  /** film grain opacity over the finished frame, 0–1 */
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
};

type StudioEntry = { name: string; handle: string; tagline: string; legacyNames: string[]; composition: string; episodeTag: string };
const ENTRIES = (studio as unknown as { series: Record<string, StudioEntry> }).series;

const DESIGN: Record<string, { palette: SeriesPalette; look: Look }> = {
  redrawn: {
    palette: {
      bg: '#05080F', bgGlow: '#16264A', surface: '#2B3759', surfaceEdge: '#141B30', grid: '#22335C',
      ink: '#F4F1EA', muted: '#8C93A8', accent: '#FFC94D', danger: '#E0565B', warn: '#F2994A',
    },
    look: { px: 3, levels: 7, dither: 1, outline: 0.8, scan: 0, vignette: 0.62, grain: 0.05 },
  },
  receipts: {
    palette: {
      bg: '#03100B', bgGlow: '#14402E', surface: '#245240', surfaceEdge: '#0C2018', grid: '#1D5740',
      ink: '#F3F6EE', muted: '#8FA89B', accent: '#C8F53C', danger: '#FF6B5E', warn: '#FFB648',
    },
    look: { px: 3, levels: 7, dither: 1, outline: 0.8, scan: 0, vignette: 0.5, grain: 0.05 },
  },
};

export const SERIES: Record<string, SeriesDef> = Object.fromEntries(
  Object.entries(ENTRIES).map(([id, e]) => [id, { id, ...e, ...(DESIGN[id] ?? DESIGN.redrawn) }]),
);

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Series of an episode. `seriesId` wins; otherwise the legacy `series` string is matched against ids,
 * current names and `legacyNames`, so episodes written before a channel was renamed keep resolving.
 */
export function seriesOf(spec: { seriesId?: string; series?: string; composition?: string } | undefined): SeriesDef {
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
