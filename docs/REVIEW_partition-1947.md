# REVIEW — partition-1947 (EP 12, REDRAWN, DA 2, explainer)

## Reel review

**Verdict: not postable yet. Score 6.5/10.** The neutrality is mostly right. Both figures are shown as ranges with
"estimates vary", no blame is claimed, and Kashmir is never coloured for India or Pakistan. Every date and figure on
screen is in SOURCES.md, except the "SEP" date in the exodus beat. The Radcliffe ribbon is correct: it covers only
the Punjab segment (29.9–32.6°N) plus the whole Bengal/Sylhet border, and it is drawn on "draw" and redrawn on "line".
Two problems block posting, both in the most sensitive beats. A third problem hurts retention.

Checked: `npm run validate` gives `[ ok ]` (0 ✗, 0 !). Safe-area stills with guides (0, 2.8, 21.5, 33.8, 43.5, 47.6 s):
nothing readable is above y=250, below y=1440 or in the right box (x>930, y>860). Metrics: −14.3 LUFS, loop SSIM 0.87,
3 windows of 2 s with no cue (26.9–29.6, 33.6–36.8, 38.7–42.9).

**The 3 biggest problems**
1. **Exodus (33.6–36.9 s): the "REFUGEES" tag covers the death-toll figure.** The screen reads "200[REFUGEES]illion
   dead". The most sensitive number in the reel cannot be read, and in the last third of its hold it is faint white text
   on orange.
2. **Kashmir (36.8–43.9 s): "DISPUTED" is on screen for only 1.0 s, and nothing happens for 4.2 s before it.**
   "DISPUTED" is cream italic on pink with no plate. It appears on "It's" (42.89 s) and is cut at 43.89 s. Between the
   shake on "fighting" (38.7 s) and "It's" nothing changes, so "its ruler joins India, and Pakistan rejects it" plays
   over a still map. The Kashmir piece is never named in its own beat. The date block reads "26 OCT" while the voice
   says "fighting breaks out", but the fighting began on 22 Oct and 26 Oct is the accession date (one account gives 25).
3. **The loop does not close.** Frame 0 is the pink British India slab with the two yellow ribbons. The last frame is
   the labelled India/Pakistan/Bangladesh map in orange and green. The loop also lists Kashmir among "three countries"
   with no qualifier.

## Fix list

1. **[P1] exodus · 33.55–36.95 s · REFUGEES tag on top of "200,000–2 million dead · estimates vary"; the figure is
   faint over orange.**
   Fix: move the label south of the crowds and give the caption to the second crowd (the one east of the line), so it
   sits away from the label:
   ```json
   {"type":"units","kind":"crowd","at":[74.2,31.3],"count":16,"spread":110,"size":44,"atWord":"Millions","hold":4.0,"offset":[-150,40]},
   {"type":"units","kind":"crowd","at":[75.1,31.2],"count":16,"spread":110,"size":44,"atWord":"both","hold":3.2,"offset":[150,-40],"caption":"Refugees"},
   {"type":"label","text":"200,000–2 million dead · estimates vary","at":[74.0,28.6],"size":"md","atWord":"Estimates","hold":3.2}
   ```
   Check on stills at 33.8 and 35.5 s. The label must stay left of x=930 and stay readable over the orange plain (if not,
   the label needs the dark plate that path labels already have, in `src/components/Labels.tsx`).
