# REVIEW — RECEIPTS #006 raea render (`raea/chipotle-3d/out/chipotle.mp4`, 41.4 s)

**Verdict: not postable yet, but close. Score 7/10.** All figures match `SOURCES.md` and add up to $10.00, and "our calc."
is on screen. Most of the old review (`docs/REVIEW_chipotle-10.md`) is now covered. The hook caption is fixed, the
three-times `$1.62` is gone, the point card now compares $2.96 with $5.42, and there is a crane-in plus a re-hook. What is
left is mostly layout: the source line wraps below y=1440, two labels collide at the payoff, and the burrito overlaps the whisper.

Checked by hand (review_frames.py crashes on Windows): frames at 0, 0.5, 1, 2, 3, 3.8, 4.5, 6, 9 … 41.3 s, crops at
3.8 / 22.5 / 27.2 / 30.5 s, and every word time in `timings.json`.

## 3 biggest problems
1. **Source line wraps to two lines and the second line sits at y ≈ 1460–1470**, below the safe limit of 1440 (P1).
2. **At the payoff (26.8–28 s) "DELIVERY, ADS, CARD FEES" and "PROFIT, BEFORE TAX" print on top of each other**, and
   the store/office amounts show 1.1–1.5 s after the voice says them, while the meter has already dropped (P1).
3. **The burrito covers the whisper line "every cent from the 2025 annual report" from about 3.0 s**, and the first
   caption reads "YOU PAY CHIPOTLE THE" (P1).

## Findings
1. **[P1] Overlay · whole reel · source line (line 382) wraps and its second line falls under y=1440.** It is 24 px
   mono in a 866 px box. The second line ("$10: OUR CALC.") sits at y ≈ 1465. Shorten it and raise it:
   ```tsx
   <div style={abs(SAFE.left, 1372, { ...mono(26, P.muted), letterSpacing: "0.04em", width: SAFE.railX - SAFE.left, whiteSpace: "nowrap" })}>10-K FY2025 (SEC) · per $10: our calc.</div>
   ```
   26 px keeps "CHIPOTLE 10-K, FY2025" on one line, ends near y=1405, and sits clear of the captions (max two lines, bottom
   ≈ 1345). Keep "Chipotle" in the line if it fits: `Chipotle 10-K FY2025 (SEC) · per $10: our calc.` at 26 px
   is about 46 characters × 17 px = 780 px, which fits.
2. **[P1] Hero · 3.0–4.4 s · the burrito overlaps the whisper line.** At 3.8 s the foil nose sits on
   "every cent from the 2025 annual report" (y ≈ 585). Two edits to chipotle.tsx:
   - Move the object down about 160 px: `const HERO = shot(0, [0.2, 0.4, 0.1], 24, 14, 19.5, 30);` (look y −0.45 → 0.4;
     at this distance 1 unit ≈ 184 px).
   - Move `$10` down so it does not touch the plinth ring: line 371 `abs(SAFE.left, 930, …)`.
   Fallback if the framing looks wrong: fade the whisper out earlier,
   `ramp(t, hookEnd - 1.2, 0.25)` for the whisper only, since it is the quiet line.
3. **[P1] Captions · 0.7–3.0 s · "YOU PAY CHIPOTLE THE" (dangling "The").** `HIDE` removes `$10.` before the phrase
   splitter sees its full stop, so the sentence break is lost and "The" joins the first phrase. In `PHRASES` (lines 393–397),
   flush on a hidden word that ends a sentence:
   ```tsx
   for (const x of b.words as Word[]) {
     const hidden = HIDE.has(`${b.id}:${x.w.replace(/[.,…]$/, "")}`);
     if (hidden) { if (/[.,…:?]$/.test(x.w) && cur.length) { out.push(cur); cur = []; len = 0; } continue; }
     … /* existing push / break logic */
   }
   ```
   The same fix prevents "THE CREW WHO MAKE" / "IT:" style orphans before a hidden amount.
4. **[P1] Cut · 26.8–28 s · the profit label collides with the store label.** At 27.2 s "DELIVERY, ADS, CARD FEES" (x
   ≈ 790–960 in the crop) overlaps "PROFIT, BEFORE TAX" (x ≈ 880–1000). The keep piece has no amount, so its label sits
   low, exactly where the store label sits. Put it above, shorten it, and move the store label up one lane:
   change the keep entry to `up: true, label: "profit, before tax"` and the store entry to `up: false` (unchanged).
   Rent (`up`) and office (`up`) are already above, so with keep above, the tops would crowd 92¢ (x ≈ 880–980).
   Better: give `keep` a centred label at `y = 1000`, under the meter: `up: false` plus `dx: -120`, or drop its label
   because the meter already says "CHIPOTLE KEEPS $1.62". Recommended: drop it (rule: no redundancy).
   ```tsx
   // PieceLabel: keep has no text
   if (p.keep) return null;
   ```
5. **[P1] Cut · store (17.25 s) and office (22.17 s) · amount appears late.** The voice says "$1.47" at 17.25 and "92¢" at
   22.17, and the meter drops then, but the pinned label only fades in at `nameAt` (18.73 "store:" and 23.32 "head"),
   1.5 s and 1.1 s later. At 22.5 s the meter reads $1.65 and no piece has an amount. Make the colour and amount follow
   the amount word for these two, and keep the name for the label text:
   ```tsx
   { id: "store", …, nameAt: w("store", "$1.47"), labelAt: w("store", "store:"), … }
   { id: "office", …, nameAt: w("office", "92¢"), labelAt: w("office", "head"), … }
   ```
   In `PieceLabel`, render the Mono `label` at `opacity: ramp(t, p.labelAt ?? p.nameAt, 0.2)`. The piece hop and
   colour then also land on the amount word (they use `nameAt`).
