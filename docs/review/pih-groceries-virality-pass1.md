# Virality review: pih-groceries ("PRICED IN HOURS" ep. 1, "Groceries vs. 1984"), pass 1

Video: `out/pih-groceries.mp4` (59.2 s, 58.6 s of cues). This is a **data reel**, not a map reel. It uses the `DataEpisode`
composition. The map-specific scoring items are adapted as follows:
- "place identifiable" becomes **subject and unit identifiable < 1.5 s**
- "one visible transformation" becomes **one visible change on a chart**
- "scale anchor" becomes **a familiar US/UK anchor** (dollars, minutes, everyday groceries)
- "faces" becomes **a human or personal stake**
- Finance-niche trust signals required: an on-screen source and "Not financial advice".

Evidence used:
- `python3 pipeline/virality_metrics.py pih-groceries`. I re-ran it after `review_frames.py` had cleared the hook and loop images.
- All 6 hook frames (0–3 s) and `loop_first_vs_last.jpg`.
- `python3 pipeline/review_frames.py pih-groceries`: all 11 beat sheets and `cues.md`.
- An extra frame at 5.4 s, used as the cover candidate.
- `public/episodes/pih-groceries/episode.json`, `SOURCES.md` and `public/data/pih-groceries.json`.
- `src/DataEpisode.tsx` and `src/components/Charts.tsx`, read to understand the dimming and footer behaviour.
- There are no earlier passes for this id.

Voice: **Kokoro am_michael** is a temporary stand-in. The final voice will be ElevenLabs Brian. I only scored the voice on pace, and gave it a light weight.

> This is a pattern-based estimate against `docs/VIRALITY_PLAYBOOK.md`, not a prediction. The biggest factor is one we can't control: how big the account is and how the first test cohort responds. For a new series on a new account, that factor matters even more.

## Key metrics
| Metric | Value | Read |
|---|---|---|
| Duration / words / pace | 59.2 s · 140 words · **2.46 w/s** | Just under the 2.5–3.2 band (Kokoro). Brian at speed 1.12 will probably land around 2.7. Re-measure after the switch. 59 s is at the top of the 45–58 s target. |
| First word | 0.29 s | ok |
| Hook text | "18% less work than in 1984. That's your grocery cart today. Except for one item." (6.6 s) | Number and contradiction are in sentence 1. The *unit* ("minutes of work") isn't explained until 7–10 s. |
| Cues / 10 s | 5.9 (35 cues) | ok for a data reel |
| Longest gaps | 3.40 s @ 25.8 (eggs), 3.33 s @ 17.9 (cheddar), 3.32 s @ 9.8 (rule) | Three gaps over 3 s. 4 of 30 two-second windows have no new cue. |
| Loop SSIM | **0.913** | full marks |
| Loudness | −15.0 LUFS | 1 LU under the −14 target. Re-check after the ElevenLabs render. |
| Pixel-level cuts | 0 | expected (single-canvas engine) |

### What I saw, frame by frame
- **Frame 0:**
  - Visible: the "PRICED IN HOURS · EP 1" bar, the title "GROCERIES VS. 1984", and a big yellow **"18%" with "LESS WORK THAN IN 1984"** on a dark navy background.
  - **The chart is invisible on frame 0.** `ChartLayer` dims any chart to 0.22 opacity and blurs it 3 px while a `bigNumber` is on screen. So the paused, muted first frame is an almost-empty title card: no grocery image, no chart shape.
  - At 0.5 s the caption repeats "18%" under the big "18%", so the same number is on screen twice.
  - The cart sticker only appears at 3.06 s.
- **0.5–3.0 s:** the chart is visible only as a faint, blurred line. It becomes sharp at about 2.7 s, when the big number releases. The 3.0 s frame is strong: a falling yellow line, "1984 level" dashed, an end pill reading "−18%" with a cart.
- **5.1 s:** the meat sticker with "EXCEPT THIS?" sits over the falling line. This is the best single frame in the video and is my cover pick.
- **Rule (7.0–17.2 s):** the chart is hidden. For 10 s the screen shows a "THE RULE" pill, one callout at a time ("1984: $8.55/h", then "2026: $32.63/h") and small emojis on an empty navy field. **This is the weakest stretch, and it falls exactly where 30–60 s reels lose most viewers (12–29 %).**
- **Board (17.3–33 s):**
  - Clean then-vs-now rows: grey 1984 bar, green 2026 bar, a "−48%" chip, values.
  - **The rows are small**: about 28–34 px label text, and the whole board fits in roughly y 560–1180. The middle third of the screen (y about 1200–1400) stays empty.
  - Each row counts up from "0.0 min", which makes it briefly unreadable on pause.
  - Five rows in a row all go down (cheddar, chicken, eggs, bread, gas): a list with nothing building between items.
