# Plan d'amélioration du pipeline du studio

> Pour Claude, commencer par le contrôle de livraison sur un manifeste de test rempli manuellement. Les lots 2 à 4 alimentent ce même contrat avec le rendu, les médias et les revues. Le lot 5 lit le contrat dans le board.

**Objectif.** Produire sur une autre machine la variante voulue, puis remettre exactement le fichier et le kit que le propriétaire a validés.

**Architecture.** Remotion reste la voie standard, raea une cible déclarée par variante. Les deux produisent un manifeste de rendu et utilisent les mêmes contrôles de livraison. Le CLI, les agents et le board lisent ce manifeste.

**Technologies.** Node, TypeScript, Python, FFmpeg, Git Bash, Remotion et raea.

**Référence.** [Audit du 18 novembre](../../AUDIT_WORKFLOW_2026-11-18.md).

## Contraintes communes

- Conserver les cue sheets existants, la possibilité de lire l'historique et le rendu DA 1 des épisodes publiés. Les dérogations existantes sont explicites, datées et limitées à une version.
- Conserver les règles du studio. Faits traçables, crédits et droits, sûreté d'écran, revue du fichier final, feu vert du propriétaire pour toute action sur une plateforme.
- Les vérifications automatisées utilisent des fixtures, des médias existants et des exécutables simulés quand c'est possible. Les appels vocaux payants sont réservés à une commande de production qui les demande explicitement.
- Le dépôt conserve les manifests compacts, notes et décisions. Les MP4 et planches restent des artefacts, référençables par empreinte et emplacement accessible depuis une autre machine.

## Lot 1 · P0 · Livrer le fichier effectivement revu

**Responsables proposés.** Pipeline + propriétaire pour le visa. Fichiers concernés `pipeline/post.sh`, `pipeline/posting_kit.py`, `.claude/skills/post/SKILL.md`, `CLAUDE.md` et `docs/PROMPT_DEPLOY.md`.

- [ ] Définir le manifeste avec `episodeId`, `variantId`, `engine`, `effectiveDa` lorsque pertinent, `inputsSha256`, `videoSha256`, `kitSha256`, versions d'outils, mesures techniques, références des deux revues, liste des P1 et visa horodaté du propriétaire. Calculer `kitSha256` à partir d'un inventaire trié des textes et couvertures remis, avec une empreinte par fichier. Les deux revues référencent au minimum `videoSha256`. Le visa référence le rendu et le kit, avec le contrôle des sources, des droits et de l'écoute. Pour commencer, accepter un manifeste rempli manuellement sur une fixture.
- [ ] Résoudre l'identifiant et la variante avant tout contrôle. Refuser un numéro ambigu avec les IDs possibles. Faire de `post.sh` le contrôle et la remise du kit validé. Un nouveau rendu repasse par la commande de rendu. Documenter séparément le renvoi, la préparation, le push Git, le brouillon et l'action de publication. Retirer le push implicite sur un renvoi.
- [ ] Rendre la décision vérifiable par le code de sortie. Un MP4 manquant ou modifié, un P1 ouvert, une preuve liée à un autre hash, un visa absent et un format, une durée ou un audio hors profil bloquent « prêt ». Profil studio proposé pour le pilote, 1080×1920, 30 fps, H.264/AAC, 30–75 s, −14 ± 1,5 LUFS et crête vraie ≤ −1 dBTP mesurée sur le MP4 livré. Une modification du texte ou le remplacement d'une couverture au même chemin invalide le visa du kit et garde les revues vidéo utilisables si leur hash correspond. Consigner les écarts éditoriaux acceptés par code, justification, timecode et responsable. Rejouer avec Alaska et Delta.
- [ ] Utiliser `public/studio.json` pour les noms, prévoir une couverture standard par composition et contrôler indépendamment les fichiers vidéo et couverture que le kit annonce. Produire des textes par plateforme depuis les mêmes faits validés. Tester un numéro dupliqué, un kit RECEIPTS et une miniature mobile manquante avec un 16:9 présent.