2. **[P1] kashmir · 42.89 s · DISPUTED is shown for 1 s and is hard to read; this is the neutrality claim of the reel.**
   Name the piece on "Kashmir.", grey it out at the accession (from that point the piece is contested, not just
   unacceded), and keep a plated DISPUTED tag on screen from "rejects" to the cut:
   ```json
   "palette": { "ids": { "KASHMIR": "#8E8A9C", "IND": "#E07B39", "PAK_W": "#2E8B57", "PAK_E": "#3A9A64", "BGD": "#C94A4A" } },
   ```
   ```json
   {"type":"label","text":"KASHMIR","at":[75.6,34.6],"size":"md","atWord":"Kashmir.","hold":1.6},
   {"type":"date","date":"1947-10-26","atWord":"joins"},
   {"type":"declare","id":"KASHMIR","atWord":"joins","noLabel":true},
   {"type":"label","text":"DISPUTED","at":[75.6,34.6],"size":"xl","atWord":"rejects","hold":2.6}
   ```
   Set the beat-level `"date": "1947-10"`, so the month alone shows while "fighting breaks out" is spoken (22 Oct), and
   26 Oct appears on "joins". Remove the old `region` DISPUTED. Pink is correct until the accession, because Kashmir
   had not acceded in Aug–Oct 1947. On stills, check that the declare shows no flag or tag (it has no `flag`) and that
   the grey is never read as either country's colour. The new cues also fill the 4.2 s gap.
3. **[P2] loop · 48.0–51.2 s · the last frame does not match frame 0, and Kashmir is listed among "three countries".**
   Return the pieces to the start colour just before the cut, so the ribbons sit on the pink slab, as in frame 0
   (`recolor` goes back to `PALETTE.start`):
   ```json
   {"type":"recolor","ids":["IND","PAK_W","BGD","KASHMIR"],"atWord":"down"}
   ```
   In `scripts/prep-partition.mjs`, rename KASHMIR to `"name": "Kashmir (disputed)"`, which is what `allLabels` shows.
   Then check that the allLabels tags fade on "down", and re-run `virality_metrics.py` (target loop SSIM ≥ 0.9).
4. **[P2] hook · 0–0.76 s · frame 0 has no number yet, and the Bengal ribbon is cut by the right edge, inside the
   platform box.** Make the stake big and show it from the first word. Add a wider pad to bring Bangladesh in:
   ```json
   "camera": {"fit":"FOCUS","pad":0.14},
   {"type":"label","text":"10–20 million","at":[78.5,16.5],"size":"xl","atTime":0.05,"hold":2.6},
   {"type":"label","text":"uprooted · estimates vary","at":[78.5,14.2],"size":"md","atWord":"uprooted","hold":2.0}
   ```
5. **[P2] exodus · beat date "SEP 1947" is not in SOURCES.md.** Either set `"date": "1947-08-17"` (keep the published
   date), or add a sourced row for the Aug–Nov 1947 migration and use `"1947-09"`.
6. **[P2] leave · 9.99 / 12.32 s · "India," and "Pakistan." only pulse a thin edge, so the viewer still sees one pink
   mass and cannot tell which part is which until 19 s.** Add labels on the words:
   ```json
   {"type":"label","text":"INDIA","at":[78.5,21.5],"size":"md","atWord":"India,","hold":1.8},
   {"type":"label","text":"PAKISTAN","at":[69.5,28.5],"size":"md","atWord":"Pakistan.","hold":1.6},
   {"type":"label","text":"+ EAST","at":[90.3,23.8],"size":"md","atWord":"Pakistan.","hold":1.6}
   ```
   Also remove the floating `sticker` (UK flag in the Arabian Sea, at 7.81 s). It is a widget, which STUDIO.md rule 5
   rules out, and it adds nothing to the caption "BRITAIN".
7. **[P2] radcliffe · 14.2–18.4 s · the callout sub-line "British lawyer · ~5 weeks · first time in India" is about
   21 px high (below 28 px).** Shorten it and let the caption carry the rest:
   `"sub": "British lawyer · ~5 weeks"`.
8. **[P2] published · 26.94–29.65 s and split · nothing new for 2.7 s after the line is drawn.** Add a date tag pinned
   to the ribbon on "public":
   `{"type":"label","text":"published 17 Aug","at":[74.0,30.6],"size":"md","atWord":"public","hold":1.8}`.
