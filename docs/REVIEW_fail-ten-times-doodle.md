
## Virality review (pass 1, out/fail-ten-times-doodle.mp4, 42.1 s, notebook cut)

This is a pattern-based estimate, not a prediction. The account's size and how its first test cohort reacts matter
more than anything below. Playbook §7 (maps) is skipped. Block F is read for a mindset reel: one visible
transformation (4), a familiar anchor (3), a human stake (3), sourced and hedged (3), no anti-patterns (2).
The voice is shared with `fail-ten-times`, so every fix below changes only visuals, on-screen text, cues or packaging.

Metrics (`pipeline/virality_metrics.py`): 2.84 words/s, first word at 0.25 s, hook sentence 2.65 s, 6.7 cues per 10 s
(3D cut: 5.9), 4 of 21 two-second windows with no cue, longest gaps 5.9 s at 25.2 s and 3.8 s at 38.3 s, loop SSIM
0.79 (3D cut: 0.88), −14.3 LUFS. The 5.9 s Dyson gap isn't dead: the figure climbs the pile the whole time and the
count runs 0 → 5,126. The 3.8 s outro gap is mostly dead. Only the "0" thought bubble lands at 38.3 s, then nothing
moves until the reset at about 41.5 s. The SSIM drop is not a staging problem. The last frame does return to the
frame-0 duel (bandages, A+ held up, title back). The only difference is the caption "REMEMBER…", which stays on
screen until 42.19 s (last word 41.49 s + 0.7 s hold) and so covers the reset.

### Scorecard
| Block | Pts | Why |
|---|---|---|
| A. Hook 0–3 s | **21/25** | Frame 0 (6/8): this is the 3D cut's fix 2, done. Both rivals are on screen: a bandaged "10 failures" figure vs an A+ on a podium. The title "TEN FAILURES VS. ONE A+" and the question "Which one teaches you more?" read paused and muted. It is clean and charming, but static and flat, the lower 40 % is empty paper, and the 22 px source line ("DYSON FIGURE…") appears before Dyson exists. Payload (5/7): the sentence is unchanged, but on-screen "vs." plus the question now gives the curiosity gap a defined answer shape. Still no hard number or stake. Subject < 1.5 s (5/5). Text (3/3): 5 words, reinforces, no longer gives away the ending. No throat-clearing (2/2). |
| B. Retention | **21/25** | New visual (6/8): small gags land every 1–2.5 s (trip, red pen, ball in the bin, "flop!", bulb, coins, "all for nothing?"). The holes are 0–2.2 s (only the 1.1 s settle-zoom) and the static outro, 38.3–41.4 s. Escalation (4/6): the but/therefore spine is clean, but the store hypothetical (14.8–23.6 s) is still a low-stakes plateau, livelier than in 3D. Re-hook (4/4): the literal page turn on "flip." (10.8 s) is the best pattern interrupt in either cut, and the pile with the 5,126 count-up re-hooks at 57 %. Payoff (4/4): "10 lessons" vs "0 lessons", with the A+ figure's "0" thought bubble, lands on screen and is no longer spoiled by the title. Pace (3/3). |
| C. Rewatch & loop | **9/10** | "…remember…" → "Ten failures teach you more…" (5/5). SSIM 0.79 (2/3): the visual reset is there, but the caption hides it. The frames are dense with handwritten asides ("nobody counts these", "falling behind?", "all for nothing?"), which reward pausing (2/2). |
| D. Shareability & saves | **10/15** | Send (3/6): the script still carries the trigger, a reassuring "for a friend who just failed". The stick-figure notebook style suits student sharing, but no on-screen line names who to send it to. Save (2/4): a quotable reminder, series #001. Comment (3/3): "A perfect record? Zero." will draw honest disagreement. Human stake (2/2): the yellow figure is a clear protagonist. It trips, sweats over an F, sits on the pile asking "all for nothing?", then stands up. |
| E. Packaging | **9/10** | Cover (4/4): frame 0 (or the `cover` prop) is a ready thumbnail, with 5 big words and two shapes inside the 3:4 grid crop. Caption (3/3, written below). Series identity (2/3): the "UNGRADED #001" tape is clear, but nothing gives a reason to follow for #002. |
| F. Niche codes & trust | **13/15** | Transformation (4/4): the bulbs arc in over the failure figure, and the A+ is tossed for "0 lessons". Anchor (3/3): A–F grades, an A+, an online store, Dyson. Face/stake (2/3): Dyson is named and his count is shown, but there is no real person. Sourced and hedged (3/3): "— James Dyson, in his own account" under the count, and the source line is on screen. Anti-patterns (1/2): the "a few sales" label is cut off behind the customer figure (21–23.6 s). During the flip (10.8–11.4 s) the navy caption "THE RULES FLIP." runs over the dark backdrop and half-disappears. Frame 0 is a flat diagram (§9), which is forgivable for a deliberate paper style but still costs the "object in a space" read. |
| **TOTAL** | **83/100 (8.3/10)** | **can break out** (high end). The 3D cut scored 75. The gain comes from the hook frame, the payoff no longer being spoiled, and the doodle's denser gags. |

