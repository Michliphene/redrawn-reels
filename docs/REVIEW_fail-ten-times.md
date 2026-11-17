# REVIEW: fail-ten-times (UNGRADED #001, Mindset, DA 2)

## Reel review (pass 1, out/fail-ten-times.mp4, 42.1 s, 41.5 s of voice)

**Verdict: postable once the P2 items are fixed. Score 7/10.** I found no P1. `npm run validate` is clean (0 ✗, 0 !).
Nothing readable falls outside the safe area (checked with the guides stills at 0, 2.6, 17.3, 26, 33.95 and 38.5 s).
The only fact, 5,126, matches SOURCES.md, and the source line stays on screen for the whole reel.
Pre-post gate (owner): the Dyson quote is still unticked against the Fast Company 2007 interview.

**The 3 biggest problems**
1. Both callouts are on screen for about 0.5 s. They are cut by the scene end (`1 - ramp(sg.to - 0.15)`), and the
   "FAILURE = INFORMATION" box sits right on top of "FAILED PROTOTYPES / JAMES DYSON…" (both at y≈1082–1130).
2. The road scene runs about 3 s with nothing new (28.1–31.1 s, the pawn has stopped, the number is settled). Then the
   halt wall lives only about 0.75 s (31.16 → 31.9) before "Keep" removes it. The dolly zoom also shows a hard dark
   band where the floor ends (a frame at 31.3 s looks like a render glitch).
3. Mono labels are under the 28 px floor: the stack, trial and big-number labels are 24–25 px, and the Dyson `sub` and
   the source line are 20 px in muted grey (unreadable on a phone). "IGNORED" is also muted on purple, so contrast is low.

Tooling note: `pipeline/review_frames.py` produced wrong sheets for this composition. The beat_01–04 frames come from
later times and the beat_05–08 sheets are missing. I reviewed from my own 2 fps contact grids instead. Fix the script
for `Mindset` before the next episode.

## Fix list

1. **[P2] want · 21.3–23.6 s · the "Every miss is data" callout fires at 23.26 and is faded out by the scene cut at ~23.8
   (0.5 s on screen); it also only repeats the caption.** Fix: fire it earlier, or drop it.
   `{"type":"callout","text":"Every miss is data","atWord":"tells","hold":1.6}`
2. **[P2] keep · 33.9–34.5 s · the "Failure = information" callout shows for 0.6 s and covers the "FAILED PROTOTYPES"
   label of the big number.** Fix: put it on "every" and place it above the road.
   `{"type":"callout","text":"Failure = information","atWord":"every","hold":1.6,"y":640}`
   Engine fix too: in the callout block, when the active scene is `road`, set the default `top` to 640 so it never
   collides with `RoadOverlay` (top 936 + about 190 px).
3. **[P2] dyson→stop · 28.1–31.1 s · the pawn arrives at tile 7 at 28.1, then nothing moves through "before one worked.
   Failure only gets expensive" (metrics: 5.9 s gap with no new cue).** Fix: stretch the walk so the pawn keeps moving
   until the wall: `{"type":"walk","to":7,"dur":6.4,"atWord":"James"}` (arrives at about 30.3).
4. **[P2] stop · 31.16–31.9 s · the halt wall and dolly zoom last 0.75 s, and the "Keep" walk removes them at once.**
   Fix: start the resume walk on "going," (`{"type":"walk","to":11,"dur":1.8,"atWord":"going,"}`). In `RoadStation`,
   make the wall sink over 0.5 s instead of 0.25 (`ramp(t, resume.t, 0.5)`).
5. **[P2] stop · ~31.0–31.6 s (and the opening crane, 0–0.5 s) · the dolly zoom widens the fov ×1.9 and shows the
   floor's far edge as a hard dark rectangle across the top of the stage.** Fix: in `Mindset3D`, scale the fog far
   distance with the fov during the dolly (`fog={[shot.dist*1.25, shot.dist*3.6*(shot.fov/baseFov)]}`) or enlarge the
   floor plane (900 → 2400). The horizon must fade, never cut.
6. **[P2] all scenes · labels under 28 px.** Fix in `Mindset3D.tsx`: stack label Mono 24 → 30 (l.249), trial label
   25 → 30 (l.264), big label 25 → 30 (l.279), big `sub` 20 → 26 in ink, not muted (l.280), grade label 26 → 28
   (l.226). Source line 20 → 24 (l.427), or keep it at the kit size if RECEIPTS uses 20, but say so. "IGNORED": use
   `ink` at 70 % instead of `muted`.
7. **[P2] store · 14.8–16.4 s · three empty grey discs and nothing says "store": a scroller sees blank pedestals for
   2.3 s.** Fix (JSON): `"kicker":"Your online store"` on beat `store`. Engine fix: in the `trials` station, pop a small
   awning/sign prop over the plinth row on the beat's start (a `shop` action: `{"type":"open","atWord":"store."}`).
