/**
 * SillageReel: one generic reel driven by an episode's reel.json + timings.json. An episode's composition is ~10 lines
 * (see raea/sillage-003-rose-v2/compositions/sillage.tsx). Everything is data: shots (flacon with a camera preset, or a
 * full-frame plate), the title stack, the flacon as dataviz (level keyframes, petals, drop, light sweeps), sounds.
 * The loop: the last shot's camera returns to the first frame's pose, petals lift away, the level returns, the hook
 * text is back on the last frame.
 */
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "raea";
import { Bloom, DepthOfField, Environment, ToneMapping } from "raea/3d";
import { AmbientLight } from "raea/light";
import { Transform } from "raea/transform";
import { Camera3d } from "raea/camera";
import TOK from "../tokens.json";
import { Captions, makePages } from "./captions";
import { CAMERAS, Cam, FlaconSet, orbit, PetalTimes, returnTo } from "./flacon";
import { FloatingPetals, Grain, SafeZones, Vignette } from "./finish";
import { FullPlate, PlateSpec, Scrims } from "./plate";
import { clamp01, inOut3, lerp, makeAnchors, ramp, Timings } from "./time";
import { FONTS, Logotype, TextEl, TextStack } from "./type";

type A = string | number;
export type ShotData = {
  id: string; at?: A; kind: "flacon" | "plate"; camera?: string; returnFrom?: string;
  img?: string; fg?: string; video?: string; kb?: PlateSpec["kb"]; focus?: [number, number];
  textFrom?: A; text?: { t: TextEl["t"]; v: string; at?: A; gold?: string; size?: number }[];
  petals?: boolean; captions?: boolean;
};
export type ReelData = {
  id: string; number: number | string; juice: string; petal?: string; keywords?: string[];
  shots: ShotData[];
  flacon: { level: [A, number, number?][]; petals?: [A, number][]; drop?: A; sweeps?: A[] };
  sfx?: [A, string, number][];
};

