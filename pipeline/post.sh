#!/usr/bin/env bash
# Read-only handoff: check the approved render and print the exact local files.
set -euo pipefail
cd "$(dirname "$0")/.."
exec node scripts/delivery.mjs verify "$@"
