/**
 * The hero flacon (P1). Glass with transmission + clearcoat in a studio environment, a thick glass base, an amber liquid
 * whose level is data, a faceted gold cap, a black-lacquer label with the real SILLAGE logotype (serif glyph paths),
 * key + rim + a sweep light, a dark set with a pool of light on the socle. The flacon is the dataviz: the level follows
 * the figure, petals pile up round the socle, a drop falls for "1 g". No highlight ellipse.
 */
import { Entity, manifold } from "raea/3d";
import { Cuboid, Cylinder, Mesh3d, Sphere, Torus } from "raea/mesh";
import { StandardMaterial } from "raea/pbr";
import { PointLight, SpotLight } from "raea/light";
import { Quat, Transform } from "raea/transform";
import { LinearRgba, Srgba } from "raea/color";
import TOK from "../tokens.json";
import { GLYPHS } from "./glyphs.gen";
import { clamp01, hash, inOut3, inOutSine, lerp, out3, rad, ramp, V3 } from "./time";

const C = TOK.color;
export const glow = (hex: string, k: number) => LinearRgba.from(Srgba.hex(hex)).mul(k);

/* ---------------- geometry (scene units ≈ decimetres) */
export const SOCLE_H = 0.34;
export const BOT = { w: 1.5, h: 2.0, d: 0.95, r: 0.16 };
export const BOT_Y = SOCLE_H + BOT.h / 2 + 0.01;
const INNER = { w: 1.2, d: 0.66, floor: SOCLE_H + 0.24, h: 1.6 };
export const FLACON: V3 = [0, 2.3, 0];
const GLASS = manifold.roundedBox(BOT.w, BOT.h, BOT.d, BOT.r);
const BASE = manifold.roundedBox(BOT.w - 0.06, 0.2, BOT.d - 0.06, 0.08);
const SHOULDER = manifold.roundedBox(0.6, 0.14, 0.5, 0.05);
const OCT = Array.from({ length: 8 }, (_, i) => [0.4 * Math.cos((i * Math.PI) / 4 + Math.PI / 8), 0.4 * Math.sin((i * Math.PI) / 4 + Math.PI / 8)] as [number, number]);
const CAP = manifold.extrude([OCT], 0.56, { scaleTop: [0.86, 0.86] }).rotate(-90, 0, 0);
const SOCLE = manifold.cylinder(1.4, SOCLE_H).rotate(-90, 0, 0);

/* ---------------- the label: black lacquer, a thin gold frame, SILLAGE spaced, N°x — glyph paths, no web font */
function word(text: string, size: number, track: number) {
  const s = size / GLYPHS.unitsPerEm;
  let x = 0, d = "";
  for (const ch of text) {
    const g = (GLYPHS.glyphs as Record<string, { d: string; adv: number }>)[ch];
    if (!g) continue;
    if (g.d) d += `<path transform="translate(${x.toFixed(1)} 0) scale(${s} ${-s})" d="${g.d}"/>`;
    x += g.adv * s + track;
  }
  return { d, w: x - track };
}
export function labelSvg(n: string | number) {
  const W = 1024, H = 640;
  const top = word("SILLAGE", 120, 34), num = word(`N°${n}`, 92, 6);
  return "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g transform="translate(0 ${H}) scale(1 -1)"><rect width="${W}" height="${H}" fill="#120910"/>` +
    `<rect x="26" y="26" width="${W - 52}" height="${H - 52}" fill="none" stroke="${C.gold}" stroke-width="5"/>` +
    `<rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="${C.gold}" stroke-width="1.6" opacity="0.7"/>` +
    `<g fill="${C.goldLight}" transform="translate(${(W - top.w) / 2} 300)">${top.d}</g>` +
    `<rect x="${W / 2 - 70}" y="352" width="140" height="3" fill="${C.gold}"/>` +
    `<g fill="${C.gold}" transform="translate(${(W - num.w) / 2} 492)">${num.d}</g></g></svg>`,
  );
}

