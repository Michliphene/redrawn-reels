# Review · UNGRADED #006 "Google graded the grades" · raea edition (`gpa-google`)

Reviewed: `deliverables/ungraded/ungraded-006-gpa-raea.mp4` (byte-identical to `raea/ungraded-006-gpa/out/gpa.mp4`; 1080×1920,
30 fps, 71.9 s), `compositions/gpa.tsx`, `timings.json`, `SOURCES.md`, `out/gpa.check.json`, `npm run validate gpa-google`.
I looked at frames every 1 s for the whole reel, half-res frames at 0, 3.2, 6.3, 13.6, 18.9, 25.8, 26.8, 29.9, 41.5, 50.9, 54.0,
62.4, 64.8, 70.9 and 71.9 s, and frames in the middle of the station turns.

## Verdict
**6.5/10. Not postable yet: one owner tick, one registry line, then a polish pass and a re-render.**
The brief is met on form. This is not the Rule Flip: there is no "most people think", no rule card and no ten-vs-one hook.
The world is new too (a desk, a turntable, cut-out standees with a white cut margin and real shadows, a 3D stamp, bin,
dots and blocks). Every cue is tied to a word and lands on it (stamp on "Worthless." +0.08 s, bubble on "No", strike on
"transcripts.", 14 % on "14%", dots onto the line on "line.", cloud on "cloud.", block falls on "broke," and goes back on
"fixed.", flag on "can."). The quotes match SOURCES.md, the honesty beat is on screen, and the loop is clean: frame 2157
and frame 0 are almost identical.
The 3 biggest problems:
1. **The 3D is underused.** The camera is the same fixed front rig at all six stations, so each station reads as a flat
   slide, and the pop-ups mostly happen during the 0.85 s whip. The viewer never sees the turntable as a whole: there is
   no establishing or pull-back shot, so "paper diorama turntable" only shows up in the turns.
2. **The captions sit on the action.** Every station's floor line is at y ≈ 1300–1340, inside the captions band
   (1170–1410). The strips cover Bock's legs, the team's bodies, the transcript pile (never seen before it flies),
   "passed" under the 4.0, and the base of the block tower (which also runs into the source line).
3. **Small text and overlaps inside textures** (raea check cannot see these). The name tag's "head of people, Google" is
   clipped and later hidden by the bubble. The cloud outline crosses "illustration, not Google's data" and "does the job
   well". The 1-in-7 disclaimer is about 22 px. "WORTHLESS" overruns its stamp box. Applicant A's face is behind his 4.0 sheet.

## raea check / validate
- `validate`: ✗ `series "UNGRADED" is not in public/studio.json`. This is a repo-wide gap (#005 `copy-to-learn` fails the
  same way), but by the rule it is a P1. See item 2.
- check `reading` warn "The interview" f125–126: the kicker is actually on screen from 4.1 to 19.4 s (it fades in once the
  title fades out). This is a false positive from the fade-in.
- check passes safe areas, but it only sees the overlay. Inside the textures I found nothing readable past the limits. The
  closest calls are the bubble text "(…brand-new grads)", which ends at x ≈ 924, y ≈ 960, and "plenty still check grades",
  which ends at x ≈ 905, y ≈ 1160. Bubble and board borders reach x ≈ 1000–1030 below y = 860, but they are not text.