8. **[P2] loop · 41.0–42.1 s vs 0 s · the last frame has a teal "10 LESSONS" tower and "0", but frame 0 has a red
   "10 FAILURES" tower and an empty right plinth (loop SSIM 0.88).** Fix in `StacksOverlay`/stack station: multiply
   `lit` by `(1 - back)` and scale the right stack by `(1 - back)` so the set returns to the frame-0 state during the
   final pull-back. The title already fades back in, which is good.
9. **[P3] hook · 0.25 s · the caption shows "TEN", so the hook has no visible numeral (metrics:
   has_question_or_number_in_hook = false).** Fix: `"say":"{10|Ten} failures teach you more than a perfect record."`
   Do the same in beat `ten`: `"{10|Ten} failures? {10|Ten} lessons."`
10. **[P3] dyson · 23.9–29 s · the road has 12 tiles and they turn red→teal as the pawn passes, but nothing says what a
    tile is.** This also inverts the colour code (red = failure in every other scene). Fix: keep the passed tiles red
    (failed prototypes) and turn only the final tile teal on "worked." (`{"type":"win","atWord":"worked."}`, engine:
    the tile at `to` lights accent).
11. **[P3] keywords · accent overuse and a colour clash: "failures"/"failure" are teal in the captions while failures
    are red in the world, and "perfect" is highlighted twice.**
    `"keywords":["lessons","lessons.","flip.","works.","stop.","information.","zero."]`
12. **[P3] count→store · 14.5 s · "PICTURE THIS" fades in over the ghost of "ONLY WHAT WORKS COUNTS" (both in the header
    block for about 0.3 s).** Fix: delay the kicker by 0.15 s after a `lines` segment ends
    (`ramp(t, Math.max(s.from + 0.15, hookEnd), 0.2)` when the previous segment is `lines`).
13. **[P3] grade · 6.65 s · an X lands on "right." ("they're right"), which reads as "wrong".** It is intended (one
    mistake per sentence), but the B→C step would read better on "mistake" alone. Fix: drop the `mark` on "right."
    and add one on "costs".

## What works
- One continuous world with camera travel between stations; there is a real re-hook at 23.9 s ("A REAL ONE" + count-up).
- Grade A→F drops exactly on its words; the flip (roll + papers turning to checks) lands on "flip." (10.80 s).
- Every kicker and text hangs from the left margin; captions stay in their band; the right rail is clear under y=860.
- Accuracy: 5,126 / "in his own account" / Fast Company (2007) match SOURCES.md; no duration shown (disputed).

## Virality review (pass 1, out/fail-ten-times.mp4, 42.1 s)

This is a pattern-based estimate, not a prediction. The account's size, and how its first cohort reacts, matter more
than anything below. Playbook §7 (maps) does not apply. Block F is read for a mindset reel: one visible transformation (4),
a familiar anchor (3), a human stake (3), sourced and hedged (3), no anti-patterns (2).
Metrics (`pipeline/virality_metrics.py`): 2.84 words/s, first word at 0.25 s, hook sentence 2.65 s, 5.9 cues per 10 s,
3 of 21 two-second windows with no cue, longest gaps 5.9 s at 25.2 s (Dyson road) and 3.8 s at 38.3 s (outro),
loop SSIM 0.88, −14.4 LUFS. The 5.9 s gap is partly covered by the pawn's walk and the count-up. About 3 s of it is
really dead (28.1–31.1 s, as the reel review found).

