# Review — czechoslovakia-1993 (REDRAWN EP 7, DA 2) · pass 1

Video `out/czechoslovakia-1993.mp4` (45.8 s, voice 45.19 s). Checked: 12 beat sheets (`out/review/czechoslovakia-1993/`),
`cues.md`, guides stills at 0 / 4.3 / 17.9 / 22.6 / 24.6 / 26.65 / 33.2 / 39.6 / 43.5 s, frame 0 vs last frame.
`npm run validate`: 0 ✗, 1 ! (hook 4.4 s). The `!` is accepted: `say` is locked and the stake ("nobody asked them") is spoken by 4.2 s.

## Verdict
**Not postable yet: 6.5/10. About 7.5 once the P0/P1 fixes are in.** The world reads well: frame 0 is a low crane over two coloured slabs
under the title. The loop is good too: the last frame comes back to the frame-0 pose with the same colours, so the cut does not show.
The flag payoff ("CZECHOSLOVAKIA" sticker → "CZECHIA") is a good idea. The problems are mostly on-screen wording and timing:
1. **The title over-claims.** "THE SPLIT NOBODY VOTED FOR" is false as worded: the Federal Assembly *voted* Constitutional Act 542/1992 (25 Nov 1992).
   The voice ("nobody asked them") is safe, because it means no referendum. The title is not safe.
2. **Invented precision and anachronisms.** The header shows "1 SEP 1992" for a poll that has no day in the sources. The pieces are labelled "Czechia" under a
   "1 JAN 1993" header (the English short name dates from 2016). The gold label says "handed back · Nov 1999", but SOURCES only backs the 24 Nov protocol.
3. **The whisper line runs one beat late, and two beats have dead air.** "two winners, two plans" stays up under NO REFERENDUM. "no referendum" stays up over the poll and Jan 1.
   "the Velvet Revolution" stays up under 1990. The stage shows nothing new from 9.9–12.2 s and from 28.2–29.7 s. The tanks in `share` land on Czech soil.

## Fix list
**[P0] global · 0–4.6 s · title claim.** Parliament voted for the split; the people were never asked. Change the title, which is not spoken:
`"title": "The split nobody was asked about"` (or `"Split in two. Nobody asked."`). Add to the SOURCES "Debated / limits" section:
"Federal Assembly passed Act 542/1992 on 25 Nov 1992; 'nobody asked them' = no referendum (Wikipedia, Dissolution of Czechoslovakia)".
The NEVER ASKED stamp and the pinned comment are fine as they are.

**[P0] poll · 23.26 s · "1 SEP" is an invented day.** `DateBlock` shows the month only when the date has no day:
`"date": "1992-09"`. The validator's date regex (`^\d{4}(-\d\d-\d\d)?$`, scripts/validate.mjs:153) may then flag "09". If it does, accept the warning
or widen the regex to `(-\d\d){0,2}`.

**[P1] hook/jan1/share/kept/loop · "Czechia" in a 1993 story.** The geojson name comes from `scripts/prep-czechoslovakia.mjs:12`
(`'Czechia'`). Change it to `'Czech Republic'` and re-run the prep script. Then:
hook label `"text": "Czech Republic"`; kept sticker `"text": "CZECH REPUBLIC"`. Check by eye that the declare label fits on the slab.

**[P1] gold · 35.48 s · the label claims more than SOURCES says.** The source supports the protocol date, not the handover date. This beat also has 2 s with only a label on screen.
Replace the label with a world-pinned fact that uses the sourced 4.1 t:
```json
{"type":"marker","text":"Prague · Czech National Bank","at":[14.42,50.09],"atWord":"gold","hold":1.9},
{"type":"marker","text":"Bratislava · National Bank of Slovakia","at":[17.11,48.15],"atWord":"until","hold":1.4},
{"type":"label","text":"4.1 t returned · protocol 24 Nov 1999","at":[16.6,48.6],"atWord":"until","hold":1.4}
```
Do not use a `path`: where the gold was physically stored is not sourced, and a path would read as a route.

**[P1] share · 32.1–35.0 s · the tanks read as an invasion of Czechia.** The "1" tank (Bratislava, `offset [0,-90]`) is drawn over Moravia.
All three tanks drive in from outside the borders, and the "2"/"1" captions are tiny boxes (~28 px). The "2" sits in the title band at y≈516, next to "1993".
```json
{"type":"units","kind":"tanks","at":[15.0,49.7],"count":2,"size":72,"approach":[160,30],"offset":[0,0],"atWord":"two","hold":3.0},
{"type":"units","kind":"tanks","at":[19.3,48.75],"count":1,"size":72,"approach":[-160,-30],"offset":[0,0],"atWord":"one:","hold":2.6},
{"type":"label","text":"2 : 1 · by population","at":[16.9,48.2],"atWord":"tanks,","hold":2.0}
```
In this version the tanks slide out from the old centre to each side, inside each piece. The `caption` fields are dropped and the label carries the ratio.

