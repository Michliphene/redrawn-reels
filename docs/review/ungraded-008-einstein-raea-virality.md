# Virality pass: UNGRADED #008 "He failed. Not math." (`einstein-math`, raea, DA 2)

Video `raea/ungraded-008-einstein/out/grades_v2.mp4` (64.2 s, 1080×1920, −14.0 LUFS, LRA 1.4). Cues live in the raea
composition, not in `episode.json`, so `pipeline/virality_metrics.py` can't see them. I took the same measurements with
ffmpeg instead: hook frames at 0/0.5/1/1.5/2/3 s, the last frame, first-vs-last SSIM, scene cuts, loudness, and 1 fps
contact sheets for the whole reel. I also read the cover (`out/cover.png`, `deliverables/ungraded/cover_3x4_008.jpg`),
`POST_008.md`, SOURCES.md and the pass-1 review.
Already known and excluded from the fixes: the FAIL stamp at about 26.5 s shows for only 0.3 s, and that is already being fixed
to hold about 2 s. It is still scored as it stands in this render.

This is a pattern-based estimate, not a prediction. The account's size and history matter more than anything in the edit.

## Objective metrics
| Metric | Value | Read |
|---|---|---|
| Duration | 64.2 s (voice 0.25–63.19) | over 60 s (counts for Creator Rewards) |
| Words / pace | 173 words, **2.75 w/s** | inside 2.5–3.2 |
| First word | 0.25 s | no throat-clearing |
| Sentence 1 | the headline quote, 0.25–2.84 s | the payload lands by 2.8 s |
| Pixel scene cuts | 0 | expected: one board on one wall. Board flips and tile rolls carry the changes |
| Loop SSIM (first vs last) | **0.848** | just under the 0.85 line. Same layout: the title card fades back over the clipping |
| Holds with nothing new on the board | **0–3.5 s** (only the captions change), 3.5–6.3 s (a small "a real headline" note), **31.9–34.8 s** (a blank certificate), 61.4–64.2 s (the loop hold, which is fine) | the worst hold is the first one, right where viewers swipe away |
| Pass-1 P1s | French tile, Ripley's label, "= worst?", "2 years younger", record board at the seam: all visible in this render | the theory source line switches to "Open Culture 2025 · Ripley's 2024" ✓ |
| Safe area | HUD about 270, kickers 330–400, captions 1170–1410, source line about 1428 | ok |

## Scorecard
| Block | Pts | Reason |
|---|---|---|
| **A. Hook 0–3 s** | **20/25** | |
| Frame 0, paused and muted | 7/8 | "HE FAILED. NOT MATH." over a red "FAILED IN MATHEMATICS" clipping is a strong contradiction, and the board on a classroom wall reads as an object in a space (DA 2 ok). But nothing on the board moves for 3.5 s, and the lower 40 % is bare wainscot |
| Concrete payload in sentence 1 | 6/7 | The headline quote is a stake and a contradiction with the title. It isn't attached to a name until "Einstein" at 4.4 s |
| Place & subject < 1.5 s | 3/5 | **The title doesn't name Einstein.** "Einstein, A." on the board is small and half-covered by the title card. A cold viewer sees "He failed" and doesn't know who |
| On-screen text ≤ 7 words | 2/3 | Title 4 words, but frame 0 carries three text blocks (title, whisper, 6-word clipping, plus a source line): about 17 words |
| No throat-clearing | 2/2 | voice at 0.25 s, no logo, the series tag sits on the title |
| **B. Retention** | **19/25** | |
| New visual every ≤ 2.5 s | 5/8 | From 6.3 s on it's dense: board flips per chapter, the speech bubble, "2 years younger", tiles rolling TOP/LOW, the director's card, 6/6/6/3, the ruler flip, "= worst?", the rule card, the circle, ADMITTED. The holds are 0–3.5 s (the swipe window) and the blank certificate at 31.9–34.8 s |
| Escalation, "but / therefore" | 5/6 | Myth → his denial → "So where's the fail?" → the parts → Plan B → 6/6/6/3 → the scale theory → rule flip → advice → loop. Clean. The aarau beat (26.6–31.6) is a calm stretch with only text on a card |
| Mid-video re-hook | 3/4 | "So where's the fail?" at 14 s (22 %) is a good question. The real re-hook, "One theory for the myth" (41–47 s, 64–73 %), only has a small ruler flip and a small red "= worst?". There's no camera event |
| Payoff not buried | 3/4 | The first payoff (overall FAIL, with math TOP) is the 0.3 s stamp: viewers can't see it. Being fixed |
| Pace & captions | 3/3 | 2.75 w/s, word-by-word captions with keyword colour |
| **C. Rewatch & loop** | **9/10** | |
| Last line completes the first | 5/5 | "And that headline? Still going around." → "Greatest living mathematician failed in mathematics." It's a perfect seam |
| Last frame ≈ first frame | 2/3 | SSIM 0.848 (the threshold is 0.85). Same layout, so this is probably grain, or the title fade not quite done on the last frame |
| Frames worth pausing | 2/2 | the 6/6/6/3 certificate and the TOP/TOP/LOW/LOW exam board |
| **D. Shareability & saves** | **12/15** | |
| Send trigger | 5/6 | "Einstein failed math" is one of the best-known school myths, and "6 was the top grade" is the part people haven't heard. The debunk itself is familiar, so the scale twist has to be visible to earn the send |
| Save value | 2/4 | "Read the parts" is a usable rule, but there's no card to screenshot. The best frame (6/6/6/3) never says "6 = best" on the board itself |
| Honest comment trigger | 3/3 | French 3, "which part of your last bad grade failed?", and the debated myth origin all draw real comments |
| Emotional / human stake | 2/2 | "So next time you fail a test, don't say: I'm bad at this", with the FAIL stamp: a direct "you" stake |
| **E. Packaging** | **8/10** | |
| Cover as thumbnail | 3/4 | "EINSTEIN NEVER FAILED MATH." plus 6/6/6/3 is big and readable. Without "6 = best" on it, a US/UK viewer reads 6/6/6/3 as low marks (good curiosity) or as nothing (lost). The source line "AARAU CERTIFICATE · 1896" duplicates the board header |
| Caption keywords + hashtags | 2/3 | It opens on the quote, not on a search phrase. It's missing *did Einstein fail math*, *Einstein's grades*, *report card*, *myth*. It has **8 hashtags** (the target is 3–5) |
| Series identity | 3/3 | UNGRADED #008 tag, house title card, kickers |
| **F. Niche codes & trust** | **11/15** | |
| One visible transformation | 3/4 | Tiles rolling TOP/TOP/LOW/LOW → FAIL, and the ruler flip. But the key one, "his sixes look like fails", is only a small red "= worst?" next to green 6s |
| Familiar anchor | 2/3 | Failing a test is universal. The Swiss 1–6 scale isn't familiar to US/UK viewers, and it's only explained in 1 s of voice and a small ruler |
| Real face / stakes | 1/3 | The world's most recognisable face, and he's never on screen |
| Sourced, hedged | 3/3 | Source line on every frame and switched for the theory. "One theory" is said out loud. The clipping is undated, as SOURCES.md requires. Every number matches SOURCES.md |
| No anti-patterns | 2/2 | no logo, no "follow for more", voice above the music. The frame-0 text load is borderline, and it's counted in A |

