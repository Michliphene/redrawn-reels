# Review · UNGRADED #005 "Ten copies beat one blank page" · raea edition (`copy-to-learn`)

Reviewed: `raea/ungraded-005-copy/out/copy.mp4` (1080×1920, 30 fps, 66.0 s, −14.0 LUFS, LRA 1.5), `out/copy.check.json`,
`compositions/copy.tsx`, `compositions/timings.json`, `public/episodes/copy-to-learn/SOURCES.md`, and the #001 format
(`fail-ten-times-doodle`) plus the UNGRADED bible on `origin/claude/exciting-gauss-kqc425`. I looked at frames every 0.5 s
for the whole reel, full-res frames at every cue and at the middle of each of the 5 page turns (2.73, 14.00, 27.62,
44.96, 56.88 s), and crops of the text drawn on the page.

## Verdict
**7.5/10. Not ready to post: one short pass, then one re-render.**
The #004 caption lessons were applied. Pages end on clauses ("Benjamin Franklin / leaves school at ten.",
"To become a / "tolerable" English writer."), captions are off during the hook, and the cues are word-anchored and land
on their words: the card turns on "flip." with the 6° swing, the 0 lands on "zero." and is scribbled out on "Nobody",
and the book, notes, faults, ticks, icons, sticky, almanac and cats all arrive on their words. The facts on the page
match SOURCES.md. The Franklin method is drawn honestly: "my copy" is written with no book in view, and the
"original" slides in only on "compares". The honesty line is on screen, and the loop closes.
Four things still hold it back:
1. **Franklin is never named in the drawing.** His head covers the word "SCHOOL" while the voice says he leaves school.
2. **The page turns eat two payoffs.** The hook's "0 blank page" is visible for about 0.5 s, and "a few days" plus the
   book going away are swallowed by the turn at 27.3 s.
3. **Two dead stretches:** 38.9–40.9 s (dimmed page, "His goal? In his own words,") and 45.0–46.1 s (an empty page
   on "Copy someone's work"). The honesty line itself is small handwriting in the top corner of an empty page.
4. **Several #004 polish items came back unchanged:** the pale caption box during turns, the 24 px source line at
   62% opacity, the source line popping at frame 0, the whisper hanging off the page at frame 0, and the music about
   25 dB under the voice.

## raea check: the 3 `reading` warnings
- "is" (f119–120) and "And" (f144–145, 0.2 s) come from the word-by-word caption reveal: each newly revealed word
  counts as a new text. They are false positives.
- "cheating." (f122–123, 0.7 s) is the end of a complete page ("Most people think copying is cheating."), which is
  held 0.69 s after its last word. That is fine for a page the viewer has read along with.
None of the three needs a fix. The other checks pass. As before, they do not see text drawn inside the page texture,
so I checked that by hand. Page text stays inside the rail: the rightmost readable items are "Sundays" (x≈880,
y≈1020), the almanac (x≤905) and the book (x≤885).
`npm run validate copy-to-learn` fails with `✗ series "UNGRADED" is not in public/studio.json`. The `ungraded` entry
only exists on `origin/claude/exciting-gauss-kqc425`. This is a branch issue, not a reel issue, but merge the entry
before posting.

## Fix list

### P0: blocks posting
1. **Owner fact-check boxes are not ticked** (SOURCES.md, "To tick before posting"): the *Spectator* passage and
   "taken home at ten" against a printed edition of the *Autobiography*, and Poor Richard's (wrote + printed).

### P1: fix before posting (one re-render)
1. **The hook payoff gets 0.5 s.** "0 blank page" pops at `CUE.blank` (1.88 s), but the turn to `rule` starts at
   `PAGES[1].from - FLIP.lead` = 2.40 s. Two changes:
   - `blank: w("hook","one")` (1.69 s), so the 0 lands on "one blank page".
   - `PAGES[1].from = B("belief") + 0.25` (3.11 s, turn at 2.77). This also shortens the empty desks before the card
     ("Most people think copying…").
   Result: about 1.1 s of "10 vs 0" before the turn.
