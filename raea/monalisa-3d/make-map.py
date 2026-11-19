"""The paper map of the MAP station, drawn once from public/data/getaway-003-monalisa.geojson (modern borders as a base
map, no border labelled: SOURCES.md, debated point 6). Equirectangular, x scaled by cos(46.5°), so the composition maps
lon/lat to the table with the same two lines (see `geo()` in compositions/monalisa.tsx).

  media/map.png    sea, scenery countries, France and Italy in file-paper beige, the Seine
  media/press.png  the five countries pulsed on "front pages" (FR IT GB DE ES), red on transparent
Usage: python make-map.py <geojson> <media dir>
"""
import json, math, sys
from PIL import Image, ImageDraw, ImageFilter

LON0, LON1, LAT0, LAT1 = -10.0, 20.0, 36.0, 57.0   # keep in sync with MAP in monalisa.tsx
KX = math.cos(math.radians(46.5))
PX = 96                                             # pixels per degree of latitude
W, H = round((LON1 - LON0) * KX * PX), round((LAT1 - LAT0) * PX)
SS = 2                                              # supersampling

def xy(lon, lat):
    return ((lon - LON0) * KX * PX * SS, (LAT1 - lat) * PX * SS)

def rings(geom):
    if geom["type"] == "Polygon":
        return [geom["coordinates"]]
    if geom["type"] == "MultiPolygon":
        return geom["coordinates"]
    return []

def main(src, out):
    g = json.load(open(src, encoding="utf-8"))
    SEA, LAND, LAND_EDGE, SUBJ, SUBJ_EDGE, RIVER, RED = "#16120E", "#3A3127", "#4E4335", "#C9B994", "#8E8163", "#5F86A3", (224, 49, 43, 255)
    im = Image.new("RGB", (W * SS, H * SS), SEA)
    d = ImageDraw.Draw(im)
    # a faint graticule, like a printed map
    for lon in range(-10, 21, 5):
        d.line([xy(lon, LAT0), xy(lon, LAT1)], fill="#1F1A15", width=2 * SS)
    for lat in range(40, 57, 5):
        d.line([xy(LON0, lat), xy(LON1, lat)], fill="#1F1A15", width=2 * SS)
    feats = [f for f in g["features"] if f["geometry"]["type"] in ("Polygon", "MultiPolygon")]
    subject = {"FR", "IT"}
    for pass_subject in (False, True):
        for f in feats:
            if (f["id"] in subject) != pass_subject:
                continue
            fill, edge = (SUBJ, SUBJ_EDGE) if pass_subject else (LAND, LAND_EDGE)
            for poly in rings(f["geometry"]):
                d.polygon([xy(*p) for p in poly[0]], fill=fill, outline=edge, width=3 * SS)
                for hole in poly[1:]:
                    d.polygon([xy(*p) for p in hole], fill=SEA)
    for f in g["features"]:
        if f["geometry"]["type"] == "MultiLineString":
            for line in f["geometry"]["coordinates"]:
                d.line([xy(*p) for p in line], fill=RIVER, width=5 * SS, joint="curve")
    im = im.resize((W, H), Image.LANCZOS)
    im.save(f"{out}/map.png")

    hi = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    dh = ImageDraw.Draw(hi)
    for f in feats:
        if f["id"] in {"FR", "IT", "GB", "DE", "ES"}:
            for poly in rings(f["geometry"]):
                dh.polygon([xy(*p) for p in poly[0]], fill=RED)
    hi = hi.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1))
    hi.save(f"{out}/press.png")
    print(f"map {W}x{H} -> {out}/map.png, press.png")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
