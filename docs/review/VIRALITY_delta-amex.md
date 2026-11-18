# VIRALITY — `delta-amex` (RECEIPTS #005, DA 2, Money) — pass 1

Rendered: `out/delta-amex.mp4` (44.2 s, −14.2 LUFS). Evidence: `pipeline/virality_metrics.py delta-amex`,
hook frames 0–3 s, loop image, beat sheets plus my own frame grabs at 4.4, 7.5, 11.5, 19.5–22.5, 24, 29.5–43.4 s.
(The `beat_*` sheets in `out/review/delta-amex/` were partly overwritten by a concurrent run, and `beat_05` failed
because of the apostrophe in "that's" in ffmpeg drawtext. I checked those beats from my own frame grabs instead.)

**This is an estimate based on patterns, not a prediction.** The size of the creator account matters most, and we can't control it.

Key metrics: first word 0.25 s · number spoken at 0.85 s · hook sentence 5.68 s · 109 words, 2.7 w/s · 24 cues,
5.4 cues/10 s · gaps without a new cue 3.34 s (34.0 s), 3.19 s (20.2 s), 3.17 s (10.2 s) · 2 of 22 two-second
windows empty · loop SSIM 0.83.

## 1. Scorecard

| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **22/25** | Frame 0 already reads paused and muted: series badge, a 6-word title ("DELTA'S BIGGEST CHECK ISN'T A TICKET"), a huge lime $8.2B and the plane on a plinth (8 → 6: the crane-start framing crops the receipt and coins at the right edge and the plane is small and dark). "$8.2B" is spoken at 0.85 s, but the contradiction ("Not from your ticket") lands at 4.0 s, after the gate (7 → 6). Delta is named on frame 0 and in the first word (5/5). The title is ≤7 words and reinforces the hook (3/3). No throat-clearing (2/2). |
| B. Retention | **19/25** | Cue density is good (5.4/10 s), but there are three holes over 3 s. The worst is `hundred` (10.2–13.4 s): a dim, empty grid while the voice says "First, follow $100…" (8 → 5). Escalation works ($9 kept → $5.8B → card $8.2B > profit → "it works both ways" → $10B target), but the 12-second "lesson" detour (10–22 s) has no card in it and sags (6 → 4). The re-hook "Now the card" at 53 % plus a second twist at 66 % is textbook (4/4). The payoff lands at 27 s, though the hook gives away the $8.2B before the viewer knows the profit (4 → 3). Pace is 2.7 w/s and captions are clean (3/3). |
| C. Rewatch & loop | **7/10** | "…you're a swipe. Which is how… / Delta got $8.2B last year" closes grammatically, but it sounds a little stitched together (5 → 4). SSIM 0.83, just under 0.85: the whisper and the "WHICH IS HOW…" caption are on the last frame but not on frame 0 (3 → 2). Most frames are sparse. Only the bars frame (27 s) is worth pausing on (2 → 1). |
| D. Shareability & saves | **12/15** | Strong send line: "Amex paid Delta more than Delta's entire operating profit" ("airlines are banks" with a 2025 number) (5/6). Save value is moderate: there's the $100 split, but no reference frame summing it up (2/4). The pinned question ("Do you have the card — would you still pick Delta without the miles?") is honest and identity-based (3/3). "You're not just a seat. You're a swipe." gives the human stake (2/2). |
| E. Packaging | **9/10** | No cover has been chosen yet, but the 27.5 s bars frame and the 2 s hook frame both work as thumbnails (4 → 3). No caption exists, so I wrote one below and scored that version (3/3). The RECEIPTS #005 badge and lime accent give series identity (3/3). |
| F. Niche codes & trust (RECEIPTS) | **12/15** | One visible split: 91 red stacks against 9 amber ones, then $5.8B against $8.2B bars (4/4). The anchors are $100, your ticket and your credit card, which everyone knows, but there's no real price anyone recognises, like a fare or an annual fee (3 → 2). Human stake: "your ticket / your credit card / miles you earn / you're a swipe" (3/3). The source footer stays on screen the whole time, but the computed $91/$9 is not labelled "our calculation" on screen, only in the pinned comment (3 → 2). Anti-patterns: two gaps over 3 s, the backwards sticker "TICKET / not from your", and the target callout covering the stat sub-lines (2 → 1). |
| **TOTAL** | **81/100 · 8.1/10** | **Tier: can break out** |

