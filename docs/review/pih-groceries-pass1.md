# Review — pih-groceries (PRICED IN HOURS ep.1), pass 1

Video `out/pih-groceries.mp4`, 58.62 s, Kokoro voice. Sheets: `out/review/pih-groceries/` + close-up frames at 0, 0.5, 8, 12, 13.8, 16.8, 35.6, 37.2, 54.3, 58.55 s.

## Verdict
**Not postable yet: 6.5/10.** All the numbers are right and the item board is clear and readable. The beef line and the cart line work well.
Three things hold it back. First, the 10-second "rule" section is close to an empty screen, and its key number disappears before the voice says it.
Second, the then/now rows and the line marks often show a number that is different from (or ahead of) the one being spoken.
Third, the loop end does not match frame 0.

**Biggest problems**
1. `rule` (7.0–17.2 s) is a dead zone. There is no chart. The "$8.55/h" callout is gone at 12.44 s, but "$8.55" is spoken at 13.16 s.
2. Then/now reveals put the big number on **now** while the voice is saying **then**. At "9" (35.6 s) the beef row shows **11.1 min** in bold.
3. Marks pop up before the line reaches them (2014 dot, "2× SINCE 1998" pill). The loop end (chapter chip + stickers + ghost pills) also does not match frame 0 (title, no stickers).

## Accuracy check (vs SOURCES.md): all pass
18% (−18.23), $8.55/$32.63, cheddar 21.5→11.3 (−48%), chicken 5.5→3.8, eggs 6.0→4.2 plus the Mar 2025 peak of 12, bread −11%, gas 8.4→8.2,
beef 8.9→12.5 (+40%), the 1998 low of 6.2 and ×2.0 since, chicken cheaper since 1998 (4.9→3.8), cart +7% (1990), −2% (2004), −3% (2014), −18% (2026): all match.
"Today" = Sep 2026 (the callout says so). There are no causal claims. Good.

## Findings

1. **[P1] rule · 7.0–17.2 s · Nearly empty screen for 10 s, and the 1984 callout vanishes at 12.44 s, before "$8.55" is spoken (13.16 s).** From 12.44 to 14.82 s the only thing on screen is a small hourglass.
   Fix: keep both wages on screen together (the y 700 / y 980 stacking is already built for this) and shorten the line.
   ```json
   {"type":"callout","text":"1984: $8.55/h","sub":"avg. pay, private-sector non-managers","y":700,"size":76,"hold":7.2,"atWord":"1984"},
   {"type":"callout","text":"2026: $32.63/h","sub":"same workers, Sep 2026","y":980,"size":76,"hold":2.4,"atWord":"Today"}
   ```
   Also remove the `hourglass_not_done` sticker (it adds nothing). Move `chart_increasing` to x 940 / y 900 so it stops covering the 2026 callout corner.
   Optional cut (−2.5 s, total about 56 s): `"say": "The trick: price food in minutes of work. Average pay: {$8.55|eight fifty-five} an hour in {1984.|nineteen eighty-four.} Today, {$32.63.|thirty-two sixty-three.}"`.
   Better still, replace the alarm-clock sticker with one formula card that stays up for the whole beat:
   `{"type":"callout","text":"PRICE ÷ HOURLY PAY = MINUTES","y":520,"size":56,"hold":9.5,"atWord":"trick"}`.
2. **[P2] cheddar…beef · 17.9–38 s · The row stresses "now" while the voice says "then".** The now bar and bold value count up 0.45–1.15 s after the reveal. So at "21 minutes" the bold number climbs toward 11.3, and at "9" the beef row shows 11.1.
   Fix in `Charts.tsx` ThenNow: add an optional `nowWord` on `reveal`. Start `nowT`/`chipT` from that word's time when it is given (otherwise keep the current timing). While only "then" is visible, show the **then** value in the big 36 px slot. Cues:
   `{"type":"reveal","item":"beef","atWord":"Ground","nowWord":"12.5"}`, and the same for cheddar `"nowWord":"11"`, eggs `"nowWord":"About"`, gas `"nowWord":"now"`, chicken `"nowWord":"under"`.
3. **[P2] drop · 53.90 s · The "2014" mark fires on "after" at the same moment the line starts drawing from 2004.** The dot floats in empty chart space for about 0.8 s (visible at 54.3 s).
   Fix: `{"type":"drawTo","x":2014,"dur":0.5,"atWord":"drop"}` + `{"type":"mark","x":2014,"text":"2014","tone":"neutral","atWord":"after"}` + `{"type":"drawTo","x":2026,"dur":1.3,"atWord":"2014"}`.
4. **[P2] beefline · 43.24 s · The "2× SINCE 1998" pill appears 0.74 s before the line reaches 2026** (drawTo starts 42.38 s, dur 1.6). Fix: `"dur": 0.8` on the `drawTo x:2026`.
5. **[P2] loop / hook · 57.5–58.6 s ↔ 0 s · The loop seam does not match.** The end shows the "THE WHOLE CART" chip, stopwatch and cart stickers, and dimmed 1990/2004/2014 pills. Frame 0 shows the title "GROCERIES VS. 1984" with no stickers and no chart (the chart only fades in at about 0.5 s).
   Fix in the hook: fire both stickers `"atTime":0` (stopwatch `hold 2.4`, cart `hold 2.6`), and put the chart up at full opacity on frame 0 (dimmed under the big number, as at 58.5 s).
   In `loop`: add `{"type":"hideMarks"}` (new, a one-line filter in LineChart: ignore marks before the latest `hideMarks` cue) or a new `chart` cue `{"type":"chart","chart":"basket","drawTo":2026}` at beat start. That restarts the chart without pills. Also hide the chapter chip at the loop with `{"type":"chapter","text":""}` (make Chapters skip empty text) so the title band matches frame 0.
   Fire the loop `bigNumber` on `"costs"` instead of `"now"`. It currently shows 18% before the sentence reaches its payoff.
