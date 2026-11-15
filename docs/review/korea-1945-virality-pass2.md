# Virality review: korea-1945 (REDRAWN EP 4), pass 2

Video: `out/korea-1945.mp4` (57.3 s, 1080×1920; cue timeline 56.71 s).
Evidence used:
- `python3 pipeline/virality_metrics.py korea-1945`, run fresh.
- All 6 hook frames (0–3 s) and `loop_first_vs_last.jpg`.
- The fresh beat sheets and `cues.md` (not regenerated).
- `episode.json`, `SOURCES.md` and `timings.json` (word starts).
- `deliverables/korea-1945/POSTING.md`, `cover_9x16.png`, `cover_3x4.jpg`.
- Pass 1 (`docs/review/korea-1945-virality-pass1.md`).
- Extra frames in `/tmp/claude-0/virality-tmp/`, prefix `k2_`: 2.0, 3.9, 4.6, 30.0, 46.6, 48.4, 49.6, 50.6, 51.5, 54.6, 55.2 s. Strips: `k2_s_misc.jpg`, `k2_s_swap.jpg`. Cover preview: `k2_cover916.jpg`.

> This is a pattern-based estimate against `docs/VIRALITY_PLAYBOOK.md`, not a prediction. Creator account size and how the first test cohort responds are the biggest factors, and we can't control either.

## Key metrics (pass 1 → pass 2)
| Metric | Pass 1 | Pass 2 | Read |
|---|---|---|---|
| Duration / words / pace | 54.0 s · 140 · 2.82 w/s | 57.3 s · 147 · 2.78 w/s | In band. The video is near the 58 s ceiling, so don't add more words. |
| Hook length | 3.94 s | **5.08 s** | "1945." is held for 1.17 s (0.80–1.97), and "map." only lands at 4.93 s. |
| Number in hook | false | **true** | The year is now in sentence 1. |
| Cues / 10 s | 6.9 | 6.8 | Flat. |
| Longest gaps | 3.50 · 3.01 · 2.84 s | **4.68 s @ 0.25** · 3.25 s @ 48.73 · 3.20 s @ 45.53 | The states plateau and the Japan gap are fixed. Two gaps are new: one in the hook and one in the swap beat. 3 of 29 windows are empty. |
| Loop SSIM | 0.884 | **0.898** | Full marks. |
| Loudness | −14.2 | −14.3 LUFS | ok |

## What I saw on screen
- **Frame 0** (`hook_0`) shows the title "HOW ONE LINE SPLIT KOREA", the yellow 38°N stroke already drawn across a brown peninsula, a map emoji, and "REDRAWN · EP 4". Change 1 worked, and the frame reads paused and muted. It is still a single colour, though: the red/blue split (the cover image) doesn't appear until 25 s.
- **The hook's pictures are out of sync with its words** (`k2_s_misc.jpg`):
  - The map sticker shows during "One night in 1945" and is **gone by "National"** (3.85 s): it's held 0.25 → 2.85 s.
  - "Two Americans" has no visual at all.
  - The 38°N stroke (hold 4.0) has **faded by "Geographic"** (`k2_4.6`). The word "map." lands on a bare brown peninsula, and the pen appears to its left.
  - Result: the 4.7 s "nothing new" stretch sits right where the hook should be busiest.
- **Japan, Soviets, order, line, Seoul/Moscow:** these are now dense. The "Japanese rule" card and the pulse filled the old gap.
- **States** (`beat_07`, `k2_30.0`): the "Temporary zones" card, then the "HARDENS" stamp, then the white seam, then the flags, regions and the "Each claims all of Korea" card. The old 3.5 s plateau is gone, and "But in 1948" now works as a re-hook at 52 %.
- **Armistice:** the spoken question ("And when the 1953 armistice draws a new line?") now sets up the twist. The yellow 38°N stroke and the white "1953 line" are on screen together, with the DMZ card. Good.
- **Swap** (`k2_s_swap.jpg`): change 5 is **only half applied**.
  - The 38°N stroke and the 1953 line stay up, and Sokcho visibly sits above 38°N (`k2_49.6`). That frame verifies the claim.
  - But the Kaesong pointer (hold 2.8) disappears at 48.3 s, before Sokcho appears at 48.73 s. **No frame shows both cities**, so there is still no single screenshot-and-send frame.
  - The 38°N stroke also leaves at 50.9 s, before "is now in the South."
  - These two holds are why the metric finds 3.2 s + 3.25 s with nothing new: the pointer is the only cue in each half of the beat.
