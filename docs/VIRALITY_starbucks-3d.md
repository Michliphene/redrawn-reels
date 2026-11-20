# Virality pass: RECEIPTS #008 "Inside a Starbucks cup" (raea, `raea/starbucks-3d/out/starbucks.mp4`)

This score comes from matching the reel against known patterns. It is not a prediction. The account's size and history matter more than anything scored here, and we can't control that.

**What I checked:** the render (1080×1920, 30 fps, 42.23 s); the hook strip at 0 / 0.5 / 1 / 1.5 / 2 / 2.5 / 3 s; a 1-fps contact sheet (42 frames); close-up frames at 6.8, 7.4, 28.2, 33.0, 37.2, 39.9, 41.0 and 41.6 s; `timings.json` (word starts); `SOURCES.md`; `compositions/starbucks.tsx`. `pipeline/virality_metrics.py` expects `out/<id>.mp4`, so I measured by hand with ffmpeg:

| Metric | Value |
|---|---|
| Voice | 0.25 → 41.72 s, 95 tokens ≈ 2.3 tokens/s. Spoken amounts ("three dollars twenty-three") make it ≈ 2.7 words/s heard |
| Payload word ("97¢") | 2.78 s, which is sentence 2 |
| SSIM, first frame vs last frame | **0.995** |
| Loudness | −14.4 LUFS integrated |
| New things on screen (layer colour, ledger row, camera move, lid) | 2.78 · 5.9 (move) · 6.1 (pour) · 7.1 · 11.1 · 12.6 · 14.3 · 15.7 · 17.0 · 18.2 · 22.4 · 26.2 (move) · 27.8 · 29.4 (cut to field) · 32.3 (wave) · 35.2 (move) · 36.9 · 39.6 · 40.3 (loop back) |
| **Longest stretches with nothing new** | **0.0–2.78 s (2.8 s, the hook)** · **7.1–11.1 s (4.0 s)** · **18.2–22.4 s (4.2 s)** · **22.4–26.2 s (3.8 s)** |

## 1. Scorecard

| Block | Pts | Why |
|---|---|---|
| **A. Hook 0–3 s** | **19/25** | |
| frame 0 paused + muted | 5/8 | Clean 3D cup with a big lime "$10" and the title, and you can see depth. But it's a still, lidded white cup with no tension. Nothing is open, glowing or missing until 2.78 s. |
| payload in sentence 1 | 5/7 | Sentence 1 ("You pay Starbucks $10.") only sets the stake. The surprise, 97¢, lands in sentence 2 at 2.78 s, right at the edge of the 3 s gate. |
| place/subject < 1.5 s | 5/5 | "Starbucks" is spoken at 0.71 s and is in the title on frame 0. |
| on-screen text ≤7 words, reinforcing | 2/3 | Title (5 words) + whisper line (7) + "$10" = 13 words. None of them carries the hook question. |
| no throat-clearing | 2/2 | No logo, no intro. |
| **B. Retention** | **14/25** | |
| new visual every ≤2.5 s | 4/8 | Four gaps of 2.8–4.2 s (table above). Between 6.9 and 26.2 s the camera only drifts slightly, so the middle depends on one ledger row every ~2–4 s. |
| escalation / but-therefore | 3/6 | Beats 3–7 are a list of six "and this costs…" items with no "but" between them. The field of cups and the "a third / almost half" summary do escalate, but late. |
| mid-video re-hook | 2/4 | The only cut (field of cups, 29.4 s) comes at 70 %, after the 40–60 % sag window. No spoken twist. |
| payoff not buried | 3/4 | 97¢ is shown at 2.8 s and paid off again at 27.8 s. "A third / almost half" lands at 37–40 s with clear emphasis in the world (layers light up and dim). |
| pace + captions | 2/3 | Slightly slow for the format. Captions are big (84 px), a few words at a time, and readable. |
| **C. Rewatch & loop** | **9/10** | |
| last line completes the first | 4/5 | "Next time you pay…" → "You pay Starbucks $10." works, but "you pay" is said twice, so the join is audible. |
| last frame ≈ first frame | 3/3 | SSIM 0.995. The cup comes back, the colours drain away, the title and $10 return. |
| frames worth pausing | 2/2 | The six-row ledger tied to the coloured stack works as a reference card. |
| **D. Shareability & saves** | **10/15** | |
| send-to-a-friend fact | 4/6 | "Starbucks keeps under $1 of your $10" is a genuine "I didn't know". It isn't sharpened into a comparison people would argue about (see fix 4). |
| save value | 3/4 | The full ledger frame is worth a screenshot. The series number is on screen. |
| honest comment trigger | 2/3 | Debated points exist ("before tax", "whole company, not one latte"), but the pinned question is generic. |
| human stake | 1/2 | "You" opens and closes the reel and baristas are named, but they get no visual moment. |
| **E. Packaging** | **9/10** | |
| cover readable as thumbnail | 3/4 | Frame 0 reads at thumbnail size ("INSIDE A STARBUCKS CUP", "$10") but doesn't show the 97¢. |
| caption + hashtags | 3/3 | None exists yet. Scored on the version written in §4. |
| series identity | 3/3 | RECEIPTS #008 bar on every frame, same house look as earlier episodes. |
| **F. Niche codes & trust (RECEIPTS)** | **13/15** | |
| one visible split | 4/4 | One cup, six coloured layers, each sized to its amount. Readable without sound. |
| familiar anchor | 2/3 | Everyone knows a Starbucks cup. But "$10" is a unit, not a price anyone pays (honestly flagged in SOURCES), and no layer is compared to anything familiar. |
| human stake ("you", the buyer) | 3/3 | Second-person frame from the first word to the last. |
| source on screen, computed figures labelled | 3/3 | "Starbucks 10-K FY2026 (SEC) · per $10: our calc." is on every frame. The fiscal year is on screen. |
| no anti-patterns | 1/2 | ">3 s with nothing new" happens three times in the middle. |
| **TOTAL** | **74/100** | **7.4/10, "can break out"** |

