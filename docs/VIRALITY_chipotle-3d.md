# Virality review - RECEIPTS #006 Chipotle (raea render, 41.4 s)

Pattern-based estimate, not a prediction. Creator account size is the biggest factor we cannot control.
Evidence: frames at 0, 0.67, 1.5, 2.7 s, a 3 s contact sheet of the whole reel and the last frame (extracted with ffmpeg),
SOURCES.md, REVIEW_chipotle-3d.md (layout P1s not repeated here, except where they cost hook or loop points).
Method note: SSIM and cues_per_10s were not computed (virality_metrics.py not run on Windows). The loop is judged by eye.

## 1. Scorecard

| Block | Pts | Reason |
|---|---|---|
| A. Hook 0-3 s | 18/25 | Frame 0 is a title, a whisper and a small grey cylinder, with no number. Only the title says what it is, and the foil reads as a pipe, not a burrito (5/8). Sentence 1, "You pay Chipotle $10. The food? Under $3.", is a strong number plus contradiction (6/7). Chipotle is named in the title, but the object is ambiguous (3/5). Text is 4 words, but the whisper repeats the source line and is half-covered by the burrito (3/3 → 2.5). No throat-clearing (1.5/2). |
| B. Retention | 17/25 | A new thing (a piece, an amount, a meter step) lands about every 2 s in the cut, which is good (7/8). The structure is a clean subtraction countdown, but the middle plateaus because 5 similar cuts repeat (4/6). The re-hook is the tower/year set change at about 28 s, and it comes with no verbal "but" (2/4). The payoff, "restaurant costs nearly twice the food", is placed last, which is good (3/4). Pace is about 2.7 w/s and the captions are large, but they have orphans ("THE", "AROUND IT") (1/3 → 2). |
| C. Rewatch & loop | 7/10 | "Remember that next time… / You pay Chipotle $10" completes the loop, though "TIME…" is still on screen at the end (4/5). The last frame is close to frame 0, but the `$10` is half-faded and a caption is present (2/3). Frames are dense enough to pause only at the cut (1/2). |
| D. Shareability & saves | 9/15 | "Your $10 burrito: the food is under $3" is a clear send (4/6). The save value is a receipt series, but there is no on-screen summary to screenshot (2/4). The pinned question is honest, but nothing in the reel prompts a comment (2/3). The human stake is only "you" (1/2). |
| E. Packaging | 8/10 | The cover is readable, but it is title-led and the object is unclear (2/4). A caption is written below (3/3). The series bar "RECEIPTS #006" is consistent (3/3). |
| F. Niche codes | 12/15 | The split is very visible: slicing and a falling meter (4/4). The anchor is a Chipotle $10 everyone knows (3/3). The stake is "you the buyer"; there is no face, which is fine for the series (2/3). The 10-K is on screen, "our calc." is labelled and the profit is hedged as "before tax", but the source line wraps below y=1440 (2/3). Anti-patterns: weak frame 0, small mono labels (1/2). |

**TOTAL: 71/100 = 7.1/10. Tier: "can break out" (low end).**

## 2. Top 5 changes, ranked by expected gain

1. **Make frame 0 a number and a recognisable burrito (+5).** The hook line is strong, but the first 0.9 s show no `$10` and a grey tube.
   - Give the burrito a foil-wrap colour with a visible open end showing rice and beans, and enlarge it. See reel-review finding 8: `OPEN` 1.25 → 0.95.
   - Put the `$10` on frame 0 (big, lime), and keep it from the start rather than fading at 0.35 s. Voice says "$10" at 1.27 s, so the number is already read when it is said.
   - Drop the whisper during the hook (it duplicates the source line and is covered by the burrito), or move it under the burrito.