**[P1] noref/poll/jan1 · 21.1–29.7 s · the whisper chapter lags one beat.** NO REFERENDUM appears under "two winners, two plans · 6 JUN 1992",
which suggests the agreement came on election day. Move the chapters forward:
noref → add `{"type":"chapter","text":"no referendum","atWord":"No"}` and set `"hideDate": true` (the date of the agreement is not in SOURCES);
poll → change its chapter to `{"type":"chapter","text":"what the polls said","atWord":"polls,"}`.

**[P1] hyphen · 9.45–12.24 s · 2.3 s with nothing new, and "the Velvet Revolution" still under 1990.** Fire on "fights":
```json
{"type":"chapter","text":"the Hyphen War","atWord":"fights"},
{"type":"pulse","ids":["CZE","SVK"],"atWord":"fights"},
{"type":"shake","amount":4,"atWord":"fights"},
{"type":"label","text":"Czechoslovak?","at":[15.3,49.8],"atWord":"First,","hold":2.2}
```
(Remove the old chapter on "hyphen", and move the old label from "hyphen" to "First,".)

**[P1] jan1 · 26.59–26.75 s · label collides with the 1 in 3 number; then 28.2–29.7 s has nothing new.** The label "midnight, 31 Dec 1992"
lands on top of the fading big number. After that, the reel waits 1.5 s for "ends.". Fix: give the poll bigNumber `"hold": 2.0`,
move the midnight label to `"atTime": 27.0, "hold": 1.5`, and add
`{"type":"label","text":"Czechoslovakia","at":[17.3,49.0],"atWord":"Czechoslovakia","hold":0.8}` so the name is on screen just before it breaks.

**[P2] noref · 21.08 s · the mid-reel cut does not show.** The `cut` camera is almost the same frame as `leaders`, at 46 %, which is the right place for a cut. Make it a real
new shot: a low view along the internal border.
`"camera":{"center":[17.6,48.95],"span":3.6,"pitch":28,"yaw":62,"cut":true}`. Then check that the NO REFERENDUM callout (y 980) stays clear.

**[P2] leaders · 13.8–20.8 s · 7 s of a single lavender slab.** The pulses are weak on a flat tint. Hint at the two halves with muted tints:
`{"type":"declare","id":"CZE","atWord":"Klaus","noLabel":true,"color":"#7FA6D9","quiet":true}` and the same for SVK at `"Mečiar"` with `"#D98A8E"`.
On Jan 1 the full colours and flags still give the payoff. The Bratislava marker is legible at 18.6 s, so no change there.

**[P2] poll · 24.35 s · "1 in 3" vs "about".** The voice hedges and the screen does not (36–37 %). Add `"prefix":"~"` and
`"label":"backed the split, on each side · Sept 1992 poll"`.

**[P2] velvet→hyphen · 9.45–9.9 s · lingering items.** The crowd, the "Wenceslas Square" caption and the "Czechoslovakia" label run 0.5 s into the 1990 beat.
Set crowd `"hold": 2.9` and label `"hold": 1.1`. Do the same in hyphen→leaders: label "Czechoslovak?" `"hold": 1.5` instead of running into "1992".

**[P3] SOURCES.md.** Add a line saying the Slovak side wanted the hyphenated form. The on-screen "Czechoslovak?"/"Czecho-Slovak?" split per half depends on it.
The declare date sub-labels "1 Jan 1993" under the flag names are below 28 px. They are decorative, but think about `"date"` being omitted on jan1.

## Checked and fine
- Safe area with guides: nothing readable above y 250, below 1440 or right of x 930 under 860 (only map slabs cross into the red zone).
  The captions band is clear. The only header-band collision is the tank caption (fixed above).
- Sync: Split/two labels (2.72/3.25), Velvet marker, Klaus/Mečiar markers, NO on "No", flags on "ends.", sticker on "flag." and on "keep" all land within ±0.2 s.
- Flag rule: Act 542/1992 Art. 3 and the Czech adoption of the old flag match SOURCES. Using the `cz` flag for "CZECHOSLOVAKIA" is correct (it is the same flag).
  The `sk` flag (with the arms) was adopted Sept 1992, so it is fine for 1993.
- Dates: 17 Nov 1989, 29 Mar 1990, 6 Jun 1992, 1 Jan 1993 and 24 Nov 1999 all match SOURCES. "Peacefully" and "2 : 1 · by population" are sourced. No cause is claimed.
- Loop: the last frame comes back to the frame-0 crane pose with the same colours. Frame 0 is striking (an object in a space, title, two slabs).