/* ---------------- cameras: one preset per flacon shot, so no two shots move the same way */
export type Cam = { pos: V3; look: V3; fov: number; f: number };
export const orbit = (target: V3, yaw: number, pitch: number, dist: number, fov = 26, f = 2.8): Cam => {
  const y = rad(yaw), p = rad(pitch);
  return { look: target, fov, f, pos: [target[0] + dist * Math.sin(y) * Math.cos(p), target[1] + dist * Math.sin(p), target[2] + dist * Math.cos(y) * Math.cos(p)] };
};
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: [lerp(a.pos[0], b.pos[0], k), lerp(a.pos[1], b.pos[1], k), lerp(a.pos[2], b.pos[2], k)],
  look: [lerp(a.look[0], b.look[0], k), lerp(a.look[1], b.look[1], k), lerp(a.look[2], b.look[2], k)],
  fov: lerp(a.fov, b.fov, k), f: lerp(a.f, b.f, k),
});
const CAPY = SOCLE_H + BOT.h + 0.5, LABY = BOT_Y - 0.12;
/** k: 0→1 over the shot (already eased by the caller) */
export const CAMERAS: Record<string, (k: number) => Cam> = {
  hero: (k) => orbit(FLACON, lerp(-10, -5, k), 7, lerp(15, 14.4, k)),
  orbit: (k) => orbit(FLACON, lerp(-28, 22, k), 9, 14.2),
  pushIn: (k) => orbit(FLACON, lerp(4, -2, k), 8, lerp(15.6, 11.8, k)),
  low: (k) => orbit([0, 2.1, 0], lerp(10, 2, k), lerp(-3, 2, k), lerp(13.2, 12.6, k), 28),
  macroCap: (k) => orbit([0, CAPY, 0], lerp(-18, -6, k), lerp(14, 6, k), lerp(6.4, 5.4, k), 24, 2.0),
  /** framed on the drop beside the bottle ("1 g") */
  drop: (k) => orbit([0.8, 1.7, 0.45], lerp(-10, -2, k), lerp(12, 8, k), lerp(10.6, 9.8, k), 26, 2.2),
  macroLabel: (k) => orbit([0, LABY + 0.4, 0], lerp(8, -4, k), 3, lerp(7.4, 6.6, k), 24, 2.2),
  crane: (k) => orbit(FLACON, lerp(-20, -6, k), lerp(26, 6, k), lerp(14.2, 14.8, k)),
  wide: (k) => orbit([0, 1.9, 0], lerp(-6, 6, k), 10, lerp(17.5, 16.8, k)),
};
/** the loop's last shot ends exactly on the hook's first frame */
export const returnTo = (from: Cam, preset: string, k: number) => mix(from, CAMERAS[preset](0), inOut3(k));

/* ---------------- materials */
const M = ({ c, r = 0.5, m = 0, e = 0 }: { c: string; r?: number; m?: number; e?: number }) => (
  <StandardMaterial base_color={c} perceptual_roughness={r} metallic={m} emissive={glow(c, e)} />
);
const Glass = ({ tint = "#FBF1F2" }: { tint?: string }) => (
  <StandardMaterial base_color={tint} perceptual_roughness={0.03} specular_transmission={0.94} diffuse_transmission={0} ior={1.5} thickness={0.22} reflectance={0.55} clearcoat={1} clearcoat_perceptual_roughness={0.02} />
);

/* ---------------- petals: the tonnage piles up round the socle (count is data) */
/** petal i lands at land(i) and, when the count drops again (before the loop), lifts away at leave(i) */
export type PetalTimes = { total: number; land: (i: number) => number; leave: (i: number) => number };
function Petals({ t, pt, color }: { t: number; pt: PetalTimes; color: string }) {
  return (
    <>
      {Array.from({ length: pt.total }, (_, i) => {
        const a = hash(i) * Math.PI * 2, ring = 1.55 + Math.pow(hash(i + 40), 0.7) * 1.9;
        const p = out3(ramp(t, pt.land(i), 0.55)) * (1 - inOut3(ramp(t, pt.leave(i), 0.8)));
        if (p <= 0.001) return null;
        const pile = Math.floor(i / 26) * 0.045;
        const x = Math.cos(a) * ring, z = Math.sin(a) * ring * 0.8 + 0.6, y = lerp(3.6 + hash(i + 3) * 2, 0.03 + pile, p);
        const tilt = (1 - p) * (hash(i + 9) - 0.5) * 2.4;
        return (
          <Mesh3d key={i} name={`petal-${i}`} allowOverlap transform={Transform.fromXyz(x, y, z).withRotation(Quat.fromEuler("XYZ", tilt + 0.1, a * 1.7 + (1 - p) * 3, 0.2 * hash(i + 5))).withScale([1, 0.16, 0.66])}>
            <Sphere radius={0.15 + hash(i + 11) * 0.05} />
            <StandardMaterial base_color={i % 3 ? color : C.petalDeep} perceptual_roughness={0.55} diffuse_transmission={0.35} thickness={0.02} />
          </Mesh3d>
        );
      })}
    </>
  );
}

