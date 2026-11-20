# Review — poland-1945 (REDRAWN EP 8, DA 2) · pass 1

**Verdict: not postable yet, 6/10.** The story, sync, sources and safe area are clean. But the one thing the
title promises, *the country moved west*, is never visible: the land Poland gained is drawn in the same red as
the land it kept from frame 0 to the end. Once that is fixed (fixes below, checked on stills), this is an 8.5.

Checked: 10 review sheets, cues.md, `validate` (0 ✗, 2 !), guides stills at 0 / 5.5 / 18.9 / 28 / 37.5,
the loop seam (frames 1240–1245), and a scratch copy of the episode with the P0/P1 fixes rendered as stills
(deleted afterwards). The scratch copy confirmed every change marked *(verified)*.

## The 3 biggest problems
1. **The transformation doesn't show.** In the hook, CORE and WEST are both `#E0565B`, and Potsdam re-declares
   WEST `#E0565B` 0.2 s after revealing it. "gained" and "+112,000 km²" point at land that looks just like the core.
   The only hint is a thin internal stroke, so a viewer can't see the country move west.
2. **Frame 0 crops the subject.** The opening crane (pitch 21, dist ×0.58, yaw +17) on `fit FOCUS pad 0.06` pushes
   the western part, the part the title is about, off the left edge. The east runs off the right edge.
3. **The Oder–Neisse line is never drawn, and its label collides with the "+112,000 km²" plate** (18.1–19.2 s).
   The 1990 treaty beat is framed so tight (span 8) that its callout covers that same border.

## Fix list
**P0 — blocks posting**
1. [P0] hook · 0–5.5 s · gained land the same colour as the core · give WEST its own pale tint (same family, so it
   still reads as Poland) and set it at frame 0 *(verified)*:
   `"palette":{"ids":{"CORE":"#E0565B","EAST":"#E0565B","WEST":"#F4A09C"}}`, and in `hook.actions` add
   `{"type":"declare","id":"WEST","noLabel":true,"color":"#F4A09C","atTime":0}`.
2. [P0] potsdam · 16.75 s · the declare turns WEST back to core red · `{"type":"declare","id":"WEST","atWord":"Germany's","noLabel":true,"color":"#F4A09C"}`.
   With 1+2, every frame from Potsdam to the loop shows three tones: kept / gained / lost.
3. [P0] hook + loop · frame 0 / last frame · subject cropped · replace both cameras with
   `{"center":[20.8,51.7],"span":16,"pitch":56}`. *(verified: the whole three-tone Poland sits under the title
   at frame 0, and the loop seam is still invisible because the crane returns to the same pose.)*

**P1**
4. [P1] potsdam · 18.12 s · "Oder–Neisse line" label overlaps the "+112,000 km²" plate, and the river line is not
   drawn *(verified)*. Draw the border (it is a border, not a route) and move both labels:
   add `{"type":"path","coords":[[14.28,53.9],[14.4,53.3],[14.65,52.6],[14.55,52.35],[14.72,52.0],[14.65,51.7],[14.99,51.15],[14.83,50.87]],"atWord":"Oder","dur":1.0,"hold":6.5,"color":"#FFFFFF","width":4}`;
   set "+112,000 km²" `"at":[16.6,52.9]` and "Oder–Neisse line" `"at":[12.4,51.0]`.
5. [P1] treaty · 35.8–38.5 s · span 8 crops Poland, and the callout (y 980) sits on the border the treaty is about.
   Use camera `{"center":[17.0,52.0],"span":12,"pitch":50,"yaw":10}` and callout `"y":1010` *(verified: the box
   sits under the map at y 1010–1150, clear of the captions)*. Re-draw the border on the word:
   `{"type":"path","coords":<same as #4>,"atWord":"border","dur":0.8,"hold":2.4,"color":"#FFFFFF","width":5}`.
6. [P1] people · 26.97 s · "Germans expelled" crowd stops inside the new Polish west (15.4°E), so they don't
   visibly leave · `"at":[13.0,52.3],"approach":[300,0]` *(verified: they slide west across the Oder into Germany)*.
   The "Poles resettled" crowd (from the south-east toward Wrocław) is right.
