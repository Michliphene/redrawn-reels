# SILLAGE N°1 · What's inside your perfume · raea edition

The first SILLAGE reel, built in **raea** (React/TypeScript compositions drawn by Bevy, <https://github.com/shinyobjectz/raea>).
Only the **text** comes from the studio episode `scent-001-bottle`: the voice, its word timings and the sourced figures
(`public/episodes/scent-001-bottle/SOURCES.md`). No map: one perfume counter in 3D, one camera going round it.

| Beat | What the set does |
|---|---|
| hook | jasmine flowers rain onto their pedestal and pile up next to an empty glass flacon; "≈1,000 kg of flowers → 1 kg of jasmine oil" |
| grasse | JASMINE · GRASSE, FRANCE pinned over the heap; UNESCO 2018 block; a cream drop arcs into the bottle, the first layer rises |
| rose · vetiver · vanilla · patchouli | the camera goes round the bottle to each pedestal; the ingredient pops up (rose heads, vetiver roots, vanilla pods, patchouli), its name + country; a drop of its colour fills the next layer |
| pullback | wide view of the ring, all five names and countries |
| twist | a ball-and-stick molecule comes down over the cap and glows: "Made in a lab" |
| loop | back to the frame-0 pose on "Remember the jasmine:" |

## Run it

```bash
raea/sillage-bottle/setup.sh     # media/ from public/ (voice, music, sfx, fonts as TTF), timings.json
raea/sillage-bottle/render.sh    # → raea/sillage-bottle/out/sillage.mp4 (+ .check.json from raea check)
```

One frame: `raea render compositions/sillage.tsx --frame 120 -o out/f120.png` (from this folder).

## Notes
- Glass is Bevy's real transmission (`specular_transmission`, `ior`, `thickness`): the juice layers are seen through it.
- Countries are type, never a map. A figure is on screen once (big number or caption).
- The juice colours are the series' note colours (`docs/SCENT_SERIES.md` §2): reuse them in every episode.
- The bottle is invented (no brand), drawn from primitives: no trademark, no AI image.
