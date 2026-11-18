#!/usr/bin/env bash
# Procedural ambient bed. Usage: pipeline/music.sh <episode_id> [seconds]
set -euo pipefail
cd "$(dirname "$0")/.."
exec node scripts/render-tools.mjs music "$@"
