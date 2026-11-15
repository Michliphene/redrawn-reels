# REDRAWN — récap des compétences (skills) du projet

État au 2026-11-15. Basé sur `CLAUDE.md`, l'arborescence et les en-têtes des scripts et agents.

## État du projet
- **Épisodes rendus :** 2 (`ussr-1991`, `alaska-1867`). Alaska : 3 reviews de clarté, 2 reviews de virality (80/100 puis 86/100).
- **Format :** reels verticaux 1080×1920, 30 fps, en anglais, 30–60 s, centrés sur une carte animée.
- **Limite :** tout le système est construit autour de la carte.

## Compétences par domaine

| Domaine | Ce qui existe | Où |
|---|---|---|
| Stratégie éditoriale | Choix du sujet, hook ≤ 1 s, dernière phrase qui reboucle sur la première, 45–58 s de voix | `docs/01_SERIES_AND_TOPICS.md`, `CLAUDE.md` |
| Rigueur factuelle | `SOURCES.md` par épisode (script, faits datés, points débattus, références, commentaire épinglé) ; tags « DATES VARY » / « DISPUTED » ; règle des frontières contestées | `public/episodes/<id>/SOURCES.md` |
| Données cartographiques | Prep GeoJSON depuis Natural Earth / us-atlas, flags de focus, contours fusionnés | `scripts/prep-*.mjs`, `docs/02_DATA_SOURCES.md` |
| Scénarisation | `episode.json` : `say`, caméra, ~25 types d'actions (declare, units, portrait, bigNumber, archive, callout, path, ghost…), `atWord`, respell | `episode.json`, `src/lib/schedule.ts` |
| Rendu visuel | Remotion + d3-geo ; MapLayer, Labels, Flag/FlagSwap, Units, Portrait, Counter, Timeline, DateBadge, Captions, Stickers, Fx, Brand | `src/components/*`, `src/lib/camera.ts` |
| Voix | ElevenLabs (Brian), cache, timings mot à mot, repli Kokoro local | `pipeline/tts.py` |
| Musique et son | Musique procédurale, 5 SFX, normalisation −14 LUFS | `pipeline/music.sh`, `public/sfx`, `Sfx.tsx` |
| Assets | Drapeaux modernes et d'époque, portraits + crédits, Library of Congress, Commons (file à 1 req/min) | `scripts/loc_search.py`, `fetch_*.sh`, `commons_search.py` |
| Orchestration | `pipeline/render.sh <id>` : voix → timings → musique → Remotion → loudnorm | `pipeline/render.sh` |
| Contrôle qualité | Agent `reel-reviewer` (beat par beat : clarté, exactitude, synchro, layout, rythme) ; `review_frames.py` (planches et chronologie des cues) | `.claude/agents/`, `pipeline/review_frames.py` |
| Potentiel viral | Agent `virality-reviewer` (note /100 et /10, hooks alternatifs, cover, légende) ; `virality_metrics.py` (métriques, images du hook, test de boucle) | `.claude/agents/`, `docs/VIRALITY_PLAYBOOK.md`, `pipeline/virality_metrics.py` |
| Licences et crédits | Domaine public / CC BY d'abord ; CC BY-SA avec accord ; crédit à l'écran et en commentaire épinglé | `CLAUDE.md` |

## Points forts
- Chaîne complète sujet → MP4 en une commande.
- Discipline de sources solide, règle explicite contre les faits inventés.
- Boucle d'amélioration en passes (clarté, puis virality, puis correctifs).

## Manques (y compris pour les futurs thèmes)
- Aucun moteur de rendu hors carte (3D pixel, simulation, capture d'écran).
- Pas de registre de licences (musique, SFX, polices).
- Pas de lint des zones de sécurité ni de scanner de secrets.
- Aucun test automatisé (`package.json` sans script `test`).
- README de 14 lignes ; `package.json` encore nommé `mapreels`.

## Adaptation aux 3 nouveaux thèmes (résumé)
- **3D pixel 8-bit :** scène `@remotion/three` en basse résolution à palette quantifiée, HUD, ralentis, chiptune ~100 BPM avec grille temps → cue.
- **Simulations :** moteur déterministe (graine et paramètres dans un `SIM.json`), compteur « IN SYNC x/N » et audio issus de la simulation, test de boucle.
- **Automatisation IA :** capture réelle (Playwright), données fictives générées, scanner de secrets, journal de mesure avant/après, livrable écrit avant publication.
- **Communs :** registre de licences, lint des zones de sécurité, contrôle −14 LUFS, mention « AI voice », 3 structures de hook en alternance.
