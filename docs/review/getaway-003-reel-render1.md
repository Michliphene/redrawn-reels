# REVIEW: getaway-003-monalisa (THE GETAWAY · CASE 003 · the Mona Lisa, 1911). Reel review, render 1

Inputs: `out/getaway-003-monalisa.mp4` (69.0 s, voice 68.4 s, DA 2), 13 beat sheets + `cues.md` (`out/review/getaway-003-monalisa/`),
guide stills at 0 / 4.3 / 37.8 / 54.6 / 67.8 s (`out/stills/getaway-003-monalisa/sheet.jpg`), spot frames at 15.0 / 22.8 / 26.3 / 50.5 s.
`npm run validate`: **0 ✗, 1 !** (the hook runs 4.0 s, see #20). Metrics: −14.6 LUFS · 33 visual cues = **4.8 / 10 s** (CASE 002: 6.1) ·
11 of 35 two-second windows have no new cue · longest gaps 7.13 s (6.67 s), 5.62 s (39.1 s), 5.01 s (31.2 s) · loop SSIM **0.864** (CASE 002: 0.946).

**Verdict: not postable yet. 6/10** (CASE 002 render 1 scored 6.5). Frame 0 is the best we have had: a face everyone knows, on a lit wall,
with the three empty CAUGHT / RECOVERED / FAMOUS boxes. It reads as an object in a space. The new kit works: the empty wall with its
4 hooks is a strong image, the trunk lid opens on "trunk." and shows her inside, and the train runs the Paris→Florence line on "takes".
The re-hook pull-back to Europe with the Puck cartoon (36–39 s) lands well. Three things hold the reel back:

1. **One on-screen fact contradicts SOURCES** (P1). The header shows **11 DEC** on "Caught.", but debated point 5 says to show "DEC 1913 only".
2. **The CASE 002 collision pattern is back, five times.** Each one comes from a `hold` that runs past the beat end: the two Louvre
   labels stack (22.5 s), the archive sits under the police ticket (39.1 s), the trunk and "28 MONTHS" sit over the Paris marker (50.4 s),
   POLICE · SYMBOLIC sits under ARRESTED (59.7 s), and the CONVICTED card covers the verdict box as CAUGHT gets ticked (64.6–65.0 s).
3. **The world is still a blank beige plane** (CASE 002 #8 was not fixed). "Paris, 1911" shows a 60 px wall, and only a marker names the
   place. The Louvre, the room, the trunk "in Paris" and the Uffizi all float on the same empty ground. 4.8 cues per 10 s, with a 7 s stretch
   in `who` where only the wanted card is on screen, then 1.2 s of empty plane. Sync on the payoff words is loose: BOTH CLEARED is typed
   2.4 s before the voice says it, and the NOT YET stamp shows for 0.3 s.

## Fix list ([P] beat · time · problem · fix)

1. **[P1] caught · 59.72 s** · The date chip reads "11 DEC". The day is disputed (11 or 12 Dec, fact 14 / debated point 5). Fix:
   `{"type":"date","date":"1913-12","atWord":"Caught."}`
2. **[P1] patriot → end · 64.6–65.0 s** · The CONVICTED card (60.73 + 4.2 s + fade) covers the verdict boxes as CAUGHT is ticked on "goes".
   Also, "goes" → CAUGHT and "back" → RECOVERED are 0.24 s apart, so the first tick means nothing. Fix: wanted `"hold": 3.4`
   (gone by 64.6 s; the OUT stamp on "out" at 63.43 still shows for 0.7 s), and
   `"picks":[{"pick":0,"word":"She"},{"pick":1,"word":"back"},{"pick":2,"word":"world","note":"WORLDWIDE"}]`
3. **[P1] press → suspects · 39.1–40.3 s** · The Puck archive (hold 2.6 from 37.29 s) is still up when the ticket lands on it.
   Fix: start the cartoon earlier and end it inside the beat:
   `{"type":"archive", … ,"atWord":"theft","hold":2.3,"w":760}` (36.50 → 38.80 s). Keep the pulse on "front".
4. **[P1] unnoticed → crowds · 22.5–23.0 s** · "CLOSED · 1 WEEK" lands on the fading "STOLEN · NOTICED A DAY LATER" (same spot, frame at 22.8 s).
   Both labels also cover the bottom of the wall. Fix: `unnoticed` label `"hold": 0.9,"at":[2.3376,48.905]`; `crowds` labels
   `"at":[2.3376,48.905]` (CLOSED and 4 IRON PEGS, see #19). Check on a still that they sit above the wall.
5. **[P1] trunk → florence · 50.37–50.8 s** · The trunk (hold 5.57 s) and "28 MONTHS" (49.21 + 1.8 s) carry over into the Europe shot,
   on top of "Paris" and the 1913 date. Fix: trunk `"hold": 5.15`, label `"hold": 0.95`, night `"hold": 5.0` (already set).
6. **[P2] end · 68.4–69.0 s · loop** · The painting leaves before the last frame (hold 3.98 ends at 68.57 s, the video runs to 69.0 s), and the
   crowd walks down into the captions band (y ≈ 1080–1230 at 67.8 s, over "COMES TO SEE HER"). That is why loop SSIM drops to 0.864. Fix: painting
   `"hold": 4.6`; crowd: drop `approach` so it sits where frame 0 has it, `{"type":"units","kind":"crowd",…,"offset":[170,110],"atWord":"whole","hold":3}`;
   end camera `"cut": true` so the wall is already in place on "She" (today the frame starts mid-flight from Florence).
7. **[P2] who · 4.6–13.5 s** · "Paris, 1911" shows no Paris, and the wanted card stays on screen 7 s, then the beat ends on 1.2 s of
   empty plane on "protective glass". Fix:
   ```json
   {"type":"marker","text":"The Louvre · Paris","at":[2.3376,48.8606],"atWord":"Paris,","hold":2.0},
   {"type":"prop","kind":"building","at":[2.3376,48.8606],"size":220,"atWord":"Paris,","hold":2.0},
   {"type":"wanted", …, "headSub":"Ex-Louvre worker","atWord":"Vincenzo","hold":4.2},
   {"type":"prop","kind":"painting","image":"assets/art/monalisa.jpg","wall":true,"at":[2.3376,48.8606],"size":340,"atWord":"He","hold":2.5},
   {"type":"label","text":"HE FITTED HER GLASS CASE","at":[2.3376,48.905],"size":"md","atWord":"protective","hold":1.2}
   ```
   The headSub "Louvre worker · 1911" is also inaccurate: in 1911 he *once* worked there (fact 3).
8. **[P2] suspects · 39.1–44.6 s** · At cps 42 the ticket finishes "BOTH CLEARED" at 40.7 s, while the voice says "Both" at 43.45 s. It then fades on
   "cleared." Fix: `"cps": 13, "hold": 5.3` (APOLLINAIRE finishes typing about 41.1 s, PICASSO about 42.7 s, BOTH CLEARED about 43.7 s). Ticket rows are 26 px, keys
   20 px: add `"w": 720` and, as a component change in `Ticket.tsx`, row text 32 px and key 24 px. Paris is not named here either: add
   `{"type":"marker","text":"Paris","at":[2.3522,48.8566],"atWord":"Police","hold":1.5}`.
9. **[P2] twist · 35.29 s** · The NOT YET stamp lands on "Not" but the callout fades 0.3 s later, so the punchline flashes by. Fix: callout `"hold": 5.0`
   (ends 36.22 s; the press camera travel covers the fade).
10. **[P2] caught · 55.5–60.3 s** · The Uffizi is never named, and the painting floats on a blank plane. "POLICE · SYMBOLIC" sits under ARRESTED.
    Fix: `{"type":"marker","text":"Uffizi · Florence","at":[11.2558,43.7696],"atWord":"Uffizi","hold":1.4}`; police units `"hold": 0.8`.
11. **[P2] trunk · 44.7–50.1 s** · The header still reads "22 AUG 1911" while the voice says "for over two years". "28 MONTHS" sits on the open
    trunk, over her face. Fix: `{"type":"date","date":"1913","atWord":"two"}` and label `"at":[2.37,48.905]`. Room/Paris is unnamed:
    `{"type":"marker","text":"His room · Paris","at":[2.37,48.872],"atWord":"room","hold":1.4}` (the marker must end before "trunk." at 47.60).
12. **[P2] patriot · 60.5–64.4 s** · The header still says "11 DEC 1913" while the card says June 1914. Fix: `{"type":"date","date":"1914","atWord":"He's"}`.
13. **[P2] theft · 15.55 s** · On "lifts" the painting *swaps* to the empty wall. Nothing is lifted, and that is the verb of the episode.
    Component (`src/atlas/Props3D.tsx`): painting `liftWord` makes the frame rise about 0.3 units off the hooks and slide out of frame over 0.6 s, with the
    empty-wall layer under it. Cue: one painting prop with `"liftWord":"lifts"` replaces the two props. The thief is a 20 px speck: `"size": 90`.
14. **[P2] crowds · 25.1–28.1 s** · "Crowds line up" shows 16 specks about 10 px tall that scatter, with no queue. Fix: `"size": 56, "spread": 90,
    "offset":[0,170]`. Component, optional: `units` with `"line": true` lays them out as a queue facing the `at` point.
15. **[P2] whole reel · world** · The Louvre, the room and the Uffizi stand on the same empty ground (CASE 002 #8, again). Data: add the Seine and the Arno
    as `properties.river` LineStrings in `scripts/prep-getaway-003-monalisa.mjs` (Natural Earth 10 m rivers), so Paris and Florence close-ups have
    a recognisable mark. Component (carried over): the `ground` layer for span < 0.5 (street grid ink lines).
16. **[P2] header · all beats** · The red mono date line ("21 AUG", "22 AUG", "DEC") is unreadable on beige (CASE 002 #10, not fixed). Component
    `src/atlas/Header`: give the date line a dark paper backing or a 2 px ink shadow.
17. **[P3] florence · 53–55 s** · Florence sits at the right edge (label ends x ≈ 918, the train runs into the x > 930 zone). Fix: camera
    `"center":[8.2,46.0]`. The Paris marker can also start on "December" only after #5 has cleared the trunk.
18. **[P3] press · 37.8 s** · The archive's right edge reaches x ≈ 950 under y 860 (picture only, the caption ends at about 720). Fixed by `"w": 760` in #3.
    The pulse on FR/IT/GB/DE/ES is hidden behind the card. Either drop it or use `"y": 620` so the countries show above.
19. **[P3] crowds · 27.28 s** · "4 IRON HOOKS": SOURCES fact 8 says "four iron pegs". Use `"text":"4 IRON PEGS"`.
20. **[P3] hook · 0.25–4.26 s** · The validator warns at 4.0 s (target 3.5 s). The number is in word one and the face is on frame 0, so this is acceptable without a re-record. Log it.
    The whisper (red serif on the grey wall, y ≈ 600) is barely legible: try camera `"center":[2.3376,48.965]` so the wall starts below the
    title block, and check it on a still.

## Checks passed
- Safe area: nothing readable above y 250 or below y 1440 on the guide stills. The verdict boxes end at x ≈ 450. Captions are never covered by cards.
- Sync (±0.2 s): date on "August", empty wall on "lifts", thief on "walks", callout on "isn't", ARRESTED + shake on "Caught.",
  trunk opens on "trunk.", train + path on "takes", Florence marker on "Florence", OUT stamp on "out", WORLDWIDE on "world".
- Accuracy: 20,000, 1911, 21/22 AUG, CLOSED 1 WEEK, 28 MONTHS, DEC 1913, 1 yr 15 days / ~7 months / ACCOUNTS VARY, Puck 18 Oct 1911,
  ROUTE · APPROX., the SYMBOLIC tags and RECONSTRUCTION on the ticket all match `SOURCES.md` (except #1, #7 headSub, #19). No cause is claimed for her fame.
- Art direction: one camera idea per beat, cuts on theft / twist / trunk / florence, the Europe pull-back as the mid-reel re-hook, and accent
  only on keywords. Credits are on screen for the painting photo, Puck and the police photo.

After #1–#12 the expected score is 7.5/10, and 8 with #13–#15. Re-render, then re-check 22.8, 39.3, 43.6, 50.5, 59.9, 64.7 and 68.9 s, and loop SSIM.
