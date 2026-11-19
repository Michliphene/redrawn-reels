# REVIEW — texas-five (REDRAWN EP 6, DA 2) · reel-reviewer pass 1

Video `out/texas-five.mp4` (50.5 s, voice 49.95 s) · validate: 0 ✗, 1 ! (hook 4.3 s, see below) · stills with guides checked.

## Verdict
**Not quite postable. 7/10.** It opens well: frame 0 is a tilted 3D Texas cut into five, the loop lands back on that
exact pose (checked on frames 1490–1513), the hedging holds ("could", "at least on paper", "illustration", DISPUTED),
and every on-screen date and figure matches SOURCES.md. The three biggest problems:
1. **The 1850 cession has nothing on screen.** "Texas gives up its western claims" leaves the CLAIM piece unchanged
   until 41.4 s. The `conceal` at "debts." is undone 0.7 s later by the `reveal` at "Half", and a conceal only sinks
   the slab's thickness, so the orange top stays. The map's main transformation is never shown.
2. **The quiet reset still flashes.** At 4.75 s Texas goes red → cream #FFF6E0 → grey, then flashes cream again on
   "breaks". That is two white flashes in 2 s, and the first lands on no word. `fillAt()` (src/components/MapLayer.tsx)
   ignores `quiet`: only lift, sfx and labels respect it.
3. **The hedge lines are unreadable.** The callout sub-lines ("up to 4 new states · with Texas's consent",
   "yes: … · no: Art. IV §3") render at about 22–26 px, below 28. "no: Art. IV §3" also reads as if the Constitution
   settles the question. Per SOURCES.md it is the main counter-argument, and the question has never been tested in court.

## Beat-by-beat findings
1. **[P1] 1850/states · 32.5–41.4 s · cession not shown.** In `1850`, replace the CLAIM `pulse` and the `conceal`
   with a re-colouring declare (the flash is welcome here). In `states`, delete the `reveal` at "Half", then move the
   `conceal` to the `shape` beat:
   ```json
   // 1850.actions: replace {"type":"pulse","ids":["CLAIM"],"atWord":"gives"} and the conceal at "debts." with
   {"type":"declare","id":"CLAIM","atWord":"gives","noLabel":true,"color":"#C9D3DF"}
   // states.actions: delete {"type":"reveal",…"Half"} and {"type":"conceal",…"Wyoming."}
   // shape.actions: add
   {"type":"conceal","ids":["CLAIM"],"atWord":"That's"}
   ```
   The ceded land turns US-neutral grey on "gives", stays visible under the five state labels, then sinks while
   "That's how Texas got its shape" plays.
2. **[P1] 1836 · 4.75–7.4 s · cream flash on the quiet reset.** Engine fix in `fillAt()`: for a declare with
   `quiet: true` and `t > 0.05`, return `interpolateColors(t,[d.t,d.t+SETTLE],[prevColour,target])` with no `#FFF6E0`
   step. JSON-only fallback: set the reset at `"atTime": 4.45` so the flash plays under the title fade-out. That only
   hides it, so the engine fix is still needed.
3. **[P1] clause · 46.6–49.0 s · sub-line size and framing.** Component: callout `sub` must be at least 30 px. Text:
   ```json
   "sub": "for: Kesavan & Paulsen (2004) · against: Art. IV §3 · never tested in court"
   ```
   If that line is too long, drop "· never tested in court". It is in SOURCES ("never tested in court").
4. **[P2] 1845 · 26.7–29.3 s · sub-line too small (about 26 px).** Same component fix as #3. This line carries
   "with Texas's consent", which is the condition.
5. **[P2] 1845 · 24.9–27.3 s · anachronistic flag.** The 50-star US flag is shown in 1845 (the flag then had 27–28
   stars), and DA 2 rule 5 rules out sticker chips. Replace the sticker with a pinned label:
   ```json
   {"type":"label","text":"28th state","at":[-98.0,31.6],"atWord":"United","hold":2.2}
   ```
6. **[P2] 1845 · 22.6–30.7 s · CLAIM strip runs up through the header** (timeline and "1845", y 300–560, guides
   still at 27.3 s). Pull the camera back and lower the target:
   `"camera":{"center":[-101.5,35.0],"span":24,"pitch":54,"yaw":10,"cut":true}`. Check it on stills.
7. **[P2] santafe · 19.7–20.9 s · "Wyoming" label left over from `claim`** floats in the header block (y ≈ 420).
   In `claim`, change the Wyoming label to `"hold": 0.8`.
8. **[P2] shape · 41.4–42.2 s · "Wyoming" label from `states` sits on "25 NOV"** (guides still at 42.0 s). In
   `states`, change the Wyoming label to `"hold": 0.75`.
