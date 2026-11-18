# RECEIPTS #004 "The iPhone is a storefront", raea edition: virality pass 1

Video: `raea/apple-iphone-3d/out/storefront.mp4` (42.4 s, -15.0 LUFS). Voice, timings and figures are those of `apple-iphone`.
Pattern-based estimate, not a prediction. Account size and the first test cohort matter more than anything scored here.

## Evidence (measured)
Metrics script copied to the scratchpad and pointed at the raea mp4 (`/tmp/claude-0/-home-user-redrawn-reels/336048a7-d772-5458-adb8-4481f595dbb7/scratchpad/vm/`: `hooks.jpg` for 0/0.5/1/1.5/2/3 s, `loop.jpg`, `b1.jpg`, `b2.jpg`).
- 42.4 s, 114 words, about 2.9 w/s, first word 0.25 s, hook sentence 5.4 s. Pixel-level scene cuts: 0 (a continuous camera, by design).
- Loop: SSIM first frame vs frame at -0.1 s = **0.981** (vs 0.848 for the Remotion version). At -0.5 s it is still 0.896, so the camera and awning are already returning.
- Cue timeline (from `storefront.tsx` plus `timings.json`): about 7 camera travels (hero, tray, shop, share, profit, point, return), 100 coins that drop and fly, tray, "?", 100 tiles with light waves, columns, towers, awning and OPEN sign, 5 figures, 3 chips, kickers. Longest quiet stretch: **5.96 to 9.66 s** (beat `notbest`: the $390 stamp is gone and only the kicker changes plus a slow orbit), about 3.7 s. Other gaps are 2.5 s or less because the camera or a 3D piece moves.
- raea export check: all hard checks pass (loudness, safe areas, contrast, clipping). 50 `reading` warnings, all of the kind "a word is on for 0.6 s". These come from the fixed voice rhythm and are not fixable without a re-record.

## 1. Scorecard

| Block | Pts | Reason |
|---|---|---|
| A. Hook 0-3 s | **17/25** | Frame 0 has depth, a lit plinth, a lime ring and the title **plus the whisper "Services keep $76 of every $100."**, so the contrast is present muted and paused (this was missing before). But the phone fills only about 12% of the frame height and the biggest type is the title. The `$1,000` and `$390` come in at about 1.0 s and 3.4 s, not on frame 0 (5/8). Sentence 1 has two numbers, but "$390 left once they're built" has no meaning without the 39% context (4/7). Apple is named by the voice and the tag, the phone is recognisable in under 1.5 s (4/5). Title (5 words) plus whisper (6 words) is more than 7 words, though the whisper adds the payload (2/3). No throat-clearing, 0.6 s of calm before the first coin (2/2). |
| B. Retention | **20/25** | A new 3D event or camera travel on almost every beat; coins, tray, tiles and towers are real "something new" (6/8, minus the 3.7 s quiet at 6-9.7 s). The but-therefore spine is intact, with an added build: coins, then tiles, then towers (5/6). The re-hook at 18 s (travel to the shop, tiles rise, `AFTER THE SALE`) is stronger than before, but the line itself is soft (3/4). The payoff (26/40, $94B, 2/3 line, awning) sits at 66-95% and keeps the hook promise (3/4). 2.9 w/s, captions at 84 px and readable, kickers wrap at 80 px (3/3, 2.5 given for wraps, rounded in). |
| C. Rewatch & loop | **9/10** | "And it all starts when you..." joins "Spend $1,000..." (5/5). SSIM 0.981, because the whisper is on frame 0 and the awning folds away (3/3). Towers and the 26/40 columns are worth a pause, the coins less so; the lower half of the frame is a plain dark scrim (1/2). |
| D. Shareability & saves | **10/15** | The "26% of sales, 40% of what's left" send is unchanged and still arrives at 27 s (4/6). The whisper on frame 0 now shows the $76 contrast to anyone who sees only the cover (+1). Saves come from the series only (2/4). The script asks no question; the pinned comment has to (2/3). The "you" is still thin: kicker "So what are you buying?" and the loop line (2/2 minus the thin second person, rounded to 2). |
| E. Packaging | **9/10** | Frame 0 has title plus whisper, readable at thumbnail size, but the phone is tiny and there is no big number; the best cover is not frame 0 (see section 4) (3/4). Caption below (3/3). `RECEIPTS #004` and the house look (3/3). |
| F. Niche codes & trust | **12/15** | Two visible splits made of objects: 100 coins, 61 red and 39 gold, then 100 tiles, 24 red and 76 lime (4/4). `$1,000` is a near-iPhone price, but it is an average of devices (2/3). A real viewer stake is only "you" in text; no face (2/3). Source footer all the way through, "our calc." labels, `iPhone alone: not disclosed` chip and a `?` over the phone (3/3). The hook stamp still sits next to a phone (it says `left · all devices avg`), and the source line and mono labels are 24-32 px (1/2). |
| **TOTAL** | **77/100 · 7.7/10** | **Tier: can break out** (top of the band is 84) |

