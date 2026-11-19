# REVIEW · bir-tawil (REDRAWN EP 8, DA 2) · pass 1

Video `out/bir-tawil.mp4` (49.0 s, voice 48.5 s). `npm run validate`: **ok, 0 ✗, 0 !**. Safe area (guides, 8 stills):
nothing readable in the red zones. Only the Halaib tip and the Red Sea coast (scenery) enter x>930/y>860.

## Verdict: not postable yet. 6/10, about 8/10 after the P1s.
The world reads well: clear Egypt-blue / Sudan-green key, a clean wide shot on "Egypt or Sudan", good cuts.
The **logic twist is not readable for a scrolling viewer**, though. You asked whether the subject pieces sit too
high. They don't: they sit in the stage band, slightly above centre. The twist fails for other reasons.
1. **The lines aren't on screen when the voice argues with them.** In `both` and `catch` ("Egypt says the first
   line", "Egypt's line puts…") neither the 22°N line nor the 1902 line is drawn. The 1899 line also fades out
   (14.5 s) before the 1902 line appears (15.6 s), so the two lines are never seen together. What remains is a
   slab changing colour, and it changes ~1 s late.
2. **Every re-colour lands ~0.95 s after its word** (FLASH 0.25 + SETTLE 0.7, plus a hop). In `both` the HALAIB
   piece is a white flashing slab on "first" (27.1→28.0) and on "second." (28.7→cut at 29.37), so the pink
   "claimed by both" never settles before the cut. In `catch` the "neither" flash leaves BIRT white at 34.6.
3. **Frame 0 shows the wrong subject.** The crane opening cuts BIRT off at the left edge, and a huge pink HALAIB
   slab fills the frame. "800 square miles of desert" lands on the pink piece, and pink = Halaib for the rest of
   the reel. On top of that, the `catch` labels `Egypt: "it's Sudan's"` / `Sudan: "it's Egypt's"` put quoted
   words in governments' mouths that are not in SOURCES.md. Also, "Sudan: …" (33.16 + 1.5 s) overlaps
   "claimed by nobody" (34.38).

All fixes below were **checked on stills** using a scratch copy of the episode (since deleted): BIRT is
centred and dominant at frame 0 and at the loop end, both lines show in `both`/`catch`, and no labels collide.

## Fix list
1. **[P1] hook · 0.0–4.0 s · frame 0 crops BIRT, pink HALAIB reads as the subject.** Recentre and drop the
   frame-0 HALAIB declare, so Halaib stays neutral sand until `gives`. Copy the same camera to `loop` so the
   loop cut still matches.
   ```json
   "camera": {"center": [34.2, 22.05], "span": 3.8, "pitch": 54}
   ```
   Delete `{"type":"declare","id":"HALAIB","atTime":0,…}` from `hook`. The quiet reset in `neighbors` can stay.
2. **[P1] both · 25.8–29.4 s · "first line / second" has no line on screen; the colour lands late and the pink
   never settles.** Use a wider cut so both pieces and the lines are in frame. Replace the actions with:
   ```json
   "camera": {"center": [35.3, 22.3], "span": 4.2, "pitch": 50, "yaw": 14, "cut": true},
   "actions": [
    {"type":"label","text":"Halaib Triangle","at":[35.6,22.35],"atWord":"coast.","hold":1.3},
    {"type":"path","coords":<22°N coords from l1899>,"atWord":"Egypt","dur":0.6,"hold":1.4,"color":"#FFFFFF","width":6},
    {"type":"declare","id":"HALAIB","atWord":"Egypt","noLabel":true,"quiet":true,"color":"#4F8FE0"},
    {"type":"path","coords":<2nd path coords of l1902 (Halaib edge)>,"atWord":"Sudan","dur":0.6,"hold":1.2,"color":"#56CFE1","width":6},
    {"type":"declare","id":"HALAIB","atWord":"Sudan","noLabel":true,"color":"#FF4FA3"},
    {"type":"label","text":"claimed by both","at":[35.6,22.7],"atWord":"second.","hold":1.0}]
   ```
   The triggers move one word earlier ("Egypt" 26.50 instead of "first" 27.09; "Sudan" 27.94 instead of
   "second." 28.73), so the colours are settled when the key word is spoken. Pink is reached by about 28.9.
