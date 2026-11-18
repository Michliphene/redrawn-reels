# Rendu, revue et remise du kit

Le MP4 de revue a une empreinte SHA-256. Le manifeste lie cette empreinte aux entrées, à la recette et aux mesures techniques. Les reviewers et le propriétaire se prononcent sur cette version. Le board reprend la décision du contrôle de remise.

## Production locale

1. Exécuter `npm run validate <id>` et traiter les erreurs. Le rapprochement de nombres par le préflight est un signal de recherche. Le visa des affirmations, unités et périodes est humain.
2. Vérifier les images avec `npm run stills <id> -- --n 12 --cols 6`. Ajouter `guides: true` aux props pour examiner les zones sûres. Pour Remotion DA 2, installer ou indiquer un Chrome local compatible WebGL avec `REMOTION_CHROME`. `REMOTION_GL` sélectionne le backend si besoin.
3. Lancer `npm run render -- <id>`. Le rendu Remotion utilise les WAV et timings existants, exige la DA sélectionnée et écrit `out/<id>.mp4` et `out/<id>.render.json`. Les overrides de DA ou CRF vont dans `out/variants/`. Sous Git Bash, `pipeline/render.sh` délègue à la même commande.
4. Pour produire une nouvelle prise intentionnellement, utiliser `--synthesize` avec le moteur souhaité. `--allow-fallback` autorise explicitement Kokoro en cas d'échec ElevenLabs. Les médias de remaster se préparent sur l'épisode audio source. Les prises historiques apparaissent comme `legacy-unverified` dans la recette jusqu'à une nouvelle prise vérifiable. Un rendu de ces fichiers reste possible pour l'écoute et la revue. `python pipeline/tts.py <id> --status` affiche l'état de la paire existante.
5. Pour une variante raea, utiliser le script du projet et son manifeste. Le moteur a ses propres médias préparés et contrôles. Associer le chemin de variante à chaque commande de revue et de remise. Une revue raea peut documenter les cues manuellement si l'adaptateur de timeline manque.

Le contrôle d'identité fonctionne même sur un export dont le profil de remise échoue.

```sh
npm run delivery -- inspect <id> --manifest out/<id>.render.json
python pipeline/review_frames.py <id> --manifest out/<id>.render.json
python pipeline/virality_metrics.py <id> --manifest out/<id>.render.json
```

Sur Linux, utiliser `python3` si nécessaire. Chaque extraction crée son propre index et des fichiers sous `out/review/<id>/<videoSha256>/`. Les métriques de coupe ou de rythme sont des aides à la lecture. Les reviewers regardent aussi le MP4 exact, et signalent tout élément qu'ils n'ont pu vérifier. Les manifestes et empreintes sont portables entre checkouts ayant les mêmes entrées. Les empreintes de texte tolèrent les fins de ligne CRLF et LF, celles des médias et des artefacts d'extraction couvrent les octets.

## Kit et visa humain

Écrire `deliverables/<id>/POSTING.md` avec `## TikTok description`, `## Instagram description`, `## Pinned comment` et, si utile, `## Title` et `## YouTube Shorts description`. Les anciens kits avec `## Caption` restent lisibles. Générer la copie locale avec `python pipeline/posting_kit.py <id>`. Préparer et regarder la couverture 9:16. Si le kit inclut la miniature dessinée 16:9, les versions 9:16 et 3:4 doivent être présentes.

Le profil de remise est un profil studio pour ce repo. Il exige un MP4 vertical 1080×1920 à 30 fps, H.264/AAC, 30–75 s, −14 ± 1,5 LUFS et une crête vraie ≤ −1 dBTP. Ces seuils constituent une porte technique locale.

```sh
npm run delivery -- packet <id> --manifest out/<id>.render.json
npm run delivery -- artifact docs/review/<id>-passN.receipt.json
```

Préparer `public/episodes/<id>/CLAIMS.json` avec une liste `claims` et un `id`, `claim`, `unit`, `period` par affirmation. Les inventaires Alaska et Delta sont des brouillons issus des cues et de `SOURCES.md`. Le reviewer confronte l'inventaire à la voix, à l'image et au kit. Le propriétaire approuve chaque ID, ajoute la référence vérifiée et confirme l'unité et la période.

Copier l'objet produit par `packet` dans `deliverables/<id>/RELEASE.json`. Ajouter les deux reçus de revue et le visa effectif ci-dessous. Utiliser la commande `artifact` pour les références de fichiers. Les valeurs de ce modèle sont illustratives.

