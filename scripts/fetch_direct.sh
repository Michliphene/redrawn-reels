#!/usr/bin/env bash
# Direct original-file download from Commons (Special:FilePath), slow & polite. Usage: fetch_direct.sh <dest> "<Commons file name>"
set -u
UA="map-reels-research/0.1 (educational video project)"
dest="$1"; name="$2"; url="https://commons.wikimedia.org/wiki/Special:FilePath/$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1].replace(' ','_')))" "$name")"
for i in 1 2 3 4 5 6; do
  code=$(curl -sSL -m 120 -A "$UA" -o "$dest.part" -w "%{http_code}" "$url")
  if [ "$code" = "200" ] && [ $(stat -c%s "$dest.part") -gt 1000 ]; then mv "$dest.part" "$dest"; echo "ok $dest"; exit 0; fi
  echo "retry $i ($code)"; sleep $((20*i))
done
rm -f "$dest.part"; echo "FAILED $dest"; exit 1