7. [P1] library · 31.2–35.5 s · the header still reads "2 AUG 1945" while the whisper says Ossolineum 1946–47
   (the date contradicts the chapter) · add `"date":"1946"` to beat `library`.

**P2**
8. [P2] library · chapter "the Ossolineum, 1946–47" sets off validate `!` (figure 47) · `"text":"the Ossolineum, 1946–1947"`.
9. [P2] people · whisper "the great resettlement" sounds like a euphemism for expulsions (sensitive topic) ·
   `"text":"expulsion and resettlement"`. Also add `"date":"1945"` to `people`. The header otherwise says
   "2 AUG", but the expulsions began before Potsdam (SOURCES "Debated").
10. [P2] treaty · 35.8–36.6 s · the header reads "1990" over the whisper "the Ossolineum, 1946–47" · chapter `"atWord":"And"`.
11. [P2] yalta→cities_e · 12.26 s · "−187,000 km² · ~48%" plate lingers next to the new Lwów marker · `"hold":1.1`.
12. [P2] library→treaty · 35.81 s · "Ossolineum → Wrocław" lingers into the 1990 beat · `"hold":0.95`.
13. [P2] people · 27–31 s · the crowd tags ("GERMANS EXPELLED", mono) measure ≈ 22–24 px at 1080 w, under the
    28 px floor. Component change in `src/atlas/Units3D.tsx`: caption font ≥ 28 px (or `captionSize` prop).
14. [P2] loop · 39.0 s · "It never left home" pulses CORE + WEST; "home" is the core that stayed. Use
    `{"type":"pulse","ids":["CORE"],"atWord":"home."}`. Optional: `{"type":"label","text":"Warsaw","at":[21.01,52.23],"atWord":"home.","hold":0.9}`
    (it ends before the crane returns at 40.9 s).

**P3**
15. [P3] before · 6.1–6.5 s · "Germany" label lands on the pale WEST while it is still fading out · `"at":[11.6,52.4]`.
16. [P3] hook · "gained" hold 1.6 brushes the cut into 1938 · `"hold":1.3`.

## Checks that pass
- **Sync**: every pulse, label and marker lands on its word (cues.md). Yalta's grey fade is on "east", the shake on
  "Soviet", the WEST reveal on "gets", the markers on each old name, the path on "library,", and FINAL on "1990.".
  The `{1945|…}` and `{1990|…}` tokens use no `atWord` inside them.
- **Accuracy vs SOURCES.md**: 187,000 km² / ~48 %, +112,000 km², 11 Feb 1945 (Yalta ends), 2 Aug 1945 (Potsdam ends),
  14 Nov 1990, Ossolineum 1946–47 and the six city names are all sourced. Lviv/Vilnius are labelled as today's names
  (logged). Danzig was a Free City in 1938; it appears only as a renamed city (logged). Areas are published
  figures, not the map's own (logged). The wording on expulsions is neutral apart from #9.
- **Safe area (guides)**: no readable text above y 250, below y 1440, or right of x 930 under y 860. Only map
  slabs enter the red zones. Captions stay clear. The 1990 callout stays above the caption band.
- **Loop**: the last 0.6 s cranes back to the frame-0 pose and the title returns. "And yet…" → "In 1945, Poland
  loses almost half its land." reads as one sentence. Frames 1240–1245 match frame 0.
- **Hook**: 5.3 s (validate `!`), justified. The stake ("almost half its land") is spoken by 2.4 s and the first
  sentence ends at about 2.8 s.
- **Pacing**: something new arrives at least every 2 s. The re-hooks are the cuts at Potsdam (15.6 s) and
  people (25.2 s). Each beat has one camera idea.

---

# Virality — poland-1945 (REDRAWN EP 8, DA 2) · pass 1

