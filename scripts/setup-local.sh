#!/usr/bin/env bash
# Local setup (macOS / Linux / Windows via WSL2). Safe to re-run.
#   scripts/setup-local.sh            check tools, npm install, Python venv, Kokoro model, Remotion browser, tests
#   scripts/setup-local.sh --no-test  same without npm test
set -euo pipefail
cd "$(dirname "$0")/.."
ok() { printf '  \033[32m✓\033[0m %s\n' "$*"; }; ko() { printf '  \033[31m✗\033[0m %s\n' "$*"; MISSING=1; }
MISSING=0
echo "== tools"
if command -v node >/dev/null; then
  NV=$(node -p 'process.versions.node.split(".")[0]'); [ "$NV" -ge 20 ] && ok "node $(node -v)" || ko "node $(node -v): need >= 20 (22 recommended)"
else ko "node: missing (https://nodejs.org, or: brew install node@22)"; fi
for t in ffmpeg ffprobe python3 bc curl git; do command -v "$t" >/dev/null && ok "$t" || ko "$t: missing"; done
if [ "$MISSING" = 1 ]; then
  echo
  echo "Install the missing tools, then re-run:"
  echo "  macOS:          brew install node@22 ffmpeg python@3.12 bc"
  echo "  Ubuntu / WSL2:  sudo apt install -y ffmpeg python3 python3-venv bc curl git  (+ Node 22 from nodesource or nvm)"
  exit 1
fi

echo "== npm install"; npm install --no-fund --no-audit

echo "== python venv (.venv)"
[ -d .venv ] || python3 -m venv .venv
. .venv/bin/activate
pip install -q --upgrade pip
pip install -q kokoro-onnx soundfile numpy
ok "python deps in .venv (the pipeline activates it by itself)"

echo "== Kokoro model (offline voice fallback, ~350 MB)"
mkdir -p models
B=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -f models/kokoro-v1.0.onnx ] || curl -fsSL -o models/kokoro-v1.0.onnx "$B/kokoro-v1.0.onnx"
[ -f models/voices-v1.0.bin ]  || curl -fsSL -o models/voices-v1.0.bin  "$B/voices-v1.0.bin"
ok "models/"

echo "== Remotion headless browser"
if [ -n "${REMOTION_CHROME:-}" ] || ls -d /opt/pw-browsers/chromium_headless_shell-* >/dev/null 2>&1; then ok "using an existing Chromium"
elif npx remotion browser ensure >/dev/null 2>&1; then ok "chrome-headless-shell ready"
else echo "  ! could not download Remotion's browser now: it will be fetched on the first render"; fi

echo "== .env"
if [ -f .env ]; then ok ".env exists"; else cp .env.example .env; echo "  ! .env created: put your ELEVENLABS_API_KEY in it"; fi

chmod +x pipeline/*.sh scripts/*.sh
if [ "${1:-}" != "--no-test" ]; then echo "== npm test"; npm test; fi
echo
echo "setup ok. Try:  npm run stills ussr-1991-v2 -- --n 6   then   pipeline/render.sh ussr-1991-v2"