### Scorecard
| Block | Pts | Why |
|---|---|---|
| A. Hook 0–3 s | **16/25** | Frame 0 (4/8): one half-built coral tower on an empty slab. Paused, it reads as a bar chart, the A+ rival only appears at 2.5 s, and the lower 60 % is empty. Payload (4/7): "Ten failures teach you more than a perfect record" is a comparison, but the "ten" is illustrative, there is no stake, and it sounds like a poster everyone has seen. Subject < 1.5 s (4/5). Text (2/3): the title "TEN FAILURES. TEN LESSONS." is 4 words but gives away the ending on frame 0. No throat-clearing (2/2). |
| B. Retention | **20/25** | Cues come every 2.5 s or faster almost everywhere (6/8). The real holes are 28–31 s and the static outro (38.3–41.5 s, with only a slow pull-back). The but/therefore spine is clean: school → "but" flip → store → a real one → stop (4/6). The store hypothetical (14.8–23.6 s, 9 s, low stakes) is a plateau. Re-hook (4/4): cut to the road plus a 5,126 count-up at 57 %. Payoff (3/4): on time, but predictable because the title spelled it out. Pace (3/3). |
| C. Rewatch & loop | **9/10** | "So the next time you fail, remember…" → "Ten failures teach you more…" closes the loop cleanly (5/5). SSIM 0.88 (3/3). The frames are sparse, so there is little to pause on (1/2). |
| D. Shareability & saves | **9/15** | Send trigger (3/6): a reassuring "send to a friend who just failed an exam". The 5,126 figure is the only "I didn't know that", and it already circulates widely. Save (2/4): a quote-style reminder, series #001. Comment (3/3): the pinned question is honest, and "A perfect record? Zero." will draw real disagreement. Human stake (1/2): "you" only arrives in the last line. |
| E. Packaging | **8/10** | Cover (3/4): the 38.5 s frame (mint 10 vs coral 0) works as a thumbnail but needs words on it. Caption (3/3, written below, none existed). Series identity (2/3): the "UNGRADED #001" chip is clear and the name fits the school theme, but nothing gives a reason to follow for #002. |
| F. Niche codes & trust | **13/15** | Visible transformation (4/4): coral X papers flip to mint, coral failures light into mint lessons. Anchor (3/3): A–F grades, an A+, an online store, Dyson. Face/stake (1/3): Dyson is named but not shown, and the viewer is not addressed until the end. Sourced and hedged (3/3): "says", "in his own account", the source on screen, and the illustrative numbers obviously illustrative. Anti-patterns (2/2). |
| **TOTAL** | **75/100 (7.5/10)** | **can break out** (low end) |

### Does softening "money" to "lessons" cost reach?
Yes, a little, and only at the gate. The original line ("the student who fails the most will make the most money")
stacks three hook layers: identity (student), a contradiction (most fails → most money) and the strongest stake there
is (money). "Ten failures teach you more than a perfect record" keeps a weak contradiction and loses the identity and
the stake. My estimate is 3–4 points of block A plus 1 point of sends. That means a lower stop rate in second 1, the
Shorts "viewed vs swiped" metric and TikTok's first cohort. It does not reduce completion: once a viewer stays, the
reel holds them as well as the money version would.
The money version would have lost about as much elsewhere. F "sourced and hedged" would drop from 3 to 0, the
anti-pattern points from 2 to 0 (a promise the video can't pay off), and the bible's honesty rule would be broken. It would
also invite a pile of "survivorship bias" comments. Those comments boost reach for one day, then cap sends, because
people don't forward a claim they've seen debunked under the video. So **keep the softening, but replace the money
stake with a stake we can source.** We have two:
1. **The verified number.** 5,126 is the only sourced fact in the reel, and it is buried at 24 s. Moved to sentence 1,
   it gives the hook a concrete payload without promising anything.
2. **The viewer's identity.** School grades are something every viewer has lived through. "At school, ten failures
   get you an F" is true by the illustrative scale, and it puts "you" in the first second.
Don't put money back unless it is sourced and clearly not causal. Dyson's wealth would need its own source added to
SOURCES.md first (e.g. a rich list). Even then, "he got rich because he failed" is a causal claim we can't make.

### Top 5 changes, ranked by expected gain
1. **Lead with the sourced number (+5: A payload +2, frame 0 +2, D send +1). Needs a re-voice.** Spoken "over five
   thousand" with 5,126 on screen is true (5,126 > 5,000) and short enough for a 2.5 s first sentence. The Dyson beat
   at 24 s stays as it is and becomes the payoff to "whose count is that?", which makes the re-hook stronger.
   ```json
   {"id":"hook","scene":"road","kicker":"A real one",
    "say":"Over five thousand failed prototypes. Then one worked.",
    "actions":[{"type":"big","value":5126,"label":"Failed prototypes","sub":"James Dyson, in his own account","dur":1.2,"atTime":-1.4},
               {"type":"walk","to":7,"dur":2.4,"atTime":-1.0}]},
   {"id":"thesis","scene":"ten",
    "say":"{10|Ten} failures teach you more than a perfect record.",
    "actions":[ <the two current stack actions, the left one moved to "atWord":"Ten"> ]}
   ```
   Put the `loop` beat back on `"scene":"road"` so the last frame matches the new frame 0, and the loop line flows
   into "Over five thousand failed prototypes." The reel gets about 3 s longer (about 45 s), which is fine. Check on
   stills that `big` accepts a negative `atTime` (frame 0 must already read 5,126, not 0). The owner must tick the
   Fast Company 2007 quote before posting, because the hook will now rest on it.
2. **If you don't re-voice, stop the title from giving away the payoff and show the rivalry on frame 0 (+3: A frame 0
   +2, text +1).** This is a JSON-only change.
   ```json
   "title": "Ten failures vs. one A+",
   "whisper": "Which one teaches you more?"
   ```
   Also set `"atTime": -1.4` on the right (A+) `stack` action instead of `"atWord":"perfect"`, so both towers stand on
   frame 0. The question has a defined answer (a number of lessons), and the reel pays it off at 34.8–38.9 s.
