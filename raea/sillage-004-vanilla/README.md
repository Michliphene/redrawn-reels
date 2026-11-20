# SILLAGE N°4 · The boy behind every vanilla pod · DA « Le cabinet des matières »

Branch `sillage/cabinet-des-matieres`. Voice, timings and facts: `public/episodes/scent-004-vanilla/` (Brian,
eleven_multilingual_v2, 60.29 s, SOURCES.md). Same kit as `raea/sillage-003-rose` (tokens, flacon, ring, captions).
Format A (explainer, one story): the flacon holds vanilla extract, a gold ring circles it on "Albius", and it drains
on "He never gets rich from it".

## Shot list (anchors are words of timings.json)
hook (flacon, "1841 · a 12-year-old boy · one trick", "Almost every pod") → botanical orchid card ("Vanilla planifolia ·
from Mexico", "the bean = its seed pod") → vines without pods ("It blooms… but almost no pods") → wild bee ("which bee?
still debated") → one-day flower card ("1 day · miss it, and it falls") → Réunion coast ("Edmond, twelve, enslaved") →
the gesture, hands only, in a gilt frame ("A thin stick") → pods everywhere ("It works.") → farmer's hands today ("Still
by hand") → flacon "1848 · free · Edmond Albius · from albus: white" (ring) → flacon drains "Never rich from it · 1880"
→ cured beans card ("#2 most expensive spice · after saffron") → loop (same pose as frame 0, "1841").

## Images (media/manifest.json)
5 Nano Banana paintings (vines, bee, island, pods, hands today) and 4 gpt-image plates (orchid, one-day flower, child's
hands, cured beans). Edmond is never shown: hands only, no face. Island, pods and today are the 572×1024 previews (the
full-size Gemini download stalled again); they sit under the dark gradient, so the upscale does not show on a phone.

## Run
```bash
raea/sillage-004-vanilla/setup.sh     # voice, music, sfx, fonts, crops the plates (prep-plates.sh)
raea/sillage-004-vanilla/render.sh    # → out/sillage.mp4 + raea check
raea render compositions/cover.tsx --frame 0 -o out/cover.png
```
