#!/usr/bin/env bash
# Refresh the source episode's WAVs/timings and convert studio fonts for raea.
set -euo pipefail
cd "$(dirname "$0")"
R=../..
SOURCE="$R/public/episodes/apple-iphone"
mkdir -p out
LOCK=out/.project.lock
OWN_LOCK=0
if [[ "${1:-}" != --render-locked ]]; then
  mkdir "$LOCK" || { echo "raea media or render preparation is already running" >&2; exit 1; }
  OWN_LOCK=1
fi
STAGE=
cleanup() {
  if [[ -n "$STAGE" ]]; then rm -rf -- "$STAGE"; fi
  if [[ "$OWN_LOCK" = 1 ]]; then rmdir "$LOCK"; fi
}
trap cleanup EXIT
STAGE=$(mktemp -d out/.media.XXXXXX)
mkdir -p "$STAGE/media/fonts" "$STAGE/media/sfx"
cp "$SOURCE/music.wav" "$STAGE/media/"
# Attenuate and de-clip the voice for raea's own mix.
ffmpeg -y -loglevel error -i "$SOURCE/voice.wav" -af "volume=0.85,adeclip=threshold=1" "$STAGE/media/voice.wav"
cp "$SOURCE/timings.json" "$STAGE/timings.json"
cp "$R"/public/sfx/*.wav "$STAGE/media/sfx/"
cp "$R/public/fonts/OFL.txt" "$R/public/fonts/LICENSES.md" "$STAGE/media/fonts/"
for f in BricolageGrotesque-latin InstrumentSerif-Italic-latin JetBrainsMono-latin; do
  "${STUDIO_PYTHON:-python3}" -c 'import sys; from fontTools.ttLib import TTFont; f = TTFont(sys.argv[1]); f.flavor = None; f.save(sys.argv[2])' \
    "$R/public/fonts/$f.woff2" "$STAGE/media/fonts/$f.ttf"
done

if [[ -e media || -L media ]]; then mv -- media "$STAGE/previous-media"; fi
if [[ -e compositions/media || -L compositions/media ]]; then mv -- compositions/media "$STAGE/previous-link"; fi
mv -- "$STAGE/media" media
ln -s ../media compositions/media
if ! cmp -s "$STAGE/timings.json" compositions/timings.json; then
  mv -f -- "$STAGE/timings.json" compositions/timings.json
fi
echo "media ready"
