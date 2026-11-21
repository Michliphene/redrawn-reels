#!/usr/bin/env bash
# UNGRADED #006 "Google graded the grades" in raea: media → frames (PNG) + mix (WAV) → x264 at −14 LUFS → raea check.
# Usage: raea/ungraded-006-gpa/render.sh [out-name]
# The raea CLI: on PATH, else the Windows app's (RAEA_BIN overrides). Same encode path as raea/monalisa-3d.
set -euo pipefail
cd "$(dirname "$0")"
RAEA="${RAEA_BIN:-$(command -v raea || true)}"
[ -n "$RAEA" ] || RAEA="$LOCALAPPDATA/Programs/raea/raea/bin/raea.exe"
[ -x "$RAEA" ] || { echo "!! raea CLI not found (set RAEA_BIN)" >&2; exit 1; }
NAME="${1:-gpa}"
[ -f media/voice.wav ] && [ -f compositions/glyphs.json ] || ./setup.sh
rm -rf out/frames out/chunk && mkdir -p out/frames
# Every live page is a new texture each frame, and raea builds a whole render's frames before drawing them: one call
# for the full reel runs the GPU out of memory, so frames go in chunks (--at writes them 0..n-1, renamed after).
PY=python3; [ "$($PY -c 'print(42)' 2>/dev/null)" = 42 ] || PY=python
TOTAL=$($PY -c "import json,math; print(math.ceil((json.load(open('compositions/timings.json'))['duration']+0.5)*30))")
CH=150
for ((a = 0; a < TOTAL; a += CH)); do
  b=$(( a + CH < TOTAL ? a + CH : TOTAL ))
  rm -rf out/chunk
  "$RAEA" render compositions/gpa.tsx --composition gpa --at "$($PY -c "print(','.join(map(str, range($a, $b))))")" -o out/chunk/ \
    --manifest "out/chunk.render.json" | grep -E "REFUSED|error" || true
  for ((i = a; i < b; i++)); do mv "out/chunk/frame-$(printf %05d $((i - a))).png" "out/frames/frame-$(printf %05d $i).png"; done
  [ $a -eq 0 ] && cp out/chunk.render.json "out/$NAME.render.json"
  echo "frames $a-$((b - 1)) / $TOTAL"
done
[ -f "out/frames/frame-$(printf %05d $((TOTAL - 1))).png" ] || { echo "!! frames missing" >&2; exit 1; }
"$RAEA" render compositions/gpa.tsx --composition gpa -o out/mix.wav | grep -v "exposure:" || true
# −14 LUFS without flat tops: a gentle compressor, then loudnorm in LINEAR mode from a first measuring pass
# (single-pass loudnorm limits dynamically, and raea check reads its flattened peaks as clipping).
COMP="acompressor=threshold=-22dB:ratio=3:attack=5:release=120:makeup=1"
MEAS=$(ffmpeg -nostats -i out/mix.wav -af "$COMP,loudnorm=I=-14:TP=-2.5:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
val() { echo "$MEAS" | $PY -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
NORM="loudnorm=I=-14:TP=-2.5:LRA=11:linear=true:measured_I=$(val input_i):measured_TP=$(val input_tp):measured_LRA=$(val input_lra):measured_thresh=$(val input_thresh):offset=$(val target_offset)"
ffmpeg -y -loglevel error -framerate 30 -i out/frames/frame-%05d.png -i out/mix.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p \
  -af "$COMP,$NORM" -ar 48000 -c:a aac -b:a 256k \
  -movflags +faststart -shortest "out/$NAME.mp4"
"$RAEA" check "out/$NAME.mp4" --manifest "out/$NAME.render.json" --shape 9:16 -o "out/$NAME.check.json" | grep -v '^raea: note' || true
echo "done -> raea/ungraded-006-gpa/out/$NAME.mp4"
