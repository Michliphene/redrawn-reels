/** SILLAGE N°5 cover: the 3D bottle with its gold ring (same scene as sillage.tsx), the title in the safe band. Generated from sillage.tsx. */
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "raea";
import { Bloom, DepthOfField, Entity, FogVolume, ImagePlane, Text3D, ToneMapping, VolumetricFog, manifold } from "raea/3d";
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
  paper: "#F2E5D7", juice: "#EBCB7E", carbon: "#3A2C35", hydro: "#F4ECE6",
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
type Kind = "full" | "card" | "vials" | "mol" | "bottle";
type Shot = { id: string; from: number; kind: Kind; img?: string };
const SHOTS: Shot[] = [
  { id: "hook", from: 0, kind: "vials" },
  { id: "beaux", from: B("beaux") - 0.12, kind: "vials" },
  { id: "why", from: B("why") - 0.12, kind: "vials" },
  { id: "soap", from: B("soap") - 0.12, kind: "card", img: "c_soap.jpg" },
  { id: "vote", from: B("vote") - 0.12, kind: "vials" },
  { id: "secret", from: B("secret") - 0.12, kind: "mol" },
  { id: "grasse", from: B("grasse") - 0.12, kind: "full", img: "s_jasmine.jpg" },
  { id: "bottle", from: B("bottle") - 0.12, kind: "bottle" },
  { id: "vendome", from: B("vendome") - 0.12, kind: "full", img: "s_paris.jpg" },
  { id: "marilyn", from: B("marilyn") - 0.12, kind: "full", img: "s_nightstand.jpg" },
  { id: "tape", from: B("tape") - 0.12, kind: "card", img: "c_tape.jpg" },
  { id: "moma", from: B("moma") - 0.12, kind: "bottle" },
  { id: "loop", from: B("loop") - 0.12, kind: "vials" },
];
const shotAt = (t: number) => { let k = 0; for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].from) k = i; return { s: SHOTS[k], end: SHOTS[k + 1]?.from ?? DUR }; };
const LIGHT = new Set<Kind>(["card"]);

/* ================================================================== stations */
const SOCLE_H = 0.3, BOT = { w: 1.5, h: 1.72, d: 0.86, ch: 0.08 };
const BOT_Y = SOCLE_H + BOT.h / 2 + 0.01;
const INNER = { w: 1.22, d: 0.6, floor: SOCLE_H + 0.16, h: 1.38 };
const VX = -40, TABLE_Y = 1.0;                 // the vials bench
const MX = -20, MOL_Y = 2.2;                   // the molecule
const PAPER = { x: 100, card: [120, 0, 0] as V3 };

/* the ten vials: 1–5 and 20–24, a gap between the two series; vial "5" is index 4 */
const VIAL_N = ["1", "2", "3", "4", "5", "20", "21", "22", "23", "24"];
const vialX = (k: number) => VX + (k < 5 ? (k - 4) * 0.5 - 0.36 : (k - 5) * 0.5 + 0.36);
const V5 = vialX(4);

