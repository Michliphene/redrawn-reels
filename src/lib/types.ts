import type { FeatureCollection, Feature } from 'geojson';
export type LonLat = [number, number];
export type Camera = { fit?: string; pad?: number; center?: LonLat; span?: number; dur?: number };
export type Action =
  | { type: 'declare'; id: string; atWord?: string; date?: string; flag?: string; flagNote?: string }
  | { type: 'pulse'; ids: string[]; atWord?: string }
  | { type: 'label'; text: string; at: LonLat; size?: 'xl' | 'md'; hold?: number; atWord?: string; flag?: string }
  | { type: 'marker'; text: string; at: LonLat; hold?: number; atWord?: string }
  | { type: 'date'; date: string; atWord?: string }
  | { type: 'dissolve'; atWord?: string }
  | { type: 'allLabels'; atWord?: string }
  | { type: 'units'; kind: 'tanks' | 'troops' | 'crowd'; at: LonLat; offset?: [number, number]; approach?: [number, number]; count?: number; size?: number; spread?: number;
      color?: string; dur?: number; hold?: number; retreatAt?: number; retreatWord?: string; caption?: string; atWord?: string }
  | { type: 'portrait'; key: string; name: string; role: string; side?: 'left' | 'right' | 'center'; col?: number; row?: number; y?: number;
      small?: boolean; focus?: string; zoom?: number; ring?: string; hold?: number; stamp?: string; stampWord?: string; stampAt?: number; atWord?: string }
  | { type: 'flagSwap'; from: string; to: string; x?: number; hold?: number; caption?: string; atWord?: string }
  | { type: 'shake'; amount?: number; atWord?: string }
  | { type: 'ghost'; id: string; label?: string; color?: string; hold?: number; atWord?: string }
  | { type: 'path'; coords: LonLat[]; color?: string; width?: number; dur?: number; hold?: number; label?: string; labelAt?: LonLat; atWord?: string }
  | { type: 'bigNumber'; value: number; from?: number; prefix?: string; suffix?: string; decimals?: number; label?: string; y?: number; dur?: number; hold?: number; coins?: boolean; atWord?: string }
  | { type: 'archive'; src: string; caption: string; credit: string; y?: number; w?: number; hold?: number; focus?: string; atWord?: string }
  | { type: 'callout'; text: string; sub?: string; size?: number; y?: number; hold?: number; stamp?: string; stampWord?: string; stampAt?: number; atWord?: string }
  | { type: 'region'; text: string; at: LonLat; hold?: number; atWord?: string }
  | { type: 'sticker'; emoji?: string; flag?: string; at?: LonLat; dx?: number; dy?: number; x?: number; y?: number; size?: number; tilt?: number; text?: string; hold?: number; atWord?: string }
  | { type: 'chapter'; emoji: string; text: string; atWord?: string }
  | { type: 'recolor'; ids: string[]; atWord?: string }
  | { type: 'pointer'; at: LonLat; text: string; from?: [number, number]; hold?: number; atWord?: string }
  // ---- data episodes (DataEpisode) ----
  | { type: 'chart'; chart: string; drawTo?: number; atWord?: string }          // show a chart (replaces the current one); line charts start drawn up to drawTo
  | { type: 'hideChart'; atWord?: string }
  | { type: 'hideMarks'; atWord?: string }                                     // clear line-chart marks (e.g. for a clean loop frame)
  | { type: 'reveal'; item: string; nowWord?: string; nowAt?: number; atWord?: string }                           // thenNow row appears
  | { type: 'focus'; item: string | null; atWord?: string }                     // highlight one row, dim the others (null = clear)
  | { type: 'drawTo'; x: number; dur?: number; atWord?: string }                // line chart draws up to x
  | { type: 'mark'; x: number; text: string; series?: string; tone?: 'good' | 'bad' | 'neutral'; hold?: number; atWord?: string };
export type Beat = { id: string; say: string; camera?: Camera; date?: string | null; actions?: Action[]; hideLocator?: boolean; hideChapter?: boolean };
export type EpisodeSpec = {
  id: string; series: string; title: string; data: string;
  timeline: { from: string; to: string; step?: number }; beats: Beat[];
  palette?: { start?: string; startStroke?: string; ids?: Record<string, string>; static?: Record<string, string> };
  counter?: { label: string; total: number } | false; legend?: boolean; locator?: boolean;
  kind?: 'map' | 'data'; source?: string; footnote?: string; disclaimer?: string;
};
export type Word = { w: string; start: number; end: number };
export type Timings = { duration: number; beats: { id: string; start: number; end: number; words: Word[] }[] };
export type GeoData = FeatureCollection & { features: (Omit<Feature, "id"> & { id: string })[] };
export type EpisodeProps = { episodeId: string; spec?: EpisodeSpec; timings?: Timings; geo?: GeoData; lottieKeys?: string[] };
/** an action resolved to an absolute time in seconds */
export type TimedAction = Action & { t: number; beat: string };
