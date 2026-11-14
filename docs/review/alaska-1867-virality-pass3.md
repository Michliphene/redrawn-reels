# Virality review: alaska-1867, pass 3

Video: `out/alaska-1867.mp4` (54.5 s), the fresh render after the pass-2 changes.
Evidence used for this pass:
- `python3 pipeline/virality_metrics.py alaska-1867`, run fresh.
- The 6 hook frames (0–3 s) and `loop_first_vs_last.jpg`.
- The 13 fresh beat sheets `beat_00`…`beat_12` and `cues.md`. `beat_11_loop.jpg` is a stale leftover from the previous render, so I ignored it.
- Extra frames at 0.03, 3.45, 3.8, 4.2, 4.5, 23.3, 29.3, 29.7, 30.4, 31.0, 31.6, 43.9, 44.6, 50.5, 51.9, 54.0 and 54.4 s. They are in `/tmp/claude-0/virality-tmp/p3_*.jpg`, with strips in `s1.jpg`, `s2.jpg` and `s3.jpg`.
- `episode.json`, `SOURCES.md`, virality pass 2, and `src/components/Overlays.tsx` (Callouts).

> This is a pattern-based estimate against `docs/VIRALITY_PLAYBOOK.md`, not a prediction. The biggest factor is one we can't control: how big the account is and how the first test cohort responds.

## Key metrics (pass 2 → pass 3)
| Metric | Pass 2 | Pass 3 | Read |
|---|---|---|---|
| Duration / words / pace | 52.6 s · 143 · 2.93 w/s | **54.5 s · 150 · 2.98 w/s** | +1.9 s for the oil payoff. Pace still in band. |
| First word | 0.25 s | 0.25 s | ok |
| Frame 0 | "$7,056,000" (a value that never existed) | **"$7,200,000 / FOR ALL OF THIS?"**, settled on frame 0 and frame 1 (0.03 s) | fixed |
| Cues / 10 s | 8.9 (47) | **9.4 (51)** | dense |
| Gaps > 2.5 s | 1 (2.88 s) | **0**. Worst is 2.06 s at 44.03 s (the 1959 camera move and badge are animating). 0 of 27 two-second windows are empty. | fixed |
| Loop SSIM | 0.863 | **0.863** | still ≥ 0.85, thin margin |
| Loudness | −14.2 | −14.1 LUFS | ok |

### What changed on screen (verified frame by frame)
- **Frame 0:** exact price, red Alaska, title and EP 2. It works paused and muted, and it's now safe as the default TikTok/Shorts thumbnail. Coins and the money bag give motion without rolling the digits.
- **Pointer → Texas handoff:** the pointer is gone by about 3.5 s. At 3.8 s and 4.2 s "Texas, same scale" reads cleanly inside Alaska with no arrow on top of it. There's a faint ghost residue in beat 01's first frame (4.5 s). That's cosmetic and doesn't cost points.
- **LATER MYTH:** at 60 px it fires at "largely" (about 29.5 s). It's readable through 31.0 s and gone by 31.6 s, so it's on screen for **about 1.8 s**, overlapping the Senate beat's opening as planned. It now reads as a verdict. **New, smaller issue:** at 60 px the stamp's fixed `top: -40` offset (Overlays.tsx l.84) puts it **over the end of the title**, so the frame reads "Seward's Fo~~lly~~". A screenshot is less self-explanatory than it could be (change 3).
- **Ending:** gold rushes (badge 1880 → 1899, Juneau/Nome markers) → 1959 + Texas ghost → **badge 1968, Prudhoe Bay marker, oil drum, pipeline "1977 (simplified)", "Largest oil field / in North America · Prudhoe Bay"** → "All of it, bought for…" with Alaska turning back to red and the title returning. The 1899-under-oil mismatch is gone. The ending now climbs (gold → statehood → the biggest prize) and lands on the price contrast, so it's a real payoff rather than a list.
- **SOURCES.md:** the "Script (as spoken)" section now matches all 13 spoken lines. The oil claim is logged with the DEC fact sheet. The today's-dollar value is logged as "not shown", with the reason.

## Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **23/25** | **Frame 0 (8/8):** exact number + question + shape + title, striking paused and muted. **Payload (7/7):** "$7.2 million… for all of this." **Place (4/5):** the title names Alaska on frame 0, but the shape floats with no neighbour context, and the "THIS IS ALASKA" pointer only arrives at 2.36 s (target < 1.5 s). **Text (2/3):** title (4 words) + label (4 words) = 8 words plus the number, one over the ≤ 7 target. **No throat-clearing (2/2).** |
| B. Retention | **24/25** | **Cue density (8/8):** 9.4 cues per 10 s, max gap 2.06 s, no empty 2 s window. **Escalation (5/6):** the end now builds to the biggest prize and snaps back to the price. "But… never consulted" adds a turn. The 1867 middle is still a dated sequence, though, and "And then?" is an and-then connector. **Re-hook (4/4):** "Ever heard it called Seward's Folly?" at 24.8 s (46 %). **Payoff (4/4):** "largest oil field in North America" → "All of it, bought for… $7.2 million." **Pace and captions (3/3):** 2.98 w/s, word-by-word. |
| C. Rewatch & loop | **10/10** | "All of it, bought for…" → "$7.2 million." (5/5). The oil payoff makes the restart land harder. SSIM 0.863 (3/3, margin 0.013). Dense pause frames: Native areas, gold markers, Texas overlay, oil plus pipeline (2/2). |
| D. Shareability & saves | **13/15** | **Send (6/6):** three DM-able facts: "2¢ an acre", "Seward's Folly = LATER MYTH" (now ~1.8 s at 60 px), and "largest oil field, bought for $7.2M". **Save (3/4):** reference map + EP 2, but no series promise. **Comment (2/3):** no honest in-video prompt, so the pinned question has to do the work. **Human stake (2/2):** Seward twice, Stoeckl, the treaty painting, and the "never consulted" turn. I'm upgrading this from 1 because the payoff now ties the people to stakes. The Native beat itself still has no face (see F). |
| E. Packaging | **9/10** | **Cover (3/4):** frame 0 is now a correct, strong TikTok/Shorts thumbnail. In the Reels 3:4 grid crop (middle 1080×1440), the title and EP tag (top ~240 px) are cut, so Instagram still needs a composed cover. **Caption (3/3):** written below. **Series (3/3):** REDRAWN + EP 2 on the hook and loop. |
| F. Niche codes & trust | **14/15** | **Transformation (4/4):** red → blue at "American", back to red on the loop. **Scale (3/3):** Texas in the hook and at statehood. **Faces (2/3):** small corner cards only. The Native beat is 3.5 s of italic labels with no person. **Sourcing and hedges (3/3):** every on-screen figure is in SOURCES. The hedges are there: "Historians point to", "approximate traditional areas", "flags stylised", "simplified", "dates vary" (logged). See the trust watch on the oil line below. **Anti-patterns (2/2):** no intro, logo card, wall of text or follow card. |
| **TOTAL** | **92/100 · 9.2/10** | **Tier: strong breakout odds** (pass 1: 80, pass 2: 86) |

### Trust watch (not deducted, but check before upload)
"The largest oil field in North America" is sourced (Alaska DEC fact sheet 2006, also PetroWiki) and is the standard description. But "largest" depends on the metric (area, original oil in place, or recoverable reserves). Mexico's Cantarell field is the obvious "well, actually" comment. I can't settle this from the logged sources. If you want zero exposure, there are two options that need **no new fact**:
- **(a)** Keep the wording and note the metric used by DEC ("~25 bn bbl originally in place") in the pinned comment.
- **(b)** Narrow to a claim the sourced one already entails: "the largest oil field in the US". That's safer but less striking.

I'd keep (a). Don't add "by far", "ever" or any ranking beyond what DEC says.

## Top 5 remaining changes, ranked by expected gain (none need new facts)

