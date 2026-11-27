/**
 * SILLAGE N°6 — "It was never whale vomit" (ambergris) · DA « Le cabinet des matières » · raea
 * Voice, word timings and sources: public/episodes/scent-006-ambergris. timings.json is in SECONDS, words by beat;
 * anchors go through `w(beat, word, n)` (by occurrence) and throw if a word is missing.
 *
 * Format D (myth-bust), direction "evidence bench". Shots: the Yemen boat painting opens and closes the reel (loop,
 * same pose) · the cabinet: an empty flacon beside a grey lump on its own plinth ("never vomit") · beach · whale ·
 * squid-beak card · 100 pearls, one lit ("one in a hundred") · open sea (floats for years) · the flacon fills grey-gold
 * on "That is the smell" · history card · law (flacon) · boat again ($12 a gram, our calculation) · clary sage card.
 * Cards are opaque unlit textured cuboids, always mounted (ImagePlane does not move in a continuous render).
 */
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "raea";
import { Bloom, Entity, ToneMapping, manifold } from "raea/3d";
import { Cuboid, Cylinder, Mesh3d, Sphere, Torus } from "raea/mesh";
import { StandardMaterial } from "raea/pbr";
import { AmbientLight, DirectionalLight, PointLight, SpotLight } from "raea/light";
import { Quat, Transform } from "raea/transform";
import { Camera3d } from "raea/camera";
import { LinearRgba, Srgba } from "raea/color";
import TIMINGS from "./timings.json";

/* ================================================================== tokens (design/tokens.json) */
const FPS = 30, W = 1080, H = 1920;
const C = {
  ink: "#190F18", plum: "#482338", rose: "#E9A5B7", ivory: "#FFF2DD", gold: "#D6B477", sage: "#BAC79B",
  paper: "#F2E5D7", grey: "#4A463E", greyDark: "#34312B", amber: "#B8913F", danger: "#E0705C",
};
const L = { left: 90, right: 900, badgeY: 264, hookY: 318, capTop: 1262, capW: 760 };
const DUR = TIMINGS.duration + 0.5;

/* ================================================================== time */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, at: number, d: number) => clamp01((t - at) / d);
const out3 = (x: number) => 1 - Math.pow(1 - x, 3);
const inOut3 = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
type V3 = [number, number, number];
const glow = (hex: string, k: number) => LinearRgba.from(Srgba.hex(hex)).mul(k);
const hash = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rad = (d: number) => (d * Math.PI) / 180;

type Word = { w: string; start: number; end: number };
const BEATS: Record<string, { start: number; end: number; words: Word[] }> = Object.fromEntries(TIMINGS.beats.map((b: any) => [b.id, b]));
const strip = (s: string) => s.replace(/[.,…:?!]+$/, "");
const w = (beat: string, word: string, n = 1) => {
  const ws = BEATS[beat]?.words.filter((x) => x.w === word || strip(x.w) === word) ?? [];
  if (!ws[n - 1]) throw new Error(`anchor missing: "${word}" #${n} in beat ${beat}`);
  return ws[n - 1].start;
};
const B = (beat: string) => BEATS[beat].start;

/* ================================================================== shot list */
type Kind = "full" | "card" | "flacon" | "dots";
type Shot = { id: string; from: number; kind: Kind; img?: string };
const SHOTS: Shot[] = [
  { id: "hook", from: 0, kind: "full", img: "s_boat.jpg" },
  { id: "sold", from: w("hook", "It") - 0.1, kind: "flacon" },
  { id: "myth", from: B("myth") - 0.12, kind: "flacon" },
  { id: "name", from: B("name") - 0.12, kind: "full", img: "s_beach.jpg" },
  { id: "gut", from: B("gut") - 0.12, kind: "full", img: "s_whale.jpg" },
  { id: "beak", from: w("gut", "Hard") - 0.1, kind: "card", img: "c_beak.jpg" },
  { id: "exit", from: B("exit") - 0.12, kind: "full", img: "s_whale.jpg" },
  { id: "rare", from: B("rare") - 0.12, kind: "dots" },
  { id: "float", from: B("float") - 0.12, kind: "full", img: "s_sea.jpg" },
  { id: "molecule", from: B("molecule") - 0.12, kind: "flacon" },
  { id: "history", from: B("history") - 0.12, kind: "card", img: "c_history.jpg" },
  { id: "law", from: B("law") - 0.12, kind: "flacon" },
  { id: "price", from: B("price") - 0.12, kind: "full", img: "s_boat.jpg" },
  { id: "synthetic", from: B("synthetic") - 0.12, kind: "card", img: "c_sage.jpg" },
  { id: "loop", from: B("loop") - 0.12, kind: "full", img: "s_boat.jpg" },
];
// "age" continues the sea shot: its text is keyed on the beat, not on a new shot
const shotAt = (t: number) => { let k = 0; for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].from) k = i; return { s: SHOTS[k], end: SHOTS[k + 1]?.from ?? DUR }; };
const LIGHT = new Set<Kind>(["card"]);

