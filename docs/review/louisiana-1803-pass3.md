# Review: louisiana-1803, pass 3 (regression check)

Video `out/louisiana-1803.mp4`: 53.4 s. I read all 15 beat sheets and `cues.md`.
Extra frames are in `/tmp/claude-0/review-tmp/l3_*.jpg`: 12.5, 13.9, 14.6, 19.6, 20.4, 35.5, 36.0, 51.9, 52.05 and 52.3 s. The strips are `l3_sA.jpg`, `l3_sB.jpg` and `l3_sC.jpg`.
Timing rule used below: an overlay stays visible until `t + hold + 0.4 s`.

## Verdict: 8.5/10. Postable: **YES**

There is no P1 left. All 9 pass-2 items and the virality changes are in and hold up:
- **LOUISIANA label:** now fully on screen (left edge x≈30 at 12.5 s), with the French flag above it.
- **Chapter chips:** "The price" shows the coin3d icon and "Twice as big" shows the star3d icon.
- **Florida (Spanish):** marker lands on "Florida.".
- **$10M:** clears at 19.79 s, before `napoleon` starts.
- **$15M:** fully readable through "dollars".
- **Senate:** clears before `double`.
- **"All of Louisiana?":** fires on "all".
- **BUYS IT stamp:** gone.
- **City sticker:** anchored under New Orleans in both hook and loop.
- **Recolor:** now fast. Frame 52.05 is already orange with no grey frame, and the loop seam is clean.
- **"828,000 SQ MI" pointer:** reads well.
- **31°N seam:** no longer visible.

**Accuracy:** unchanged since pass 2, and every on-screen figure matches SOURCES.md.

Remaining issues, all small:
1. **Florida marker lingers into the Napoleon beat** ("BUT NAPOLEON'S", 20.1–21.3 s) while the camera flies away.
2. **"(verify)" shows on screen** in the Jefferson and Monroe portrait credits.
3. **Small spill-overs at beat boundaries:** the 3¢ card fades over Jefferson at 35.5 s, the pointer runs under the "The border" chip at 3.8 s, and "15 states" plus a date badge flash at 52.05 s.

## Issues

1. **[P2] budget → napoleon · 19.32–21.32 s · "Florida (Spanish)" is still on screen during "But Napoleon's…"** (`l3_20.4.jpg`). The label drifts across the frame with the camera while the subject changes. Shorten the marker in `budget` so it ends at about 20.4 s:
   ```json
   {"type":"marker","text":"Florida (Spanish)","at":[-84.5,30.4],"atWord":"Florida.","hold":0.7}
   ```
2. **[P2] budget 15.0 s and legal 35.3 s · the portrait credit line ends in "(verify)" on screen** (Jefferson, Monroe; `l3_sC.jpg`). In `public/assets/portraits/credits.json`:
   - For `jefferson_bust` (LOC ppmsca 15715) and `monroe` (LOC cph 3a53279), set `"license": "No known restrictions"`.
   - Add a `"page"` URL to each, as the Seward entry has. This also fixes the pinned comment.
   - Confirm the rights statement on each LOC item page first. If one is not "no known restrictions", replace that image before posting.
3. **[P3] acre → legal · 35.33–35.67 s · the faded "≈ 2.8¢" card sits under the incoming Jefferson card** (`l3_35.5.jpg`). Set the 3¢ bigNumber to `"hold": 1.25`; it then ends at 35.32 s. It stays fully readable for about 1.25 s, which is still above the 3¢ minimum.
4. **[P3] offer → river · 3.78–4.1 s · the fading "828,000 SQ MI" pointer runs under the "The border" chip** (river sheet, start frame). Set the pointer to `"hold": 0.6`; it then ends at 3.8 s.
5. **[P3] today → loop · ≈51.9–52.25 s · two things flash at the seam:**
   - The "15 states" card is still fading at 52.05 s.
   - A "DECEMBER 20 / 1803" date badge pops back for about 0.2 s, because `today` hides the date and `loop` re-shows it.

   Fix:
   - Set the callout to `"hold": 0.8`; it then ends at 52.15 s.
   - Either give `loop` the same date-hiding as `today`, or add `"date": false` to `loop`, so the badge does not flash.
   - Frame 0 has no date badge, so hiding it also makes the loop seam closer.
6. **[P3] loop · 52.2–52.5 s · while the camera zooms, the cityscape sticker passes through the captions band** (x≈850–960, y≈1370–1470). It does not touch the "ALL" caption and settles above the captions by 52.8 s. No change needed. If the producer wants it gone, set `"dy": 150` in `loop` only.
7. **[P3] natives · 48.1–49.0 s · the "Caddo" region label touches the top edge of the "Approximate areas, c. 1803" callout** (natives sheet, end frame). Move the callout down with `"y": 1160`, or move Caddo with `"at": [-93.8, 33.4]`.

## Checks that passed (no regression)
- **Hook / frame 0:** the title, New Orleans, cityscape and Louisiana are fully drawn. The tail frame matches frame 0, apart from the title.
- **Sync:** every word cue is still within ±0.05 s; the new cues fire on "Florida.", "all" and "back".
- **Napoleon, borders and natives beats:** layout unchanged and clean. The UK flag, the Haiti marker and the three "?" are all visible.
- **No overlay enters the timeline or captions band**, apart from the brief case in #6.