## 2. Top 5 changes, ranked by expected gain (cue-level, no re-record)

**1. Close the three gaps over 3 s (+3: B new-visual, F anti-pattern).** Every new figure below is already in SOURCES.md.
```json
// beat "hundred": actions (currently empty). Gives the 10.2–13.4 s hole something to read and states the scaling honestly
{ "type": "callout", "text": "EACH SQUARE = $1 OF DELTA'S REVENUE", "atWord": "follow", "hold": 1.6, "size": 44 }

// beat "year": add, fills 20.2–23.4 s and puts the fiscal year and GAAP basis on screen
{ "type": "callout", "text": "GAAP OPERATING INCOME · FISCAL 2025", "atWord": "operating", "hold": 1.2, "size": 40 }

// beat "both": add, fills 34.0–37.4 s with a send-able restatement (21 % ≈ 1 in 5)
{ "type": "callout", "text": "≈ 1 IN 5 DOLLARS AMEX LENDS", "atWord": "lends.", "hold": 1.0, "size": 46 }

// beat "target": fire the callout on "now" instead of "aiming" (≈0.3 s earlier)
{ "type": "callout", "text": "NEXT TARGET: $10B A YEAR", "atWord": "now", "hold": 2.0, "size": 50 }
```
Also move `"NOW: THE CARD"` from `"card."` to `"Now"`. That fires about 0.3 s earlier and stops repeating the caption word for word.

**2. Label computed figures on screen (+2: F trust, D share-safety).** The RECEIPTS rule is "computed figures labelled 'our calculation'".
```json
// beat "costs" → fill
"label": "fuel, crews, planes… · our calc."
// beat "keep" → rest
"label": "operating profit · our calc."
```
If the legend column truncates these, put `"· OUR CALC."` on the `$57.5B OF COSTS IN 2025` callout instead.

**3. Frame 0 = the 1.0 s framing, and the whisper visible from frame 0 (+2: A frame-0, C loop SSIM).** This is a component
change in `src/money/Money3D.tsx` (intro crane). Start the crane at the framing it reaches at about 1.0 s, so the plane,
receipt and coins all sit inside the frame and nothing is cropped at the right edge. Then render the `whisper` from frame 0 rather than
fading it in. The last frame already shows it, so first and last frames should match closely enough to push SSIM past 0.85. Before
changing the component, try a `scenes.plane.camera` override (`{"pitch": …, "yaw": …, "fov": …}`) on stills.

**4. Fix the reversed sticker (+1: A on-screen text, F anti-pattern).** Right now it reads "TICKET / not from your" (big word first,
label under it).
```json
{ "type": "ghost", "text": "NOT TICKETS", "label": "WHERE THE $8.2B CAME FROM", "atWord": "ticket.", "hold": 1.2 }
```

**5. Stop the target callout covering the stat sub-lines, and add a saveable end-card frame (+2: F anti-pattern, C/D pause value).**
At 37–39 s, `NEXT TARGET: $10B A YEAR` sits on top of "worldwide · 2025 / Dec 31, 2025". Give the callout a lower `y`
(check with `npm run stills delta-amex -- --props '{"guides":true}'`; stay above 1170). If it won't fit, shorten it to `"NEXT: $10B A YEAR"`.
For save value, the `point` scene could carry a small Mono recap under "A SWIPE": `$63.4B revenue · $5.8B op. profit ·
$8.2B from Amex · FY2025`. That would be a component change in the `lines` scene.

Expected total with all five: **≈ 89–90/100**.

**Voice (optional, needs a re-record, about +2 on A):** the contradiction arrives at 4.0 s. A tighter first sentence lands both the
number and the contradiction inside 3 s, with the same facts:
> "Delta got {$8.2B|eight point two billion dollars} last year from a credit card. Not a ticket."

