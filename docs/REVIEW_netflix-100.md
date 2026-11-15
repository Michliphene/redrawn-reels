# Review — RECEIPTS #002 netflix-100 (producer self-review, 2 render passes)

Video `out/netflix-100.mp4`: 43.3 s · 2.8 w/s · −14.2 LUFS · loop SSIM 0.86.

## Fixed
| Pass | Problem | Fix |
|---|---|---|
| 1 | Title on 3 lines touched the TV | title "Netflix: where $100 goes" (2 lines) |
| 1 | Costco bar ($4) too narrow, number cut | engine: a short bar puts its number beside the bar |
| 1 | "Why" scene empty ~3 s | first line fires on "show"; text sized to one line |
| — | 6-row legend would hit the captions | engine: 4–6 legend rows switch to two compact columns |

## Accuracy
All figures in `SOURCES.md`, grid sums to 100 by documented rounding. Biggest comment risk: "$36 goes to the shows"
(content amortization only; part of the $15 is content-related too). Mitigated by "only about" and the pinned comment.

## Known limits
- 43 s, shorter than #001 (46 s): under one minute (TikTok rewards question unchanged).
- Remaining gaps of 3–3.8 s are during the card animation and the "More members / Same shows" hold.
- Voice not checked by ear: "Netflix", "three hundred million".
- Costco comparison mixes fiscal years (labelled in SOURCES).
