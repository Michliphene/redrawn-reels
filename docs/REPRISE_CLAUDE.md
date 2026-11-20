# Reprise Claude — audit du studio

Branche : `codex/studio-pipeline-audit`. Brief : améliorer concrètement REDRAWN/RECEIPTS,
sans publier. Français avec le propriétaire, anglais dans les vidéos.

## Déjà implémenté
- Politique commune STUDIO : descriptions 120–220 caractères, 0–3 hashtags, aucun CTA imposé;
  provenance conservée, plus de badge IA automatique pour les nouvelles productions.
- `posting_kit.py` : contrôle sans troncature, identité du registre, refus des numéros ambigus.
- `npm run direct -- <id>` : proposition locale et comparaison structurelle des trois derniers épisodes.
- Contrôles opt-in dans Atlas/Money3D : ouverture, plans tenus, lumière; composition et transitions Money,
  sons parcimonieux. Les valeurs par défaut des anciens épisodes sont conservées.
- `npm run preview -- <id> --from 0 --seconds 8` : extrait avec audio existant, bundle mis en cache,
  assets servis sur loopback sans recopier public/. Les stills utilisent le même service.
- Copie `delta-amex-evidence`, voix et faits de `delta-amex`, sans toucher à l'original.

## Vérifications et preuves locales
- TypeScript OK; 13 tests TypeScript et 5 tests Python OK lors de cette session.
- Démonstrateur : validation 0 erreur, avertissement hook 5,7 s conservé car la voix est partagée.
- `npm test` global échoue déjà sur copy-to-learn et getaway-003-monalisa (schémas/séries hors cible).
  Ne pas masquer ces erreurs; les tests unitaires historiques ne parcourent qu'une liste d'épisodes.
- `out/delta-amex-evidence.mp4` : draft intégral 44,1 s, 540×960, 30 fps, 44,3 s de rendu local.
- `out/audit/delta-before-hook.mp4` : référence de 8 s. `out/audit/after-delta/` et `guides-delta/` : stills.
- Le premier `out/audit/delta-after-hook.mp4` est obsolète; extraire le hook du draft intégral.
- Baseline 3 stills : 5,4 s; après cache chaud : 1,6 s. Backend passé de swangle à angle :
  ce n'est pas une mesure isolée du cache. 325 267 676 octets d'assets ne sont plus recopiés.
- Aucun crédit TTS/image, aucun asset distant généré ou téléchargé pendant cet audit.

## À terminer avant de déclarer l'audit fini
1. Reel-reviewer puis virality-reviewer. Première revue interrompue par quota d'agent, pas de score validé.
   Ne pas inventer de score ou de métrique d'audience. Examiner chaque beat, guide, transition et boucle.
2. Corriger `pipeline/review_frames.py` : drawtext/Fontconfig plante sur ce Windows; utiliser une police
   explicite ou Pillow pour les légendes. L'extraction FFmpeg seule fonctionne. Ne pas modifier les masters.
3. Faire la comparaison avant/après finale, extraire un extrait sonore de la version finale, mesurer LUFS.
   L'écoute perceptive complète n'a pas été faite; les stills seuls ne la remplacent pas.
4. Vérifier la compatibilité visuelle des anciens épisodes à backend identique; ajouter les tests pertinents
   du cache et de la validation des nouveaux champs. Le cache fonctionne en pratique mais n'a pas encore
   une couverture de tests complète.
5. Mettre à jour AUDIT_STUDIO avec résultats et revue; terminer l'intégration du contrôle de caption tôt
   dans post.sh. Ne pas élargir inutilement le refactor du cache de rendu complet.

Les fichiers out/ sont ignorés par Git. Régénérer les preuves sur une autre machine :
```
npm ci
npm run test:unit
npm run test:posting
npm run validate -- delta-amex-evidence
npm run direct -- delta-amex-evidence
npm run stills -- delta-amex-evidence --n 12 --cols 6
npm run preview -- delta-amex-evidence --from 0 --seconds 45 --out out/delta-amex-evidence.mp4
```
Sur le sandbox Windows Codex, les binaires FFmpeg/ffprobe fournis par Remotion ont nécessité
l'exécution autorisée hors sandbox. Aucune dépendance n'a été réinstallée pour contourner ce problème.

Le propriétaire autorise le push de cette branche, pas la publication de vidéos.
Le workspace contient d'autres travaux : ne pas les supprimer, les réinitialiser ou les inclure par `git add .`.
