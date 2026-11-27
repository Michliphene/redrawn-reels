#!/usr/bin/env bash
# Fills media/ for UNGRADED #008 "He failed. Not math." (episode `einstein-math`) in raea: Brian's voice,
# word timings and music bed (public/episodes/einstein-math), the sfx kit and the fonts converted to TTF (raea's page
# engine loads TTF). Caveat (handwriting) lives on branch claude/exciting-gauss-kqc425: if it is not checked out
# here, it is read from that branch with `git show`.
# Windows (Git Bash): needs `python` with fonttools + brotli (pip install fonttools brotli).
set -euo pipefail
cd "$(dirname "$0")"
R=../..
EP=einstein-math
BR="${UNGRADED_BRANCH:-origin/claude/exciting-gauss-kqc425}"
PY=python3; [ "$(python3 -c 'print(42)' 2>/dev/null)" = 42 ] || PY=python
mkdir -p media/fonts media/sfx out
get() { # get <repo path> <dest>
  if [ -f "$R/$1" ]; then cp "$R/$1" "$2"; else git -C "$R" show "$BR:$1" > "$2"; fi
}
get "public/episodes/$EP/voice.wav" media/voice.wav
get "public/episodes/$EP/music.wav" media/music.wav
get "public/episodes/$EP/timings.json" compositions/timings.json
get "public/fonts/Caveat-latin-700.woff2" media/fonts/Caveat-latin-700.woff2
cp "$R"/public/sfx/*.wav media/sfx/
# themed AI backdrop (art/, Nano Banana), flipped top-bottom: a Cuboid's front face maps the picture upside down.
# Until the art exists, a plain placeholder keeps the render working.
mkdir -p media/art
if ls "$R/public/episodes/$EP/art/"*.png >/dev/null 2>&1; then
  for f in "$R/public/episodes/$EP/art/"*.png; do
    $PY -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').transpose(Image.FLIP_TOP_BOTTOM).save(sys.argv[2])" "$f" "media/art/$(basename "$f")"
  done
else
  $PY -c "from PIL import Image; Image.new('RGB',(576,1024),(120,110,96)).save('media/art/bg-study.png')"
fi
cp "$R/public/fonts/OFL.txt" "$R/public/fonts/LICENSES.md" media/fonts/
for f in BricolageGrotesque-latin InstrumentSerif-Italic-latin JetBrainsMono-latin; do
  $PY -c "from fontTools.ttLib import TTFont; f=TTFont('$R/public/fonts/$f.woff2'); f.flavor=None; f.save('media/fonts/$f.ttf')"
done
$PY -c "from fontTools.ttLib import TTFont; f=TTFont('media/fonts/Caveat-latin-700.woff2'); f.flavor=None; f.save('media/fonts/Caveat-latin-700.ttf')"
rm -f media/fonts/Caveat-latin-700.woff2
$PY make-glyphs.py media/fonts compositions/glyphs.json
rm -rf compositions/media; ln -sfn ../media compositions/media 2>/dev/null || cp -r media compositions/media
echo "media ready"
