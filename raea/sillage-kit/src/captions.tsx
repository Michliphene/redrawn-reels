/**
 * Editorial captions: no box. Cream serif italic, a soft shadow, the bottom scrim behind them; one accent (gold) for
 * keywords and figures; each word fades in and rises 10 px with a soft ease (no pop, no bounce). Pages come from
 * core.paginate (sentence ends, ≤ 2 lines, never a line ending on "for", "of", "the"…).
 */
import TOK from "../tokens.json";
import { CWord, duplicates, paginate } from "./core";
import { C, L, SOFT } from "./type";
import { out3, ramp, Timings } from "./time";

const TY = TOK.type.caption;

export function makePages(T: Timings) {
  const words: CWord[] = T.beats.flatMap((b) => b.words);
  return paginate(words, TY.maxChars, TY.maxLines);
}

const isKey = (w: string, keys: Set<string>) => /\d/.test(w) || /^[$€£]/.test(w) || keys.has(w.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, ""));

export function Captions({ t, pages, keywords, end, onScreen = "" }: { t: number; pages: CWord[][][]; keywords: string[]; end: number; onScreen?: string }) {
  if (t > end - 0.35) return null;
  const keys = new Set(keywords.map((k) => k.toLowerCase()));
  const i = pages.findIndex((p, k) => {
    const first = p[0][0], last = p[p.length - 1][p[p.length - 1].length - 1], next = pages[k + 1]?.[0][0];
    return t >= first.start - 0.1 && t < (next ? next.start - 0.1 : 1e9) && t < last.end + 0.8;
  });
  if (i < 0) return null;
  const page = pages[i];
  if (onScreen && duplicates(page.flat().map((x) => x.w).join(" "), onScreen)) return null;
  const last = page[page.length - 1][page[page.length - 1].length - 1];
  const fade = 1 - ramp(t, last.end + 0.55, 0.25);
  return (
    <div style={{ position: "absolute", left: L.left, top: L.captionTop, width: L.captionWidth, height: L.captionBottom - L.captionTop, display: "flex", flexDirection: "column", justifyContent: "flex-end", opacity: fade }}>
      {page.map((line, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "nowrap", columnGap: 16 }}>
          {line.map((x, k) => {
            const p = out3(ramp(t, x.start - 0.08, TOK.motion.wordIn));
            return (
              <span key={k} style={{
                fontFamily: TY.family, fontStyle: "italic", fontSize: TY.size, lineHeight: TY.line,
                color: isKey(x.w, keys) ? C.gold : C.cream, textShadow: SOFT,
                opacity: p, transform: `translateY(${(1 - p) * TOK.motion.wordTravel}px)`, display: "inline-block",
              }}>{x.w}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
