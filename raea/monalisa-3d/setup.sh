#!/usr/bin/env bash
# Fills media/ from the studio's files: the voice, timings and music of `getaway-003-monalisa` (the text and the facts are
# the only things kept from the Remotion episode), its three public-domain images, the paper map drawn from the episode's
# geojson, the sfx kit and the house fonts converted to TTF (raea's page engine loads TTF).
# Windows (Git Bash): needs `python` with Pillow, fonttools + brotli (pip install pillow fonttools brotli).
set -euo pipefail
cd "$(dirname "$0")"
R=../..
EP=getaway-003-monalisa
PY=python3; [ "$(python3 -c 'print(42)' 2>/dev/null)" = 42 ] || PY=python
mkdir -p media/fonts media/sfx media/img out
cp "$R/public/episodes/$EP/music.wav" media/
cp "$R/public/episodes/$EP/voice.wav" media/voice.wav
cp "$R/public/episodes/$EP/timings.json" compositions/timings.json
cp "$R/public/assets/art/monalisa.jpg" "$R/public/assets/portraits/peruggia.jpg" "$R/public/assets/archive/puck_louvre_1911.jpg" media/img/
cp "$R"/public/sfx/*.wav media/sfx/
cp "$R/public/fonts/OFL.txt" "$R/public/fonts/LICENSES.md" media/fonts/ 2>/dev/null || true
for f in BricolageGrotesque-latin InstrumentSerif-Italic-latin CourierPrime-Regular-latin CourierPrime-Bold-latin; do
  $PY -c "from fontTools.ttLib import TTFont; f=TTFont('$R/public/fonts/$f.woff2'); f.flavor=None; f.save('media/fonts/$f.ttf')"
done
$PY make-map.py "$R/public/data/$EP.geojson" media
# a link on Linux/Mac; on Windows Git Bash `ln -s` copies, which is fine too
rm -rf compositions/media; ln -sfn ../media compositions/media 2>/dev/null || cp -r media compositions/media
echo "media ready"
