# REDRAWN — map-history Reels pipeline

```
public/episodes/<id>/episode.json   ← script + map cues (the only file an agent writes per video)
pipeline/render.sh <id>             ← TTS → timings → music → Remotion render → loudnorm → out/<id>.mp4
```

- `pipeline/tts.py` — Kokoro TTS (local, Apache-2.0), lexicon overrides, `{Display|spoken}` markup, per-beat word timings.
- `pipeline/music.sh` — procedural ambient bed (drop your own `music.wav` + `music.lock` to keep it).
- `scripts/prep-*.mjs` — build the GeoJSON per episode (with documented corrections).
- `src/components/` — `MapLayer` (d3-geo, state colours, flash/pulse/dissolve), `Labels` (geo-anchored, follow camera), `Captions` (word-by-word), `Timeline` (frise), `DateBadge`, `Brand`; `src/lib/camera.ts` (fit/zoom/great-circle travelling).

### Cue language (episode.json)
`camera: {fit:"SOVIET"} | {center:[lon,lat], span:deg}` · actions: `declare`, `pulse`, `label`, `marker`, `date`, `dissolve`, `allLabels`, each with optional `atWord` to fire exactly when that word is spoken.
