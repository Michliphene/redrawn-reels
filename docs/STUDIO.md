# STUDIO manual — how every reel made here is designed, built and checked

Applies to every series of `public/studio.json`. Series-specific rules stay in the bibles
(`01_SERIES_AND_TOPICS.md` for REDRAWN, `RECEIPTS_SERIES.md` for RECEIPTS); this document is what they share.
`CLAUDE.md` is the short version; when the two disagree, fix both.

## 1. Why the art direction changed (the diagnosis)
Compared frame by frame with the reels that out-perform ours in the same "explain one thing" niche:

| What they do | What DA 1 did | DA 2 answer |
|---|---|---|
| One illustrated world fills the frame; a real camera moves in it | A flat map / flat cards on a gradient | A 3D set per series (`PixelStage`): table map, shop counter |
| One finishing pass makes everything belong together | Vector art + stock emoji + photos, each with its own look | Low-res render, stippled light, ink outline: one look for every object |
| Loud title + quiet serif line, hung from one margin | Centred all-caps Montserrat everywhere | `Display` / `Whisper` / `Mono`, left margin shared by title, date and captions |
| Nothing under the platform interface | Series tag at y=70 (under the Reels header), timeline at y=1700 and source at y=1660 (under the description) | Safe area in `tokens.ts`, every band inside it |
| Information lives in the scene | Counter pill + date badge + chapter chip + timeline + locator at once | One header block: series bar → title, then date + chapter + rail |
| The viewer is addressed ("your…", a challenge) | Third-person lesson | Formats in §6 |

## 2. The five rules, with measurements
All numbers are pixels of the 1080×1920 master and live in `src/studio/tokens.ts`.

**Rule 1 — a world, not a slide.** One continuous set per reel. Scenes are places in that set; you get from one
to the next by moving or cutting the camera, never by cross-fading the content.

**Rule 2 — low-res world, crisp type.** The set renders at `1080 / look.px` (360×640 for `px: 3`) and is upscaled
with hard pixels. The finish (`src/studio/look/PixelStage.tsx`) does three things and nothing else:
light falloff (distance fog, spotlight) cut into `look.levels` steps and stippled with a 4×4 Bayer matrix;
a 1-pixel ink line behind every silhouette; an optional scanline. It never touches a flat colour, so palette
colours stay exact and the file stays cheap to compress. Type, labels and cards are HTML above the canvas.
Film grain (`look.grain`) is off: a full-frame SVG noise filter multiplied render time by about five on the
cloud machine (measured) for a texture the stipple already provides.

**Rule 3 — three voices, one margin** (`src/studio/ui/Type.tsx`, fonts in `public/fonts`):

| Voice | Font | Use | Never |
|---|---|---|---|
| `Display` | Bricolage Grotesque, weight 800, width 75 %, upper-case | titles, numbers, captions, keywords | body text, more than 3 lines |
| `Whisper` | Instrument Serif Italic, sentence case | the one quiet line that gives the meaning | numbers, more than one line |
| `Mono` | JetBrains Mono 700, tracked, upper-case | series tag, dates, counters, units, sources, captions of objects | sentences |

Title, date block, captions and legends all start at `SAFE.left` (x = 64). Centre only what is pinned to an object
in the world (a value above a bar, a name on a country).

**Rule 4 — the platform safe area.**
```
y    0 ┌──────────────────────────┐
       │  platform header         │  nothing readable
   250 ├──────────────────────────┤  SAFE.top
       │ hud      250–304         │  series tag · episode · tally
       │ title    318–600         │  title on the hook, then date/chapter or kicker
       │ stage    560–1130        │  the subject of the world (camera principal point = its centre, y 845)
       │ captions 1170–1410       │  two lines, left-hung            ┊ x > 930 below y 860:
  1440 ├──────────────────────────┤  SAFE.bottom                     ┊ like / comment / share column
       │  account, description    │  world only (it continues under the interface)
  1920 └──────────────────────────┘
```
Measured on Reels screenshots (Nov 2026). Render one still with `--props '{"guides":true}'` per episode.