9. **[P2] wings / indep · 19.0–26.7 s · the whisper still reads "The plan" during independence; in bangla it reads
   "1971", which repeats the date block.** Add chapters:
   `{"type":"chapter","emoji":"flag","text":"Two wings"}` (wings),
   `{"type":"chapter","emoji":"flag","text":"Independence"}` (indep), and in bangla `"text": "The east breaks away"`.
10. **[P3] empire · 4.33 s · the `pulse` on IND/PAK_W/PAK_E/KASHMIR draws today's internal borders in white over
    "British India" in 1947 (anachronistic, and it gives the ending away).** Remove that pulse; the xl label is enough.
    If a pulse is wanted, use one on the whole outline (`FOCUS_OUTLINE`) instead, if Map3D supports it.
11. **[P3] bangla · 47.0 s · the swap lands on "Bangladesh." (good), but the `conceal` on "breaks" (46.10) shows no
    visible change.** Move it to the same word as the reveal, or tint the piece earlier on "breaks", so the break shows:
    `{"type":"conceal","ids":["PAK_E"],"atWord":"Bangladesh."}`.
    The "today's flag" sub-tag is about 17 px; make it 28 px or larger in `Labels.tsx` (`sub` size).
12. **[P3] bangla / loop · the timeline shows a stray small marker at 1947 while the bar runs to 1971.** Check
    `Header.tsx`; the marker should follow the date.
13. **[P3] BGD red #C94A4A is close to the start pink in the loop, and the yellow ribbon hides it.** Use a clearer
    hue, e.g. `"BGD": "#D2553F"`, or rely on fix 3.

## Neutrality / accuracy checklist
- Kashmir: never coloured for either side ✓ · DISPUTED shown ✗ (1 s, weak; fix 2) · the script only sequences
  documented events ✓ · named as "Kashmir" in the loop next to "three countries" ✗ (fix 3).
- Displacement and deaths are spoken and shown as ranges with "estimates vary" ✓ (the death figure is unreadable:
  fix 1).
- Dates on screen: 3 Jun, 8 Jul, Aug, 14/15 Aug, 17 Aug, 26 Oct, 16 Dec 1971 ✓. "SEP" has no source ✗ (fix 5).
- "~1,000 mi" ✓ (SOURCES gives 943 mi computed and ≈1,000 mi usual). Flags: pk shown Aug 1947 ✓, in on 15 Aug ✓,
  bd tagged "today's flag" ✓.
- "BRITISH INDIA" label over the whole subcontinent, princely states included: a simplification already logged in
  SOURCES ✓.

## Virality review