/* ================================================================== sets */
const SOCLE_H = 0.3, BOT = { w: 1.5, h: 2.0, d: 0.95 };
const BOT_Y = SOCLE_H + BOT.h / 2 + 0.01;
const INNER = { w: 1.18, d: 0.64, floor: SOCLE_H + 0.17, h: 1.62 };
const LUMP = { x: 2.35, z: 0.55, plinth: 0.9 };
const DOTS = { z: 6.0, step: 0.24 };
const PAPER = { x: 100, card: [120, 0, 0] as V3 };

/* ================================================================== cameras */
type Cam = { pos: V3; look: V3; fov: number };
const orbit = (target: V3, yaw: number, pitch: number, dist: number, fov: number): Cam => {
  const y = rad(yaw), p = rad(pitch);
  return { look: target, fov, pos: [target[0] + dist * Math.sin(y) * Math.cos(p), target[1] + dist * Math.sin(p), target[2] + dist * Math.cos(y) * Math.cos(p)] };
};
const BENCH: V3 = [1.1, 1.7, 0.2];
function cameraAt(t: number): Cam {
  const { s, end } = shotAt(t);
  const k = inOut3(clamp01((t - s.from) / Math.max(0.5, end - s.from)));
  switch (s.kind) {
    case "card": return orbit([PAPER.card[0], 0, 0.75], lerp(-3, 3, k), 70, lerp(15.5, 14.8, k), 26);
    case "dots": return orbit([0, 0.05, DOTS.z - 0.25], lerp(-8, 4, k), 58, lerp(12.5, 11.6, k), 26);
    case "flacon": {
      if (s.id === "sold") return orbit([LUMP.x, LUMP.plinth + 0.35, LUMP.z], lerp(-26, -18, k), 9, lerp(8.2, 7.4, k), 26);
      if (s.id === "molecule") { const q = inOut3(ramp(t, w("molecule", "ambrein") - 0.2, 1.4)); return orbit([lerp(LUMP.x, 0, q), lerp(1.3, 2.1, q), lerp(LUMP.z, 0, q)], lerp(-10, 2, k), 7, lerp(9, 14.4, q), 26); }
      if (s.id === "myth") return orbit(BENCH, lerp(14, 6, k), 8, lerp(17, 16, k), 26);
      return orbit(BENCH, lerp(-4, -12, k), 10, lerp(16.5, 15.5, k), 26);
    }
    default: return orbit([0, 1.6, 0], 0, 6, 18, 26); // full-screen paintings hide the world
  }
}

