---
episode: 2
id: alaska-1867
title: "How Alaska became American"
progress: 8/10
status: next:Assets
duration_s: 55.1
virality_score: 97
generated: 2026-11-15 02:52 UTC
---

# EP 2 — How Alaska became American

← [[DASHBOARD]] · [[PIPELINE.canvas|Schéma du pipeline]]

**Avancement : 8/10** · prochaine action : **5 · Assets** — 1 drapeaux · 2 portraits · 1 images · sans crédit : stoeckl

| Étape | État | Détail | Input | Output |
|---|---|---|---|---|
| 1 · Sujet | ✅ | Sujet n°4 — difficulté données : Low | [[docs/01_SERIES_AND_TOPICS]] | [alaska-1867](../../public/episodes/alaska-1867/) |
| 2 · Données carte | ✅ | 5 entités | [[docs/02_DATA_SOURCES]]<br>[prep-alaska.mjs](../../scripts/prep-alaska.mjs) | [alaska1867.geojson](../../public/data/alaska1867.geojson) |
| 3 · Recherche & script | ✅ | faits sourcés : oui · commentaire épinglé : oui | web / ouvrages de référence | [[public/episodes/alaska-1867/SOURCES]] |
| 4 · Cue sheet | ✅ | 13 beats · épisode n°2 | [[public/episodes/alaska-1867/SOURCES]]<br>[alaska1867.geojson](../../public/data/alaska1867.geojson) | [episode.json](../../public/episodes/alaska-1867/episode.json) |
| 5 · Assets | ⚠️ | 1 drapeaux · 2 portraits · 1 images · sans crédit : stoeckl | flag-icons / Commons / Library of Congress<br>[episode.json](../../public/episodes/alaska-1867/episode.json) | [gb.svg](../../public/assets/flags/gb.svg)<br>[seward.jpg](../../public/assets/portraits/seward.jpg)<br>[stoeckl.jpg](../../public/assets/portraits/stoeckl.jpg)<br>[treaty_signing.jpg](../../public/assets/images/treaty_signing.jpg)<br>[credits.json](../../public/assets/portraits/credits.json) |
| 6 · Voix & musique | ✅ | voix 55.1 s · moteur elevenlabs · musique oui | [episode.json](../../public/episodes/alaska-1867/episode.json)<br>[tts.py](../../pipeline/tts.py)<br>[music.sh](../../pipeline/music.sh) | [voice.wav](../../public/episodes/alaska-1867/voice.wav)<br>[timings.json](../../public/episodes/alaska-1867/timings.json)<br>[music.wav](../../public/episodes/alaska-1867/music.wav) |
| 7 · Rendu | ✅ | mp4 absent de ce clone (out/ non commité) — déduit des reviews | [voice.wav](../../public/episodes/alaska-1867/voice.wav)<br>[music.wav](../../public/episodes/alaska-1867/music.wav)<br>[episode.json](../../public/episodes/alaska-1867/episode.json)<br>[render.sh](../../pipeline/render.sh) | — |
| 8 · Review | ✅ | reviewer ×5 · virality ×4 · dernier score 97/100 | out/alaska-1867.mp4<br>[[docs/VIRALITY_PLAYBOOK]] | [[docs/REVIEW_alaska-1867]]<br>[[docs/review/alaska-1867-pass5]]<br>[[docs/review/alaska-1867-virality-pass4]] |
| 9 · Kit de post | ✅ | 3/3 fichiers | [[public/episodes/alaska-1867/SOURCES]]<br>[review](../../docs/review/) | [[deliverables/alaska-1867/POSTING]]<br>[cover_9x16.png](../../deliverables/alaska-1867/cover_9x16.png)<br>[cover_3x4.jpg](../../deliverables/alaska-1867/cover_3x4.jpg) |
| 10 · Publié | ⬜ | non publié (créer publish.json après le post) | out/alaska-1867.mp4<br>[[deliverables/alaska-1867/POSTING]] | — |

> Note générée par `scripts/dashboard.mjs` — ne pas éditer à la main (écrasée à chaque run).
