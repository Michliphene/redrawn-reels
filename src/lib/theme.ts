export const W = 1080, H = 1920, FPS = 30;
export const theme = {
  sea: '#0B1120', seaGlow: '#13203A', land: '#1F2738', landStroke: '#2E3950',
  union: '#C1272D', unionStroke: '#E2545A', text: '#F4F1EA', muted: '#8C93A8', accent: '#FFC94D',
};
// one colour per republic once independent (muted, distinct, readable on navy)
export const REPUBLIC_COLORS: Record<string, string> = {
  RUS: '#E0565B', UKR: '#F2C14E', BLR: '#7FB77E', EST: '#5DA9E9', LVA: '#B56576', LTU: '#E9A03B',
  MDA: '#9C89B8', GEO: '#F28482', ARM: '#F6BD60', AZE: '#4FB3BF', KAZ: '#56CFE1', UZB: '#84A59D',
  TKM: '#C8B6FF', KGZ: '#FF8C61', TJK: '#A3C4BC',
};

/** Per-episode palette (set once by Episode from episode.json `palette`). */
export type Palette = { start: string; startStroke: string; ids: Record<string, string>; static: Record<string, string> };
export const PALETTE: Palette = { start: theme.union, startStroke: theme.unionStroke, ids: REPUBLIC_COLORS, static: {} };
export function setPalette(p?: Partial<Palette>) {
  PALETTE.start = p?.start ?? theme.union; PALETTE.startStroke = p?.startStroke ?? theme.unionStroke;
  PALETTE.ids = { ...REPUBLIC_COLORS, ...(p?.ids ?? {}) }; PALETTE.static = p?.static ?? {};
}
export const isFocus = (f: any) => !!(f?.properties?.focus || f?.properties?.soviet);
export const isOutline = (f: any) => f?.id === 'SOVIET_OUTLINE' || f?.id === 'FOCUS_OUTLINE';
