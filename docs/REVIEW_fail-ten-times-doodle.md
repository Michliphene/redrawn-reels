
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