Final render `out/poland-1945.mp4` (41.6 s), checked after the P0–P3 clarity fixes above. Evidence: `pipeline/virality_metrics.py`
(hook frames 0–3 s, loop image), the 10 beat sheets and `cues.md` regenerated from the final render, `episode.json`, `SOURCES.md`.
Metrics: 105 words, 2.75 w/s, first word 0.25 s, hook 5.29 s (stake "half" spoken at 2.36 s), 36 cues = **8.7 cues/10 s**, longest
gaps 2.71 s (32.1 s, library arc drawing, so motion continues), 2.11 s (hook), 2.03 s (29.2 s). There are 0 of 21 two-second windows without a cue,
**loop SSIM 0.899**, and loudness is −14.3 LUFS. The voice is recorded, so every fix below is cue sheet, title or packaging only.
This EP replaces a rejected reel, so the bar is "would a stranger send this?", not "is it clean?".
*This is a pattern-based estimate, not a prediction. The account's size and history are the biggest factor, and we can't control it.*

## Scorecard
| Block | Pts | Why |
|---|---|---|
| A. Hook 0–3 s | **20/25** | Frame 0 shows depth: a crane over a three-tone slab under a 5-word title. Paused and muted it says "something changed here", but the slab is thin and oblique. No name sits on it, and nothing says what pale vs grey mean until "lost" at 2.4 s (5/8). Sentence 1 carries a real number ("almost half its land"), though it starts with "In 1945" and the stake lands at 2.4 s (6/7). The whisper "Poland, 1945" is on screen by ~0.8 s and the voice says "Poland" at 1.31 s. It is a small serif line and no neighbour is named (4/5). The title is 5 words and its promise is the story (3/3). No throat-clearing (2/2). |
| B. Retention | **20/25** | 8.7 cues/10 s with a camera move on every beat (7/8). The spine is a clear loss → "in return" → people → "even" the library → "only in 1990". But 12.3–24.9 s is two lists of renamed cities (5 renames in 12 s). For a US/UK viewer, Stettin/Szczecin and Wilno/Vilnius are low-recognition, so the curve sags there (4/6). Two real cuts: Potsdam at 15.6 s (38 %) and "Then the people move" at 25.2 s (61 %). The second is a good verbal re-hook (3/4). The hook's promise ("new land, somewhere else") pays at 16–19 s, and the strongest surprise (1990) sits at 36 s. "It never left home" is a cryptic last statement rather than a payoff (3/4). Pace is 2.75 w/s, with large word-by-word captions (3/3). |
| C. Rewatch & loop | **9/10** | "…And yet…" → "In 1945, Poland loses almost half its land." is a paradox loop, but it only half-works on first view because "home" is never shown as the core (4/5). SSIM 0.899 with the same crane pose and tones (3/3). The three-tone map is a frame people pause on (2/2). |
| D. Shareability & saves | **12/15** | Send facts: *Germany only accepted this border for good in 1990*, and the renames (Breslau → Wrocław, Danzig → Gdańsk). There is a strong identity hook for the Polish, German, Ukrainian and Lithuanian diasporas in the UK and US. But no single on-screen comparison sums it up: lost 187k vs gained 112k is never put side by side (4/6). The three-tone map has reference value, and the series is visible (3/4). The pinned question ("does your family come from a city that changed country?") is honest and personal (3/3). Human stake: millions expelled, and a library moved (2/2). |
| E. Packaging | **9/10** | There is no `thumb` yet. The best in-reel cover (3.0 s) has three tones, "lost" and "POLAND LOSES ALMOST HALF ITS LAND.", but the slab is small (3/4). Caption written below (3/3). REDRAWN · EP 8 bar, title block and timeline give the series look (3/3). |
| F. Niche codes & trust | **11/15** | One visible transformation: kept/gained/lost tones from frame 0, then 1938 red → Yalta grey → Potsdam pale reveal (4/4). Scale is km² only, with no miles and no US/UK reference ("half" carries it) (1/3). There are no faces; the stake is carried by the crowd pieces and the word "millions" (2/3). Sourced and hedged: "~48%", "millions", dated header, treaty date, approximate map in the pinned comment (3/3). Minor anti-patterns: the BORDER TREATY callout (a floating widget) lingers into the loop line (to 38.98 s vs loop start 38.82 s), and the "Oder–Neisse line" label touches the white line it names (1/2). |
| **TOTAL** | **81/100 → 8.1/10** | **Tier: can break out** |

