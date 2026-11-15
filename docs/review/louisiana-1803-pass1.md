# Review: louisiana-1803, pass 1

Video `out/louisiana-1803.mp4`: 48.80 s. The voice ends at 48.18 s; after that the title fades back in for the loop.
I read all 15 beat sheets, `cues.md`, `timings.json` and SOURCES.md. Extra frames are in `/tmp/claude-0/review-tmp/l1_*.jpg`
(0, 7.9, 11.0, 13.3, 16.6, 20.6, 34.6, 38.9, 47.5, 48.6 s and the last frame). The strips are `l1_s1.jpg` and `l1_s2.jpg`.
Timing rule used below: an overlay stays visible until `t + hold + 0.4 s`, because the fade in `Overlays.tsx` `life()` adds 0.4 s.
So any hold that should end before the next beat must satisfy `hold ≤ nextBeatStart − t − 0.4`.

## Verdict: 6/10. Postable: **NO**

The story is strong, the pacing is tight and the loop seam is clean (the tail frame matches frame 0). Every figure is sourced.
Most beats have something new on screen at least every 2 s. Three things block posting:
1. **The two big numbers sit on top of each other (29.9–31.1 s).** "$15,000,000" is still on screen when "≈ 2.8¢" rolls in. Both its digits and its label become unreadable.
2. **The orange shape is never named "Louisiana" on the map.** The viewer hears "all of this" and "all of Louisiana", but the shape is only labelled inside a question callout.
3. **The French flag lands on the eastern US (port, 12.2–13.6 s).** It sits over Virginia and stays into the Jefferson beat. This reads as "France owns the US".

## Issues

1. **[P1] deal → acre · 29.9–31.1 s · $15M and ≈2.8¢ bigNumbers overlap.** The first one runs until 28.51 + 2.2 + 0.4 = 31.11 s, but acre starts at 30.08 s.
   Fix: in `deal` set the bigNumber `"hold": 1.0` (it then ends at 29.91). In `acre` set the bigNumber `"hold": 1.0` (ends 31.48, before the legal beat at 31.57).
2. **[P1] offer/port/ask · the subject shape is never labelled.** Add the label on the word "Louisiana" in `port` (11.38 s, during a 2.5 s stretch where nothing new appears):
   ```json
   {"type":"pulse","ids":["LOUISIANA"],"atWord":"Louisiana"},
   {"type":"label","text":"LOUISIANA","at":[-99,41],"size":"xl","atWord":"Louisiana","hold":1.1}
   ```
3. **[P1] port · 12.22–13.62 s · French flag at x=880,y=620 is over the US east coast** and lingers into `budget`. Put it on Louisiana instead, on "back", and end it before the beat ends:
   ```json
   {"type":"sticker","flag":"fr","at":[-99,41],"dy":-110,"size":120,"atWord":"back","hold":0.6}
   ```
4. **[P2] borders · 38.45–40.75 s · "British lands" and the third "?" are hidden under the date badge and chapter chip.** Only "Br…" shows.
   Fix: move both below the chip. Use `"at":[-112,47.6]` for the region and `"at":[-96,47.8],"dy":0` for the sticker. If the chip still covers them, set the camera to `{"fit":"FOCUS","pad":0.18}`.
5. **[P2] loop · 47.17–48.28 s · "15 states" callout covers the New Orleans marker and the start of the loop.** In `today`, set `"hold": 0.7` on that callout (it then ends at 47.18).
6. **[P2] budget · 14.6–16.8 s · Monroe's photo credit overlaps the "Paris" marker.** Move the camera north so Paris drops below the card: `"camera":{"center":[-40,56],"span":95}`.
   Check with a still at frame 470. The "≈ 3,800 miles" label at [-38,55] may then need `"labelAt":[-38,50]`.
7. **[P2] budget · "≈ 3,800 miles" is not in SOURCES.md.** The figure is right (Washington–Paris great circle ≈ 3,840 mi), but it must be logged.
   Add a row: `| Washington–Paris | ≈3,800 mi great-circle, symbolic (Monroe sailed New York → Le Havre) | computed |`. Otherwise drop the label.
8. **[P2] napoleon → ask · 21.59–23.59 s · The UK flag floats over the Gulf/Texas and lingers into `ask`.** A viewer could read it as "Britain is here". Move it to the Atlantic, fire it on "war", and shorten the Haiti marker:
   ```json
   {"type":"sticker","flag":"gb","x":860,"y":760,"size":120,"atWord":"war","hold":0.85}
   ```
   Also set the Haiti marker to `"hold": 1.9` (it then ends at 22.41).
