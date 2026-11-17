/**
 * RECEIPTS #004 — "The iPhone is a storefront", rebuilt from scratch in raea (Bevy 0.20 through raea/3d).
 * Only the text is kept from the Remotion episode: the voice, its word timings and the sourced figures
 * (public/episodes/apple-iphone/SOURCES.md). Everything seen is new: one lit 3D set, one camera travelling through it.
 *
 *   hero    (x 0)   the phone on a plinth, 100 gold coins = $1,000 of devices (1 coin = $10)
 *   cost    (x -4)  the tray the 61 cost coins fly into ($610), 39 stay ($390)
 *   shop    (x 10)  100 tiles = $100 of services: 24 sink (cost), 76 light up (left after costs)
 *   share   (x 20)  two glass columns: services = 26% of sales, 40% of what's left
 *   profit  (x 30)  two towers: $140B devices vs $94B services, a 2/3 line
 *   point   (x 0)   back at the phone: an awning and an OPEN sign turn it into a storefront; the loop returns to frame 0
 *
 * Every cue is timed from the transcript (timings.json), never by eye. Numbers on screen: SOURCES.md, "our calc." where computed.
 */
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame } from "raea";
import { Bloom, DepthOfField, Entity, ToneMapping, manifold } from "raea/3d";
import { Cuboid, Cylinder, Mesh3d, Torus } from "raea/mesh";
import { Fog, StandardMaterial } from "raea/pbr";
import { AmbientLight, DirectionalLight, PointLight, Shadows, SpotLight } from "raea/light";
import { Quat, Transform } from "raea/transform";
import { Camera3d } from "raea/camera";
import { LinearRgba, Srgba } from "raea/color";
import { Text3D } from "raea/text";
import TIMINGS from "./timings.json";

/* ------------------------------------------------------------------ house tokens (RECEIPTS palette, studio safe area) */
const FPS = 30, W = 1080, H = 1920;
const P = { bg: "#03100B", glow: "#14402E", surface: "#245240", ink: "#F3F6EE", muted: "#8FA89B", lime: "#C8F53C", red: "#FF6B5E", amber: "#FFB648", gold: "#E9B949" };
const SAFE = { top: 250, bottom: 1440, left: 64, right: 940, railFrom: 860, railX: 930 };
const DUR = TIMINGS.duration + 0.5;

/* ------------------------------------------------------------------ time helpers: everything is a function of t */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, at: number, d: number) => clamp01((t - at) / d);
const out3 = (x: number) => 1 - Math.pow(1 - x, 3);
const inOut3 = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outBack = (x: number, s = 1.6) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: number[], b: number[], k: number) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)] as [number, number, number];
const hexMix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(lerp(v, y[i], clamp01(k))).toString(16).padStart(2, "0")).join("");
};
const glow = (hex: string, k: number) => LinearRgba.from(Srgba.hex(hex)).mul(k);
const life = (t: number, at: number, hold: number, fade = 0.2) => Math.min(ramp(t, at, fade), 1 - ramp(t, at + hold, fade));

/** Word times from the transcript: `w("hook", "$390")` is when "$390" is spoken in beat "hook". */
type Word = { w: string; start: number; end: number };
const BEATS: Record<string, { start: number; end: number; words: Word[] }> = Object.fromEntries(TIMINGS.beats.map((b: any) => [b.id, b]));
const w = (beat: string, word: string, n = 1) => {
  const ws = BEATS[beat].words.filter((x) => x.w === word || x.w.replace(/[.,…]$/, "") === word);
  return (ws[n - 1] ?? ws[0]).start;
};
const B = (beat: string) => BEATS[beat].start;

/* ------------------------------------------------------------------ the set, built once */
const PHONE = manifold.roundedBox(1.0, 2.06, 0.11, 0.12);
const PLINTH_TOP = 0.32;
const COIN_R = 0.17, COIN_T = 0.055;
const COST_N = 61; // $610 of $1,000, 1 coin = $10 (SOURCES: 1,000 × 60.7% → about $610, our calc.)
const SVC_COST = 24; // $24 of $100 of services (76.2% services gross margin → $76 left)

/** Where coin i stands on the counter next to the phone (10 stacks of 10, two rows). */
const coinHome = (i: number): [number, number, number] => {
  const s = Math.floor(i / 10), l = i % 10;
  return [1.62 + (s % 5) * 0.42, COIN_T / 2 + l * COIN_T, 0.15 + Math.floor(s / 5) * 0.44];
};
/** Where cost coin i lands in the tray. */
const TRAY_X = -3.6;
const coinTray = (i: number): [number, number, number] => {
  const s = Math.floor(i / 10), l = i % 10;
  return [TRAY_X - 0.95 + (s % 4) * 0.62, 0.16 + COIN_T / 2 + l * COIN_T, 0.0 + Math.floor(s / 4) * 0.56];
};

