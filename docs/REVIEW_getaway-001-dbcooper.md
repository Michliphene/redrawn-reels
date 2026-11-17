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

## Virality review — render 2

Inputs: `out/getaway-001-dbcooper.mp4` (render 2, 72.4 s; voice 71.8 s on purpose, for the TikTok > 60 s rule),
`pipeline/virality_metrics.py` (hook frames + loop image), beat sheets regenerated from render 2
(`pipeline/review_frames.py`; the earlier sheets were made before this render), `episode.json`, `SOURCES.md`, channel bible.
This is a pattern-based estimate, not a prediction. Account size is the biggest factor, and we can't control it. This is episode 1 of a
channel with no followers, so the cold-start cohort test is the whole game: second 1, completion, rewatch.

Metrics: 163 words, 2.38 w/s, first word 0.25 s, hook 4.16 s, 42 cues = 5.8 per 10 s, 10/36 two-second windows without
a cue (most are covered by camera travel between beats), longest gaps 66.4 s (6.0 s, end; the NEVER FOUND stamp lands
inside it, so the real gap is ~3 s), 0.25 s (4.4 s, hook; camera tilt + path draw cover it), 11.9 s (4.3 s, ticket; ALIAS
stamp at "Not" covers it). Loop SSIM 0.906. −14.1 LUFS.

### Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | 21/25 | Frame 0 = noir desk + FBI sketch poster + "CAUGHT OR NOT?": stops paused and muted (6/8, the map half is an unreadable tilted shape with a red slab). Sentence 1 has the jump, the jet and $200,000 (7/7). Subject: the sketch is iconic, but the name people search, **D.B. Cooper**, is nowhere on screen, and no place is named in the hook (3/5). Text: 3 words + whisper (3/3). No throat-clearing (2/2). |
| B. Retention | 19/25 | Cues + a camera move every beat. Gaps are covered (6/8). Strong but-therefore chain (bomb → money → jump → gone → nothing → the find → nobody knows), but the title moment "he jumps" is a static map with an oval: the climax is the flattest beat (4/6). Re-hooks: "Not D.B." myth-bust at 13 s, cut at 34 s (48 %), cut to 1980 at 47 s (4/4). Payoff: NEVER FOUND stamp is small and half-covers the name (3/4). 2.38 w/s is slow, but the deadpan suits it. 72 s is a length penalty we accept (2/3). |
| C. Rewatch & loop | 9/10 | "…Caught, or not?" → "He jumps from a jet…" loops cleanly (5/5). SSIM 0.906 (3/3). Frames are dense enough to pause on (1/2). |
| D. Shareability & saves | 11/15 | Send fact: "his name wasn't D.B., the press got it wrong" + "a kid finds $5,800 of it in 1980" (5/6). Save value: a case file, but series of 1 (2/4). Comment trigger: "caught or not?" is honest and open (3/3). Human stake: the boy, the crew, low (1/2). |
| E. Packaging | 8/10 | End frame (poster + stamp + title) works as a thumbnail but the stamp is small (3/4). Caption written below (3/3). "THE GETAWAY · CASE 001" tab is tiny at grid size, and this is ep 1 (2/3). |
| F. Niche codes & trust | 12/15 | Visible transformation: route → disputed drop zone → money on the river (3/4). Anchors: Seattle / Portland / Reno, $200,000, no familiar scale comparison (2/3). Real face: PD FBI sketch (3/3). DISPUTED, APPROX., "symbolic", "our calc.", no suspect named (3/3). Minor anti-patterns: floating black callout boxes in `status`, three small labels fighting in `hunt`, hook path unlabelled and ending in central Oregon (1/2). |
| **TOTAL** | **80/100 = 8.0/10** | **Tier: can break out** |

