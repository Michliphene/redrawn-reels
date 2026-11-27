# Review: SILLAGE N°6 "It was never whale vomit" (ambergris), KIT v3 build, pass 1

Video `raea/sillage-006-ambergris-v2/out/sillage.mp4` (65.7 s, 1080×1920, 30 fps). Frames are in
`raea/sillage-006-ambergris-v2/out/review/`: sheet_01–06 are 2 fps contact sheets at 12 s each, f_*.jpg and cmp_a/b/c.jpg are close-ups.
Pre-flight: 0 ✗, 10 ! (caption pages that repeat a title, hidden at render). raea render: 8 exposure warnings
(−2.7 to −3.7 stops). raea check: 0 errors, 56 reading warnings, safe areas OK, contrast OK, −13.7 LUFS.

## Verdict
**7.5/10. Postable after the P1 and the first three P2s.** This build is clearly better than the non-kit build (6.5). The hook
now cuts to the lump on "It sold" and the $1.5M stat lands on time. Every on-screen fact matches SOURCES.md, the "mostly" hedge
is on screen, captions break cleanly ("EU" is fixed), the logo sits inside the safe area, the loop frames match, and the
flacon fills on "ambroxide" and stays full through "law". The 3 biggest problems:
1. **The myth-bust, the thesis of the reel, is on screen for about 0.9 s.** "Never vomit." comes in on "never" (7.99 s), and
   the shot cuts at 8.93 s. The caption is hidden because it repeats the title, so nothing else carries the line.
2. **Most plates read as a thin strip.** The two kit scrims (top 0.9 down to 43 %, bottom 0.86 from 55 %) leave about 12 % of the
   height clean. The whale, boat and sea plates are a band between y ≈ 830 and 1100 in a near-black frame (exposure warnings).
3. **The "liquid" reads as a cream box.** The juice `#A88B4E` plus `emissive glow(juice, 0.4)` comes out as an opaque, square,
   beige block behind the label (f_38.9, f_40.3, f_50.5). It does not read as amber perfume. This weakens the reel's only dataviz.

## Fix list
1. **[P1] myth · 7.67–8.93 s · "Never vomit." is visible for 0.9 s and the caption is hidden.** Bring the title in on "It" and
   hold the shot until "ambergris" is spoken:
   ```json
   { "t": "title", "v": "Never\nvomit.", "gold": "vomit.", "at": "myth:It-0.1" }
   { "id": "name", "at": "name:ambergris.-0.15", ... }
   ```
   This gives about 1.6 s. The raea check warning on "vomit." (0.6 s) should then clear.
2. **[P2, kit] all plate shots · image crushed into a band, frame −3 stops.** In `tokens.json → scrim`, size the top scrim to the
   text stack and not to 43 % of the height: `"top": { "alpha": 0.88, "to": 0.30, "fadeTo": 0.42 }`. Change
   `"bottom": { "from": 0.62 }`. Then re-run the worst-case contrast check: the stack ends at about y 700 = 0.36 H in the
   4-line shots (hook, molecule, history). If the check fails, scale the scrim per shot from the measured stack height
   (`TextStack` bounding box + 80 px) instead of using a fixed fraction. Check on stills at 0, 15, 28, 46 and 55 s.
3. **[P2] molecule / law · 38.3–54.1 s · the liquid looks like a beige box.** In reel.json, use a deeper and more saturated amber:
   `"juice": "#9A6420"`. For the kit, add `juiceGlow` to reel.json (default 0.4) and pass it to `glow(juice, …)` in
   `flacon.tsx:169`. Use `0.12` for N°6 so the tone mapper stops washing the block out to cream. Check on a still at 39.8 s:
   the block must read as amber, darker than the label.
4. **[P2] price · 54.6–57.2 s · the explanation comes before the number, then everything is gone in 1.2 s.** "a gram · $1.5M ÷ 127 kg"
   and the badge appear on "piece" (54.6 s) under an empty slot, and "$12" only arrives at 55.9 s. Both captions are hidden.
   Fix the order and give the stat time:
   ```json
   { "t": "whisper", "v": "a gram · $1.5M ÷ 127 kg", "at": "price:a" },
   { "t": "badge", "v": "our calculation", "at": "price:a" }
   { "id": "synthetic", "at": "synthetic:shortcut.-0.2", ... }
   ```
   "$12" is then on screen for 2.2 s. The "the shortcut" label lands on its word, and "So perfumers found" plays over the boat.
5. **[P2] name · 8.93–12.4 s · the macroLabel camera pushes the cap into the header.** The gold cap sits behind "SILLAGE — N°6"
   and "Ambergris" (f_10.5). The caption "It's ambergris." also sits on the bottle label, so two SILLAGE logotypes are stacked.
   It is also the moment the viewer learns the name, and they are shown our bottle, not the substance. Put the name on the
   substance:
   ```json
   { "id": "name", "at": "name:ambergris.-0.15", "kind": "plate", "img": "s_lump.jpg", "focus": [50, 58],
     "kb": { "from": [1.08, 0, 0], "to": [1.2, -10, -20] }, "text": [ ...unchanged... ] }
   ```
   If the flacon stays, use `"camera": "hero"`. Kit: macroLabel must keep the cap below y 700.
