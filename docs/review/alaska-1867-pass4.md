# Review: alaska-1867, pass 4

Video `out/alaska-1867.mp4`, 53.96 s (voice ends about 53.6 s). I read all 13 current beat sheets and cues.md, plus extra frames in
`/tmp/claude-0/review-tmp/` (0, 0.1, 2.4–4.4, 35.2–38.3, 44.6, 45.5, 50.4–53.9 s; sheets `p4_sheet0..2.jpg`).

Tool note: these files in `out/review/alaska-1867/` are **stale** (22:42, from the earlier 52.6 s render): `hook_*.jpg`, `loop_first_vs_last.jpg`,
`virality_metrics.json` and `beat_11_loop.jpg`. review_frames.py did not overwrite or delete them, so ignore them. My checks used fresh ffmpeg frames.

## Verdict: 8.5/10. Postable: **no, not yet**. There is one P1, and the fix is one line of JSON (no re-TTS needed). After it, postable: yes.
All the pass-3 fixes landed with no regressions:
- Flag swap: the Russian flag comes down on "comes down" (36.0 s) and the US flag rises on "American flag" (36.6–37.4 s).
- The US flag now fits (right edge about 1040 px).
- The hook ghost and pointer clear out before "In 1867".
- The "2 reasons" callout works, and the Nome pick is in place.

The new chronological ending (gold, then 1959 with Texas, then oil 1968, then the loop) reads clearly. The timeline dot moves 1880 → 1899 → 1959 → 1968,
and every date badge matches the voice. The loop seam works: the last frame is red Alaska plus the money bag, then frame 0 shows the same red Alaska and "$7,200,000".

**3 biggest problems**
1. The oil discovery date is shown as a flat "1968", but SOURCES.md itself logs it as **dates vary** (Dec 1967 / Mar 1968). This breaks a CLAUDE.md non-negotiable.
2. The oil beat's labels (callout, Prudhoe marker, pipeline) leak into the loop beat's "All…" pulse, so the seam starts cluttered.
3. State beat 44.03–46.09 s: 2.06 s with nothing new on screen (just a plain blue map under "In 1959, Alaska"). The gold markers fade out over the first half second.

## Items

1. **[P1] oil · 49.60 s: the "1968" discovery date is untagged, but SOURCES.md says the dates vary.**
   SOURCES.md line 31 says "12 Mar 1968; some accounts say Dec 1967 — **dates vary**". CLAUDE.md requires an on-screen tag or neutral wording.
   The cheapest fix is to tag the callout sub. The marker and date badge can stay "1968" (the year of the confirmed, announced discovery):
   ```json
   {"type":"callout","text":"Largest oil field","sub":"North America · found 1967–68 · DATES VARY","y":1060,"size":64,"hold":1.9,"atWord":"largest"}
   ```
   Alternative: if the producer decides "found 1968" means the *confirmed* discovery (gas show Dec 1967, oil confirmed and announced Mar 1968),
   change SOURCES.md to say so explicitly and drop "dates vary". Then no on-screen change is needed. Either way, SOURCES.md and the screen must agree.

2. **[P2] oil · 50.36 s: "largest oil field in North America" could be challenged by Mexico's Cantarell field.**
   Cantarell is a Mexican supergiant field. Some estimates put its original oil in place (about 35 bn bbl) above Prudhoe's (about 25 bn bbl).
   The cited ADEC fact sheet is a fair source, but Mexican commenters may object. Either:
   (a) qualify it on screen, as part of the P1 fix: `"sub":"in the U.S. & Canada · found 1967–68 · DATES VARY"`. This keeps the voice but narrows the claim on screen; or
   (b) change the voice to `"say":"Then oil: the largest oil field in the United States."` (re-TTS of this beat only). Log the Cantarell check in SOURCES.md.
   Option (b) is the safest.

3. **[P2] oil → loop · 52.30–52.6 s: the oil labels leak into the loop.**
   At "All" (52.4 s), the callout, the "Prudhoe Bay · 1968" marker and the pipeline label are still fading out while Alaska pulses white.
   Shorten the holds so everything is gone by 52.3 s:
   ```json
   {"type":"marker","text":"Prudhoe Bay · 1968","at":[-148.34,70.26],"hold":2.2,"atWord":"oil:"}
   {"type":"path", "...": "unchanged", "hold":1.6,"atWord":"largest"}
   {"type":"callout","...": "as item 1", "hold":1.6,"atWord":"largest"}
   ```
   (Each fade-out takes about 0.3 s, so these holds end by about 52.2–52.3 s.)

4. **[P2] state · 44.03–46.09 s: about 2 s with nothing new on screen.** Add a pulse on the word "Alaska" (45.19 s) so the subject is re-marked under the new date:
   ```json
   {"type":"pulse","ids":["ALASKA"],"atWord":"Alaska"}
   ```
   Optionally, fire the star sticker on "becomes" (45.61) instead of "49th".

5. **[P2] hook · 2.6–2.8 s: the "THIS IS ALASKA" pointer label is cut at the right edge while it springs in** (frame 2.7 s: the "A" touches x 1080).
   Pull the label's start point left:
   ```json
   {"type":"pointer","at":[-150,65],"text":"THIS IS ALASKA","from":[190,-230],"hold":1.05,"atWord":"That's"}
   ```

6. **[P2] oil · 50.4–52 s: the pipeline label sits on top of its own line,** and the line crosses "Prudhoe Bay · 1968".
   Move the label off the line: `"labelAt":[-142,66.5]`. If the Prudhoe marker supports a label side, put it on the left: `"side":"left"`.

7. **[P2] transfer · 35–38.6 s: the flag caption "Sitka, Oct 18, 1867 · flags stylised" wraps onto 2 lines,** and the second line ("stylised") is orphaned.
   Shorten it: `"caption":"Sitka, Oct 18, 1867 · stylised"`.

## Checked and fine
- **Accuracy:** $7.2M; ≈1.9¢ and 375M acres; Crimean War 1853–1856; March 30 and April 9, 1867; 37–2; Oct 18; Juneau 1880 / Nome 1899; Jan 3, 1959; "more than twice Texas" (ratio 2.21). All of these match SOURCES.md.
- **Flags:** the 37-star US flag is correct for Oct 1867, and the Russian flag is shown as an abstract "RUSSIA" block (labelled "stylised"). No anachronisms seen.
- **Layout:** nothing sits in the captions band or the timeline band. The portraits and the archive card clear each other.
- **Native peoples beat:** the "Approximate traditional areas" tag is present, and all six labels are legible.
