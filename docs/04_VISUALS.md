# Visual layer — what is shown and why it is accurate

## Components (all driven by `episode.json` cues, all re-usable)
| Cue | Component | What it does |
|---|---|---|
| `declare` + `flag`/`flagNote` | Labels | republic flashes → own colour, shockwave ring, waving flag + name + date, +1 on the counter, "pop" SFX |
| `units` (`tanks`/`troops`/`crowd`) | Units | original pictograms; armies arrive along a dashed arrow and can `retreatWord`; crowds grow around a point; rumble SFX |
| `portrait` | Portraits | archive photo card (grey → colour, slow push-in), name/role, optional `stamp` (e.g. RESIGNED), **credit line on screen** |
| `flagSwap` | FlagSwap | flag lowered / new flag raised on a pole |
| `shake`, `dissolve` | Episode / MapLayer | camera shake; republics burst apart and settle back (borders return to exact positions) |
| automatic | Counter, Fx, Sfx | "NEW COUNTRIES n/15", film grain + vignette, sound design from the cue list |

## Accuracy rules applied
- **Army arrows are symbolic.** `approach` is a screen offset, not a route: the video shows *that* forces moved in, never *which road* (no source for exact routes at this scale).
- **Crowds:** Vilnius TV tower crowd (unarmed civilians, 13 Jan 1991) and the crowd defending the Russian parliament ("White House"), Aug 1991 — both well documented. Icon counts are illustrative, not head counts.
- **Flags shown at the moment of declaration = the flag in use by end-1991**, otherwise noted on screen:
  - Belarus: white-red-white (adopted Sep 1991, used until 1995) — not today's flag.
  - Georgia: 1990–2004 flag — not today's five-cross flag.
  - Kyrgyzstan, Tajikistan, Kazakhstan: new flags adopted 1992 → tag "flag from 1992".
  - Turkmenistan: tag "today's flag" (first flag 1992, modified since).
  - Uzbekistan flag adopted Nov 1991; Ukraine's blue-yellow flag was raised in 1991, formally adopted Jan 1992 (not tagged — minor).
  - Final legend shows **today's** flags.
- Leader roles: Landsbergis = chairman of the Supreme Council (head of parliament); Gorbachev held at his dacha in Foros, Crimea during the coup; Yeltsin = elected president of the Russian SFSR (June 1991); Nazarbayev elected president 1 Dec 1991.

## Image licences (see `public/assets/portraits/credits.json`, generated from Commons metadata)
- Prefer **Public domain / CC BY** (only attribution needed). CC BY is satisfied by the on-screen credit + caption credit.
- **CC BY-SA** photos (Shushkevich 1991, Nazarbayev 1991): attribution + share-alike; a cropped/graded photo inside a video may count as an adaptation → conservative reading: the video itself would fall under BY-SA. Low practical risk, but if the page is monetised, swap them for CC BY/PD images or drop those two cards.
- Flags: `flag-icons` (MIT); Soviet, Belarus 1991, Georgia 1990 flags from Commons (public domain).
- Pictograms, SFX, music: made for this project.
