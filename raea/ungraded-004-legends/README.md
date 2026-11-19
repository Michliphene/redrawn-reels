# UNGRADED #004 · Michael Jordan was never cut · raea edition (local render)

UNGRADED #004 (`legends`, notebook cut, branch `claude/exciting-gauss-kqc425`) rebuilt in **raea** and rendered
locally on the PC's GPU (raea 0.1.7, Windows app CLI). Only the **text** comes from the Remotion episode: Brian's
voice, its word timings, the music bed and the sourced facts (`public/episodes/legends/SOURCES.md` on that branch).

The world is a reporter's notebook on a wooden desk, with the spiral at the top and a ballpoint pen beside it. Each
scene is one page. Its ballpoint drawing (stick figures, handwriting, stamps) is an SVG texture redrawn every frame,
with the lines boiling every 3 frames. Between stories the page is turned over the spiral in 3D.

| Beats | Page | What happens |
|---|---|---|
| hook → told | tryout | the team list; CUT stamp on "cut", scribbled out on "twist." (not cut: JV); 5'9" / 6'7"; tears; practice shots; "I got cut." |
| book1 → book5 | nos | 12 letters stamped NO fly in from "Publisher"; the boss and his daughter on "gives"; MORE! on "rest."; the book on "Harry" |
| late1 → late3 | late | age line walked to 62 on "man"; the 1952 franchise deal on "deal."; 1,009 NO'S crossed out, "source? nobody can find one"; sticky "late still counts" |
| good, small | shrink | CUT! / 12 NO'S / 1,009 NO'S shrink into "JV team", "a pile of no's", "a late start" |
| you | rule | the card turns on "It's": "My setback = the end" → "My setback = the middle" |
| loop | tryout | the first page again; the camera returns to the frame-0 tilt (the last frame meets the first) |

## Run it (Git Bash)

```bash
raea/ungraded-004-legends/setup.sh    # media/: voice, timings, music (git show from the branch if not checked out), sfx, fonts as TTF, glyphs.json
raea/ungraded-004-legends/render.sh   # → raea/ungraded-004-legends/out/legends.mp4 (+ .check.json from raea check)
```

One frame: `raea render compositions/legends.tsx --frame 270 -o out/f270.png` (from this folder; `--at` takes frame numbers).
Needs `python` with fonttools and brotli. `RAEA_BIN` overrides the CLI path.

## Notes
- raea rasterises SVG textures with usvg, which cannot load our fonts: `make-glyphs.py` exports Caveat Bold and the
  Bricolage 800/75 cut as glyph outlines (`compositions/glyphs.json`), and the page text is drawn as paths.
- raea keeps a material's texture once it is made, so the live pages are remounted every frame (`stamp` key in `Sheet`).
- Every cue is timed from `timings.json` (`w(beat, word)`), every figure is in the facts table of `SOURCES.md`.
- The mix is normalised to −14 LUFS, −2.5 dBTP (`render.sh`).
