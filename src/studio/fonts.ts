import { continueRender, delayRender, staticFile } from 'remotion';

/**
 * House type system (all SIL OFL, self-hosted in public/fonts so a render never needs the network):
 *   display — Bricolage Grotesque, used condensed + extra-bold: titles, numbers, captions
 *   serif   — Instrument Serif Italic: the quiet second line ("the tower never moves")
 *   mono    — JetBrains Mono: HUD, sources, anything that reads as data
 *   legacy  — Montserrat: DA v1 episodes only
 */
export const FONT = {
  display: 'Bricolage Grotesque',
  serif: 'Instrument Serif',
  mono: 'JetBrains Mono',
  legacy: 'Montserrat',
} as const;

/** CSS for the condensed heavy cut of the display face. */
export const displayCut = (weight = 800, width = 75): React.CSSProperties => ({
  fontFamily: `'${FONT.display}', '${FONT.legacy}', sans-serif`,
  fontWeight: weight,
  fontStretch: `${width}%`,
  fontVariationSettings: `'wdth' ${width}`,
});
export const serifCut: React.CSSProperties = { fontFamily: `'${FONT.serif}', Georgia, serif`, fontStyle: 'italic', fontWeight: 400 };
export const monoCut = (weight = 700): React.CSSProperties => ({ fontFamily: `'${FONT.mono}', monospace`, fontWeight: weight });

const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';

type Face = { family: string; file: string; descriptors: FontFaceDescriptors };
const FACES: Face[] = [
  { family: FONT.display, file: 'BricolageGrotesque-latin.woff2', descriptors: { weight: '200 800', stretch: '75% 100%', unicodeRange: LATIN } },
  { family: FONT.display, file: 'BricolageGrotesque-latin-ext.woff2', descriptors: { weight: '200 800', stretch: '75% 100%', unicodeRange: LATIN_EXT } },
  { family: FONT.serif, file: 'InstrumentSerif-Italic-latin.woff2', descriptors: { style: 'italic', weight: '400', unicodeRange: LATIN } },
  { family: FONT.serif, file: 'InstrumentSerif-Italic-latin-ext.woff2', descriptors: { style: 'italic', weight: '400', unicodeRange: LATIN_EXT } },
  { family: FONT.mono, file: 'JetBrainsMono-latin.woff2', descriptors: { weight: '100 800', unicodeRange: LATIN } },
  { family: FONT.legacy, file: 'Montserrat-VF.ttf', descriptors: { weight: '100 900' } },
];

let started = false;
/**
 * Load every house font once per browser tab. A font that fails to load is reported and skipped:
 * the render continues with the next family in the stack instead of hanging until the timeout.
 */
export function loadFonts(): void {
  if (started || typeof document === 'undefined') return;
  started = true;
  const hold = delayRender('studio fonts');
  Promise.all(
    FACES.map((f) =>
      new FontFace(f.family, `url(${staticFile(`fonts/${f.file}`)})`, f.descriptors)
        .load()
        .then((face) => { document.fonts.add(face); })
        .catch((err) => { console.warn(`[studio] font ${f.file} not loaded (${err}); falling back`); }),
    ),
  ).then(() => continueRender(hold));
}
