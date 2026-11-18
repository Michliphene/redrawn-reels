# REVIEW — getaway-002-antwerp (THE GETAWAY · CASE 002 · the Antwerp diamond heist)

## Reel review — render 1

Inputs: `out/getaway-002-antwerp.mp4` (68.3 s, DA 2), 13 beat sheets in `out/review/getaway-002-antwerp/`, guide stills at
0 / 3.8 / 24.6 / 40.5 / 56.5 / 67.5 s (`out/stills/getaway-002-antwerp/sheet.jpg`). `npm run validate`: **ok, 0 ✗, 0 !**.
Metrics: −14.3 LUFS · loop SSIM 0.946 · 42 visual cues (6.1 / 10 s) · longest gaps 4.27 s (58.15), 3.48 s (9.15), 3.24 s (62.42).

**Verdict: not postable yet. 6.5/10** (CASE 001 render 1 was 6/10). The hook works: vault + diamonds + sandwich with
empty CAUGHT / NEVER FOUND boxes on frame 0, a number in the first word, and the split verdict pays it off. The loop is
the best we have shipped (last frame = frame 0 with the two crosses, and the diamonds gone). Safe area is clean on every
guide still. Facts on screen all match `SOURCES.md` (one date chip is misleading, #6). What holds it back:

1. **Overlays run into the next beat and collide, six times.** The known envelopes/sandwich tag clash (39.7–42.0 s)
   is only one of them: EXHIBIT A over the "Antwerp" marker (4.0 s), the tenant ticket over the vault (12.6 s), ARRESTED over
   the court ticket (47.9 s), the court ticket into the twist (51.0 s), the claim callout hiding the CAUGHT box (62.4 s).
   They all come from `hold` values that run past the beat end.
2. **The world is an empty beige plane from 12.6 s to the end.** At span 0.15–0.5 the map has no streets or buildings,
   and only the BE polygon. The vault, the loot, the court, the twist, the claim and the end all float on the same blank
   ground with no named place. "Two floors below" is never shown (the vault stands on the ground), and the `cut`s on
   vault/twist hardly register because the set doesn't change.
3. **Clarity slips in the last quarter.** "He says it was an insurance job" comes right after "one man, the King of
   Keys", so a new viewer hears that the King of Keys is making the claim. The NEVER IDENTIFIED stamp can't be read
   (cropped, multiply-blended on the black photo). The getaway car is a 40 px red blob on a red line.

## Fix list (beat · time · problem · fix)

1. **[P1] evidence · 39.7–42.0 s** · "EXHIBIT · HALF A SALAMI SANDWICH" sits on "ENVELOPES · DIAMOND CENTRE", and both
   tags last into `arrest`. Fix: hang the envelopes tag *below* its prop (negative `captionDy` = below, no leader), spread
   the props apart, and end both before the cut:
   ```json
   {"type":"prop","kind":"envelopes","at":[4.462,51.040],"size":170,"drop":true,"atWord":"Envelopes","hold":3.3,
    "caption":"ENVELOPES · DIAMOND CENTRE","captionDy":-60},
   {"type":"prop","kind":"sandwich","at":[4.489,51.035],"size":230,"drop":true,"atWord":"half","hold":1.6,
    "caption":"EXHIBIT · HALF A SALAMI SANDWICH","captionDy":110}
   ```
   Check at 40.5 s on a still. The tags are 0.6 s apart, so they need about 250 px of vertical separation.
2. **[P1] claim · 57.98 s** · "He says…" sounds like the King of Keys. The voice can't change without a re-record, so name
   him on screen, and fill the 4.27 s gap:
   ```json
   {"type":"callout","text":"NOTARBARTOLO: \"AN INSURANCE JOB\"","sub":"HIS CLAIM · WIRED, 2009 · \"~$20M\", HE SAYS",
    "atWord":"says","y":880,"size":56,"hold":3.9,"stamp":"NO PROOF","stampWord":"proof."},
   {"type":"label","text":"INVESTIGATORS","at":[4.418,51.235],"size":"md","atWord":"Investigators","hold":1.6}
   ```
   (`hold` 3.9 also clears the callout before `end` starts. Today it covers the CAUGHT box at 62.4 s, see #3.)
3. **[P1] end · 62.42 s** · The claim callout (58.15 + 4.4 s + fade) hides the CAUGHT box on "The men:", the very
   word that ticks it. Fixed by `hold: 3.9` in #2. Confirm the CAUGHT box is clear at 62.5 s.
4. **[P2] sentence · 47.9 s** · ARRESTED (hold 1.0 + fade-out) sits over the court ticket. Set `"hold": 0.7` on the
   ARRESTED callout, or start the ticket on `"years"` instead of `"Ten"` (48.2 s).
5. **[P2] office / vault / twist boundaries** · EXHIBIT A lands on the "Antwerp" marker at 4.0 s, the tenant ticket covers the
   vault at 12.6 s, and the court ticket runs into "But the diamonds?" at 51.0 s. Fix: hook EXHIBIT A `"hold": 0.6`;
   office ticket `"hold": 3.3`; sentence ticket `"hold": 2.8`. The heist label "100+ BOXES" also runs into `loot`
   (`"hold": 2.2`).
6. **[P2] office · 4.8 s** · The date chip reads **15 FEB 2003** while the voice says he "rents an office", but he had
   rented it for ~2 years (fact 6). Show the year only here and pin the day on the weekend:
   `office: {"type":"date","date":"2003","atWord":"2003."}` and in `heist`
   `{"type":"date","date":"2003-02-15","atWord":"weekend,"}` (keep 17 FEB on "Monday,").
7. **[P2] vault · 12.6–16.6 s** · "Two floors below" isn't shown, and no place is named. Put the building on the
   ground and the vault under it, with a named marker:
   ```json
   {"type":"prop","kind":"building","at":[4.418,51.2155],"size":200,"atWord":"Two","hold":3.8},
   {"type":"marker","text":"Diamond Centre · Antwerp","at":[4.418,51.2155],"atWord":"Two","hold":2.0}
   ```
   and give the vault camera a lower look so the building reads above it: `"pitch": 18, "yaw": -18, "cut": true`.
   If the building prop can't sit above the vault prop, describe it as a component change: `building` with
   `"cutaway": true` draws the facade plus two dashed floor slabs down to the vault's top edge.
8. **[P2] loot → end · 23–68 s** · No named place for 45 s. Add a quiet marker on each cut:
   `twist: {"type":"marker","text":"Antwerp","at":[4.418,51.2155],"atWord":"diamonds?","hold":2.0}`, plus the same on
   `claim` at `"He"`. Component (optional, CASE 003+): a `ground` layer for close-ups (street grid or the district
   block outline as ink lines). At span < 0.5, the BE fill alone reads as "nowhere".
9. **[P2] twist · 57.0 s** · The NEVER IDENTIFIED stamp is cropped ("VER IDENTIFI") and `mixBlendMode: multiply`
   makes red on the black photo invisible. Cue: `"stampSize": 30`. Component (`src/components/Wanted.tsx` l.54–57): when the
   stamp sits over the photo, drop `multiply` (use `normal` with 0.92 opacity) and anchor it over the name block, not the photo.
10. **[P2] owner / evidence / arrest · 33–42 s** · The red "17 FEB" mono date and the timeline ticks disappear on the
    light beige ground (the night pool is gone). Component: give the date line in the header a dark paper backing or
    shadow (`src/atlas/Header`), as already done for the year. Otherwise fold `night` (level 0.4) into `owner` and `evidence`.
11. **[P2] mistake · 30.8–33.4 s** · The car is about 40 px and red on the red route: it reads as a glitch. Cue:
    `"size": 150` on the vehicle and `"color": "#E6D9BC"` on the E19 path (or path color paper, car red).
    "Then, one mistake." (28.7–30.8 s) shows only the Antwerp dot for 2 s. Add
    `{"type":"label","text":"ONE MISTAKE","at":[4.418,51.17],"size":"md","atWord":"mistake.","hold":1.4}`.
12. **[P3] loot · 25.8 s** · The $100M+ count-up shows passing values ("$38M+") that aren't in SOURCES. Use
    `"from": 1` on the bigNumber (a static slam, keep the shake). The vault and diamonds also leave before the
    number settles (27.1 s), so the last second is an empty plane: vault `hold` 15.6 in `vault`, diamonds `"hold": 5.0`.
13. **[P3] owner · 35.5–37.4 s** · "He checks every bag": nothing changes but a shake. Make the landowner reach the bags:
    `"approach": [-130, 0]`, plus `{"type":"pulse","ids":["WOODS"],"atWord":"checks"}` (WOODS exists in the geojson).
14. **[P3] arrest · 45.7 s** · "walks back in": the building is 150 px with no figure. Use `"size": 220` and add
    `{"type":"units","kind":"crowd","at":[4.418,51.2155],"count":1,"size":44,"offset":[90,40],"approach":[-80,-20],
    "atWord":"walks","hold":1.3}`.
15. **[P3] type size** · The claim sub line (~21 px), ticket notes (~12 px) and the "THE CREW · SYMBOLIC" tag (~24 px) are under
    28 px. Notes are disclaimers and can stay small, but the claim sub carries the "~$20M" fact: bring it to 28 px (#2 moves
    "HIS CLAIM" into it).
16. **[P3] hook** · "A hundred million dollars **in diamonds**" while the estimate covers gold and jewels too (fact 9/10).
    The voice is already recorded and the whisper says "$100M+ (est.)", so this is acceptable. Log it in SOURCES "Debated points".

## Checks passed
- Safe area: nothing readable above y 250, below 1440, or right of x 930 under 860 on any guide still. The verdict notes end at x ≈ 760.
- Sync: every pinned action lands on its word (±0.1 s): EXHIBIT A, Turin/path, Monday date + vault opening, $100,
  E19 + car on "motorway", Brussels, bags on "dump", ARRESTED, stamps on "identified." / "proof.", picks on "caught." / "gone.".
- Accuracy: 2 floors, ~2 years, 100+ / COUNTS VARY, $100M+ EST., E19 / APPROX., 21 FEB = 5 days, 10 / 5 years ×3, 2005,
  Wired 2009 ~$20M, MOSTLY NEVER RECOVERED. All are in the facts table. Crew figures are labelled SYMBOLIC. The landowner is not named.
- Length 68.3 s, inside the channel's 62–72 s. The hook is 3.56 s (0.06 s over the 3.5 s target, fine).

After fixes #1–#11, the expected score is 8/10. Re-run `review_frames.py` and look at 4.0, 12.6, 40.5, 47.9, 51.0, 57.4 and 62.5 s.

## Virality review — render 1

Inputs: `out/getaway-002-antwerp.mp4` (68.3 s, DA 2, voice 67.7 s), `pipeline/virality_metrics.py` (hook frames 0–3 s +
loop image), the 13 beat sheets + `cues.md` (`out/review/getaway-002-antwerp/`), `episode.json`, `SOURCES.md` (incl. the
case-selection notes), `timings.json`, channel bible. This is an estimate based on patterns, not a prediction. Account size
is the biggest factor and we can't control it. The channel is two episodes old, so the cold-start cohort test decides
everything: second 1, completion, rewatch, sends.

Metrics: 157 words · 2.44 w/s · first word 0.25 s · hook 3.56 s ("$100 million in diamonds. Undone by a sandwich.") ·
42 visual cues = 6.1 per 10 s (CASE 001: 5.8) · 6/34 two-second windows without a cue, almost all covered by camera
travel · longest gaps: 4.27 s at 58.2 s (claim callout; the NO PROOF stamp lands inside it), 3.48 s at 9.2 s (the ticket
is typing), 3.24 s at 62.4 s (verdict; ticks land on "caught." / "gone.") · 1 pixel-level cut · loop SSIM **0.946**
(CASE 001: 0.906) · −14.3 LUFS.

### Scorecard
| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | 22/25 | Frame 0, paused and muted: noir desk, open red-lined vault wall, diamonds, sandwich, "UNDONE BY A SANDWICH" + whisper "$100M+ (est.)", empty CAUGHT / NEVER FOUND boxes. It works, but the hero object, the sandwich, is small (≈ 150 px wide) and half hidden by the vault's lower-left corner, and the bottom 45 % of the frame is empty dark (6/8). Sentence 1 has a number and a contradiction, both concrete (7/7). Place: "Antwerp" is in the whisper from frame 0, but nothing on the map reads as a place until the marker at 4.0 s. The red serif whisper also loses contrast where it crosses the beige table from ~1 s (4/5). Text: 4-word title + whisper (3/3). No throat-clearing (2/2). |
| B. Retention | 20/25 | A camera move per beat plus 6.1 cues per 10 s. Still, two payoff moments sit on an **empty table**: "$100M+" at 26–28 s (the vault and diamonds expire at 27.1 / 27.5 s) and "MOSTLY NEVER RECOVERED" at 53–55 s (diamonds sink, nothing left) (6/8). Strong but/therefore chain: cover → vault → heist → loot → *but* one mistake → landowner → sandwich → arrest → sentence → *but* the diamonds? → King of Keys → his claim → split verdict. Arrest + sentence briefly plateau as "resolution" (5/6). Re-hook "Then, one mistake." with a cut at 28.7 s (42 %), a second cut at 51 s ("But the diamonds?") (4/4). The title promise, the sandwich, pays at 39.7 s as a 230-px prop whose evidence tag stacks on the envelopes tag (3/4). 2.44 w/s is under the band. The deadpan earns some of it, but 68 s is long for Reels/Shorts (2/3). |
| C. Rewatch & loop | 9/10 | "…So, caught, or not?" → "$100 million in diamonds. Undone by a sandwich." The question gets an answer, but "undone" implies "caught", while the reel's own answer is split, so the loop closes at about 80 % (4/5). SSIM 0.946, and the only difference is the ticks: the loop *asks* then *answers* (3/3). Typed tickets, the struck "a diamond trader", the split verdict: worth a pause (2/2). |
| D. Shareability & saves | 13/15 | A top-tier send fact: a $100M+ heist undone by **half a salami sandwich** a landowner found in his litter, plus "the King of Keys was never identified", plus the Netflix doc (Aug 2025) driving searches (6/6). Save value: series of 2, case-file look (2/4). Comment trigger: the split verdict makes "caught or not?" a genuine question, and "his claim: insurance job / no proof" invites debate without rage-bait (3/3). Human stake: the fed-up landowner is the most relatable character the channel has had (2/2). |
| E. Packaging | 8/10 | Frame 0 / last frame work as a thumbnail (big 4-word title + vault), but the sandwich, the thing the title names, is too small to read at grid size (3/4). Caption written below (3/3). "THE GETAWAY · CASE 002" tab is small, but the title/verdict-box system now reads as a format (2/3). |
| F. Niche codes & trust | 12/15 | Visible transformation: the vault wall opens, the car drives the E19, the bags drop, the diamonds sink, the boxes get ticked (4/4). Anchors: $100M, a sandwich everybody knows, but no US/UK reference point and the record ("largest diamond heist", Guinness, row 11) is kept off screen (2/3). No face (none in the public domain, correct); the stakes come from the landowner pawn and the empty King of Keys poster (2/3). Hedging is excellent: EST., COUNTS VARY, APPROX., SYMBOLIC, "reconstruction" notes, HIS CLAIM / NO PROOF (3/3). Small anti-patterns: floating ARRESTED / HIS CLAIM boxes where the world could carry them, "EXHIBIT A" bleeding onto the Antwerp marker at 4.0 s, ARRESTED bleeding over the court ticket at 47.9 s, and the counter showing an unsourced "$38M+" for a few frames while it rolls up (1/2). |
| **TOTAL** | **84/100 = 8.4/10** | **Tier: can break out** (top of the band; CASE 001 = 80) |

Trust note (no change required): the voice says "$100 million **in diamonds**", but the take was diamonds, gold and
jewels, "over $100M", an estimate (rows 9–10). The whisper ("$100M+ (est.)") and the loot beat ("by most estimates",
"ESTIMATE · DIAMONDS, GOLD, JEWELS") hedge it on screen, and Guinness files it as the largest *diamond* heist, so I would
keep it. If the voice is ever re-recorded, "Over a hundred million dollars in diamonds" is safer.

### Top 5 changes, ranked by expected gain (all cue-only; no new voice line)
1. **Make the sandwich the hero on frame 0, and again at the payoff (+3: A frame 0, B payoff, E cover).** The title names
   the sandwich, so it must be the first object the eye lands on, in front of the vault, not under its corner. In `hook`
   **and** `end` (same values in both, to keep the loop SSIM):
   ```json
   {"type":"prop","kind":"sandwich","at":[4.392,51.186],"size":270,"drop":false,"hold":3.9,"atTime":0}
   {"type":"prop","kind":"diamonds","at":[4.444,51.192],"size":220,"atTime":0,"hold":3.9}
   ```
   (in `end`: keep `"atWord":"The"` / `"atWord":"So…"`, `"hold"` and `"sinkWord":"gone."` as now; only `at`/`size` change.)
   Move "EXHIBIT A" under the new spot and stop it leaking into `office`: `"at":[4.392,51.176],"hold":0.7`.
   In `evidence`, give the sandwich the whole stage and stop the two evidence tags stacking:
   ```json
   {"type":"prop","kind":"envelopes", ..., "hold":2.0}
   {"type":"prop","kind":"sandwich","at":[4.48,51.036],"size":330,"drop":true,"atWord":"half","hold":3.0,
    "caption":"EXHIBIT · HALF A SALAMI SANDWICH","captionDy":120}
   ```
   Check on a `--props '{"guides":true}'` still that the tag stays left of x = 930.
2. **Put the record on screen (+2: D send trigger, F anchor, A payload).** "The largest diamond heist on record" is the
   sentence people repeat when they share this. It is row 11 of the facts table (Guinness WR), and today it appears only in the
   pinned comment. Use it as the label under the big number, with the estimate tag kept:
   ```json
   {"type":"bigNumber","value":100,"prefix":"$","suffix":"M+","label":"EST. · GUINNESS: LARGEST DIAMOND HEIST",
    "atWord":"$100","y":1000,"dur":0.5,"hold":2.4}
   ```
   **Owner decision:** row 11 says "used only in the pinned comment". Showing it on screen is sourced but changes that
   note, so update the row if you accept this.
3. **No empty table under a payoff (+2: B new-visual, F in-world).** Keep the open vault and the diamonds standing under
   "$100M+", and leave the open vault under "MOSTLY NEVER RECOVERED" once the diamonds have sunk:
   ```json
   // vault beat: vault prop
   "hold": 15.8
   // loot beat: diamonds prop
   "hold": 5.1
   // twist beat: add, before the diamonds prop
   {"type":"prop","kind":"vault","at":[4.418,51.2155],"size":400,"openStart":0.62,"atWord":"diamonds?","hold":4.2}
   ```
   (15.8 s from 12.63 s ends at 28.4 s, the end of `loot`, so nothing pinned to Antwerp crosses the cut into `mistake`.)
4. **Motion on the re-hook word itself (+1: B retention at 42 %).** From 28.7 to 30.8 s the re-hook shows a dark map with
   one dot. Start the car and the E19 on "mistake.":
   ```json
   {"type":"path", ..., "atWord":"mistake.","dur":2.2,"hold":4.4}
   {"type":"vehicle","kind":"car", ..., "atWord":"mistake.","dur":3.0,"hold":4.0}
   ```
   (The E19 label stays; the route is still drawn as the motorway corridor, never a documented track.)
5. **Clean-ups that protect trust (+1: F anti-patterns).** (a) The counter rolls through unsourced values ("$38M+" seen at
   26 s): `"dur": 0` on the bigNumber, or just let it land in place if the component allows. (b) ARRESTED callout:
   `"hold": 0.7` so it is gone before the court ticket types at 47.9 s. (c) The whisper's red serif crosses the beige table
   from ~1 s, so hold the hook camera a little higher (`"pitch": 44`, same in `end`) to keep the dark band behind it, and check it
   on a still.

Expected after 1–5: about 89/100 (A 24, B 23, D 14, E 9, F 14), which would be strong breakout odds on the packaging side.

### 3 alternative hooks (all inside SOURCES.md)
1. **Record + contradiction** (needs a new voice line). Voice: "The largest diamond heist on record. Undone by half a salami sandwich."
   Frame 0: the same set with the sandwich up front, big. On-screen text: **LARGEST DIAMOND HEIST · GUINNESS**.
2. **Split verdict / question** (new voice line). Voice: "Four men went to prison. Most of the diamonds were never found."
   Frame 0: the vault with both verdict boxes empty, the diamonds already sinking. On-screen text: **CAUGHT… OR NOT?**
   (Loop: it ends on "So… caught, or not?", a perfect seam.)
3. **Human stake / in-media-res** (new voice line). Voice: "Over a hundred safe-deposit boxes, emptied. Then a man who hates litter checks his woods."
   Frame 0: the night pool on the trash bags by the E19, the landowner pawn walking in. On-screen text: **CAUGHT BY LITTER**.
(Rejected: second-person "you beat the vault", which reads as glorification, as SOURCES already notes.)

### Cover frame
Frame 0 after change 1 (title + vault + a big sandwich in front + empty CAUGHT / NEVER FOUND boxes): it asks the
question. Second choice: 67.3 s, both boxes ticked with THE MEN / THE DIAMONDS, which spoils the answer, so use it only for Shorts,
where the cover matters less. Both sit inside a 3:4 grid crop (y 240–1680).

### Caption
> $100M+ in diamonds. Undone by half a salami sandwich.
>
> The 2003 Antwerp diamond heist: Leonardo Notarbartolo, the Diamond Centre vault, and the trash by the E19 that led police to the crew.
> The men were caught. Most of the diamonds never were, and the "King of Keys" was never identified. (Netflix: Stolen: Heist of the Century)

Hashtags: `#heist #truecrime #diamondheist #antwerp`

YouTube title: **The $100M+ Diamond Heist Undone by a Sandwich (Antwerp, 2003)**

Pinned comment: keep the SOURCES.md text, and open it with the question:
"The men were caught. The diamonds weren't. Does that count as caught? Sources below."

### Platform notes
- **TikTok**: post the 68 s cut as is (> 60 s for Creator Rewards). On-screen title already does the search work; put
  "Antwerp diamond heist" in the first caption line too (TikTok search reads the caption). Frame 0 is the hook; no cover text.
- **Instagram Reels**: sends per reach are the lever, and the sandwich is the send. 68 s costs watch-time %. If the owner
  wants a Reels-specific edit, a ~50 s cut (drop `vault`, shorten `office` to "Antwerp, 2003. An Italian rents an office
  in the Diamond Centre.") needs a new voice take, so it is a separate edit, not a speed-up. Keep the sentence beat (the cost, channel rule).
  Choose the cover from frame 0 in the app; the grid crop keeps the title.
- **YouTube Shorts**: "viewed vs swiped away" is decided by 0.25 s, so "$100" on the first word is right. Use the title above
  (a search phrase, not the reel's title alone). Length is fine (< 3 min). Link CASE 001 as the related video for series follow-through.

## Virality review — final render

Inputs: `out/getaway-002-antwerp.mp4` (69.1 s), `pipeline/virality_metrics.py`, loop image, spot frames at 27.0 / 30.2 /
40.6 / 54.0 / 60.5 s. This is an estimate based on patterns, not a prediction. Account size is still the biggest factor, and
we can't control it.

Metrics: 157 words · 2.40 w/s · first word 0.25 s · hook 3.6 s · 43 cues = 6.2 per 10 s · 5/35 two-second windows
without a cue · longest gaps 3.77 s at 9.0 s (the ticket is typing), 3.25 s at 62.9 s (verdict ticks), 3.0 s at 48.1 s ·
loop SSIM 0.912 (lower than render 1 because the sandwich now sits in front of the diamonds that sink at the end; still
well above 0.85) · −14.7 LUFS.

| Block | Pts | Reason |
|---|---|---|
| A. Hook 0–3 s | 23/25 | The sandwich now leads frame 0, large and in front of the vault, with the title naming it: the frame reads paused and muted (7/8). Number + contradiction in sentence 1 (7/7). Antwerp is still named only by the whisper, with no place on the map before 4 s (4/5). Text 3/3, no throat-clearing 2/2. |
| B. Retention | 22/25 | No more empty table: vault + diamonds under "$100M+", open vault under "MOSTLY NEVER RECOVERED". The car and E19 move on "mistake." No gap over 3.8 s (7/8). Clear but/therefore chain; arrest → sentence is still a short plateau (5/6). Two cuts as re-hooks (4/4). The sandwich payoff at 40 s is big, with separated tags (4/4). 2.40 w/s and 69 s: deadpan, but long for Reels/Shorts (2/3). |
| C. Rewatch & loop | 9/10 | "…caught, or not?" → "$100 million… undone by a sandwich." The question is answered, but only on the "caught" side (4/5). SSIM 0.912 (3/3). The tickets and split verdict are worth a pause (2/2). |
| D. Shareability & saves | 13/15 | Sandwich + "largest diamond heist" (now on screen, Guinness) + King of Keys never identified: an easy send (6/6). Series of 2 (2/4). The split verdict is an honest comment question (3/3). The landowner is the human stake (2/2). |
| E. Packaging | 9/10 | Frame 0 is now a real thumbnail: 4-word title + a sandwich you can read at grid size + vault (4/4). Caption is written (3/3). The CASE 002 tab is still small (2/3). |
| F. Niche codes & trust | 13/15 | Transformation is visible all the way through (4/4). Anchors: the Guinness record + a sandwich everyone knows (3/3). No face, correct, since none is public domain (2/3). EST. / COUNTS VARY / APPROX. / SYMBOLIC / INVESTIGATORS, and the counter no longer rolls through unsourced values (3/3). One floating widget left: the HIS CLAIM box, where the world could carry it (1/2). |
| **TOTAL** | **89/100 = 8.9/10** | **Tier: strong breakout odds** (render 1: 84; CASE 001: 80) |

### Remaining top 3 ideas
1. **Name the place on the set at frame 0 (+1, A).** Hang a typed evidence tag on the vault in `hook` **and** `end`
   (same values, so the loop holds): `"caption": "ANTWERP DIAMOND CENTRE", "captionDy": 100` on the vault prop.
   Row 2 of the facts table supports it. Check that it doesn't collide with the CAUGHT / NEVER FOUND boxes.
2. **Put the claim in the world (+1, F).** Replace the black HIS CLAIM callout with the channel's typed document, keeping
   the claim as a claim (no strike-through, because "no proof" is not "proven false"):
   ```json
   {"type":"ticket","head":"His claim","sub":"Wired · 2009 · his account","rows":[["SAYS","INSURANCE JOB"],["HIS FIGURE","~$20M"],
    ["INVESTIGATORS","NO PROOF"]],"note":"His own account, as told to Wired. Not supported by investigators.","atWord":"says","hold":3.6,"y":620,"cps":44}
   ```
3. **A separate ~50 s cut for Reels/Shorts (+1–2 on those platforms, needs a new voice take).** Keep the 69 s master for
   TikTok (> 60 s). For Reels/Shorts, drop `vault` and tighten `office`; keep `sentence` (the cost, a channel rule) and
   `claim` (the comment trigger). Pin "CASE 001: D.B. Cooper" in the comments for series saves; don't add an end card
   (it would break the loop).

## Final render — what was applied (18 Nov 2026)
Render 1 → reel review (6.5/10) + virality review (84/100) → fixes → render 2 → virality re-score (89/100) → its ideas 1–2 → **final render**
(`out/getaway-002-antwerp.mp4`, 69.1 s, −14.7 LUFS, loop SSIM 0.913, 6.2 cues / 10 s, no gap over 3.8 s).
- Reel review fixes 1–14 applied: tag collisions (holds trimmed so no overlay crosses into the next beat), claim line re-recorded
  as "Notarbartolo says it was an insurance job. Investigators say: no proof." (the voice is new; all cues follow by word),
  "two floors below" shown (the building sinks as the vault rises), dates (year only in `office`, 15 FEB on "weekend,"),
  Antwerp named on each cut, NEVER IDENTIFIED stamp readable over an empty photo frame (`Wanted.tsx`: no multiply blend
  without an image), soft night in `owner` / `evidence` (date line readable), bigger car, paper-coloured E19, landowner
  walks to the bags, a figure walks into the building. Not applied: a `ground` street layer for close shots (kit idea for CASE 003).
- Virality top 5 applied (sandwich hero in `hook` + `end`, Guinness label on the $100M+ estimate, no empty table under the payoffs,
  motion on "mistake.", static counter), then ideas 1–2 of the re-score: "ANTWERP DIAMOND CENTRE" tag on the vault in frame 0
  and the last frame, and the claim as a typed document ("His claim · his account · investigators: no proof", no strike-through).
- Not done: a ~50 s Reels/Shorts cut (needs a new voice take; the 69 s master is the TikTok cut).
Projected virality after the last two changes: ≈ 90–91/100 (not re-scored).

## Owner checklist before posting
- [ ] Listen once: "Notarbartolo" (×3), "Antwerp", "safe-deposit".
- [ ] Tick the ⚠ lines of SOURCES.md against the linked pages (Wikipedia, Guinness, Expatica 2005 for the sentences and their year).
- [ ] OK the Guinness "largest diamond heist" label on screen (row 11).
