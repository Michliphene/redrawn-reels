# Virality review: louisiana-1803 (REDRAWN EP 3), pass 3 (final)

Video: `out/louisiana-1803.mp4` (fresh render, 54.0 s, 1080×1920).
Evidence used:
- `python3 pipeline/virality_metrics.py louisiana-1803`, run fresh.
- All 6 hook frames (0–3 s) and `loop_first_vs_last.jpg`.
- The fresh beat sheets and `cues.md`. I did not regenerate them.
- `episode.json`, `SOURCES.md`, `deliverables/louisiana-1803/{POSTING.md, cover_9x16.png, cover_3x4.jpg}`, and virality pass 2.
- Extra frames in `/tmp/claude-0/virality-tmp/`, all prefixed `l3_`: 0.0 s, a full-res frame-0 crop of the seam (`l3_f0crop.jpg`), 2.6, 18.6, 19.6, 34.9, 35.6, 36.3, 36.6, 38.9, 40.9 and 51.6 s. The strips are `l3_s1.jpg`, `l3_s2.jpg` and `l3_s3.jpg`.

> This is a pattern-based estimate against `docs/VIRALITY_PLAYBOOK.md`, not a prediction. The biggest factor is one we can't control: account size and how the first test cohort responds.

## Key metrics (pass 2 → pass 3)
| Metric | Pass 2 | Pass 3 | Read |
|---|---|---|---|
| Duration / words / pace | 54.0 s · 156 · 3.2 w/s | 54.0 s · 156 · 3.2 w/s | Top of the band. No headroom. |
| First word / hook length | 0.25 s / 1.59 s | 0.25 s / 1.59 s | "America tried to buy New Orleans." |
| Number in hook (metric) | false | false (verbal) | A number now shows **on screen** at 2.8 s: "828,000 SQ MI". The metric only parses the voice. |
| Cues / 10 s | 8.9 | 8.9 (48 cues) | dense |
| Longest gaps | **2.84 s** · 1.90 · 1.89 | **2.03 s** · 1.90 · 1.89 | No gap over 2.5 s. 0 of 27 two-second windows are empty. |
| Loop SSIM | 0.901 | 0.901 | full marks |
| Loudness | −14.0 | −14.0 LUFS | ok |

### Pass 2 fixes, checked on screen
1. **Budget plateau: fixed.** The $10M card now holds until "Florida." (`l3_18.6.jpg`). The "Florida (Spanish)" marker lands at 19.3 s and stays through the cross-fade (`l3_19.6.jpg`). It's sourced: SOURCES "Map" says "minus Spanish Florida". The camera is still a span-95 world view with a small US for about 6 s. That's acceptable now that something new arrives every ~2 s, but it remains the visually weakest stretch (see change 4).
2. **"LOUISIANA" label: fixed.** It reads fully at x ≈ 730–970 in beat_03, with the French flag above it. **Orange dash: gone.** The full-res crop of frame 0 at the 31°N seam is clean, and so are the loop frame and both covers.
3. **Packaging: fixed.** POSTING.md has no "one city" left. The Reels line says "tried to buy New Orleans", and the Shorts title is "The US tried to buy New Orleans. France offered THIS." The pin asks one question, "Which of the 15 states do you live in?", and the same question is in SOURCES "Pinned comment (EN)". One small mismatch remains: the POSTING pin lists "National Constitution Center" and the SOURCES pin doesn't. NCC is in the SOURCES references, so nothing is wrong. Pick one version (see change 5).
4. **Hook number: done.** The pointer says "828,000 SQ MI" and is legible on hook_5 (3.0 s), sitting on the full orange purchase with the French flag.
5. **Holds: done.** "≈ 2.8¢ PER ACRE · 828,000 SQ MI" is fully legible from about 34.0 to 35.6 s, fades under the Jefferson card, and is gone before "Constitutional?" at 36.4 s, with no overlap (`l3_s3.jpg`). "Senate: 24 – 7" clears before the double beat's camera move. "15 states / all or part" reads cleanly over the state grid (`l3_51.6.jpg`).

## Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **22/25** | **Frame 0 (6/8):** settled title, place marker, city sticker, orange/blue contrast, and no artefact. It still works paused and muted. It holds back 2 points because the crop is the boot of Louisiana: no scale, no number, nothing hints at the vast shape coming at 2.1 s. **Payload (6/7):** sentence 1 is a named stake. The contradiction ("France offered all of this") arrives at 2.1 s and a concrete number ("828,000 SQ MI") at 2.8 s, both inside the gate. It's not a full 7 because the verbal first sentence still carries no number. **Place (5/5):** "New Orleans" on frame 0. **Text (3/3):** a 6-word title that creates the gap ("doubled" against one city marker). **No throat-clearing (2/2).** |
| B. Retention | **24/25** | **Cue density (8/8):** 8.9 per 10 s, longest gap 2.03 s, no empty 2 s windows. **Escalation (5/6):** a clean but-therefore spine up to ×2. Borders → natives → 15 states still lands as a list after the peak, and the biggest number isn't last. **Re-hook (4/4):** "But Napoleon's army…" (37 %) and "what would you pay for all of Louisiana?" (46 %). **Payoff (4/4):** 2.8¢ at 62 % with a screenshot-length hold, then ×2 shown on a wide frame at 75 %. **Pace (3/3):** 3.2 w/s, readable captions. |
| C. Rewatch & loop | **10/10** | "All because…" → "America tried to buy New Orleans." (5/5). SSIM 0.901 (3/3). Pause frames: Native nations, 15-state grid, Spanish/British lands with "?", wide ×2 (2/2). |
| D. Shareability & saves | **15/15** | **Send (6/6):** "tried to buy New Orleans, France offered all of this", "≈ 2.8¢ per acre" (now held long enough to screenshot), "Jefferson wasn't sure it was constitutional". **Save (4/4):** before/after ×2, the 15-state ghost, EP 3. **Comment (3/3):** one identity question the video answers on screen (15 states), in both the pin and SOURCES. **Human stake (2/2):** Jefferson's doubt, Haiti, Native nations who never agreed. |
| E. Packaging | **10/10** | **Cover (4/4):** 9:16 and 3:4 show the full shape, title and "≈ 2.8¢ PER ACRE · 828,000 SQ MI", with no artefact, and read well at thumbnail size. **Caption (3/3):** keyword-rich (Louisiana Purchase, 1803, Jefferson, Napoleon, Haiti, $15 million), 5 hashtags, and every platform line is consistent with the accuracy fixes. **Series (3/3):** REDRAWN EP 3 on frame 0, cover and caption. |
| F. Niche codes & trust | **13/15** | **Transformation (4/4):** orange → blue on a wide frame with ×2. **Scale anchor (2/3):** ×2 the 1803 US, 828,000 sq mi (imperial) and 15 states. There's still no familiar-shape comparison. **Faces (2/3):** small corner portraits only, and no human image for the Native beat. **Sourced/hedged (3/3):** "Shown as settled 1818–19", "Approximate areas, c. 1803", "Florida (Spanish)", the "$11.25M + $3.75M in claims" breakdown, and the "up to" on $10M. **Anti-patterns (2/2):** none left. Labels aren't clipped, there's no dead frame, no stray strokes, and the voice sits over the music at −14 LUFS. |
| **TOTAL** | **94/100 · 9.4/10** | **Tier: strong breakout odds** (pass 1: 79 → pass 2: 89 → pass 3: 94) |

The packaging is now about as good as this format allows. The 6 points left need either a new sourced fact, a new public-domain asset, or a structural hook test. No further polish will buy them.

## Top 5 remaining changes, ranked by expected gain
Changes 1–3 each need new research or a new asset first. Don't improvise any of them.

### 1. A/B a big-number frame 0 on Shorts/repost (+1–2: A frame 0, A payload)
This is the only lever left on the hook. Keep the current master. For the repost / Shorts variant, open on the cover composition with the number already settled, and make the verbal first sentence carry the number. Every figure is already in SOURCES (2.8¢/acre, 828,000 sq mi, $15M).
```json
// variant beat 0 (replaces "hook"; the loop beat's line changes to match)
{"id": "hook", "say": "Under three cents an acre.",
 "camera": {"fit": "FOCUS", "pad": 80},
 "actions": [
  {"type": "bigNumber", "value": 2.8, "from": 2.8, "decimals": 1, "prefix": "≈ ", "suffix": "¢", "label": "PER ACRE · 828,000 SQ MI", "atTime": 0, "hold": 1.6, "y": 1080},
  {"type": "sticker", "emoji": "coin", "x": 880, "y": 940, "size": 140, "atTime": 0, "hold": 1.6}
 ]}
```
Then the voice continues "America tried to buy New Orleans. France offered all of this…". Loop line: "All of it, for…" → "Under three cents an acre." Remove the later `acre` beat so the number isn't said twice. This is a **variant** to test, not a fix. The current hook has the stronger story gap, and only the data from the test can decide between them.

### 2. Familiar scale anchor (+1: F scale)
Add a "Texas, same scale" ghost inside the purchase, as in EP 2. Texas's area is **not** in this episode's SOURCES. First add it from the U.S. Census Bureau state-area table (dated facts table + reference). Then add a `TEXAS_GHOST` feature in `scripts/prep-louisiana.mjs` and fire it in the `double` beat:
```json
{"type": "ghost", "id": "TEXAS_GHOST", "atWord": "size.", "hold": 1.2}
```
If it crowds the ×2 card, put it in `today` instead, before the state grid.

### 3. A human image for the Native nations beat (+1: F faces, protects D stake)
A Library of Congress print of a Mandan or Lakota village (Bodmer or Catlin; public domain or "no known restrictions"). Find one with `python3 scripts/loc_search.py "Bodmer Mandan village"`. Credit it on screen (`archive` card) and in the pin. Never use an AI image.
```json
{"type": "archive", "src": "assets/archive/mandan_village.jpg", "caption": "Mandan village (period print)", "credit": "Library of Congress", "atWord": "home", "hold": 2.0}
```
Check that it doesn't cover the Mandan/Lakota labels. If it does, place it top-right.

