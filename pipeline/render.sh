#!/usr/bin/env bash
# Bash entry point for the native render runner.
set -euo pipefail
cd "$(dirname "$0")/.."
exec node scripts/render.mjs "$@"
