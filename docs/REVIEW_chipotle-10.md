# REVIEW — chipotle-10 (RECEIPTS #006, DA 2, Money3D)

## Reel review

**Verdict: postable after the P1s are fixed. Score 7/10.** The `slice` station does what it is meant to do. It is one
object, every amount sits on its own piece, and the meter counting down ($10.00 → 7.04 → 4.53 → 4.01 → 2.54 → 1.62)
reads well with the sound off. Every figure on screen matches SOURCES.md, the source line stays on screen for the
whole reel, nothing readable falls outside the safe area, and `npm run validate` passes with 0 ✗ and 0 !.
The layout is new, but the redundancy problem is still there at the three moments that matter most: the hook, the
payoff and the conclusion.

Checked: review_frames.py crashes on Windows (ffmpeg `drawtext` without a `fontfile`, exit 0xC0000005), so I pulled
30 frames by hand at 1080 and 360 wide, plus `out/stills/chipotle-10-guides/sheet.jpg`. I read every word timing.

### 3 biggest problems
1. **Redundancy at the payoff.** At 26.2–27.3 s "$1.62" is on screen 3 times: the meter says "CHIPOTLE KEEPS $1.62",
   the piece says "OPERATING PROFIT $1.62", and the caption says "AND CHIPOTLE KEEPS $1.62.". The hook (price tag
   "$10 YOU PAY" with caption "YOU PAY CHIPOTLE $10."; ghost "UNDER $3" with caption "UNDER $3.") and the `point`
   card (it restates the caption word for word) have the same problem.
2. **"Let's cut it open" (5.7–6.3 s) cuts nothing.** The burrito sits still from about 5.0 s to the first cut at
   9.09 s. That is a 4.9 s gap, and it falls on the line that promises an action.
3. **The payoff is too short and the middle has no re-hook.** The keep label is fully readable for only about 0.9 s
   (26.4 → 27.3 s) before the camera leaves for the bars station. From 4.2 s to 27.6 s (23 s) the camera only makes
   ±6° yaw swings around the same framing.

### Findings
1. **[P1] keep · 26.17–27.6 s · $1.62 is shown three times at once (meter label, pinned label, caption).** Fix: the
   meter keeps its own label and only turns lime. The pinned label adds new information instead of repeating the
   amount. Hide the amount from the caption, because the screen already shows it twice.
   ```json
   "cut": { "type": "slice", "total": 10, "meterLabel": "Left of your $10", "keepLabel": "Left of your $10" }
   { "type": "cut", "share": 16.2, "value": 1.62, "amount": "$1.62", "label": "profit, before tax", "keep": true, "atWord": "$1.62" }
   "hideCaptionWords": ["$1.62."]          // on beat "keep"
   ```
   Code: `Money3D.tsx:472` does not pass `hidden` (Episode.tsx and Atlas.tsx do). Add
   `hidden={Object.fromEntries(spec.beats.filter((b:any)=>b.hideCaptionWords).map((b:any)=>[b.id,b.hideCaptionWords]))}`.
2. **[P1] open · 4.2–9.09 s · nothing happens on "cut it open" (gap 4.9 s).** New `slice` action `open`: at the word,
   every seam in the foil flashes in the accent colour, the burrito lifts 0.2 and settles, and the meter pulses.
   `{ "type": "open", "atWord": "cut" }` (5.97 s). In SliceStation, while `t` is between `open.t` and the first
   `cut.t`, add `0.06*done` to each segment's x (a hairline open) so the reel feels like it has already started.
3. **[P1] point · 34.83–37.0 s · the card repeats the caption** ("THE FOOD" struck / "PEOPLE & PLACE" against the
   caption "the food isn't… the people and the place are"). Replace it with the comparison that proves the claim.
   SOURCES already has it: labor + occupancy + other operating = 45.0 % → $4.50 per $10, against $2.96.
   ```json
   { "type": "line", "small": "FOOD, DRINKS, PACKAGING", "text": "$2.96", "strike": true, "atWord": "most.", "size": 130 },
   { "type": "line", "small": "CREW + RENT + RUNNING THE STORE", "text": "$4.50", "color": "#C8F53C", "atWord": "place", "size": 130 }
   ```
   Add "$4.50 (our calculation, 2.51+0.52+1.47)" to the facts table. "PEOPLE & PLACE" itself is readable: 130 px,
   lime, y ≈ 810–900, clear of the burrito.
4. **[P2] hook · 0.25–4.0 s · tag and ghost repeat the caption.** The tag "YOU PAY" sits under the caption "YOU PAY
   CHIPOTLE $10.", and the ghost "UNDER $3" sits next to the caption "UNDER $3.". Fix: `"tag": "PER $10 SPENT"`
   (it sets the unit framing from SOURCES), and hide the ghost's words from the caption:
   `"hideCaptionWords": ["Under","$3."]` on beat `hook`, which needs the code change from #1. The ghost is in the
   safe area (right edge = railX 930, top 880), so that part is fine.