- **Treaty:** the "No peace treaty" card with the "STILL" stamp is strong.
- **Loop:** "Still divided. And it all started with…" leads into "One night in 1945…". The single-cause problem is fixed. The end frame is the brown peninsula with the yellow stroke, which matches frame 0 (SSIM 0.898). The timeline differs (the dot is at 1953 at the end and at 1900 on frame 0), but that's minor.
- **Trust:**
  - "entering" matches SOURCES.
  - "So in 1950" is logged in SOURCES as narrative linkage, not a cause.
  - The night stays dated as "1945" only, and there's no "30 minutes".
  - One caption phrase in POSTING.md is slightly stronger than the video. See change 5.

## Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **21/25** | **Frame 0 (6/8):** the yellow line, title and peninsula are legible paused. It's brown on navy with no colour contrast, and a bit less striking than the cover. **Payload (5/7):** "One night in 1945" plus "Two Americans" plus "One … map" is a concrete triad with a number. The stake ("split Korea") is only in the on-screen text, and the strongest word ("National Geographic map") arrives at 3.9–5.3 s, after the 3 s window. **Place (5/5).** **Text (3/3):** 5-word title. **Throat-clearing (2/2).** |
| B. Retention | **19/25** | **Cue density (5/8):** 6.8 per 10 s. There are still three gaps over 2.5 s; the 4.7 s one sits in the hook, the worst possible place. **Escalation (5/6):** the middle now runs but → so → and-when, and it no longer plateaus. **Re-hook (3/4):** "But in 1948" at 52 % plus the armistice question at 70 %. **Payoff (3/4):** both payoffs land, but the swap proof is split across two frames. **Pace (3/3):** 2.78 w/s, with 1–3-word captions. |
| C. Rewatch & loop | **10/10** | **Line (5/5):** "And it all started with…" leads into "One night in 1945…". **SSIM 0.898 (3/3).** **Pause frames (2/2):** the 1945 zones, the armistice frame with both lines, and "No peace treaty / STILL". |
| D. Shareability & saves | **11/15** | **Send (5/6):** "two Americans and a National Geographic map", "it's not the 38th parallel" and "no peace treaty". The map is still only said, never shown. **Save (3/4):** the 49.6 s frame (38°N, 1953 line, Sokcho) is nearly a reference frame, but Kaesong is missing. **Comment (2/3):** the pin question in POSTING.md and SOURCES is still the yes/no "Did you know the border moved?". **Human (1/2):** small Rusk card only. |
| E. Packaging | **9/10** | **Cover (3/4):** the red/blue zones, yellow "38th parallel", title and series badge are clean, and survive the 3:4 crop. But the "ONE NIGHT. ONE MAP." sub-line is missing, and the bottom 40 % of the 9:16 is empty navy. **Caption (3/3):** keywords plus 5 hashtags. **Series (3/3).** |
| F. Niche codes & trust | **11/15** | **Transformation (4/4):** brown to red/blue, then 1945 to 1953. **Scale anchor (1/3):** the DMZ is given in miles, but there's no familiar comparison (a real one needs a new sourced fact). **Face (2/3):** Rusk only. **Sourced/hedged (3/3):** the loop and "entering" are fixed, and the hedges are exemplary. **Anti-patterns (1/2):** a 4.7 s stretch in the hook with no new visual. |
| **TOTAL** | **81/100 · 8.1/10** | **Tier: can break out** (up from 75) |

Most of what's left is **timing and holds on cues that already exist**, not script or facts. Fixing them would put the video at the top-decile threshold.

## Top 5 changes, ranked by expected gain (no new facts needed)

