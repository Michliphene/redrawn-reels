#!/usr/bin/env bash
# Fills media/ from the studio's own files: the voice, timings and music of `apple-iphone` (the text is the only thing
# kept from the Remotion episode), the sfx kit and the house fonts converted to TTF (raea's page engine loads TTF).
set -euo pipefail
cd "$(dirname "$0")"
R=../..
mkdir -p media/fonts media/sfx out
cp "$R/public/episodes/apple-iphone/music.wav" media/
# the ElevenLabs take has flat-topped peaks (raea check: "the sound clips"): 1.4 dB down and declipped
ffmpeg -y -loglevel error -i "$R/public/episodes/apple-iphone/voice.wav" -af "volume=0.85,adeclip=threshold=1" media/voice.wav
cp "$R/public/episodes/apple-iphone/timings.json" compositions/timings.json
cp "$R"/public/sfx/*.wav media/sfx/
cp "$R/public/fonts/OFL.txt" "$R/public/fonts/LICENSES.md" media/fonts/
for f in BricolageGrotesque-latin InstrumentSerif-Italic-latin JetBrainsMono-latin; do
  python3 -c "from fontTools.ttLib import TTFont; f=TTFont('$R/public/fonts/$f.woff2'); f.flavor=None; f.save('media/fonts/$f.ttf')"
done
ln -sfn ../media compositions/media
echo "media ready"
