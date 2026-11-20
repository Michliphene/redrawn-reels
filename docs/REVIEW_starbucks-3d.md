# REVIEW — RECEIPTS #008 "Inside a Starbucks cup" (raea) · pass 1

Video `raea/starbucks-3d/out/starbucks.mp4` (1080×1920, 42.23 s) · composition `raea/starbucks-3d/compositions/starbucks.tsx`
· timings `public/episodes/starbucks-10/timings.json` (same file as `compositions/timings.json`) · facts `SOURCES.md`.
Method: 56 frames pulled by hand with ffmpeg (hook 0–4 s, every ledger amount at word −0.1/+0.1 s, beat midpoints,
both camera moves, last 1.5 s vs frame 0). `raea check`: 0 errors, 49 reading warns (see end).

## Verdict
**Not yet postable — 7/10.** The cup-to-ledger idea works and the layout really is new after #006. All six ledger
amounts land on their spoken number. Safe area is clean. The figures match the 10-K table. One P1: the closing
beat lights the wrong layers while the voice says the line the reel is built for.

Three biggest problems:
1. **Point beat lights the wrong layers.** For "Running the coffeehouse costs almost" (37.77–39.62) the screen
   still lights only the $3.23 cup layer and dims the three coffeehouse layers. They light up only on "half."
2. **Caption breaks split sentences or change the meaning:** "REST GO? LET'S", "THIRD. RUNNING", "RENT ON THE",
   and "STARBUCKS ON TOP." (the hidden 97¢ glues "Starbucks" to "on top", which reads as "Starbucks wins").
3. **The payoff is flat.** The 97¢ row (27.78) is the same size as the five cost rows. During the camera move back
   (35.5–36.2) the whole ledger fades in on top of the moving cup.

## Sync table (ledger amount vs spoken number)
| row | spoken | on screen | Δ |
|---|---|---|---|
| hook 97¢ label + lid pop | 2.78 | 2.78 (tiny at 2.80, full ≈3.0) | 0 ✓ |
| $3.23 | 11.08 | absent at 11.00, on at 11.15 | 0 ✓ |
| $2.69 | 14.27 | absent at 14.20, on at 14.35 | 0 ✓ |
| 80¢ | 17.00 | absent at 16.95, on at 17.10 | 0 ✓ |
| $1.05 (+ layer colour) | 18.18 | on at 18.25 | 0 ✓ |
| $1.26 (+ layer colour) | 22.41 | on at 22.50 | 0 ✓ |
| 97¢ ledger | 27.78 | absent at 27.70, on at 27.85 | 0 ✓ |
| field wave | 32.31 ("$3.7B") | first cup lit at 32.40, wave done ≈32.9 | ✓ |
| point "cup" / "coffeehouse" | 36.21 / 38.18 | lit at 36.94 / 39.62 | **+0.7 s / +1.4 s ✗** |

Loop: frame 42.2 matches frame 0 (same camera, lid on, $10, title, no caption) ✓. "Next time you pay…" goes
straight into "You pay Starbucks $10" ✓.
Accuracy: 3.23 / 2.69 / 0.80 / 1.05 / 1.26 / 0.97 = plain rounding of SOURCES.md, sum 10.00 ✓. Labels match the
derivation column ✓. FY2026 on screen ✓. "our calc." on screen for the whole reel ✓.
Safe area: series bar at y 250, ledger top row ≥ y 410, captions at y 1185–1270, source line ends ≈ y 1405,
no text right of x 930 ✓.

## Fix list (all edits in `starbucks.tsx`)

1. **[P1] point · 37.77–39.62 · coffeehouse layers dimmed while the voice names them.** Start the two emphasis
   states on the words that name them. Keep the sfx stamp on "half.".
   ```ts
   // l.124
   const THIRD_AT = w("point", "cup"), HALF_AT = w("point", "coffeehouse");
   const HALF_WORD = w("point", "half.");
   // l.365 sfx: [THIRD_AT, "pop", 0.45], [HALF_WORD, "stamp", 0.5]
   ```
2. **[P2] all beats · captions.** Sentences split badly, and the words on each side of a hidden figure run
   together. Rebuild `PHRASES` (l.324–340). The captions block has room for 2 lines: 2×79 px from y 1185 ends at
   y 1347, still above the source line at 1372.
   ```ts
   const BREAK_AFTER = new Set(["store:apps", "point:cup"]);
   for (const x of b.words as Word[]) {
     const bare = x.w.replace(/[.,…:?]$/, "");
     if (HIDE.has(`${b.id}:${bare}`)) { if (cur.length) { out.push(cur); cur = []; len = 0; } continue; }
     if (cur.length && len + x.w.length > 34) { out.push(cur); cur = []; len = 0; }
     cur.push(x); len += x.w.length + 1;
     if (/[.?…]$/.test(x.w) || (/[,:]$/.test(x.w) && len > 12) || BREAK_AFTER.has(`${b.id}:${bare}`)) { out.push(cur); cur = []; len = 0; }
   }
   ```
   Result: "So where does the rest go?" / "Let's pour it out." / "That leaves Starbucks" / "on top." /
   "So what's in your cup" / "is about a third." / "Running the coffeehouse costs" / "almost half." This also
   clears most of the 49 reading warns.
