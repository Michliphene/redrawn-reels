# Review — SILLAGE N°6 "It was never whale vomit" (scent-006-ambergris) · pass 1

Video `raea/sillage-006-ambergris/out/sillage.mp4` (65.7 s, 1080×1920, 30 fps). Frames: `raea/sillage-006-ambergris/out/review/`
(sheet_01–09 = 2 fps contact sheets; f_*.jpg close-ups). `npm run validate`: 0 ✗, 1 ! (hook 6.2 s). `raea check`: 16 reading warnings.

## Verdict
**Not postable yet. 6.5/10.** The script is strong, the facts are clean, and the sets have a recognisable style (boat, cabinet, paper
table). Three problems block it:
1. **The hook is one still image for 6.2 s.** "127 KG of whale vomit?" sits on a dark boat painting from 0 to 6.7 s. The second
   surprise ($1.5M) is a 32 px mono line. The validator flags it, and nothing new appears until 4.4 s.
2. **The payoff is cut off.** The flacon starts filling at 39.5 s, takes 1.8 s, and the shot cuts at 40.7 s with the flacon half
   full (f_40.6.jpg). Before that the molecule beat is 6 s of the same empty flacon with only text changing.
3. **The on-screen text drops a hedge that SOURCES requires.** SOURCES #2 marks "how it leaves" as DEBATED, and the script says
   "*mostly* leaves the other way", but the screen says "It leaves the other way".

## Fix list (all changes in `raea/sillage-006-ambergris/compositions/sillage.tsx`)

1. **[P1] hook · 0–6.4 s · nothing new for 4 s; $1.5M too small; frame 0 is a flat painting, not an object in a space.**
   Cut to the 3D lump on "It sold" and stamp the money:
   ```ts
   // SHOTS, after hook:
   { id: "sold", from: w("hook", "It") - 0.1, kind: "flacon" },
   // cameraAt, case "flacon":
   if (s.id === "sold") return orbit([LUMP.x, LUMP.plinth + 0.35, LUMP.z], lerp(-14, -4, k), 9, lerp(7.5, 6.2, k), 26);
   // ShotText:
   case "sold": return (<Block t={t} a={s.from + 0.05} b={end}>
     <div style={label(C.gold)}>Yemen, 2021 · sold for</div>
     <div style={{ ...statStyle(C.rose), opacity: fadeIn(t, w("hook", "$1.5")) }}>$1.5M</div></Block>);
   ```
   In `HookTitle`, remove the "Yemen, 2021 · sold for $1.5M" line (it moves to "sold"). Add `[w("hook","$1.5"),"stamp",0.4]`
   to sfx (it replaces the "pop"). The hook painting then lasts 4.1 s, and the myth shot pulls back from the lump to the flacon.
2. **[P1] molecule · 33.5–40.7 s · fill cut at about 50 %; static set.** Start the fill on "ambroxide" so the flacon is full on
   "That is the smell", and give the beat one camera idea (lump = ambrein, then turn to the flacon):
   ```ts
   const at = w("molecule", "ambroxide") - 0.1;   // fillAt, was w("molecule","That")
   ... FULL * inOut3(ramp(t, at, 1.3))
   if (s.id === "molecule") return orbit([lerp(1.6, 0, k), 2.0, 0], lerp(22, 2, k), 7, lerp(15, 13.6, k), 26);
   ```
   This puts the lump in frame on "ambrein" (36.3 s) and the full flacon at the centre by 39.6 s.
3. **[P1] exit · 19.2 s · on-screen claim stronger than the source.** `It leaves<br />the other way` →
   `It mostly leaves<br />the other way`. The rest of the beat stays the same.
4. **[P2] captions · whole reel · bad line breaks.** "Fishermen in Yemen found 127 / kilos…", "intestine of a / sperm whale",
   "illegal in / the United States", "favourite of King / Charles", "from clary / sage". These cause most of the raea "reading"
   warnings ("clary" 0.3 s, "sperm" 0.4 s). In `SEGMENTS`, raise the limit and never end a segment on a function word or a number:
   ```ts
   const GLUE = /^(a|an|the|of|in|for|from|to|and|King|about|one|\$?[\d.]+)$/i;
   if (cur.length && chars + x.w.length + 1 > 40) {
     const carry: Word[] = [];
     while (cur.length > 1 && GLUE.test(strip(cur[cur.length - 1].w))) carry.unshift(cur.pop()!);
     out.push(cur); cur = carry; chars = carry.reduce((n, y) => n + y.w.length + 1, 0);
   }
   ```
   Check after the re-render that no segment is more than 2 lines tall (the box must stay above y 1440).
5. **[P2] law · 52.5 s · caption reads "the E U,".** The respelled tokens are shown as they are. Merge them before segmenting:
   in the `for (const x of b.words)` loop, if `x.w === "E"` and the next word is `"U,"`, push
   `{ w: "EU,", start: x.start, end: next.end }` and skip the next word.
