#!/usr/bin/env bash
# Crops the Nano Banana originals (media/plates/nb_*) into what the composition shows:
#   s_*.jpg full-screen 9:16 (1080×1920) · c_*.jpg table cards 3:4 (900×1200)
# A missing original gets a flat placeholder so stills can be checked before the images exist.
set -euo pipefail
cd "$(dirname "$0")/media/plates"
pick() { for e in jpg jpeg png; do [ -f "$1.$e" ] && { echo "$1.$e"; return; }; done; echo ""; }
s916() { local f; f=$(pick "$1"); if [ -n "$f" ]; then ffmpeg -y -loglevel error -i "$f" -vf "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=1080:1920:flags=lanczos" -q:v 3 "$2"; else ffmpeg -y -loglevel error -f lavfi -i "color=c=$3:s=1080x1920" -frames:v 1 "$2"; fi; }
s34()  { local f; f=$(pick "$1"); if [ -n "$f" ]; then ffmpeg -y -loglevel error -i "$f" -vf "crop='min(iw,ih*3/4)':'min(ih,iw*4/3)',scale=900:1200:flags=lanczos" -q:v 3 "$2"; else ffmpeg -y -loglevel error -f lavfi -i "color=c=$3:s=900x1200" -frames:v 1 "$2"; fi; }
s916 nb_boat  s_boat.jpg  0x1E3A4A
s916 nb_beach s_beach.jpg 0x6E6A60
s916 nb_whale s_whale.jpg 0x0E2236
s916 nb_sea   s_sea.jpg   0x24485A
s34  nb_beak    c_beak.jpg    0xE8DCC8
s34  nb_history c_history.jpg 0xE8DCC8
s34  nb_sage    c_sage.jpg    0xE8DCC8
echo "plates ready: $(ls s_* c_* 2>/dev/null | wc -l) files"