3. **[P2] point · 35.5–36.2 · ledger and tag fade in over the cup while the camera is still moving.** The move
   ends at `B("point") + 0.7`, so wait for it. In `Ledger` (l.240) and `tagO` (l.286), change `B("point") + 0.2`
   to `B("point") + 0.75`.
4. **[P2] rent/office · 15.7–17.0 and later · a label reads as part of the wrong row.** "RENT" shows alone right
   above "$2.69", so it reads "RENT $2.69". Group each row by colour and give rows more space:
   ```ts
   const ROW_GAP = 124;                       // l.238 (6 rows still fit 452–1110)
   // l.264 label:
   <div style={{ ...mono(27, L.color), letterSpacing: "0.03em", marginTop: 6, whiteSpace: "nowrap" }}>{L.label}</div>
   ```
   This also fixes the label size (25 px is under the 28 px floor). At 27 px and 0.03em, "OFFICE, GEAR,
   CLOSURES" is about 374 px wide and still stops before the hairline at x 470.
5. **[P2] keep · 27.78 · the payoff has no weight.** Make the 97¢ row bigger than the cost rows and give the foam
   a short glow:
   ```ts
   // l.262–263
   <div style={abs(SAFE.left, y - (L.keep ? 76 : 56), …)}>
     <div style={{ ...display(L.keep ? 92 : 66, L.color), …, height: L.keep ? 86 : 64 }}>{L.amount}</div>
   // l.157 add to e for the keep layer: + (L.keep ? 1.2 * Math.sin(Math.PI * ramp(t, L.amountAt, 0.6)) : 0)
   ```
   The top row then starts at about y 376, under the tag line (330–358). That still clears the y 250 limit.
6. **[P3] rent · 16.2 · "COFFEEHOUSE:" lights up in lime, the profit colour, in the rent beat.** Limit that
   keyword to the point beat (l.350):
   `const k = x.w.replace(/[.,…:?]$/, "").toLowerCase(); const hot = KEYWORDS.includes(k) && (k !== "coffeehouse" || x.start >= B("point"));`
   Optional: colour "third" `P.amber` to tie it to the $3.23 layer.
7. **[P3] cup · 7.2–11.08 · 3.9 s with no change on screen** apart from the caption. Show the cup label one word
   at a time on the spoken words (`w("cup","cup,")`, `"milk,"`, `"beans,"`, `"food,"`), with opacity ramps of
   0.15 s.
8. **[P3] year · 29.7–32.3 · 2.6 s of a still field before the wave.** Add a slow push-in to the year shot. For
   example, add a second shot `shot(B("year") + 1.2, [YEAR_X, 0.6, -1.0], -18, 32, 21, 32)` after the year shot
   in `SHOTS`.
9. **[P3] loop · 40.8–41.5 · the title fades in over the cup shell as it comes down** (frame 41.2). l.279: change
   `ramp(t, DUR - 1.3, 0.35)` to `ramp(t, DUR - 0.95, 0.3)`. The title is then fully on about 0.65 s before the
   end, and the last frame still matches frame 0.
10. **[P3] beats open→keep · "$10" is on screen twice.** The tag "where your $10 goes" and the source line
    "per $10" are both visible, which breaks the one-figure-once rule. l.311: change the tag to
    `where your money goes`.
11. **[P3] hook · 1.26 · the big $10 does not react when "$10" is spoken.** Give it the same `outBack` pop as
    the ledger amounts at `w("hook","$10.")`. Frame 0 does not change.
12. **[P3] all · source line at 26 px**, under the 28 px floor. Use mono 28 with `letterSpacing: "0.02em"`. It
    still fits on one line inside x 930.

## raea check warns (49)
- 47 are caption chunks shown for less than 1.0 s ("So", "where", "cup,"…). This is the word-by-word caption
  style, so they are acceptable. Fix 2 removes most of them.
- 1 says the source line is on for 1.8 s at frames 0–1, with the text cut off ("…per $10: o"). This is a false
  alarm: frames show the line in full and on screen from 0 to 42.2 s.
- The rest are on single label words. Fix 4 (27 px) covers them.
