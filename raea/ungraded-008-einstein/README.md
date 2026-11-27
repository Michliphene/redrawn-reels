# UNGRADED #008 · He failed. Not math. · raea (local render)

UNGRADED #008 (`einstein-math`) is made directly in **raea** (0.1.7, Windows app CLI) on the PC's GPU. The script,
Brian's voice (ElevenLabs), the word timings, the music bed, the AI backdrop and the sources are in
`public/episodes/einstein-math/`. Sources: Isaacson (TIME, 2007) for the 1935 episode and the 1895 exam, the
transcribed Aarau certificate of 3 October 1896 for the grades (see `SOURCES.md`).

**A new world:** a school record board on an 1890s classroom wall (AI backdrop, Nano Banana). The board's face flips
(a quick vertical squash) for each chapter. Four wooden grade tiles beside the rows roll over (about X) to show a
grade. A 1–6 scale ruler rolls over for the "old way". A FAIL stamp, a speech bubble, a redrawn headline clipping and
a rule card are paper standees.

| Beats | What happens |
|---|---|
| hook | the redrawn headline clipping over the SCHOOL RECORD board; "a real headline", "ha!" |
| reply | a speech bubble: "Princeton, 1935…" → "I never failed in mathematics." + "calculus before 15" |
| exam, parts | board → ZURICH POLYTECHNIC (age 16); tiles roll TOP, TOP, LOW, LOW; FAIL stamp on "fail." |
| aarau | board → THE DIRECTOR'S ADVICE: "Finish high school first." → AARAU, 1895–96 |
| cert, scale | board → AARAU CERTIFICATE 1896; tiles roll 6, 6, 6, 3; the 1–6 ruler (6 = best) |
| theory | the ruler rolls over to the old way (1 = best, 6 = worst) |
| school | the rule card: AT SCHOOL a fail is "a verdict on you" → OUT HERE "a list" |
| do | the 1895 exam again: the FAIL stamp drops, the tiles roll TOP, TOP, LOW, LOW, Languages circled |
| loop | ZURICH POLYTECHNIC autumn 1896: ADMITTED, French 3 (still); SCHOOL RECORD and the headline clipping come back = frame 0 |

## Run it (Git Bash)

```bash
raea/ungraded-008-einstein/setup.sh    # media/: voice, timings, music, sfx, fonts as TTF, glyphs.json, art (flipped)
raea/ungraded-008-einstein/render.sh   # → raea/ungraded-008-einstein/out/grades.mp4 (+ .check.json from raea check)
```

Stills: `raea render compositions/grades.tsx --composition grades --frame 0 -o out/s0.png` (from this folder).
Cover: `raea render compositions/grades.tsx --composition cover --frame 0 -o out/cover.png`.

## Notes
- Kit shared with #004–#007: glyph-outline text in textures (`make-glyphs.py`), the ballpoint `ink` port, paper
  standees, the caption pager, the two-pass loudnorm to −14 LUFS, frames rendered in chunks of 150.
- Tiles show only on faces with rows (exam, cert; French alone on the ADMITTED face). Tiles and the ruler have one textured plane per side; the back side's drawing is mirrored left-right so it reads right
  after a roll about X.
- The backdrop is an opaque unlit Cuboid card; `setup.sh` flips the picture top-bottom for its front face.
