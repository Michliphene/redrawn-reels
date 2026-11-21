# UNGRADED #006 · Google graded the grades · raea (local render)

UNGRADED #006 (`gpa-google`) is made directly in **raea** (0.1.7, Windows app CLI) on the PC's GPU. The script,
Brian's voice (ElevenLabs), the word timings, the music bed and the sources are in `public/episodes/gpa-google/`.
The only sourced case is Laszlo Bock's June 2013 interview with *The New York Times*, quoted as The Register and
HR Dive relay it (the owner checks the NYT text, see `SOURCES.md`).

**A new world, not the notebook of #004/#005.** A lazy-susan turntable stands on a desk with six stations around it.
Every stick figure, sign and speech bubble is a **paper cut-out standee**: a ballpoint drawing with a white cut margin
(an SVG `feMorphology` dilate), a blank paper back, cut out with `alpha_mode: Mask`, casting a real shadow. A station's
standees pop up on their hinge as it swings to the camera, and fold flat once it has swung away. The bin, the
transcripts, the dots of the chart, the toy blocks and the rubber stamp are real 3D meshes. One continuous camera,
no page turns; the table turns a full circle, so the reel ends on the station it starts on (the loop).

| Beats | Station | What happens |
|---|---|---|
| hook | door | a kid holds up a 4.0 report card at a "HIRING" door; a rubber stamp swings in and stamps "WORTHLESS" on "Worthless." |
| who → years | interview | Laszlo Bock pops up with his name tag, the "NYT · June 2013" sheet, the bubble "no correlation at all" (+ "a slight one for brand-new grads"), then "completely unrelated" (after 2–3 years) |
| teaser, stopped | bin | a crowned interviewer throws three brainteaser cards into a 3D bin ("feels smart"); the transcript pile slides in after them; "TRANSCRIPT, PLEASE" crossed out, "only if you just left school" |
| teams | team | seven figures, six in graduation caps; the one without lights up on "14%" (drawn as 1 in 7, labelled) |
| cloud → careful | chart | an illustrative chart (labelled): dots line up by GPA, rise by "does the job well" into a cloud, slide onto the line grades would predict on "line.", fall back on "cloud."; a sticky "school: answer their questions / job: find the questions"; the tag "1 company · 1 interview · in 2013 · plenty still check grades" |
| travel → end | show | "What did you score?" crossed out → "What can you show?"; two applicants: a 4.0 sheet ("passed") vs a block tower built, knocked over on "broke,", rebuilt on "fixed.", a "CAN" flag on "can." |
| loop | door | the table finishes its turn; the door and the clean report card are back, as in frame 0 |

## Run it (Git Bash)

```bash
raea/ungraded-006-gpa/setup.sh    # media/: voice, timings, music, sfx, fonts as TTF, glyphs.json
raea/ungraded-006-gpa/render.sh   # → raea/ungraded-006-gpa/out/gpa.mp4 (+ .check.json from raea check)
```

Stills: `raea render compositions/gpa.tsx --composition gpa --at 30,100,250 -o out/s/` (from this folder).
Cover: `raea render compositions/gpa.tsx --composition cover --frame 0 -o out/cover.png`.
Re-recording the voice (only when the script changes): `python pipeline/tts.py gpa-google --engine elevenlabs`, then `setup.sh`.

## Notes
- Kit shared with #004/#005: page text as glyph outlines (`make-glyphs.py`), the ballpoint `ink`/`guy` port, the
  caption pager (ends on punctuation, held at least 0.5 s), audio through a compressor and a two-pass linear loudnorm
  to −14 LUFS / −2.5 dBTP, frames rendered in chunks of 150.
- Standee textures are keyed by name + boil bucket (3 tremble states) + drawing state, and cached, so a static
  standee only ever makes three textures. Mesh sizes never change over time (scale goes through `withScale`).
- SVG textures arrive flipped vertically on an upright Cuboid face: the drawing is wrapped in `scale(1 -1)`.
- Captions sit on paper strips (the set behind them is busy), the unspoken words of a line are shown faint.