### 1. Finish the swap frame: both cities, both lines, no gaps (+3: B density +1, B payoff +1, D save +1)
Keep Kaesong pointed until the beat ends. Keep 38°N up through "South.". Pulse each side on the word that names it. `"North."` and `"South."` (with a full stop) are distinct tokens from `"North,"` and `"South,"`, so each pulse fires once.
```json
// armistice: 38°N stroke, hold 6.9 → 8.2 (lasts until 52.2 s, past "South." at 51.3)
{"type": "path", "coords": [[124.55, 38.0], [128.75, 38.0]], "color": "#FFC94D", "width": 4,
 "dur": 0.6, "hold": 8.2, "label": "38°N", "labelAt": [124.9, 38.25], "atWord": "not"}
```
```json
// swap actions
{"type": "chapter", "emoji": "red_question_mark", "text": "Swapped"},
{"type": "pointer", "at": [126.55, 37.97], "text": "Kaesong", "from": [-230, -160], "atWord": "Kaesong,", "hold": 6.0},
{"type": "pointer", "at": [128.59, 38.21], "text": "Sokcho", "from": [200, 160], "atWord": "Sokcho,", "hold": 3.0},
{"type": "pulse", "ids": ["DPRK"], "atWord": "North."},
{"type": "pulse", "ids": ["ROK"], "atWord": "South."}
```
Result:
- New cues land at 45.5, 48.0, 48.7 and 51.3 s, so no gap is over 2.6 s.
- The 50–51 s frame shows the old line, the new line, Kaesong below 38°N in red, and Sokcho above it in blue. That's the send-and-save frame, and it can double as the second cover (section 4).

### 2. Sync the hook's pictures to its words (+2 to +3: B density +1, F anti-pattern +1, A payload +0–1)
Each noun gets its image on the word. The yellow line stays until the beat ends.
```json
{"id": "hook", "actions": [
  {"type": "path", "coords": [[124.55, 38.0], [128.75, 38.0]], "color": "#FFC94D", "width": 9,
   "from": 1, "dur": 0.1, "hold": 5.4, "label": "38°N", "labelAt": [129.3, 38.25], "atTime": 0},
  {"type": "sticker", "emoji": "world_map", "x": 830, "y": 1010, "size": 170, "atTime": 0, "hold": 1.9},
  {"type": "sticker", "flag": "us-48", "x": 830, "y": 1010, "size": 130, "atWord": "Two", "hold": 1.3},
  {"type": "sticker", "emoji": "world_map", "x": 830, "y": 1010, "size": 190, "atWord": "National", "hold": 1.6},
  {"type": "sticker", "emoji": "fountain_pen", "x": 250, "y": 1010, "size": 150, "atWord": "map.", "hold": 1.4, "tilt": -20}
]}
```
- New cues land at 0, 2.3, 3.85 and 4.93 s, so the longest gap drops to about 2.3 s.
- The US flag is already the 48-star version used in the `order` beat.
- Optional: shorten the 1.17 s held "1945.". In TTS, a comma instead of a full stop ("One night in 1945, two Americans, one National Geographic map.") usually trims about 0.4–0.6 s, and the hook gets closer to 4.5 s. The facts are identical, but re-check the pronunciation by ear.

### 3. Give frame 0 the red/blue contrast (+2: A frame 0 +2; re-measure SSIM)
Frame 0 is the only part of the hook still below the cover's quality. Open on the 1945 zones (it's a title frame, and it shows exactly what the title says). Then reset to brown when Japan's story starts, and end the loop on the same zones.
```json
// hook: add
{"type": "declare", "id": "KOREA_S38", "noLabel": true, "atTime": 0},
{"type": "declare", "id": "KOREA_N38", "noLabel": true, "atTime": 0}
// japan: add, so the story still starts brown and the 25 s transformation is kept
{"type": "recolor", "ids": ["KOREA_N38", "KOREA_S38"], "atWord": "Japan,"}
// loop: remove the "recolor" action; keep conceal / reveal / path at "started"
```
- If `declare` animates in from the start colour, check whether it accepts `from: 1`, as `path` does. Otherwise frame 0 shows a half-faded colour.
- Re-run `virality_metrics.py` and keep this change only if loop SSIM stays ≥ 0.85. Both ends should then be red/blue with yellow, so SSIM should hold.
- Accuracy: the 38°N zones are the August 1945 division, which is exactly what the title frame claims, so the change is safe.

### 4. Finish the cover: add the hook sub-line (+1: E cover)
- Add **"ONE NIGHT. ONE MAP."** in brand yellow, about 90 px tall:
  - on `cover_9x16.png`, in the empty band at y ≈ 1250–1400;
  - on `cover_3x4.jpg`, just under the title (keep it inside the centre crop).
- It's true per SOURCES, it's under 7 words, and it gives the scroller the "how" as well as the "what".
- Make the A/B variant from the change 1 frame: title **"NOT THE 38TH PARALLEL"** over the frame with both lines and both cities.

