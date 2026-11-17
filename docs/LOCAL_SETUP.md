# Faire tourner le studio en local

Tout ce qui tourne dans le cloud tourne aussi sur ta machine : stills, rendu, voix, musique, posting kit,
et Claude Code avec le même `CLAUDE.md` et les mêmes agents (`reel-reviewer`, `virality-reviewer`).
Testé sur Linux ; macOS et Windows (via WSL2) suivent le même chemin.

## 1. Pré-requis (une fois)

| Outil | Pourquoi | macOS (Homebrew) | Ubuntu / WSL2 |
|---|---|---|---|
| Node ≥ 20 (22 conseillé) | Remotion, stills, validate | `brew install node@22` | [nvm](https://github.com/nvm-sh/nvm) puis `nvm install 22` |
| ffmpeg + ffprobe | voix, musique, −14 LUFS, planches | `brew install ffmpeg` | `sudo apt install -y ffmpeg` |
| Python 3.10+ (+ venv) | `tts.py`, posting kit, métriques | `brew install python@3.12` | `sudo apt install -y python3 python3-venv` |
| bc, curl, git | scripts shell | `brew install bc` | `sudo apt install -y bc curl git` |

**Windows** : installe WSL2 (`wsl --install`, Ubuntu), puis travaille *dans* WSL (`~/…`, pas `/mnt/c/…`, c'est 10× plus lent).
**macOS** : `scripts/fetch_queue.sh` demande bash 4+ (`brew install bash`). Le reste marche avec le bash d'origine.

## 2. Cloner et installer

```bash
git clone https://github.com/Michliphene/redrawn-reels.git
```

```bash
cd redrawn-reels
```

```bash
scripts/setup-local.sh
```

Le script vérifie les outils (et te dit quoi installer s'il en manque), puis : `npm install`, un venv Python
`.venv` (kokoro-onnx, soundfile, numpy), le modèle Kokoro (~350 Mo, voix de secours hors ligne), le navigateur
headless de Remotion, crée `.env` depuis `.env.example`, et lance `npm test`. Tu peux le relancer sans risque.

Le dépôt fait ~400 Mo (les voix, musiques et images des épisodes publiés sont versionnées) : les épisodes
existants se re-rendent **sans clé ElevenLabs**.

## 3. La clé ElevenLabs

Dans le cloud, la clé est injectée par le proxy. En local, mets-la dans `.env` (jamais commité) :

```
ELEVENLABS_API_KEY=sk_...
```

`pipeline/render.sh` et `pipeline/post.sh` chargent `.env` et activent `.venv` tout seuls.
Sans clé, une nouvelle voix bascule automatiquement sur Kokoro (moins bien : à réserver aux brouillons).
La voix n'est réenregistrée que si le script change (empreinte dans `timings.json`).

## 4. Utiliser

```bash
npm run studio
```
Remotion Studio dans le navigateur (http://localhost:3000) : timeline, scrub image par image, props en direct.
Le meilleur moyen d'itérer sur un épisode.

```bash
npm run stills ussr-1991-v2 -- --n 12 --cols 6
```
Planche de contact → `out/stills/ussr-1991-v2/sheet.jpg`.

```bash
pipeline/render.sh ussr-1991-v2
```
Vidéo finale → `out/ussr-1991-v2.mp4`.

Le reste du workflow (nouvel épisode, pré-flight, review, post) est identique : voir `CLAUDE.md`.

## 5. Performance (GPU)

Le monde 3D (DA 2) est en WebGL. Par défaut : `angle` (GPU) sur macOS/Windows, `swangle` (logiciel, lent mais
sûr) sur Linux. Sur un Linux avec GPU, ajoute dans `.env` :

```
REMOTION_GL=angle-egl
```

Si un rendu sort noir ou plante, repasse à `REMOTION_GL=swangle`. Sans WebGL du tout, l'épisode se rend en
version plate au lieu d'échouer.

## 6. Claude Code en local

Installe Claude Code (https://code.claude.com), puis lance `claude` à la racine du repo : il lit `CLAUDE.md`,
les agents de `.claude/agents` et le skill `post`. Seule différence avec le cloud : la clé ElevenLabs vient de
`.env` et le réseau n'est pas filtré (Commons, SEC, sites investisseurs sont joignables directement).

## 7. Rester synchronisé avec le cloud

Les sessions cloud travaillent sur des branches `claude/…`. Pour récupérer leur travail :

```bash
git fetch origin
```

```bash
git checkout main && git pull
```

`out/`, `models/`, `node_modules/`, `.venv/` et `.env` ne sont jamais versionnés.