/* ================================================================== cameras */
type Cam = { pos: V3; look: V3; fov: number; f: number };
const orbit = (target: V3, yaw: number, pitch: number, dist: number, fov: number, f = 2.8): Cam => {
  const y = rad(yaw), p = rad(pitch);
  return { look: target, fov, f, pos: [target[0] + dist * Math.sin(y) * Math.cos(p), target[1] + dist * Math.sin(p), target[2] + dist * Math.cos(y) * Math.cos(p)] };
};
const FLACON: V3 = [0, 1.55, 0];
const VLOOK = TABLE_Y + 0.5;
const HOOK0 = { lx: V5 + 0.7, yaw: -16, dist: 6.6 };   // frame 0 = the loop's last pose
function cameraAt(t: number): Cam {
  const { s, end } = shotAt(t);
  const k = inOut3(clamp01((t - s.from) / Math.max(0.5, end - s.from)));
  switch (s.kind) {
    case "card": return orbit([PAPER.card[0], 0, -0.15], lerp(-3, 3, k), 76, lerp(19, 18.2, k), 26, 9);
    case "vials": {
      if (s.id === "hook") {
        const q = inOut3(ramp(t, w("hook", "picks") - 0.4, 1.6));
        return orbit([lerp(HOOK0.lx, V5, q), VLOOK, 0], lerp(HOOK0.yaw, -6, q), 8, lerp(HOOK0.dist, 4.4, q), 26, 2.2);
      }
      if (s.id === "beaux") return orbit([lerp(VX - 2.2, VX + 2.2, k), VLOOK - 0.3, 0], lerp(14, -10, k), 16, 5.4, 26, 2.4);
      if (s.id === "why") return orbit([V5, VLOOK + 0.05, 0], lerp(8, 2, k), 6, lerp(3.9, 3.2, k), 26, 1.8);
      if (s.id === "vote") return orbit([lerp(V5, VX, k), VLOOK, 0], lerp(-4, 6, k), 9, lerp(5.2, 6.2, k), 26, 2.4);
      const q = inOut3(ramp(t, s.from, DUR - s.from)); // loop → frame 0
      return orbit([lerp(V5 + 0.3, HOOK0.lx, q), VLOOK, 0], lerp(-8, HOOK0.yaw, q), 8, lerp(5.8, HOOK0.dist, q), 26, 2.2);
    }
    case "mol": return orbit([MX, MOL_Y + 0.35, 0], lerp(26, -14, k), lerp(14, 6, k), lerp(11.5, 10.4, k), 26, 2.8);
    case "bottle": {
      if (s.id === "bottle") return orbit(FLACON, lerp(-24, -6, k), lerp(17, 6, k), lerp(11.8, 12.6, k), 26, 2.4); // crane down
      return orbit(FLACON, lerp(8, -4, k), 6, lerp(13, 12.2, k), 26, 2.4);
    }
    default: return orbit([0, 1.6, 0], 0, 6, 18, 26, 8);
  }
}
const camDist = (c: Cam) => Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]);

/* ================================================================== solids */
const chamfer = (w: number, h: number, d: number, c: number) =>
  manifold.hull(manifold.box(w - 2 * c, h, d - 2 * c), manifold.box(w, h - 2 * c, d - 2 * c), manifold.box(w - 2 * c, h - 2 * c, d));
const GLASS = chamfer(BOT.w, BOT.h, BOT.d, BOT.ch);
const SHOULDER = chamfer(0.56, 0.12, 0.42, 0.04);
/* the cut stopper: an octagonal table, its top a little smaller (facets), standing on its axis */
const OCT = Array.from({ length: 8 }, (_, i) => [0.5 * Math.cos((i * Math.PI) / 4 + Math.PI / 8), 0.5 * Math.sin((i * Math.PI) / 4 + Math.PI / 8)] as [number, number]);
const CAP = manifold.extrude([OCT], 0.3, { scaleTop: [0.82, 0.82] }).rotate(-90, 0, 0);
const SOCLE = manifold.cylinder(1.35, SOCLE_H).rotate(-90, 0, 0);
const M = ({ c, r = 0.5, m = 0, e = 0 }: { c: string; r?: number; m?: number; e?: number }) => (
  <StandardMaterial base_color={c} perceptual_roughness={r} metallic={m} emissive={glow(c, e)} />
);
const Glass = ({ tint = "#F4F1EA", tr = 0.86 }: { tint?: string; tr?: number }) => (
  <StandardMaterial base_color={tint} perceptual_roughness={0.04} specular_transmission={tr} ior={1.25} thickness={0.05} reflectance={0.6} />
);

/* a gold ring that draws itself round a subject */
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

/* shelves of small bottles behind a station: out of focus, they are the cabinet's depth */
function Shelves({ x, z, id }: { x: number; z: number; id: string }) {
  const tints = ["#E9A5B7", "#D6B477", "#BAC79B", "#B8ACDF", "#E8B04F", "#F4F1EA", "#C98A3E"];
  return (
    <>
      {[2.1, 3.7].map((y, r) => (
        <Mesh3d key={`s${r}`} name={`${id}-shelf-${r}`} transform={Transform.fromXyz(x, y, z)}><Cuboid half_size={[5.2, 0.04, 0.32]} /><M c="#2C1823" r={0.5} /></Mesh3d>
      ))}
      {Array.from({ length: 18 }, (_, i) => {
        const row = i % 2, col = Math.floor(i / 2), h = 0.32 + hash(i + 3) * 0.4, rr = 0.1 + hash(i + 9) * 0.1;
        const bx = x - 4.6 + col * 1.15 + hash(i) * 0.3, by = (row ? 3.7 : 2.1) + 0.04 + h / 2;
        return (
          <Mesh3d key={i} name={`${id}-b-${i}`} allowOverlap transform={Transform.fromXyz(bx, by, z + hash(i + 5) * 0.2 - 0.1)}>
            {i % 3 ? <Cylinder radius={rr} half_height={h / 2} /> : <Cuboid half_size={[rr, h / 2, rr * 0.7]} />}
            <StandardMaterial base_color={tints[i % tints.length]} perceptual_roughness={0.1} specular_transmission={0.5} ior={1.2} thickness={0.05} emissive={glow(tints[i % tints.length], 0.06)} />
          </Mesh3d>
        );
      })}
    </>
  );
}

