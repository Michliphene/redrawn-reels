# Virality review: korea-1945-v2 (REDRAWN EP 4, DA 2 remaster), pass 1

Video: `out/korea-1945-v2.mp4` (57.3 s, 1080×1920; cue timeline 56.71 s). Voice shared with `korea-1945` (`audio`),
so **any spoken change means re-recording both cuts' shared voice** (flagged where it applies).

Evidence used:
- `python3 pipeline/virality_metrics.py korea-1945-v2`, run fresh.
- All 6 hook frames and `loop_first_vs_last.jpg`.
- All 13 beat sheets and `cues.md`, regenerated with `pipeline/review_frames.py`.
- Extra frames at 19.2, 31.8, 33.0, 44.6, 50.5 and 56.68 s.
- `episode.json`, `SOURCES.md`, `korea-1945/timings.json` (word starts).
- `docs/REVIEW_korea-1945-v2.md` and `docs/review/korea-1945-virality-pass3.md` (the DA 1 score: 88).

> This is a pattern-based estimate against `docs/VIRALITY_PLAYBOOK.md`, not a prediction. Creator account size and the
> first test cohort are the biggest factors, and we can't control either.

## Key metrics
| Metric | Value | Read |
|---|---|---|
| Duration / words / pace | 57.3 s · 147 · 2.78 w/s | In band |
| Hook length | 5.08 s | Long: "map." lands at 4.93 s. The voice is fixed, so this is accepted. |
| Cues / 10 s | 7.3 | Good for a map reel |
| Longest gaps | 3.05 s @ 18.51 · 2.62 s @ 2.31 · 2.57 s @ 48.73 | The 0.25–2.31 gap is covered by the opening crane move. The other two are real (change 1). |
| Empty 2 s windows | 2 / 29 | Both close with JSON only |
| Loop SSIM | **0.860** | Just over the 0.85 bar |
| Loudness | −14.3 LUFS | ok |

## What I saw
- **Frame 0** (`hook_0`): this is a real DA 2 opener.
  - A raised 3D peninsula with depth and shadow, the gold 38°N bar across it, the title "HOW ONE LINE SPLIT KOREA" and the REDRAWN EP 4 badge.
  - It reads paused and muted.
  - Weakness: it's one colour (brown on navy), so the "split" is only implied by the bar.
- **0–3 s:** the crane tilts from 0 to 1.5 s, the 38°N label appears, the whisper reads "drawn in one night, on a magazine map", and captions run word by word.
  - "Two Americans" gets a pulse.
  - "National Geographic map" (3.58–4.93 s) has nothing new on screen; only the whisper carries it.
- **3D world:** it pays off from 24 s. The zones lift in blue (US) and red (Soviet).
  - The white "hardens" bar at 31.3 s now sits *on* the pieces (the pass-2 fix worked).
  - The camera **cut on "temporary"** (27.6 s, 48 %) is a proper mid-reel re-hook.
- **Payoff frame (50.5 s):** this is the screenshot frame.
  - Red/blue, the gold 38°N bar, the white 1953 line and the "Swapped" chapter.
  - Kaesong is pointed in the red and Sokcho in the blue.
  - Flaw: the white 1953 line renders as a ragged white fringe ("teeth" along the seam) rather than a clean stroke. It reads as a line at full size but as noise at thumbnail size.
- **Collisions:**
  - 32.2–33.5 s: the "Pyongyang" marker label is drawn over the white hardens bar.
  - 44.6 s: the DMZ card sits on the South, not on the lines (fine).
- **Gaps:**
  - 18.5 → 21.6 s: the callout ends at 20.1 and the camera settles at 19.0, so nothing new until "straight".
  - 48.7 → 51.3 s: the Sokcho pointer, then nothing until the ROK pulse on "South." (now firing correctly at 51.30 s).
- **Loop:** the last frame shows brown, the gold bar and the title back, with "AND IT ALL STARTED WITH…", leading into "One night in 1945…". It's seamless.
- **Trust:**
  - Every on-screen figure is in SOURCES: 1910, Aug 1945, 1948, 25 Jun 1950, 27 Jul 1953, DMZ ≈2.5 × ≈155 mi, and Kaesong 37.97°N / Sokcho 38.21°N.
  - "One night" and "National Geographic map" are Rusk's own account. The disputed date is avoided ("1945" only), and "30 minutes" isn't used.
  - "So in 1950, the North invades" is logged as narrative linkage, not a cause.
  - **No deliverables exist yet for v2** (`deliverables/korea-1945/` holds the DA 1 cover and kit). The DA 1 Shorts-title overclaim noted in pass 3 must not be carried over.

## Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **21/25** | **Frame 0 (6/8):** a true 3D object with the title on it, but one colour, so no visible split. **Payload (5/7):** "1945" plus "Two Americans" inside 3 s. The best noun ("National Geographic map") lands at 3.9–4.9 s, and "split" is never spoken. **Place (5/5):** KOREA is in the title, and the peninsula shape is unmistakable. **Text (3/3):** 5-word title plus the whisper. **No throat-clearing (2/2).** |
| B. Retention | **23/25** | **New visual ≤2.5 s (7/8):** 7.3 cues/10 s plus a camera move per beat, but two real gaps of about 2.5–3 s (18.5 and 48.7 s). **Escalation (5/6):** but → so → and-when runs well from 1948. 12–24 s is linear setup. **Re-hook (4/4):** cut plus "But in 1948" at 48 %, and the armistice question at 70 %. **Payoff (4/4):** the swap frame shows both lines and both cities. **Pace (3/3).** |
| C. Rewatch & loop | **10/10** | **Line (5/5):** "And it all started with…" leads into "One night in 1945". **SSIM 0.860 (3/3).** It's just over the bar, so keep the frame-0 composition in sync if anything changes. **Pause frames (2/2):** armistice, swap, and "No peace treaty / STILL". |
| D. Shareability & saves | **14/15** | **Send (6/6):** "picked from a magazine map" plus "it's not even the 38th parallel any more". **Save (4/4):** 1945 vs 1953 lines on one frame. **Comment (3/3):** the either/or pin in SOURCES. **Human (1/2):** a small Rusk card only, with no human cost. |
| E. Packaging | **9/10** | Scored on the best version written below, since v2 has no kit yet. **Cover (3/4):** frame 0 reads, but it's one colour. The swap frame is stronger but busy. **Caption (3/3)**, written below. **Series (3/3):** the badge stays on throughout. |
| F. Niche codes & trust | **12/15** | **Transformation (4/4):** brown, then zones, then 1953 line, then back. **Scale anchor (1/3):** miles, but no familiar comparison. **Face/stakes (2/3):** Rusk only, labelled "photo: 1961". **Sourced/hedged (3/3).** **Anti-patterns (2/2):** two small label collisions, none fatal. |
| **TOTAL** | **89/100 · 8.9/10** | **Tier: strong breakout odds.** One point above the DA 1 cut (88), from the in-world camera re-hook. |

## Top 5 changes, ranked by expected gain

### 1. Close the two gaps and clear the Pyongyang collision: JSON only (+1: B density 7 → 8)
`line` beat: keep the callout up to "use." and give "So" a beat of its own.
```json
{"type": "callout", "text": "No river · no mountains", "size": 48, "y": 880, "atWord": "river,", "hold": 2.3},
{"type": "pulse", "ids": ["KOREA_N38", "KOREA_S38"], "atWord": "So"}
```
The longest gap drops from 3.05 s to about 0.7 s.

`swap` beat: the Sokcho half has no proof cue. Pulse the North on "North," (the exact token, with its comma, matches only the second sentence, at 50.16 s).
```json
{"type": "pulse", "ids": ["DPRK"], "atWord": "North,"}
```
The gap of 2.57 s splits into about 1.4 s and 1.1 s.

`states` beat: the white hardens bar should leave as the city markers arrive.
```json
{"type": "path", "coords": [[124.55, 38.0], [128.75, 38.0]], "color": "#FFFFFF", "width": 8, "dur": 0.4, "hold": 0.85, "atWord": "hardens:"}
```
The red/blue seam keeps carrying the line after 32.2 s.

### 2. Red/blue frame 0 while keeping the brown story: component change (+2: A frame 0 6 → 8; re-measure SSIM)
This is still blocked in code, as in DA 1 pass 3. `fillAt` (`src/components/MapLayer.tsx`, also used by `src/atlas/Map3D.tsx`) takes the **first** `declare` per id and the **first** `recolor`, and every declare flashes cream.

The change:
- Resolve the **latest** declare or recolor with `a.t <= t`.
- Add `declare.instant: true`, which skips the flash.

Then:
```json
// hook: add
{"type": "declare", "id": "KOREA_N38", "noLabel": true, "instant": true, "atTime": 0},
{"type": "declare", "id": "KOREA_S38", "noLabel": true, "instant": true, "atTime": 0}
// japan: add, so the story starts brown and the 24-27 s transformation is kept
{"type": "recolor", "ids": ["KOREA_N38", "KOREA_S38"], "atWord": "Japan,"}
// loop: remove the "recolor" action, so the last frame = red/blue 1945 zones + gold bar + title, like frame 0
```
- Accurate: the 38°N zones are the August 1945 division the title frame describes.
- Keep it only if loop SSIM stays ≥ 0.85. Both ends would match, so it should rise.
- Test it first as a Shorts A/B, since frame 0 matters most there.

