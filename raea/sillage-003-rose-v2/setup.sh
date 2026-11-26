#!/usr/bin/env bash
# SILLAGE N°3 remaster on the shared kit. Fills media/: voice, timings, music of scent-003-rose-v2, the sfx kit + the
# kit's drop, fonts (TTF), and the N°3 plates cropped FULL FRAME 9:16 (no cards, no frames: kit rule P4).
# Windows (Git Bash): needs `python` with fonttools + brotli, and ffmpeg.
set -euo pipefail
cd "$(dirname "$0")"
R=../..
EP=scent-003-rose-v2
SRC=../sillage-003-rose/media/plates
PY=python3; [ "$(python3 -c 'print(42)' 2>/dev/null)" = 42 ] || PY=python
mkdir -p media/fonts media/sfx media/plates out
cp "$R/public/episodes/$EP/music.wav" "$R/public/episodes/$EP/voice.wav" media/
cp "$R/public/episodes/$EP/timings.json" compositions/timings.json
cp "$R"/public/sfx/*.wav media/sfx/
[ -f media/sfx/drop.wav ] || $PY ../sillage-kit/tools/drop.py media/sfx/drop.wav
cp "$R/public/fonts/OFL.txt" "$R/public/fonts/LICENSES.md" media/fonts/
for f in BricolageGrotesque-latin InstrumentSerif-Italic-latin JetBrainsMono-latin; do
  [ -f "media/fonts/$f.ttf" ] || $PY -c "from fontTools.ttLib import TTFont; f=TTFont('$R/public/fonts/$f.woff2'); f.flavor=None; f.save('media/fonts/$f.ttf')"
done
# full-frame 9:16 crops (centred; `focus` in reel.json moves the Ken Burns origin, not the crop)
s916() { [ -f "$SRC/$1" ] && ffmpeg -y -loglevel error -i "$SRC/$1" -vf "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=1080:1920:flags=lanczos" -q:v 3 "media/plates/$2" || echo "!! missing $1"; }
s916 nb_valley.jpg   s_valley.jpg
s916 nb_pickers.jpg  s_pickers.jpg
s916 nb_still.jpg    s_still.jpg
s916 nb_festival.jpg s_festival.jpg
s916 gpt_damask.png  s_damask.jpg
s916 gpt_hands.png   s_hands.jpg
s916 gpt_scale.png   s_scale.jpg
# the debug flag file the composition imports (SAFE_ZONES=1 draws the platform's forbidden bands)
if [ "${SAFE_ZONES:-0}" = 1 ]; then echo '{"safeZones": true}'; else echo '{"safeZones": false}'; fi > compositions/flags.json
rm -rf compositions/media && cp -r media compositions/media
echo "media ready: $(ls media/plates | wc -l) plates, flags $(cat compositions/flags.json)"