function Room({ x, id }: { x: number; id: string }) {
  return (
    <>
      <Mesh3d name={`${id}-floor`} transform={Transform.fromXyz(x, -0.05, 0)}><Cuboid half_size={[9, 0.05, 9]} /><StandardMaterial base_color="#241219" perceptual_roughness={0.32} reflectance={0.6} /></Mesh3d>
      <Mesh3d name={`${id}-wall`} transform={Transform.fromXyz(x, 6, -5)}><Cuboid half_size={[9, 6, 0.05]} /><M c={C.plum} r={0.9} /></Mesh3d>
      {[-3.4, 3.4].map((dx, k) => (
        <Mesh3d key={k} name={`${id}-mould-${k}`} allowOverlap transform={Transform.fromXyz(x + dx, 3.4, -4.93)}><Cuboid half_size={[0.015, 3.2, 0.015]} /><M c={C.gold} r={0.3} m={1} /></Mesh3d>
      ))}
      <Shelves x={x} z={-4.4} id={id} />
    </>
  );
}

/* ================================================================== station 1: Beaux's ten vials */
function Vials({ t }: { t: number }) {
  const picked = out3(ramp(t, w("hook", "five") - 0.1, 0.6));
  return (
    <>
      <Room x={VX} id="v" />
      <Mesh3d name="bench" transform={Transform.fromXyz(VX, TABLE_Y / 2, 0)}><Cuboid half_size={[3.3, TABLE_Y / 2, 0.85]} /><StandardMaterial base_color="#3A1C2C" perceptual_roughness={0.22} clearcoat={1} clearcoat_perceptual_roughness={0.08} /></Mesh3d>
      <Mesh3d name="bench-rim" allowOverlap transform={Transform.fromXyz(VX, TABLE_Y + 0.005, 0.85)}><Cuboid half_size={[3.3, 0.012, 0.012]} /><M c={C.gold} r={0.3} m={1} /></Mesh3d>
      {VIAL_N.map((n, k) => {
        const five = k === 4, lift = five ? 0.18 * picked : 0, x = vialX(k), y0 = TABLE_Y + lift;
        return (
          <Entity key={k} transform={Transform.fromXyz(x, y0, 0)}>
            <Mesh3d name={`vial-juice-${k}`} allowOverlap transform={Transform.fromXyz(0, 0.25, 0)}>
              <Cylinder radius={0.1} half_height={0.2} />
              <M c={C.juice} r={0.2} e={five ? 0.35 + 2.2 * picked : 0.3} />
            </Mesh3d>
            <Mesh3d name={`vial-glass-${k}`} allowOverlap transform={Transform.fromXyz(0, 0.3, 0)}><Cylinder radius={0.13} half_height={0.3} /><Glass /></Mesh3d>
            <Mesh3d name={`vial-cap-${k}`} allowOverlap transform={Transform.fromXyz(0, 0.67, 0)}><Cylinder radius={0.075} half_height={0.08} /><M c={C.gold} r={0.25} m={1} /></Mesh3d>
            <Mesh3d name={`vial-tag-${k}`} allowOverlap transform={Transform.fromXyz(0, 0.075 - lift, 0.36).withRotation(Quat.fromEuler("XYZ", -0.9, 0, 0))}><Cuboid half_size={[0.19, 0.12, 0.008]} /><M c={five ? C.rose : C.ivory} r={0.7} e={five ? 0.25 * picked : 0} /></Mesh3d>
            <Mesh3d name={`vial-n-${k}`} allowOverlap transform={Transform.fromXyz(n.length > 1 ? -0.115 : -0.06, 0.04 - lift, 0.43).withRotation(Quat.fromEuler("XYZ", -0.9, 0, 0))}>
              <Text3D size={0.17} depth={0.008}>{n}</Text3D>
              <M c={C.ink} r={0.6} />
            </Mesh3d>
          </Entity>
        );
      })}
      <FogVolume name="v-air" position={[V5 - 1.2, 4, 1.2]} rotation={[0, 0, 0.42]} scale={[1.6, 7, 1.6]} density={0.05} scattering={0.6} anisotropy={0.55} color="#F6DCE4" />
    </>
  );
}

