#!/usr/bin/env bash
# RECEIPTS #004 in raea. Usage: raea/apple-iphone-3d/render.sh [out-name]
# Render PNG frames for x264 and encode the mix separately.
set -euo pipefail
cd "$(dirname "$0")"
NAME="${1:-storefront}"
[[ "$NAME" =~ ^[a-zA-Z0-9][a-zA-Z0-9_-]*$ && "$#" -le 1 ]] || { echo "Invalid raea output name" >&2; exit 2; }
PROJECT=raea/apple-iphone-3d
ID=apple-iphone
mkdir -p out
LOCK=out/.project.lock
mkdir "$LOCK" || { echo "raea media or render preparation is already running" >&2; exit 1; }
STAGE=
cleanup() {
  if [[ -n "$STAGE" ]]; then rm -rf -- "$STAGE"; fi
  rmdir "$LOCK"
}
trap cleanup EXIT
STAGE=$(mktemp -d out/.render.XXXXXX)
mkdir "$STAGE/frames"
RAEA_VERSION=$(raea --version)
if [[ -n "${RAEA_EXPECTED_VERSION:-}" && "$RAEA_EXPECTED_VERSION" != "$RAEA_VERSION" ]]; then
  echo "Expected $RAEA_EXPECTED_VERSION; got $RAEA_VERSION" >&2
  exit 1
fi
FFMPEG_VERSION=$(ffmpeg -version)
AUDIO_FILTER="acompressor=threshold=0.08:ratio=3:attack=4:release=90,volume=8.9dB"
X264_PARAMS="aq-mode=3:aq-strength=1.1:deblock=-1,-1"

# Refresh every time so timing-only changes and removed source assets reach the renderer.
bash ./setup.sh --render-locked
(
  cd ../..
  node --input-type=module - "$PROJECT/$STAGE/recipe.json" "$PROJECT" "$ID" "$RAEA_VERSION" "$FFMPEG_VERSION" "$AUDIO_FILTER" "$X264_PARAMS" "$NAME" <<'JS'
import path from 'node:path';
import {existingVoice, writeJson} from './scripts/render-tools.mjs';

const [, , output, project, audioId, raea, ffmpeg, audioFilter, x264, variantId] = process.argv;
const voice = existingVoice(path.join('public/episodes', audioId));
if (voice.status !== 'verified') console.warn(`Voice for ${audioId}: ${voice.status}`);
writeJson(output, {
  project, composition: 'compositions/storefront.tsx', audioId, voice, variantId,
  toolVersions: {node: process.version, raea, ffmpeg: ffmpeg.split(/\r?\n/, 1)[0]},
  preparation: {voiceFilter: 'volume=0.85,adeclip=threshold=1'},
  renderOptions: {fps: 30, codec: 'libx264', crf: 14, preset: 'slow', pixelFormat: 'yuv420p', x264},
  audioOptions: {filter: audioFilter, codec: 'aac', bitrate: '256k'},
});
JS
  node scripts/delivery.mjs snapshot "$ID" --engine raea --output "$PROJECT/$STAGE/snapshot.json" --recipe "$PROJECT/$STAGE/recipe.json"
)

raea render compositions/storefront.tsx -o "$STAGE/frames/" --manifest "$STAGE/raea.json"
raea render compositions/storefront.tsx -o "$STAGE/mix.wav"
ffmpeg -y -loglevel error -framerate 30 -i "$STAGE/frames/frame-%05d.png" -i "$STAGE/mix.wav" -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 14 -x264-params "$X264_PARAMS" -pix_fmt yuv420p \
  -af "$AUDIO_FILTER" -c:a aac -b:a 256k -movflags +faststart -shortest "$STAGE/video.mp4"
CHECK_STATUS=0
raea check "$STAGE/video.mp4" --manifest "$STAGE/raea.json" --shape 9:16 -o "$STAGE/check.json" || CHECK_STATUS=$?
if [[ -f "$STAGE/check.json" ]]; then mv -f -- "$STAGE/check.json" "out/$NAME.check.json"; fi
if [[ "$CHECK_STATUS" != 0 ]]; then exit "$CHECK_STATUS"; fi

# Capture against the final path so the published manifest can resolve its video later.
FINAL="out/$NAME.mp4"
if [[ -f "$FINAL" ]]; then cp -- "$FINAL" "$STAGE/previous.mp4"; fi
mv -f -- "$STAGE/video.mp4" "$FINAL"
if ! (cd ../.. && node scripts/delivery.mjs capture "$ID" --snapshot "$PROJECT/$STAGE/snapshot.json" \
  --video "$PROJECT/$FINAL" --manifest "$PROJECT/$STAGE/manifest.json") ||
  ! mv -f -- "$STAGE/manifest.json" "out/$NAME.render.json"; then
  if [[ -f "$STAGE/previous.mp4" ]]; then mv -f -- "$STAGE/previous.mp4" "$FINAL"; else rm -- "$FINAL"; fi
  exit 1
fi
mv -f -- "$STAGE/raea.json" "out/$NAME.raea.json"
echo "done -> $PROJECT/$FINAL"
