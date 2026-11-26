# SILLAGE — series bible (PROPOSAL, not approved)

Perfume told like the rest of the studio: one object, one story, every claim sourced, 40–58 s, English.
Working name **SILLAGE** (the trail a perfume leaves; known to English-speaking perfume fans). Id `scent`, tag `N°{n}`.
Rename = `public/studio.json`. Reference the owner gave: the "Scent Archive" mood (perfume history, museum-like
product shots). We keep the mood, not the look: our type system, our safe area, our sourcing rules.

## 1. Two variants on the table

| | **A · VITRINE** (Nano Banana) | **B · COUNTER** (raea 3D) |
|---|---|---|
| Hero | AI still lifes: an imagined bottle, its ingredients, one per plate | an invented glass flacon and its notes as 3D objects (flowers, roots, pods, leaves) |
| World (rule 1) | a dark velvet archive room in 3D; plates stand in it, the camera walks case to case | one counter: the bottle on a plinth, the notes on a ring of pedestals, the camera goes round |
| Engine | to build (`src/scent/Vitrine3D.tsx`, §4) | **raea** (`raea/sillage-bottle/`, rendered) |
| Images | Nano Banana Pro via the Gemini API (`scripts/nano-banana.mjs`) | none: primitives, real glass transmission |
| Pilot | N°2 *The 2,000-year-old perfume* (kyphi) — `public/episodes/scent-002-kyphi/` | N°1 *What's inside your perfume* — voice `public/episodes/scent-001-bottle/`, video `raea/sillage-bottle/out/sillage.mp4` |
| Best topics | history, lost recipes, "what X smelled like" | what's in a bottle, where notes grow, how a note is made |

Owner's direction (19 Nov 2026): **no maps** for this series — it is about bottles and notes. B ships first, in raea.
The map cue sheet `scent-001-bottle/episode.json` is kept only as the voice/timings source (the Remotion map version
is not a deliverable). Signature of every B episode: the bottle fills one layer per note, in the note's colour.

## 2. Look (both variants)
- Palette `scent` in `src/studio/series.ts`: plum-black `#0C0609`, velvet `#45283A`, ink `#F8EFE9`, accent
  rose-champagne `#F4B6C2` (keywords, the number that matters, the series tag — nothing else).
- Episode colours = the note: jasmine cream `#EADBB0`, rose `#E68FA8`, vetiver green `#93A86C`, vanilla `#C29A6B`,
  patchouli `#8C6444`. Reuse them across episodes so a colour means a note.
- Type: the studio's three voices. `Whisper` (serif italic) carries the perfume-world elegance; `Display` stays loud.
- Safe area and bands: unchanged (`src/studio/tokens.ts`).

## 3. AI image rules (A) — on top of CLAUDE.md
1. Follow `docs/STUDIO.md` §9: provenance in production manifests, required disclosures in their appropriate
   location; no automatic AI badge or watermark in plates or videos. Historical renders remain unchanged.
2. Brands (amended 20 Nov 2026, owner: "parle des marques"): a brand may be named and its story told (editorial use).
   Its iconic bottle is shown as **our own 3D model of the silhouette** (raea), with the name set in the studio's type —
   never its logo, monogram, label typography or packaging, and never an AI image of the bottle, an ad, a boutique or a
   real person (founder, ambassador). AI draws only settings and ingredients around it. Post text: "Not sponsored,
   not affiliated with <brand>". A licensed/CC photo of the real bottle stays allowed with credit. Example: N°5.
3. Never an AI image of a real place, artefact, document or person presented as evidence (temple wall, museum piece,
   portrait). Those come from Commons/LoC with credit, or stay in the 3D set.
4. Prompts forbid text, glyphs and logos (fake writing reads as fake evidence).
5. Prompts and model are logged next to the files (`public/assets/ai/<id>/plates.log.json`).
6. **No Higgsfield** (owner's rule): the script calls Google's Gemini API directly with the owner's key.

## 4. Engine for A (to build after approval) — `src/scent/Vitrine3D.tsx`
Same skeleton as `Money3D` (stations on one set, camera travels between them, returns for the loop):

| Scene type | Station | Type above it |
|---|---|---|
| `plate` | one Nano Banana image on a plinth, in a glass case; the camera dollies in | name (`Display`), note (`Whisper`) |
| `grid` | 4×4 ingredient tiles on a table; `count` reshuffles (10 → 15 → 36), `blank` greys some out | the count |
| `photo` | a credited real photo on an easel (Commons/LoC) | caption + credit |
| `pyramid` | top / heart / base notes as three shelves; `light` picks one | the note names |

Plates are printed at 2× the world's resolution (`PixelImg`-like but finer) so glass reads as glass, and the room
around them keeps the stippled low-res finish: the one place where an image is sharper than the set is the hero.
Estimate: one session (Money3D is the template; plates are textured planes).

## 5. Backlog (draft hooks — verify every figure at scripting time)
B · counter (raea)
- What's inside your perfume (N°1, rendered)
- Vanilla: the flower that has to be pollinated by hand (Edmond Albius, 1841) — one flower, one hand, one pod
- How many petals in one drop of rose oil (Kazanlak) — the bottle stays empty while petals pile up
- Oud: why one wood is priced like a metal (claim to check)
- Top, heart, base: why a perfume changes on your skin — the bottle's three layers evaporate one by one

A · vitrine
- The 2,000-year-old perfume (N°2, kyphi, scripted)
- The perfume made for a queen (Marie Antoinette's perfumer, Jean-Louis Fargeon) — imagined bottle, sourced notes
- Eau de Cologne, 1709: the "miracle water" (Farina) — real bottle by photo, ingredients by AI
- What did ambergris come from? (format C: guess before the count ends)
- Notes explained: "iris costs more than gold?" — the root that ages for years (claim to check)

## 6. Pipeline
B: `episode.json` (script + voice only) → `pipeline/tts.py` + `pipeline/music.sh` → `raea/<project>/setup.sh` → frames with `raea render --frame` → `render.sh`.
A: `plates.json` → `node scripts/nano-banana.mjs <id>` → look at the plates → `episode.json` → stills → render.
`node scripts/draft-timings.mjs <id>` gives estimated timings so stills can be made **before** recording a voice
(no credits spent on a script that may change; `pipeline/tts.py` replaces them at render).

## 7. Kit (from 26 Nov 2026)
New SILLAGE episodes are built on `raea/sillage-kit/` (tokens, hero flacon, editorial captions, full-frame plates, finish,
pre-flight `tools/validate.mjs`). An episode = `compositions/reel.json` + a 10-line `sillage.tsx`; worked example
`raea/sillage-003-rose-v2/`. What changed and what is left: `raea/sillage-kit/CHANGELOG.md`.
