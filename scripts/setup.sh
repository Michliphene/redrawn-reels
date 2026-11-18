#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm install
pip install -q kokoro-onnx soundfile numpy
mkdir -p models
[ -f models/kokoro-v1.0.onnx ] || curl -sSL -o models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
[ -f models/voices-v1.0.bin ] || curl -sSL -o models/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
# --asr: WhisperX (voice check + exact word times for Kokoro takes). Heavy (torch, ~10 GB), CPU is enough.
if [ "${1:-}" = "--asr" ]; then
  pip install -q whisperx
  NLTK_ALLOW_PROXIED_URLOPEN=1 python3 -c "import nltk; nltk.download('punkt_tab', quiet=True)"
fi
echo "setup ok"
