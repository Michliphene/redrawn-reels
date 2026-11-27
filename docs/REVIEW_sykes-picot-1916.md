# REVIEW — sykes-picot-1916 (EP 5, DA 2, myth-bust)

## Reel review

Video `out/sykes-picot-1916.mp4` runs 55.2 s; the voice ends at 54.57 s. I looked at all 14 beat sheets (`out/review/sykes-picot-1916/`) and cues.md, plus extra frames at
0, 3.2, 3.5–3.9, 9.3, 10.5, 15.5, 17.6, 20.0, 21.9, 39.8, 46.0, 49.5, 51.2 and 53.9–55.05 s. `npm run validate` gives `[ ok ]`: no ✗ and no !.

### Verdict: 6/10. Not postable yet.
The story is clear and well sourced. The 1916 → 1926 progression works: zones, then the leak, then mandates, Transjordan, Turkey, Mosul, the overlay and the loop.
Six P1s block posting. All but one are one-line JSON changes. The other two are small component fixes: the caption width and the header fade.

**3 biggest problems**
1. **Neutrality/accuracy.** The payoff callout says "The lines **didn't**." The voice and SOURCES.md only say "Mostly not". The 1917 date block shows "23 NOV". SOURCES.md settled on "November 1917" because the sources disagree (22 vs 23 Nov).
2. **Layout breaks in the first 15 s.**
   - The caption "SYKES AND FRANÇOIS GEORGES-PICOT" runs off the right edge ("GEORGES-PIC").
   - The archive card reaches y≈1545 and x≈970.
   - The card's caption and credit sit below y=1440, and the credit is 15 px (unreadable).
   - The captions band covers the map image.
3. **The hook payoff and the loop seam.**
   - The MYTH stamp is on screen for only ~0.23 s: the stamp lands at 3.22 s and the callout dies at 3.45 s. It is also small.
   - In the last ~0.5 s, the returning title cross-fades over the "5 JUN / 1926 / The rewrite" block. At 54.7 s, "WHO REALLY DREW" and "1926" overlap.

### Fixes

1. **[P1] payoff · 49.35 s · The callout "The idea survived. The lines didn't." claims more than the voice and SOURCES ("Mostly not"; the debate is logged). It also stays up to 51.95 s, sits on Iraq, and covers the loop's Palestine/Iraq labels.**
   `{"type":"callout","text":"The idea survived. The lines? Mostly not.","size":54,"y":1040,"atWord":"lines?","hold":1.2}`

2. **[P1] leak · 18.42 s · The date block shows "23 NOV 1917". SOURCES says "screen date is November 1917" (one source gives 22 Nov).**
   Beat `leak`: `"date": "1917-11"`.

3. **[P1] map · 10.5–12.3 s · The caption line "SYKES AND FRANÇOIS GEORGES-PICOT" is cut at the right screen edge.** It also runs into the x>930 zone.
   - Cause: `src/studio/ui/Captions.tsx:53` estimates `maxChars = width/(size*0.47)`. That is too generous for wide uppercase glyphs and hyphenated names.
   - Fix: use `size*0.54`, or measure the text and wrap at the widest word. Re-check "GEORGES-PICOT" on its own line.
   - No episode-level workaround exists short of `hideCaptionWords`.

4. **[P1] map · 9.21–12.4 s · The archive card (y=640, w=860) breaks the safe area.**
   - The card spans y≈645–1545 and its right edge is at x≈970.
   - Caption "The signed map, 8 May 1916" sits at y≈1490 and the credit at y≈1515: both are below 1440.
   - The credit is 15 px, so the required credit is unreadable.
   - The captions band (1170–1410) covers the bottom of the map.

   Fix in the episode: free the header for this beat and lift the card:
   ```json
   {"id":"map", "hideDate": true, "actions":[{"type":"archive","src":"assets/images/sykes_picot_map_1916.jpg",
     "caption":"The signed map, 8 May 1916","credit":"UK National Archives MPK 1/426 · public domain",
     "y":360,"w":740,"hold":3.0,"focus":"50% 60%","atWord":"Mark"}]}
   ```
   The card then spans about 360–1160 and x 170–910. Component fix in `src/components/Overlays.tsx:61-62`: caption `fontSize: 34`, credit `fontSize: 24`.