/* ------------------------------------------------------------------ camera: one shot list, eased travel, never standing still */
type Shot = { t: number; pos: [number, number, number]; look: [number, number, number]; fov: number };
// Framed with a fit (subject box → a rect of the stage band, clear of the figure slots on the left); see README.md
const HERO: Shot = { t: 0, pos: [14.5, 6.94, 29.97], look: [0.35, -1.11, 0.97], fov: 30 };
const SHOTS: Shot[] = [
  HERO,
  { t: B("follow") - 0.35, pos: [3.95, 18.68, 26.63], look: [-0.47, -1.21, 1.55], fov: 34 },
  { t: B("turn") - 0.3, pos: [23.09, 34.42, 41.9], look: [10.37, -2.64, 2.76], fov: 32 },
  { t: B("share") - 0.3, pos: [8.07, 6.2, 39.81], look: [17.99, -1.03, 0.0], fov: 30 },
  { t: B("profit") - 0.3, pos: [18.66, 5.38, 49.57], look: [29.11, -1.69, 0.39], fov: 34 },
  { t: B("point") - 0.3, pos: [12.06, 5.51, 29.81], look: [-0.76, -1.19, 1.01], fov: 33 },
];
// frame 0 = the last frame: the hero shot pulled back a quarter, which the crane-in leaves and the loop tail returns to
const OPEN: Shot = { t: 0, pos: [HERO.look[0] + (HERO.pos[0] - HERO.look[0]) * 1.25, HERO.look[1] + (HERO.pos[1] - HERO.look[1]) * 1.25, HERO.look[2] + (HERO.pos[2] - HERO.look[2]) * 1.25], look: HERO.look, fov: HERO.fov };
SHOTS.push({ ...OPEN, t: DUR - 1.15 });
function cameraAt(t: number) {
  let k = 0;
  for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].t) k = i;
  const prev = SHOTS[Math.max(0, k - 1)], cur = SHOTS[k];
  const e = k === 0 ? 1 : inOut3(ramp(t, cur.t, 1.0));
  let pos = lerp3(prev.pos, cur.pos, e), look = lerp3(prev.look, cur.look, e), fov = lerp(prev.fov, cur.fov, e);
  // the hook opens with a crane-in from a wider, higher place
  const c = inOut3(ramp(t, 0.05, 1.6));
  if (t < 1.7) { pos = lerp3(OPEN.pos, pos, c); look = lerp3(OPEN.look, look, c); }
  // the camera never stops: a slow orbit about what it looks at (none on the last frames, so the loop meets frame 0)
  const still = 1 - ramp(t, DUR - 1.15, 1.0);
  const a = (Math.sin(t * 0.42) * 0.07 + Math.sin(t * 0.17 + 1) * 0.04) * still * (t < 1.7 ? c : 1);
  const dx = pos[0] - look[0], dz = pos[2] - look[2];
  pos = [look[0] + dx * Math.cos(a) - dz * Math.sin(a), pos[1] + Math.sin(t * 0.3) * 0.08 * still, look[2] + dx * Math.sin(a) + dz * Math.cos(a)];
  return { pos, look, fov };
}

