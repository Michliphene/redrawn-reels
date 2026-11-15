# Review: korea-1945, pass 3 (regression check)

Video `out/korea-1945.mp4`: 57.3 s (voice ends at 56.71 s). I read all 13 beat sheets and `cues.md`, plus extra frames in `/tmp/claude-0/review-tmp/`:
- `k3_seam.jpg`: frame 0, the last frame, 56.2 s and 55.0 s.
- `k3_A.jpg`: 0.6, 3.95, 6.3 and 18.8 s.
- `k3_B.jpg`: 29.0, 32.9, 41.6 and 56.65 s.
- `k3_C.jpg`: 41.3, 41.55, 41.8 and 33.5 s.

## Verdict: 8.5/10. Postable: **yes**

There are no P1s. Nearly all of the pass-2 fixes landed correctly. Two of them did not have the intended effect (#1 and #2 below).

Verified as fixed:
- **HARDENS**: the stamp is readable on "hardens:" and sits on the "Temporary zones" card (31.4 s).
- **Hook**: the US flag shows on "Two" and has cleared before the map sticker appears on "National" (3.95 s). The gold 38°N line stays drawn through "map.".
- **Loop seam**: the last frame is the brown 1945 map with the gold line, the title and the EP 4 tag, at the same scale as frame 0. The timeline is hidden on both frames, so the jump is gone. The seam is now clean.
- **Chip**: "Temporary?" agrees with the "Temporary zones" callout.
- **DMZ**: the "New border: the DMZ" callout explains the term, and its 2.5 mi / 155 mi figures are in SOURCES.
- **STILL**: the stamp lands on "signed." while the card is still fully visible.
- **Line beat**: "No river · no mountains" fills the old gap.
- **Pointers**: the Kaesong pointer is still on screen when the Sokcho pointer appears, so both towns are visible together. The 38°N reference stays on screen through the swap.
- **Pulses**: the swap pulses fire on "North."/"South.".

Accuracy is unchanged: every on-screen date and figure still matches SOURCES.md.

## Remaining issues

1. **[P2] armistice · 41.39 s · the "armistice" pulse is invisible.** It targets `DPRK`/`ROK`, but those features are still concealed until "new" (42.67 s). The 1945 shapes `KOREA_N38`/`KOREA_S38` are the ones on screen, so nothing happens (`k3_C.jpg`, 41.3 → 41.8 s are identical). The 2.8 s gap with nothing new (39.9 → 42.67 s) is therefore still there. Fix: pulse the visible shapes, and/or add the sticker from pass 2.
   ```json
   {"type":"pulse","ids":["KOREA_N38","KOREA_S38"],"atWord":"armistice"},
   {"type":"sticker","emoji":"page_with_curl","x":860,"y":1000,"size":140,"atWord":"armistice","hold":1.0}
   ```
2. **[P2] states · 32.4–34.9 s · the North Korean flag is now half hidden under the "TEMPORARY?" chip.** It sits at [128.6, 41.4], which renders at y≈400–440 behind the chip (`k3_32.9.jpg`, `k3_33.5.jpg`). Move it down to the north-east coast, to the right of the "North Korea" label and clear of the chip:
   ```json
   {"type":"sticker","flag":"kp","at":[129.0,40.1],"size":100,"atWord":"rival","hold":2.0}
   ```
3. **[P3] japan · 5.67–6.7 s · the hook's pen sticker carries over into the Japan beat.** It is still visible next to the Japanese flag on "Which" (`k3_6.3.jpg`), which mixes two ideas. Shorten it so it clears at the camera move:
   ```json
   {"type":"sticker","emoji":"fountain_pen","x":250,"y":1010,"size":150,"atWord":"map.","hold":0.5,"tilt":-20}
   ```
4. **[P3] states · 27.6 s · the "Temporary?" chip uses the crossed-swords emoji** (there is no war yet), and the hourglass sticker repeats the idea. Put the hourglass on the chip and delete the `hourglass_done` sticker (`atWord":"temporary."`):
   ```json
   {"type":"chapter","emoji":"hourglass_done","text":"Temporary?"}
   ```
5. **[P3] hook · 0–~1.5 s · the "38°N" label is not on screen at frame 0** (`k3_0.6.jpg`): only the line shows. This is optional, since the title already carries the hook. If the label should be visible from the first frame, give the path a label fade of 0, or add a `label` cue `"38°N"` with `atTime: 0`.

## Not regressions (checked)
- No overlap between captions and cards. Nothing sits in the captions band or the timeline band.
- The 1948 badge changes on the word "1948". The white 1953 line and the gold 38°N line are on screen together from 43.96 s to 52.7 s.
- The loop recolour (55.8 s) finishes brown by the last frame (`k3_seam.jpg`, second panel).