### 1. Point at Alaska before 1.5 s and trim the hook label to ≤ 7 words (+2: A place +1, A text +1)
Fire the pointer on "million." (0.67 s) instead of "That's" (2.36 s), and keep it ending before the Texas ghost (3.5 s). Shorten the bigNumber label so title + label = 6 words.
```json
{"type":"bigNumber","value":7200000,"prefix":"$","label":"FOR ALL THIS?","coins":true,"dur":0.5,"hold":3.45,"y":1080,"from":1,"atTime":0,"coinsCount":10},
{"type":"pointer","at":[-150,65],"text":"THIS IS ALASKA","from":[230,-230],"atWord":"million.","hold":2.6}
```
The pointer would then be on screen from about 0.7 to 3.3 s. Frame 0 (the cover) stays exactly as it is now, with three text blocks. "FOR ALL THIS?" carries the same meaning as the spoken "for all of this". If you'd rather keep "OF", move the money-bag sticker to `"atWord":"That's"` so the hook doesn't have pointer + bag + coins all arriving in the same 0.7 s. Check a still at frame 30 (1.0 s) to make sure the pointer label doesn't collide with the title (pointer label y ≈ 490 at 1080 scale. It's clear in the 3.0 s frame).

### 2. Turn "And then?" into a question with a defined shape (+1: B escalation)
"And then? Gold rushes." is the last and-then link in the spine. Make it the question the ending answers. The facts are unchanged: it introduces the same gold → statehood → oil sequence.
```json
{"id":"gold","say":"So what did America get? Gold rushes.", ...}
```
This adds 3 words (~1 s). Keep the markers on "Gold" and "rushes", which are unchanged. Update SOURCES "Script (as spoken)" line 10 at the same time. Don't use "The 'folly' paid off": it implies an economic verdict that isn't in SOURCES.

### 3. Lift the LATER MYTH stamp off the title (+1: D send clarity; it also protects the most-screenshotted frame)
In `src/components/Overlays.tsx` l.84, make the offset scale with the stamp size so a 60 px stamp sits on the box's top-right corner instead of over "Folly":
```tsx
<div style={{ position: 'absolute', right: -30, top: -(((a as any).stampSize ?? 38) * 1.7), ... }}>
```
That's −65 px at 38 (close to today's look for other episodes) and −102 px at 60. The paused frame then reads the full "Seward's Folly" with LATER MYTH stamped above it. Check a still at about 30.4 s (frame 912) to make sure the stamp clears the Alaska coast. If it hits the coastline, drop `stampSize` to 54.

### 4. Compose a 3:4-safe Instagram cover (+1: E cover)
This is outside the render. Upload a custom cover where everything sits inside the middle 1080×1440 (y 240–1680): red Alaska + Texas ghost, "$7.2M FOR THIS?" at the centre, a small "REDRAWN EP 2" tag at y ≈ 300. You can build it from a `npx remotion still` at frame 114 (3.8 s, Texas ghost visible) with the title layer moved down, or in any editor. TikTok and Shorts can keep frame 0.

### 5. Give comments an honest in-video handle without an end card (+1: D comment)
The loop has to stay clean, so put the prompt where it costs nothing: the myth beat. The sub-line already says "most 1867 papers were supportive or neutral". In the caption and pinned comment (not in the video), ask the question the beat invites:
> "Did you learn it as 'Seward's Folly' in school?"

It's honest (the myth is widely taught, per ADN and History.com in SOURCES), it's identity-based (US viewers answer yes or no), and it isn't political. If you want an in-video version, the only safe one is turning the myth line into a direct question ("Ever heard it called Seward's Folly?" is already that). So the realistic gain comes from the caption and pin.

Not ranked, because it needs a **new asset**, not a new fact: a public-domain photo of a Tlingit or other Alaska Native leader from the period in the natives beat (F faces +1). Start with `python3 scripts/loc_search.py "Tlingit chief"`, log the licence in `credits.json`, and caption only what the LoC record states. Don't imply the person was at the 1867 transfer.

