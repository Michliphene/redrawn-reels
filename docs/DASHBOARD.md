---
cssclasses: [dashboard]
generated: 2026-11-15 02:52 UTC
---

# 🗺️ REDRAWN — Dashboard

_Généré le 2026-11-15 02:52 UTC par `node scripts/dashboard.mjs` · les états sont déduits des fichiers du repo._
Schéma du flux : [[PIPELINE.canvas|Pipeline (canvas)]] · Règles : [[CLAUDE]] · Bible : [[docs/01_SERIES_AND_TOPICS|Série & sujets]]

## Épisodes × étapes

| EP | Titre | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Avancement | Prochaine action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2 | [[docs/dashboard/alaska-1867\|How Alaska became American]] | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ⬜ | 8/10 | **Assets** |
| 3 | [[docs/dashboard/louisiana-1803\|How the US doubled in size]] | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⬜ | 8/10 | **Review** |
| ? | [[docs/dashboard/ussr-1991\|How 1 country became 15]] | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | 5/10 | **Assets** |

✅ fait · ⚠️ à vérifier · ⬜ à faire · ➖ sans objet — clique sur un titre pour voir l'input/output de chaque étape.

- **1** Sujet
- **2** Données carte
- **3** Recherche & script
- **4** Cue sheet
- **5** Assets
- **6** Voix & musique
- **7** Rendu
- **8** Review
- **9** Kit de post
- **10** Publié

## ⚠️ À regarder
- EP 2 · 5 · Assets — 1 drapeaux · 2 portraits · 1 images · sans crédit : stoeckl
- EP 3 · 8 · Review — reviewer ×2 · virality ×1 · dernier score 79/100 · REVIEW_<id>.md manquant
- EP ussr-1991 · 5 · Assets — 16 drapeaux · 6 portraits · 0 images · MANQUANTS : flag:ge-1990, portrait:landsbergis, portrait:gorbachev, portrait:kravchuk, portrait:shushkevich

## 📋 Prochains sujets (ordre de publication recommandé)
1. **#20** How Czechoslovakia split without a shot (1993) — _Low_
2. **#8** How Germany split in two — and reunited (1945–90) — _Low_
3. **#16** How Antarctica got 7 claims — and none count — _Low (official claim lines)_
4. **#14** How Korea was split at the 38th parallel (1945) — _Low_
5. **#9** How Yugoslavia became 6 — or 7 — countries — _Low, but contested_
6. **#5** How Texas was its own country (1836–45) — _Medium (claimed vs controlled area)_
7. **#6** How Poland vanished for 123 years (1795–1918) — _Medium_
8. **#7** How Germany became one country (1815–1871) — _Medium_
9. **#10** How Austria-Hungary broke apart in 1918 — _Medium_
10. **#2** How 13 colonies became 50 states — _Medium (Newberry AHCB)_
11. **#13** How Ireland was partitioned (1921) — _Low, sensitive (UK)_
12. **#19** How the British Empire became 14 territories — _Medium_
13. **#12** How British India became India, Pakistan and Bangladesh — _Medium, sensitive_
14. **#11** How the Ottoman Empire became the modern Middle East — _Medium–High, contested_
15. **#15** How Africa was carved up (1870–1914) — _High (approximate)_
16. **#17** How Rome went from one city to the whole Mediterranean — _High (approximate, AWMC)_
17. **#18** How the Mongols built the biggest land empire — _High; area estimates debated_

## Rafraîchir
```bash
node scripts/dashboard.mjs   # ou : npm run dashboard
```
Après un post, créer `public/episodes/<id>/publish.json` (`{"tiktok":"…","instagram":"…","date":"AAAA-MM-JJ"}`) pour passer l'étape 10 à ✅.
