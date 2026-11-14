import json, sys, urllib.parse, urllib.request
q = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 8
url = f"https://www.loc.gov/pictures/search/?q={urllib.parse.quote(q)}&fo=json&c={n}"
import subprocess; d = json.loads(subprocess.run(["curl", "-sS", "-m", "40", url], capture_output=True, text=True).stdout)
for r in d.get("results", [])[:n]:
    img = (r.get("image") or {}).get("full", "")
    print(f"{r.get('title','')[:85]} | {r.get('created_published_date','')} | {r.get('links',{}).get('item','')} | {img}")
