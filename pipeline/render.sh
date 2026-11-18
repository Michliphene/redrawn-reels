#!/usr/bin/env bash
# End-to-end: pre-flight → voice + timings (only if the script changed) → music → render → −14 LUFS MP4
# Usage: pipeline/render.sh <episode_id> [--force-voice] [--da N] [--crf N] [--skip-validate]
#   --da N          preview another art direction without editing episode.json (1 = flat, 2 = 3D)
#   --force-voice   re-record the voice even if the script is unchanged
# An episode with "audio": "<other id>" (a remaster, an alternative cut) reuses that episode's voice,
# timings and music: nothing is synthesised.
set -euo pipefail
cd "$(dirname "$0")/.."
ID="${1:?usage: pipeline/render.sh <episode_id> [--force-voice] [--da N] [--crf N] [--skip-validate]}"; shift
FORCE_VOICE=0; DA=""; CRF=18; VALIDATE=1
while [ $# -gt 0 ]; do
  case "$1" in
    --force-voice) FORCE_VOICE=1 ;;
    --da) DA="$2"; shift ;;
    --crf) CRF="$2"; shift ;;
    --skip-validate) VALIDATE=0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done
EP="public/episodes/$ID"
[ -f "$EP/episode.json" ] || { echo "!! $EP/episode.json not found" >&2; exit 1; }
step() { echo "== $*"; }
CHROME="${REMOTION_CHROME:-$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)}"

# 1. pre-flight: unknown cue words, missing data, unsourced figures… before any voice credit is spent
if [ "$VALIDATE" = 1 ]; then step "pre-flight"; node scripts/validate.mjs "$ID"; fi

# 2. which composition renders it, whose audio it uses
read -r COMP AUDIO < <(python3 - "$ID" <<'PY'
import json, re, sys
ep = json.load(open(f"public/episodes/{sys.argv[1]}/episode.json"))
series = json.load(open("public/studio.json"))["series"]
slug = lambda s: re.sub(r"[^a-z0-9]", "", str(s or "").lower())
sid = ep.get("seriesId") if ep.get("seriesId") in series else next((k for k, v in series.items() if slug(ep.get("series")) in [slug(k), slug(v["name"])] + [slug(n) for n in v.get("legacyNames", [])]), None)
print(ep.get("composition") or (series[sid]["composition"] if sid else "Episode"), ep.get("audio") or sys.argv[1])
PY
)
AEP="public/episodes/$AUDIO"

# 3. voice
if [ "$AUDIO" != "$ID" ]; then
  step "voice: shared with $AUDIO"
  [ -f "$AEP/voice.wav" ] && [ -f "$AEP/timings.json" ] || { echo "!! $AUDIO has no voice yet: render it first" >&2; exit 1; }
else
  step "voice"
  if [ "$FORCE_VOICE" = 1 ]; then python3 pipeline/tts.py "$ID" --force; else python3 pipeline/tts.py "$ID"; fi
fi

# 3b. listen to the take (WhisperX, optional): flags names said wrong or skipped words, never blocks
if python3 -c "import whisperx" 2>/dev/null; then
  step "voice check (whisperx)"
  python3 pipeline/align.py "$AUDIO" 2>&1 | grep -E "^(asr check|  !)" || echo "!! voice check failed (render continues)" >&2
fi

# 4. music: made once, redone only if it is missing or too short for the voice (drop music.lock to keep your own)
DUR=$(python3 -c "import json;print(json.load(open('$AEP/timings.json'))['duration']+1)")
if [ ! -f "$AEP/music.lock" ]; then
  HAVE=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AEP/music.wav" 2>/dev/null || echo 0)
  if python3 -c "import sys;sys.exit(0 if float('${HAVE:-0}') < float('$DUR') else 1)"; then step "music"; pipeline/music.sh "$AUDIO" "$DUR"; fi
fi

# 5. render (two attempts: a headless browser can die on a busy machine). The WebGL back-end comes from remotion.config.ts.
mkdir -p out
PROPS="{\"episodeId\":\"$ID\"${DA:+,\"da\":$DA}}"
step "render $COMP ($PROPS)"
START=$(date +%s)
for attempt in 1 2; do
  if npx remotion render src/index.ts "$COMP" "out/$ID.raw.mp4" --props="$PROPS" ${CHROME:+--browser-executable="$CHROME"} \
      --codec=h264 --crf="$CRF" --concurrency=4 --log=error; then break; fi
  [ "$attempt" = 2 ] && { echo "!! render failed twice" >&2; exit 1; }
  echo "!! render failed, retrying once" >&2
done

# 6. loudness: TikTok / Reels / Shorts target ≈ −14 LUFS
ffmpeg -y -loglevel error -i "out/$ID.raw.mp4" -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -movflags +faststart "out/$ID.mp4"
rm "out/$ID.raw.mp4"
SECS=$(( $(date +%s) - START ))
LEN=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "out/$ID.mp4")
echo "done -> out/$ID.mp4 (${LEN}s of video, rendered in ${SECS}s)"
