# Virality review: korea-1945 (REDRAWN EP 4), pass 1

Video: `out/korea-1945.mp4` (54.0 s, 1080×1920).
Evidence used:
- `python3 pipeline/virality_metrics.py korea-1945`, run fresh.
- All 6 hook frames (0–3 s) and `loop_first_vs_last.jpg`.
- The 13 beat sheets and `cues.md`. They were fresh, so I did not regenerate them.
- `episode.json`, `SOURCES.md`, and the EP 3 virality passes 1–3 for series context.
- Extra frames in `/tmp/claude-0/virality-tmp/`, all prefixed `k1_`: 0.0 s (also full-res `k1_f0full.jpg`), 2.6, 3.6, 8.8, 9.8, 27.4, 29.5, 30.8, 40.0, 42.6, 45.3, 47.6, 50.6 and 53.3 s. The strips are `k1_s1.jpg`, `k1_s2.jpg` and `k1_s3.jpg`.
- No cover, POSTING.md or caption exists yet. Section 4 proposes them, and block E scores the proposed version, as the brief says.

> This is a pattern-based estimate against `docs/VIRALITY_PLAYBOOK.md`, not a prediction. The biggest factor is one we can't control: account size and how the first test cohort responds.

## Key metrics
| Metric | Value | Read |
|---|---|---|
| Duration / words / pace | 54.0 s · 140 words · 2.82 w/s | Mid-band. There is about 0.4 w/s of headroom, unlike EP 3. |
| First word / hook length | 0.25 s / 3.94 s | "Two Americans. One National Geographic map. One night." It's three fragments, and the stake ("Korea split") is never said aloud. |
| Number/question in hook (metric) | **false** | "Two" and "One" are counting words, not a payload number. The voice never says the year, the place or the stake. |
| Cues / 10 s | 6.9 (37 cues) | Below EP 3 (8.9). |
| Longest gaps | **3.50 s** at 28.4 · **3.01 s** at 7.5 · **2.84 s** at 1.4 | Three gaps over 2.5 s. One of them is **inside the hook**, and the 28.4 s one breaks the ">3 s with nothing new" anti-pattern. 3 of 27 two-second windows are empty. |
| Loop SSIM | 0.884 | Full marks (≥ 0.85). |
| Loudness | −14.2 LUFS | ok |

## What I saw on screen
- **Frame 0** (`hook_0`, `k1_f0full`) shows the title "HOW ONE LINE SPLIT KOREA" (5 words), a brown Korea silhouette, a hairline seam at 38°N, a map emoji, and a timeline parked at 1900.
  - The paused frame is clean and the place is legible.
  - But the frame has **no colour contrast and no yellow line yet**. The 38°N stroke only starts at 0.25 s and takes 2.6 s to cross.
  - The single most striking image in the video, the red/blue split under a yellow straight line (`k1_27.4.jpg`), never appears in the first 3 s.
- **1.4 → 4.24 s:** after the pen sticker there is nothing new for 2.8 s while the voice says "Geographic map. One night."
- **7.5 → 10.5 s:** the "Japanese rule" card fades by about 9.0 s. "Is about to surrender" then plays over a small, static Korea (`k1_9.8.jpg`).
- **28.4 → 31.9 s:** the hourglass sticker comes in, then nothing during "the line hardens. In 1948," (`k1_29.5`, `k1_30.8`). It's the plateau at the 55 % mark, exactly where the re-hook should sit.
- **Armistice:** the 1953 colours swap at "new", and a white 38th-parallel stroke plus the DMZ card come in at "Not". The difference between the old and new line is real but small at span 9. It reads, just barely.
- **Swap beat:** the white 38th-parallel stroke has **gone** by the time Sokcho is pointed at (`k1_47.6.jpg`). A viewer can't see that Sokcho sits *north* of 38°N. The claim is true (SOURCES: computed 38.21°N), but it can't be checked on screen, and that is the video's best "wait, what?" moment.
- **Loop:** "Still divided. All because of…" then "Two Americans. One National Geographic map. One night." It's grammatical and closes cleanly (SSIM 0.884).
  - **But it states a single cause:** the division *today* blamed entirely on two officers and one night.
  - CLAUDE.md says "never claim a cause when causes are debated". The ongoing division also comes from the 1948 rival states, the war and the armistice, as the video itself shows.
  - This is the one line likely to draw "this is wrong" replies from history commenters. See change 4.
