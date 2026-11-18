# RECEIPTS #004 · The iPhone is a storefront · raea edition

A new video of RECEIPTS #004, built from scratch with **raea** (Render Anything Engine: React/TypeScript
compositions drawn by Bevy 0.20, <https://github.com/shinyobjectz/raea>). Only the **text** comes from the Remotion
episode `apple-iphone`: the voice, its word timings and the sourced figures (`public/episodes/apple-iphone/SOURCES.md`).
Everything you see is new: one physically lit 3D set and one camera travelling through it.

| Beat | What the set does |
|---|---|
| hook | crane-in on a glossy phone on a plinth, its screen lights up; 100 gold coins (1 coin = $10) drop in on "$1,000"; the 39 kept coins glow on "$390" |
| follow / cost / left | the 61 cost coins fly over the phone into a red tray on "$610"; a "?" over the phone on "Apple doesn't say" |
| turn / svc | 100 tiles = $100 of services rise; a light wave runs across them on each service named; 24 shrink red (cost), 76 rise and glow lime on "$76" |
| share | two glass columns fill: services = 26% of sales, 40% of what's left (our calc.) |
| profit | two towers of $10B slabs: $140B devices, $94B services, a white 2/3 line on "Two thirds" |
| point / loop | an awning drops over the phone and an OPEN sign lights on "storefront"; both fold away and the camera returns to frame 0 |

## Run it

```bash
raea/apple-iphone-3d/setup.sh     # media/ from public/ (voice, music, sfx, fonts as TTF), timings.json
raea/apple-iphone-3d/render.sh    # → raea/apple-iphone-3d/out/storefront.mp4 (+ .check.json from raea check)
```

One frame to look at: `raea render compositions/storefront.tsx --frame 120 -o out/f120.png` (from this folder).

## raea in a cloud container (no GPU)

The release binaries come from raea.io / GitHub releases, both blocked from cloud sessions, so the CLI is built from
source (`cargo build --release -p raea-cli --no-default-features`, about 35 min on 4 cores). One dependency,
ONNX Runtime, downloads its library from cdn.pyke.io (blocked too): take `libonnxruntime.so.1.28.0` from the
`onnxruntime==1.28.0` wheel on PyPI and build with `ORT_LIB_PATH=<dir> ORT_PREFER_DYNAMIC_LINK=1`, then run raea with
`LD_LIBRARY_PATH=<dir>`. Rendering uses Mesa's software Vulkan (`mesa-vulkan-drivers`, llvmpipe): about 0.95 s a
frame at 1080×1920, so a 42 s reel is about 20 minutes. On a Mac or a PC with a GPU, `curl -fsSL https://raea.io/install | sh`.

## Layout rules kept

- Safe area: nothing readable above y 250, below y 1440, or right of x 940 (raea's unknown-platform zone, stricter
  than the studio's 1016 above the rail).
- Camera shots were fitted (subject box → a rect of the stage band, clear of the figure slots on the left) with a
  small projection script, then checked on stills. The camera keeps a slow orbit so it never stands still.
- Every cue is timed from `timings.json` (`w(beat, word)`), never by eye.
- raea's contact check runs on every render: a coin passing into the phone or a tile through its base is an error.
