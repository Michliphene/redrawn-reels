# Audit du studio REDRAWN / RECEIPTS · 18 novembre 2026

**Verdict.** Le studio a une base de production solide. Le langage de cues, le kit visuel partagé, les prises réutilisables et les deux regards éditoriaux permettent de produire et d'itérer vite. Le passage au statut « prêt à publier » reste fragile. La routine peut livrer un MP4 différent de celui que les agents ont vu, et une revue peut décrire une scène que le code disponible ailleurs ne sait pas reproduire. La priorité est de lier le rendu, ses preuves, le kit et la validation du propriétaire à une version identifiable.

## Périmètre et preuves

- Base de travail `fdeb678e78464a6400353e6c7bfda74e240d8d45`, branche `claude/great-edison-8kpgf1`. Inventaire des 320 fichiers suivis et examen ciblé de `src/`, `public/`, `scripts/`, `pipeline/`, `tests/`, `raea/`, `.claude/`, `docs/` et `deliverables/`. L'examen des sources porte sur leur traçabilité dans le repo. Les affirmations historiques et les chiffres des filings demandent toujours leur visa éditorial.
- Dans un worktree séparé, `npm ci --offline` puis `npm test` ont réussi sous Windows (Node 26.12.1, Python 3.12.6, FFmpeg 9.0.2). TypeScript passe, **12/12 tests** passent, **12 épisodes, 0 erreur, 8 avec avertissements**. Dans le dossier local avec Chipotle, **13 épisodes, 0 erreur, 8 avec avertissements**, mêmes 12 tests. `node scripts/validate.mjs delta-amex --strict` sort avec le code 1 à cause du hook de 5,7 s.
- `npm run render -- __audit_missing__` échoue sous le shell npm Windows avec « pipeline n’est pas reconnu ». Git Bash peut démarrer `post.sh`, qui renvoie une erreur brute sur un argument absent. Le crash `drawtext` sans police explicite signalé dans la revue locale se reproduit sur une mire FFmpeg (Fontconfig, code Windows `0xC0000005`).
- Le chemin `npm run stills` a rendu une image de Delta à 0,85 s avec Chrome local et ANGLE, en 14,8 s, hors du dossier temporaire du sandbox que Webpack rejetait à cause du caractère `!`. L'image affiche bien le titre, l'avion et le chiffre de 8,2 milliards de dollars. Elle confirme un chemin DA 2 sur cette machine.
- Les deux MP4 Chipotle ont été contrôlés par FFprobe, mesurés avec `loudnorm` et inspectés sur huit images chacun. Les résultats concernent les exports existants. La recette complète d'un rendu Remotion ou raea, l'écoute intégrale et la synthèse payante restent à vérifier.
- L'audit distingue les fichiers suivis du chantier local Chipotle, des exports ignorés, des dépendances installées et des réglages Obsidian. L'audit et son plan sont les seuls fichiers de la proposition Git. La reprise depuis Git porte sur ces notes et la base suivie.

## Constats classés par impact

