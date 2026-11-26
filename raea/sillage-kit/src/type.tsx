/** Type: the three voices (Display/stat+title, Whisper serif italic, Mono labels), the logotype, the text stack. */
import { staticFile } from "raea";
import TOK from "../tokens.json";
import { out3, ramp } from "./time";

export const C = TOK.color;
export const L = TOK.layout;
export const TY = TOK.type;

export const FONTS = Object.entries(TOK.fonts)
  .map(([fam, src]) => `@font-face { font-family: "${fam}"; src: url("${staticFile(src)}");${fam === "Bricolage" ? " font-weight: 200 800;" : ""}${fam === "Instrument" ? " font-style: italic;" : ""} }`)
  .join("\n");

/** a soft drop shadow: separation without a box */
export const SOFT = "0 2px 3px rgba(20,10,18,0.55), 0 6px 28px rgba(20,10,18,0.6)";

type Spec = { family: string; weight?: number; size: number; line?: number; track?: string; italic?: boolean; upper?: boolean };
export const css = (s: Spec, color: string = C.cream, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: s.family, fontWeight: s.weight ?? 400, fontSize: s.size, lineHeight: s.line ?? 1.1, letterSpacing: s.track,
  fontStyle: s.italic ? "italic" : undefined, textTransform: s.upper ? "uppercase" : undefined, color, textShadow: SOFT, ...extra,
});

/** "SILLAGE" in spaced serif + the issue number in mono: replaces the rose pill */
export function Logotype({ n, color = C.cream }: { n: number | string; color?: string }) {
  return (
    <div style={{ position: "absolute", left: L.left, top: L.logoY, display: "flex", alignItems: "baseline", gap: 22 }}>
      <div style={css(TY.logo, color, { textTransform: "uppercase" })}>Sillage</div>
      <div style={{ width: 34, height: 1.5, background: C.gold, transform: "translateY(-10px)" }} />
      <div style={css(TY.label, C.gold, { fontWeight: 500 })}>N°{n}</div>
    </div>
  );
}

export type TextEl = { t: "stat" | "title" | "whisper" | "label" | "badge" | "count"; v: string; at?: number; ats?: number[]; gold?: string; size?: number };

/** paints `gold` (a substring) in the accent colour: one accent only */
function withGold(v: string, gold?: string) {
  if (!gold || !v.includes(gold)) return v;
  const [a, ...b] = v.split(gold);
  return (<>{a}<span style={{ color: C.gold }}>{gold}</span>{b.join(gold)}</>);
}

export function TextLine({ el, t }: { el: TextEl; t: number }) {
  const o = el.at === undefined ? 1 : out3(ramp(t, el.at - 0.05, TOK.motion.textIn));
  const base: React.CSSProperties = { opacity: o, transform: `translateY(${(1 - o) * TOK.motion.textTravel}px)` };
  const lines = el.v.split("\n").map((s, i) => (<span key={i}>{i > 0 && <br />}{withGold(s, el.gold)}</span>));
  switch (el.t) {
    case "count": {
      // "3|2|1" at "a|b|c": one part at a time, the newest settling from a small rise (no bounce)
      const parts = el.v.split("|"), ats = el.ats ?? [];
      let i = -1; ats.forEach((a, k) => { if (t >= a - 0.05) i = k; });
      if (i < 0) return <div style={{ ...css(TY.stat), visibility: "hidden" }}>0</div>;
      const p = out3(ramp(t, ats[i] - 0.05, 0.3));
      return <div style={{ ...css(TY.stat, C.cream, el.size ? { fontSize: el.size } : {}), opacity: 0.4 + 0.6 * p, transform: `translateY(${(1 - p) * 14}px)` }}>{withGold(parts[i], el.gold)}</div>;
    }
    case "stat": return <div style={{ ...css(TY.stat, C.cream, el.size ? { fontSize: el.size } : {}), ...base }}>{lines}</div>;
    case "title": return <div style={{ ...css(TY.title, C.cream, el.size ? { fontSize: el.size } : {}), ...base }}>{lines}</div>;
    case "whisper": return <div style={{ ...css(TY.whisper, C.cream, { marginTop: 10 }), ...base }}>{lines}</div>;
    case "label": return <div style={{ ...css(TY.label, C.goldLight, { marginTop: 12, textShadow: SOFT }), ...base }}>{lines}</div>;
    case "badge": return (
      <div style={{ ...base, marginTop: 18 }}>
        <span style={{ ...css(TY.label, C.gold, { fontWeight: 700, textShadow: "none" }), border: `1.5px solid ${C.gold}`, padding: "8px 14px 7px", borderRadius: 2, display: "inline-block" }}>{el.v}</span>
      </div>
    );
  }
}

/** the title/date block: one stack hung from the left margin, fades in and out with its shot */
export function TextStack({ t, from, to, els }: { t: number; from: number; to: number; els: TextEl[] }) {
  const o = Math.min(out3(ramp(t, from, TOK.motion.textIn)), 1 - ramp(t, to - TOK.motion.textOut, TOK.motion.textOut));
  if (o <= 0.01 || !els.length) return null;
  return (
    <div style={{ position: "absolute", left: L.left, top: L.textTop, width: L.right - L.left, opacity: o, transform: `translateY(${(1 - o) * TOK.motion.textTravel}px)` }}>
      {els.map((el, i) => <TextLine key={i} el={el} t={t} />)}
    </div>
  );
}
