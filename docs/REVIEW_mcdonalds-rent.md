# Review — RECEIPTS #003 mcdonalds-rent (producer self-review, 2 render passes)

Video `out/mcdonalds-rent.mp4`: 40.2 s · 6.0 cues/10 s · −14.5 LUFS · loop SSIM 0.87.

## Fixed
| Pass | Problem | Fix |
|---|---|---|
| 1 | 20 people in 4 rows ran under the "95%" | engine: >10 people → 2 rows of 10, smaller |
| 1 | "What franchisees pay" empty 2.5 s | "×2 ways franchisees pay" on "pay" |
| 1 | "Rent vs food" empty 1.5 s | rent bar fires on the first "rent" |
| 1 | Profit grid empty 3 s | fill starts on "profit," |
| — | ElevenLabs key revoked (401) | new key saved in the environment; `tts.py` no longer leaves an empty cache on failure |

## Accuracy
All figures in `SOURCES.md`. Comment risks: "rent vs food" compares revenues (labelled "food sales"); 56/80 % are
consolidated markets only ("often owns").

## Known limits
- 40 s (shortest so far). Remaining gaps 3.4–3.6 s: card animation and bar growth.
- Voice not checked by ear: "McDonald's", "fifty-six percent", "Big Mac".
