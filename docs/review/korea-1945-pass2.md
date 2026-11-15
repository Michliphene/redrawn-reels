# Review: korea-1945, pass 2

Video `out/korea-1945.mp4`: 57.23 s (voice ends at 56.71 s). I read all 13 beat sheets, `cues.md`, `episode.json`, the word timings and `SOURCES.md`.
Extra frames are in `/tmp/claude-0/review-tmp/k2_*.jpg`:
- `k2_seam.jpg`: frame 0, the last frame, 56.2 s and 56.68 s.
- `k2_hook.jpg`: 0.5, 1.5, 3.0 and 4.9 s.
- `k2_A.jpg`: 4.9, 28.8, 30.6 and 31.6 s.
- `k2_B.jpg`: 34.6, 49.8 and 50.9 s.

Timing rules (from the code): an overlay is visible until `t + hold + 0.4`, and a path until `t + hold + 0.5`. A callout's stamp only shows while the callout itself is still visible.

## Verdict: 8/10. Postable: **yes**. The P2 fixes below are strongly recommended before posting.

Both pass-1 P1s are fixed:
- Frame 0 has the gold 38°N line and the title.
- The last frame shows the brown 1945 map with the gold line, as frame 0 does.

The other pass-1 fixes also work:
- At 49.8 s the white 1953 line and the gold 38°N line are on screen together with the Sokcho pointer.
- The 1948 badge changes on the word "1948".
- The region labels appear, and the pointers hold long enough.

Accuracy: every on-screen date and figure matches SOURCES.md (1910–1945, Aug 1945, 1948, 25 Jun 1950, 27 Jul 1953, ≈2.5 mi / ≈155 mi). Kaesong and Sokcho match the latitudes given in SOURCES.

Biggest remaining problems:
1. **The "HARDENS" stamp never appears.** Its callout fades out at 30.94 s, but the stamp is due on "hardens" at 31.31 s.
2. **The hook images do not match its words.** The map sticker is gone before "National Geographic map" is spoken, nothing shows "Two Americans", and the gold line fades out at 4.75 s, before "map." (4.93 s).
3. **The loop seam still jumps.** Frame 0 has an 18% punch-in (`Episode.tsx`, scale 1.18 settling to 1 over 0.7 s), but the end frame is at span 9. The replay therefore pops in size, and the timeline also jumps from 1953 to 1900.

## Issues

1. **[P2] states · 30.94–31.31 s · the HARDENS stamp is lost**, because the callout ends before `stampAt`. Make the "Temporary zones" callout last until the stamp has landed. It then clears at 32.14 s, just as the flags arrive on "rival" (32.44 s):
   ```json
   {"type":"callout","text":"Temporary zones","sub":"US · Soviet, 1945","y":1080,"size":60,"atWord":"temporary.",
    "hold":3.4,"stamp":"HARDENS","stampWord":"hardens:","stampSize":44}
   ```
2. **[P2] hook · 2.3–5.3 s · the images do not follow the words.** The map sticker fires at t=0 and is gone at 3.0 s, before "National" (3.85 s). "Americans" (2.54 s) has no image. The gold line fades out at 4.25–4.75 s, so the line is gone on "map." (`k2_4.9.jpg`). Replace the hook's path hold and stickers with:
   ```json
   {"type":"path", "...":"same coords/colour/label", "from":1,"dur":0.1,"hold":5.0,"atTime":0},
   {"type":"sticker","flag":"us-48","x":830,"y":1010,"size":130,"atWord":"Americans.","hold":0.8},
   {"type":"sticker","emoji":"world_map","x":830,"y":1010,"size":170,"atWord":"National","hold":1.5},
   {"type":"sticker","emoji":"fountain_pen","x":250,"y":1010,"size":150,"atWord":"map.","hold":0.6,"tilt":-20}
   ```
   With these values the flag is gone by 3.74 s, before the map sticker appears at 3.85 s. The line stays fully drawn until the camera starts moving into `japan`.
