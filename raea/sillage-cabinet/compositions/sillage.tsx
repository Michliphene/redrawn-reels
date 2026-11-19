/**
 * SILLAGE N°1 — "What's really in your perfume" · DA « Le cabinet des matières » (branch sillage/cabinet-des-matieres)
 * raea (React/TS → Bevy). Voice, word timings and sources: public/episodes/scent-001-notjustflowers.
 *
 * One reel, three reusable sets placed apart in one world, and full-screen "cabinet des songes" paintings:
 *   CABINET  (x 0)    the signature flacon on a low socle, plum wall, gold ring as the reveal signature
 *   GALLERY  (x 30)   framed AI plates on a plum wall (origin shots, at most two in a row)
 *   PAPER    (x 100)  ivory table seen from above: cards, specimens, the jasmine heap against one vial
 *   LAB      (x -40)  lifted plum, lilac molecule assembled bond by bond
 * Each shot = one subject, one message, one move (DA §2). Cuts between shots; everything is a function of t.
 * timings.json is in SECONDS ({w, start, end} per word, grouped by beat id) — read through `w(beat, word, n)`,
 * which matches by occurrence, never by a global indexOf.
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
  amber: "#D99459", lilac: "#B8ACDF", paper: "#F2E5D7", petrol: "#123D46", copper: "#BE8056",
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
const lerp3 = (a: number[], b: number[], k: number) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)] as V3;
const glow = (hex: string, k: number) => LinearRgba.from(Srgba.hex(hex)).mul(k);
const hash = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rad = (d: number) => (d * Math.PI) / 180;

type Word = { w: string; start: number; end: number };
const BEATS: Record<string, { start: number; end: number; words: Word[] }> = Object.fromEntries(TIMINGS.beats.map((b: any) => [b.id, b]));
const strip = (s: string) => s.replace(/[.,…:?!]+$/, "");
/** start (s) of the n-th occurrence of `word` in beat `beat`; throws if the anchor is missing (never guesses). */
const w = (beat: string, word: string, n = 1) => {
  const ws = BEATS[beat]?.words.filter((x) => x.w === word || strip(x.w) === word) ?? [];
  if (!ws[n - 1]) throw new Error(`anchor missing: "${word}" #${n} in beat ${beat}`);
  return ws[n - 1].start;
};
const B = (beat: string) => BEATS[beat].start;
const E = (beat: string) => BEATS[beat].end;

/* ================================================================== the shot list */
type Kind = "hero" | "full" | "frame" | "ring" | "monument" | "duel" | "lab" | "heap" | "specimen" | "assembly" | "loop";
type Shot = { id: string; from: number; kind: Kind; img?: string; set?: number };
const T = {
  whale: w("hook", "whale's") - 0.05, amb: w("ambergris", "ambergris") - 0.15, float: w("ambergris", "float") - 0.1,
  fix: B("fixative") - 0.12, musk: B("musk") - 0.12, y1979: w("musk", "1979,") - 0.12, beaver: B("beaver") - 0.12,
  twist: B("twist") - 0.12, flowers: B("flowers") - 0.12, jas: B("jasmine") - 0.12, rose: B("rose") - 0.12,
  van: B("vanilla") - 0.12, y1841: w("vanilla", "An") - 0.12, vet: B("vetiver") - 0.12, pull: B("pullback") - 0.12, loop: B("loop") - 0.1,
};
const SHOTS: Shot[] = [
  { id: "hook", from: 0, kind: "hero" },
  { id: "whale", from: T.whale, kind: "full", img: "s_whale_cabinet.jpg" },
  { id: "ambergris", from: T.amb, kind: "frame", img: "f_ambergris_jar.jpg", set: 0 },
  { id: "float", from: T.float, kind: "full", img: "s_ocean_bottle.jpg" },
  { id: "fixative", from: T.fix, kind: "ring" },
  { id: "musk", from: T.musk, kind: "frame", img: "f_musk_window.jpg", set: 1 },
  { id: "1979", from: T.y1979, kind: "monument" },
  { id: "beaver", from: T.beaver, kind: "duel" },
  { id: "lab", from: T.twist, kind: "lab" },
  { id: "flowers", from: T.flowers, kind: "full", img: "s_jasmine_drawer.jpg" },
  { id: "jasmine", from: T.jas, kind: "heap" },
  { id: "rose", from: T.rose, kind: "frame", img: "f_rose_valley.jpg", set: 2 },
  { id: "vanilla", from: T.van, kind: "frame", img: "f_vanilla.jpg", set: 3 },
  { id: "1841", from: T.y1841, kind: "full", img: "s_vanilla_1841.jpg" },
  { id: "vetiver", from: T.vet, kind: "specimen" },
  { id: "pullback", from: T.pull, kind: "assembly" },
  { id: "loop", from: T.loop, kind: "loop" },
];
const shotAt = (t: number) => { let k = 0; for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].from) k = i; return { s: SHOTS[k], i: k, end: SHOTS[k + 1]?.from ?? DUR }; };
const AI_SHOTS = new Set(["whale", "ambergris", "float", "musk", "beaver", "flowers", "rose", "vanilla", "1841", "vetiver"]);