What caps it: the spoken payload (a soft, poster-like sentence 1) and the send trigger both live in the script. The
biggest lever left is still the 3D review's change 1 (lead with "Over five thousand failed prototypes", about +5),
and it needs a re-voice. Without a re-voice, the realistic ceiling is about 88–89.

### Top 5 changes without re-voicing, ranked by expected gain
1. **Fill the outro and clear the loop frame (+2: B new visual +1, C SSIM +1).**
   - Add a sticky on the last line in `episode.json`, beat `loop`. Scene `end` already has `"callout":[64,430]`:
     ```json
     {"id":"loop","say":"So the next time you fail, remember…",
      "actions":[{"type":"callout","text":"Next fail = next lesson","atWord":"fail,","hold":1.5}]}
     ```
     The text is the script's own argument, not a fact.
   - In `src/doodle/Doodle.tsx`, `NotebookCaptions`, pass `end` and add
     `if (t > end - 0.5) return null;` so the last 0.5 s is caption-free. The final frame then equals frame 0, and SSIM
     should pass 0.85.
2. **Give frame 0 depth and motion, and take the source line off it (+2: A frame 0 +1, F anti-pattern +1).**
   - In `Doodle.tsx`, open on the notebook seen at an angle and settle to flat by 0.9 s. Reuse `settle`: add
     `rotateX(${10 * settle}deg)` to the page wrapper (the div with `rotateY(fa…)`). The end reset already ramps
     `settle` back, so the loop stays matched.
   - Render `spec.source` only from the pile scene on (`t >= firstFrom(pileId) - 0.2`), or add an episode field
     `"sourceFrom":"dyson"`. Frame 0 loses a line that means nothing yet. The source still shows under the only
     factual claim, from 23.8 s to the end.
   - Optional, JSON only: fire the A+ `shine` on `"atWord":"Ten"` instead of `"perfect"`, so something reacts in
     the first 0.3 s.
3. **Turn the store plateau into a "therefore" (+1.5, B escalation).** Same facts; the store stays labelled
   PICTURE THIS. Change the `want` sticky so it points forward to the payoff:
   `{"type":"callout","text":"2 misses = 2 lessons","atWord":"tells","hold":1.6}`.
   It uses the same illustrative arithmetic as "10 lessons", so the owner should add one row to the facts table in
   SOURCES.md ("2 misses = 2 lessons, illustrative, one lesson per attempt"). In `panels.tsx` (shop), have the flop
   and ignored cards crumple into balls at "want". The pile at 23.9 s is made of the same balls, so the store visibly
   feeds into Dyson's 5,126.
4. **Put "you" on screen at 3 s (+1, D send/identity).** In `panels.tsx` (race, around line 102), write a red
   handwritten "you" with an arrow over the yellow walker from 3.2 s. Then put the existing "falling behind?" label
   on the trip. The viewer becomes the stick figure, so the reel reads as "this is me", which is what gets sent. The
   voice still says "Most people think"; the label adds a layer and doesn't contradict it.
