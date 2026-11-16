# Review — RECEIPTS #001 costco-hotdog (producer self-review, 3 render passes)

Video `out/costco-hotdog.mp4`: 46.1 s · 118 words · 2.81 w/s · −14.2 LUFS · hook 3.5 s · 5.6 cues/10 s · loop SSIM 0.87.
Not yet run through the `reel-reviewer` / `virality-reviewer` agents (their prompts are written for the map engine).

## Accuracy
- All figures match `SOURCES.md`; both subtotals reproduce from the line items.
- **Open:** the 10-K itself was not read (SEC blocked from the cloud). Owner ticks 7 lines before posting.
- "$5.8B left from selling" is our computation (operating income − fees). Flagged in the pinned comment.
- No claim that the hot dog loses money. Loop says "helps explain", not "is why".

## Fixed across passes
| Pass | Problem | Fix |
|---|---|---|
| 1 | Hook: 3.9 s with nothing new | price and tag pulse on "$1.50" and "1985" |
| 1 | 4 s plateau after the $9 fill | empty squares blink on "What's left?" |
| 1 | 3.4 s tail after "$5.9B" | sentence reordered: "Last fiscal year, 84 million members paid $5.9 billion in fees." |
| 1 | Empty stage at start of the $6B beat | "$297B in sales" headline at beat start |
| 2 | "Fees ≈ half" callout lingered into the renewal scene | callouts now cut at scene end (engine rule) |
| 2 | "$297B" label wrapped on two lines | single line |

## Known limits
- The three "gaps" the metric still reports (3.5 / 3.1 / 3.0 s) are during the progressive grid fill and bar growth:
  the screen is moving, but no new cue fires. Acceptable; a counter rolling next to the grid would close them.
- Voice not checked by ear (cloud session). Listen once: "Costco", "five point nine billion".
- 46 s: under the one-minute length reportedly required for TikTok Creator Rewards.
- Frame 0 has a 12 % punch-in that the last frame lacks (SSIM 0.87). Fine in practice; remove the punch if the seam shows.
- Music is the same procedural bed as REDRAWN. A distinct bed would separate the two accounts better.
- Bars: $5.8B vs $5.9B look almost equal. That is the honest picture; the callout carries the point.

## English
Short present-tense sentences. "Last fiscal year" is precise but slightly formal; kept for accuracy.

## Licences
Nothing third-party on screen. "Costco" as a word only.
