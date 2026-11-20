# REVIEW · bir-tawil (REDRAWN EP 8, DA 2) · v2 full redo, pass 1

> v1 review superseded by the v2 redo (new script, voice, palette); v1 notes removed.

Video `out/bir-tawil.mp4` (49.95 s). `npm run validate`: **ok, 0 ✗, 0 !**. Guides stills (0, 3.2, 25.6, 33.6, 49.8 s):
no readable text in the red zones. Only scenery (the Halaib piece, the Red Sea) goes past x>930 / y>860.
Facts: every on-screen figure matches SOURCES.md (19 JAN 1899, 22°N, 4 NOV 1902, ~800 sq mi · 2,025 km² our calc.,
9× · 18,208 vs 2,025 km² our calc., 2014, "Kingdom of North Sudan", not recognised).

## Verdict: not postable yet · 6.5/10
The script is much clearer than v1, and the trap beat (patch turns green under line 1, lavender under line 2) is the
best moment in the reel. What blocks it is execution: the screen doesn't show the logic as cleanly as the voice says it.
Biggest problems:
1. **The date header says "4 NOV 1902" from 23 s to 41 s**, over "Now both want the coast…". That presents the
   present-day dispute as a 1902 fact (anachronism).
2. **Line two never shows at "Sudan says line two"** (27.2 s). In the `both` cut the cyan path is hidden behind the
   raised Halaib piece: you only see cyan specks, and they land at the same moment as the pink flash.
3. **The hook and the loop show an unexplained piece and don't match.** At frame 0 Halaib is the brightest thing on
   screen (bare sand, no label, cut at the right edge). The last frame shows Halaib in pink with both lines drawn,
   while frame 0 has no lines. On top of that, the "Egypt" label runs into the whisper at 1–2 s.

## Fixes (beat · time · problem · fix)
1. **[P0] both→size · 23.1–41.6 s · "4 NOV 1902" stays up over present-day claims.** Add `"hideDate": true` to beats
   `both`, `trap`, `cost` and `size`. (`heaton` sets 2014 again.)
2. **[P0] both · 27.19 s · line two can't be seen.** Draw it one word earlier, from a camera that looks at Halaib's
   north edge, and thicken that path:
   `"camera": {"center":[35.3,22.55],"span":3.8,"pitch":52,"yaw":-18,"cut":true}`. On the line-2 path in `both`:
   `"atWord":"line","occurrence":2,"dur":0.5,"width":9`. Keep the pink HALAIB declare and "claimed by both" on `two.`.
   Check with a still at 27.0 and 27.5 s.
3. **[P0] hook · 0–3 s · Halaib draws the eye at "this desert" and has no label.** Make it quiet at frame 0. Add to
   `hook`: `{"type":"declare","id":"HALAIB","atTime":0,"noLabel":true,"quiet":true,"color":"#3A3552"}`.
4. **[P0] loop · 48–50 s · the last frame doesn't match frame 0.** Delete the 3 `path` actions in `loop` and add
   `{"type":"declare","id":"HALAIB","atWord":"Nobody's","noLabel":true,"quiet":true,"color":"#3A3552"}`. The last
   frame is then the frame-0 shot: amber patch, quiet triangle, same camera. Keep the `though…` pulse.
5. **[P1] hook · 1.0–2.8 s · the "Egypt" label hits the whisper** (y≈590–600 while the camera moves). Change it to
   `"at":[33.9,22.4]` (Egypt side, west of Halaib), `"hold":2.4`. Check with a still at 2.0 s.