/* ---------------- one drop for "1 g": forms above, falls, a ring spreads on the socle */
function Drop({ t, at, color }: { t: number; at: number; color: string }) {
  const fall = ramp(t, at, 0.7), ring = ramp(t, at + 0.7, 0.9);
  if (t < at - 0.6 || ring >= 1) return null;
  const form = out3(ramp(t, at - 0.6, 0.6));
  const y = lerp(4.6, SOCLE_H + 0.06, fall * fall), stretch = 1 + fall * 0.9;
  return (
    <>
      {fall < 1 && (
        <Mesh3d name="drop" allowOverlap transform={Transform.fromXyz(1.15, y, 0.55).withScale([0.8 * form, stretch * form, 0.8 * form])}>
          <Sphere radius={0.14} />
          <StandardMaterial base_color={color} perceptual_roughness={0.05} specular_transmission={0.6} ior={1.33} thickness={0.1} emissive={glow(color, 1.6)} />
        </Mesh3d>
      )}
      {ring > 0 && (
        <Mesh3d name="drop-ring" allowOverlap transform={Transform.fromXyz(1.15, SOCLE_H + 0.012, 0.55).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0)).withScale([0.3 + ring * 2.4, 0.3 + ring * 2.4, 1])}>
          <Torus major_radius={0.12} minor_radius={0.008} />
          <StandardMaterial base_color={color} emissive={glow(color, 2.2 * (1 - ring))} perceptual_roughness={0.2} />
        </Mesh3d>
      )}
    </>
  );
}

/* ---------------- the light sweep: a hot light crosses the glass on every change of figure */
function Sweep({ t, at }: { t: number; at: number[] }) {
  const s = at.map((a) => ramp(t, a - 0.05, 0.65)).find((k) => k > 0 && k < 1);
  if (s === undefined) return null;
  const k = inOutSine(s);
  return <PointLight transform={Transform.fromXyz(lerp(-3.2, 3.2, k), 2.6 + 0.6 * k, 2.4)} intensity={2600000 * Math.sin(Math.PI * k)} color="#FFF3E0" range={6} />;
}

export type FlaconState = { level: number; petals: PetalTimes; drop?: number; sweeps: number[] };

