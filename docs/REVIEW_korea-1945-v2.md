# Review — korea-1945-v2 (REDRAWN EP 4, DA 2 remaster) · pass 1

Video `out/korea-1945-v2.mp4` (56.7 s). `npm run validate`: 0 ✗, 1 ! (hook 5.1 s: known and accepted, the voice is fixed).
Safe-area guides at 0 / 5.4 / 13.6 / 44.6 s: nothing readable outside the safe area.

## Verdict
**Not postable yet. 6/10.** The structure, sync and facts are good: every on-screen date and figure matches
`SOURCES.md`, and the cut at `states` works as the mid-reel re-hook. But the payoff of the reel ("it's not the
38th parallel" / Kaesong and Sokcho swapped) cannot be seen, because the lines that carry it are hidden.

**3 biggest problems**
1. **The raised zones hide every line drawn after `declare`.** In the 3D map, a `declare` lifts its piece up to
   h·1.73, but `path` ribbons are drawn at a fixed h·1.25 (`src/atlas/Map3D.tsx`, paths block). So the gold 38°N
   line disappears from 26 s on. The white "hardens" line shows as a white blob on the west coast (33.4 s). From
   42.7 s the 1953 line and the 38°N comparison line are invisible, so Kaesong/Sokcho have no reference line. In
   the last frame the loop line is only a stub on the west coast.
2. **The DMZ callout covers the reveal.** It sits right on top of the 1953 line at the moment the voice says "not".
3. **Header and labelling problems hurt orientation.** The `soviets` caption sits in the header block. The
   "WASHINGTON'S ORDER" label is placed on Korea. The USSR flag reads as China's at that size. The Japan beat's
   chapter line repeats "1945" under "1945".

## Fix list

1. **[P1] Component · 26.2 s → end · paths are hidden under declared pieces.** Fix in `src/atlas/Map3D.tsx`, path
   block: keep the ribbon above the lifted pieces. Either raise it
   `const top = Math.max(0, ...focusIds.map((id) => lift(id, t).y)); const g = ribbon(pts, hw, h*1.25 + top + 0.004), gShadow = ribbon(pts, hw*1.7, h*1.25 + top);`
   or draw it over everything with `depthTest={false}` on both materials and `renderOrder={20}` on both meshes. The
   raise keeps the lines "on the table", so it is better. Re-check stills at 31.6, 44.6, 47.0 and 56.65 s.
   The paths should show: the white line lying on the 38°N seam, the white 1953 line next to the gold 38°N line, and
   the full gold line in the last frame (to match frame 0).
2. **[P1] armistice · 43.96 s · the DMZ callout covers the 1953 line.** Move the callout out of the stage centre,
   onto the left margin under the map:
   `{"type":"callout","text":"New border: the DMZ","sub":"≈ 2.5 miles wide · ≈ 155 miles long","y":1050,"size":52,"atWord":"Not","hold":1.3}`
   Make the comparison line readable: on the 38°N path set `"width": 6` and `"labelAt": [125.0, 37.75]` (the label
   goes under the line, on the left, so it does not touch "1953 line").
3. **[P1] armistice → swap · 42.7–52 s · the viewer must see two lines.** Once fix 1 is in, check that the gold
   38°N line (8.2 s hold) and the white 1953 line (9.6 s hold) both last through `swap`. They do on paper (until
   ~52.2 s). If they still read as one line, pull the camera back slightly so the 0.3° gap is visible:
   `"camera": {"center":[127.4,38.2],"span":7,"pitch":38,"yaw":0}` for `armistice`, and keep `swap` at span 8.
4. **[P2] soviets · 10.1–10.8 s · the caption sits in the header block.** "SOVIET TROOPS · AUG 1945" enters at
   y≈500–580, next to the "Soviets" whisper. The tanks are large black blocks that hide North Korea. Shorten the
   approach and shrink the tanks:
   `"approach": [20, -70], "size": 46`. Also name where the troops come from (no place is named in this beat):
   `{"type":"label","text":"USSR","at":[132.0,44.0],"atWord":"Soviet","hold":2.0}` (no flag, see 6).
5. **[P2] order · 12.7 s · the "WASHINGTON'S ORDER" label sits on Korea.** It reads as a place on the map.
   Washington is not there. Replace it:
   `{"type":"label","text":"ORDER FROM WASHINGTON","flag":"us-48","at":[127.6,35.6],"atWord":"Washington,","hold":2.4}`
   The portrait (y=330) sits on top of the timeline and title block. Move it into the stage:
   `"side": "left", "y": 640`. After the portrait ends (16.9 s), "told to draw a line" has nothing new on screen.
   Hint at the line at the end of this beat:
   `{"type":"path","coords":[[124.55,38.0],[128.75,38.0]],"color":"#FFC94D","width":3,"dur":0.6,"hold":0.8,"atWord":"draw"}`
6. **[P2] moscow · 26.2 s · the USSR flag reads as China's at label size** (red field, yellow mark in the top-left
   corner). That is a misleading anachronism for this subject. Drop `"flag": "su"` and change the text to
   `"SOVIET ZONE"` with no flag (or `"USSR ZONE"`). The colour already carries the meaning.
