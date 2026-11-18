// La partition : SOURCE DE VÉRITÉ unique pour l'image ET le son.
// Tout est exprimé en TEMPS (beats), jamais en secondes.

export type MusicSpec = {
  drums?: 'none' | 'hats' | 'four' | 'break';
  bass?: boolean;
  arp?: boolean;
  lead?: boolean;
};

export type Section = {
  name: string;
  start: number; // beat de début
  length: number; // en beats
  music: MusicSpec;
};

export type ScoreEvent = {
  beat: number; // peut être fractionnaire (0.5 = croche)
  type: string; // 'title' | 'hit' | 'split' | 'riser' | 'flash' | 'boom' | 'panel' | ...
  [key: string]: unknown;
};

export type Score = {
  meta: {
    id: string;
    title: string;
    scene: string; // nom de la scène dans le registre
    bpm: number;
    fps: number;
    beatsPerBar: number;
    lengthBeats: number;
    key: string; // ex. 'A' (tonique)
    seed: number;
  };
  chords: string[]; // un accord par mesure, bouclé
  sections: Section[];
  events: ScoreEvent[];
};