## 2. Top 5 changes, ranked by expected gain

All five keep the facts identical to `SOURCES.md`. Where a change adds a new derived figure, it says so and the figure has to go into the facts table first.

### 1. Put the payload in sentence 1 (+4: A payload +2, frame 0 +1, B payoff early +1). Needs a new voice take.
Script line 1 rewrite (same facts, one sentence):
> ~~You pay Starbucks $10. They keep 97 cents.~~ → **"Of every $10 you pay Starbucks, they keep 97 cents."**

"97 cents" moves from 2.8 s to about 1.8 s. The lid pop is keyed to `w("hook", "97¢")`, so it follows automatically. `HIDE` still matches `hook:$10` and `hook:97¢` if the tokens stay `$10` and `97¢` (`{97¢|97 cents}` in `say`).
Loop: keep "Next time you pay…" → "Of every $10 you pay Starbucks…". That reads as one sentence and avoids saying "you pay" twice, which also fixes the C point.
Cost: re-recording the voice regenerates `timings.json`. Every timing in `starbucks.tsx` comes from `w()` / `B()`, so nothing is hard-coded in seconds.

### 2. Make frame 0 a question and give the first 2.8 s motion (+3: A frame 0 +2, A on-screen text +1). Code only, no new voice.
In `Overlay`, swap the title and whisper so the frame-0 text asks the hook question in 6 words:
```tsx
<div style={display(112)}>What Starbucks<br />keeps from $10</div>
<div style={{ fontFamily: "Instrument", fontStyle: "italic", fontSize: 54, color: P.lime, marginTop: 14 }}>from the 2026 annual report</div>
```
Make the "$10" the visible stake (it's already on screen) and add motion before the pop:
- **Camera push-in from frame 0.** In `cameraAt`, add a dolly that runs only inside the hook and ends before the first shot. Frame 0 and the last frame stay on `HERO`, so the SSIM is unchanged:
```ts
const push = t < POUR_AT - 0.2 ? inOut3(ramp(t, 0, w("hook", "97¢"))) * 0.12 : 0; // 12 % closer by the pop
pos = lerp3(pos, look, push);
```
- **Lid wobble on "$10."** In `Cup`, before the pop:
```ts
const wob = Math.sin(Math.PI * ramp(t, w("hook", "$10."), 0.35)) * 0.12;
const tilt = -lidPop * 0.5 + wob;   // and add wob * 0.15 to the lid's Y
```
The gap of 2.8 s with nothing new on screen drops to about 1.2 s.

### 3. Fill the three dead stretches in the middle (+3: B new visual +2, F anti-pattern +1). Code only.
- **7.1–11.1 s ("the cup, the milk, the beans, the food…").** The amber layer takes its colour all at once at 7.1 s and then nothing moves for 4 s. Make it fill one step per noun, in the world. In `Cup`, for `i === 0`:
```ts
const steps = ["cup,", "milk,", "beans,", "food,"].map((x) => ramp(t, w("cup", x), 0.25));
const fill = i === 0 ? Math.min(1, steps.reduce((s, k) => s + k, 0) / 4 + 0.25 * ramp(t, w("cup", "there:"), 0.3)) : 1;
// use `col * fill` for layer 0, plus a 0.04 pop on each step
```
Also change `colorAt` for the cup layer to `w("cup", "cup,")`.
- **18.2–22.4 s and 22.4–26.2 s (store, office).** Add one small camera move per beat, a crane that follows the stack upward as it fills. Camera moves count as "new" (playbook §9). Insert into `SHOTS` between the pour shot and the keep shot:
```ts
shot(w("store", "ads,") - 0.2, [CUP_X - 1.9, 2.4, 0], -2, 13, 32, 30),
shot(w("office", "head") - 0.2, [CUP_X - 1.8, 3.1, 0], 6, 16, 30.5, 30),
```
The ledger re-projects every frame and the SFX list adds a whoosh for each new shot automatically, so no other code changes. Check with stills that the top ledger row stays below y=452 (`LEDGER_TOP`).
- **Optional, for the "closing stores" words (25.2 s).** A brief dim on the grey layer would add a visual, but the line is "closing stores" and must stay neutral. No red, no shake.

### 4. A spoken mid-video re-hook with a comparison people send (+3: B re-hook +2, D send +1). New voice take. **Adds a derived figure, which needs a facts-table line first.**
Script line 4 rewrite (≈13.5 s, about 32 %; the visual lands at ~16 s, about 38 %):
> "The baristas' pay and benefits: $2.69. **Almost three times what Starbucks keeps.**"

Check: 2.6892 / 0.9736 = 2.76, so "almost three times" is true. It's a ratio of two on-screen figures from the same 10-K. Add this row to `SOURCES.md` before using it: *"almost three times what Starbucks keeps" | wages & benefits 10,195.0 ÷ operating income 3,691.1 = 2.76 | 10-K, our calculation*. Keep "keeps" = operating income (before interest and tax), as everywhere else in the reel.

Visual in the world, keyed to `w("crew", "three")`: three thin lime discs, each the height of the 0.97 foam layer, slide out beside the red layer and stack up to nearly its height. Use `ConicalFrustum` with `height = 0.97 * U` at `x = CUP_X + 2.2`, and remove them on "Rent". This is where a viewer stops and sends it.
If the owner doesn't want a new derived figure, the fallback is to move the field-of-cups cut earlier. That gains only +1.

### 5. Make the scale moment hit (+2: B escalation +1, D send +1). Code only.
At 29.7–35 s, "41,000" and "$3.7B" exist only as captions, and the field shows 63 cups, which reads as "a few", not "41,000".
- Put both numbers on screen as Display type at the left margin (the ledger is gone by then), and hide them from captions:
```ts
// HIDE: add "year:41,000" and "year:$3.7B"
{yearO > 0.01 && <div style={abs(SAFE.left, 452, { opacity: ramp(t, w("year", "41,000"), 0.12) })}>
  <div style={display(120, P.ink)}>41,000</div><div style={mono(26, P.muted)}>coffeehouses</div></div>}
{yearO > 0.01 && <div style={abs(SAFE.left, 640, { opacity: ramp(t, w("year", "$3.7B"), 0.12) })}>
  <div style={display(150, P.lime)}>$3.7B</div><div style={mono(26, P.muted)}>operating profit · fiscal 2026</div></div>}
```
Both are spoken figures, so these are the same facts as the voice (SOURCES: 41,607 coffeehouses → "41,000"; operating income 3,691.1).
- Widen the field to 24×16 cups fading into the existing fog. Add a crane to `SHOTS` at `w("year", "$3.7B") - 0.2` (pitch 36° → 55°, dist 25 → 34) so the wave of lit foam runs to the horizon.

**Expected total after all five: about 86–88/100.** Fixes 2, 3 and 5 alone (code only, no new voice) give about 82.

## 3. Three alternative hooks (all true per SOURCES.md)

| Archetype | Verbal line (sentence 1) | Frame-0 visual | On-screen text |
|---|---|---|---|
| **Big number** | "Of every $10 you pay Starbucks, they keep 97 cents." | Lid already off, foam glowing lime, "97¢" pinned beside it, camera already pushing in (in-media-res) | **STARBUCKS KEEPS 97¢ OF $10** |
| **Guess / question** | "Guess how much of your $10 Starbucks keeps." (answer at ~2 s: "97 cents.") | Closed cup, a lime "?¢" where the 97¢ will land, lid trembling | **HOW MUCH DO THEY KEEP?** |
| **Comparison** *(needs the facts-table line from fix 4)* | "Starbucks spends almost three times more on baristas than it keeps." | The stack already split: the red baristas layer lit, the thin lime foam on top, everything else brown | **BARISTAS $2.69 · STARBUCKS 97¢** |

I'm not suggesting a myth-bust hook ("You think Starbucks makes $9 on your coffee…"). It puts a belief in the viewer's mouth that we can't source.

## 4. Cover, caption, hashtags, pinned comment

**Cover.** Two options:
- **Frame 860 (28.67 s).** The complete ledger: all six amounts and labels, the full colour stack, the foam lit. Add the platform's cover text "STARBUCKS KEEPS 97¢". This is the save-worthy frame.
- **Frame 84 (2.8 s).** Lid popped, "97¢" on the foam, title and $10 still on screen. This one reads better at thumbnail size and carries the hook, so use it for the profile grid if there's no cover text tool (Shorts).

**Caption (≤150 chars):**
> Of every $10 you spend at Starbucks, they keep 97¢. Every cent from the fiscal 2026 annual report.

Keyword lines:
> Starbucks 10-K 2026 breakdown: cups, milk and coffee, barista wages, rent, delivery apps, operating profit.
> Where your Starbucks money goes · per $10 of revenue, our calculation · RECEIPTS #008

**Hashtags (4):** `#starbucks` `#coffee` `#businessexplained` `#moneytok`

**Pinned-comment question** (replaces the generic "Which receipt next?" and invites honest guesses):
> Before you watched: how much of $10 did you think Starbucks keeps? (97¢ is operating profit, before interest and tax, per $10 of all revenue; our calculation from the FY2026 10-K. Full breakdown below.)

Then the existing sourced line-by-line from `SOURCES.md`.

## 5. Platform notes

- **TikTok.** Completion and rewatch drive distribution. At 42 s the reel is well placed for completion, and the 0.995 loop SSIM is a real asset, so keep the end exactly as it is. Creator Rewards needs >60 s. A 61–70 s edit would need *new sourced content* (for example net earnings of 67¢ per $10 and why it differs: the one-off China divestiture gain, both already in SOURCES), not a slowed-down 42 s. Use the "STARBUCKS KEEPS 97¢" cover text.
- **Instagram Reels.** Sends per reach matter most. Fix 4 (baristas ≈ 3× what Starbucks keeps) is the line people DM. Put the source line in the caption too, because Reels search reads the caption and on-screen text, not hashtags. No watermark from another platform on the upload.
- **YouTube Shorts.** "Viewed vs swiped away" is decided in second 1, so fixes 1 and 2 matter most here. Make sure the first frame isn't a still title card: motion on frame 0 plus the question text. Shorts picks a frame for the thumbnail, so frame 84 (lid popped, 97¢) is the one to aim for.
- **All platforms.** The captions (y≈1185) and source line (y=1372) are inside the safe area. The lower ~480 px are empty dark gradient, which is fine under the UI chrome.

## Notes for the producer (no score impact)
- `episode.json` lists the voice as **George** (`JBFqnCBsd6RMkjVDRZzb`), but CLAUDE.md names Brian as the studio voice. If RECEIPTS #001–#007 used Brian, switching voices weakens series identity. If fix 1 or fix 4 triggers a re-record anyway, decide which voice to use then.
- No fix here changes a figure. Fix 4 adds one derived ratio (2.76×) that must go into `SOURCES.md` first, as "our calculation".
- I edited no other file and rendered nothing. All frame grabs are in the session scratchpad.

**VIRALITY SCORE: 74/100 (7.4/10): can break out**
