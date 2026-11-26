/**
 * Finish (P5) and safe-zone debug (P7). Grain: one fixed noise tile shifted every frame (deterministic, ~5 % opacity).
 * Vignette: a radial darkening. Petals: a few soft foreground petals, blurred, turning slowly, drifting down.
 * SafeZones: the platform's forbidden bands, drawn when compositions/flags.json has "safeZones": true
 * (render.sh writes it from SAFE_ZONES=1).
 */
import { AbsoluteFill } from "raea";
import TOK from "../tokens.json";
import { hash } from "./time";

const W = TOK.canvas.width, H = TOK.canvas.height, F = TOK.finish;
const NOISE = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="256" height="256" filter="url(#n)"/></svg>`,
);

export function Grain({ frame }: { frame: number }) {
  const x = Math.floor(hash(frame) * 256), y = Math.floor(hash(frame + 97) * 256);
  return <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${NOISE}")`, backgroundSize: "256px 256px", backgroundPosition: `${x}px ${y}px`, opacity: F.grain, mixBlendMode: "overlay" }} />;
}

export function Vignette() {
  return <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 78% 62% at 50% 46%, rgba(20,10,18,0) 55%, rgba(20,10,18,${F.vignette}) 100%)` }} />;
}

const PETAL = (c: string) => "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" viewBox="0 0 120 160"><defs><radialGradient id="g" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#F6C9D4"/><stop offset="1" stop-color="${c}"/></radialGradient></defs><path d="M60 6 C104 30 118 92 72 150 C66 156 54 156 48 150 C2 92 16 30 60 6 Z" fill="url(#g)"/></svg>`,
);

/** a few out-of-focus petals in front of everything; `on` lets a shot switch them off */
/** every motion is periodic over the reel (whole cycles), so the last frame equals the first: the loop holds */
export function FloatingPetals({ t, dur, color, on = true }: { t: number; dur: number; color: string; on?: boolean }) {
  if (!on) return null;
  const src = PETAL(color);
  return (
    <>
      {Array.from({ length: F.petals.count }, (_, i) => {
        const ph = (t / dur) * Math.PI * 2, laps = 1 + (i % 2), x0 = hash(i + 3) * W;
        const y = ((hash(i + 7) + (t / dur) * laps) % 1) * (H + 400) - 200;
        const x = x0 + Math.sin(ph * (2 + (i % 3)) + i) * 60, rot = (t / dur) * 360 * (1 + (i % 2)) + i * 40, s = 0.6 + hash(i + 5) * 0.9;
        const blur = F.petals.blur * (0.6 + hash(i + 13)), sway = Math.sin(ph * (3 + (i % 2)) + i * 2) * 0.35;
        return <img key={i} src={src} style={{ position: "absolute", left: x, top: y, width: 120 * s, height: 160 * s, transform: `rotate(${rot}deg) scaleX(${0.75 + sway})`, filter: `blur(${blur}px)`, opacity: F.petals.opacity }} />;
      })}
    </>
  );
}

export function SafeZones() {
  const S = TOK.safe, band = (s: React.CSSProperties) => <div style={{ position: "absolute", background: "rgba(255,0,60,0.28)", border: "2px dashed #FF2050", ...s }} />;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {band({ left: 0, top: 0, width: W, height: S.top })}
      {band({ left: 0, top: S.bottom, width: W, height: H - S.bottom })}
      {band({ left: S.right, top: S.top, width: W - S.right, height: S.bottom - S.top })}
      <div style={{ position: "absolute", left: 12, top: S.top + 8, font: "700 22px monospace", color: "#FF2050" }}>SAFE_ZONES · top {S.top} · bottom {H - S.bottom} · right {W - S.right}</div>
    </AbsoluteFill>
  );
}