6. **[P2] Year · 31.2–33.7 s · the profit tower has a name but no number.** `$1.9B` is only in the caption, which
   leaves at about 31.7 s. At 32–34 s the tower reads "OPERATING PROFIT" with no value, the number having already
   gone. Pin the number on the tower and hide it from the caption (one figure, one place):
   ```tsx
   { at: w("year","$1.9B"), …, value: "$1.9B", label: "operating profit · 2025", … }   // YearLabels, at: w(...) not +0.9
   const HIDE = new Set([…, "year:$1.9B"]);
   ```
   Same for the revenue tower: it is not spoken, so keep `$11.9B`, but pop it with the tower (`at: w("year","Across") + 0.5`).
   Remove the `+ 40` x-offset on the profit label (it is off-centre from the slab).
7. **[P2] Year · 28.6 s · "4,000 restaurants" has nothing on screen.** Add a small Mono line under the `$11.9B` label,
   e.g. `revenue · 2025 · 4,000+ restaurants`, at `w("year","4,000")`. This is the only spoken fact in the beat without a visual.
   The source says "over 4,000".
8. **[P2] Hook · 0–1.27 s · frame 0 is weak.** At frame 0 there is a small burrito on the left, a title and a whisper,
   and no number. `$10` fades in at 0.35 s but the voice says it at 1.27 s (0.9 s early; sync is ±0.2 s). Either start
   `figO` at `w("hook","$10") - 0.05` and give frame 0 a bigger object (`OPEN` at 1.0 instead of 1.25 and the
   crane-in over 1.0 s), or keep the early `$10` as a deliberate hook and accept the sync. Recommended: bigger
   burrito at frame 0 (look at `OPEN.pos` scale 1.25 → 0.95) so the thumbnail is the burrito, and `$10` on the word.
9. **[P2] Loop · 38.6–41.35 s · the end does not match frame 0.** At 41.3 s the caption "TIME…" is still on screen
   (it lives to `end + 0.6` = 41.45 s, past the end), the green `$10` is half-faded, and the title only fades in over the
   last 0.5 s (the known reading warning). Frame 0 has no caption. Fixes:
   - Captions: `t < p[p.length-1].end + 0.6 && t < DUR - 0.5`.
   - Title: line 349, `ramp(t, DUR - 1.3, 0.35)` so it reads for about 1.2 s (the camera is already back at `DUR - 1.15`).
   - `$10` on "next time": it prints over the food tower at 39–40.5 s (lime on amber) with no meaning. Anchor it to the
     burrito that comes back: start it at `DUR - 1.15` only, left margin, y=930, in the same place as frame 0.
10. **[P2] Mono text is 24–25 px** (piece labels 25 px, meter label 30, source 24). Below the ~28 px guide. Raise piece
    labels to `mono(28)` and widen the box to 300; check "DELIVERY, ADS, CARD FEES" stays on two lines. The 42 raea
    reading warnings (words on screen <1 s in office / year / point) come from the labels that appear 0.2–0.9 s before the
    camera or the next beat takes over: findings 5, 6 and 9 remove most of them. Do not touch the rest; they are
    sub-second words in sentences that are on the captions anyway.
11. **[P3] Captions · 36.3 s · "RESTAURANT AROUND / IT"** orphan. Raise the phrase limit `len + x.w.length > 20` to
    `> 26` (keeps 84 px within the 866 px box: 26 × 0.5 × 84 ≈ 1090 would not fit, so use 22 and add "it" to the previous
    phrase explicitly, or lower the caption to 78 px).
12. **[P3] Point · 35–37 s · pieces fly through each other** when standing (red tilted on top of orange at 36 s).
    Stagger by 0.15 s (`(i - 1) * 0.25`) and raise the arc for the food (`pos[1] += Math.sin(Math.PI * stand) * 1.4` →
    `* (i === 0 ? 0.6 : 1.4)`).
13. **[P3] Keywords** `["food", "crew", "rent", …]` colour "food" lime in "FOOD? UNDER $3." and the piece also uses amber.
    The accent should mean keep: `KEYWORDS = ["keeps", "restaurant", "third", "twice"]`.

## Covered since the previous review
- Redundancy: hook, payoff and conclusion no longer repeat the caption (figures hidden through `HIDE`).
- "Let's cut it open" now cuts: the burrito is laid on the counter at 4.4 s, the seams flash and the pieces part at 6.23 s.
- Mid-reel re-hook: camera moves at open / keep / year / point; the year station is a full change of set.
- Pieces coloured on their name; loop: camera returns to the hero pose, and the orbit is stilled in the last second.
- Whisper at frame 0 is on screen (and at the end).

## Checked and fine
- Figures: 2.96 / 2.51 / 0.52 / 1.47 / 0.92 / 1.62 = 10.00; $11.9B, $1.9B, $5.42 ("our calc.") and 29.6 % band match SOURCES.
- Meter steps are right: 10.00 → 7.04 → 4.53 → 4.01 → 2.54 → 1.62.
- Safe area: header 250–440, towers' top label ≈ y 325 (OK), no readable text right of x=930 under y=860 in any frame.
- Profit-tower label: inside the safe area, lime, but see finding 6 (no number).
