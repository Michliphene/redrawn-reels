#!/usr/bin/env bash
# Crops the generated originals (media/plates/{nb,gpt}_*) into what the composition shows:
#   s_*.jpg full-screen 9:16 (1080×1920) · f_*.jpg framed 3:4 (900×1200) · c_*.jpg table cards 3:4 (900×1200)
set -euo pipefail
cd "$(dirname "$0")/media/plates"
s916() { [ -f "$1" ] && ffmpeg -y -loglevel error -i "$1" -vf "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=1080:1920" -q:v 3 "$2" || true; }
s34()  { [ -f "$1" ] && ffmpeg -y -loglevel error -i "$1" -vf "crop='min(iw,ih*3/4)':'min(ih,iw*4/3)',scale=900:1200" -q:v 3 "$2" || true; }
s916 nb_wall.jpg      s_wall.jpg
s916 nb_pylon.jpg     s_pylon.jpg
s916 nb_lab_room.jpg  s_lab_room.jpg
s916 nb_censer.jpg    s_censer.jpg
s916 nb_papyrus.jpg   s_papyrus.jpg
s916 nb_smoke.jpg     s_smoke.jpg
s34 gpt_kyphi_flask.png  f_kyphi_flask.jpg
s34 gpt_frankincense.png c_frankincense.jpg
s34 gpt_myrrh.png        c_myrrh.jpg
s34 gpt_kyphi_pellets.png c_kyphi.jpg
s34 gpt_ingredients.png  c_ingredients.jpg
echo "plates ready: $(ls s_* f_* c_* 2>/dev/null | wc -l) files"
