# Axes d'amélioration — REDRAWN et RECEIPTS (novembre 2026)

Document pour le propriétaire. Le manuel de production est `docs/STUDIO.md` ; les consignes courtes sont dans `CLAUDE.md`.

## 1. Le constat

Les deux manuels étaient solides sur le fond (sources, synchronisation voix/image, boucle, revues). Ils avaient
quatre angles morts, tous visibles quand on compare nos images à celles des comptes qui performent dans le même
créneau.

| # | Angle mort | Preuve dans le dépôt | Effet |
|---|---|---|---|
| 1 | **Zones couvertes par l'interface.** Aucune règle sur ce que Reels et TikTok recouvrent. | Étiquette de série à y=70 (sous l'en-tête Reels). Frise REDRAWN à y=1700 et source RECEIPTS à y=1660 (sous la description). Sous-titres jusqu'à y=1600. | Le haut et le bas de chaque reel publié sont en partie cachés. |
| 2 | **Une direction artistique de modèle.** Fond dégradé, aplats, Montserrat centré, émojis. | `Brand.tsx`, `Captions.tsx`, `Stickers.tsx`, `Money.tsx` : même recette que des milliers de comptes. | Rien n'identifie la chaîne en une image. |
| 3 | **Un tableau de bord posé sur l'image.** | REDRAWN affichait en même temps : étiquette, compteur, date, puce de chapitre, mini-globe, frise, sous-titres. | L'œil ne sait pas où aller ; l'information ne vit pas dans la scène. |
| 4 | **Un seul format : la leçon à la troisième personne.** | Les 20 sujets de REDRAWN et les 8 de RECEIPTS suivent le même squelette. | Aucune raison propre de rester jusqu'au bout (pas de défi, pas de choix). |

Trois faiblesses d'ingénierie s'y ajoutaient :