/* ------------------------------------------------------------------ the 3D pieces */
function Hero({ t }: { t: number }) {
  const sway = Math.sin(t * 0.6) * 0.12;
  const bob = Math.sin(t * 1.4) * 0.03;
  // the screen comes on with the hook; on "Now" its apps flare (the money after the sale), on "storefront" it becomes the shop window
  const screenOn = ramp(t, 0.2, 0.5);
  const flare = Math.max(life(t, w("turn", "Now"), 1.0, 0.15), life(t, w("point", "storefront"), 1.6, 0.1));
  const apps = ["#C8F53C", "#FFB648", "#FF6B5E", "#7FD6FF", "#B78CFF", "#F3F6EE"];
  return (
    <>
      <Mesh3d name="plinth" transform={Transform.fromXyz(0, PLINTH_TOP / 2, 0)}>
        <Cylinder radius={1.25} half_height={PLINTH_TOP / 2} />
        <StandardMaterial base_color={P.surface} perceptual_roughness={0.42} metallic={0.15} />
      </Mesh3d>
      <Mesh3d name="plinth-ring" transform={Transform.fromXyz(0, PLINTH_TOP + 0.005, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}>
        <Torus major_radius={1.2} minor_radius={0.025} />
        <StandardMaterial base_color={P.lime} emissive={glow(P.lime, 2.2 + 3 * flare)} />
      </Mesh3d>
      <Entity transform={Transform.fromXyz(0, PLINTH_TOP + 1.08 + bob, 0).withRotation(Quat.fromEuler("XYZ", -0.06, -0.38 + sway, 0))}>
        <Mesh3d name="phone" shape={PHONE}>
          <StandardMaterial base_color="#2E3236" perceptual_roughness={0.24} metallic={0.92} clearcoat={0.6} />
        </Mesh3d>
        {/* the screen: black glass, and the app grid lit on it (4 x 6), generic colour tiles, no logo */}
        <Mesh3d name="screen" transform={Transform.fromXyz(0, 0, 0.056)}>
          <Cuboid half_size={[0.45, 0.97, 0.004]} />
          <StandardMaterial base_color="#060A08" perceptual_roughness={0.06} emissive={glow("#123A2A", 0.25 + 0.4 * screenOn)} />
        </Mesh3d>
        {Array.from({ length: 24 }, (_, i) => {
          const cx = (i % 4) - 1.5, cy = Math.floor(i / 4) - 2.2;
          const on = ramp(t, 0.25 + i * 0.03, 0.2);
          const k = (0.9 + 1.6 * flare) * on;
          const c = apps[(i * 7) % apps.length];
          return (
            <Mesh3d key={i} name={`app-${i}`} transform={Transform.fromXyz(cx * 0.2, 0.1 - cy * 0.24, 0.064 + 0.03 * flare)}>
              <Cuboid half_size={[0.075, 0.075, 0.006]} />
              <StandardMaterial base_color={c} perceptual_roughness={0.3} emissive={glow(c, k)} />
            </Mesh3d>
          );
        })}
      </Entity>
    </>
  );
}

/** 100 coins: drop in on "$1,000", the 39 kept glow on "$390", the 61 cost coins fly to the tray on "$610". */
function Coins({ t }: { t: number }) {
  const gone = ramp(t, B("turn") + 0.2, 0.6); // they leave while the camera is away, so frame 0 (no coins) can loop
  const back = ramp(t, w("hook", "$1,000"), 0.01);
  if (gone >= 1 || back <= 0) return null;
  const keepGlow = Math.max(life(t, w("hook", "$390"), 2.0), life(t, w("left", "$390"), 3.0));
  return (
    <>
      {Array.from({ length: 100 }, (_, i) => {
        const s = Math.floor(i / 10), l = i % 10;
        const at = w("hook", "$1,000") + s * 0.07 + l * 0.022;
        const d = ramp(t, at, 0.32);
        if (d <= 0) return null;
        const home = coinHome(i);
        let p: [number, number, number] = [home[0], home[1] + (1 - out3(d)) * 2.6, home[2]];
        const cost = i < COST_N;
        let color = P.gold, em = 0;
        if (cost) {
          const fly = ramp(t, w("cost", "$610") + i * 0.028, 0.55);
          if (fly > 0) {
            const to = coinTray(i), e = inOut3(fly);
            p = lerp3(home, to, e);
            p[1] += Math.sin(Math.PI * e) * 2.6; // over the phone's top
            p[2] += Math.sin(Math.PI * e) * 0.9; // and in front of it
          }
          color = hexMix(P.gold, P.red, Math.max(life(t, w("hook", "$390"), 2.0) * 0.7, ramp(t, w("cost", "$610") + i * 0.028, 0.4)));
        } else {
          em = keepGlow;
          p[1] += keepGlow * 0.12 * (0.6 + 0.4 * Math.sin(t * 7 + s));
        }
        p[1] -= gone * 1.2;
        const flying = cost && ramp(t, w("cost", "$610") + i * 0.028, 0.55) > 0 && ramp(t, w("cost", "$610") + i * 0.028, 0.55) < 1;
        return (
          <Mesh3d key={i} name={`coin-${i}`} allowOverlap={flying || gone > 0} transform={Transform.fromXyz(p[0], p[1], p[2]).withRotation(Quat.fromEuler("XYZ", 0, i * 0.7, 0)).withScale([1 - gone, 1, 1 - gone])}>
            <Cylinder radius={COIN_R} half_height={COIN_T / 2 - 0.004} />
            <StandardMaterial base_color={color} perceptual_roughness={0.26} metallic={1} emissive={glow(P.amber, 0.9 * em)} />
          </Mesh3d>
        );
      })}
    </>
  );
}

function Tray({ t }: { t: number }) {
  const up = out3(ramp(t, B("follow") - 0.2, 0.6)) * (1 - ramp(t, B("turn") + 0.2, 0.6));
  if (up <= 0) return null;
  return (
    <Mesh3d name="tray" transform={Transform.fromXyz(TRAY_X, 0.08 * up, 0.28).withScale([1, up, 1])}>
      <Cuboid half_size={[1.35, 0.08, 0.72]} />
      <StandardMaterial base_color="#3B1714" perceptual_roughness={0.55} emissive={glow(P.red, 0.25)} />
    </Mesh3d>
  );
}

/** "Apple doesn't say how much is the iPhone alone": a question mark over the phone. */
function Unknown({ t }: { t: number }) {
  const o = life(t, w("left", "doesn't"), 2.2, 0.25);
  if (o <= 0) return null;
  return (
    <Mesh3d name="unknown" transform={Transform.fromXyz(0.05, PLINTH_TOP + 2.55 + 0.25 * (1 - out3(o)), 0.1).withRotation(Quat.fromEuler("XYZ", 0, -0.3 + Math.sin(t * 2) * 0.15, 0)).withScale([o, o, o])}>
      <Text3D size={0.75} depth={0.12}>?</Text3D>
      <StandardMaterial base_color={P.ink} emissive={glow(P.ink, 1.4)} />
    </Mesh3d>
  );
}

/** $100 of services: 100 tiles rise on "Now"; 24 sink on "Of" (cost); 76 rise and light on "$76". */
const SHOP_X = 10;
function Shop({ t }: { t: number }) {
  const rise = B("turn") + 0.1;
  const costAt = w("svc", "Of"), keepAt = w("svc", "$76");
  const sweeps = ["Apps", "iCloud", "ads", "AppleCare"].map((x) => w("turn", x));
  return (
    <>
      <Mesh3d name="shop-base" transform={Transform.fromXyz(SHOP_X, 0.03, 0)}>
        <Cuboid half_size={[3.0, 0.03, 3.0]} />
        <StandardMaterial base_color="#0B241A" perceptual_roughness={0.5} />
      </Mesh3d>
      {Array.from({ length: 100 }, (_, i) => {
        const cx = (i % 10) - 4.5, cz = Math.floor(i / 10) - 4.5;
        const up = outBack(ramp(t, rise + (cx + cz + 9) * 0.05, 0.35));
        const cost = i % 10 >= 7 && Math.floor(i / 10) < 8; // 3 columns x 8 rows = 24 tiles
        let h = 0.12 + 0.25 * up, y = 0, color = P.surface, em = 0;
        // each service word sends a light wave across the tiles (no shares implied: Apple doesn't split them)
        const wave = Math.max(...sweeps.map((s) => life(t, s + (cx + 4.5) * 0.035, 0.18, 0.12)));
        em = 0.8 * wave * (1 - ramp(t, costAt, 0.2));
        if (cost) {
          const c = ramp(t, costAt + (i % 10 - 7) * 0.15 + Math.floor(i / 10) * 0.1, 0.4);
          color = hexMix(P.surface, P.red, c);
          h *= 1 - 0.85 * out3(ramp(t, costAt + 1.6, 0.6));
          em += 0.5 * c;
        } else {
          const k = ramp(t, keepAt + (cx + cz + 9) * 0.02, 0.3);
          color = hexMix(P.surface, P.lime, k);
          h += 0.35 * outBack(k);
          em += 1.6 * k;
        }
        return (
          <Mesh3d key={i} name={`tile-${i}`} transform={Transform.fromXyz(SHOP_X + cx * 0.58, 0.06 + y + (h * Math.max(up, 0.01)) / 2, cz * 0.58).withScale([1, Math.max(h * up, 0.01), 1])}>
            <Cuboid half_size={[0.24, 0.5, 0.24]} />
            <StandardMaterial base_color={color} perceptual_roughness={0.35} emissive={glow(cost ? P.red : P.lime, em)} />
          </Mesh3d>
        );
      })}
    </>
  );
}

/** Two glass columns: services = 26% of sales (our calc.), 40% of what's left after costs (our calc.). */
const SHARE_X = 20, COL_H = 3.4;
function Column({ t, x, at, lime, share, label }: { t: number; x: number; at: number; lime: number; share: number; label: string }) {
  const shell = out3(ramp(t, at - 0.4, 0.5));
  const devH = COL_H * (1 - share) * out3(ramp(t, at, 0.6));
  const svcH = COL_H * share * outBack(ramp(t, lime, 0.6), 1.2);
  return (
    <>
      <Mesh3d name={`glass-${label}`} transform={Transform.fromXyz(x, (COL_H * shell) / 2 + 0.06, 0).withScale([1, Math.max(shell, 0.01), 1])}>
        <Cuboid half_size={[0.62, COL_H / 2 + 0.03, 0.62]} />
        <StandardMaterial base_color={Srgba.hex("#CFF7DE").with_alpha(0.16)} alpha_mode="Blend" perceptual_roughness={0.05} />
      </Mesh3d>
      {svcH > 0.01 && (
        <Mesh3d name={`svc-${label}`} transform={Transform.fromXyz(x, 0.06 + svcH / 2, 0).withScale([1, svcH, 1])}>
          <Cuboid half_size={[0.55, 0.5, 0.55]} />
          <StandardMaterial base_color={P.lime} perceptual_roughness={0.4} emissive={glow(P.lime, 1.2)} />
        </Mesh3d>
      )}
      {devH > 0.01 && (
        <Mesh3d name={`dev-${label}`} transform={Transform.fromXyz(x, 0.06 + COL_H * share + devH / 2, 0).withScale([1, devH, 1])}>
          <Cuboid half_size={[0.55, 0.5, 0.55]} />
          <StandardMaterial base_color={P.amber} perceptual_roughness={0.45} metallic={0.2} />
        </Mesh3d>
      )}
    </>
  );
}

/** $140B devices vs $94B services gross profit, FY2026 (139,659 / 93,943, SOURCES). 2/3 line on "Two". */
const PROFIT_X = 30, TOWER_MAX = 5.0;
function Towers({ t }: { t: number }) {
  const towers = [
    { x: PROFIT_X - 1.2, v: 139.7, at: w("profit", "That's"), color: P.amber, name: "devices" },
    { x: PROFIT_X + 1.2, v: 93.9, at: w("profit", "$94B"), color: P.lime, name: "services" },
  ];
  const line = ramp(t, w("profit", "Two"), 0.5);
  return (
    <>
      {towers.map((tw) => {
        const g = out3(ramp(t, tw.at, 0.75));
        const h = Math.max(0.02, (tw.v / 150) * TOWER_MAX * g);
        // stacked bars: one slab per $10B, so the height reads as a count of money
        const slabs = Math.ceil((tw.v / 10) * g);
        return Array.from({ length: Math.max(1, slabs) }, (_, k) => {
          const SL = (10 / 150) * TOWER_MAX, bot = k * SL, top = Math.min(h, (k + 1) * SL);
          if (top - bot < 0.03) return null;
          return (
            <Mesh3d key={`${tw.name}-${k}`} name={`${tw.name}-${k}`} transform={Transform.fromXyz(tw.x, 0.06 + (bot + top) / 2, 0).withScale([1, (top - bot - 0.024) / (SL - 0.024), 1])} allowOverlap>
              <Cuboid half_size={[0.78, (SL - 0.024) / 2, 0.78]} />
              <StandardMaterial base_color={tw.color} perceptual_roughness={0.3} metallic={0.55} emissive={glow(tw.color, tw.name === "services" ? 0.5 : 0.12)} />
            </Mesh3d>
          );
        });
      })}
      {line > 0 && (
        <Mesh3d name="two-thirds" transform={Transform.fromXyz(PROFIT_X - 1.2 + 1.2 * out3(line) - 1.2 * (1 - out3(line)) * 0, 0.06 + (93.9 / 150) * TOWER_MAX, 0.82).withScale([Math.max(0.01, out3(line)), 1, 1])}>
          <Cuboid half_size={[2.1, 0.03, 0.03]} />
          <StandardMaterial base_color={P.ink} emissive={glow(P.ink, 3)} />
        </Mesh3d>
      )}
    </>
  );
}

/** The point: an awning drops over the phone and an OPEN sign lights. Both fold away on the loop line. */
function Storefront({ t }: { t: number }) {
  const at = w("point", "storefront");
  const down = outBack(ramp(t, at - 0.15, 0.45), 1.3) * (1 - inOut3(ramp(t, B("loop") + 0.35, 0.8)));
  if (down <= 0.001) return null;
  const sign = ramp(t, at + 0.2, 0.15) * (Math.sin(t * 40) > -0.6 || t > at + 0.6 ? 1 : 0.4);
  return (
    <>
      {Array.from({ length: 6 }, (_, k) => (
        <Mesh3d key={k} name={`awning-${k}`} transform={Transform.fromXyz(-0.95 + k * 0.38, PLINTH_TOP + 2.35 + (1 - down) * 2.5, 0.42).withRotation(Quat.fromEuler("XYZ", 0.55, 0, 0)).withScale([1, 1, Math.max(0.01, down)])}>
          <Cuboid half_size={[0.19, 0.025, 0.55]} />
          <StandardMaterial base_color={k % 2 ? P.ink : P.lime} perceptual_roughness={0.6} />
        </Mesh3d>
      ))}
      <Mesh3d name="open-sign" transform={Transform.fromXyz(0, PLINTH_TOP + 2.95 + (1 - down) * 2.5, 0.1).withScale([down, down, down])}>
        <Text3D size={0.42} depth={0.06}>OPEN</Text3D>
        <StandardMaterial base_color={P.lime} emissive={glow(P.lime, 5 * sign)} />
      </Mesh3d>
    </>
  );
}

/* ------------------------------------------------------------------ type: three voices from one left margin */
const FONTS = `
@font-face { font-family: "Bricolage"; src: url("${staticFile("fonts/BricolageGrotesque-latin.ttf")}"); font-weight: 200 800; }
@font-face { font-family: "Instrument"; src: url("${staticFile("fonts/InstrumentSerif-Italic-latin.ttf")}"); font-style: italic; }
@font-face { font-family: "JBMono"; src: url("${staticFile("fonts/JetBrainsMono-latin.ttf")}"); }`;
const display = (size: number, color = P.ink): React.CSSProperties => ({ fontFamily: "Bricolage", fontWeight: 800, fontSize: size, lineHeight: 0.94, letterSpacing: "-0.01em", textTransform: "uppercase", color, textShadow: "0 4px 0 rgba(0,0,0,0.45)" });
const mono = (size: number, color = P.ink): React.CSSProperties => ({ fontFamily: "JBMono", fontWeight: 700, fontSize: size, letterSpacing: "0.12em", textTransform: "uppercase", color });
const abs = (left: number, top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left, top, ...extra });

