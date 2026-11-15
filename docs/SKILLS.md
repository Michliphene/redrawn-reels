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

## Comparatif avec ScentArchive (`Michliphene/scentarchive`, branche `claude/baccarat-rouge-540-v3-wv8c0e`)

Lu le 2026-11-15, d'après `CLAUDE.md`, `HANDOFF.md` (mis à jour le 12/11), `README.md` et l'arborescence. Rien n'a été exécuté.

**Nature du projet :** compte TikTok / Reels / Shorts animé sur les parfums (histoire, molécules, dupes, mythes). Même format que REDRAWN (1080×1920, 30–60 s, sans visage, en anglais), même base Remotion, mais avec une mascotte, **Archie** (atomiseur vintage en SVG).

**État :** 4 épisodes rendus (001 v2 et v3 avec 3 hooks A/B/C, 002 Iso E Super, 003 « frotter ses poignets »). Aucun jugé publiable : voix edge-tts reconnaissable, faits ☐ à cocher, vidéo 003 non regardée.

| Domaine | REDRAWN | ScentArchive | Avantage |
|---|---|---|---|
| Voix | ElevenLabs (Brian), cache, timings mot à mot | edge-tts (voix en-GB pour Archie, voix US pour le narrateur) ; jugée « défaut n°1 » | REDRAWN |
| Sources et exactitude | `SOURCES.md` par épisode, tags DATES VARY / DISPUTED | Tableau de faits dans chaque script, cases ☐ à cocher, test anti-slop | REDRAWN (plus systématique) |
| Agents de review | `reel-reviewer`, `virality-reviewer`, scripts de métriques | Aucun agent ; test « anti-slop » en 6 questions rempli à la main | REDRAWN |
| Mesure du hook et de la boucle | `virality_metrics.py` (images 0–3 s, comparaison première/dernière image) | Boucle vérifiée à la main (écart moyen 3/255 mesuré sur le 003) | REDRAWN |
| 3D | Aucune | Blender : flacon héros (90 images) et flacons « dupe » / brume, importés comme séquences | ScentArchive |
| Personnage récurrent | Aucun (portraits d'archives) | Archie 100 % SVG : 10 expressions, synchro labiale sur le volume, clignements | ScentArchive |
| Sous-titres | Mot par mot (`Captions.tsx`) | Cartes de sens de 1 à 3 mots, ≥ 0,5 s, taille fixe | ScentArchive (à évaluer sur la rétention) |
| Kit de motion | Cues d'`episode.json` | `motion.ts` (anticipation, dépassement, squash, bruit), `kit.tsx` (coupes internes, caméra en plongée), 7 transitions `@remotion/transitions` | ScentArchive |
| Images | Archives libres de droits (LoC, Commons) avec crédit | Images IA (Gemini web, GPT-image) détourées, label « AI-generated content » | Différent (pas comparable) |
| Séries et backlog | `docs/01_SERIES_AND_TOPICS.md` | 6 séries et `idees.md` avec statuts | Équivalent |
| Skills Claude Code | Aucune skill locale | Skill Remotion officielle installée (captions, maps, 3D, interactivité) | ScentArchive |
| Pipeline | `pipeline/render.sh <id>` en une commande | `rendre.mjs <ID>` et `npm run render:*` ; contournement Edge sur un PC Windows | REDRAWN (plus simple) |

### Pistes de transfert
- **REDRAWN → ScentArchive :** voix ElevenLabs, agents de review et `virality_metrics.py`, `SOURCES.md` par épisode. Limite : la clé ElevenLabs de REDRAWN est injectée par l'environnement cloud de ce repo, elle n'existe pas dans ScentArchive.
- **ScentArchive → REDRAWN :** pipeline Blender et `@remotion/three` comme base du thème « 3D pixel 8-bit », kit de motion, skill Remotion, sous-titres en cartes à tester sur un épisode REDRAWN.
- **Points à ne pas copier tels quels :** le test « anti-slop » est utile, mais il repose sur des réponses déclaratives ; chez REDRAWN les métriques sont mesurées par script.
