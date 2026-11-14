# Virality review — alaska-1867 · pass 1

Video: `out/alaska-1867.mp4` (54.9 s, final render after clarity passes 1–2).
Evidence: `python3 pipeline/virality_metrics.py alaska-1867` (run for this pass), the 6 hook frames (0–3 s), `loop_first_vs_last.jpg`, 12 beat sheets + `cues.md`, `episode.json`, `timings.json`, `SOURCES.md`, `docs/review/alaska-1867-pass1.md` and `-pass2.md`.

> This is a pattern-based estimate against `docs/VIRALITY_PLAYBOOK.md`, not a prediction. Account size and the first test-cohort response matter more than anything scored here.

## Key metrics
| Metric | Value | Read |
|---|---|---|
| Duration / words / pace | 54.9 s · 147 words · **2.88 w/s** | in the 2.5–3.2 band |
| First word | 0.25 s | no throat-clearing |
| Hook line | "$7.2 million. That's what America paid for all of this." (3.75 s) | number + stake in sentence 1 |
| Visual cues | 48 · **8.7 per 10 s** | dense for a single-map reel |
| Longest gaps without a new cue | 3.49 s @ 29.5 (folly; the stamp at 32.33 is not counted, so the real gap is ~2.8 s) · 2.62 s @ 36.8 · 2.58 s @ 11.5 | 2 of 27 two-second windows are empty |
| Loop SSIM, first vs last frame | **0.903** | full marks |
| Loudness | −14.0 LUFS | on target |

## Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **20/25** | Frame 0 (5/8): title "HOW ALASKA BECAME AMERICAN" plus a red Alaska work paused and muted, but **frame 0 has no number or stake**. The bigNumber starts at 0.25 s because actions can't fire before the first word. Payload (7/7): "$7.2 million… for all of this" is concrete and has a defined shape. Place (4/5): the title names Alaska on frame 0, but the shape floats alone with no neighbours or scale, and the pointer only comes at 2.27 s. Text (2/3): at 1.0–2.0 s there are 4 text blocks at once (title, $7,200,000, FOR ALL OF THIS?, and a caption that repeats "$7.2 MILLION."), plus ~20 coins. No throat-clearing (2/2). |
| B. Retention | **20/25** | Cue density (6/8): 8.7 per 10 s, but 3 gaps over 2.5 s. Escalation (4/6): mostly chronological ("On March 30… The Senate… October 18… Then… Then… In 1959"). The 7.3 s sign beat is name-heavy (Secretary of State William Seward… Eduard de Stoeckl) and is the plateau. Re-hook (4/4): "MYTH CHECK" at 27–33 s (50–60 %) is right on target. Payoff (3/4): "2¢ an acre" at 26 s is strong. The bargain payoff (gold, oil, twice Texas) comes in the last 8 s, with no number on what Alaska turned into. Pace and captions (3/3). |
| C. Rewatch & loop | **10/10** | "All of it, bought for…" → "$7.2 million." is a clean verbal loop (5/5). SSIM 0.90 (3/3). The labelled maps (Native areas, gold/oil markers, Texas overlay) reward a pause (2/2). |
| D. Shareability & saves | **10/15** | Send fact (5/6): "two cents an acre" plus "Seward's Folly is a myth" are both sendable. The myth-bust is a bit soft ("largely a later myth" comes after "Some critics mock the deal"). Save (2/4): a good reference map, but no episode number or series hook to complete. Comment trigger (2/3): nothing in-video. The Native and Russia-sold-it angles will draw comments on their own, so a pinned question has to steer them. Human stake (1/2): the Native beat is 3.8 s; the portraits are small and short. |
| E. Packaging | **8/10** | Cover (3/4): the 1.5 s frame (title + $7,200,000 + FOR ALL OF THIS? + Alaska) is a great thumbnail, but the coins and the caption clutter it, and the title sits in the zone the Reels 3:4 grid crops. Caption (3/3): none exists; the best version is written below. Series (2/3): REDRAWN badge and title style are consistent, but there is no "EP 2" or series cue. |
| F. Niche codes & trust | **12/15** | Transformation (4/4): red → blue at "American" is visible. Scale anchor (2/3): miles are used and "twice the size of Texas" is shown, but only at 51 s. Faces/stakes (2/3): Seward and Stoeckl appear as small corner cards for 1.6–3.2 s. Sourcing and hedges (3/3): "Historians point to", "approximate traditional areas", "flags stylised", "LATER MYTH" with a sub-line; all figures are in SOURCES.md. Anti-patterns (1/2): mild text crowding in the hook, and the caption duplicates the bigNumber. |
| **TOTAL** | **80/100 · 8.0/10** | **Tier: can break out** |