6. **[P2] myth · 6.7–7.9 s · a stray dash before "WHALE VOMIT"** (f_7.6.jpg): the strike is 12 px wide when k = 0. In `Strike`:
   `width: \`calc(${k * 100}% + ${12 * k}px)\``.
7. **[P2] rare · 21.9–26.8 s · the flacon socle and rim are cut off at the top of the frame, behind "1 in 100"** (f_22.1/f_24.5).
   Move the pearls away from the cabinet: `const DOTS = { z: 6.0, step: 0.24 };`. By calculation, the socle then sits about 19°
   above the frame centre, which is outside the 13° half-FOV.
8. **[P2] beak / history / synthetic cards · the card is small (about a third of the width) and washed out.** Its top third is
   under the paper gradient (0.97→0.8 alpha down to y 760), and the history header (3 lines + "reportedly", down to y ≈ 560)
   sits on the card. Try: card camera `orbit([PAPER.card[0], 0, -0.8], lerp(-3,3,k), 76, lerp(15.5,15,k), 26)` and a light
   gradient `height: 600` that fades to 0 at 100 %. Check with `raea` stills at 17.5 / 45 / 60 s: the card should start below
   y 620 and the header should not overlap it.
9. **[P2] history · 45.3–48.6 s · "Charles II's eggs" only appears on "Charles" (48.2 s), 2.9 s after "Eggs".**
   Key it on `w("history","Eggs")` and keep "reportedly" on `w("history","reportedly")`.
10. **[P2] history card image · anachronism / wrong culture.** The censer is a Chinese bronze *ding* tripod, illustrating
    "Egyptians burned it as incense". Regenerate `c_history.jpg` (Nano Banana) with an Egyptian-style arm censer or a plain
    ceramic incense bowl, and update `media/manifest.json` (prompt_summary).
11. **[P2] loop · 62.3–64.4 s · 2.1 s of the bare boat painting while the voice says "the headlines never change".**
    Start the title on "headlines": `case "loop": <Block t={t} a={w("loop","headlines")} b={DUR + 1}>`.
12. **[P2] loop / frame 0 · the last frame shows the "Yemen, 2021 · sold for $1.5M" line, frame 0 does not.**
    Fix 1 removes that line from `HookTitle` altogether; otherwise, give `HookTitle` a `sub={false}` prop for the loop.
13. **[P2] safe area (DA 2) · badge "SILLAGE N°6" top edge at y ≈ 238, inside the platform UI (y < 250).**
    `L.badgeY: 264, hookY: 330`.
14. **[P2] reading · "…like dung" is on screen for 0.6 s, "$1.5M ÷ 127 kg · our calculation" for 1.2 s.**
    Let the punchlines breathe: `rare` from `B("rare") + 0.2`. For `price`, fade the calc line in on `w("price","Yemen")`
    and keep `$12` on "$12"; or start `synthetic` at `w("synthetic","shortcut") - 0.3` (the voice keeps running over the card).
15. **[P3] rare · 21.9 s · the "one" pearl is already rose before "one"** (base_color rose). Use
    `base_color={one ? lerpHex(C.greyDark, C.rose, lit) : C.greyDark}`, or keep it greyDark until `lit > 0`.
16. **[P3] art direction · the caption karaoke colours every spoken word rose.** STUDIO §2: the accent goes only on keywords
    and on the number that matters. Use ivory for the current word plus a rose underline, and keep rose fill only for words in
    `episode.json.keywords` (ambergris, vomit, dung, ambroxide, illegal).
17. **[P3] myth / law · the lump (8 spheres) reads as a cartoon cloud.** Squash it more (`withScale([1, 0.6, 1])`), add 4–6
    small offset blobs, and make the colours rougher/more varied (greyDark ↔ #6B6253) so it looks like the beach painting.
18. **[P3] float + age · 27–33.5 s · one painting for 6.5 s.** The text does change on time. Add a slow lateral drift
    (`translateX(${-30 * k}px)`) or a cut to a tighter crop on "Slowly" to mark the time jump.

## Accuracy check (vs SOURCES.md)
All on-screen claims match: 127 KG / Yemen 2021 / $1.5M (#1, month and number of fishermen not shown, as required),
ambre gris (#3), bile duct + squid beaks (#4), 1 in 100 "an estimate" (#5), Soviet logs 1961–78: 0.4 % (#6: 240/59,814 = 0.40 %),
ambrein → ambroxide (#8), Egypt incense / plague / Charles II "reportedly" (#9), USA illegal to own · UK·EU can be sold (#10),
$12 a gram labelled OUR CALCULATION (#11), clary sage → ambroxide (#12). There is one exception, the hedge in fix 3.
Image provenance is fine: all 7 plates are in `media/manifest.json` as Nano Banana. Nothing on screen claims they are photos.

## What works
Myth bust ("WHALE VOMIT" struck through, beside the empty flacon and the lump on its plinth), the 100 pearls with one lit,
the flacon that is still full in the law shot (continuity), $12 stamped with its calculation, and the boat that bookends the reel.