### 4. Split the budget camera so the last 2 s aren't a world view (+0.5: B escalation/visual, polish)
Nothing new is needed here. After the Paris arc (≈17.2 s), move back to the US so "$10M for New Orleans + Florida" plays over a readable Gulf coast with the Florida marker. If the schedule allows only one camera per beat, split `say` at "ready" (the voice is unchanged):
```json
{"id": "budget",  "say": "Jefferson sends James Monroe to Paris,", "camera": {"center": [-40, 56], "span": 95}, ...},
{"id": "budget2", "say": "ready to pay up to ten million dollars for New Orleans and Florida.", "camera": {"center": [-86, 33], "span": 30, "dur": 0.7}, ...}
```
Re-check the pace afterwards: a new beat boundary adds up to 0.34 s, and the duration is already 54 s.

### 5. End on the biggest number, and align the pin text (+0.5: B escalation; trust hygiene)
- The ending climbs better if the last factual beat is the largest figure. That needs a new sourced modern comparison (e.g. the purchase's share of today's US land area, from the Census Bureau). Add it to SOURCES before it goes anywhere near the script. If you can't source it, leave the ending as it is.
- Make the POSTING.md pin and SOURCES "Pinned comment (EN)" identical. Either add "National Constitution Center" to SOURCES line 66, or drop it from POSTING. Adding it is better, because it is the source for the on-screen "Constitutional?" claim.

**Expected ceiling with 1–5: about 97–98/100.** The variant in change 1 is only worth it if the test shows a better swipe rate.

## 3 alternative hooks (all true per SOURCES.md)
| Archetype | Verbal line (0–2 s) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **A. Big number (price per unit)** | "Under three cents an acre. That's what America paid for all of this." | `cover_9x16` composition: full orange purchase beside the blue 1803 US, "≈ 2.8¢ PER ACRE · 828,000 SQ MI" and the coin settled on frame 0 | `3¢ AN ACRE?` |
| **B. Comparison** | "The United States doubled in size for fifteen million dollars." | Wide ×2 frame from the double beat (`l3_40.9.jpg`), purchase pulsing, "×2" settled | `×2 FOR $15M` |
| **C. Contradiction (constitution)** | "Jefferson wasn't sure this was constitutional. He bought it anyway." | Large Jefferson card with the "Constitutional?" callout over the orange purchase | `CONSTITUTIONAL?` |

Wording guardrails:
- C must follow SOURCES ("thought an amendment was needed; drafted one; proceeded without it"). Never say "illegal" or "unconstitutional" as a fact.
- B's $15M includes $3.75M in assumed claims, so keep the "$11.25M + $3.75M" card if B is used.
- Don't compare with Alaska's price unless that figure is added to SOURCES.

## Cover, caption, hashtags, pinned comment
- **Cover:** ship the current `deliverables/louisiana-1803/cover_9x16.png` (TikTok/Shorts) and `cover_3x4.jpg` (Instagram grid). Both are clean now. Optional second variant: the wide ×2 frame at 40.9 s with title + "≈ 3¢ AN ACRE". It *shows* "doubled", where the current cover states it.
- **Caption** (≤150-char hook line + 2 keyword lines, same as POSTING.md):
  > America tried to buy New Orleans. France offered all of Louisiana, for under 3 cents an acre.

  > The 1803 Louisiana Purchase on a map: Jefferson, Napoleon, Haiti, the $15 million deal, undefined borders and the Native nations who never agreed.

  > REDRAWN ep. 3. Map history in under a minute. Sources in the pinned comment.
- **Hashtags (5):** `#LouisianaPurchase #history #maps #geography #ushistory`
- **Pinned comment:** the sources line (with NCC, see change 5), then: *"Which of the 15 states do you live in?"* Save "Which border should we redraw next?" as a day-2 reply.

## Platform notes
- **TikTok:** 54 s, a verbal + visual loop and no end card is the right shape; rewatch is the lever. Upload `cover_9x16.png` because it carries the price. Keep "Louisiana Purchase" in caption line 2 for search. If a sub-50 s cut is ever needed, trim pauses before cutting lines, because the 3.2 w/s pace has no headroom. Never trim the 2.8¢ hold.
- **Instagram Reels:** ranks on sends per reach. The DM moments are the 2.1 s reveal with "828,000 SQ MI", the 2.8¢ card (now screenshot-length) and the wide ×2. Upload `cover_3x4.jpg`, post natively with no TikTok watermark, and put the caption keywords ahead of the hashtags.
- **YouTube Shorts:** "viewed vs swiped" is decided at frame 0 and second 1. The title is now accurate. This is where to run hook **A** (change 1) as a second upload or test, because a big number on frame 0 tends to beat a place name here. Put the sources in the description.

VIRALITY SCORE: 94/100 (9.4/10) — strong breakout odds