### Top 5 changes, ranked by expected gain (cue-only; the voice stays as is)
1. **Put "D.B. Cooper" on frame 0 (+3: A subject, E search/cover, D myth-bust set-up).** The search term and the
   recognition trigger is "D.B. Cooper". The reel's own twist (12 s: "Not D.B. The press got that wrong") only pays off
   if the viewer has *seen* "D.B." first. The FBI files the case as "D.B. Cooper Hijacking" [F1], so it's true as the case name.
   ```json
   "whisper": "The D.B. Cooper case · $200,000 · 1971"
   ```
   Also have the whisper on from frame 0. Right now it fades in at ~0.5 s, so the paused frame 0 has no number. Component: in
   `src/atlas/Atlas.tsx` / `TitleBlock`, skip the whisper fade-in on the first beat. If the owner does not want "D.B."
   on screen before the correction, use `"Dan Cooper's jump · $200,000 · 1971"`. That keeps +1 for the number on frame 0
   but loses the search gain.
2. **Give the jump a moving picture (+2: B escalation, F transformation).** At 34–40 s the title moment shows a still map.
   Fly the approximate route over the disputed area while the voice says it, then pulse the area on "jumps.":
   ```json
   {"type":"path","coords":[[-122.3088,47.4502],[-122.65,45.65],[-122.45,44.6]],"atWord":"little","dur":3.4,"hold":5.2,
    "color":"#E0312B","width":3,"label":"ROUTE · APPROX.","labelAt":[-123.3,44.9]},
   {"type":"pulse","ids":["DROPZONE"],"atWord":"jumps."}
   ```
   (Check on stills that `pulse` lights the DROPZONE feature. If it does not, re-fire the ghost on "jumps." with `hold` 1.2.)
   The route stays "APPROX." and the area stays a region, never a point (debated point 1).
3. **Make the verdict stamp read at thumbnail size (+2: B payoff, E cover).** The whole channel promise ends on the stamp,
   and at 46 px it sits on the name and spills over the poster edge. Grow the poster in BOTH `hook` and `end` (same size keeps
   the loop SSIM) and the stamp with it:
   ```json
   "w": 400, "stampSize": 60
   ```
   This needs the reel-reviewer's fix 12 (stamp on the lower half of the sketch, clipped to the poster). The poster's right
   edge is ≈ x 470, well inside the rail. Check the end frame on a `--props '{"guides":true}'` still.
4. **Name the place in the hook, and fix the hook route (+2: A place < 1.5 s, F trust).** Right now the hook path is unlabelled and ends
   in central Oregon, which is no part of the route. Use the documented corridor and label it:
   ```json
   {"type":"path","coords":[[-122.3088,47.4502],[-122.65,45.65],[-122.235,40.178]],"atTime":0,"from":0.35,"dur":1.6,
    "hold":3.2,"color":"#E0312B","width":3,"label":"ROUTE · APPROX.","labelAt":[-123.4,44.4]},
   {"type":"marker","text":"Seattle","at":[-122.3088,47.4502],"atTime":0.3,"hold":3.6}
   ```
   Add the same Seattle marker to `end` (`"atWord":"Caught,"`, `"hold":2`) so the last frame still matches the first.
5. **Declutter `hunt` and put `status` in the world (+1: F anti-patterns, B readability).** In `hunt`, three small labels
   ("FBI SEARCH AREA · 1971", "Ariel · Lewis River", "Searchers (symbolic)") overlap on one spot for 2.8 s. Drop the
   `region` text (the ghost area already says it) and move the units caption under the pawns: `"offset":[0,90]`. In
   `status`, re-use the poster instead of a floating box on "thousand", which also previews the end frame:
   ```json
   {"type":"wanted","key":"cooper_sketch","name":"Dan Cooper","headSub":"1,000+ investigated","lines":["No suspect proven."],
    "credit":"FBI composite sketch · public domain","side":"center","y":560,"w":380,"atWord":"thousand","hold":3.0}
   ```
   Keep the "CASE INACTIVE · FBI · 8 Jul 2016" callout on "stops".