## Fix list
1. **[P1] process · whole reel · The owner boxes in SOURCES.md are unticked** (NYT text not read first-hand). The reel puts
   the lines in quote marks under "Their verdict, in their own words". Fix: the owner checks the June 2013 Bryant
   interview and ticks both boxes. My recollection of the NYT text matches all four quotes and the 14 % line ("teams where
   you have 14 percent of the team made up of people who've never gone to college"), but that does not replace the tick.
2. **[P1] registry · validate ✗.** Add `"ungraded": { "name": "UNGRADED", "composition": "Diorama", "episodeTag": "#{n}", … }` to
   `public/studio.json` `series` (copy the shape of `redrawn`). Fixes #005 too.
3. **[P2] all stations · Move the stage out of the captions band.** In `cameraAt`, aim lower everywhere except the
   door, so the hook and loop frames stay identical:
   `const away = ramp(t, ST[1].from - TURN.lead, TURN.dur) * (1 - turnK(t, 6));`
   `const look: V3 = [0, 1.22 + 0.15 * turning - 0.5 * away, R - 0.05];`
   That lifts each floor line about 130 px (to about 1200). Check with stills that the tops (tag, NYT sheet, chart board,
   "What can you show?" sign) stay under the kicker (y ≈ 410). If they don't, also add `dist *= 1 + 0.06 * away`.
4. **[P2] 51.4–57.2 s travel · Re-hook plus fill the dead stretch.** From 52.1 to 55.0 s the only thing on screen is one sign
   on an empty stage. Turn the travel turn into the reel's one camera move: a crane-up pull-back that shows the whole
   lazy susan, with the five earlier stations folded flat, then a push in to "show". In `cameraAt`:
   `const rev = Math.sin(Math.PI * ramp(t, B("travel") - 0.4, 2.2));`  `dist *= 1 + 0.9 * rev;`  `pitch += rad(48) * rev;`
   and give ST[5] `TURN.dur` 1.6. For the folded stations to show, `Standee` must draw hinge-mode standees at k = 0:
   change `if (d.k <= 0.01) return null` to `if (d.k <= 0.01 && d.mode === "scale") return null` (hinge at 0.49π = flat).
   Then pop `appA`/`appB` on "people" (`w("travel","people")`) as the two askers, instead of on "Picture".
5. **[P2] 4.1–19.4 s paper · The name tag is clipped and covered.** In `tag`: `w: 1.6, h: 0.62, y: 1.95`; name at y 40,
   subtitle `hand("head of people, Google", wv/2, 78, { size: 26 })`. In `quote`: `y: 0.95 → 0.8`, so the bubble no longer
   covers the tag. Keep `x: 0.32` (moving it right breaks the x = 930 rail).
6. **[P2] 40.3–51 s cloud · The cloud outline runs over the axis label and the disclaimer.** In `cloudStation`, shrink and
   centre it: radii `0.56 → 0.40`, `0.6 → 0.38`, centre `Y(0.5)`. Move the label to `hand("illustration, not Google's data",
   wv - 26, hv - 22, …)` (bottom-right, inside the board) so nothing ever crosses it. Draw "what grades would predict" at
   `X(0.9), Y(0.98)`, above the dots, `anchor: "end"`.
7. **[P2] 24.6–27 s bin · The bin rim renders as an upright bucket handle** (silver arch above the bin, visible at 25.8 s).
   Lay it flat: `<Mesh3d name="bin-rim" transform={Transform.fromXyz(0, BIN.h, 0).withRotation(Quat.fromEuler("XYZ", Math.PI / 2, 0, 0))}>`
   (verify the axis with one still). Also, the transcript pile at `y 0.03, z -0.45` sits under the caption strip and is only
   seen while it flies. Start it on the boss's desk height: `lerp(0.75 + i * 0.03, BIN.h + 0.1, e)` from `x: -0.35, z: 0.1`.
8. **[P2] 28.4–30.5 s teams · The 1-in-7 disclaimer is about 22 px.** `pct`: `hand("(drawn as 1 in 7, not a real team)", …, { size: 15 → 22 })`
   and `h: 1.05 → 1.15` with the line at y 146. Or move it to the kicker: `{ text: "Some teams · 1 in 7 drawn", … }`.
9. **[P2] 59.2–66.5 s show · Applicant A's head is behind the GPA sheet, and "passed" is under the caption.** `sheetA`:
   `x: -0.42 → -0.2, y: 0.5 → 0.85, z: 0.3`, so it is held beside him at chest height. Draw "passed" at the top of the sheet
   (`hand("passed", wv/2, 26, …)`, size 24) so it clears the strip. Item 3 also lifts the tower base off the source line.
10. **[P2] 2.85–3.9 s hook · The stamp text overruns its box,** so the box lines strike through "WORTHLESS". In `card0`, stamp box
    `±118 → ±150` wide, text size `40 → 34`. Also clean the card: "GPA 4.0" and its ellipse sit on the History/Science rows.
    Keep 3 subjects (`["Math","English","Science"]`, rows at `90 + i*26`) and the GPA at `hv - 24`, ellipse centre `hv - 38`.
11. **[P2] 0–1.7 s hook · Nothing on screen says Google** while the voice opens on "Google ran the numbers." Door sign:
    `cutTxt("GOOGLE · HIRING", wv/2, 50, 40)` (plain type, no logo, so it stays within the no-logo rule).
12. **[P3] frame 0 · Make it read as a diorama, not a flat drawing.** Have the stamp already hovering in frame from t = 0, at
    `[1.05, 2.1, 1.3]` with its shadow on the card, so the hook has a threat. Make it swing down from there on "Worthless."
    and sit back at that pose after `CUE.because`, so the loop still matches. Hook pitch `17° → 12°` so the standee edges and shadows read.
13. **[P3] caption accent misfires.** "LINE" in "Line people up" (33.2 s), "CAN" in "what you can show" (56.4 s) and the first
    "questions." (42.8 s) turn red because `KEYS` matches every occurrence. Key the list by beat:
    `["line:line.", "line:cloud.", "school:questions.#2", "end:can.", …]` and test `${beat}:${w}` plus its occurrence index in
    `Captions`. Also sync `episode.json` `keywords` (it lacks `"completely` and `fixed.`) with `KEYWORDS`.
14. **[P3] 14.3–16.7 s years · For 2.4 s nothing changes** on "And after two or three years". Switch the bubble to the "b" state
    (with "after 2–3 years:") on `CUE.years`, and stamp "COMPLETELY UNRELATED" on `CUE.unrelated`. Drop the "b2" line "to how you
    did in school": it is on screen for less than 0.3 s before the turn.
15. **[P3] 25.1 s bin sign · "only if you just left school"** narrows the source ("unless you're just a few years out of
    school"). Write `"unless you're a few years out of school"`, size 22.
16. **[P3] bin kicker "Also in the bin"** reads oddly, since nothing went into the bin before it. Use `"Into the bin"`. Label the crowned
    figure: a `tag` standee `"interviewer"` on `CUE.teaser`, and bump the brainteaser card label size from 13 to 20.
17. **[P3] 66.7–68.4 s loop lead-in · Static stage** during "So keep your grades. Build something too." On `CUE.keep`, appA tucks the
    sheet under his arm (pose `armR: 160`). On `CUE.build`, a fifth block drops onto the tower.
18. **[P3] 30.0 s · An orphan caption page "BACKGROUND."** Add `"teams:no"` to `BREAK_AFTER`, so the page splits before "no college background."
19. **[P3] source line** is 22 px at 0.75 opacity (#004/#005 had the same note). Use 26 px at 0.9. It still fits 1412–1440.
20. **[P3] cover/title consistency.** The cover reads "Google checked your GPA / Its verdict, in its own words", the reel reads
    "Google graded the grades / Their verdict, in their own words", and episode.json says "in their words". Pick one whisper.

## Accuracy summary
All on-screen claims check against SOURCES.md: "worthless" (for hiring, with the HIRING door as context), "no correlation at
all" plus the slight one for new grads, "completely unrelated" after 2–3 years, brainteasers "a complete waste of time" /
"feel smart", transcripts dropped for most, 14 % on some teams (worded as "some"), the chart and the 1-in-7 team labelled as
illustrations, and "1 company · 1 interview · in 2013 · plenty still check grades". The only drift is item 15. I found no anachronisms.
