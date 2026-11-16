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
DATA=$(python3 -c "import json;print('public/'+json.load(open('public/episodes/$ID/episode.json'))['data'])")
NEWEST=$(ls -t "public/episodes/$ID/episode.json" "public/episodes/$ID/timings.json" "$DATA" src/*.tsx src/components/*.tsx src/lib/*.ts pipeline/render.sh 2>/dev/null | head -1)
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
if not (30<=d<=60): print(f"!! duration {d:.1f}s outside 30–60 s")
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
  fi
  echo "THUMB=$KIT/thumb_16x9.png"
else
  echo "== no 16:9 thumbnail config (episode.json \"thumb\") — skipped"
fi
[ -f "$KIT/POSTING.md" ] || { echo "!! $KIT/POSTING.md missing — write it first"; exit 1; }
echo "== post kit"
python3 pipeline/posting_kit.py "$ID" > /dev/null
echo "VIDEO=$VID"; echo "COVER=$KIT/cover_3x4.jpg"; echo "KIT=$KIT/POST.md"
