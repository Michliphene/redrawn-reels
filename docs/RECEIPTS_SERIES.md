# RECEIPTS — series bible (3rd account, "where the money goes")

**Working name:** RECEIPTS (owner can rename: it is only the `series` field of `episode.json`).
**Tagline (bio):** "Follow the money in under a minute. Every number from the filing."
**Format:** 1080×1920 · 30 fps · 45–60 s · EN voice-over · word-by-word captions · no photos, no logos.
**Engine:** `src/money/Money.tsx` (composition `Money`), selected by `"composition": "Money"` in `episode.json`.
Same pipeline as REDRAWN: `pipeline/render.sh <id>` → `out/<id>.mp4`.

## Why this theme (benchmark, Nov 2026 — vendor blogs, indicative only)
- Finance/business is the best-paid short-form niche (claimed ≈ $0.40–1.00 per 1,000 qualified views vs $0.40–0.60 entertainment).
- Educational faceless posts are claimed to get 12–25 % saves vs 3–8 % for entertainment.
- Unlimited topics, each with one primary source (annual report), so "every number sourced" is cheap to keep.
- **Open question:** TikTok Creator Rewards reportedly needs videos > 60 s. Not confirmed on TikTok's own pages.
  #001 is 46 s. Decide per account whether to target 61–70 s.

## Lessons carried over from REDRAWN
| REDRAWN pain | RECEIPTS rule |
|---|---|
| Archive photos: rate limits, BY-SA, credits | Everything is drawn in code. No photo, no logo, brand names as text only. |
| Disputed borders and dates | One primary source per episode; subtotals must reproduce from line items (see SOURCES.md "Check"). |
| 3–5 review passes for overlapping overlays | Fixed zones: TOP 60–330 · STAGE 350–1340 · CAPTIONS 1390–1600 · SOURCE 1660. One scene at a time. |
| Overlays lingering into the next idea | Callouts are cut automatically when their scene ends. |
| Hooks of 4–5 s, 3–4 s with nothing new | Number on frame 0; run `virality_metrics.py` and fix any gap > 3 s before review. |
| Name pronunciation | Number-led scripts; `{$5.9B|five point nine billion dollars}` markup for every figure. |

## Editorial rules
1. Every figure on screen is in the episode's `SOURCES.md`, with its derivation if computed.
2. A computed figure is labelled as ours in the pinned comment ("our calculation").
3. Never claim a company loses money on a product unless the company disclosed it.
4. Causes are stated softly ("helps explain"), as in REDRAWN.
5. Fiscal year always named on screen. Re-check figures when a new annual report is out.
6. Not financial advice: no "buy/sell", no price targets.

## Cue language (`episode.json`)
- Top level: `composition`, `series`, `episode`, `title` (shown on the hook and on the loop tail), `source` (footer),
  `voice`, `scenes` {id: {type, …}}, `beats`.
- Beat: `id`, `say`, optional `scene` (switch scene; a scene keeps its state when revisited), `kicker` (top headline).
- Scene types and their actions (all accept `atWord`):
  - `product` {price, tag}: `pulse` {target: price|tag}, `ghost` {text, label, hold} (red sticker).
  - `grid` (100 squares = $100): `fill` {count, color, amount, label, dur}, `hint`, `rest` {color, amount, label}.
  - `bars` {max}: `big` {value, label}, `bar` {label, value, color, decimals, prefix, suffix}. Max 2 bars.
  - `card` {cardTitle, cardSub}: `stat` {value, label, sub}. Max 2 stats.
  - `people` {total}: `light` {count, big, label, sub}.
  - `lines`: `line` {small, text, size, color, strike}. Max 2 lines.
  - any scene: `callout` {text, size, hold, y} in the slot at the bottom of the stage.
- Art available: hot dog. A new product = one new SVG component in `Money.tsx` (+ `art` key).

## Topic backlog (each = one filing, one surprising split)
| # | Title | Hook | Source |
|---|---|---|---|
| 001 | Why this hot dog is still $1.50 | "This hot dog has cost $1.50 since 1985." | Costco 10-K — **produced** |
| 002 | Where your $20 Netflix goes | "Most of this never reaches a film set." (verify) | Netflix 10-K |
| 003 | Why McDonald's is a landlord | "McDonald's biggest earner isn't burgers." (verify: franchised rent vs company restaurants) | McDonald's 10-K |
| 004 | Who makes money on a $1,000 iPhone | "Apple keeps about … of this." (gross margin, verify) | Apple 10-K |
| 005 | Where your airline ticket goes | "The airline keeps a few dollars of this." (verify) | Delta/United 10-K, A4A |
| 006 | Why airlines are really banks | loyalty programme income vs flying (verify) | Delta 10-K |
| 007 | Where $100 at Amazon goes | AWS share of operating income (verify) | Amazon 10-K |
| 008 | What a $5 latte really pays for | store costs split (verify) | Starbucks 10-K |
Hooks containing a claim are drafts: verify at scripting time, drop the angle if the filing does not support it.
