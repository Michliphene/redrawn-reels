# Virality review: alaska-1867, pass 4 (final)

Video: `out/alaska-1867.mp4` (55.7 s container, 55.1 s of cues), the fresh render after the pass-3 changes.
Evidence used for this pass:
- `python3 pipeline/virality_metrics.py alaska-1867`, run fresh.
- All 6 hook frames (0–3 s) and `loop_first_vs_last.jpg`.
- The 13 fresh beat sheets `beat_00`…`beat_12` and `cues.md`. I did not regenerate them.
- `episode.json` (the `say` fields), `SOURCES.md`, and virality pass 3.
- `deliverables/alaska-1867/POSTING.md`, `cover_9x16.png` (1080×1920) and `cover_3x4.jpg` (1080×1440).
- Extra frames at 2.6, 3.3, 29.8, 30.5, 52.6 and 55.5 s. They are in `/tmp/claude-0/virality-tmp/p4_*.jpg`, with a strip in `p4_strip.jpg`.

> This is a pattern-based estimate against `docs/VIRALITY_PLAYBOOK.md`, not a prediction. The biggest factor is one we can't control: how big the account is and how the first test cohort responds.

## Key metrics (pass 3 → pass 4)
| Metric | Pass 3 | Pass 4 | Read |
|---|---|---|---|
| Duration / words / pace | 54.5 s · 150 · 2.98 w/s | **55.7 s · 154 · 2.98 w/s** | +4 words ("So what did America get?"). Pace still in band. |
| First word | 0.25 s | 0.25 s | ok |
| Pointer "THIS IS ALASKA" | 2.36 s | **0.69 s** (visible in the 1.0 s frame) | under the 1.5 s target |
| Hook text | title + "FOR ALL OF THIS?" = 8 words | **title + "FOR ALL THIS?" = 7 words** | on target |
| Cues / 10 s | 9.4 (51) | **9.2 (51)** | dense |
| Longest gap | 2.06 s | **2.96 s at 0.69 s** (pointer and money bag both fire on "million.", then nothing new until the Texas ghost at 3.65 s) | **small regression**, see change 1 |
| Empty 2 s windows | 0 / 27 | 0 / 28 | ok |
| Loop SSIM | 0.863 | **0.865** | still ≥ 0.85 |
| Loudness | −14.1 | −14.2 LUFS | ok |

### What changed on screen (verified frame by frame)
- **Hook:** frame 0 is unchanged and still strong: "$7,200,000 / FOR ALL THIS?", red Alaska, title, EP 2. By 1.0 s the pointer names Alaska and the money bag is in. Between 0.7 and 3.6 s the screen is moving: coins rain, the caption words change, and the pointer and bag hold. But no *new element* arrives. That's the 2.96 s gap. I'm deducting one point, and it's an easy fix.
- **LATER MYTH:** the stamp now sits at the lower right of the "Seward's Folly" box, over the Alaska panhandle, and no longer covers the title. At 30.5 s the full frame reads "Seward's Folly" (intact), then "LATER MYTH", then "most 1867 papers were supportive or neutral". Screenshot-clean. It's still visible at 31.0 s, into the Senate beat, as planned.
- **"So what did America get? Gold rushes."** The ending now has a question with a shape: gold → statehood → "Then oil" → "All of it, bought for…". No and-then connector left in the spine.
- **Oil:** spoken "the largest oil field in the United States", on screen "Largest U.S. oil field / Prudhoe Bay · discovery announced 1968". SOURCES row 31 logs why "North America" was dropped (Cantarell). It's a little less striking, but there's no "well, actually" exposure left. It's the right call.
- **Loop:** the last frame (55.5 s) has red Alaska, title, REDRAWN EP 2, and the caption "BOUGHT FOR…" feeding straight into "$7.2 million." on frame 0.

## Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **25/25** | **Frame 0 (8/8):** exact number + question + shape + title, striking paused and muted. **Payload (7/7):** "$7.2 million. That's what America paid for all of this." **Place (5/5):** "ALASKA" is in the title on frame 0 and the pointer lands at 0.69 s. **Text (3/3):** 4 + 3 = 7 words plus the number. **No throat-clearing (2/2):** first word at 0.25 s. |
| B. Retention | **24/25** | **Cue density (7/8):** 9.2 cues per 10 s and no empty 2 s window, but one 2.96 s stretch with no new element (0.69 → 3.65 s), at the worst moment, inside the hook. **Escalation (6/6):** "But… never consulted" turn, then "So what did America get?" opens an escalating payoff run: gold, then 49th state × Texas, then the largest U.S. oil field, then the price. **Re-hook (4/4):** "Ever heard it called Seward's Folly?" at about 25 s (46 %). **Payoff (4/4):** oil, then "All of it, bought for…". **Pace and captions (3/3):** 2.98 w/s, word-by-word, readable. |
| C. Rewatch & loop | **10/10** | "All of it, bought for…" → "$7.2 million." (5/5). SSIM 0.865 (3/3). Dense pause frames: myth card with stamp, Native areas, gold markers, Texas overlay, pipeline (2/2). |
| D. Shareability & saves | **14/15** | **Send (6/6):** "2¢ an acre", "Seward's Folly = LATER MYTH" (now screenshot-clean), "largest U.S. oil field, bought for $7.2M". **Save (3/4):** reference-map value + EP 2, but no "next episode" promise anywhere (video, caption or pin). **Comment (3/3):** the myth line is a built-in "did you know / I was taught" trigger, and POSTING.md now pins an honest, identity-based question ("Did you learn it as 'Seward's Folly' in school?"). **Human stake (2/2):** Seward ×2, Stoeckl, the treaty painting, "never consulted". |
| E. Packaging | **10/10** | **Cover (4/4):** `cover_9x16.png` = frame 0, a clean TikTok/Shorts thumbnail. `cover_3x4.jpg` is grid-safe: tag, title, shape and price all sit inside 1080×1440. **Caption (3/3):** hook line (75 chars) with "Russia / Alaska / $7.2 million / 2 cents an acre", keyword line with "1867 Alaska Purchase / Seward / Senate / Seward's Folly", 5 hashtags. **Series (3/3):** REDRAWN + EP 2 on frame 0, the loop and both covers. |
| F. Niche codes & trust | **14/15** | **Transformation (4/4):** red → blue at "American", back to red on the loop. **Scale (3/3):** Texas in the hook and at statehood. **Faces (2/3):** small corner cards only. The Native beat is 3.7 s of italic labels with no person. **Sourcing and hedges (3/3):** every on-screen figure is in SOURCES. The oil claim is narrowed, with the reason logged. The hedges are there: "Historians point to", "approximate traditional areas", "flags stylised", "simplified", "discovery announced". **Anti-patterns (2/2):** no intro card, logo sting, wall of text or follow card. |
| **TOTAL** | **97/100 · 9.7/10** | **Tier: strong breakout odds** (pass 1: 80 · pass 2: 86 · pass 3: 92) |

Honesty note on the score: 97 means the *packaging* is close to the ceiling the rubric can measure. It doesn't mean 97 % odds. From here, more editing returns very little. Posting time, the first-hour cohort and account size will matter far more.

## Top 5 remaining changes, ranked by expected gain (none needs a new fact)

### 1. Re-split the hook so no new-element gap exceeds 2.5 s (+1: B cue density)
Pass 3's change 1 moved the pointer to "million.", and the money bag moved with it, so both fire at 0.69 s. Move the bag back to "That's" (≈2.3 s). Both gaps then become ≈1.6 s and ≈1.3 s, and the pointer still lands before 1.5 s.
```json
{"type":"sticker","emoji":"money_bag","x":880,"y":880,"size":170,"atWord":"That's","hold":1.4}
```
Frame 0 doesn't change. Before re-rendering, check a still at frame 75 (2.5 s) so the bag doesn't collide with the pointer arrow (the bag is at x 880, the arrow tail at about x 650–700, so it should be clear).

### 2. Give viewers a reason to save or follow: an honest "next episode" line in the caption and pin (+1: D save)
`docs/01_SERIES_AND_TOPICS.md` lists the Louisiana Purchase as topic 3. Promise it only if it really is next:
- Caption line 3: `REDRAWN ep. 2 · next: the Louisiana Purchase. Sources in the pinned comment.`
- Pinned question, which then drops the Louisiana/Gadsden poll so it doesn't contradict the promise: `Did you learn it as "Seward's Folly" in school?`

**Don't** put Louisiana's price per acre in the caption. It isn't in this episode's SOURCES. Keep the video loop clean: no end card.

### 3. A real face in the Native beat (+1: F faces)
This needs a new asset, not a new fact. Find a public-domain photo of an Alaska Native person from the period (`python3 scripts/loc_search.py "Tlingit"`), log it in `credits.json`, and caption it only with what the LoC record states. Show it as a small `portrait` card on "peoples" (≈39.8 s), on the side opposite the Tlingit label. Don't imply the person was at the 1867 transfer or the treaty.