5. **[P2] keep → year · 27.2 s · the payoff label leaves after about 0.9 s.** The camera key starts at
   `s.from - 0.3` (`Money3D.tsx:387`). For the segment after a `slice`, start it at `s.from + 0.35`, so the travel
   covers the word "Across" and not "$1.62". Better: in `scripts/voice`, set a 0.45 s pause after the "keep" beat
   (re-record).
6. **[P2] store · 17.14–21.76 s · gap of 4.6 s.** The label "delivery, ads, card fees" appears at 17.14, about 2 s
   before the voice lists those items (19.21–20.95). Add `labelWord` to `cut`: the amount lands on `atWord`, and the
   name fades in on `labelWord`.
   `{ "type": "cut", …, "amount": "$1.47", "atWord": "$1.47", "labelWord": "delivery," }` (19.21 s).
7. **[P2] office · 21.76–26.17 s · gap of 4.4 s.** Same mechanism: `"labelWord": "head"` (22.8 s). Also change the
   label to `"head office, gear, new stores"`, which matches the voice ("equipment and new stores").
8. **[P2] food · 7.04–9.09 s · the piece is named 2 s before it moves.** Use `labelWord` the other way round here:
   piece and label on "Food," (7.04), amount and meter on "$2.96". In SliceOverlay, render the amount only when
   `t >= a.amountT`. Do the same for crew: `"labelWord": "crew"` (11.99) and amount on "$2.51" (12.94).
9. **[P2] cut · 4.2–27.6 s · one framing for 23 s, no mid-reel re-hook.** Add an optional `camera` on each `cut`,
   merged into `angle` at `Money3D.tsx:396`. A push-in on the thin pieces (rent at 15.8 s) makes the re-hook:
   `{ "type": "cut", "share": 5.2, …, "camera": { "pitch": 48, "yaw": -14, "dist": 0.7 } }`.
   The keep cut keeps its steeper angle.
10. **[P2] year · 28.03 s · sync.** The food bar ($3.5B) pops on "4,000" while the voice says "4,000 restaurants",
    and nothing on screen says 4,000. Fix: bar `atWord: "restaurants,"`, and big label
    `"spent at 4,000+ Chipotles · 2025"` (SOURCES: "over 4,000").
11. **[P3] all · captions · the accent colour is diluted.** All 6 keywords plus every number are lime in captions,
    while the pieces use their own colours and lime is meant to be "the keep". "food" in "the FOOD isn't" goes lime
    on the losing side. `"keywords": ["keeps", "people", "place"]`.
12. **[P3] hook · frame 0 · the foil burrito reads as a white capsule at thumbnail size,** and the red dot on the
    tortilla end looks like an eye. Add 2–3 foil crinkle lines and a darker fold seam, remove the red dot, and warm
    the foil slightly (#D9D4C8) so it reads as food.
13. **[P3] loop · 39.5 s → 0 s · SSIM 0.85.** The end frame shows the whisper line, but frame 0 does not (it fades
    in at about 1 s). Show the whisper at frame 0, or fade it out over the last 0.6 s.
14. **[P3] voice · episode.json uses George (`JBFqnCBsd6RMkjVDRZzb`), but CLAUDE.md specifies Brian.** If this is
    the owner's choice, write it into the manual. Otherwise the channel voice is inconsistent with #001–#005.
15. **[P3] tooling · `pipeline/review_frames.py` crashes on Windows** (`drawtext` without `fontfile`). Pass
    `fontfile=C\\:/Windows/Fonts/arial.ttf` when `os.name == "nt"`.

### Checks passed
- Accuracy: $2.96 / $2.51 / 52¢ / $1.47 / 92¢ / $1.62 add up to $10.00, and the meter steps are correct. $11.9B,
  $3.5B and $1.9B all match the 10-K rows. "Fiscal 2025" and "our calc." are in the source line for the whole reel.
- Sync: every `cut` lands within 0.1 s of its amount word (rent at 15.82, not 15.55, which is "Just"), and
  "$1.9B" lands at 29.66.
- Safe area: header 270–440 px, pinned labels between x 60 and 900, captions 1240–1340, source line about
  1425 (tight, but under 1440). The pinned label "OPERATING PROFIT $1.62" is visible and fits (x ≈ 750–900,
  y ≈ 870–1000). Mono labels are 25 px font with a cap height of about 22 px. They are readable, but this is the
  minimum: do not go smaller.
- DA 2: frame 0 is an object on a counter. The cut to bars at 27.6 s works as a re-hook, and every text either
  starts on the left margin or is pinned to an object.
