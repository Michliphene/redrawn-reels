# Virality review: louisiana-1803 (REDRAWN EP 3), pass 1

Video: `out/louisiana-1803.mp4` (48.8 s, 1080×1920).
Evidence used:
- `python3 pipeline/virality_metrics.py louisiana-1803`, run fresh after reading the sheets.
- All 6 hook frames (0–3 s) and `loop_first_vs_last.jpg`.
- The 15 fresh beat sheets `beat_00`…`beat_14` and `cues.md` (not regenerated).
- `episode.json`, `SOURCES.md`, `timings.json` (word times), and `src/components/{Overlays,Labels,Stickers,Brand}.tsx` to check how cues fade in.
- EP 2 virality passes 1–4 (`docs/review/alaska-1867-virality-pass*.md`), as the series baseline.
- Extra frames at 0.03, 0.3, 10.8, 11.8, 32.5, 33.5, 36.6, 36.9, 47.9 and 48.5 s, in `/tmp/claude-0/virality-tmp/l1_*.jpg`, with strips `l1_s1.jpg` and `l1_s2.jpg`.

> This is a pattern-based estimate against `docs/VIRALITY_PLAYBOOK.md`, not a prediction. The biggest factor is one we can't control: account size and how the first test cohort responds.

## Key metrics
| Metric | Value | Read |
|---|---|---|
| Duration / words / pace | 48.8 s · 156 · **3.52 w/s** | Above the 2.5–3.2 band. Speech is 44.3 s, and every beat gap is clamped to ≤0.28 s, so the punchlines get no air. (EP 2's caption count was 2.98 w/s, but it was partly flattered by "$7.2" counting as one token.) |
| First word | 0.25 s | ok |
| Hook | "America tried to buy one city." (1.78 s) | `has_question_or_number_in_hook: false` |
| Cues / 10 s | 9.2 (45 cues) | dense |
| Longest gaps | **2.71 s** at 31.57 (legal), **2.54 s** at 9.68 (port), 2.22 s at 16.07 | two gaps over 2.5 s; 2 of 24 two-second windows are empty |
| Pixel scene cuts | 0 | expected for a map reel |
| Loop SSIM | **0.908** | very good (EP 2: 0.865) |
| Loudness | −14.0 LUFS | ok |

### What I saw, frame by frame
- **Frame 0 (0.0–0.03 s):** title "HOW THE US DOUBLED IN SIZE", REDRAWN EP 3, and a tight Gulf-coast crop: orange purchase tip, blue US, timeline at 1795. **The marker, city sticker and "1 city?" all have `atTime: 0`, but they fade/spring in from opacity 0** (`life()` in Overlays.tsx, spring in `Tag`), so frame 0 has no place label and no hook text. "1 city?" is a ghost at 0.03 s and fully legible only at ~0.3 s. There's a small orange dash artefact at about (580, 690) at full scale, visible in frame 0 and the loop frame.
- **0.3–2.0 s:** "New Orleans" + 🏙 + "1 city?" + caption. Place is clear by 0.5 s.
- **2.25–3.5 s:** the camera pulls out to the full purchase, with the French flag and "ALL OF THIS" pointer. This is the best moment of the hook: a real *contrast* reveal (one city → half a continent).
- **Port (9.7–12.2 s):** "Spain → France / secret treaty, 1800" holds, then nothing new until the flag. That flag (`x 880, y 620`) lands **on the US East Coast**, and it's still there at 13.0 s in the budget beat. A paused viewer reads "France owns Virginia".
- **Ask (24.0 s):** the 👀 sticker is a Lottie (`eyes.json`) and renders as **two grey ovals**. It reads as a glitch.
- **Deal → acre (30.1–30.7 s):** the $15,000,000 bigNumber (hold 2.2, so it lives until 31.1 s) **overlaps the ≈2.8¢ number**. The frames read "$15,017,000" and "$15≈2.8¢00", with both labels garbled on top of each other. That's the most shareable fact in the video, and its first half-second is a mess.
- **Doubles (36.2 s):** orange turns blue, "×2" appears. But the camera is still on `fit: FOCUS` from the ask beat, so **the old US is two-thirds off-screen**. The "×2" claim isn't visible on a paused frame, and the new blue is close to the old blue.
- **Borders (38.5 s):** "British lands" is hidden behind the "BORDERS?" chapter pill, and one red "?" sits under the "1803" date.
- **Natives / Today:** clean. The italic nation labels and the 15-state ghost grid are good pause frames.
- **Loop (47.2–48.8 s):** the camera returns to the hook crop, orange is restored, the title is back, and the caption reads "ALL BECAUSE…". Last line → first line works: "All because… America tried to buy one city."

## Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **18/25** | **Frame 0 (4/8):** title + map only; the hook text and place label are still at opacity 0, and the crop shows no scale or contrast. **Payload (5/7):** a concrete, named stake ("one city"), but no number, and the contradiction only lands in sentence 2 at 2.25 s. **Place (5/5):** New Orleans is labelled by 0.5 s. **Text (2/3):** title (6) + "1 city?" (2) = 8 words. **No throat-clearing (2/2).** |
| B. Retention | **21/25** | **Cue density (7/8):** 9.2 per 10 s, but two gaps over 2.5 s (2.71, 2.54). **Escalation (5/6):** a real but-therefore spine (want a city → budget $10M → "But Napoleon…" → France asks → $15M → 3¢ → "isn't even sure it's constitutional" → doubles → "But nobody knows where the borders are"). The end is lists rather than climbs: natives → 15 states is weaker than the 3¢ / ×2 peak. **Re-hook (4/4):** "But Napoleon's army…" (37 %) and "what would you pay for all of Louisiana?" (47 %). **Payoff (4/4):** the title promise (doubling) lands at 74 %, after 3¢ at 62 %. Not buried. **Pace (1/3):** 3.52 w/s, out of band. Captions are readable, but the punchlines run straight into the next beat. |
| C. Rewatch & loop | **10/10** | "All because…" → "America tried to buy one city." (5/5). SSIM 0.908 (3/3). Pause-worthy frames: Native nation labels, 15-state grid, borders with Spanish/British lands (2/2). |
| D. Shareability & saves | **12/15** | **Send (5/6):** two strong DM facts, "tried to buy a city, got all of this" and "under 3¢ an acre", plus "Jefferson wasn't sure it was constitutional". The 3¢ frame is garbled for its first ~0.6 s by the $15M overlap. **Save (3/4):** reference map + 15-state ghost + EP 3, but no clean before/after "×2" frame. **Comment (2/3):** honest in-video triggers (constitutionality, Native nations, undefined borders), but nothing in the pin asks a question yet. **Human stake (2/2):** Jefferson, Monroe, Napoleon, Haiti, Native nations. |
| E. Packaging | **8/10** | **Cover (2/4):** frame 0 is title + a Gulf-coast sliver with no hook text. The 3:4 crop cuts the title, and no composed cover exists (`deliverables/louisiana-1803/` is missing). **Caption (3/3):** none exists, so I wrote one below and scored it. **Series (3/3):** REDRAWN EP 3 on frame 0 and the loop. |
| F. Niche codes & trust | **10/15** | **Transformation (3/4):** orange → blue at "doubles", but framed so the doubling can't be seen. **Scale anchor (2/3):** "×2 the US" and "15 states" are familiar, but there's no Texas/Europe-style shape comparison. **Faces (2/3):** small corner cards; no person in the Native beat. **Sourced/hedged (2/3):** strong hedges ("Shown as settled 1818–19", "Approximate areas", the offer-maker unnamed). But the **hook says "one city" while the video's own budget card says "FOR NEW ORLEANS + FLORIDA"** (SOURCES: "New Orleans and (parts of) the Floridas"). That's an obvious "well, actually" in the first comments. Also, "Three weeks later" is 19 days (11 → 30 April) and isn't logged. **Anti-patterns (1/2):** the overlapping bigNumbers, the flag on US soil, the grey-oval 👀 and the hidden "British lands" label. |
| **TOTAL** | **79/100 · 7.9/10** | **Tier: can break out** (EP 2 pass 1 was 80) |

## Top 5 changes, ranked by expected gain

### 1. Rebuild the hook: make it true to the budget card and settled on frame 0 (+4: A frame 0 +2, A text +1, F hedge +1)
"Tried to buy one city" conflicts with "FOR NEW ORLEANS + FLORIDA" 13 s later. "Tried to buy New Orleans" is exactly what SOURCES supports and makes no "only" claim. It keeps the verb, the stake and the contrast with "France offered all of this", and the loop still reads naturally: "All because… America tried to buy New Orleans."

Firing the marker and sticker 0.3 s *before* t = 0 puts them at full opacity on frame 0. `life()` and the `Tag` spring are fully in by 0.25–0.3 s, and the schedule accepts any numeric `atTime`. Dropping "1 city?" brings the frame-0 text to the 6-word title, and the marker already names the place.
```json
{
  "id": "hook",
  "say": "America tried to buy New Orleans.",
  "camera": {"center": [-90.3, 30.3], "span": 7},
  "date": null,
  "hideLocator": true,
  "actions": [
    {"type": "marker", "text": "New Orleans", "at": [-90.07, 29.95], "atTime": -0.3, "hold": 2.5},
    {"type": "sticker", "emoji": "cityscape", "x": 800, "y": 980, "size": 180, "atTime": -0.3, "hold": 2.3}
  ]
}
```
Add the same sticker to the `loop` beat so the last frame matches the new first frame (SSIM insurance):
```json
{"type": "sticker", "emoji": "cityscape", "x": 800, "y": 980, "size": 180, "atWord": "All", "hold": 1.6}
```
In the same TTS pass, fix the unlogged "three weeks" (11 → 30 April is 19 days, computed from two sourced dates). Log it in SOURCES "Facts used":
```json
{"id": "deal", "say": "Nineteen days later, the deal is signed: fifteen million dollars.", ...}
```
Update SOURCES "Script (as spoken)" lines 1, 8 and 15. Before rendering, run `npx remotion still … --frame=0` to confirm the marker and sticker are fully drawn. The sticker uses `<Sequence from={-9}>`, which Remotion accepts. If it doesn't draw, use `atTime: 0` for the sticker only. Also look at the small orange dash near New Orleans in frame 0 (probably a stray stroke on the Isle of Orleans / Lake Pontchartrain edge).

### 2. Craft fixes: overlap, misplaced flag, broken emoji, hidden label, two cue gaps (+3: D send +1, B cue density +1, F anti-patterns +1)
All of these are edits to existing actions; none adds a fact.
```json
// deal: end the $15M before the 3¢ arrives (28.51 + 1.15 + 0.4 fade ≈ 30.06 < 30.08)
{"type": "bigNumber", "value": 15000000, "prefix": "$", "label": "$11.25M + $3.75M IN CLAIMS", "coins": true, "coinsCount": 14, "dur": 0.9, "hold": 1.15, "y": 1080, "atWord": "fifteen"},
// acre: hold the most shareable number longer (into the legal beat; no collision with the left portrait or the Senate card at 34.28 s)
{"type": "bigNumber", "value": 2.8, "decimals": 1, "prefix": "≈ ", "suffix": "¢", "label": "PER ACRE · 828,000 SQ MI", "dur": 0.6, "hold": 2.0, "y": 1080},
// port: put the French flag ON Louisiana, not on the US East Coast, and pulse the territory (splits the 2.54 s gap into 1.70 + 0.84 s)
{"type": "pulse", "ids": ["LOUISIANA"], "atWord": "Louisiana"},
{"type": "sticker", "flag": "fr", "at": [-100, 42], "size": 120, "atWord": "France.", "hold": 1.0},
// ask: replace the Lottie eyes (renders as grey ovals) with a static PNG that matches "what would you pay"
{"type": "sticker", "emoji": "money_bag", "x": 880, "y": 880, "size": 150, "atWord": "asks:", "hold": 1.4},
// legal: new cue on "constitutional." (32.98 s) splits the 2.71 s gap into 1.41 + 1.30 s
{"type": "sticker", "emoji": "scroll", "x": 880, "y": 880, "size": 140, "atWord": "constitutional.", "hold": 1.4}
```
On the `borders` beat, add `"hideChapter": true, "hideDate": true` so "British lands" and the northern "?" become visible. The beat is 3.2 s and the region labels carry the meaning.

### 3. Make "doubles" visible: a wide before/after frame (+2: F transformation +1, D save +1)
Pull the camera out to the river-beat framing (both the 1803 US and the purchase in shot), flash the old US on "United", then turn the purchase blue on "doubles". Move "×2" below the map.
```json
{
  "id": "double",
  "say": "The United States doubles in size.",
  "camera": {"center": [-89, 38.5], "span": 42, "dur": 0.6},
  "date": "1803-12-20",
  "actions": [
    {"type": "chapter", "emoji": "star", "text": "Twice as big"},
    {"type": "pulse", "ids": ["US1803"], "atWord": "United"},
    {"type": "declare", "id": "LOUISIANA", "atWord": "doubles", "noLabel": true},
    {"type": "callout", "text": "×2", "sub": "handover: New Orleans, Dec 20, 1803", "y": 1150, "size": 110, "hold": 1.3, "atWord": "doubles"}
  ]
}
```
The `borders` beat already re-fits to FOCUS, so nothing downstream changes. Check a still at ~36.9 s (frame 1107). This frame then becomes the obvious save/screenshot and the base for the Instagram cover (change 4). The doubling itself is sourced (SOURCES "Doubles" row, ~839k + ~828k sq mi).

### 4. Compose the covers (+2: E cover)
- **TikTok / Shorts (9:16):** after change 1, frame 0 is acceptable. Better still, upload a composed cover: the wide frame from change 3 (blue 1803 US + orange purchase, *before* the recolour, ~36.0 s), the title, and one line `≈ 3¢ AN ACRE`. Both are already on screen and in SOURCES.
- **Instagram (3:4 grid):** the same composition with everything inside y 240–1680. Render the base with the existing cover mode, which moves the title to y 420:
  `npx remotion still src/index.ts Episode out/cover_base.png --frame=1080 --props='{"episodeId":"louisiana-1803","cover":true}'`
  Then save to `deliverables/louisiana-1803/cover_9x16.png` and `cover_3x4.jpg`, as for EP 2.
- Never use 30.1–30.7 s as a cover (the garbled $15M / 2.8¢ overlap, until change 2 is in).

### 5. Bring the pace into band and give the punchlines a beat (+2: B pace)
`tts.py` supports per-beat `gapAfter`. Slow the voice slightly and add a breath after the four punchlines:
```json
"settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.2, "use_speaker_boost": true, "speed": 1.06}
```
```json
{"id": "offer", "gapAfter": 0.45, ...}, {"id": "acre", "gapAfter": 0.45, ...},
{"id": "legal", "gapAfter": 0.45, ...}, {"id": "double", "gapAfter": 0.45, ...}
```
Estimate: speech 44.3 × 1.12 / 1.06 ≈ 46.8 s, plus ~4.4 s of gaps, gives ≈ 52 s and ≈ 3.0 w/s. Trade-offs: CLAUDE.md's house speed is "~1.12", so this is the owner's call, and +3 s costs a little completion. Re-run metrics after the render. Slower speech stretches atWord spacing, so re-check that no gap passes 2.5 s (the legal and port beats are the ones to watch).

**Also (+1, D comment, costs nothing):** add the pinned question below to SOURCES "Pinned comment" and the posting kit.

**Not ranked, because it needs a new fact (F scale +1):** a "Texas, same scale" ghost inside the purchase, as in EP 2. The purchase is ≈3× Texas, but **Texas's area is not in this episode's SOURCES**. Add it from the U.S. Census Bureau state area table first, and add a `TEXAS_GHOST` feature in `scripts/prep-louisiana1803.mjs`. Say "about three times Texas" only if the sourced figures support it (828,000 vs Texas's total area).

Expected total with changes 1–5: **≈ 92/100**, 93 with the pinned question.

## 3 alternative hooks (all true per SOURCES.md)
| Archetype | Verbal line (0–2 s) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **A. Price per unit (big number)** | "Under three cents an acre. That's what America paid for all of this." Loop end: "All of it, for…" | Full purchase in orange beside the blue 1803 US, with "≈ 2.8¢ / PER ACRE" settled on frame 0 (`bigNumber` with `"from": 1, "atTime": 0`, as in EP 2) | `3¢ AN ACRE?` |
| **B. Comparison** | "The United States doubled in size for fifteen million dollars." Loop end: "All because… America tried to buy New Orleans." Then the cold open replays. | Wide shot: blue 1803 US and the purchase pulsing, "×2" settled | `×2 FOR $15M?` |
| **C. Contradiction (constitution)** | "Jefferson thought he needed to amend the Constitution to buy this. He bought it anyway." | Large Jefferson portrait card over the orange purchase | `UNCONSTITUTIONAL?` |

Notes: C's wording follows SOURCES ("Jefferson thought an amendment was needed; drafted one; proceeded without it"). Don't say "illegal" or "the Senate ignored the Constitution". A has the strongest stop power and matches EP 2's proven formula ($7.2M → 2¢), but don't make it a *direct* comparison with Alaska's 2¢ unless both figures are in this SOURCES. Recommendation: ship the fixed contrast hook (change 1). Use **A** as the first A/B repost or the Shorts version. C is the comment-bait variant.

## Cover, caption, hashtags, pinned comment
- **Cover:** see change 4. Wide 1803 US + orange purchase, title, `≈ 3¢ AN ACRE`.
- **Caption:**
  > America tried to buy New Orleans. France sold all of Louisiana instead: $15 million, under 3¢ an acre.

  > The 1803 Louisiana Purchase on a map: Jefferson, Monroe, Napoleon and Haiti, the 24–7 Senate vote, and how the US doubled in size into all or part of 15 states.

  > REDRAWN ep. 3. Borders shown as settled 1818–19; Native nations never agreed to the sale. Sources in the pinned comment.
- **Hashtags (5):** `#LouisianaPurchase #history #maps #geography #ushistory`
- **Pinned comment:** the SOURCES text, then:
  > Which of the 15 states do you live in? And did you know Jefferson doubted the purchase was constitutional?

  It's identity-based and honest, and it isn't a political pile-on. Add "next: …" only once the next episode is confirmed (`docs/01_SERIES_AND_TOPICS.md` order puts #13, Ireland, after #3). Avoid "Was it stolen land?" style prompts: the Native beat already states the fact neutrally, and a loaded question invites a fight that tanks sends.

## Platform notes
- **TikTok:** completion and rewatch decide it. At 48.8 s (≈52 s with change 5) with a clean verbal loop, keep **no end card**. Frame 0 is the default thumbnail unless you upload one, so change 1 matters most here. "Louisiana Purchase" isn't in the on-screen title; it lives in the caption and the "All of Louisiana?" card, so keep it in caption line 2 for search.
- **Instagram Reels:** ranks on sends per reach. The DM moments are the 2.25 s reveal ("France offered all of this"), 3¢ (clean only after change 2) and ×2 (readable only after change 3). Upload the 3:4 cover. Post natively, with no TikTok watermark. Hashtags add little; caption keywords matter.
- **YouTube Shorts:** "viewed vs swiped" is decided at frame 0 and second 1. Today's frame 0 has no hook text, so this is the platform hurt most by the fade-in issue. Title: "The US paid under 3 cents an acre for this". Put the sources in the description. This is the best place to test hook A.

VIRALITY SCORE: 79/100 (7.9/10) — can break out
