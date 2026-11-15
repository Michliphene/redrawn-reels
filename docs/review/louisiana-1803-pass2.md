# Review: louisiana-1803, pass 2

Video `out/louisiana-1803.mp4`: 53.4 s (voice 0.25–53.4 s). I read all 15 beat sheets, `cues.md`, `virality_metrics.json` and SOURCES.md.
Extra frames are in `/tmp/claude-0/review-tmp/l2_*.jpg`: 0 s, 12.3, 12.9, 18.3, 21.0, 36.9, 38.4, 40.9 and 52.4 s. The strips are `l2_sA.jpg` and `l2_sB.jpg`.
Timing rule used below: an overlay stays visible until `t + hold + 0.4 s`.

## Verdict: 8/10. Postable: **NO** (one P1; postable once it is fixed)

All 18 pass-1 items are fixed and hold up under the new timings:
- The two big numbers no longer overlap.
- The French flag now sits on Louisiana.
- The double beat is framed wide, so the ×2 can be seen.
- The borders beat is clean.
- Frame 0 is fully drawn (no fade-in).
- The loop seam works ("All because…" → "America tried to buy New Orleans.", SSIM 0.90).

Sync is within ±0.05 s on every word cue. Every on-screen figure matches SOURCES.md, including "Nineteen days later" (April 11 + 19 days = April 30).

Biggest remaining problems:
1. **The "LOUISIANA" label is cut at the left edge**: it reads "OUISIANA" (port, 12.0–13.5 s). This is the only time the subject is named on the map.
2. **The chapter chips "The price" and "Twice as big" show no emoji.** Their emoji are Lottie `.json` files, which the Chip component does not render (same cause as pass-1 #15).
3. **The budget beat ends with a 2.8 s stretch with nothing new** (17.3–20.1 s, the longest gap in the video). "Florida" is spoken but never shown.

## Issues

1. **[P1] port · 12.04–13.5 s · `LOUISIANA` (size xl) at [-99,41] is cut at x=0.** The camera is `{"center":[-91,34],"span":30}`, so the label center lands at x≈250 px while the text is about 700 px wide. Move the label and the French flag east together:
   ```json
   {"type":"label","text":"LOUISIANA","at":[-94.5,41],"size":"xl","atWord":"Louisiana","hold":1.1},
   {"type":"sticker","flag":"fr","at":[-94.5,41],"dy":-110,"size":120,"atWord":"back","hold":0.6}
   ```
   Check with a still at frame 375 (12.5 s). The left edge of the text must be at x ≥ 40.
2. **[P2] acre/double · chips "The price" (`coin`) and "Twice as big" (`star`) have no icon.** Only `coin.json` and `star.json` exist in `public/assets/emoji/`. The sticker on "cents" does render a coin, so stickers handle Lottie and only the chip does not.
   Fix: add `coin.png` and `star.png` to `public/assets/emoji/` (Fluent 3D PNG, same set as `money_bag.png`). Alternatively, use PNG emoji in the chips:
   `{"type":"chapter","emoji":"money_bag","text":"The price"}` (note this repeats the "The plan" icon) and `{"type":"chapter","emoji":"mountain","text":"Twice as big"}` (not ideal). Adding the PNGs is the preferred fix.
3. **[P2] budget · 17.3–20.1 s · nothing new for 2.8 s, and "Florida" is never shown.** Florida is sourced (budget row: "New Orleans and (parts of) the Floridas"). Add a marker on "Florida.", and let the $10M card run to the end of the beat:
   ```json
   {"type":"marker","text":"Florida (Spanish)","at":[-83.5,29.5],"atWord":"Florida.","hold":1.2},
   {"type":"bigNumber", ... ,"hold":2.0}
   ```
   The bigNumber then ends at 17.29 + 2.0 + 0.4 = 19.69 s, before `napoleon` starts at 20.13 s. At span 95 the marker label may land close to the gold path; if it collides, use `"text":"Florida"`.
4. **[P2] deal · 31.96–33.36 s · "$15,000,000" is fully readable for only about 1 s.** It is already fading on "dollars" (deal sheet, end frame). This is the headline number. Set the bigNumber to `"hold": 1.3`; it then ends at 33.66 s, before `acre` starts at 33.67 s.
5. **[P2] hook + loop · the New Orleans label touches the cityscape sticker (frame 0, x≈720).** The sticker is screen-fixed, so in the loop it also floats over Arkansas while the camera zooms (52.2–52.6 s, `l2_52.4.jpg`).
   Anchor it to the map in **both** `hook` and `loop`:
   ```json
   {"type":"sticker","emoji":"cityscape","at":[-90.07,29.95],"dx":150,"dy":70,"size":180,"atTime":0,"hold":2.0}
   ```
   In `loop`, use the same sticker with `"atWord":"All","hold":1.4`.
6. **[P2] legal → double · 39.36–39.75 s · "Senate: 24 – 7" lingers into "The United States doubles"** (double sheet, start frame). In `legal`, set the Senate callout to `"hold": 0.8`; it then ends at 39.35 s.
7. **[P2] legal · 38.15–39.0 s · the red "BUYS IT" stamp cannot be read.** It is about 60 px wide on the small portrait and sits over Jefferson's face (`l2_38.4.jpg`).
   Either drop `stamp`/`stampWord` from the portrait (the Senate callout already carries "buys"), or change the component: in `Portrait.tsx` with `small`, render the stamp at a minimum font size of 34 px and place it below the card (`top: 100%`) instead of over the image.
8. **[P2] ask · 27.41 s · the "All of Louisiana?" callout fires on "pay", 0.4 s before "all"**, while the pulse fires on "all". Change the callout to `"atWord":"all"`; it then holds 1.1 s and ends at 29.31 s, before `deal` starts at 29.33 s.
9. **[P2] loop · 52.2–52.6 s · during the recolor, the purchase passes through flat grey** (light blue → orange). Frame 52.4 reads as "land removed".
   Component fix in the recolor in `MapLayer.tsx`: interpolate in HSL, or cross-fade two fills instead of lerping RGB. Cheaper alternative: start the recolor 0.3 s earlier in `today` (`{"type":"recolor","ids":["LOUISIANA"],"atWord":"states."}`) so the grey happens under the callout fade.

## Checks that passed
- **Frame 0:** the title, New Orleans marker and cityscape are all fully drawn. The tail frame matches.
- **Hook:** first word at 0.25 s, hook 1.59 s.
- **Napoleon beat:** the UK flag is now over the Atlantic; the Haiti marker and swords line up.
- **Borders beat:** "British lands", "Spanish lands" and all three "?" are visible. No chip or date covers them.
- **Natives beat:** the tribe names fade before `today`; the "Approximate areas, c. 1803" caveat is present.
- **Today beat:** the "15 states" callout clears before the loop.
- **Monroe credit / Paris marker:** no overlap.
- **Mississippi label / sailboat:** no overlap.
- **Accuracy:**
  - Spain → France 1800
  - up to $10M
  - April 11 and April 30
  - $11.25M + $3.75M
  - ≈2.8¢ per acre, 828,000 sq mi
  - Senate 24–7, Oct 20
  - handover Dec 20, 1803
  - settled 1818–19
  - 15 states, "all or part"
- **Cosmetic, not blocking:** a short orange glow segment shows on the 31°N line east of the river in the hook (the West Florida boundary, x≈570, y≈690). It is correct for 1803, so I left it as is.
