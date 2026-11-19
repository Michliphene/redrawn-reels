# REVIEW — getaway-003-monalisa (THE GETAWAY · Case 003 · The Mona Lisa theft)

# REVIEW: getaway-003-monalisa (THE GETAWAY · CASE 003 · the Mona Lisa, 1911). Reel review, render 1

Inputs: `out/getaway-003-monalisa.mp4` (69.0 s, voice 68.4 s, DA 2), 13 beat sheets + `cues.md` (`out/review/getaway-003-monalisa/`),
guide stills at 0 / 4.3 / 37.8 / 54.6 / 67.8 s (`out/stills/getaway-003-monalisa/sheet.jpg`), spot frames at 15.0 / 22.8 / 26.3 / 50.5 s.
`npm run validate`: **0 ✗, 1 !** (the hook runs 4.0 s, see #20). Metrics: −14.6 LUFS · 33 visual cues = **4.8 / 10 s** (CASE 002: 6.1) ·
11 of 35 two-second windows have no new cue · longest gaps 7.13 s (6.67 s), 5.62 s (39.1 s), 5.01 s (31.2 s) · loop SSIM **0.864** (CASE 002: 0.946).

**Verdict: not postable yet. 6/10** (CASE 002 render 1 scored 6.5). Frame 0 is the best we have had: a face everyone knows, on a lit wall,
with the three empty CAUGHT / RECOVERED / FAMOUS boxes. It reads as an object in a space. The new kit works: the empty wall with its
4 hooks is a strong image, the trunk lid opens on "trunk." and shows her inside, and the train runs the Paris→Florence line on "takes".
The re-hook pull-back to Europe with the Puck cartoon (36–39 s) lands well. Three things hold the reel back:

1. **One on-screen fact contradicts SOURCES** (P1). The header shows **11 DEC** on "Caught.", but debated point 5 says to show "DEC 1913 only".
2. **The CASE 002 collision pattern is back, five times.** Each one comes from a `hold` that runs past the beat end: the two Louvre
   labels stack (22.5 s), the archive sits under the police ticket (39.1 s), the trunk and "28 MONTHS" sit over the Paris marker (50.4 s),
   POLICE · SYMBOLIC sits under ARRESTED (59.7 s), and the CONVICTED card covers the verdict box as CAUGHT gets ticked (64.6–65.0 s).
3. **The world is still a blank beige plane** (CASE 002 #8 was not fixed). "Paris, 1911" shows a 60 px wall, and only a marker names the
   place. The Louvre, the room, the trunk "in Paris" and the Uffizi all float on the same empty ground. 4.8 cues per 10 s, with a 7 s stretch
   in `who` where only the wanted card is on screen, then 1.2 s of empty plane. Sync on the payoff words is loose: BOTH CLEARED is typed
   2.4 s before the voice says it, and the NOT YET stamp shows for 0.3 s.

## Fix list ([P] beat · time · problem · fix)

1. **[P1] caught · 59.72 s** · The date chip reads "11 DEC". The day is disputed (11 or 12 Dec, fact 14 / debated point 5). Fix:
   `{"type":"date","date":"1913-12","atWord":"Caught."}`
2. **[P1] patriot → end · 64.6–65.0 s** · The CONVICTED card (60.73 + 4.2 s + fade) covers the verdict boxes as CAUGHT is ticked on "goes".
   Also, "goes" → CAUGHT and "back" → RECOVERED are 0.24 s apart, so the first tick means nothing. Fix: wanted `"hold": 3.4`
   (gone by 64.6 s; the OUT stamp on "out" at 63.43 still shows for 0.7 s), and
   `"picks":[{"pick":0,"word":"She"},{"pick":1,"word":"back"},{"pick":2,"word":"world","note":"WORLDWIDE"}]`
3. **[P1] press → suspects · 39.1–40.3 s** · The Puck archive (hold 2.6 from 37.29 s) is still up when the ticket lands on it.
   Fix: start the cartoon earlier and end it inside the beat:
   `{"type":"archive", … ,"atWord":"theft","hold":2.3,"w":760}` (36.50 → 38.80 s). Keep the pulse on "front".
4. **[P1] unnoticed → crowds · 22.5–23.0 s** · "CLOSED · 1 WEEK" lands on the fading "STOLEN · NOTICED A DAY LATER" (same spot, frame at 22.8 s).
   Both labels also cover the bottom of the wall. Fix: `unnoticed` label `"hold": 0.9,"at":[2.3376,48.905]`; `crowds` labels
   `"at":[2.3376,48.905]` (CLOSED and 4 IRON PEGS, see #19). Check on a still that they sit above the wall.
5. **[P1] trunk → florence · 50.37–50.8 s** · The trunk (hold 5.57 s) and "28 MONTHS" (49.21 + 1.8 s) carry over into the Europe shot,
   on top of "Paris" and the 1913 date. Fix: trunk `"hold": 5.15`, label `"hold": 0.95`, night `"hold": 5.0` (already set).
6. **[P2] end · 68.4–69.0 s · loop** · The painting leaves before the last frame (hold 3.98 ends at 68.57 s, the video runs to 69.0 s), and the
   crowd walks down into the captions band (y ≈ 1080–1230 at 67.8 s, over "COMES TO SEE HER"). That is why loop SSIM drops to 0.864. Fix: painting
   `"hold": 4.6`; crowd: drop `approach` so it sits where frame 0 has it, `{"type":"units","kind":"crowd",…,"offset":[170,110],"atWord":"whole","hold":3}`;
   end camera `"cut": true` so the wall is already in place on "She" (today the frame starts mid-flight from Florence).
7. **[P2] who · 4.6–13.5 s** · "Paris, 1911" shows no Paris, and the wanted card stays on screen 7 s, then the beat ends on 1.2 s of
   empty plane on "protective glass". Fix:
   ```json
   {"type":"marker","text":"The Louvre · Paris","at":[2.3376,48.8606],"atWord":"Paris,","hold":2.0},
   {"type":"prop","kind":"building","at":[2.3376,48.8606],"size":220,"atWord":"Paris,","hold":2.0},
   {"type":"wanted", …, "headSub":"Ex-Louvre worker","atWord":"Vincenzo","hold":4.2},
   {"type":"prop","kind":"painting","image":"assets/art/monalisa.jpg","wall":true,"at":[2.3376,48.8606],"size":340,"atWord":"He","hold":2.5},
   {"type":"label","text":"HE FITTED HER GLASS CASE","at":[2.3376,48.905],"size":"md","atWord":"protective","hold":1.2}
   ```
   The headSub "Louvre worker · 1911" is also inaccurate: in 1911 he *once* worked there (fact 3).
8. **[P2] suspects · 39.1–44.6 s** · At cps 42 the ticket finishes "BOTH CLEARED" at 40.7 s, while the voice says "Both" at 43.45 s. It then fades on
   "cleared." Fix: `"cps": 13, "hold": 5.3` (APOLLINAIRE finishes typing about 41.1 s, PICASSO about 42.7 s, BOTH CLEARED about 43.7 s). Ticket rows are 26 px, keys
   20 px: add `"w": 720` and, as a component change in `Ticket.tsx`, row text 32 px and key 24 px. Paris is not named here either: add
   `{"type":"marker","text":"Paris","at":[2.3522,48.8566],"atWord":"Police","hold":1.5}`.
9. **[P2] twist · 35.29 s** · The NOT YET stamp lands on "Not" but the callout fades 0.3 s later, so the punchline flashes by. Fix: callout `"hold": 5.0`
   (ends 36.22 s; the press camera travel covers the fade).
10. **[P2] caught · 55.5–60.3 s** · The Uffizi is never named, and the painting floats on a blank plane. "POLICE · SYMBOLIC" sits under ARRESTED.
    Fix: `{"type":"marker","text":"Uffizi · Florence","at":[11.2558,43.7696],"atWord":"Uffizi","hold":1.4}`; police units `"hold": 0.8`.
11. **[P2] trunk · 44.7–50.1 s** · The header still reads "22 AUG 1911" while the voice says "for over two years". "28 MONTHS" sits on the open
    trunk, over her face. Fix: `{"type":"date","date":"1913","atWord":"two"}` and label `"at":[2.37,48.905]`. Room/Paris is unnamed:
    `{"type":"marker","text":"His room · Paris","at":[2.37,48.872],"atWord":"room","hold":1.4}` (the marker must end before "trunk." at 47.60).
12. **[P2] patriot · 60.5–64.4 s** · The header still says "11 DEC 1913" while the card says June 1914. Fix: `{"type":"date","date":"1914","atWord":"He's"}`.
13. **[P2] theft · 15.55 s** · On "lifts" the painting *swaps* to the empty wall. Nothing is lifted, and that is the verb of the episode.
    Component (`src/atlas/Props3D.tsx`): painting `liftWord` makes the frame rise about 0.3 units off the hooks and slide out of frame over 0.6 s, with the
    empty-wall layer under it. Cue: one painting prop with `"liftWord":"lifts"` replaces the two props. The thief is a 20 px speck: `"size": 90`.
14. **[P2] crowds · 25.1–28.1 s** · "Crowds line up" shows 16 specks about 10 px tall that scatter, with no queue. Fix: `"size": 56, "spread": 90,
    "offset":[0,170]`. Component, optional: `units` with `"line": true` lays them out as a queue facing the `at` point.
15. **[P2] whole reel · world** · The Louvre, the room and the Uffizi stand on the same empty ground (CASE 002 #8, again). Data: add the Seine and the Arno
    as `properties.river` LineStrings in `scripts/prep-getaway-003-monalisa.mjs` (Natural Earth 10 m rivers), so Paris and Florence close-ups have
    a recognisable mark. Component (carried over): the `ground` layer for span < 0.5 (street grid ink lines).
16. **[P2] header · all beats** · The red mono date line ("21 AUG", "22 AUG", "DEC") is unreadable on beige (CASE 002 #10, not fixed). Component
    `src/atlas/Header`: give the date line a dark paper backing or a 2 px ink shadow.
17. **[P3] florence · 53–55 s** · Florence sits at the right edge (label ends x ≈ 918, the train runs into the x > 930 zone). Fix: camera
    `"center":[8.2,46.0]`. The Paris marker can also start on "December" only after #5 has cleared the trunk.
18. **[P3] press · 37.8 s** · The archive's right edge reaches x ≈ 950 under y 860 (picture only, the caption ends at about 720). Fixed by `"w": 760` in #3.
    The pulse on FR/IT/GB/DE/ES is hidden behind the card. Either drop it or use `"y": 620` so the countries show above.
19. **[P3] crowds · 27.28 s** · "4 IRON HOOKS": SOURCES fact 8 says "four iron pegs". Use `"text":"4 IRON PEGS"`.
20. **[P3] hook · 0.25–4.26 s** · The validator warns at 4.0 s (target 3.5 s). The number is in word one and the face is on frame 0, so this is acceptable without a re-record. Log it.
    The whisper (red serif on the grey wall, y ≈ 600) is barely legible: try camera `"center":[2.3376,48.965]` so the wall starts below the
    title block, and check it on a still.

## Checks passed
- Safe area: nothing readable above y 250 or below y 1440 on the guide stills. The verdict boxes end at x ≈ 450. Captions are never covered by cards.
- Sync (±0.2 s): date on "August", empty wall on "lifts", thief on "walks", callout on "isn't", ARRESTED + shake on "Caught.",
  trunk opens on "trunk.", train + path on "takes", Florence marker on "Florence", OUT stamp on "out", WORLDWIDE on "world".
- Accuracy: 20,000, 1911, 21/22 AUG, CLOSED 1 WEEK, 28 MONTHS, DEC 1913, 1 yr 15 days / ~7 months / ACCOUNTS VARY, Puck 18 Oct 1911,
  ROUTE · APPROX., the SYMBOLIC tags and RECONSTRUCTION on the ticket all match `SOURCES.md` (except #1, #7 headSub, #19). No cause is claimed for her fame.
- Art direction: one camera idea per beat, cuts on theft / twist / trunk / florence, the Europe pull-back as the mid-reel re-hook, and accent
  only on keywords. Credits are on screen for the painting photo, Puck and the police photo.

After #1–#12 the expected score is 7.5/10, and 8 with #13–#15. Re-render, then re-check 22.8, 39.3, 43.6, 50.5, 59.9, 64.7 and 68.9 s, and loop SSIM.

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

## Final render — what was applied (19 Nov 2026)
Render 1 → reel review (6/10) + virality review (88/100) → fixes → **final render** (`out/getaway-003-monalisa.mp4`, 69.0 s,
−14.6 LUFS, loop SSIM ≈ 0.86). Both reviewers stopped at the account's usage limit after writing their reports, so the final
render has **not been re-scored**.
- Kit: the painting is really **lifted** on "lifts" (`liftWord`: it rises off its four pegs and slides out; the bare wall shows);
  image textures load reliably in software WebGL (decoded to raw pixels, the frame waits until a textured frame is drawn);
  the GETAWAY date line has an ink shadow (readable on the beige ground; REDRAWN/RECEIPTS unchanged); tickets take `rowSize`.
- Map: the Seine (Natural Earth 10 m) gives every Paris close-up a landmark (the Arno is not in that dataset).
- Reel review fixes 1–14, 17–20 applied (dates: month only for the arrest, 1913 on "two years", 1914 for the sentence; no bleed
  between beats; "Ex-Louvre worker"; "4 IRON PEGS"; Louvre / Paris / His room / Uffizi named; slow-typed police ticket synced
  to the voice, bigger rows; Florence centred; frame 0 re-framed below the title). Not done: a `ground` street layer (#15, kit idea).
- Virality top 5 applied (painting on the wall for "protective glass" with a typed tag, bleeds removed, a symbolic "not the most
  visited" queue in the twist, the Geri / Poggi / police trap typed in Florence, frame 0 cleaned). Not done: a ~52 s Reels cut (new voice take).

## Owner checklist before posting
- [ ] Listen once: "Peruggia", "Apollinaire", "Uffizi".
- [ ] Tick the ⚠ lines of SOURCES.md (theft date 21 Aug, glass case, empty-wall crowds, fame before 1911, trunk 28 months, sentence).