### 4. Bring the caption's keywords up to the new ending, and sync the pinned comment (0 pts, search insurance)
The caption keyword line stops at the myth. The payoff words people search for are missing. Replace line 2 with:
> The 1867 Alaska Purchase on a map: Russian America, Seward's treaty, the 37–2 Senate vote, the "Seward's Folly" myth, the gold rushes, statehood in 1959 and Prudhoe Bay oil.

Also copy POSTING.md's pinned-comment source list (it adds the Alaska DEC Prudhoe Bay fact sheet) into `SOURCES.md` § Pinned comment, so the two files say the same thing.

### 5. Fill the dead third of the 3:4 cover, and check how Instagram displays it (0 pts, CTR insurance)
In `cover_3x4.jpg`, y ≈ 1060–1440 is empty navy, and "BECAME AMERICAN" grazes Alaska's north coast. Two options. Move the price block down about 120 px and add the Texas ghost with a "Texas, same scale" label inside Alaska. Or add a small second line under the price: `≈ 2¢ AN ACRE`. Both are already on screen and in SOURCES. Before posting, do a private test upload. If Instagram letterboxes a 1080×1440 image in the Reels tab, export a 1080×1920 version with this composition centred at y 240–1680.

Expected total with 1–3: **100/100**. Realistically 98–99, since change 3 depends on finding a suitable licensed photo.

## 3 alternative hooks (all true per SOURCES.md)
| Archetype | Verbal line (0–2 s) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **A. Payoff-first contrast** | "The largest oil field in the United States. America bought the land for $7.2 million." (loop end unchanged) | Blue Alaska with the Prudhoe Bay marker and pipeline drawn, plus a settled "$7,200,000" | `$7.2M FOR THIS?` |
| **B. Myth-bust** | "'Seward's Folly'? Most newspapers in 1867 didn't think so." (Hill 2019) | Red Alaska under the "Seward's Folly" callout with the LATER MYTH stamp already on it, plus the small Seward card | `"SEWARD'S FOLLY" = MYTH` |
| **C. Price per unit** | "About two cents an acre. That's what America paid for Alaska." | Red Alaska, settled "2¢", sub "≈1.9¢ · 375M ACRES" | `2¢ AN ACRE?` |

Recommendation: keep the current big-number hook (25/25). Use A as the first A/B repost, keeping the oil wording exactly as above ("United States", never "North America" or "ever"). B gets the most comments. C is the cleanest Shorts variant.

## Cover, caption, hashtags, pinned comment
- **Cover:** TikTok and Shorts use `cover_9x16.png` (= frame 0). Instagram uses `cover_3x4.jpg` (ideally after change 5). Never use 23.2–23.4 s as a cover: the "2¢" number rolls through "1¢" there.
- **Caption** (POSTING.md with changes 2 and 4 applied):
  > Russia sold Alaska to the US for $7.2 million. That's about 2 cents an acre.
  > The 1867 Alaska Purchase on a map: Russian America, Seward's treaty, the 37–2 Senate vote, the "Seward's Folly" myth, the gold rushes, statehood in 1959 and Prudhoe Bay oil.
  > REDRAWN ep. 2 · next: the Louisiana Purchase. Sources in the pinned comment.
- **Hashtags (5):** `#AlaskaPurchase #history #maps #geography #alaska`. Keep them as they are.
- **Pinned comment:** the POSTING.md source list, then:
  > Did you learn it as "Seward's Folly" in school?

  If Louisiana isn't confirmed as ep. 3, keep POSTING.md's current two-part question instead and drop the "next:" line. Avoid "Should Russia want it back?", which invites a political pile-on.

## Platform notes
- **TikTok:** completion and rewatch rule. At ~55 s with a clean verbal loop and an escalating ending, this sits in the ~50 % completion band. Don't add an end card. Frame 0 is the default thumbnail and is correct. "Alaska" is in the on-screen title and the caption, so it's searchable. The money bag (x 880) grazes the right UI column only briefly.
- **Instagram Reels:** ranks on sends per reach. All three DM moments hold long enough: 2¢ (1.6 s), LATER MYTH (now screenshot-clean, ~1.8 s), largest U.S. oil field (1.8 s). Upload the 3:4 cover and check its display (change 5). Caption keywords matter more than hashtags. Post natively with no TikTok watermark.
- **YouTube Shorts:** "viewed vs swiped" is decided on frame 0 and second 1, and both now score full. Title: "Russia sold Alaska for 2 cents an acre". Put the sources in the description. If you A/B test, try hook A or C. The native loop rewards "bought for… / $7.2 million."

VIRALITY SCORE: 97/100 (9.7/10) — strong breakout odds