**Critère de sortie.** Un renvoi du bon manifeste n'appelle aucun moteur, TTS ou Git distant. Un changement de MP4 d'un octet renvoie une erreur. Sur Delta, une dérogation pour l'ouverture de 5,7 s laisse le visa des 10-K en attente. Une fois ces sources validées et toutes les autres conditions remplies, le hook accepté ne bloque plus le kit.

## Lot 2 · P0 · Reproduire la cible et les médias

**Responsable proposé.** Moteurs. Fichiers concernés `src/Root.tsx`, `src/Episode.tsx`, `src/money/`, `scripts/validate.mjs`, `scripts/stills.mjs` et `raea/*/{setup,render}.sh`.

- [ ] Partager la résolution de l'ID audio, de la série, de la composition, de la DA et des capacités requises. Exposer les chemins voix/timings/musique et la cible effective au render, aux stills et au préflight. Tester `ussr-1991-v2`, `costco-hotdog-v2` et `apple-iphone-v2` en DA 2, DA 1 forcée et WebGL absent. Une cible incapable de rendre la variante choisie donne une erreur explicite avant rendu final.
- [ ] Valider les données à l'entrée puis partager le résolveur de cues avec le moteur. Vérifier correspondance des IDs de beat, chronologie et bornes, scène initiale Money et caméra Atlas. Utiliser les timings réels pour le mode prêt à rendre, et le texte pour un diagnostic de brouillon. Tester la permutation des beats, une deuxième occurrence absente, un `stampWord` antérieur à l'action et un `atTime` hors de la durée. Conserver les résultats des épisodes suivis et rendre le test négatif du script de remaster effectif.
- [ ] Récupérer la composition Chipotle raea locale et retrouver la recette de l'export attribué à Remotion. Décider une variante raea explicite ou restaurer `slice` et `burrito` côté Remotion avec un test de station et d'overlay. Rejeter `slice/cut` avant rendu pour toute cible qui ne les implémente pas. Valider l'unité, l'arrondi et le regroupement des coûts dans les deux montages à partir des mêmes lignes de source.
- [ ] Pour raea, fixer une version d'outil, comparer une empreinte des médias préparés et faire remonter le résultat de `raea check` en conservant son JSON. Une mise à jour de timings ou un média absent entraîne une nouvelle préparation. Tester en injectant un faux CLI qui échoue au contrôle. Séparer les avertissements de lecture des résultats qui bloquent la livraison.

**Critère de sortie.** Le préflight et la timeline du moteur résolvent la même frame pour des cues identiques. Une image par série et par DA couvre les quatre chemins Remotion, puis un court export Delta avec voix existante teste la recette effective. Une fois les sources, médias autorisés et versions d'outils accessibles depuis un clone propre, la cible Chipotle choisie reproduit la découpe.

## Lot 3 · P0 · Rendre l'exécution portable et les caches sûrs

**Responsable proposé.** Pipeline. Fichiers concernés `package.json`, `.gitattributes`, `.gitignore`, `scripts/setup.sh`, `pipeline/render.sh`, `pipeline/music.sh` et `pipeline/tts.py`.

- [ ] Fournir une commande commune qui vérifie Node, Python, FFmpeg/FFprobe et Chromium ou raea. Documenter les versions réellement testées, les profils Windows et Linux et le stockage local de la configuration. Ajouter une règle d'ignore suivie pour `.env` et la normalisation LF des scripts Bash. Reprendre les adaptations Windows pertinentes du chantier local après revue.
- [ ] Distinguer l'empreinte de la demande TTS de la provenance effective. Inclure le moteur, son modèle ou la version locale, les réglages et les checksums voix/timings. Marquer les paires héritées sans empreinte pour vérification. Écrire voix et timings dans un espace temporaire puis promouvoir la paire validée. Donner un chemin de rendu à partir des seuls médias déjà validés et rendre le fallback visible dans le manifeste.
- [ ] Ajouter un contrôle automatique Windows/Linux avec installation verrouillée, `npm test`, préflight et fixtures sans navigateur. Ajouter ensuite une recette courte avec navigateur si les outils sont disponibles. Tester la commande de rendu avec un ID absent, un cache périmé, un WAV manquant et un refus du fournisseur simulé. Le dernier cas doit conserver l'ancienne paire valide et identifier la nouvelle prise effective si un fallback a été demandé.

