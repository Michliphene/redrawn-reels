# SILLAGE kit — luxury pass (v3) · CHANGELOG

Everything below is system-level (`raea/sillage-kit/`), reused by every future episode. An episode is now a
`reel.json` + a 10-line `sillage.tsx` (worked example: `raea/sillage-003-rose-v2/`). Checked on stills only: no
video rendered (owner's instruction).

## What changed, and where
| Priority | Change | Files |
|---|---|---|
| — | One source of truth: palette (refined, not replaced: cream #F4EBDD, gold #C9A45C), type sizes + minimums, layout, safe zones, scrims, motion, finish, image style, audio | `tokens.json` |
| P1 | Hero flacon: glass (transmission, IOR 1.5, clearcoat) lit by a studio environment, thick base, amber liquid (level = data), meniscus, faceted gold cap, black-lacquer label with a real SILLAGE logotype (serif glyph paths), key + rose rim + wall halo + pool on the socle, light sweep on each figure change, 9 camera presets (`hero`, `orbit`, `pushIn`, `low`, `macroCap`, `drop`, `macroLabel`, `crane`, `wide`) + `return` for the loop. Dataviz: level keyframes, petals that pile up for tonnages and lift away before the loop, a 3D drop + ring for "1 g". Gold ellipse removed. | `src/flacon.tsx`, `tools/glyphs.py` → `src/glyphs.gen.ts` |
| P2 | Captions: no boxes, cream serif italic, gold the only accent, word fade + 10 px rise, lines never end on a link word, pages that repeat the title are not drawn | `src/captions.tsx`, `src/core.ts` |
| P3 | Text stack (stat ≥ 196 px, title 120, whisper 64, label 32), `count` (3·2·1), outlined badges (SOURCES VARY / OUR CALCULATION / OUR CONVERSION), serif logotype instead of the rose pill, scrims top (held to 43 % of the height) and bottom | `src/type.tsx`, `src/plate.tsx` |
| P4 | Full-frame plates only (no tilted cards, no frames), eased Ken Burns, 2.5D parallax with an `fg` cut-out, `video` hook for image-to-video, one photoreal style suffix + negative list for every new image | `src/plate.tsx`, `tokens.json → image` |
| P5 | Film grain 5 %, vignette, bloom, AgX tone mapping, depth of field, blurred foreground petals (periodic over the reel: the loop holds), whoosh on every cut, synthesised drop sound, music ducked smoothly under the voice | `src/finish.tsx`, `src/reel.tsx`, `tools/drop.py` |
| P6 | Pre-flight that blocks the render: anchors, one currency, one unit per quantity, displayed calculations recomputed, SOURCES VARY badge, on-screen figures present in SOURCES.md, type minimums, worst-case WCAG contrast ≥ 4.5:1 on the scrims, safe area, loop (camera, level, petals); duplicate captions listed | `tools/validate.mjs` (run first by `render.sh`) |
| P7 | `SAFE_ZONES=1 ./render.sh …` draws the forbidden bands (top 250, bottom 480, right 160) | `src/finish.tsx`, `setup.sh` writes `compositions/flags.json` |

N°3 remaster `scent-003-rose-v2`: USD only (€1.28 → ≈ $1.50 at the ECB rate of 31 Dec 2025, 1.1750, "our conversion";
3,500 kg × $1.504 ≈ $5,300), "flowers" for every mass, new voice 60.82 s + music, SOURCES.md, pre-flight 0 ✗.
`render.sh --stills "0,1190,1838"` renders frames only.

## Render time
Not measured on a full render yet. Per still the kit costs about the same as N°5 (no volumetric fog; DoF + transmission
+ environment). Grain/vignette/petals are HTML layers (cheap). Nothing here should double the time.

## Left to do
1. Done 27 Nov: 7 photoreal plates (prompts and retrieval in raea/sillage-003-rose-v2/plates.json; 5 at 768x1376 via Gemini "Copy image" because Chrome blocked downloads), full render 61.3 s, raea check 0 errors (59 reading warnings from the word-by-word captions), −14.0 LUFS, frames from the MP4 checked (level, petals, drop, loop).
2. Reading warnings: raea counts each word as shown alone while the next ones fade in; consider revealing a page faster.
3. Tune: the drop is small in frame; the liquid tint per episode (`juice` in reel.json); a petal mesh with curl.
4. Port N°4/N°5/N°6 to the kit if they get remasters (new ids; published masters stay as they are).