5. **[P1] loop · ~54.6–54.8 s · The title and the date block overlap.**
   - Cause: `src/atlas/Atlas.tsx:93-94` fades the date block out over `end-0.5…end-0.2` while the title fades in from `end-0.45`.
   - Fix (sequential, no overlap): `headO = … * (1 - ramp(t, end - 0.8, 0.3))`, keeping `titleO` from `end - 0.45`.
   - Cue-only alternative: `"hideDate": true` on beat `loop`. allLabels names every piece there, and the title then returns onto a clean header.

6. **[P1] hook · 3.22 s · The MYTH stamp, the payoff of the hook, is visible for about 0.23 s and is tiny (38 px, at the right end of the callout).**
   `{"type":"callout","text":"“Two men drew these borders”","size":58,"y":1000,"atWord":"Two","hold":3.6,"stamp":"MYTH","stampWord":"myth.","stampSize":64}`

7. **[P2] zones · 12.63–17.8 s · "Blue for France" shows a lavender shape, because the 62 % ghost blends into the Ottoman brown. The red shape reads salmon.**
   Component: add an optional `opacity` to `ghost` in `src/atlas/Map3D.tsx:154` (`opacity={(g.opacity ?? 0.62) * o}`). Then use `"opacity":0.9` on SP_BLUE, SP_RED and SP_BROWN in `zones`.

8. **[P2] zones · 14.87 s · The A/B labels are readable and well placed: A in Syria and B under the line. But nothing says whose influence each one is.** The voice only says "their". SOURCES has A = French, B = British:
   `{"type":"label","text":"A · French","at":[39.0,35.6],"size":"xl","atWord":"A","occurrence":1,"hold":3.2}`,
   `{"type":"label","text":"B · British","at":[39.6,32.0],"size":"xl","atWord":"B:","hold":2.6}`

9. **[P2] overlay/payoff · 44.87–50.5 s · The 1916 ghosts mostly read over the 1926 pieces.**
   - The light-blue band over green Anatolia is the clearest evidence in the reel.
   - The red ghost on red Iraq is weak, and the brown sliver and the A/B line are faint.
   - Nothing on screen says these shapes are the 1916 plan.
   - 46.1→49.35 s has no new cue (3.25 s).

   Add:
   ```json
   {"type":"label","text":"1916 plan","at":[37.5,39.6],"size":"md","atWord":"plan","hold":1.6},
   ```
   in `overlay`. Change SP_RED's colour to `"#F59A9C"` in `overlay`. In `payoff`, add:
   ```json
   {"type":"pulse","ids":["IRQ","PAL","TRJ"],"atWord":"Britain"},
   {"type":"pulse","ids":["SYR","LBN","HATAY"],"atWord":"France"}
   ```

10. **[P2] turkey · 39.40 s · "France's northern zone is gone" highlights the whole SP_BLUE, including the coastal Syria/Lebanon strip that France kept. That is misleading.**
    - Data fix: emit `SP_BLUE_N = SP_BLUE ∩ TUR` from `scripts/prep-sykes.mjs`, then use `"id":"SP_BLUE_N"` here.
    - Wording: "Turkey wins its war" sits on a 24 Jul **1923** date. That is the Lausanne treaty; the fighting ended in 1922. Name it: `{"type":"chapter","emoji":"scroll","text":"Treaty of Lausanne","atWord":"1923:"}`.

11. **[P2] leak · 18.42–20.29 s · About 1.9 s of a dark Russia view with no place named.** Move the Petrograd marker to the word that names Russia and add the sourced fact:
    - `{"type":"marker","text":"Petrograd","at":[30.32,59.94],"atWord":"Russia's","hold":3.0}`
    - Replace the newspaper emoji sticker with `{"type":"callout","text":"Printed in Izvestia & Pravda","size":46,"y":1000,"atWord":"publish","hold":0.7}`.

    This also removes an emoji chip (DA 2 rule 5) that leaked across the cut into `fall` (it was up until 22.65 s).

12. **[P2] mosul · 24.59 s · The viewer cannot see why Mosul was France's to give.** It was in zone A (French influence).
    - Add `{"type":"label","text":"zone A · French","at":[41.6,36.9],"size":"md","atWord":"France","hold":1.8}`.
    - Drop the `pulse IRQ` at "Mosul.": it outlines modern Iraq in 1918, before Iraq existed.
    - Set the marker hold to 2.0, so it no longer runs 1.4 s into the 1920 beat.

