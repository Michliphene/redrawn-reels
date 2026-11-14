# Review — alaska-1867 · pass 1

Video `out/alaska-1867.mp4` (54.3 s). Read: all 12 contact sheets, cues.md, episode.json, SOURCES.md, timings.json; extra frames at 0.0 / 6.9 / 9.0 / 17.3 / 22.8 / 24.5 / 38.3 / 46.95 / 52.4 / 54.2 s.

## Verdict
**7/10. Postable after the 3 P1s.** The facts and sourcing are clean: every number on screen is in SOURCES.md, and the hedges ("Historians point to", "approximate traditional areas", "later myth") are good. The audio/visual sync is mostly tight.
The 3 biggest problems:
1. **07 transfer**: the line is "Russian flag comes down / American flag goes up", but no flag is ever shown. The 16° zoom also turns mainland Alaska into a flat red "pillar" up to the top of the frame, so the shape is unreadable (38.3 s).
2. **Viewers never learn WHERE this is.** Alaska is never named on the map in the hook. No locator appears. Frame 0 is a bare red shape with no number and no title.
3. **25.7–35.6 s (acre → folly → senate)**: about 10 s of the same static Alaska with only text cards. From 27.3 to 29.2 ("Some critics mock the deal") nothing new appears on screen.

## Fixes (word times from timings.json)
1. **[P1] transfer · 37.69 s.** Add a flagSwap. Re-frame so the mainland reads as Alaska.
   `"camera": {"center": [-141, 60], "span": 30}` and
   `{"type":"flagSwap","from":"ru-1867","to":"us-37","x":760,"atWord":"Russian","hold":3.4,"caption":"Sitka, Oct 18, 1867"}`
   Assets are missing: `us-37.svg` (37-star flag, official from July 4, 1867) and the flag lowered at Sitka. Some accounts say the Russian-American Company flag, others the Russian tricolour, so **research it and log it in SOURCES.md before drawing**. If it stays unclear, use the `flagNote` "flag as commonly depicted". Root.tsx silently drops a flagSwap whose flags are missing, so check that it actually renders.
2. **[P1] hook · 0.0–4.0 s.** Show the locator globe from frame 0, with Alaska lit and a ring pulse. Name the shape at "all" (3.37):
   `{"type":"label","text":"Alaska","at":[-152,64.5],"size":"md","atWord":"all","hold":0.7}`
   Make frame 0 striking: start the bigNumber at t=0 (or show its first digits on frame 0), and keep the title visible from frame 0.
   Add the sticker `{"emoji":"💰","atWord":"million.","position":[820,1180]}`. Keep it clear of the number at y≈1080, so it goes to the right of it.
3. **[P1] acre/folly/senate · 25.7–35.6 s.** Something new must appear every ≤2 s:
   - acre: `"label":"PER ACRE · ≈1.9¢ · 375M ACRES"` (in SOURCES). Sticker `🪙` at "cents" (26.29) [880,960].
   - folly: sticker `😂` at "mock" (27.95) [800,880]. Then `🗞️` at "famous" (29.17) [180,900], next to the callout. Hide the acre bigNumber at the beat start (hold 1.4 instead of 2.0) so the beat opens on something new.
   - senate: move the camera to Washington and add a sticker:
     `"camera":{"center":[-98,48],"span":62}`, `{"type":"marker","text":"U.S. Senate","at":[-77.01,38.89],"atWord":"Senate","hold":2.4}`, sticker `🏛️` at "Senate" (33.20) [820,700], `✅` at "approves" (33.53).
     Move the `37 – 2` callout's `atWord` to "thirty-seven" (34.46). It currently appears 1.3 s before the number is spoken.
4. **[P2] russian · 9.0 s.** The "≈ 4,300 miles" label sits on top of "Russian America" (they read as "Americ≈4,300"). Set the label's `hold` to 1.6 (gone by about 7.9 s). Fire the path at "over" (8.94) instead of "fur-trading", so the arc lands on "4,000 miles". Add a `marker`/`region` "Russian Empire" at [60,62] on "Saint" so the far end of the arc is named.
5. **[P2] why · 18.19 s.** "British threat?" troops (hold 2.4) linger into the sign beat. Set hold to 1.5.
6. **[P2] sign · 19.6–22.6 s.** The archive card (hold 3.0) covers the Washington marker and is still fading over the Seward portrait at 22.8 s. Set archive `hold: 2.3` (gone before "Seward", 22.02). Fire the Washington marker at "Secretary" (20.73). Add sticker `✍️` at "signs" (22.42), centre [540,980].
7. **[P2] sign→acre · 24.5–26.3 s.** The Stoeckl portrait (hold 2.6) slides over the acre bigNumber and camera move. Set hold to 1.6.
8. **[P2] gold→state · 46.64 s.** The `date 1968` action makes the badge read 1968 → 1959 (going backwards). The 1968 dot also clamps at the end of a 1860–1960 timeline. **Delete the `date` action at "oil"**; the marker already says "oil 1968".
   The pipeline line runs through the "Prudhoe Bay" label: move the marker text below the point, or the pipeline `labelAt` to [-138,64].
   "Juneau · gold 1880" ends about 5 px from the right edge: shorten it to "Juneau · 1880" or shift its anchor west.
