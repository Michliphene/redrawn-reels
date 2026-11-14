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
  | { type: 'shake'; amount?: number; atWord?: string };
export type Beat = { id: string; say: string; camera?: Camera; date?: string | null; actions?: Action[] };
export type EpisodeSpec = {
  id: string; series: string; title: string; data: string;
  timeline: { from: string; to: string }; beats: Beat[];
};
export type Word = { w: string; start: number; end: number };
export type Timings = { duration: number; beats: { id: string; start: number; end: number; words: Word[] }[] };
export type GeoData = FeatureCollection & { features: (Omit<Feature, "id"> & { id: string })[] };
export type EpisodeProps = { episodeId: string; spec?: EpisodeSpec; timings?: Timings; geo?: GeoData };
/** an action resolved to an absolute time in seconds */
export type TimedAction = Action & { t: number; beat: string };
