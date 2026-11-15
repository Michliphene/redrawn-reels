---
episode: 3
id: louisiana-1803
title: "How the US doubled in size"
progress: 8/10
status: next:Review
duration_s: 53.4
virality_score: 79
generated: 2026-11-15 02:52 UTC
---

# EP 3 — How the US doubled in size

← [[DASHBOARD]] · [[PIPELINE.canvas|Schéma du pipeline]]

**Avancement : 8/10** · prochaine action : **8 · Review** — reviewer ×2 · virality ×1 · dernier score 79/100 · REVIEW_<id>.md manquant

| Étape | État | Détail | Input | Output |
|---|---|---|---|---|
| 1 · Sujet | ✅ | Sujet n°3 — difficulté données : Medium (contested western limit!) | [[docs/01_SERIES_AND_TOPICS]] | [louisiana-1803](../../public/episodes/louisiana-1803/) |
| 2 · Données carte | ✅ | 5 entités | [[docs/02_DATA_SOURCES]]<br>[prep-louisiana.mjs](../../scripts/prep-louisiana.mjs) | [louisiana1803.geojson](../../public/data/louisiana1803.geojson) |
| 3 · Recherche & script | ✅ | faits sourcés : oui · commentaire épinglé : oui | web / ouvrages de référence | [[public/episodes/louisiana-1803/SOURCES]] |
| 4 · Cue sheet | ✅ | 15 beats · épisode n°3 | [[public/episodes/louisiana-1803/SOURCES]]<br>[louisiana1803.geojson](../../public/data/louisiana1803.geojson) | [episode.json](../../public/episodes/louisiana-1803/episode.json) |
| 5 · Assets | ✅ | 3 drapeaux · 3 portraits · 0 images | flag-icons / Commons / Library of Congress<br>[episode.json](../../public/episodes/louisiana-1803/episode.json) | [fr.svg](../../public/assets/flags/fr.svg)<br>[us-15.svg](../../public/assets/flags/us-15.svg)<br>[gb.svg](../../public/assets/flags/gb.svg)<br>[jefferson_bust.jpg](../../public/assets/portraits/jefferson_bust.jpg)<br>[monroe.jpg](../../public/assets/portraits/monroe.jpg)<br>[credits.json](../../public/assets/portraits/credits.json) |
| 6 · Voix & musique | ✅ | voix 53.4 s · moteur elevenlabs · musique oui | [episode.json](../../public/episodes/louisiana-1803/episode.json)<br>[tts.py](../../pipeline/tts.py)<br>[music.sh](../../pipeline/music.sh) | [voice.wav](../../public/episodes/louisiana-1803/voice.wav)<br>[timings.json](../../public/episodes/louisiana-1803/timings.json)<br>[music.wav](../../public/episodes/louisiana-1803/music.wav) |
| 7 · Rendu | ✅ | mp4 absent de ce clone (out/ non commité) — déduit des reviews | [voice.wav](../../public/episodes/louisiana-1803/voice.wav)<br>[music.wav](../../public/episodes/louisiana-1803/music.wav)<br>[episode.json](../../public/episodes/louisiana-1803/episode.json)<br>[render.sh](../../pipeline/render.sh) | — |
| 8 · Review | ⚠️ | reviewer ×2 · virality ×1 · dernier score 79/100 · REVIEW_<id>.md manquant | out/louisiana-1803.mp4<br>[[docs/VIRALITY_PLAYBOOK]] | [[docs/review/louisiana-1803-pass2]]<br>[[docs/review/louisiana-1803-virality-pass1]] |
| 9 · Kit de post | ✅ | 3/3 fichiers | [[public/episodes/louisiana-1803/SOURCES]]<br>[review](../../docs/review/) | [[deliverables/louisiana-1803/POSTING]]<br>[cover_9x16.png](../../deliverables/louisiana-1803/cover_9x16.png)<br>[cover_3x4.jpg](../../deliverables/louisiana-1803/cover_3x4.jpg) |
| 10 · Publié | ⬜ | non publié (créer publish.json après le post) | out/louisiana-1803.mp4<br>[[deliverables/louisiana-1803/POSTING]] | — |

> Note générée par `scripts/dashboard.mjs` — ne pas éditer à la main (écrasée à chaque run).