/* ================================================================== station 2: an aldehyde (decanal, C10H20O) */
type Atom = { p: V3; el: "C" | "H" | "O" };
const MOL: { atoms: Atom[]; bonds: [number, number, boolean][] } = (() => {
  const atoms: Atom[] = [], bonds: [number, number, boolean][] = [];
  const n = 10, dx = 0.5, dy = 0.3;
  for (let i = 0; i < n; i++) atoms.push({ p: [(i - (n - 1) / 2) * dx, i % 2 ? dy / 2 : -dy / 2, 0], el: "C" });
  for (let i = 1; i < n; i++) bonds.push([i - 1, i, false]);
  const o = atoms.length; atoms.push({ p: [atoms[0].p[0] - 0.36, atoms[0].p[1] + 0.42, 0], el: "O" }); bonds.push([0, o, true]);
  const h0 = atoms.length; atoms.push({ p: [atoms[0].p[0] - 0.4, atoms[0].p[1] - 0.28, 0], el: "H" }); bonds.push([0, h0, false]);
  for (let i = 1; i < n; i++) {
    const up = i % 2 ? 1 : -1, c = atoms[i].p;
    for (const z of [0.4, -0.4]) { const h = atoms.length; atoms.push({ p: [c[0], c[1] + up * 0.24, z], el: "H" }); bonds.push([i, h, false]); }
    if (i === n - 1) { const h = atoms.length; atoms.push({ p: [c[0] + 0.42, c[1] + up * 0.1, 0], el: "H" }); bonds.push([i, h, false]); }
  }
  return { atoms, bonds };
})();
function Bond({ a, b, id, dbl }: { a: V3; b: V3; id: string; dbl: boolean }) {
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const offs = dbl ? [-0.045, 0.045] : [0];
  return (
    <Entity transform={Transform.fromXyz(...mid).lookingAt(b)}>
      {offs.map((o, k) => (
        <Mesh3d key={k} name={`${id}-${k}`} allowOverlap transform={Transform.fromXyz(o, 0, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}>
          <Cylinder radius={dbl ? 0.028 : 0.036} half_height={len / 2} />
          <M c="#CDBFC6" r={0.35} m={0.2} />
        </Mesh3d>
      ))}
    </Entity>
  );
}
function Molecule({ t }: { t: number }) {
  const spin = t * 0.35, bob = Math.sin(t * 1.1) * 0.05;
  const hot = out3(ramp(t, w("secret", "aldehydes") - 0.1, 0.6));
  return (
    <>
      <Room x={MX} id="m" />
      <Entity transform={Transform.fromXyz(MX, MOL_Y + bob, 0).withRotation(Quat.fromEuler("XYZ", 0.25, spin, 0.1)).withScale([0.82, 0.82, 0.82])}>
        {MOL.bonds.map(([i, j, d], k) => <Bond key={k} id={`bond-${k}`} a={MOL.atoms[i].p} b={MOL.atoms[j].p} dbl={d} />)}
        {MOL.atoms.map((a, k) => (
          <Mesh3d key={k} name={`atom-${k}`} allowOverlap transform={Transform.fromXyz(...a.p)}>
            <Sphere radius={a.el === "H" ? 0.1 : a.el === "O" ? 0.19 : 0.17} />
            {a.el === "O" ? <M c={C.rose} r={0.25} e={0.4 + 2.6 * hot} /> : a.el === "H" ? <M c={C.hydro} r={0.4} /> : <M c={C.carbon} r={0.3} m={0.1} />}
          </Mesh3d>
        ))}
      </Entity>
      <Mesh3d name="mol-plinth" transform={Transform.fromXyz(MX, 0.35, 0)}><Cylinder radius={0.9} half_height={0.35} /><M c="#3A1C2C" r={0.38} m={0.1} /></Mesh3d>
      <FogVolume name="m-air" position={[MX - 1.2, 4.4, 1.2]} rotation={[0, 0, 0.4]} scale={[1.8, 7, 1.8]} density={0.05} scattering={0.6} anisotropy={0.6} color="#F6DCE4" />
    </>
  );
}

/* ================================================================== station 3: the bottle (our model of the silhouette) */
function Bottle({ t }: { t: number }) {
  const { s } = shotAt(t);
  const fill = 0.84;
  return (
    <>
      <Room x={0} id="c" />
      <Mesh3d name="socle" shape={SOCLE} transform={Transform.fromXyz(0, SOCLE_H / 2, 0)}><M c="#3A1C2C" r={0.38} m={0.1} /></Mesh3d>
      <Mesh3d name="socle-rim" allowOverlap transform={Transform.fromXyz(0, SOCLE_H + 0.004, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}><Torus major_radius={1.33} minor_radius={0.018} /><M c={C.gold} r={0.3} m={1} /></Mesh3d>
      <Mesh3d name="juice" allowOverlap transform={Transform.fromXyz(0, INNER.floor + (INNER.h * fill) / 2, 0)}>
        <Cuboid half_size={[INNER.w / 2, (INNER.h * fill) / 2, INNER.d / 2]} />
        <StandardMaterial base_color={C.juice} perceptual_roughness={0.1} specular_transmission={0.25} ior={1.33} thickness={0.4} emissive={glow(C.juice, 0.55)} />
      </Mesh3d>
      <Mesh3d name="glass" allowOverlap shape={GLASS} transform={Transform.fromXyz(0, BOT_Y, 0)}><Glass /></Mesh3d>
      {/* the label: ivory, a thin ink frame, "N°5" in our type */}
      <Mesh3d name="label" allowOverlap transform={Transform.fromXyz(0, BOT_Y + 0.12, BOT.d / 2 + 0.006)}><Cuboid half_size={[0.42, 0.3, 0.004]} /><M c="#FBF6EE" r={0.8} /></Mesh3d>
      {([[0, 0.27, 0.39, 0.006], [0, -0.27, 0.39, 0.006], [0.385, 0, 0.006, 0.27], [-0.385, 0, 0.006, 0.27]] as const).map(([bx, by, hx, hy], k) => (
        <Mesh3d key={k} name={`label-line-${k}`} allowOverlap transform={Transform.fromXyz(bx, BOT_Y + 0.12 + by, BOT.d / 2 + 0.012)}><Cuboid half_size={[hx, hy, 0.002]} /><M c={C.ink} r={0.6} /></Mesh3d>
      ))}
      <Mesh3d name="label-n5" allowOverlap transform={Transform.fromXyz(-0.08, BOT_Y + 0.09, BOT.d / 2 + 0.016)}>
        <Text3D size={0.21} depth={0.006}>N°5</Text3D>
        <M c={C.ink} r={0.5} />
      </Mesh3d>
      <Mesh3d name="shoulder" allowOverlap shape={SHOULDER} transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.07, 0)}><Glass /></Mesh3d>
      <Mesh3d name="thread" allowOverlap transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.15, 0)}><Cylinder radius={0.2} half_height={0.035} /><M c={C.ink} r={0.7} /></Mesh3d>
      <Mesh3d name="cap" allowOverlap shape={CAP} transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.19, 0).withScale([1, 1, 0.82])}><Glass tint="#F8F6F2" tr={0.8} /></Mesh3d>
      <OrbitRing id="ring" t={t} at={s.id === "moma" ? w("moma", "Museum") - 0.15 : 1e9} center={[0, 1.35, 0]} r={1.35} />
      <FogVolume name="c-air" position={[-1.4, 4.3, 1.4]} rotation={[0, 0, 0.42]} scale={[1.8, 7, 1.8]} density={0.05} scattering={0.6} anisotropy={0.55} color="#F6DCE4" />
    </>
  );
}

