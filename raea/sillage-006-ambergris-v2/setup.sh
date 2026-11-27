#!/usr/bin/env bash
# SILLAGE N°6 (ambergris) on the shared kit. Fills media/: voice, timings, music of scent-006-ambergris, the sfx kit + the
# kit's drop, fonts (TTF), and the plates cropped FULL FRAME 9:16 (kit rule P4) from media/plates/nb_*.
# Windows (Git Bash): needs `python` with fonttools + brotli, and ffmpeg.
set -euo pipefail
cd "$(dirname "$0")"
R=../..
EP=scent-006-ambergris
PY=python3; [ "$(python3 -c 'print(42)' 2>/dev/null)" = 42 ] || PY=python
mkdir -p media/fonts media/sfx media/plates out
cp "$R/public/episodes/$EP/music.wav" "$R/public/episodes/$EP/voice.wav" media/
# timings: the voice says "E U": one caption word "EU," (same start/end span)
$PY -c "
import json,sys
t=json.load(open('$R/public/episodes/$EP/timings.json',encoding='utf-8'))
for b in t['beats']:
  ws=[]
  for w in b['words']:
    if ws and ws[-1]['w']=='E' and w['w'].startswith('U'): ws[-1]={**ws[-1],'w':'EU'+w['w'][1:],'end':w['end']}
    else: ws.append(w)
  b['words']=ws
json.dump(t,open('compositions/timings.json','w',encoding='utf-8'),ensure_ascii=False)"
cp "$R"/public/sfx/*.wav media/sfx/
[ -f media/sfx/drop.wav ] || $PY ../sillage-kit/tools/drop.py media/sfx/drop.wav
cp "$R/public/fonts/OFL.txt" "$R/public/fonts/LICENSES.md" media/fonts/
for f in BricolageGrotesque-latin InstrumentSerif-Italic-latin JetBrainsMono-latin; do
  [ -f "media/fonts/$f.ttf" ] || $PY -c "from fontTools.ttLib import TTFont; f=TTFont('$R/public/fonts/$f.woff2'); f.flavor=None; f.save('media/fonts/$f.ttf')"
done
pick() { for e in jpg jpeg png; do [ -f "media/plates/$1.$e" ] && { echo "media/plates/$1.$e"; return; }; done; echo ""; }
s916() { local f; f=$(pick "$1"); if [ -n "$f" ]; then ffmpeg -y -loglevel error -i "$f" -vf "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=1080:1920:flags=lanczos" -q:v 3 "media/plates/$2"; else echo "!! missing $1 (placeholder)"; ffmpeg -y -loglevel error -f lavfi -i "color=c=0x2A2030:s=1080x1920" -frames:v 1 "media/plates/$2"; fi; }
s916 nb_boat    s_boat.jpg
s916 nb_lump    s_lump.jpg
s916 nb_whale   s_whale.jpg
s916 nb_beak    s_beak.jpg
s916 nb_sea     s_sea.jpg
s916 nb_history s_history.jpg
s916 nb_sage    s_sage.jpg
if [ "${SAFE_ZONES:-0}" = 1 ]; then echo '{"safeZones": true}'; else echo '{"safeZones": false}'; fi > compositions/flags.json
rm -rf compositions/media && cp -r media compositions/media
echo "media ready: $(ls media/plates/s_* | wc -l) plates, flags $(cat compositions/flags.json)"
