# UNGRADED — series bible

**What it is:** one rule school never taught, in under a minute. Mindset / career ideas told as a small world the
viewer can watch change. On-screen name, handle and tagline live in `public/studio.json` (`ungraded`); the name is a
working title, rename it there.

**Length:** every reel runs more than one minute (62–75 s of voice), owner's rule since 18 Nov 2026.

**Engine:** `composition: "Mindset"` → `src/mindset/Mindset3D.tsx`. DA 2 only (there is no flat DA 1 version, so a
machine without WebGL fails instead of publishing a degraded reel). Palette: night violet, mint accent (`#5CF0D0`)
for what works / lessons, coral (`#FF5A6E`) for mistakes and grades.

## Honesty rules (on top of CLAUDE.md)
- An idea is shown as an idea. A number on screen is either sourced (`SOURCES.md`) or obviously illustrative
  (a tower of ten cubes, a grade letter) and listed as illustrative in the facts table.
- No promise of money, income or success as a consequence of a habit unless a source supports it (survivorship
  bias). Prefer "teaches", "tells you", "gets expensive" to "makes you rich".
- Hypotheticals are labelled on screen (kicker "Picture this"); real examples are labelled ("A real one") and sourced.
- Inspired by someone else's video: rewrite the script entirely, own art direction, credit the idea in SOURCES.md.

## Scenes (stations of the one set) and their cues
| type | Station | Cues | Type above it |
|---|---|---|---|
| `stacks` | two towers on a slab (left / right) | `stack` {side, count, value, label, color:"ink", tall, lightValue, lightLabel} · `light` {side, dim} | value above each tower, label under it |
| `papers` | five test papers standing on a desk; `grades`, `gradeLabel` | `mark` (a ✗ on the next paper, grade drops) · `flip` (papers turn over in a wave, the camera rolls) · `clear` · `pass` | the grade letter |
| `lines` | type over another station (`over`: scene id), lightly dimmed | `line` {small, text, strike, color} | two statements, the first struck |
| `trials` | three pedestals | `launch` {outcome: flop / ignored / sale, label} · `learn` (a lesson cube floats over each) | outcome under each pedestal |
| `road` | twelve tiles and a pawn; the camera tracks the pawn | `walk` {to, dur} · `halt` (a wall + the reel's dolly zoom) · `big` {value, label, sub, dur} | the count-up |
`callout` works everywhere. Beats carry `scene` and `kicker` like RECEIPTS.

## Signature moves (one each per reel)
- **The flip** — the rules change: papers turn over to mint, the world tilts ~6°.
- **The dolly zoom** — the moment of stopping (`halt`).
- **The loop** — the reel opens and ends on the stacks station; frame 0 already shows the subject (`atTime` < 0).

## Backlog (ideas to verify before scripting)
- "You're not behind. You're on a different clock." — ages at which known founders/authors started (sourced list).
- "Being alone might be your edge" — careful: no health or income claims without a study.
- "Why the first draft is supposed to be bad" — a real example with a documented draft count.

## Episodes
| # | id | Format | Status |
|---|---|---|---|
| 001 | `fail-ten-times` (3D) · `fail-ten-times-doodle` (notebook) | D. myth-bust | rendered, reviewed |
| 002 | `first-draft` (notebook) | D. myth-bust, Rule Flip | rendered, reviewed |
| 003 | `planes-doodle` (notebook, younger audience) · alt. `planes-came-back` (blueprint) | A. explainer + C. counted game | rendered, 68.8 s / 67 s |

## Second art direction: the notebook (`composition: "Doodle"`, `src/doodle/`)
Ballpoint stick figures on squared paper; the reel is one long sheet, each scene a page the camera slides to
(`side` front/back, `slot` n), a spiral binding between pages. Signature moves: `flip` turns the page over (the rules
flip), the line "boils" every 3 frames like a flip-book, highlighter on keywords, sticky notes for callouts.
Fonts: house fonts + Caveat Bold (handwriting on the page, OFL, `public/fonts/Caveat-latin-700.woff2`).
| type | Page | Cues |
|---|---|---|
| `duel` | 10 plasters vs a guy holding an A+ | `shine` {side} · `light` {side, dim} (plasters → bulbs; A+ guy → "0" bubble) |
| `race` | runners on a progress line | `trip` (the hero falls, "falling behind?") |
| `class` | a student at a desk, a test on the wall | `mark` (red ✗, grade drops, the student slumps) · `flip` |
| `bin` | paper balls into a bin, a judge looking away | `ignore` (scribble over "mistakes") · `fly` (paper plane, the judge turns, ✓) |
| `shop` | an online store drawn as a browser window | `open` · `launch` {outcome} · `bulb` |
| `pile` | a hill of crumpled tries, a climber | `count` {value} · `walk` {to 0–1, dur} · `halt` (sits, punch-in) |
| `drafts` | a writer at a desk, a pile of crossed-out "The End" pages | `count` {value, label, sub} (up to two, side by side) |
| `versions` | three drafts side by side | `draft` {label, tone: messy/stiff/good} |
| `rule` | one card turned over (`front`/`back`, `frontSmall`/`backSmall`) | `turn` |
| `plane` | a doodled bomber, top view | `holes` {dur} · `patch` {part: wings/tail} (masking tape) · `circle` (red pen on the engines) · `ghost` (a plane that never came back) |
| `gym` | 1,024 students, a coin game | `spawn` · `rounds` {dur} · `winner` (the last one grows into a crowned figure) |
| `stage` | the winner gives a talk (`secret`, `secretSmall`, `crowdLabel`) | `secret` · `crowd` |
Labels of `duel` (`leftLabel`, `leftLit`, `rightLabel`, `rightDim`, `badge`, `bubble`, `leftProp: pages`) and `bin` (`binLabel`, `ignoreLabel`, `worksLabel`) are set in the scene def.
Episode: `fail-ten-times-doodle` (same voice as `fail-ten-times` via `audio`).

## Third art direction: the blueprint (`composition: "Blueprint"`, `src/blueprint/`)
Motion design on an engineering sheet: deep blue, cyan grid, white line work that draws itself, a 2D camera that
pushes in and out between areas (`scenes.<id>.at`, `zoom`, `look`; beat `camera` {x, y, zoom} for a push-in), and
transitions where one element becomes the next (the coin-flip winner turns into a plane). No figures, no 3D.
| type | Area | Cues |
|---|---|---|
| `plane` | a schematic bomber, top view | `draw` · `holes` {dur} · `armour` {part: wings/tail/body/engines} · `flip` · `ghost` · `missing` |
| `flips` | 1,024 dots, a coin-flip tournament | `spawn` · `rounds` {dur} · `winner` · `fly` · `reveal` |
Overlays usable in any blueprint scene: `tag`, `memo` {small, text}, `interview` {small, text}, `line` {small, text, color}, `ask`.
