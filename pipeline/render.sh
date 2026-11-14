#!/usr/bin/env bash
# End-to-end: script -> voice + timings -> music -> Remotion render -> loudness-normalised MP4
# Usage: pipeline/render.sh <episode_id>
set -euo pipefail
cd "$(dirname "$0")/.."
ID="$1"
CHROME="${REMOTION_CHROME:-$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)}"
python3 pipeline/tts.py "$ID"
DUR=$(python3 -c "import json;print(json.load(open('public/episodes/$ID/timings.json'))['duration']+1)")
[ -f "public/episodes/$ID/music.lock" ] || pipeline/music.sh "$ID" "$DUR"
mkdir -p out
npx remotion render src/index.ts Episode "out/$ID.raw.mp4" --props="{\"episodeId\":\"$ID\"}" \
  --browser-executable="$CHROME" --codec=h264 --crf=18 --concurrency=4 --log=error
# TikTok/Reels loudness target ≈ -14 LUFS
ffmpeg -y -loglevel error -i "out/$ID.raw.mp4" -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -movflags +faststart "out/$ID.mp4"
rm "out/$ID.raw.mp4"
echo "done -> out/$ID.mp4"
