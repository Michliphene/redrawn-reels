/**
 * Pure logic shared by the composition and tools/validate.mjs (Node runs this .ts file directly):
 * caption segmentation, function-word line breaks, duplicate detection, WCAG contrast.
 */
export type CWord = { w: string; start: number; end: number };

/** a line never ends on one of these: the word moves to the next line */
export const LINK_WORDS = new Set([
  "a", "an", "the", "of", "for", "to", "in", "on", "at", "by", "with", "from", "into", "and", "or", "but", "so",
  "as", "than", "that", "this", "its", "his", "her", "their", "our", "your", "my", "is", "are", "was", "be", "it",
  "about", "more", "most", "one", "no", "not", "if", "when", "where", "which", "who", "how", "what", "every",
]);
const bare = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}'’-]/gu, "");

/** a caption page: up to `maxLines` lines of ≤ `maxChars`, cut at sentence ends, never leaving a link word last */
export function paginate(words: CWord[], maxChars: number, maxLines: number): CWord[][][] {
  const pages: CWord[][][] = [];
  let lines: CWord[][] = [], line: CWord[] = [], chars = 0;
  const flushLine = () => {
    if (!line.length) return;
    // move trailing link words to the next line (never end a line on "for", "of", "the"…)
    const carry: CWord[] = [];
    while (line.length > 1 && LINK_WORDS.has(bare(line[line.length - 1].w)) && !/[.?!,:;]$/.test(line[line.length - 1].w)) carry.unshift(line.pop()!);
    lines.push(line);
    line = carry; chars = carry.reduce((s, x) => s + x.w.length + 1, 0);
    if (lines.length >= maxLines) { pages.push(lines); lines = []; }
  };
  const flushPage = () => { flushLine(); if (line.length) { lines.push(line); line = []; chars = 0; } if (lines.length) pages.push(lines); lines = []; };
  for (const x of words) {
    if (line.length && chars + x.w.length + 1 > maxChars) flushLine();
    line.push(x); chars += x.w.length + 1;
    if (/[.?!]$/.test(x.w)) flushPage();
  }
  flushPage();
  // a lone short word on its own page joins the previous page's last line when it fits
  for (let i = pages.length - 1; i > 0; i--) {
    const p = pages[i];
    if (p.length === 1 && p[0].length === 1) {
      const prev = pages[i - 1], last = prev[prev.length - 1];
      if (last.reduce((s, x) => s + x.w.length + 1, 0) + p[0][0].w.length <= maxChars + 4) { last.push(p[0][0]); pages.splice(i, 1); }
    }
  }
  return pages;
}

const NUM_WORDS: Record<string, number> = {
  zero: 0, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30,
  forty: 40, fifty: 50, hundred: 100, thousand: 1000,
}; // "one" and "half" are left out: too common in speech to mean a figure
/** numbers a text states, in digits or words ("three to five tonnes" → 3, 5; "$12,000" → 12000) */
export function numbersIn(s: string): number[] {
  const out: number[] = [];
  for (const m of s.matchAll(/\d[\d,]*(?:\.\d+)?/g)) out.push(parseFloat(m[0].replace(/,/g, "")));
  for (const w of s.toLowerCase().split(/[^a-z]+/)) if (w in NUM_WORDS) out.push(NUM_WORDS[w]);
  return out;
}
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/**
 * Does a caption page repeat the on-screen title word for word? True when the page's words (minus link words) are
 * all in the on-screen text, or when every number of a short page is already on screen.
 */
export function duplicates(page: string, onScreen: string): string | null {
  const p = norm(page).split(" ").filter((w) => w && !LINK_WORDS.has(w));
  const s = new Set(norm(onScreen).split(" "));
  if (p.length >= 2 && p.every((w) => s.has(w))) return "same words";
  const pn = numbersIn(page), sn = numbersIn(onScreen);
  if (pn.length && p.length <= 5 && pn.every((n) => sn.includes(n))) return "same figure";
  return null;
}

/* ---------------- WCAG 2.x contrast */
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
export const luminance = (rgb: number[]) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
export const blend = (top: string, alpha: number, under: number[]) => hex(top).map((c, i) => c * alpha + under[i] * (1 - alpha));
export function contrast(fg: string, bg: number[]) {
  const a = luminance(hex(fg)), b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
/** worst case: pure white behind the scrim */
export const worstContrast = (fg: string, scrim: string, alpha: number) => contrast(fg, blend(scrim, alpha, [1, 1, 1]));

/* ---------------- text stack height and the top scrim fitted to it (composition + validator share this) */
export type StackEl = { t: string; v: string; size?: number };
export function lineH(e: StackEl, TOK: any): number {
  const n = e.v.split("\n").length, ty = TOK.type[e.t === "count" ? "stat" : e.t === "badge" ? "label" : e.t];
  const size = e.size ?? ty.size;
  return e.t === "badge" ? 70 : n * size * (ty.line ?? 1.1) + (e.t === "label" ? 12 : e.t === "whisper" ? 10 : 0);
}
export const stackBottom = (els: StackEl[], TOK: any) => els.reduce((y, e) => y + lineH(e, TOK), TOK.layout.textTop);
/** full-strength zone of the top scrim (px) and where its fade ends */
export function scrimHold(els: StackEl[], TOK: any): { hold: number; fade: number } {
  const H = TOK.canvas.height, s = TOK.scrim.top;
  const hold = Math.max(H * s.to, els.length ? stackBottom(els, TOK) + (s.fitPad ?? 0) : 0);
  return { hold, fade: hold + H * (s.fadeTo - s.to) };
}
