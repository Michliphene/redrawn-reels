# Review: korea-1945, pass 1

Video `out/korea-1945.mp4`: 53.44 s. I read all 13 beat sheets, `cues.md`, `episode.json`, `SOURCES.md` and the word timings.
Extra frames are in `/tmp/claude-0/review-tmp/k1_*.jpg`. The strips are `k1_sheetA.jpg` (0, 3.9, 7.3, 19.8, 27.0, 31.5 s), `k1_sheetB.jpg` (33.0, 34.2, 35.25, 42.5, 45.9, 53.35 s) and `k1_sheetC.jpg` (1.6, 10.7, 11.3, 26.9, 41.5, 52.4 s). There are also two crops: `k1_dmzcrop.jpg` and `k1_ruskcrop.jpg`.
Timing rules (checked in code): an overlay is visible until `t + hold + 0.4`. A path is visible until `t + hold + 0.5`, and it is drawn from 0 starting at `t`, so at `atTime: 0` frame 0 shows nothing.

## Verdict: 6.5/10. Postable: **NO**

The story is clear and short, the facts are clean (the "30 minutes" claim and the exact night were left out, as SOURCES says), the colours are strong and nothing is cut off at the edges. Two seam problems and one payoff problem block posting:
1. **The hook has no line.** Frame 0 shows only the thin base seam and a map sticker; the gold 38°N path starts at length 0 (`k1_0.jpg`). Then the path fades out on "One night." (`k1_3.9.jpg`), the very moment the hook lands.
2. **The loop seam does not match.** The end frame shows the 1953 border (the bent line) under a gold 38°N stroke (`k1_53.35.jpg`). The start frame shows a straight 38°N split and no gold line, so the replay visibly jumps.
3. **"A new line" is never drawn.** At "new" both halves just fade pale (`k1_41.5.jpg`). The 38°N reference disappears at 45.1 s, so on "Sokcho, once in the North" the viewer has nothing to compare it with.

Accuracy: every on-screen date and figure matches SOURCES.md (1910–1945, Aug 1945, 1948, 25 Jun 1950, 27 Jul 1953, ≈2.5 mi / ≈155 mi). Readability is fine: the callout sub-lines are 30 px. Only the portrait credit (≈16 px) is small, which is accepted for credits.

## Issues

1. **[P1] hook · 0.00–4.1 s · frame 0 is incomplete and the line is gone on "One night."** Show the line fully drawn from frame 0 and keep it to the end of the beat. The loop end draws the same line, so the seam then matches. Replace the hook path with:
   ```json
   {"type":"path","coords":[[124.55,38.0],[128.75,38.0]],"color":"#FFC94D","width":9,"dur":0.1,"hold":4.0,
    "label":"38°N","labelAt":[129.3,38.25],"atTime":-0.1}
   ```
2. **[P1] loop · 52.27 s · the end shows the 1953 border, not the 1945 split.** Restore the 38°N halves on "All" before recolouring, so that the end frame equals frame 0:
   ```json
   {"type":"conceal","ids":["DPRK","ROK"],"atWord":"All"},
   {"type":"reveal","ids":["KOREA_N38","KOREA_S38"],"atWord":"All"},
   {"type":"recolor","ids":["KOREA_N38","KOREA_S38"],"atWord":"All"}
   ```
   Keep the existing gold path. Then check stills at frame 0 and at the last frame: they must be identical apart from the title.
3. **[P2] armistice → swap · 41.08–48.9 s · draw the new line and keep 38°N visible as a reference.** Use gold for the 38th parallel (as in the rest of the video) and white for the 1953 line. The coordinates are the DPRK/ROK shared border from `korea1945.geojson`. Replace the white 38°N path in `armistice` with these two paths:
   ```json
   {"type":"path","coords":[[126.633,37.781],[126.665,37.8],[126.665,37.917],[126.755,37.979],[126.878,38.106],[127.011,38.241],
     [127.169,38.304],[127.533,38.306],[127.904,38.3],[128.041,38.309],[128.17,38.359],[128.278,38.524],[128.375,38.623]],
    "color":"#FFFFFF","width":7,"dur":1.0,"hold":9.6,"label":"1953 line","labelAt":[128.9,38.85],"atWord":"new"},
   {"type":"path","coords":[[124.55,38.0],[128.75,38.0]],"color":"#FFC94D","width":4,"dur":0.6,"hold":6.9,
    "label":"38th parallel","labelAt":[129.0,38.2],"atWord":"Not"}
   ```
   The 38°N path then ends at 48.9 s, after "South." The 1953 line ends at about 50.7 s, before the loop.
4. **[P2] states · 27.97 s · the date badge jumps to 1948 three seconds before "1948" is spoken (30.93 s),** during "Meant to be temporary". Remove `"date":"1948"` from the beat and add `{"type":"date","date":"1948","atWord":"1948,"}`.
5. **[P2] states · 31.9–34.8 s · the two states are never named** (only flags and capitals are shown). Replace the two flag stickers with labelled flags:
   ```json
   {"type":"label","text":"NORTH KOREA","flag":"kp","at":[127.1,40.3],"size":"md","atWord":"rival","hold":1.6},
   {"type":"label","text":"SOUTH KOREA","flag":"kr","at":[128.0,36.6],"size":"md","atWord":"rival","hold":1.6}
   ```
   With hold 1.6 they clear by 34.2 s, so the "Each claims…" callout (33.90 s, y 1100) does not collide with them.
