# REVIEW · bir-tawil (REDRAWN EP 8, DA 2) · v2 full redo, pass 1

> v1 review superseded by the v2 redo (new script, voice, palette); v1 notes removed.

Video `out/bir-tawil.mp4` (49.95 s). `npm run validate`: **ok, 0 ✗, 0 !**. Guides stills (0, 3.2, 25.6, 33.6, 49.8 s):
no readable text in the red zones. Only scenery (the Halaib piece, the Red Sea) goes past x>930 / y>860.
Facts: every on-screen figure matches SOURCES.md (19 JAN 1899, 22°N, 4 NOV 1902, ~800 sq mi · 2,025 km² our calc.,
9× · 18,208 vs 2,025 km² our calc., 2014, "Kingdom of North Sudan", not recognised).

## Verdict: not postable yet · 6.5/10
The script is much clearer than v1, and the trap beat (patch turns green under line 1, lavender under line 2) is the
best moment in the reel. What blocks it is execution: the screen doesn't show the logic as cleanly as the voice says it.
Biggest problems:
1. **The date header says "4 NOV 1902" from 23 s to 41 s**, over "Now both want the coast…". That presents the
   present-day dispute as a 1902 fact (anachronism).
2. **Line two never shows at "Sudan says line two"** (27.2 s). In the `both` cut the cyan path is hidden behind the
   raised Halaib piece: you only see cyan specks, and they land at the same moment as the pink flash.
3. **The hook and the loop show an unexplained piece and don't match.** At frame 0 Halaib is the brightest thing on
   screen (bare sand, no label, cut at the right edge). The last frame shows Halaib in pink with both lines drawn,
   while frame 0 has no lines. On top of that, the "Egypt" label runs into the whisper at 1–2 s.

## Fixes (beat · time · problem · fix)
1. **[P0] both→size · 23.1–41.6 s · "4 NOV 1902" stays up over present-day claims.** Add `"hideDate": true` to beats
   `both`, `trap`, `cost` and `size`. (`heaton` sets 2014 again.)
2. **[P0] both · 27.19 s · line two can't be seen.** Draw it one word earlier, from a camera that looks at Halaib's
   north edge, and thicken that path:
   `"camera": {"center":[35.3,22.55],"span":3.8,"pitch":52,"yaw":-18,"cut":true}`. On the line-2 path in `both`:
   `"atWord":"line","occurrence":2,"dur":0.5,"width":9`. Keep the pink HALAIB declare and "claimed by both" on `two.`.
   Check with a still at 27.0 and 27.5 s.
3. **[P0] hook · 0–3 s · Halaib draws the eye at "this desert" and has no label.** Make it quiet at frame 0. Add to
   `hook`: `{"type":"declare","id":"HALAIB","atTime":0,"noLabel":true,"quiet":true,"color":"#3A3552"}`.
4. **[P0] loop · 48–50 s · the last frame doesn't match frame 0.** Delete the 3 `path` actions in `loop` and add
   `{"type":"declare","id":"HALAIB","atWord":"Nobody's","noLabel":true,"quiet":true,"color":"#3A3552"}`. The last
   frame is then the frame-0 shot: amber patch, quiet triangle, same camera. Keep the `though…` pulse.
5. **[P1] hook · 1.0–2.8 s · the "Egypt" label hits the whisper** (y≈590–600 while the camera moves). Change it to
   `"at":[33.9,22.4]` (Egypt side, west of Halaib), `"hold":2.4`. Check with a still at 2.0 s.
