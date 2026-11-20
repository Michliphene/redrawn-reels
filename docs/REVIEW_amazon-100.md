# REVIEW — amazon-100 (RECEIPTS #007, raea, `raea/amazon-3d`)

> **Status after the fix pass (re-rendered `raea/amazon-3d/out/amazon.mp4`, 43.1 s; `raea check`: 0 errors, 19 reading warns).**
> Applied: #1 columns (unit mesh scaled to height), #2 all 100 cubes arrive on "$100" (servers stay cardboard until "$18", amber pulse on "$82"),
> #3 "$82," / "$18," back in the captions, #4 bigger hidden rack moved right of the plinth (x 2.4, z -3.6, scale 1.5), #5 `$717B` fades in on its word
> and out before "never", #7 pin offset 80 px, #8 "of operating profit · AWS" anchored on the AWS column, #9 conveyor starts on "expensive",
> #10 phrase cap 26 characters (the `len > 9` break is kept), #11 keywords reduced to never / keeps / smaller / cloud (the `$717B` is still lime).
> Not done: #6 hard cut on "smaller", the 4 s push and LED cascade on "renting"; #12 lime caps on the partial cubes; the "AWS" label on its column
> (part of #1). #13 needed no change. The virality pass is at the end of this file.

**Verdict: not postable yet, fixable in the composition without re-recording. Score 6.5/10.** The set is one
world: parcels on a plinth, then a pallet of 82 and a rack of 18 at "1 cube = $1". The lime keeps on the piles
(4.79 parcels, 6.36 servers, with the last cube only partly lit) read honestly with the sound off. Every on-screen
figure matches SOURCES.md, the source line stays on screen the whole time (y 1372), and the loop holds (first vs
last frame SSIM 0.998). The payoff is broken, though. The two "columns" that should prove "the smaller slice makes
57%" render as two small lime cubes floating in mid-air. The unit is also never shown: "Take $100" plays over an
empty pallet and an empty rack frame.

Checked: 36 frames at 540 w (0–43.0 s), 4 crops at 1080 w, the composition, timings.json, amazon.check.json, f19.render.json.

## 3 biggest problems
1. **The columns are broken (28.9–36.6 s).** `Columns` changes `Cuboid half_size` every frame, but the mesh keeps
   its first-frame size. The result is two HALF-size cubes hanging at `0.06 + h/2` with shadows on the floor, under
   a floating "SHOPPING" label. The comparison that carries the reel's thesis never appears.
2. **"Take $100 of it" shows no $100 (6.8–8.4 s).** For 1.6 s the shot holds an empty pallet and an empty rack frame
   under "1 CUBE = $1". The 100 cubes never exist as one whole, so the 82/18 split has nothing to split.
3. **The caption is broken when the figure is gone.** "SO OF ITS" (21.3 s) and "OF ITS" (24.6 s): `HIDE` removes
   "$82," and "$18," from the captions, but their pins ended at 16.5 s. The words that make those sentences readable
   are on screen nowhere.

## Findings
1. **[P1] share/year · 28.85–36.6 s · the columns render as floating cubes.** Build them from a unit mesh and set
   the height in the transform. In `Columns`:
   ```tsx
   <Mesh3d key={c.id} name={`col-${c.id}`} transform={Transform.fromXyz(c.x, 0.06 + h / 2, 0).withScale([fade, Math.max(0.01, h), fade])}>
     <Cuboid half_size={[HALF, 0.5, HALF]} />
   ```
   Also check `HiddenRack` (it animates position only, so it is fine) and the conveyor `belt` (only `y` changes, so
   it is fine). Re-check the "shopping" label at `[c.x, c.v*U+0.15, 0]`. Once the column exists, the label sits on
   its top as intended. Also give the AWS column a mono label "AWS", so the pair reads without the 57% pin.
2. **[P1] take · 6.78–8.41 s · no $100 on screen.** Bring all 100 cubes in on "$100" as neutral cardboard, then
   change what they are, without moving them, on "$82" / "$18". In `Split`:
   ```tsx
   const T100 = w("take", "$100");                    // 7.03
   // parcels: const at = T100 + (i / 100) * 0.6;   servers: const at = T100 + ((SHOP + i) / 100) * 0.6;
   // servers draw as <Parcel> until T.cloud, then cross-fade to <Server> (lit = ramp(t, T.cloud, 0.3))
   // on T.shop: pallet pulse, emissive amber 0.4 for 0.4 s (life(t, T.shop, 0.3))
   ```
   Move "1 cube = $1" to fade in on `T100` (`hundredO` already does), and make it larger: `mono(30, P.ink)`.
3. **[P1] shopkeep/cloudkeep · 21.28 s, 24.55 s · captions read "SO OF ITS" / "OF ITS".** Remove `"shopkeep:$82"`
   and `"cloudkeep:$18"` from `HIDE`. Those figures are no longer pinned at that moment, so the captions do not
   duplicate anything. (Alternative: re-show the $82/$18 pins muted from `B("shopkeep")` to `T.shopKeep`.)
4. **[P2] hook · 5.8–6.5 s · the "something you never see" reveal is tiny and hidden.** The rack rises directly
   behind the big box, about 60 px wide, partly under "AMAZON'S SALES · 2025". Move it to the right of the plinth
   and make it bigger: in `HiddenRack`, use `pos={[2.4 + (i % 2) * U * 1.5, …, -2.2]}` with `s={rise * 1.5}`,
   and pull `figO` out by `T.never - 0.2` so the reveal has the frame to itself:
   `life(t, w("hook","$717B"), T.never - 0.2 - w("hook","$717B"), 0.2)`.
5. **[P2] hook · 0.6 s · $717B lands 0.43 s before its word (1.03 s).** The same fix as #4 (`figO` starts on
   `w("hook","$717B")`). The early fade (opacity 0.17 at frame 19) is probably also what triggers the full-frame
   safe-area `error` in amazon.check.json (box 0,0,1080×1920). f19.render.json puts the text at y 657, so it is a
   false positive. Re-run `raea check` after the fix to confirm, and do not post with an `error` in the file.
