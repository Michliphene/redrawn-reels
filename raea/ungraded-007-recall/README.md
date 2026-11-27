# UNGRADED #007 · 14 reads lost to 3 · raea (local render)

UNGRADED #007 (`reread-recall`) is made directly in **raea** (0.1.7, Windows app CLI) on the PC's GPU. The script,
Brian's voice (ElevenLabs), the word timings, the music bed, the AI backdrop and the sources are in
`public/episodes/reread-recall/`. The one sourced case is Roediger & Karpicke (2006), Experiment 2 (see `SOURCES.md`).

**A new world:** a study desk in front of a study-room wall (AI backdrop, Nano Banana). Two lanes: REREAD (left, an
open book whose page keeps turning) and RECALL (right, a book that closes after one read, a notepad and a pencil).
Each lane has a glass jar for up to 30 marbles, one per "idea unit" the researchers scored (counts rounded, % exact).
A card in front of each jar carries the lane's numbers. The week passes as a day/night time-lapse (the light dims seven
times, the lamp glows, a desk calendar runs to DAY 7) while the jars drain. A rule card flips three times for the
school/out-here line, the "careful" limits and the 2013 review.

| Beats | What happens |
|---|---|
| hook | the two cards: "read it ×14" (with 14 tally marks) vs "read it ×3"; empty jars |
| study | wide shot of the desk |
| reread | close on the left lane: the page turns ~14 times, the tally marks light up one by one |
| recall | close on the right lane: the book closes on "closes", the pencil writes three rounds, "then recall it ×1…3" |
| five | the notepad folds away until "do"; the jars fill (25 / 21 marbles), the cards show 83% and 71%, a WINS rosette on REREAD; "feel sure 4.8/7 vs 4.0/7" |
| week → flip | kicker "1 week later · new students", a soft dusk pulse ×7 (kept low: raea flagged a full day/night cycle as a flash), calendar to DAY 7, the jars drain to 12 / 18, cards show 40% and 61%, the rosette moves to RECALL |
| feel | "feels like knowing" vs "what lasts" |
| school, careful | the rule card: AT SCHOOL → OUT HERE → CAREFUL (one lab, college students, short texts) → 2013 REVIEW (HIGH / LOW) |
| do | the left book closes, the notepad is written again, a red check on "check" |
| loop | jars empty, from "Try it" the left card asks "read it ×?" (no tally) and holds 1.5 s after the question; frame 0 answers ×14 |

## Run it (Git Bash)

```bash
raea/ungraded-007-recall/setup.sh    # media/: voice, timings, music, sfx, fonts as TTF, glyphs.json, art (flipped)
raea/ungraded-007-recall/render.sh   # → raea/ungraded-007-recall/out/recall.mp4 (+ .check.json from raea check)
```

Stills: `raea render compositions/recall.tsx --composition recall --frame 0 -o out/s0.png` (from this folder).
Cover: `raea render compositions/recall.tsx --composition cover --frame 0 -o out/cover.png`.

## Notes
- Kit shared with #004–#006: glyph-outline text in textures (`make-glyphs.py`), the ballpoint `ink` port, paper
  standees, the caption pager, the two-pass loudnorm to −14 LUFS, frames rendered in chunks of 150.
- Meshes that grow or shrink use `withScale` on a fixed shape (raea keeps a mesh's first-frame geometry).
- The backdrop is an opaque unlit Cuboid card; `setup.sh` flips the picture top-bottom for its front face.
