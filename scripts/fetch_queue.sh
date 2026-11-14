#!/usr/bin/env bash
# Patient Commons downloader: one request per minute, cycles through missing files. Usage: fetch_queue.sh [minutes]
cd "$(dirname "$0")/.."
UA="map-reels-research/0.1 (educational video project)"
declare -A Q=(
 [public/assets/portraits/gorbachev.jpg]="Mikhail Gorbachev in the White House Library (3x4 cropped).jpg"
 [public/assets/portraits/kravchuk.jpg]="Leonid Kravchuk in 1992.jpg"
 [public/assets/portraits/shushkevich.jpg]="Stanislav Shushkevich 1991 (cropped).jpg"
 [public/assets/portraits/nazarbayev.jpg]="Nazarbayev Inauguration 1991 (cropped).jpg"
 [public/assets/portraits/landsbergis.jpg]="Vytautas Landsbergis and Algirdas Brazauskas (March 1990).jpg"
 [public/assets/portraits/yeltsin_1991.jpg]="Boris Yeltsin waves.jpg"
 [public/assets/flags/ge-1990.svg]="Flag of Georgia (1990–2004).svg"
)
end=$(( $(date +%s) + ${1:-40}*60 ))
while [ $(date +%s) -lt $end ]; do
  left=0
  for dest in "${!Q[@]}"; do
    [ -s "$dest" ] && continue; left=1
    name="${Q[$dest]}"; url="https://commons.wikimedia.org/wiki/Special:FilePath/$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1].replace(' ','_')))" "$name")"
    code=$(curl -sSL -m 120 -A "$UA" -o "$dest.part" -w "%{http_code}" "$url")
    if [ "$code" = "200" ] && [ $(stat -c%s "$dest.part") -gt 1000 ] && ! grep -q "Wikimedia Error" "$dest.part"; then mv "$dest.part" "$dest"; echo "$(date +%T) ok $dest"; else rm -f "$dest.part"; echo "$(date +%T) $code $dest"; fi
    sleep 60
  done
  [ $left = 0 ] && { echo ALL DONE; exit 0; }
done
echo TIMEOUT