/** Chapter lines (one per beat, under the series bar). */
const KICKERS: [string, string][] = [
  ["notbest", "Big margin. Not the best one."],
  ["follow", "$1,000 of devices · our calc."],
  ["turn", "$100 of services · our calc."],
  ["share", "Small slice. Big share."],
  ["profit", "Left after costs · fiscal 2026"],
  ["point", "So what are you buying?"],
];

/** A figure in the stage band: Display number, Mono label. Left margin, above the captions, left of the rail. */
type Fig = { at: number; hold: number; value: string; label: string; sub?: string; color: string; top?: number; size?: number; left?: number };
const FIGS = (): Fig[] => [
  { at: w("hook", "$1,000"), hold: w("follow", "Follow") - w("hook", "$1,000") - 0.3, value: "$1,000", label: "of Apple devices · FY2026", color: P.lime, size: 170 },
  { at: w("cost", "$610"), hold: B("turn") - w("cost", "$610") - 0.4, value: "$610", label: "cost of making them", color: P.red, size: 130, top: 905 },
  { at: w("left", "$390"), hold: B("turn") - w("left", "$390") - 0.4, value: "$390", label: "left · all devices", color: P.amber, size: 130, top: 905, left: 560 },
  { at: w("svc", "$100"), hold: B("share") - w("svc", "$100") - 0.4, value: "$100", label: "of services", color: P.ink, size: 110, top: 905 },
  { at: w("svc", "$76"), hold: B("share") - w("svc", "$76") - 0.4, value: "$76", label: "left after costs", color: P.lime, size: 110, top: 905, left: 560 },
];