3. **[P2] loop · end vs frame 0 · the size jump at the seam.** The last frame shows the map at span 9, while frame 0 shows it about 18% larger because of the punch-in. That makes the replay look like a cut. End the loop on the punched framing, using a span of 9 / 1.18 ≈ 7.6:
   ```json
   "camera": {"center":[127.6,38.1],"span":7.6}
   ```
   (in beat `loop`). Then check the frame 0 and frame 1716 stills side by side.
   Also hide the timeline on the seam, so it no longer jumps from 1953 to 1900. Add `hideTimeline?: boolean` to `Beat` in `src/lib/types.ts`. In `src/Episode.tsx`, add `const hiddenTimeline = !!spec!.beats[beatIdx]?.hideTimeline;` and render the timeline as `{!cover && !hiddenTimeline && <Timeline …/>}`. Set `"hideTimeline": true` on `hook` and `loop`. As a bonus, frame 0 no longer shows "1900" while the voice says "1945".
4. **[P2] states · 32.4–34.9 s · the North Korean flag sits on top of the "North Korea" label** (flag at [126.9,40.5], label at [127.0,40.6]; `k2_34.6.jpg`). Move the flag to the north-east of the label:
   ```json
   {"type":"sticker","flag":"kp","at":[128.6,41.0],"size":100,"atWord":"rival","hold":2.0}
   ```
5. **[P2] states · 27.6–31.3 s · the chip says "TWO STATES" while the voice says "meant to be temporary"** and the badge still reads AUGUST 1945 (`k2_28.8.jpg`). That contradicts the "Temporary zones" callout. Make the chip match the first half of the beat. The flags and region labels name the two states later in the beat.
   ```json
   {"type":"chapter","emoji":"hourglass_done","text":"Temporary?"}
   ```
   With that chip in place, drop the hourglass sticker (`atWord":"temporary."`), because it would be a duplicate.
6. **[P2] armistice · 43.96–45.6 s · "DMZ" appears without explanation.** The voice says "It's not the 38th parallel" and never says "DMZ", so a new viewer cannot connect the term to the line. Use:
   ```json
   {"type":"callout","text":"New border: the DMZ","sub":"≈ 2.5 miles wide · ≈ 155 miles long","y":1100,"size":64,
    "atWord":"Not","hold":1.4}
   ```
7. **[P2] armistice · 39.9–42.67 s · 2.8 s with nothing new on screen** apart from the date badge ("And when the 1953 armistice draws…"). Add an image on the word "armistice". The sticker clears before the white line starts at 42.67 s.
   ```json
   {"type":"sticker","emoji":"page_with_curl","x":860,"y":1000,"size":140,"atWord":"armistice","hold":1.0}
   ```
8. **[P2] treaty → loop · 53.40–54.0 s · the STILL stamp lands on a box that is already fading.** The callout's fade starts at 53.6 s. Extend the hold so that the stamp is readable and fades out on the spoken word "Still" (54.11 s):
   ```json
   {"type":"callout","text":"No peace treaty","sub":"armistice only, since 1953","y":1080,"size":72,"atWord":"peace",
    "hold":1.7,"stamp":"STILL","stampWord":"signed.","stampSize":48}
   ```
9. **[P2] line · 17.8–21.56 s · 3.7 s with only a 1.2 s mountain sticker, and "no river" has no image.** This is the same problem as pass 1 #10, and it is still a retention dip. Add:
   ```json
   {"type":"callout","text":"No river · no mountains","size":52,"y":1100,"atWord":"river,","hold":1.6}
   ```
   (It runs from 18.30 to 20.30 s, before "straight" at 21.56 s and the 38°N callout at 22.63 s.)

## Not regressions (checked)
- The Sokcho pointer, the white 1953 line and the gold 38°N line are all readable at 49.8 s. The gold line fades out after "once in the North".
- The war tanks stop on the 38°N line, and the 1950–1953 callout does not overlap them.
- "Each claims all of Korea" sits just under "South Korea": tight, but they do not overlap.
- In the loop, the recolour completes by the last frame (`k2_last.jpg`). The title is visible on both the first and the last frame.
- Captions and the timeline stay clear of overlays throughout.

## Re-check after fixes
Stills at frames 0 and 1716 side by side, plus 3.0, 4.9, 28.8, 31.6, 33.5, 42.0, 44.5 and 53.6 s.