export function SillageReel({ data, timings, flags = {} }: { data: ReelData; timings: Timings; flags?: { safeZones?: boolean } }) {
  const frame = useCurrentFrame();
  const FPS = TOK.canvas.fps, t = frame / FPS, DUR = timings.duration + 0.5;
  const { at } = makeAnchors(timings);
  const shots = data.shots.map((s, i) => ({ ...s, from: i === 0 ? 0 : at(s.at ?? s.id) }));
  const idx = shots.reduce((k, s, i) => (t >= s.from ? i : k), 0);
  const s = shots[idx], end = shots[idx + 1]?.from ?? DUR;
  const k = clamp01((t - s.from) / Math.max(0.5, end - s.from));
  const pages = makePages(timings);
  const petal = data.petal ?? TOK.color.petal;

  /* ---- the flacon as dataviz */
  const lv = data.flacon.level;
  let level = lv[0][1];
  for (let i = 1; i < lv.length; i++) level = lerp(level, lv[i][1], inOut3(ramp(t, at(lv[i][0]), lv[i][2] ?? 1.6)));
  const pk = (data.flacon.petals ?? []).map(([a, n]) => ({ at: at(a), n }));
  const total = Math.max(0, ...pk.map((p) => p.n));
  const petals: PetalTimes = {
    total,
    land: (i) => { let prev = 0; for (const p of pk) { if (p.n > i && p.n > prev) return p.at + ((i - prev) / Math.max(1, p.n - prev)) * 1.4; prev = Math.max(prev, p.n); } return 1e9; },
    leave: (i) => { let seen = 0; for (const p of pk) { if (p.n > i) seen = 1; else if (seen) return p.at + (i / Math.max(1, total)) * 0.6; } return 1e9; },
  };
  const state = { level, petals, drop: data.flacon.drop !== undefined ? at(data.flacon.drop) : undefined, sweeps: (data.flacon.sweeps ?? []).map((a) => at(a)) };

  /* ---- camera */
  let cam: Cam = orbit([0, 1.6, 0], 0, 6, 18);
  if (s.kind === "flacon") {
    if (s.camera === "return") cam = returnTo(CAMERAS[s.returnFrom ?? "hero"](1), shots[0].camera ?? "hero", ramp(t, s.from, DUR - s.from));
    else cam = (CAMERAS[s.camera ?? "hero"] ?? CAMERAS.hero)(inOut3(k));
  }
  const dist = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);

  /* ---- text */
  const textFrom = s.textFrom !== undefined ? at(s.textFrom) : s.from + 0.05;
  const els: TextEl[] = (s.text ?? []).map((e) => e.t === "count"
    ? { ...e, at: undefined, ats: String(e.at ?? "").split("|").map((x) => at(x)) }
    : { ...e, at: e.at !== undefined ? at(e.at) : undefined });
  /** a caption page that only repeats what the title already shows is not drawn (anti-duplicate) */
  const onScreen = els.map((e) => e.v.split("|").join(" ")).join(" ");

  /* ---- sound: a soft whoosh on every cut, the drop, the episode's cues; music ducks under the voice */
  const words = timings.beats.flatMap((b) => b.words);
  const M = TOK.audio.music;
  /** 0 = silence, 1 = voice: a smooth trapezoid round every word, so the bed ducks without steps */
  const duck = (x: number) => words.reduce((d, w) => Math.max(d, clamp01(Math.min((x - (w.start - M.attack)) / M.attack, (w.end + M.release - x) / M.release))), 0);
  const cues: [number, string, number][] = [
    ...shots.slice(1).map((x) => [x.from - TOK.motion.cutWhoosh, "whoosh", TOK.audio.sfx.whoosh] as [number, string, number]),
    ...(state.drop !== undefined ? [[state.drop + 0.68, "drop", TOK.audio.sfx.drop] as [number, string, number]] : []),
    ...(data.sfx ?? []).map(([a, n, v]) => [at(a), n, v] as [number, string, number]),
  ];

  return (
    <AbsoluteFill style={{ background: TOK.color.plumDeep }}>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: (cam.fov * Math.PI) / 180 } }}>
        <DepthOfField focal_distance={dist} aperture_f_stops={cam.f} max_circle_of_confusion_diameter={40} />
      </Camera3d>
      <ToneMapping mode="agx" exposure={0.45} />
      <Bloom intensity={TOK.finish.bloom.intensity} threshold={TOK.finish.bloom.threshold} />
      <Environment room blur={0.04} intensity={0.9} />
      <AmbientLight brightness={60} color="#F2D8E2" />
      <FlaconSet t={t} n={data.number} juice={data.juice} petal={petal} state={state} />

      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <style>{FONTS}</style>
        {s.kind === "plate" && s.img && <FullPlate spec={{ img: s.img, fg: s.fg, video: s.video, kb: s.kb, focus: s.focus }} k={k} />}
        {s.kind === "flacon" && <Scrims strength={0.75} />}
        <FloatingPetals t={t} dur={DUR} color={petal} on={s.petals !== false} />
        <Vignette />
        <Logotype n={data.number} />
        <TextStack t={t} from={textFrom} to={idx === shots.length - 1 ? DUR + 1 : end} els={els} />
        {s.captions !== false && <Captions t={t} pages={pages} keywords={data.keywords ?? []} end={DUR} onScreen={onScreen} />}
        <Grain frame={frame} />
        {flags.safeZones && <SafeZones />}
      </AbsoluteFill>

      {cues.map(([a, name, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(a * FPS))} durationInFrames={FPS * 3} layout="none" name={`sfx-${name}-${i}`}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.55} />
        </Sequence>
      ))}
      <Audio src={staticFile("voice.wav")} volume={TOK.audio.voice} />
      <Audio src={staticFile("music.wav")} volume={(fr: number) => {
        const x = fr / FPS;
        const env = interpolate(x, [0, 0.6, DUR - 2.5, DUR], [0, 1, 1, 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return env * lerp(M.bed, M.ducked, duck(x));
      }} />
    </AbsoluteFill>
  );
}