/* ================================================================== solids */
const GLASS = manifold.roundedBox(BOT.w, BOT.h, BOT.d, 0.2);
const SHOULDER = manifold.roundedBox(0.64, 0.16, 0.52, 0.06);
const CAP = manifold.roundedBox(0.74, 0.64, 0.74, 0.16);
const SOCLE = manifold.cylinder(1.35, SOCLE_H).rotate(-90, 0, 0);
const PLINTH = manifold.cylinder(0.62, LUMP.plinth).rotate(-90, 0, 0);
// the label: a wave line (sea) in gold on ivory, no letters
const LABEL_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="256"><rect width="512" height="256" fill="#FFF2DD"/>` +
  `<rect x="12" y="12" width="488" height="232" fill="none" stroke="#D6B477" stroke-width="5"/>` +
  `<path d="M150 140 C180 100 210 100 240 140 S300 180 330 140 S360 100 380 120" fill="none" stroke="#9A9384" stroke-width="14" stroke-linecap="round"/></svg>`,
);
const M = ({ c, r = 0.5, m = 0, e = 0 }: { c: string; r?: number; m?: number; e?: number }) => (
  <StandardMaterial base_color={c} perceptual_roughness={r} metallic={m} emissive={glow(c, e)} />
);

/* ================================================================== the grey lump: overlapping blobs, waxy */
// a core plus pitted knobs on its surface (hash-placed, deterministic): reads as rough wax, not a cloud
const BLOBS: [number, number, number, number][] = [[0, 0, 0, 0.44], [0.28, -0.06, 0.1, 0.3], [-0.26, -0.08, -0.06, 0.3]].concat(
  Array.from({ length: 16 }, (_, i) => {
    const u = hash(i + 3) * Math.PI * 2, v = (hash(i + 21) - 0.35) * 1.6, r = 0.4 + hash(i + 50) * 0.08;
    return [Math.cos(u) * Math.cos(v) * r * 1.2, Math.sin(v) * r * 0.7, Math.sin(u) * Math.cos(v) * r, 0.06 + hash(i + 77) * 0.12] as [number, number, number, number];
  }),
) as any;
function Lump({ t, show }: { t: number; show: number }) {
  const y = LUMP.plinth + 0.36 + (1 - show) * -1.4;
  const spin = t * 0.12;
  return (
    <Entity transform={Transform.fromXyz(LUMP.x, y, LUMP.z).withRotation(Quat.fromEuler("XYZ", 0.15, spin, 0.05))}>
      {BLOBS.map(([x, by, z, r], i) => (
        <Mesh3d key={i} name={`lump-${i}`} allowOverlap transform={Transform.fromXyz(x, by, z).withScale([1.15, 0.72, 0.95])}>
          <Sphere radius={r} />
          <StandardMaterial base_color={i < 3 ? C.greyDark : hash(i) > 0.5 ? C.grey : "#5E584C"} perceptual_roughness={0.9} />
        </Mesh3d>
      ))}
    </Entity>
  );
}

/* ================================================================== the signature flacon: empty, fills grey-gold on "That is the smell" */
const FULL = 0.86;
function fillAt(t: number) {
  const at = w("molecule", "ambroxide") - 0.05;
  return t < at ? 0 : FULL * inOut3(ramp(t, at, 1.3));
}
function Cabinet({ t }: { t: number }) {
  const fill = fillAt(t);
  const fy = Math.max(0.004, INNER.h * fill);
  return (
    <>
      <Mesh3d name="cab-floor" transform={Transform.fromXyz(0, -0.05, 0)}><Cuboid half_size={[14, 0.05, 14]} /><M c="#2A1622" r={0.85} /></Mesh3d>
      <Mesh3d name="cab-wall" transform={Transform.fromXyz(0, 6, -5)}><Cuboid half_size={[14, 6, 0.05]} /><M c={C.plum} r={0.9} /></Mesh3d>
      {[-3.4, 3.4].map((x, k) => (
        <Mesh3d key={k} name={`cab-mould-${k}`} allowOverlap transform={Transform.fromXyz(x, 3.4, -4.93)}><Cuboid half_size={[0.015, 3.2, 0.015]} /><M c={C.gold} r={0.3} m={1} /></Mesh3d>
      ))}
      <Mesh3d name="socle" shape={SOCLE} transform={Transform.fromXyz(0, SOCLE_H / 2, 0)}><M c="#3A1C2C" r={0.38} m={0.1} /></Mesh3d>
      <Mesh3d name="socle-rim" allowOverlap transform={Transform.fromXyz(0, SOCLE_H + 0.004, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}><Torus major_radius={1.33} minor_radius={0.018} /><M c={C.gold} r={0.3} m={1} /></Mesh3d>
      <Mesh3d name="plinth" shape={PLINTH} transform={Transform.fromXyz(LUMP.x, LUMP.plinth / 2, LUMP.z)}><M c="#3A1C2C" r={0.38} m={0.1} /></Mesh3d>
      <Mesh3d name="plinth-rim" allowOverlap transform={Transform.fromXyz(LUMP.x, LUMP.plinth + 0.004, LUMP.z).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}><Torus major_radius={0.6} minor_radius={0.016} /><M c={C.gold} r={0.3} m={1} /></Mesh3d>
      <Lump t={t} show={1} />
      {/* unit cube scaled: animated mesh sizes freeze in a sequential raea render */}
      <Mesh3d name="juice" allowOverlap transform={Transform.fromXyz(0, INNER.floor + fy / 2, 0).withScale([INNER.w, fy, INNER.d])}>
        <Cuboid half_size={[0.5, 0.5, 0.5]} />
        <M c={C.amber} r={0.15} e={0.55} />
      </Mesh3d>
      <Mesh3d name="glass" allowOverlap shape={GLASS} transform={Transform.fromXyz(0, BOT_Y, 0)}>
        <StandardMaterial base_color="#F6E6CF" perceptual_roughness={0.05} specular_transmission={0.82} ior={1.2} thickness={0.04} reflectance={0.55} />
      </Mesh3d>
      <Mesh3d name="label" allowOverlap transform={Transform.fromXyz(0, BOT_Y - 0.12, BOT.d / 2 + 0.006)}><Cuboid half_size={[0.46, 0.23, 0.004]} /><StandardMaterial base_color="#FFFFFF" base_color_texture={LABEL_SVG} perceptual_roughness={0.75} /></Mesh3d>
      <Mesh3d name="shoulder" allowOverlap shape={SHOULDER} transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.07, 0)}><StandardMaterial base_color="#F6E6CF" perceptual_roughness={0.05} specular_transmission={0.8} ior={1.2} thickness={0.04} /></Mesh3d>
      <Mesh3d name="collar" allowOverlap transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.22, 0)}><Cylinder radius={0.21} half_height={0.09} /><M c={C.gold} r={0.25} m={1} /></Mesh3d>
      <Mesh3d name="cap" allowOverlap shape={CAP} transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.63, 0)}><StandardMaterial base_color={C.plum} perceptual_roughness={0.22} metallic={0.15} clearcoat={1} clearcoat_perceptual_roughness={0.06} /></Mesh3d>
    </>
  );
}

/* ================================================================== 100 pearls on the cabinet floor, one lit */
function Pearls({ t }: { t: number }) {
  const lit = out3(ramp(t, w("rare", "one") - 0.05, 0.5));
  const on = shotAt(t).s.kind === "dots" ? 0 : -1; // off-shot: sunk under the floor (moved, never unmounted)
  return (
    <>
      {Array.from({ length: 100 }, (_, i) => {
        const cx = (i % 10) - 4.5, cz = Math.floor(i / 10) - 4.5, one = i === 44;
        const hop = one ? 0.12 * lit : 0;
        return (
          <Mesh3d key={i} name={`pearl-${i}`} allowOverlap transform={Transform.fromXyz(cx * DOTS.step, 0.075 + hop + on, DOTS.z + cz * DOTS.step)}>
            <Sphere radius={0.075} />
            <StandardMaterial base_color={one ? C.rose : C.greyDark} perceptual_roughness={0.4} emissive={glow(C.rose, one ? 3.2 * lit : 0)} />
          </Mesh3d>
        );
      })}
    </>
  );
}

/* ================================================================== paper table: one card per shot, always mounted */
function Card({ id, img, at: p, w: cw, h: ch, show }: { id: string; img: string; at: V3; w: number; h: number; show: number }) {
  // hidden cards sit under the table (moved, never unmounted)
  const y = show <= 0.002 ? -3 : p[1] + (1 - show) * 0.6;
  return (
    <Entity transform={Transform.fromXyz(p[0], y, p[2])}>
      <Mesh3d name={`${id}-mat`} transform={Transform.fromXyz(0, 0.03, 0)}><Cuboid half_size={[cw / 2 + 0.1, 0.03, ch / 2 + 0.1]} /><M c={C.ivory} r={0.8} /></Mesh3d>
      <Mesh3d name={`${id}-img`} allowOverlap transform={Transform.fromXyz(0, 0.066, 0)}>
        <Cuboid half_size={[cw / 2, 0.004, ch / 2]} />
        <StandardMaterial base_color="#FFFFFF" base_color_texture={staticFile(`plates/${img}`)} unlit />
      </Mesh3d>
    </Entity>
  );
}
function Paper({ t }: { t: number }) {
  const { s } = shotAt(t);
  return (
    <>
      <Mesh3d name="paper" transform={Transform.fromXyz(PAPER.x + 10, -0.02, 0)}><Cuboid half_size={[24, 0.02, 14]} /><M c={C.paper} r={0.95} /></Mesh3d>
      {SHOTS.filter((x) => x.kind === "card").map((x) => (
        <Card key={x.id} id={`card-${x.id}`} img={x.img!} at={PAPER.card} w={3.0} h={4.0} show={s.id === x.id ? out3(ramp(t, s.from + 0.05, 0.5)) : 0} />
      ))}
    </>
  );
}

/* ================================================================== type */
const FONTS = `
@font-face { font-family: "Bricolage"; src: url("${staticFile("fonts/BricolageGrotesque-latin.ttf")}"); font-weight: 200 800; }
@font-face { font-family: "Instrument"; src: url("${staticFile("fonts/InstrumentSerif-Italic-latin.ttf")}"); font-style: italic; }
@font-face { font-family: "JBMono"; src: url("${staticFile("fonts/JetBrainsMono-latin.ttf")}"); }`;
const shadow = "0 2px 18px rgba(25,15,24,0.55)";
const hookStyle = (c = C.ivory): React.CSSProperties => ({ fontFamily: "Bricolage", fontWeight: 800, fontSize: 98, lineHeight: 1.0, letterSpacing: "-0.015em", textTransform: "uppercase", color: c, textShadow: shadow });
const titleStyle = (c = C.ivory): React.CSSProperties => ({ fontFamily: "Bricolage", fontWeight: 700, fontSize: 78, lineHeight: 1.0, letterSpacing: "-0.01em", color: c, textShadow: shadow });
const statStyle = (c = C.ivory): React.CSSProperties => ({ fontFamily: "Bricolage", fontWeight: 800, fontSize: 196, lineHeight: 0.92, letterSpacing: "-0.03em", color: c, textShadow: shadow });
const sensory = (c = C.rose): React.CSSProperties => ({ fontFamily: "Instrument", fontStyle: "italic", fontSize: 62, lineHeight: 1.08, color: c, textShadow: shadow });
const label = (c = C.ivory): React.CSSProperties => ({ fontFamily: "JBMono", fontWeight: 500, fontSize: 32, letterSpacing: "0.06em", textTransform: "uppercase", color: c });
const abs = (left: number, top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left, top, ...extra });
const inOut = (t: number, a: number, b: number) => Math.min(out3(ramp(t, a, 0.24)), 1 - ramp(t, b - 0.16, 0.16));
function Block({ t, a, b, top = L.hookY, children }: { t: number; a: number; b: number; top?: number; children: React.ReactNode }) {
  const o = inOut(t, a, b);
  if (o <= 0.01) return null;
  return <div style={abs(L.left, top, { width: L.right - L.left, opacity: o, transform: `translateY(${(1 - o) * 32}px)` })}>{children}</div>;
}
const fadeIn = (t: number, a: number) => out3(ramp(t, a - 0.06, 0.24));

/* captions: stable segments, ≤ 2 lines, dark band everywhere (contrast on every set) */
const SEGMENTS: Word[][] = (() => {
  const out: Word[][] = [];
  for (const b of TIMINGS.beats as any[]) {
    let cur: Word[] = [], chars = 0;
    const ws: Word[] = [];
    for (const x of b.words as Word[]) { const p = ws[ws.length - 1]; if (p && p.w === "E" && /^U\W*$/.test(x.w)) ws[ws.length - 1] = { w: "EU" + x.w.slice(1), start: p.start, end: x.end }; else ws.push(x); }
    for (const x of ws) {
      const end = /[.?!:]$/.test(x.w), comma = /,$/.test(x.w);
      if (cur.length && chars + x.w.length + 1 > 40) {
        // never end a line on a small word or a bare number: carry it to the next line
        const carry: Word[] = [];
        while (cur.length > 2 && /^(a|an|the|of|in|on|to|for|from|with|and|its|it|is|\$?[\d.,]+)$/i.test(cur[cur.length - 1].w)) carry.unshift(cur.pop()!);
        out.push(cur); cur = carry; chars = carry.reduce((n, y) => n + y.w.length + 1, 0);
      }
      cur.push(x); chars += x.w.length + 1;
      if ((end && cur.length >= 2) || (comma && cur.length >= 4)) { out.push(cur); cur = []; chars = 0; }
    }
    if (cur.length) out.push(cur);
  }
  for (let i = out.length - 1; i > 0; i--) if (out[i].length === 1 && out[i - 1].length < 8) { out[i - 1] = out[i - 1].concat(out[i]); out.splice(i, 1); }
  return out;
})();
const KEY = /^(ambergris|vomit|dung|ambroxide|illegal|\$?[\d.,]+)\W*$/i;
function Captions({ t }: { t: number }) {
  const i = SEGMENTS.findIndex((p, k) => t >= p[0].start - 0.08 && t < (SEGMENTS[k + 1]?.[0].start ?? 1e9) - 0.08 && t < p[p.length - 1].end + 0.7);
  if (i < 0 || t > DUR - 0.4) return null;
  const p = SEGMENTS[i];
  return (
    <div style={abs(L.left - 22, L.capTop, { width: L.capW + 44 })}>
      <div style={{ background: "rgba(25,15,24,0.92)", borderRadius: 18, padding: "16px 22px 18px", display: "inline-flex", flexWrap: "wrap", columnGap: 16, rowGap: 2, maxWidth: L.capW + 44 }}>
        {p.map((x, k) => {
          const on = t >= x.start - 0.07 && t < x.end + 0.05, said = t >= x.start - 0.07;
          return <span key={k} style={{ fontFamily: "Bricolage", fontWeight: 700, fontSize: 60, lineHeight: 1.15, color: KEY.test(x.w) ? C.rose : on || said ? C.ivory : "#B9AEB5" }}>{x.w}</span>;
        })}
      </div>
    </div>
  );
}

/* full-screen paintings: a slow push-in */
function FullPainting({ t, s, end }: { t: number; s: Shot; end: number }) {
  const k = clamp01((t - s.from) / Math.max(0.5, end - s.from));
  const scale = 1.04 + 0.06 * k;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <img src={staticFile(`plates/${s.img}`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover", transform: `scale(${scale})`, transformOrigin: "50% 45%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(25,15,24,0.9) 0%, rgba(25,15,24,0.72) 22%, rgba(25,15,24,0.12) 42%, rgba(25,15,24,0.1) 58%, rgba(25,15,24,0.72) 100%)" }} />
    </AbsoluteFill>
  );
}

const chip = (bg: string, fg: string): React.CSSProperties => ({ ...label(fg), fontWeight: 700, fontSize: 30, background: bg, padding: "10px 16px", borderRadius: 8 });

/* the boat painting: hook pushes in, loop eases back to the frame-0 scale */
function Painting({ t, s, end }: { t: number; s: Shot; end: number }) {
  const k = clamp01((t - s.from) / Math.max(0.5, end - s.from));
  const scale = s.id === "loop" ? lerp(1.1, 1.04, inOut3(k)) : 1.04 + 0.06 * k;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <img src={staticFile(`plates/${s.img}`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover", transform: `scale(${scale})`, transformOrigin: "50% 45%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(25,15,24,0.9) 0%, rgba(25,15,24,0.72) 22%, rgba(25,15,24,0.12) 42%, rgba(25,15,24,0.1) 58%, rgba(25,15,24,0.72) 100%)" }} />
    </AbsoluteFill>
  );
}

function HookTitle({ t, still }: { t: number; still?: boolean }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}><div style={statStyle(C.ivory)}>127 KG</div></div>
      <div style={{ ...hookStyle(), fontSize: 84, marginTop: 10 }}>of whale <span style={{ color: C.rose }}>vomit?</span></div>
      <div style={{ ...label(C.gold), marginTop: 16 }}>280 lb · Yemen, 2021</div>
    </>
  );
}

function Strike({ t, at, children, c = C.ivory }: { t: number; at: number; children: React.ReactNode; c?: string }) {
  const k = out3(ramp(t, at, 0.3));
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ opacity: 1 - 0.45 * k }}>{children}</span>
      {k > 0.01 && <span style={{ position: "absolute", left: -6, top: "52%", height: 12, width: `calc(${k * 100}% + 12px)`, background: c, borderRadius: 6, transform: "rotate(-3deg)" }} />}
    </span>
  );
}

function ShotText({ t, s, end }: { t: number; s: Shot; end: number }) {
  const ink = { ...titleStyle(C.ink), textShadow: "none" };
  switch (s.id) {
    case "hook": return (
      <Block t={t} a={-1} b={end}><HookTitle t={t} /></Block>
    );
    case "loop": return (
      <Block t={t} a={w("loop", "still") - 0.1} b={DUR + 1}><HookTitle t={t} still /></Block>
    );
    case "sold": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={label(C.gold)}>it sold for</div>
        <div style={{ ...statStyle(C.rose), marginTop: 6, opacity: fadeIn(t, w("hook", "$1.5")) }}>$1.5M</div>
        <div style={{ ...label(C.ivory), marginTop: 10, opacity: fadeIn(t, w("hook", "$1.5")) }}>127 kg · Yemen, 2021</div>
      </Block>
    );
    case "myth": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={hookStyle()}><Strike t={t} at={w("myth", "never") - 0.05} c={C.rose}>Whale vomit</Strike></div>
        <div style={{ ...chip(C.rose, C.ink), display: "inline-block", marginTop: 22, opacity: fadeIn(t, w("myth", "never")) }}>it was never vomit</div>
      </Block>
    );
    case "name": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={{ ...hookStyle(), fontSize: 110 }}>Ambergris</div>
        <div style={{ ...sensory(), marginTop: 14, opacity: fadeIn(t, w("name", "Old")) }}>ambre gris: grey amber</div>
      </Block>
    );
    case "gut": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={titleStyle()}>Made in the gut</div>
        <div style={{ ...label(C.gold), marginTop: 14, opacity: fadeIn(t, w("gut", "sperm")) }}>of a sperm whale</div>
        <div style={{ ...chip(C.rose, C.ink), display: "inline-block", marginTop: 18, opacity: fadeIn(t, w("gut", "bile")) }}>a bile-duct secretion</div>
      </Block>
    );
    case "beak": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={ink}>Squid beaks</div>
        <div style={{ ...chip(C.plum, C.ivory), display: "inline-block", marginTop: 12, opacity: fadeIn(t, w("gut", "often")) }}>often found inside</div>
      </Block>
    );
    case "exit": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={titleStyle()}>It mostly leaves<br />the other way</div>
        <div style={{ ...sensory(), marginTop: 16, opacity: fadeIn(t, w("exit", "dung")) }}>…like dung</div>
      </Block>
    );
    case "rare": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20, opacity: fadeIn(t, w("rare", "one")) }}><div style={statStyle(C.rose)}>1</div><div style={{ ...titleStyle(), fontSize: 70 }}>in 100</div></div>
        <div style={{ ...label(C.ivory), marginTop: 6, opacity: fadeIn(t, w("rare", "whale")) }}>sperm whales · an estimate</div>
        <div style={{ ...chip(C.ivory, C.ink), display: "inline-block", marginTop: 18, opacity: fadeIn(t, w("rare", "Soviet")) }}>Soviet logs 1961–78: 0.4%</div>
      </Block>
    );
    case "float": {
      const age = t >= B("age") - 0.12;
      return age ? (
        <Block t={t} a={B("age") - 0.1} b={end}>
          <div style={label(C.gold)}>slowly, it turns</div>
          <div style={{ ...hookStyle(), marginTop: 14 }}>sweet<br /><span style={{ color: C.rose }}>&amp; earthy</span></div>
        </Block>
      ) : (
        <Block t={t} a={s.from + 0.05} b={B("age") - 0.12}>
          <div style={{ ...sensory(), fontSize: 66 }}>Fresh, it smells<br />like what it is.</div>
          <div style={{ ...titleStyle(), marginTop: 18, opacity: fadeIn(t, w("float", "floats")) }}>It floats…</div>
          <div style={{ ...label(C.gold), marginTop: 12, opacity: fadeIn(t, w("float", "years")) }}>often for years</div>
        </Block>
      );
    }
    case "molecule": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={{ ...label(C.gold), opacity: fadeIn(t, w("molecule", "scentless")) }}>scentless</div>
        <div style={{ ...titleStyle(), fontSize: 70, marginTop: 6, opacity: fadeIn(t, w("molecule", "ambrein")) }}>Ambrein</div>
        <div style={{ ...titleStyle(C.rose), fontSize: 70, marginTop: 4, opacity: fadeIn(t, w("molecule", "ambroxide")) }}>→ Ambroxide</div>
        <div style={{ ...sensory(C.ivory), marginTop: 14, opacity: fadeIn(t, w("molecule", "That")) }}>the main smell</div>
      </Block>
    );
    case "history": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={{ ...ink, fontSize: 64, opacity: fadeIn(t, w("history", "incense")) }}>Egypt: incense</div>
        <div style={{ ...ink, fontSize: 64, marginTop: 8, opacity: fadeIn(t, w("history", "plague")) }}>Against the plague</div>
        <div style={{ ...ink, fontSize: 64, marginTop: 8, opacity: fadeIn(t, w("history", "Eggs")) }}>Charles II's eggs</div>
        <div style={{ ...label(C.plum), fontWeight: 700, marginTop: 8, opacity: fadeIn(t, w("history", "reportedly")) }}>reportedly</div>
      </Block>
    );
    case "law": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={{ ...label(C.gold) }}>today</div>
        <div style={{ ...chip(C.danger, C.ink), display: "inline-block", marginTop: 12, fontSize: 40, opacity: fadeIn(t, w("law", "illegal")) }}>USA: illegal to own</div>
        <div style={{ ...chip(C.ivory, C.ink), display: "inline-block", marginTop: 16, fontSize: 40, opacity: fadeIn(t, w("law", "Britain")) }}>UK · EU: can be sold</div>
      </Block>
    );
    case "price": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={label(C.gold)}>that piece from Yemen</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 6, opacity: fadeIn(t, w("price", "$12")) }}><div style={statStyle(C.rose)}>$12</div><div style={titleStyle()}>a gram</div></div>
        <div style={{ ...label(C.ivory), marginTop: 10, opacity: fadeIn(t, w("price", "piece")) }}>$1.5M ÷ 127 kg · our calculation</div>
      </Block>
    );
    case "synthetic": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={{ ...label(C.plum), fontWeight: 700 }}>the shortcut</div>
        <div style={{ ...ink, marginTop: 8, opacity: fadeIn(t, w("synthetic", "clary")) }}>Clary sage</div>
        <div style={{ ...chip(C.plum, C.ivory), display: "inline-block", marginTop: 16, opacity: fadeIn(t, w("synthetic", "Ambroxide")) }}>→ ambroxide</div>
        <div style={{ ...sensory(C.plum), textShadow: "none", marginTop: 10, opacity: fadeIn(t, w("synthetic", "plant")) }}>a plant</div>
      </Block>
    );
    default: return null;
  }
}

function Overlay({ t }: { t: number }) {
  const { s, end } = shotAt(t);
  const light = LIGHT.has(s.kind);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <style>{FONTS}</style>
      {s.kind === "full" && <Painting t={t} s={s} end={end} />}
      {!light && s.kind !== "full" && <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 760, backgroundImage: "linear-gradient(180deg, rgba(25,15,24,0.86) 0%, rgba(25,15,24,0.5) 58%, rgba(25,15,24,0) 100%)" }} />}
      {light && <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 640, backgroundImage: "linear-gradient(180deg, rgba(242,229,215,0.97) 0%, rgba(242,229,215,0.8) 64%, rgba(242,229,215,0) 100%)" }} />}
      <div style={abs(L.left, L.badgeY - 12, { display: "flex", alignItems: "center", gap: 14 })}>
        <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 26, letterSpacing: "0.24em", color: C.ink, background: C.rose, padding: "8px 14px 7px 17px", borderRadius: 4 }}>SILLAGE</div>
        <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 26, letterSpacing: "0.12em", color: C.rose, background: C.ink, padding: "8px 12px 7px", borderRadius: 4 }}>N°6</div>
      </div>
      <ShotText t={t} s={s} end={end} />
      <Captions t={t} />
    </AbsoluteFill>
  );
}

function Sillage006() {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = cameraAt(t);
  const { s } = shotAt(t);
  const exposure = LIGHT.has(s.kind) ? -0.2 : 0.55;
  const sfx: [number, string, number][] = [
    [w("hook", "127"), "stamp", 0.4], [w("hook", "$1.5"), "stamp", 0.4], [w("myth", "never"), "stamp", 0.45],
    [w("name", "ambergris"), "boom", 0.3], [w("gut", "Hard"), "pop", 0.3], [w("exit", "dung"), "pop", 0.35],
    [w("rare", "one"), "stamp", 0.35], [w("float", "floats"), "rumble", 0.3], [w("molecule", "ambroxide"), "pop", 0.3],
    [w("molecule", "That"), "boom", 0.3], [w("history", "incense"), "pop", 0.25], [w("history", "plague"), "pop", 0.25],
    [w("history", "Charles"), "pop", 0.25], [w("law", "illegal"), "stamp", 0.4], [w("price", "$12"), "stamp", 0.4],
    [w("synthetic", "plant"), "pop", 0.3],
  ];
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: (cam.fov * Math.PI) / 180 } }} />
      <ToneMapping mode="tony" exposure={exposure} />
      <Bloom intensity={0.18} threshold={1.0} />
      <AmbientLight brightness={230} color="#F2D8E2" />
      <DirectionalLight transform={Transform.fromXyz(-5, 12, 9).lookingAt([0, 0, 0])} illuminance={2600} color="#FFF0E2" shadow_maps_enabled soft_shadow_size={3} />
      <SpotLight transform={Transform.fromXyz(-3.5, 6.5, 7).lookingAt([0.8, 1.4, 0])} intensity={5200000} outer_angle={0.5} inner_angle={0.24} color="#FFF1E4" shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(1.2, 3.4, -2.2)} intensity={1500000} color={C.rose} range={7} />
      <PointLight transform={Transform.fromXyz(4, 2.5, 5)} intensity={600000} color="#F6E2D6" range={12} />
      <PointLight transform={Transform.fromXyz(0, 4, DOTS.z + 1)} intensity={900000} color="#FFF1E4" range={9} />
      <PointLight transform={Transform.fromXyz(PAPER.x + 10, 14, 6)} intensity={18000000} color="#FFF6EC" range={60} shadow_maps_enabled />
      <Cabinet t={t} />
      <Pearls t={t} />
      <Paper t={t} />
      <Overlay t={t} />
      {sfx.map(([a, name, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(a * FPS))} durationInFrames={FPS * 3} layout="none" name={`sfx-${name}-${i}`}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.55} />
        </Sequence>
      ))}
      <Audio src={staticFile("voice.wav")} volume={0.64} />
      <Audio src={staticFile("music.wav")} volume={(fr: number) => interpolate(fr / FPS, [0, 0.6, DUR - 2.5, DUR], [0, 0.07, 0.07, 0.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
}

registerRoot(() => <Composition id="sillage" component={Sillage006} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />);
