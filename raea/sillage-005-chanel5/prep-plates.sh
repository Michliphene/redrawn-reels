#!/usr/bin/env bash
# Crops the generated originals (media/plates/{nb,gpt}_*): s_*.jpg full 9:16 (1080x1920) · c_*.jpg cards 3:4 (900x1200)
set -euo pipefail
cd "$(dirname "$0")/media/plates"
s916() { [ -f "$1" ] && ffmpeg -y -loglevel error -i "$1" -vf "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=1080:1920:flags=lanczos" -q:v 3 "$2" || true; }
s34()  { [ -f "$1" ] && ffmpeg -y -loglevel error -i "$1" -vf "crop='min(iw,ih*3/4)':'min(ih,iw*4/3)',scale=900:1200:flags=lanczos" -q:v 3 "$2" || true; }
for f in nb_jasmine nb_paris nb_nightstand; do for e in jpg png; do s916 $f.$e s_${f#nb_}.jpg; done; done
for f in gpt_soap gpt_tape; do s34 $f.png c_${f#gpt_}.jpg; done
echo "plates ready: $(ls s_* c_* 2>/dev/null | wc -l) files"