function Overlay({ t }: { t: number }) {
  const hookEnd = BEATS.hook.end;
  const titleO = Math.max(1 - ramp(t, hookEnd - 0.25, 0.25), ramp(t, DUR - 0.5, 0.35));
  const svcX = SAFE.left, colTop = 905;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <style>{FONTS}</style>
      {/* soft scrims behind the title band and the caption band, so type reads over any part of the set */}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 720, backgroundImage: "linear-gradient(180deg, rgba(3,16,11,0.86) 0%, rgba(3,16,11,0.6) 45%, rgba(3,16,11,0) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 1110, width: W, height: 810, backgroundImage: "linear-gradient(180deg, rgba(3,16,11,0) 0%, rgba(3,16,11,0.72) 22%, rgba(3,16,11,0.8) 100%)" }} />

      {/* series bar */}
      <div style={abs(SAFE.left, SAFE.top, { display: "flex", alignItems: "center", gap: 16 })}>
        <div style={{ ...mono(26, P.bg), background: P.lime, padding: "9px 14px 8px 17px", borderRadius: 4, letterSpacing: "0.22em" }}>RECEIPTS</div>
        <div style={mono(26, P.lime)}>#004</div>
      </div>

      {/* title block on the hook and the loop tail; the whisper is there from frame 0 (cover and loop seam) */}
      {titleO > 0.01 && (
        <div style={abs(SAFE.left, 324, { width: SAFE.right - SAFE.left, opacity: titleO })}>
          <div style={display(112)}>The iPhone is<br />a storefront</div>
          <div style={{ fontFamily: "Instrument", fontStyle: "italic", fontSize: 54, color: P.lime, marginTop: 14 }}>Services keep $76 of every $100.</div>
        </div>
      )}
      {KICKERS.map(([beat, text], i) => {
        const from = B(beat), to = i + 1 < KICKERS.length ? B(KICKERS[i + 1][0]) : BEATS.loop.start;
        const o = Math.min(ramp(t, from - 0.1, 0.25), 1 - ramp(t, to - 0.2, 0.2), 1 - titleO);
        if (o <= 0) return null;
        return <div key={beat} style={abs(SAFE.left, 330, { width: SAFE.right - SAFE.left, opacity: o, transform: `translateY(${(1 - out3(ramp(t, from - 0.1, 0.3))) * 18}px)`, ...display(80) })}>{text}</div>;
      })}

      {/* figures */}
      {FIGS().map((f, i) => {
        const o = life(t, f.at, f.hold, 0.18);
        if (o <= 0) return null;
        const s = Math.min(1.06, outBack(ramp(t, f.at, 0.3), 2));
        return (
          <div key={i} style={abs(f.left ?? SAFE.left, f.top ?? 880, { opacity: o, transform: `scale(${s})`, transformOrigin: "left center" })}>
            <div style={display(f.size ?? 130, f.color)}>{f.value}</div>
            <div style={{ ...mono(32), marginTop: 8 }}>{f.label}</div>
          </div>
        );
      })}

      {/* the hook stamp: what's left, an average of all devices (not a per-iPhone figure) */}
      {(() => {
        const o = life(t, w("hook", "$390"), 2.2, 0.15);
        if (o <= 0) return null;
        return (
          <div style={abs(600, 880, { width: SAFE.railX - 12 - 600, opacity: o, transform: `rotate(4deg) scale(${Math.min(1.08, outBack(ramp(t, w("hook", "$390"), 0.25), 2.4))})`, background: "#B8302A", padding: "14px 20px 12px", boxShadow: "8px 8px 0 rgba(0,0,0,0.5)", textAlign: "center", boxSizing: "border-box" })}>
            <div style={{ ...display(118, "#fff"), textShadow: "none" }}>$390</div>
            <div style={{ ...mono(32, "#fff"), marginTop: 6, letterSpacing: "0.06em" }}>left · all devices avg</div>
          </div>
        );
      })()}

      {/* chips on the beats the voice names something that isn't a number */}
      {[
        { at: w("left", "doesn't"), hold: 2.0, text: "iPhone alone: not disclosed", top: 1100 },
        { at: w("turn", "Now"), hold: 1.4, text: "After the sale", top: 905 },
        { at: w("turn", "Apps"), hold: 2.6, text: "Apps · iCloud · ads · AppleCare", top: 905 },
      ].map((c, i) => {
        const o = life(t, c.at, c.hold, 0.15);
        if (o <= 0) return null;
        return <div key={i} style={abs(SAFE.left, c.top, { opacity: o, background: P.lime, padding: "12px 20px 8px", boxShadow: "8px 8px 0 rgba(0,0,0,0.5)", ...display(50, P.bg), textShadow: "none", maxWidth: SAFE.railX - SAFE.left - 20 })}>{c.text}</div>;
      })}

      {/* share: two figures under their columns */}
      {[
        { at: w("share", "quarter"), value: "26%", label: "of sales", sub: "our calculation", left: svcX },
        { at: w("share", "40%"), value: "40%", label: "of what's left", sub: "after costs · our calc.", left: svcX + 440 },
      ].map((s, i) => {
        const o = Math.min(ramp(t, s.at, 0.18), 1 - ramp(t, B("profit") - 0.35, 0.2));
        if (o <= 0) return null;
        return (
          <div key={i} style={abs(s.left, colTop, { opacity: o, transform: `scale(${Math.min(1.08, outBack(ramp(t, s.at, 0.3), 2))})`, transformOrigin: "left center" })}>
            <div style={display(150, P.lime)}>{s.value}</div>
            <div style={{ ...mono(32), marginTop: 6 }}>{s.label}</div>
            <div style={{ ...mono(32, P.muted), marginTop: 4, letterSpacing: "0.04em" }}>{s.sub}</div>
          </div>
        );
      })}

      {/* profit: tower values ride the tops of the towers in the stage band (fixed slots, the camera holds still enough) */}
      {[
        { at: w("profit", "That's"), value: "$140B", label: "devices", color: P.amber, left: SAFE.left },
        { at: w("profit", "$94B"), value: "$94B", label: "services", color: P.lime, left: SAFE.left + 420 },
      ].map((s, i) => {
        const o = Math.min(ramp(t, s.at, 0.18), 1 - ramp(t, B("point") - 0.35, 0.2));
        if (o <= 0) return null;
        return (
          <div key={i} style={abs(s.left, 880, { opacity: o })}>
            <div style={display(120, s.color)}>{s.value}</div>
            <div style={{ ...mono(32), marginTop: 6 }}>{s.label}</div>
          </div>
        );
      })}
      {(() => {
        const o = Math.min(ramp(t, w("profit", "Two"), 0.18), 1 - ramp(t, B("point") - 0.35, 0.2));
        if (o <= 0) return null;
        return <div style={abs(SAFE.left, 1095, { opacity: o, background: P.lime, padding: "10px 18px 6px", ...display(46, P.bg), textShadow: "none" })}>≈ 2/3 of what devices made</div>;
      })()}

      {/* the point: the iPhone = the product (struck) → the storefront */}
      {(() => {
        const a1 = w("point", "iPhone"), a2 = w("point", "storefront");
        const o = Math.min(ramp(t, a1, 0.15), 1 - ramp(t, BEATS.loop.start + 0.2, 0.3));
        if (o <= 0) return null;
        const struck = out3(ramp(t, a1 + 0.5, 0.25));
        const o2 = ramp(t, a2, 0.12);
        return (
          <div style={abs(SAFE.left, 880, { opacity: o })}>
            <div style={mono(32, P.muted)}>The iPhone =</div>
            <div style={{ position: "relative", display: "inline-block", marginTop: 6 }}>
              <div style={{ ...display(104), opacity: 1 - struck * 0.5 }}>The product</div>
              <div style={{ position: "absolute", left: -8, top: "44%", height: 12, width: `${struck * 104}%`, background: P.red }} />
            </div>
            <div style={{ ...display(112, P.lime), opacity: o2, transform: `scale(${Math.min(1.06, outBack(ramp(t, a2, 0.3), 2))})`, transformOrigin: "left center", marginTop: 6 }}>The storefront</div>
          </div>
        );
      })()}

      <Captions t={t} />
      <div style={abs(SAFE.left, 1412, { ...mono(24, P.muted), letterSpacing: "0.05em", width: SAFE.railX - SAFE.left })}>Source: Apple 10-K (SEC filing), fiscal 2026</div>
    </AbsoluteFill>
  );
}

