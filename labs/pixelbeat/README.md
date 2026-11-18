# pixelbeat — reels pixel art synchronisés à la musique

Kit Remotion pour produire des reels façon @bit_wonder : rendu pixel art natif, son chiptune généré par le code,
synchro image/son **par construction**, et contrôle qualité automatique avant publication.

## Principe : une partition, pas un script
Chaque vidéo = `scores/<id>.json` (tempo + sections musicales + événements placés en **temps**, jamais en secondes)
\+ une **scène** (`src/scenes/*.ts`, fonction pure `draw(fb, score, beat)`).
Le synthé et la scène lisent la même partition et partagent les mêmes fonctions de rythme
(`src/score/timing.ts` : `rollHits`, `typedChars`, `typeTicks`…). Un son ne peut pas tomber à côté de son image.

```
scores/demo.json ──► audio/synth.ts ──► loudness -14 LUFS ──┐
        │                                                   ├─► Remotion ─► out/demo.mp4 ─► tools/check_sync.py
        └──────────► src/scenes/<scene>.ts (180x320) ───────┘
```

## Commandes
```bash
npm i && pip install numpy            # + ffmpeg installé
./build.sh scores/demo.json           # audio + rendu + contrôle -> out/demo.mp4 + out/demo.report.json
npx tsx tools/preview.ts scores/demo.json 0,8,36,40,60 out/preview.png   # planche d'images clés en 1 s
npx remotion studio src/index.ts      # prévisualisation interactive
```
Si Remotion ne peut pas télécharger son navigateur : `CHROME=/chemin/chrome-headless-shell ./build.sh …`

## Ce qui fait la qualité « au-dessus »
| Règle | Où |
|---|---|
| Rendu natif **180×320**, agrandi ×6 sans lissage (mesuré : leurs pixels font 6×6) | `pixel/fb.ts`, `PixelStage.tsx` |
| On dessine en **indices de palette**, jamais en RGB libre → aucune couleur parasite | `pixel/palette.ts` |
| **Rampes décalées en teinte** (ombres vers le bleu/violet, lumières vers le jaune) | `RAMPS` |
| Dégradés et fondus en **tramage Bayer** stable (pas de grouillement d'une frame à l'autre) | `gradientV`, `blob(…, ramp2, mix)` |
| Contour sombre 1 px sur les sprites, ombre portée 1 px sur le texte | `sphere`, `text` |
| Police **bitmap** maison, exposants (`10^23`) | `pixel/font.ts` |
| Caméra et secousses en **pixels entiers**, nouvelle position seulement sur la grille rythmique | scène |
| Tout est **déterministe** (`hash`, seed) : même partition = même vidéo | `hash`, `noise1` |

## Ce qui fait la synchro
- Tempos conseillés à 30 fps : 90 / 100 / 120 / 150 BPM (frames entières par croche) — `checkGrid` prévient sinon.
- Chaque impact visuel a son son : split = blip dont la hauteur monte (on *entend* l'exponentielle),
  ouverture d'encadré = « pop », lettres = tics sur les doubles-croches, montée = roulement de caisse claire
  qui fait avancer le compteur et la secousse coup par coup.
- **Le drop** : la montée s'arrête ½ temps avant le boom → silence total + image figée, puis boom + flash pile sur le temps.
- Boucle : la fin redessine la première image → replay sans couture.

## Contrôle qualité (`tools/check_sync.py`)
Analyse le **MP4 final** : format, tempo détecté vs partition, % d'impacts visuels qui ont un son (≥ 70 %),
événements de la partition sans son, contraste du drop (≥ 12 dB), temps morts > 2 s, loudness (-16 à -12 LUFS).
Code de sortie 1 si quelque chose est à corriger → à brancher en dernière étape de ton agent.

Résultat de la démo : 1080×1920, 120 BPM détecté, 78 % des impacts sonorisés, drop +60 dB, -14,8 LUFS, verdict OK.

## Ajouter une vidéo (consigne pour l'agent)
1. Écrire `scores/<id>.json` : `meta.scene`, `bpm`, `chords` (1 par mesure), `sections` (hook → montée → drop → boom → payoff → boucle), `events`.
2. Écrire la scène `src/scenes/<scene>.ts` avec les primitives de `FB`, et l'enregistrer dans `src/scenes/index.ts`.
   Tout mouvement brusque doit tomber sur un événement ou sur la grille (`Math.floor(beat*4)`), jamais sur le temps continu.
3. Nouveau type d'événement sonore → l'ajouter dans le `switch` de `audio/synth.ts` en réutilisant les mêmes fonctions de `timing.ts`.
4. `./build.sh scores/<id>.json` ; si le verdict est « A CORRIGER », lire `unsynced_visual_hits_s` et corriger.
