# Virality review: louisiana-1803 (REDRAWN EP 3), pass 2

Video: `out/louisiana-1803.mp4` (fresh render, 54.0 s, 1080×1920).
Evidence used:
- `python3 pipeline/virality_metrics.py louisiana-1803`, run fresh.
- All 6 hook frames (0–3 s) and `loop_first_vs_last.jpg`.
- The 15 fresh beat sheets and `cues.md`. I did not regenerate them.
- `episode.json`, `SOURCES.md`, `deliverables/louisiana-1803/{cover_9x16.png, cover_3x4.jpg, POSTING.md}`, and pass 1 (`docs/review/louisiana-1803-virality-pass1.md`).
- Extra frames at 0.0, 8.6, 12.3, 17.9, 19.3, 20.0, 34.9, 35.6, 40.9, 52.3 and 53.35 s, in `/tmp/claude-0/virality-tmp/l2_*.jpg`, with strips `l2_s1.jpg`, `l2_s2.jpg` and `l2_s3.jpg`.

> This is a pattern-based estimate against `docs/VIRALITY_PLAYBOOK.md`, not a prediction. The biggest factor is one we can't control: account size and how the first test cohort responds.

## Key metrics (pass 1 → pass 2)
| Metric | Pass 1 | Pass 2 | Read |
|---|---|---|---|
| Duration / words / pace | 48.8 s · 156 · 3.52 w/s | **54.0 s · 156 · 3.2 w/s** | Now at the top edge of the band. Punchlines get 0.34 s. |
| First word / hook length | 0.25 s / 1.78 s | 0.25 s / 1.59 s | "America tried to buy New Orleans." |
| Number/question in hook | false | false | Still a named stake, not a number (see change 4) |
| Cues / 10 s | 9.2 | **8.9** (48 cues) | dense |
| Longest gaps | 2.71 · 2.54 · 2.22 s | **2.84 s at 17.29 (budget)** · 1.90 · 1.89 | Two gaps fixed. One new plateau over 2.5 s; 1 of 27 two-second windows is empty. |
| Loop SSIM | 0.908 | **0.901** | full marks |
| Loudness | −14.0 | −14.0 LUFS | ok |

### What changed on screen (verified)
- **Frame 0:** fully settled. You see the title "HOW THE US DOUBLED IN SIZE", REDRAWN EP 3, the "New Orleans" marker, the 🏙 sticker, and the orange tip next to the blue US. Nothing fades in, and "1 city?" is gone. The small **orange dash at about (540, 690) full scale is still there**, on frame 0, on the loop frame, and on `cover_9x16.png` at about (945, 1200). It looks like a stray stroke on the 31°N / Isle-of-Orleans seam in `scripts/prep-louisiana.mjs` (`westFlorida` starts at −91.7 while the US1803 ring turns at −91.64).
- **Offer (2.1–3.4 s):** wide reveal, French flag, "ALL OF THIS" pointer. Still the best second of the video.
- **Port:** the French flag and "LOUISIANA" now sit on the purchase, with a pulse. **New defect: the xl "LOUISIANA" label is clipped at the left edge and reads "OUISIANA"** at 12.0–13.1 s (`l2_12.3.jpg`, beat_03 frame 3).
- **Budget (13.7–19.8 s):** the "up to $10,000,000 / FOR NEW ORLEANS + FLORIDA" count is clean. It disappears at about 19.2 s, though, and from 19.2 to 20.1 s the frame is **an almost empty world map with a thumbnail-sized US** (`l2_19.3.jpg`). That's the 2.84 s gap, and the camera stays at span 95 for 6 s.
- **Ask:** the money bag replaces the grey-oval eyes. Clean.
- **Deal → acre:** $15M and 2.8¢ no longer overlap. But **2.8¢ is fully legible for only about 1.0 s** (33.9–34.9 s; `hold: 1.0`) and is already fading on "acre." (`l2_34.9.jpg`). That's the video's most shareable number.
- **Legal:** the scroll on "constitutional." splits the old gap. "Constitutional?" then "Senate: 24 – 7" read cleanly.
- **Double:** the wide camera shows the whole 1803 US and the purchase. The purchase turns light blue with a pulse ring, and "×2" sits under it (`l2_40.9.jpg`). The transformation is finally *visible* on a paused frame. The Senate card is still fading out over the Gulf at 39.4 s. That's minor.
- **Borders:** chip and date hidden. "British lands", "Spanish lands" and all three "?" are readable.
- **Loop:** the sticker is back and the purchase recolours to orange. The purchase goes grey-blue mid-recolour at 52.3 s, which reads as a transition, not a glitch. The title returns on the final frame.
- **Covers:** `cover_9x16.png` and `cover_3x4.jpg` show the tag, title, full purchase shape, "≈ 2.8¢ PER ACRE · 828,000 SQ MI" and the coin. Both read well as thumbnails, and the 3:4 version is grid-safe.
- **POSTING.md:** the caption is good. But the **platform notes reintroduce the "one city" claim** that pass 1 removed for accuracy: the Reels DM line says "tried to buy one city", and the Shorts title says "The US tried to buy one city." The pinned comment stacks two questions, and its first one is a counterfactual the video doesn't address. SOURCES "Pinned comment" has no question at all.

## Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **21/25** | **Frame 0 (6/8):** settled title + place marker + city icon + orange/blue contrast, which now works paused and muted. Two things hold it back: the crop is basically the boot of the *state* of Louisiana, with no scale, no number and no "wow" shape, and there's the orange dash artefact. **Payload (5/7):** a named, concrete stake, but no number or contradiction until "France offered all of this" at 2.14 s. **Place (5/5):** "New Orleans" on frame 0. **Text (3/3):** a 6-word title that sets up the gap ("doubled" vs "one place"). **No throat-clearing (2/2).** |
| B. Retention | **23/25** | **Cue density (7/8):** 8.9 per 10 s, but one 2.84 s near-empty world-map stretch in the budget beat. **Escalation (5/6):** a clean but-therefore spine up to ×2. Borders → natives → 15 states is still a list, not a climb. **Re-hook (4/4):** "But Napoleon's army…" (37 %) and "what would you pay for all of Louisiana?" (46 %). **Payoff (4/4):** 3¢ at 62 %, ×2 at 75 %, visible. **Pace (3/3):** 3.2 w/s, captions readable. |
| C. Rewatch & loop | **10/10** | "All because…" → "America tried to buy New Orleans." (5/5). SSIM 0.901 (3/3). Pause frames: Native labels, 15-state grid, borders with Spanish/British lands, wide ×2 (2/2). |
| D. Shareability & saves | **14/15** | **Send (6/6):** "tried to buy New Orleans, France offered all of this", "under 3¢ an acre" (now clean), "Jefferson wasn't sure it was constitutional". **Save (4/4):** wide ×2 before/after, the 15-state ghost, EP 3. **Comment (2/3):** honest in-video triggers, but the pin asks two stacked questions led by an unanswerable counterfactual, and the canonical SOURCES pin has none. **Human stake (2/2).** |
| E. Packaging | **9/10** | **Cover (4/4):** composed 9:16 and 3:4 with shape, title and price, readable at thumbnail size. **Caption (2/3):** the caption is keyword-rich ("1803 Louisiana Purchase", Jefferson, Napoleon, Haiti, $15 million) and has 5 hashtags. But the same kit's Shorts title and Reels note bring back "tried to buy one city", which pass 1 removed as a "well, actually" magnet. **Series (3/3).** |
| F. Niche codes & trust | **12/15** | **Transformation (4/4):** orange → blue on a wide frame with ×2. **Scale anchor (2/3):** ×2 the 1803 US and 15 states. There's no familiar shape comparison (Texas would need a new sourced figure). **Faces (2/3):** small corner cards only. **Sourced/hedged (3/3):** hook matches the budget card, "Nineteen days" is logged, the offer-maker is unnamed, and both "Shown as settled 1818–19" and "Approximate areas" are on screen. **Anti-patterns (1/2):** clipped "OUISIANA", a near-empty frame for about 0.9 s at 19.2 s, the orange dash artefact. |
| **TOTAL** | **89/100 · 8.9/10** | **Tier: strong breakout odds** (pass 1: 79) |

## Top 5 remaining changes, ranked by expected gain (no new facts needed)