- **Exception (33–45 s):**
  - **This is the strongest stretch.** "THE EXCEPTION" pill. The other rows dim and the beef row turns red and focused. "+40%", then a shake and a fire sticker.
  - Then the beef line chart draws to the green "1998 LOW: 6 MIN" pill and up to the red "2× SINCE 1998" pill, with chicken in green below it.
  - The chart change is clear and true to SOURCES.
- **Whole cart (45.6–55.4 s):** the hook chart is redrawn with pills for "1990: +7%", "2004: −2%" and "2014". It reads fine, but the viewer has already seen this line at 0–6 s. The 1990 and 2004 numbers are **low-stakes recap** right before the ending.
- **Loop (55.6–58.5 s):** "…the whole cart now costs…" ends on the same "18% / LESS WORK THAN IN 1984" card, with the cart and stopwatch stickers, over the blurred chart. That flows straight into "18% less work than in 1984." Seamless.
- **Footer:** "Source: BLS average prices, CPI food at home & avg. hourly earnings (AHETPI), via FRED", the pre-tax footnote and "Not financial advice." are on every frame.
  - Good trust signal.
  - But the footer sits at **y = 1650–1800**. That is under the TikTok/Reels caption-and-username overlay, so in-app it will mostly be covered.
- **Right rail:** several stickers sit at **x = 880–900, y = 1150–1180** (egg, fire, chart-decreasing, hourglass). That is the like/comment/share column on TikTok and Reels.

### Fact check of the script against SOURCES.md
All spoken numbers match the facts table:
- 18.2% → "18%"
- $8.55 and $32.63
- 21.5 → 11.3, 5.54 → 3.79 ("under 4")
- 5.99 / 12.04 / 4.18
- 8.44 → 8.24 ("8 → 8")
- 8.90 → 12.49
- 6.23 in 1998, ×2.0 since
- +7.3 / −2.2 / −3.0

**One wording risk:** the hook says *"That's your grocery cart today. Except for one item."* SOURCES is explicit that the −18% is the **whole food-at-home CPI** and that the 6 items were "chosen for recognisability". "Except for one item" therefore implies that beef is the *only* item in the entire cart that takes more work today. **That is not established by the data.** It is the kind of line that triggers "actually, coffee/steak went up too" corrections, which undermine shares. See change 3: the fix is precise and keeps the curiosity gap.

**A second, smaller risk:** neither the voice nor any large on-screen text ever says **"US"**. A UK viewer hears "your grocery cart" and assumes it means theirs. "US city averages" only appears in the 22 px footer.