2. **Put a clean "money split" cue at the start: show the answer as a tease (+4).** Add at frame 0 a small thin bar "$2.96 food" next to the burrito, or fade a flash of the six coloured pieces for 0.4 s before "Let's cut it open". This pays the curiosity gap ("where does the rest go?") visually and gives the thumbnail a shape.
3. **Fix the mid-reel re-hook with a spoken "but" (+3).** At about 25 s, before "Across 4,000 restaurants", the hook line is lost. Change line 8-9 to keep facts identical: "And Chipotle keeps $1.62. Zoom out: across 4,000 restaurants, that's $1.9 billion of operating profit in 2025." No new fact. This announces the camera pull-back. Alternatively add a short sting: the pieces stop and the camera cuts at "Zoom out".
4. **Close the loop properly (+3).** Apply reel-review finding 9: remove the "TIME…" caption before the final frame (`t < DUR - 0.5`), pin the `$10` at the frame-0 position from `DUR - 1.15`, and bring the title in earlier. Then the last frame is frame 0 and the first word "You pay Chipotle $10" completes "Remember that next time…". Gain on both rewatch (C) and completion.
5. **End on a screenshot-able summary and a comment trigger (+3).** Between 35 and 38 s the camera shows two towers: food $2.96 vs restaurant $5.42. Hold this for 1.5 s with both numbers (the second marked "our calculation") so viewers can screenshot it. Then ask honestly in the pinned comment (already: "Which receipt should we open next?"). Better, tie it to the payoff: "Which chain should we open next: Starbucks, McDonald's or Spotify?" Only if those are in the backlog.

Also do (small, +1 to +2 each): reel-review P1s 1-5 (the safe-area source line, label collision, late amounts, captions, orphan "THE"). The source-line wrap is the trust cue; make it one line.

## 3. Three alternative hooks (all supported by SOURCES.md)

1. **Big number / contradiction.** Voice: "You pay Chipotle ten dollars. The food is under three." (same facts, drop the question mark.) Frame 0: an open burrito on the plinth with a fat lime `$10` and an amber `$2.96` slice already pulled out. Text: "FOOD: UNDER $3".
2. **Second person / receipt.** Voice: "Here is your $10 Chipotle bill, line by line, from the annual report." Frame 0: the burrito laid on a receipt-style ruler with the lime meter "$10.00 LEFT OF YOUR $10" top-left. Text: "YOUR $10, ITEMISED".
3. **Question with a defined answer.** Voice: "Where does your Chipotle money go? Not where you think." Only if the "not where you think" does not claim a surprise: keep to "Where does your $10 at Chipotle go? Six places. Let's cut it open." Frame 0: the burrito already sliced into six coloured discs in a row. Text: "6 PLACES, $10".

Avoid: any wording that implies Chipotle is overpriced or that the margin is unusual (SOURCES says no claim).

## 4. Cover, caption, hashtags, pinned comment

- **Cover:** compose a still at about 6.5-7 s, once the burrito is sliced and the meter reads "$10.00". Better: build a dedicated frame with the burrito at the slice moment (pieces parted, amber/red/blue/purple), the title "WHERE YOUR $10 GOES" at the top and `$2.96` on the amber piece. Keep everything inside y 250-1440 and x < 930 so it survives the 3:4 grid crop.
- **Caption (≤150 chars hook line):** "Your $10 Chipotle order: the food is under $3. Here's the rest, from the 10-K."
  Line 2: "Where Chipotle's money goes per $10 of revenue, FY2025 annual report (SEC). Labor, rent, food, profit. Per-$10 split is our calculation."
  Line 3: "Chipotle burrito cost breakdown, restaurant labor cost, operating profit explained."
- **Hashtags (3-5):** #chipotle #receipts #moneyexplained #finance #foodcost
- **Pinned comment question:** Use the pinned text in SOURCES.md and end with "Which receipt should we open next: Starbucks, McDonald's or Spotify?" (only list ones in the backlog). Add "Profit here is before interest and tax; after tax it is $1.29 per $10." to head off the first comment pile-on.

## 5. Platform notes

- **TikTok:** 41 s is fine. Search leans on caption and on-screen words, so say "Chipotle" in the caption and keep "CHIPOTLE" in the first caption. Completion and rewatch matter most, so the loop fix (change 4) is the main lever. A 61-70 s cut for Creator Rewards would be a different edit (e.g. add a delivery and an after-tax beat), not a stretched one.
- **Reels:** Sends per reach is the key signal, so the caption and the end card should say "send this to the person who orders a bowl every week". Hashtags do not help reach; keep 3. Keep the burrito and numbers inside the centre 4:5 crop for the profile grid.
- **Shorts:** the swipe-away decision happens at 1-2 s, so change 1 (a number and a recognisable burrito on frame 0) matters most here. Put the title as the first on-screen words ("YOUR $10 AT CHIPOTLE") and keep the source line on one line above the Shorts caption area (y < 1440).

Never posted; owner go required. All fixes keep the facts identical to SOURCES.md. None bends the truth, and "keeps" must stay labelled operating profit before tax.

VIRALITY SCORE: 71/100 (7.1/10) - can break out
