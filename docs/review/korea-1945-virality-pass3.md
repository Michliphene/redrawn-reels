# Virality review: korea-1945 (REDRAWN EP 4), pass 3 (final)

Video: `out/korea-1945.mp4` (57.3 s, 1080×1920; cue timeline 56.71 s).

Evidence used:
- `python3 pipeline/virality_metrics.py korea-1945`, run fresh.
- All 6 hook frames (0–3 s) and `loop_first_vs_last.jpg`.
- The fresh beat sheets and `cues.md` (not regenerated).
- `episode.json`, `SOURCES.md` and `timings.json` (word starts).
- `deliverables/korea-1945/POSTING.md` and `cover_9x16.png`.
- Pass 2 (`docs/review/korea-1945-virality-pass2.md`).
- `src/lib/schedule.ts` and `src/components/MapLayer.tsx`, to check how `atWord`, `declare` and `recolor` resolve.
- Extra frames in `/tmp/claude-0/virality-tmp/`, prefix `k3_`: 50.8, 51.5, 56.5 and 56.68 s, plus the strip `k3_strip.jpg`.

> This is a pattern-based estimate against `docs/VIRALITY_PLAYBOOK.md`, not a prediction. Creator account size and how the first test cohort responds are the biggest factors, and we can't control either.

## Key metrics (pass 2 → pass 3)
| Metric | Pass 2 | Pass 3 | Read |
|---|---|---|---|
| Duration / words / pace | 57.3 s · 147 · 2.78 w/s | 57.3 s · 147 · 2.78 w/s | In band. Same script. |
| Hook length | 5.08 s | 5.08 s | Unchanged. "map." still lands at 4.93 s. |
| Cues / 10 s | 6.8 | **7.9** | Up. |
| Longest gaps | 4.68 s @ 0.25 · 3.25 · 3.20 | **3.25 s @ 48.73** · 2.48 · 2.41 | The gap in the hook is gone. One gap over 2.5 s remains (see change 1). |
| Empty 2 s windows | 3 / 29 | **0 / 29** | Clean. |
| Loop SSIM | 0.898 | **0.956** | The zoom match worked, and hiding the timeline helped. |
| Loudness | −14.3 | −14.3 LUFS | ok |

## What I saw on screen
- **Hook** (`hook_0`–`hook_5`, `beat_00`):
  - Frame 0 shows the title, a brown peninsula, the yellow 38°N stroke and the series badge. It reads well paused, but it's still one colour.
  - The pictures now follow the words: the 38°N stroke is on from frame 0 and holds through "map.", the 48-star US flag appears on "Two", the map sticker on "National", and the pen on "map.".
  - The stretch from 0.25 to 2.31 s (around 2 s) has nothing new, but the title, line and caption are all being read during it, so that's fine.
- **States / war / armistice:** dense and escalating.
  - The armistice frame (`beat_09`, third panel) shows both lines, labelled, plus the "New border: the DMZ · ≈ 2.5 miles wide · ≈ 155 miles long" card. Both numbers are in SOURCES (≈4 km, ≈248 km).
- **Swap** (`beat_10`, `k3_50.8`, `k3_51.5`): **this is now the screenshot-and-send frame.** From 48.7 to 51.5 s one frame holds:
  - red and blue,
  - the white "1953 line" and the yellow "38°N",
  - Kaesong pointed in the red and Sokcho pointed in the blue,
  - the "SWAPPED" chip.

  It holds for about 2.8 s, long enough to pause on.
- **Bug found:** the `pulse ROK @ "South."` fired at **46.95 s**, not 51.3 s.
  - `schedule.ts` strips punctuation (`norm`) and takes the *first* match, so "South." matches "South," in the first sentence. "North." only works because the first "North" in the beat happens to carry the full stop.
  - Result: nothing new happens on "is now in the South.", and the beat still contains the video's only gap over 2.5 s (48.73 → 51.98 s).
  - Pass 2 wrongly said these tokens were distinct.