6. **[P2] beef · 36.7 s · The fire sticker (x 900, y 1180) covers the gas value "8.2 min" and the beef "then" value "8.9 min".** Fix: `"x": 800, "y": 1250, "size": 110`. That is the empty gap between the beef bars and the +40% chip.
7. **[P2] hook + cart · What is measured is vague.** The chart title "Whole grocery cart, in work vs. 1984" and the big-number label "LESS WORK THAN IN 1984" never say *time to buy groceries*.
   Fix in `public/data/pih-groceries.json`: `"title": "Work time to buy the grocery cart, vs. 1984"`. In both bigNumbers: `"label": "LESS WORK TO BUY GROCERIES"` (1984 is already in the title, voice and axis).
8. **[P2] all line charts · Odd y-axis ticks.** Basket shows +15/+5/−5/−15/−25 with no 0. Beef shows 0/3.8/7.5/11.3/15 min. This comes from yMin/yMax split into 4 steps.
   Fix in data: basket `"yMin": -20, "yMax": 20` (gives −20/−10/0/+10/+20). That also lifts the 1990 point above the 150 px threshold, so the "1990: +7%" pill no longer sits on the dashed 1984 line and the line start. Beef: `"yMax": 16` (gives 0/4/8/12/16).
9. **[P2] beefline · 38.5–45 s · The green chicken line is unnamed until "Chicken? Cheaper." at the very end.** Only the drumstick emoji and the value identify it.
   Fix in LineChart head label: prefix the series label when there is more than one series (`Chicken 3.8 min`, `Beef 12.5 min`). Or add a legend row under the title like the board's ("▬ Ground beef ▬ Chicken").
10. **[P3] beef/beefline · Chapter chip "THE EXCEPTION" shows no emoji.** `fire` exists only as `fire.json` (lottie). The chip's lottie does not render inside the `Sequence`, while the sticker version does. Fix: add `public/assets/emoji/fire.png`, or debug the `Emoji` lottie path in `Chapters`.
11. **[P3] breadgas · Gas −2% gets a green "cheaper" chip while the voice says "dead flat".** In ThenNow the threshold is ±2%. Fix: `d > 0.05 ? BAD : d < -0.05 ? GOOD : theme.accent` so gas shows a neutral yellow chip.
12. **[P3] hook · 3.06 s · The cart sticker fires on "That's" instead of "cart".** Fix: `"atWord": "cart"`. Note this cue is superseded by fix 5 if the stickers start at 0.
13. **[P3] beefline · 40.9 s · The head label reads "6.2 min" next to the pill "1998 LOW: 6 MIN".** It is slightly inconsistent, but it matches the voice's rounding. Acceptable. Optionally change the pill to `"1998 LOW"` only, since the head already shows the value.
14. **[P3] source strip · y 1650–1795, ~24 px grey.** It runs past the agreed 1720 limit and has widow lines ("FRED.", "each year."). On TikTok/IG the bottom-left is covered by the username/description overlay.
    Fix: shorten `source` to "BLS prices & CPI food at home, avg. hourly earnings (AHETPI) via FRED." and `footnote` to "Pre-tax pay, non-supervisory workers. US averages, Sep each year." That gives 2 lines plus the disclaimer and ends ≤ 1730. Put the full text in the pinned comment (already done).
15. **[P3] hook · 0–2.6 s · The caption "18%" duplicates the big number right above it.** It is harmless but crowded. Optionally hide captions while a `bigNumber` is up, or move the bigNumber up to `"y": 700`.
16. **[P3] board · 17–38 s · y 1330–1380 is empty and the bars are short (max 290 px).** Optional: `rowH` 140 and `labelW` 300 to use the space and widen the bars. With the current values, the chip/value columns already fit with no overlap.
17. **[P3] board · "Gas" on a groceries board.** Gas is not in food-at-home CPI, and the hook says "your grocery cart… except for one item". Consider the unit `"per gallon (not food)"`, or keep it and accept it as a cost-of-living sidebar (SOURCES already says the 6 items are illustrative).

## Pronunciation (Kokoro; recheck with Brian once the ElevenLabs key works)
- "thirty-two sixty-three" with no "dollars" is ambiguous by ear. Use `{$32.63.|thirty-two dollars sixty-three.}`.
- Kokoro drops pitch at the end of "costs…", so the line sounds finished and the loop breaks. Try "…the whole cart now costs —" with an em dash, or end on a rising "costs?".
- Listen for "cheddar" and "non-managers": Kokoro tends to stress "non" flatly. If it does, change it to "hourly workers".
- I did not hear the audio (no player in this session). These are known Kokoro patterns, to be checked by ear.

## Pacing / richness
- Beats 02–07 are well paced (something new every 1–2 s) and the board fills in nicely. Beat 01 is the only slow one (see 1).
- The hook works: a bold 18% on frame 0 and the title states the topic. Adding the chart at full brightness on frame 0 (fix 5) makes it more striking.
- Idea: in `beefline`, a quick `bigNumber` "×2" on "doubled" instead of the duplicate `chart_increasing` sticker at y 470, which also crowds the "12.5 min" head label.
