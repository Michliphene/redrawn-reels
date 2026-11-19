#!/usr/bin/env bash
# Crops the generated originals (media/plates/{nb,gpt}_*) into what the composition shows:
#   s_*.jpg full-screen 9:16 (1080×1920) · f_*.jpg framed 3:4 (900×1200) · c_*.jpg table cards 3:4 (900×1200)
set -euo pipefail
cd "$(dirname "$0")/media/plates"
s916() { [ -f "$1" ] && ffmpeg -y -loglevel error -i "$1" -vf "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=1080:1920:flags=lanczos" -q:v 3 "$2" || true; }
s34()  { [ -f "$1" ] && ffmpeg -y -loglevel error -i "$1" -vf "crop='min(iw,ih*3/4)':'min(ih,iw*4/3)',scale=900:1200:flags=lanczos" -q:v 3 "$2" || true; }
s916 nb_valley.jpg    s_valley.jpg
s916 nb_pickers.jpg   s_pickers.jpg
s916 nb_still.jpg     s_still.jpg
s916 nb_festival.jpg  s_festival.jpg
s916 nb_drop.png      s_drop.jpg
s34 gpt_hands.png     f_hands.jpg
s34 gpt_damask.png    c_damask.jpg
s34 gpt_scale.png     c_scale.jpg
s34 gpt_heap.png      c_heap.jpg
echo "plates ready: $(ls s_* f_* c_* 2>/dev/null | wc -l) files"