## 2. What the 3D rebuild changed vs the 76/100 Remotion version

| Item | Remotion (76) | raea (77) | Effect |
|---|---|---|---|
| Frame 0 as a cover | Phone, title and a big lime `$1,000`; whisper missing | Phone (small), title, **whisper present**; no `$1,000` until 1.0 s | Cover is cleaner and carries the $76 idea, but is less striking. Net about -1 on A (frame 0). |
| Visual hook | A flat stamp over the phone | Gold coins drop onto a counter at "$1,000" and 39 glow at "$390": the number is a pile of objects | Better "in-world information" (playbook §9). The hook still lands only after 3 s. |
| Retention | 5.6 cues/10 s, gaps of 2.6 to 3.25 s | A camera travel plus an object event on nearly every beat; one 3.7 s quiet stretch | +1 on B. |
| Mid re-hook | New scene plus chip | Camera travels 20 units to a 100-tile shop with light waves | Stronger. |
| Loop SSIM | 0.848 (below the 0.85 line) | **0.981** | +1 on C. Both whisper and camera now return to frame 0. |
| Payoff | Bars and card | Towers, a 2/3 line, then an awning and a flashing OPEN sign on "storefront" | Metaphor is shown, not told (+0.5 on B/F, not separately scored). |
| Net | 76 | 77 | Gains in loop and in-world, partly given back by a smaller, quieter frame 0. |

## 3. Top 5 changes, ranked by expected gain (all in `raea/apple-iphone-3d/compositions/storefront.tsx` unless marked)

1. **Make frame 0 and the hook bigger: hero close-up and an early number.** Gain **+4** (A frame 0 +2, A payload +1, E cover +1).
   - Tighten the hook shot: `HERO.fov` 30 to 22 and the pull-back in `OPEN` from `1.25` to `1.1` (keep `SHOTS.push({...OPEN, ...})` the same so the loop still meets frame 0). The phone then reads at about 20% of the frame height.
   - Show the first figure at t = 0.35 s instead of waiting for the spoken word: in `FIGS()` change the first entry to `at: 0.35` (the voice says "$1,000" at about 1.0 s, so the number appears just before it). The loop tail should then show the same figure, so add `life(...)` for the same figure over `DUR - 1.15 .. DUR`, or keep it off the last frames and accept SSIM of about 0.9.
   - Optional: `aperture_f_stops` 2.4 to 4 on the hook so the plinth is sharp.
2. **Close the 3.7 s dead stretch at 6-9.7 s with objects, not words.** Gain **+2** (B new visual, B escalation).
   ```tsx
   // in KICKERS area, a chip on "huge" (39.3% = 139,659 / 355,533, our calc., SOURCES row "Products gross margin")
   { at: w("notbest", "huge"), hold: 1.6, text: "39% margin · our calc.", top: 905 }
   ```
   plus a camera nudge on "But": add `{ t: w("notbest", "But") - 0.2, pos: [...HERO.pos scaled 0.85...], look: HERO.look, fov: 26 }` to `SHOTS` (a slow push toward the phone), and a pulse on `plinth-ring` (`glow(P.lime, 2.2 + 3*flare)` with `flare` extended to `life(t, w("notbest","best"), 1.2, 0.1)`). All figures are already in SOURCES.md.
3. **Optional re-record of beat `notbest` to move the services contrast to 6 s.** Gain **+3** (A payload, B escalation, D send). Re-record only if the owner agrees; the hook sentence and the loop join are unchanged:
   `"say": "That's huge for hardware. Spend it on Apple's services, and about {$760|seven hundred and sixty} is left."` (1,000 x 76.2% = $762, so "about $760", our calculation; add that row to SOURCES.md first). Then add a lime coin burst on `$760` (76 lime coins beside the 39 gold ones). The truth check stays: it is by margin and the on-screen kicker already says `BIG MARGIN. NOT THE BEST ONE.`; never shorten it so it implies services make more dollars than devices (devices $139.7B vs services $93.9B gross profit).