## Scorecard
| Block | Pts | Reason |
|---|---|---|
| **A. Hook 0–3 s** | **16/25** | |
| · frame 0 paused + muted | 4/8 | Big "18%" and the title are readable, but the chart is dimmed and blurred to nothing. Dark empty field, no grocery visual. Reads as a title card. |
| · concrete payload, sentence 1 | 5/7 | A number plus a counter-intuitive claim (groceries cheaper than 1984). "Less *work*" is abstract until the rule at 7–10 s. |
| · subject/unit < 1.5 s | 3/5 | Subject is clear from the title "GROCERIES VS. 1984". The unit (minutes of pay) and the country (US) are not. |
| · on-screen text ≤ 7 words | 2/3 | "18% LESS WORK THAN IN 1984" (6 words) reinforces the voice, but the caption duplicates "18%" on the same frame. |
| · no throat-clearing | 2/2 | Voice at 0.29 s. Brand bar is small and fine. |
| **B. Retention** | **17/25** | |
| · new visual ≤ 2.5 s | 5/8 | 5.9 cues/10 s, but three gaps of 3.3–3.4 s and a visually empty 10 s rule beat. |
| · escalation / but-therefore | 3/6 | "But one item went the other way" is a real pivot. Before it, 16 s of five same-direction items (a plateau). After it, a recap of the hook chart. |
| · mid-video re-hook | 4/4 | "THE EXCEPTION" at 33 s (56 %): a red focus row, a shake, then a line that doubles. Well placed. |
| · payoff not buried | 3/4 | The beef payoff lands at 35–45 s, which is good. The last 10 s (1990 +7%, 2004 −2%) are recap and sag before the loop. |
| · pace & captions | 2/3 | 2.46 w/s, a touch slow (Kokoro). Captions big, word-by-word, readable. |
| **C. Rewatch & loop** | **10/10** | |
| · last line completes first | 5/5 | "…the whole cart now costs… / 18% less work than in 1984." Grammatical and seamless. |
| · last ≈ first frame | 3/3 | SSIM 0.913. |
| · dense frames | 2/2 | The 6-row board and the annotated line charts are worth pausing on. |
| **D. Shareability & saves** | **11/15** | |
| · send-to-a-friend fact | 5/6 | "Groceries take less work than in 1984" goes against how people feel about prices. "Beef: 2× the work since 1998" is a strong second fact. Natural send: *"to the friend who says the 80s were cheaper."* |
| · save value | 3/4 | The board is a reference card and "EP 1" promises a series. Rows are too small to work well as a saved reference. |
| · honest comment trigger | 2/3 | The claim invites debate (taxes, rent, wages), and the pinned question exists. No in-video question with a defined shape. |
| · emotional/human stake | 1/2 | Only "your time". No person, no felt moment. The March 2025 egg peak is relatable but gets 1.8 s. |
| **E. Packaging** | **9/10** | |
| · cover as thumbnail | 3/4 | The 5.1–5.4 s frame (falling line, "EXCEPT THIS?" meat sticker, title) is strong. Frame 0 would be weak. No cover is set yet. |
| · caption + hashtags | 3/3 | None exists. Written below and scored on that version. |
| · series identity | 3/3 | "PRICED IN HOURS · EP 1" badge, chapter pills, a consistent palette. The name explains the format by itself. |
| **F. Niche codes & trust** | **10/15** | |
| · one visible change on chart | 4/4 | The cart line falls below the "1984 level" to −18%. The beef line doubles from its 1998 low. Both are visible, not just spoken. |
| · familiar anchor | 2/3 | Dollars per hour, minutes, cheddar, eggs, a gallon of gas: perfect for the US. UK viewers are never told it's US data. |
| · human/personal stake | 1/3 | Personal framing ("your time") but no human face or moment. |
| · sourced / hedged | 2/3 | Source, pre-tax footnote and NFA are on every frame, plus the pinned comment. But "except for one item" over-generalises the 6-item sample, and "US" is missing from anything readable. |
| · no anti-patterns (§8) | 1/2 | Three gaps over 3 s. Stickers sit in the right-rail UI zone, and the source footer sits under the platform caption overlay. |
| **TOTAL** | **73/100** | **7.3/10. Tier: "can break out"** |

## Top 5 changes, ranked by expected gain
None of these changes touches a number. Every figure below is already in `SOURCES.md`.

### 1. Make frame 0 a chart, not a title card (+4: A1 +2, A3 +1, F2 +1)
The chart is drawn on frame 0 (`drawTo: 2026, atTime: 0`) but the `bigNumber` overlay dims it to 22 % and blurs it.

**Component change** (`src/components/Charts.tsx`, `ChartLayer`, around line 177): skip overlays flagged `noDim`:
```ts
const overlays = /* existing filter */ .filter((a) => !(a as any).noDim);
```

**`episode.json`, hook beat:**
- Move the big number below the chart: the chart plot ends around y 1200, and the captions sit around y 1440.
- Bring the cart sticker in at `atTime: 0`.
- Put **US** in the title.

```json
{ "title": "US Groceries vs. 1984" }
```
```json
{ "type": "bigNumber", "value": 18, "from": 1, "suffix": "%", "label": "LESS WORK THAN IN 1984",
  "y": 1230, "hold": 2.4, "atTime": 0, "noDim": true },
{ "type": "sticker", "emoji": "shopping_cart", "x": 820, "y": 640, "size": 190, "tilt": 10, "hold": 4.6, "atTime": 0 }
```
(Delete the old `shopping_cart` sticker that fires on "That's".)

**Optional:** suppress the caption on the hook's first word, so "18%" isn't shown twice. A `Captions` prop such as `hideUntil: 1.0` would do it.

**Also apply to the loop beat** (same `y`/`noDim`), so the last frame still matches the first. Expect SSIM to stay at or above 0.85, because both ends change together. **Re-measure.**

### 2. Cut the rule beat from 10.2 s to about 6.5 s and keep the chart on screen (+3: B1 +2, B2 +1)
This is the dead zone at 7–17 s. Same facts, fewer words, and no empty screen.

**Script line 2 (SOURCES and `say`):**
> "The trick: divide each price by an hour of pay. In {1984|nineteen eighty-four}: {$8.55.|eight fifty-five.} Today: {$32.63.|thirty-two sixty-three.}"