3. **[P1] catch · 29.4–35.2 s · the twist: show each line as it is named, recolour quietly, drop the invented
   quotes, end the overlap.** Replace the actions with:
   ```json
   {"type":"path","coords":<22°N coords>,"atWord":"Egypt's","dur":0.6,"hold":2.6,"color":"#FFFFFF","width":6},
   {"type":"declare","id":"BIRT","atWord":"Egypt's","noLabel":true,"quiet":true,"color":"#7FB77E"},
   {"type":"label","text":"Egypt's line → Sudan","at":[33.45,22.2],"atWord":"Egypt's","hold":2.4},
   {"type":"path","coords":<1st path coords of l1902 (BIRT edge)>,"atWord":"Sudan's","dur":0.6,"hold":1.9,"color":"#56CFE1","width":6},
   {"type":"declare","id":"BIRT","atWord":"Sudan's","noLabel":true,"quiet":true,"color":"#4F8FE0"},
   {"type":"label","text":"Sudan's line → Egypt","at":[33.75,21.55],"atWord":"Sudan's","hold":1.8},
   {"type":"declare","id":"BIRT","atWord":"neither","noLabel":true,"color":"#FFC94D"},
   {"type":"label","text":"claimed by nobody","at":[33.75,21.87],"atWord":"neither","hold":1.0},
   {"type":"shake","amount":6,"atWord":"neither"}
   ```
   On the stills, a label at [33.75,22.2] touched the pink slab and the white ribbon, so the Egypt label moves
   to lon 33.45. The Sudan label now ends at 34.14, before "neither". The camera (span 2.0) is fine and keeps BIRT
   near the middle of the stage (y ≈ 690–930).
4. **[P2] l1899→l1902 · 14.5–23.2 s · the two lines are never seen together**, but the whole story is "two
   lines". Keep both lines through `gives`: l1899 path `"hold": 13.5` (until ~23.0); l1902 paths
   `"hold": 7.4` (`second`) and `"hold": 7.1` (`line,`). The `22°N` label keeps `hold 2.6`.
5. **[P2] gives · 20.1 / 22.1 s · BIRT/HALAIB colours land ~1 s after "patch"/"triangle".** Trigger them a word
   earlier: BIRT `"atWord":"desert"` (19.76), HALAIB `"atWord":"coastal"` (21.67). Keep the flash here, since
   this is the first claim.
6. **[P2] loop · 45.3 s · "Two lines" shows one line.** Add the two l1902 paths
   `{"type":"path",…,"atWord":"lines.","dur":0.6,"hold":2.0,"color":"#56CFE1","width":5}`.
7. **[P2] heaton→loop · 45.3–45.9 s · the NOT RECOGNISED callout and the "Kingdom of North Sudan" caption
   carry over onto "Two".** Use callout `"hold": 1.4` and units `"hold": 4.0`.
8. **[P2] catch→size · 35.4–36.4 s · "claimed by nobody" carries over into "The coast"** (old hold 2.0). This
   is fixed by `hold: 1.0` in #3.
9. **[P3] both/catch/size · the timeline marker stays at 1902 while the voice says "Today".** Either hide the
   rail in these beats or accept it. Don't add a year that SOURCES.md doesn't give.
10. **[P3] l1902→gives · 19.1–19.7 s · "for the grazing tribes" carries over into "It hands".** Use `"hold": 1.2`.
11. **[P3] heaton · 40.6 s · "plants a flag" shows a white pawn** (`units crowd`). That's fine as a symbol. A
    small `flag` unit kind (pole + blank cloth, no micronation flag) would be stronger. This is optional and
    needs a component change in `Units3D`.
12. **[P3] size · 36.3 s · the sub-label "our calculation · 18,208 vs 2,025 km²" is about 27 px.** It's
    readable but at the floor. Raise the bigNumber label size if the component allows it.

## Beat notes (beats with no issue)
- `neighbors`: the wide shot names Egypt and Sudan on their words. Good re-orientation.
- `l1899`: the date appears at the beat start and the line draws on "draw". The 2.3 s before "draw" is carried
  by the camera move: acceptable.
- `heaton`: 2014, the caption and the VOID stamp are in sync and inside the safe area.
- Loop: the last frame returns to the frame-0 crane pose. It still matches after fix #1, since `loop` gets the
  same camera.

## Accuracy vs SOURCES.md
800 sq mi ("about"; our calc 782), 1899 / 19 Jan, 22°N, 1902 / 4 Nov, grazing tribes, Halaib coastal,
9× = our calculation (18,208 / 2,025 km²), Egypt runs Halaib, 2014 year only, "Kingdom of North Sudan", not
recognised by any government: **all match**. The only problem is the invented quotes in `catch` (#3).
No contested-border issue: the 22°N line and the NE disputed areas are shown as lines and claims, not as a
ruling.
