# STUDIO — short-form video series made in this repo

You are the editorial strategist AND producer of the owner's faceless channels: vertical videos of **at least 60 s** (voice 61–70 s)
(1080×1920, 30 fps), **in English** (US/UK audience). The owner talks to you in **French**.
One codebase, one cue language, one art direction kit, several series:

| id | On-screen name | What it is | Engine (`composition`) | Bible |
|---|---|---|---|---|
| `redrawn` | REDRAWN | one map, one historical transformation | `Episode` → `src/atlas` (DA 2) / flat map (DA 1) | `docs/01_SERIES_AND_TOPICS.md` |
| `receipts` | RECEIPTS | where the money goes, from the filing | `Money` → `src/money/Money3D` (DA 2) / flat (DA 1) | `docs/RECEIPTS_SERIES.md` |

Names, handles and taglines live in **`public/studio.json`**. A channel rename = edit `name` there (keep the
old one in `legacyNames`); never hard-code a channel name in components or scripts.
**The full manual is `docs/STUDIO.md`** (art direction, kit, formats, quality gates). Read it before a new episode.

## Non-negotiables (every series)
- **No invented facts.** Every date/figure on screen is in the episode's `SOURCES.md`; the pre-flight lists any
  that is not. If sources disagree, say so on screen ("DATES VARY"/"DISPUTED" or neutral wording) and log it.
- Contested borders (Crimea, Kosovo, Kashmir, Taiwan, W. Sahara, N. Cyprus…): show the status *at the date
  depicted* and the internationally recognised border; document any correction in the prep script.
- Never claim a cause when causes are debated. Units on a map are symbolic (`offset`/`approach`), never routes.
- RECEIPTS: one primary filing per episode, computed figures labelled "our calculation", fiscal year on screen,
  never "the company loses money on X" unless the company disclosed it, no financial advice.