2. **Name the subject.** On the Spectator page the hero is an unlabelled stick figure; the only "Benjamin Franklin" on
   screen is the caption (1.5 s) and the 24 px source line. In `spectatorPage`:
   - Add `CUE.ben = w("real","Benjamin")`.
   - Add `if (t >= CUE.ben) s += hand("Ben Franklin", hx, 790, { size: 58, hl: C.hl, opacity: ramp(t, CUE.ben, 0.2) })`.
     It follows him as he walks.
   - Move "apprentice" to y 850 under it (`size: 50, c: C.ink`).
   - In `comparePage`, add a smaller `hand("Franklin", 170, 1070, { size: 44, c: C.pencil })` under the desk guy, so
     the second Franklin page also says who it is.
3. **His head hides "SCHOOL" (14.0–16.9 s).** The hero starts at `hx = 210`, in the door, with his head at about
   y 894, right over `hand("SCHOOL", 210, 930)`. Write the label in the gable instead: `hand("SCHOOL", 210, 845,
   { size: 40 })`, since the roof spans y 760–870. Or start him at `lerp(250, 420, …)`, beside the door.
4. **"a few days" is never seen, and the book's exit is half-hidden.** `CUE.away` = 27.10 s, the slide lasts 0.6 s,
   the label shows at `CUE.away + 0.5` = 27.60 s, and the turn starts at 27.29 s. Fix:
   - In `spectatorPage`, slide the book at `w("notes","puts")` (26.57 s) and show "a few days" at `CUE.away` (27.10).
   - Repeat it on the next page, where the voice actually says "Days later": in `comparePage`, at
     `w("rewrite","Days")` (27.75), add `hand("a few days later", 290, 470, { size: 50, c: C.pencil })` above
     "my copy", faded out at `CUE.compares`.
5. **2 s dead on "His goal? In his own words,"** (38.87–40.86 s). `dim` starts at `CUE.goal`, but the sticky waits
   for `CUE.tolerable`. In `comparePage`:
   - Pop the sticky at `CUE.goal` with only the header `hand("his goal:", 150, 500, { size: 50 })` on it.
   - Write the quote stroke by stroke from `CUE.tolerable`: render it through `partial`, or reveal the words with
     `ramp(t, CUE.tolerable, 0.6)`.
   - Show "his own words" at `w("goal","own")` (39.89), not at `tolerable + 0.3`.
   Keep the `punch` on `tolerable`.
6. **The honesty line is weak and starts late.** On `practicePage`, "copy + sign it = cheating ✗" /
   "copy to learn = practice ✓" are 62 px Caveat (about 30 px x-height) at y 560/690, and y 720–1095 stays empty. It
   is the line comments will test. Three changes:
   - Set the size to 84.
   - Set the rows to y 600 and 800, since the "= cheating" end measures about 840 px at 84 px. If it passes x 900,
     break it onto two rows: "copy + sign it" / "= cheating ✗" at y 560/650, and the same for practice at y 800/890.
   - Write "copy" at `w("line","Copy")` (45.09) and "+ sign it" at `CUE.sign`, so the page is not empty for 1 s.
   When "Picture this" starts, scale the two rows to 0.6 and move them up (`translate(0 -60) scale(0.6)`), rather than
   dimming them to 30% at full size.

### P2: polish
1. **Make the Franklin method readable without sound.** While "from his notes alone" is spoken, show the yellow notes
   card from the previous page beside "my copy", with a small closed book struck through. In `comparePage`, at
   `w("rewrite","notes")` (29.79), add `sheetDoodle(…, { fill: C.note, lines: 5 })` at `translate(560 560) scale(0.6)`,
   then slide it out when "original" arrives on `compares`. Captioned viewers already get it; muted scrollers will too.
2. **Picture this: the labels are too small** ("copy / from memory / + 1 change" are 42 px pencil grey, about 18 px
   x-height on screen), and the frames are 230 px. Use frames 260 px wide at x 70 / 350 / 630 (the right edge stays
   at 890, inside the rail) and labels at 54 px in `C.ink`.
