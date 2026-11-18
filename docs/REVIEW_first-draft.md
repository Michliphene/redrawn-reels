
## Virality review (pass 1, out/first-draft.mp4, 44.9 s, notebook cut)

This is a pattern-based estimate, not a prediction. The account's size and how its first test cohort reacts matter
more than anything below. Playbook §7 (maps) is skipped. Block F is read for a mindset reel: one visible
transformation (4), a familiar anchor (3), a real face or stake (3), sourced and hedged (3), no anti-patterns (2).
Frame grids were made in a private scratch folder, so `out/review/first-draft/` was not touched.

Metrics (`pipeline/virality_metrics.py`, run against the 23:39 render):
- Pace and hook: 134 words at 3.27 words/s. The first word lands at 0.25 s and the hook sentence lasts 2.46 s.
- Cues: 5.8 cues per 10 s. 1 of 22 two-second windows has no cue. The longest gaps are 3.83 s at 26.2 s, 3.14 s at
  32.6 s and 2.7 s at 2.2 s.
- Loop and sound: loop SSIM 0.857, −14.2 LUFS.

The frames are emptier than the cue count suggests. From 21.4 to 23.0 s the page is blank: the versions page slides
in, but nothing is drawn until "Draft one" at 23.1 s. From 32.9 to 35.8 s the "= material" card sits still. From
28.4 to 30.0 s ("Same person. Same letter.") nothing moves.

