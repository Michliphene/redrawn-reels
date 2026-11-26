/**
 * Full-frame images (P4): no tilted cards, no picture frames. Every image moves: a slow eased Ken Burns by default,
 * a 2.5D parallax when the shot gives a foreground cut-out (`fg`, a PNG with alpha), and a hook for image-to-video
 * (`video`: when present the clip plays instead of the still — plug an i2v render in later, nothing else changes).
 * Scrims are part of the plate: top ~35 % and bottom, so every text has contrast whatever the picture.
 */
import { AbsoluteFill, Video, staticFile } from "raea";
import TOK from "../tokens.json";
import { clamp01, inOutSine, lerp } from "./time";

const W = TOK.canvas.width, H = TOK.canvas.height, KB = TOK.motion.kenBurns;
export type PlateSpec = { img: string; fg?: string; video?: string; kb?: { from?: [number, number, number]; to?: [number, number, number] }; focus?: [number, number] };

export function Scrims({ strength = 1 }: { strength?: number }) {
  // the shapes tools/validate.mjs models for the worst-case contrast: keep the two in step
  const s = TOK.scrim, L = TOK.layout, hx = (a: number) => `rgba(20,10,18,${(a * strength).toFixed(3)})`;
  const topH = H * s.top.fadeTo, hold = (s.top.to / s.top.fadeTo) * 100;
  const y0 = H * s.bottom.from, full = ((L.captionTop - y0) / (H - y0)) * 100;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: topH, background: `linear-gradient(180deg, ${hx(s.top.alpha)} 0%, ${hx(s.top.alpha * 0.92)} ${hold}%, ${hx(0)} 100%)` }} />
      <div style={{ position: "absolute", left: 0, top: y0, width: W, height: H - y0, background: `linear-gradient(180deg, ${hx(0)} 0%, ${hx(s.bottom.alpha * 0.93)} ${full}%, ${hx(s.bottom.alpha)} 100%)` }} />
    </>
  );
}

export function FullPlate({ spec, k }: { spec: PlateSpec; k: number }) {
  const e = inOutSine(clamp01(k));
  const [s0, x0, y0] = spec.kb?.from ?? [KB.scaleFrom, 0, 0];
  const [s1, x1, y1] = spec.kb?.to ?? [KB.scaleTo, -KB.drift, -KB.drift * 0.4];
  const s = lerp(s0, s1, e), x = lerp(x0, x1, e), y = lerp(y0, y1, e);
  const [fx, fy] = spec.focus ?? [50, 46];
  const layer = (src: string, depth: number): React.CSSProperties => ({
    position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover",
    transform: `translate(${x * depth}px, ${y * depth}px) scale(${1 + (s - 1) * depth})`, transformOrigin: `${fx}% ${fy}%`,
  });
  return (
    <AbsoluteFill style={{ background: TOK.color.plumDeep, overflow: "hidden" }}>
      {spec.video
        ? <Video src={staticFile(`plates/${spec.video}`)} style={layer("", 0.4)} muted />
        : <img src={staticFile(`plates/${spec.img}`)} style={layer(spec.img, spec.fg ? 0.55 : 1)} />}
      {spec.fg && !spec.video && <img src={staticFile(`plates/${spec.fg}`)} style={layer(spec.fg, 1.6)} />}
      <Scrims />
    </AbsoluteFill>
  );
}