**Rule 5 — one job per band.** If a new piece of information needs a new widget, it replaces something or it goes
into the world. Emoji chips, floating pills and second counters are DA 1.

### Colour
Each series has ten colours (`SeriesPalette` in `src/studio/series.ts`): `bg`, `bgGlow`, `surface`, `surfaceEdge`,
`grid`, `ink`, `muted`, `accent`, `danger`, `warn`. One accent per series (REDRAWN amber `#FFC94D`, RECEIPTS lime
`#C8F53C`); it marks the series tag, keywords and the number that matters — nothing else. Episode colours
(country fills, cost/ops/profit) come from the cue sheet and must contrast with `surface`.

## 3. The kit (`src/studio/`)
| File | Gives you |
|---|---|
| `tokens.ts` | `W H FPS`, `SAFE`, `ZONES`, `TYPE` |
| `series.ts` | `seriesOf(spec)` → name, palette, look; `episodeTag()` |
| `fonts.ts` | `loadFonts()` (call once at the top of a composition), font cuts |
| `motion.ts` | `ramp`, `ease.*`, `pop`, `life`, `hit`, `hop`, `drift`, `shake`, `shade`, `mixHex` — all pure functions of time |
| `three/rig.ts` | `Shot` {target, dist, pitch, yaw, fov, roll}, `shotAt(t, keys)`, `fitShot(points, angle, rect)`, `dollyZoom`, `makeCamera`, `projector` (world point → pixel) |
| `three/Light.tsx` | `TableLight`: a surface facing up shows exactly its palette colour |
| `look/PixelStage.tsx` | the low-res canvas + finish; `probeWebGL()` |
| `look/PixelImg.tsx` | a photo redrawn as a low-res halftone print in the series tones (portraits use it in DA 2) |
| `ui/Type.tsx` | `Display`, `Whisper`, `Mono`, `fitDisplay()` |
| `ui/Hud.tsx` | `SeriesBar`, `TitleBlock`, `Kicker`, `ReadabilityBands` |
| `ui/Captions.tsx` | word-synced captions with keyword highlight |
| `ui/Finish.tsx` | `Grain`, `Guides` (safe-area overlay) |

Skeleton of a DA 2 composition:
```tsx
loadFonts();
const series = seriesOf(spec);
const shot = shotAt(t, keys);                 // keys: one Shot per beat/scene
const cam = makeCamera(shot), toPx = projector(cam);
<AbsoluteFill style={{ background: series.palette.bg }}>
  <PixelStage look={series.look} camera={cam} bg={series.palette.bg} fog={[shot.dist * 1.2, shot.dist * 3.4]}>
    <TableLight shot={shot} />
    {/* meshes: positions are pure functions of t */}
  </PixelStage>
  <ReadabilityBands bg={series.palette.bg} />
  {/* labels pinned to the world: position = toPx([x, y, z]) */}
  <SeriesBar series={series} episode={spec.episode} />
  <TitleBlock title={spec.title} whisper={spec.whisper} series={series} opacity={titleOpacity} t={t} />
  <Captions timings={timings} t={t} accent={series.palette.accent} keywords={spec.keywords} />
  <Grain amount={series.look.grain} />
</AbsoluteFill>
```
Rules of the kit: no `Math.random()` and no state (a frame must render the same in any order — use `hash(i)` and
`drift(t)`); no network at render; anything loaded asynchronously goes through `delayRender` and must
`continueRender` on failure too.

## 4. Camera language
A shot is five numbers, so the cue sheet can direct it.