/* ================================================================== paper table: one card per shot */
function Card({ id, img, at: p, w: cw, h: ch, show }: { id: string; img: string; at: V3; w: number; h: number; show: number }) {
  if (show <= 0.002) return null;
  return (
    <Entity transform={Transform.fromXyz(p[0], p[1] + (1 - show) * 0.6, p[2])}>
      <Mesh3d name={`${id}-mat`} transform={Transform.fromXyz(0, 0.03, 0)}><Cuboid half_size={[cw / 2 + 0.1, 0.03, ch / 2 + 0.1]} /><M c={C.ivory} r={0.8} /></Mesh3d>
      <ImagePlane src={staticFile(`plates/${img}`)} width={cw} height={ch} position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]} />
    </Entity>
  );
}
function Paper({ t }: { t: number }) {
  const { s } = shotAt(t);
  return (
    <>
      <Mesh3d name="paper" transform={Transform.fromXyz(PAPER.x + 10, -0.02, 0)}><Cuboid half_size={[24, 0.02, 14]} /><M c={C.paper} r={0.95} /></Mesh3d>
      {SHOTS.filter((x) => x.kind === "card").map((x) => (
        <Card key={x.id} id={`card-${x.id}`} img={x.img!} at={PAPER.card} w={2.0} h={2.67} show={s.id === x.id ? out3(ramp(t, s.from + 0.05, 0.5)) : 0} />
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
const chip = (bg: string, fg: string): React.CSSProperties => ({ ...label(fg), fontWeight: 700, fontSize: 30, background: bg, padding: "10px 16px", borderRadius: 8 });

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

function FullPainting({ t, s, end }: { t: number; s: Shot; end: number }) {
  const k = clamp01((t - s.from) / Math.max(0.5, end - s.from));
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <img src={staticFile(`plates/${s.img}`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover", transform: `scale(${1.04 + 0.06 * k})`, transformOrigin: "50% 45%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(25,15,24,0.9) 0%, rgba(25,15,24,0.72) 22%, rgba(25,15,24,0.12) 42%, rgba(25,15,24,0.1) 58%, rgba(25,15,24,0.72) 100%)" }} />
    </AbsoluteFill>
  );
}

function HookTitle({ t, pick = true }: { t: number; pick?: boolean }) {
  return (
    <>
      <div style={statStyle(C.ivory)}>1920</div>
      <div style={{ ...label(C.gold), marginTop: 14 }}>ten vials · Coco Chanel picks one</div>
      {pick && <div style={{ ...titleStyle(C.ink), textShadow: "none", fontSize: 88, marginTop: 18, display: "inline-block", background: C.rose, padding: "6px 22px 10px", borderRadius: 10, opacity: fadeIn(t, w("hook", "five")) }}>N°5</div>}
    </>
  );
}

function ShotText({ t, s, end }: { t: number; s: Shot; end: number }) {
  const ink = { ...titleStyle(C.ink), textShadow: "none" };
  switch (s.id) {
    case "hook": return <Block t={t} a={-1} b={end}><HookTitle t={t} /></Block>;
    case "loop": return <Block t={t} a={DUR - 1.3} b={DUR + 1}><HookTitle t={t} pick={false} /></Block>;
    case "beaux": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={titleStyle()}>Ernest Beaux</div>
        <div style={{ ...label(C.gold), marginTop: 12 }}>the perfumer</div>
        <div style={{ ...chip(C.rose, C.ink), display: "inline-block", marginTop: 18, opacity: fadeIn(t, w("beaux", "numbered")) }}>vials 1–5 · 20–24</div>
      </Block>
    );
    case "why": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={titleStyle()}>Why the fifth?</div>
        <div style={{ ...sensory(), marginTop: 14, opacity: fadeIn(t, w("why", "Nobody")) }}>nobody really knows</div>
        <div style={{ ...chip(C.ivory, C.ink), display: "inline-block", marginTop: 18, opacity: fadeIn(t, w("why", "Some")) }}>story A · her lucky number</div>
      </Block>
    );
    case "soap": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={{ ...chip(C.plum, C.ivory), display: "inline-block" }}>story B</div>
        <div style={{ ...ink, marginTop: 16, opacity: fadeIn(t, w("soap", "soap")) }}>soap &amp; clean<br />laundry</div>
      </Block>
    );
    case "vote": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={titleStyle()}>Which is it?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20, alignItems: "flex-start" }}>
          <div style={{ ...chip(C.ivory, C.ink), fontSize: 36, opacity: fadeIn(t, w("vote", "lucky")) }}>A · the lucky number</div>
          <div style={{ ...chip(C.rose, C.ink), fontSize: 36, opacity: fadeIn(t, w("vote", "smell")) }}>B · the smell</div>
        </div>
        <div style={{ ...sensory(C.ivory), fontSize: 54, marginTop: 16, opacity: fadeIn(t, w("vote", "Pick")) }}>pick one ↓</div>
      </Block>
    );
    case "secret": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={{ ...titleStyle(), opacity: fadeIn(t, w("secret", "aldehydes")) }}>Aldehydes</div>
        <div style={{ ...label(C.gold), marginTop: 12, opacity: fadeIn(t, w("secret", "family")) }}>a family of molecules</div>
        <div style={{ ...sensory(), marginTop: 16, opacity: fadeIn(t, w("secret", "tiny")) }}>others: a trace…</div>
        <div style={{ ...sensory(C.ivory), marginTop: 2, opacity: fadeIn(t, w("secret", "Beaux")) }}>Beaux: a lot</div>
      </Block>
    );
    case "grasse": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={titleStyle()}>Grasse</div>
        <div style={{ ...label(C.gold), marginTop: 12, opacity: fadeIn(t, w("grasse", "south")) }}>jasmine · south of France</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 20, opacity: fadeIn(t, w("grasse", "1987")) }}>
          <div style={{ ...statStyle(C.ivory), fontSize: 150 }}>1987</div>
          <div style={{ ...sensory(C.ivory), fontSize: 50 }}>one family's<br />fields</div>
        </div>
      </Block>
    );
    case "bottle": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={{ ...titleStyle(), opacity: fadeIn(t, w("bottle", "Almost")) }}>Almost plain</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
          <div style={{ ...chip(C.ivory, C.ink), opacity: fadeIn(t, w("bottle", "Clear")) }}>clear glass</div>
          <div style={{ ...chip(C.ivory, C.ink), opacity: fadeIn(t, w("bottle", "sharp")) }}>sharp corners</div>
          <div style={{ ...chip(C.rose, C.ink), opacity: fadeIn(t, w("bottle", "cut")) }}>a cut stopper</div>
        </div>
      </Block>
    );
    case "vendome": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={titleStyle()}>Place Vendôme</div>
        <div style={{ ...label(C.gold), marginTop: 12 }}>Paris</div>
        <div style={{ ...chip(C.rose, C.ink), display: "inline-block", marginTop: 18 }}>Chanel's account</div>
      </Block>
    );
    case "marilyn": return (
      <Block t={t} a={w("marilyn", "1952") - 0.12} b={end}>
        <div style={statStyle(C.ivory)}>1952</div>
        <div style={{ ...label(C.gold), marginTop: 12, opacity: fadeIn(t, w("marilyn", "Marilyn")) }}>Marilyn Monroe, to a magazine</div>
        <div style={{ ...sensory(), marginTop: 16, opacity: fadeIn(t, w("marilyn", "few")) }}>“a few drops”</div>
      </Block>
    );
    case "tape": return (
      <Block t={t} a={s.from + 0.05} b={end}>
        <div style={ink}>A lost recording</div>
        <div style={{ ...label(C.ink), fontWeight: 700, marginTop: 12 }}>1960 interview</div>
        <div style={{ ...chip(C.plum, C.ivory), display: "inline-block", marginTop: 18, opacity: fadeIn(t, w("tape", "ad")) }}>in a 2013 ad</div>
      </Block>
    );
    case "moma": return (
      <Block t={t} a={w("moma", "1959") - 0.12} b={end}>
        <div style={statStyle(C.ivory)}>1959</div>
        <div style={{ ...label(C.gold), marginTop: 12, opacity: fadeIn(t, w("moma", "Museum")) }}>MoMA · New York</div>
        <div style={{ ...sensory(), marginTop: 16, opacity: fadeIn(t, w("moma", "collection")) }}>into the collection</div>
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
      {s.kind === "full" && <FullPainting t={t} s={s} end={end} />}
      {!light && s.kind !== "full" && <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 780, backgroundImage: "linear-gradient(180deg, rgba(25,15,24,0.88) 0%, rgba(25,15,24,0.52) 58%, rgba(25,15,24,0) 100%)" }} />}
      {light && <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 760, backgroundImage: "linear-gradient(180deg, rgba(242,229,215,0.97) 0%, rgba(242,229,215,0.8) 64%, rgba(242,229,215,0) 100%)" }} />}
      <div style={abs(L.left, L.badgeY - 12, { display: "flex", alignItems: "center", gap: 14 })}>
        <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 26, letterSpacing: "0.24em", color: C.ink, background: C.rose, padding: "8px 14px 7px 17px", borderRadius: 4 }}>SILLAGE</div>
        <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 26, letterSpacing: "0.12em", color: C.rose, background: C.ink, padding: "8px 12px 7px", borderRadius: 4 }}>N°5</div>
      </div>
      <ShotText t={t} s={s} end={end} />
      <Captions t={t} />
    </AbsoluteFill>
  );
}

