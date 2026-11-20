# Review · UNGRADED #004 "Michael Jordan was never cut" · raea edition (`legends`)

Reviewed: `raea/ungraded-004-legends/out/legends.mp4` (1080×1920, 30 fps, 63.9 s, −14.0 LUFS, −2.4 dBTP, LRA 1.7),
`out/legends.check.json`, `compositions/legends.tsx`, `compositions/timings.json`, and SOURCES.md on
`origin/claude/exciting-gauss-kqc425`. I looked at frames at 1 s intervals for the whole reel, plus full-res frames
at every cue and at the middle of each page turn.

## Verdict
**7/10. Not ready to post yet. One more pass fixes it** (all fixes are small, then a single re-render).
The notebook world works: the 3D page and its spiral read at once, the ballpoint boil feels alive, the page turns
make clean chapter breaks, the CUT stamp lands on "cut" and is scribbled out on "twist.", and the loop closes
cleanly. No figure on screen is missing from SOURCES.md. What holds it back is caption paging and a few
cues that are early, late or hidden.

**3 biggest problems**
1. **Captions break in the middle of sentences** ("…never cut from his / high school team.", "…as "I / got cut." Because",
   "…smaller than / the legends."). Most two-line pages are fully visible for under 0.3 s.
2. **Story 1 goes dead for 7 s** (6.9–13.9 s), and "6'7"" appears 4.6 s before the voice says "six foot seven".
3. **Story 3 hides its subject.** The franchise-deal card covers the man's head and body from 40.0 s to the page turn,
   and the "late still counts" sticky is on screen for only about 0.3 s before the page flips it away.

## raea check: the 12 `reading` warnings
All 12 fall between frames 37 and 148 (1.2–5 s). Each one names a single word. They come from the word-by-word
caption reveal: the checker counts each newly revealed word as a new text, so on their own they are false positives.
The checker probably stops after 12 warnings. The real problem underneath is #1 above. Caption pages change about
every 1.1 s and break mid-clause. Fixing P1-1 removes the cause. The 11 passed checks (loudness, safe areas for
overlay text, contrast, clipping) hold, but note that they **do not see the text drawn inside the page texture**
(see P1-6).

## Fix list

### P0: blocks posting
1. **Owner fact-check boxes are not ticked** (SOURCES.md, "To tick before posting"): Jordan/JV/heights (SI 2012),
   Alice Newton (NZ Herald/Guardian), Sanders 1952/62 (History.com). This is not a render fix, but the reel cannot go
   out until the owner ticks them.

### P1: fix before posting (one re-render)
1. **Caption paging** (`PAGES_CAP`):
   - The end-of-phrase regex misses closing quotes, so `cut."` does not close a page and "Because" hangs on the end.
     Use `/[.,:;!?…—]["”’]?$/`.
   - Do not split a line right after an opening quote (`"I`): in `close()`, skip any split index `i` where
     `ws[i-1].w.startsWith('"')`.
   - Add manual breaks so the hard 38-char cut lands on a clause boundary. Use
     `const BREAK_AFTER = new Set([w("hook","cut"), w("told","cut.\""), w("book1","book"), w("book3","home,"), w("late1","62"), w("late2","rejected"), w("late2","number"), w("good","failures"), w("you","end")])`,
     and close the page when `BREAK_AFTER.has(x.start)`. This gives "Michael Jordan was never cut" / "from his high
     school team." and "Their big failures" / "were smaller than the legends." Then raise the hard limit from
     `maxChars*2-2` to `maxChars*2+4`. Line 2 can run to the rail because `SAFE.railX` is 930 and the captions measure
     narrower than 0.47 em.
   - Hold each finished page at least 0.5 s: in `Captions`, keep showing page `i` until
     `max(next.start-0.05, page.end+0.5)`.
2. **The hook says the same thing twice** (0.25–2.6 s). The title "MICHAEL JORDAN WAS NEVER CUT" and the caption carry
   identical words on screen together. Either hide the captions during the hook (`if (t < BEATS.hook.end) return null`
   in `Captions`, since the title already carries the line), or change `TITLE` to a teaser such as
   "The cut that never happened". The first option keeps the stamp as the only moving thing and makes the hook cleaner.
3. **"6'7"" is early, and story 1 goes dead for 7 s.** In `tryoutPage`, show the 6'7" label at its own cue,
   `friend: w("friend","six")` (11.47 s), not at `height + 0.3` (6.89 s). Fill 7–13.9 s:
   - At `w("jv","junior")` (8.64 s), re-pulse the yellow highlighter on "Michael" in the JV column with
     `hit(t, CUE.junior)`, scale 1 + 0.15×hit.
   - At `w("friend","varsity.")` (12.67 s), write a tick or a name line in the Varsity column. "Leroy" is in the SI
     source if you want the name; add it to the facts table.
