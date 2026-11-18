# Prompt « déploiement » — à coller dans Claude Code après chaque rendu

Remplace `<id>` (ex. `costco-hotdog`) et `<serie>` (RECEIPTS ou REDRAWN), puis colle le bloc.

```
Prépare tout le déploiement de l'épisode <id> (série <serie>) pour TikTok, Instagram Reels et YouTube Shorts.
Lis docs/STUDIO_DELIVERY.md, le manifeste précis du rendu, les deux revues qui correspondent à son SHA-256,
public/episodes/<id>/SOURCES.md et deliverables/<id>/POSTING.md. Chaque affirmation reste à vérifier dans sa source primaire.

1. VÉRIFS AVANT PUBLICATION
   - Liste les chiffres à cocher dans la source primaire (tableau : ligne · valeur à l'écran · où la vérifier).
   - Rappelle les points ouverts de la revue (voix à écouter, limites connues). Dis clairement si quelque chose bloque la publication.
   - Prépare les couvertures et le packet du kit comme décrit dans le runbook. Identifie le profil technique et les P1
     encore ouverts. Le propriétaire coche les affirmations, leurs unités et périodes et confirme écoute, droits et kit.

2. DESCRIPTIONS PRÊTES À COLLER (anglais, un bloc de code par plateforme)
   - TikTok : 1re ligne = mots-clés recherchés + chiffre-choc ; 2-3 phrases ; finit par UNE question qui appelle un commentaire ;
     "Sources in the comments" ; 5 hashtags max (1 sujet + 2 série + 2 larges).
   - Instagram : même fond, finit par une invitation à ENVOYER à quelqu'un (signal "sends") ; sources ; disclaimer
     ("Not affiliated with …", "Not financial advice" pour RECEIPTS) ; 5 hashtags max.
   - YouTube Shorts : titre ≤ 70 caractères avec le mot-clé principal + description (texte Instagram + liens des sources).
   Pas de hashtags dans la bio. Pas de promesse que la vidéo ne tient pas. Pas de formulation causale si les causes sont débattues.

3. COMMENTAIRE ÉPINGLÉ (identique partout) : sources avec liens, ce qui est un calcul maison ("our calculation"),
   points débattus ou approximatifs, crédits images, puis une question qui prépare le prochain épisode.

4. TEXTES ANNEXES
   - Texte de couverture (3-5 mots max) et vérification qu'il est lisible en miniature.
   - 2 titres alternatifs pour un test A/B de la première ligne.
   - 3 réponses prêtes pour les commentaires prévisibles ("c'est faux", "et X ?", "source ?") qui citent la ligne de la source.
   - 1 idée d'épisode suivant (teaser) à mettre en question dans le commentaire.

5. CALENDRIER : meilleur créneau de publication pour une audience US/UK (heure de Paris), ordre de publication
   (TikTok d'abord ou simultané), et quand répondre aux premiers commentaires (première heure).

6. SORTIE
   - Écris les champs éditoriaux dans deliverables/<id>/POSTING.md, génère le kit local et prépare le packet.
   - Quand le propriétaire a confirmé le visa, utilise npm run post -- <id> et transmets les chemins vérifiés.
   - Demande une autorisation propre pour tout push Git ou action sur une plateforme.
```
