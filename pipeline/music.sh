#!/usr/bin/env bash
# Procedural ambient bed (no third-party rights). Replace with a licensed track via public/episodes/<id>/music.wav if wanted.
# Usage: pipeline/music.sh <episode_id> <seconds>
set -euo pipefail
OUT="public/episodes/$1/music.wav"; D="${2:-62}"
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc='
0.16*sin(2*PI*55*t)*(0.6+0.4*sin(2*PI*t/16))+
0.10*sin(2*PI*110*t)+
0.07*sin(2*PI*130.81*t)*(0.5+0.5*sin(2*PI*t/8))+
0.06*sin(2*PI*164.81*t)*(0.5+0.5*sin(2*PI*t/11+1))+
0.05*sin(2*PI*196*t)*(0.5+0.5*sin(2*PI*t/13+2))+
0.035*sin(2*PI*246.94*t)*(0.5+0.5*sin(2*PI*t/7+3))+
0.05*sin(2*PI*55*t)*exp(-mod(t,1.875)*5)*sin(2*PI*2*t)*0
|0.16*sin(2*PI*55.2*t)*(0.6+0.4*sin(2*PI*t/16))+
0.10*sin(2*PI*110.3*t)+
0.07*sin(2*PI*130.6*t)*(0.5+0.5*sin(2*PI*t/9))+
0.06*sin(2*PI*165.1*t)*(0.5+0.5*sin(2*PI*t/12+1))+
0.05*sin(2*PI*196.3*t)*(0.5+0.5*sin(2*PI*t/14+2))+
0.035*sin(2*PI*247.2*t)*(0.5+0.5*sin(2*PI*t/6+3))
':s=48000:d=$D" -f lavfi -i "anoisesrc=c=pink:a=0.02:d=$D:r=48000" \
  -filter_complex "[1]lowpass=f=600,aformat=channel_layouts=stereo[n];[0][n]amix=inputs=2:normalize=0,lowpass=f=2400,aecho=0.8:0.7:120|260:0.35|0.25,afade=t=in:d=1.5,afade=t=out:st=$(echo "$D-2"|bc):d=2,loudnorm=I=-26:TP=-3" -ar 48000 "$OUT"
echo "music -> $OUT"
