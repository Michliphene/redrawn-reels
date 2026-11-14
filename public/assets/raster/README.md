# Raster basemaps (render versions)

Lightweight copies (max 8192 px wide, JPEG q85, metadata stripped) of the full-resolution sources kept
in `assets-src/raster/` (**gitignored**, not in the repo — re-download from the URLs below).
Equirectangular (EPSG:4326), full world: x = (lon+180)/360·W, y = (90−lat)/180·H.

| File | Source | Original | Licence |
|---|---|---|---|
| `sr_hr_8192.jpg` | Natural Earth — *Shaded Relief* 1:10m (`SR_HR`), grayscale | 21600×10800 TIFF, <https://naciscdn.org/naturalearth/10m/raster/SR_HR.zip> | Public domain |
| `ne2_hr_lc_sr_8192.jpg` | Natural Earth — *Natural Earth II with Shaded Relief* 1:10m (`NE2_HR_LC_SR`) | 21600×10800 TIFF, <https://naciscdn.org/naturalearth/10m/raster/NE2_HR_LC_SR.zip> | Public domain |

Natural Earth: "Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com." — public domain, no attribution required (kept as courtesy).
Natural Earth shows a de facto world view: check disputed areas before using (see `CLAUDE.md`).

Regenerate: `convert assets-src/raster/<NAME>/<NAME>.tif -resize 8192x -quality 85 -strip public/assets/raster/<name>_8192.jpg`
