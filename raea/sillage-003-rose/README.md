# SILLAGE N°3 · The $12,000 flower · DA « Le cabinet des matières »

Branch `sillage/cabinet-des-matieres`. Voice, timings and facts: `public/episodes/scent-003-rose/` (Brian,
eleven_multilingual_v2, 60.75 s, SOURCES.md). Same kit as `raea/sillage-002-kyphi` (tokens, flacon, ring, captions).
Format C (guess): the flacon drains on "How many petals…", a 3-2-1 countdown, it refills on the answer with the gold ring.

## Shot list (anchors are words of timings.json)
hook (flacon full of rose oil, "$12,000", "How many roses?") → "Bulgaria." (valley painting, "≈ ½ of the world's
rose oil") → Damask rose card (late May → mid-June) → pickers before sunrise → hands in a gilt frame → copper stills →
1903 festival → guess (flacon drains, 3 · 2 · 1) → answer (refills, ring on "tonnes", "3–5 t" then "≈ 3.5 t",
"sources vary") → one drop on a petal ("1 g · more than 1,000 petals") → the farmer's scale ("€1.28 per kilo of
flowers · 2025") → petal heap ("our calculation: ≈ €4,500", "the oil they make: ≈ $12,000") → loop (same pose as
frame 0, "$12,000").

## Images (media/manifest.json)
5 Nano Banana paintings (valley, pickers from behind, copper stills, festival street, oil drop) and 4 gpt-image still
lifes (Damask rose, hands, petal heap, scale). The oil drop is the 572×1024 preview (the full-size Gemini download
failed); it is a soft macro, so the upscale is not visible on a phone.

## Run
```bash
raea/sillage-003-rose/setup.sh     # voice, music, sfx, fonts, crops the plates (prep-plates.sh)
raea/sillage-003-rose/render.sh    # → out/sillage.mp4 + raea check
raea render compositions/cover.tsx --frame 0 -o out/cover.png
```
