#!/usr/bin/env bash
# SILLAGE N°2 (kyphi) in raea: media → frames (PNG) + mix (WAV) → x264 → raea check.
# Usage: raea/sillage-002-kyphi/render.sh [out-name] [--stills "T1,T2,..."]
# The raea CLI: on PATH, else the Windows app's (RAEA_BIN overrides). Same encode path as raea/apple-iphone-3d.
set -euo pipefail
cd "$(dirname "$0")"
RAEA="${RAEA_BIN:-$(command -v raea || true)}"
[ -n "$RAEA" ] || RAEA="$LOCALAPPDATA/Programs/raea/raea/bin/raea.exe"
[ -x "$RAEA" ] || { echo "!! raea CLI not found (set RAEA_BIN)" >&2; exit 1; }
NAME="${1:-sillage}"
[ -f media/voice.wav ] || ./setup.sh
rm -rf out/frames && mkdir -p out/frames
"$RAEA" render compositions/sillage.tsx -o out/frames/ --manifest "out/$NAME.render.json"
"$RAEA" render compositions/sillage.tsx -o out/mix.wav
ffmpeg -y -loglevel error -framerate 30 -i out/frames/frame-%05d.png -i out/mix.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 14 -x264-params aq-mode=3:aq-strength=1.1:deblock=-1,-1 -pix_fmt yuv420p \
  -af "acompressor=threshold=0.08:ratio=3:attack=4:release=90,volume=9.4dB,alimiter=limit=0.81:level=disabled" -c:a aac -b:a 256k \
  -movflags +faststart -shortest "out/$NAME.mp4"
"$RAEA" check "out/$NAME.mp4" --manifest "out/$NAME.render.json" --shape 9:16 -o "out/$NAME.check.json" | grep -v '^raea: note' || true
echo "done -> raea/sillage-002-kyphi/out/$NAME.mp4"