9. **[P2] states · 39.8–40.7 s · "Kansas" and "Oklahoma" labels overlap** (0.7° apart). Set Kansas `"hold": 0.65`
   and move it to `"at": [-101.3, 37.75]`.
10. **[P2] 1850 · 34.4–35.9 s · bigNumber label touches the captions band.** "debt relief · Compromise of 1850"
    sits at y ≈ 1168, against the band's top at 1170. Set `"y": 900`.
11. **[P2] clause · 43.5–46.6 s · 3.1 s with nothing new**, and the rail still reads 1850 while we talk about today. Add:
    ```json
    {"type":"label","text":"never used · 1845 → today","at":[-99.5,27.4],"atWord":"never","hold":1.3}
    ```
12. **[P2] claim · 13.9–16.1 s · "claimed · approximate" is about 24 px grey italic on orange.** This is the map's
    hedge. Component: `region` text must be at least 30 px with a dark halo. Or move it onto dark ground at
    `"at": [-110.8, 35.0]`.
13. **[P2] 1845 → 1850 · 30.7–31.2 s · SPLIT ghost runs into the 1850 beat.** Set the ghost in `1845` to `"hold": 2.6`.
14. **[P3] clause · keywords overuse the accent.** "Texas" is highlighted 9 times, and "New" also catches "four NEW
    states". Remove `"Texas"` from `keywords`, and keep "New" only if the 1845 highlight is wanted.
15. **[P3] clause · ghost lines with no "illustration" tag** (it only appears in the hook). Add
    `{"type":"label","text":"illustration","at":[-99.6,26.4],"atWord":"four-state","hold":1.0}`.
16. **[P3] republic · 8.8 s · unit caption "21 APR 1836" repeats the header date.** Remove `"caption"`.
17. **[P3] 1845 / clause · the callout cards are centred floating widgets** (STUDIO §2: text hangs from the left
    margin unless pinned). Acceptable for now. Later, the "STILL VALID?" card could be a left-margin `Display`
    + `Mono` block in the header band.
18. **[P3] 1836 · today's outline used for 1836 Texas.** In 1836 Mexico held the Nueces as the limit. This is logged
    in SOURCES and the reel shows only what Texas claimed, so no change is needed.
19. **[P3] frame 0 · the whisper "at least on paper" appears at 0.1 s, not on frame 0.** The cover and loop
    frames have it, so frame 0 should too.

## Checks that pass
- **Sync**: every label lands within 0.1 s of its word. The ghost appears on "four" and "four-state". The DISPUTED
  stamp lands on "disagree.". bigNumber "million" appears in both the caption and the spoken form.
- **Safe area**: nothing readable outside y 250–1440. The sticker's right edge is at x ≈ 864 (< 930). The cards
  stay within x 244–836.
- **Accuracy**: 2 Mar / 21 Apr / 19 Dec 1836, 29 Dec 1845, 28th state, 25 Nov 1850, $10M "debt relief · Compromise
  of 1850", the five ceded states, the 4-state clause "with Texas's consent", and Kesavan & Paulsen 2004 all match
  SOURCES.md. No secession claim. The disputed clause is hedged in the voice ("Lawyers disagree") and on screen
  (DISPUTED).
- **Hook warning (!)**: justified. The stake sentence ends at 2.3 s ("states." at 1.81 s). The second sentence is
  the hook's payoff, so keep it.
- **Re-hooks**: a cut at 22.6 s (45 %) and a second one at 43.1 s. One camera idea per beat.

---

# Virality pass 1 — texas-five (REDRAWN EP 6, DA 2) · virality-reviewer

Render checked: `out/texas-five.mp4` (21:34, after the P1/P2 fixes) · metrics `out/review/texas-five/virality_metrics.json` ·
beat sheets regenerated after the fixes. This is a **pattern-based estimate, not a prediction**. The size of the
account it is posted from is the biggest factor, and we can't control it.

Metrics: 50.5 s · 144 words · 3.07 w/s · first word 0.25 s · hook sentence ends 1.81 s ("states.") · 7.5 cues/10 s ·
3 of 25 two-second windows without a cue (longest 3.12 s at 27.9 s, 3.04 s at 1.8 s, 2.96 s at 8.8 s; the last
one is covered by the San Jacinto pieces moving in) · loop SSIM **0.91** · −14.3 LUFS.