6. **[P1] line1 · 8–14 s · in 1899 both pieces are bare sand with no meaning, and Egypt/Sudan are no longer named**
   (their labels left at 2.85 s, and Egypt's purple blends into the sky). Show the 1899 state: each piece takes the
   colour of the country on its side of 22°N, then name both sides on "border":
   change the BIRT quiet declare to `"color":"#2C3D35"`, add
   `{"type":"declare","id":"HALAIB","atTime":7.95,"noLabel":true,"quiet":true,"color":"#3A3552"}`,
   `{"type":"label","text":"Egypt","at":[32.6,22.55],"atWord":"border","hold":3.0}`,
   `{"type":"label","text":"Sudan","at":[32.6,21.45],"atWord":"border","hold":3.0}`.
   Line 2 then "cuts out" the two pieces in the next beat, which is the whole story.
7. **[P1] line1 · 13.41 s · "22°N" sits on top of "LINE 1 · 1899"** (still at 13.45 s). Set the `22°N` label to `"hold":1.3`.
8. **[P1] cost · 33.5–36.4 s · 3 s with nothing new**, and "accepting the other side's line" has no visual. Add
   `{"type":"label","text":"claim it = accept their line","at":[33.75,21.55],"atWord":"accepting","hold":1.7}`.
9. **[P1] trap→cost · 33.3–33.9 s · "line 2 → Egypt" lingers onto the amber patch** (the label says Egypt while the
   colour says nobody). Set that label to `"hold":1.2`. Do the same for "line 1 → Sudan" (`"hold":1.6`) so the
   two labels never overlap.
10. **[P1] line1/line2/both/trap/loop · the line paths are too thick.** At width 7 the white bar covers half of
    Bir Tawil (frames at 13.4 and 20.3 s). The brief asked for thinner pieces. Set `"width":4` on every white/cyan
    `path` (keep 9 only for fix 2).
11. **[P2] cost · 33.47 s · amber means "nobody", but it turns on at "claiming".** Remove the cost-beat BIRT declare.
    The patch stays lavender (Egypt's reading) and turns amber only at `nobody's.` (41.04 s), so the colour lands
    as the payoff. Keep the pulse.
12. **[P2] both · 25.2–25.4 s · "Egypt: line 1" lands on the fading "Halaib Triangle".** Set the `Halaib Triangle`
    label to `"hold":1.1`.
13. **[P2] gives · 19.8–22.8 s · the patch is tiny and its lavender is hard to see under the lines.**
    `"camera": {"center":[34.7,22.25],"span":4.3,"pitch":60,"yaw":-22}`. With fix 10 the patch stays visible.
14. **[P2] component · light labels on bright fills** ("Halaib Triangle" and "→ Sudan" on light green, "claimed by both"
    during the pink flash, "lose this" on pink) have weak contrast. In the DA 2 map label, add a dark ink plate or a
    2 px ink outline when the label sits over a declared piece. Fallback: move those labels off the piece, e.g.
    `"at":[35.2,21.75]` (Sudan side of 22°N).
15. **[P2] heaton · 46.58–47.2 s · the "Kingdom of North Sudan" caption peeks out behind the NOT RECOGNISED card.**
    Set the `units` action to `"hold":2.9`. The callout lingers into the loop (48.0 s): set it to `"hold":1.3`.
16. **[P2] heaton · 43.6 s · "plants a flag" shows a tiny white pawn, not a flag.** Use a pin/flag marker instead of
    `units` crowd (a plain pole, no micronation flag, which keeps the sources rule):
    `{"type":"marker","at":[33.75,21.87],"atWord":"plants","hold":2.9,"label":"\"Kingdom of North Sudan\""}`.
    If the marker can't render a pole, keep the unit but raise it to `"size":110`.
17. **[P3] palette · Egypt (#3A3552) is nearly the sky colour**, so the north bank reads as sky. Try
    `"EGY":"#463D63"` and check on stills.
18. **[P3] line2 · 17.74 s · "grazing lands" floats in Sudan's area.** Pin it to the Bir Tawil leg of line 2:
    `"at":[33.6,21.6]`, `"hold":1.2`.

## What works
- New script: "line one / line two" + "Here's the trap" makes the paradox easy to follow by ear. Sync is within
  ±0.2 s on every coloured re-declare (patch, triangle, trap colours).
- The palette logic (lavender = Egypt, green = Sudan, pink = both, amber = nobody) is clean, and the trap beat's
  colour flip is the reel's signature image.
- Camera: one idea per beat, cuts at `both` and `trap` work as re-hooks, and the cost pull-back reveals the 9× scale.
- Safe area clean; numbers labelled "our calculation"; captions never covered.