/* ================================================================== sets */
const SOCLE_H = 0.3;
const BOT = { w: 1.5, h: 2.0, d: 0.95 };
const BOT_Y = SOCLE_H + BOT.h / 2 + 0.01;
const INNER = { w: 1.18, d: 0.64, floor: SOCLE_H + 0.17, h: 1.62 };
const GAL = { x: 30, z: -2, frames: [24, 30, 36, 42], y: 2.3, w: 2.1, h: 2.8 };
const PAPER = { x: 100, m1979: [92, 0, 0] as V3, duel: [100, 0, 0] as V3, heap: [110, 0, 0] as V3, vet: [120, 0, 0] as V3 };
const LAB = { x: -40 };

/* ================================================================== cameras: one per shot, one move per shot */
type Cam = { pos: V3; look: V3; fov: number };
const orbit = (target: V3, yaw: number, pitch: number, dist: number, fov: number): Cam => {
  const y = rad(yaw), p = rad(pitch);
  return { look: target, fov, pos: [target[0] + dist * Math.sin(y) * Math.cos(p), target[1] + dist * Math.sin(p), target[2] + dist * Math.cos(y) * Math.cos(p)] };
};
const HERO_CAM = (k: number) => orbit([0, 1.62, 0], lerp(-4, 4, k), 6, lerp(18.5, 17.6, k), 26);
function cameraAt(t: number): Cam {
  const { s, end } = shotAt(t);
  const k = inOut3(clamp01((t - s.from) / Math.max(0.5, end - s.from)));
  switch (s.kind) {
    case "hero": return HERO_CAM(k);
    case "ring": return orbit([0, 1.85, 0], lerp(-12, -4, k), 7, lerp(14.5, 13.6, k), 26);
    case "assembly": return orbit([0, 1.8, 0], lerp(10, 3, k), 7, lerp(15.5, 14.2, k), 26);
    case "loop": { // back to the frame-0 pose, exactly, on the last frame
      const e = inOut3(ramp(t, s.from, Math.max(0.6, DUR - 0.15 - s.from)));
      const a = orbit([0, 1.8, 0], 3, 7, 14.2, 26), b = HERO_CAM(0);
      return { pos: lerp3(a.pos, b.pos, e), look: lerp3(a.look, b.look, e), fov: lerp(a.fov, b.fov, e) };
    }
    case "frame": { const x = GAL.frames[s.set ?? 0]; return orbit([x, 2.03, GAL.z], lerp(-5, 3, k), 2, lerp(19.0, 18.2, k), 26); }
    case "monument": return orbit([PAPER.m1979[0], 0.2, 0.9], lerp(-8, 2, k), 34, 12.5, 26);
    case "duel": return orbit([PAPER.duel[0], 0, 0.95], 0, lerp(76, 72, k), 24, 26);
    case "heap": return orbit([PAPER.heap[0] + 1.1, 0.4, 0.9], lerp(-12, -4, k), 32, lerp(22, 20.5, k), 26);
    case "specimen": return orbit([PAPER.vet[0], 0, 0.45], lerp(-3, 3, k), 78, lerp(20.5, 19.5, k), 26);
    case "lab": return orbit([LAB.x, 2.0, 0], lerp(-12, 4, k), 8, 12.5, 26);
    default: return HERO_CAM(0); // full-screen paintings hide the world
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

/* ================================================================== solids, built once */
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
const M = ({ c, r = 0.5, m = 0, e = 0, ec }: { c: string; r?: number; m?: number; e?: number; ec?: string }) => (
  <StandardMaterial base_color={c} perceptual_roughness={r} metallic={m} emissive={glow(ec ?? c, e)} />
);

/* ================================================================== the signature flacon (+ ring) */
const LAYERS = [
  { at: () => w("pullback", "Whales,"), c: "#9E92CC" }, { at: () => w("pullback", "deer"), c: "#B8ACDF" }, { at: () => w("pullback", "beavers,"), c: "#CFC6EC" },
  { at: () => w("pullback", "ton"), c: "#F6E9C8" }, { at: () => w("pullback", "flowers,"), c: C.rose }, { at: () => w("pullback", "picked"), c: C.amber }, { at: () => w("pullback", "hand."), c: C.sage },
];
function Flacon({ t }: { t: number }) {
  const { s } = shotAt(t);
  const assembling = s.kind === "assembly" || s.kind === "loop";
  const drain = s.kind === "loop" ? out3(ramp(t, s.from + 0.2, DUR - s.from - 0.6)) : 0;
  const LH = INNER.h / LAYERS.length;
  return (
    <>
      <Mesh3d name="socle" shape={SOCLE} transform={Transform.fromXyz(0, SOCLE_H / 2, 0)}>
        <M c="#3A1C2C" r={0.38} m={0.1} />
      </Mesh3d>
      <Mesh3d name="socle-rim" allowOverlap transform={Transform.fromXyz(0, SOCLE_H + 0.004, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}>
        <Torus major_radius={1.33} minor_radius={0.018} />
        <M c={C.gold} r={0.3} m={1} />
      </Mesh3d>
      {!assembling ? (
        <Mesh3d name="juice" allowOverlap transform={Transform.fromXyz(0, INNER.floor + INNER.h * 0.42, 0)}>
          <Cuboid half_size={[INNER.w / 2, INNER.h * 0.42, INNER.d / 2]} />
          <M c={C.rose} r={0.2} e={0.18} />
        </Mesh3d>
      ) : (
        LAYERS.map((l, i) => {
          const g = out3(ramp(t, l.at() - 0.05, 0.45)) * (1 - drain);
          if (g < 0.003) return null;
          const hh = LH * g;
          return (
            <Mesh3d key={i} name={`layer-${i}`} allowOverlap transform={Transform.fromXyz(0, INNER.floor + i * LH * (1 - drain) + hh / 2, 0)}>
              <Cuboid half_size={[INNER.w / 2, Math.max(0.004, hh / 2 - 0.003), INNER.d / 2]} />
              <M c={l.c} r={0.2} e={0.5} />
            </Mesh3d>
          );
        })
      )}
      <Mesh3d name="glass" allowOverlap shape={GLASS} transform={Transform.fromXyz(0, BOT_Y, 0)}>
        <StandardMaterial base_color="#F7D3DD" perceptual_roughness={0.05} specular_transmission={0.82} ior={1.2} thickness={0.04} reflectance={0.55} />
      </Mesh3d>
      <Mesh3d name="label" allowOverlap transform={Transform.fromXyz(0, BOT_Y - 0.12, BOT.d / 2 + 0.006)}>
        <Cuboid half_size={[0.46, 0.23, 0.004]} />
        <StandardMaterial base_color="#FFFFFF" base_color_texture={LABEL_SVG} perceptual_roughness={0.75} />
      </Mesh3d>
      <Mesh3d name="shoulder" allowOverlap shape={SHOULDER} transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.07, 0)}>
        <StandardMaterial base_color="#F7D3DD" perceptual_roughness={0.05} specular_transmission={0.8} ior={1.2} thickness={0.04} />
      </Mesh3d>
      <Mesh3d name="collar" allowOverlap transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.22, 0)}>
        <Cylinder radius={0.21} half_height={0.09} />
        <M c={C.gold} r={0.25} m={1} />
      </Mesh3d>
      <Mesh3d name="cap" allowOverlap shape={CAP} transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.63, 0)}>
        <StandardMaterial base_color={C.plum} perceptual_roughness={0.22} metallic={0.15} clearcoat={1} clearcoat_perceptual_roughness={0.06} />
      </Mesh3d>
    </>
  );
}
/** The signature: a thin gold ring that lights up round the subject when the explanation lands; a spark runs once round it. */
function OrbitRing({ t, at, center, r = 1.3, tilt = 0.32, id, until = 1e9 }: { t: number; at: number; center: V3; r?: number; tilt?: number; id: string; until?: number }) {
  const p = out3(ramp(t, at, 0.7)) * (1 - out3(ramp(t, until, 0.8)));
  if (p <= 0.003) return null;
  const run = ramp(t, at, 0.9), a = run * Math.PI * 2 - Math.PI / 2, spin = (t - at) * 0.3;
  const sc = 0.82 + 0.18 * p;
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

/* ================================================================== cabinet & petals */
function Cabinet({ t }: { t: number }) {
  const { s } = shotAt(t);
  const petals = s.kind === "hero" || s.kind === "loop";
  return (
    <>
      <Mesh3d name="cab-floor" transform={Transform.fromXyz(0, -0.05, 0)}><Cuboid half_size={[14, 0.05, 14]} /><M c="#2A1622" r={0.85} /></Mesh3d>
      <Mesh3d name="cab-wall" transform={Transform.fromXyz(0, 6, -5)}><Cuboid half_size={[14, 6, 0.05]} /><M c={C.plum} r={0.9} /></Mesh3d>
      {[-3.4, 3.4].map((x, k) => (
        <Mesh3d key={k} name={`cab-mould-${k}`} allowOverlap transform={Transform.fromXyz(x, 3.4, -4.93)}><Cuboid half_size={[0.015, 3.2, 0.015]} /><M c={C.gold} r={0.3} m={1} /></Mesh3d>
      ))}
      <Flacon t={t} />
      <OrbitRing id="ring-fix" t={t} at={s.kind === "ring" ? w("fixative", "last") - 0.2 : 1e9} center={[0, 1.65, 0]} />
      <OrbitRing id="ring-end" t={t} at={s.kind === "assembly" || s.kind === "loop" ? w("pullback", "bottle.") - 0.35 : 1e9} until={T.loop + 0.25} center={[0, 1.65, 0]} />
      {petals && Array.from({ length: 14 }, (_, i) => {
        const period = 6 + 3 * hash(i), ph = ((t + hash(i + 3) * period) % period) / period;
        const x = (hash(i + 1) - 0.5) * 7, z = -1.5 + hash(i + 2) * 3;
        return (
          <Mesh3d key={i} name={`petal-${i}`} allowOverlap transform={Transform.fromXyz(x + Math.sin(t * 0.9 + i) * 0.3, 6.5 - ph * 7, z).withRotation(Quat.fromEuler("XYZ", t * 0.8 + i, t * 0.5, 0.4)).withScale([1, 0.18, 0.7])}>
            <Sphere radius={0.11} />
            <M c={C.rose} r={0.6} />
          </Mesh3d>
        );
      })}
    </>
  );
}

/* ================================================================== gallery: framed plates */
function SpecimenFrame({ x, img, lit, id }: { x: number; img: string; lit: number; id: string }) {
  const { y, w: fw, h: fh } = GAL, z = GAL.z;
  const bars: [number, number, number, number][] = [[0, fh / 2 + 0.04, fw / 2 + 0.08, 0.04], [0, -fh / 2 - 0.04, fw / 2 + 0.08, 0.04], [fw / 2 + 0.04, 0, 0.04, fh / 2 + 0.08], [-fw / 2 - 0.04, 0, 0.04, fh / 2 + 0.08]];
  return (
    <>
      <Mesh3d name={`${id}-back`} transform={Transform.fromXyz(x, y, z - 0.05)}><Cuboid half_size={[fw / 2 + 0.12, fh / 2 + 0.12, 0.03]} /><M c="#2A1622" r={0.7} /></Mesh3d>
      <ImagePlane src={staticFile(`plates/${img}`)} width={fw} height={fh} position={[x, y, z]} />
      {bars.map(([bx, by, hx, hy], k) => (
        <Mesh3d key={k} name={`${id}-bar-${k}`} allowOverlap transform={Transform.fromXyz(x + bx, y + by, z + 0.02)}>
          <Cuboid half_size={[hx, hy, 0.03]} />
          <M c={C.gold} r={0.3} m={1} e={0.25 * lit} />
        </Mesh3d>
      ))}
    </>
  );
}
function Gallery({ t }: { t: number }) {
  const { s } = shotAt(t);
  const imgs = ["f_ambergris_jar.jpg", "f_musk_window.jpg", "f_rose_valley.jpg", "f_vanilla.jpg"];
  return (
    <>
      <Mesh3d name="gal-wall" transform={Transform.fromXyz(GAL.x + 3, 5, GAL.z - 0.2)}><Cuboid half_size={[20, 6, 0.05]} /><M c={C.plum} r={0.92} /></Mesh3d>
      <Mesh3d name="gal-floor" transform={Transform.fromXyz(GAL.x + 3, -0.05, 4)}><Cuboid half_size={[20, 0.05, 6.5]} /><M c="#2A1622" r={0.85} /></Mesh3d>
      <Mesh3d name="gal-rail" allowOverlap transform={Transform.fromXyz(GAL.x + 3, 4.35, GAL.z - 0.12)}><Cuboid half_size={[20, 0.02, 0.02]} /><M c={C.gold} r={0.3} m={1} /></Mesh3d>
      {GAL.frames.map((x, k) => <SpecimenFrame key={k} id={`frame-${k}`} x={x} img={imgs[k]} lit={s.kind === "frame" && s.set === k ? 1 : 0} />)}
    </>
  );
}

/* ================================================================== paper table: cards, heap, specimen, monument */
function Card({ id, img, at: p, w: cw, h: ch, show }: { id: string; img: string; at: V3; w: number; h: number; show: number }) {
  if (show <= 0.002) return null;
  const lift = (1 - show) * 0.6;
  return (
    <Entity transform={Transform.fromXyz(p[0], p[1] + lift, p[2])}>
      <Mesh3d name={`${id}-mat`} transform={Transform.fromXyz(0, 0.03, 0)}><Cuboid half_size={[cw / 2 + 0.12, 0.03, ch / 2 + 0.12]} /><M c={C.ivory} r={0.8} /></Mesh3d>
      <ImagePlane src={staticFile(`plates/${img}`)} width={cw} height={ch} position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]} />
    </Entity>
  );
}
function Flower({ id, at: p, s = 1, rot = 0, tilt = 0 }: { id: string; at: V3; s?: number; rot?: number; tilt?: number }) {
  return (
    <Entity transform={Transform.fromXyz(...p).withRotation(Quat.fromEuler("XYZ", tilt, rot, 0)).withScale([s, s, s])}>
      {Array.from({ length: 5 }, (_, k) => {
        const a = (k / 5) * Math.PI * 2;
        return (
          <Mesh3d key={k} name={`${id}-p${k}`} allowOverlap transform={Transform.fromXyz(Math.sin(a) * 0.15, 0, Math.cos(a) * 0.15).withRotation(Quat.fromEuler("YXZ", a, 0.25, 0)).withScale([0.62, 0.16, 1])}>
            <Sphere radius={0.17} />
            <M c="#FFF8EC" r={0.6} />
          </Mesh3d>
        );
      })}
      <Mesh3d name={`${id}-h`} allowOverlap transform={Transform.fromXyz(0, 0.03, 0)}><Sphere radius={0.06} /><M c="#E8C66A" r={0.5} e={0.2} /></Mesh3d>
    </Entity>
  );
}
const HEAP = Array.from({ length: 64 }, (_, i) => {
  const a = i * 2.39996, rr = 1.75 * Math.sqrt((i + 0.5) / 64);
  return { i, x: Math.sin(a) * rr, z: Math.cos(a) * rr, y: 0.05 + 1.05 * Math.pow(1 - rr / 1.85, 1.3) + 0.05 * hash(i), rot: hash(i + 7) * 6.28, tilt: (hash(i + 9) - 0.5) * 0.7, s: 0.9 + 0.3 * hash(i + 2) };
});
function Paper({ t }: { t: number }) {
  const { s } = shotAt(t);
  const d = PAPER.duel, hp = PAPER.heap, vt = PAPER.vet, mk = PAPER.m1979;
  const heapIn = (i: number) => out3(ramp(t, T.jas + 0.05 + (i / HEAP.length) * 1.2, 0.35));
  return (
    <>
      <Mesh3d name="paper" transform={Transform.fromXyz(PAPER.x + 5, -0.02, 0)}><Cuboid half_size={[24, 0.02, 14]} /><M c={C.paper} r={0.95} /></Mesh3d>
      {/* 1979: the musk pod alone on the table, the date does the talking */}
      <Mesh3d name="musk-pod" transform={Transform.fromXyz(mk[0], 0.3, mk[2]).withScale([1.15, 0.85, 1])}><Sphere radius={0.36} /><M c="#7A5440" r={0.9} /></Mesh3d>
      <Mesh3d name="musk-pod-neck" allowOverlap transform={Transform.fromXyz(mk[0], 0.56, mk[2]).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}><Torus major_radius={0.12} minor_radius={0.045} /><M c="#5A3C2C" r={0.8} /></Mesh3d>
      <OrbitRing id="ring-1979" t={t} at={s.id === "1979" ? T.y1979 + 0.25 : 1e9} center={[mk[0], 0.32, mk[2]]} r={0.72} tilt={0.05} />
      {/* duel: leather above, beaver below */}
      <Card id="card-leather" img="c_leather.jpg" at={[d[0], 0, d[2] - 1.45]} w={1.9} h={2.53} show={s.id === "beaver" ? out3(ramp(t, w("beaver", "leather") - 0.1, 0.45)) : 0} />
      <Card id="card-beaver" img="c_beaver.jpg" at={[d[0], 0, d[2] + 1.45]} w={1.9} h={2.53} show={s.id === "beaver" ? out3(ramp(t, w("beaver", "Castoreum") - 0.1, 0.45)) : 0} />
      {/* the heap against one vial */}
      {HEAP.map((f) => {
        const k = s.id === "jasmine" ? heapIn(f.i) : 0;
        if (k <= 0.002) return null;
        return <Flower key={f.i} id={`heap-${f.i}`} at={[hp[0] + f.x, f.y + (1 - k) * 3, hp[2] + f.z]} s={f.s} rot={f.rot} tilt={f.tilt} />;
      })}
      <Entity transform={Transform.fromXyz(hp[0] + 2.75, 0, hp[2] + 1.2)}>
        <Mesh3d name="vial" allowOverlap transform={Transform.fromXyz(0, 0.24, 0)}><Cylinder radius={0.13} half_height={0.24} /><StandardMaterial base_color="#F7D3DD" perceptual_roughness={0.05} specular_transmission={0.75} ior={1.2} thickness={0.03} /></Mesh3d>
        <Mesh3d name="vial-oil" allowOverlap transform={Transform.fromXyz(0, 0.17, 0)}><Cylinder radius={0.105} half_height={0.15} /><M c="#F2D58A" r={0.15} e={0.3} /></Mesh3d>
        <Mesh3d name="vial-cap" allowOverlap transform={Transform.fromXyz(0, 0.53, 0)}><Cylinder radius={0.09} half_height={0.06} /><M c={C.gold} r={0.25} m={1} /></Mesh3d>
      </Entity>
      {/* vetiver: the specimen lies on the table */}
      <Card id="card-vetiver" img="c_vetiver.jpg" at={[vt[0], 0, vt[2]]} w={2.4} h={3.2} show={s.id === "vetiver" ? out3(ramp(t, T.vet + 0.05, 0.5)) : 0} />
    </>
  );
}

