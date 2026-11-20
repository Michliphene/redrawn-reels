# UNGRADED #005 · Ten copies beat one blank page · raea (local render)

UNGRADED #005 (`copy-to-learn`) is made directly in **raea** (0.1.7, Windows app CLI) on the PC's GPU. It uses the
Rule Flip format of #001 (ten failures vs. one A+) and the 3D notebook world of the raea edition of #004.
The script, Brian's voice (ElevenLabs), the word timings, the music bed and the sources are in
`public/episodes/copy-to-learn/`. The only sourced case is Franklin's *Spectator* exercise, from his own
*Autobiography*.

The world is a reporter's notebook on a wooden desk, with the spiral at the top and a ballpoint pen. Each scene is one
page with a ballpoint drawing redrawn every frame (the lines boil every 3 frames). The page is turned over the
spiral in 3D between scenes.

| Beats | Page | What happens |
|---|---|---|
| hook | duel | a pile of ten copies vs one blank page; "10" on "Ten", "0" on "blank" (frame 0 already shows the pile) |
| belief → rule | rule | the card "COPY = CHEATING" on "cheating."; a kid copies the neighbour's homework, red 0 on "zero."; the card turns to "COPY = PRACTICE" on "flip." (the camera swings ~6°); the 0 is scribbled out on "Nobody" |
| real → notes | spectator | Franklin leaves school ("age 10"), the apprentice, *The Spectator* vol. III on "Spectator,", hearts on "loves", notes on "notes", the book put away for "a few days" on "away." |
| rewrite → later | compare | "my copy" written from notes, "original" beside it on "compares", faults circled on "faults,", ticked on "fixes"; night / morning / Sundays; the sticky "a tolerable English writer" on "tolerable"; *Poor Richard's Almanack* on "Poor" |
| line, picture | practice | "copy + sign it = cheating ✗" / "copy to learn = practice ✓"; "Picture this": copy, from memory, + 1 change (a cat), then a signature |
| count, loop | duel | "10 lessons" with ticks on each copy, "0" on "Zero."; the numbers fade on "copy" so the last frame meets frame 0 |

## Run it (Git Bash)

```bash
raea/ungraded-005-copy/setup.sh    # media/: voice, timings, music, sfx, fonts as TTF, glyphs.json
raea/ungraded-005-copy/render.sh   # → raea/ungraded-005-copy/out/copy.mp4 (+ .check.json from raea check)
```

One frame: `raea render compositions/copy.tsx --frame 245 -o out/f245.png` (run it from this folder). `--at` takes frame numbers.
You need `python` with fonttools and brotli. `RAEA_BIN` overrides the path to the CLI.
Re-recording the voice (only when the script changes): `python pipeline/tts.py copy-to-learn`, then `setup.sh` again.

## Notes
- The kit is the one from #004 (`raea/ungraded-004-legends`):
  - Page text is drawn as glyph outlines (`make-glyphs.py`, because usvg cannot load our fonts).
  - Live pages are remounted every frame (`stamp` key), because raea keeps a material's texture once it is made.
  - Frames are rendered in chunks of 150 (GPU memory).
  - Audio goes through a compressor and then a two-pass linear loudnorm to −14 LUFS / −2.5 dBTP.
- Captions are measured with the overlay font, end on punctuation (a closing quote too), and are held at least
  0.5 s. They stay off during the hook, where the title carries the line.
- Every cue is timed from `timings.json` with `w(beat, word)`. Every fact is in the facts table of `SOURCES.md`.
  The "10" and "0" are illustrative and labelled as such there.
