#!/usr/bin/env bash
# Fills media/ from the studio's files: the voice, timings and music of `starbucks-10` (the text is the only thing kept
# from the Remotion episode), the sfx kit and the house fonts converted to TTF (raea's page engine loads TTF).
# Windows (Git Bash): needs `python` with fonttools + brotli (pip install fonttools brotli).
set -euo pipefail
cd "$(dirname "$0")"
R=../..
PY=python3; [ "$(python3 -c 'print(42)' 2>/dev/null)" = 42 ] || PY=python
mkdir -p media/fonts media/sfx out
cp "$R/public/episodes/starbucks-10/music.wav" media/
cp "$R/public/episodes/starbucks-10/voice.wav" media/voice.wav
cp "$R/public/episodes/starbucks-10/timings.json" compositions/timings.json
cp "$R"/public/sfx/*.wav media/sfx/
# AI backdrops (Canva generate-image), flipped top-bottom: a Cuboid's front face maps the picture upside down
mkdir -p media/art
for f in "$R"/public/episodes/starbucks-10/art/*.png; do
  $PY -c "import sys; from PIL import Image; Image.open(sys.argv[1]).transpose(Image.FLIP_TOP_BOTTOM).save(sys.argv[2])" "$f" "media/art/$(basename "$f")"
done
cp "$R/public/fonts/OFL.txt" "$R/public/fonts/LICENSES.md" media/fonts/
for f in BricolageGrotesque-latin InstrumentSerif-Italic-latin JetBrainsMono-latin; do
  $PY -c "from fontTools.ttLib import TTFont; f=TTFont('$R/public/fonts/$f.woff2'); f.flavor=None; f.save('media/fonts/$f.ttf')"
done
# a link on Linux/Mac; on Windows Git Bash `ln -s` copies, which is fine too
rm -rf compositions/media; ln -sfn ../media compositions/media 2>/dev/null || cp -r media compositions/media
echo "media ready"