- **"Soviet troops are already pouring into the north"** comes *before* the order beat. SOURCES only says troops "entered northern Korea in August", and it says the night's date varies (10–11 Aug vs 14 Aug). Under the early date, "already pouring" is stronger than the sources support. Change 4 softens it at no virality cost.
- **Correctly handled already:** the "30 minutes" myth is left out, the night is dated only as "August 1945", the DMZ figures are hedged with "≈", the US flag is the 48-star version, and Rusk's photo is dated 1961 on screen.

## Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **19/25** | **Frame 0 (5/8):** the title and silhouette are clean paused and muted. But it's brown on navy, with no yellow line yet and no red/blue split, so the strongest image is held back to 25 s. **Payload (4/7):** the "two / one / one" triad has rhythm and a defined shape (who, what tool, how fast). There's no number, no place and no stake in the voice, and "split Korea" only exists as on-screen text. **Place (5/5):** a recognisable peninsula plus "KOREA" in the title on frame 0. **Text (3/3):** "How one line split Korea" (5 words) reinforces the hook. **Throat-clearing (2/2):** none. |
| B. Retention | **17/25** | **Cue density (5/8):** 6.9 per 10 s and three gaps over 2.5 s (3.5 s, 3.0 s, 2.8 s), one of them inside the hook. **Escalation (4/6):** 1945 → 1948 → 1950 → 1953 is told as "and then"; only the armistice ("Not the 38th parallel") is a real "but". **Re-hook (2/4):** "Meant to be temporary" (52 %) is a soft turn played over a dead stretch. The real twist ("not the 38th parallel") lands at 78 %, too late to work as a re-hook. **Payoff (3/4):** the hook's promise (the line) is paid at 22 s (41 %) with a good 38°N card. The second payoff (swap) is strong, but its visual proof is missing. **Pace (3/3):** 2.82 w/s, readable 1–3-word captions. |
| C. Rewatch & loop | **10/10** | **Last line → first (5/5):** "All because of…" → "Two Americans…" works mechanically (but see the trust flag in F and change 4). **SSIM 0.884 (3/3).** **Pause frames (2/2):** the red/blue 1945 zones with Seoul and the 38th, the DMZ card, and "No peace treaty / STILL". |
| D. Shareability & saves | **10/15** | **Send (5/6):** three good DM facts: "drawn by two Americans with a National Geographic map", "the border today isn't the 38th parallel", "no peace treaty was ever signed". The NatGeo map is only *said*, never shown, and the swap can't be verified on screen. **Save (2/4):** no single frame shows the 38th line *and* today's line *and* the two swapped cities together. EP 4 series cue is present. **Comment (2/3):** the current pin question ("Did you know…?") invites a yes/no, not a reply. **Human stake (1/2):** a small Rusk card, and no human cost at all (war deaths and divided families aren't in SOURCES). |
| E. Packaging | **9/10** (proposed version) | **Cover (3/4):** nothing exists yet. The composition proposed in section 4 would earn 4/4 once made, and the current frame 0 alone would only earn 2. **Caption (3/3):** the caption written in section 4 has search keywords (38th parallel, Korean War, DMZ, Dean Rusk) and 5 hashtags. **Series (3/3):** "REDRAWN · EP 4" on frame 0 and on the end frame. |
| F. Niche codes & trust | **10/15** | **Transformation (4/4):** brown → blue/red at 25–27 s is unmistakable, and 1945 → 1953 recolours again. **Scale anchor (1/3):** DMZ "≈ 2.5 miles wide · ≈ 155 miles long" is imperial, but there's no familiar US/UK comparison. **Face/stakes (2/3):** Rusk portrait, small and brief; no Bonesteel card (correctly, since no PD photo). **Sourced/hedged (2/3):** the exclusions and hedges are exemplary, but "All because of…" is a single-cause claim and "already pouring" outruns SOURCES. **Anti-patterns (1/2):** one 3.5 s stretch with nothing new. |
| **TOTAL** | **75/100 · 7.5/10** | **Tier: can break out** |

The topic is stronger than the packaging. "Two guys and a National Geographic map" plus "the border isn't even the 38th parallel" are top-tier send triggers. Right now the first is under-sold in the hook and the second can't be checked on screen. Every point below comes from existing SOURCES facts: no new research is needed for changes 1–5.

## Top 5 changes, ranked by expected gain

### 1. Put a number and the full line in the hook (+3: A payload +2, A frame 0 +1)
**Script (facts identical to SOURCES: "August 1945", "at night", "National Geographic map"):**
- Hook: "Two Americans. One National Geographic map. One night." becomes **"One night in 1945. Two Americans. One National Geographic map."**
- The year moves into sentence 1 and makes the metric true. "One night" leads, because it's the time-pressure stake.
- Beat `japan` drops its now-redundant date and saves about 1 s. The date badge still shows AUGUST 1945, because `date: "1945-08"` stays.

**Frame 0:** make the yellow 38°N stroke land almost at once, so frame 0–0.5 s already shows the straight line across the peninsula. That also helps the loop SSIM, because the last frame has the full line.

```json
{"id": "hook",
 "say": "One night in {1945|nineteen forty-five}. Two Americans. One National Geographic map.",
 "camera": {"center": [127.6, 38.1], "span": 9},
 "date": null, "hideLocator": true,
 "actions": [
  {"type": "path", "coords": [[124.55, 38.0], [128.75, 38.0]], "color": "#FFC94D", "width": 9,
   "dur": 0.5, "hold": 3.6, "label": "38°N", "labelAt": [129.3, 38.25], "atTime": 0},
  {"type": "sticker", "emoji": "world_map", "x": 830, "y": 1010, "size": 170, "atWord": "National", "hold": 1.4},
  {"type": "sticker", "emoji": "fountain_pen", "x": 830, "y": 1010, "size": 150, "atWord": "Americans.", "hold": 1.2, "tilt": -20}
 ]}
```
```json
{"id": "japan", "say": "Japan, which has ruled Korea since {1910|nineteen ten}, is about to surrender.", "date": "1945-08", ...}
```
Notes:
- The pen-then-map order follows the new word order, so a sticker change lands every ~1 s inside the hook.
- If the renderer starts `atTime: 0` at the first word (0.25 s, per `cues.md`), frame 0 still has no stroke. In that case, check whether `path` accepts a `from` like `bigNumber` does (`from: 1` = already drawn). If it doesn't, the stroke at 0.25 + 0.5 s is acceptable.
- Keep the hook ≤ 3 s. The new line is about the same length as the old one.

### 2. Fill the three dead gaps (+2–3: B cue density, F anti-pattern +1)
All three fixes use assets already in `public/assets/emoji` and actions already in `src/lib/types.ts`.
```json
// japan: the gap from 7.5 to 10.5 s. Hold the card longer and pulse the peninsula on "surrender."
{"type": "callout", "text": "Japanese rule", "sub": "1910 – 1945", "y": 1080, "size": 64, "atWord": "ruled", "hold": 2.6},
{"type": "pulse", "ids": ["KOREA_N38", "KOREA_S38"], "atWord": "surrender."}
```
```json
// states: the gap from 28.4 to 31.9 s (the anti-pattern). Move the hourglass up, add a "temporary" card that gets stamped on "hardens."
{"type": "sticker", "emoji": "hourglass_done", "x": 860, "y": 640, "size": 120, "atWord": "temporary.", "hold": 1.4},
{"type": "callout", "text": "Temporary zones", "sub": "US · Soviet, 1945", "y": 1080, "size": 60,
 "atWord": "temporary.", "hold": 2.2, "stamp": "HARDENS", "stampWord": "hardens:", "stampSize": 44}
```
(The `atWord` tokens match the change 3 wording. If change 3 isn't applied, use `"temporary,"` and `"hardens."`.) Change 1 already fixes the hook gap. Target: longest gap ≤ 2.5 s and 0 empty two-second windows, as in EP 3.

### 3. Rebuild the middle as "but / therefore" with a re-hook at about 50 % (+2: B re-hook +1, B escalation +1)
These are wording changes only. Every claim is unchanged.
```json
{"id": "states", "say": "It's meant to be temporary. But in {1948|nineteen forty-eight}, the line hardens: two rival states, each claiming the whole peninsula.", ...}
{"id": "war",    "say": "So in {1950|nineteen fifty}, the North invades. Three years of war.", ...}
{"id": "armistice", "say": "And when the {1953|nineteen fifty-three} armistice draws a new line? It's not the 38th parallel.", ...}
```
- "But in 1948" is the re-hook, at about 52 %, right where the plateau was.
- "So … invades" works as narration linkage and stays neutral. **Do not** write "because of the line"; SOURCES gives no cause for the invasion.
- The armistice question turns the 78 % twist into a mini-hook.
- The script grows by about 4 words (+1.5 s), which change 1 offsets with −1 s. Re-check that the total stays ≤ 55 s.

### 4. Remove the single-cause loop and soften "already pouring" (+1: F hedged; protects D from "this is wrong" pile-ons)
```json
{"id": "loop", "say": "Still divided. And it all started with…", ...}
{"id": "soviets", "say": "Soviet troops are already entering the north.", ...}
```
- With change 1 in place, the loop reads: "And it all started with… one night in 1945. Two Americans. One National Geographic map."
- That is a chronology claim (true per SOURCES), not a sole-cause claim. The word order still completes, and the visual loop is unchanged.
- Move the `recolor` and `path` actions to `"atWord": "started"`.
- "Entering" matches SOURCES' "troops entered northern Korea in August" under both candidate dates for the night. **Virality never justifies the stronger version.**
- If the owner wants to keep "pouring", first add a sourced date for the Soviet landings (e.g. Britannica / a Soviet 25th Army operations reference) to SOURCES, and confirm it falls before 10 Aug.

### 5. Make the swap visible on one frame you'd pause, and sharpen the pin (+2: D save +1, D comment +1; protects D send)
Keep the white 38th-parallel stroke on screen through the whole swap beat, and keep the Kaesong pointer up until Sokcho has landed. One frame then shows the old line, today's line and both cities: the screenshot-and-send frame.
```json
{"id": "swap", "say": "Kaesong, once in the South, is now in the North. Sokcho, once in the North, is now in the South.",
 "actions": [
  {"type": "chapter", "emoji": "red_question_mark", "text": "Swapped"},
  {"type": "path", "coords": [[124.55, 38.0], [128.75, 38.0]], "color": "#FFFFFF", "width": 5, "dur": 0.01,
   "hold": 5.4, "label": "38th parallel", "labelAt": [129.0, 38.25], "atWord": "Kaesong,"},
  {"type": "pointer", "at": [126.55, 37.97], "text": "Kaesong", "from": [-230, -160], "atWord": "Kaesong,", "hold": 5.0},
  {"type": "pointer", "at": [128.59, 38.21], "text": "Sokcho", "from": [200, 160], "atWord": "Sokcho,", "hold": 2.4}
 ]}
```
Also lengthen the armistice white path `hold` from 2.6 to 3.0 so the stroke doesn't blink off and back on between beats. The pin question changes too (section 4). It should ask for an answer the video sets up, not a yes/no.

**Expected with 1–5: about 85–87/100 (strong breakout odds threshold).** Beyond that:
- A **scale anchor** (+1–2) would need the CIA World Factbook "Area – comparative" entries for both Koreas (US-state comparisons) or a US Census state-area figure, added to SOURCES first. Then use a `ghost` of that state over the peninsula. Don't improvise the comparison.
- Showing **the actual map** (+1 D send) would need a public-domain/LoC scan of a 1940s National Geographic map of Asia, credited, as an `archive` card on "National Geographic map". Never use an AI "archive" image.

## 3 alternative hooks (all true per SOURCES.md)
| Archetype | Verbal line (0–2 s) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **A. Myth-bust / contradiction** | "Korea's border isn't the 38th parallel. It hasn't been since 1953." | Today's red/blue map with the white 38th-parallel stroke cutting across the real line, and Kaesong and Sokcho both pointed (the change 5 frame, settled on frame 0) | `NOT THE 38TH PARALLEL` |
| **B. Question (straight line)** | "Why was Korea split along a perfectly straight line?" | Brown peninsula, yellow 38°N stroke fully drawn, "38°N" label, pen sticker, title | `WHY A STRAIGHT LINE?` |
| **C. Big number + in-media-res** | "One night in 1945, two Americans picked Korea's dividing line off a National Geographic map." | The `k1_27.4.jpg` composition: red/blue 1945 zones, yellow "38th parallel", Seoul marker, already coloured on frame 0 (recolour to brown at `japan`, then re-declare as now) | `DRAWN IN ONE NIGHT` |

Wording guardrails:
- **Never** say "in 30 minutes" (it's not in Rusk's account; SOURCES excludes it).
- Never date the night more precisely than "August 1945" or "1945".
- C must say "Korea's *dividing line*" or "the 38th parallel", **not** "the border Korea still has". Today's line is the armistice line, which is the video's own point.
- A's loop line would become "So where is the border? Not here: …".
- If C is used, the loop end frame should also show the zones coloured, or SSIM drops below 0.85. Re-measure after the change.

## Cover, caption, hashtags, pinned comment
- **Cover (compose; there's no clean single frame to use):**
  - Base: frame **27.4 s** (`k1_27.4.jpg`), with the red north, the blue south, the yellow straight "38th parallel" and the Seoul marker. Hide the caption strip and the locator.
  - Overlay the title "HOW ONE LINE SPLIT KOREA" (as on frame 0), plus a yellow sub-line **"ONE NIGHT. ONE MAP."** (true per SOURCES).
  - Export a 9:16 for TikTok/Shorts and a 3:4 centre crop for the Instagram grid. The peninsula and the title must both survive the 3:4 crop.
  - Second-variant cover for A/B: the change 5 frame with "NOT THE 38TH PARALLEL".
- **Caption** (hook line ≤ 150 chars, then 2 keyword lines):
  > One night in 1945, two Americans picked Korea's dividing line off a National Geographic map.

  > The 38th parallel on a map: Dean Rusk and Charles Bonesteel, the US and Soviet zones, two rival Koreas in 1948, the Korean War, and why today's DMZ isn't the 38th parallel.

  > REDRAWN ep. 4. Map history in under a minute. Sources in the pinned comment.
- **Hashtags (5):** `#KoreanWar #38thParallel #history #maps #geography`
- **Pinned comment:** keep the SOURCES text (Rusk *As I Saw It* 1990, National Geographic 2013, Britannica, South Korean DMZ office; the date varies; "30 minutes" left out; photo: Library of Congress). Replace the closing question with:
  *"Kaesong went North, Sokcho went South. Did you know the border moved, or did you think it was still the 38th parallel?"*
  - It still has an honest either/or, it's tied to the payoff, and replies are easy. Save "Which straight-line border should we redraw next?" as a day-2 reply.
  - Mirror the final wording in SOURCES "Pinned comment (EN)" when POSTING.md is written.

## Platform notes
- **TikTok:** 54 s with a verbal and visual loop and no end card is the right shape; rewatch is the lever.
  - Changes 1 and 4 keep the loop seamless.
  - Put "38th parallel" and "Korean War" in caption line 2 and in the on-screen text (TikTok search reads both).
  - If a cut is ever needed, trim pauses (`maxPause` 0.34 → 0.28, the CLAUDE.md default) before cutting lines. The pace has headroom.
- **Instagram Reels:** ranks on sends per reach.
  - The DM moments are the hook ("one night, one map"), the change 5 swap frame and "No peace treaty / STILL". Each should be on screen ≥ 1.5 s.
  - Upload the 3:4 cover, post natively with no TikTok watermark, and put the keywords before the hashtags.
- **YouTube Shorts:** "viewed vs swiped" is decided at frame 0.
  - Test hook **A** (myth-bust) here as a second upload: a contradiction on a fully coloured map tends to beat a brown silhouette on this surface.
  - Title: "Korea's border isn't the 38th parallel". Put the sources in the description.

VIRALITY SCORE: 75/100 (7.5/10) — can break out
