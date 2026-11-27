# SILLAGE N°6 · It was never whale vomit (ambergris) · DA « Le cabinet des matières »

Voice, timings and facts: `public/episodes/scent-006-ambergris/` (Brian, eleven_multilingual_v2, 65.2 s, SOURCES.md).
Kit from `raea/sillage-004-vanilla` (tokens, flacon, captions). Format D (myth-bust), direction "evidence bench".

## Shot list (anchors are words of timings.json)
boat painting, "127 KG of whale vomit?" (frame 0 = loop end) → cabinet: empty flacon + grey lump on its plinth,
"Whale vomit" struck through on "never" → beach → whale ("Made in the gut", "a bile-duct secretion") → squid-beak card
→ whale ("It leaves the other way… like dung") → 100 pearls, one lit ("1 in 100", "Soviet logs 1961–78: 0.4%") → sea
("Fresh, it smells like what it is", "sweet & earthy") → flacon fills gold on "That is the smell" (ambrein → ambroxide)
→ history card (incense, plague, Charles II's eggs, "reportedly") → law (flacon) → boat ("$12 a gram · our calculation")
→ clary sage card → boat, hook title returns.

## Images
7 Nano Banana images (Gemini app), see `media/manifest.json`. Cards are opaque unlit textured cuboids, always mounted
(ImagePlane does not move in a continuous render). Pearls and juice sizes are driven by transforms only.

## Run
```bash
raea/sillage-006-ambergris/setup.sh     # voice, music, sfx, fonts, crops the plates (prep-plates.sh)
raea/sillage-006-ambergris/render.sh    # → out/sillage.mp4 + raea check
```
