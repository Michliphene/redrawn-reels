# REVIEW — delta-amex (RECEIPTS #005, DA 2, Money3D)

## Reel review

Reviewed `out/delta-amex.mp4` (44.2 s, 1080×1920, 30 fps). I used the `review_frames` sheets, my own frame grabs every 0.75 s
from 19 s to 44 s, close-ups at 4.3, 5.0, 8.6, 11.5, 38.2 and 42.2 s, and a guides still sheet (`out/stills/delta-amex/sheet.jpg`).
`npm run validate`: 0 ✗, 1 ! (the hook lasts 5.7 s, justified below).

**Verdict: 7/10. Not postable yet.** One safe-area P1 needs a one-line component fix, and the owner has to tick the
figures against the filings before posting. Sync is very good: every cue lands on its word within 0.1 s. The loop
match is clean (plane + $8.2B at both ends) and every on-screen figure matches SOURCES.md.

**Three biggest problems**
1. Hook: the red "TICKET" ghost sticker sits in the platform's right rail (x ≈ 700–1020, y ≈ 880–1060). The like and
   comment buttons cover its right third (P1). It also reads in the wrong order: "TICKET / not from your".
2. Overlaps: callouts hide other text. In `who`, the callout hides the "FROM ONE CREDIT CARD" tag but its right edge
   still peeks out. In `target`, the callout covers the stat subs "worldwide · 2025" and "Dec 31, 2025". In `point`,
   "A SWIPE" and "JUST A SEAT" sit on top of the dimmed plane.
3. Several on-screen texts are too small or anonymous: the bar labels are 22 px, the stat subs 20 px and the
   "revenue · fiscal 2025" label 24 px, all under the ~28 px floor. The card in the `both` scene is blank because
   `cardTitle` and `cardSub` are not drawn in DA 2, so the viewer never sees whose card it is.

**No `say` change is needed.** All the issues below can be fixed in the cue sheet or a component. The voice can stay.

### Fix list

1. **[P1] hook · 4.0–5.2 s · ghost sticker in the right-rail safe zone.**
   Component fix in `src/money/Money3D.tsx` `ProductOverlay`, ghost div: change `right: 1080 - SAFE.right` to
   `right: 1080 - SAFE.railX` (930, from `tokens.ts`). The sticker (~330 px wide) then spans x ≈ 600–930 and clears the
   `$8.2B` (which ends at x ≈ 450). Check it with a guides still at 4.4 s.
2. **[P1, owner gate] whole reel · figures not read from the filings.** SOURCES.md "Verification status" says the
   10-Ks were not opened. Before posting, the owner ticks these against the filings: $8.2B, $63.4B, $5.8B, $57.5B,
   13 % and 21 %. This is not a render fix.
3. **[P2] hook · 4.0 s · the ghost reads "TICKET — NOT FROM YOUR", and it stays into "From your credit card".**
   ```json
   {"type":"ghost","text":"TICKET","label":"NOT THE SOURCE","atWord":"ticket.","hold":0.8}
   ```
4. **[P2] who · 8.1–9.9 s · the callout covers the tag but is ~20 px narrower, so a sliver of the white pill shows on
   the right (x ≈ 680).** A longer text makes it fully cover the tag:
   ```json
   {"type":"callout","text":"AMEX BUYS YOUR SKYMILES FROM DELTA","atWord":"miles","hold":1.8,"size":48}
   ```
   A cleaner component alternative: in `ProductOverlay`, fade the tag to 0 while a callout is live on the product scene.
5. **[P2] target · 37.4–39.25 s · the "NEXT TARGET" callout (y = 1082) covers the stat subs (y ≈ 1070–1095).** Move it
   into the empty title block under the kicker. Also cue it on the number rather than on "aiming", which lands
   ~0.6 s before "$10B" is spoken. And "NEXT" suggests 2026, but SOURCES gives ~$9B guidance for 2026 and $10B as a
   long-term target, so drop "NEXT":
   ```json
   {"type":"callout","text":"TARGET: $10B A YEAR","atWord":"$10B","hold":1.8,"size":50,"y":450}
   ```
6. **[P2] point · 40.9–42.3 s · the struck "JUST A SEAT" and "A SWIPE" are set over the plane fuselage.** In
   `Money3D.tsx` `frameOf` case `'lines'`, change the product rect from `top: 700, bottom: 1120` to
   `top: 930, bottom: 1150`. The hero plane then sits under the two lines (which end at y ≈ 930) instead of behind them.
   Optional: also raise the `dim` strength for lines scenes from ~0.5 to 0.7.
7. **[P2] point · 41.85 s · "TO DELTA, YOU ARE" is printed twice.** Set `"small": ""` on the second `line` action
   (the "A SWIPE" one).
8. **[P2] both · 28.9–36.4 s · the card is blank, so the viewer cannot tell it is the Delta Amex card.** The DA 2 card
   prop ignores `cardTitle` / `cardSub`; only flat `Money.tsx:184` draws them. Component fix: in `CardOverlay`, pin
   `def.cardTitle` (Display 44, ink on the lime stripe) and `def.cardSub` (Mono 28) to the card face via `toPx`.
   This follows STUDIO §2 (text pinned to the object, not floating).
9. **[P2] year / twist / both · 19–36 s · text under 28 px.** In `Money3D.tsx`: bar `label` Mono 22 → 28 (width 270 → 320);
   `big` label 24 → 28; `Stat` `sub` 20 → 26. If the subs get dropped, the year is still on screen in the source line.
10. **[P2] whole reel · too many accent words.** "AMERICAN" turns lime but "EXPRESS" does not (half a name in accent,
    25.4 s), and "AMEX" is accented every time. STUDIO §4 limits the accent to keywords and the number that matters.
    ```json
    "keywords": ["credit", "card", "swipe", "miles", "profit"]
    ```