```json
{
  "reviews": [
    {"kind": "technical", "receipt": {"path": "docs/review/…technical.receipt.json", "sha256": "<hash>"}},
    {"kind": "virality", "receipt": {"path": "docs/review/…virality.receipt.json", "sha256": "<hash>"}}
  ],
  "owner": {
    "by": "<nom du propriétaire>",
    "at": "<date ISO du visa>",
    "videoSha256": "<empreinte du packet>",
    "renderSha256": "<empreinte du manifeste du packet>",
    "kitSha256": "<empreinte du kit du packet>",
    "listening": true,
    "rights": true,
    "sources": {
      "status": "approved",
      "sha256": "<sourcesSha256 du packet>",
      "inventorySha256": "<claimsSha256 du packet>",
      "claims": [
        {"id": "<id repris de CLAIMS.json>", "claim": "<affirmation>", "reference": "<document, page ou ligne>", "unit": "<unité>", "period": "<période ou date>"}
      ]
    }
  }
}
```

Le format contrôle la présence du visa et la version des pièces, avec une décision pour chaque ID de l'inventaire. Il s'appuie sur une personne habilitée pour l'identité du propriétaire, l'exhaustivité de cet inventaire et la véracité des affirmations. Les agents laissent la décision ouverte tant que le propriétaire n'a pas donné son visa. Les dérogations éditoriales de rythme restent dans le reçu et le rapport. Le contrôle exige des revues complètes, zéro P1 ouvert et les index d'extraction correspondants.

```sh
npm run post -- <id>
npm run delivery -- status <id> --json
npm run board
npm run track -- list
```

La première commande vérifie et imprime les fichiers exacts à remettre. Elle peut être relancée pour un renvoi. Pour une variante, passer `--manifest <path> --approval <path>` aux deux commandes de contrôle ou à `npm run board -- --episode <id>`. Une modification de vidéo, d'entrée, de preuve, de rapport ou de kit bloque la remise de la version précédente. Les actions plateforme et les écritures Git distantes ont leurs propres autorisations.

## Cas de recette

| Épisode | Vérifier | Décision humaine |
|---|---|---|
| Alaska | Réutiliser les revues historiques comme contexte, produire une nouvelle preuve liée au MP4, tester une modification du fichier et contrôler l'alerte sur 1856. | Préciser la source de la ligne signalée, puis écoute et visa de la version. |
| Delta | Le chiffre est déjà visible à l'image 0 selon la revue. Une dérogation sur le premier beat à 5,7 s ne solde pas le contrôle des chiffres. | Comparer les 8,2 / 63,4 / 5,8 milliards USD et les ratios aux documents Delta FY2025 et comparer 13 % / 21 % à l'Amex FY2025, avec les bons dénominateurs. |
| Chipotle | La machine d'origine possède le projet raea, les timings, les WAV et deux exports locaux. Le code Remotion présent ne contient pas la station `slice` de l'export attribué à Remotion. | Choisir la variante après avoir établi sa recette et revu les chiffres, le payoff, la lecture et les crêtes. |

Le prototype de cadrage Delta est isolé derrière `deltaPreview`. Pour comparer les images 0, 0,85 et 2,5 s, utiliser les mêmes timings et ajouter `--props '{"deltaPreview":true}'` sur le deuxième run de `scripts/stills.mjs`. Le titre, le zoom initial et le retrait de la donnée changent sur les images du prototype. L'épisode et la voix de référence restent les mêmes.

## Outils et accès

| Choix | Apport, coût et contrôle |
|---|---|
| Remotion, FFmpeg, FFprobe et reviewers du dépôt | Stack retenue. Utilise les outils installés et les entrées suivies. Les tests et les planches permettent de vérifier le comportement. Les reviewers consomment du contexte et leurs jugements restent éditoriaux. |
| Board et journal de `main` | Réutilisés sous forme CLI locale. Le journal nécessite une saisie manuelle et aucun compte. Le panneau Claude existant demanderait une adaptation au champ de visa et un test sur la version du client de l'utilisateur. |
| raea | Variante de rendu utile lorsqu'une scène le justifie. Dépend du CLI installé, de FFmpeg et de la conversion des polices. Recette et rendu doivent être testés par projet. |
| Metricool | À réévaluer quand la saisie manuelle freine le suivi. Peut centraliser les statistiques, avec connexion aux comptes et peut-être un abonnement selon le plan. Un pilote en lecture sur un seul compte comparerait chiffres et dénominateurs au journal, puis vérifierait les accès accordés. |
| vidIQ et Descript | Réserve pour une question de recherche YouTube ou un vrai besoin de montage hors code. Ils introduisent un compte, une maintenance et, pour certains usages, un transfert de médias. Le workflow local couvre la recette actuelle. |
