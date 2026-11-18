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