Video: `out/partition-1947.mp4` (51.8 s, re-rendered after the reel review's P1s and most P2s).
Evidence: `python3 pipeline/virality_metrics.py partition-1947` (run for this pass); the 6 hook frames (0–3 s);
`loop_first_vs_last.jpg`; 12 beat sheets and `cues.md`, regenerated for this pass because the old sheets were older
than the last `episode.json` edit; `episode.json`; `SOURCES.md`; and the reel review above.

> This is a pattern-based estimate against `docs/VIRALITY_PLAYBOOK.md`, not a prediction. The size of the account
> and how the first test cohort reacts matter more than anything scored here.

### Key metrics
| Metric | Value | Read |
|---|---|---|
| Duration / words / pace | 51.8 s · 135 words · **2.81 w/s** | inside the 2.5–3.2 band |
| First word | 0.25 s | no throat-clearing |
| Hook line | "One line uprooted 10 to 20 million people." (2.53 s) | number + stake in sentence 1 |
| Visual cues | 37 · **7.1 per 10 s** | good for a single-map reel |
| Longest gaps without a new cue | 3.52 s @ 6.47 (leave: the camera travels, so it is covered) · 3.27 s @ 33.55 (exodus: the death-toll label holds) · 2.81 s @ 0.25 (hook) | 2 of 26 two-second windows are empty |
| Loop SSIM, first vs last frame | **0.873** | full marks (≥ 0.85) |
| Loudness | −14.3 LUFS | on target |

The fixes checked on the new sheets: the Kashmir label shows on "Kashmir.", 26 OCT appears on "joins", the piece turns
neutral grey with an xl DISPUTED, and the loop label reads "Kashmir (disputed)". The death toll is now readable, with
REFUGEES moved off it. INDIA/PAKISTAN labels appear in the leave beat, the exodus date is "1947", the UK sticker is
gone, and the last frame returns to pink.

Still open from the reel review:
- fix 8: no tag on the published line;
- fix 9: no Two wings/Independence chapters, and the whisper says "1971" under a 1971 date block;
- fix 10: the empire pulse still draws today's internal borders;
- fix 11: the "today's flag" sub-tag is still tiny.

**Frame 0 still has no number.** The xl "10–20 million" fires at `atTime: 0.15`, so it first shows on the 0.5 s frame.
On the 0.0 s frame the Bengal ribbon is also cut by the right edge.

### Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | **21/25** | Frame 0 (5/8): a 3D crane on the pink British India slab with "HOW ONE LINE SPLIT BRITISH INDIA". It works paused, but it has no number yet, the Bengal ribbon runs off the right edge, and the two ribbons read as yellow blobs more than as "a line". Payload (7/7): "One line uprooted 10 to 20 million people": a number, a stake and a defined shape. Place (5/5): the title names British India and the outline is iconic. Text (2/3): from 0.5 s there are four text blocks at once (title, whisper, xl number, caption), and the hook number has lost its "estimates vary". No throat-clearing (2/2). |
| B. Retention | **20/25** | New visual (7/8): 7.1 cues per 10 s, and a camera move or cut every beat. The 3.3 s hold on the death-toll label is the only real plateau. Escalation (4/6): the stakes rise (5 weeks → 1,000 mi apart → line published after independence → exodus → Kashmir → 1971), but the connectives are a list ("Then Kashmir… And in 1971…"). Only one "but" is implied, never spoken. Re-hook (3/4): the cut at 26.75 s (52 %) lands on the best twist in the reel, but the line "made public two days later" undersells it, because the viewer has to work out that this is *after independence*. Payoff (3/4): the human toll comes at 31–36 s, which is right. But the hook's "10–20 million" is never shown again where the crowds cross the line. Pace and captions (3/3). |
| C. Rewatch & loop | **10/10** | "And it all came down to…" → "One line uprooted…" is a clean verbal loop (5/5). SSIM 0.87 now that the recolor returns to pink (3/3). The final labelled map, with Kashmir (disputed), is worth a pause (2/2). |
| D. Shareability & saves | **12/15** | Send fact (5/6): "a lawyer who had never been to India got about five weeks" plus "the border was published after independence" are classic "I didn't know that" sends. The second one is only implied. Save (3/4): a clean reference map of 1947 → 1971 with EP 12, but no part-2 or series hook. Comment (2/3): nothing in the video. The pinned question is good and honest. Kashmir will draw comments on its own, so the pinned comment has to steer them toward family stories. Human stake (2/2): 10–20 M uprooted, crowds crossing both ways, and the death toll. |
| E. Packaging | **9/10** | Cover (3/4): the 1.0 s frame (title + xl "10–20 million" + map) is a strong thumbnail, but frame 0 itself is not. Caption (3/3): none exists; the best version is written below. Series (3/3): REDRAWN · EP 12 badge, title style and timeline are consistent. |
| F. Niche codes & trust | **12/15** | Transformation (4/4): pink → green/orange, then the green east swaps to Bangladesh. Scale anchor (2/3): "nearly a thousand miles" in miles is good, but there is no US/UK reference point. Face/stakes (2/3): Radcliffe is a text card only, and the crowds are symbolic. Sourcing and hedges (3/3): both figures are ranges with "estimates vary" on the death toll, Kashmir is grey and DISPUTED, the flag is tagged "today's flag", no cause is claimed, and every date matches SOURCES.md. Anti-patterns (0/2): the empire pulse draws today's India/Pakistan/Kashmir borders over "British India" (an anachronism that also gives away the ending), "today's flag" is a ~17 px tag, and the hook has four text blocks. |
| **TOTAL** | **84/100 · 8.4/10** | **Tier: can break out** (one point short of "strong breakout odds") |

### Top 5 changes, ranked by expected gain
All facts stay as in SOURCES.md. Nothing here bends neutrality. Changes 1, 3 and 4 do not touch the voice. Changes 2
and 5b change the script, so the voice is re-recorded.

**1. Put the number on frame 0 and bring Bengal into frame (+3: A frame 0 +2, E cover +1; F trust kept).**
On Shorts the "viewed vs swiped" decision is made here. Fire the label at t = 0 and restore the hedge under it as a
small second line. Widen the opening framing so the Bengal ribbon is inside the frame while the camera cranes:
```json
"camera": {"fit": "FOCUS", "pad": 0.22},
{"type": "label", "text": "10–20 million", "at": [79.5, 21.0], "size": "xl", "atTime": 0, "hold": 2.6},
{"type": "label", "text": "uprooted · estimates vary", "at": [79.5, 18.6], "size": "md", "atTime": 0, "hold": 2.6}
```
Check the still at t = 0. If the label's entry animation leaves it invisible on frame 0, its entry in
`src/components/Labels.tsx` needs to start fully drawn when `a.t === 0`. Drop the whisper from the hook if the four
blocks still crowd it ("and moved millions of people" repeats the number).

**2. Speak the twist at the cut (+2: B re-hook +1, D send +1).**
Today: "The line itself is made public two days later." (2.3 s). Rewrite, with the same fact (17 Aug = two days after
15 Aug; SOURCES: "two days after independence"):
> **"But the line itself is only made public two days after independence."**

That is about +0.8 s of voice. Pin the fact to the ribbon (reel review fix 8, still open). This also fills the
2.7 s with nothing new after the ribbon draws:
```json
{"type": "label", "text": "published 17 Aug · after independence", "at": [74.0, 30.6], "size": "md", "atWord": "public", "hold": 2.0}
```

**3. Pay off the hook number on the line itself (+2: B payoff +1, B new visual +1).**
The hook promises "10–20 million". Show it again where the crowds cross, then let the death toll replace it. The death
toll now appears on "dead", which also splits its long hold:
```json
{"type": "label", "text": "10–20 million uprooted", "at": [74.0, 28.6], "size": "md", "atWord": "Millions", "hold": 2.0},
{"type": "label", "text": "200,000–2 million dead · estimates vary", "at": [74.0, 28.6], "size": "md", "atWord": "dead", "hold": 2.6}
```
Remove the old death-toll label that fires on "Estimates". The two labels never overlap, because the first one has
faded before "dead" (≈ 34.0 s).

**4. Remove the anachronism and give each beat its own chapter (+2: F anti-patterns +1, B escalation +1).**
- empire: delete `{"type":"pulse","ids":["IND","PAK_W","PAK_E","KASHMIR"],"atWord":"home"}`. Today's internal borders
  must not appear on "British India" in 1947.
- wings: `{"type":"chapter","emoji":"flag","text":"Two wings"}` · indep: `{"type":"chapter","emoji":"flag","text":"Independence"}`
  · bangla: change `"text": "1971"` to `"text": "The east breaks away"`. That gives a new quiet line on each beat, and
  the whisper no longer repeats the date block.
- In `Labels.tsx`, set the `sub` size to at least 28 px (today `size * 0.55` ≈ 17–22 px) so "today's flag" can be read.

**5. A familiar anchor and a face (+1 to +2: F scale +1, F face +1 if an image clears).**
- a) Scale: the wings path label can carry a US/UK reference.
  `"label": "~1,000 mi · farther than London–Rome"`. London–Rome is about 890 mi great-circle, and our two wings are
  943 mi apart on the map. **Add a SOURCES.md row first** (computed great-circle, labelled as our calculation). If that
  is not done, keep "~1,000 mi".
