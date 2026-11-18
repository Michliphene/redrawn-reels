# REVIEW — apple-iphone (RECEIPTS #004, DA 2)

## Reel review

**Verdict: not postable as is. Score: 7/10. Ready to post after the two P1 fixes and the owner's 10-K tick.**
The figures are clean (every one on screen matches `SOURCES.md`), the money story reads well (grid → grid → card → bars → strike) and the
camera returns cleanly to frame 0 at the loop. The problems are layout and dead air, not the content.

Biggest problems:
1. **The `$390` ghost sticker on the hook sits under the action-button rail.** It is anchored at `right: 64` and rotated 5°.
   Its right edge reaches x≈950 at y 880–1040, past the limit of x=930 below y=860.
2. **The `NOT APPLE'S BEST BUSINESS` callout (8.0 s) covers the `OF APPLE DEVICES · FY2026` tag.** On a `product` scene the callout
   slot (top 1082) and the tag (top 1078) are the same rectangle. `y` cannot move it lower because it is capped at 1082.
3. **Dead air.** From 5.96 s to 8.01 s ("That's huge for hardware") nothing changes on screen. In `turn` (18.27–23.12 s) the
   services grid sits empty: one chip shows from 19.87 s to 22.07 s and nothing marks "Now the money that comes after".

Pre-flight: `! hook lasts 5.4 s`. **Justified**: the first spoken word is "$1,000", it is on screen at frame 0, and the stake
($390 sticker) lands at 3.45 s. The voice is already recorded, so no script change. Loudness −14.1 LUFS OK. Loop SSIM 0.82: the
camera and title return correctly. The gap comes from the end-frame caption and from the whisper, which is absent at frame 0 but
present at the end (see 10).

### Fix list

1. **[P1] hook · 3.45–5.65 s · `$390` ghost crosses the rail (x≈950 at y≈880).** Component fix in `src/money/Money3D.tsx`
   `ProductOverlay`: anchor the ghost to the rail, not the safe right edge. Change `right: 1080 - SAFE.right` to
   `right: 1080 - SAFE.railX + 12` (the 12 px make up for the 5° rotation). Check with `--props '{"guides":true}'` at 4.0 s.
   This applies to every RECEIPTS reel that uses `ghost`.
2. **[P1] notbest · 8.01–9.6 s · the callout covers the price tag.** The kicker already says "Not the best one" and the caption says it
   too, so remove the callout and spend the beat's dead start on the object instead:
   ```json
   "actions": [
     { "type": "pulse", "target": "tag", "atWord": "huge" },
     { "type": "pulse", "target": "price", "atWord": "best" }
   ]
   ```
   Durable fix (component): in `ProductOverlay` scenes, have callouts use `top: 1150 - h` or hide the tag while a callout lives.
3. **[P2] turn · 18.27–19.87 s · "Now the money that comes after" has no visual change except the hint.** Add a chip on "Now"
   that ends before the list chip:
   ```json
   { "type": "callout", "text": "AFTER THE SALE", "atWord": "Now", "hold": 1.4, "size": 50 }
   ```
   Keep `hint` on "Now". Optionally shorten the list chip to `"hold": 2.6` so it stays until "Of every" (22.6 s). That closes the
   3.25 s gap at 19.9 s.
4. **[P2] hook / share / profit · frame 0, 27–37 s · horizontal stipple streaks on the far floor.** At grazing pitch the dithered
   counter turns into long dashes (clearly visible at frame 0, which is the hook, and behind the bars). Raise the stations a little:
   ```json
   "phone":  { ..., "camera": { "pitch": 26 } },
   "share":  { "type": "card", ..., "camera": { "pitch": 20 } },
   "profit": { "type": "bars", "max": 150, "camera": { "pitch": 17 } }
   ```
   The crane-in subtracts 9° on the hook, which gives 17° at frame 0 instead of 10°. Re-check stills at 0, 27.5 and 33.5 s.