/* ================================================================== lab: one bond at a time */
const ATOMS: V3[] = [[0, 0, 0], [0.95, 0.35, 0.1], [-0.85, 0.45, 0.25], [0.2, -0.55, 0.7], [0.1, 0.95, -0.55], [-0.35, -0.6, -0.75], [1.7, 0.9, -0.2]];
const BONDS: [number, number][] = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 6]];
function Lab({ t }: { t: number }) {
  const words = ["today,", "almost", "all", "animal", "notes", "made"].map((x) => w("twist", x));
  const lit = ramp(t, w("twist", "lab."), 0.3);
  const atomIn = (i: number) => (i === 0 ? out3(ramp(t, T.twist + 0.1, 0.4)) : out3(ramp(t, words[Math.min(i - 1, words.length - 1)], 0.35)));
  const spin = t * 0.22;
  return (
    <>
      <Mesh3d name="lab-wall" transform={Transform.fromXyz(LAB.x, 6, -4.5)}><Cuboid half_size={[12, 6, 0.05]} /><M c="#5E3550" r={0.9} /></Mesh3d>
      <Mesh3d name="lab-floor" transform={Transform.fromXyz(LAB.x, -0.05, 0)}><Cuboid half_size={[12, 0.05, 12]} /><M c="#3A2232" r={0.85} /></Mesh3d>
      <Mesh3d name="lab-socle" transform={Transform.fromXyz(LAB.x, 0.2, 0)}><Cylinder radius={1.2} half_height={0.2} /><M c={C.ivory} r={0.45} /></Mesh3d>
      <Entity transform={Transform.fromXyz(LAB.x, 2.0, 0).withRotation(Quat.fromEuler("XYZ", 0.25, spin, 0))}>
        {ATOMS.map((a, i) => {
          const k = atomIn(i);
          if (k <= 0.002) return null;
          return (
            <Mesh3d key={i} name={`atom-${i}`} allowOverlap transform={Transform.fromXyz(...a).withScale([k, k, k])}>
              <Sphere radius={i === 0 ? 0.42 : i % 2 ? 0.28 : 0.24} />
              <StandardMaterial base_color={i % 2 ? C.lilac : C.ivory} perceptual_roughness={0.18} metallic={0.05} emissive={glow(C.lilac, 0.15 + 0.9 * lit)} />
            </Mesh3d>
          );
        })}
        {BONDS.map(([i, j], b) => {
          const k = Math.min(atomIn(i), atomIn(j));
          if (k <= 0.05) return null;
          const A = ATOMS[i], Bv = ATOMS[j];
          const d: V3 = [Bv[0] - A[0], Bv[1] - A[1], Bv[2] - A[2]];
          const len = Math.hypot(...d);
          const yaw = Math.atan2(d[0], d[2]), pitch = Math.acos(d[1] / len);
          return (
            <Mesh3d key={b} name={`bond-${b}`} allowOverlap transform={Transform.fromXyz(A[0] + d[0] / 2, A[1] + d[1] / 2, A[2] + d[2] / 2).withRotation(Quat.fromEuler("YXZ", yaw, pitch, 0)).withScale([1, k, 1])}>
              <Cylinder radius={0.045} half_height={len / 2} />
              <M c={C.gold} r={0.25} m={1} />
            </Mesh3d>
          );
        })}
      </Entity>
    </>
  );
}