Projected after 1–5: ≈ 86/100 (gains overlap; the 72 s length and the cold-start account are the ceiling).
No fix changes a fact or the voice. Fix 1 is the only one that touches the "D.B." wording, and it uses the FBI's case title.

### 3 alternative hooks (cue-only versions use the current voice line; all facts from SOURCES.md)
- **Myth-bust (on screen):** voice unchanged. Frame 0 = poster with `"name":"D.B. Cooper"` crossed out by an `ALIAS`
  stamp already on, headSub "Name on the ticket: Dan Cooper". On-screen text: "HIS NAME WASN'T D.B." (rows 5, 6).
- **Big number:** voice unchanged. Frame 0 = `bigNumber` $200,000 with `bills` falling over the dark map, poster behind.
  On-screen text: "$200,000. NEVER FOUND?" (rows 8, 23). Note: ≈ $194,000 was never recovered, so use the question
  form, not "never found" for the money.
- **In-media-res (needs a new voice line, only if the script reopens):** "Four parachutes. Twenty-dollar bills. And a
  man nobody has ever found." Frame 0 = the drop-zone area glowing at night, rear-stairs label. On-screen text:
  "CAUGHT OR NOT?" (rows 8, 9, 24).

### Cover, caption, hashtags, title
- **Cover:** frame **2.8–3.0 s** (title "CAUGHT OR NOT?", whisper, poster, caption "$200,000"), after fix 1 so it reads
  "The D.B. Cooper case · $200,000 · 1971". It keeps the question open; the end frame with NEVER FOUND gives the answer away.
  On TikTok, set the cover text to **"D.B. COOPER: CAUGHT OR NOT?"** (4 words + name, in the top-center 3:4 crop).
- **Caption** (TikTok / Reels):
  ```
  He jumped from a jet with $200,000 in 1971. 55 years later, nobody can prove who he was. Caught or not?
  D.B. Cooper hijacking, 24 Nov 1971: Northwest Orient Flight 305, Portland to Seattle, the jump between Seattle and Reno.
  The 1980 Columbia River money find, traced on a map. THE GETAWAY · Case 001. Sources in the pinned comment.
  ```
  On 24 Nov 2026 you can open with "55 years ago today, …" (true on that date only).
- **Hashtags (5):** `#dbcooper #truecrime #unsolvedmysteries #coldcase #history`
- **YouTube Shorts title:** `D.B. Cooper Jumped From a Jet With $200,000. Caught or Not? #dbcooper #unsolved`
- **Pinned comment:** keep the sources block in SOURCES.md. Change its last line to a binary question that drives replies:
  "Caught or not? Did he survive the jump: yes or no?" (survival is unknown, debated point 3).

### Platform notes
- **TikTok:** post the 72 s cut as is (Creator Rewards). Cover text as above. Post on 24 Nov (anniversary searches peak).
  Reply to the first "it was [named suspect]" comments neutrally ("investigated, never proven, FBI 2016"). Never name anyone.
- **Instagram Reels:** same file. Sends per reach matter most: the "his name wasn't D.B." line is the share hook, so
  put it in the first caption line for Reels: "His name wasn't D.B. Cooper. And he was never found." No Creator Rewards
  constraint here, so a 55–58 s edit would likely complete better, but only if a later script trims the voice.
- **YouTube Shorts:** 72 s is fine (Shorts allow up to 3 min). "Viewed vs swiped" is decided by frame 0 + title, so fix 1
  matters most here. The title above carries the search term. Pick the first-frame cover, not an auto mid-frame.

VIRALITY SCORE: 80/100 (8.0/10) — can break out

## Render 3 — what was applied (17 Nov 2026)
Render 1 → reel review (6/10) → fixes → render 2 → virality review (80/100) → fixes → **render 3** (`out/getaway-001-dbcooper.mp4`, 72.4 s).

