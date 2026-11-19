#!/usr/bin/env bash
# Crops the generated originals (media/plates/{nb,gpt}_*) into what the composition shows:
#   s_*.jpg  full-screen 9:16 paintings, 1080×1920      f_*.jpg  framed 3:4 plates, 900×1200      c_*.jpg  table cards 3:4
# Every crop is centred and keeps the subject in the central 70 % (checked on the contact sheet out/plates_sheet.jpg).
set -euo pipefail
cd "$(dirname "$0")/media/plates"
s916() { ffmpeg -y -loglevel error -i "$1" -vf "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=1080:1920" -q:v 3 "$2"; }
s34()  { ffmpeg -y -loglevel error -i "$1" -vf "crop='min(iw,ih*3/4)':'min(ih,iw*4/3)',scale=900:1200" -q:v 3 "$2"; }
s916 nb_whale_cabinet.jpg  s_whale_cabinet.jpg
s916 nb_ocean_bottle.jpg   s_ocean_bottle.jpg
s916 nb_jasmine_drawer.jpg s_jasmine_drawer.jpg
[ -f gpt_vanilla_1841.png ] && s916 gpt_vanilla_1841.png s_vanilla_1841.jpg
s34 gpt_ambergris_jar.png f_ambergris_jar.jpg
s34 nb_musk_window.jpg    f_musk_window.jpg
[ -f nb_rose_valley.jpg ] && s34 nb_rose_valley.jpg f_rose_valley.jpg
s34 gpt_vanilla.png       f_vanilla.jpg
s34 gpt_leather.png       c_leather.jpg
s34 gpt_beaver_plate.png  c_beaver.jpg
s34 nb_vetiver_paper.jpg  c_vetiver.jpg
[ -f nb_cover_bottle.jpg ] && s916 nb_cover_bottle.jpg s_cover_bottle.jpg
echo "plates ready: $(ls s_* f_* c_* | wc -l) files"
