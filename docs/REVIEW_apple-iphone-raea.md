# REVIEW — RECEIPTS #004 · raea edition (`raea/apple-iphone-3d`)

A new video of #004 made from scratch in **raea** (Bevy 0.20 3D engine driven by React/TypeScript). Only the text is kept
from `apple-iphone`: the voice, its word timings and the sourced figures. Render: `raea/apple-iphone-3d/out/storefront.mp4`
(42.4 s, 1080×1920, 30 fps, x264 CRF 14). How it was built, and how to run it in a cloud container: `raea/apple-iphone-3d/README.md`.

## What changed against the Remotion version

| | Remotion DA 2 (`apple-iphone`) | raea (`storefront.tsx`) |
|---|---|---|
| World | low-res stippled set (360×640, `PixelStage`) | full-resolution PBR: metal coins, a clear-coated phone, glass columns, soft shadows, bloom, depth of field, fog to the horizon |
| Story objects | tiles and bars | 100 gold coins = $1,000 (61 fly into a cost tray, 39 stay), 100 service tiles (24 shrink red, 76 light up), glass share columns, towers of $10B slabs, an awning and an OPEN sign on "storefront" |
| Camera | station to station | crane-in, fitted shots per beat, a slow orbit that never stops, returns to frame 0 for the loop |
| Checks | studio validator + reviewers | plus raea's contact check on every frame (a coin through the phone is an error) and `raea check` on the export |

Figures and labels on screen are the same as `apple-iphone` (SOURCES.md): $1,000 / $610 / $390 (all devices, our calc.),
"iPhone alone: not disclosed", $100 / $76, 26% / 40% (our calc.), $140B / $94B, ≈ 2/3. No logo; the phone is a generic slab.

## raea check on the final export

```
ok loudness: -15.0 LUFS, true peak -1.1 dBTP     ok clipping: no flat-topped runs
ok frozen / flashing / flash-frame / dropout      ok blotching: x264 at crf 14 keeps the darks
ok clipped: all 152 texts fit the frame           ok safe areas: no text in the UI zones
ok contrast: 80 texts at 3:1 or better
raea check: 0 errors, 50 warns
```

Fixed along the way (first export: 61 render errors, then 17 check errors):
- coins passing into the phone during their flight → they arc over and in front of it; kept coins lift by stack;
- service tiles sinking through their base (visible seam) → they shrink into it;
- `$390` stamp 2.8:1 contrast → deeper red (#B8302A);
- a kicker inside the right-hand UI zone → text width capped at x 940 (raea's unknown-platform zone);
- crushed dark greens from the built-in encoder → PNG frames + x264 CRF 14;
- audio "clipping": the ElevenLabs take itself has flat-topped peaks (the Remotion render shows the same 14 errors) →
  voice declipped in `setup.sh`, mix compressed lightly and raised by a linear gain. raea's own `<Mix lufs={-14}>`
  limiter was tried and failed its own clipping check (worth a `raea bug`).

## Open

- **50 reading warnings**: the voice runs at 2.9 words/s, so some caption phrases are on screen 0.6–0.9 s (raea wants 1 s
  a line). Fix: merge short phrases into two-line captions (≥ 1.2 s each) in `PHRASES`, one more render (~22 min).
- Loudness is −15.0 LUFS (inside the floor's ±1); reaching −14 with ≤ −1 dBTP needs a stronger compressor.
- Owner: tick the 10-K figures (same list as `REVIEW_apple-iphone.md`) before posting. Nothing is posted.
