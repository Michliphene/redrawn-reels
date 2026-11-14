# Review — alaska-1867 · pass 3

Video `out/alaska-1867.mp4`, 52.6 s (voice ends 52.07 s). I read all 12 beat sheets, the 6 hook frames, loop_first_vs_last and cues.md.
Extra frames are in `/tmp/claude-0/review-tmp/` (0–0.3, 3.9, 4.6, 23–29, 34.6–36.6, 43.9, 45.0, 45.6 s).

Tool note: `hook_0_0.0s.jpg` shows **no number**, but the real frame 0 (ffmpeg `-ss 0`) does show `$7,056,000`, rolling to $7.2M by about 0.3 s.
So the "number on frame 0" fix works. review_frames.py grabs a frame that is not frame 0 (probably a seek/keyframe offset).

## Verdict: **8/10. Not postable yet: one P1 (the flag swap broke with the new timings).**
The virality fixes work. The rolling $ number on frame 0 is a strong hook, and the hook captions skip "$7.2 million" as intended. EP 2 tag present.
The myth beat reads well: the Seward reprise, then "Seward's Folly", then the LATER MYTH stamp on "myth". The gold/oil beat is fast and clear.
All pass-2 P2s landed: chip hidden in the loop, no globe in the hook, chip offset, natives emoji, oil drum off "Prudhoe".

**3 biggest problems**
1. Transfer: the flags now run about 0.9 s ahead of the words. The US flag is already rising on "comes down", and it is cut off at the right edge.
2. Hook: "THIS IS ALASKA" now points straight into the Texas ghost. For 0.6 s the arrow reads as pointing at Texas.
3. State beat opens with "oil 1968" and "Pipeline 1977" still fully visible under a **1959** date badge. The oil drum covers "Pipeline".

## Items
1. **[P1] transfer · 34.07–37.5 s: the flag swap runs early.** The swap fires on "Sitka" (34.07). FlagSwap lowers the old flag over t..t+1.6 and raises the new one over t+1.7..t+3.4.
   So the Russian flag is gone by 35.7 s, but the voice says "comes down" at 35.85–36.6. The US flag rises 35.8–37.5 s, but the voice says "American flag goes up" at 36.95–38.07.
   Fix: fire on the first "the" (34.95 s). The flag then comes down 34.95–36.55 and goes up 36.65–38.35, which is on the words. The Sitka pointer stays on "Sitka".
   `{"type":"flagSwap","from":"ru-stylised","to":"us-37","x":700,"h":170,"hold":3.4,"atWord":"the","caption":"Sitka, Oct 18, 1867 · flags stylised"}`
   (With hold 3.4 the flag fades out 38.35–38.85, before the first Native labels at 39.11.)
2. **[P1] transfer · 36.5–38 s: the US flag is clipped at the right edge.** At x 760 the flag starts at x 770, h 210. The 37-star flag is about 400 px wide, so it ends near 1170 px, roughly 90 px off screen (frame 36.6 s).
   The JSON in item 1 also moves the pole to `x:700`. It needs a one-line change in FlagSwap.tsx: `const top = 380, bottom = 1240, h = f.h ?? 210;` (plus `h?: number` in the flagSwap type).
   With h 170 the flag is about 323 px wide and ends at about 1033 px. The pole at 700 stays right of Sitka (about 645 px).
3. **[P2] hook · 3.61–4.6 s: the pointer lands on Texas.** The Texas ghost covers almost all of mainland Alaska, so the pointer cannot be moved off it.
   Fix: end the pointer as Texas arrives. `{"type":"pointer","at":[-150,65],"text":"THIS IS ALASKA","from":[230,-230],"hold":1.05,"atWord":"That's"}`.
   This also stops the pointer, and the Texas ghost, from leaking into "In 1867" (still visible at 4.6 s). Also set the ghost to `"hold":0.7`.