- les deux séries vivaient sur deux branches qui divergeaient (RECEIPTS n'avait pas la routine de publication) ;
- la voix était resynthétisée à chaque rendu dans une session neuve (crédits dépensés, repères décalés) ;
- une erreur de mot-repère n'apparaissait qu'au rendu, après la voix.

## 2. Ce qui est fait dans cette session

| Axe | Réalisé | Où |
|---|---|---|
| Une seule base | RECEIPTS fusionné avec REDRAWN ; un registre des chaînes | `public/studio.json` |
| DA v2 commune | Monde 3D basse résolution + typographie nette, trois voix de texte, marge gauche unique | `src/studio/` |
| Zones sûres | Mesurées sur tes captures, codées, vérifiables par un calque de contrôle | `src/studio/tokens.ts`, option `guides` |
| REDRAWN en 3D | Carte en relief : les pays sautent, prennent leur couleur, éclatent et se reposent sur leurs frontières exactes ; chars, soldats et foules en pièces 3D ; caméra dirigée par le script | `src/atlas/` |
| RECEIPTS en 3D | Un comptoir continu : produit sur socle, grille de 100, barres, carte, pions ; la caméra voyage d'une station à l'autre | `src/money/Money3D.tsx` |
| Anciens épisodes protégés | Sans champ `da`, un épisode se rend exactement comme avant | points d'entrée `Episode.tsx`, `Money.tsx` |
| Remasters | `ussr-1991-v2` et `costco-hotdog-v2` : même voix, mêmes faits, nouvelle image | `public/episodes/*-v2/` |
| Pré-vol | Mots-repères, identifiants de carte, scènes, assets, chiffres absents de `SOURCES.md`, zone sûre | `scripts/validate.mjs` |
| Voix | N'est réenregistrée que si le script ou les réglages changent | `pipeline/tts.py` |
| Rendu | Pré-vol, audio partagé, nouvelle tentative automatique, repli en 2D sans WebGL | `pipeline/render.sh`, `Root.tsx` |
| Tests | 12 tests automatiques, `npm test` | `tests/` |
| Planches | 12 images + planche en ~45 s, sans rendre la vidéo | `scripts/stills.mjs` |

## 3. Ce que le pré-vol a trouvé dans les épisodes existants

Aucune erreur bloquante. Cinq avertissements à traiter avant une republication :

| Épisode | Avertissement |
|---|---|
| `alaska-1867` | « 1853–1856 » est à l'écran (guerre de Crimée) mais 1856 n'apparaît pas dans `SOURCES.md`. |
| `ussr-1991` | « flag from 1992 » est à l'écran ; l'année figure dans `docs/04_VISUALS.md` mais pas dans `SOURCES.md`. |
| `ussr-1991` | Portraits `landsbergis`, `kravchuk`, `shushkevich` et drapeau `ge-1990` absents : ces éléments sont sautés au rendu. |
| `korea-1945` | Accroche de 5,1 s (objectif : 3,5 s au plus). |
| `netflix-100` | Accroche de 4,1 s. « 50,000,000 VIEWERS » est écrit en toutes lettres dans les sources, pas en chiffres. |

## 4. Ce qu'il reste à faire, par ordre d'impact

1. **Tourner un pilote dans un format à la deuxième personne ou à défi** (formats B et C de `STUDIO.md` §6).
   C'est l'écart le plus important avec les comptes de référence, et le seul que la 3D ne comble pas.
2. **Publier un remaster et mesurer.** Un seul envoi par plateforme d'abord, pour vérifier que le pointillé du
   rendu survit à la recompression.
3. **Habiller les cartes** (portraits, images d'archives, mât de drapeau) dans le même traitement que le monde.
   Aujourd'hui ce sont des photos nettes posées sur un décor en pixels.
4. **Un personnage récurrent** par série (un pion « toi » suffit pour les formats B et C).
5. **Compléter les sources** signalées au §3.
6. **Version de 61 à 70 s** pour TikTok si tu vises le programme de rémunération (voir §5).

## 5. Vérification du marché (16 novembre 2026)

Les résultats de recherche sont surtout des blogs de vendeurs d'outils. Je les cite avec ce niveau de confiance.

| Sujet | Ce qui ressort | Confiance |
|---|---|---|
| Signaux Instagram Reels | Temps de visionnage, « j'aime » par portée, envois par portée (Mosseri, janvier 2025). Une priorité « originalité » est rapportée pour 2026 sans source primaire. | Moyenne pour 2025, faible pour 2026 |
| TikTok Creator Rewards | Vidéos de plus d'une minute, 10 000 abonnés, 100 000 vues sur 30 jours, pays éligibles limités. | Faible : guides tiers concordants, pas de page officielle lue |
| Cartes animées | Les formats cités sont « le saviez-vous », trajets, guerres, classements. Aucune donnée sur la 3D contre le plat. | Faible |
| Vidéo par code | Remotion a publié des « Agent Skills » pour Claude Code en janvier 2026 ; les guides recommandent des formats répétables plutôt qu'une DA refaite à chaque vidéo. | Moyenne |
| Rendu 3D sans carte graphique | Remotion 4 : option `swangle`. Vérifié ici : ça fonctionne. | Vérifié |

Ce que je n'ai pas pu vérifier : le site `sciencein8bit.com` est bloqué depuis cette session, donc leur méthode
exacte reste une déduction à partir de tes captures.

Sources :
[SocialPilot, algorithme Reels](https://www.socialpilot.co/blog/instagram-reels-algorithm) ·
[Creatorflow, algorithme Instagram 2026](https://creatorflow.so/blog/instagram-algorithm/) ·
[TTCalculator, Creator Rewards 2026](https://ttcalculator.net/guides/creator-rewards-program/) ·
[Thematic, monétiser TikTok](https://hellothematic.com/monetize-on-tiktok/) ·
[Remotion, options GL](https://www.remotion.dev/docs/gl-options) ·
[Remotion, Three.js](https://remotion.dev/docs/three) ·
[DEV, cartes animées pour les Shorts](https://dev.to/mark_line_d711361a7f9bc26/how-to-create-viral-shorts-using-map-animation-ai-youtube-tiktok-reels-guide-4j6j) ·
[Satura AI, vidéo sans visage par prompts](https://saturaai.com/blog/faceless-youtube-motion-graphics-are-now-prompting-problem-not-design-problem-fkace-)

## 6. Décisions qui t'appartiennent

1. **Les nouveaux noms des chaînes.** Tu as dit les avoir renommées ; je ne les connais pas. Donne-les-moi : c'est une
   ligne par chaîne dans `public/studio.json`, et l'étiquette à l'écran, les couvertures et les kits suivent.
2. **Remasters : nouvelle publication ou remplacement ?** Les épisodes `-v2` ont le même script que les originaux.
3. **Le troisième projet.** La base est prête pour une troisième série (voir `STUDIO.md` §9). Il manque le sujet.
4. **La branche `claude/priced-in-hours-ep01`** (moteur de graphiques) n'a pas été fusionnée. Dis-moi si elle sert encore.
