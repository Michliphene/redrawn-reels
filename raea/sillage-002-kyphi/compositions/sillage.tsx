/**
 * SILLAGE N°2 — "The 2,000-year-old perfume" (kyphi) · DA « Le cabinet des matières » · raea (React/TS → Bevy)
 * Voice, word timings and sources: public/episodes/scent-002-kyphi. timings.json is in SECONDS, words by beat;
 * anchors go through `w(beat, word, n)` (by occurrence) and throw if a word is missing.
 *
 * Shots: the temple wall opens and closes the reel (loop) · Edfu pylon · the "laboratory" room · Plutarch's dusk
 * censer · a triptych on the paper table (dawn frankincense, noon myrrh, dusk kyphi) · a 3D grid of 16 tiles that
 * lights one ingredient per word, then regroups into 10 / 15 / 36, then shows "?" for the unknown plants · an
 * imagined kyphi flask in a frame · the series' signature flacon filled with amber kyphi and the gold ring on
 * "reconstructing" · smoke for "the exact smell did not". One subject, one message, one move per shot.
 */
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "raea";
import { Bloom, Entity, ImagePlane, ToneMapping, manifold } from "raea/3d";
import { Cuboid, Cylinder, Mesh3d, Sphere, Torus } from "raea/mesh";
import { StandardMaterial } from "raea/pbr";
import { AmbientLight, DirectionalLight, PointLight, SpotLight } from "raea/light";
import { Quat, Transform } from "raea/transform";
import { Camera3d } from "raea/camera";
import { LinearRgba, Srgba } from "raea/color";
import TIMINGS from "./timings.json";

/* ================================================================== tokens (Sillage-DA/tokens.json) */
const FPS = 30, W = 1080, H = 1920;
const C = {
  ink: "#190F18", plum: "#482338", rose: "#E9A5B7", ivory: "#FFF2DD", gold: "#D6B477", sage: "#BAC79B",
  amber: "#D99459", lilac: "#B8ACDF", paper: "#F2E5D7", petrol: "#123D46", copper: "#BE8056", kyphi: "#B8763A",
};
const L = { left: 90, right: 900, badgeY: 250, hookY: 318, capTop: 1262, capW: 760 };
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
type Kind = "full" | "triptych" | "tiles" | "card" | "frame" | "flacon";
type Shot = { id: string; from: number; kind: Kind; img?: string };
const SHOTS: Shot[] = [
  { id: "hook", from: 0, kind: "full", img: "s_wall.jpg" },
  { id: "pylon", from: w("egypt", "Egypt.") - 0.12, kind: "full", img: "s_pylon.jpg" },
  { id: "labroom", from: B("lab") - 0.12, kind: "full", img: "s_lab_room.jpg" },
  { id: "censer", from: B("dusk") - 0.12, kind: "full", img: "s_censer.jpg" },
  { id: "triptych", from: w("dusk", "frankincense") - 0.2, kind: "triptych" },
  { id: "sixteen", from: B("sixteen") - 0.12, kind: "tiles" },
  { id: "sacred", from: B("sacred") - 0.12, kind: "full", img: "s_papyrus.jpg" },
  { id: "balm", from: w("sacred", "And") - 0.1, kind: "card" },
  { id: "twist", from: B("twist") - 0.12, kind: "frame" },
  { id: "counts", from: B("counts") - 0.12, kind: "tiles" },
  { id: "unknown", from: B("unknown") - 0.12, kind: "tiles" },
  { id: "today", from: B("today") - 0.12, kind: "flacon" },
  { id: "payoff", from: B("payoff") - 0.12, kind: "full", img: "s_smoke.jpg" },
  { id: "loop", from: B("loop") - 0.12, kind: "full", img: "s_wall.jpg" },
];
const shotAt = (t: number) => { let k = 0; for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].from) k = i; return { s: SHOTS[k], end: SHOTS[k + 1]?.from ?? DUR }; };
const LIGHT = new Set<Kind>(["triptych", "tiles", "card"]);

