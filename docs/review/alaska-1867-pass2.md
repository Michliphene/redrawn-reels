# Review — alaska-1867 · pass 2

Video `out/alaska-1867.mp4` (54.9 s; cues.md still prints 54.32 s, which is the end of the voice). I read all 12 sheets and cues.md, plus extra frames at 0.0 / 1.5 / 4.5 / 13.0 / 18.3 / 24.9 / 36.0 / 41.6 / 46.9 / 49.0 / 54.3 s and the last frame.

## Verdict: **8.5/10, postable after the P2s below (no P1 left).**
Pass-1 fixes all landed. The hook now locates and names Alaska ("THIS IS ALASKA" pointer). Every beat has something new at least every 2 s. The flag swap reads well. The Senate card is on the number. The 1968→1959 regression is gone. Texas no longer covers the loop. The loop recolour to red works.
Frame 0 vs last frame: **close but not clean.** Both show the title, red Alaska and the globe. The last frame also has a leftover "49TH STATE" chip under the title and a money-bag sticker (see 1 and 2).

## Remaining items
1. **[P2] loop · 52.84–54.9 s: "49TH STATE" chip never ends.** Chapters.tsx keeps the last chip on screen indefinitely. It floats alone once the date badge fades, then overlaps "BECAME AMERICAN" when the title returns on the last frame.
   Fix it in the JSON and a one-line component change, mirroring `hideLocator`:
   loop beat `"hideChapter": true`; Episode.tsx: `{t > hookEnd && !spec.beats[beatIdx]?.hideChapter && <Chapters …/>}`.
2. **[P2] hook + last frame: the locator globe sits on the title.** The globe (top 54, right 40, 190 px) covers the "A" of "ALASKA", and "YOU ARE HERE" runs into the title (0.0, 1.5 s and last frame).
   The pointer now does the "where" job in the hook. Fix: add `"hideLocator": true` to the **hook** and **loop** beats. Frame 0 and the last frame still match, now both without the globe. (Alternative: keep the globe but shrink the title's max-width to about 780 px in Brand.tsx for those beats.)
   For an exact loop match, also end the loop money-bag sticker before the cut: `"hold": 0.9` (so it is gone by 54.8 s; it appears at 0.66 s in the hook, not on frame 0).
3. **[P2] transfer→natives · 40.8–41.8 s: the US flag lingers** over the camera move and the first Native labels ("Iñupiat"/"Athabascan" sit under the flag at 41.6 s).
   Fire the swap earlier so it rides the words: the flag comes down 36.8–38.4 (spoken "comes down" at 38.4), goes up 38.5–40.2 ("goes up" at 40.05–40.28), and is gone by 40.8.
   `{"type":"flagSwap", …, "atWord":"Sitka", "hold":3.5}` (the pointer and declare stay as they are).
4. **[P2] gold · 46.64 s: the oil-drum sticker covers "Prudhoe"** (it reads "Pru▮oe Bay"). Move it left of the label start:
   `{"type":"sticker","emoji":"oil_drum","at":[-148.34,70.26],"dx":-260,"dy":-10,"size":120,"atWord":"oil","hold":1.8}`.
5. **[P2] natives chip: the emoji is unreadable.** `busts_in_silhouette` (dark grey) on the dark chip renders as two black blobs (41.6 s). Use `"emoji":"globe"` (animated, light), or another light key.
6. **[P2] chips touch the date badge.** The chip top (y 300) clips the bottom of the year digits in every beat with a day+month date ("MARCH 30 / 1867 / THE DEAL", "WHY SELL?"). Chapters.tsx `top: 300` → `top: 322`. That still clears the globe, the portraits (y 360, sides only) and the map subjects.
7. **[P2, minor] senate→transfer · 35.6–36.2 s.** The "37 – 2" card is still fading over the US map while the voice says "October 18" (36.0 s). Set the callout to `"hold": 0.9`.

Checked and OK: the hook pointer lingering into beat 01 (it reinforces "this"), the British troops and Union Jack fading at 18.2 s (gone by 18.4), the pipeline (gone by 49 s), and Texas fading under "All of it" (gone before "bought"). Sync of all stickers is within ±0.2 s of their words.