11. **[P2] accuracy · hook and loop tag "FROM ONE CREDIT CARD · 2025".** The $8.2B is the whole Amex co-brand
    partnership: several card tiers plus lounge and marketing elements (SOURCES "Accounting"). "One credit card" is
    loose. Suggested: `"tag": "PAID BY AMEX · 2025"`. Or keep the wording and treat it as the brand-level "Delta card";
    the owner decides.
12. **[P3] hook · the ! for 5.7 s is justified.** The stake ($8.2B, lime, 214 px) is on screen from frame 0, is
    spoken at 0.85 s, and the first sentence ends ~2.5 s. Do not cut the voice.
13. **[P3] hook · frame 0 · the camera starts wide.** The receipt and coins are clipped at the right edge (x ≈ 1040+),
    and the plane is fairly small for the opening shot. Suggestion: start the product shot tighter, e.g. in `scenes.plane`
    `"pitch": 14, "yaw": 24` (if the station honours overrides), so the plane fills x 450–930.
14. **[P3] hundred · 10.2–12.7 s · 2.5 s of a dim, empty grid.** It is acceptable because the kicker "WHERE $100 GOES"
    is new. A `hint` at "$100" would blink the grid, but `GridOverlay` uses `acts.find('hint')`, so a second hint would
    break the `keep` blink. That needs a component change (use the latest hint ≤ t) before cueing it.
15. **[P3] target · 36.7–39.3 s · the $10B target is a floating label, not shown in the world.** Better: a third, ghosted
    "$10B target" bar in the bars scene. This needs `BarsOverlay` / station support for 3 slots, so it is not a blocker.
16. **[P3] tooling · `review_frames.py`.** `drawtext` chokes on `%` ("Stray %"), so `beat_05_year.jpg` was not written
    and some start frames in the beat 03/04 sheets were stale. Escape `%` as `\%` in `text`. The video frames themselves
    are fine.

### Checked and OK
- **Sync:** each cue lands on its word:
  - `$8.2B` 0.85 s; `$91` fill 13.37 s; `$9` rest 18.04 s; `$5.8B` bar 20.20 s (count-up lands on the word); `$8.2B` bar 25.39 s
  - `13%` 31.17 s; `21%` 34.05 s; `seat.` 40.98 s; `swipe.` 41.85 s
- **Accuracy:** each on-screen figure matches the SOURCES facts table:
  - $57.5B costs, $63.4B revenue, $5.8B operating profit, $91 / $9 per $100
  - 13 % billed business, 21 % loans
  - "THE CARD > THE WHOLE PROFIT" holds against operating income, pre-tax and net income
- **Safe area:** apart from #1, nothing readable is above 250 or below 1440. The source line sits at y ≈ 1426,
  ends at x ≈ 880, and stays on screen for the whole reel.
- **Bands:** apart from #4 and #5, captions (1170–1410) are never covered.
- **Re-hooks:** cuts at 19.1 (bars), 28.9 (card) and 39.6 (point) s; the twist bar overtaking the profit bar is the
  mid-reel payoff.
- **Loop:** at 42.6 s the reel cuts back to the hook's plane and `$8.2B` while the title fades in, so "Which is how…"
  flows into "Delta got $8.2B".

## Fixes applied (render 3, 18 Nov 2026)
Voice unchanged (no `say` edit). Reel 44.2 s · 1080×1920 · 30 fps · −14.2 LUFS · loop SSIM 0.82.

| From | Fix | Status |
|---|---|---|
| virality · fact flag | title "Delta's biggest check…" → **"Delta's $8.2B check isn't a ticket"** (no source says Amex is the single largest payer) | done |
| reel P1 | ghost sticker kept left of the action column: opt-in `scenes.<id>.ghostSafe` in `Money3D.tsx` (published DA 2 episodes unchanged); label "NOT THE SOURCE", hold 0.8 | done |
| reel P2 | tag "PAID BY AMEX · 2025"; `who` callout "AMEX BUYS YOUR SKYMILES FROM DELTA" covers the tag | done |
| reel P2 | `target` callout "TARGET: $10B A YEAR" at `$10B`, y 450 (no longer over the stat sub-lines; "NEXT" dropped) | done |
| reel P2 | `point`: plane framed lower (`scenes.point.rect` {top 930, bottom 1150}, new generic override); 2nd line without the repeated small line | done |
| reel P2 | DA 2 card prints its title (opt-in `cardText`) → "SKYMILES" | done |
| reel P2 | keywords `credit, card, swipe, miles, profit` (no half-highlighted "American Express") | done |
| virality #1 | gap fillers: "EACH SQUARE = $1 OF REVENUE", "OPERATING INCOME · FISCAL 2025", "≈ 1 IN 5 DOLLARS AMEX LENDS" | done — longest gap 3.2 s (was 5.2) |
| virality #2 | computed $91 / $9 labelled "(our calc.)" on screen | done |
| virality #3 | frame-0 crane recrop + whisper from frame 0 (loop SSIM ≥ 0.85) | **not done**: engine-wide change to the opening crane, affects every DA 2 RECEIPTS reel → candidate for the next kit pass |
| reel P2 | small type (bar labels 22 px, stat subs 20 px) | **not done**: shared component sizes, would alter published DA 2 reels; next kit pass |
| tooling | `pipeline/review_frames.py` broke on `%`/`,` in captions | fixed (escaping) |
| pre-flight `!` | hook beat 5.7 s | accepted: $8.2B on frame 0, spoken at 0.85 s, first sentence ends ≈ 2.5 s |

**Still blocking a post:** the owner ticks $8.2B, $63.4B, $5.8B, $57.5B (Delta 10-K FY2025) and 13 % / 21 % (Amex 10-K 2025).
