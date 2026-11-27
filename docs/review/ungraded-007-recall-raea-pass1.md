# Review: UNGRADED #007 "14 reads lost to 3" (`reread-recall`, raea), pass 1

Video `deliverables/ungraded/ungraded-007-recall-raea.mp4` (60.8 s). Frames pulled every 1 to 1.5 s, plus full-res
close-ups at 28.5, 34.5, 46.5 and 52.3 s. Timings checked against `timings.json` (same file as the composition's copy).

## Verdict
**Not ready yet. 7/10.** Every number on screen matches SOURCES.md and visuals land on their words (83% at 24.63,
40% at 32.50, 61% at 34.51, WINS at "win.", HIGH/LOW on their words, the book closes on "close"). The desk, the jars,
the day/night week and the rule card all read clearly. Three things need fixing before posting:
1. **The loop gives the answer away.** At "Try it now. No scrolling back." (56.69 to 58.33) the REREAD card still says
   "read it ×14". After it switches to "×?", the 14 tally marks stay on the card, and the title "14 READS" comes back
   0.2 s after the question ends. The retrieval payoff the reel is built around does not work.
2. **The two caveats can't be read.** "(other students, same method)" (size 14, sitting on the card border) and
   "feel sure: 4.8/7 / 4.0/7" (size 20) come out at about 20 px. SOURCES.md says the reel shows "separate groups" on
   screen. In practice nobody can read it.
3. **The payoff jar is hidden.** From 22 s to 38.9 s the notepad standee covers half of the RECALL jar, so the
   12-vs-18 marble comparison can't be seen. The reel also never says what a marble stands for.

## Accuracy (all match SOURCES.md)
2006 ✓ · 180 students ✓ · ×14 (14.2) ✓ · ×3 reads (3.4) ✓ · recall ×3, no feedback ✓ · 83/71 ✓ · feel sure 4.8/4.0 of 7
(Table 2) ✓ · 40/61 ✓ · 2013 review, practice tests HIGH / rereading LOW ✓ · marbles 25/21 → 12/18, rounded as stated ✓.
Cover line "Read it 14×. Forgot more." is fair as a hook (40% vs 61% a week later), but it ignores the between-subjects
design. Fine for a cover; the pinned comment already covers it.

## Fix list

1. **[P0] loop · 56.69–60.8 · the quiz answer is on screen during "Try it now. No scrolling back".** In `laneCard`:
   ```ts
   const quiz = L && t >= CUE.tryIt - 0.05;            // was CUE.howMany - 0.05
   ...
   s += hand(quiz ? "read it ×?" : "read it ×14", 22, 94, { size: 34, anchor: "start" });
   if (!quiz) s += tally(18, 104, 14, lit, 740);         // the 14 marks give the answer away too
   ```
   Also give the viewer a moment to answer before the title ("14 READS") comes back. Extend the tail by 1.2 s, holding
   "×?" over the music: `const DUR = TIMINGS.duration + 1.7;`. The title fade already keys off `DUR - 0.45`, and the
   last SHOT is `DUR - 0.9`. The loop still matches frame 0, because the answer shows up on the restart.

2. **[P0] careful · 43.4–52.6 · the source line wraps onto a second line ("2013") at y ≈ 1442–1470, below the 1440
   safe limit.** Shorten it to one line:
   `const SOURCE2 = "Dunlosky et al., Psych. Sci. Public Interest, 2013";` (or `"Dunlosky et al. 2013 · PSPI 14(1)"`).
   Also add `whiteSpace: "nowrap"` to the source div so a wrap can't happen silently again.

3. **[P1] week/flip · 29.1–35.5 · the between-subjects caveat can't be read** (size 14, drawn over the card's bottom
   border). Move it into the kicker, which is readable overlay text, and drop it from the card:
   ```ts
   { text: "1 week later · new students", from: CUE.wait - 0.1, to: B("feel") },   // was "Test · 1 week later"
   ```
   and delete the line `if (ph === "week" && !feel) s += hand("(other students, same method)", …)`. Update the SOURCES.md
   row "(separate groups) note on the week" to match.

4. **[P1] sure · 27.41–29.1 · "feel sure: 4.8/7" is about 20 px and crosses the card frame.** It is the beat's whole
   point. Make it bigger and move it inside the frame: `hand(\`feel sure: ${L ? "4.8" : "4.0"}/7\`, wv / 2, hv - 24,
   { size: 28, c: C.ink, hl: L ? C.hl : undefined })`. If that crowds the %, raise the percentage to `y 104, size 62`.