### 1. Fill the budget plateau and add a place cue for "Florida" (+2: B cue density +1, F anti-patterns +0.5, D save +0.5)
Hold the $10M count until the beat ends, and label Florida, which the narration names and the map already shows as Spanish. SOURCES "Map" states "minus Spanish Florida (… Pinckney's Treaty 1795)". To stay strictly inside SOURCES, use "Florida (Spain)". Don't add a date or claim anything about West versus East Florida here.
```json
// budget beat
{"type": "bigNumber", "value": 10000000, "prefix": "up to $", "label": "FOR NEW ORLEANS + FLORIDA", "dur": 0.9, "hold": 2.1, "y": 1000, "atWord": "ten"},
{"type": "marker", "text": "Florida (Spain)", "at": [-82.5, 28.5], "atWord": "Florida.", "hold": 1.2}
```
Optionally, add a second camera stop so the last 2 s aren't a world view with a thumbnail US. If the schedule supports only one camera per beat, split the beat at "ready" instead. The voice is unchanged; only the `say` is split across two beats.
```json
{"id": "budget",  "say": "Jefferson sends James Monroe to Paris,", "camera": {"center": [-40, 56], "span": 95}, ...},
{"id": "budget2", "say": "ready to pay up to ten million dollars for New Orleans and Florida.", "camera": {"center": [-86, 33], "span": 30, "dur": 0.7}, ...}
```
(Splitting does mean a new TTS beat boundary with a pause of up to 0.34 s. Check the pace afterwards.) Re-run metrics. The target is no gap over 2.5 s.

### 2. Fix the clipped "LOUISIANA" label and the orange dash (+1: F anti-patterns)
```json
// port beat: pull the label and flag inward (camera center -91, span 30) so the xl text stays inside x 60–1020
{"type": "label", "text": "LOUISIANA", "at": [-96.5, 40.5], "size": "xl", "atWord": "Louisiana", "hold": 1.1},
{"type": "sticker", "flag": "fr", "at": [-96.5, 40.5], "dy": -110, "size": 120, "atWord": "back", "hold": 0.6}
```
If it still clips, use `"size": "lg"`. Check with a still at frame 366 (12.2 s).
For the dash, look in `scripts/prep-louisiana.mjs` at the US1803 ring (`[-91.64, 31.0]`) against the `westFlorida` box (`-91.7`). The ~0.06° overlap likely leaves a sliver whose stroke shows at the hook zoom (span 7). Snap both to the same longitude, then re-export the geojson. Check frame 0 and the cover again, since the dash is also on `cover_9x16.png`.

### 3. Make the packaging consistent with the accuracy fix, and use one honest pinned question (+2: E caption +1, D comment +1)
In `deliverables/louisiana-1803/POSTING.md`:
- Reels line: replace "tried to buy one city" with **"America tried to buy New Orleans. France offered all of this."**
- Shorts title: **"America tried to buy New Orleans. France offered THIS."** (or "The US paid under 3 cents an acre for this").
- Pinned comment: keep the sources line, then ask **one** identity question that the video answers on screen:
  > Which of the 15 states do you live in? 👇

  Drop "Would the US look completely different if Napoleon had said no?". It's a counterfactual with no sourced answer, and it splits the replies. Add "Which border should we redraw next?" only as a second-day reply, not in the pin.
- Copy the same question into SOURCES.md "Pinned comment (EN)" so the canonical text matches.

### 4. Put a sourced number inside the first 3 s (+1: A payload)
The pointer at 2.80 s already lands on the full purchase. Give it the area, which is on screen later and in SOURCES (~828,000 sq mi). This adds a concrete number to the hook window without changing the voice or the loop.
```json
{"type": "pointer", "at": [-100, 42], "text": "828,000 SQ MI", "from": [200, -230], "atWord": "all", "hold": 0.9}
```
(Or keep "ALL OF THIS" and add a `"sub": "≈ 828,000 sq mi"` if the pointer component supports a subline.) The hook line itself stays "America tried to buy New Orleans." Don't add a dollar figure to sentence 1. "$10M for New Orleans" would drop the Floridas, which is exactly the "well, actually" pass 1 removed.

### 5. Hold the best number long enough to screenshot (protects D send; +0–1)
2.8¢ is fully legible for only about 1 s. Lengthen it, but end it before the "Constitutional?" callout at 36.42 s (same y):
```json
{"type": "bigNumber", "value": 2.8, "decimals": 1, "prefix": "≈ ", "suffix": "¢", "label": "PER ACRE · 828,000 SQ MI", "dur": 0.6, "hold": 1.7, "y": 1080}
```
(33.67 + 0.6 + 1.7 = 35.97 s, plus the fade, which clears 36.42 s.) In the same pass, set the "Senate: 24 – 7" callout `hold` from 1.2 to 1.0 so it's gone before the double beat's wide camera move. Same for "15 states" (`hold` 0.7 → 1.1), so the last number before the loop is readable.