6. **[P1] line1 · 8–14 s · in 1899 both pieces are bare sand with no meaning, and Egypt/Sudan are no longer named**
   (their labels left at 2.85 s, and Egypt's purple blends into the sky). Show the 1899 state: each piece takes the
   colour of the country on its side of 22°N, then name both sides on "border":
   change the BIRT quiet declare to `"color":"#2C3D35"`, add
   `{"type":"declare","id":"HALAIB","atTime":7.95,"noLabel":true,"quiet":true,"color":"#3A3552"}`,
   `{"type":"label","text":"Egypt","at":[32.6,22.55],"atWord":"border","hold":3.0}`,
   `{"type":"label","text":"Sudan","at":[32.6,21.45],"atWord":"border","hold":3.0}`.
   Line 2 then "cuts out" the two pieces in the next beat, which is the whole story.
7. **[P1] line1 · 13.41 s · "22°N" sits on top of "LINE 1 · 1899"** (still at 13.45 s). Set the `22°N` label to `"hold":1.3`.
8. **[P1] cost · 33.5–36.4 s · 3 s with nothing new**, and "accepting the other side's line" has no visual. Add
   `{"type":"label","text":"claim it = accept their line","at":[33.75,21.55],"atWord":"accepting","hold":1.7}`.
9. **[P1] trap→cost · 33.3–33.9 s · "line 2 → Egypt" lingers onto the amber patch** (the label says Egypt while the
   colour says nobody). Set that label to `"hold":1.2`. Do the same for "line 1 → Sudan" (`"hold":1.6`) so the
   two labels never overlap.
10. **[P1] line1/line2/both/trap/loop · the line paths are too thick.** At width 7 the white bar covers half of
    Bir Tawil (frames at 13.4 and 20.3 s). The brief asked for thinner pieces. Set `"width":4` on every white/cyan
    `path` (keep 9 only for fix 2).
11. **[P2] cost · 33.47 s · amber means "nobody", but it turns on at "claiming".** Remove the cost-beat BIRT declare.
    The patch stays lavender (Egypt's reading) and turns amber only at `nobody's.` (41.04 s), so the colour lands
    as the payoff. Keep the pulse.
12. **[P2] both · 25.2–25.4 s · "Egypt: line 1" lands on the fading "Halaib Triangle".** Set the `Halaib Triangle`
    label to `"hold":1.1`.
13. **[P2] gives · 19.8–22.8 s · the patch is tiny and its lavender is hard to see under the lines.**
    `"camera": {"center":[34.7,22.25],"span":4.3,"pitch":60,"yaw":-22}`. With fix 10 the patch stays visible.
14. **[P2] component · light labels on bright fills** ("Halaib Triangle" and "→ Sudan" on light green, "claimed by both"
    during the pink flash, "lose this" on pink) have weak contrast. In the DA 2 map label, add a dark ink plate or a
    2 px ink outline when the label sits over a declared piece. Fallback: move those labels off the piece, e.g.
    `"at":[35.2,21.75]` (Sudan side of 22°N).
15. **[P2] heaton · 46.58–47.2 s · the "Kingdom of North Sudan" caption peeks out behind the NOT RECOGNISED card.**
    Set the `units` action to `"hold":2.9`. The callout lingers into the loop (48.0 s): set it to `"hold":1.3`.
16. **[P2] heaton · 43.6 s · "plants a flag" shows a tiny white pawn, not a flag.** Use a pin/flag marker instead of
    `units` crowd (a plain pole, no micronation flag, which keeps the sources rule):
    `{"type":"marker","at":[33.75,21.87],"atWord":"plants","hold":2.9,"label":"\"Kingdom of North Sudan\""}`.
    If the marker can't render a pole, keep the unit but raise it to `"size":110`.
17. **[P3] palette · Egypt (#3A3552) is nearly the sky colour**, so the north bank reads as sky. Try
    `"EGY":"#463D63"` and check on stills.
18. **[P3] line2 · 17.74 s · "grazing lands" floats in Sudan's area.** Pin it to the Bir Tawil leg of line 2:
    `"at":[33.6,21.6]`, `"hold":1.2`.

## What works
- New script: "line one / line two" + "Here's the trap" makes the paradox easy to follow by ear. Sync is within
  ±0.2 s on every coloured re-declare (patch, triangle, trap colours).
- The palette logic (lavender = Egypt, green = Sudan, pink = both, amber = nobody) is clean, and the trap beat's
  colour flip is the reel's signature image.
- Camera: one idea per beat, cuts at `both` and `trap` work as re-hooks, and the cost pull-back reveals the 9× scale.
- Safe area clean; numbers labelled "our calculation"; captions never covered.

---

# Virality — bir-tawil (REDRAWN EP 8, DA 2) · v2 full redo, pass 1

Final render `out/bir-tawil.mp4` (50.5 s container, 49.95 s video), with the clarity review's P0–P2 fixes applied, plus dark
plates and silent recolours. Evidence: `pipeline/virality_metrics.py` (6 hook frames, loop image), and the 11 beat sheets plus
`cues.md`. Both were **regenerated from this render**, because the earlier sheets predated the last cue-sheet edit. Also read:
`episode.json`, `SOURCES.md` (script v2), `timings.json`, `src/Thumb.tsx`, and the v1 virality pass (git `6ff5316`).
Metrics: 138 words, **2.94 w/s**, first word 0.25 s, hook sentence 2.85 s, 42 cues = **8.3 cues/10 s**. Longest gaps: 2.40 s
(38.64, 9× → "nobody's"), 2.39 s (29.61, inside the trap), 2.32 s (14.09, the 1902 travel). 1 of 25 two-second windows has
no cue, and every beat has a camera travel or cut. **Loop SSIM 0.943** (v1 0.903); −14.4 LUFS.
The `say` is locked, so every fix below is cue sheet or packaging only. Each `atWord` was checked against `timings.json`.
*This is a pattern-based estimate, not a prediction. The account's size and history are the biggest factor, and we can't control it.*

## Scorecard
| Block | Pts | Why |
|---|---|---|
| A. Hook 0–3 s | **22/25** | Frame 0 is a low crane on the amber slab under "THE LAND NO COUNTRY CLAIMS", with Egypt (purple) and Sudan (green) **labelled on frame 0**, and Halaib now quiet. The slab is the only bright thing. But it fills only ~¼ of the width, and the lower 55 % of the frame is empty green (6/8). Sentence 1 is a crisp contradiction ("Neither will claim it" at 2.1 s, v1 2.7 s), but it has no number now: "800" moved to 5.6 s (6/7). The place is clear in under 1.5 s: country labels at 0 s, and the whisper "Bir Tawil, between Egypt and Sudan" at about 1.0 s (5/5). The title is 5 words and *is* the hook (3/3). No intro (2/2). |
| B. Retention | **23/25** | 8.3 cues/10 s, the longest gap is 2.4 s, and the camera moves on every beat (8/8). Real but/therefore spine: straight line → line two → gives → both want the coast → **here's the trap** → **so** claiming = losing → **and** 9× → **so** nobody's → human coda. The 1899/1902 exposition (8–18 s) is still the plateau risk, and the camera yaw flips (Red Sea right in `line1`, top in `line2`), which can disorient non-map viewers (5/6). Re-hook: a cut at 23.1 s (46 %) plus "Here's the trap" with a cut and shake at 27.9 s (56 %) (4/4). The why is paid at 29–41 s and the coda keeps a second payoff, but "nobody's" lands at 82 % (3/4). 2.94 w/s, word-by-word captions with keywords (3/3). |
| C. Rewatch & loop | **9/10** | "Nobody's land. Even though…" → "Two countries border this desert. Neither will claim it." This is a true grammatical loop (5/5). SSIM 0.943, with the same crane, the same amber slab and the title back on (3/3). Frames are clean but sparse, with moderate pause value (1/2). |
| D. Shareability & saves | **12/15** | Send fact: *each country's own line hands the patch to the other*. The trap beat (patch green under line 1, lavender under line 2) now **shows** it. It is a mental model, but Bir Tawil is a well-worn map topic (5/6). Save value: the series and a two-line diagram, but no reference map (2/4). Honest comment triggers: "what would you call your country?" and "why doesn't someone just take it?" (3/3). The princess dad gives a human stake (2/2). |
| E. Packaging | **9/10** | The in-reel cover at about 1.9 s works: title, whisper, labels, slab, and the caption "TWO COUNTRIES BORDER THIS DESERT." The current `thumb` is still weak on context (see below) (3/4). Caption written below (3/3). REDRAWN · EP 8 bar and series look (3/3). |
| F. Niche codes & trust | **11/15** | One visible transformation: line two cuts the two pieces out of the 1899 map, then the trap colour flip, then amber "claimed by nobody". Each step is labelled on a plate (4/4). Scale is "~800 sq mi" and an internal 9×, with no familiar US/UK anchor (1/3). Human stake without a face, which is right for rights. But "plants a flag" shows a small white pawn, not a flag (2/3). Hedged and sourced: "about", "our calc.", "our calculation · 18,208 vs 2,025 km²", year-only 2014, dates hidden over present-day beats (3/3). One minor §8 hit: the "KINGDOM OF NORTH SUDAN" caption is Mono 24 px (tiny), and "Egypt: line 1" is pale while it fades in over light green (1/2). |
| **TOTAL** | **86/100 → 8.6/10** | **Tier: strong breakout odds** (borderline, so treat it as "can break out" with an upside) |

**What improved vs v1 (83 → 86):** the place is named on frame 0, which v1 lacked (+2 A). The cue gaps are ≤ 2.4 s (v1 2.7 s) (+1 B).
The loop SSIM is 0.94, and the loop is now the exact frame-0 shot. The logic is *visible*: the trap colour flip with plated labels
replaces v1's puzzle of four unlabelled recolours (+1 F). The 1899 dates are hidden over present-day claims (a trust fix).
**Lost:** the number in sentence 1 (−1 A). It was the price of a sharper contradiction, and the trade is right.

## Top 5 changes, ranked by expected gain (no `say` change)
1. **+1 (A frame 0) · Bigger slab on frame 0 *and* on the last frame.** Tighten the crane so the amber slab fills about half the
   width and sits lower, away from the empty bottom. Apply the **same** camera to `hook` and `loop`, or the SSIM loop breaks:
   ```json
   "camera": {"center": [33.85, 22.2], "span": 2.8, "pitch": 62, "yaw": 28}
   ```
   Starting values only: check stills at 0 / 1.0 / 2.0 / 49.8 s. The "Egypt" label (`[33.9,22.4]`) must stay below the whisper.
   Drop it to `[33.95,22.3]` if it touches the whisper. Re-run `virality_metrics.py`; SSIM must stay ≥ 0.85.
2. **+1 (B gaps, DA 2 in-world) · Land the 9× and the trap in the world, not only in widgets.** Add:
   - `size`: `{"type":"pulse","ids":["HALAIB"],"atWord":"bigger."}` (39.23 s). This splits the 2.40 s gap, and the big piece throbs while the 9× is on screen.
   - `trap`: `{"type":"pulse","ids":["BIRT"],"atWord":"Sudan's."}` (30.51 s). This splits the 2.39 s gap on the word where line 1 lands the patch in Sudan.
3. **+1 (E cover) · Replace the `thumb`.** See "Thumb" below.
4. **+1 (F trust / tiny labels) · Make the Heaton beat read.** On the `heaton` `units` action set `"size": 110` (the pawn is
   ~20 px tall now). If the shared `marker` renders in DA 2, use it instead:
   `{"type":"marker","text":"\"Kingdom of North Sudan\"","at":[33.75,21.87],"atWord":"plants","hold":2.9}`. Check on a still at 44.5 s.
   Never draw the micronation's flag (no image is sourced or licensed). Also give the `name` beat's "~800 sq mi…" label
   `"hold": 1.7`. It currently runs under the "1899" date at 8.1 s.
5. **+1 (F scale anchor), conditional on a source.** Bir Tawil, 2,025 km² (our calc.), is about **1.3× Greater London**
   (1,572 km²). **The Greater London figure is NOT in SOURCES.md.** Add it with a source (ONS / London Datastore), plus the line
   "1.3× = our calculation", before using it. Then put it in the caption/pinned comment, or as the `name` label text:
   `"~800 sq mi · ≈1.3× Greater London (our calc.)"`. Without the source line, skip it.

Projected after 1–4: about 89/100 (estimate, not a promise).

## 3 alternative hooks (for a remaster or re-cut only: each needs a new voice line; all true per SOURCES.md)
| Archetype | Verbal line | Frame-0 visual | On-screen text |
|---|---|---|---|
| Big number | "About 800 square miles, and no country on Earth claims it." | Crane on the amber slab, label "~800 sq mi (our calc.)" already on | NO COUNTRY CLAIMS THIS |
| Comparison | "Egypt and Sudan both claim this coast. Neither claims this desert." | Wide two-piece shot: pink Halaib "claimed by both", amber Bir Tawil "claimed by nobody" | BOTH WANT THIS. NOBODY WANTS THIS. |
| Human / in media res | "In 2014, an American planted a flag here so his daughter could be a princess." | The pawn already on the amber slab, caption "Kingdom of North Sudan" | THE LAND NO COUNTRY CLAIMS |

Title-only A/B with no voice change: `"title": "Neither country wants it"` is weaker. Keep "The land no country claims", which matches
the sourced word "claim".

## Thumb (current config judged, then proposed)
**Current:** `fit:["BIRT"]` into small boxes (vertical 420×280, landscape 500×360). That frames only the patch, so the coast,
Halaib and the Red Sea are off-canvas. In the frame-0 palette Halaib (#3A3552) also melts into Egypt (#463D63), and Thumb draws
no place labels. What remains is an amber shape under a straight line between a purple field and a green field. The kicker
"EGYPT VS SUDAN" is the only context, and it reads as if the two fight over *this* land. That is the opposite of the story (they
fight over Halaib). `mainSizeV 140` wraps "NO / COUNTRY / CLAIMS THIS" onto 3 lines and eats the map's height.
**Proposed:**
```json
"thumb": {
  "kicker": "Between Egypt & Sudan",
  "main": "No country claims this",
  "mainSize": 124,
  "mainSizeV": 130,
  "badge": "~800 sq mi",
  "badgeSub": "of desert · Bir Tawil",
  "fit": ["BIRT"],
  "center": [33.75, 21.87],
  "mapBox": [1100, 300, 1820, 760],
  "mapBoxV": [240, 860, 840, 1240]
}
```
Why: the kicker places it honestly. At 130 the main text breaks as "NO COUNTRY / CLAIMS THIS" on 2 lines (it ends at about
y 725). That frees room for a 600 px-wide slab at y ≈ 900–1180 in the clear band of the gradient (46–72 %). The landscape map
starts after the text fade (x > 1075). `badgeSub` adds the searchable name. Keeping `fit` on BIRT keeps the subject big: adding
Halaib would shrink the patch to ~200 px and add only a dark shape. Check: the kicker (21 chars at 64 px) must fit the 980 px
vertical column. If it wraps, use `"Egypt–Sudan border"`.

## Cover, caption, hashtags, pinned comment
- **Cover:** the `Thumb` render (above), or **1.9 s** in-reel (title, whisper, Egypt/Sudan labels, amber slab, caption "TWO
  COUNTRIES BORDER THIS DESERT."). Cover text: **NO COUNTRY CLAIMS THIS**.
- **Caption (IG / TikTok / YT Shorts):**
  > Two countries border this desert. Neither will claim it. Here's the trap that keeps Bir Tawil nobody's land.
  > Bir Tawil, the unclaimed land between Egypt and Sudan: the 1899 border (22nd parallel) vs the 1902 line, and the Halaib Triangle.
  > Why claiming it means losing the coast, and the 2014 "Kingdom of North Sudan" flag.
- **Hashtags (5):** #birtawil #maps #geography #history #africa
- **Pinned comment** (SOURCES.md text, no emoji):
  "Sources: Anglo-Egyptian agreement (1899, 22°N) and the 1902 administrative line, via Wikipedia/WorldAtlas; Time and CBS News
  (2014) for the flag. Areas are our calculation from Natural Earth (Bir Tawil 2,025 km², Halaib 18,208 km²); published figures vary.
  If you could claim Bir Tawil, what would you call your country?"

## Platform notes
- **TikTok:** post the 50 s cut as is. The loop and rewatch are the levers, so don't add an end card. Use the in-reel frame
  at 1.9 s or the vertical Thumb as the cover. The caption's first line is the hook, and the keywords "Bir Tawil Egypt Sudan"
  feed search. A 61–70 s Creator Rewards cut would be a different edit (e.g. a Halaib "who runs it today" beat, already sourced). Don't slow this one down.
- **Instagram Reels:** sends drive non-follower reach, so lead the caption with the paradox (line 1 as above). Set the cover
  in the 3:4 grid crop (Thumb vertical is built for it). Hashtags don't add reach, so 3 are enough
  (#birtawil #maps #geography). No watermark from other apps.
- **YouTube Shorts:** "viewed vs swiped" is decided in frame 0–1, so fix #1 (bigger slab) matters most here. Title:
  "The land no country claims (Bir Tawil)". Put the sources in the description as well as in the pinned comment.

VIRALITY SCORE: 86/100 (8.6/10) — strong breakout odds
