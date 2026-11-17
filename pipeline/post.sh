#!/usr/bin/env bash
# Posting routine: pipeline/post.sh <episode_id | EP number>
#  1. resolve the episode; 2. re-render only if the video is older than its inputs (cue sheet, timings,
#  map data, engine code); 3. sanity-check duration + loudness; 4. render covers if missing;
#  5. write deliverables/<id>/POST.md (title, description, hashtags, pinned comment, YouTube description).
set -euo pipefail
cd "$(dirname "$0")/.."
ID=$(python3 - "$1" <<'PY'
import json,glob,sys
a=sys.argv[1]
if not a.isdigit(): print(a); sys.exit()
for p in glob.glob('public/episodes/*/episode.json'):
    e=json.load(open(p))
    if e.get('episode')==int(a): print(e['id']); sys.exit()
sys.exit(f'no episode {a}')
PY
)
VID="out/$ID.mp4"
# inputs of the video: its cue sheet, the voice it uses (its own or a shared one), its map data if any, the engine
read -r DATA AUDIO < <(python3 -c "import json;e=json.load(open('public/episodes/$ID/episode.json'));print(('public/'+e['data']) if e.get('data') else '-', e.get('audio') or '$ID')")
NEWEST=$(ls -t "public/episodes/$ID/episode.json" "public/episodes/$AUDIO/timings.json" $([ "$DATA" != "-" ] && echo "$DATA") public/studio.json $(find src -name '*.ts' -o -name '*.tsx') pipeline/render.sh 2>/dev/null | head -1)
if [ ! -f "$VID" ] || [ "$NEWEST" -nt "$VID" ]; then
  echo "== render: $VID is missing or older than $NEWEST"
  pipeline/render.sh "$ID"
else
  echo "== render: $VID is up to date"
fi
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VID")
LUFS=$(ffmpeg -i "$VID" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
echo "== check: duration ${DUR}s · loudness ${LUFS} LUFS"
python3 - "$DUR" "$LUFS" <<'PY'
import sys
d,l=float(sys.argv[1]),float(sys.argv[2])
if not (30<=d<=75): print(f"!! duration {d:.1f}s outside 30–75 s")
elif d>60: print(f"   note: {d:.1f}s — over a minute (fine for a monetised TikTok cut, long for Reels)")
if abs(l+14)>1.5: print(f"!! loudness {l} LUFS far from -14")
PY
KIT="deliverables/$ID"; mkdir -p "$KIT"
if [ ! -f "$KIT/cover_3x4.jpg" ]; then
  echo "== covers missing: render them with cover mode (see CLAUDE.md) before posting"
fi
if python3 -c "import json,sys;sys.exit(0 if 'thumb' in json.load(open('public/episodes/$ID/episode.json')) else 1)"; then
  if [ ! -f "$KIT/thumb_16x9.png" ] || [ "public/episodes/$ID/episode.json" -nt "$KIT/thumb_16x9.png" ] || [ src/Thumb.tsx -nt "$KIT/thumb_16x9.png" ]; then
    echo "== thumbnail 16:9"
    CHROME="${REMOTION_CHROME:-$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)}"
    npx remotion still src/index.ts Thumb "$KIT/thumb_16x9.png" --props="{\"episodeId\":\"$ID\"}" --browser-executable="$CHROME" --log=error
    npx remotion still src/index.ts ThumbV "$KIT/thumb_9x16.png" --props="{\"episodeId\":\"$ID\"}" --browser-executable="$CHROME" --log=error
    ffmpeg -y -loglevel error -i "$KIT/thumb_9x16.png" -vf "crop=1080:1440:0:240" -q:v 2 "$KIT/thumb_3x4.jpg"
  fi
  echo "THUMB_PHONE=$KIT/thumb_9x16.png (TikTok/Reels cover)"; echo "THUMB_GRID=$KIT/thumb_3x4.jpg (Instagram grid)"; echo "THUMB_16x9=$KIT/thumb_16x9.png"
else
  echo "== no 16:9 thumbnail config (episode.json \"thumb\") — skipped"
fi
[ -f "$KIT/POSTING.md" ] || { echo "!! $KIT/POSTING.md missing — write it first"; exit 1; }
echo "== post kit"
python3 pipeline/posting_kit.py "$ID" > /dev/null
echo "VIDEO=$VID"; echo "COVER=$KIT/cover_3x4.jpg"; echo "KIT=$KIT/POST.md"
