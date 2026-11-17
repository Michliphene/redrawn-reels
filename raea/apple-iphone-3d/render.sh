#!/usr/bin/env bash
# RECEIPTS #004 in raea: media → frames (PNG) + mix (WAV) → x264 → raea check.
# Usage: raea/apple-iphone-3d/render.sh [out-name]      Needs the `raea` CLI on PATH (see README.md).
#
# Why not `raea render -o x.mp4` directly: its encoder starves the dark greens of this set (raea check: "blotching"),
# so frames go to PNG and x264 encodes them at CRF 14. And why not `<Mix lufs={-14}>`: its limiter leaves flat-topped
# peaks that raea check flags as clipping; a gentle compressor and a linear gain pass every check (−15 LUFS, −1.2 dBTP).
set -euo pipefail
cd "$(dirname "$0")"
NAME="${1:-storefront}"
[ -f media/voice.wav ] || ./setup.sh
rm -rf out/frames && mkdir -p out/frames
raea render compositions/storefront.tsx -o out/frames/ --manifest "out/$NAME.render.json"
raea render compositions/storefront.tsx -o out/mix.wav
ffmpeg -y -loglevel error -framerate 30 -i out/frames/frame-%05d.png -i out/mix.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 14 -x264-params aq-mode=3:aq-strength=1.1:deblock=-1,-1 -pix_fmt yuv420p \
  -af "acompressor=threshold=0.08:ratio=3:attack=4:release=90,volume=8.9dB" -c:a aac -b:a 256k \
  -movflags +faststart -shortest "out/$NAME.mp4"
raea check "out/$NAME.mp4" --manifest "out/$NAME.render.json" --shape 9:16 -o "out/$NAME.check.json" | grep -v '^raea: note' || true
echo "done -> raea/apple-iphone-3d/out/$NAME.mp4"
