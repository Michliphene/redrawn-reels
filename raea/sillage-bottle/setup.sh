#!/usr/bin/env bash
# Fills media/ from the studio's files: the voice, timings and music of `scent-001-bottle` (only the text is kept from
# that episode), the sfx kit and the house fonts converted to TTF (raea's page engine loads TTF).
# Windows (Git Bash): needs `python` with fonttools + brotli (pip install fonttools brotli).
set -euo pipefail
cd "$(dirname "$0")"
R=../..
PY=python3; [ "$(python3 -c 'print(42)' 2>/dev/null)" = 42 ] || PY=python
mkdir -p media/fonts media/sfx out
cp "$R/public/episodes/scent-001-bottle/music.wav" media/
cp "$R/public/episodes/scent-001-bottle/voice.wav" media/voice.wav
cp "$R/public/episodes/scent-001-bottle/timings.json" compositions/timings.json
cp "$R"/public/sfx/*.wav media/sfx/
cp "$R/public/fonts/OFL.txt" "$R/public/fonts/LICENSES.md" media/fonts/
for f in BricolageGrotesque-latin InstrumentSerif-Italic-latin JetBrainsMono-latin; do
  $PY -c "from fontTools.ttLib import TTFont; f=TTFont('$R/public/fonts/$f.woff2'); f.flavor=None; f.save('media/fonts/$f.ttf')"
done
rm -rf compositions/media; ln -sfn ../media compositions/media 2>/dev/null || cp -r media compositions/media
echo "media ready"
