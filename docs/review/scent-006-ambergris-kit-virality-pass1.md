# SILLAGE N°6 "It was never whale vomit" (ambergris), KIT v3 build, virality pass 1

Video: `raea/sillage-006-ambergris-v2/out/sillage.mp4` (65.73 s, 1080×1920, 30 fps, shared kit `raea/sillage-kit`, content
`raea/sillage-006-ambergris-v2/compositions/reel.json`). Voice, timings and script are the same as the first build
(`public/episodes/scent-006-ambergris/`, 65.2 s). Facts: `public/episodes/scent-006-ambergris/SOURCES.md`.
Evidence: `raea/sillage-006-ambergris-v2/out/virality/` (hook_0.0–3.0s.jpg, sheet_1fps.jpg = 66 frames at 1 fps,
beat_*.jpg + sheet_beats_A/B.jpg, loop_first_vs_last.jpg). Earlier pass: `docs/review/scent-006-ambergris-virality-pass1.md` (76/100).

This is a pattern-based estimate, not a prediction. The biggest factor, the account's size and history, is outside our control.

## Objective metrics
| Metric | Value | Read |
|---|---|---|
| Duration | 65.7 s | over 60 s (Creator Rewards, playbook §9) |
| Words / pace | ~187 words, 3.0 w/s | top of the band, OK |
| First word | 0.25 s | no throat-clearing |
| Shot changes (ffmpeg scene > 0.08) | 4.1 · 6.6 · 8.8 · 12.3 · 16.8 · 19.1 · 21.8 · 26.9 · 33.4 · 40.7 · 49.2 · 54.3 · 57.1 · 62.2 | 15 shots, mean 4.4 s. Text reveals fill most gaps to ≤ 3 s |
| Longest holds | history 40.7–49.2 (8.5 s, static plate, 4 small reveals) · molecule 33.4–40.7 (7.3 s, push-in + fill) · sea 26.9–33.4 (6.5 s, KB + text swap at 31.4) · rare 21.8–26.9 (5.1 s, orbit) | |
| Hook hold | **0–4.1 s** (was 6.6 s) | fixed |
| Loop SSIM first vs last | **0.989** | near-identical, and the last line leads into line 1 |
| raea check | 0 errors · 56 reading warns · safe areas, contrast, clipping, loudness (−13.7 LUFS, TP −1.5) pass | most warns = the last word of a caption page leaving 0.6–0.8 s after it lands |

## What changed vs. the first build, and the status of its top 5 fixes
| Old fix | Status | What I see |
|---|---|---|
| 1. Break the 6.6 s hook hold, cut to the lump | **Done** | Cut at 4.1 s on "It sold" to a photoreal lump plate, `$1.5M` at stat size (196 px). Frame 0 boat is larger and sharper than the old painting. |
| 2. US-law open loop after the bust | **Not done** | Script unchanged (voice fixed), and nothing on screen points forward after 8 s. This is still the biggest gap. |
| 3. 280 lb anchor + hold the calculation label | **Done** | `280 LB · YEMEN, 2021` from frame 0 (it also puts the place on screen at 0 s). `OUR CALCULATION` is now on screen 54.6–57.1 s (2.5 s). **New problem:** the whisper "a gram · $1.5M ÷ 127 kg" appears 1.3 s *before* `$12`, so it reads "a gram ·" with no number. |
| 4. Readable fill + "mostly" + "main smell" on screen | **Partly** | "it mostly leaves / the other way" and "the main smell" are on screen (hedges now match SOURCES rows 2 and 8). The fill still renders pale cream behind the glass (`juice #A88B4E`) and reads as "lit" more than "filled" at thumbnail size. |
| 5. History as objects + natural-vs-lab frame, caption orphans | **Partly** | Kit captions never end on a link word (orphans fixed). History is still an 8.5 s still plate with four small whispers. There is no natural-vs-lab frame. |

**Regressions from the port to the kit:**
- **"1 in 100" lost its picture.** The first build showed 100 pearls with one lit. Now it's text over the empty SILLAGE bottle, which costs the scale anchor and the best pause frame.
- **The myth bust lost its subject.** "Never vomit." plays over an empty generic perfume bottle. The old build showed the lump next to the flacon with "WHALE VOMIT" struck through. The bottle is the series prop, but at the moment of the bust it says nothing about whales.
- The flacon carries five shots (myth, name, rare, molecule, law), but it is only data in one of them (the fill).

