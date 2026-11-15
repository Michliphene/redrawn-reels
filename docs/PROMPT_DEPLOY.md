# Prompt « déploiement » — à coller dans Claude Code après chaque rendu

Remplace `<id>` (ex. `costco-hotdog`) et `<serie>` (RECEIPTS ou REDRAWN), puis colle le bloc.

```
Prépare tout le déploiement de l'épisode <id> (série <serie>) pour TikTok, Instagram Reels et YouTube Shorts.
Lis d'abord public/episodes/<id>/SOURCES.md, episode.json, timings.json, docs/REVIEW_<id>.md, docs/VIRALITY_PLAYBOOK.md
et deliverables/<id>/POSTING.md s'il existe. N'invente aucun chiffre : tout vient de SOURCES.md.

1. VÉRIFS AVANT PUBLICATION
   - Liste les chiffres à cocher dans la source primaire (tableau : ligne · valeur à l'écran · où la vérifier).
   - Rappelle les points ouverts de la revue (voix à écouter, limites connues). Dis clairement si quelque chose bloque la publication.
   - Vérifie que out/<id>.mp4 existe, durée, −14 LUFS, et que la couverture existe (sinon génère cover_9x16.png et cover_3x4.jpg).

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

6. SORTIE : écris tout dans deliverables/<id>/POSTING.md (même structure que costco-hotdog), commit + push sur la branche
   de développement, puis résume-moi en français : ce que je dois cocher, ce que je copie-colle, dans quel ordre.
   Si tu as accès à Postiz et que je te l'ai demandé explicitement, programme les posts en BROUILLON uniquement ;
   ne publie jamais sans mon feu vert.
```
