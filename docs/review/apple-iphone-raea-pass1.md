# REVIEW — RECEIPTS #004 "The iPhone is a storefront", RAEA EDITION (pass 1)

Video: `raea/apple-iphone-3d/out/storefront.mp4` (42.4 s). Cues: `raea/apple-iphone-3d/compositions/storefront.tsx`.

## Verdict
**Postable after 3 small fixes. 7.5/10.** It still reads as RECEIPTS: same palette, series bar, Display/Mono/Whisper type from one left
margin, source line on screen the whole reel, and a real camera that travels through one set. Figures all match `SOURCES.md`.
The weakness is scale: the 3D set is small and sits in a thin strip (y 550-900). The type carries the reel and the world is
decoration on the hook and the share beat.

Biggest problems
1. **The world is too small and unlabelled where it matters.** The phone on frame 0 is about 200 px tall in a 1080 px frame. In `cost` the red tray has no label. In `share` and `profit` nothing says which column or tower is devices and which is services (colour only).
2. **Layout collisions:** the `$390` stamp covers the end of `OF APPLE DEVICES · FY2026` (hook); the `26%` figure overlaps the clipped lime tiles at the left edge (share); chapter kickers wrap as `... · OUR / CALC.`
3. **Dead stretch 6.0-9.4 s** (notbest): same frame, `$1,000` figure unchanged, only the captions move.

## Pre-flight (raea check)
0 errors, 50 `reading` warnings. Most come from the one-word caption phrases that `PHRASES` splits (`len + w.length > 20` and the punctuation rule),
for example "left", "once", "they're", "built." Fix 8 below. They are not a blocker, but they match the choppy captions I saw.

## Fix list (all in `storefront.tsx`)
1. **[P2] hook · 0-5.7 s · frame 0 is quiet.** The phone is tiny and nothing is lit but the ring. The old render opened on a bigger object.
   Tighten `HERO`: `pos: [11.5, 5.6, 24]`, `fov: 28`, so the phone fills about 1.6x more. Re-check that the plinth stays above y 1100 and below the title block (y 324-560).
2. **[P1] hook · ~3.5-5.7 s · the `$390` stamp hides the end of "FY2026".** In `Overlay`, the hook stamp is `abs(600, 880, ...)` and the `$1,000` label (mono 32) is about 580 px wide. Move the stamp to `abs(560, 700, ...)`
   (above the figure, beside the phone), or shorten FIGS[0].label to `"of devices · FY2026"`. Keep its right edge at or under `SAFE.railX - 12`.
3. **[P1] share · 29-32 s · `26%` figure sits on the clipped services tiles.** At the left edge the lime tiles of `Shop` are cut by the frame and run under the figure (x 0-60, y 850-920).
   In `SHOTS`, change the `share` shot `look` x from 17.99 to 17.2 so the columns sit right of the figures and the shop tiles leave the frame, or fade `Shop` after `B("share")`: `const gone = 1 - ramp(t, B("share")-0.2, 0.5)`, scale the tiles by it.
4. **[P2] share/profit · which is which.** Add two tiny Mono tags in `Overlay` at the column and tower slots: `SERVICES` in lime and `DEVICES` in amber, placed above each figure (`top: 840`), appearing with `w("share","quarter")` and `w("profit","$94B")`. Today the viewer must decode the colour. In `profit`, the figures sit at `left: SAFE.left` and `+420`, while the towers are right of centre and partly blurred by `DepthOfField`. Move the `profit` shot `look` x from 29.11 to 28.2 so each tower stands over its number, or raise `aperture_f_stops` to 5.
5. **[P2] cost · 11-14 s · the red tray is unlabelled.** The `$610` figure is the only link. Add a `Text3D` "COST" on the tray in `Tray`, or add `{ at: w("cost","pays"), hold: 2.0, text: "Cost of making", top: 1100 }` to the chip list in `Overlay`. Also, the 39 kept coins use `glow(P.amber, ...)` only after `$390`, so before it they are olive. Raise their base colour: `color = P.gold` and `em = 0.25` by default.
6. **[P2] notbest · 6.0-9.4 s · dead air.** Add two cues: on `w("notbest","huge")` pulse the ring (`flare`-style: `life(t, w("notbest","huge"), 0.8)` added to the `plinth-ring` emissive), and on `w("notbest","best")` a chip `Not Apple's best business` at `top: 1100` using the existing chip list. The camera also holds the same angle for 3 s.
7. **[P3] kickers wrap.** `KICKERS` use `display(80)`, so `$1,000 OF DEVICES · OUR CALC.` breaks as `OUR / CALC.`. Use `display(64)` for the kicker div, or shorten to `$1,000 of devices` and move "our calc." into the Mono label (FIGS[0].label: `of devices · FY2026 · our calc.`). "our calc." must stay somewhere on screen for the $610/$390/$100 figures.
8. **[P3] captions.** In `PHRASES`, raise the split limit from 20 to 26 characters and drop the punctuation split when the phrase has fewer than 3 words (`len > 9` becomes `cur.length > 2`). This removes the one-word phrases behind most of the 50 warnings and matches the voice rhythm.
9. **[P3] source line.** `mono(24, ...)` at y 1412 is under the 28 px minimum. Use `mono(28, P.muted)` and `top: 1395`. It is inside the safe area (y < 1440) either way.
10. **[P3] loop.** Frame 0 vs frame 42.3 match (same hero shot, same title and whisper, no coins; a lime tile sliver is visible at the right edge of the last frame, x ~1070, y ~820). Hide `Shop` and `Column` entirely after `B("point")`: return null when `t > B("point") - 0.2`.
11. **[P3] accuracy notes (no change needed).** `$140B` is 139.7, `$94B` is 93.9, `26%`, `40%`, `≈ 2/3`, `$76` and `$390` all match the facts table. `$390 left · all devices avg` is the right wording (not per iPhone). "Left after costs" is gross margin; the pinned comment already says so. The `$76` figure has no "our calc." tag but the kicker above it has one: fine.

## Versus the Remotion DA 2 render (`docs/REVIEW_apple-iphone.md`)
Better
- A real camera: six shots, a crane-in on the hook and a pull-back for the loop. The old render was mostly one fixed view per scene.
- The coin metaphor is a stronger object story: 100 coins to $1,000, 61 fly into the tray, 39 glow. The old render used a card and grids.
- Light, shadow and materials give depth that the stippled look could not. The `OPEN` sign and awning is a good payoff, and the loop closes on the same shot.
- Type is crisp and the captions are in the safe band (y 1185-1400). No element sits in the rail zone: the `$390` stamp right edge is at x about 1000 only at y 880-1020, so it crosses x 930. Check this in fix 2 (the old P1 was the same stamp).

Worse
- It breaks the DA 2 rule of a low-res world with stippled light and ink outlines: this is full-resolution PBR with bloom and depth of field. It reads as a polished 3D explainer, less as "our" object-in-a-space look. If the channel should stay one look, this is a different series style; if raea is the next step, accept it and say so in `docs/STUDIO.md`.
- Objects are smaller on screen than in the Remotion version (phone ~200 px vs a large product). The stage band is mostly floor.
- Fewer labels in the world: the old version showed tags on the objects; here colours and fixed text slots do the work.
- 50 reading warnings; the old render's captions were calmer.

Overall: keep this version as the lead if fixes 1-4 land. It is the more striking and more explanatory of the two. It has the same content risk as the original (the owner must tick the 10-K lines in SOURCES.md before posting).