| Move | How | When |
|---|---|---|
| Opening crane | automatic on frame 0: low and close, rising to the reading angle in 1.5 s | every reel — frame 0 shows a 3D object, not a diagram |
| Reading angle | wide view = steep (`pitch` ≈ 55–60), close view = low (≈ 35–45); automatic from `span`, override with `pitch` | default |
| Orbit | `yaw` ±10–25 between beats; a slow drift is added for free | give depth without changing the subject |
| Cut | `"cut": true` on a camera | a re-hook: new place, new idea, usually around 40–60 % of the reel |
| Pull back | next camera with a larger `span` / a `fit` | reveal the whole after a detail |
| Dolly zoom | `dollyZoom(shot, fov)` (kit function, not yet a cue) | one per reel at most, on the turning point |
| Loop return | automatic in the last 0.5 s: back to the frame-0 pose | so the last frame meets the first |

One move per beat. A camera that moves on every word is as flat as one that never moves.
After a cut, everything pinned to the previous place (labels, markers, units, paths) is ended automatically.

## 5. The two worlds
**REDRAWN — the table map (`src/atlas/`).** Every GeoJSON feature is projected once (azimuthal equal-area centred
on the subject) and extruded into a piece. Scenery is a thin slab; the subject is thicker.

| Cue | What happens on the table |
|---|---|
| `declare` | the piece jumps, flashes, takes its colour and stays at its own height (borders never move) |
| `pulse` | the piece hops, its edge lights up |
| `dissolve` | every piece of the subject bursts away from the centre, then settles back on its exact borders; camera shake |
| `reveal` / `conceal` | a piece rises out of the table / sinks into it |
| `ghost` | a translucent comparison shape hovers above the map (or white lines for a `lines` feature) |
| `path` | a ribbon drawn along the great circle |
| `units` | tanks, soldiers, crowds as game pieces; `offset`/`approach` are still screen pixels (symbolic, never a route) |
| `label`, `marker`, `region`, `pointer`, `sticker` | crisp type pinned to the place |
| `portrait`, `archive`, `callout`, `bigNumber`, `flagSwap` | cards above the world: single portraits go top-right (`side:"right", y:330`) |
| `date`, `chapter`, `allLabels`, `counter`, `timeline` | the header block (date + chapter line + rail + tally) and the legend |

**RECEIPTS — the counter (`src/money/`).** Each scene of the cue sheet is a station on one counter; the camera
travels between stations and returns to the product for the loop.

| Scene type | Station | Type above it |
|---|---|---|
| `product` | the hero object on a plinth, coins and a receipt beside it | price (`Display`), tag (pill), `ghost` sticker |
| `grid` | 100 tiles = $100; `fill` raises coloured stacks, `rest` makes the remainder glow | legend rows |
| `bars` | two columns rising | `big` headline, value above each bar, name under it |
| `card` | a card standing on the counter | two `stat` blocks |
| `people` | pawns; `light` turns `count` of them to the accent colour | the ratio as a `stat` |
| `lines` | the product again, dimmed | two statements, the first struck through |

## 6. Formats — the scenario is chosen before the script
Every format keeps the spine **Hook → Escalation → Re-hook → Payoff → Loop** and every rule of the bibles.
Figures and hooks below are drafts: verify each at scripting time and drop the angle if the sources do not support it.

| Format | The viewer's seat | Skeleton | Works when |
|---|---|---|---|
| **A. Explainer** (what we have) | spectator | number or contradiction → 4–6 steps → twist → loop | the transformation itself is the surprise |
| **B. You are…** | the person who must decide | "You are X. You have N. Keep them." → each beat is a pressure on *you* → what really happened → loop on the choice | a single decision-maker and a clock exist in the sources |
| **C. Guess before the count ends** | player | question + options on screen → world plays the clue → 3-2-1 → reveal → "and that is why…" | the answer is one number, one place or one year |
| **D. Myth-bust** | someone about to be corrected | "Everyone thinks X" (shown, then struck through) → what the record says → why the myth exists | a common belief is contradicted by a primary source |
| **E. One object** (RECEIPTS) | the buyer | the object's price → follow one unit of it through the business → who really pays | a filing lets you split one price |