5. **[P2] share · 28.2 s · `26%` is computed (123,301 / 478,834) but not labelled as ours. `40%` uses a different word than the voice.**
   The voice says "what's left after costs" everywhere. The screen switches to "gross profit" only here.
   ```json
   { "type": "stat", "value": "26%", "label": "of sales", "sub": "our calculation", "atWord": "quarter" },
   { "type": "stat", "value": "40%", "label": "of what's left", "sub": "after costs · our calculation", "atWord": "40%" }
   ```
6. **[P2] share · 27.1–28.2 s · the card on the counter is blank.** It shows placeholder lines, and `cardTitle: "SERVICES"` /
   `cardSub` are not drawn on it, so for 1.1 s the subject has no name. Component: print `cardTitle` in Display on the lime header
   of the card (as an HTML overlay pinned with `toPx` to the card top), `cardSub` in Mono under it.
7. **[P2] profit · 32.5–33.6 s · the services bar counts up through `$93B` while the voice says "$94B".** `toFixed(0)` of 93.9×g shows
   93 until the very end. Use `"value": 93.9, "decimals": 0` with a final snap. Component: `barGrow` reaches 1 within 0.5 s, or
   round with `Math.round(a.value) * g`. Episode-only alternative: `"value": 94` (SOURCES: 93,943 → "$94B"; this is within rounding).
8. **[P2] profit · 32.5 s · `$234B` (128 px, white) appears first and is louder than the number that is spoken and matters (`$94B`).**
   It is never said aloud. Delay it to the second sentence, where it gives context to "two thirds":
   `{ "type": "big", "value": "$234B", "label": "gross profit · FY2026", "atWord": "Two" }`. Or drop it; the kicker already gives the frame.
9. **[P2] all grids · computed amounts (`$610`, `$390`, `$24`, `$76`) are not marked as ours on screen.** Per CLAUDE.md, computed
   figures must be labelled. The cheapest fix is in the scene tags:
   `"kicker": "$1,000 of devices · 1 tile = $10 · our calculation"` (same for `turn`: `"$100 of services · 1 tile = $1 · our calculation"`).
   If that is too long for one line at 84 px, put it in the hook tag instead: `"tag": "OF APPLE DEVICES · FY2026 · AVERAGE"`.
10. **[P3] hook · frame 0 · the whisper fades in, but it is fully present on the loop tail.** Frame 0 should be the final title block,
    which would also lift loop SSIM. Component: in `TitleBlock`, skip the whisper intro when `t < 0.05`, or start the
    whisper at opacity 1.
11. **[P3] profit / grid / card · type under 28 px:** bar names `DEVICES`/`SERVICES` are 22 px, the stat `sub` is 20 px, the
    ghost label and the big label are 24 px. Component: bar label Mono 22→28, stat sub 20→24, ghost label 24→28. The source footer
    (20 px) is a house standard; leave it.
12. **[P3] point · 37.7–40.1 s · `THE PRODUCT` strike and `THE STOREFRONT` are printed across the dimmed phone.** They stay readable
    thanks to the dim, but the strike line crosses the phone's top. `scenes.point.camera: { "yaw": 40 }` moves the phone right of the
    text column. Also, the kicker "The real product" half-contradicts "isn't *just* the product". Better: `"kicker": "So what is it?"`.
13. **[P3] keywords:** `"subscriptions"` is never said, so remove it. Add `"left"` only if you want "left after costs" to pop; otherwise fine.
14. **[P3] hook · 0.62 s · `pulse` on `$1,000`** works; no change.

### Checks passed
- Sync: every cue lands on its word (±0.2 s): `$610` fill 11.41, `$390` rest 14.01, `doesn't` 15.67, `quarter` 28.22, `40%` 30.21,
  `storefront.` 39.56. Every callout ends inside its scene.
- Accuracy: 39.3 %→$390/$610, 76/24, 26 %, 40 %, $234B / $140B / $94B and 2/3 all reproduce from the facts table. FY2026 is named on
  screen. The text "iPhone alone: not disclosed" covers the device-average simplification. No logo; the phone is generic.