### TOTAL: 79/100 (7.9/10): can break out

With only the cheap fixes (post texts and cover), it comes to about **81**. With the re-render fixes as well, about **88**.

## Fixes, split by cost

### Post texts / cover (no video re-render)
1. **Rewrite the TikTok/Instagram description around the search phrase, with 4 hashtags (+1 E).** Replace the description block in
   `POST_008.md` with:
   ```
   Did Einstein fail math? No. At 16 he failed an entrance exam, just not the math part.
   Einstein's real grades: Zurich Polytechnic entrance exam 1895 (math and physics top, languages and the rest not enough), then his 1896 Aarau certificate: algebra 6, geometry 6, physics 6, French 3. On that scale 6 is the best grade.
   Where the "Einstein failed math" myth comes from is debated. One theory: the school flipped its grading scale. Sources in the comments.
   #einstein #mythbusting #studytips #history
   ```
   The hook line is 86 characters. Every fact is in the SOURCES.md table.
2. **YouTube Shorts title led by the search query (+0.5 E).** `Did Einstein fail math? His real 1896 report card`. The current title,
   "Einstein never failed math. Here's what he actually failed.", is good. Use it as the first line of the YouTube description instead.
3. **Make the cover readable for someone who doesn't know the Swiss scale (+1 E).** This is a still render of `Cover()`, not the video.
   Next to the tiles, add a small hand-written note in the board's pencil style, `6 = best`, red, about size 26, under the
   header at the right, or on the ruler shown below. Replace the source line "AARAU CERTIFICATE · 1896" (it duplicates the header) with
   `W. Isaacson, TIME 2007 · Aarau certificate, 1896`. Keep the title "Einstein never failed math." and the whisper. Check
   that "6 = best" stays inside the 3:4 crop.
4. **Pinned comment: add a quiz before the question (+0.5 D, it costs nothing).** Keep the sourced summary from POST_008 and end with:
   `No scrolling back: what did he get in French? And which part of your last bad grade actually failed?`
   Then add a second line: `Sources: Isaacson, TIME 2007 · Aarau certificate, 3 Oct 1896 (Collected Papers vol. 1) · Open Culture 2025 (scale theory).`
5. **Keep ready (no posting cost):** the debated-points answers in SOURCES.md, which are the myth's origin, "which sections failed",
   and "calculus before 15 is his own claim". These are the three "actually…" comments this reel will get.