/* ================================================================== sets */
const SOCLE_H = 0.3, BOT = { w: 1.5, h: 2.0, d: 0.95 };
const BOT_Y = SOCLE_H + BOT.h / 2 + 0.01;
const INNER = { w: 1.18, d: 0.64, floor: SOCLE_H + 0.17, h: 1.62 };
const GAL = { x: 30, z: -2, y: 2.3, w: 2.1, h: 2.8 };
const PAPER = { x: 100, trip: [100, 0, 0] as V3, tiles: [110, 0, 0] as V3, card: [120, 0, 0] as V3 };

/* ================================================================== cameras */
type Cam = { pos: V3; look: V3; fov: number };
const orbit = (target: V3, yaw: number, pitch: number, dist: number, fov: number): Cam => {
  const y = rad(yaw), p = rad(pitch);
  return { look: target, fov, pos: [target[0] + dist * Math.sin(y) * Math.cos(p), target[1] + dist * Math.sin(p), target[2] + dist * Math.cos(y) * Math.cos(p)] };
};
function cameraAt(t: number): Cam {
  const { s, end } = shotAt(t);
  const k = inOut3(clamp01((t - s.from) / Math.max(0.5, end - s.from)));
  switch (s.kind) {
    case "triptych": return orbit([PAPER.trip[0], 0, 0.75], 0, lerp(74, 70, k), 21, 26);
    case "tiles": return orbit([PAPER.tiles[0], 0, 0.2], lerp(-4, 4, k), 66, lerp(21.5, 20.8, k), 26);
    case "card": return orbit([PAPER.card[0], 0, 0.75], lerp(-3, 3, k), 76, lerp(19, 18.2, k), 26);
    case "frame": return orbit([GAL.x, 2.03, GAL.z], lerp(-5, 3, k), 2, lerp(19, 18.2, k), 26);
    case "flacon": return orbit([0, 1.85, 0], lerp(-10, -2, k), 7, lerp(15, 14, k), 26);
    default: return orbit([0, 1.6, 0], 0, 6, 18, 26); // full-screen paintings hide the world
  }
}
function project(cam: Cam, p: V3): [number, number] {
  const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norm = (a: number[]) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const f = norm(sub(cam.look, cam.pos)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
  const v = sub(p, cam.pos), z = dot(v, f);
  const tan = Math.tan((cam.fov * Math.PI) / 360);
  return [(dot(v, r) / (z * tan * (W / H)) * 0.5 + 0.5) * W, (0.5 - (dot(v, u) / (z * tan)) * 0.5) * H];
}

/* ================================================================== solids */
const GLASS = manifold.roundedBox(BOT.w, BOT.h, BOT.d, 0.2);
const SHOULDER = manifold.roundedBox(0.64, 0.16, 0.52, 0.06);
const CAP = manifold.roundedBox(0.74, 0.64, 0.74, 0.16);
const SOCLE = manifold.cylinder(1.35, SOCLE_H).rotate(-90, 0, 0);
const STAR = "M128 34 C134 96 160 122 222 128 C160 134 134 160 128 222 C122 160 96 134 34 128 C96 122 122 96 128 34 Z";
const LABEL_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="256"><rect width="512" height="256" fill="#FFF2DD"/>` +
  `<rect x="12" y="12" width="488" height="232" fill="none" stroke="#D6B477" stroke-width="5"/>` +
  `<g transform="translate(192 0)"><path d="${STAR}" fill="#C79A5C"/></g></svg>`,
);
const M = ({ c, r = 0.5, m = 0, e = 0 }: { c: string; r?: number; m?: number; e?: number }) => (
  <StandardMaterial base_color={c} perceptual_roughness={r} metallic={m} emissive={glow(c, e)} />
);

/* ================================================================== the signature flacon, filled with kyphi */
function OrbitRing({ t, at, center, r = 1.3, tilt = 0.32, id }: { t: number; at: number; center: V3; r?: number; tilt?: number; id: string }) {
  const p = out3(ramp(t, at, 0.7));
  if (p <= 0.003) return null;
  const run = ramp(t, at, 0.9), a = run * Math.PI * 2 - Math.PI / 2, spin = (t - at) * 0.3, sc = 0.82 + 0.18 * p;
  return (
    <Entity transform={Transform.fromXyz(...center).withRotation(Quat.fromEuler("XYZ", tilt, spin, 0.12)).withScale([sc, sc, sc])}>
      <Mesh3d name={`${id}-torus`} allowOverlap transform={Transform.fromXyz(0, 0, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}>
        <Torus major_radius={r} minor_radius={0.026} />
        <StandardMaterial base_color={C.gold} metallic={1} perceptual_roughness={0.2} emissive={glow(C.gold, 2.4 * p)} />
      </Mesh3d>
      {run < 1 && (
        <Mesh3d name={`${id}-spark`} allowOverlap transform={Transform.fromXyz(Math.cos(a) * r, 0, Math.sin(a) * r)}>
          <Sphere radius={0.07} />
          <StandardMaterial base_color="#FFF6DE" emissive={glow("#FFE7A8", 6)} />
        </Mesh3d>
      )}
    </Entity>
  );
}
function Cabinet({ t }: { t: number }) {
  const { s } = shotAt(t);
  const fill = s.id === "today" ? out3(ramp(t, w("today", "reconstructing") - 0.3, 1.4)) : 0.25;
  return (
    <>
      <Mesh3d name="cab-floor" transform={Transform.fromXyz(0, -0.05, 0)}><Cuboid half_size={[14, 0.05, 14]} /><M c="#2A1622" r={0.85} /></Mesh3d>
      <Mesh3d name="cab-wall" transform={Transform.fromXyz(0, 6, -5)}><Cuboid half_size={[14, 6, 0.05]} /><M c={C.plum} r={0.9} /></Mesh3d>
      {[-3.4, 3.4].map((x, k) => (
        <Mesh3d key={k} name={`cab-mould-${k}`} allowOverlap transform={Transform.fromXyz(x, 3.4, -4.93)}><Cuboid half_size={[0.015, 3.2, 0.015]} /><M c={C.gold} r={0.3} m={1} /></Mesh3d>
      ))}
      <Mesh3d name="socle" shape={SOCLE} transform={Transform.fromXyz(0, SOCLE_H / 2, 0)}><M c="#3A1C2C" r={0.38} m={0.1} /></Mesh3d>
      <Mesh3d name="socle-rim" allowOverlap transform={Transform.fromXyz(0, SOCLE_H + 0.004, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}><Torus major_radius={1.33} minor_radius={0.018} /><M c={C.gold} r={0.3} m={1} /></Mesh3d>
      <Mesh3d name="juice" allowOverlap transform={Transform.fromXyz(0, INNER.floor + (INNER.h * fill) / 2, 0)}>
        <Cuboid half_size={[INNER.w / 2, Math.max(0.01, (INNER.h * fill) / 2), INNER.d / 2]} />
        <M c="#E39A45" r={0.15} e={0.7} />
      </Mesh3d>
      <Mesh3d name="glass" allowOverlap shape={GLASS} transform={Transform.fromXyz(0, BOT_Y, 0)}>
        <StandardMaterial base_color="#F7D3DD" perceptual_roughness={0.05} specular_transmission={0.82} ior={1.2} thickness={0.04} reflectance={0.55} />
      </Mesh3d>
      <Mesh3d name="label" allowOverlap transform={Transform.fromXyz(0, BOT_Y - 0.12, BOT.d / 2 + 0.006)}><Cuboid half_size={[0.46, 0.23, 0.004]} /><StandardMaterial base_color="#FFFFFF" base_color_texture={LABEL_SVG} perceptual_roughness={0.75} /></Mesh3d>
      <Mesh3d name="shoulder" allowOverlap shape={SHOULDER} transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.07, 0)}><StandardMaterial base_color="#F7D3DD" perceptual_roughness={0.05} specular_transmission={0.8} ior={1.2} thickness={0.04} /></Mesh3d>
      <Mesh3d name="collar" allowOverlap transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.22, 0)}><Cylinder radius={0.21} half_height={0.09} /><M c={C.gold} r={0.25} m={1} /></Mesh3d>
      <Mesh3d name="cap" allowOverlap shape={CAP} transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.63, 0)}><StandardMaterial base_color={C.plum} perceptual_roughness={0.22} metallic={0.15} clearcoat={1} clearcoat_perceptual_roughness={0.06} /></Mesh3d>
      <OrbitRing id="ring" t={t} at={s.id === "today" ? w("today", "guess") - 0.2 : 1e9} center={[0, 1.65, 0]} />
    </>
  );
}

/* ================================================================== gallery: the imagined kyphi flask */
function Gallery() {
  const { y, w: fw, h: fh, z, x } = GAL;
  const bars: [number, number, number, number][] = [[0, fh / 2 + 0.04, fw / 2 + 0.08, 0.04], [0, -fh / 2 - 0.04, fw / 2 + 0.08, 0.04], [fw / 2 + 0.04, 0, 0.04, fh / 2 + 0.08], [-fw / 2 - 0.04, 0, 0.04, fh / 2 + 0.08]];
  return (
    <>
      <Mesh3d name="gal-wall" transform={Transform.fromXyz(x, 5, z - 0.2)}><Cuboid half_size={[12, 6, 0.05]} /><M c={C.plum} r={0.92} /></Mesh3d>
      <Mesh3d name="gal-floor" transform={Transform.fromXyz(x, -0.05, 4)}><Cuboid half_size={[12, 0.05, 6.5]} /><M c="#2A1622" r={0.85} /></Mesh3d>
      <Mesh3d name="gal-rail" allowOverlap transform={Transform.fromXyz(x, 4.35, z - 0.12)}><Cuboid half_size={[12, 0.02, 0.02]} /><M c={C.gold} r={0.3} m={1} /></Mesh3d>
      <Mesh3d name="frame-back" transform={Transform.fromXyz(x, y, z - 0.05)}><Cuboid half_size={[fw / 2 + 0.12, fh / 2 + 0.12, 0.03]} /><M c="#2A1622" r={0.7} /></Mesh3d>
      <ImagePlane src={staticFile("plates/f_kyphi_flask.jpg")} width={fw} height={fh} position={[x, y, z]} />
      {bars.map(([bx, by, hx, hy], k) => (
        <Mesh3d key={k} name={`frame-bar-${k}`} allowOverlap transform={Transform.fromXyz(x + bx, y + by, z + 0.02)}><Cuboid half_size={[hx, hy, 0.03]} /><M c={C.gold} r={0.3} m={1} e={0.25} /></Mesh3d>
      ))}
    </>
  );
}

/* ================================================================== paper table: triptych, tiles, card */
function Card({ id, img, at: p, w: cw, h: ch, show }: { id: string; img: string; at: V3; w: number; h: number; show: number }) {
  if (show <= 0.002) return null;
  return (
    <Entity transform={Transform.fromXyz(p[0], p[1] + (1 - show) * 0.6, p[2])}>
      <Mesh3d name={`${id}-mat`} transform={Transform.fromXyz(0, 0.03, 0)}><Cuboid half_size={[cw / 2 + 0.1, 0.03, ch / 2 + 0.1]} /><M c={C.ivory} r={0.8} /></Mesh3d>
      <ImagePlane src={staticFile(`plates/${img}`)} width={cw} height={ch} position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]} />
    </Entity>
  );
}
const TRIP = [
  { id: "frank", img: "c_frankincense.jpg", x: -1.62, word: () => w("dusk", "frankincense"), when: "Dawn", what: "frankincense" },
  { id: "myrrh", img: "c_myrrh.jpg", x: 0, word: () => w("dusk", "myrrh"), when: "Noon", what: "myrrh" },
  { id: "kyphi", img: "c_kyphi.jpg", x: 1.62, word: () => w("dusk", "kyphi"), when: "Dusk", what: "kyphi" },
];
const TRIP_CARD = { w: 1.45, h: 1.93 };

/* the 3D tile grid: count changes with the words, positions glide between layouts */
const TILE = 0.5, GAP = 0.13;
const layout = (i: number, n: number): [number, number] => {
  const cols = n <= 10 ? 5 : n <= 16 ? 4 : 6;
  const rows = Math.ceil(n / cols), c = i % cols, r = Math.floor(i / cols);
  const pitch = TILE + GAP;
  return [(c - (cols - 1) / 2) * pitch, (r - (rows - 1) / 2) * pitch];
};
const NAMED = ["Honey.", "Wine.", "Raisins.", "Myrrh.", "Resin.", "Juniper", "bitumen."];
const UNKNOWN = [2, 5, 9, 14];
function tileCount(t: number, id: string): { n: number; from: number; at: number } {
  if (id === "counts") {
    const steps: [number, number][] = [[B("counts") - 0.12, 16], [w("counts", "ten"), 10], [w("counts", "fifteen."), 15], [w("counts", "thirty-six."), 36]];
    let k = 0; for (let i = 0; i < steps.length; i++) if (t >= steps[i][0]) k = i;
    return { n: steps[k][1], from: steps[Math.max(0, k - 1)][1], at: steps[k][0] };
  }
  return { n: 16, from: 16, at: 0 };
}
function Tiles({ t }: { t: number }) {
  const { s } = shotAt(t);
  if (s.kind !== "tiles") return null;
  const { n, from, at } = tileCount(t, s.id);
  const e = inOut3(ramp(t, at, 0.5));
  const appear = (i: number) => (s.id === "sixteen" ? out3(ramp(t, w("sixteen", "16") - 0.25 + i * 0.03, 0.3)) : 1);
  const p = PAPER.tiles;
  return (
    <>
      {Array.from({ length: 36 }, (_, i) => {
        const inPrev = i < from, inCur = i < n;
        const shown = (inPrev && inCur ? 1 : inCur ? e : inPrev ? 1 - e : 0) * appear(i);
        if (shown <= 0.01) return null;
        const [x0, z0] = layout(i, inPrev ? from : n), [x1, z1] = layout(i, inCur ? n : from);
        const x = lerp(x0, x1, e), z = lerp(z0, z1, e);
        const named = s.id === "sixteen" && i < NAMED.length && t >= w("sixteen", NAMED[i]) - 0.05;
        const bitumen = named && i === 6;
        const unknown = s.id === "unknown" && UNKNOWN.includes(i) && t >= w("unknown", "names?") - 0.1;
        const col = bitumen ? "#2A1C1E" : named ? C.amber : unknown ? "#5A3A4C" : C.ivory;
        const hop = named ? Math.sin(Math.PI * ramp(t, w("sixteen", NAMED[i]) - 0.05, 0.35)) * 0.25 : 0;
        const sc = Math.max(0.001, shown);
        return (
          <Mesh3d key={i} name={`tile-${i}`} allowOverlap transform={Transform.fromXyz(p[0] + x, 0.06 + hop, p[2] + z).withScale([sc, sc, sc])}>
            <Cuboid half_size={[TILE / 2, 0.05, TILE / 2]} />
            <StandardMaterial base_color={col} perceptual_roughness={0.5} emissive={glow(col, named ? 0.35 : 0)} />
          </Mesh3d>
        );
      })}
    </>
  );
}
function Paper({ t }: { t: number }) {
  const { s } = shotAt(t);
  return (
    <>
      <Mesh3d name="paper" transform={Transform.fromXyz(PAPER.x + 10, -0.02, 0)}><Cuboid half_size={[24, 0.02, 14]} /><M c={C.paper} r={0.95} /></Mesh3d>
      {TRIP.map((c) => <Card key={c.id} id={c.id} img={c.img} at={[PAPER.trip[0] + c.x, 0, PAPER.trip[2]]} w={TRIP_CARD.w} h={TRIP_CARD.h} show={s.id === "triptych" ? out3(ramp(t, c.word() - 0.12, 0.45)) : 0} />)}
      <Tiles t={t} />
      <Card id="ingredients" img="c_ingredients.jpg" at={PAPER.card} w={2.3} h={3.07} show={s.id === "balm" ? out3(ramp(t, s.from + 0.05, 0.5)) : 0} />
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
    for (const x of b.words as Word[]) {
      const end = /[.?!:]$/.test(x.w), comma = /,$/.test(x.w);
      if (cur.length && chars + x.w.length + 1 > 34) { out.push(cur); cur = []; chars = 0; }
      cur.push(x); chars += x.w.length + 1;
      if ((end && cur.length >= 2) || (comma && cur.length >= 4)) { out.push(cur); cur = []; chars = 0; }
    }
    if (cur.length) out.push(cur);
  }
  for (let i = out.length - 1; i > 0; i--) if (out[i].length === 1 && out[i - 1].length < 8) { out[i - 1] = out[i - 1].concat(out[i]); out.splice(i, 1); }
  return out;
})();
function Captions({ t }: { t: number }) {
  const i = SEGMENTS.findIndex((p, k) => t >= p[0].start - 0.08 && t < (SEGMENTS[k + 1]?.[0].start ?? 1e9) - 0.08 && t < p[p.length - 1].end + 0.7);
  if (i < 0 || t > DUR - 0.4) return null;
  const p = SEGMENTS[i];
  return (
    <div style={abs(L.left - 22, L.capTop, { width: L.capW + 44 })}>
      <div style={{ background: "rgba(25,15,24,0.92)", borderRadius: 18, padding: "16px 22px 18px", display: "inline-flex", flexWrap: "wrap", columnGap: 16, rowGap: 2, maxWidth: L.capW + 44 }}>
        {p.map((x, k) => {
          const on = t >= x.start - 0.07 && t < x.end + 0.05, said = t >= x.start - 0.07;
          return <span key={k} style={{ fontFamily: "Bricolage", fontWeight: 700, fontSize: 60, lineHeight: 1.15, color: on ? C.rose : said ? C.ivory : "#DCCFD6" }}>{x.w}</span>;
        })}
      </div>
    </div>
  );
}

/* full-screen paintings; the hook and the loop share one pose so the last frame meets the first */
function FullPainting({ t, s, end }: { t: number; s: Shot; end: number }) {
  const k = clamp01((t - s.from) / Math.max(0.5, end - s.from));
  const scale = s.id === "loop" ? lerp(1.1, 1.04, inOut3(ramp(t, s.from, DUR - 0.1 - s.from))) : s.id === "hook" ? lerp(1.04, 1.1, k) : 1.04 + 0.06 * k;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <img src={staticFile(`plates/${s.img}`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover", transform: `scale(${scale})`, transformOrigin: "50% 45%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(25,15,24,0.82) 0%, rgba(25,15,24,0.1) 32%, rgba(25,15,24,0.1) 58%, rgba(25,15,24,0.72) 100%)" }} />
    </AbsoluteFill>
  );
}

function ShotText({ t, s, end, cam }: { t: number; s: Shot; end: number; cam: Cam }) {
  switch (s.id) {
    case "hook": case "loop": {
      const a = s.id === "hook" ? 0 : DUR - 1.3;
      return <Block t={t} a={a} b={s.id === "hook" ? end : DUR + 1}><div style={hookStyle()}>The 2,000-<br />year-old <span style={{ color: C.rose }}>perfume</span></div></Block>;
    }
    case "pylon": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={titleStyle()}>Edfu, Egypt</div>
        <div style={{ ...label(C.gold), marginTop: 14, opacity: fadeIn(t, w("egypt", "built")) }}>built over 2,000 years ago</div>
        <div style={{ ...sensory(), marginTop: 16, opacity: fadeIn(t, w("egypt", "kyphi.")) }}>its priests call it kyphi</div>
      </Block>
    );
    case "labroom": return (
      <Block t={t} a={w("lab", "walls") - 0.1} b={end}>
        <div style={{ ...label(C.gold) }}>the walls list the recipes</div>
        <div style={{ ...titleStyle(), marginTop: 14, opacity: fadeIn(t, w("lab", "laboratory.")) }}>“The laboratory”</div>
      </Block>
    );
    case "censer": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={titleStyle()}>Plutarch</div>
        <div style={{ ...label(C.gold), marginTop: 12 }}>Greek writer</div>
        <div style={{ ...sensory(), marginTop: 16, opacity: fadeIn(t, w("dusk", "three")) }}>incense, three times a day</div>
      </Block>
    );
    case "triptych": return (
      <>
        {TRIP.map((c) => {
          const o = fadeIn(t, c.word());
          if (o <= 0.01) return null;
          const [x, y] = project(cam, [PAPER.trip[0] + c.x, 0.05, PAPER.trip[2] + TRIP_CARD.h / 2 + 0.25]);
          return (
            <div key={c.id} style={abs(x - 140, y, { width: 280, textAlign: "center", opacity: o })}>
              <div style={{ ...titleStyle(C.ink), fontSize: 54, textShadow: "none" }}>{c.when}</div>
              <div style={{ ...label(C.plum), fontSize: 26, marginTop: 4, fontWeight: 700 }}>{c.what}</div>
            </div>
          );
        })}
      </>
    );
    case "sixteen": {
      const names = ["honey", "wine", "raisins", "myrrh", "resin", "juniper", "bitumen"];
      return (
        <Block t={t} a={w("sixteen", "16") - 0.1} b={end}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}><div style={statStyle(C.ink)}>16</div><div style={{ ...titleStyle(C.ink), fontSize: 60, textShadow: "none" }}>ingredients</div></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14, maxWidth: 800 }}>
            {names.map((n, i) => {
              const o = fadeIn(t, w("sixteen", NAMED[i]));
              return <div key={n} style={{ ...label(i === 6 ? C.ivory : C.ink), fontSize: 28, fontWeight: 700, background: i === 6 ? C.ink : C.amber, padding: "8px 14px", borderRadius: 8, opacity: o }}>{n}</div>;
            })}
          </div>
        </Block>
      );
    }
    case "sacred": return (
      <Block t={t} a={s.from + 0.1} b={end}><div style={{ ...sensory(C.ivory), fontSize: 68 }}>mixed while<br />sacred texts are read</div></Block>
    );
    case "balm": {
      const chips: [string, number][] = [["burned", w("sacred", "burned:")], ["a drink", w("sacred", "drink,")], ["a balm", w("sacred", "balm.")]];
      return (
        <Block t={t} a={s.from + 0.05} b={end}>
          <div style={{ ...titleStyle(C.ink), textShadow: "none" }}>Not only incense</div>
          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            {chips.map(([c, a]) => <div key={c} style={{ ...label(C.ivory), fontWeight: 700, background: C.plum, padding: "10px 16px", borderRadius: 8, opacity: fadeIn(t, a) }}>{c}</div>)}
          </div>
        </Block>
      );
    }
    case "twist": return (
      <Block t={t} a={w("twist", "Nobody") - 0.1} b={end}><div style={hookStyle()}>Nobody agrees<br />on the <span style={{ color: C.rose }}>list</span></div></Block>
    );
    case "counts": {
      const { n } = tileCount(t, "counts");
      const who = n === 10 ? "Dioscorides" : n === 15 ? "Galen" : n === 36 ? "a later recipe" : "Plutarch";
      return (
        <Block t={t} a={s.from + 0.05} b={end}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}><div style={statStyle(C.ink)}>{n}</div><div style={{ ...titleStyle(C.ink), fontSize: 60, textShadow: "none" }}>ingredients</div></div>
          <div style={{ ...label(C.plum), fontWeight: 700, marginTop: 12 }}>according to {who}</div>
        </Block>
      );
    }
    case "unknown": {
      const o = fadeIn(t, w("unknown", "names?"));
      const marks = UNKNOWN.map((i) => { const [x, z] = layout(i, 16); return project(cam, [PAPER.tiles[0] + x, 0.12, PAPER.tiles[2] + z]); });
      return (
        <>
          <Block t={t} a={s.from + 0.05} b={end}><div style={{ ...titleStyle(C.ink), textShadow: "none" }}>Unknown plants</div><div style={{ ...label(C.plum), fontWeight: 700, marginTop: 12 }}>Egyptian names nobody can identify</div></Block>
          {marks.map(([x, y], k) => <div key={k} style={abs(x - 24, y - 44, { width: 48, textAlign: "center", opacity: o, fontFamily: "Bricolage", fontWeight: 800, fontSize: 64, color: C.rose })}>?</div>)}
        </>
      );
    }
    case "today": return (
      <Block t={t} a={w("today", "reconstructing") - 0.15} b={end}><div style={titleStyle()}>A reconstruction</div><div style={{ ...sensory(), marginTop: 12, opacity: fadeIn(t, w("today", "guess")) }}>one guess at a time</div></Block>
    );
    case "payoff": return (
      <Block t={t} a={w("payoff", "2,000") - 0.1} b={end}>
        <div style={statStyle(C.ivory)}>2,000 years</div>
        <div style={{ ...sensory(), marginTop: 14, opacity: fadeIn(t, w("payoff", "exact")) }}>the recipe survived, the smell did not</div>
      </Block>
    );
    default: return null;
  }
}

function Overlay({ t, cam }: { t: number; cam: Cam }) {
  const { s, end } = shotAt(t);
  const light = LIGHT.has(s.kind);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <style>{FONTS}</style>
      {s.kind === "full" && <FullPainting t={t} s={s} end={end} />}
      {!light && s.kind !== "full" && <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 700, backgroundImage: "linear-gradient(180deg, rgba(25,15,24,0.82) 0%, rgba(25,15,24,0.45) 55%, rgba(25,15,24,0) 100%)" }} />}
      {light && <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 700, backgroundImage: "linear-gradient(180deg, rgba(242,229,215,0.96) 0%, rgba(242,229,215,0.75) 62%, rgba(242,229,215,0) 100%)" }} />}
      <div style={abs(L.left, L.badgeY - 12, { display: "flex", alignItems: "center", gap: 14 })}>
        <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 26, letterSpacing: "0.24em", color: C.ink, background: C.rose, padding: "8px 14px 7px 17px", borderRadius: 4 }}>SILLAGE</div>
        <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 26, letterSpacing: "0.12em", color: C.rose, background: C.ink, padding: "8px 12px 7px", borderRadius: 4 }}>N°2</div>
      </div>
      <ShotText t={t} s={s} end={end} cam={cam} />
      <Captions t={t} />
    </AbsoluteFill>
  );
}

function Sillage002() {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = cameraAt(t);
  const { s } = shotAt(t);
  const exposure = LIGHT.has(s.kind) ? -0.2 : 0.55;
  const sfx: [number, string, number][] = [
    [w("egypt", "Egypt."), "boom", 0.35], [w("dusk", "frankincense"), "pop", 0.3], [w("dusk", "myrrh"), "pop", 0.3], [w("dusk", "kyphi"), "pop", 0.3],
    [w("sixteen", "16"), "stamp", 0.4], [w("sixteen", "bitumen."), "stamp", 0.3], [w("twist", "Nobody"), "boom", 0.3],
    [w("counts", "ten"), "pop", 0.35], [w("counts", "fifteen."), "pop", 0.35], [w("counts", "thirty-six."), "stamp", 0.4],
    [w("today", "guess") - 0.2, "stamp", 0.3], [w("payoff", "2,000"), "stamp", 0.4],
  ];
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: (cam.fov * Math.PI) / 180 } }} />
      <ToneMapping mode="tony" exposure={exposure} />
      <Bloom intensity={0.18} threshold={1.0} />
      <AmbientLight brightness={230} color="#F2D8E2" />
      <DirectionalLight transform={Transform.fromXyz(-5, 12, 9).lookingAt([0, 0, 0])} illuminance={2600} color="#FFF0E2" shadow_maps_enabled soft_shadow_size={3} />
      <SpotLight transform={Transform.fromXyz(-3.5, 6.5, 7).lookingAt([0, 1.6, 0])} intensity={5200000} outer_angle={0.42} inner_angle={0.2} color="#FFF1E4" shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(1.2, 3.4, -2.2)} intensity={1500000} color={C.amber} range={7} />
      <PointLight transform={Transform.fromXyz(4, 2.5, 5)} intensity={500000} color="#F6E2D6" range={12} />
      <SpotLight transform={Transform.fromXyz(GAL.x, 6.5, GAL.z + 5)} intensity={2600000} outer_angle={0.38} inner_angle={0.22} color="#FFF0E0" />
      <PointLight transform={Transform.fromXyz(PAPER.x + 10, 14, 6)} intensity={18000000} color="#FFF6EC" range={60} shadow_maps_enabled />
      <Cabinet t={t} />
      <Gallery />
      <Paper t={t} />
      <Overlay t={t} cam={cam} />
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

registerRoot(() => <Composition id="sillage" component={Sillage002} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />);
