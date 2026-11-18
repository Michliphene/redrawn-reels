# REVIEW — apple-iphone-v2 (RECEIPTS #004, DA 2, raea floor pass)

Same voice, script, timings and figures as `apple-iphone` (`"audio": "apple-iphone"`). This pass applies the
craft floor of the raea plugin (`raea guide floor`) to the Remotion render, through two **opt-in** episode fields,
so episodes already published render exactly as before.

| raea floor rule | Before (`apple-iphone`) | v2 |
|---|---|---|
| Small print ≥ 32 px at 1080 wide | labels 20–27 px (stat sub 20, bar names 22, ghost label 24) | `"print": 32`: every label ≥ 32 px; source line 26 px (it sits on the safe-area floor) |
| Frame 0 is the cover and the loop seam | whisper fades in over 0.35 s | `"whisperAt0": true`: whisper fully present on frame 0 (reel review #10, virality fix 1) |
| Text clear of the app's buttons | phone shifted right on `point` was not applied | `scenes.point.camera.yaw = 40` (reel review #12) |
| Source on screen | "Source: Apple annual report, fiscal 2026 (SEC filing)" | "Source: Apple 10-K (SEC filing), fiscal 2026" (same filing, fits at 26 px) |
| Loudness −14 ±1 LUFS, true peak ≤ −1 dBTP | −14.1 LUFS, −1.1 dBTP | unchanged, passes |

Kept on purpose: the kicker "Big margin. Not the best one." (the virality review's truth check: it makes "by margin" exact).

Code: `src/money/Money3D.tsx` (`printer(spec.print)` on every label), `src/studio/ui/Hud.tsx` (`whisperAt0` on `TitleBlock`).
Both default to the published behaviour. `npm test` passes, `npm run validate apple-iphone-v2` has the one known `!`
(hook 5.4 s, justified in `REVIEW_apple-iphone.md`).

Render: `out/apple-iphone-v2.mp4`, 42.5 s, −14.1 LUFS.

The owner then asked for a new video made entirely in raea's 3D engine (only the text kept): see
`raea/apple-iphone-3d/` and `docs/REVIEW_apple-iphone-raea.md`.