6. **[P2] share/year · 27.9–36.4 s · no re-hook, and 4.3 s static on "in 2025, from renting computers".** The
   only big camera move is the travel at 6.5 s. Make a hard cut on "smaller": a low shot up the two columns
   (`d: 0.01` means a cut in `cameraAt`):
   ```ts
   shot(w("share","smaller") - 0.05, [SPLIT_X + 0.2, 1.2, 0], -4, 6, 13, 34, 0.01),  // low, columns tower
   shot(B("year") - 0.25, [RACK.x - 0.9, 1.1, 0], -22, 14, 22, 30, 4.0),              // slow 4 s push, not a 1 s move
   ```
   On "renting" (35.4 s), cascade the server LEDs bottom to top: `blink = ramp(t, w("year","renting") + i*0.03, 0.2)`.
7. **[P2] shop/shopkeep · 8.4–12.3 s, 23.2–28.7 s · pin labels sit on top of the cubes.** "SHOPPING" and "SHOPPING
   KEEPS" run across the top parcels (crop at 10.5 s and 23.5 s). In `Pin`, use `top = … py - size - 80` (was 44),
   or anchor pallet pins at `PAL_Y0 + 6 * U`.
8. **[P2] share · 28.99 s · the "of the profit" label is looser than the voice and the facts.** SOURCES:
   57% = 45,606 / 79,975 *operating* income. Change the label to `"of operating profit · AWS"` (width 520).
   At 29.2 s its right end also touches the rack top. With the column fix, anchor it on the AWS column (`dx={-60}`).
9. **[P2] ship · 16.5–18.1 s · 1.6 s with nothing new on "Shopping is the expensive part".** Start the conveyor
   on "expensive": `ramp(t, w("ship","expensive") - 0.1, 0.4)` in `Conveyor` (17.2 s instead of 18.1 s).
10. **[P3] captions · reading warns (39) · phrases flip every 0.5–0.8 s.** Raise the phrase cap from 20 to 26
    characters (`len + x.w.length > 26`) and drop the `len > 9` early break. That also removes the "LAST" /
    "YEAR." orphans in the hook. Re-run `raea check`. The warns that remain are acceptable at 84 px.
11. **[P3] accent · lime is spread too thin.** Captions turn "shopping" and "AWS" lime while their pieces are amber
    and blue, and the $717B is lime too. Use lime for the keeps only:
    `KEYWORDS = ["never", "keeps", "smaller", "cloud"]`, and render the hook figure in `P.ink`.
12. **[P3] shopkeep/cloudkeep · partial cube.** 0.79 and 0.36 are shown as a colour mix, so at reel speed 77 %
    lime reads as a full cube. Show the partial cube as a lime cap: scale `y` by `keep`, with a cardboard remainder
    underneath. This is optional.