## 1. Scorecard
| Block | Pts | Reason |
|---|---|---|
| **A. Hook 0–3 s** | **23/25** | |
| frame 0 paused+muted | 6/8 | "127 kg of whale vomit?" is huge, gold on "vomit?", and sits over a real-looking boat on a sea (an object in a space, DA 2 OK). The subject (the lump) is not on frame 0, and the bottom 40 % of the frame is empty dark. |
| payload in sentence 1 | 7/7 | 127 kilos, $1.5 million, and a word ("vomit") that the next line contradicts |
| place & subject < 1.5 s | 5/5 | "Yemen" is on screen at frame 0 (label) and spoken at 0.95 s |
| on-screen text ≤7 words | 3/3 | 5-word title + short label, same as the voice |
| no throat-clearing | 2/2 | voice at 0.25 s, small badge |
| **B. Retention** | **18/25** | |
| new visual ≤2.5 s | 6/8 | Hook hold down from 6.6 to 4.1 s, and plates have Ken Burns. The history plate holds 8.5 s with only small whispers changing, and the molecule push-in holds 7.3 s. |
| escalation / but-therefore | 4/6 | Good connectives ("One problem", "The secret", "So", "But"). History (40–49 s) is still "and then", and $12/g deflates the price. |
| mid-video re-hook | 3/4 | "The secret is chemistry" at 51 % + fill on "ambroxide". The fill is pale. |
| payoff not buried | 3/4 | The bust lands at 8 s, and after that nothing on screen promises the US-law twist at 75 % |
| pace & captions | 2/3 | 3.0 w/s. Clean kit captions, no link-word endings. 56 reading warns: pages clear 0.6–0.8 s after their last word ("vomit.", "amber.", "plant."). |
| **C. Rewatch & loop** | **9/10** | |
| last line completes first | 5/5 | "But the headlines never change. They still say:" → "Fishermen in Yemen found 127 kilos of whale vomit." |
| last ≈ first frame | 3/3 | SSIM 0.989 |
| pause-worthy frames | 1/2 | The squid beaks and the history still life are rich. The pearl grid is gone, and most flacon frames are one line over an empty bottle. |
| **D. Shareability & saves** | **10/15** | |
| send-to-a-friend fact | 5/6 | "Whale vomit is really whale dung" is a strong gross-out myth bust. It's partly known already. |
| save value | 2/4 | Series number only, no reference frame |
| honest comment trigger | 2/3 | US-illegal vs UK/EU-legal is debatable, but nothing invites the comment |
| emotional / human stake | 1/2 | The fishermen's windfall is spoken but not shown. There is no "you". |
| **E. Packaging** | **9/10** | |
| cover as thumbnail | 3/4 | Frame 0 reads as text. The 5.2 s lump + `$1.5M` frame is the better cover, but needs the hook line on it (§4). |
| caption + keywords + hashtags | 3/3 | No post kit exists for this build yet. Scored on the version in §4. |
| series identity | 3/3 | SILLAGE — N°6 logotype on every frame, kit flacon, kit type |
| **F. Niche codes & trust** | **10/15** | |
| one visible transformation | 3/4 | Empty flacon fills on "ambroxide" and stays full through "law", then drains (good data logic). Pale fill. No visual strike on "vomit" now. |
| scale anchor US/UK | 2/3 | +280 lb, −the 100-pearl grid. "1 in 100" is now just a number. |
| real face / stakes | 1/3 | No faces (correct: no invented fishermen). No human stake on screen. |
| sourced, hedged | 3/3 | "an estimate", SOURCES VARY, "reportedly", OUR CALCULATION, "mostly", "the main smell" all on screen. **Watch:** the photoreal lump plate sits under "IT SOLD FOR $1.5M", so a viewer can read it as the Yemen piece. The manifest says it never is: say "AI illustrations" in the description (see §4). |
| no anti-patterns (§8/§9) | 1/2 | The law facts float as text where an object could carry them (§9 in-world). The bust frame is an empty prop. "a gram ·" appears before its number. |
| **TOTAL** | **79/100 → 7.9/10** | **Tier: can break out (70–84)**, +3 vs. the first build |