4. **[P2] gold→state · 44.66–46.6 s: anachronism plus overlap.** The date badge switches to 1959 at 45.38, but the "Prudhoe Bay · oil 1968" marker lasts to 46.46 s, and the 1977 pipeline label is also still up.
   The oil-drum sticker (dx 40, dy 150) also sits on "Pipel▮▮ 1977" (45.0, 45.4 s). Make all three end before 45.4, and put the drum above the Prudhoe label (Arctic Ocean, clear of the chip):
   `{"type":"marker","text":"Prudhoe Bay · oil 1968","at":[-148.34,70.26],"hold":0.7,"atWord":"oil"}`
   `{"type":"path",…,"dur":0.5,"hold":0.2,"atWord":"oil"}`
   `{"type":"sticker","emoji":"oil_drum","at":[-148.34,70.26],"dx":0,"dy":-130,"size":120,"hold":0.7,"atWord":"oil"}`
   If the oil now feels too rushed, a 0.3 s pause after "oil." in the voice is the alternative to shortening.
5. **[P2] gold · 43.6–44.9 s: the Nome pickaxe covers the "e" of "Nome · 1899".** Lower it:
   `{"type":"sticker","emoji":"pick","at":[-165.41,64.5],"dx":-40,"dy":170,"size":120,"hold":1.2,"atWord":"rushes"}`.
6. **[P2] sign→acre→folly · 23.3–25.2 s: "Washington" floats over the Yukon.** The marker has hold 4 from 20.76. When the camera flies to Alaska, the label stays and sits under the Stoeckl portrait (24.2 s), then alone over Canada (25.0 s). It is a misplaced place name.
   Fix: `{"type":"marker","text":"Washington","at":[-77.04,38.9],"hold":2.2,"atWord":"Seward"}` (gone before the 23.27 camera move).
7. **[P2] why→sign · 19.7–20.6 s: the "British North America" label shows above the treaty archive card** (sign mid-sheet). Set the region to `"hold":2.4`.
8. **[P2] folly · 28.73–29.1 s: the laughing sticker sits on the "Folly?" pointer's arrowhead** (frame 29.0). Also, the pointer lasts until 30.5 s, into the Senate camera move.
   Fix: laugh sticker `"hold":1.0`; pointer `"hold":1.4`.
9. **[P2] folly · 24.70–25.89 s: the "THE PRICE" chip stays up** while the voice says "Ever heard it called Seward's…". Drop `"atWord":"Folly?"` from the folly `chapter` so it switches at the start of the beat (24.70).
10. **[P2] SOURCES.md is out of date.** Script lines 4, 6 and 10 still have the old text ("Secretary of State William Seward… Eduard de Stoeckl", "Some critics mock… the famous label", "Then come the gold rushes").
   Paste in the text now spoken (see episode.json `say`), so the pinned comment and audit trail match the video. The facts table is still correct: every number on screen matches it.
11. **[P2, optional] why · 11.87–14.29 s:** 2.4 s with only the chip and a fading path (the longest gap flagged in virality_metrics).
   Add `{"type":"callout","text":"2 reasons","y":1040,"hold":1.2,"atWord":"two"}` (word "two" ≈ 12.9 s; the card ends before "Crimean War" at 14.29).

## Checked and OK
- Accuracy: $7.2M, ≈4,300 mi, Crimean War 1853–1856, March 30, ≈1.9¢ / 375M acres, 37–2 on April 9, Oct 18, 1867, Juneau 1880, Nome 1899, 1968 and 1977 (captioned "simplified"), Jan 3 1959, "more than twice" Texas.
  All match SOURCES.md. The flags are captioned "stylised". The Folly sub-line matches the Hill 2019 entry.
- Sync: the bigNumber starts at frame 0. The money bag lands on "million." Stickers land on "fur-trading", "money", "Crimean", "Britain", "signs", "cents", "mock" and "Gold". The 37–2 card lands on "thirty-seven", the 49th card on "49th", Texas on "twice" and the recolour on "bought". All within ±0.2 s.
- The Seward portrait reprise (25.5–27.3 s) does not collide with the callout or the newspaper sticker.
- The natives beat is clean: the flag is gone by 38.4 s, the labels start at 39.1 s, and the "Approximate traditional areas" card sits clear of the captions.
- Loop: the last frame (red Alaska, title, "BOUGHT FOR…", no chip, no globe, no money bag) leads into frame 0 ("$7,0…" rolling). The loop works; SSIM is 0.86 only because of the number and the full timeline.