/* ================================================================== type (DA §4): no artificial condensing */
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

/** text in: fade + 32 px rise in 0.24 s; out: 0.16 s (DA §9). No elastic pop. */
const inOut = (t: number, a: number, b: number) => Math.min(out3(ramp(t, a, 0.24)), 1 - ramp(t, b - 0.16, 0.16));
function Block({ t, a, b, top = L.hookY, children }: { t: number; a: number; b: number; top?: number; children: React.ReactNode }) {
  const o = inOut(t, a, b);
  if (o <= 0.01) return null;
  return <div style={abs(L.left, top, { width: L.right - L.left, opacity: o, transform: `translateY(${(1 - o) * 32}px)` })}>{children}</div>;
}

/* ================================================================== captions (DA §10): stable segments, 2 lines max */
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
  // merge a lone short word into its neighbour so a whole phrase never flashes for one syllable
  for (let i = out.length - 1; i > 0; i--) if (out[i].length === 1 && out[i - 1].length < 8) { out[i - 1] = out[i - 1].concat(out[i]); out.splice(i, 1); }
  return out;
})();
function Captions({ t, light }: { t: number; light: boolean }) {
  const i = SEGMENTS.findIndex((p, k) => t >= p[0].start - 0.08 && t < (SEGMENTS[k + 1]?.[0].start ?? 1e9) - 0.08 && t < p[p.length - 1].end + 0.7);
  if (i < 0 || t > DUR - 0.4) return null;
  const p = SEGMENTS[i];
  const bg = light ? "#FFF2DD" : "rgba(25,15,24,0.9)";
  const base = light ? C.ink : C.ivory, active = light ? "#A3405D" : C.rose, pending = light ? "#7E5F70" : "#BFAFBA";
  return (
    <div style={abs(L.left - 22, L.capTop, { width: L.capW + 44, display: "flex", justifyContent: "flex-start" })}>
      <div style={{ background: bg, borderRadius: 18, padding: "16px 22px 18px", display: "flex", flexWrap: "wrap", columnGap: 16, rowGap: 2, maxWidth: L.capW + 44 }}>
        {p.map((x, k) => {
          const on = t >= x.start - 0.07 && t < x.end + 0.05;
          const said = t >= x.start - 0.07;
          return <span key={k} style={{ fontFamily: "Bricolage", fontWeight: 700, fontSize: 60, lineHeight: 1.15, color: on ? active : said ? base : pending }}>{x.w}</span>;
        })}
      </div>
    </div>
  );
}