Applied from the reel review: caption overflow fixed in the engine (`paginate()` spills to a new page when no two-line
split fits — only pages that used to overflow change); drop zone drawn as a flat translucent **area** (`ghost` + `area: true`),
wider jump camera, Seattle/Portland named; hunt beat = area + "Ariel · Lewis River" + symbolic searchers; routes at width 3,
south leg ends at Red Bluff with "→ MEXICO CITY (ORDERED)" and "LOW · SLOW · STAIRS DOWN"; Reno leg drawn in the reno beat,
"HIJACKER NOT ABOARD"; "COLUMBIA RIVER" label; how beat = area + "Tena Bar · money found" + pointer; 2016 date moved to
the word "2016,"; stamp on the lower half of the poster; "~$194,000 never recovered (our calc.)" on the end poster;
overlap holds shortened; banknotes start under the series bar; counters roll in 0.6 s.
Applied from the virality review: case name on frame 0 (`whisper` + `whisperOnFrame0`), approximate route + Seattle in
the hook and the end (loop), route over the drop area in the jump beat, posters 400 px with a 60 px stamp, status beat uses
the poster ("1,000+ investigated / No suspect proven"), duplicate hunt text removed.
Not applied: `pulse` on DROPZONE (pulse only lights subject pieces; the area already pulses its opacity).

Metrics (render 3): −14.1 LUFS · loop SSIM 0.915 · 36+ cues · longest gaps without a new cue: 6.0 s at 66.4 s (the
verdict: poster, then the stamp on "never" — kept on purpose), 4.4 s at 0.25 s (hook), 4.3 s at 11.9 s.
Pre-flight: 0 ✗, one `!` accepted: hook beat 4.2 s (the first words land at 0.25 s; the beat carries the loop question).

## Non-regression (REDRAWN after the channel work)
Stills at 0 / 6 / 20 / 40 s, before (commit 4908840) and after:
- `ussr-1991-v2` (DA 2): **4/4 byte-identical**.
- `ussr-1991` (DA 1): 2/4 byte-identical, 2/4 differ at PSNR 63–79 dB. Two renders of the *same* code differ by the same
  amount (measured: 63 dB at 40 s between two runs), so this is render noise of the DA 1 path, not a change.

## Owner checklist before posting
- [ ] Listen once: "D.B.", "three-oh-five", "Reno", "fifty-eight hundred".
- [ ] Tick the FBI lines of SOURCES.md against fbi.gov (not reachable from the cloud session): rows 8, 9, 11, 12, 14, 17, 24; row 13 (FBI Vault OCR).
- [ ] Post on 24 Nov with "55 years ago today"; otherwise edit the first caption line.

## Render 4 — creative pass (owner: "sors du cadre, sois plus créatif")
Voice and facts unchanged; only the world and the cues. New kit pieces (reusable by every map episode):
- `vehicle`: a low-poly tri-jet with a T-tail flies the route above the table, banks in turns, casts its shadow on the
  map, opens its **rear airstair** ("Rear stairs down."), lands in Reno with the stairs still down. On "jumps" a figure
  under a canopy drops and **fades out in the air** with a "?" — the jump is shown without implying a landing point.
- `night`: from "south," the map goes dark except a torch pool that follows the jet; rain streaks on "in the rain,";
  a static searchlight on the search area in the hunt beat; dark again on the last line (loop).
- `ticket`: the ticket beat types a reconstruction (flight 305, Portland → Seattle, 24 Nov 1971, DAN COOPER — labelled
  "Reconstructed from the FBI record. Not the original ticket.") and the press cutting "D.B. Cooper" is struck out on "D.B.".
- `verdict`: CAUGHT / NEVER FOUND tick boxes, empty on frame 0, the red cross lands on NEVER FOUND on "never".
  First and last frame now differ only by that cross and the stamp: the loop *asks* then *answers*.
Metrics: −14.1 LUFS · loop SSIM 0.907 · 46 visual cues (was 36) · no gap over 4.5 s (the 6 s gap at the verdict is gone).
Non-regression: `ussr-1991-v2` 4/4 stills byte-identical after the kit changes; `npm test` green.