## Scorecard
| Block | Pts | Why |
|---|---|---|
| A. Hook 0–3 s | **24/25** | Frame 0 is a tilted 3D Texas already cut in five, with "TEXAS COULD SPLIT IN FIVE": it works paused and muted (7/8, because the west tip is cropped and the whisper hedge isn't on frame 0) · number + contradiction in sentence 1 (7) · Texas identifiable on frame 0 (5) · 5-word title (3) · no throat-clearing (2) |
| B. Retention | **20/25** | Cue density is good, but 1.8–4.8 s only has the title fading (6/8) · the 31–43 s cession block is a side road from the "split in five" promise, so it risks a plateau (4/6) · two strong re-hooks: Wyoming at 18.9 s and the 1845 cut at 22.6 s (4/4) · the clause pays off at 53 %, the "today?" answer at 94 % (3/4) · 3.07 w/s, captions clean (3/3) |
| C. Rewatch & loop | **9/10** | "…at least on paper" → "Texas could split into 5 states" is a true sentence loop (5) · SSIM 0.91 (3) · the claim-to-Wyoming map is worth pausing, but it is on screen for under 6 s (1/2) |
| D. Shares & saves | **12/15** | Clear send ("did you know Texas can…", a Texan identity trigger), but the factoid is widely recycled, which costs novelty (5/6) · save value: 1836 claim vs today, series (3/4) · "name the five states" is a strong honest comment trigger (3/3) · identity stake, no human figure (1/2) |
| E. Packaging | **9/10** | Frame 0 is cover-ready, but Texas is cropped and the split lines are thin at grid size (3/4) · caption written below (3/3) · REDRAWN EP 6 bar (3/3) |
| F. Niche codes & trust | **11/15** | Visible transformations: the claim grows, turns grey, sinks; the five-way split (4/4) · US state anchors: Wyoming, Colorado, New Mexico (3/3) · no face or personal stake (1/3) · hedged throughout: could / illustration / approximate / DISPUTED (3/3) · **anti-pattern: the hedge sits under the platform UI**. At 47.6–48.4 s the "STILL VALID?" card spans x≈36–1043 and its sub-line ends at x≈1000. The **DISPUTED stamp sits at x≈880–1070, y≈880–975**, under the like/comment rail. The cards are also centred floating widgets (0/2) |
| **TOTAL** | **85/100 · 8.5/10** | **Tier: strong breakout odds** (just over the line; fix 1 secures it) |

## Top 5 changes by expected gain (no `say` changes; the voice stays)
### 1. Get the "STILL VALID?" card and the DISPUTED stamp back inside the safe area (+2: F anti-pattern, trust visibility)
The longer sub-line from the clarity pass widened the card to about 1007 px. The stamp hangs at `right: -30` of the card
(`src/components/Overlays.tsx` l.84), so it lands under the action buttons. At about 12 px per character of the
30 px sub, a 44-character sub gives a card about 620 px wide (right edge ≈ 850) and a stamp right edge ≈ 880. Move
"never tested in court" into the map label that already fires on "never":
```json
// clause.actions — callout
{"type":"callout","text":"STILL VALID?","sub":"for: Kesavan & Paulsen · against: Art. IV §3","size":64,"y":960,
 "atWord":"valid?","hold":2.4,"stamp":"DISPUTED","stampWord":"disagree.","stampSize":34}
// clause.actions — replace the "never used · 1845 → today" label
{"type":"label","text":"never used · never tested in court","at":[-99.5,27.4],"atWord":"never","hold":1.3}
```
The year (2004) stays in the pinned comment and SOURCES. Check one still at 48.3 s with `{"guides":true}`: the stamp must end left of x=930.

### 2. Fill the 1.8–4.8 s hook gap with the "deal" (+1: B new visual, A payload)
The second hook sentence ("It's written into the deal that made it American") has nothing new except the title fading. Pin the source of the claim on the map:
```json
// hook.actions — add
{"type":"label","text":"1845 annexation deal","at":[-99.0,32.2],"atWord":"deal","hold":1.5}
```
`deal` occurs once in the hook and is plain text, not inside a `{a|b}` token. Fact: Joint Resolution, 1 Mar 1845 (SOURCES row 1).

### 3. Un-hide the clause's "illustration" tag (+0.5: F trust)
In `clause`, the `illustration` label at "valid?" (46.6 s, at [-99.6, 26.4] → y≈1065) renders **behind** the STILL VALID
card, so the five-way split goes unlabelled in the final 5 s. Fire it when the ghost appears instead:
```json
{"type":"label","text":"illustration","at":[-99.6,26.4],"atWord":"four-state","hold":1.5}
```
It ends at about 45.0 s, before "never used" (45.24 s) takes the same spot.

### 4. Ship a composed cover (+1: E cover, D send-ability in the grid)
The Thumb composition draws only `declare`s with `atTime: 0`, so it will show solid red Texas without the split lines.
The text has to carry the "5". Proposed `thumb` block for `episode.json` (top level):
```json
"thumb": {
  "kicker": "On paper since 1845",
  "main": "Texas could split in five",
  "mainSize": 150,
  "mainSizeV": 140,
  "badge": "+4",
  "badgeSub": "new states, if Texas agrees",
  "fit": ["TX"]
}
```
Every word is in SOURCES (Joint Resolution §2: "not exceeding four … in addition to said State of Texas … by the consent
of said State"). "could" and "on paper" keep the hedge. Optional component change for later: let `Thumb.tsx` also draw
hook `ghost`s with `atTime: 0`, so the five-way split shows on the cover too. That is the strongest image in the reel.

### 5. Trust hygiene before posting (+0.5: F sourced)
- SOURCES.md still lists "28th state (sticker)" and "Flags: US flag … on the 1845 sticker". The sticker is gone (it is now a
  "28th state" label, no flag), so update both lines. Add the hook label text "1845 annexation deal" and "never tested in court" to the
  facts table's on-screen list.
- Optional (P3): `1850` bigNumber `"hold": 1.2`. Its fading "$10M / debt relief" still ghosts under the "New Mexico" label at 36.1 s.
  The CLAIM panhandle also sinks through the "1850" header at about 41.8 s (cosmetic, 0.4 s).

**Expected ceiling with 1–5: about 89–90/100.** What's left is the structural part that the recorded voice fixes in place: the
1850 side road and no human face.

## 3 alternative hooks (for a re-cut or a variant upload, all true per SOURCES.md)
| Archetype | Verbal line | Frame-0 visual | On-screen text |
|---|---|---|---|
| **A. Map twist / in-media-res** | "Texas once claimed land all the way to Wyoming." | The `claim` pose (orange strip up to 42°N), "Wyoming" label and "claimed · approximate" already on | `TEXAS → WYOMING?` |
| **B. Myth-bust** | "No, Texas can't secede. But on paper, it could split in five." | Today's Texas with the five-way ghost and the "illustration" tag | `SECEDE? NO. SPLIT? MAYBE.` |
| **C. Big number / question** | "Five Texases? It's written into the 1845 annexation deal." | Split Texas with a "+4" in-world piece and "THE 1845 DEAL" | `5 TEXASES?` |
Guardrails: B relies on SOURCES "the 1845 texts give no right to secede (TSL)", so never say the split is legal today.
"MAYBE" and "on paper" stay because validity is DISPUTED. A must keep "claimed": Texas never controlled that land (Santa Fe).

## Cover, caption, hashtags, pinned comment
- **Cover:** render `Thumb` with the block above (TikTok/Shorts 9:16, Reels 3:4). If you pick an in-app frame instead, use
  **2.0 s**: the whole of Texas split in five, title + whisper "at least on paper", the "illustration" tag, caption "…INTO 5 STATES."
  Cover text: **TEXAS COULD SPLIT IN FIVE**, with "+4 new states, if Texas agrees" as the badge.
- **Caption:**
  > Texas could split into 5 states. It's written into the 1845 deal that made it American, at least on paper.

  > The Republic of Texas, its 1836 claim up to Wyoming, the Compromise of 1850 and the four-state clause of the Texas annexation.

  > REDRAWN ep. 6. Map history in under a minute. Sources in the pinned comment.
- **Hashtags (5):** `#Texas #history #maps #ushistory #geography`
- **Pinned comment:**
  > Sources: Joint Resolution annexing Texas (1845) via the Texas State Library; Compromise of 1850 (Britannica); Kesavan & Paulsen, Texas Law Review (2004) vs Art. IV §3 of the Constitution. The clause has never been used or tested in court. The 1836 claim is drawn approximately; the five-way split is an illustration. No official map exists.
  > If Texas did split in five, what would you name the new states?

  Keep "Which of the five would you live in?" as a day-2 reply.

## Platform notes
- **TikTok:** 50.5 s with a sentence loop and no end card is the right shape. Rewatch is the lever, and SSIM 0.91 makes the seam
  invisible. Don't stretch it to 61 s for Creator Rewards; that would be a different edit. Upload the Thumb cover and keep
  "Texas annexation" and "Compromise of 1850" in the caption for search. Expect "Texas can't secede" comments: reply with the
  TSL line, never with an opinion.
- **Instagram Reels:** ranks on sends per reach. The DM moments are the Wyoming reveal (18.9 s) and the STILL VALID card, so fix #1
  matters most here. A stamp under the Reels like/share rail is invisible. Use the 3:4 Thumb for the grid, post natively, put the
  keywords ahead of the hashtags.
- **YouTube Shorts:** "viewed vs swiped" is decided in second 1, and frame 0 already reads as a Texas map. Test alt hook **A** (Wyoming)
  here as a variant: a surprising map tends to beat a known factoid with Shorts' broader audience. Put the sources in the description.

VIRALITY SCORE: 85/100 (8.5/10) — strong breakout odds