13. **[P3] loop end · 41.8 s · the title fades back in over the last words.** It is needed for SSIM 0.998. It is
    fine because it lands after "doorstep…" starts, but the 1.3 s title triggers a reading warn. Keep it as is.

## Checks passed
- **Accuracy**: $717B (716,924), $82 / $18 (82.04 / 17.96), $103B shipping 2025 (102.7), $4.79, $6.36, 57%
  (57.03), $45.6B (45,606), all FY2025, all match SOURCES.md. 82 parcels + 18 servers = 100 cubes. 4.79 / 6.36 lit
  cubes are correct (`keepShare`). "per $100: our calc." is in the source line for the whole reel. No claim that
  the store loses money, and no claim that AWS pays no shipping.
- **Sync**: $82 8.41, $18 12.57, $103B 19.35, $4.79 23.21, $6.36 26.56, 57% 29.0, $45.6B 32.09, the box drop on
  "box" 40.09. All are taken from timings.json via `w()`, within ±0.05 s.
- **Safe area**: series bar at y 250, header at 324–400, pins clamped to 440–1150 and x 64–940 (max seen ≈ 900 at
  $6.36 / $45.6B), captions 1185–1350, source line 1372–1405. Nothing readable sits above 250, below 1440, or
  right of 930 under 860. Racks cut by the right edge are set, not text.
- **DA**: frame 0 is an object in a space (parcels on a lit plinth). Every text either hangs from x = 64 or is
  pinned to an object. There are no widgets, and the house style matches chipotle-3d (same bar, captions, source
  line).
- **Loop**: the last frame equals frame 0 (no figure, the title is back, the camera orbit is damped to 0).

---

# Virality pass 1 — amazon-100 (raea render, after the fix pass)

Video: `raea/amazon-3d/out/amazon.mp4` (43.1 s, 1080×1920, -14.3 LUFS). Pattern-based estimate, not a prediction:
the account's size and the first test cohort matter more than anything scored here.