- **Treaty:** the "No peace treaty / STILL" card is strong.
- **Loop** (`beat_12`, `k3_56.5`, `k3_56.68`, `loop_first_vs_last`):
  - "Still divided" plays over today's red/blue map.
  - On "started", the map goes back to brown and the yellow line, and the title returns on the last frames.
  - "And it all started with…" leads into "One night in 1945…". Seamless, SSIM 0.956.
- **Trust:**
  - Caption line 1 ("picked Korea's dividing line using a National Geographic map") matches SOURCES row "The line".
  - The pin is now either/or.
  - **One leftover overclaim:** the Shorts title in `POSTING.md`, "Two Americans split Korea with a National Geographic map", says more than SOURCES supports (they *proposed* the zone line; the split came in 1948). See change 4.
  - Small honesty caveat: Kaesong (37.97°N) sits only about 3 km south of 38°N. At this zoom the pointer tip lands *on* the yellow line, so the frame shows the claim but can't prove it. That's true, and it's logged in SOURCES as "computed against Natural Earth". Expect a "Kaesong is right on the line" comment, and have the reply ready (section 4).

## Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **21/25** | **Frame 0 (6/8):** clean title, yellow line and peninsula, but brown on navy. You chose to keep the loop match (see change 2: the red/blue version can't be done with JSON alone). **Payload (5/7):** "One night in 1945 · Two Americans" lands inside 3 s. The strongest noun ("National Geographic map") arrives at 3.85–4.93 s, and the stake ("split") is on screen only, never spoken. **Place (5/5).** **Text (3/3):** 5-word title. **No throat-clearing (2/2).** |
| B. Retention | **22/25** | **Cue density (7/8):** 7.9 per 10 s and no empty 2 s windows. One 3.25 s gap remains, caused by the mis-fired pulse. **Escalation (5/6):** but → so → and-when runs well from 1948 on. The 12–24 s setup (order, line) is linear explanation. **Re-hook (3/4):** "But in 1948" at 52 % plus the armistice question at 70 %. Both are good, but the "it's not the 38th parallel" twist isn't teased early. **Payoff (4/4):** the swap proof is now one frame. **Pace (3/3):** 2.78 w/s, with 1–3-word captions. |
| C. Rewatch & loop | **10/10** | **Line (5/5):** "And it all started with…" leads into "One night in 1945…". **SSIM 0.956 (3/3).** **Pause frames (2/2):** the armistice frame with both lines and the DMZ card, the swap frame, and "No peace treaty / STILL". |
| D. Shareability & saves | **14/15** | **Send (6/6):** "two Americans and a National Geographic map" plus the swap frame ("it's not the 38th parallel; these two cities traded sides"). That's a myth-bust with a visual receipt. **Save (4/4):** the swap frame works as a reference map of the 1945 line versus the 1953 line. **Comment (3/3):** the either/or pin with a real answer. **Human (1/2):** small Rusk card only, and no human cost on screen. |
| E. Packaging | **9/10** | **Cover (3/4):** red/blue zones, the yellow "38th parallel" line, the title and the series badge read well at thumbnail size. The bottom ~35 % of the 9:16 is empty navy, and there's no "how" sub-line. **Caption (3/3):** keywords, "38th parallel" twice, and 5 hashtags. **Series (3/3):** REDRAWN EP 4 badge on frame 0 and on the cover. |
| F. Niche codes & trust | **12/15** | **Transformation (4/4):** brown, then 1945 zones, then the 1953 line, then back. **Scale anchor (1/3):** the DMZ is given in miles, but there's no familiar comparison. **Face (2/3):** Rusk only (Bonesteel named, not shown). **Sourced/hedged (3/3):** the video is clean, and the caption and pin are fixed. The Shorts title in POSTING.md still needs the change 4 fix. **Anti-patterns (2/2):** the dead stretch in the hook is gone, the loop is honest, and no cause is overclaimed. |
| **TOTAL** | **88/100 · 8.8/10** | **Tier: strong breakout odds** (up from 81) |

## Top 5 changes, ranked by expected gain

