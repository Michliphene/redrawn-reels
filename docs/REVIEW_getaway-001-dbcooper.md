# REVIEW — getaway-001-dbcooper (THE GETAWAY · Case 001 · D.B. Cooper)

## Reel review — render 1

Inputs: `out/getaway-001-dbcooper.mp4` (72.4 s, voice 71.8 s, length OK for the 62–72 s target), 14 beat sheets
(`out/review/getaway-001-dbcooper/`), guides stills at 0 / 4.4 / 31 / 36.5 / 52.5 / 65.6 s, `npm run validate` (0 ✗, 1 `!`).

**Verdict: not postable yet. 6/10.** The hook poster, the loop (last frame = frame 0 with the stamp added) and the
noir palette work. Facts on screen all match SOURCES.md. The map half of the reel is weak: places go unnamed, the
"disputed area" looks like a pin, and two map beats show nothing at all.

**Top 3 problems**
1. **Caption runs off screen (P1)** at 64.4–66.1 s: "THE / FBI STOPS ACTIVELY INVESTIGATING" goes past x=930 and is
   cut at x=1080. Cause: `paginate()` in `src/studio/ui/Captions.tsx`. If no split fits in maxChars (20), `best` stays 1.
2. **The drop zone reads as a precise spot (P1, channel rule).** The `ghost` draws an opaque salmon puck (opacity 0.62,
   white rim, hovering) about 1/5 of the frame wide, sitting on the Columbia. It looks like a marker, not a broad
   approximate area. The FBI 1971 search area (hunt) is only a tiny italic text lying on the river, with no area drawn.
3. **Viewers lose track of where they are in the middle third (28–47 s).** Seattle, Portland and Reno are not named
   on the jump map. Nevada is an unlit dark void in the Reno beat. "Reno" appears on the word "Mexico." The path
   ribbons render as fat red extruded slabs (they read as bar charts). The Columbia River is never labelled,
   even though the find beat depends on it.

## Fix list

1. **[P1] status · 64.4–66.1 s · caption overflow / cut at the edge.** Episode fix:
   `"hideCaptionWords": ["actively"]` on beat `status`. The caption becomes "the FBI stops / investigating." (13/14 chars).
   Component fix (do it too, it affects every reel): in `paginate().close()`, when no split satisfies both
   `a,b <= maxChars`, greedy-fill line 1 up to maxChars and carry the rest to a NEW page instead of `best = 1`.
2. **[P1] jump · 35.8–40.8 s · drop zone looks like a point.** Component (`src/atlas/Map3D.tsx` ghost branch):
   add an `area: true` cue option. It draws the ghost flat on the ground (`y = 0.002`, `scale y 0.02`, no bob, no pop-in scale),
   `opacity 0.28`, edge in the ghost colour (not white), no shadow. Cue:
   `{"type":"ghost","id":"DROPZONE","color":"#E0312B","area":true,"atWord":"somewhere","hold":5.4}` and pull the
   camera out so the area reads as a region, not a pin: `"camera":{"center":[-122.4,46.3],"span":4.2,"pitch":46,"yaw":10,"cut":true}`.
   Move the region text inside the area and make it bigger (it is ~27 px now): `"at":[-122.5,45.95]`.
3. **[P1] hunt · 44.0–46.8 s · "FBI SEARCH AREA · 1971" has no area and lies on the Columbia** (row 19 = near Ariel /
   Lewis River). Replace the action with:
   `{"type":"ghost","id":"DROPZONE","color":"#E0312B","area":true,"atWord":"FBI","hold":2.8}`,
   `{"type":"marker","text":"Ariel · Lewis River","at":[-122.56,45.95],"atWord":"searches","hold":2.6}`,
   `{"type":"units","kind":"troops","at":[-122.56,45.95],"count":6,"atWord":"woods","hold":2}` (symbolic searchers).
   Then on "Nothing." `{"type":"shake","amount":4,"atWord":"Nothing."}`.
4. **[P2] note / south / hook · paths render as wide red extruded bars.** Add `"width": 3` to the `note` and `south`
   paths (hook already has 6, try 4). If the ribbon is still a slab at span 2–3.4, scale ribbon width by camera span in Map3D.
5. **[P2] south · 30.5 s · "Reno" appears on "Mexico." and the route ends in Reno before the voice says it.**
   It spoils the reno beat, and the label (y≈1250) sits in the captions band. Cut the south path at Red Bluff and point it at Mexico:
   `"coords":[[-122.3088,47.4502],[-122.65,45.65],[-122.235,40.178]]`, then replace the Reno marker with
   `{"type":"label","text":"→ MEXICO CITY (ORDERED)","at":[-121.6,39.6],"size":"md","atWord":"Mexico.","hold":2.6}`.
   Lower the camera: `"center":[-121.6,43.4],"span":9`. Fill "Low. Slow. Rear stairs down." (row 13), which shows nothing now:
   `{"type":"label","text":"LOW · SLOW · STAIRS DOWN","at":[-123.6,44.6],"size":"md","atWord":"Low.","hold":2.6}`.
6. **[P2] jump · 34.3–39.6 s · voice says "between Seattle and Reno" but no place is named.** Add
   `{"type":"marker","text":"Seattle","at":[-122.3088,47.4502],"atWord":"Seattle","hold":3}`,
   `{"type":"marker","text":"Portland","at":[-122.5975,45.5898],"atWord":"Seattle","hold":3}` (needs the span-4.2 camera of fix 2).