4. **Story 3: the card hides the man** (40.0–49.2 s). The card sits at `translate(780 700)` over the guy at x≈769.
   Move it up and out of his way: `translate(780 560)`, so it spans y 430–690 and "#1 · 1952" lands at about 730.
   The man's raised arms reach about y 785, so he stays visible and cheering. "#1 · 1952" no longer crosses his body.
5. **The "late still counts" sticky gets no time.** `CUE.callout = w("late3","counted.")` (48.94 s), but the page
   turn starts at 49.23 s. Set `callout: w("late3","started")` (47.71 s), and move `CALLOUT.at` to `[90, 770]`. The
   old spot `[560,420]` also collides with the card moved in P1-4 and with the strike line of "1,009 NO'S".
6. **Safe area (page texture, not checked by raea).** The age-axis labels "70", "80" and "age" sit at x≈935–950,
   y≈1015–1060 on screen, inside the right rail (x>930 under y=860). In `latePage`, set `X1 = 880`. "age" is anchored
   at `X1-10`, so it moves too. Recheck with a still at frame 1250.
7. **The "no. 12" counter states an exact count of a disputed number.** The series is about inflated numbers, and the
   sources range from 8 to 12. In `nosPage`, write `got < n ? \`no. ${got}\` : "no. 12?"`, or end on "~12". The
   shrink page's "12 NO'S" can stay, because SOURCES lists it as a restatement. "~12 NO'S" would be more consistent.

### P2: polish
1. **Shrink page is empty for 2 s** (49.6–51.5 s; only the ground line shows). Set
   `legends: w("good","news.")` (50.40 s), and keep the stagger.
2. **Story 2: the boss and the kid arrive together on "gives"** (30.50 s), while "one boss takes the first chapters
   home" is spoken at 28.35 s over a still frame. Split `kid` into `boss: w("book3","boss")`, which draws the grey
   guy, and `kid: w("book3","eight-year-old")`, which draws the girl with the pages.
3. **The age counter lags the voice.** "62" is spoken at 37.65 s, but `age 62` is only reached at 39.1 s. Set
   `age: w("late1","A")` (37.14 s) and `AGE.dur = 0.6`.
4. **"source? nobody can find one" arrives 0.6 s before "Nobody"**: it uses `CUE.myth + 1.2`. Anchor the strike
   line and the note to `w("late2","Nobody")`.
5. **The caption backing during page turns** is `C.paper` (#F7F2E4) over a lamp-lit page, so it shows as a pale box
   (21.0, 35.8, 49.5, 57.0, 61.8 s). Use `#E9E2D0`, or drop the backing entirely, since the turning page never
   reaches the captions band.
6. **Text that is too small or too faint:** the source line is 24 px at opacity 0.62 (aim for 28 px and 0.75); the
   tape HUD is 26 px (aim for 28); "Michael" on the team board is 40 px in the texture, about 38 on screen, and it is
   the key word of the twist (aim for 50); "feels like / actually" is pencil grey on mint (use `C.ink` at 60 px).
7. **Overlaps on the stage:** the Harry Potter book (`translate(420 640)`) covers the top of the NO pile, so move it
   to `translate(330 600)`. The practice hoop and ball cross the "6'7"" label: put the hoop at x 600–680, y 560. The
   "I got cut." bubble touches the hoop.
8. **Leftover header text during page turns:** the outgoing kicker fades over the lifting page (49.3–49.6 s). End
   kickers at `PAGES[i].from - FLIP.lead`, not at `to + 0.2`.
9. **Music bed** sits about 36 dBFS RMS against voice at about 17, roughly 19 dB under and almost inaudible. Raise
   `0.18*MIX` to `0.26*MIX`, which puts it about 15 dB under. Re-normalise and keep true peak ≤ −1 dBTP.
10. **Frame 0 and the loop:** the source line is hidden at t=0 (`t > 0.0`) and visible on the last frame, so it pops
    for one frame. Drop the condition. Also on frame 0 the "T" of the whisper sits off the tilted page, over the cover
    edge. Start the whisper at `SAFE.left + 24` (or settle the tilt by 2°).

## What already works (keep it)
- Stamp on "cut" at 1.54 s and scribble on "twist." at 3.54 s: both land on the word. The letters reach "no. 12" on
  "About twelve". MORE! lands on "rest.", the book on "Harry", the contract on "deal.", 1,009 on "1,009", the three
  shrinks on junior/pile/late, and the card turns on "It's".
- The page turns (0.66 s, with a whoosh) act as clear chapter re-hooks at 20.6, 35.6, 49.2 and 56.7 s.
- Loop: the last frame shows the clean tryout page, the title back on screen and the frame-0 camera tilt. It meets
  frame 0 almost exactly.
- Overlay type stays inside the safe area: the HUD starts at y=250 and the captions band runs 1170–1410.
- Facts on screen (JV, 5'9"/6'7", 62, #1 · 1952, 1,009 struck out, SI 2012) all match SOURCES.md.