9. **[P2] legal · 31.57–34.28 s · For 2.7 s nothing new appears besides the portrait.** This stretch includes a 1.15 s voice pause after "constitutional." Add a callout (sourced: "Jefferson thought an amendment was needed; drafted one"):
   ```json
   {"type":"callout","text":"Constitutional?","sub":"Jefferson drafted an amendment","y":1080,"size":64,"atWord":"sure","hold":1.1}
   ```
   Also set the portrait to `"hold": 3.3` so the BUYS IT stamp is readable for about 1 s instead of about 0.6 s.
10. **[P2] double · 35.35–37.15 s · The camera stays on the FOCUS fit, so half of the 1803 US is off-screen when we say "doubles".**
    The doubling cannot be seen. Fix: `"camera":{"center":[-92,39],"span":44}` on `double`. This uses the same framing as `river`, so both blue areas are fully visible.
11. **[P2] hook · frame 0 · The New Orleans marker, the cityscape sticker and the "1 city?" callout all fade in from opacity 0, so frame 0 shows only the title over plain colour blocks.**
    Component fix in `Overlays.tsx`/`Labels.tsx`/`Stickers.tsx`: in `life()`, skip the fade-in when `t0 <= 0.05`. For example, use `const inEnd = t0 <= 0.05 ? t0 + 0.001 : t0 + 0.25`.
    This also makes frame 0 match the loop tail, which shows the marker.
12. **[P2] port · 7.6–9.4 s · The sailboat at [-90.2,36] covers the "Mississippi" label**, which lingers until 9.5 s (`l1_7.9.jpg`). Move the boat downriver: `"at":[-90.9,32.6]`.
13. **[P3] Lingering labels (no collision, but each one bleeds into the next idea).** Set these holds:
    - `offer`: pointer `0.6`, fr sticker `1.1`
    - `ask`: callout `1.1`
    - `double`: callout `1.0`
    - `borders`: callout `1.2`
    - `natives`: Crow/Pawnee `2.0`, Osage/Caddo `1.8`, "Approximate areas" `0.8`

    The last change keeps the "approximate" disclaimer and the tribe names off the present-day state map.
14. **[P3] river · The chip "1803" repeats the big date badge right above it.** Change it to `{"type":"chapter","emoji":"world_map","text":"The border"}`.
15. **[P3] chips · "The offer" and "The deal" show no emoji.** The `thinking.json` and `writing.json` Lottie files do not appear in the frames. The busts PNG on "Native nations" is dark grey on navy and barely visible.
    Fix: delete the two `.json` files so the PNG fallback is used (if the PNGs exist), or use another emoji such as `handshake`.
16. **[P3] locator · The "YOU ARE HERE" text is about 18 px at 1080 w**, below the 28 px readability floor. This is a Locator component change (font-size ≥ 26 px), or drop the text.
17. **[P3] loop seam · The timeline dot sits at 1803 on the last frame and at 1795 on frame 0.** Optional: set `timeline.from` to `"1800-01-01"` so the jump is shorter, or accept it (as in EP 2).
18. **[P3] loop · 47.2–47.6 s · During the recolor, the purchase passes through a washed-out tan** (the ghost fade-out blends with the orange fade-in). This is cosmetic. If it is easy, end the `today` ghost before `loop` with `"hold": 2.0`.

## Checks that passed
- **Sync:** every word-fired cue lands within 0.05 s of its word (cues.md vs timings.json). For example, Mississippi path on "ends", $10M on "ten", ×2 on "doubles", Senate on "buys".
- **Accuracy:** every on-screen figure matches SOURCES.md:
  - Spain → France, secret treaty, 1800
  - up to $10M for New Orleans + Florida
  - April 11 and April 30, 1803
  - $15M = $11.25M + $3.75M in claims
  - ≈2.8¢ per acre, 828,000 sq mi
  - Senate 24–7 on Oct 20, 1803
  - handover Dec 20, 1803
  - "Shown as settled 1818–19"
  - 15 states, "all or part"

  "Haiti (Saint-Domingue)" and "First Consul" are correct for 1803, and the 15-star flag fits the period. The only gap is "≈ 3,800 miles" (item 7).
- **Loop:** the tail frame (title, New Orleans, same camera) matches frame 0, apart from items 11 and 17.
- **Layout:** nothing falls in the captions band (y ≈ 1380–1560) or on the timeline. Callouts at y 1060–1120 clear the captions.

## Re-render checklist
After fixing, take stills at 30.3 s (frame 909), 11.6 s, 12.5 s, 15.5 s, 36.5 s, 38.8 s, 47.3 s and 0. Item 1 has priority.
