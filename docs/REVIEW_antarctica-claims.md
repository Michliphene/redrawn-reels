# REVIEW — antarctica-claims (REDRAWN EP 5, DA 2) · pass 1

Video `out/antarctica-claims.mp4` (49.0 s). Pre-flight: 0 ✗, 1 ! (hook 4.1 s, accepted: voice is recorded, first
sentence ends at 2.0 s). Guides still sheet checked (0 / 3.7 / 15.3 / 26.8 / 36.2 / 44.5 s): no readable element above
y=250 or below y=1440; the Argentina label sits at x≈960 but above y=860 (OK, borderline).

## Verdict: NOT postable yet · 6.5/10
The story is strong and the camera work follows STUDIO §2 (crane, tilt, cut at 10.4, mid-reel re-hook cut at 20.3,
pull-backs). Accuracy is clean apart from one date. What blocks posting:
1. **Caption cut off at the right edge** (44.5–45.3 s): "BIGGEST UNCLAIMED LAND ON EART". Caption line-break bug.
2. **The payoff of the 3-way overlap is never labelled readably.** The hook pulses TRI on a blank white map (you can't see it),
   the "UK + Chile + Argentina" region label at 15.1 s is ~22 px italic cream on a cream flashing piece, and in the baby
   beats the whole peninsula is pink with nothing saying pink = 3 claims. Yet SOURCES.md says the point is that "the
   viewer sees the base inside the triple overlap".
3. **Overlapping labels**: "Esperanza Base" and "1st birth on the continent" sit on top of each other (26.7–28.7 s), and
   "Esperanza Base" (hold 7) runs into the Chile beat over "Villa Las Estrellas" (29.0–29.6 s).

## Fix list
1. **[P1] nobody · 44.5–45.3 s · caption overflow.** In `src/studio/ui/Captions.tsx` `paginate().close()`, when no
   break gives two lines ≤ maxChars (20 at 92 px), the fallback is `best = 1`, which leaves "THE" on line 1 and 32 chars on line 2.
   Fix: choose the break that minimises `max(a,b)` instead of defaulting to 1 (gives "THE BIGGEST UNCLAIMED / LAND
   ON EARTH." at 21/14 chars, which fits). If `max(a,b) > maxChars + 2`, split the page into two pages. I simulated every page
   of this reel and this is the only one affected. Add a test in `tests/`.
2. **[P1] baby · 26.66 s · label collision.** "1st birth on the continent" sits on the "Esperanza Base" marker. Drop it (caption +
   voice already say it) or move it clear:
   `{"type":"label","text":"1st birth on the continent","at":[-61.2,-66.3],"atWord":"first","hold":1.9}`
3. **[P1] baby→chile · 29.0–29.6 s · marker carry-over.** Esperanza marker overlaps Villa Las Estrellas. `marker` Esperanza
   `"hold": 6.3` (ends 28.9). Also move it to land on the cut: `"atWord": "Argentina"` (21.97) → `"hold": 6.9`.
4. **[P1] chile · header shows "21 NOV 1984".** SOURCES: "21 Nov in one account — screen shows Nov 1984 only".
   `"date": "1984-11"` (Header renders "NOV 1984").
5. **[P1] hook · 0–3.8 s · frame 0 is a blank grey continent; "same slice" is not visible; the loop doesn't match.** The loop ends on the
   fully coloured pie, and the reel restarts on white. Pre-colour in the hook and reset at "1908:" (declare = latest wins, `count:false`
   keeps the tally/rail clean since Tally starts at hookEnd). Add to `hook.actions`:
   ```json
   {"type":"declare","id":"GBR","atTime":0,"noLabel":true,"count":false}, … same for CG, AG, CHL, NOR, AUS, AUS2, FRA, NZL,
   {"type":"declare","id":"TRI","atWord":"same","noLabel":true,"count":false,"color":"#FF4FA3"}
   ```
   (TRI starts with `atTime:0` too, then re-declares pink at "same".) Add to `uk.actions` *before* the GBR declare: for every one of the 10
   pieces `{"type":"declare","id":"<id>","atWord":"1908:","noLabel":true,"count":false,"color":"#DCE6EE"}`.
   Check `npm run stills antarctica-claims -- --times 0,3.6,4.9,48.9` (frame 0 vs 48.9 must match in colour and roughly in pitch;
   if the intro crane starts much flatter than the loop, give `loop.camera` `"pitch"` matching the hook's start).
6. **[P1] overlap · 15.1 s · "UK + Chile + Argentina" unreadable** (italic region over a white-flashing piece, overlapped by the pulse ring).
   Replace the `region` with a boxed label off the land:
   `{"type":"label","text":"3 claims: UK · Chile · Argentina","at":[-72,-66],"atWord":"both.","hold":2.4}`
7. **[P1] baby · 23.97 s · nobody is told the base is in the triple overlap.** Add
   `{"type":"label","text":"claimed by UK · Chile · Argentina","at":[-62,-67.5],"atWord":"base.","hold":1.6}`
   (ends before "1st birth" at 26.66).
8. **[P2] baby · 23.0 s · name before it is spoken.** The pawn caption "Emilio Palma · born 7 Jan 1978" shows at "pregnant", 2.2 s before
   "Emilio". `units` → `"atWord": "Emilio"`, `"hold": 3.3`.
9. **[P2] treaty · 15.7–17.3 s · stale chapter.** "Argentina: dates vary, 1940s" stays under "1 DEC 1959". Add
   `{"type":"chapter","text":"Antarctic Treaty, Washington","atWord":"A"}` in `treaty` (Washington is in SOURCES).
10. **[P2] treaty→baby · 20.3–20.6 s · callout survives the cut.** `callout` ANTARCTIC TREATY `"hold": 2.9`.
11. **[P2] chile→void · 31.7–32.3 s.** "JUAN PABLO CAMACHO" pawn caption runs under the void callout: `units` (chile) `"hold": 1.9`.
    The void callout also runs into usru: `"hold": 1.9`.
12. **[P2] nobody→loop · 45.5–46.3 s.** bigNumber stays on through "So who owns": `"hold": 1.4`. It also sits on the TEXAS_B ghost:
    `"y": 1040`.
13. **[P2] usru · 34.2–38.8 s · flags float on top of the claims** (they cover Norway and the peninsula: a widget over the world).
    Move them onto the sea: US `"x":190,"y":700`, RU `"x":880,"y":700` (right edge ≈955, above y=860 → OK). The `pulse NONE` at
    "right" lights an undeclared white slice that means nothing yet: delete it.
14. **[P2] overlap · 13.6 s · chapter on the map.** "Argentina: dates vary, 1940s" (whisper, y≈560) is drawn across the
    peninsula tip, cream on cream. Lower the land: `overlap.camera` `{"center":[-62,-70.5],"span":29,"pitch":40,"yaw":-22,"cut":true}`.
15. **[P2] nobody · 42.3 s · 2nd Texas hangs half off the coast** over the sea, which weakens "unclaimed LAND". In `scripts/prep-antarctica.mjs`,
    rotate TEXAS_B ~4° further toward the pole (inside the 90–150°W sector) and re-run the prep.
16. **[P3] overlap · chapter wording.** "1940s" excludes the 1939 date that SOURCES lists. Use `"Argentina: dates vary, 1939–47"`.
17. **[P3] hook · 0–2 s.** The whisper "seven claims, one frozen treaty" crosses the peninsula tip (cream on cream). This is fixed by #5:
    coloured pieces make the whisper readable.
18. **[P3] keywords.** 15 keywords + numbers mean almost every caption has accent words, which dilutes STUDIO §4. Drop the country names
    from `keywords` (the flags/labels carry them); keep `"Antarctica","Emilio","Palma","nobody","Texas","unclaimed","counts"`.

## Checked and OK
- Accuracy vs SOURCES.md: 7 claimants, 1908/1923/1924/1933/1939/1940, 1 Dec 1959, Art. IV(2) wording, 7 Jan 1978, Esperanza
  and Villa Las Estrellas coordinates, 1.5M km² / 590,000 sq mi "our calculation", >2× Texas, Russia shown with today's flag in a
  present-tense, undated beat. The CLAIMS tally reaches 07/7 on Argentina; overlap pieces are excluded (`count:false`) as intended.
- Sync: declares and labels land on their words (±0.1 s) in uk/others/overlap; FROZEN/VOID stamps land on "freezes"/"counts.".
- Camera: one idea per beat. The cuts at overlap / baby / nobody are good re-hooks. Beats ≥2 s with nothing new: baby 20.3–22.6
  (fixed by #3 moving the marker to "Argentina").

---

# VIRALITY — antarctica-claims (REDRAWN EP 5, DA 2) · pass 1

Evidence: `pipeline/virality_metrics.py` (49.6 s, 141 words, 3.07 w/s, 8.5 cues/10 s, longest gap 2.98 s at 17.3 s,
3/25 two-second windows with no cue, loop SSIM 0.883, −14.1 LUFS), hook frames 0–3 s, `loop_first_vs_last.jpg`, beat
sheets regenerated from the final render (`out/review/antarctica-claims/beat_*.jpg`), extra frames at 3.8 / 15.3 / 25.5 /
42.6 / 43.4 / 47.5 s. The voice is locked: no `say` changes below. This is a pattern-based estimate, not a prediction;
the size of the creator account is the biggest factor we can't control.

## Scorecard
| Block | Pts | Why |
|---|---|---|
| A. Hook 0–3 s | **21**/25 | Frame 0 is the coloured 3D pie with "WHO OWNS ANTARCTICA?": striking paused and muted, place known at once (7/8, 5/5). Sentence 1 carries a number and a contradiction ("7… 3 claim the same slice"), but the "same slice" lands at 3.4 s and the hook runs 4.1 s (6/7). On-screen text shows no number until the caption: title 3 words, whisper "seven claims, one frozen treaty" fades in at 0.5 s and is quiet (2/3). No throat-clearing (2/2). Frame-0 pink triple-overlap slice is tiny at thumbnail size. |
| B. Retention | **21**/25 | Something new every ≤3 s, camera travels between cues (7/8: three 2.9–3.0 s windows, at 17.3 / 25.2 / 35.6 s). Clear "but / therefore" spine: claims → overlap → treaty freezes → **but** a baby → **but** none of it counts → US/Russia → nobody's slice (5/6: `usru` plateaus a little, no new picture after the flags land). Re-hook with a cut at 20.3 s (41 %): "But in 1978… pregnant woman" (4/4). The payoff is not buried: the Texas comparison is the last big beat, but the two Texas ghosts are hard to read (orange on the yellow slice, the 2nd one hangs off the coast) (3/4). Pace 3.07 w/s, captions clean (3/3). |
| C. Rewatch & loop | **9**/10 | "So who owns Antarctica? Depends who you ask. Because…" → "7 countries claim Antarctica" is a true sentence loop (5/5). SSIM 0.88 (3/3). Frames dense enough to pause on (overlap, Esperanza in the pink zone), but no frame shows the 7 claims labelled together (1/2). |
| D. Shareability & saves | **11**/15 | Two strong "I didn't know that" facts: a baby born in a 3-way disputed zone, and the biggest unclaimed land on Earth (5/6: the baby's purpose is not stated, rightly, since SOURCES leaves the motive unstated; the viewer has to infer it). Save value: a claims map people want to keep, but the full pie is never labelled (2/4). Honest comment trigger, "Depends who you ask" + pinned "whose slice?" (3/3). Human stake: two pawns with names, no face (1/2). |
| E. Packaging | **9**/10 | Frame 0 / 3.7 s work as a cover (3/4: big shape + 3 words, no number). Caption written below (3/3). Series badge "REDRAWN EP 5" on every frame (3/3). |
| F. Niche codes & trust | **11**/15 | Visible change: slices appear one by one and the overlaps stack (4/4). Texas anchor for the US audience, but the picture is weak (2/3). Real stakes: pawns only, no portrait (1/3). Hedged where disputed: "dates vary, 1939–47", "our calculation", "known to be", Art. IV(2) on screen (3/3). Minor anti-patterns: the pawn caption collides with the "claimed by…" label (25.2–25.6 s); the `void` beat keeps a stale "NOV 1984 / Villa Las Estrellas, Chile" header; at 39.1–41 s the peninsula is drawn over the series bar (1/2). |
| **TOTAL** | **82/100 · 8.2/10** | **can break out** |

## Top 5 changes, ranked by expected gain (cue sheet / data only, voice untouched)
1. **+2 (B payoff, F anchor). Make the two Texases readable.** The ghosts are `#F2994A` on the `#FFC94D` unclaimed slice, which is too low in contrast, and TEXAS_B sits half on the sea (clarity fix #15 is still open). In `nobody.actions`, set both ghosts to a colour that stands out from yellow:
   ```json
   {"type":"ghost","id":"TEXAS_A","atWord":"twice","hold":3.0,"color":"#FFFFFF"},
   {"type":"ghost","id":"TEXAS_B","atWord":"size","hold":2.7,"color":"#FFFFFF"}
   ```
   Then rotate TEXAS_B about 4° toward the pole in `scripts/prep-antarctica.mjs` so it lies inside 90–150°W on land, and re-run the prep. Check with `npm run stills antarctica-claims -- --times 42.6,43.4,44.5`. The facts stay the same: true-size Texas, 2.19× by our calculation.
2. **+1.5 (A on-screen text, E cover). Put the numbers on screen from frame 0.** Whisper:
   `"whisper": "7 claims. 3 on the same slice."` (both numbers are in SOURCES: NPI 2011, WOR 6). This gives the muted scroller the hook before the caption builds. The "one frozen treaty" setup is not lost: the FROZEN stamp carries it at 17 s. If the whisper only fades in at 0.5 s, check whether the Header can show it at t=0 the way the title does. Frame 0 = last frame, so SSIM stays the same.
3. **+1 (F anti-patterns). Fix the three small collisions:**
   - `baby` label "claimed by UK · Chile · Argentina": `"hold": 1.2` (ends 25.17, before the Emilio pawn caption at 25.23).
   - `void`: add `"hideDate": true`. The beat is in the present tense, and the header still reads "NOV 1984 · Villa Las Estrellas, Chile".
   - `nobody.camera`: lower the land so the peninsula clears the series bar (y < 250 during 39.1–41 s). For example, try `"span": 33` or move `center` toward the pole (`[-112,-80]`), then confirm with `--props '{"guides":true}'` at 39.5 s.
4. **+1 (C density, D save value). One labelled frame of the whole pie.** The 7 claims are never labelled together; the `others` labels last only 0.9 s each. In `usru`, after the flags land, add short flag labels on the full map at "recognise" (hold about 2.2, ending before "own."). Use `label` actions at each `properties.label`, flags gb/nz/fr/au/no/cl/ar, text = country name, and keep the US/RU stickers on the sea. Do not use `allLabels`: its legend code is USSR-specific. If the labels clutter, drop this change and pin a labelled still in the comments instead.
5. **+0.5 (B gap at 17.3 s and 35.6 s). Fill the two 3 s holes.** In `treaty`, add `{"type":"shake","amount":3,"atWord":"No","occurrence":2}` on "No bigger ones" (a small "lock" beat). In `usru`, add `{"type":"pulse","ids":["NONE"],"atWord":"own."}` **only if** the slice already reads as unclaimed. It doesn't yet (white, undeclared until 40.2 s), so prefer a slow camera `dur` on `usru`, e.g. `"dur": 2.4`, which keeps the camera moving through 35–37 s.

Expected after 1–3: about 86–87/100.

## 3 alternative hooks (for a remaster / TikTok cut; all true per SOURCES.md)
| Archetype | Verbal line | Frame-0 visual | On-screen text |
|---|---|---|---|
| Myth-bust | "Nobody owns Antarctica? Seven countries say they do." | Full coloured pie, crane from low angle | **7 COUNTRIES SAY THEY DO** |
| Big number / comparison | "No country claims this land. It's more than twice the size of Texas." | Yellow unclaimed slice with the two white Texas ghosts already on it | **NOBODY CLAIMS THIS** |
| In-media-res / human | "In 1978, Argentina flew a pregnant woman to Antarctica." (motive unstated, as in SOURCES) | Pink peninsula, Esperanza pawn, "claimed by UK · Chile · Argentina" | **BORN IN ANTARCTICA · 1978** |

## Cover, caption, hashtags, pinned comment
- **Cover frame: 3.7 s.** Title "WHO OWNS ANTARCTICA?" + the UK/Chile/Argentina flags stacked on the pink slice. If the platform allows a text overlay, the cover text is **"3 COUNTRIES. 1 SLICE."** (or frame 0 with the new whisper from change #2).
- **Caption (IG / TikTok / YT Shorts):**
  > 7 countries claim Antarctica. 3 of them claim the same slice.
  > Antarctica territorial claims map, the 1959 Antarctic Treaty, and the first baby born in Antarctica.
  > Marie Byrd Land: the biggest unclaimed land on Earth. Sources in the comments.
- **Hashtags (4):** `#antarctica #maps #geography #history` (+ `#redrawn` on TikTok for the series).
- **Pinned comment question** (after the sources line already in SOURCES.md): "Three countries, one slice: if the treaty ended tomorrow, whose slice is it?"

## Platform notes
- **TikTok:** keep 49.6 s. Rewatch counts, and the "Because…" loop is the asset, so add no end card. The on-screen numbers (#2) matter most here, because search reads on-screen text. A 61–70 s Creator Rewards cut would need new script content (e.g. Peter I Island, the 2048 myth), not a slowed edit, so not this one.
- **Instagram Reels:** sends per reach is the signal. The baby fact is the send, so make sure the cover (3.7 s) and the first line are in the caption. Hashtags don't help reach; keep 3–4. Upload the clean master (no TikTok watermark).
- **YouTube Shorts:** the "viewed vs swiped away" metric is decided in second 1. Frame 0 already has motion and the title; the whisper with numbers (#2) is the cheapest win. Title field: "Who owns Antarctica? 7 claims, 3 on the same slice". Shorts loops automatically, so the SSIM 0.88 loop pays off most here.

VIRALITY SCORE: 82/100 (8.2/10) — can break out

## Applied after both reviews (final render, 18 Nov 2026)
- Clarity P1 1–7 applied (caption break fallback in `Captions.tsx`, frame 0 = final claims map with a quiet rewind at 1908, labels/holds, "Nov 1984", overlap label).
- Clarity P2/P3 applied: pawn caption on "Emilio", treaty chapter, holds, US/RU flags on the sea, overlap camera, chapter "1939–47", fewer keywords.
- Virality fixes 1, 2, 3, 5 applied: white Texas ghosts (TEXAS_B moved onto land), whisper "7 claims. 3 on the same slice.", collisions cleared, extra cues. Fix 4 (seven flag labels at once) not applied: clutter risk.
- Final metrics: 49.6 s · −14.1 LUFS · longest gap without a new cue 2.9 s · loop SSIM 0.88 · pre-flight 0 ✗, 1 ! (hook 4.1 s, voice kept).
