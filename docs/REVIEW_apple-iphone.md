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