- Safe area: the header, kicker, captions (1170–1410) and source line (y 1416) are clear. The `≈ 2/3` callout ends at y≈1150, above the captions.
- Source line on screen for the whole reel. The accent is limited to figures and keywords.
- One camera idea per beat (travel between stations, orbit on stage, crane-in on the hook and return to it at the loop).

## Virality review

Pass 1 · final render `out/apple-iphone.mp4` (after the reel-review fixes) · beat sheets regenerated from that render.
Metrics (`pipeline/virality_metrics.py`): 42.5 s · 114 words · 2.92 w/s · first word 0.25 s · hook sentence 5.4 s ·
5.6 cues/10 s · 3 of 21 two-second windows with no new cue · longest gaps 3.25 s @ 19.87 (turn → svc), 2.83 s @ 0.62
(inside the hook, covered by the crane-in), 2.60 s @ 11.41 · −14.1 LUFS · loop SSIM 0.848.
*This is a pattern-based estimate, not a prediction. Account size and the first test cohort matter more than anything scored here.*

### Scorecard

| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **19/25** | Frame 0 has depth and reads paused and muted: the phone on its plinth, `THE IPHONE IS A STOREFRONT` and a large lime `$1,000` (6/8). Sentence 1 has two numbers, but "$390 left once they're built" means nothing to a viewer who does not already know that a 39% margin is high. The surprise ($76 of every $100 on services) waits until 25 s (4/7). Apple and the iPhone are named on frame 0 (5/5). On-screen text is short, but "storefront" is abstract and the frame-0 whisper is missing (2/3). No throat-clearing (2/2). |
| B. Retention | **19/25** | Cue density is good and the camera travels between stations. Two thin spots remain: 19.9–23.1 s (one chip on an empty grid) and the 3.4 s before the `$390` stamp (6/8). The but-therefore spine is clean ("huge… but not the best", "only a quarter… but 40%"). The devices grid restates the hook's $390 at 14 s, so 9.7–18 s plateaus a little (4/6). "Now the money that comes after" at 18.3 s (43%) works as a re-hook: new scene plus `AFTER THE SALE` chip. Verbally it is soft (3/4). The payoff (40% / $94B / strike-through) lands at 71–95% and the hook promise is kept (3/4). 2.92 w/s and captions are readable (3/3). |
| C. Rewatch & loop | **8/10** | "And it all starts when you…" → "Spend $1,000…" is a real sentence join (5/5). SSIM is 0.848, just below the 0.85 line, because the whisper is missing at frame 0 and present on the tail (2/3). The bars and the 26/40 card are worth a pause; the grids less so (1/2). |
| D. Shareability & saves | **9/15** | "A quarter of sales, 40% of what's left" is a solid send among people who follow tech and finance, but it arrives late and is phrased as gross-margin talk (4/6). Save value comes from the series number only, with nothing to keep for reference (2/4). The script asks no question; the pinned comment has to do that work (2/3). The viewer's own subscriptions are never made personal (1/2). |
| E. Packaging | **9/10** | Frame 0 works as a cover: title plus `$1,000` (3/4, because "storefront" needs the second line to make sense). Caption written below (3/3). The `RECEIPTS #004` chip and the house look are consistent (3/3). |
| F. Niche codes & trust (RECEIPTS) | **12/15** | Two visible splits (61/39 tiles, then 24/76) (4/4). `$1,000` is close to an iPhone price, but it is "Apple devices", an average, so the anchor is soft (2/3). "Spend…" / "when you…" use the second person only thinly (2/3). The source footer runs the whole reel, `our calc.` / `our calculation` labels are on, and "iPhone alone: not disclosed" is on screen (3/3). Anti-patterns: the hook stamp `$390 LEFT AFTER COSTS` sits on a phone and could be screenshot as "Apple makes $390 per iPhone", and the 20–24 px labels are small (1/2). |
| **TOTAL** | **76/100 · 7.6/10** | **Tier: can break out** |

