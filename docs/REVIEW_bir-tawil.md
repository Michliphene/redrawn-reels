# REVIEW · bir-tawil (REDRAWN EP 8, DA 2) · pass 1

Video `out/bir-tawil.mp4` (49.0 s, voice 48.5 s). `npm run validate`: **ok, 0 ✗, 0 !**. Safe area (guides, 8 stills):
nothing readable in the red zones. Only the Halaib tip and the Red Sea coast (scenery) enter x>930/y>860.

## Verdict: not postable yet. 6/10, about 8/10 after the P1s.
The world reads well: clear Egypt-blue / Sudan-green key, a clean wide shot on "Egypt or Sudan", good cuts.
The **logic twist is not readable for a scrolling viewer**, though. You asked whether the subject pieces sit too
high. They don't: they sit in the stage band, slightly above centre. The twist fails for other reasons.
1. **The lines aren't on screen when the voice argues with them.** In `both` and `catch` ("Egypt says the first
   line", "Egypt's line puts…") neither the 22°N line nor the 1902 line is drawn. The 1899 line also fades out
   (14.5 s) before the 1902 line appears (15.6 s), so the two lines are never seen together. What remains is a
   slab changing colour, and it changes ~1 s late.
2. **Every re-colour lands ~0.95 s after its word** (FLASH 0.25 + SETTLE 0.7, plus a hop). In `both` the HALAIB
   piece is a white flashing slab on "first" (27.1→28.0) and on "second." (28.7→cut at 29.37), so the pink
   "claimed by both" never settles before the cut. In `catch` the "neither" flash leaves BIRT white at 34.6.
3. **Frame 0 shows the wrong subject.** The crane opening cuts BIRT off at the left edge, and a huge pink HALAIB
   slab fills the frame. "800 square miles of desert" lands on the pink piece, and pink = Halaib for the rest of
   the reel. On top of that, the `catch` labels `Egypt: "it's Sudan's"` / `Sudan: "it's Egypt's"` put quoted
   words in governments' mouths that are not in SOURCES.md. Also, "Sudan: …" (33.16 + 1.5 s) overlaps
   "claimed by nobody" (34.38).

All fixes below were **checked on stills** using a scratch copy of the episode (since deleted): BIRT is
centred and dominant at frame 0 and at the loop end, both lines show in `both`/`catch`, and no labels collide.

## Fix list
1. **[P1] hook · 0.0–4.0 s · frame 0 crops BIRT, pink HALAIB reads as the subject.** Recentre and drop the
   frame-0 HALAIB declare, so Halaib stays neutral sand until `gives`. Copy the same camera to `loop` so the
   loop cut still matches.
   ```json
   "camera": {"center": [34.2, 22.05], "span": 3.8, "pitch": 54}
   ```
   Delete `{"type":"declare","id":"HALAIB","atTime":0,…}` from `hook`. The quiet reset in `neighbors` can stay.
2. **[P1] both · 25.8–29.4 s · "first line / second" has no line on screen; the colour lands late and the pink
   never settles.** Use a wider cut so both pieces and the lines are in frame. Replace the actions with:
   ```json
   "camera": {"center": [35.3, 22.3], "span": 4.2, "pitch": 50, "yaw": 14, "cut": true},
   "actions": [
    {"type":"label","text":"Halaib Triangle","at":[35.6,22.35],"atWord":"coast.","hold":1.3},
    {"type":"path","coords":<22°N coords from l1899>,"atWord":"Egypt","dur":0.6,"hold":1.4,"color":"#FFFFFF","width":6},
    {"type":"declare","id":"HALAIB","atWord":"Egypt","noLabel":true,"quiet":true,"color":"#4F8FE0"},
    {"type":"path","coords":<2nd path coords of l1902 (Halaib edge)>,"atWord":"Sudan","dur":0.6,"hold":1.2,"color":"#56CFE1","width":6},
    {"type":"declare","id":"HALAIB","atWord":"Sudan","noLabel":true,"color":"#FF4FA3"},
    {"type":"label","text":"claimed by both","at":[35.6,22.7],"atWord":"second.","hold":1.0}]
   ```
   The triggers move one word earlier ("Egypt" 26.50 instead of "first" 27.09; "Sudan" 27.94 instead of
   "second." 28.73), so the colours are settled when the key word is spoken. Pink is reached by about 28.9.
