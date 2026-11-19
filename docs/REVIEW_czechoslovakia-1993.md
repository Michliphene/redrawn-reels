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

---

# Virality — czechoslovakia-1993 (REDRAWN EP 7, DA 2) · pass 1

Final render `out/czechoslovakia-1993.mp4` (45.8 s), checked after the P0/P1/P2 fixes above. Evidence: `pipeline/virality_metrics.py`
(hook frames 0–3 s, loop image), 12 beat sheets and `cues.md` regenerated from the final render, `episode.json`, `SOURCES.md`.
Metrics: 106 words, 2.52 w/s, first word 0.25 s, hook sentence 4.41 s, 40 cues = **8.7 cues/10 s**, longest gaps
2.62 s (17.87 s, leaders), 2.47 s (0.25 s, hook), 2.32 s (32.98 s, share); 1 of 23 two-second windows without a cue;
**loop SSIM 0.895**; −14.4 LUFS. The `say` is locked (voice recorded), so every fix below is cue sheet, title or packaging only.
*This is a pattern-based estimate, not a prediction. The account's size and history are the biggest factor, and we can't control it.*

## Scorecard
| Block | Pts | Why |
|---|---|---|
| A. Hook 0–3 s | **21/25** | Frame 0 has depth: a low crane over two extruded slabs, blue and red, under a 6-word title. It works paused and muted (7/8), but the Slovak slab runs off the right edge and no place name shows on frame 0. Sentence 1 opens on a number ("15 million"). The stake ("nobody asked them") only lands at 3.9–4.4 s, past the 3 s gate (5/7). The whisper "Czechoslovakia, 1993" is on screen by 0.5 s, but it is a small serif line, and the country labels only arrive at 2.7 s (4/5). Title is 6 words and matches the voice (3/3). No throat-clearing (2/2). |
| B. Retention | **22/25** | 8.7 cues/10 s, longest gap 2.62 s, and the camera moves on every beat (7/8). There is a but/therefore spine: revolution → fights → two winners → no referendum → only 1 in 3 wanted it → split → rule → broken rule. The share/gold stretch (31–37 s) plateaus into a list (5/6). The mid-video re-hook is right: a real cut at 21.1 s (46 %) with the NEVER ASKED stamp (4/4). The hook's promise is paid at 22–26 s and the flag twist sits at 40 s, so not buried. But the twist is not set up in the hook (3/4). Pace is 2.52 w/s with word-by-word captions (3/3). |
| C. Rewatch & loop | **9/10** | "All decided for…" → "15 million people." is a grammatical loop (5/5). SSIM 0.895, the same crane pose and colours (3/3). Frames are moderately dense (timeline, Act number, poll label) but not a map you pause to study (1/2). |
| D. Shareability & saves | **11/15** | Strong send fact: *the flag both sides promised to drop is the Czech flag today*. Second: *no referendum, only ~1 in 3 wanted it* (5/6). Save value is low: no reference map, only the series (2/4). Honest comment trigger: the referendum question, plus Czech/Slovak identity (3/3). The human stake is real but abstract, with no face or voice of a citizen (1/2). |
| E. Packaging | **9/10** | Frame 0 / the 1.6 s frame works as a cover: big shapes plus a 6-word title. But the place name is small and Slovakia is cropped on frame 0 (3/4). Caption written below (3/3). REDRAWN · EP 7 badge and series look (3/3). |
| F. Niche codes & trust | **11/15** | One visible transformation: two colours → one lavender country → two flagged countries (4/4). No US/UK scale anchor, only "15 million" (1/3). No faces: two named leaders, with the stake carried by the poll (2/3). Hedged and sourced on screen: "~1 in 3", month-only poll date, Act 542/1992 Art. 3, "4.1 t · protocol 24 Nov 1999" (3/3). Minor anti-patterns: the "midnight, 31 Dec 1992" label is barely readable over the seam at 27–28 s, and "what the polls said" still sits under the 1 JAN 1993 header until 29.7 s (1/2). |
| **TOTAL** | **83/100 → 8.3/10** | **Tier: can break out** |

## Top 5 changes, ranked by expected gain (no `say` change; every `atWord` exists in both forms of any `{a|b}` token)
1. **+2 · Name the one country in the hook (A place, F transformation).** On "One country." the viewer sees two colours and no name.
   Put the old name on the seam until "Split", when the two new names take over:
   ```json
   {"type":"label","text":"Czechoslovakia","at":[17.3,49.0],"atWord":"One","hold":0.9}
   ```
   (hook beat; "One" is at 1.79 s and the label ends at 2.69 s, before "Czech Republic" at 2.72 s). The place is then named in big type before 2 s,
   and "one → two" can be read with the sound off.
2. **+2 · Show the two plans (B escalation and the 2.6 s gap at 17.9–20.5 s).** "Their plans don't fit" is said but never shown.
   SOURCES backs it: *Klaus: a tight federation or none; Mečiar: a looser union*. Add to `leaders`:
   ```json
   {"type":"label","text":"tight federation, or none","at":[15.3,49.9],"atWord":"Their","hold":1.0},
   {"type":"label","text":"looser union","at":[19.6,48.9],"atWord":"plans","hold":0.8}
   ```
   Both labels end before the noref cut (21.08 s). The Prague marker is gone by 19.06 s, and the Bratislava marker (until 20.47 s) sits west of the Slovak label.
   Check the overlap on a still.