| Priorité | Constat et conséquence | Preuve |
|---|---|---|
| **P0 · Livraison** | `post.sh` peut relancer le rendu en cas de fichier absent ou périmé, puis produire le kit sans vérifier la version revue, les P1 ni le visa. La fraîcheur par date omet notamment les WAV et les dépendances de build. Les écarts durée/audio restent des messages. La skill impose un préflight strict mais recommande aussi un push en fin de routine, y compris lorsqu'elle s'active pour un simple renvoi. | [post.sh](../pipeline/post.sh#L20), [skill post](../.claude/skills/post/SKILL.md), [règles du studio](../CLAUDE.md#L15) |
| **P0 · Sources** | Le préflight accepte des correspondances numériques dans le Markdown, y compris par facteur 1 000/1 000 000/1 000 000 000, sans vérifier affirmation, unité, période ni ligne de la source primaire. Il inspecte quelques champs de texte et le `y` explicite de certaines actions. Alaska (`1856`), Netflix (`50 000 000`) et URSS (`1992`) ont des alertes à arbitrer sur la source. Le mode strict bloque aussi un écart de rythme. Pour Delta, la revue situe l'affichage du chiffre à l'image 0 et sa prononciation à 0,85 s. Le visa des deux 10-K reste ouvert. | [validateur](../scripts/validate.mjs#L72), [revue Delta](REVIEW_delta-amex.md#L119) |
| **P0 · Voix et mode de rendu** | Le fallback Kokoro est estampillé avec l'empreinte de la demande ElevenLabs. Au lancement suivant, un cache jugé à jour peut recycler le fallback. La migration appose aussi une empreinte courante sur un ancien fichier non estampillé. Côté image, un DA 2 peut basculer en DA 1 si WebGL manque. Les versions plates utilisent leur propre ID pour joindre les WAV, alors que les métadonnées chargent les timings de l'ID audio partagé. Risque de livrer une autre prise, une autre DA ou un remaster cassé selon l'environnement. | [TTS](../pipeline/tts.py#L132), [Root](../src/Root.tsx#L30), [Episode](../src/Episode.tsx#L74), [Money](../src/money/Money.tsx#L309) |
| **P0 · Chipotle local** | Le cue sheet déclare `slice/cut` et le validateur modifié localement l'accepte. Le checkout Remotion ne contient aucune station ni overlay `slice`. L'export local montre pourtant la découpe. La recette de cet export doit être retrouvée, ou la variante raea doit être déclarée et revue séparément. | `public/episodes/chipotle-10/episode.json:42` et `docs/REVIEW_chipotle-10.md` (locaux), [Money3D](../src/money/Money3D.tsx#L346) |
| **P1 · Contrat des cues** | Le préflight lit les timings par index, le runtime privilégie l'ID. Un `stampWord` qui précède le cue dans le même beat peut passer le préflight et déclencher une erreur au rendu. Un premier beat Money sans scène ou un Atlas sans caméra peut aussi passer la validation structurelle. Les 12 épisodes suivis résolvent leurs cues dans l'état constaté. | [validateur](../scripts/validate.mjs#L102), [schedule](../src/lib/schedule.ts#L6), [Atlas](../src/atlas/Atlas.tsx#L61) |
| **P1 · Preuves de revue** | Les scripts Python recalculent les cues sans `atTime`, pris en compte côté moteur. Le script des planches efface les images du hook et le JSON viral que l'agent peut venir de créer. Le script viral utilise par défaut le MP4 Remotion et échantillonne la fin à environ −0,2 s. Les rapports identifient surtout un chemin et un numéro de passe. | [cue runtime](../src/lib/schedule.ts#L16), [planches](../pipeline/review_frames.py#L10), [métriques](../pipeline/virality_metrics.py#L9), [agent viral](../.claude/agents/virality-reviewer.md#L10) |
| **P1 · raea** | Le rendu réutilise `media/` dès que la voix existe, même si les timings ont changé. Le pipeline masque le statut de `raea check` avec `|| true`. Les recettes d'encodage et les mesures de conformité diffèrent. La version du moteur et les ressources préparées devraient être identifiables par rendu. | [rendu raea iPhone](../raea/apple-iphone-3d/render.sh#L10), [préparation raea](../raea/apple-iphone-3d/setup.sh#L7) |
| **P1 · Kit et cohérence des outils** | Le générateur affiche REDRAWN en dur, et son résolveur numérique peut choisir le premier doublon là où `post.sh` refuse l'ambiguïté. La fraîcheur du lot de miniatures n'est testée que via le 16:9. Les miniatures conçues supposent des données cartographiques. Les planches choisissent aussi la composition autrement que le rendu quand `composition` est absent. | [posting_kit.py](../pipeline/posting_kit.py#L11), [post.sh](../pipeline/post.sh#L40), [Root](../src/Root.tsx#L14), [stills.mjs](../scripts/stills.mjs#L19) |
| **P1 · Reprise et environnement** | Le checkout contient les cue sheets, un lockfile, des WAV et des livrables de référence. Les MP4 sont ignorés. La base n'a ni CI suivie ni règle d'ignore projet pour `.env`. Le correctif d'ignore et les adaptations Windows repérés sont locaux. Les réglages actuels de checkout matérialisent des scripts shell en CRLF. | [.gitignore](../.gitignore), [package.json](../package.json#L5), [setup](../scripts/setup.sh), [manuel](STUDIO.md#8-resilience--what-can-fail-and-what-happens) |

## Ce que montrent les deux exports Chipotle

| Export local | Durée | Format | Loudness intégrée | Crête vraie |
|---|---:|---|---:|---:|
| Attribué à Remotion, recette à retrouver, `out/chipotle-10.mp4` | 40,00 s | 1080×1920, 30 fps, H.264/AAC | −14,25 LUFS | −1,45 dBTP |
| raea, `raea/chipotle-3d/out/chipotle.mp4` | 41,37 s | 1080×1920, 30 fps, H.264/AAC | −15,00 LUFS | −0,88 dBTP |

La comparaison visuelle montre deux montages différents. L'export attribué à Remotion garde le rappel de prix, la découpe latérale et le bloc annuel. raea propose en plus une comparaison de coûts par colonnes dans la conclusion, et le découpage est déjà lisible sur une image échantillonnée plus tôt. La revue locale Remotion note trois P1 encore ouverts, dont la répétition de `$1.62` au payoff et l'action promise avant la coupe. Le JSON raea local signale 42 avertissements de temps de lecture et une erreur de crête, au-dessus de son plafond de −1 dBTP. Chaque variante mérite sa propre écoute et sa propre revue.

Empreintes SHA-256 des MP4 mesurés et échantillonnés, dans l'ordre du tableau

- `b738f6735aa9ad750cdd5a3ba42f5b5606480c24fda40b1f7cbc46342d1ac2f9`
- `7808dc520279b816dcb7c77cf30ea913e1651446544a0eea4ad2d7ffa7736e25`

## Qualité des routines et des agents

- **À garder.** Les rapports techniques donnent déjà des corrections par beat et timecode, avec des P1 vérifiables comme la fermeture du problème de datation dans [Alaska, passe 5](review/alaska-1867-pass5.md). L'agent viral apporte une lecture distincte de la promesse du hook, du payoff et de la couverture. Les régressions DA 1, les guides visuels et le rendu par planches préservent l'identité du studio et réduisent le coût des itérations.
- **À rendre systématique.** Le producteur fournit un paquet de preuves lié à un MP4 précis. Le reviewer technique évalue l'état réel du fichier, l'agent viral évalue la version après correction ou une version provisoire explicitement marquée. Chaque constat comporte sa preuve, son propriétaire, son état et le prochain test. Un rapport peut rester incomplet si l'écoute, les images ou les sources manquent. Le score viral reste un jugement interne de montage et de packaging.
- **Mesure après publication.** Sur Louisiana, les revues mesurent un creux maximal passé de 2,84 à 2,03 s avec SSIM stable à 0,901. Korea améliore le SSIM de 0,898 à 0,956, avec encore 3,25 s de creux. Ces chiffres décrivent les montages. La boucle d'apprentissage demande des données d'audience par plateforme et variante, saisies après un post autorisé. [Louisiana](review/louisiana-1803-virality-pass3.md) · [Korea](review/korea-1945-virality-pass3.md)
- **Travail déjà disponible.** `origin/main` à `7d6a7e4` contient un board, un journal de publication et un panneau Claude. Cette branche part de la session Claude, qui a 11 commits propres face à ce `main`, tandis que `main` en a un. Porter le board et le journal avec des tests ciblés est préférable à recréer un dashboard. Leur fraîcheur par mtime et leur inférence de revue restent à aligner sur le manifeste proposé.

## Reprise avec Claude

Dans un clone du même dépôt, créer la branche locale suivie depuis GitHub.

```sh
git fetch origin
git switch --track origin/codex/audit-workflow-pipeline
```

Si la branche existe déjà dans ce clone, utiliser `git switch codex/audit-workflow-pipeline` puis `git pull --ff-only`.

**Message à donner à Claude**

> Lis `docs/AUDIT_WORKFLOW_2026-11-18.md` et le plan lié. Commence sur le lot 1 avec Alaska comme cas de revue versionnée et Delta comme cas de visa des sources. Au lot 2, vérifie d'abord les remasters suivis, puis récupère le projet Chipotle local et la recette Remotion manquante avant de reproduire la variante retenue. Utilise le board et le journal déjà présents sur `main` pour le lot 5. Propose des commits séparés et attache les résultats de chaque test d'acceptation. L'action de publication reste soumise au feu vert du propriétaire.

[Plan d'amélioration et critères d'acceptation](superpowers/plans/2026-11-18-studio-workflow.md)
