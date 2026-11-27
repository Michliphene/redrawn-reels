# Virality pass: UNGRADED #007 "14 reads lost to 3" (`reread-recall`, raea, DA 2)

Video `deliverables/ungraded/ungraded-007-recall-raea.mp4`, the render made after the pass-1 fixes (62.0 s, 1080×1920,
30 fps, −14.0 LUFS). The `pipeline/virality_metrics.py` script reads `out/<id>.mp4` and only sees cues declared in
`episode.json`. This reel's cues are in `recall.tsx`, so I took the same measurements with ffmpeg: hook frames at
0/0.5/1/1.5/2/3 s, first-vs-last SSIM, scene cuts, loudness, 1 fps contact sheets, and full-res frames at 25.5, 28.5–32.5
(the drain), 34.8 and 60.2–61.95 s (the loop tail).

This is a pattern-based estimate, not a prediction. The account's size and history matter more than anything in the edit.

## Objective metrics
| Metric | Value | Read |
|---|---|---|
| Duration | 62.0 s (voice 0.25–60.14) | over 60 s (counts for Creator Rewards); the tail holds "×?" for 1.2 s, then the title fades back in |
| Words / pace | 159 words, **2.80 w/s** | inside 2.5–3.2 |
| First word | 0.25 s | no throat-clearing |
| Hook beat | 0.25–5.12 s (4.9 s) | long, but sentence 1 ("One group read it fourteen times.") ends by about 1.9 s |
| Pixel scene cuts | 0 | expected for one continuous desk set; the camera moves between beats |
| Loop SSIM (first vs last) | **0.880** | full marks. The last frame is the frame-0 layout with "×?" in place of "×14" |
| Longest stretches with nothing new on the desk | hook 0–5.1 s (only the captions change), study 5.4–9.8 s (only the kicker "THE STUDY") | both at the very start, where swipes happen |
| Safe area | title 310–630, kicker about 318, captions 1170–1410, source line 1428 | ok. On frame 0 the right rail holds only the pad's ruled lines, no text |

## Scorecard
| Block | Pts | Reason |
|---|---|---|
| **A. Hook 0–3 s** | **21/25** | |
| Frame 0, paused and muted | 6/8 | "14 READS LOST TO 3" is big and works as a contradiction. Real 3D desk with depth (DA 2 ok). But the jars are empty, near-invisible glass, the bottom 40 % of the frame is bare wood, and nothing on the desk moves for 5 s |
| Concrete payload in sentence 1 | 6/7 | "fourteen times" vs "three", then a question with a clear answer type ("who remembered more?"). It does not speak to the viewer ("you") |
| Place & subject < 1.5 s | 4/5 | REREAD / RECALL cards, a book, a notepad: it reads as "studying" at once. "Recall · read it ×3" takes a second to parse |
| On-screen text ≤ 7 words | 3/3 | title 5 words, plus a whisper line |
| No throat-clearing | 2/2 | voice at 0.25 s, the series tag sits on the title, no logo |
| **B. Retention** | **20/25** | |
| New visual every ≤ 2.5 s | 5/8 | From 10 s on it is dense: the tally lights up, the book flips, the pad writes, WINS pops, the marbles fill, the calendar runs Day 1→7, the cards flip. The two holds at 0–5.1 and 5.4–9.8 sit exactly where viewers swipe away |
| Escalation, "but / therefore" | 5/6 | Textbook spine: rereaders win → feel surer → "But wait a week" → flip. After the payoff at 34.5 s it goes flat: about 21 s of cards (school, careful, do) |
| Mid-video re-hook | 4/4 | "But wait a week before the test, and it flips." at 29.1 s (47 %), with a rumble, the calendar and the ribbon changing lanes |
| Payoff not buried | 3/4 | The flip lands at 31.5–34.5 s, which is fine. The 9-second "Careful" beat afterwards is honest but a likely drop-off point |
| Pace & captions | 3/3 | 2.8 w/s, captions word by word, keywords highlighted |
| **C. Rewatch & loop** | **10/10** | |
| Last line completes the first | 5/5 | "How many times did group one read it?" → "One group read it fourteen times." The viewer's own recall is the loop, and the answer is now hidden until the restart |
| Last frame ≈ first frame | 3/3 | SSIM 0.88 |
| Frames worth pausing | 2/2 | the 40 % / 61 % + Day 7 frame and the 2013 HIGH/LOW card |
| **D. Shareability & saves** | **12/15** | |
| Send trigger | 5/6 | "Stop rereading your notes" is a myth that students send to each other. It would be stronger if the screen said "you" |
| Save value | 3/4 | The method is useful, but the "Do this" steps are only spoken over a reused jar shot. There's no 3-step card to screenshot |
| Honest comment trigger | 3/3 | the pop quiz invites "14!" comments with no bait |
| Emotional / human stake | 1/2 | "they feel surer" is a good human touch; no exam or "you" stake on screen |
| **E. Packaging** | **8/10** | |
| Cover as thumbnail | 3/4 | "READ IT 14×. FORGOT MORE." over 40 % / 61 % reads at thumbnail size. **But the cover files are stale** (11:07, before the 15:19 fix render): they still show the tiny "(other students, same method)" text and the pad over the RECALL jar |
| Caption keywords + hashtags | 2/3 | It leads with the hook well, but it's missing the terms people search: *active recall, testing effect, how to study, retrieval practice*. 8 hashtags (target 3–5) |
| Series identity | 3/3 | UNGRADED #007 tag on every frame, house kicker and card style |
| **F. Niche codes & trust** | **11/15** | |
| One visible transformation | 3/4 | The WINS ribbon jumps lanes, the cards go 83→40 / 71→61, the jars drain 25→12 / 18. The jars are small, half hidden behind the calendar, and **nobody is told what a marble is** |
| Familiar anchor | 2/3 | "14 reads vs 3", "a week before the test" are things every student knows, but nothing ties them to the viewer's own exam |
| Real face / stakes | 1/3 | no person and no exam on screen (acceptable for the format, but it costs points) |
| Sourced, hedged | 3/3 | Source on screen, Dunlosky on one line, "1 week later · new students", the "Careful" beat. All numbers match SOURCES.md |
| No anti-patterns | 2/2 | no logo, no "follow for more", voice above the music |

