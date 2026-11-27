#!/usr/bin/env bash
# SILLAGE N°6 (ambergris) on the kit: pre-flight (blocks on ✗) → media → frames + mix → x264 → raea check.
# Usage: raea/sillage-006-ambergris-v2/render.sh [out-name]        SAFE_ZONES=1 draws the platform's forbidden bands.
#        raea/sillage-006-ambergris-v2/render.sh --stills "0,300,1200"   frames only (out/stills/), no video
set -euo pipefail
cd "$(dirname "$0")"
RAEA="${RAEA_BIN:-$(command -v raea || true)}"
[ -n "$RAEA" ] || RAEA="$LOCALAPPDATA/Programs/raea/raea/bin/raea.exe"
[ -x "$RAEA" ] || { echo "!! raea CLI not found (set RAEA_BIN)" >&2; exit 1; }
./setup.sh
node ../sillage-kit/tools/validate.mjs . || { echo "!! pre-flight failed: fix every ✗ above (render blocked)" >&2; exit 1; }
if [ "${1:-}" = "--stills" ]; then
  mkdir -p out/stills
  IFS=, read -ra FR <<< "${2:-0}"
  for f in "${FR[@]}"; do "$RAEA" render compositions/sillage.tsx --frame "$f" -o "out/stills/f$f.png" | grep -E "error|warn" || true; done
  echo "stills -> raea/sillage-006-ambergris-v2/out/stills/"; exit 0
fi
NAME="${1:-sillage}"
rm -rf out/frames && mkdir -p out/frames
"$RAEA" render compositions/sillage.tsx -o out/frames/ --manifest "out/$NAME.render.json"
"$RAEA" render compositions/sillage.tsx -o out/mix.wav
ffmpeg -y -loglevel error -framerate 30 -i out/frames/frame-%05d.png -i out/mix.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 14 -x264-params aq-mode=3:aq-strength=1.1:deblock=-1,-1 -pix_fmt yuv420p \
  -af "acompressor=threshold=0.08:ratio=3:attack=4:release=90,volume=9.4dB,alimiter=limit=0.81:level=disabled" -c:a aac -b:a 256k \
  -movflags +faststart -shortest "out/$NAME.mp4"
"$RAEA" check "out/$NAME.mp4" --manifest "out/$NAME.render.json" --shape 9:16 -o "out/$NAME.check.json" | grep -v '^raea: note' || true
echo "done -> raea/sillage-006-ambergris-v2/out/$NAME.mp4"