13. **[P2] loop · 50.7 s on · "Palestine" and "Transjordan" labels touch.**
    - In `scripts/prep-sykes.mjs`, move the TRJ `properties.label` anchor to about [36.9,30.7], and PAL to [34.9,31.6].
    - Labels are about 24–26 px; make the allLabels size 30 px if the component allows.

14. **[P2] SOURCES.md · The "Script (as spoken)" section no longer matches the voice** (beats 2, 4, 5, 6, 9, 10, 11, 12 were rewritten). Update it to the episode.json `say` lines. The facts table still covers every on-screen claim; I checked each date and claim against it.

15. **[P3] deal · 9.21 s · The "OTTOMAN EMPIRE" region label shows through the fading-in archive card.** Set `"hold": 1.8`.

16. **[P3] trj · 35.72 s · The SP_LINES ghost (hold 2.2) runs across the cut into `turkey`.** Make "It's not on the map" concrete instead: SOURCES has "its land lay in zone B".
    - `{"type":"label","text":"1916: inside zone B","at":[37.2,30.4],"size":"md","atWord":"map","hold":0.7}`
    - Ghost `"hold": 0.7`.

17. **[P3] hook · frame 0 · The opening is a brown slab with a faint white A/B line.** It reads as an object on a table, but "these borders" points at nothing. Brighten the hook ghost so the line reads at frame 0: `{"type":"ghost","id":"SP_LINES","atTime":0,"hold":3.4}`, with a heavier line width in `Map3D` for `lines` ghosts.
    - Loop seam (SSIM 0.84): the end shows the coloured 1926 map, frame 0 shows brown.
    - Add `{"type":"ghost","id":"SP_LINES","atWord":"still…","hold":2}` in `loop`, so the same white 1916 line is on both sides of the cut.

18. **[P3] mandates · 28.2 s · The "Syria" label is low-contrast on light blue, and "Lebanon" sits on the lifted Lebanon piece.** Acceptable; it is better once the pieces settle.