### TOTAL: 82/100 (8.2/10): can break out

## Top 5 changes, ranked by expected gain
All five are on screen, on the cover or in the caption. **No re-voicing.** Facts stay as in SOURCES.md.

1. **Make the first 5 s move and give the viewer a stake (+3: A frame 0 +1, B +1, D stake +1).**
   - The pass-1 #12 idea, still not done: draw the tally on "fourteen" (≈1.04–1.9 s), pop "×3" on "three" (2.60 s), and at
     "who remembered more?" (≈4.1 s) drop a "?" tag into each empty jar so the jars are visible from the start.
   - Speak to the viewer in the whisper line (on the frame-0 title and the cover):
     `"whisper": "Which one do you do?"` in `episode.json` (and the matching string in `recall.tsx` if it's hard-coded there).
     It's true, it involves the viewer, and it sets up the pop quiz at the end.
2. **Fill the 5.4–9.8 s "study" hold and explain the marbles (+2: B new visual +1, F transformation +1).** At "180"
   (≈7.6 s), pop `"180 students"` with a row of small figures. At "text." (≈9.5 s), pop a sheet
   `"The Sun · Sea Otters" / "30 ideas each"` between the jars. At "Five minutes later" (22.0 s), a small desk sign
   `"1 marble = 1 idea recalled"` until "flips". The marble counts are rounded illustrations (SOURCES.md already says so).
   Without the key, the jars drain but viewers can't read what they're losing.
3. **Re-export the cover from the current render, and tighten its claim (+1 E, protects trust).** The 9:16, PNG and 3:4
   files predate the fixes. Re-render `Cover()` (COVER_T = p61 + 0.6, which shows Day 7, 40 % / 61 %, WINS on RECALL).
   Text options:
   - keep `"Read it 14×.\nForgot more."` (fair at group level: 83→40 vs 71→61, but those are different students), or
   - **recommended:** `"Reread it 14×.\nRemembered less."`, which is exactly 40 % vs 61 % and takes no hedge.
   Make the whisper the same as fix 1: "Which one do you do?".
4. **Caption with search terms, 4 hashtags (+1 E).** See the caption section below. Also correct "≈61 s" → 62 s in POST_007.
5. **A "Do this" card worth screenshotting (+1 D save).** During `do` (52.66–56.45), replace the reused jar shot with a
   rule card in the same style as AT SCHOOL / CAREFUL: `1 · close the book` (on "close"), `2 · write what you remember`
   (on "Write"), `3 · check what you missed` (on "check", a red tick). The pad and pencil can stay in front. This is the
   frame people pause on and save. SOURCES.md already marks "check" as the reel's own advice, not the paper's.

If all five land, the score rises to about 89. What's left is structural: no face, and a 21 s tail after the payoff, which
only a re-voice could cut (e.g. merging "school" and "careful"). Don't do that for this episode.

## 3 alternative hooks (all true per SOURCES.md)
| Archetype | Verbal line (would need re-voicing) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **Myth-bust / second person** | "Rereading your notes feels like studying. In this experiment, it lost." | the Day-7 frame: REREAD 40 % in red, RECALL 61 % with the WINS ribbon, drained jars | **Rereading lost: 40% vs 61%** |
| **Big-number comparison** (current, improved) | "Fourteen reads lost to three." | the current frame 0 with the ×14 tally being drawn and a "?" in each empty jar | **14 reads vs 3. Who won?** |
| **In media res / reversal** | "Five minutes after studying, the rereaders win. A week later, it flips." | the 5-minute frame: WINS on REREAD 83 % vs 71 %, the calendar already flipping to Day 1 | **Winning at 5 min. Losing at 1 week.** |

The on-screen versions can go on the cover or a pinned-comment variant at no cost. The verbal lines only make sense
when the next episode in this format is being voiced anyway.

## Cover, caption, hashtags, pinned comment
- **Cover:** re-render `Cover()` from the current scene (≈35.1 s state: Day 7, 40 % / 61 %, ribbon on RECALL, pad folded
  away). Title `Reread it 14×. / Remembered less.`, whisper `Which one do you do?`. Use the 3:4 crop for the Instagram grid.
  Check that "40%" and "61%" stay below the title card in the 3:4 crop.
- **Caption (TikTok / Instagram):**
  ```
  They reread it 14 times and remembered less a week later than students who studied once, then tested themselves.
  Active recall vs rereading: the testing effect (Roediger & Karpicke, 2006). 5 min later: 83% vs 71%. 1 week later: 40% vs 61%.
  How to study for exams: close the book, write what you remember, check what you missed.
  #studytips #activerecall #studying #testingeffect
  ```
  (The hook line is 113 characters.)
- **YouTube Shorts title:** `They reread it 14 times and remembered less (active recall vs rereading)`.
- **Pinned comment:** keep the sourced summary from POST_007 and end with:
  `No scrolling back: how many times did group one read it? And before an exam, are you a rereader or a recaller?`

## Platform notes
- **TikTok:** keep the 62 s cut (it's over one minute). Completion and rewatch drive distribution, and the pop-quiz loop
  is built for both. Fix 1 matters most here because the cold test cohort decides in the first 2 s. Pick the cover
  in-app; TikTok search reads the caption and on-screen text, so the "active recall" line pays off.
- **Instagram Reels:** sends per reach is the key signal, so the "you" whisper and the 3-step card (fixes 1 and 5) are
  what get it sent to a study group chat. Hashtags don't add reach; 4 is plenty. Use the refreshed 3:4 cover; the stale
  one shows a caveat line nobody can read. Mark the AI backdrop if Instagram asks for disclosure (see POST_007).
- **YouTube Shorts:** "viewed vs swiped away" is judged on frame 0 and the first second, so the motion in the first
  5 s matters most here. The 62 s length is fine for Shorts. Don't cut the "Careful" beat for a shorter version: the
  hedge is what holds up against "one study proves nothing" comments.
- **All platforms:** the on-screen source line plus the pinned comment with both references covers the expected
  objections (separate students, recall of the same text, SSST left out). SOURCES.md "Debated points" has the answers ready.

## Accuracy flags (CLAUDE.md)
- Cover "Forgot more": defensible at group level, but the 5-min and 1-week scores come from different students.
  "Remembered less" says the same thing with no extra assumption. Recommended, not required.
- None of the proposed fixes adds a fact that isn't in SOURCES.md. "30 ideas each", "180 students" and the marble key
  are already listed there. The 3-step card repeats advice SOURCES.md already marks as the reel's own.

VIRALITY SCORE: 82/100 (8.2/10): can break out