## Top 5 changes, ranked by expected gain (no `say` change; no `atWord` inside a `{a|b}` token)
1. **+2 · Name the subject from the start (A frame 0, A place).** Add to `hook.actions`. It ends at 2.25 s, before "lost" at 2.36 s:
   ```json
   {"type":"label","text":"Poland","at":[19.5,52.3],"atTime":0,"hold":2.0,"plate":true}
   ```
   A scroller then reads "THE COUNTRY THAT MOVED WEST" + a slab named POLAND inside the first second, sound off. Check on a still that
   the plate sits on the red core and clear of the title.
2. **+1 (+1 conditional) · A US/UK scale (F scale anchor).** Put miles first on the two area plates. This is a unit conversion of the published figures
   (187,000 km² × 0.3861 = 72,200 sq mi; 112,000 km² × 0.3861 = 43,200 sq mi):
   ```json
   yalta:   {"type":"label","text":"−72,000 sq mi · ~48%","at":[26.0,51.3],"atWord":"Soviet","hold":1.1,"plate":true}
   potsdam: {"type":"label","text":"+43,000 sq mi","at":[16.6,52.9],"atWord":"east,","hold":2.0,"plate":true}
   ```
   **Before rendering, add a line to SOURCES.md** ("72,000 / 43,000 sq mi = conversions of 187,000 / 112,000 km², rounded"). Otherwise the pre-flight
   flags the new figures. Keep km² in the pinned comment. A familiar anchor would add +1: the lost land (~187,000 km²) is about the size
   of Washington State (~71,300 sq mi ≈ 184,700 km² total area; read the exact figure off the US Census table). **That comparison is NOT in SOURCES.md.** Add it with the Census source first, or skip it.
3. **+1 · Clean the end and the Potsdam labels (F anti-patterns).** The treaty callout must end before the loop line, so the last 2 s are map only
   (this also helps the loop seam). Change `"hold": 2.4` → `"hold": 2.2` on the treaty `callout` (36.58 + 2.2 = 38.78 s < 38.82 s). Move
   `"Oder–Neisse line"` one step west, `"at": [11.4, 51.4]`, so the word "line" stops touching the drawn border at 18.1–20.1 s. Check on a still
   that it stays inside x ≥ 40 and clear of the 2 AUG header.
4. **+1 · One sendable comparison on screen (D send).** Put the net change where the voice says the core "never left home". Add to `loop.actions`
   (39.00 s → 39.95 s; the Warsaw label at 39.45 s sits further north):
   ```json
   {"type":"label","text":"net: ~1/5 smaller · our calculation","at":[21.0,50.6],"atWord":"never","hold":0.95,"plate":true}
   ```
   Arithmetic: 389,720 − 187,000 + 112,000 ≈ 314,700 km², which is 19 % smaller than 1938. Add it to SOURCES.md as "our calculation" before using it. If the
   still looks busy next to "Warsaw", drop this one. It is the weakest of the five, and the loop must stay clean.
5. **+1 · Cover and thumb (E cover).** Add this `thumb` block (it uses only sourced facts and the on-screen hedge "~48%"):
   ```json
   "thumb": {
     "kicker": "Poland, 1945",
     "main": "The country that moved west",
     "mainSize": 120,
     "mainSizeV": 120,
     "badge": "~48%",
     "badgeSub": "of its land, lost in the east",
     "fit": ["CORE", "EAST", "WEST"],
     "mapBoxV": [60, 850, 1020, 1420]
   }
   ```
   At 120 px the main text breaks as "THE COUNTRY / THAT MOVED / WEST": 11 characters per line max, ≈ 950 px. The three-tone slab then reads as
   pale west, red core, grey east, the whole story in one shape. Default `center` (centroid) and landscape `mapBox` are fine.

Optional, for the rename plateau (B escalation, about +1): give each rename a beat on the slab it belongs to. In `cities_w`, add
`{"type":"pulse","ids":["WEST"],"atWord":"Stettin,"}`. In `cities_e`, add `{"type":"pulse","ids":["EAST"],"atWord":"Wilno"}`.
Projected after 1–3 and 5: about 85/100. With 4, the optional pulses and a sourced Washington anchor: about 88. These are estimates, not promises.