## Evidence (measured)
`pipeline/virality_metrics.py` reads `out/<id>.mp4`, and `review_frames.py` fails on Windows (`drawtext`/fontconfig). The same
measurements were therefore run from a scratchpad copy pointed at the raea mp4. Frames are in `out/review/amazon-100/`
(`hook_*.jpg`, `hook_strip.jpg`, `loop_first_vs_last.jpg`, `beat_00…10_*.jpg`, `virality_metrics.json`).
- 43.1 s · first word 0.25 s · hook beat 6.24 s · 97 caption tokens. With the figures said in full ("seven hundred and seventeen billion
  dollars") that is about **128 spoken words**, so **≈3.25 w/s** over 39.4 s of speech, the top of the range.
- Pixel-level scene cuts: **0** (one continuous camera; the travels are eased over 0.9–1 s).
- Loop: SSIM first vs last frame **0.995** (both show the title, three parcels and the ring, with no figure).
- `raea check`: every hard check passes (safe areas, contrast, loudness, frozen). There are 19 `reading` warns (words on for 0.2–0.9 s).
- Cue timeline (composition + `timings.json`): 0 crane-in · 1.03 `$717B` · 5.45 camera + rack rises ("never") · 6.48 travel to the split ·
  7.03 100 cubes arrive · 8.41 `$82` + amber pulse · 12.57 `$18`, cardboard becomes servers · 16.37 travel · 17.2 conveyor · 19.35 `$103B` ·
  21.0 travel · 23.2 `$4.79` lime · 24.3 travel · 26.56 `$6.36` lime · 27.6 travel · 28.85 columns grow · 29.0 `57%` · 31.55 travel ·
  32.09 `$45.6B` · 36.46 low shot on the boxes · 37.9 crane to the rack, glow on "money" · 39.16 return · 39.85 box drop · 41.8 title.
  That is about 27 cues in 43 s (6.3 per 10 s). In the **longest quiet stretches**, only the slow orbit and the captions move:
  **1.7–5.45 s (3.75 s, inside the hook)**, **8.7–12.57 s (3.9 s, "the store, the sellers, the ads, Prime")** and
  **32.4–36.46 s (4.0 s, "in 2025, from renting computers")**. The cloud beat (13.2–16.37 s, 3.2 s) is borderline.

## 1. Scorecard

| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **18/25** | Frame 0 has depth: three plain parcels on a lit plinth, a lime ring and the title "Where $100 at Amazon goes". It works paused and muted, but it is calm: no number, no contrast, and the parcels fill about 15 % of the height (5/8). Sentence 1 is a big number with no stake, and "$717B" takes 2 s to say (1.03–3.01). The real gap ("most of the profit… something you never see") lands at 4.1–6.0 s, outside the window (4/7). "Amazon" is spoken at 0.25 s and is in the title on frame 0 (5/5). The 6-word title reinforces, but title + whisper + `$717B` come to about 14 words, and the whisper carries no payload (2/3). No throat-clearing (2/2). |
| B. Retention | **17/25** | Every beat has a camera travel or a 3D event, but three quiet stretches run 3.75–4 s, one of them in the hook (5/8). The spine is a true "but": 82 vs 18, then shopping is the expensive part, then it keeps $4.79 vs $6.36, then the smaller slice makes 57 %. The two definition beats (8.4–16.3 s) plateau (5/6). There is no mid-reel re-hook: "Shopping is the expensive part" at 38 % is a soft turn, and the strong line ("the smaller slice…") comes at 65 % with no cut (2/4). The hook promises the payoff and the world pays it at 23–31 s (keeps light up, columns grow). It is not buried, but it is not front-loaded either (3/4). At 3.25 w/s the voice is a little fast. Captions at 84 px are readable, with 19 short-word warns (2/3). |
| C. Rewatch & loop | **9/10** | "So next time a box lands on your doorstep… / Amazon took in $717 billion last year." The ellipsis carries the join, but it does not complete a sentence (4/5). SSIM 0.995 (3/3). The keeps frames (lime cubes on pallet and rack) and the columns are worth a pause (2/2). |
| D. Shareability & saves | **10/15** | The send fact is "AWS is 18 % of the sales and 57 % of the profit", shown as $4.79 vs $6.36 per $100. Non-finance viewers will not know it, and tech viewers get a "told you so" (5/6). Save value comes from the series and the per-$100 frame; there is no reference card (2/4). The script asks nothing, and the planned pinned question is generic (2/3). "Your doorstep" and "you see the boxes" address the viewer, but nothing is at stake for them (1/2). |
| E. Packaging | **9/10** | Frame 0 reads as a thumbnail (big title, parcels), but it has no number and no contrast. The best cover is mid-reel (3/4). There was no caption, so the one in section 4 is scored (3/3). The `RECEIPTS #007` bar and house look match #004 and #006 (3/3). |
| F. Niche codes & trust (RECEIPTS) | **13/15** | One visible split at 1 cube = $1: 82 parcels and 18 servers. The keeps then light up and become two columns (4/4). The anchor is an Amazon parcel, the most familiar object there is, with a $100 unit (3/3). Human stake: "you never see", "you see the boxes", "your doorstep". The viewer is addressed, not implicated (2/3). The source line stays on screen the whole time with "per $100: our calc.", and the 57 % pin now says "operating profit" (3/3). Caption fragments remain where a pinned figure is dropped: "IS AWS: COMPUTING POWER IT", "THE SMALLER SLICE MAKES OF", "THAT'S IN 2025,". The AWS column has no label, and the "shopping" column label is 24 px (1/2). |
| **TOTAL** | **76/100 · 7.6/10** | **Tier: can break out** |

The fix pass took the reel from broken to postable, because the 57 % payoff now exists in the world. Packaging keeps it out of the top
band. The contradiction (18 % of sales, 57 % of profit) is the whole reel, and nothing shows it before 23 s.

## 2. Top 5 changes, ranked by expected gain
All are in `raea/amazon-3d/compositions/amazon.tsx` unless marked. None changes a figure. Only #5 needs a re-record.

1. **Put the contradiction on frame 0 (whisper line) and tighten the hero. +4** (A frame 0 +2, A text +1, E cover +1).
   No re-record. Replace the whisper text (line 391) with a line that carries the payload:
   ```tsx
   <div style={{ fontFamily: "Instrument", fontStyle: "italic", fontSize: 54, color: P.lime, marginTop: 14 }}>most of the profit isn't in the boxes</div>
   ```
   - It is true: AWS = 57.03 % of operating income, so shopping = 43 %.
   - It keeps the owner's rule that a figure is on screen once. If the owner accepts one repeat, `18% of sales · 57% of the profit` is
     stronger (17.96 %, 57.03 %). Say "operating profit" if it fits.
   - The title fades back in on the last frame, so the loop still meets frame 0.
   - Bring the camera closer: `HERO = shot(0, [0.4, 1.6, 0], 22, 13, 15.5, 26)`. The parcels then read at about 20 % of the height.
     `OPEN` derives from `HERO`, so the loop holds.
   - Mirror the line in `public/episodes/amazon-100/episode.json` → `"whisper": "most of the profit isn't in the boxes"`.
2. **Fill the three 4-second quiet stretches with camera, not widgets. +3** (B new visual +2, B plateau +1).
   ```ts
   // hook: a slow push on the parcels while "$717 billion… last year" is said (≈2.2 → 5.1 s)
   shot(2.2, [0.4, 1.6, 0], 18, 11, 15.5, 28, 2.9),
   // shop: a dolly along the pallet on "the store, the sellers, the ads, Prime" (decorative: no layer stands for a share)
   shot(w("shop", "store,") - 0.1, [PAL.x + 0.3, 0.9, 0.6], -2, 10, 14, 30, 1.6),
   // year: replace the existing 1 s move with a slow 4 s push up the rack
   shot(B("year") - 0.25, [RACK.x - 0.9, 1.1, 0], -22, 14, 22, 30, 4.0),
   ```
   - Insert these into `SHOTS` in time order.
   - On "renting" (35.4 s), cascade the server LEDs from bottom to top: `blink = ramp(t, w("year","renting") + i * 0.03, 0.2)` (REVIEW #6).
   - **Truth flag:** do not light four bands of the pallet as "store / sellers / ads / Prime". The 10-K does not split shopping's sales or
     profit that way: ads ($68.6B) and subscriptions ($49.6B) are sales, not profit. A sized band would invent a fact.
3. **Mid-reel re-hook: a hard cut on "smaller" to a low shot where the AWS column towers. +2** (B re-hook +2). This is REVIEW #6, not done yet.
   - Add `shot(w("share","smaller") - 0.05, [SPLIT_X + 0.2, 1.2, 0], -4, 6, 13, 34, 0.01)` (`d` 0.01 = a cut), with a `stamp` sfx on the cut.
   - Add the missing mono label "AWS" on the cloud column, mirroring "shopping" at line 418, and raise both to `mono(28, P.lime)`:
     ```tsx
     {[{ x: COL.shop, v: SHOP_KEEP, name: "shopping" }, { x: COL.cloud, v: CLOUD_KEEP, name: "AWS" }].map((c) => …)}
     ```
   - Check that "AWS" does not collide with the 57 % pin (`dx={-30}`). If it does, move the pin to `dx={-90}`.
4. **Fix the caption fragments left by hidden figures. +1** (F anti-patterns).
   Make a dropped figure always close the phrase, not only before punctuation. In `PHRASES`:
   ```ts
   if (HIDE.has(`${b.id}:${bare(x.w)}`)) { if (cur.length) { out.push(cur); cur = []; len = 0; } continue; }
   ```
   - Result: "THE SMALLER SLICE MAKES" | "OF AMAZON'S OPERATING PROFIT."
   - "IS AWS:" stays short, which is fine because it follows the $18 pin.
   - "THAT'S" becomes an orphan. Accept it, or merge one-word phrases into the next one.
5. **A loop line that completes the first, and a stake for "you". +2** (C loop +1, D stake +1). This needs a re-record. The pipeline
   regenerates the whole voice, and `w()` re-times every cue automatically.
   - `loop` say: `"So next time a box lands on your doorstep, remember:"`. It runs into "Amazon took in $717 billion last year." as one
     sentence across the cut, and no fact changes.
   - Optional, in the same re-record: `point` → `"You see the boxes. The money is in the cloud you never see."` This echoes the hook
     phrase, and the claim is unchanged.

With all five done, the estimate is **≈88/100**. To reach the top of "strong breakout odds" the hook also needs the verbal fix
(alternative A below). Not ranked, but worth doing with #3: the lime partial-cube caps (REVIEW #12), so that 0.79 and 0.36 read as part
cubes at reel speed.

**Truth flag for every edit:** the title "Where $100 at Amazon goes" can be read as "$100 you spend at Amazon", but shoppers do not pay
AWS's revenue. "Take $100 of it" (of the $717B) and the "Amazon's sales · 2025" label keep the reel honest. **Never** write a hook as
"of every $100 *you spend* at Amazon". It is false for the $18.

## 3. Alternative hooks (all true per SOURCES.md)

| Archetype | Verbal line (sentence 1) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **A. Contradiction** (recommended) | "Of every $100 Amazon took in last year, $18 made most of the profit." (17.96 → 57.03 % of operating income) | The split already built, with 82 parcels on the pallet and 18 servers in the rack. The rack's top 6 servers are lit lime, and a low camera makes the rack look tall | `$18 OF $100 → MOST OF THE PROFIT` (7 words) |
| **B. Myth-bust** | "Amazon's boxes aren't where most of its profit comes from." (shopping = 43 % of operating income) | The hero parcels on the plinth, with the dark rack already half-visible behind them and one LED blinking | `MOST OF THE PROFIT ISN'T HERE` |
| **C. Guess / comparison** | "Amazon's store keeps $4.79 of every $100. Guess what the other part keeps." (paid off at $6.36) | The pallet with 4.79 cubes lit lime, and the rack in shadow with a mono `?` pinned above it | `STORE KEEPS $4.79. AND AWS?` |

A and C make "Take $100 of it" redundant. Cut the `take` beat, or shorten it to "Here's the $100." Re-record, then check that the loop line
still joins the new sentence 1. "…doorstep, remember: of every $100 Amazon took in…" works.

## 4. Cover, caption, hashtags, pinned comment

**Cover:** a still at **≈30.3 s**: the 57 % pin over the two lime columns, with the rack and the pallet both in frame and the caption
"AMAZON'S OPERATING PROFIT." Better, compose the cover from that frame: drop the caption and set `18% OF SALES. 57% OF PROFIT.` in Display
110 at y 330–560 over the columns. Both figures are sourced, and the once-only rule covers the reel, not the cover. Where the platform shows
frame 0 (Shorts), change #1 does this job.

**Caption** (a hook line under 150 characters, then 2 keyword lines):
> Amazon's boxes aren't where most of its profit is. $100 of its 2025 sales, split from the 10-K.
> Where Amazon makes its money: AWS (cloud computing) vs the online store, ads and Prime. Segment operating income, Amazon 10-K annual report 2025.
> Per $100 of sales: shopping keeps $4.79, AWS keeps $6.36 (our calculation). Not financial advice.

**Hashtags (4):** `#Amazon #AWS #CloudComputing #BusinessExplained`

**Pinned comment:** keep the SOURCES.md text. Add one line before the question, and replace the question:
> The $100 is $100 of Amazon's total sales (shoppers + AWS's business customers), not a shopping basket.
> **Before this video, which half did you think made more money: the store or AWS?**

The question is honest and tied to the payoff. It invites "I knew it" and "no way" replies without a false claim.

## 5. Platform notes
- **TikTok:** 43 s is right for completion. Do not stretch to 61 s for Creator Rewards; that would be a different edit. TikTok search reads
  the caption and the on-screen text, so the whisper change (#1) also helps search. Pick the 30.3 s cover in the editor.
- **Instagram Reels:** sends per reach is the lever. The 18 % vs 57 % contrast is the line people will DM, so put it on the cover and in
  caption line 1. If the account is small, use Trial reels for a cold test. Keep 3–4 hashtags; more do not add reach.
- **YouTube Shorts:** the "viewed vs swiped away" metric is decided between frame 0 and 1 s, and the cover is less visible in the feed. Change
  #1 (the contradiction in the whisper) matters most here, and alternative hook A is the best Shorts cut. Title: "Where $100 at Amazon goes
  (AWS vs the store) #shorts". The 0.995 loop helps replays.

VIRALITY SCORE: 76/100 (7.6/10) — can break out

## Pass 2 (2026-11-20): virality fixes 1–4 applied, re-rendered on raea 0.1.8-rc11
- Whisper under the title is now "most of the profit isn't in the boxes" (frame 0 states the contradiction); HERO camera closer (dist 15.5, fov 26).
- Camera moves in the quiet stretches: push-in 1.75–5.3 s, drift over the pallet 8.75–12.2 s then over to the rack for "$18", slow orbit on the rack 32.5–36.3 s; LED cascade up the rack on "renting".
- Hard cut on "smaller" (low angle from the other side). Both columns carry a label (shopping / AWS); the 57% pin reads "of operating profit".
- Captions: a dropped figure always closes the phrase; phrases over 26 characters split into balanced parts.
- raea check: 0 errors, 20 reading warnings (short caption fragments); −14.3 LUFS, −1.5 dBTP. Fix 5 (loop line "…doorstep, remember:") not done: needs a new voice take.