### 3. Build the v2 posting kit, with an honest cover and title (+1: E cover 3 → 4)
- **Cover A (main):** the 50.5 s swap frame. Hide the caption band and add **"NOT THE 38TH PARALLEL"** in Display, in the empty band at y≈1150–1350, inside the safe area.
- **Cover B:** frame 0 plus the sub-line **"ONE NIGHT. ONE MAP."**
- **Shorts title:** "How two Americans picked Korea's dividing line with a National Geographic map". Do **not** reuse "Two Americans split Korea…": the split SOURCES supports dates from 1948, not that night.

### 4. Add a familiar scale anchor, only once it's sourced (+1 to +2: F scale 1 → 2–3)
- Add the CIA World Factbook "Area – comparative" line for South and/or North Korea to SOURCES.md, with the quote and URL. (A US-state comparison exists there, but verify the exact wording; don't write it from memory.)
- Then add one on-screen-only callout on `states` around 34.3 s. It could replace "Each claims all of Korea" for 1 s, or go on `seoul`.
- Example: `{"type":"callout","text":"South Korea ≈ <Factbook comparison>","y":1050,"size":46,"atWord":"peninsula.","hold":1.0}`.
- No new spoken words, so no re-recording.

### 5. Speak the stake inside 3 s (+1: A payload 5 → 6). **Needs re-recording the shared voice.**
The facts are identical to SOURCES row "The line":
```json
{"id": "hook", "say": "One night in {1945|nineteen forty-five}, two Americans pick Korea's dividing line from a National Geographic map."}
```
- This changes `korea-1945/timings.json` and so also changes the DA 1 cut.
- Every `atWord`/`atTime` in both episodes must be re-checked: `Two` becomes `two`, and the hook `pulse @ map.` still matches.
- Only worth it if the owner plans a fresh upload of both cuts. Otherwise skip it: the current triad still lands "1945" plus "two Americans" in 2.5 s.

**Expected:** 1 + 3 gives about 91. Add 2 for about 93, and 4 + 5 for about 95. Beyond that you'd need a real human stake: a PD photo of Bonesteel, or a sourced, hedged figure for divided families.

## 3 alternative hooks (all true per SOURCES.md; any new line needs a re-record)
| Archetype | Verbal line | Frame-0 visual | On-screen text |
|---|---|---|---|
| **Myth-bust** | "Korea's border isn't the 38th parallel. It hasn't been since 1953." | The 50.5 s swap frame: both lines, Kaesong and Sokcho pointed | `NOT THE 38TH PARALLEL` |
| **Question / straight line** | "Why was Korea divided along a perfectly straight line?" | The red/blue 1945 zones plus the gold bar (change 2) | `WHY A STRAIGHT LINE?` |
| **In-media-res + stake** | "One night in 1945, two Americans pick Korea's dividing line from a National Geographic map." | The current frame 0 | `ONE NIGHT. ONE MAP.` |

Guardrails:
- No "30 minutes", and no date more precise than "1945" or "August 1945".
- Say "dividing line" or "zone line", never "drew today's border".
- For the myth-bust hook, the loop line becomes "So where was the line drawn first? It all started with…". Re-measure SSIM.

## Cover, caption, hashtags, pinned comment
- **Cover:** cover A from change 3, with frame 0 plus "ONE NIGHT. ONE MAP." as the A/B.
- **Caption:**
  - Line 1 (≤150 chars): "One night in 1945, two Americans picked Korea's dividing line using a National Geographic map: the 38th parallel."
  - Line 2: "How a temporary line became two states, the Korean War and a DMZ that no longer follows the 38th parallel."
  - Line 3: "REDRAWN ep. 4: map history in under a minute. Sources in the pinned comment."
- **Hashtags:** `#KoreanWar #38thParallel #history #maps #geography`
- **Pinned comment:** the SOURCES.md text, ending with "Kaesong went North, Sokcho went South. Which surprised you more: the straight line, or that it moved?"
- **Ready reply for "Kaesong is on the line":** "Kaesong sits just south of 38°N (about 37.97°N), so it was in the US zone in 1945 and has been in North Korea since 1953."

## Platform notes
- **TikTok:** 57 s, a seamless loop and no end card is the right shape. Apply change 1 before posting (it's free). Keep "38th parallel" in caption line 1 and on screen, for search. Don't stretch it to 61 s+; this edit has no spare beat.
- **Instagram Reels:** ranks on sends and saves. The swap frame and "No peace treaty / STILL" are the DM moments. Post natively with no watermark, use cover A in the 3:4 grid crop, and put keywords before the hashtags.
- **YouTube Shorts:** "viewed vs swiped" is decided at frame 0. That's where change 2 (red/blue frame 0) pays off most. Use the corrected title from change 3 and put the sources in the description. The myth-bust hook is the best separate test upload, but it needs a re-record.

VIRALITY SCORE: 89/100 (8.9/10) — strong breakout odds