## Top 5 changes, ranked by expected gain
All facts stay as in SOURCES.md. None of these needs new research except where flagged.

### 1. Put the payload on frame 0 and declutter the hook (+3: A frame 0, A text, E cover)
Frame 0 should already read "$7.2M for this?" when paused and muted. On Shorts, "viewed vs swiped" is decided here.
- **Component change (one line)** in `src/lib/schedule.ts` after the `atWord` block: `if ('atTime' in a && typeof a.atTime === 'number') t = a.atTime;` Then in the hook bigNumber:
  ```json
  {"type":"bigNumber","value":7200000,"prefix":"$","label":"FOR ALL OF THIS?","coins":true,"dur":1.0,"hold":3.45,"y":1080,"from":0.35,"atTime":0}
  ```
  (from 0.35, frame 0 shows "$2,520,000". For a fully settled number on frame 0, use `"from":0.98`; it loses the roll but reads better as a still. I recommend 0.98.)
- **Remove the duplicate caption** for "$7.2 million." while the bigNumber is on screen. Captions.tsx can skip words with `t < hookBigNumberEnd` in the hook beat, or add `"hideCaptionWords":["$7.2","million."]` to the hook beat. This takes the hook from 4 text blocks to 3.
- Drop `coins` to ~10 (or add `"coinsCount":10`) so the cover frame stays readable.

### 2. Bring the Texas scale anchor into the hook (+3: A place, F scale, D send)
"For all of this" lands on a lone shape. US/UK viewers can't feel its size until 51 s. Show Texas at "all" in the hook (3.37 s) and keep the ending one too (repetition = payoff):
```json
{"type":"ghost","id":"TEXAS_GHOST","atWord":"all","hold":0.9},
{"type":"region","text":"Texas, same scale","at":[-151,63.5],"atWord":"all","hold":0.8}
```
The pointer "THIS IS ALASKA" (2.27 s) stays. The ghost fades by ~4.5 s, so it doesn't collide with beat 01. Fact: "more than twice the size of Texas" is in SOURCES (land ratio 2.21). If it reads too busy, use a stronger verbal line: "$7.2 million. For a land more than twice the size of Texas." (Hook B below.)

### 3. Cut the sign beat by ~2.5 s (+2: B plateau, completion)
At 7.3 s this is the longest beat, and it spends ~3 s on titles and names that the portrait cards already show on screen. New `say`:
> "On March 30, after an all-night session, Seward signs the treaty with Russia's envoy."

The facts are identical. The portraits keep the full names and roles ("William Seward · U.S. Secretary of State", "Eduard de Stoeckl · Russian envoy"). Edits: Washington marker `"atWord":"Seward"`; Seward portrait stays at `"Seward"`; Stoeckl portrait stays at `"envoy"` with `"hold":1.8`. The `Stoeckl` respell becomes unused (harmless). Runtime drops to ~52 s, nearer the 50 % completion sweet spot.

### 4. Make the myth-bust punchier and fill the 29.5–32.3 s gap (+2: D send, B cue density, F face)
The current line hedges first and busts second. Lead with the label people know. This is still neutral and still sourced (Hill 2019; SOURCES "contemporary jokes existed… most supportive or neutral"):
> "Ever heard it called Seward's Folly? Some critics did mock the deal. But that label is largely a later myth."

Add a cue on "Seward's" in the middle of the gap: a short reprise of his face links the name to the person.
```json
{"type":"portrait","key":"seward","name":"William Seward","role":"the 'Folly' was his deal","side":"left","y":360,"small":true,"focus":"58% 32%","zoom":2.2,"atWord":"Seward's","hold":1.6}
```
(If the line changes, re-point the callout `atWord` to "Seward's" and the pointer to "label".) This adds ~0.5 s, which change 3 more than covers.