### Accuracy checklist (on screen vs SOURCES.md)
| On screen | Status |
|---|---|
| May 1916 | ok |
| 8 May 1916 (map and card) | ok (MPK 1/426) |
| 23 NOV 1917 | **✗**, must be November 1917 (#2) |
| DEC 1918 | ok |
| 25 APR 1920 | ok (owner to tick) |
| APR 1921 | ok (owner to tick) |
| 24 JUL 1923 | ok as the Lausanne date; name it (#10) |
| 5 JUN 1926 | ok |
| Alexandretta in French Syria, 1926 | ok |
| Golan in Syria | ok, as documented |
| "The lines didn't." | **✗** (#1) |
| Flags GB/FR | ok for 1916 |

## Virality review

Re-render of 10:03 (55.2 s). Evidence:
- `pipeline/virality_metrics.py`: hook frames 0–3 s and the loop image.
- `review_frames.py`: all 14 beat sheets, regenerated from this render. The old sheets showed the pre-fix cut.
- Extra frames at 3.4, 47.8, 50.0 and 54.9 s.
- episode.json, SOURCES.md and the reel review above.

Metrics:
- Voice: 132 words, 2.6 w/s. Hook 3.31 s, first word at 0.25 s.
- Visual cues: 7.2 per 10 s. 2 of 28 two-second windows have no new cue.
- Longest gaps: 4.51 s at 50.69 (loop), 3.59 s at 0.25 (hook), 3.42 s at 9.21 (archive card).
- 3 camera cuts (leak, fall, turkey). LUFS −14.1. Loop SSIM 0.842.

This is a pattern-based estimate, not a prediction. Account size is the biggest factor, and we can't control it.

### Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **18/25** | Frame 0 (4/8): it has depth and a readable title, but it is one brown slab with hairline white lines, cropped at the right, and has no colour contrast; paused and muted, it reads as "a map", not "a claim". Payload (6/7): "Two men… 1916. That's the myth" is a strong contradiction with a number, but the turn lands at 3.2 s. Place (4/5): "Middle East" is in the title at frame 0, but no country is named until 50 s. Text (2/3): the "Two men drew these borders" callout is good, but it competes with the title, the whisper and the captions, and the MYTH stamp is small and at the edge. Throat-clearing (2/2): none. |
| B. Retention | **19/25** | Pacing (6/8): a camera move on every beat and 7.2 cues/10 s, but the loop holds 4.5 s with only allLabels and the archive card is static for 3.4 s. Structure (4/6): "Then the plan falls apart" is a real "but", then 1918/1920/1921/1923/1926 runs as a date list ("and then"). Re-hook (3/4): the cut, the shake and "falls apart" land at 22 s (40 %), but the line is short and only re-shows the ghosts. Payoff (3/4): the overlay at 44.9 s is the best image in the reel, but the payoff callout lasts only 1.2 s. Pace (3/3): 2.6 w/s, captions clean. |
| C. Rewatch & loop | **8/10** | Line (5/5): "Yet the story is still…" → "Two men drew these borders in 1916" completes cleanly. Last frame (2/3): SSIM 0.84, because the coloured 1926 end meets the brown start. Density (1/2): the labelled 1926 map is worth pausing on, but Palestine and Transjordan collide. |
| D. Shareability & saves | **12/15** | Send (5/6): busts a myth people repeat in arguments ("send to the friend who always says Sykes-Picot"), but the proof shot passes fast. Save (3/4): plan-vs-result reference map; series EP 5. Comment (3/3): an honestly debated point, hedged ("Mostly not"). Human stake (1/2): identity for viewers from the region, but no people on screen. |
| E. Packaging | **8/10** | Cover (2/4): frame 0 is title plus brown slab; the 47.8 s overlay is a much better cover. Caption (3/3): none existed; written below. Series identity (3/3): REDRAWN · EP 5 bar throughout. |
| F. Niche codes & trust | **9/15** | Transformation (3/4): brown 1916 → coloured 1926 plus the plan overlay; the blue-on-green Turkey band reads, the red-on-red Iraq part doesn't. Scale anchor (1/3): Britain and France are familiar actors, but there is no size anchor. Face/stakes (1/3): the signed map is a real artefact; no faces. Sourced/hedged (3/3): on-screen credit, "Nov 1917", "Mostly not", debate logged. Anti-patterns (1/2): an emoji newspaper chip (DA 2 rule 5) leaks into `fall`; >3 s with nothing new in the loop. |
| **TOTAL** | **74/100 · 7.4/10** | **Tier: "can break out"** |

### Top 5 changes, ranked by expected gain
Edits are for the producer: this review changes nothing. Every fix keeps the facts in SOURCES.md, and none needs a new voice.

1. **Frame 0 in colour: show the 1916 zones under "these borders" (+4: A frame 0, C loop SSIM).**
   - Now "these borders" points at faint hairlines on a brown slab.
   - The borders the two men drew are the 1916 zones. Showing them is more accurate *and* gives a paused, muted frame with real colour contrast.
   - In `hook.actions`, replace the SP_LINES ghost with:
   ```json
   {"type":"ghost","id":"SP_BLUE","color":"#4F86E0","atTime":0,"hold":3.4,"opacity":0.9},
   {"type":"ghost","id":"SP_RED","color":"#F59A9C","atTime":0,"hold":3.4,"opacity":0.9},
   {"type":"ghost","id":"SP_BROWN","color":"#C9A54A","atTime":0,"hold":3.4,"opacity":0.9},
   {"type":"ghost","id":"SP_LINES","atTime":0,"hold":3.4}
   ```
   - The MYTH stamp then lands on a coloured "plan", which is the visual contradiction.
2. **Show the payoff line long enough to read and send (+2: B payoff, D send).** It is the sentence people will quote. Today it is up for 1.2 s.
   ```json
   {"type":"callout","text":"The idea survived. The lines? Mostly not.","size":54,"y":1060,"atWord":"lines?","hold":2.6}
   ```
   - Check on stills that it clears the loop's allLabels (Palestine/Transjordan sit at about y 1010). If it touches, use `"y":1100`, still above the captions band.
   - Optional, from reel review #9: `{"type":"pulse","ids":["IRQ","PAL","TRJ"],"atWord":"Britain"}` and `{"type":"pulse","ids":["SYR","LBN","HATAY"],"atWord":"France"}` in `payoff`, so "the idea survived" is shown, not only said.
3. **Fill the 4.5 s loop hold and close the seam (+2: B pacing, C last frame → SSIM ≥ 0.85 likely with fix 1).** In `loop.actions`:
   ```json
   {"type":"pulse","ids":["TUR","SYR","IRQ","TRJ"],"atWord":"treaties,"},
   {"type":"ghost","id":"SP_BLUE","color":"#4F86E0","atWord":"still…","hold":1.4,"opacity":0.9},
   {"type":"ghost","id":"SP_LINES","atWord":"still…","hold":1.4}
   ```
   - The 1916 plan comes back on the map just as the voice wraps to "Two men drew these borders".
4. **Remove the emoji chip; show the source in its place (+1: F anti-pattern; it also stops the leak into `fall`).**
   - In `leak`, replace the newspaper `sticker` with: `{"type":"callout","text":"Printed in Izvestia & Pravda","size":46,"y":1000,"atWord":"publish","hold":0.9}`.
   - Sourced: SOURCES.md, Marx Memorial Library.
5. **Cover and caption (+2: E cover).**
   - Set the platform cover to **47.8 s** (the overlay; frame shown below).
   - Use the caption below. No render needed.

Projected: about 83–85 if all five land, the edge of "strong breakout odds". No fix changes a fact.

Considered and **rejected**:
- A size anchor ("the size of …"): SOURCES has no area figure, so we'd be inventing one.
- "Sykes-Picot didn't draw these borders" without "most": stronger hook, but it overstates the logged debate.

### 3 alternative hooks (all true per SOURCES.md)
| Archetype | Verbal line | Frame 0 | On-screen text |
|---|---|---|---|
| **Comparison / in-media-res** | "Blue is France's 1916 plan. Green is what it got: nothing. That's Turkey." | The overlay shot (1926 map with the blue SP_BLUE_N ghost on green Turkey), camera already moving | `1916 PLAN vs 1926 MAP` |
| **Contrarian (hedged)** | "Sykes-Picot didn't draw most of these borders. Ten years of deals did." | 1916 zones in colour on the slab (fix 1), MYTH stamp already on | `NOT TWO MEN. TEN YEARS.` |
| **Question (shaped)** | "Why is France's 1916 zone inside Turkey?" | Green Turkey with the blue northern zone glowing, "1916 plan" label | `France's zone… in Turkey?` |

The "nothing" in the first hook applies only to the Anatolian zone. Voice it as "Green is where that zone ended up: Turkey" if it must not sound absolute. All three would need a re-voice of beat 1, so they are for a v2 or an A/B cut, not this render.

### Cover frame, caption, hashtags, pinned comment
- **Cover: 47.8 s.**
  - The 1926 map, with "1916 plan" over the blue band on green Turkey and the red/blue mandates below.
  - The REDRAWN · EP 5 bar is on it.
  - If the platform allows a text overlay, add "WHO REALLY DREW THE MIDDLE EAST" in the title band (y 250–500).
- **Caption:**
  > Two men didn't draw these borders in 1916. Here is the plan vs what actually happened.
  > Sykes-Picot Agreement explained · the 1916 map vs the 1926 Middle East · Mosul, Transjordan, Treaty of Lausanne
  > Ottoman Empire partition · British and French mandates · Syria, Lebanon, Iraq, Palestine history · REDRAWN EP 5
- **Hashtags:** #SykesPicot #MiddleEast #MapHistory #History #Geography
- **Pinned comment:** use the SOURCES.md text, which credits the map and logs the debate. End it with: *"Before this, who did you think drew these borders?"* That question is softer than "which border came straight from 1916" and invites stories, not fights.
- Moderation: this topic touches Palestine/Israel. Expect heated comments.
  - The pinned sources and the "Mostly not" hedge are the shield.
  - Do not reply with claims beyond SOURCES.md.

### Platform notes
- **TikTok:** 55 s is fine. Completion and rewatch are what count, so fixes 1 and 3 (frame 0 and seam) matter most.
  - Don't stretch this to 61 s for Creator Rewards. A 61–70 s cut would need new sourced content (for example, the 1925 League decision on Mosul), not padding.
  - Search reads on-screen text, so keep "Sykes-Picot" in the caption's first line.
- **Instagram Reels:** sends drive reach, and the shareable unit is the overlay plus "The lines? Mostly not." (fix 2).
  - Set the 47.8 s cover. The grid crops to 3:4, and the title and map band survive the crop.
  - Hashtags won't add reach; the caption keywords do.
- **YouTube Shorts:** the first second decides "viewed vs swiped". Use the coloured frame 0 (fix 1).
  - Title: "Sykes-Picot didn't draw most of the Middle East's borders". This is the hedged form, true per SOURCES.
  - Shorts loops automatically, so the seam fix (3) also helps here.
