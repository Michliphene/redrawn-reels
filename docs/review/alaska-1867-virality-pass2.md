# Virality review: alaska-1867, pass 2

Video: `out/alaska-1867.mp4` (52.6 s), re-rendered after the pass-1 top 5 was applied (commits 3548791 and 863916d).
Evidence used for this pass:
- `python3 pipeline/virality_metrics.py alaska-1867`, run fresh.
- The 6 hook frames and `loop_first_vs_last.jpg`.
- The 12 fresh beat sheets and `cues.md`.
- Extra frames at 3.8, 25.9, 26.6, 29.6, 35.5, 36.6, 44.9 and 52.4 s (in `/tmp/claude-0/virality-tmp/`).
- `episode.json`, `SOURCES.md`, and virality pass 1.

> This is a pattern-based estimate against `docs/VIRALITY_PLAYBOOK.md`, not a prediction. Account size and how the first test cohort responds matter more than anything scored here.

## Key metrics (pass 1 → pass 2)
| Metric | Pass 1 | Pass 2 | Read |
|---|---|---|---|
| Duration / words / pace | 54.9 s · 147 · 2.88 w/s | **52.6 s · 143 · 2.93 w/s** | 2.3 s shorter, pace still in band |
| First word | 0.25 s | 0.25 s | ok |
| Frame 0 | title + shape, no number | **title + shape + "$7,056,000 / FOR ALL OF THIS?" + EP 2** | big gain, but see the frame-0 value problem below |
| Cues / 10 s | 8.7 | **8.9** (47 cues) | dense |
| Gaps > 2.5 s | 3 (worst 3.49 s) | **1**: 2.88 s @ 34.07 (the flag swap is animating, so the screen isn't dead) | 1 of 26 two-second windows empty |
| Loop SSIM | 0.903 | **0.863** | still ≥ 0.85, but the margin is thin because frame 0 now carries the number |
| Loudness | −14.0 | −14.2 LUFS | ok |

### What changed on screen (verified)
- **Frame-0 number:** works. Frame 0 reads as a complete still: number, question and red Alaska. **Problem:** with `"from":0.98`, frame 0 shows **$7,056,000**. That price never existed. It is also the frame TikTok and Shorts use as the default thumbnail, and the frame a paused or muted viewer reads. The number settles on $7,200,000 by about 0.5 s. A screenshot of frame 0 would carry a wrong figure, so this is a trust issue (CLAUDE.md: every figure on screen must be in SOURCES).
- **Hook caption skip:** works. From 0 to 2.4 s the hook shows only three text blocks: title, number with label, and the EP tag. The 10 coins are acceptable.
- **Texas ghost at "all" (3.61 s):** visible for about 1 s. The "Texas, same scale" label lands **on the tip of the "THIS IS ALASKA" pointer arrow** (pointer hold 2.4 s → on screen until 4.86 s). At 3.8 s the ghost is a faint dashed outline under the arrow. It reads, but not cleanly. It also bleeds into the first frame of beat 01 (4.5 s).
- **Shorter treaty line:** the sign beat is now 4.6 s (was 7.3 s). The plateau is gone, and the portraits still carry the full names.
- **Myth line + Seward reprise:** the line now leads with the label people know. The reprise card is on screen from 25.5 to 27.1 s. **But** the "LATER MYTH" stamp fires at "myth" (about 29.7 s), and the callout ends at 30.1 s. So the stamp is visible for **about 0.4 s**, at a fixed 38 px font. It is the most DM-able frame in the reel, and it is the smallest, shortest text in it. (The pass-1 platform note asked for ≥ 1.2 s; that wasn't applied.)
- **Gold line "And then? Gold rushes. Then oil.":** ok, 2.6 s. **New issue:** the date badge says **1899** while the "Prudhoe Bay · oil 1968" marker and the pipeline are on screen (44.7–45.4 s). A paused viewer can read it as "oil, 1899".
- **EP 2 tag:** on the hook and loop only, so the loop frame match holds.
- **Doc hygiene (not a score item, but a CLAUDE.md rule):** the "Script (as spoken)" section of `SOURCES.md` is stale. Lines 4, 6 and 10 still have the pass-1 wording. The facts table is fine. Update it so the fact sheet matches what's spoken.

## Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **22/25** | Frame 0 (7/8): number, question, shape and title, striking paused and muted. −1 because the paused value is $7,056,000. Payload (7/7): "$7.2 million… for all of this". Place (4/5): the title names Alaska on frame 0 and the pointer comes at 2.46 s, but the shape still floats with no neighbour or scale until 3.6 s. Text (2/3): decluttered to three blocks, but title plus label is ~8 words plus the number, one over the ≤7 target. No throat-clearing (2/2). |
| B. Retention | **21/25** | Cue density (7/8): 8.9 per 10 s, one gap of 2.88 s (softened by the flag animation). Escalation (4/6): the sign plateau is gone and "And then?" and "But… never consulted" add turns, but the spine is still a chronological list. Re-hook (4/4): "Ever heard it called Seward's Folly?" at 24.7 s (47 %). Payoff (3/4): "2¢ an acre" at 23 s is strong, but the end payoff is still a list (gold, oil, 49th, Texas) with no figure for what the "folly" became. Pace and captions (3/3): 2.93 w/s, word-by-word captions. |
| C. Rewatch & loop | **10/10** | "All of it, bought for…" → "$7.2 million." (5/5). SSIM 0.863 ≥ 0.85 (3/3, thin margin). The labelled maps (Native areas, gold/oil/pipeline, Texas overlay) reward a pause (2/2). |
| D. Shareability & saves | **11/15** | Send (5/6): "2 cents an acre" and the myth question are both sendable now, but the visual proof ("LATER MYTH") flashes for 0.4 s. Save (3/4): EP 2 tag plus a reference map. A clear series promise is still missing. Comment (2/3): the opening question is rhetorical and there is no honest in-video prompt. The pinned question carries this. Human stake (1/2): the Seward reprise helps, but the Native beat is still 3.8 s of labels with no face or voice. |
| E. Packaging | **9/10** | Cover (3/4): frame 0 now works as a thumbnail, but it shows the wrong number and the title sits in the band the Reels 3:4 grid crops, so a custom cover is still needed. Caption (3/3): written below. Series (3/3): the EP 2 tag sits next to REDRAWN in the hook and loop. |
| F. Niche codes & trust | **13/15** | Transformation (4/4): red → blue at "American". Scale (3/3): Texas in the hook and at the payoff. Faces (2/3): small corner cards (Seward twice, Stoeckl once). Sourcing and hedges (2/3): all the hedges are there ("Historians point to", "approximate traditional areas", "flags stylised", "simplified"), but frame 0 shows an unsourced figure, the 1899 badge sits under the 1968 oil marker, and SOURCES.md's script section is stale. Anti-patterns (2/2): no logo, intro, wall of text or "follow" end card (the small stamp is counted under D). |
| **TOTAL** | **86/100 · 8.6/10** | **Tier: strong breakout odds** (pass 1: 80) |

## Top 5 remaining changes, ranked by expected gain
Changes 1–4 need no new facts. Change 5 needs a cited figure first, and the source to get it from is named.

### 1. Make frame 0 show the true price (+2: A frame 0 +1, F sourcing +1; also fixes the default cover)
In the hook `bigNumber`, set `from` to exactly 1. The number is fully settled on frame 0, and the coins and money bag still give motion.
```json
{"type":"bigNumber","value":7200000,"prefix":"$","label":"FOR ALL OF THIS?","coins":true,"dur":0.5,"hold":3.45,"y":1080,"from":1,"atTime":0,"coinsCount":10}
```
(Any `from` < 1 puts a non-existent price on frame 0: 0.98 → $7,056,000, 0.999 → $7,192,800.)
If you want motion on the number itself, add a scale "pop" in `Overlays.tsx` BigNumber (`pop` currently forces 1 when `from` is set). Don't roll the digits.

### 2. Make the myth-bust stamp land: bigger and on screen ≥ 1.5 s (+2: D send +1, B payoff/re-hook clarity +1)
- Fire the stamp one word earlier and keep the callout up into the Senate beat's opening. The Senate "37 – 2" callout at the same y doesn't start until 31.54 s, so there is room.
  ```json
  {"type":"callout","text":"“Seward’s Folly”","sub":"most 1867 papers were supportive or neutral","y":1040,"hold":5.4,"stamp":"LATER MYTH","stampWord":"largely","atWord":"Seward's"}
  ```
  The stamp is then visible from ~29.1 s to ~31.3 s (about 2.2 s), and it fades before "37 – 2".
- Component change in `src/components/Overlays.tsx` (Callouts): replace the fixed `fontSize: 38` with `fontSize: (a as any).stampSize ?? 38` (and the border `5` with a scaled value). Then add `"stampSize": 60` to this callout. At 38 px, the red tag reads as a sticker, not a verdict.
- Facts unchanged: Hill 2019 and the SOURCES "most supportive or neutral" line.

### 3. Fix the gold/oil date badge and sync SOURCES.md (+1: F sourcing)
In the `gold` beat, add a date step at "oil" so the badge never shows 1899 next to the 1968 oil marker. Prudhoe Bay 1968 is already in SOURCES.
```json
{"type":"date","date":"1968","atWord":"oil"}
```
Separately (doc only), update `SOURCES.md` "Script (as spoken)" lines 4, 6 and 10 to the rendered wording:
- "On March 30, after an all-night session, Seward signs the treaty with Russia's envoy."
- "Ever heard it called Seward's Folly? Some critics did mock the deal. But that label is largely a later myth."
- "And then? Gold rushes. Then oil."

### 4. Hand the pointer off to Texas so the scale anchor reads cleanly (+1: A place/text clarity)
At 3.6–4.5 s the "Texas, same scale" label sits on the pointer's arrowhead. End the pointer when Texas arrives, and give the ghost a little more time, ending before the beat-01 camera move.
```json
{"type":"pointer","at":[-150,65],"text":"THIS IS ALASKA","from":[230,-230],"atWord":"That's","hold":1.1},
{"type":"ghost","id":"TEXAS_GHOST","atWord":"all","hold":0.6},
{"type":"region","text":"Texas, same scale","at":[-151,63.5],"atWord":"all","hold":0.55}
```
The ghost fade then finishes by about 4.4 s, so it no longer leaks into beat 01's first frame. If the 0.6 s hold reads too briefly by eye, keep 0.9 and only shorten the pointer.
Bolder option, same facts: show the pointer at 0.0 s (`"atTime":0`, hold 2.4) so the place reads on frame 0. This adds a fourth text block to the hook, so check the cover before keeping it.

### 5. Give the payoff a number: "folly" → what it became (+2 to +3: B payoff +1, B escalation +1, D send +1). **Needs a new sourced fact first.**
The end is still "gold, oil, 49th state, twice Texas": true, but a list. One concrete figure would make it a "but/therefore" payoff. Two options; **neither may go on screen until the figure and reference are in SOURCES.md**:
- **$7.2 M in today's dollars.** Source: Federal Reserve Bank of Minneapolis, "Consumer Price Index, 1800–" (BLS's own calculator starts in 1913), or MeasuringWorth.com. Log the method and base year. The line would replace "And then?":
  > "Worth about $[X] million today. Then? Gold rushes. Then oil."
  Mark it "≈" and "CPI-adjusted" on screen.
- **Prudhoe Bay's rank** (e.g. "largest oil field in North America"). Source: USGS or the Alaska Department of Natural Resources / AOGCC. Add it as the marker sub-line only; leave the voice-over unchanged.

Not ranked, but worth noting: the Native beat would gain human stake (D +1) from a public-domain photo of a Tlingit or other Native leader from the period. Search LoC with `python3 scripts/loc_search.py "Tlingit"`, then check the licence and log the image. The caption must not imply the person was at the 1867 transfer unless a source says so.

Expected total if 1–4 are applied: about **91/100**. With 5 sourced: about **93**.

## 3 alternative hooks (all true per SOURCES.md)
| Archetype | Verbal line (0–2 s) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **A. Price per unit** | "About two cents an acre. That's what America paid for Alaska." (loop end: "…all of it, for about…") | Red Alaska, settled "2¢" bigNumber, sub "≈1.9¢ · 375M ACRES" | `2¢ AN ACRE?` |
| **B. Myth-bust** | "'Seward's Folly'? Most newspapers in 1867 didn't think so." (Hill 2019: most supportive or neutral) | Red Alaska under the "Seward's Folly" callout with the big "LATER MYTH" stamp already on it, plus a small Seward card | `"SEWARD'S FOLLY" = MYTH` |
| **C. Question with defined shape** | "Why would Russia sell all this for $7.2 million? Historians point to two reasons." | Red Alaska with the TEXAS_GHOST inside it, "$7.2M" settled, Saint Petersburg arc already drawn | `WHY SELL THIS?` |

Recommendation: keep the current hook, with changes 1 and 4. It already scores 22–24/25, and the verbal loop depends on it. B is the strongest repost or A/B test (more comments, more sends), but the loop line would need rewriting (e.g. end "…a later myth?" → "'Seward's Folly'?"). C fits Shorts best because its "viewed vs swiped" test rewards an open question, but its "two reasons" must be paid off by 15 s, and the current structure does that (beat 02 ends at 18 s; tighten if you use it).

## Cover, caption, hashtags, pinned comment
- **Cover:** after change 1, **frame 0 (t = 0.0 s)** is the cover: title, "$7,200,000 / FOR ALL OF THIS?", red Alaska, EP 2. For Instagram, upload a composed cover inside the middle 1080×1440: Alaska with the Texas ghost, "$7.2M FOR THIS?" in the centre, and the title moved down about 200 px. Don't use any frame between 0.03 and 0.5 s: the number is still rolling there.
- **Caption** (hook line ≤ 150 chars + 2 keyword lines):
  > Russia sold Alaska to the US for $7.2 million: about 2 cents an acre. And "Seward's Folly"? Mostly a later myth.
  > The 1867 Alaska Purchase on a map: Russian America, Seward's treaty, the 37–2 Senate vote, the Sitka handover and statehood in 1959.
  > REDRAWN ep. 2, map history in under a minute. Sources in the pinned comment.
- **Hashtags (5):** `#AlaskaPurchase #history #maps #geography #alaska`
- **Pinned comment:** the SOURCES.md text, then:
  > "Which US land deal should we redraw next: the Louisiana Purchase or the Gadsden Purchase?"

  Keep it about the series. Avoid "Should Russia want it back?", which invites a political pile-on.

## Platform notes
- **TikTok:** completion and rewatch rule. At 52.6 s with a clean verbal loop, this is in the 50 % completion band. Don't add an end card. TikTok uses frame 0 as the default thumbnail, so change 1 is mandatory before upload. "ALASKA" is in the on-screen title and "Alaska Purchase" is in the caption, so it's searchable. The right-side UI column (x > ~900) clips the money-bag sticker (x 880) only at the edge.
- **Instagram Reels:** sends per reach is the lever. The two DM moments are "2¢ an acre" (on screen 1.6 s ✓) and "LATER MYTH" (0.4 s ✗ → change 2). Upload the composed 3:4-safe cover. Hashtags won't add reach, but the caption keywords will. Post natively (no TikTok watermark), because Reels cuts reposts from cold distribution.
- **YouTube Shorts:** "viewed vs swiped" is decided on frame 0 and second 1, and frame 0 is now strong once the value is exact. Title: "Russia sold Alaska for 2 cents an acre". Shorts loops natively, so the "bought for… / $7.2 million" loop pays off. Put the sources in the description. If you A/B a hook here, use C (question).

VIRALITY SCORE: 86/100 (8.6/10) — strong breakout odds
