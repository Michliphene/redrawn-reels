#!/usr/bin/env bash
# SILLAGE N°7 (oud) on the shared kit. Fills media/: voice, timings, music of scent-007-oud, the sfx kit + the
# kit's drop, fonts (TTF), and the N°7 plates cropped FULL FRAME 9:16 (no cards, no frames: kit rule P4).
# Windows (Git Bash): needs `python` with fonttools + brotli, and ffmpeg.
set -euo pipefail
cd "$(dirname "$0")"
R=../..
EP=scent-007-oud
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
# full-frame 9:16 crops of the photoreal plates (plates-src/, prompts in plates.json; kit rule P4)
SRC=plates-src
s916() { for x in png jpg; do [ -f "$SRC/$1.$x" ] && { ffmpeg -y -loglevel error -i "$SRC/$1.$x" -vf "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=1080:1920:flags=lanczos" -q:v 2 "media/plates/$2"; return; }; done; echo "!! missing $1"; }
s916 pv_forest     s_forest.jpg
s916 pv_wound_c    s_wound.jpg   # pv_wound.jpg came letterboxed: rows 642-2170 cropped to 9:16
s916 pv_agarwood_c  s_agarwood.jpg   # pv_agarwood.jpg has blurred fill above/below: rows 794-1978 cropped to 9:16
s916 pv_incense    s_incense.jpg
s916 pv_felled     s_felled.jpg
s916 pv_plantation_c s_plantation.jpg   # letterboxed: rows 672-2094 cropped to 9:16
# the debug flag file the composition imports (SAFE_ZONES=1 draws the platform's forbidden bands)
if [ "${SAFE_ZONES:-0}" = 1 ]; then echo '{"safeZones": true}'; else echo '{"safeZones": false}'; fi > compositions/flags.json
rm -rf compositions/media && cp -r media compositions/media
echo "media ready: $(ls media/plates | wc -l) plates, flags $(cat compositions/flags.json)"