/** Captions from the transcript: the current phrase, words appearing as they're spoken, figures in the accent. */
const PHRASES: Word[][] = (() => {
  const out: Word[][] = [];
  for (const b of TIMINGS.beats as any[]) {
    let cur: Word[] = [], len = 0;
    for (const x of b.words as Word[]) {
      if (cur.length && len + x.w.length > 20) { out.push(cur); cur = []; len = 0; }
      cur.push(x); len += x.w.length + 1;
      if (/[.,…]$/.test(x.w) && len > 9) { out.push(cur); cur = []; len = 0; }
    }
    if (cur.length) out.push(cur);
  }
  return out;
})();
const KEYWORDS = ["services", "quarter", "storefront", "built"];
function Captions({ t }: { t: number }) {
  const i = PHRASES.findIndex((p, k) => t >= p[0].start - 0.05 && t < (PHRASES[k + 1]?.[0].start ?? 1e9) - 0.05 && t < p[p.length - 1].end + 0.6);
  if (i < 0) return null;
  const p = PHRASES[i];
  return (
    <div style={abs(SAFE.left, 1185, { width: SAFE.railX - SAFE.left, display: "flex", flexWrap: "wrap", columnGap: 22, rowGap: 4 })}>
      {p.map((x, k) => {
        const on = t >= x.start - 0.04;
        const hot = /\d/.test(x.w) || KEYWORDS.includes(x.w.replace(/[.,…]$/, "").toLowerCase());
        // the whole phrase is readable from its first word (raea floor: 0.3 s a word, 1 s a line); spoken words turn white
        return <span key={k} style={{ ...display(84, on ? (hot ? P.lime : P.ink) : P.muted) }}>{x.w}</span>;
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ the frame */
function Storefront004() {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = cameraAt(t);
  const focus = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
  // sound: a boom on frame 0, a whoosh on each move, a stamp on each figure
  const sfx: [number, string, number][] = [[0, "boom", 0.35], ...SHOTS.slice(1, -1).map((s) => [s.t + 0.1, "whoosh", 0.32] as [number, string, number]),
    [w("hook", "$390"), "stamp", 0.6], [w("cost", "$610"), "pop", 0.45], [w("left", "$390"), "stamp", 0.5], [w("svc", "$76"), "stamp", 0.5],
    [w("share", "quarter"), "pop", 0.45], [w("share", "40%"), "pop", 0.5], [w("profit", "$94B"), "pop", 0.5], [w("point", "storefront"), "stamp", 0.5]];
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: (cam.fov * Math.PI) / 180 } }}>
        <DepthOfField focal_distance={focus} aperture_f_stops={2.4} />
      </Camera3d>
      <ToneMapping mode="tony" exposure={0.2} />
      <Bloom intensity={0.35} threshold={0.9} />
      <Shadows distance={90} firstCascade={36} mapSize={2048} />
      <AmbientLight brightness={140} color="#9FE0C0" />
      <DirectionalLight transform={Transform.fromXyz(cam.look[0] - 4, 9, 6).lookingAt([cam.look[0], 0, 0])} illuminance={5200} color="#FFF1D8" shadow_maps_enabled soft_shadow_size={2} />
      <SpotLight transform={Transform.fromXyz(1.5, 7, 3.5).lookingAt([0.6, 0.6, 0])} intensity={4200000} outer_angle={0.42} inner_angle={0.2} color="#FFF4E0" shadow_maps_enabled />
      <PointLight transform={Transform.fromXyz(SHOP_X - 2, 7, 5)} intensity={1400000} color="#E4FFB0" range={16} />
      <PointLight transform={Transform.fromXyz(PROFIT_X - 3, 8, 6)} intensity={1800000} color="#FFE2BC" range={18} />
      {/* the counter: one dark-green floor under the whole set, tiled by thin seams so camera moves read */}
      <Fog color={P.bg} near={focus * 1.15} far={focus * 2.6} />
      <Mesh3d name="floor" transform={Transform.fromXyz(14, -0.05, 0)}>
        <Cuboid half_size={[200, 0.05, 200]} />
        <StandardMaterial base_color={P.glow} perceptual_roughness={0.38} />
      </Mesh3d>
      {Array.from({ length: 24 }, (_, k) => (
        <Mesh3d key={`sx-${k}`} name={`seam-x-${k}`} transform={Transform.fromXyz(-12 + k * 2.5, 0.002, 0)}>
          <Cuboid half_size={[0.012, 0.002, 30]} />
          <StandardMaterial base_color="#1D5740" perceptual_roughness={0.6} />
        </Mesh3d>
      ))}
      {Array.from({ length: 12 }, (_, k) => (
        <Mesh3d key={`sz-${k}`} name={`seam-z-${k}`} transform={Transform.fromXyz(14, 0.002, -15 + k * 2.5)}>
          <Cuboid half_size={[60, 0.002, 0.012]} />
          <StandardMaterial base_color="#1D5740" perceptual_roughness={0.6} />
        </Mesh3d>
      ))}
      <Hero t={t} />
      <Coins t={t} />
      <Tray t={t} />
      <Unknown t={t} />
      <Shop t={t} />
      <Column t={t} x={SHARE_X - 1.1} at={B("share") + 0.25} lime={w("share", "quarter")} share={0.2575} label="sales" />
      <Column t={t} x={SHARE_X + 1.1} at={w("share", "But")} lime={w("share", "40%")} share={0.402} label="left" />
      <Towers t={t} />
      <Storefront t={t} />

      <Overlay t={t} />

      {sfx.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(at * FPS))} durationInFrames={FPS * 3} layout="none" name={`sfx-${name}-${i}`}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} />
        </Sequence>
      ))}
      <Audio src={staticFile("voice.wav")} volume={0.62} />
      <Audio src={staticFile("music.wav")} volume={(fr: number) => interpolate(fr / FPS, [0, 0.5, DUR - 3, DUR], [0, 0.13, 0.13, 0.18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
}

registerRoot(() => <Composition id="storefront" component={Storefront004} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(DUR * FPS)} />);
