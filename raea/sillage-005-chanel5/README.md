# SILLAGE N°5 · Why is it called N°5? · DA « Le cabinet des matières » v2

Branch `sillage/cabinet-des-matieres`. Voice, timings and facts: `public/episodes/scent-005-chanel5/` (Brian,
eleven_multilingual_v2, 62.3 s, SOURCES.md). First brand episode (rule: `docs/SCENT_SERIES.md` §3.2 as amended).
Format D (myth-bust) with a vote: "A · the lucky number / B · the smell".

## Set v2 (new in this episode; copy this file for the next ones)
- **Three 3D stations** in the same plum cabinet instead of one flacon:
  `Vials` (Beaux's ten samples 1–5 / 20–24 on a lacquered bench, numbered tags in 3D; vial 5 glows and rises),
  `Molecule` (decanal, an aldehyde, ball-and-stick, turning; the oxygen lights on "aldehydes"),
  `Bottle` (our model of the N°5 silhouette: chamfered block, faceted octagonal stopper, ink thread, "N°5" label in
  Inter — no brand marks).
- **Light in the air**: `VolumetricFog` + a narrow `FogVolume` column on each station's volumetric spot (a shaft, not
  a pink veil: a room-sized volume washed the frame out).
- **A lens**: `DepthOfField` inside `Camera3d`, focused on the subject (f/1.8–2.8 on the 3D shots, f/9 on the cards).
- **Depth**: `Shelves` of small tinted bottles behind each station, out of focus (bokeh); a reflective floor.
- Paintings (Nano Banana) and paper cards (gpt-image) between the stations, as before. Opens and closes on the vials.

## Shot list (anchors are words of timings.json)
hook (vials, "1920 · ten vials · Coco Chanel picks one", vial 5 lights on "five", "N°5") → Beaux (track along the
tags, "vials 1–5 · 20–24") → "Why the fifth?" (push on vial 5, "story A · her lucky number") → soap card ("story B")
→ vote (A / B chips, "pick one ↓") → molecule ("Aldehydes · others: a trace… Beaux: a lot") → Grasse jasmine ("1987 ·
one family's fields") → bottle (crane down, "clear glass · sharp corners · a cut stopper") → Place Vendôme ("Chanel's
account") → 1950s nightstand ("1952 · a few drops") → tape recorder card ("A lost recording · 1960 interview · in a
2013 ad") → bottle with gold ring ("1959 · MoMA · New York") → loop on the vials.

## Run
```bash
raea/sillage-005-chanel5/setup.sh     # voice, music, sfx, fonts, crops the plates (prep-plates.sh)
raea/sillage-005-chanel5/render.sh    # → out/sillage.mp4 + raea check
raea render compositions/cover.tsx --frame 0 -o out/cover.png   # cover = the 3D bottle + title (from sillage.tsx)
```