6. **[P2] states · 29.0–31.6 s · on "the line hardens" the gold line fades out** (line-beat path, hold 9 → fades 30.6–31.6). The image contradicts the words. Add a path to `states`:
   `{"type":"path","coords":[[124.55,38.0],[128.75,38.0]],"color":"#FFFFFF","width":8,"dur":0.4,"hold":2.2,"atWord":"hardens."}`
   Also set the line-beat path to `"hold":7.6`, so the two strokes do not stack.
7. **[P2] hook · 1.40–2.25 s · the pen sticker lands on top of the map sticker (same x/y),** and neither matches its word. "Americans" has no visual either (`k1_1.6.jpg`). Use:
   ```json
   {"type":"sticker","flag":"us-48","x":830,"y":1010,"size":130,"atTime":0,"hold":1.1},
   {"type":"sticker","emoji":"world_map","x":830,"y":1010,"size":170,"atWord":"National","hold":1.4},
   {"type":"sticker","emoji":"fountain_pen","x":830,"y":1010,"size":150,"atWord":"night.","hold":0.5,"tilt":-20}
   ```
   Pen hold 0.5 means it is gone by 4.7 s, while the japan camera move is under way. If that is too long, drop the pen sticker.
8. **[P2] soviets · 10.5–11.1 s · the "Soviet troops" caption and tanks slide under the "Soviets" chip** during the camera move (`k1_10.7.jpg`). The USSR is not named either. In the units action set `"atWord":"troops","approach":[60,-140]`. Replace the floating flag sticker with a labelled one on Soviet territory:
   `{"type":"label","text":"USSR","flag":"su","at":[131.8,44.0],"size":"md","atWord":"Soviet","hold":2.0}`
   Check in a still that [131.8, 44.0] is on screen at span 16. If it is not, use [130.8, 43.2].
9. **[P2] swap · 45.8–46.6 s and 48.6 s · the pointers fade out too early.** Kaesong ends at 45.8 s, right on "North.", and Sokcho is already dim on "South." Set Kaesong `"hold":2.4` and Sokcho `"hold":2.3`.
10. **[P3] line · 18.42–21.68 s · 3.3 s with nothing new except a 1.2 s mountain** (`k1_19.8.jpg`), and "no river" has no visual. Add `{"type":"callout","text":"No river · no mountains","size":52,"y":1100,"atWord":"river,","hold":1.6}`. It ends at 21.0 s, before the path fires on "straight".
11. **[P3] states → war · 35.15–35.7 s · "Each claims all of Korea" lingers into the war beat** (`k1_35.25.jpg`). Set its `"hold":0.8`.
12. **[P3] war · 36.35 s · the units caption "June 1950" repeats the date badge (JUNE 25 1950).** Use `"caption":"North Korean army"`.
13. **[P3] order · 15.9 s · Bonesteel is spoken but never shown or named.** No public-domain photo exists, so add a text chip: `{"type":"callout","text":"+ Charles Bonesteel","size":44,"y":700,"atWord":"Charles","hold":1.5}`. Do not show ranks; they are not in SOURCES.
14. **[P3] treaty · 49.25 s · the "Still at war" chip sits under "JULY 27 1953".** That reads as a 1953 claim and is stronger than SOURCES ("technically still at war"). Use `{"type":"chapter","emoji":"page_with_curl","text":"Technically at war"}` and set `"hideDate": true` on `treaty`; the callout already says "since 1953".
15. **[P3] japan · 4.24 s · the "1945" chip repeats the date badge "AUGUST 1945".** Use `"text":"Japan's empire"`.
16. **[P3] states · 32.2 s · the South Korean flag is the modern design; the 1948 flag differed slightly** (SOURCES notes this). Per CLAUDE.md, either add a tiny note or accept it and mention it in the pinned comment.
17. **[P3] hook/loop · the timeline jumps from 1953 (end) to 1900 (start) at the seam.** This needs a new beat flag `hideTimeline` (Episode.tsx already reads `hideLocator`/`hideChapter`/`hideDate` the same way). Set it on `hook` and `loop`.
18. **[P3] richness:** the Rusk card could show "1945: US Army officer" instead of "later Secretary of State" (the 1961 photo note stays). An archive card of the 1945 National Geographic map would make a strong hook if a PD scan exists (check LOC: `python3 scripts/loc_search.py "National Geographic map Korea 1945"`).

## Re-check after fixes
Stills at frame 0, 3.9, 10.7, 31.0, 41.5, 46.9, 48.5 and the last frame. Confirm that frame 0 and the last frame match, and that the 1953 line, the 38°N line and both pointers are visible together at 46.9 s.