Optional SSIM insurance (no points; the loop is already ≥ 0.85): the final frame's timeline sits at about 1968 against 1860 on frame 0. Giving the `loop` beat `"date":"1867"` would pull the timeline back toward the start, but it would also show a 1867 date badge, so test the still first. Skip it if the badge comes back.

Expected total if 1–5 are applied: about **97/100**. Realistically, about **95–96**, because of the Native-face point and the thin SSIM margin.

## 3 alternative hooks (all true per SOURCES.md)
| Archetype | Verbal line (0–2 s) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **A. Contrast / payoff-first** | "The largest oil field in North America. America got it for $7.2 million." (loop end: "…and all of it, bought for…") | Blue Alaska with the Prudhoe Bay marker and pipeline already drawn, plus a settled "$7,200,000" | `$7.2M FOR THIS?` |
| **B. Myth-bust** | "'Seward's Folly'? Most newspapers in 1867 didn't think so." (Hill 2019) | Red Alaska under the "Seward's Folly" callout with the LATER MYTH stamp already on it, plus the small Seward card | `"SEWARD'S FOLLY" = MYTH` |
| **C. Price per unit** | "About two cents an acre. That's what America paid for Alaska." | Red Alaska, settled "2¢", sub "≈1.9¢ · 375M ACRES" | `2¢ AN ACRE?` |

Recommendation: keep the current big-number hook. It now scores 23/25 (25 with change 1) and drives the verbal loop. A is the best A/B repost: it moves the new payoff to second 0. Its oil claim must stay exactly as worded in SOURCES, and the Trust watch above applies. B gets the most comments. C is the cleanest Shorts variant.

## Cover, caption, hashtags, pinned comment
- **Cover:** TikTok and Shorts use **frame 0 (t = 0.0 s)** (title, "$7,200,000 / FOR ALL OF THIS?", red Alaska, EP 2). Instagram uses the composed 3:4-safe cover from change 4. Don't pick 23.21–23.4 s as a cover: the "2¢" number rolls through "1¢" there.
- **Caption** (hook line ≤ 150 chars + 2 keyword lines):
  > Russia sold Alaska for $7.2 million, about 2 cents an acre. It became home to North America's largest oil field.
  > The 1867 Alaska Purchase on a map: Russian America, Seward's treaty, the 37–2 Senate vote, the Sitka handover, the gold rushes, statehood in 1959 and Prudhoe Bay.
  > "Seward's Folly"? Mostly a later myth. REDRAWN ep. 2, sources in the pinned comment.
- **Hashtags (5):** `#AlaskaPurchase #history #maps #geography #alaska`
- **Pinned comment:** the SOURCES.md text plus "Oil: Prudhoe Bay, ~25 bn barrels originally in place (Alaska DEC)". Then:
  > "Did you learn it as 'Seward's Folly' in school? And which US land deal should we redraw next: Louisiana or Gadsden?"

  Avoid "Should Russia want it back?", which invites a political pile-on.

## Platform notes
- **TikTok:** completion and rewatch rule. At 54.5 s with a clean verbal loop, this sits in the ~50 % completion band. The new payoff gives the restart a reason, so don't add an end card. Frame 0 is the default thumbnail and is now correct. "Alaska" is in the on-screen title and the caption, so it's searchable. The money bag (x 880) only grazes the right-side UI column.
- **Instagram Reels:** sends per reach. All three DM moments now hold long enough: 2¢ (1.6 s), LATER MYTH (~1.8 s), largest oil field (2.0 s). Change 3 makes the myth frame screenshot-clean. Upload the composed 3:4 cover. Hashtags don't add reach, but caption keywords do. Post natively with no watermark.
- **YouTube Shorts:** "viewed vs swiped" is decided on frame 0 and second 1, where the exact number plus question is strong. Change 1 adds the place cue inside second 1. Title: "Russia sold Alaska for 2 cents an acre". The native loop rewards "bought for… / $7.2 million." Put the sources in the description. If you A/B test here, use hook A or C.

VIRALITY SCORE: 92/100 (9.2/10) — strong breakout odds