export function FlaconSet({ t, n, juice, juiceGlow = 0.4, petal, state }: { t: number; n: string | number; juice: string; juiceGlow?: number; petal: string; state: FlaconState }) {
  const lv = clamp01(state.level);
  const hJ = Math.max(0.01, INNER.h * lv), yJ = INNER.floor + hJ / 2;
  return (
    <>
      {/* the room: darker, a pool of light on the socle and a halo on the back wall */}
      <Mesh3d name="floor" transform={Transform.fromXyz(0, -0.05, 0)}><Cuboid half_size={[16, 0.05, 16]} /><StandardMaterial base_color="#1A0D16" perceptual_roughness={0.28} reflectance={0.5} /></Mesh3d>
      <Mesh3d name="wall" transform={Transform.fromXyz(0, 7, -6)}><Cuboid half_size={[16, 7, 0.05]} /><M c={C.plumDeep} r={0.95} /></Mesh3d>
      <Mesh3d name="socle" shape={SOCLE} transform={Transform.fromXyz(0, SOCLE_H / 2, 0)}><StandardMaterial base_color="#241019" perceptual_roughness={0.16} clearcoat={1} clearcoat_perceptual_roughness={0.05} /></Mesh3d>
      <Mesh3d name="socle-rim" allowOverlap transform={Transform.fromXyz(0, SOCLE_H + 0.004, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}><Torus major_radius={1.38} minor_radius={0.014} /><M c={C.gold} r={0.22} m={1} /></Mesh3d>
      <Petals t={t} pt={state.petals} color={petal} />
      {state.drop !== undefined && <Drop t={t} at={state.drop} color={juice} />}

      {/* liquid + meniscus, then the glass around it */}
      {/* unit-height cuboid scaled in y: raea keeps a mesh's first-frame geometry in a continuous render */}
      <Mesh3d name="juice" allowOverlap transform={Transform.fromXyz(0, yJ, 0).withScale([1, hJ, 1])}>
        <Cuboid half_size={[INNER.w / 2, 0.5, INNER.d / 2]} />
        <StandardMaterial base_color={juice} perceptual_roughness={0.08} reflectance={0.6} emissive={glow(juice, juiceGlow)} />
      </Mesh3d>
      <Mesh3d name="meniscus" allowOverlap transform={Transform.fromXyz(0, yJ + hJ / 2 + 0.004, 0)}><Cuboid half_size={[INNER.w / 2, 0.004, INNER.d / 2]} /><M c="#F3C46A" r={0.05} e={1.1} /></Mesh3d>
      <Mesh3d name="glass-base" allowOverlap shape={BASE} transform={Transform.fromXyz(0, SOCLE_H + 0.12, 0)}><Glass tint="#F6E9EC" /></Mesh3d>
      <Mesh3d name="glass" allowOverlap shape={GLASS} transform={Transform.fromXyz(0, BOT_Y, 0)}><Glass /></Mesh3d>
      <Mesh3d name="label" allowOverlap transform={Transform.fromXyz(0, LABY, BOT.d / 2 + 0.006)}><Cuboid half_size={[0.5, 0.3125, 0.004]} /><StandardMaterial base_color="#FFFFFF" base_color_texture={labelSvg(n)} perceptual_roughness={0.32} clearcoat={0.6} /></Mesh3d>
      <Mesh3d name="shoulder" allowOverlap shape={SHOULDER} transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.07, 0)}><Glass /></Mesh3d>
      <Mesh3d name="collar" allowOverlap transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.2, 0)}><Cylinder radius={0.22} half_height={0.08} /><M c={C.gold} r={0.16} m={1} /></Mesh3d>
      <Mesh3d name="cap" allowOverlap shape={CAP} transform={Transform.fromXyz(0, SOCLE_H + BOT.h + 0.28, 0)}><StandardMaterial base_color={C.gold} metallic={1} perceptual_roughness={0.14} clearcoat={0.4} /></Mesh3d>

      {/* light: warm key, rose rim from behind, a halo on the wall, the pool on the socle, the sweep */}
      <SpotLight transform={Transform.fromXyz(-3.6, 7.2, 6.4).lookingAt([0, 1.6, 0])} intensity={5600000} outer_angle={0.36} inner_angle={0.16} color="#FFE9D2" shadow_maps_enabled />
      <SpotLight transform={Transform.fromXyz(2.4, 5.2, -4.2).lookingAt([0, 2.2, 0])} intensity={3800000} outer_angle={0.42} inner_angle={0.2} color={C.rose} />
      <SpotLight transform={Transform.fromXyz(0, 5.5, 1.5).lookingAt([0, 4.6, -6])} intensity={2200000} outer_angle={0.5} inner_angle={0.08} color="#7A3A55" />
      <SpotLight transform={Transform.fromXyz(0, 9, 0.6).lookingAt([0, 0, 0])} intensity={2400000} outer_angle={0.24} inner_angle={0.1} color="#FFE6C8" />
      <SpotLight transform={Transform.fromXyz(-1.8, 6.4, 3.2).lookingAt([0, SOCLE_H + BOT.h + 0.5, 0])} intensity={900000} outer_angle={0.18} inner_angle={0.08} color="#FFE7C2" />
      <Sweep t={t} at={state.sweeps} />
    </>
  );
}