3. **[P1] catch · 29.4–35.2 s · the twist: show each line as it is named, recolour quietly, drop the invented
   quotes, end the overlap.** Replace the actions with:
   ```json
   {"type":"path","coords":<22°N coords>,"atWord":"Egypt's","dur":0.6,"hold":2.6,"color":"#FFFFFF","width":6},
   {"type":"declare","id":"BIRT","atWord":"Egypt's","noLabel":true,"quiet":true,"color":"#7FB77E"},
   {"type":"label","text":"Egypt's line → Sudan","at":[33.45,22.2],"atWord":"Egypt's","hold":2.4},
   {"type":"path","coords":<1st path coords of l1902 (BIRT edge)>,"atWord":"Sudan's","dur":0.6,"hold":1.9,"color":"#56CFE1","width":6},
   {"type":"declare","id":"BIRT","atWord":"Sudan's","noLabel":true,"quiet":true,"color":"#4F8FE0"},
   {"type":"label","text":"Sudan's line → Egypt","at":[33.75,21.55],"atWord":"Sudan's","hold":1.8},
   {"type":"declare","id":"BIRT","atWord":"neither","noLabel":true,"color":"#FFC94D"},
   {"type":"label","text":"claimed by nobody","at":[33.75,21.87],"atWord":"neither","hold":1.0},
   {"type":"shake","amount":6,"atWord":"neither"}
   ```
   On the stills, a label at [33.75,22.2] touched the pink slab and the white ribbon, so the Egypt label moves
   to lon 33.45. The Sudan label now ends at 34.14, before "neither". The camera (span 2.0) is fine and keeps BIRT
   near the middle of the stage (y ≈ 690–930).
4. **[P2] l1899→l1902 · 14.5–23.2 s · the two lines are never seen together**, but the whole story is "two
   lines". Keep both lines through `gives`: l1899 path `"hold": 13.5` (until ~23.0); l1902 paths
   `"hold": 7.4` (`second`) and `"hold": 7.1` (`line,`). The `22°N` label keeps `hold 2.6`.
5. **[P2] gives · 20.1 / 22.1 s · BIRT/HALAIB colours land ~1 s after "patch"/"triangle".** Trigger them a word
   earlier: BIRT `"atWord":"desert"` (19.76), HALAIB `"atWord":"coastal"` (21.67). Keep the flash here, since
   this is the first claim.
6. **[P2] loop · 45.3 s · "Two lines" shows one line.** Add the two l1902 paths
   `{"type":"path",…,"atWord":"lines.","dur":0.6,"hold":2.0,"color":"#56CFE1","width":5}`.
7. **[P2] heaton→loop · 45.3–45.9 s · the NOT RECOGNISED callout and the "Kingdom of North Sudan" caption
   carry over onto "Two".** Use callout `"hold": 1.4` and units `"hold": 4.0`.
8. **[P2] catch→size · 35.4–36.4 s · "claimed by nobody" carries over into "The coast"** (old hold 2.0). This
   is fixed by `hold: 1.0` in #3.
9. **[P3] both/catch/size · the timeline marker stays at 1902 while the voice says "Today".** Either hide the
   rail in these beats or accept it. Don't add a year that SOURCES.md doesn't give.
10. **[P3] l1902→gives · 19.1–19.7 s · "for the grazing tribes" carries over into "It hands".** Use `"hold": 1.2`.
11. **[P3] heaton · 40.6 s · "plants a flag" shows a white pawn** (`units crowd`). That's fine as a symbol. A
    small `flag` unit kind (pole + blank cloth, no micronation flag) would be stronger. This is optional and
    needs a component change in `Units3D`.
12. **[P3] size · 36.3 s · the sub-label "our calculation · 18,208 vs 2,025 km²" is about 27 px.** It's
    readable but at the floor. Raise the bigNumber label size if the component allows it.

## Beat notes (beats with no issue)
- `neighbors`: the wide shot names Egypt and Sudan on their words. Good re-orientation.
- `l1899`: the date appears at the beat start and the line draws on "draw". The 2.3 s before "draw" is carried
  by the camera move: acceptable.
- `heaton`: 2014, the caption and the VOID stamp are in sync and inside the safe area.
- Loop: the last frame returns to the frame-0 crane pose. It still matches after fix #1, since `loop` gets the
  same camera.