### 5. Sharpen the pin and tone down the caption claim (+1: D comment; also protects trust)
- **Pin (POSTING.md, mirrored in SOURCES "Pinned comment (EN)"):** replace the closing line with
  *"Kaesong went North, Sokcho went South. Did you know the border moved, or did you think it was still the 38th parallel?"*
  It's an either/or with a real answer, so it's easier to reply to than yes/no.
- **Caption line 1:** "two Americans used a National Geographic map to split Korea at the 38th parallel" makes it sound as if the two officers *split Korea*. SOURCES supports something narrower: they *proposed the zone line*. The split came with the 1948 states, as the video itself says. Use:
  > One night in 1945, two Americans picked Korea's dividing line using a National Geographic map.

  It's the same hook strength, and it gives history commenters nothing to correct.

**Expected with 1–5: about 88–90/100 (strong breakout odds).** Beyond that, every gain needs new sourced facts:
- **Scale anchor (+1–2):** the CIA World Factbook "Area – comparative" for both Koreas, then a `ghost` of that US state.
- **Showing the actual National Geographic map (+1 D send):** only with a PD or LoC scan, credited, as an `archive` card. Never an AI "archive" image.
- **Human stake (+1):** a sourced divided-families figure or a war casualty range, hedged.

## 3 alternative hooks (all true per SOURCES.md)
| Archetype | Verbal line (0–2 s) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **A. Myth-bust / contradiction** | "Korea's border isn't the 38th parallel. It hasn't been since 1953." | The change 1 frame: red/blue today, white 1953 line, yellow 38°N, Kaesong and Sokcho pointed | `NOT THE 38TH PARALLEL` |
| **B. Question (straight line)** | "Why was Korea split along a perfectly straight line?" | The 1945 red/blue zones with the yellow 38°N stroke (change 3 frame 0), plus the pen sticker | `WHY A STRAIGHT LINE?` |
| **C. In-media-res + number** | "One night in 1945, two Americans picked Korea's dividing line from a National Geographic map." | The change 3 frame 0 with the map sticker enlarged next to the line | `ONE NIGHT. ONE MAP.` |

Guardrails:
- No "30 minutes", and no date more precise than "1945" or "August 1945".
- Say "dividing line" or "the 38th parallel", never "the border Korea still has".
- For A, the loop line becomes "So where *was* the line? It all started with…". Re-measure SSIM if the first frame changes.

## Cover, caption, hashtags, pinned comment
- **Cover:** keep the current composition (the 27 s 1945-zones frame plus the title). Add "ONE NIGHT. ONE MAP." (change 4). The variant is the 50.5 s frame once change 1 is made, titled "NOT THE 38TH PARALLEL".
- **Caption:**
  > One night in 1945, two Americans picked Korea's dividing line using a National Geographic map.

  > The 38th parallel explained: Dean Rusk and Charles Bonesteel, US and Soviet zones, two rival Koreas in 1948, the Korean War, and why the DMZ isn't the 38th parallel.

  > REDRAWN ep. 4. Map history in under a minute. Sources in the pinned comment.
- **Hashtags (5):** `#KoreanWar #38thParallel #history #maps #geography` (unchanged).
- **Pinned comment:** keep the current sources text, and end with the either/or question from change 5. Save "Which straight-line border should we redraw next?" as a day-2 reply.

## Platform notes
- **TikTok:** 57 s, a seamless loop and no end card is the right shape.
  - Don't add words; the video is already near the 58 s ceiling. If a trim is needed, set `maxPause` 0.34 → 0.28 and use the change 2 comma before cutting any line.
  - Keep "38th parallel" both on screen and in caption line 1 or 2, so TikTok search picks it up.
- **Instagram Reels:** ranks on sends.
  - The change 1 swap frame and "No peace treaty / STILL" are the DM moments. Each should hold ≥ 1.5 s, and after change 1 the swap frame holds about 3 s.
  - Upload `cover_3x4.jpg` with the sub-line, post natively with no watermark, and put the keywords before the hashtags.
- **YouTube Shorts:** frame 0 decides.
  - Change 3 (a coloured frame 0) matters most here.
  - Test hook **A** as a separate upload with the title "Korea's border isn't the 38th parallel", and put the sources in the description.
  - Shorts tolerates the 57 s length, but the first 3 s need the full stake. Hook B or C does better here than the current three-fragment line.

VIRALITY SCORE: 81/100 (8.1/10) — can break out
