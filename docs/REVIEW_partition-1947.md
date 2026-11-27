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