3. **Signing the changed copy is a comment risk** a few seconds after "copy + sign it = cheating". Rename the third
   label from "+ 1 change" to "my version", and add one line to the SOURCES debated points and the pinned comment:
   "practice drawings, not work you sell or hand in".
4. **Source line** (`SOURCE`). It is 24 px at opacity 0.62 (the #004 P2-6 fix was not applied); aim for 28 px and 0.8.
   It also sits under the school/rule section, where it reads as the source for "Copy a friend's homework → zero".
   - Show it only from `PAGES[2].from` to `PAGES[4].from`, the Franklin pages. This also removes the pop at frame 0
     (`t > 0.0`, #004 P2-10).
   - The date: in 1791 the memoir came out in French; the first English text was 1793, and the full text 1868. Write
     `"Benjamin Franklin, Autobiography, Part 1"` with no year, and correct the edition line in the SOURCES facts table.
5. **Frame 0 and the last frame:** the "C" of the whisper and the "T" of the title hang over the cover and desk edge
   at the 14° settle tilt. This is #004 P2-10 again. Start the whisper and title at `SAFE.left + 28`, or lower the
   settle yaw `4 * settle` to `2.5 * settle`.
6. **The caption backing during turns is a pale box** (`background: C.paper` at 14.0, 27.6, 44.96, 56.88 s). This is
   #004 P2-5 again. Drop the backing in `Captions`, since the turning page never reaches y 1170, or use `#E9E2D0`.
7. **The tail is quiet** (63.9–65.9 s: "Because…", then 1.2 s of silence on a static page). Bring the title back on
   "Because…" so the screen finishes the sentence. In `Overlay`, use `titleO = max(…, ramp(t, w("loop","Because…"), 0.35))`
   instead of `DUR - 0.45`. The loop stays exact.
8. **The music is inaudible:** music.wav −27.4 dB mean × `0.18*MIX` puts it about 25 dB under the voice (−17.2).
   This is #004 P2-9 again. Raise it to `0.30*MIX` (about 15 dB under), re-run the two-pass loudnorm, and keep TP ≤ −1.
9. **The rule page "make" moment:** the hero cheers on "make" with nothing made. Give him a small framed sketch
   (`sheetDoodle` 120×120) at `CUE.make`.
10. **Accent overuse:** "copy" is in `KEYWORDS`, so every COPY (8 times) is red with highlighter, including "Copy a
    friend's homework". Keep `copies`/`copies?`, `cheating.`, `practice.`, `lessons.`, `Zero.`, `"tolerable"`, and
    drop `copy` and `flip.`.
11. **The desk guy on `comparePage` pokes into the bottom of the "my copy" sheet** (head at about y 870, sheet bottom
    at 920). Move the sheets up 40 px (`sheetDoodle(110, 480, …)`, original `translate(… 480)`, FAULTS y −40).

## What already works (keep it)
- **Hook:** title, the pile, "10" on "Ten" at 0.25 s, no caption duplicating the title.
- **Captions:** two-line pages that end on punctuation, measured with the overlay font, held 0.5 s after the last
  word, and never cut mid-quote.
- **The Rule Flip:** COPY = CHEATING → COPY = PRACTICE on "flip." with the camera swing, the 0 on "zero.", and the
  scribble on "Nobody". The #001 frame is reused cleanly.
- **The Franklin page cues** each land within 0.1 s: age 10, the *Spectator* vol. III, hearts on "loves", notes on
  "notes", faults circled then ticked, night/morning/Sundays, the quoted "tolerable" with "his own words", and Poor
  Richard's with no date or run length on screen.
- **Honesty:** "copy + sign it = cheating ✗" is on screen in red, with the "Picture this" kicker for the hypothetical
  and "A real one" for the sourced case.
- **Loop:** the last frame shows the clean duel with no numbers (they fade on "copy"), the title back on screen and
  the frame-0 tilt, so it meets frame 0.
- **Safe area:** the HUD is at y 250, captions sit in 1170–1410, and page text stays at x ≤ 905 in the rail zone.
  Loudness is −14.0 LUFS and the reel runs 66 s (over 60 s, as the bible requires).
