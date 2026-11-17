# REDRAWN — series bible

**Name:** REDRAWN
**Tagline (bio):** "History in 60 seconds. One map. Every claim sourced."
**Format:** 1080×1920 · 30 fps · 45–60 s · EN voice-over · word-synced captions · the map is the protagonist
**Art direction:** DA 2 "tabletop" for every new episode (`"da": 2`): the map is a board of pieces on a table, seen
through a real camera. Shared rules, safe area and camera language: `docs/STUDIO.md`. Template: `ussr-1991-v2`.
The name on screen comes from `public/studio.json` (series id `redrawn`).

## Editorial angle
1. **The map does the talking.** Each video = ONE transformation (Y → Z) shown as borders moving, never stock footage.
2. **Receipts.** Every on-screen date is sourced. Sources go in the pinned comment / caption. Where historians or states disagree, an on-screen tag "DISPUTED" or "DATES VARY" appears instead of picking a side silently.
3. **Hard loop.** The last line is grammatically completed by the first line (rewatch = retention).
4. **Accuracy budget shown honestly:** approximate pre-modern borders are drawn with a soft/blurred edge (uses the `BORDERPRECISION` field of historical-basemaps), modern legal borders with a sharp line.

## 20 topics (hook ≤ 1 s · loop ending)
| # | Title | Hook (≈1 s) | Loop ending → hook | Data difficulty |
|---|---|---|---|---|
| 1 | How 1 country became 15 (USSR, 1990–91) | "The largest country on Earth…" | "…Russia is still —" | Low (Natural Earth) — **produced** |
| 2 | How 13 colonies became 50 states | "This was the whole United States." | "…and it all started with just —" (13 colonies) | Medium (Newberry AHCB) |
| 3 | How the Louisiana Purchase doubled the US (1803) | "This land cost about 3 cents an acre." | "…all for roughly —" | Medium (contested western limit!) |
| 4 | How Alaska went from Russian to American (1867) | "Russia sold this for $7.2 million." | "…which is why —" | Low |
| 5 | How Texas was its own country (1836–45) | "Texas was a country for nine years." | "…and for nine years, —" | Medium (claimed vs controlled area) |
| 6 | How Poland vanished for 123 years (1795–1918) | "Poland disappeared from the map." | "…until one day, —" | Medium |
| 7 | How Germany became one country (1815–1871) | "In 1815 there were 39 Germanies." | "…before that, —" | Medium |
| 8 | How Germany split in two — and reunited (1945–90) | "One country. Two Germanys." | "…for 41 years: —" | Low |
| 9 | How Yugoslavia became 6 — or 7 — countries | "Six countries. Or seven." | "…depending on who you ask: —" (Kosovo, neutral) | Low, but **contested** |
| 10 | How Austria-Hungary broke apart in 1918 | "This empire vanished in a week." | "…in a single —" | Medium |
| 11 | How the Ottoman Empire became the modern Middle East | "Sykes-Picot didn't draw these borders." | myth-bust loop | Medium–High, contested |
| 12 | How British India became India, Pakistan and Bangladesh | "One line. Fifteen million people moved." (figure range — cite as "10 to 20 million") | — | Medium, **sensitive** |
| 13 | How Ireland was partitioned (1921) | "This border was meant to be temporary." | — | Low, **sensitive (UK)** |
| 14 | How Korea was split at the 38th parallel (1945) | "Two officers. One map. Thirty minutes." (cite Rusk account) | — | Low |
| 15 | How Africa was carved up (1870–1914) | "Most of these borders were drawn in Europe." | myth-bust Berlin Conference | High (approximate) |
| 16 | How Antarctica got 7 claims — and none count | "Seven countries claim this ice." | "…and yet, —" | Low (official claim lines) |
| 17 | How Rome went from one city to the whole Mediterranean | "This was all of Rome." | "…it began as —" | High (approximate, AWMC) |
| 18 | How the Mongols built the biggest land empire | "From one tribe to this — in 70 years." | — | High; area estimates debated |
| 19 | How the British Empire became 14 territories | "The sun never set on this." | "…today, only fourteen —" | Medium |
| 20 | How Czechoslovakia split without a shot (1993) | "This country split up — politely." | "…the Velvet —" | Low |

Recommended publishing order (data risk ↑ slowly): 1, 4, 20, 8, 16, 14, 9, 5, 6, 7, 10, 2, 3, 13, 19, 12, 11, 15, 17, 18.

> ⚠️ Every hook containing a figure is a draft to verify at scripting time: "39 Germanies" (German Confederation: 39 members at creation, number varied 1815–66), "3 cents an acre" (≈$15M / ≈530M acres), "30 minutes" (Dean Rusk's own account of the 38th-parallel decision), "vanished in a week" (late Oct–early Nov 1918), Partition displacement (estimates 10–20 million).

## DA 2 — what changes for the script
- **Frame 0 is an object, not a diagram.** The reel opens on a low crane shot across the subject; the title sits on
  it. Write the first sentence so it works over that image (a number or a stake, never "this is…" over a map).
- **Direct the camera in the cue sheet.** One angle per beat (`pitch`, `yaw`), one `cut` around 40–60 % as the
  re-hook, a pull back before the payoff. Close views go low, wide views go steep.
- **One header block.** Title and `whisper` on the hook; then date + year + the `chapter` line. No emoji chips.
- **`keywords`**: the names the reel is about (the countries that leave, the buyer, the price). Numbers highlight
  themselves. Five to fifteen words, not every noun.
- **Cards**: single portraits top-right (`side: "right", y: 330, small: true`), groups in the lower stage (`y: 790`).
- **Units are pieces on the board**, still symbolic: `offset` and `approach` say *that* forces moved, never where.
- A remaster of a published episode is a new id with `"audio": "<original>"`: same script, same sources.

## Formats beyond the explainer (see `docs/STUDIO.md` §6)
| # | Format | Draft hook (verify every figure at scripting) | Data |
|---|---|---|---|
| B1 | You are… | "You have 15 republics. Keep them." | `ussr1991.geojson` (produced) |
| C1 | Guess before the count ends | "Guess the price of all this." (three options on screen) | `alaska1867.geojson` (produced) |
| C2 | Guess before the count ends | "How many countries will this become?" | topic 9 or 10 |
| D1 | Myth-bust | "Everyone blames this line on two men and a ruler." | topic 11 or 15 |