**Critère de sortie.** Un clone Windows et un clone Linux arrivent à la même décision sur les fixtures avec une commande documentée. Un fallback Kokoro ne satisfait pas une demande explicite de prise ElevenLabs. Un deuxième lancement sur les mêmes entrées valides réutilise les fichiers et leur provenance.

## Lot 4 · P1 · Donner aux agents des preuves communes

**Responsables proposés.** Producteur, `reel-reviewer` et `virality-reviewer`. Fichiers concernés `pipeline/review_frames.py`, `pipeline/virality_metrics.py`, `.claude/agents/` et `docs/VIRALITY_PLAYBOOK.md`.

- [ ] Produire les preuves dans un dossier indexé par variante et SHA-256 du MP4. Extraire le hook et la boucle, les frames aux cues, les vues avec zones sûres, les mesures de format/audio et la timeline résolue par le moteur. Stocker un statut pour toute extraction échouée. Définir la police explicitement et éviter de faire passer la narration dans la syntaxe du filtre FFmpeg. Tester un mot ponctué et l'ordre des deux générateurs sous Windows.
- [ ] Donner aux deux agents les mêmes entrées immuables. Le reviewer technique renseigne faits, média, sync, lecture, zones sûres, audio et droits, avec `findingId`, gravité, timecode, preuve et fix proposé. L'agent viral intervient sur la passe bloquante close ou marque sa lecture « provisoire ». Il distingue durée du premier beat, délai avant le premier élément informatif, temps de lecture du payoff et variation visuelle vérifiée. Le producteur signe chaque fermeture et relance les preuves si le MP4 change.
- [ ] Relier chaque affirmation importante à un ID de fait dans le dossier sources. Pour RECEIPTS, noter le document, la ligne, l'exercice, l'unité et la formule. Pour REDRAWN, noter date, source de géométrie, statut des frontières et droits des images. Le contrôle machine vérifie la présence du lien. Le reviewer et le propriétaire valident le sens et le contexte.

**Critère de sortie.** Rejouer Alaska, Delta et la variante Chipotle choisie quand ses entrées sont disponibles. Une revue affiche la preuve précise de chaque P1 et le hash du rendu. Un échec d'extraction donne un statut incomplet, et régénérer les planches conserve le JSON viral de la même version. Un cue `atTime` est tracé à une frame près. La recette de bout en bout clôt ce lot avec un épisode suivi, une voix existante, un MP4 neuf, les deux revues et un visa de test, puis un renvoi du kit depuis un second checkout.

## Lot 5 · P2 · Reprendre depuis le board et apprendre après publication

**Responsables proposés.** Studio + propriétaire. Travail existant à porter depuis `7d6a7e4` sur `main` dans `scripts/board.mjs`, `scripts/track.mjs`, `tracker/posts.json` et le panneau Claude.

- [ ] Remplacer la décision de fraîcheur par date par la lecture des manifests, et distinguer rendu local, artefact accessible ailleurs, preuve manquante et kit approuvé. Faire afficher par le board la variante, le prochain geste et son responsable. Tester en simulant un clone qui dispose des seules décisions suivies et d'un lien d'artefact.
- [ ] Après une publication autorisée, relever à 24 h et à J+7 les données disponibles par plateforme, variante et dénominateur. Choisir un indicateur et un volume minimal avant de tester une seule variable de packaging. Conserver l'issue « indéterminé » si le volume ou les données manquent.

**Critère de sortie.** Une seconde machine sait reprendre au bon stade sans deviner d'après les dates de fichiers. Le journal distingue une mesure de montage, un jugement d'agent et un résultat d'audience.