Truth check on the script: "it's not Apple's best business" is true **by margin** (76.2% vs 39.3%). It is **not** true by dollars: devices
made $139.7B of gross profit against $93.9B for services. The kicker `BIG MARGIN. NOT THE BEST ONE.` makes this exact, so keep it. Do not
shorten it to anything that reads as "services make more money than devices". The same rule applies to every caption and cover below.

### Top 5 changes, ranked by expected gain

1. **Put the $76 contrast on frame 0 through the whisper, and make the whisper present from frame 0** (no voice change). Gain **+3** (A frame 0 +1, A payload +1, C SSIM +1).
   ```json
   "whisper": "Services keep $76 of every $100."
   ```
   Change the component (reel review #10, not yet applied, since frame 0 has no whisper): in `src/studio/ui/Hud.tsx` `TitleBlock`, drop the `inP` fade-in so the
   whisper is at full opacity from t = 0. "Keep" here means left after cost of sales (SOURCES: 76.2% services gross margin). If the owner wants the house wording, use
   `"$76 of every $100 of services is left."`. That is 8 words and still fits in one line at the whisper size.
2. **Optional re-record, one beat only (`notbest`): move the services contrast from 25 s to 6 s.** Gain **+3** (A payload, B escalation, D send). Re-record this if
   anything is re-recorded. The hook sentence and the loop join stay the same; only beat 2 changes:
   ```json
   { "id": "notbest", "kicker": "Big margin. Not the best one.",
     "say": "That's huge for hardware. Spend it on Apple's services, and about {$760|seven hundred and sixty} is left.",
     "actions": [
       { "type": "pulse", "target": "tag", "atWord": "huge" },
       { "type": "ghost", "text": "$760", "label": "SERVICES · LEFT AFTER COSTS", "atWord": "$760", "hold": 2.2 }
     ] }
   ```
   Fact: 1,000 × 76.2% = $762, so "about $760" (our calculation). Add the derivation line to SOURCES.md before recording. Beat `svc` ($100 → $76) then reads as
   the proof, and the 40% beat escalates from it. Cost: about +1.5 s and one ElevenLabs take. The rest of `timings.json` shifts, so re-run validate and stills.
3. **Close the two dead windows with cues only** (no voice change). Gain **+2** (B new visual).
   - Hook, 0.62 → 3.45 s: add `{ "type": "pulse", "target": "tag", "atWord": "Apple" }` so `OF APPLE DEVICES · FY2026` bumps at about 1.6 s, where "Apple devices" is spoken.
   - turn → svc, 19.87 → 23.12 s: start the services fill on the first word of `svc`:
     `{ "type": "fill", "count": 24, ..., "atWord": "Of", "dur": 1.6 }`. This brings the gap to about 2.8 s; the existing `hint` blink also keeps the grid alive.
4. **Defuse the "$390 per iPhone" misreading on the hook stamp** (no voice change). Gain **+1** (F anti-pattern). It also protects shares from "this is wrong" replies.
   ```json
   { "type": "ghost", "text": "$390", "label": "LEFT · ALL DEVICES AVG", "atWord": "$390", "hold": 2.2 }
   ```
   It matches the `left · all devices` legend at 14 s.
5. **Make the comment trigger and the second person do some work** (outside the video, plus one kicker). Gain **+2** (D comment, D stake).
   Use the pinned-comment question below. Change `point.kicker` from `"The real product"`, which half-contradicts "isn't *just* the product", to
   `"So what are you buying?"`. That puts "you" on screen before the loop line "…when you".

With 1, 3, 4 and 5 (no re-record): about **82/100**. With the beat-2 re-record as well: about **85/100**.

### 3 alternative hooks (all true to SOURCES.md)

| Archetype | Verbal line | Frame-0 visual | On-screen text |
|---|---|---|---|
| **Comparison** (best; needs a re-record of beat 1, and the loop still works because it starts with "Spend") | "Spend {$100} on Apple devices, and about {$39} is left after costs. On Apple services? About {$76}." | The phone plinth on the left and a services grid on the right, two stamps `$39` / `$76` | `$39 vs $76` |
| **Contrarian** | "A quarter of Apple's sales brings in forty percent of what's left after costs. And it isn't the iPhone." | The 26% / 40% card already on the counter, the phone small behind it | `26% OF SALES. 40% OF THE MARGIN.` |
| **Second person** | "You pay Apple once for the phone. Then you keep paying, and that's where its margin is." (Then go straight to the $1,000 split.) | The phone with app tiles lit and a receipt sliding out | `THE PHONE IS ONLY THE START` |

The contrarian line says "isn't the iPhone" in the sense that services are not the iPhone. Never say "the iPhone isn't profitable" or anything like it,
because the iPhone margin is not disclosed. If the comparison hook is recorded, the loop tail stays as it is ("…when you" → "Spend"). Change the hook ghost
to `$39 · ALL DEVICES AVG` (39.3% of $100) and the hook `price` to `$100`.

### Cover, caption, hashtags, pinned comment

- **Cover:** frame 0 (0.0 s) once fix 1 is in: title + whisper + `$1,000`. For a composed cover, use the same set with two lines in Display:
  `DEVICES: $39` (amber) / `SERVICES: $76` (lime), Mono under them: `LEFT OF EVERY $100 · APPLE FY2026 · OUR CALC.`
- **Caption (hook line, 119 chars):** `Spend $1,000 on Apple devices and about $390 is left after costs. Spend $100 on Apple services? About $76 is left.`
  - `Apple 10-K fiscal 2026: iPhone, Mac and iPad margin vs App Store, iCloud, AppleCare and ads.`
  - `Services: 26% of Apple's sales, 40% of its gross profit (our calculation). Not financial advice.`
- **Hashtags (4):** `#Apple #iPhone #AppStore #BusinessExplained`
- **Pinned comment:** keep the SOURCES.md text and add the question first:
  *"Be honest: how much do you pay Apple every month after the phone (iCloud, Music, AppleCare, apps)? Guess before you check your subscriptions."*

### Platform notes

- **TikTok:** 42.5 s is the right length for completion and rewatch, so do not stretch it to 61 s for Creator Rewards. A 61–70 s cut would be a different
  edit (add the R&D/SG&A layer), not this one slowed down. Put the caption hook line in the first 70 characters. On-screen text is what TikTok search reads, so fix 1 helps search too.
- **Reels:** sends per reach is the signal that matters. The "$39 vs $76" comparison is the send, so put it in the cover and the first caption line. Upload the clean
  render with no TikTok watermark. Hashtags have no effect on reach here, so keep 3–4.
- **Shorts:** "viewed vs swiped" is decided in the first second, and frame 0 has to carry the contrast because many Shorts viewers start muted. Fix 1 matters most here.
  Shorts loops automatically, so the "…when you" → "Spend" join pays off directly. Title field: `Apple keeps $76 of every $100 of services (FY2026)`.

VIRALITY SCORE: 76/100 (7.6/10) — can break out

## Applied after both reviews (no voice re-record)
- Reel review P1/P2: sticker inside the button rail (`Money3D` ProductOverlay, all DA 2 RECEIPTS episodes on re-render),
  tag/price pulses instead of the overlapping callout, "our calculation" labels, camera pitches 26/20/17, services bar 94,
  `$234B` on "Two", AFTER THE SALE + APPS chips. Kickers shortened (the "1 tile = $x" note wrapped badly).
- Virality: whisper "Services keep $76 of every $100.", tag pulse on "Apple", svc fill on "Of" (gap 3.25 → 2.78 s),
  stamp label `LEFT · ALL DEVICES AVG`, point kicker "So what are you buying?".
- NOT applied: whisper visible on frame 0 (shared `Hud.tsx`, would change every DA 2 episode — owner decision);
  `notbest` re-record with "$760" (owner decision).
- Final metrics: 42.5 s, −14.1 LUFS, loop SSIM 0.847, longest gap 2.78 s.