5. **Fix the two legibility slips (+1, F anti-patterns).**
   - `panels.tsx`, around line 252: lift "a few sales" above the card (y≈1000 → y≈880), or walk the two customers in
     from the right edge, so the label isn't cut to "a few sa".
   - `Doodle.tsx`: while `Math.sin(fa*π/180) > 0.05`, give the caption block a paper-coloured backing (`C.paper`,
     6 px padding), so "THE RULES FLIP." stays readable over the dark backdrop.

The five together: about +7.5, which puts the reel at about 89–90 (strong-breakout odds territory). Treat the top of
that range as optimistic.

### 3 alternative hooks for this pass (voice unchanged: "Ten failures teach you more than a perfect record.")
| Archetype | Frame 0 | On-screen text (title / whisper) |
|---|---|---|
| **Myth-bust, in media res** | The race page mid-trip: the yellow figure already face-down on the progress arrow, the others walking past, "falling behind?" in red | `FAILING = FALLING BEHIND?` / *Not out here.* |
| **Big-number tease (paid off at 24 s)** | Today's duel, with a small heap of crumpled balls behind the bandaged figure | `TEN FAILURES VS. ONE A+` / *One inventor counted 5,126 failed prototypes.* |
| **Poll / pick-a-side (comment trigger)** | Today's duel, with a hand-drawn tick box under each figure | `WHICH ONE LEARNED MORE?` / *Pick before the answer.* |

All three are true. The whisper in the second only restates SOURCES row 1 ("5,126 failed prototypes", his own
account). Don't add years, "billionaire" or any income claim: the duration is disputed and the wealth is unsourced
and causal. The re-voice option (open on the 5,126 count) stays the strongest hook. See `docs/REVIEW_fail-ten-times.md`.

### Cover, caption, hashtags, pinned comment
- **Cover:** frame 0 rendered with `cover: true` (title at full opacity, no caption): the duel plus
  `TEN FAILURES VS. ONE A+`. It already sits inside the 3:4 grid crop (y 240–1680). Second choice: the 38.6 s frame
  ("10 lessons" with the bulb arc vs "0 lessons" with the thought bubble), but it gives the answer away.
- **Caption (hook line):** Ten failures or one perfect A+: which teaches you more? Dyson says he built 5,126 failed prototypes first.
  - Failure, mistakes and learning: school grades every mistake, real life counts what finally works.
  - For students, first jobs and side projects. Dyson figure: his own account (Fast Company, 2007).
- **Hashtags:** #failure #mindset #studenttips #growthmindset #jamesdyson
- **Pinned comment:** the SOURCES.md text as written, ending: "What's the failure that taught you the most? And if
  you think a perfect record teaches something too, tell us what."

### Platform notes
- **TikTok:** 42 s is right. Don't pad it to 61 s. The stick-figure notebook look is native to the platform's
  motivational/explainer niche, which helps the first cohort. TikTok search reads on-screen text, and "failures"
  is already in the title. Use the original sound. The idea is credited in SOURCES.md, and crediting it in a comment
  is optional.
