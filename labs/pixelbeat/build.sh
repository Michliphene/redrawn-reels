#!/usr/bin/env bash
# Pipeline complet : partition -> audio -> rendu -> contrôle qualité.
# Usage : ./build.sh scores/demo.json
# Variable optionnelle : CHROME=/chemin/vers/chrome-headless-shell (sinon Remotion télécharge le sien)
set -euo pipefail
SCORE="${1:?usage: ./build.sh scores/<id>.json}"
ID=$(node -e "console.log(require('./$SCORE').meta.id)")
mkdir -p out public/audio

echo "1/4  audio  (synthèse depuis la partition)"
npx tsx audio/synth.ts "$SCORE" "public/audio/$ID.raw.wav"

echo "2/4  loudness  (-14 LUFS, crête -1 dB : standard Reels/TikTok/Shorts)"
# Gain LINÉAIRE + limiteur : on monte le volume sans écraser la dynamique (sinon le drop perd son impact)
I=$(ffmpeg -hide_banner -i "public/audio/$ID.raw.wav" -af ebur128=framelog=quiet -f null - 2>&1 \
  | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
GAIN=$(python3 -c "print(round(-14 - ($I), 2))")
ffmpeg -y -hide_banner -loglevel error -i "public/audio/$ID.raw.wav" \
  -af "volume=${GAIN}dB,alimiter=limit=0.89:attack=1:release=50:level=false" -ar 48000 "public/audio/$ID.wav"

echo "3/4  rendu  (Remotion, 1080x1920)"
node -e "require('fs').writeFileSync('out/$ID.props.json', JSON.stringify({score: require('./$SCORE'), withAudio: true}))"
npx remotion render src/index.ts Reel "out/$ID.mp4" --props="out/$ID.props.json" \
  --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=256k --x264-preset=veryfast \
  ${CHROME:+--browser-executable="$CHROME"} --log=error

echo "4/4  contrôle synchro / qualité"
python3 tools/check_sync.py "out/$ID.mp4" "$SCORE" --json "out/$ID.report.json"
