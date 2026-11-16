# REDRAWN — map-history Reels (TikTok / Instagram)

You are the editorial strategist AND producer of REDRAWN: 30–60 s vertical videos (1080×1920, 30 fps) where an
animated map tells one historical/geopolitical transformation. **Videos are in English** (US/UK audience);
the owner talks to you in **French**.

## Non-negotiables
- **No invented facts.** Every date/figure on screen must be in the episode's `SOURCES.md`. If historians or
  states disagree, say so (on screen tag "DATES VARY"/"DISPUTED" or neutral wording) and log it in `SOURCES.md`.
- Contested borders (Crimea, Kosovo, Kashmir, Taiwan, W. Sahara, N. Cyprus…): show the status *at the date
  depicted* and the internationally recognised border; document any correction in the prep script.
- Never claim a cause when causes are debated. Army arrows are symbolic (`offset`/`approach` in px), never routes.
- Images: Public domain / CC BY first. CC BY-SA only with the owner's OK (share-alike risk if monetised).
  Credit on screen (Portrait component does it) and in the pinned comment.
- English: short spoken sentences, present tense, English place/person names.

## Make a new episode (checklist)
1. **Pick a topic** in `docs/01_SERIES_AND_TOPICS.md` (recommended order at the bottom). Check data difficulty.
2. **Data**: write `scripts/prep-<id>.mjs` → `public/data/<id>.geojson` (copy `prep-ussr.mjs`).
   Sources & limits: `docs/02_DATA_SOURCES.md`. Natural Earth via `world-atlas` = de facto view → check disputed areas.
   Features need: `id`, `properties.name`, `properties.label` [lon,lat], and a flag for the "focus" group
   (USSR used `soviet: true` + a merged `SOVIET_OUTLINE`; generalise the name if needed).
3. **Research + script**: `public/episodes/<id>/SOURCES.md` (script, dated facts table, debated points, references,
   pinned-comment text). Use web search; prefer primary sources/reference works.
   - Hook ≤ 1 s, last line completed by the first line (loop). Target 45–58 s of voice.
4. **Cue sheet**: `public/episodes/<id>/episode.json` — copy `ussr-1991/episode.json`.
   - `say`: spoken text; `{1990|nineteen ninety}` = caption shows 1990, voice says the words.
   - `camera`: `{fit:"SOVIET",pad}` or `{center:[lon,lat], span:deg}`.
   - actions (all accept `atWord` = fire on that spoken word; an exact token incl. punctuation, e.g. "South.", wins over a
     prefix match; add `occurrence: n` for the n-th match; `atTime: s` fires at an absolute time): `declare` (+`flag`, `flagNote`, `date`), `pulse`,
     `label` (+`flag`), `marker`, `date`, `dissolve`, `allLabels`, `units` (tanks/troops/crowd, `offset`, `approach`,
     `retreatWord`, `caption`), `portrait` (`key`, `name`, `role`, `side`, `stampWord`), `flagSwap`, `shake`.
   - More actions: `bigNumber` (rolling number + `coins`), `archive` (image card: `src`, `caption`, `credit`),
     `callout` (big text, `size`, `stamp`+`stampWord`), `region` (italic approximate-area label), `path`
     (`coords` LineString, drawn progressively; 2 points = great-circle arc; `label`/`labelAt`), `ghost`
     (show a hidden feature, e.g. size comparison), `declare.noLabel`.
   - Episode-level: `palette` {start, startStroke, ids, static}, `counter` ({label,total} or false), `legend`,
     `timeline.step` (years). Focus features use `properties.focus: true` (+ `FOCUS_OUTLINE`); camera `{fit:"FOCUS"}`.
     Dates may be `YYYY` (year only) or `YYYY-MM-DD`.
   - `voice.respell` for ElevenLabs pronunciation fixes (captions keep real spelling).
5. **Assets**: flags → `public/assets/flags/<code>.svg` (`flag-icons` for modern; period flags from Commons or drawn,
   note the year on screen if not the flag in use at that date). Portraits → `public/assets/portraits/<key>.jpg`
   + entry in `credits.json`. Missing assets are skipped at render (never fatal).
   Commons is heavily rate-limited from cloud sessions: `scripts/fetch_queue.sh` (1 req/min) or download locally.
   **Library of Congress works well** (US 19th–20th c. photos, mostly "no known restrictions"):
   `python3 scripts/loc_search.py "<query>"`, then curl `https://tile.loc.gov/.../<id>v.jpg` (v = medium size).
   **Do not use Higgsfield** (owner's choice). Any AI illustration must be clearly labelled, never a fake
   "archive" photo or a real person's face.
6. **Render**: `pipeline/render.sh <id>` → `out/<id>.mp4` (TTS → timings → music → Remotion → −14 LUFS).
   Check stills first: `npx remotion still src/index.ts Episode out/f.jpg --frame=N --props='{"episodeId":"<id>"}' --scale=0.5`
7. **Review**: write `docs/REVIEW_<id>.md` (accuracy, map, rhythm, English, pronunciation, oversimplification,
   licences) — see `docs/03_REVIEW_ep1.md`. Look at a contact sheet of ~8 frames before delivering.

## Posting routine
`pipeline/post.sh <EP n | id>` → fresh video + checks + `deliverables/<id>/POST.md` (title, description, pinned comment,
YouTube description). Follow `.claude/skills/post/SKILL.md` whenever the owner asks to post / resend a reel.

## Pipeline facts
- Voice: ElevenLabs, voice **Brian** `nPczCjzI2devNBz1zQrb`, `eleven_multilingual_v2`, speed ~1.12, pauses capped
  0.28 s. API key is injected by the cloud environment proxy (header `xi-api-key`; key lacks `voices_read`).
  Responses cached in `public/episodes/<id>/.el_*.json`. Fallback: Kokoro local (`models/`, see setup).
- multilingual_v2 ignores IPA → fix names with `respell`; check Gorbachev-type names by ear.
- Music: `pipeline/music.sh` procedural bed; put a licensed `music.wav` + empty `music.lock` to keep your own.
- Rendering in cloud: Chromium at `/opt/pw-browsers/chromium_headless_shell-*/…/chrome-headless-shell`
  (render.sh finds it via `REMOTION_CHROME`). Font is self-hosted (`public/fonts`), no Google Fonts at render.
- Components: `src/components/*` (MapLayer, Labels, Units, Portrait, Flag, FlagSwap, Counter, Timeline,
  DateBadge, Captions, Brand, Fx, Sfx); camera in `src/lib/camera.ts`; cue scheduling in `src/lib/schedule.ts`.

## Setup (fresh clone)
`scripts/setup.sh` (npm install, Kokoro model download, pip deps).