4. **Fix kicker wraps and tiny type.** Gain **+1** (B captions, F readability). The kickers `$1,000 OF DEVICES · OUR CALC.` and `$100 OF SERVICES · OUR CALC.` wrap onto a second line at 80 px with an orphan `CALC.` (see `b1.jpg`). Change the `KICKERS` rows to `"$1,000 · our calc."` and `"$100 · our calc."`, or use `display(64)` for those two. Raise the source footer from `mono(24)` to `mono(28)`. The lower third (y 1250-1440) is a plain scrim; a bigger figure there would use it.
5. **Make the comment trigger and the "you" work** (caption plus pinned comment, nothing in the video). Gain **+2** (D comment, D stake). Use the pinned-comment question in section 5, and keep `So what are you buying?` as the point kicker.

Estimated after 1, 2, 4, 5 (no re-record): about **84/100**. With the re-record too: about **87/100**.

Truth check on every edit above: nothing implies a per-iPhone figure. The `$390` stamp stays `left · all devices avg`; the `iPhone alone: not disclosed` chip and `?` stay; "not Apple's best business" stays true by margin (76.2% vs 39.3%), not by dollars.

## 4. Three alternative hooks (all true to SOURCES.md)

| Archetype | Verbal line | Frame-0 visual | On-screen text |
|---|---|---|---|
| **Comparison** (needs a beat-1 re-record; the loop still works, it starts with "Spend") | "Spend {$100} on Apple devices, and about {$39} is left after costs. On Apple services? About {$76}." | Two short coin stacks on the plinth counter, 39 gold next to 76 lime, a small phone behind | `$39 vs $76` |
| **Contrarian** | "A quarter of Apple's sales brings in forty percent of what's left after costs. And it isn't the iPhone." | The two glass columns already filled (26% / 40%), the phone small behind | `26% OF SALES. 40% OF THE MARGIN.` |
| **Second person** | "You pay Apple once for the phone. Then you keep paying, and that is where its margin is." (then the $1,000 split) | Phone with app tiles flaring, a stack of coins rising from the screen | `THE PHONE IS ONLY THE START` |

Never say "the iPhone isn't profitable": the iPhone margin is not disclosed. "It isn't the iPhone" means the margin comes from services.

## 5. Cover, caption, hashtags, pinned comment

- **Cover:** not frame 0. Use **t = 4.0 s** (title still up until about 5.4 s, `$1,000` figure, red `$390` stamp, coins on the counter). It is the only frame with the number, the stamp and the phone together. If a composed cover is possible, use the hero close-up with `DEVICES: $39` (amber) / `SERVICES: $76` (lime) of every $100 and `OUR CALC. · APPLE FY2026` in Mono. Keep the title block inside y 250-1440.
- **Caption (hook line, 119 chars):** `Spend $1,000 on Apple devices and about $390 is left after costs. Spend $100 on Apple services? About $76 is left.`
  - `Apple 10-K fiscal 2026: iPhone, Mac and iPad margin vs App Store, iCloud, AppleCare and ads.`
  - `Services: 26% of Apple's sales, 40% of its gross profit (our calculation). Not financial advice.`
- **Hashtags (4):** `#Apple #iPhone #AppStore #BusinessExplained`
- **Pinned comment:** question first, then the SOURCES.md text. *"Be honest: how much do you pay Apple every month after the phone (iCloud, Music, AppleCare, apps)? Guess before you check your subscriptions."* Then: every number is from Apple's fiscal 2026 annual report; "left after costs" = gross margin (39.3% devices, 76.2% services); Apple doesn't disclose the iPhone alone, so the $1,000 is the average of all devices (our calculation); devices still made more dollars ($139.7B) than services ($93.9B); device margin was helped by tariff refunds (36.8% in FY2025); not financial advice; phone drawn in code, no logo. Owner: tick the 9 table lines against the 10-K before posting.

## 6. Platform notes
- **TikTok:** 42.4 s is right for completion and rewatch; do not stretch to 61 s. The caption hook goes in the first 70 characters. Search reads on-screen text, so change 1 (a number on frame 0) helps. The camera never stops, which suits a loop; leave auto-loop on.
- **Reels:** sends per reach is the key signal, so the "$39 vs $76" contrast belongs in the cover and the first caption line. Upload the clean mp4 (no TikTok watermark). Hashtags do not help reach; keep 3-4.
- **Shorts:** viewed-vs-swiped is decided in the first second, and many viewers start muted. The phone is too small on frame 0 for that; change 1 matters most here. Title field: `Apple keeps $76 of every $100 of services (FY2026)`. Shorts loops on its own, and SSIM 0.98 makes the "...when you" to "Spend" seam clean.

VIRALITY SCORE: 77/100 (7.7/10) — can break out
