import json, sys, urllib.parse, urllib.request
UA = {"User-Agent": "map-reels-research/0.1 (contact via repo)"}
def q(params):
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({**params, "format": "json"})
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30))
term = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 8
d = q({"action": "query", "generator": "search", "gsrsearch": f"filetype:bitmap {term}", "gsrnamespace": 6, "gsrlimit": n,
       "prop": "imageinfo", "iiprop": "url|extmetadata|size", "iiurlwidth": 600})
for p in sorted(d.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0)):
    ii = p["imageinfo"][0]; m = ii.get("extmetadata", {})
    g = lambda k: (m.get(k, {}).get("value") or "")[:70].replace("\n", " ")
    print(f"{p['title'][5:][:80]} | {ii['width']}x{ii['height']} | {g('LicenseShortName')} | {g('DateTimeOriginal')} | {g('Artist')}")