Only worth it if the voice is being re-recorded anyway. The current hook already clears the number gate at 0.85 s.

**Fact flag (not a virality fix):** the title says "Delta's **biggest** check". SOURCES.md doesn't contain a line showing that
Amex is Delta's single largest payer. The 10-K or release language ("most valuable partnership", or the remuneration
size compared with other partners) should be added to the facts table before posting. Otherwise, change the title to
`"Delta's $8.2B check isn't a ticket"`, which is just as strong and needs no extra claim.

## 3. Three alternative hooks (all true per SOURCES.md)

| Archetype | Verbal line | Frame-0 visual | On-screen text |
|---|---|---|---|
| **Comparison** | "American Express paid Delta more last year than Delta made in operating profit." | The `bars` station with both columns already up ($5.8B amber, $8.2B lime) | `THE CARD > THE PROFIT` |
| **Second person / question** | "Every time you swipe a Delta card, Amex buys miles from Delta. Last year: $8.2 billion." | The `card` station, close and low, card filling the stage | `WHO GETS PAID WHEN YOU SWIPE?` |
| **Big number** | "$8.2 billion. That's what one credit card paid one airline in 2025." | Current product frame, $8.2B pulsing on frame 0 | `$8.2B FROM ONE CARD` |

(Avoid the tempting "airlines don't make money flying" myth-bust. Delta doesn't disclose a split between flying and the card, so it would be an invented claim.)

## 4. Cover, captions, hashtags, pinned comment

**Cover frame:** about 27.5 s (bars: $5.8B against $8.2B, "PAID BY AMERICAN EXPRESS"). This is the one frame that explains the reel without sound.
Cover text (top band, Display, ≤6 words): **"AMEX PAID MORE THAN DELTA'S PROFIT"**. Fallback if a single frame has to serve
as both first frame and cover (Shorts): 2.0 s hook frame with title + $8.2B.

**TikTok caption**
> Delta's $8.2B check didn't come from a ticket.
> Delta Air Lines American Express SkyMiles card deal explained, 2025 10-K numbers.
> Airline profit vs credit card money: where $100 of Delta revenue goes.
> #delta #americanexpress #creditcards #airlines #personalfinance

**Instagram Reels caption** (keywords in the text, hashtags kept to 3. Send-bait line first)
> Amex paid Delta more than Delta made in operating profit. Send this to your points friend.
> Delta SkyMiles Amex card: $8.2B in 2025 vs $5.8B operating profit (Delta 10-K).
> How airlines make money from credit cards, every number sourced.
> #delta #americanexpress #creditcardpoints

**YouTube Shorts title + description**
> Title: Delta's Biggest Check Isn't a Ticket ($8.2B from Amex)  (use "Delta's $8.2B Check…" if the fact flag isn't cleared)
> Description: Delta Air Lines got $8.2B from American Express in 2025, more than its $5.8B operating profit.
> Sources: Delta 10-K FY2025, Amex 10-K 2025. #delta #americanexpress #airlines

**Pinned comment:** keep the SOURCES.md text, and end on this question:
> "Do you have the card, and would you still pick Delta without the miles?"

## 5. Platform notes
- **TikTok:** 44 s suits completion. Completion plus rewatch is the lever, so the SSIM fix (#3) matters most here. Creator Rewards
  (>60 s, unverified) would need a different 61–70 s edit, for example adding the "more than 1 million new cardholders" line
  (already in SOURCES.md), not a slowed-down version. Leave the on-screen title as is. TikTok search reads it.
- **Instagram Reels:** sends per reach is the signal. Make the comparison the first line of the caption ("Amex paid Delta more than…"),
  pick the 27.5 s cover in-app, and use 3 hashtags at most (they don't add reach). No TikTok watermark.
- **YouTube Shorts:** the gate is "viewed vs swiped away", so frame 0 is the cover. Fix #3 (no cropped set on frame 0) pays
  off most here. Put "$8.2B" in the title for search. The loop tail ("Which is how…") feeds Shorts auto-replay well.

VIRALITY SCORE: 81/100 (8.1/10) — can break out