function CoverTitle() {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <style>{FONTS}</style>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 900, backgroundImage: "linear-gradient(180deg, rgba(25,15,24,0.96) 0%, rgba(25,15,24,0.7) 55%, rgba(25,15,24,0) 100%)" }} />
      <div style={abs(L.left, 250, { display: "flex", gap: 14, alignItems: "center" })}>
        <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 30, letterSpacing: "0.24em", color: C.ink, background: C.rose, padding: "9px 16px 8px 19px", borderRadius: 4 }}>SILLAGE</div>
        <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 30, letterSpacing: "0.12em", color: C.rose }}>N°5</div>
      </div>
      <div style={abs(L.left, 330, { width: 880, fontFamily: "Bricolage", fontWeight: 800, fontSize: 104, lineHeight: 0.98, letterSpacing: "-0.015em", textTransform: "uppercase", color: C.ivory })}>Why is it<br />called <span style={{ color: C.rose }}>N°5?</span></div>
      <div style={abs(L.left + 2, 560, { fontFamily: "Instrument", fontStyle: "italic", fontSize: 58, color: C.gold })}>nobody really knows</div>
    </AbsoluteFill>
  );
}

function Sillage005() {
  const t = w("moma", "collection") + 0.4;
  const cam = cameraAt(t);
  const { s } = shotAt(t);
  const exposure = LIGHT.has(s.kind) ? -0.2 : 0.35;
  const sfx: [number, string, number][] = [
    [w("hook", "1920"), "stamp", 0.4], [w("hook", "five"), "boom", 0.4], [w("beaux", "numbered"), "pop", 0.3],
    [w("why", "Some"), "pop", 0.3], [w("soap", "soap"), "pop", 0.3], [w("vote", "lucky"), "pop", 0.35],
    [w("vote", "smell"), "pop", 0.35], [w("secret", "aldehydes"), "boom", 0.35], [w("grasse", "1987"), "stamp", 0.35],
    [w("bottle", "cut"), "pop", 0.3], [w("marilyn", "1952"), "stamp", 0.35], [w("tape", "ad"), "pop", 0.3],
    [w("moma", "1959"), "stamp", 0.4],
  ];
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: (cam.fov * Math.PI) / 180 } }}>
        <DepthOfField focal_distance={camDist(cam)} aperture_f_stops={cam.f} max_circle_of_confusion_diameter={48} />
      </Camera3d>
      <ToneMapping mode="tony" exposure={exposure} />
      <Bloom intensity={0.2} threshold={1.0} />
      <VolumetricFog ambient={0} />
      <AmbientLight brightness={120} color="#F2D8E2" />
      <DirectionalLight transform={Transform.fromXyz(-5, 12, 9).lookingAt([0, 0, 0])} illuminance={2200} color="#FFF0E2" shadow_maps_enabled soft_shadow_size={3} />
      {/* a volumetric key per 3D station: the shaft you see in the air */}
      <SpotLight volumetric transform={Transform.fromXyz(-3.2, 7.5, 3.5).lookingAt([0, 1.4, 0])} intensity={5600000} outer_angle={0.34} inner_angle={0.16} color="#FFF1E4" shadow_maps_enabled />
      <SpotLight volumetric transform={Transform.fromXyz(VX - 2.5, 7.2, 3.2).lookingAt([V5, TABLE_Y + 0.4, 0])} intensity={4800000} outer_angle={0.36} inner_angle={0.18} color="#FFF1E4" shadow_maps_enabled />
      <SpotLight transform={Transform.fromXyz(MX - 2.6, 7.4, 3.4).lookingAt([MX, MOL_Y, 0])} intensity={4600000} outer_angle={0.36} inner_angle={0.2} color="#FFF1E4" shadow_maps_enabled />
      {[0, VX, MX].map((x, k) => (
        <PointLight key={k} transform={Transform.fromXyz(x + 1.4, 3.4, -2.4)} intensity={1300000} color={C.rose} range={7} />
      ))}
      <PointLight transform={Transform.fromXyz(4, 2.5, 5)} intensity={500000} color="#F6E2D6" range={12} />
      <PointLight transform={Transform.fromXyz(VX + 3, 2.4, 4)} intensity={500000} color="#F6E2D6" range={12} />
      <PointLight transform={Transform.fromXyz(PAPER.x + 10, 14, 6)} intensity={18000000} color="#FFF6EC" range={60} shadow_maps_enabled />
      <Vials t={t} />
      <Molecule t={t} />
      <Bottle t={t} />
      <Paper t={t} />
      <CoverTitle />
          </AbsoluteFill>
  );
}

registerRoot(() => <Composition id="cover" component={Sillage005} width={W} height={H} fps={FPS} durationInFrames={1} />);