### Needs re-render
1. **Make 0–3.5 s move and name Einstein on frame 0 (+3: A frame 0 +1, A subject +1, B new visual +1).**
   - Whisper: `"whisper": "Einstein's real report card."` in `episode.json` (and in the composition if it's hard-coded). That puts
     the name on frame 0 and keeps the title. It also replaces the current whisper, which is close to the cover's whisper anyway.
   - On "failed" (1.72 s), draw a red pencil underline under "FAILED IN MATHEMATICS". On "headline." (3.55 s), stamp the
     "a real headline" note bigger (pass-1 #11). On "laughed." (5.63 s), pop "ha!" at size 34+. Add a small tilt or drop
     of the clipping at about 0.3 s, so the board isn't a still on the first swipe-decision second.
2. **FAIL stamp holds about 2 s at 26.3 s (+1 B payoff).** Already in progress. It's the reel's first payoff, so keep it on the
   board until the board flips to "Plan B".
3. **Show the myth's mechanism at full size and add the re-hook camera event (+2: F transformation +1, B re-hook +1).**
   Use pass-1 #3's stronger option: on "sixes look like fails" (about 45.5 s) the three 6 tiles roll to a red `6` variant
   (`G.sixOld = { v: "6", c: C.red }`, +0.06 s per row), plus pass-1 #14's push-in on the ruler at `scale`, with a hard cut on
   "flipped". The red sixes would also make a second cover candidate.
4. **Fill the blank certificate at 31.9–34.8 s (+1 B).** Pass-1 #5, not done yet: on "final certificate" (32.41 s), write
   `14 subjects · we read 4` in pencil. It's true (SOURCES lists all 14 grades) and it heads off the "what about the
   others" comments.
5. **A real face (+2 F, maybe +1 D), only if the licence checks out.** A pinned photo card of the teenage Einstein on the
   SCHOOL RECORD face (hook/reply) would turn a lesson into a story. Candidates are the 1893 portrait at 14 or the Aarau
   1896 class photo, both widely shown as public domain. **Verify the source and the licence, and add a row to SOURCES.md
   before using either one.** If that can't be done, skip it. No AI likeness of a real person.
6. **Loop seam (+1 C).** Hold the fully faded-in title for the last 3–4 frames, so the last frame matches frame 0 (target
   SSIM ≥ 0.85). Today it measures 0.848.

## 3 alternative hooks (all true per SOURCES.md)
| Archetype | Verbal line (would need re-voicing) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **Myth-bust / question** | "Did Einstein fail math? He did fail an exam, at sixteen. Just not the math part." | the Zurich board, TOP/TOP/LOW/LOW with the FAIL stamp | **He failed. Not math.** |
| **Big-number / in media res** | "Six, six, six, three. That's Einstein's report card, and six was the top grade." | the 6/6/6/3 Aarau board, a "6 = best" note | **Einstein's grades, 1896** |
| **Contradiction (current, improved)** | "'Greatest living mathematician failed in mathematics.' A real headline. Einstein laughed." | the clipping, a red underline drawing on "FAILED", "Einstein, A." uncovered | **He failed. Not math.** + whisper "Einstein's real report card." |

Don't use "Einstein failed French". SOURCES.md gives a 3 on a 1–6 scale but no pass mark for 1896 Aarau, so "failed" would be
an invented fact.

## Cover, caption, hashtags, pinned comment
- **Cover:** keep the current composition (the 6/6/6/3 certificate, "EINSTEIN NEVER FAILED MATH.", "Read the report card first."),
  plus the `6 = best` note from cheap fix 3. If re-render fix 3 lands, a second option is the red-sixes frame at about 46 s with
  "Einstein never failed math." Use `cover_3x4_008.jpg` (re-exported) for the Instagram grid.
- **Caption:** see cheap fix 1. Hook line: `Did Einstein fail math? No. At 16 he failed an entrance exam, just not the math part.`
- **Hashtags (4):** `#einstein #mythbusting #studytips #history`
- **Pinned comment:** see cheap fix 4. It ends with `No scrolling back: what did he get in French? And which part of your last bad grade actually failed?`

## Platform notes
- **TikTok:** keep the 64 s cut. The headline-quote loop is built for rewatches. The cold test cohort decides in the first
  2 s, so re-render fix 1 (motion plus "Einstein" on frame 0) matters most here. TikTok search reads the caption and on-screen
  text, so "Did Einstein fail math?" in the first caption line is what makes it findable.
- **Instagram Reels:** sends per reach is the key signal. The sendable line is "6 was the top grade", so it has to be on screen
  (the cover note, the red sixes). Hashtags don't add reach. Use the 3:4 cover with "6 = best" inside the crop. Disclose the AI
  backdrop if Instagram asks (see POST_008).
- **YouTube Shorts:** "viewed vs swiped away" is judged on frame 0 and the first second. A still board with the name hidden is the
  weak spot. Put the search-phrase title on Shorts. 64 s is fine.
- **All platforms:** expect "actually he did fail" comments. The reel already says he failed the exam overall. Reply
  with the SOURCES.md line on which sections failed ("languages and the rest" covers both versions).

## Accuracy flags (CLAUDE.md)
- "Einstein failed French": don't. No pass mark for the 1896 scale is sourced.
- "6 = an A": don't put it on screen as a fact. Use "6 = best" (sourced: scale 1–6, 6 best).
- The face photo: only with a verified public-domain source added to SOURCES.md.
- "14 subjects · we read 4" and every caption figure above are already in the SOURCES.md facts table.

VIRALITY SCORE: 79/100 (7.9/10): can break out
