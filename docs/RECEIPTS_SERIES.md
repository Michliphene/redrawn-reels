# RECEIPTS — series bible (3rd account, "where the money goes")

**Working name:** RECEIPTS (owner can rename: it is only the `series` field of `episode.json`).
**Tagline (bio):** "Follow the money in one minute. Every number from the filing."
**Format:** 1080×1920 · 30 fps · ≥ 60 s (voice 61–70 s) · EN voice-over · word-by-word captions · no photos, no logos.
**Engine:** composition `Money`, selected by `"composition": "Money"` in `episode.json`. `"da": 2` plays the cue sheet on
the 3D counter (`src/money/Money3D.tsx`, template `costco-hotdog-v2`); without `da` an episode keeps its flat DA 1 look
(`src/money/Money.tsx`). Shared art direction rules: `docs/STUDIO.md`. Series id in `public/studio.json`: `receipts`.
Same pipeline as REDRAWN: `pipeline/render.sh <id>` → `out/<id>.mp4`.

## Why this theme (benchmark, Nov 2026 — vendor blogs, indicative only)
- Finance/business is the best-paid short-form niche (claimed ≈ $0.40–1.00 per 1,000 qualified views vs $0.40–0.60 entertainment).
- Educational faceless posts are claimed to get 12–25 % saves vs 3–8 % for entertainment.
- Unlimited topics, each with one primary source (annual report), so "every number sourced" is cheap to keep.
- **Length (decided):** every new reel lasts at least 60 s (voice 61–70 s). TikTok Creator Rewards reportedly needs videos > 60 s (not confirmed on TikTok's own pages). #001–#005 predate the rule and stay as published.

## Lessons carried over from REDRAWN
| REDRAWN pain | RECEIPTS rule |
|---|---|
| Archive photos: rate limits, BY-SA, credits | Everything is drawn in code. No photo, no logo, brand names as text only. |
| Disputed borders and dates | One primary source per episode; subtotals must reproduce from line items (see SOURCES.md "Check"). |
| 3–5 review passes for overlapping overlays | Fixed bands, one scene at a time. DA 1: TOP 60–330 · STAGE 350–1340 · CAPTIONS 1390–1600 · SOURCE 1660. DA 2 (inside the platform safe area): HUD 250–304 · TITLE 318–600 · STAGE 560–1130 · CAPTIONS 1170–1410 · SOURCE 1416. |
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
- Art available: `hotdog` (default), `burger`, `tv`, `plane` (desk model on a stand, no livery). DA 2: a new product = one low-poly model in `src/money/props3d.tsx`
  (primitives only) + its key in `PRODUCTS`; DA 1: one SVG component in `Money.tsx`. Select with `"art": "<key>"`.
- DA 2 extras: `keywords` (caption words to highlight; figures highlight themselves), `whisper` (quiet line under the
  title), `scenes.<id>.camera` {pitch, yaw, fov} to override a station's angle, `audio` to reuse a voice.

## DA 2 — the counter
One continuous set. Each scene is a station on a counter and the camera travels between them; `lines` scenes are
played over the dimmed product, so the reel ends where it started and the loop is a camera return.
| Scene | In the world | Read above it |
|---|---|---|
| `product` | the object on a plinth, coins and a receipt beside it | price, tag, `ghost` sticker |
| `grid` | 100 tiles; `fill` raises coloured stacks, `rest` makes what is left glow | legend rows (amount + label) |
| `bars` | two columns rising | `big` headline, value above each bar, name under it |
| `card` | a card standing on the counter | two `stat` blocks |
| `people` | pawns; `light` turns `count` of them to the accent colour | the ratio |
| `lines` | the product, dimmed | two statements, the first struck through |
The source line never leaves the screen (bottom of the caption band, y 1416).

## Topic backlog (each = one filing, one surprising split)
| # | Title | Hook | Source |
|---|---|---|---|
| 001 | Why this hot dog is still $1.50 | "This hot dog has cost $1.50 since 1985." | Costco 10-K — **produced** |
| 002 | Netflix: where $100 goes | "Of every $100 you pay Netflix, only about $36 goes to the shows." | Netflix 10-K — **produced** |
| 003 | McDonald's is a landlord | "McDonald's collected $10.4 billion in rent last year." | McDonald's 10-K — **produced** |
| 004 | The iPhone is a storefront | "Spend $1,000 on Apple devices, and about $390 is left once they're built." | Apple 10-K FY2026 — **produced** (DA 2) |
| 005 | Delta's $8.2B check isn't a ticket | "Delta got $8.2 billion last year. Not from your ticket. From your credit card." | Delta 10-K FY2025 (+ Amex 10-K) — **produced** (`delta-amex`) |
| 006 | Where your airline ticket goes | "The airline keeps about $9 of every $100." (Delta FY2025: 9.2 % operating margin — reuse `delta-amex` facts) | Delta/United 10-K, A4A |
| 007 | Where $100 at Amazon goes | AWS share of operating income (verify) | Amazon 10-K |
| 008 | What a $5 latte really pays for | store costs split (verify) | Starbucks 10-K |
| 009 | The fee is the business (Live Nation) | ticketing ≈ $3.1B revenue, ≈ $1.1B AOI vs concerts $20.9B revenue, $0.7B AOI (FY2025, verify; AOI is non-GAAP; open DOJ case → neutral wording) | Live Nation 10-K FY2025 |
Hooks containing a claim are drafts: verify at scripting time, drop the angle if the filing does not support it.

## Formats beyond the explainer (see `docs/STUDIO.md` §6)
| # | Format | Draft hook (verify against the filing) |
|---|---|---|
| C1 | Guess before the count ends | "Of every $100, how much reaches the shows? Lock your guess." (Netflix) |
| E1 | One object | "Follow one $1.50 hot dog through the checkout." (Costco, produced as an explainer) |
| B1 | You are… | "You run a burger chain. Your biggest cheque is rent." (McDonald's — same filing as #003; re-check the split before scripting) |