9. **[P2] state · 51.24 s.** Texas only appears at "Texas" (52.07), 0.5 s before the beat ends, then sits over the whole loop. Fire the ghost and region at "twice" (51.24) with hold 1.9 (gone by about 53.2).
10. **[P2] loop · 52.8–54.3 s.** The end frame (blue Alaska + Texas, no title) does not match frame 0 (red Alaska + title). After fix 9 Texas is gone. For the colour, add a small component option, `pulse` with `"recolor":"start"` (ALASKA cross-fades back to `palette.start`) at "bought" (53.46). Bring the title back over the last 0.3 s.
11. **[P3] Portrait** role and credit text is about 16 px at 1080 width, which is unreadable. Bump the `small` portrait role font to ≥24 px (component).
12. **[P3] Accuracy, minor.** "costly defeat" (Crimean War callout) is not stated in SOURCES.md: add it with a reference or drop it to "1853–1856". Add the 37-star flag and the Sitka flag rows when doing fix 1.

## Imagery plan for the producer's new cues
**Locator globe** (top-right, x≈880–1040, y≈50–210: clear of the date badge at top centre and of the portraits at y≈360). Show it in 00 hook (frame 0), 02 why, 04–06, 07 transfer (dot on Sitka), 08–11. Hide it in 01 (the map is already global) and 03 (wide US view, portraits).

**Chapter chips**: put them under the date badge (y≈230) or top-left under REDRAWN, never at the top centre where the date badge sits. Show each one 0.2 s after the beat starts, for about 1.8 s.
| beat | chip | | beat | chip |
|---|---|---|---|---|
| 01 russian | 🗺️ RUSSIAN AMERICA | | 06 senate | 🏛️ SENATE VOTE |
| 02 why | 🤔 WHY SELL? | | 07 transfer | 🚩 HANDOVER |
| 03 sign | ✍️ THE DEAL | | 08 natives | 👥 NATIVE PEOPLES (no other emoji) |
| 04 acre | 🪙 THE PRICE | | 09 gold | ⛏️ GOLD & OIL |
| 05 folly | 🗞️ MYTH CHECK | | 10 state | ⭐ 49TH STATE |
No chip on 00 hook or 11 loop (keep the loop seamless).

**Stickers** (≤1 per 1.5 s; keep them out of y 1380–1560 captions, y 1640–1760 timeline and the callout band y≈1000–1120). This adds to the stickers already given in fixes 2, 3 and 6:
- 01: `⛵` or `🦫` at "fur-trading" (7.64) near Sitka [300,620]. `🏰` at "Saint" (10.44) next to the St Petersburg marker.
- 02: `💸` at "money" (14.11) [800,880]. `⚔️` at "Crimean" (15.12). `🇬🇧` at "Britain" (16.62) above the troops (the Union Jack is period-correct for 1867).
- 07: the flagSwap is the main visual; add `🎉` at "up" (40.28) only if it does not clash with the flagpole.
- 08: **no emoji on the peoples' names** (stereotype risk). At "consulted" (44.10) a sober `🚫` beside the callout, or nothing.
- 09: `⛏️` at "gold" (45.43) near Juneau. `⛏️` at "rushes" (45.65) near Nome. `🛢️` at "oil" (46.64) near Prudhoe.
- 10: `⭐` at "49th" (49.63) next to the callout. `🤠` at "Texas" (52.07) next to the ghost (light touch, optional).

**Arrows**: there is no arrow cue yet. Worth adding: `{"type":"arrow","to":[lon,lat],"from":"auto","label":"…","atWord":…}` (curved, drawn in 0.4 s, label at the tail). First uses: hook "this" → Alaska; 07 "Sitka" → Sitka (zoomed map); 05 "Seward's Folly" → Alaska.
