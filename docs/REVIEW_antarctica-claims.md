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
