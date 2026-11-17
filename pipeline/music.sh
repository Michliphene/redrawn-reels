#!/usr/bin/env bash
# Procedural music bed (no third-party rights). Replace with a licensed track via public/episodes/<id>/music.wav
# (+ an empty music.lock) if wanted.
# Usage: pipeline/music.sh <episode_id> <seconds> [style]
#   style "ambient" (default, REDRAWN / RECEIPTS): a soft drone in A
#   style "noir"    (THE GETAWAY): low D-minor drone, a muted heartbeat bass, a ticking clock, a far vibraphone motif
# The bed is levelled at −26 LUFS; the whole reel is normalised to −14 LUFS at the end of pipeline/render.sh.
set -euo pipefail
OUT="public/episodes/$1/music.wav"; D="${2:-62}"; STYLE="${3:-ambient}"
FADE_AT=$(echo "$D-2"|bc)
if [ "$STYLE" = "noir" ]; then
  # D2 73.4 · F2 87.3 · A2 110 · C#3 138.6 (the "detective" leading tone) · D4 293.7 · F4 349.2 · A4 440 · Bb3 233.1
  ffmpeg -y -loglevel error -f lavfi -i "aevalsrc='
0.15*sin(2*PI*73.42*t)*(0.65+0.35*sin(2*PI*t/12))+
0.07*sin(2*PI*110*t)*(0.5+0.5*sin(2*PI*t/9))+
0.05*sin(2*PI*87.31*t)*(0.5+0.5*sin(2*PI*t/15+1))+
0.035*sin(2*PI*138.59*t)*(0.5+0.5*sin(2*PI*t/7+2))*(0.5+0.5*sin(2*PI*t/23))+
0.32*sin(2*PI*55*t)*exp(-mod(t,1.25)*9)+0.20*sin(2*PI*52*t)*exp(-mod(t-0.28,1.25)*11)*gte(mod(t,1.25),0.28)+
0.05*sin(2*PI*293.66*t)*exp(-mod(t,5)*1.6)*lt(mod(t,10),5)+
0.04*sin(2*PI*349.23*t)*exp(-mod(t-0.62,5)*1.6)*gte(mod(t,5),0.62)*lt(mod(t,10),5)+
0.04*sin(2*PI*233.08*t)*exp(-mod(t-1.25,5)*1.4)*gte(mod(t,5),1.25)*gte(mod(t,10),5)
|0.15*sin(2*PI*73.6*t)*(0.65+0.35*sin(2*PI*t/13))+
0.07*sin(2*PI*110.4*t)*(0.5+0.5*sin(2*PI*t/10))+
0.05*sin(2*PI*87.0*t)*(0.5+0.5*sin(2*PI*t/14+1))+
0.035*sin(2*PI*138.9*t)*(0.5+0.5*sin(2*PI*t/8+2))*(0.5+0.5*sin(2*PI*t/23))+
0.32*sin(2*PI*55*t)*exp(-mod(t,1.25)*9)+0.20*sin(2*PI*52*t)*exp(-mod(t-0.28,1.25)*11)*gte(mod(t,1.25),0.28)+
0.04*sin(2*PI*440*t)*exp(-mod(t-2.5,5)*1.6)*gte(mod(t,5),2.5)*lt(mod(t,10),5)+
0.04*sin(2*PI*293.66*t)*exp(-mod(t-3.1,5)*1.4)*gte(mod(t,5),3.1)*gte(mod(t,10),5)
':s=48000:d=$D" -f lavfi -i "anoisesrc=c=white:a=0.5:d=$D:r=48000" -f lavfi -i "anoisesrc=c=brown:a=0.03:d=$D:r=48000" \
    -filter_complex "[1]highpass=f=5000,volume='0.09*exp(-mod(t,0.625)*60)':eval=frame,aformat=channel_layouts=stereo[tick];[2]lowpass=f=300,aformat=channel_layouts=stereo[rumble];[0][tick][rumble]amix=inputs=3:normalize=0,lowpass=f=3200,aecho=0.8:0.6:180|340:0.3|0.2,afade=t=in:d=1.2,afade=t=out:st=$FADE_AT:d=2,loudnorm=I=-26:TP=-3" -ar 48000 "$OUT"
else
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
  -filter_complex "[1]lowpass=f=600,aformat=channel_layouts=stereo[n];[0][n]amix=inputs=2:normalize=0,lowpass=f=2400,aecho=0.8:0.7:120|260:0.35|0.25,afade=t=in:d=1.5,afade=t=out:st=$FADE_AT:d=2,loudnorm=I=-26:TP=-3" -ar 48000 "$OUT"
fi
echo "music ($STYLE) -> $OUT"
