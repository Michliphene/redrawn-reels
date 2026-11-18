import type { FeatureCollection, Feature } from 'geojson';
export type LonLat = [number, number];
export type Camera = { fit?: string; pad?: number; center?: LonLat; span?: number; dur?: number };
type CueTiming = { atWord?: string; occurrence?: number; atTime?: number };
export type Action = CueTiming & (
  | { type: 'declare'; id: string; atWord?: string; date?: string; flag?: string; flagNote?: string }
  | { type: 'pulse'; ids: string[] }
  | { type: 'label'; text: string; at: LonLat; size?: 'xl' | 'md'; hold?: number; atWord?: string; flag?: string }
  | { type: 'marker'; text: string; at: LonLat; hold?: number }
  | { type: 'date'; date: string }
  | { type: 'dissolve' }
  | { type: 'allLabels' }
  | { type: 'units'; kind: 'tanks' | 'troops' | 'crowd'; at: LonLat; offset?: [number, number]; approach?: [number, number]; count?: number; size?: number; spread?: number;
      color?: string; dur?: number; hold?: number; retreatAt?: number; retreatWord?: string; caption?: string }
  | { type: 'portrait'; key: string; name: string; role: string; side?: 'left' | 'right' | 'center'; col?: number; row?: number; y?: number;
      small?: boolean; focus?: string; zoom?: number; ring?: string; hold?: number; stamp?: string; stampWord?: string; stampAt?: number }
  | { type: 'flagSwap'; from: string; to: string; x?: number; hold?: number; caption?: string }
  | { type: 'shake'; amount?: number }
  | { type: 'ghost'; id: string; label?: string; color?: string; hold?: number }
  | { type: 'path'; coords: LonLat[]; from?: number; color?: string; width?: number; dur?: number; hold?: number; label?: string; labelAt?: LonLat }
  | { type: 'bigNumber'; value: number; from?: number; prefix?: string; suffix?: string; decimals?: number; label?: string; y?: number; dur?: number; hold?: number; coins?: boolean }
  | { type: 'archive'; src: string; caption: string; credit: string; y?: number; w?: number; hold?: number; focus?: string }
  | { type: 'callout'; text: string; sub?: string; size?: number; y?: number; hold?: number; stamp?: string; stampWord?: string; stampAt?: number }
  | { type: 'region'; text: string; at: LonLat; hold?: number }
  | { type: 'sticker'; emoji?: string; flag?: string; at?: LonLat; dx?: number; dy?: number; x?: number; y?: number; size?: number; tilt?: number; text?: string; hold?: number }
  | { type: 'chapter'; emoji: string; text: string }
  | { type: 'recolor'; ids: string[] }
  | { type: 'reveal'; ids: string[] }
  | { type: 'conceal'; ids: string[] }
  | { type: 'pointer'; at: LonLat; text: string; from?: [number, number]; hold?: number });
export type Beat = { id: string; say: string; scene?: string; camera?: Camera; date?: string | null; actions?: Action[]; hideLocator?: boolean; hideChapter?: boolean; hideDate?: boolean; hideTimeline?: boolean };
export type EpisodeSpec = {
  id: string; series: string; title: string; data: string;
  audio?: string; da?: number; composition?: string; scenes?: Record<string, unknown>;
  timeline: { from: string; to: string; step?: number }; beats: Beat[];
  palette?: { start?: string; startStroke?: string; ids?: Record<string, string>; static?: Record<string, string> };
  counter?: { label: string; total: number } | false; legend?: boolean; locator?: boolean;
};
export type Word = { w: string; start: number; end: number };
export type Timings = { duration: number; beats: { id: string; start: number; end: number; words: Word[] }[] };
export type GeoData = FeatureCollection & { features: (Omit<Feature, "id"> & { id: string })[] };
export type EpisodeProps = { episodeId: string; spec?: EpisodeSpec; timings?: Timings; geo?: GeoData; lottieKeys?: string[] };
/** an action resolved to an absolute time in seconds */
export type TimedAction = Action & { t: number; beat: string };