7. **[P2] reno · 39.8–43.7 s · Nevada is an unlit dark void, and there is no route into Reno.** Palette:
   `"ids":{"WA":"#C9B994","OR":"#C9B994","NV":"#B7A780","CA":"#B7A780"}`. Add the end of the route:
   `{"type":"path","coords":[[-122.235,40.178],[-119.7681,39.4991]],"atWord":"lands","dur":1.0,"hold":3,"color":"#E0312B","width":3}`.
   Accuracy wording: "NO PASSENGER" is ambiguous (the crew is aboard, and passengers left in Seattle). Use
   `"text":"HIJACKER NOT ABOARD"` (row 17).
8. **[P2] find · 47.1–56.9 s · the Columbia is never named; Tena Bar label is small.** Add
   `{"type":"label","text":"COLUMBIA RIVER","at":[-122.95,45.95],"size":"md","atWord":"Columbia","hold":3}`.
   Also `"pulse"` Tena Bar on "finds".
9. **[P2] how · 57.2–59.4 s · theories line is ~24 px, lies on the river, and goes beyond SOURCES debated #2 ("say nothing more").**
   Replace it with the key image of the case: the disputed area and the find together, with no claim of cause:
   `{"type":"ghost","id":"DROPZONE","color":"#E0312B","area":true,"atWord":"How","hold":2.2}`,
   `{"type":"marker","text":"Tena Bar · money found","at":[-122.77,45.72],"atWord":"How","hold":2.2}`.
10. **[P2] status · 59.7–64.4 s (virality gap 4.5 s) · nothing new on screen 62.45–64.39, and the header jumps to 2016
    on "A thousand…".** Remove beat-level `"date"` and add `{"type":"date","date":"2016-07-08","atWord":"2016,"}`.
    Extend the first callout `"hold":3.4`. Give status its own camera (now identical to `end`, so 12 s of the same
    shot): `"camera":{"center":[-122.55,45.9],"span":2.6,"pitch":40,"yaw":-14}`. `end` (hook framing) then
    becomes a pull-back, which gives the loop a real camera move.
11. **[P2] end · 66.4–66.6 s · "CASE INACTIVE" callout covers the poster** → status callout `"hold":1.7`.
12. **[P2] end · 68 s → · NEVER FOUND stamp overflows the poster on both sides and covers the eyes.** Add `"stampSize":46` to `end`.
    In `Wanted.tsx`, place the stamp on the lower half of the sketch (top ≈ 62 % of the poster height) and clip it to the poster width.
13. **[P2] end · 66.4–71.8 s (virality gap 6.0 s) · one element for 6 s.** Fix 10 gives the pull-back. Add a second typed line to the
    end poster (row 23, labelled as our calculation):
    `"lines":["Identity: unknown.","~$194,000 never recovered (our calc.)"]`. Keep it on the end poster only, so frame 0 still matches the hook.
14. **[P2] note→demand · 19.9–21.1 s · "BOMB THREAT" lingers under "IN $20 BILLS", and the path crosses the number.**
    Set `"hold":1.0` on the BOMB THREAT label and `"hold":2.4` on the note path (it then ends at the demand beat).
15. **[P2] seattle · 26.2–28.3 s · "36 PASSENGERS RELEASED" collides with the "Seattle–Tacoma airport" label.**
    Marker `"hold":2.4`, label `"at":[-121.95,47.62]`.
16. **[P2] hook · 0.25–4.4 s (virality gap 4.4 s; validate `!` hook 4.2 s) · the hook path is hidden behind the poster
    (it only peeks out as a red tab under it, which looks like a bookmark). It also ends in central Oregon, which doesn't match the real route.**
    Move the poster `"side":"left","w":340` and set the path to the same coords as fix 5, so it shows on the right. Add
    `{"type":"shake","amount":6,"atWord":"jumps"}` (no extra widget: one job per band). Hook
    length 4.2 s is justified by the loop question ("Caught, or not?"): accept the `!`.
17. **[P3] demand · 20–22 s · banknotes fly over the series bar / "CASE 001" (y < 300).** Clamp the bills' spawn area to y ≥ 320
    in the `bills` branch of `Overlays.tsx`.
18. **[P3] demand/find · rolling counters show intermediate figures ($199,396, ~$3,668, ~$5,696) not in SOURCES.**
    Accepted convention, but for this channel's "receipts" tone consider `"roll":false` (or a 0.4 s roll).
19. **[P3] board · 9.3 s · "NORTHWEST ORIENT 305" floats in the field.** Pin it to the Portland marker
    (`"at":[-122.5975,45.75]`). A small 3D jet piece would carry this beat better than text.
20. **[P3] find · 52.2 s · `bills: true` with `coinsCount: 8`: very few bills, gone before mid-beat.** Use `"coinsCount":16`.

## Checks passed
- Facts: 24 Nov 1971, Flight 305, Dan Cooper / not D.B., $200,000 in $20s, 4 parachutes, 36 passengers, "a little after 8 p.m.",
  10 Feb 1980 / Tena Bar / ~$5,800, serials match, 1,000+ / no suspect proven, 8 Jul 2016, 55 years: all in SOURCES.md.
  No suspect named. "ROUTE · APPROX." and "DISPUTED" are present. Ending stamp NEVER FOUND is present.
- Loop: last frame = frame 0 (title + whisper + poster, same camera). Only the stamp differs, which is a good payoff.
- Safe area (guides): nothing readable above y=250 or below y=1440. The only rail violation is fix 1.
  The Reno marker at y≈1250 (fix 5) sits in the captions band.