3. **+1 · Fix the whisper lag and the faint midnight label in `jan1` (F anti-patterns).** "what the polls said" sits under 1 JAN 1993 for 3 s.
   Move the chapter to the first word ("January" is in both forms of `{January 1, 1993|January first, …}`), and give the midnight label
   a full-opacity window:
   ```json
   {"type":"chapter","text":"the Velvet Divorce","atWord":"January"},
   {"type":"label","text":"midnight, 31 Dec 1992","at":[17.3,49.0],"atWord":"January","hold":2.0}
   ```
   (replace the existing chapter on "ends." and the `atTime: 27.0` label. The "Czechoslovakia" label at 28.83 s still follows cleanly.)
4. **+2 (conditional) · Add a US/UK scale anchor (F).** Czechoslovakia covered about 127,900 km² (≈ 49,400 sq mi), close to England's
   130,279 km². **This is NOT in SOURCES.md yet.** Add it with a source (Britannica, Czechoslovakia; ONS, England area) before using it. If it is sourced:
   velvet label `{"type":"label","text":"Czechoslovakia · about England's size","at":[17.3,49.0],"atWord":"Czechoslovakia.","hold":1.1}`.
   If it cannot be sourced cleanly, skip it. Virality does not justify an unsourced comparison.
5. **+1 · Cover and thumb (E cover).** Add the `thumb` block below so the cover names the place, keeps both slabs whole and carries the strongest
   number. In the TikTok/Reels cover picker, use 1.6 s (title + whisper + both slabs + "15 MILLION PEOPLE").
   ```json
   "thumb": {
     "kicker": "Czechoslovakia, 1993",
     "main": "Nobody asked them",
     "mainSize": 150,
     "mainSizeV": 150,
     "badge": "~1 in 3",
     "badgeSub": "backed the split · 1992 poll",
     "fit": ["CZE", "SVK"]
   }
   ```
   (`main` is 17 characters; the badge copies the on-screen hedge "~" and the poll label.)

Minor, if there is time: in `share`, add `{"type":"pulse","ids":["CZE","SVK"],"atWord":"trains."}` so the 2.3 s after "tanks," gets a beat.
Projected after 1–3 and 5: about 87/100. With 4 as well: about 89. These are estimates, not promises.

## 3 alternative hooks (for a re-cut or remaster only: they need a new voice line; all true per SOURCES)
| Archetype | Verbal line | Frame-0 visual | On-screen text |
|---|---|---|---|
| Contradiction | "Both sides promised to drop this flag. One side kept it." | Crane on the two slabs; the `cz` flag sticker already standing on the Czech slab | THE FLAG THEY PROMISED TO DROP |
| Big number | "Only about one in three wanted this split. It happened anyway." | The lavender single country, a seam glowing, "~1 in 3" pinned over it | ONLY ~1 IN 3 WANTED THIS |
| Question | "Why does Czechia still fly Czechoslovakia's flag?" | Close shot on the Czech slab with the flag; Slovakia red in the background | WHOSE FLAG IS THIS? |
Title-only A/B you can use now, with no voice change: `"title": "Only ~1 in 3 wanted this"`. It is accurate, but it moves the promise away from the spoken
"nobody asked them". Keep the current title as the main version.

## Cover, caption, hashtags, pinned comment
- **Cover:** 1.6 s in-reel (title, whisper, both slabs whole, "15 MILLION PEOPLE"), or the `Thumb` render above. Cover text: **NOBODY ASKED THEM**.
- **Caption (IG / TikTok / YT Shorts):**
  > 15 million people, one country, split in two — and nobody asked them. No referendum, ever.
  > How Czechoslovakia split into the Czech Republic (Czechia) and Slovakia on January 1, 1993: the Velvet Divorce.
  > Velvet Revolution 1989, Václav Klaus, Vladimír Mečiar, the Hyphen War, and the flag both sides agreed to drop.
- **Hashtags (4):** #history #czechoslovakia #maps #europe
- **Pinned comment:** use the SOURCES.md text, with the question as its own line and no emoji:
  "Sources: Constitutional Acts 541 and 542/1992; Britannica; Czech National Bank (gold, 1999); Sept 1992 poll (36–37 % for the split,
  sources differ on which side had which). No referendum was ever held. The Czech Republic adopted the Czechoslovak flag in 1993 despite
  Art. 3 of Act 542/1992. Czechs and Slovaks: should there have been a referendum?"

## Platform notes
- **TikTok:** 45.8 s is in the completion sweet spot. Don't stretch it. A Creator Rewards cut (61–70 s) is a different edit with new lines (e.g. the
  gold logistics, the 1992 Federal Assembly vote), not this one. Pick the 1.6 s cover and add "NOBODY ASKED THEM" as cover text. The search
  keywords are in the caption ("Czechoslovakia split", "Velvet Divorce").
- **Instagram Reels:** sends drive non-follower reach, so the first caption line should be the sendable fact. The cover must survive the 3:4 grid crop:
  the vertical Thumb keeps everything inside y 240–1680. No watermark from TikTok; upload the clean master.
- **YouTube Shorts:** the "viewed vs swiped" metric lives in second 1, so fix 1 (the name on screen before 2 s) matters most here.
  Shorts title = "The split nobody was asked about — Czechoslovakia 1993". The loop works well on Shorts autoplay.

VIRALITY SCORE: 83/100 (8.3/10) — can break out
