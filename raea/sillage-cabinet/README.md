# SILLAGE N°1 · What's really in your perfume · DA « Le cabinet des matières »

Branch `sillage/cabinet-des-matieres`. Same voice, timings and facts as `raea/sillage-notjustflowers`
(`public/episodes/scent-001-notjustflowers/`: Brian, eleven_multilingual_v2, 60.75 s, SOURCES.md);
a new art direction built from `C:\Users\User\Documents\Sillage-DA\` (DA-SILLAGE.md, tokens.json, two mood boards).

## What changed against the previous cut
| | before (notjustflowers) | now (cabinet) |
|---|---|---|
| world | one ring of nine framed plates, dark everywhere | three sets: **cabinet** (plum), **paper table** (ivory, from above), **lab** (lifted plum, lilac), plus full-screen "cabinet des songes" paintings |
| shots | the same framed plate eight times | 17 shots, one subject / one message / one move each; at most two framed plates in a row |
| bottle | glass with coloured stripes from frame 0 | the **signature flacon** (rose glass, gold collar, plum cap, ivory label with a four-point star), stripes only in the payoff where the assembly is explained |
| signature | — | the **gold ring** lights up round the subject when the explanation lands (fixative, 1979, payoff) |
| type | Bricolage condensed to 75 % | Bricolage at natural width; hook 98 px, titles 78 px, stats 196 px, Instrument Serif for the sensory line, JetBrains Mono for labels |
| captions | words flashing, no band | stable segments (≤ 2 lines, 60 px), ink band (ivory band on the paper set), the active word turns rose without changing size |
| camera | 34–48° lens, permanent orbit | 26° lens (no wide-angle distortion), one small move per shot, cuts between shots |
| AI images | 9 photo plates | 13 paintings / still lifes (6 Nano Banana, 6 gpt-image + 1 reused), manifest in `media/manifest.json` |
| mix | music 0.13 | music 0.07 (≈ 19 dB under the voice) |

## Shot list (anchors are words of timings.json, seconds, by occurrence)
hook (signature bottle, rose petals) → cut on "whale's" (whale out of a cabinet) → ambergris (framed bell jar) →
"float" (ocean in a bottle) → fixative (bottle + gold ring on "last") → musk (velvet window, deer) → 1979 (paper,
musk pod + ring) → leather / castoreum (two cards on the table) → lab (molecule, one bond per word) → flowers (jasmine
drawer) → jasmine (heap of flowers against one vial, "≈1,000 kg") → rose (framed valley + Bulgaria / Turkey) →
vanilla (framed) → Edmond Albius 1841 (painted reconstruction) → vetiver (specimen on paper, "≈50%") → payoff
(layers fill on the words, ring closes on "bottle.") → loop (layers drain, back to the frame-0 pose and title).

## Run
```bash
raea/sillage-cabinet/setup.sh     # voice, music, sfx, fonts, crops the plates (prep-plates.sh)
raea/sillage-cabinet/render.sh    # → out/sillage.mp4 + raea check
raea render compositions/cover.tsx --frame 0 -o out/cover.png
```

## Known limits
- The gold ring is a torus that lights up (with a spark running round once), not a stroke drawn along a path.
- Glass is Bevy's screen-space transmission; the bottle reads as rose-tinted glass, not as thick crystal.
- Captions are grouped by a character budget, checked on stills; a very long word could still force a third line.
- Phone-size check done on stills only; platform UI overlays not checked in the apps.