### 1. Make the "South." pulse fire on the right word (+1: B density 7 → 8)
`atWord` can't tell "South," from "South.", so pin this pulse to the word's absolute start time (51.30 s in `timings.json`).

`swap` → replace the ROK pulse:
```json
{"type": "pulse", "ids": ["ROK"], "atTime": 51.3}
```
- This closes the 48.73 → 51.98 s gap. The longest gap becomes about 2.6 s, at 48.73 → 51.3 s.
- The DPRK pulse is already correct, at 48.00 s.
- **Caveat:** `atTime` is absolute. If the voice is ever regenerated, re-read `timings.json` and update it.
- Optional (outside this pass's scope): add an occurrence index (`atWordN`) to `schedule.ts`, `review_frames.py` and `virality_metrics.py`, so this can't happen again.

### 2. Red/blue frame 0 with the loop kept: needs a small MapLayer change, not JSON (+2: A frame 0 6 → 8; re-measure SSIM)
Pass 2's JSON recipe **would not work**. In `MapLayer.fillAt`:
- `declares.find(...)` uses the **first** declare per id. A `declare` at t = 0 would override the Seoul/Moscow declares.
- `recolors.find(t >= a.t)` makes the **first** recolor permanent. A recolor on "Japan," would keep the zones brown for the rest of the video.
- A declare also **flashes to white** (`#FFF6E0`) for its first frames, so frame 0 would come out cream instead of red/blue.

The proposed change has three parts:
- `fillAt` resolves the **latest** `declare` or `recolor` with `a.t <= t` for each id.
- `declare` accepts `instant: true`, which skips the flash.
- Then the beats change as follows:

```json
// hook: add
{"type": "declare", "id": "KOREA_N38", "noLabel": true, "instant": true, "atTime": 0},
{"type": "declare", "id": "KOREA_S38", "noLabel": true, "instant": true, "atTime": 0}
// japan: add, so the story still starts brown and the 25 s transformation is kept
{"type": "recolor", "ids": ["KOREA_N38", "KOREA_S38"], "atWord": "Japan,"}
// loop: remove the "recolor" action, so the end frame shows the 1945 zones in red/blue plus the yellow line, like frame 0
```
- Keep this only if loop SSIM stays ≥ 0.85. Both ends would be red/blue plus yellow plus title, so it should stay around 0.9.
- Accuracy: the 38°N zones are the August 1945 division, which is exactly what the title frame claims.
- Optional: try it as an A/B upload first, on Shorts, where frame 0 matters most.

### 3. Speak the stake inside 3 s (+1: A payload 5 → 6; needs new TTS)
One sentence, with the same facts as SOURCES row "The line" (Rusk/Bonesteel, at night, a National Geographic map, proposed the 38th parallel):
```json
{"id": "hook", "say": "One night in {1945|nineteen forty-five}, two Americans pick Korea's dividing line from a National Geographic map."}
```
- Commas instead of full stops remove the 1.17 s hold on "1945.". The hook should come out at about the same length, around 4.5–5 s, but it now carries the stake ("dividing line").
- Re-check the voice by ear.
- After the new TTS, every `atTime` (change 1) and the hook sticker words must be re-checked. The `Two` sticker becomes `two`; matching ignores case, so it still works.
- If you'd rather not re-voice, skip this one: the current triad is still strong.

### 4. Finish the cover and fix the Shorts title (+1: E cover 3 → 4; also protects trust)
- **`cover_9x16.png`:** add **"ONE NIGHT. ONE MAP."** in brand yellow, about 90 px tall, at y ≈ 1450–1560, in the empty band under Jeju. On `cover_3x4.jpg`, put it just under the title, inside the centre crop.
- **A/B cover:** the `k3_50.8` swap frame with the title **"NOT THE 38TH PARALLEL"**.
- **`POSTING.md` Shorts title:** replace "Two Americans split Korea with a National Geographic map" with:
  > How two Americans picked Korea's dividing line with a National Geographic map

  "Split Korea" isn't what SOURCES supports for the 1945 night, and the video itself places the split in 1948.

### 5. Add a familiar scale anchor (+1 to +2: F scale 1 → 2–3; needs a new sourced fact)
- Add the CIA World Factbook "Area – comparative" line for North and/or South Korea to SOURCES.md, with the quote and URL.
- Then show it as a 1.2 s `callout` on the `japan` or `states` beat, for example "South Korea ≈ size of [state per Factbook]". Or, if the data allows, use a `ghost` of that US state.
- **Don't write the comparison until it's sourced.** No guessing from memory.
- Watch the length: put it on screen only, with no new spoken words. The video is at 57.3 s.

**Expected with 1, 2 and 4: about 92/100. With all five: about 94.** Beyond that, the remaining points (a real face, human stakes) need new sourced material, such as a PD photo of Bonesteel, or a hedged figure for divided families or war casualties.

## 3 alternative hooks (all true per SOURCES.md)
| Archetype | Verbal line (0–2 s) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **A. Myth-bust / contradiction** | "Korea's border isn't the 38th parallel. Hasn't been since 1953." | The swap frame (`k3_50.8`): today's red/blue, the white 1953 line, the yellow 38°N, Kaesong and Sokcho pointed | `NOT THE 38TH PARALLEL` |
| **B. Question (straight line)** | "Why was Korea split along a perfectly straight line?" | The 1945 red/blue zones plus the yellow 38°N stroke (change 2 frame 0) | `WHY A STRAIGHT LINE?` |
| **C. In-media-res + number** | "One night in 1945, two Americans pick Korea's dividing line from a National Geographic map." | The current frame 0 (or the change 2 version) with the map sticker from frame 0 | `ONE NIGHT. ONE MAP.` |

Guardrails:
- No "30 minutes", and no date more precise than "1945" or "August 1945".
- Say "dividing line", "zone line" or "the 38th parallel", never "the border Korea still has".
- For A, the loop line becomes "So where *was* the line? It all started with…". Re-measure SSIM against the new frame 0.
- For B, "split" is fine as the question, because the video then explains the 1945 zones and the 1948 states.

## Cover, caption, hashtags, pinned comment
- **Cover:** keep the current composition (1945 zones, title, badge) and add the sub-line from change 4. The A/B variant is the 50.8 s swap frame titled "NOT THE 38TH PARALLEL".
- **Caption:** keep the current text, which is already correct.
  > One night in 1945, two Americans picked Korea's dividing line using a National Geographic map: the 38th parallel.

  > How the line became a border, a war, and a DMZ that no longer follows the 38th parallel.

  > REDRAWN ep. 4 — map history in under a minute. Sources in the pinned comment.
- **Hashtags (5):** `#KoreanWar #38thParallel #history #maps #geography`
- **Pinned comment:** keep the current text, which ends with *"Kaesong went North, Sokcho went South. Which surprised you more: the straight line, or that it moved?"*
- **Day-2 replies:**
  - "Which straight-line border should we redraw next?"
  - A ready answer for "Kaesong is right on the line": "Kaesong city sits just south of 38°N (about 37.97°N), so it was in the US zone in 1945 and has been in North Korea since 1953."

## Platform notes
- **TikTok:** 57 s, a seamless loop (SSIM 0.956) and no end card is the right shape.
  - Don't add spoken words.
  - Keep "38th parallel" on screen and in caption line 1, for search.
  - Change 1 is a free fix before posting.
- **Instagram Reels:** ranks on sends and saves.
  - The swap frame (about 2.8 s) and "No peace treaty / STILL" are the DM moments, and the swap frame is the save.
  - Upload `cover_3x4.jpg` with the sub-line.
  - Post natively with no TikTok watermark, and keep the keywords before the hashtags.
- **YouTube Shorts:** frame 0 and the title decide.
  - Use the corrected title from change 4, and put the sources in the description.
  - Shorts is where change 2 (a red/blue frame 0) pays off most. Hook **A** is the best separate test upload, titled "Korea's border isn't the 38th parallel".

VIRALITY SCORE: 88/100 (8.8/10) — strong breakout odds