- Who earns that pay ("private-sector non-managers") moves to the callout `sub`, which already says so, and stays in the footer.
- 22 words become 18. Expect about −2.5 s.

**Actions:**
- Remove `hideChart`.
- Fire both callouts on their year words with long holds, so the two wages stack visibly ("1984: $8.55/h" at y 700, "2026: $32.63/h" at y 980, both still on screen at the end of the beat).
- Add a `PRICE ÷ HOURLY PAY = MINUTES` sticker on "trick". That is the formula, not a new number.

```json
{ "type": "sticker", "emoji": "alarm_clock", "x": 540, "y": 1180, "size": 200, "text": "PRICE ÷ HOURLY PAY = MINUTES", "hold": 2.2, "atWord": "trick" },
{ "type": "callout", "text": "1984: $8.55/h", "sub": "avg. pay, private-sector non-managers", "y": 700, "size": 76, "hold": 4.2, "atWord": "1984" },
{ "type": "callout", "text": "2026: $32.63/h", "sub": "same workers, Sep 2026", "y": 980, "size": 76, "hold": 2.4, "atWord": "Today" }
```

**Do not** add "almost 4× the pay" on screen unless the ratio (32.63 / 8.55 = 3.82) is first added to SOURCES and asserted in `prep-pih-groceries.mjs`.

### 3. Fix the over-generalisation in the hook and the pivot (+2: F4 +1, D1 +1 by blocking "actually…" corrections)
"Except for one item" (hook) and "But one item went the other way" (beef beat) suggest beef is the only item in the *whole cart* that went up. SOURCES only supports "one of the six items shown".

- **Hook, line 1:**
  > "{18%|Eighteen percent} less work than in {1984.|nineteen eighty-four.} That's the average US grocery cart today. But one item on our list went the other way."

  Simpler variant that keeps the rhythm: "…That's your grocery cart today. Except one item on our list."

  Hook sticker text: `"EXCEPT THIS?"` stays.
- **Beef beat, line 7:**
  > "But the sixth item went the other way. Ground beef: {9|nine} minutes then. {12.5|Twelve and a half} today."

  This is precise, true, and the ordinal raises the stakes ("the last one breaks the pattern").

This bends nothing. It only narrows the claim to what the data supports. Log it in the SOURCES "wording choices" section.

### 4. Turn the cart recap into "still flat… then it fell" and trim about 3 s (+2: B2 +1, B4 +1)
1990 +7% and 2004 −2% are recap. Use the escalation the data already holds, with the 2014 figure from SOURCES (−3.0%).

**Script lines 9–10 become one beat:**
> "Now the whole cart. In {1990|nineteen ninety}: {7%|seven percent} more work. In {2014|twenty fourteen}: still only {3%|three percent} less. Then it fell."

**Actions:**
- `drawTo 1990` + `mark "1990: +7%"` on "1990".
- `drawTo 2014` (dur 1.2) + `mark { "x": 2014, "text": "2014: −3%", "tone": "neutral" }` on "2014".
- `drawTo 2026` (dur 1.4) + the `chart_decreasing` sticker on "fell".
- Drop the 2004 mark.

Total runtime goes from about 59 s to about 53 s, combined with change 2.

**Do not** say "for 30 years it barely moved". The data JSON supports it (1984–2014 range −6.2 to +7.3), but SOURCES doesn't list it. Add the range to SOURCES and the prep asserts first if you want that line.

### 5. Readability and platform safe zones (+2: F5 +1, D2 +1)
**Board:**
- Scale `rowH` up about 1.4× and push labels and values to at least 40 px.
- Centre the board vertically (y about 420–1300), so the empty middle third goes away and the card is screenshot-worthy as a reference.
- Start the "now" value at the "then" value instead of 0.0, so no frame ever shows "0.0 min".

**Stickers:** move every sticker with `x ≥ 860` to `x ≤ 760` (egg 830→700, fire 900→720, chart_decreasing 880→720, hourglass 880→720, chart_increasing 880→720).

**Footer:** `top: 1650` sits under the TikTok/Reels caption and username overlay. Two options:
- Move the source line up to sit under the chart title (small, muted).
- Or put it at `top: 1300` above the captions band.

Keep "Not financial advice." visible in both cases.

**Gaps over 3 s:** add one cue each at about 19.5 s (cheddar: a `focus` on the chip) and about 27.5 s (eggs: hold the egg sticker 2.8 s or add a `pulse`).

