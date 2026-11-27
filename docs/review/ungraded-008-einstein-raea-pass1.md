# Review: UNGRADED #008 "He failed. Not math." (`einstein-math`, raea), pass 1

Video `raea/ungraded-008-einstein/out/grades.mp4` (64.2 s, 1080×1920). Frames pulled every 1 s, plus 540-px close-ups at
0, 3.8, 5.9, 13.4, 25.0, 30.8, 40.3, 45.8, 59.6, 60.9 s and the last frame. Timings checked against `timings.json`
(identical to the composition's copy). Loudness −14.0 LUFS, true peak −2.5 dBTP. raea check reports only 4 short-word
reading warnings in the hook, which are expected at this VO speed.
Already known and excluded here: the Aarau quote clipped by the tiles, and the FAIL stamp's grey shadows/placement.

## Verdict
**Not ready yet. 7/10.** The board is a clear, readable world: one face per chapter, labelled rows, and tiles that roll
on the subject's name. Frame 0 is strong (title + red headline), and the do-beat payoff (Languages circled on "failed.")
works. The three biggest problems:
1. **The loop shows "French LOW" for 3 s before the "3" lands** (57.5–60.4). It's a leftover tile from the 1895 exam,
   now sitting next to a row labelled French on the 1896 ADMITTED board.
2. **The myth's mechanism is never shown.** On "his sixes look like fails" (45.5–47.0) the three tiles stay green "6".
   Only a tiny "worst" under the ruler's 6 carries the idea.
3. **The clipping is dated "newspaper column · 1930s".** SOURCES.md says the reel does not date the column.

## Accuracy
1879 Ulm (not in SOURCES.md, see #12) · 1935 Princeton rabbi ✓ · "I never failed in mathematics" ✓ · calculus before 15
(his claim, not quoted) ✓ · 1895, age 16 ✓ · Math/Physics TOP, Languages/The rest LOW, overall fail ✓ · director's
advice, Aarau 1895–96 ✓ · Algebra 6, Geometry 6, Physics 6, French 3 ✓ · scale 1–6, 6 best ✓ · old way 1 best (said as
a theory) ✓ · admitted autumn 1896 ✓ · French still 3 ✓. **✗ "1930s" on the clipping** (#2).

## Fix list

1. **[P1] loop · 57.47–60.37 · the French tile shows LOW, and three blank tiles sit on a board with no rows.**
   Tile 3 has no blank event in `do`, so its LOW carries over. In `TILE_EV[3]`, insert a blank before the 3:
   ```ts
   [[CUE.rest, G.low], [BLANK_EXAM + 0.18, null], [CUE.three, G.three], [BLANK_CERT + 0.18, null],
    [CUE.read + 0.36, G.low], [BLANK_DO + 0.18, null], [CUE.three2 - 0.05, G.three]],
   ```
   Also hide the tiles on faces without rows (record, aarau, and rows 0–2 on "in"). This removes the noise in hook/reply/
   aarau/loop, and it is probably the cleaner fix for the clipped Aarau quote too. In `Tile`:
   ```ts
   const { id, sy } = boardSide(t);
   const shown = id === "exam" || id === "cert" || (id === "in" && i === 3);
   if (!shown) return null;
   // and squash with the board face during flips: .withScale([1, sy, 1]) on the outer Entity
   ```

2. **[P1] hook + loop · 0–6.3, 61.4–64.2 · "newspaper column · 1930s" dates the column, which SOURCES.md says the reel
   doesn't do.** `Clipping` line 466: `hand("Ripley's Believe It or Not! column", wv / 2, 28, { size: 16, … })`.
   Isaacson names Ripley's, and it's more credible than an anonymous column. Use size 18 if it fits, otherwise
   `"Ripley's column"` at size 20. Glyphs `'` and `!` exist.

3. **[P1] theory · 45.46–47.0 · "his sixes look like fails" has no visual.** Add a board state and write it next to the
   three 6 rows. In `Board`, add `+(t >= CUE.sixes - 0.05 && t < B("school"))` to `state`, then in the `cert` branch:
   ```ts
   if (t >= CUE.sixes - 0.05 && t < B("school"))
     [0, 1, 2].forEach((i) => { s += hand("= worst?", TILE.xd - 34, ROW_Y[i] + 9, { size: 30, anchor: "end", c: C.red }); });
   ```
   Stronger alternative: a red tile variant `G.sixOld = { v: "6", c: C.red }` that rolls in on "sixes" (+0.06/row).
   The texture key would then need the colour: `texture(\`tile:${v.v}:${v.c}:${face}\`, …)`.

4. **[P1] exam · 16.6–20.9 · 4.3 s with nothing new on screen** (the board is set at 14.96 and the header becomes "age 16"
   at 16.56). Use "two years early" (17.57): in the `exam` branch, write
   `if (t >= CUE.early - 0.05 && t < B("parts")) s += hand("2 years younger than the rest", 26, 290, { size: 26, anchor: "start", c: C.red });`
   (board units; below the 4th row, ROW_Y[3]+19 = 267). On "entrance exam" (w("exam","entrance") 18.65), pulse the four
   tiles (a 0.15 rad wobble) so the viewer sees where the grades will land. Add `+(t >= CUE.early)` to `state`.

5. **[P2] cert · 31.8–34.8 · 3 s of a blank certificate.** On "final certificate" (32.41), hand-write
   `"14 subjects · we read 4"` in pencil under the header (y 70, size 22). It's true (SOURCES: 14 grades) and pre-empts
   the "what about the others" comments.

6. **[P2] parts · 20.90–24.30 · the exam grades land before they are said.** TOP shows on "Math" (20.90) and
   "physics" (21.32), but "top marks" comes at 21.92. LOW shows on "Languages" (22.91) and "rest" (23.64), but "not enough" comes at 24.30.
   For a scroller, the colour arriving on the verdict word is the punch. In `TILE_EV`, use
   `[CUE.top - 0.15, G.top]`, `[CUE.top - 0.03, G.top]` for rows 0–1 and `[w("parts","not") - 0.1, G.low]`,
   `[w("parts","not") + 0.02, G.low]` for rows 2–3. The cert tiles are already on their "six."/"three." words, so leave them.

7. **[P2] scale/theory · 39.4–47.0 · ruler labels unreadable, and the ruler hides the French row and its 3.** "best",
   "worst" and "the old way" are size 16 (about 24 px on screen). Raise them to size 22. Make the ruler `h: 0.42` and
   move "the old way" into the kicker instead: change the theory kicker to `"The old way: 1 = best"` from `CUE.flipped`
   (keep "Where the myth comes from" until then). Covering French is acceptable, since it's not the subject here.

8. **[P2] loop seam · 61.35–64.2 · the board behind the clipping is green "ZURICH POLYTECHNIC autumn 1896", but grey
   "SCHOOL RECORD Einstein, A." at frame 0.** Add `{ at: CUE.headline - 0.35, id: "record" }` to `SIDES`. The flip is
   hidden behind the clipping's pop.

9. **[P2] kickers duplicate the board header** ("AARAU CERTIFICATE · 1896" over "AARAU CERTIFICATE 1896"; "ZURICH · 1895 ·
   AGE 16" over "ZURICH POLYTECHNIC age 16"). Make them add a fact: `"Entrance exam · 1895"` and
   `"Final grades · 1896"`. Or change the board subs to "entry exam" / "Doc. 28".

10. **[P2] aarau · 31.16 · "→ AARAU, 1895–96": "→" is not in glyphs.json**, so it renders as a space and the line looks
    indented. Either add U+2192 to `make-glyphs.py` for `cut`, or write `"AARAU, 1895–96"` at x 26.
    "one year, a small school" is size 22 (about 30 px). Raise it to 26.

11. **[P2] hook · 3.5–6.3 · "a real headline" (size 20) runs into the S of MATHEMATICS, and "ha!" is small.** Put the
    stamp-like note on its own line. Shift the four headline lines up 6 units (`72 + i * 30` → `66 + i * 29`), set
    "a real headline" to size 24 at `hv - 12`, and "ha!" to size 34.

12. **[P2] SOURCES.md · "born 1879, Ulm" on the SCHOOL RECORD face is not in the facts table.** Add a row (Isaacson
    covers it), or replace it with `"Princeton, 1935"`, which ties to the next beat.

13. **[P2] reply · 12.97–13.7 · "calculus before 15" (size 20) sits on the bubble's tail and border.** Move it inside the
    bubble: drop the "— Einstein, 1935" line once `calc` is true, and draw it at `(wv/2, 116)` size 26.

14. **[P2] art direction · whole reel · one locked shot.** Shots differ by ±3° yaw and 0.6 units of distance, so the
    mid-reel re-hook (the scale flip, about 43 s) has no camera event beyond a 5% punch. Give `scale` a real push-in on
    the ruler, `[B("scale") - 0.2, { look: [BOARD.x, 0.75, 0.42], dist: 5.6, pitch: 3, yaw: 0 }]`, then pull back on
    `school`. A hard cut (MOVE 0) at `CUE.flipped` would be the re-hook.

15. **[P2] theory · 40.8–47.0 · the source line still reads "Isaacson · Aarau certificate"** while the scale-flip theory
    (Open Culture / Ripley's) is on screen. `const src = t >= B("theory") && t < B("school") ? "Open Culture 2025 (B. Parker) · Ripley's 2024" : SOURCE;`

## Safe area / layout
HUD at y≈270 and kickers at 328–400 are fine. Captions stay within 1170–1410. The source line sits at about 1414–1440 and
fits on one line. The tiles' right edge reaches x≈930–940 below y 860 during `parts`/`cert` (yaw +3). The grades
themselves are centred at x≈870, so they're fine, but don't push yaw higher. No standee text goes above 250 or below 1440.
The lower 40% of the frame is plain wainscot, which is fine because it's under the platform UI.

## Sync
Board flips, kickers, "I never failed", FAIL on "fail.", ruler flip on "flipped", the rule card on "Out", "a list",
the circle on "failed.", ADMITTED on "in.", the 3 on "three." and the clipping on "headline?" all land within ±0.15 s.
The early grade reveals are in #6.