### 5. Give the payoff a "but/therefore" turn and a series cue (+1–2: B escalation, E series, D save)
- Gold beat: "Then come the gold rushes. Then oil." is two "and thens". Make it a turn: **"Then the "icebox" pays off: gold rushes, then oil."** This is only allowed if "icebox" is logged in SOURCES.md as a contemporary/period jibe with a reference (the same Hill/ADN sources discuss "Seward's icebox"). **Do not use it until it is sourced.** Fallback with no new fact: "And then? Gold rushes. Then oil."
- A stronger payoff number (e.g. Prudhoe Bay's rank among North American oil fields, or $7.2M in today's dollars) would raise B and D. **It needs a cited figure added to SOURCES.md first. Do not put it on screen otherwise.**
- Series: add an `EP 2` tag next to the REDRAWN badge (Brand.tsx, small, hook beat + loop only, so frame 0 still matches the last frame).

## 3 alternative hooks (all true per SOURCES.md)
| Archetype | Verbal line (0–2 s) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **A. Big number / price-per-unit** | "About two cents an acre. That's what America paid for Alaska." Loop end: "…all of it, for about…" | Red Alaska, the "2¢" bigNumber already settled, sub "PER ACRE · 375M ACRES" | `2¢ AN ACRE?` |
| **B. Comparison / scale** | "$7.2 million. For a land more than twice the size of Texas." | Red Alaska with the TEXAS_GHOST inside it from frame 0, number on top | `2× TEXAS FOR $7.2M` |
| **C. Myth-bust** | "'Seward's Folly'? Most newspapers in 1867 didn't think so." (Hill 2019: most supportive or neutral) | Red Alaska under a newspaper card "SEWARD'S FOLLY", the red "LATER MYTH" stamp already on it | `"SEWARD'S FOLLY" = MYTH` |

Recommendation: keep the current line plus change 1 (frame-0 number) plus change 2 (Texas at "all"). That gives most of B's power without breaking the verbal loop. Test C as a second cut on a later repost; myth-bust hooks earn more comments, but the loop line would need rewriting.

## Cover, caption, hashtags, pinned comment
- **Cover:** use the frame at **t ≈ 1.6 s** (title + "$7,200,000 / FOR ALL OF THIS?" + red Alaska + money bag), ideally re-rendered as a still with coins off and no caption. For Instagram's 3:4 grid crop, move the title block down ~200 px on the cover only (or compose a cover: Alaska + Texas ghost + "$7.2M FOR THIS?" in the middle 1080×1440).
- **Caption** (hook line ≤150 chars + 2 keyword lines):
  > Russia sold Alaska to the US for $7.2 million. That's about 2 cents an acre.
  > The 1867 Alaska Purchase explained on a map: Russian America, Seward's treaty, the 37–2 Senate vote and the "Seward's Folly" myth.
  > REDRAWN ep. 2: map history in under a minute. Sources in the pinned comment.
- **Hashtags (5):** `#AlaskaPurchase #history #maps #geography #alaska`
- **Pinned comment:** keep the sources text from SOURCES.md, then add the question:
  > "Which US land deal should we redraw next: the Louisiana Purchase or the Gadsden Purchase?"

  This is a genuine question tied to the payoff, and it seeds the series. Avoid "Should Russia want it back?", which would invite political pile-ons.

## Platform notes
- **TikTok:** completion and rewatch rule. With change 3, ~52 s is fine; under 50 s would be better. Keep the loop exactly (no end card, no "follow"). The right-side UI column (x > ~900 px) overlaps the money-bag sticker (x 880) and the locator globe only slightly; it's fine. Put "Alaska Purchase" in the on-screen text and caption, because TikTok search reads both.
- **Instagram Reels:** sends per reach is the lever. The "2 cents an acre" and myth lines are the DM-able moments, so make sure each sits on screen ≥1.5 s as text (acre bigNumber hold 1.6 ✓; the "LATER MYTH" stamp is on screen ~0.6 s before the cut → raise the callout `hold` so the stamp stays ≥1.2 s). Upload a custom cover (see above); don't rely on frame 0. Hashtags don't drive reach; the caption keywords do.
- **YouTube Shorts:** "viewed vs swiped" is judged on the first frame and second, so change 1 matters most here. Title: "Russia sold Alaska for 2 cents an acre". Shorts loop natively, so the verbal loop pays off. Put the sources in the description.
