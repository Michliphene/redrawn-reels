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