/* ================================================================== full-screen paintings ("cabinet des songes") */
function FullPainting({ t, s, end }: { t: number; s: Shot; end: number }) {
  const k = clamp01((t - s.from) / Math.max(0.5, end - s.from));
  const scale = 1.04 + 0.06 * k;
  const dim = s.id === "1841" ? 0.42 : 0.12;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <img src={staticFile(`plates/${s.img}`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover", transform: `scale(${scale}) translateY(${-18 * k}px)`, transformOrigin: "50% 40%" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(25,15,24,0.78) 0%, rgba(25,15,24,${dim}) 30%, rgba(25,15,24,${dim}) 58%, rgba(25,15,24,0.7) 100%)` }} />
    </AbsoluteFill>
  );
}

/* ================================================================== per-shot words (one message per shot) */
function ShotText({ t, s, end, cam }: { t: number; s: Shot; end: number; cam: Cam }) {
  switch (s.id) {
    case "hook": return (
      <Block t={t} a={0} b={T.whale + 0.16}><div style={hookStyle()}>What's really<br />in your <span style={{ color: C.rose }}>perfume?</span></div></Block>
    );
    case "ambergris": return (
      <Block t={t} a={s.from + 0.05} b={end}><div style={titleStyle()}>Ambergris</div><div style={{ ...sensory(), marginTop: 12 }}>made inside a sperm whale</div></Block>
    );
    case "float": return (
      <Block t={t} a={s.from + 0.05} b={end}><div style={hookStyle()}>Adrift<br />for years</div><div style={{ ...label(C.ivory), marginTop: 18 }}>before it washes up</div></Block>
    );
    case "fixative": return (
      <Block t={t} a={s.from + 0.05} b={end}><div style={titleStyle()}>A fixative</div><div style={{ ...sensory(), marginTop: 12, opacity: ramp(t, w("fixative", "last") - 0.1, 0.25) }}>it makes a scent last</div></Block>
    );
    case "musk": return (
      <Block t={t} a={s.from + 0.05} b={end}><div style={titleStyle()}>Musk</div><div style={{ ...sensory(), marginTop: 12 }}>from the musk deer</div></Block>
    );
    case "1979": return (
      <Block t={t} a={s.from} b={end}><div style={statStyle(C.ink)}>1979</div><div style={{ ...label(C.plum), marginTop: 14, fontWeight: 700 }}>the musk deer is protected · CITES</div></Block>
    );
    case "beaver": {
      const [lx, ly] = project(cam, [PAPER.duel[0] + 1.05, 0.1, PAPER.duel[2] - 1.45 - 1.2]);
      const [bx, by] = project(cam, [PAPER.duel[0] + 1.05, 0.1, PAPER.duel[2] + 1.45 - 1.2]);
      const oA = inOut(t, w("beaver", "leather"), end), oB = inOut(t, w("beaver", "Castoreum"), end);
      const tag = (txt: string, sub: string, x: number, y: number, o: number) => o > 0.01 && (
        <div style={abs(Math.min(x + 18, 930 - 310), y, { opacity: o, background: C.ink, padding: "12px 18px", borderRadius: 10 })}>
          <div style={{ ...titleStyle(C.ivory), fontSize: 50, textShadow: "none" }}>{txt}</div>
          <div style={{ ...label(C.rose), fontSize: 26, marginTop: 6 }}>{sub}</div>
        </div>
      );
      return <>{tag("Leather note", "old classics", lx, ly, oA)}{tag("Castoreum", "from beavers", bx, by, oB)}</>;
    }
    case "lab": return (
      <Block t={t} a={w("twist", "lab.") - 0.35} b={end}><div style={hookStyle(C.ivory)}>Made<br />in a <span style={{ color: C.lilac }}>lab</span></div><div style={{ ...label(C.lilac), marginTop: 18 }}>almost all animal notes, today</div></Block>
    );
    case "flowers": return (
      <Block t={t} a={s.from + 0.1} b={end}><div style={{ ...sensory(C.ivory), fontSize: 72 }}>The flowers<br />are still real.</div></Block>
    );
    case "jasmine": {
      const [vx, vy] = project(cam, [PAPER.heap[0] + 2.75, 0.75, PAPER.heap[2] + 1.2]);
      const ov = inOut(t, w("jasmine", "kilo"), end);
      return (
        <>
          <Block t={t} a={w("jasmine", "ton") - 0.1} b={end}><div style={statStyle(C.ink)}>≈1,000 kg</div><div style={{ ...label(C.plum), marginTop: 12, fontWeight: 700 }}>of jasmine flowers, picked by hand</div></Block>
          {ov > 0.01 && <div style={abs(Math.min(vx - 70, 930 - 240), vy - 92, { opacity: ov, background: C.ink, padding: "10px 16px", borderRadius: 10, ...label(C.ivory), fontSize: 30 })}>1 kg of oil</div>}
        </>
      );
    }
    case "rose": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={titleStyle()}>Rose</div>
        <div style={{ display: "flex", gap: 14, marginTop: 18, opacity: ramp(t, w("rose", "two") - 0.05, 0.24) }}>
          {["Bulgaria", "Turkey"].map((c) => <div key={c} style={{ ...label(C.ink), background: C.rose, padding: "10px 16px", borderRadius: 8 }}>{c}</div>)}
        </div>
      </Block>
    );
    case "vanilla": return (
      <Block t={t} a={s.from + 0.05} b={end}><div style={titleStyle()}>Vanilla</div><div style={{ ...sensory(), marginTop: 12 }}>pollinated by hand,<br />one flower at a time</div></Block>
    );
    case "1841": return (
      <Block t={t} a={s.from + 0.1} b={end}><div style={{ ...statStyle(C.amber), opacity: ramp(t, w("vanilla", "1841.") - 0.08, 0.24) }}>1841</div><div style={{ ...titleStyle(C.ivory), fontSize: 64, marginTop: 10 }}>Edmond Albius, 12</div><div style={{ ...label(C.ivory), marginTop: 12 }}>enslaved on Réunion</div></Block>
    );
    case "vetiver": return (
      <Block t={t} a={w("vetiver", "half") - 0.1} b={end}><div style={statStyle(C.ink)}>≈50%</div><div style={{ ...label(C.plum), marginTop: 12, fontWeight: 700 }}>of the world's vetiver oil · Haiti</div></Block>
    );
    case "pullback": {
      const a1 = ramp(t, w("pullback", "lab.") - 0.1, 0.24), a2 = ramp(t, w("pullback", "hand.") - 0.1, 0.24);
      const row = (txt: string, col: string, o: number) => <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: o, transform: `translateY(${(1 - o) * 24}px)` }}><div style={{ width: 22, height: 22, borderRadius: 11, background: col }} /><div style={{ ...label(C.ivory) }}>{txt}</div></div>;
      return <div style={abs(L.left, L.hookY + 10, { display: "flex", flexDirection: "column", gap: 16 })}>{row("rebuilt in a lab", C.lilac, a1)}{row("picked by hand", C.rose, a2)}</div>;
    }
    case "loop": return (
      <Block t={t} a={DUR - 1.25} b={DUR + 1}><div style={hookStyle()}>What's really<br />in your <span style={{ color: C.rose }}>perfume?</span></div></Block>
    );
    default: return null;
  }
}