6. **[P2] molecule · 39.6–40.8 s · "the main smell" (y ≈ 650) touches the top of the cap.** The pushIn camera puts the cap inside
   the 4-line stack. Use `"camera": "orbit"` for molecule (the cap stays below y ≈ 700 there, see f_24.8). Alternatively, drop the
   whisper: the caption "That is the smell." is already on screen.
7. **[P2] exit → rare · 21.17–21.88 s · "…like dung" is on screen for 0.6 s.** This is the reel's best laugh, and pass-1 #14 is still
   open. Delay the cut: `{ "id": "rare", "at": "rare:Only+0.4", ... }`. "Only about" plays over the whale, and the stat still
   lands on "one".
8. **[P3] gut · 14.94–16.06 s · a 1.1 s gap.** The caption "from a secretion of the bile duct." is hidden, and the whisper waits
   for "bile". Use `{ "t": "whisper", "v": "a bile-duct secretion", "at": "gut:from" }`.
9. **[P3] rare · 21.9–26.7 s · "1 in 100" floats over an empty, idle flacon (STUDIO §4: a widget where the world could show it).**
   The pass-1 pearls are gone, and nothing in the set shows the ratio. Cheapest fix: `"camera": "wide"` for a visible cut. Kit
   idea: a `ratio` set element (100 small gold dots on the socle rim, one lit), reusable for every "1 in N" claim.
10. **[P3] float + age · 26.95–33.5 s · one sea plate for 6.5 s.** The only change on "Slowly" is the Ken Burns. Add a time-jump cut:
    `"age": { "kb": { "from": [1.35, -60, -40], "to": [1.42, -70, -50] } }` (a tight crop on the lump), or generate a second
    plate (lump on a beach at dawn, aged and paler) in `tokens.image.styleSuffix` and add it to `media/manifest.json`.
11. **[P3] loop · 62.3–64.2 s · the boat sits bare for 1.9 s.** The captions carry "But the headlines never change", so this is
    acceptable. It hits harder if the headline arrives on "headlines": `"textFrom": "loop:headlines"`. Frame 0 and the last frame
    are already identical, so the loop holds either way.
12. **[P3] art direction · flacon shots · the glass reads grey and plastic.** The pale label and the transmission over the
    plum wall give it little contrast. Kit: raise the rim light, or set the wall a stop darker behind the glass, so the edges
    catch light.
13. **[P3] myth · accuracy nuance.** "Never vomit." is absolute, but SOURCES #2 marks very large masses as DEBATED. The voice says
    the same and the pinned comment covers it. Keep it, but the owner ticks ⚠ #2 before posting.

## Hidden caption pages (10 `!`): do they leave gaps?
Mostly not. A title or whisper carries the words for sold, exit, rare, float, age and price. Real gaps: **myth** (fix 1),
**gut** "from a secretion…" (fix 8), and **price** (the stat is late, fix 4). Each of these three hidden pages needs its title to
land on the first word of the spoken line. Kit suggestion: hide a caption page only if a matching text element is visible
for ≥ 80 % of the page's duration. Otherwise draw the caption. Add this to `validate.mjs` as a check.

## Accuracy (vs SOURCES.md): all clear
127 kg / 280 lb / Yemen 2021 (#1, #1b; no month and no number of fishermen shown), $1.5M (#1), ambre gris (#3), gut + bile-duct
secretion + squid beaks "often" (#4), "it mostly leaves" (#2 hedge kept), 1 in 100 "an estimate" + SOURCES VARY (#5),
Soviet logs 1961–78: 0.4 % (#6), floats "often for years", sweet & earthy (#7), scentless ambrein → ambroxide (#8),
Egypt incense / plague / Charles II's eggs "reportedly" (#9), USA illegal to own · UK·EU can be sold (#10), $12 a gram
OUR CALCULATION (#11, 11.81), clary sage → ambroxide (#12). Images: 7 Nano Banana plates in the manifest, none presented
as photos of the find. The censer is now generic alabaster (pass-1 #10 fixed).

## Pass-1 issues: status
Solved: #1 hook (lump cut + $1.5M stat), #2 fill timing, #3 hedge, #4 line breaks, #5 "EU", #7 socle cut, #8 small cards
(full-frame plates, but see fix 2), #9 eggs on "Eggs", #10 censer, #12 loop sub-line, #13 logo safe area, #16 karaoke colour.
N/A: #6 strike, #15 pearls, #17 3D lump (all removed). **Still open:** #14 reading time for "dung" and price (fixes 4 and 7),
#11 loop (P3, fix 11), #18 float/age (P3, fix 10).

## What works
The boat bookend, which loops exactly. The lump plate for the money. A "Made in the gut" whale that is clear at a glance.
"USA: illegal" in gold on the still-full flacon. Clean left-margin type with gold used only on keywords. Nothing readable
falls in the platform UI zones.