7. **[P2] japan · 5.7 s · the chapter line repeats the date** ("1945" under "1945"). Change it to
   `{"type":"chapter","text":"Japanese rule"}` and drop the callout, which covers the KOREA label and the JAPAN flag.
   Or keep the callout but move it under the map: `"y": 1050`. The callout is a floating widget for a fact the
   chapter line plus the "1910" in the captions already state, so dropping it is the better option.
8. **[P2] states · 28.3–31.7 s · the "Temporary zones … 1945" callout lingers.** It stays up after the header has
   switched to 1948 (29.7 s). Set `"hold": 1.3` so it leaves on "1948", and change `"stampWord"` to `"1948"`.
   Otherwise the HARDENS stamp would land after the callout is gone, so let the date change and the white line
   (fix 1) carry "hardens".
9. **[P3] line · 22.6 s · the "38°N / a straight line" callout repeats the path label "38th parallel"** and covers
   Seoul's area. Remove it, or set `"y": 1050`.
10. **[P3] loop · 55.8 s · last frame.** After fix 1, the gold line is drawn in full by 56.6 s. To match frame 0
    exactly, use `"dur": 0.5` so the line has settled before the end.

## Checked and OK
- Facts: 1910–1945 rule, Aug 1945 Soviet entry, 1948 two states, 25 Jun 1950, 27 Jul 1953, DMZ ≈2.5 × ≈155 mi,
  "armistice only", and Kaesong (37.97°N) / Sokcho (38.21°N) all match SOURCES.md. The 48-star US flag is correct
  for 1945. The Rusk photo is labelled "photo: 1961".
- Sync: every cue lands on its word (±0.2 s). The `atWord: "Not"` and `"not"` cues both resolve to 43.96 s.
- Camera: one idea per beat, and the `cut` at `states` (27.6 s, 49 %) re-hooks. The loop camera equals the hook
  camera.

## Pass 2 — applied
- Fix 1: `src/atlas/Map3D.tsx` lays every `path` on the highest piece *at rest* (`PieceState.rest` added in
  `lift.ts`), so declared zones no longer hide lines and lines do not bounce with hops. Only DA 2 episodes with
  `path` are affected (korea-1945-v2 alone today); DA 1 unchanged.
- Fixes 2–10 applied as written (armistice camera span 7 / pitch 38, DMZ callout y 1050, 38°N width 6 + label left,
  soviets approach/size + USSR label, ORDER FROM WASHINGTON label, portrait left y 640, line hint on "draw",
  no USSR flag, Japan chapter "Japanese rule" without callout, temporary-zones callout 1.3 s without stamp,
  38°N callout removed, loop line dur 0.5).
- Re-render: 57.3 s, −14.3 LUFS, loop SSIM 0.86. Accepted: hook 5.1 s (voice shared with korea-1945).