### Scorecard
| Block | Pts | Why |
|---|---|---|
| A. Hook 0–3 s | **23/25** | Frame 0 (6/8): it reads paused and muted. The title "HE REWROTE ONE ENDING 39 TIMES", the writer at his desk and the stack of crossed-out "The End" pages are all visible. But the figure is small, the page is flat (§9), and the bottom 40 % is empty paper. From 2.2 to 2.7 s the "39" count-up draws on top of the whisper, which is still fading out ("24" over "Your first draft…"). Payload (7/7): a famous name, a number and a precise unit ("one ending"). Subject < 1.5 s (5/5): "HEMINGWAY" is captioned at 0.25 s. Text (3/3): 6 words, and it reinforces the voice. No throat-clearing (2/2). |
| B. Retention | **17/25** | New visual (5/8): the hook, the falling grades, the bin with the paper plane and the duel's bulbs all keep moving. Three holes: the blank page at 21.4–23.0 s, the static card at 32.9–35.8 s, and 28.4–30.0 s. Escalation (4/6): "That's his count. His papers hold 47" is a real but/therefore twist at 3 s. After that the reel drops Hemingway for good. The cover-letter hypothetical (21–31 s, 22 % of the reel) is a low-stakes plateau, and the principle beat restates rather than escalates. Re-hook (3/4): the page flip on "flip." (17.4 s, 39 %) works. The 50 % mark falls on the blank page, though, and the card turn at 32.6 s is the only other interrupt. Payoff (3/4): "10 fixes vs 1 grade" lands on screen with the bulbs. But the strongest fact (47 > 39) is spent at 5 s and never comes back, so the ending is a generic maxim. Pace (2/3): 3.27 w/s, just over the 3.2 ceiling. The captions keep up. |
| C. Rewatch & loop | **9/10** | "…remember…" leads into "Hemingway rewrote one ending 39 times" (5/5). SSIM 0.857 (3/3): the end scene returns to the desk and the title fades back in. Pause value (1/2): the 39/47 pair with its credits is worth a re-read, but there are fewer handwritten asides than in #001. |
| D. Shareability & saves | **11/15** | Send (5/6): "Hemingway said 39 rewrites, and his papers hold 47" is a clean "I didn't know that", and every writing student, NaNoWriMo crowd and anyone with a cover letter due is an obvious recipient. Save (2/4): a quotable line and series #002, but nothing to keep as a reference. Comment (2/3): the pinned question is honest, but the reel itself asks nothing. Human stake (2/2): the yellow figure slumps under the F and finds its voice in draft 3, and "you" is spoken and highlighted. |
| E. Packaging | **8/10** | Cover (3/4): frame 0 with `cover: true` works. Out of context, though, "HE" is anonymous in a profile grid. Caption (3/3): written below. Series identity (2/3): the "UNGRADED #002" tape is there, but nothing tells viewers why to follow. |
| F. Niche codes & trust | **12/15** | Transformation (4/4): "First draft = verdict" flips to "= material", the F test goes into the bin, and the drafts turn into bulbs. Anchor (3/3): Hemingway, school grades and a cover letter. Face/stake (2/3): a real person is named but never shown as himself. The stick figure has no beard and no name tag. Sourced and hedged (2/3): on screen it is exemplary ("his own count, 1958", "some just a line, 2012", source line). But the source row for 47 in SOURCES.md cites an NPR piece whose headline it quotes as "39 Different 'Farewells'". Until the owner confirms the 47 in the edition or the article body, the one twist the reel depends on hangs on a citation that appears to say otherwise. Anti-patterns (1/2): the count collides with the whisper at 2.2–2.7 s, and the page is blank at 21.4–23.0 s. The "Same you, 3 tries" sticky hides the draft-3 figure's head (30–31.5 s), and "Draft 1 is step 1" wraps to an orphan "1" over the bulbs (39–40.5 s). |
| **TOTAL** | **80/100 (8.0/10)** | **can break out** (3 below #001's 83). The hook is stronger than #001's: a real name and a hard number, where #001 opened on a poster line. The gap is all in the middle: a 10-second hypothetical plateau, and a payoff that forgets the Hemingway twist. |

### Top 5 changes ranked by expected gain
1. **Pay the hook off: bring Hemingway back before the loop (+3: B escalation +1, B payoff +1, D send +1). Needs a
   re-voice of one line.**
   - Replace line 11, "Bad is the first step, not the last word.", with "Even Hemingway's ending took 39 rewrites."
     ("rewrote … thirty-nine times before I was satisfied", Paris Review 1958: same fact, same number.)
   - Beat `step` in `episode.json` becomes:
     ```json
     {"id":"step","scene":"end","say":"Even Hemingway's ending took {39|thirty-nine} rewrites.",
      "actions":[{"type":"count","value":39,"label":"rewrites of one ending","sub":"his own count, 1958","dur":0.6,"atWord":"39"}]}
     ```
     The `loop` beat stays on scene `end`, so the desk is already in place for the loop and the SSIM should rise.
   - It also brings the word count down by 2, toward 3.2 w/s.
   - Wording to avoid: "his first draft was bad" or "it made him great". Neither is in SOURCES.
   - No-re-voice fallback (+1): on the `loop` beat, add a second sticky `"39 tries. 47 in his papers."` at `"atWord":"remember…"`.
     It restates SOURCES rows 1–2.
2. **Fill the three dead stretches (+2: B new visual +2). JSON plus one small panel change, no re-voice.**
   - 21.4–23.0 s: in the `versions` panel (`src/doodle/panels.tsx`), draw an empty sheet titled "cover letter" from
     the scene's start. The `draft` actions then fill it, and the page is never blank. JSON-only alternative: fire
     draft 1 at `"atWord":"cover"` (21.82 s).
   - 32.9–35.8 s, beat `principle`: add a sticky on the rule card's free ground. It restates the script, it is not a fact:
     ```json
     {"type":"callout","text":"No page, nothing to fix","atWord":"never","hold":1.3}
     ```
     Then set `scenes.rule.callout` to about `[560, 840]`. Check on stills that it clears the card and the x=930 rail.
   - 28.4–30.0 s, beat `same`: fire the sticky on `"atWord":"Same"` (28.13 s) instead of "Three".
3. **Clean the hook frame and frame 0 (+2: A frame 0 +1, F anti-patterns +1). No re-voice.**
   - Beat `hook`: set the 39 count to `"atWord":"That's"` (2.99 s), or make the title fade finish before the count
     draws. The number is already in the title, so nothing is lost before 3 s.
   - In the `drafts` panel, give the writer a doodled moustache and a handwritten "Hemingway" tag with an arrow.
     This identifies the subject on the paused frame and the cover, and it is not a fake portrait.
   - Raise the stage or scale it about 1.3×, so the desk and the "The End" stack fill the empty lower page.
4. **Fix the two sticky slips (+1: F anti-patterns). JSON only.**
   - `same` sticky: move `scenes.versions.callout` to about `[560, 280]`, above the draft-3 figure's head (≈ y 420).
     If it doesn't fit, end it before draft 3's check.
   - `step` sticky (if fix 1 isn't taken): change the text to `"Draft 1 = step 1"` so it fits on one line. Move
     `scenes.duel.callout` clear of the bulb arc, e.g. `[64, 330]`.
5. **Cover, name and follow cue (+1.5: E cover +1, E series +0.5). Packaging only.**
   - For the cover, render frame 0 with `cover: true` and the title "HEMINGWAY REWROTE ONE ENDING 39 TIMES" (6 words
     with the name). Use it only for the cover/thumbnail export, or as the title, if the owner accepts losing the
     "He…?" curiosity in-feed.
   - Add "UNGRADED · one rule school never taught" to the end card's tape, or to the caption.

**Before posting, whatever is chosen (trust, not points):** tick the 47 against the 2012 Hemingway Library Edition or
the body of a press piece. The NPR row as written quotes a "39" headline. If the 47 can't be confirmed, line 2 has to
change (re-voice), because the reel's twist rests on it.

Together: about +9.5 (+7.5 without the re-voice). That gives about 88–89 with the re-voice and about 86 without.
Treat the top of that range as optimistic.

### 3 alternative hooks (all true per SOURCES.md)
| Archetype | Verbal line | Frame 0 | On-screen text (title / whisper) |
|---|---|---|---|
| **Contradiction / big number** (re-voice) | "Hemingway said he rewrote one ending 39 times. His papers hold 47." | Both counts already on the page: "39" in ink, struck through in red, "47" beside it, the "The End" stack behind | `HE SAID 39. HIS PAPERS: 47.` / *One ending. Some just a line.* |
| **Guess-before-the-count** (re-voice) | "How many times did Hemingway rewrite the last page of A Farewell to Arms?" | The writer at the desk, a counter showing "?" over the stack. It counts up on the answer at about 3 s, and the reel must pay it off on screen. | `GUESS HOW MANY REWRITES` / *One page. One book.* |
| **Second-person myth-bust** (voice unchanged; title/whisper swap only) | Current line: "Hemingway rewrote one ending 39 times." | The yellow student slumped over a test marked F, with the "The End" stack on the next page edge | `YOUR FIRST DRAFT IS SUPPOSED TO BE BAD` / *Hemingway rewrote one ending 39 times.* |

Keep any year other than 1958 and 2012 off screen. Don't say "masterpiece", "Nobel" or "his best book": none of
them are in SOURCES, and the last one is debatable.

### Cover, caption, hashtags, pinned comment
- **Cover:** frame 0 with `cover: true` (title at full opacity, no caption, no count overlap). Better: the same frame
  after fix 3 (named, larger stage). Second choice: the 5.5 s frame with "39" and "47" side by side and their
  credits. It spoils the twist, but it reads instantly in a grid.
- **Caption (hook line):** Hemingway said he rewrote one ending 39 times. His papers hold 47. Your first draft is supposed to be bad.
  - Writing tips for essays, cover letters and novels: why a bad first draft is normal, and why school taught you otherwise.
  - Sources: The Paris Review, 1958 (his count) · A Farewell to Arms, Hemingway Library Edition, 2012 (47 endings).
- **Hashtags:** #writingtips #hemingway #firstdraft #mindset #studytips
- **Pinned comment:** the SOURCES.md text as written ("…What's the draft you almost threw away?"). Optional second
  question for an honest split: "Or do you get it right the first time? Tell us how."

### Platform notes
- **TikTok:** 44.9 s is fine. Don't stretch to 61 s for Creator Rewards: the plateau would grow. #WritingTok and
  BookTok are a ready-made cohort, so put "writing" and "Hemingway" in the first caption line (search reads the
  caption and on-screen text). Use the original sound.
- **Instagram Reels:** sends decide reach to non-followers. Name the recipient in the caption: "send this to the
  friend stuck on draft one." Set the cover manually: Reels crops to 3:4 in the grid, and the title already sits
  inside it. No watermark. Hashtags are for topic only.
- **YouTube Shorts:** "viewed vs swiped" is decided in the first second, so fix 3 (no overlap, named figure, fuller
  frame) matters most here. Title field: "Hemingway rewrote one ending 39 times (his papers hold 47)". The loop
  drives replays, and the SSIM already passes.

VIRALITY SCORE: 80/100 (8.0/10) — can break out

## Reel review

Video `out/first-draft.mp4` (44.9 s, voice ends 44.32 s) · `npm run validate first-draft`: ok, 0 ✗ / 0 !.
**Verdict: not postable yet, but close (7/10).** The story reads at a glance: 39 vs 47, A→F test, the flip, the bin, three
drafts, verdict → material, 10 drafts vs 1 try. The loop is clean: the last frame (44.6 s) brings back the title and
whisper over the same writer scene as frame 0. 39 and 47 match `SOURCES.md`, and so do 1958 and 2012.
**Three biggest problems:** (1) "sounds like you" crosses the right rail (x≈960 at y≈1020). (2) Three overlaps in the
first 20 s: the count over the whisper, a flying page over the 47 sub-line, the check mark over "nobody grades these".
(3) A static stretch of about 2.9 s in `principle`, plus about 1.7 s on an empty page at the start of `example`.

1. **[P1] example/same · 26.5–30.9 s · safe area.** The draft-3 label "sounds like you" is centred at panel x 825
   and runs to x≈960 at y≈1020, under the platform rail (x>930 below y 860). The word "you" is covered on TikTok/Reels.
   Fix (JSON): `{"type":"draft","label":"like you","atWord":"three"}`, or in `panels.tsx` `VersionsPanel` set
   `const VX = [195, 490, 780];` (the cheering Guy at `VX[2]+40` moves with it).
2. **[P2] hook · 2.21–2.71 s · overlap.** The 39 count starts on "times." while the title and whisper are still on
   screen (they fade 2.46–2.71). The digits from 13 to 39 sit on top of "Your first draft is supposed to be bad."
   Fix (JSON): move the count to the next beat so it lands on "That's his count". Remove it from `hook` and make it the
   first action of `twist`: `{"type":"count","value":39,"label":"rewrites of one ending","sub":"his own count, 1958","dur":0.6,"atWord":"That's"}`.
   Frame 0 already shows "39 TIMES" in the title, so the hook does not need it.
   (Component alternative: in `Doodle.tsx`, start the `titleO` fade at `min(hookEnd, firstCount.t) - 0.3`.)
3. **[P2] twist · 4.9–7.0 s · overlap.** The looping page that flies from the desk to the pile
   (`DraftsPanel`, arc `- Math.sin(fly*π)*60`) passes through "endings in his papers / some just a line, 2012".
   Fix: in `DraftsPanel`, once `counts.length > 1 && t >= counts[1].t`, lower the arc to `*15` and the path to
   `lerp(930, 900, fly)`. Or move the three count lines up 30 px (y 680/748/796 → 650/718/766).
4. **[P2] graded · 19.8–21.1 s · overlap.** The mint check (`Check x=640 y=830`) is drawn over "these" in
   "nobody grades these". Fix (JSON): `"ignoreLabel": "ungraded"` (shorter, and it names the series). Or in
   `BinPanel` move the check to `x={730} y={760}`, next to the paper the receiver holds.
5. **[P2] principle · 32.64–35.50 s · 2.9 s static.** Nothing changes after the card turns, while the voice says
   "And you can't fix a page you never wrote." Fix (JSON) on `principle`:
   `{"type":"callout","text":"No page, no fix","atWord":"fix","hold":1.2}` and on scene `rule`: `"callout": [560, 420]`
   (above the card, clear of the header since this beat has no kicker).
6. **[P2] example · 21.38–23.08 s · 1.7 s empty page.** "Picture a cover letter" plays over a blank page until
   "one". Fix (JSON): `{"type":"callout","text":"Cover letter","atWord":"cover","hold":1.5}` (gone before draft 1 lands
   at 23.08).
7. **[P2] all beats · source line · safe area / size.** `PARIS REVIEW (1958) · HEMINGWAY LIBRARY ED. (2012)` spans
   y 1422–1444, 4 px past the 1440 limit, at 26 px (under the 28 px floor). Fix (`Doodle.tsx`):
   `top: ZONES.captions.bottom - 8, fontSize: 28, lineHeight: 1` (the captions in this reel end around y 1350, so
   nothing collides).
8. **[P2] same · 30.07–31.47 s · sticky covers draft 3 and lingers.** "Same you, 3 tries" sits on the cheering
   figure's head. Its `hold: 1.4` carries it into the page turn to `principle` (31.11 s). It wraps as "Same you, 3 / tries".
   Fix (JSON): scene `versions` `"callout": [440, 415]`, action `"text": "Same you, 3 tries", "hold": 0.9`
   (`Sticky` splits on plain spaces only, so NBSP keeps "3 tries" together).
9. **[P2] step · 39.37–40.87 s · orphan wrap + covers bulbs.** "Draft 1 is step / 1" (the `Sticky` wraps at 15 chars).
   The note also hides the top of the lightbulb arc over the left figure. Fix (JSON):
   `"text": "Bad = step 1"` (one line) and scene `duel` `"callout": [64, 380]`.
10. **[P2] accuracy · SOURCES.md.** As logged, the NPR headline reads "New Edition Includes 39 Different 'Farewells' To
    Arms", yet it is cited as the source for **47**. A commenter could use that against us. Before posting, the owner
    must quote the sentence with "47" from the 2012 edition (Simon & Schuster page or the edition's introduction) in the facts
    table. If no source says 47 in black and white, use neutral wording on screen ("DOZENS MORE IN HIS PAPERS").
    39 (Paris Review 1958, "the last page of it, thirty-nine times") is fine. The label says "his own count", which is right.
11. **[P3] flip · 16.20–17.43 s · kicker ahead of the visual.** "REAL-WORLD RULES" appears on "But" while the F test is
    still on screen, so the kicker contradicts the picture for about 1.2 s. Fix (JSON): `flip` beat `"kicker": "School rules"`
    and let `graded` introduce "Real-world rules" just after the page flips.
12. **[P3] flip · 17.4–18.0 s · backing box past the rail.** The paper box behind "THE RULES FLIP." reaches x≈954.
    It holds no text, but clamp it to `SAFE.railX` anyway for consistency.
13. **[P3] contrast/step · 36.6–41.1 s · "B" reads sideways.** The held card rotates the grade about 100°, so it reads
    as a squiggle. Counter-rotate the glyph in `DuelPanel` so the B stays upright (±15°).
14. **[P3] loop · 42.89–44.0 s.** The "Bad first draft = normal" sticky answers the sentence before "remember…" does
    and makes the loop less tight. Cut it (the pile and the writer already carry the moment), or shorten it to
    `"text":"Normal."`, `"hold":0.8`.

Sync check: every count, mark, flip, draft and light lands on its word (±0.1 s). Header chip top at y 263 (≥250 ✓).
Captions y about 1230–1350 ✓. Nothing readable right of x 930 under y 860 apart from #1.