3. **Shorten the store plateau (+2, B escalation).** The facts are unchanged. Merge the setup into the action:
   `"say":"Launch an online store. Product one flops. Product two gets ignored. Product three sells a little."`
   Drop the separate `store` beat and set `"kicker":"Picture this"` on `products`. Keep the hypothetical label, because
   the bible requires it. This saves about 1.5 s on the weakest stretch.
4. **Put "you" in the first 5 s (+2: D human stake +1, A +1).** Rewrite beat `think`:
   `"say":"You've been taught that failing means falling behind."` This is the same idea, aimed at the viewer instead of
   "most people". It is a rhetorical frame, not a statistic.
5. **Fill the static outro (+1, B new visual).** From 38.3 to 41.5 s only the pull-back moves. Put a beat on the last
   line: `{"type":"callout","text":"Next fail = next lesson","atWord":"fail,","hold":1.6}` on beat `loop`.
   Callouts are cut about 0.5 s early at scene ends (reel review item 1), so fix that first. Also do the reel review's
   fix 8: return the set to the frame-0 state during the pull-back. That pushes the SSIM well above 0.88.

Out of the top 5, but worth doing: the reel review's fix 3 (keep the pawn walking until 30 s) closes the 3 s dead patch
in the middle. A Dyson photo would earn the face point, but Commons portraits are usually CC BY-SA, which needs the
owner's OK. Never use an AI likeness.

### 3 alternative hooks (all true)
| Archetype | Verbal line (sentence 1) | Frame 0 | On-screen text |
|---|---|---|---|
| **Big number / in media res** | "Over five thousand failed prototypes. Then one worked." | The road station mid-walk: pawn on coral tiles, 5,126 already counted, sub "James Dyson, in his own account" | `5,126 FAILS. THEN ONE WORKED.` |
| **Contrarian, school identity** | "At school, ten failures get you an F. Out here, they get you ten lessons." | The paper rack with four coral X's and a big coral **F** (the 8.5 s frame, moved to 0) | `AN F AT SCHOOL. A LESSON OUT HERE.` |
| **Second person, labelled hypothetical (keeps a money-shaped stake without promising income)** | "Picture it: your first product flops. Your second gets ignored. Now you know what people want." | The three pedestals: a coral flop, a grey ignored box, a mint box with a coin, with the kicker PICTURE THIS | `TWO FLOPS. ONE SALE. KEEP GOING?` |

Facts: hook 1 relies on SOURCES row 1 (5,127 prototypes, 5,126 failed, Dyson's own account). Hooks 2 and 3 use only
the illustrative scale and the hypothetical store already listed as illustrative. Don't add "billionaire", "vacuum
empire" or "years" to any of them: wealth is unsourced and the duration is disputed.

### Cover, caption, hashtags, pinned comment
- **Cover:** the 38.6 s frame (mint "10 / 10 LESSONS" against coral "0 / 0 LESSONS") with the title band set to
  "TEN FAILURES vs. ONE A+" in Display. Keep all type between y 300 and 1500, because the Instagram grid crops to
  3:4 around the centre. If change 1 ships, use frame 0 instead (the 5,126 counter on the road).
- **Caption (hook line, ≤150 chars):** Ten failures or one perfect A+: which teaches you more? James Dyson counted 5,126 failed prototypes before one worked.
  - Failure, mistakes and learning: school grades every mistake, real life counts what finally works.
  - Mindset for students, first jobs and side projects. Dyson figure: his own account (Fast Company, 2007).
- **Hashtags:** #failure #mindset #studenttips #growthmindset #jamesdyson
- **Pinned comment:** keep the SOURCES.md text and end with: "What's the failure that taught you the most? And if
  you think a perfect record teaches something too, tell us what."

### Platform notes
- **TikTok:** 42 s is the right length. Don't stretch to 61 s for Creator Rewards; that would be a different edit with
  a second example. TikTok search reads on-screen text, so the word "failure" should be in the title band (change 2
  does this). The reel shares an idea with a 488K-like TikTok, so use our own sound and wording. The script already
  is a full rewrite; crediting the idea in a comment is optional and does no harm.
- **Instagram Reels:** sends drive reach to non-followers. The natural send is "for someone who just failed
  something", and the first caption line can say so in plain words. Set the cover manually (the 3:4 grid crop). No
  watermark, original audio. Hashtags don't add reach, so keep 3–5 for topic only.
- **YouTube Shorts:** "viewed vs swiped" is decided on frame 0, so change 1 or 2 matters most here. Title field:
  "Ten failures vs one A+ (James Dyson's 5,126)". Shorts replays favour the clean loop, so do the frame-0 reset in the
  outro (reel review fix 8).

VIRALITY SCORE: 75/100 (7.5/10) — can break out