- b) Face: a `portrait` of Cyril Radcliffe on "Cyril", in place of the text-only callout, **only if** a public-domain
  or CC BY photo is found (`python3 scripts/loc_search.py "Cyril Radcliffe"`, then Commons through
  `fetch_queue.sh`). No AI likeness of a real person. If nothing clears, keep the callout as it is.

Expected after 1–4: about **91/100**, which would put it in "strong breakout odds".

### 3 alternative hooks (all factually true, all in SOURCES.md)
| Archetype | Verbal line (first sentence) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **Contradiction** | "Two countries went independent before anyone was told where the border was." | Pink slab with both ribbons drawn dashed, date block "14–15 AUG 1947" | "BORDER PUBLISHED: 17 AUG" |
| **Human stake / person** | "A lawyer who had never been to India got about five weeks to split it." | Radcliffe callout card (or a PD portrait) over the slab, Punjab ribbon half-drawn | "~5 WEEKS. FIRST TIME IN INDIA." |
| **Comparison / in-media-res** | "One empire. One line. Three countries, and millions on the move." | The final labelled map (India · Pakistan · Bangladesh · Kashmir (disputed)) collapsing back to pink | "1 EMPIRE → 3 COUNTRIES" |

The comparison hook makes the loop even tighter, because the last frame *is* the first frame. Keep "Kashmir
(disputed)" on that frame.

