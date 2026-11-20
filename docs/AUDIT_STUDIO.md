# Audit et démonstrateur — 20 novembre 2026

Brief : audit concret REDRAWN / RECEIPTS, descriptions courtes, provenance sans badge IA,
variété de mise en scène, production locale moins coûteuse. Aucun envoi ni publication.

## Diagnostic observé avant modification

- Images examinées : Delta (6 stills), Chipotle (16 frames du MP4), Amazon (hook 0–3 s et
  triptyque du payoff), USSR (comparatif DA 1/2 existant). Deux MP4 récents REDRAWN/RECEIPTS
  disponibles localement : Chipotle et Amazon. Observation par frames extraites, pas une écoute
  perceptive intégrale : le son sera mesuré et un extrait fourni à écouter.
- À conserver : types contrastés, données incarnées (burrito découpé, colis/serveurs), voix
  synchronisée aux mots, réutilisation audio, monde 3D continu, sources et zones sûres.
- Monotonie : grue + oscillation forcées dans Atlas/Money3D ; voyage de 0,95 s partout en Money ;
  socle, prix puis barres puis phrase barrée. La copie d'un exemple est prescrite dans AGENTS.
- Lisibilité : labels secondaires très petits ; source à 20 px ; bandeau, prix, tag et callout
  se disputent parfois la place. Sur Amazon, les chiffres masqués laissent des fragments de sous-titres.
- Hook : Delta consacre 6,7 s à son premier beat ; le payload arrive avant sa fin, mais la
  proposition entière est longue. Ne pas confondre durée du beat et délai du premier bénéfice.
- Packaging : 5 descriptions existantes mesurées entre 280 et 495 caractères, 5 hashtags chacune.
  `posting_kit.py` ne contrôle rien, peut produire une description vide, choisit le premier numéro
  ambigu et inscrit REDRAWN pour toutes les séries. Le prompt ajoute systématiquement des CTA.
- Contradictions : obligation IA dans AGENTS/CLAUDE/SCENT + générateur ; 3–5 hashtags dans les
  reviewers ; `.Codex/skills/post` obsolète ; push automatique dans le skill ; STUDIO et bibles
  transforment des choix de réalisation (grue, cut à mi-parcours) en invariants.
- Coût/friction : `public/` = 325 267 676 octets. Chaque stills recopie tout ; backend software
  imposé même sur Windows ; temp Windows avec `!` casse Webpack. Baseline corrigée uniquement par
  TEMP local : 3 stills / 5,4 s. `post.sh` invalide tout sur chaque changement de moteur et omet
  pourtant voice/music/sfx/fonts ; cache de rendu complet à traiter prudemment.
- `npm test` échoue déjà sur 2 épisodes hors cible : copy-to-learn (UNGRADED non enregistré),
  getaway-003-monalisa (schéma raea interprété comme carte). Ne pas faire passer ces échecs pour
  des régressions ni masquer leur validation. Des scènes `slice` sont validées mais absentes du
  Money3D courant : Chipotle est une mauvaise base de remaster Remotion sans travail supplémentaire.

## Priorités / plan d'exécution

| Travail | Impact | Effort / risque | Coût récurrent |
|---|---|---|---|
| Textes courts contrôlés + identité du registre + ambiguïtés | élevé | faible | nul |
| Une politique IA/licences et suppression des règles contradictoires | élevé | faible | nul |
| Brief sujet + comparaison des derniers épisodes, références facultatives | élevé | moyen | local, sans génération |
| Contrôles opt-in caméra/composition/lumière/son + copie Delta | élevé | moyen, préserver les défauts anciens | nul en API |
| Bundle local réutilisé, extraits, backend cohérent, mesure | moyen | moyen | moins de copie et de frames |

- [ ] Packaging et règles, tests de refus sans troncature.
- [ ] Directions et démonstrateur, tests caméra/validation.
- [ ] Previews locales, stills avant/après, extrait sonore et mesures.
- [ ] Reel-reviewer puis virality-reviewer, corrections, vérification finale.

Hypothèse à tester avec des audiences : une ouverture distincte et moins de mouvements automatiques
peuvent rendre l'explication plus claire. Préférence artistique : une table d'examen plus calme pour
Delta. Aucun score de revue, compteur de cues ou SSIM ne mesure la rétention réelle.