5. **[P1] five → feel · 22.0–38.9 · the notepad covers the RECALL jar.** The pad is at `x LANE+0.28, z 0.84`, in front
   of the jar at `z -0.32`. Fold it away while the jars are the subject:
   ```ts
   const padK = 1 - ease.inOut3(ramp(t, CUE.fiveLater - 0.4, 0.35)) * (1 - ease.inOut3(ramp(t, B("do") - 0.3, 0.35)));
   // Standee "pad": k: padK
   ```
   (or move it to `x: LANE + 0.62, z: BOOK.z + 0.3` for the whole reel). Hide the pencil while `padK < 0.5` as well.

6. **[P1] five · 22.0 · nobody is told what a marble means.** Add a small sign on the desk between the jars, at
   "Five", until "flips.": `Standee "key"`, `w 0.9, h 0.22, x 0, z CARD.z + 0.25`, text `hand("1 marble = 1 idea
   recalled", …, { size: 30 })`. The calendar takes that spot from `CUE.wait`, so they hand over cleanly.

7. **[P1] study · 5.4–9.8 · 4.4 s with nothing new on the desk** (only the kicker and captions change). Use it to set up
   the marbles. At "180", pop a row of six `guy()` figures labelled `"180 students"`. At "text.", pop a sheet
   `"The Sun · Sea Otters"` / `"30 ideas each"` between the jars. Then fix 6 just reminds the viewer of the key.

8. **[P1] recall · 15.4–17.0 · the card says "read it ×3" while the voice says "reads it once".** That reads as a
   contradiction. Both are true (one 5-min sitting is about 3.4 reads), but the viewer can't tell. In `laneCard`, right
   lane, pre phase: `hand("read it ×3 (one sitting)", 22, 94, { size: 30 })` and the left lane
   `"read it ×14 (4 sittings)"`. Or keep "×3" and change the second line to `then recall it ×N`, which already shows.

9. **[P2] school · 38.94–41.3 · the kicker says "OUT HERE" while the voice and the card say "At school".** Split it:
   ```ts
   { text: "At school", from: B("school") + 0.05, to: CUE.outHere - 0.2 },
   { text: "Out here", from: CUE.outHere - 0.2, to: B("careful") },
   ```

10. **[P2] careful · 43.4 · the source switches to Dunlosky on "Careful: one lab…", which is about Roediger & Karpicke.**
    Switch on "But": `const src = t >= w("careful", "But") - 0.1 && t < B("do") ? SOURCE2 : SOURCE;`.

11. **[P2] careful · 47.8–52.4 · "2013 REVIEWof study methods": the subtitle runs into the header.** In `RuleCard`
    side 3, drop the header subtitle and add a body line instead:
    `hand("10 study methods rated", 40, 92, { size: 26, anchor: "start", c: C.pencil })`, then move the rows to y 140 / 200.

12. **[P2] hook · 0–5.1 · the desk doesn't change for 5 s** (frame 0 is clear: title, ×14 vs ×3). Draw the tally on
    "fourteen" (`lit` ramps 0→14 over 1.04–1.9 s) and pop "×3" on "three." (2.60). On "who remembered more?" (4.10), drop
    a "?" standee into each empty jar. This answers the validate warning about a 4.9 s hook without re-voicing.

13. **[P2] flip/feel · 34.5–38.9 · the "%" of "61%" reaches x ≈ 945 at y ≈ 870–920.** That is just inside the right rail
    (the limit is x 930 below y 860). Nudge it with shot `[CUE.flips, { look: [0.08, 0.66, -0.1], … }]`, or set the
    right-lane pct to `wv / 2 - 6`.

14. **[P2] study · 7.56–9.8 · the caption splits mid-phrase ("…180 STUDENTS A SHORT / SCIENCE TEXT.").** Add
    `"study:students"` to `BREAK_AFTER`.

15. **[P2] cover · the title card covers the top of both lane cards and the WINS rosette.** In `Cover`, move the title
    block up 40 px (`ZONES.title.top + 10`) or set the camera `look[1]` to 0.56 so the cards sit lower. Optional.

## Safe area / layout
HUD at y 250 and kicker at 318 are fine. Captions stay within 1170–1410. The source line sits at 1412–1440 (fine,
except the wrap in #2). Below y 860 and right of x 930 there are only the pad's ruled lines (no text) and the edge in
#13. No overlay text collides with the header block. The raea check's "safe areas ok" only covers DOM text, not the
standee textures, which is why #13 wasn't flagged.

## Sound / sync
-14 LUFS, true peak -2.4 dBTP. The short caption-word warnings in the hook are expected at this VO speed and fine.
Captions and cues all land within ±0.1 s.