function Overlay({ t, cam }: { t: number; cam: Cam }) {
  const { s, end } = shotAt(t);
  const light = s.kind === "monument" || s.kind === "duel" || s.kind === "heap" || s.kind === "specimen";
  const ai = AI_SHOTS.has(s.id);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <style>{FONTS}</style>
      {s.kind === "full" && <FullPainting t={t} s={s} end={end} />}
      {!light && s.kind !== "full" && <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 700, backgroundImage: "linear-gradient(180deg, rgba(25,15,24,0.82) 0%, rgba(25,15,24,0.45) 55%, rgba(25,15,24,0) 100%)" }} />}
      {light && <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 680, backgroundImage: "linear-gradient(180deg, rgba(242,229,215,0.95) 0%, rgba(242,229,215,0.7) 60%, rgba(242,229,215,0) 100%)" }} />}
      <div style={abs(L.left, L.badgeY - 12, { display: "flex", alignItems: "center", gap: 14 })}>
        <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 26, letterSpacing: "0.24em", color: C.ink, background: C.rose, padding: "8px 14px 7px 17px", borderRadius: 4 }}>SILLAGE</div>
        <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 26, letterSpacing: "0.12em", color: light ? C.plum : C.rose }}>N°1</div>
      </div>
      {ai && <div style={abs(0, L.badgeY - 8, { right: W - L.right, left: "auto", ...label(light ? C.plum : C.ivory), fontSize: 24, opacity: 0.92, background: light ? "rgba(255,242,221,0.85)" : "rgba(25,15,24,0.7)", padding: "6px 10px", borderRadius: 6 })}>AI illustration</div>}
      <ShotText t={t} s={s} end={end} cam={cam} />
      <Captions t={t} light={light} />
    </AbsoluteFill>
  );
}

