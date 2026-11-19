"""Glyph outlines for text drawn INSIDE the notebook texture (raea rasterises SVG textures with usvg, which cannot load
our fonts). Writes compositions/glyphs.json: per font, units per em and, per character, [advance, svg path d] in font
units (y up). Also writes media/fonts/BricolageCut.ttf, the static 800 weight / 75 width cut used by the overlay.
Usage: python make-glyphs.py <fonts dir> <out json>
"""
import json
import sys

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

fonts_dir, out = sys.argv[1], sys.argv[2]
CHARS = "".join(chr(c) for c in range(32, 127)) + "’‘“”·…×—–"

cut = instancer.instantiateVariableFont(TTFont(f"{fonts_dir}/BricolageGrotesque-latin.ttf"), {"wght": 800, "wdth": 75, "opsz": 96})
name = cut["name"]
for rec in name.names:
    if rec.nameID in (1, 4, 16):
        rec.string = "BricolageCut"
    if rec.nameID == 6:
        rec.string = "BricolageCut"
cut.save(f"{fonts_dir}/BricolageCut.ttf")


def dump(font):
    gs, cmap = font.getGlyphSet(), font.getBestCmap()
    glyphs = {}
    for ch in CHARS:
        gname = cmap.get(ord(ch))
        if not gname:
            continue
        pen = SVGPathPen(gs, lambda v: f"{v:.0f}")
        gs[gname].draw(pen)
        glyphs[ch] = [round(gs[gname].width), pen.getCommands()]
    return {"upm": font["head"].unitsPerEm, "glyphs": glyphs}


data = {
    "hand": dump(TTFont(f"{fonts_dir}/Caveat-latin-700.ttf")),
    "cut": dump(TTFont(f"{fonts_dir}/BricolageCut.ttf")),
}
with open(out, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
print(out, {k: len(v["glyphs"]) for k, v in data.items()})