## Accuracy vs SOURCES.md
800 sq mi ("about"; our calc 782), 1899 / 19 Jan, 22°N, 1902 / 4 Nov, grazing tribes, Halaib coastal,
9× = our calculation (18,208 / 2,025 km²), Egypt runs Halaib, 2014 year only, "Kingdom of North Sudan", not
recognised by any government: **all match**. The only problem is the invented quotes in `catch` (#3).
No contested-border issue: the 22°N line and the NE disputed areas are shown as lines and claims, not as a
ruling.

---

# Virality — bir-tawil (REDRAWN EP 8, DA 2) · pass 1

Final render `out/bir-tawil.mp4` (49.1 s, voice 48.5 s), checked after P1 #1–3 and P2 #4–8/#10 above. Evidence:
`pipeline/virality_metrics.py` (hook frames 0–3 s, loop image), and the 10 beat sheets plus `cues.md`. These were
regenerated from the final render, because the earlier sheets predated the last cue-sheet edit. Also read:
`episode.json`, `SOURCES.md`, `timings.json`.
Metrics: 137 words, 2.99 w/s, first word 0.25 s, hook sentence 3.76 s, 40 cues = **8.1 cues/10 s**. Longest gaps:
2.72 s (29.62 s, catch), 2.65 s (11.54 s, l1899→l1902), 2.30 s (23.45 s, cut into `both`). 2 of 25 two-second windows have
no cue, and the camera moves or cuts on every beat. **Loop SSIM 0.903**; −14.2 LUFS. The `say` is locked (voice recorded),
so every fix below is cue sheet or packaging only. Each `atWord` was checked against `timings.json` (no `{a|b}` token involved).
*This is a pattern-based estimate, not a prediction. The account's size and history are the biggest factor, and we can't control it.*

## Scorecard
| Block | Pts | Why |
|---|---|---|
| A. Hook 0–3 s | **20/25** | Frame 0 has depth: a low crane on the amber Bir Tawil slab next to a sand-coloured Halaib slab, under "THE LAND NOBODY WANTS". It works paused, but the bottom half is empty green, and **Egypt's dark blue reads as sky or sea**. With the sound off, nothing says this is Africa or a border (6/8). Sentence 1 has a number and a contradiction ("800 square miles… no country on Earth will claim it"), though "no country" only lands at 2.7 s (6/7). The whisper "Bir Tawil, between Egypt and Sudan" appears by about 0.5 s in small serif type, the slab label only at 1.84 s, and the country names only at 4.8 s (3/5). The title is 4 words and is the hook itself (3/3). The first word is at 0.25 s, with no intro (2/2). |
| B. Retention | **22/25** | 8.1 cues/10 s, plus a camera travel or cut on every beat. Two gaps of about 2.7 s are each bridged by one camera move only (7/8). Real but/therefore spine: nobody → not even neighbours → line 1 → line 2 → each picks the coast → **but** each line hands the patch to the other → **so** neither → 9× → the princess. The 1899/1902 exposition (7–19 s) is the plateau risk (5/6). The cut at 23.45 s (48 %) plus the "But…" twist at 29.4 s (60 %) form a good mid-video re-hook (4/4). The hook's question ("why nobody?") is paid at 34.4 s (71 %), after a 30 s wait, and the Heaton coda keeps a second payoff for the end (3/4). 2.99 w/s, word-by-word captions with keywords (3/3). |
| C. Rewatch & loop | **9/10** | "And stuck in between…" → "About 800 square miles of desert…" is a real grammatical loop (5/5). SSIM 0.903, with the same crane pose (3/3). But the two lines have faded by "between…" (22°N ends 47.92, 1902 lines 47.76; "between…" is at 47.77), so the last image of the reel doesn't *show* "in between". Moderate pause value (1/2). |
| D. Shareability & saves | **12/15** | Strong send fact: *each country's own border gives the patch to the other, so neither claims it*. It works as a mental model, not just trivia. Bir Tawil is a well-worn map topic, though, so map-niche viewers have seen "the land nobody claims". The *why* is what's new, and it must be readable (5/6). Save value: the series, plus a two-line diagram you could reuse, but not a reference map (2/4). Honest comment trigger: "what would you call your country?" and "why doesn't someone just take it?" (3/3). Human stake: the dad and the princess flag (2/2). |
| E. Packaging | **9/10** | The in-reel cover (about 0.8–1.0 s) works: 4-word title, whisper, big amber slab. It still doesn't say where the place is, and no `thumb` exists yet (3/4). Caption written below (3/3). REDRAWN · EP 8 badge and series look (3/3). |
| F. Niche codes & trust | **11/15** | One visible transformation: the two lines are drawn, then Bir Tawil goes blue → green → blue → amber "claimed by nobody". It is visible, but it is four colour changes in 5 s, so it reads as a puzzle rather than one clear change (3/4). Scale is given in miles but with no familiar anchor; "9×" only compares the two pieces with each other (1/3). Human stake without a face, which is the right call for rights reasons (2/3). Hedges are on screen ("about", "our calculation · 18,208 vs 2,025 km²", 2014 year only, "Egypt's line → Sudan" instead of quotes), and SOURCES.md is complete (3/3). No playbook §8 anti-pattern left after the P1 fixes (2/2). |
| **TOTAL** | **83/100 → 8.3/10** | **Tier: can break out** |

## Top 5 changes, ranked by expected gain (no `say` change)
1. **+2 · Name the place on frame 0 (A place, A frame 0, E cover).** A muted scroller sees a yellow block on a green field under a blue
   "sky". Put the slab name on from the start, and name the two countries in the first 1.7 s (before "Bir Tawil" would compete):
   ```json
   {"type":"label","text":"Bir Tawil","at":[33.75,21.87],"atTime":0,"hold":3.9},
   {"type":"label","text":"Egypt","at":[33.4,22.6],"atTime":0,"hold":1.7},
   {"type":"label","text":"Sudan","at":[33.6,21.3],"atTime":0,"hold":1.7}
   ```
   (`hook` beat. Replace the existing "Bir Tawil" label on `desert,`. Each label ends before the `neighbors` beat at 4.29 s, where
   Egypt and Sudan are named again on the wide shot.) The camera cranes back during the hook, so check the Egypt label on stills
   at 0.3 / 1.0 / 1.6 s: it must sit on the blue land behind the slab and below the whisper. Nudge its latitude down (22.45) if it
   touches the whisper. The labels fade in, so frame 0 itself may still show none of them. That is fine for the scroll, but use ≥ 0.5 s
   as the in-reel cover.
2. **+2 · Make the loop show "stuck in between" (C, B payoff).** Extend the loop lines so they are on screen while "between…" is
   spoken, and gone (0.5 s fade) before the last frame, so the SSIM match with frame 0 is kept:
   - `loop` 22°N path (`atWord "Two"`): `"hold": 2.9` (end 48.22, gone 48.72)
   - both `loop` l1902 paths (`atWord "lines."`): `"hold": 2.7` (end 48.26, gone 48.76; the video ends at 49.1)

   Re-run `virality_metrics.py` after the render. SSIM should stay ≥ 0.85.
3. **+1 · Show which side of the 1899 line is which (D send fact, F transformation).** The whole twist depends on the viewer seeing
   that the patch sits on the Sudan side of 22°N. Name the two sides while the line draws, ending before the "22°N" label (11.54 s):
   ```json
   {"type":"label","text":"Egypt","at":[32.6,23.0],"atWord":"Egypt","hold":1.6},
   {"type":"label","text":"Sudan","at":[32.6,21.2],"atWord":"Sudan's","hold":1.6}
   ```
   (`l1899` beat: "Egypt" 9.21 → 10.81 s, "Sudan's" 9.75 → 11.35 s; both tokens are exact and occur once in the beat.)
4. **+1 · Close the two longest gaps (B new visual ≤ 2.5 s).**
   - `l1899`: `{"type":"pulse","ids":["BIRT"],"atWord":"parallel."}` (13.34 s). This splits the 2.65 s gap and points at the patch
     just under the line, which sets up the twist.
   - `catch`: `{"type":"pulse","ids":["BIRT"],"atWord":"Sudan."}` (31.43 s; the exact token `Sudan.` wins over `Sudan's`). This
     splits the 2.72 s gap on the word where Egypt's line lands the patch in Sudan.
5. **+1 · Cover and thumb (E cover).** Add the `thumb` block below. Use it as the TikTok/Reels cover, or pick 0.9 s in-reel once
   fix 1 is in.

Conditional, **+1 (F scale anchor)**: Bir Tawil (2,025 km², our calc) is about 1.3× Greater London (1,572 km²). **The Greater
London figure is NOT in SOURCES.md.** Add it with a source (ONS / London Datastore) before using it, and only in the caption or
pinned comment, labelled "our calculation". Without the source, skip it.
Projected after 1–5: about 88/100. This is an estimate, not a promise.

## 3 alternative hooks (for a re-cut or remaster only: each needs a new voice line; all true per SOURCES.md)
| Archetype | Verbal line | Frame-0 visual | On-screen text |
|---|---|---|---|
| Contradiction | "Two borders. Each one hands this desert to the other country." | Low crane: the white 22°N ribbon and the cyan 1902 line already drawn, the amber slab between them | EACH BORDER GIVES IT AWAY |
| Human / in media res | "In 2014, a dad from Virginia planted a flag here so his daughter could be a princess." | The pawn already standing on the amber slab, caption "Kingdom of North Sudan" | THE LAND NO COUNTRY CLAIMS |
| Comparison | "Egypt and Sudan both claim this coast. Neither claims this desert." | Wide two-piece shot: pink Halaib "claimed by both", amber Bir Tawil "claimed by nobody" | BOTH WANT THIS. NOBODY WANTS THIS. |

(Never use "Egypt says it's Sudan's" style quotes. No government statement in those words is in SOURCES.md; see P1 #3.)
Title-only A/B you can test with no voice change: `"title": "No country claims this"`. It is closer to the sourced wording
("claim") than "wants". Keep "The land nobody wants" as the main version, since the voice line matches it.

## Cover, caption, hashtags, pinned comment
- **Cover:** the `Thumb` render, or 0.9 s in-reel after fix 1 (title, whisper, large amber slab, labels). Cover text:
  **NO COUNTRY CLAIMS THIS**.
- **`thumb` for episode.json:**
  ```json
  "thumb": {
    "kicker": "Between Egypt and Sudan",
    "main": "No country claims this",
    "mainSize": 120,
    "mainSizeV": 140,
    "badge": "~800 sq mi",
    "badgeSub": "of desert · Bir Tawil",
    "fit": ["BIRT", "HALAIB"],
    "center": [34.6, 22.0]
  }
  ```
  `main` is 22 characters and wraps to "NO COUNTRY / CLAIMS THIS". The "~" copies the spoken "about". Halaib, about 9× larger and
  sand-coloured, gives the amber patch its scale on Egypt blue and Sudan green. On the landscape version, check that the 150 px
  badge does not run into the map box at x ≥ 900.
- **Caption (IG / TikTok / YT Shorts):**
  > About 800 square miles of desert, and no country on Earth claims it. Not even Egypt or Sudan, right next door.
  > Bir Tawil, the unclaimed land between Egypt and Sudan: the 1899 border (22nd parallel) vs the 1902 line, and the Halaib Triangle dispute.
  > Why each country's own border gives Bir Tawil away, and the 2014 "Kingdom of North Sudan" flag.
- **Hashtags (5):** #maps #geography #history #birtawil #africa
- **Pinned comment:** use the SOURCES.md text, with the question on its own line (no emoji):
  "Sources: Anglo-Egyptian agreement (1899, 22°N) and the 1902 administrative line, via Wikipedia/WorldAtlas; Time and CBS News
  (2014) for the flag. Areas are our calculation from Natural Earth (Bir Tawil 2,025 km², Halaib 18,208 km²); published figures vary.
  If you could claim Bir Tawil, what would you call your country?"

## Platform notes
- **TikTok:** 49 s sits well for completion. Don't stretch it. A Creator Rewards cut (61–70 s) would be a different edit with new,
  sourced lines (e.g. why the 1902 line followed grazing land), not this one slowed down. Set the cover to the Thumb or 0.9 s.
  Search on TikTok reads the caption and on-screen text, so "Bir Tawil" must appear in both. With fix 1, it is on screen from 0 s.
- **Instagram Reels:** sends drive reach to non-followers, so the first caption line is the send fact. The vertical Thumb keeps
  everything inside the 3:4 grid crop (y 240–1680). Upload the clean master, never a TikTok-watermarked file.
- **YouTube Shorts:** "viewed vs swiped away" is decided in second 1, so fix 1 (names on screen before 1 s) matters most here.
  Shorts title: "Why no country claims Bir Tawil (Egypt vs Sudan)". The loop is strong on Shorts autoplay once fix 2 keeps both
  lines on screen for "in between".

VIRALITY SCORE: 83/100 (8.3/10) — can break out