### Cover frame
Use **t = 1.0 s**: the title "HOW ONE LINE SPLIT BRITISH INDIA", the xl "10–20 million" in the middle of the slab, and
both ribbons. It reads at thumbnail size, and the title stays inside the Reels 3:4 grid crop. After change 1, frame 0
works as the cover too. Do not use a Kashmir frame as the cover, because a grey "DISPUTED" thumbnail invites a flame
war before the viewer has watched.

### Caption, hashtags, pinned comment
**Caption** (hook line, 111 characters):
> A lawyer who had never been to India got about 5 weeks to draw this line. 10–20 million people were uprooted.
>
> Partition of India 1947 · Radcliffe Line · India, Pakistan and Bangladesh (1971) · Punjab and Bengal · Kashmir dispute
> REDRAWN EP 12 · history explained on one map · figures are estimates, sources in the pinned comment

**Hashtags (5):** `#Partition1947` `#history` `#maps` `#SouthAsia` `#REDRAWN`

**Pinned comment:** keep the SOURCES.md text (sources, both ranges, Kashmir's status, Natural Earth). End it with the
question:
> **Did your family's story cross this line? Tell us where from, and where to.**

It is honest, it is personal and not partisan, and it steers the diaspora, the biggest likely sharing audience, toward
stories instead of a Kashmir argument. Moderate early and hide slurs. Do not reply on the merits of the Kashmir dispute.

### Platform notes
- **TikTok:** 51.8 s is right for completion. Do not pad it to 61 s for Creator Rewards; a longer cut would need new
  sourced content, such as the Boundary Commission or the 1947–48 Kashmir war, not a slower edit. Put the hook line in
  the caption's first line, because TikTok search reads it. The automatic loop rewards the "came down to…" ending.
- **Instagram Reels:** sends drive reach, and this topic is sent inside families. Make the cover t = 1.0 s and check
  the 3:4 grid crop. Turn off "show captions" if the burned-in captions double up. Hashtags matter little here; the
  caption keywords do the work.
- **YouTube Shorts:** frame 0 decides "viewed vs swiped", so change 1 matters most here. The title in the upload field:
  "How one line split British India (Partition 1947)". YouTube may add a context panel on Partition; that is fine.
- **Sensitive-map risk (all platforms):** the map shows Kashmir as disputed, which is the internationally neutral
  representation required by CLAUDE.md. Maps that differ from India's official boundary have drawn takedown or
  geo-restriction requests in India before. The owner should know that reach in India may be limited. Do not change
  the map to chase that reach.

**VIRALITY SCORE: 84/100 (8.4/10) — can break out**