/* ================================================================== frame */
function Sillage() {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = cameraAt(t);
  const { s } = shotAt(t);
  const exposure = s.kind === "monument" || s.kind === "duel" || s.kind === "heap" || s.kind === "specimen" ? -0.2 : 0.55;
  const sfx: [number, string, number][] = [
    [T.whale, "boom", 0.4], [w("fixative", "last") - 0.2, "stamp", 0.35], [T.y1979, "stamp", 0.4],
    [w("beaver", "leather"), "pop", 0.35], [w("beaver", "Castoreum"), "pop", 0.35], [T.twist, "whoosh", 0.3], [w("twist", "lab."), "boom", 0.3],
    [w("jasmine", "ton"), "stamp", 0.4], [T.y1841, "stamp", 0.4], [w("vetiver", "half"), "stamp", 0.4], [w("pullback", "bottle.") - 0.35, "stamp", 0.35],
  ];
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: (cam.fov * Math.PI) / 180 } }} />
      <ToneMapping mode="tony" exposure={exposure} />
      <Bloom intensity={0.18} threshold={1.0} />
      <AmbientLight brightness={230} color="#F2D8E2" />
      <DirectionalLight transform={Transform.fromXyz(-5, 12, 9).lookingAt([0, 0, 0])} illuminance={2600} color="#FFF0E2" shadow_maps_enabled soft_shadow_size={3} />
      {/* cabinet: key 3/4 front, rose rim behind, soft fill */}
      <SpotLight transform={Transform.fromXyz(-3.5, 6.5, 7).lookingAt([0, 1.6, 0])} intensity={5200000} outer_angle={0.42} inner_angle={0.2} color="#FFF1E4" shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(1.2, 3.4, -2.2)} intensity={1500000} color={C.rose} range={7} />
      <PointLight transform={Transform.fromXyz(4, 2.5, 5)} intensity={500000} color="#F6E2D6" range={12} />
      {/* gallery: one spot per frame */}
      {GAL.frames.map((x, k) => <SpotLight key={k} transform={Transform.fromXyz(x, 6.5, GAL.z + 5)} intensity={2600000} outer_angle={0.38} inner_angle={0.22} color="#FFF0E0" />)}
      {/* paper table: daylight */}
      <PointLight transform={Transform.fromXyz(PAPER.x + 4, 14, 6)} intensity={16000000} color="#FFF6EC" range={60} shadow_maps_enabled />
      {/* lab: lilac key, ivory fill */}
      <SpotLight transform={Transform.fromXyz(LAB.x - 3, 6, 6)} intensity={4200000} outer_angle={0.5} inner_angle={0.2} color="#E9E2FF" />
      <PointLight transform={Transform.fromXyz(LAB.x + 2, 3, -2)} intensity={1400000} color={C.lilac} range={8} />

      <Cabinet t={t} />
      <Gallery t={t} />
      <Paper t={t} />
      <Lab t={t} />

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

registerRoot(() => <Composition id="sillage" component={Sillage} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />);