**Expected total with changes 1–5: about 94/100.**

### Not ranked (each needs a new fact or a new asset)
- **Scale anchor (F +1):** a "Texas, same scale" ghost inside the purchase, as in EP 2. Texas's area is **not** in this episode's SOURCES. Add it from the U.S. Census Bureau state-area table first, plus a `TEXAS_GHOST` feature in `prep-louisiana.mjs`.
- **Faces (F +1):** a period image for the Native beat, for example a Library of Congress Bodmer or Catlin print of a Mandan village. It must be public domain or "no known restrictions", credited on screen and in the pin. Never AI-made.
- **Ending escalation (B +1):** the end climbs better if the last factual beat is the biggest number. That needs a new sourced modern comparison (e.g. the share of today's US area). Don't improvise one.

## 3 alternative hooks (all true per SOURCES.md)
| Archetype | Verbal line (0–2 s) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **A. Price per unit (big number)** | "Under three cents an acre. That's what America paid for all of this." Loop end: "All of it, for…" | `cover_9x16` composition as frame 0: full orange purchase beside the blue 1803 US, with "≈ 2.8¢ PER ACRE" settled (`bigNumber` `"from": 2.8, "atTime": -0.3`) | `3¢ AN ACRE?` |
| **B. Comparison** | "The United States doubled in size for fifteen million dollars." Loop end: "All because… America tried to buy New Orleans." (then the cold open replays) | The wide ×2 frame from the double beat, with purchase pulsing, "×2" settled | `×2 FOR $15M?` |
| **C. Contradiction (constitution)** | "Jefferson wasn't sure this was constitutional. He bought it anyway." | Large Jefferson card with the "BUYS IT" stamp over the orange purchase | `CONSTITUTIONAL?` |

Wording notes: C follows SOURCES ("Jefferson thought an amendment was needed; drafted one; proceeded without it"). Never say "illegal" or "unconstitutional" as a fact. A is the strongest stop. Don't compare it directly with Alaska's 2¢ unless both figures sit in this SOURCES file. Recommendation: ship the current hook with change 4. Use **A** as the first repost / Shorts A/B test, and keep C as the comment-bait variant.

## Cover, caption, hashtags, pinned comment
- **Cover:** use the existing `cover_9x16.png` (TikTok/Shorts) and `cover_3x4.jpg` (Instagram). Re-export both once the orange dash is fixed (change 2). If you try a second variant, use the wide ×2 frame at about 40.9 s with title + `≈ 3¢ AN ACRE`. That cover shows "doubled", where the current one only states it.
- **Caption** (POSTING.md version is good; keep it):
  > America tried to buy New Orleans. France offered all of Louisiana, for under 3 cents an acre.

  > The 1803 Louisiana Purchase on a map: Jefferson, Napoleon, Haiti, the $15 million deal, undefined borders and the Native nations who never agreed.

  > REDRAWN ep. 3. Map history in under a minute. Sources in the pinned comment.
- **Hashtags (5):** `#LouisianaPurchase #history #maps #geography #ushistory`
- **Pinned comment:** the sources line, then: *"Which of the 15 states do you live in?"*

## Platform notes
- **TikTok:** 54 s with a verbal + visual loop and no end card is right. Rewatch is the lever. Frame 0 is now a valid default thumbnail, but upload `cover_9x16.png` anyway, because it carries the price. Keep "Louisiana Purchase" in caption line 2 for search. If a cut to under 50 s ever becomes necessary, shorten pauses before cutting lines. The 3.2 w/s pace has no headroom.
- **Instagram Reels:** ranks on sends per reach. The DM moments are the 2.1 s reveal, 3¢ (lengthen it, change 5) and the wide ×2. Upload `cover_3x4.jpg`. Post natively, with no TikTok watermark. Caption keywords matter more than hashtags.
- **YouTube Shorts:** "viewed vs swiped" is decided at frame 0 and second 1. Fix the title (change 3). This is the best place to test hook **A**, because a big number on frame 0 beats a place name here. Put the sources in the description.

VIRALITY SCORE: 89/100 (8.9/10) — strong breakout odds