Potential after all five: about **86/100**. That is a ceiling estimate, to be re-measured on a fresh render.

## 3 alternative hooks (all true per SOURCES.md)
Each hook needs a matching last line so the loop still closes.

| # | Archetype | Verbal line 1 | Frame-0 visual | On-screen text | Matching last line |
|---|---|---|---|---|---|
| 1 | **Myth-bust / contrarian** | "Groceries feel expensive. Measured in work, the average US cart takes 18% less than in 1984." | The cart line already fully drawn, falling through "1984 level" to a glowing "−18%" end pill, cart sticker at the end. | "US GROCERIES: 18% LESS WORK" | "…so are groceries really pricier than in 1984?" |
| 2 | **Big number / comparison** | "In 1984, a pound of cheddar cost 21 minutes of work. Today: 11." | One giant cheddar row (scaled 2×): grey 21.5-min bar over a green 11.3-min bar, "−48%" chip. | "CHEDDAR: 21 MIN → 11 MIN" | "…and the cleanest example is still the cheese." |
| 3 | **Question with a defined shape** | "Which grocery staple takes twice the work it did in 1998?" | The beef line, red, rising from the green "1998 LOW: 6 MIN" pill to the red "2× SINCE 1998" pill, meat sticker with "?". | "2× THE WORK SINCE 1998?" | "…everything got cheaper in work-time. Except one." |

My pick for a pass-2 A/B is **#1**. It keeps the current spine and loop logic and adds "US" and "work" in plain words. #3 is the strongest stop for Shorts, but the answer has to arrive by about 20 s or it becomes bait.

## Cover, caption, hashtags, pinned comment
**Cover:**
- Use the frame at **5.2–5.4 s**: falling cart line, "−18%" end pill, red meat sticker "EXCEPT THIS?", title still at full opacity.
- Once change 1 lands, put "US" in the title.
- For the Reels 3:4 grid crop (1080×1440 centred), the title at y about 70–110 is cut off. Compose a 3:4 version with the title moved to y about 280.

**Caption** (hook line ≤ 150 chars):
> Groceries take 18% LESS work than in 1984 (avg US hourly pay). Except one item. 🛒⏱️
> Grocery prices vs wages, 1984 vs 2026: cheddar, eggs, chicken, bread, gas and ground beef priced in minutes of work.
> Cost of living / food inflation, measured in your time. Data: BLS + FRED (St. Louis Fed). Not financial advice.

(If the house style is no emojis in captions, drop the two at the end of line 1.)

**Hashtags (5):** `#groceryprices #costofliving #inflation #economics #pricedinhours`

**Pinned comment:**
- Keep the SOURCES.md text: sources, method, pre-tax, NFA.
- Make the question tie back to the payoff. Primary:
  > "Which item in YOUR cart feels like it takes more work than it used to? (Next episodes: rent, a new car, college. Which first?)"

## Platform notes
- **TikTok:**
  - 59 s is fine, but completion drops with length. Aim for about 52–53 s (changes 2 and 4).
  - Rewatch is the key signal and the loop already works. Don't add an end card.
  - Keep all text inside the safe area: about 120 px clear on the right, and the bottom ~380 px clear (see change 5).
  - On-screen text is indexed for search, so "US groceries" and "minutes of work" in big text help.
- **Instagram Reels:**
  - Sends per reach is the lever. The beef "2× since 1998" moment and the "18% less work" claim are the sendable bits, so make both screenshot-clean (bigger board, beef pill not overlapping the line).
  - Hashtags don't add reach. The keywords in the caption are what matter.
  - Make a 3:4 grid cover.
  - No TikTok watermark on the upload.
- **YouTube Shorts:**
  - The swipe decision is made on frame 0, so change 1 matters most here.
  - Shorts can now run up to 3 min, but stay under 60 s. If Brian's read comes out longer than Kokoro's and pushes past 60 s, changes 2 and 4 are mandatory.
  - Use the title field for search: "Groceries vs. wages: 1984 vs 2026 in minutes of work (US data)".
- **Voice (all platforms):**
  - Kokoro runs at 2.46 w/s and −15 LUFS. Re-run `virality_metrics.py` after the ElevenLabs Brian render to confirm pace (target 2.7–3.0), loudness (−14) and the loop SSIM.
  - Listen for "AHETPI" never being spoken. Good: it's footer-only.
  - Check that "$32.63" reads as "thirty-two sixty-three" (the respell is already in `say`).

VIRALITY SCORE: 73/100 (7.3/10) — can break out