Format B and C are the answer to "the viewer is the subject": they create a reason to stay (the outcome of *your*
choice, the end of the countdown) that an explainer does not have. Rules for B: never put words in a real
person's mouth, never show a real face on a character; "you" is a seat, the facts stay third-person and sourced.
Rules for C: the countdown is real seconds on screen (`Mono`, in the hud band); the reveal must be visible in the
world, not only spoken.

Pilots worth scripting first (one per format, existing data and engines):
1. **B · REDRAWN** — "You have 15 republics. Keep them." (the USSR, Mar 1990 → Dec 1991, reuses `ussr1991.geojson`;
   each `declare` is one you lose; tally counts down from 15 instead of up).
2. **C · REDRAWN** — "Guess the price of Alaska before it flips." (reuses `alaska1867.geojson`; three price options
   as `Display`, the Texas `ghost` as the clue).
3. **D · REDRAWN** — the straight-line border myth already in the backlog (Korea's 38th parallel is produced; the
   same structure fits the next "who drew this line" topic).
4. **E · RECEIPTS** — any backlog item of `RECEIPTS_SERIES.md` with a product model added to `props3d.tsx`.
5. **C · RECEIPTS** — "Of $100, how much reaches the shows? Lock your guess." (the Netflix split, reuses its filing).

## 7. Quality gates (in this order; each one is cheap compared with the next)
1. `npm run validate <id>` — no `✗`. Every `!` is either fixed or explained in `docs/REVIEW_<id>.md`.
2. `npm run stills <id> -- --n 12 --cols 6` — look at the sheet. Frame 0 must work paused and muted.
3. One still with `--props '{"guides":true}'` — nothing readable in the red zones.
4. `pipeline/render.sh <id>`.
5. `reel-reviewer` agent (clarity, sync, layout, accuracy) then `virality-reviewer` (hook, retention, loop, packaging).
6. `python3 pipeline/virality_metrics.py <id>`: no gap > 3 s without a new cue, loop SSIM reported, −14 LUFS ±1.5.
7. The owner listens once (names, numbers) and ticks the source lines before posting.

## 8. Resilience — what can fail and what happens
| Failure | Behaviour | Where |
|---|---|---|
| A cue word is not in the script | pre-flight error before any voice is recorded; also a clear render error | `scripts/validate.mjs`, `src/lib/schedule.ts` |
| No WebGL in the render browser | the episode renders in its flat DA 1 version | `probeWebGL()` in `Root.tsx`, entry points |
| A font fails to load | warning, next family in the stack, render continues | `fonts.ts` |
| A flag / portrait / emoji is missing | the element is skipped; the pre-flight lists it | `Root.tsx`, `validate.mjs` |
| ElevenLabs is down or out of quota | Kokoro local voice (needs `scripts/setup.sh`) | `pipeline/tts.py` |
| The script did not change | the voice is NOT re-recorded (fingerprint in `timings.json`) — cues stay in sync, no credit spent | `pipeline/tts.py` |
| The headless browser dies mid-render | one automatic retry | `pipeline/render.sh` |
| An old episode is re-rendered after engine work | it has no `da` field → DA 1 path, unchanged | entry points |
| A channel is renamed | edit `public/studio.json`; old `series` strings keep resolving through `legacyNames` | `series.ts` |
| A figure is on screen but not in `SOURCES.md` | pre-flight warning naming the cue | `validate.mjs` |

Version the art direction, never patch it in place: a visual change that would alter published episodes becomes
DA 3 and the old path stays.

## 9. Scaling — adding things without touching what exists
- **A new product (RECEIPTS):** one component in `src/money/props3d.tsx` (primitives only, ~3 units wide, chunky),
  one line in `PRODUCTS`, then `"art": "<key>"` in the scene.
- **A new cue type:** add it to `Action` in `src/lib/types.ts`, render it as a pure function of `t`, add it to the
  action lists in `scripts/validate.mjs`, document it in the series bible.