**Trust note (sensitive topic, no change to the reel needed):** expect comments that Poles from the east were also forced out, not
simply "resettled". SOURCES cites *Polish population transfers (1944–1946)*, which describes them as forced. If the owner wants it, add one neutral
line to the pinned comment ("Poles from the east were also forced to leave; the official term was 'repatriation'"). Add it only after logging it in
SOURCES.md with that reference. Do not add any number of people moved: sources vary, and the reel rightly says only "millions".

## 3 alternative hooks (for a remaster only: each needs a new voice line; all true per SOURCES.md)
| Archetype | Verbal line | Frame-0 visual | On-screen text |
|---|---|---|---|
| Big number / comparison | "In 1945, Poland loses 187,000 square kilometres in the east and gets 112,000 in the west." | Three-tone slab, "−187,000" pinned on grey, "+112,000" on pale | LOST 187K · GAINED 112K |
| Delayed twist | "Germany only accepted this border for good in 1990, 45 years after the war." | Slab with the Oder–Neisse line already glowing white, FINAL stamp waiting | ACCEPTED IN 1990 |
| Question | "Why is the German city of Breslau now Polish Wrocław?" | Low crane on the pale WEST, a marker "Breslau → Wrocław" already on | WHY IS BRESLAU POLISH? |
Title-only A/B with no voice change: `"title": "Poland moved west"` names the place on frame 0, but it loses the curiosity gap. Keep
"The country that moved west" and rely on fix 1 for the name.

## Cover, caption, hashtags, pinned comment
- **Cover:** the vertical `Thumb` (above), or **3.0 s** in-reel (three tones, "lost" plate, caption "POLAND LOSES ALMOST HALF ITS LAND.").
  Cover text, if the platform adds one: **POLAND LOST ALMOST HALF**.
- **Caption (IG / TikTok / YT Shorts):**
  > In 1945 Poland loses almost half its land, then gets new land in the west. Germany only accepts the border for good in 1990.
  > How Poland's borders moved west after WWII: Yalta and Potsdam, the Oder–Neisse line, Lwów → Lviv, Breslau → Wrocław, Danzig → Gdańsk.
  > Expulsion and resettlement of millions, the Ossolineum library's move, and the 1990 German–Polish Border Treaty.
- **Hashtags (4):** #history #poland #maps #ww2
- **Pinned comment** (SOURCES.md text, no emoji):
  "Sources: Yalta and Potsdam (1945); USHMM; Britannica; German–Polish Border Treaty (1990); Ossolineum. Areas lost/gained (≈187,000 / 112,000 km²)
  are published figures; the map is approximate (historical-basemaps 1938 + Natural Earth). Numbers of people moved vary by source, so we only
  say "millions". Does your family come from a city that changed country in 1945?"

## Platform notes
- **TikTok:** 41.6 s is in the completion sweet spot. Post as is, with no end card, because the loop does the work. Search runs on caption + on-screen
  text, so "Breslau Wrocław", "Oder–Neisse" and "Poland borders WW2" are in caption line 2. A 61–70 s Creator Rewards cut would be a
  different edit (e.g. the 1970 Treaty of Warsaw reservation, already in SOURCES), not this one slowed down.
- **Instagram Reels:** sends drive non-follower reach. Caption line 1 carries the two sendable facts (half lost, 1990). The vertical Thumb
  keeps everything inside the 3:4 grid crop. Upload the clean master with no watermark. Three hashtags are enough (#history #poland #maps).
- **YouTube Shorts:** "viewed vs swiped" is decided in second 1, so fix 1 (POLAND on the slab before 1 s) matters most here.
  Shorts title: "Poland lost almost half its land in 1945 — then moved west". The SSIM 0.90 loop works on Shorts autoplay.
- **All:** expect heated comments (expulsions, Lviv/Vilnius, Kresy). Answer with sources from the pinned comment and keep the neutral
  wording. Don't pin or reply with any casualty or migration number that is not in SOURCES.md.

VIRALITY SCORE: 81/100 (8.1/10) — can break out