## 2. Top 5 changes, ranked by expected gain
All are `reel.json` edits unless marked. Run `raea/sillage-kit/tools/validate.mjs` (the first step of `render.sh`) after each.
**No re-record is needed:** the US-law tease (#1) works as on-screen text over the existing voice. Re-recording two beats
(old pass, fix 2) would add maybe +1 more, which isn't worth a new voice, new timings and a new loop.

### 1. Plant the US-law open loop on screen right after the bust (+3: B payoff +1, D comment +1, D send +1)
SOURCES row 10 (US possession prohibited). It shows in the `name` shot from "Old" (10.73 s) to the cut (12.3 s), and the law shot
pays it off with the same words.
```json
{ "id": "name", "petals": false, "kind": "flacon", "camera": "macroLabel",
  "text": [
    { "t": "title", "v": "Ambergris" },
    { "t": "whisper", "v": "ambre gris: grey amber", "at": "name:Old" },
    { "t": "badge", "v": "illegal to own in the US ↓", "at": "name:French" }
  ] }
```
If the kit allows only the three fixed badge words, use a `label` instead: `{ "t": "label", "v": "USA: illegal to own · coming up", "at": "name:French" }`.
That puts 1.2 s of text on screen, so keep it to 6 words or fewer.

### 2. Put the subject under the bust: keep the lump on screen through "Never vomit." (+2: F transformation +1, F anti-pattern +1)
Replace the empty-flacon `myth` shot with a push-in on the lump plate. The claim then flips while the object stays, like a before/after on one thing.
```json
{ "id": "myth", "petals": false, "kind": "plate", "img": "s_lump.jpg", "focus": [50, 58],
  "kb": { "from": [1.06, 0, 0], "to": [1.22, 0, -40] },
  "text": [
    { "t": "label", "v": "one problem" },
    { "t": "title", "v": "Never\nvomit.", "gold": "vomit.", "at": "myth:never" }
  ] }
```
and give `sold` a matching start so the two shots read as one move: add `"kb": { "from": [1.0, 0, 0], "to": [1.06, 0, 0] }` to `sold`.
The flacon then makes its entrance on "It's ambergris" (name), which is where the perfume link starts. Optional, if the kit has a
`strike` text style: strike "vomit." in the title on "never". Do not add one just for this.

### 3. Give "1 in 100" a picture again (+2: F anchor +1, C pause-worthy +1)
**Component change** (kit, reusable): a `grid` text item, `{ "t": "grid", "n": 100, "lit": 1, "at": "rare:hundred" }`, drawn as 10×10
small cream dots with one gold, placed in the free band under the stat (y 520–860, left column). It turns into the save-worthy frame.
SOURCES row 5 ("about one in a hundred", sources vary) and row 6 (0.4 %) both fit: `SOURCES VARY` stays.
**If the kit can't take a component now**, the reel.json fallback is to put the shot on the whale, so at least the subject is on screen:
```json
{ "id": "rare", "petals": false, "kind": "plate", "img": "s_whale.jpg", "kb": { "from": [1.04, 0, 0], "to": [1.14, 40, -10] }, "text": [ ...unchanged... ] }
```
The fallback is worth about +1 (anchor stays 2/3).

### 4. Make the fill read at thumbnail size, and make the history plate move (+2: B re-hook +1, B new-visual +1)
- `"juice": "#A88B4E"` renders cream behind the transmission glass. Try a deeper amber, `"juice": "#B8741F"`, and check a still at
  f1190 (39.7 s) for "full, amber" at 270 px wide (`render.sh --stills "1190"`). The colour is dataviz, not a claim, so no source is needed.
- `history` has no camera move for 8.5 s. Walk the camera across the three objects in the order they're named:
```json
{ "id": "history", "petals": false, "kind": "plate", "img": "s_history.jpg",
  "kb": { "from": [1.18, 60, 0], "to": [1.18, -60, -10] }, "text": [ ...unchanged... ] }
```
  (incense burner left → pomander → eggs right. Check the plate's actual layout, since x is in px of shift. Flip the sign if the eggs are on the left.)

### 5. Fix the price beat's reading order and give `$12` time (+1: F anti-pattern / B captions)
Today "a gram · $1.5M ÷ 127 kg" lands at 54.6 s and `$12` at 55.9 s, and the shot cuts at 57.07 s ($12 is on for 1.1 s). Show the sum first, then the result:
```json
{ "id": "price", "petals": false, "kind": "plate", "img": "s_boat.jpg", "kb": { "from": [1.16, -30, -20], "to": [1.08, 0, 0] },
  "text": [
    { "t": "label", "v": "that piece from Yemen" },
    { "t": "whisper", "v": "$1.5M ÷ 127 kg", "at": "price:piece" },
    { "t": "stat", "v": "$12 a gram", "at": "price:$12" },
    { "t": "badge", "v": "our calculation", "at": "price:piece" }
  ] },
{ "id": "synthetic", "at": "synthetic:perfumers-0.1", ... }
```
This keeps the price on screen 1.4 s instead of 1.1 s. The `checks.calcs` entry (`shown: "12"`) still matches. If `$12 a gram` breaks
the stat width, use `$12/g`. Also good, if the kit exposes it: hold caption pages 1.0 s after the last word (kit `captions.tsx`),
which clears most of the 56 reading warns.

**Small extra (+0–1, A frame 0):** give the hook a slow push from the loop's end framing so frame 0 moves and the loop stays seamless:
`"kb": { "from": [1.06, 0, 0], "to": [1.14, 0, -30] }` on `hook`. The loop shot ends at `[1.06, 0, 0]`, so SSIM stays about 0.99. Check it.

Expected after all five: **~89/100**, strong breakout odds on packaging. Reach still depends on the account.

## 3. Three alternative hooks (all in SOURCES; each needs a re-record of beat 1 + the loop line, so treat them as A/B cuts, not fixes)
| Archetype | Verbal line (sentence 1) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **Contrarian / myth-bust** | "Whale vomit sold for one and a half million dollars. It was never vomit." (rows 1, 2) | lump plate (`s_lump.jpg`) close, title already on | `Never whale vomit.` + label `$1.5M · Yemen, 2021` |
| **Contradiction (law, US/UK)** | "In Britain, you can sell this. In the United States, you can't even own it." (row 10) | lump plate with two lines: gold `USA: illegal to own`, cream `UK · EU: can be sold` | `Illegal to own in the US` |
| **Question with a defined shape** | "How does something a whale mostly passes like dung end up in perfume?" (rows 2, 7, 8, 12) | sperm whale plate (`s_whale.jpg`), flacon glint inset not needed | `Whale dung → perfume?` |

The loop line has to lead back into whichever hook is used: hook 2 → "…But the headlines still call it vomit. And in Britain…".
Hook 2 is the best A/B test for a US-heavy audience. Keep "mostly" in hook 3: SOURCES row 2 marks the edge case as debated.

## 4. Cover, caption, hashtags, pinned comment
**Cover:** compose from the `sold` frame at **5.2 s** (lump close-up on wet sand, `$1.5M` stat). Replace the top label with the hook in
title type: `Never whale vomit.` (gold on "vomit."), with `$1.5M · 127 kg` under it in the stat line. Keep everything between y = 250
and y = 860 on the left (safe for 9:16 and the 4:5 grid crop). Frame 0 works as a fallback, but the boat says "sea", not "ambergris".

**Caption (hook line ≤150 chars):**
> Fishermen in Yemen found 127 kg of "whale vomit". It sold for $1.5M. It was never vomit.
>
> Ambergris explained: made in a sperm whale's gut, floats for years, turns sweet. The smell is mostly ambroxide.
> Illegal to own in the US, sold in the UK and EU, and now made from clary sage. Images: AI illustrations; bottle: 3D.

**Hashtags (4):** `#ambergris #perfumetok #fragrance #spermwhale` (Reels: keep 3, drop `#perfumetok`).

**Pinned comment:** the SOURCES.md draft as written (Wikipedia; NHM; Mikhalev 2024; AFP/Gulf News, The National; "$12/g is our
calculation"; nobody has watched a whale release it; not legal advice), then:
> Would you wear the real thing, or does knowing where it comes from send you to the clary-sage version?

## 5. Platform notes
- **TikTok:** keep the 65.7 s cut (over 60 s, and the loop drives rewatch). Search reads on-screen text: "Ambergris" is on screen at
  8.9 s, which is good. Fix #1 adds "illegal to own in the US" as searchable text in the first 12 s.
- **Instagram Reels:** sends per reach are the lever, so fixes #1 (law tease) and #2 (the bust on the lump, the DM-able frame) matter most.
  The 4:5 grid crop cuts the SILLAGE logotype (y ≈ 270), but the title survives. Use 3 hashtags at most. Upload the composed cover; don't pick frame 0.
- **YouTube Shorts:** judged on viewed vs. swiped away. The 4.1 s hook hold is acceptable now, and the `hook` push-in (small extra) helps
  the first second. Consider a 50–55 s Shorts edit without the history beat (40.8–49.0 s): it stays true and the loop still works.
  Put "ambergris" and "whale vomit" in the Shorts title.

VIRALITY SCORE: 79/100 (7.9/10) — can break out