- **A new series:** an entry in `public/studio.json` (id, name, composition, episode tag); a palette and a look in
  `src/studio/series.ts`; an engine that starts from the §3 skeleton; a bible in `docs/`; its action list in
  `validate.mjs`. The pipeline, voice, captions, type, safe area, stills and tests are already shared.
- **A remaster / an A-B cut of a hook:** new episode id with `"audio": "<source id>"`; change cues, never `say`.
- **Batching:** `npm run validate -- --all`, and `for id in …; do pipeline/render.sh $id; done` — the voice step
  skips itself, so a batch only costs render time.

## 10. Measured on the cloud machine (4 CPUs, no GPU, software WebGL)
| | Result |
|---|---|
| 12 stills + contact sheet at half size | ≈ 45 s |
| REDRAWN DA 2, 55.8 s reel (`ussr-1991-v2`) | 5 min 43 s, 49 MB at CRF 18 |
| RECEIPTS DA 2, 46.1 s reel (`costco-hotdog-v2`) | 3 min 4 s, 41 MB (14 min 42 s with film grain on) |
| DA 1 re-render after the refactor vs the original code | SSIM 0.99, PSNR 44 dB: only text anti-aliasing differs (software-GL setting) |
| Pre-flight of all 9 episodes · `npm test` | < 1 s · ≈ 5 s |

A render uses all four cores: do not run stills at the same time.

## 11. Known limits (be honest in reviews)
- Portraits are printed in the series tones (`PixelImg`). Archive image cards, the flag pole and emoji stickers
  are still DA 1 objects with a DA 2 skin: `PixelImg` for archives and a 3D flag pole are the next kit items.
- The DA 1 locator (mini-globe) has no DA 2 equivalent yet; name the place with a label in the first second.
- The loop is a camera return plus the title: colours of the last frame differ from the first on REDRAWN
  (loop SSIM 0.83 on `ussr-1991-v2`, 0.89 on `costco-hotdog-v2`).
- The opening crane is low: on a very wide subject (the USSR) frame 0 reads as a red band, not a recognisable
  shape. Raise the crane end pitch, or open on a closer subject, for the next map episode.
- No recurring character yet. A mascot or a "you" pawn is the next step for formats B and C.
- Stippled light is fine detail: check one upload per platform for compression artefacts before a batch.
- 3D needs WebGL: on a machine with a GPU set `REMOTION_GL=angle` (or `angle-egl` on Linux) for speed.

## 12. Owner rules, 20 Nov 2026 (every reel from now on)

1. **A themed backdrop behind every scene.** Each episode shows its subject in the background (Amazon: a delivery van
   on a street, seen in profile, a courier with a parcel or not; Starbucks: a coffeehouse street, the baristas at the
   counter, a night street of coffeehouses). The data stays in front; the backdrop is darkened by the scene's fog and the
   top/bottom gradients so text keeps 3:1.
2. **AI images in the reels.** Backdrops (and other plates) are generated images: Nano Banana or GPT Image when an account
   allows it, else Canva's generate-image. Prompts: stylised flat illustration, side profile, the house palette (dark
   forest green, teal, warm amber), calm areas where the title and captions sit, **no logos, no brand marks, no text**.
   The PNGs live in `public/episodes/<id>/art/` (committed) with their prompts and tool in SOURCES.md (provenance).
   In raea: an opaque unlit card behind the scene, `<Mesh3d><Cuboid half_size={[w/2, h/2, 0.02]} />
   <StandardMaterial base_color_texture={staticFile(...)} unlit /></Mesh3d>`, with the picture flipped top-bottom in
   setup (the front face maps it upside down); the floor stops just behind the subject so the picture fills the frame.
   Not `ImagePlane`: in a continuous render it never moves and, mounted after frame 0, never appears (single stills
   hide both), and its blended planes sort by centre distance. See `raea/starbucks-3d`.
3. **One minute or more.** Every reel is at least 60 s (the TikTok Creator Rewards threshold), target 61–65 s:
   lengthen with sourced beats (a second figure, a twist, a comment question), never with padding.