- **Instagram Reels:** sends drive reach to non-followers. Say who to send it to in the first caption line (e.g. "for
  whoever just failed an exam"). Set the cover manually. No watermark. 3–5 hashtags for topic only.
- **YouTube Shorts:** "viewed vs swiped" is decided on frame 0, so change 2 matters most here. The loop matters
  for replays, so change 1 as well. Title field: "Ten failures vs one A+ (Dyson's 5,126 prototypes)".

VIRALITY SCORE: 83/100 (8.3/10) — can break out

## Reel review

Reviewed the 19:35 render of `out/fail-ten-times-doodle.mp4` (42.1 s, voice ends 41.49 s). It predates the virality-pass commit 6c4afc2, which is not re-rendered yet. Line numbers below refer to the code after 6c4afc2. Frames were sampled every 0.5 s, plus full-res close-ups
at 14.2–14.7, 21.0, 26.5, 31.3–31.8 and the loop frames. `npm run validate`: clean (0 ✗, 0 !).

**Verdict: not postable yet, 6.5/10.** The notebook idea works. Frame 0 reads in one glance (a bandaged guy vs. an A+ on a
podium, with the title), the page turn on "flip." is a strong mid-reel re-hook, and the bulbs replacing the plasters
pay off well. Four bugs block posting. All of them are fixable in cues or the engine; the voice stays as it is.

**3 biggest problems**
1. The bin beat's payoff never appears. The judge turns, the green check and "what works" all trigger after the camera has
   already slid to the shop page (tf+0.6…tf+1.0 vs. the slide starting at 14.31 s). The viewer sees a paper plane and nothing more.
2. On "stop." (31.2–32.3 s) the halt punch-in pushes the counter "5,126" off the left edge and up into the
   "A REAL ONE" kicker, so the one sourced number in the reel gets cut.
3. Figures from other pages leak into the frame. The race runners keep running into the school page, and grey "classmates"
   cross the desk and the test sheet from 6 to 11 s. In the shop, visitors walk over "flop!" and "ignored", and one
   stands on "a few sales" from 20.5 s to 23.6 s.

### Fix list (beat · time · problem · fix)

1. **[P1] count · 14.06–14.6 s · the "what works" payoff is never seen.** Fix in two places:
   - `episode.json`, beat `count`: `{ "type": "fly", "atWord": "They" }` (13.14 s) instead of `"works."`.
   - `src/doodle/panels.tsx` BinPanel: `turned = t >= tf + 0.3`. Draw the Check at `tf + 0.45` and "what works" at `tf + 0.55`.
     The label then lands at about 13.7 s, on "count what", and stays readable for about 0.6 s before the slide.
2. **[P1] stop · 31.2–32.3 s · the counter is cut at the left edge and collides with the kicker.** In `src/doodle/Doodle.tsx`
   l.80–83, anchor the punch on the counter instead of on the climber's height:
   `const hp = [60, 600];` and `punch = hit(t, halt.t, 0.35, 1.5) * 0.14`. The climber, at u≈0.55, then lands at about
   (700, 1030), still inside the safe area. The variable `g0` becomes unused and can be removed.
3. **[P1] grade/flip · 6.0–11.0 s · race runners walk through the school page** (grey figures at the desk, one behind
   the test sheet at 9.0 s and 10.5 s). RacePanel `x` has no upper bound. Clip every page in `Doodle.tsx` l.107:
   add `<clipPath id="pg"><rect x={-60} y={0} width={PANEL} height={H}/></clipPath>` once and give the panel `<g>`
   `clipPath="url(#pg)"`. As a quicker local fix, add `if (x > 1150) return null;` in RacePanel l.94.
4. **[P1] products/want · 19.3–23.6 s · visitors cover the outcome labels.** "flop!" shows as "op!" and "ignored" as "nored",
   and "a few sales" stays half hidden by the visitor who stops at x=860. In `panels.tsx` ShopPanel:
   - The buyer's stop point is already moved to x=955 (6c4afc2). Check on stills that it clears the end of the label at about x=900.
   - move the three outcome `Hand` labels (l.250–252) out of the cards loop and render them after the visitors (l.260–262).
     Give `Hand` (`ink.tsx` l.55) an optional halo:
     `stroke={C.paper} strokeWidth={size*0.18} style={{paintOrder:'stroke', …}}`.
5. **[P2] dyson · 25.5–27.6 s · the climber's head runs over "— James Dyson, in his own account".** In `panels.tsx` l.337–339,
   raise the block: number `y={680}`, "failed prototypes" `y={748}`, attribution `y={792}`. Shorten the attribution to
   "— his own account" (Dyson is already named in the caption). Its x-extent is then about 64–380, which the head
   only reaches while it is still below y≈860.
6. **[P2] store · 14.66–15.11 s · empty page.** The browser only exists from `open.t`, so the camera lands on a blank
   ground line. In `episode.json`, beat `store`: `{ "type": "open", "atWord": "Picture" }`. The browser then pops while the page slides in.
7. **[P2] all transitions (11.4, 14.7, 23.8 s) · two kickers overlap.** For example, "OUT HERE" sits on top of "PICTURE THIS" for about 0.3 s.
   In `Doodle.tsx` l.158, fade out before fading in:
   `o = Math.min(ramp(t, Math.max(s.from + 0.15, hookEnd), 0.2), 1 - ramp(t, s.to - 0.25, 0.15), 1 - titleO)`.
8. **[P2] think/grade/flip · kickers repeat the caption word for word.** "MOST PEOPLE THINK" sits over "MOST PEOPLE THINK…",
   "AT SCHOOL" over "AND AT SCHOOL", and "BUT OUT HERE" over "BUT OUT HERE,". The header should name the chapter instead:
   `think.kicker: "The myth"`, `grade.kicker: "School rules"`, `flip.kicker: "Real-world rules"`,
   `count.kicker: "Real-world rules"`. Keep "Picture this" and "A real one", which the bible requires.
9. **[P2] grade · 6.04 s · the grade drops from A to B on "school,"** before any mistake is mentioned. Move the four marks:
   `"atWord": "right."`, `"mistake"`, `"costs"`, `"grade."` (6.65 / 7.68 / 8.14 / 8.64 s). The F then lands on "grade.".
10. **[P2] want · 21.3–23.6 s · the bulb's red dashed lines cut through the address bar,** and one of them points at the empty
    slot of the fallen card. In `panels.tsx` l.267–269, start the flop line at the card on the ground (`[CARD_X[0], 1085]`).
    Route the other lines below the bar: waypoint `[lerp(CARD_X[i],150,0.5), 700]`, ending at `[150, 600]`. Also place the sticky
    (`scenes.shop.callout`) at `[600, 440]` so it stays clear of the browser bar at y≈560.
11. **[P3] think · 4.5–5.5 s · the "falling behind?" arrow points above the fallen guy's feet,** and passing runners cross both the arrow
    and the label. In `panels.tsx` l.112–114. The new "you" label at y=770 disappears before the trip, so there is no clash, set the label to `y={755}` and end the arrow at `[hx + 90, 1015]` (his torso).
12. **[P3] source line · 22 px.** 6c4afc2 already restricts it to the pile scene onward (`sourceFrom`). What remains is the size,
    under the ~28 px floor: in `Doodle.tsx` l.166, use `fontSize: TYPE.source` (24) or larger. It sits at y 1416–1437, so
    it has no room to grow downward. Move it up by the size difference if needed.
13. **[P3] stop · 29.4–31.2 s · 1.7 s with nothing new** (the climber walks on its own). Start greying the walked
    balls from "expensive" (30.36 s): add `{ "type": "fade", "atWord": "expensive" }`, and in PilePanel set `grey` when
    `t >= fade.t`, so the cost builds up before "stop.".
14. **[P3] count · 11.5–14.5 s · "nobody counts these"** is 44 px pencil grey, the weakest text in the reel. Set it to `size={52}`
    and `c={C.ink}` (l.200).
15. **[P3] dyson · the pile of balls with squiggles reads as smileys or coins** at phone size. Draw `PaperBall` without the
    inner "U" mark (crumple lines only), or use tiny vacuum-cylinder doodles for the top row so "prototypes" reads.
16. **[P3] loop.** The leftover "REMEMBER…" caption on the last frame is fixed in 6c4afc2 (captions off in the last 0.5 s).
    The new loop sticky ("Next fail = next lesson", scene `end`, callout [64,430]) is unrendered. Check on stills that it
    does not cover the "0" thought bubble (x≈650–840, y≈480–600) or the bulb arc.

### What already works
- Hook: the stake is visible at frame 0. The "shine" lands on "perfect" (2.17 s), and the trip lands on "failing" (3.98 s).
- The page turn lands exactly on "flip." (10.80 s). The product launches land on "one" / "two" / "three". The counter starts on the
  spoken number and settles on 5,126 at 27.2 s, while "five thousand…" is still being said.
- Safe area: all readable ink sits between y=264 and y=1437, and nothing readable is right of x=930 under y=860
  ("progress" ends at x≈920, the browser at x=910).
- Accuracy: the only factual figure is 5,126, which matches `SOURCES.md` (5,127 prototypes, the last one worked). The
  hypothetical is labelled "Picture this" and the real example "A real one", as the bible requires.
