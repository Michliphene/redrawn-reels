# THE GETAWAY · CASE 003 (`getaway-003-monalisa`): virality review, render 1

Inputs: `out/getaway-003-monalisa.mp4` (69.0 s, DA 2), `python3 pipeline/virality_metrics.py getaway-003-monalisa`
(hook frames 0–3 s + loop image), beat sheets 00–09 in `out/review/getaway-003-monalisa/`. Sheets 10–12 were missing, so
for `caught`, `patriot` and `end` I used the stills at 57.0, 60.55 and 64.59 s instead of extracting more frames. Also read:
`episode.json`, `SOURCES.md` (incl. the topic-selection notes), `timings.json` (word times) and the channel bible. The bar is
CASE 002 final, 89/100.

This is an estimate based on patterns, not a prediction. Account size is the biggest factor and we can't control it. The
channel is three episodes old, so the cold-start cohort test still decides everything: second 1, completion, rewatch, sends.

**Metrics:** 177 words · 2.71 w/s (in band) · first word at 0.25 s · hook 4.0 s ("20,000 a day come to see her. One man
took her.") · 33 visual cues = **4.8 per 10 s** (CASE 002: 6.2) · **11/35** two-second windows without a cue (CASE 002: 5) ·
longest gaps **7.13 s at 6.67 s** (`who`: wanted poster, then an empty beige stage 12.3–14.0 s), 5.62 s at 39.1 s (the
ticket types, then fades over an empty stage on "Both are cleared."), 5.01 s at 31.2 s (the twist callout, which is fine) ·
2 pixel-level cuts · loop SSIM **0.864** · −14.6 LUFS.

**Topic reach:** the best the channel has had. The face on frame 0 is already known to every viewer, there is a
myth-bust you can send ("she wasn't that famous until she was stolen"), a celebrity cameo (Picasso) and an honest debate
(thief or patriot?). Most of the remaining points are in execution: empty stages, three overlap bleeds and one date that
SOURCES forbids.

## 1. Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | 24/25 | Frame 0, paused and muted: the Mona Lisa in a gold frame on a wall in a light pool, "STOLEN FROM THE LOUVRE", empty CAUGHT / RECOVERED / FAMOUS boxes. It is the strongest frame 0 the channel has had. Two flaws: the verdict boxes overlap the painting's lower-left corner, and the red whisper crosses the grey wall at low contrast. The 12 crowd pawns meant to carry "20,000" are tiny (7/8). Sentence 1 has a number and a contradiction (7/7). Place and subject are clear by 0 s from the title and the face (5/5). Text: a 4-word title plus the whisper (3/3). No throat-clearing (2/2). |
| B. Retention | 19/25 | One camera move per beat and four cuts. But 11/35 windows have no cue. The stage is **empty beige** at 12.3–14.0 s ("…her protective glass." → "On"), which is exactly where early drop-off happens, and again at ~44 s ("Both are cleared." over a fading ticket). `who` and `caught` play in a featureless void: Paris and Florence at span 0.3–0.4 show no city (5/8). Strong but/therefore chain: insider → theft → nobody notices → empty wall → *but* she wasn't famous → front pages → wrong suspects → the trunk → Florence → caught → patriot → the whole world. `caught` → `patriot` is a short plateau (5/6). Re-hook "And here's the twist." with a cut at 28.3 s (41 %) (4/4). The myth-bust payoff, "front pages around the world", gets 2.7 s and one cartoon, and the fame itself is never shown in the world (3/4). 2.71 w/s is fine, but 69 s is long for Reels/Shorts (2/3). |
| C. Rewatch & loop | 10/10 | "…And the whole world comes to see her." → "20,000 a day come to see her." The repeated "come(s) to see her" is the best seam the channel has written (5/5). SSIM 0.864 ≥ 0.85 (3/3). It only just clears, though: the painting in the last frame is about 60 % of its frame-0 size and the caption sits over the crowd. The loop asks the question, then answers it with three ticks plus WORLDWIDE. The wanted posters, the police ticket and the Puck cartoon are worth a pause (2/2). |
| D. Shareability & saves | 13/15 | Four send facts: not that famous before the theft, crowds queuing to stare at an empty wall, Picasso questioned, 28 months in a trunk in Paris (6/6). Save value: a series of 3 with case-file trivia, but no reference object (2/4). Comment trigger: "thief or patriot?" is a genuine, sourced debate (row 16) (3/3). Human stake: Peruggia's real police photo plus the queue at the empty wall (2/2). |
| E. Packaging | 9/10 | Frame 0 makes a near-perfect thumbnail: the most famous face in art plus a 4-word title (4/4). Caption written below (3/3). The CASE 003 tab is still small, but the title + verdict-box system now reads as a format (2/3). |
| F. Niche codes & trust | 13/15 | Visible transformation: the painting, then four bare pegs, then the painting back (4/4). Anchor: the Mona Lisa itself, 20,000 a day, Picasso, and a New York cartoon for the US audience (3/3). Real face: Peruggia's public-domain police photo (3/3). Hedging is good: SYMBOLIC, reconstruction note, ROUTE · APPROX., ACCOUNTS VARY, "isn't that famous yet" (3/3). Anti-patterns: the Puck archive overlaps the police ticket at 39.1 s, ARRESTED overlaps the CONVICTED poster at ~60.5 s, and the poster lingers over the ghost verdict boxes at 64.6 s. There are also two floating callouts (the twist, ARRESTED) where the world could carry the fact. **Trust flag:** the header shows **"11 DEC" 1913**, but SOURCES debated point 5 says "screen shows DEC 1913 only". Also, "4 IRON HOOKS" should match the sources' "pegs" (0/2). |
| **TOTAL** | **88/100 = 8.8/10** | **Tier: strong breakout odds.** Render 1 is above CASE 002 render 1 (84) and one point under CASE 002 final (89). With changes 1–5 the ceiling is about 92–93. |

## 2. Top 5 changes, ranked by expected gain
None of these needs a new voice line. All are cue edits in `public/episodes/getaway-003-monalisa/episode.json`, and the
word times come from `timings.json`.

### 1. Fill the empty stage at 12.3–14.0 s and the Paris void (+2, B)
"He even helped fit her protective glass" is the irony of the case, and right now it plays over nothing. Put the painting
back on the wall for that sentence and keep it there through the cut, so the theft has something to lift:
```json
// beat "who": shorten the poster so the two don't overlap, then add the painting on "He" (11.07 s)
{"type":"wanted", "...": "unchanged", "atWord":"Vincenzo", "hold":4.2},
{"type":"prop","kind":"painting","image":"assets/art/monalisa.jpg","wall":true,"at":[2.3376,48.8606],"size":340,
 "atWord":"He","hold":2.9,"caption":"PROTECTIVE GLASS"}
// beat "theft": the painting is there from the first word, not from "August"
{"type":"prop","kind":"painting","image":"assets/art/monalisa.jpg","wall":true,"at":[2.3376,48.8606],"size":340,
 "atWord":"On","hold":1.75}
```
Also extend the `who` Louvre marker (`"hold": 2.6` → `"hold": 4.4`) so "Paris, 1911" is never a bare plane. If the prop
does not take `caption`, use a `label` "PROTECTIVE GLASS" at `[2.3376,48.882]`, `atWord: "protective"`, hold 1.4. That
is row 4, and the wording stays as hedged as the voice.

### 2. Remove the three bleeds and fix two trust details (+2, F anti-patterns + trust)
```json
// "press": the archive ends before the ticket starts (front@37.29 → ends 39.0)
{"type":"archive", "...":"unchanged", "atWord":"front", "hold":1.7}
// "caught": SOURCES debated point 5 says the day varies (11 or 12 Dec), so show the month only
{"type":"date","date":"1913-12","atWord":"Caught."},
{"type":"callout","text":"ARRESTED","sub":"FLORENCE · DEC 1913","atWord":"Caught.","y":900,"size":90,"hold":0.5}
// "patriot": enter on "some" (61.32) and leave before "She" (64.59)
{"type":"wanted", "...":"unchanged", "atWord":"some", "hold":3.0}
// "crowds": match the sources (row 8, "four iron pegs")
{"type":"label","text":"4 IRON PEGS", "...":"unchanged"}
```
The `11 DEC` fix is not optional: it is a figure that SOURCES explicitly keeps off screen.

### 3. Show the myth-bust in the world, not only in a box (+1–2, B payoff / F)
The twist is the send, but in the world it is a floating black callout. In `twist`, add a thin queue in front of the
painting (in-world information, labelled SYMBOLIC). Then the 12 pawns at the end read as "now the world comes":
```json
{"type":"units","kind":"crowd","at":[2.3376,48.8606],"count":2,"spread":120,"size":34,"offset":[120,150],
 "atWord":"Admired,","hold":3.6,"caption":"1911 · NOT THE MOST VISITED · SYMBOLIC"}
```
The caption is row 9 ("far from the most visited item in the museum"). Keep the callout but drop its `hold` to 3.2 so
the pawns own "Admired, yes. A superstar? Not yet." In `press`, make the pulse visible by adding `"US"` to the `ids` if
the base map has it. Otherwise leave it, because the Puck caption already says "New York".

### 4. Give `caught` a place and a trap (+1, B)
At 55.5–59.7 s a lone painting floats in an empty beige void (still at 57.0 s). Name the city and type the trap as the
channel's document (rows 13–14):
```json
{"type":"marker","text":"Florence","at":[11.2558,43.7696],"atWord":"The","hold":2.0},
{"type":"ticket","head":"Florence","sub":"Dec 1913 · reconstruction",
 "rows":[["DEALER","A. GERI"],["BRINGS","G. POGGI · UFFIZI"],["THEN","POLICE"]],
 "note":"From published accounts. Not an original document.","atWord":"dealer","hold":3.7,"y":600,"cps":44,"keyW":160}
```
The ticket must end before "Caught." (59.72) so ARRESTED lands alone. Move the painting prop to `"offset"` / a smaller
size, or drop it if the ticket covers it.

### 5. Clean up frame 0 (+1, A, and the cover)
Hang the verdict boxes on the left margin so they stop cutting into the painting. Set `"x": 64` in both `hook` and `end`
so the loop still matches. Make the crowd under "20,000" readable at grid size: `"count": 16, "size": 44` in both beats.
Check `--props '{"guides":true}'` on one still: the boxes must stay under y=1440, and the whisper should not sit on the
grey wall. If it does, nudge the camera `center` latitude in both beats by the same amount.

**Not ranked (needs a new voice take): a ~52 s Reels/Shorts edit.** See the platform notes.

## 3. Three alternative hooks (all inside SOURCES.md; each needs a new voice line)
1. **Contradiction / in-media-res.** Voice: "For over a day, nobody notices the Mona Lisa is gone." Frame 0: the wall with
   four bare pegs, the crowd pawns facing it, the title on top. On-screen text: **THE EMPTY WALL** (rows 6, 8).
   Loop: "…the whole world comes to see her" → back to the wall where she wasn't.
2. **Celebrity cameo.** Voice: "Police arrest a poet and question Picasso. The thief is a handyman with a trunk." Frame 0:
   the trunk in the torch pool, lid ajar, the painting inside. On-screen text: **PICASSO WAS QUESTIONED** (rows 11–12).
3. **Myth-bust.** Voice: "In 1911, the Mona Lisa isn't that famous yet. Then a handyman walks out with her." Frame 0:
   the painting on the wall, two pawns in front. On-screen text: **NOT FAMOUS… YET** (rows 3, 5, 9; keep "that famous
   yet", never "unknown"). It gives the twist away in second 1, as SOURCES already noted, so use it as a test variant only.

The current hook stays first choice. It has a number, a contradiction and the face, and the loop seam is perfect.

## 4. Cover, caption, hashtags, title, pinned comment
**Cover frame:** frame 0 (0.0 s), after change 5: title + painting + empty boxes. It asks the question, and it sits
inside a 3:4 grid crop (y 240–1680). Second choice: ~27.3 s, the empty wall with four pegs and the queue ("to stare at an
empty wall"). It is strange enough to stop a scroll, but less readable small.

**Caption:**
> 20,000 people a day come to see her. In 1911, one handyman walked out of the Louvre with her.
>
> The Mona Lisa theft: Vincenzo Peruggia, the empty wall at the Louvre, Picasso questioned, and a trunk in a Paris room for 28 months.
> Caught in Florence in December 1913. Did the theft make her famous? Historians debate how much.

**Hashtags:** `#monalisa #louvre #arthistory #heist #truecrime`
(Don't use any "Louvre heist 2025" tag. That case isn't in the reel or in the facts table, so it would be bait.)

**YouTube title:** **The Handyman Who Walked Out of the Louvre With the Mona Lisa (1911)**

**Pinned comment:** keep the SOURCES.md text and open it with:
"Crowds lined up to stare at an empty wall. Some Italians cheered him as a patriot. Thief or patriot? Sources below."

## 5. Platform notes
- **TikTok:** post the 69 s master as is (over 60 s for Creator Rewards). Frame 0 is the hook, so add no cover text.
  Put "Mona Lisa theft" in the first caption line, because TikTok search reads the caption. The comment debate (thief or
  patriot) is the lever, so reply to early comments with row 16 facts only.
- **Instagram Reels:** sends per reach decide distribution, and the send is "she wasn't that famous until she was
  stolen". Changes 3 and 1 matter most here. 69 s costs watch-time %. A ~52 s edit needs a new voice take, so it is a
  separate edit, not a speed-up: drop `unnoticed` into `crowds` ("Nobody notices for over a day. Then crowds line up… to
  stare at an empty wall."), cut "Vincenzo Peruggia, an Italian handyman, once worked at the Louvre." down to "Vincenzo
  Peruggia, a Louvre handyman," and cut the Uffizi sentence to "Then the police. Caught." Keep `patriot`, which is the
  comment trigger. Choose the frame-0 cover in the app.
- **YouTube Shorts:** "viewed vs swiped away" is decided in the first second. "20,000" lands at 0.25 s and the face is on
  frame 0, which is right. Use the title above (a search phrase), and link CASE 002 as the related video for series
  follow-through. Length is fine.
- **All:** credit the Library of Congress / Commons images in the pinned comment as SOURCES lists them. Never claim "the
  theft made her famous" as a single cause in any caption or reply.

VIRALITY SCORE: 88/100 (8.8/10) — strong breakout odds
