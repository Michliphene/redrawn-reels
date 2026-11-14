"""Download Commons files + licence metadata -> public/assets/portraits/<key>.jpg and credits.json"""
import json, sys, time, re, urllib.parse, urllib.request, urllib.error, os
UA = {"User-Agent": "map-reels-research/0.1 (educational video project)"}
FILES = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else {
  "gorbachev": "Mikhail Gorbachev in the White House Library (3x4 cropped).jpg",
  "yeltsin": "Boris Yeltsin (3x4 close cropped).jpg",
  "yeltsin_1991": "Boris Yeltsin waves.jpg",
  "landsbergis": "Vytautas Landsbergis and Algirdas Brazauskas (March 1990).jpg",
  "kravchuk": "Leonid Kravchuk in 1992.jpg",
  "shushkevich": "Stanislav Shushkevich 1991 (cropped).jpg",
  "nazarbayev": "Nazarbayev Inauguration 1991 (cropped).jpg",
}
out = sys.argv[2] if len(sys.argv) > 2 else "public/assets/portraits"
url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "format": "json",
      "titles": "|".join("File:" + f for f in FILES.values()), "prop": "imageinfo", "iiprop": "url|extmetadata|size", "iiurlwidth": 1280})
for attempt in range(8):
    try:
        d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)); break
    except urllib.error.HTTPError as e:
        if e.code != 429: raise
        print("429, waiting", 20 * (attempt + 1)); time.sleep(20 * (attempt + 1))
pages = {p["title"][5:]: p for p in d["query"]["pages"].values()}
norm = {n["to"][5:]: n["from"][5:] for n in d["query"].get("normalized", [])}
strip = lambda s: re.sub(r"<[^>]+>", "", s or "").strip()
credits = {}
for key, f in FILES.items():
    p = pages.get(f) or next(v for k, v in pages.items() if norm.get(k) == f)
    ii = p["imageinfo"][0]; m = ii["extmetadata"]
    credits[key] = {"file": f, "page": ii["descriptionurl"], "artist": strip(m.get("Artist", {}).get("value"))[:120],
                    "license": m.get("LicenseShortName", {}).get("value"), "date": strip(m.get("DateTimeOriginal", {}).get("value"))[:40]}
    ext = os.path.splitext(f)[1].lower().replace("jpeg", "jpg")
    small = ii.get("width", 9999) <= 1600
    src = ii["url"]  # originals only (non-standard thumb sizes are refused)
    req = urllib.request.Request(src, headers=UA)
    dest = f"{out}/{key}{'.svg' if ext == '.svg' else '.jpg'}"
    if os.path.exists(dest) and os.path.getsize(dest) > 1000:
        print(key, "already here"); continue
    for attempt in range(8):
        try:
            data = urllib.request.urlopen(req, timeout=60).read()
            if len(data) < 1000: raise ValueError("tiny file")
            open(dest, "wb").write(data); break
        except Exception as e:
            print(key, "retry", attempt, e); time.sleep(15 * (attempt + 1))
    time.sleep(4)
    print(key, credits[key]["license"], credits[key]["date"])
old = json.load(open(f"{out}/credits.json")) if os.path.exists(f"{out}/credits.json") else {}
json.dump({**old, **credits}, open(f"{out}/credits.json", "w"), indent=1, ensure_ascii=False)
