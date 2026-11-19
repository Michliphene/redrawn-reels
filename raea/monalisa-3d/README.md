# THE GETAWAY — CASE 003 · Stolen from the Louvre · raea edition (local render)

CASE 003 (`getaway-003-monalisa`, branch `claude/dreamy-cori-wp0kgi`) rebuilt in **raea** and rendered locally on
the PC's GPU (raea 0.1.7, Windows app CLI). Only the **text** comes from the Remotion episode: Clyde's voice, its
word timings, the noir music bed and the sourced facts (`public/episodes/getaway-003-monalisa/SOURCES.md`).

One world, three sets, one camera (cuts where the cue sheet has `cut: true`):

| Beat | What the set does |
|---|---|
| hook | the painting in its gilt frame on the Salon wall, the crowd in the torch pool; 20,000 pinned; the CAUGHT / RECOVERED / FAMOUS boxes open |
| who | a glass pane slides in front of her on "glass." (HE FITTED HER GLASS CASE) |
| theft | cut; she's lifted off the pegs on "lifts", folded into the coat on "hides", the figure (SYMBOLIC) walks out the lit door on "walks" |
| unnoticed / crowds | the empty wall and its four iron pegs; a red rope on "closes"; sixteen people queue on "crowds" |
| twist | cut; she's back as a memory, three admirers (SYMBOLIC); "World's most famous painting? — NOT YET" |
| press | crane up to the paper map on the desk; FR IT GB DE ES pulse on "front"; the Puck cartoon (LoC) |
| suspects | Paris; the typed police file (reconstruction), BOTH CLEARED on "cleared." |
| trunk | cut to his room under a bare bulb; the trunk opens on "trunk." with her inside; 28 MONTHS |
| florence | cut to the map; the red dashed corridor (APPROX.) and a small train Paris → Lyon → Turin → Florence |
| caught / patriot | Florence: she stands on the dealer's table, the dealer file, three police pawns, ARRESTED; the CONVICTED file (police photo, ACCOUNTS VARY), OUT |
| end | cut to the frame-0 shot; the boxes ticked on "She", "back", "world" (WORLDWIDE) — the last frame meets the first |

## Run it (Git Bash)

```bash
raea/monalisa-3d/setup.sh            # media/: voice, timings, music, images, sfx, fonts as TTF, the map (make-map.py)
raea/monalisa-3d/render.sh           # → raea/monalisa-3d/out/monalisa.mp4 (+ .check.json from raea check)
```

One frame: `raea render compositions/monalisa.tsx --frame 120 -o out/f120.png` (from this folder).
Needs `python` with Pillow, fonttools and brotli. `RAEA_BIN` overrides the CLI path.

## Notes
- The map is a texture drawn once from the episode's geojson (`make-map.py`): modern borders, none labelled; the
  composition's `geo()` uses the same projection, so pins, route and train land on the right places.
- Every cue is timed from `timings.json` (`w(beat, word)`); every figure is in the facts table. People are faceless
  pawns labelled SYMBOLIC; the only face is Peruggia's public-domain police photo (a convicted person, credited).
- The mix goes through a limiter at −1.5 dBTP (`render.sh`).