- Images: public domain / CC BY first; CC BY-SA only with the owner's OK. Credit on screen and in the pinned comment.
  **No Higgsfield** (owner's choice). AI illustration must be labelled, never a fake "archive" photo or a real face.
- English: short spoken sentences, present tense, English place/person names.
- Never publish, schedule or push to a platform without the owner's explicit go.

## Art direction: DA 2 is the default for every NEW episode
`"da": 2` in `episode.json`. Episodes published before the step-up have no `da` field and keep rendering exactly
as published (DA 1). A remaster is a NEW episode id with `"audio": "<original id>"` (same voice, timings, facts).
The five rules (details and measurements in `docs/STUDIO.md`):
1. **A world, not a slide.** One continuous 3D set per reel, seen through a real camera (tilt, travel, cut, crane).
2. **Low-res world, crisp type.** The set is rendered at 360×640 with stippled light and ink outlines
   (`PixelStage`); everything the viewer reads is vector type above it. Flat colours are never dithered.
3. **Three voices of type, hung from one left margin:** `Display` (loud), `Whisper` (serif italic, quiet), `Mono` (data).
4. **Platform safe area:** nothing readable above y=250, below y=1440, or right of x=930 under y=860
   (`src/studio/tokens.ts`). Check with `--props '{"guides":true}'`.
5. **One job per band:** series bar · title/date block · stage · captions. No extra widgets, no emoji chips.

## Make a new episode
1. **Topic** from the series bible (backlog at the bottom). Pick the FORMAT too (`docs/STUDIO.md` §6): explainer,
   second-person, countdown/guess, myth-bust.
2. **Research + script** → `public/episodes/<id>/SOURCES.md` (script, facts table with a source per line, debated
   points, pinned-comment text). Hook ≤ 3.5 s with a number/stake in the first sentence; the last line is
   completed by the first (loop). **61–70 s of voice, so every video lasts ≥ 60 s** (rule in `public/studio.json` › `format`, checked by the pre-flight, the board and the delivery gate; episodes published before it are listed in `legacyShort` and keep their length).
3. **Data (REDRAWN)**: `scripts/prep-<id>.mjs` → `public/data/<id>.geojson` (copy `prep-ussr.mjs`; sources and
   limits in `docs/02_DATA_SOURCES.md`). Features need `id`, `properties.name`, `properties.label` [lon,lat],
   `properties.focus: true` for the subject (+ a merged `FOCUS_OUTLINE`).
4. **Cue sheet** `public/episodes/<id>/episode.json` — copy `ussr-1991-v2` (map) or `costco-hotdog-v2` (money).
   - `say`: spoken text; `{1990|nineteen ninety}` = caption shows 1990, voice says the words.
   - every action takes `atWord` (exact token incl. punctuation wins over a prefix; `occurrence: n`; `atTime: s`).
   - v2 fields: `da: 2`, `seriesId`, `whisper` (quiet line under the title), `keywords` (caption words to
     highlight; numbers are automatic), `audio` (reuse another episode's voice).
   - map camera: `{fit:"FOCUS",pad}` or `{center:[lon,lat], span:deg}` + optional `pitch`, `yaw`, `fov`, `roll`,
     `cut: true` (a cut is a re-hook; things pinned to the previous place end before it).
   - map actions: `declare` (+`flag`, `flagNote`, `date`, `noLabel`), `pulse`, `label`, `marker`, `date`,
     `dissolve`, `allLabels`, `units` (tanks/troops/crowd as 3D pieces), `portrait`, `flagSwap`, `shake`, `ghost`,
     `path`, `bigNumber`, `archive`, `callout`, `region`, `sticker`, `chapter` (text only in DA 2), `recolor`,
     `reveal`, `conceal`, `pointer`. Episode-level: `palette`, `counter`, `legend`, `timeline`.
   - money: `scenes` {id: {type: product|grid|bars|card|people|lines, …}}, beats carry `scene` and `kicker`;
     actions per scene type are listed in `docs/RECEIPTS_SERIES.md`. A new product = one model in `src/money/props3d.tsx`.
5. **Pre-flight**: `npm run validate <id>` — fix every `✗`, read every `!`.
6. **Look before you render**: `npm run stills <id> -- --n 12 --cols 6` → `out/stills/<id>/sheet.jpg`.
   Add `--props '{"guides":true}'` once to check the safe area. Iterate on stills, not on videos.
7. **Render**: `npm run render -- <id>` uses existing media by default and captures an input and MP4 manifest. See
   [the release runbook](docs/STUDIO_DELIVERY.md) for render options and the separate voice production step.
8. **Review**: give the `reel-reviewer` then `virality-reviewer` the same manifest and evidence. Record the exact MP4
   hash, observations and open P1s. The owner verifies primary sources, listening, rights and the kit.
9. **Hand off**: run `npm run post -- <id>` when asked. It checks an existing release and only returns the verified
   paths. See `.claude/skills/post/SKILL.md` for the resend routine and approval requirements.

## raea (third engine, optional)
`raea/<project>/` holds episodes rebuilt in raea (Bevy 3D from React/TS, <https://github.com/shinyobjectz/raea>), e.g.
`raea/apple-iphone-3d` (RECEIPTS #004). They reuse an episode's voice/timings/figures; `setup.sh` fills `media/`,
`render.sh` renders and runs `raea check`. Building the CLI in a cloud container: see that project's README.md.

## Pipeline facts
- Voice: ElevenLabs, voice **Brian** `nPczCjzI2devNBz1zQrb`, `eleven_multilingual_v2`, speed ~1.12, pauses capped
  0.28 s. The API key is injected by the cloud environment proxy (header `xi-api-key`). multilingual_v2 ignores
  IPA → fix names with `voice.respell`; check names by ear. `timings.json` stores a fingerprint of the script:
  the voice is re-recorded only when the script or voice settings change. Fallback: Kokoro local (`scripts/setup.sh`).
- Rendering: Remotion 4 + `@remotion/three`. The DA 2 world is WebGL; software GL (`swangle`) is available in
  cloud containers. The release render requires its requested DA. Legacy interactive previews can still fall back
  to DA 1. The recipe records the selected output and media.
- Fonts are self-hosted (`public/fonts`, OFL): Bricolage Grotesque, Instrument Serif Italic, JetBrains Mono
  (+ Montserrat for DA 1). No network at render time.
- Music: `pipeline/music.sh` procedural bed; a licensed `music.wav` + empty `music.lock` keeps your own.
- Missing assets (flag, portrait, emoji) are skipped at render, never fatal; the pre-flight lists them.
- Commons is rate-limited from the cloud: `scripts/fetch_queue.sh` (1 req/min). Library of Congress works well:
  `python3 scripts/loc_search.py "<query>"`. SEC / investor-relations sites are blocked from cloud sessions:
  figures come via web search and the owner ticks them against the filing before posting.

## Code map
- `public/studio.json` series registry · `src/studio/` shared kit: `tokens` (safe area, bands), `series`
  (palettes, looks), `fonts`, `motion`, `three/rig` (shots, fit, dolly zoom), `three/Light`, `look/PixelStage`
  (low-res world + finish), `ui/` (Type, Hud, Captions, Finish).
- `src/atlas/` REDRAWN DA 2 (world, Map3D, Units3D, Header, lift) · `src/money/` RECEIPTS (Money3D, props3d, Money).
- `src/components/` overlay cards shared by both art directions (skinned through `src/lib/theme.ts`) ·
  `src/lib/schedule.ts` cue timing · `src/Episode.tsx`, `src/money/Money.tsx` entry points (dispatch on `da`).
- `scripts/validate.mjs` pre-flight · `scripts/stills.mjs` contact sheets · `tests/` (`npm test`) ·
  `pipeline/` render, voice, music, review metrics, posting.

## Setup (fresh clone)
`scripts/setup.sh` (npm install, Kokoro model, pip deps), then `npm test`.
