# THE GETAWAY — channel bible

**Promise.** Famous heists and escapes, traced on a map.
**One-line pitch.** Every reel is a route — the plan, the move, the run — and one question: *caught or not?*
Same studio, same pipeline as REDRAWN (`docs/STUDIO.md`): one cue sheet, one map engine (`Episode` → `src/atlas`, DA 2).
An episode belongs to the channel through `"channel": "getaway"` in `episode.json`; everything else follows from
`public/studio.json` → `series.getaway` (name, episode tag, brand, voice, music, post texts).

## 1. Tone
- Sly, clever, noir, deadpan. The narrator knows how it ends and enjoys the setup. Short spoken sentences, present tense.
- We tell **the move, not the harm**. No graphic violence, no "how to" (no techniques, tools or procedures beyond what
  any encyclopedia states in one line), no glorification: the cost (prison, death, victims, money never returned) is
  stated plainly when the sources give it.
- Humour comes from facts placed side by side ("The plane lands in Reno. Stairs still down. He's gone."), never from
  mocking victims, police or real people's looks.
- Cases with killings at their core (gang murders, terrorist robberies) are out of scope. If a death is part of a case,
  it is one neutral sentence, no image.

## 2. Mechanic of every reel
1. **Hook ≤ 1 s**: the first words are already the stake ("He jumps from a jet with $200,000"). The title on frame 0 is
   the channel question **CAUGHT OR NOT?** or the case's own twist; frame 0 shows the subject (wanted poster, the vault,
   the prison) on the map.
2. The route on the map: `marker` for places, `path` for the run (always labelled APPROX. unless the route is documented),
   `region` + `ghost` for an area, `bigNumber` (+ `bills: true`) for the take.
3. A re-hook around 50–60 % (`cut: true`): the moment it goes wrong / the clue / the jump.
4. The verdict: a stamp — **CAUGHT** (date + sentence in the sub-line), **NEVER FOUND**, **ESCAPED**, **PARTLY RECOVERED**…
   the exact wording justified in `SOURCES.md` ("Wording of the ending").
5. The last line asks the hook's question again; the last frame is the first frame (same poster, same title).

## 3. Identity (brand A "case file", chosen 17 Nov 2026)
| Element | Value |
|---|---|
| Background | near-black desk `#070605`, light pool `#1C1712` |
| Map | subject states/countries in file-paper beige `#C9B994`; scenery `#3A3127`; rivers `#5F86A3` |
| Accent | evidence red `#E0312B` (route, keywords, stamps) |
| Paper | `#E6D9BC` (wanted posters, the series tab), ink `#1A1612`, stamp ink `#C8231E` |
| Type | Display (Bricolage condensed) for titles and captions · Whisper (Instrument Serif italic) for the one quiet line · **Courier Prime** (OFL) replaces JetBrains Mono for every data/annotation line |
| Series bar | A: beige typed tab "THE GETAWAY" + red stamped "CASE 001". (B "evidence label" stays available: render prop `brand: "B"`.) |
| Signature objects | the 3D getaway vehicle on the map (`vehicle`: a tri-jet with its rear airstair; a falling figure that vanishes in the air), night + torch + rain (`night`), the typed document with a struck-out wrong version (`ticket`), the CAUGHT / NEVER FOUND tick boxes open on frame 0 and ticked on the verdict (`verdict`) |
| Older signature objects | wanted poster (`wanted` cue: image printed in paper ink, typed lines, credit, stamp); falling banknotes (`bills: true`); the verdict stamp |

Palette and look live in `src/studio/series.ts` (`getaway`), the bar in `src/studio/brands/getaway.tsx`.

## 4. Voice and sound
- Voice: ElevenLabs premade **Clyde** `2EiwWnXFnvU5JabPnv8n` (chosen by ear by the owner from Adam, Clyde, George, Daniel,
  Bill; Callum's id returned `voice_not_found`), `eleven_multilingual_v2`, stability 0.5, style 0.3, speed 1.03–1.05,
  pauses capped at 0.32–0.45 s (longer than REDRAWN: room for the deadpan beat). Stored in `studio.json`; an episode
  adjusts it with `voiceOverride` (e.g. `{"respell": {...}, "settings": {...}}`) — the key has no `voices_read`, so a new
  voice is tested by calling TTS with its id.
- Music: `pipeline/music.sh <id> <s> noir` — D-minor drone, muted heartbeat bass, clock tick, sparse vibraphone notes;
  −26 LUFS bed, the reel normalised to −14 LUFS.

## 5. Format
- 1080×1920, 30 fps, English (US/UK), **voice 62–72 s** (TikTok Creator Rewards needs > 60 s), 150–170 words.
- 12–15 beats, a new visual cue at least every 3 s (`python3 pipeline/virality_metrics.py <id>`).
- Safe area and bands as every DA 2 reel (`--props '{"guides":true}'`).

## 6. Rules (on top of CLAUDE.md)
- **Sources**: FBI Vault / court records / official statements first, then period press, then reference books.
  Every number on screen is in `SOURCES.md`; when accounts differ (amounts, times, ticket prices), use the safe one with
  "about" or leave it out, and log it in "Debated points".
- **Places**: a disputed location is a `region`/ghost area labelled DISPUTED, never a pin. Routes are APPROX. unless documented.
- **People**: never accuse. Suspects are "investigated", unnamed, unless convicted (then name + conviction, sourced).
  No real face except public-domain official images (sketches, mugshots of convicted people when PD) — credited on
  screen and in the pinned comment. AI illustration is labelled and never imitates an archive photo.
- **No how-to.** One sentence per method, at the level of an encyclopedia.
- **No glorification**: the verdict and its cost are on screen; the money is "taken", not "earned".
- Publication only on the owner's explicit go.

## 7. Next 15 episodes — ranked (data ease × viral potential, 1–5 each)
| # | Case | Year · map | Verdict | Data | Viral | Notes / main sources |
|---|---|---|---|---|---|---|
| 1 | Escape from Alcatraz (Morris, Anglin brothers) | 1962 · San Francisco Bay | NEVER FOUND (case open, US Marshals) | 5 | 5 | FBI Vault + US Marshals; raft debris on Angel Island; same "caught or not?" as Cooper |
| 2 | Mona Lisa theft (Peruggia) | 1911–1913 · Paris → Florence | CAUGHT | 5 | 5 | Louvre, period press; the painting made famous by its theft (myth-bust angle) |
| 3 | Carlos Ghosn's escape in a box | 2019 · Tokyo → Osaka → Istanbul → Beirut | ESCAPED (no extradition) | 4 | 5 | Japanese/US/Turkish court records (the Taylors convicted in Japan); no how-to detail |
| 4 | Great Train Robbery + Ronnie Biggs' run | 1963–2001 · Bridego Bridge → Rio | CAUGHT (most) / Biggs returns 2001 | 5 | 5 | National Archives (UK), trial records; violence: one sentence (the driver was injured) |
| 5 | Hatton Garden heist | 2015 · London | CAUGHT (pensioners) | 5 | 5 | Met Police, sentencing remarks; deadpan gold |
| 6 | Isabella Stewart Gardner Museum | 1990 · Boston | NEVER FOUND ($10 m reward) | 4 | 4 | FBI + museum; small map → use the floor plan as a second set later |
| 7 | Antwerp Diamond Centre | 2003 · Antwerp → the E19 woods | CAUGHT (the half-eaten sandwich) | 4 | 5 | Belgian court, Notarbartolo conviction; claims of the thief himself = DISPUTED |
| 8 | Brink's robbery | 1950 · Boston | CAUGHT days before the statute of limitations | 4 | 4 | FBI famous cases |
| 9 | Louvre crown jewels | Oct 2025 · Paris | arrests; jewels status to verify at scripting | 3 | 5 | very recent: only official statements (Paris prosecutor); re-check everything |
| 10 | Dresden Green Vault | 2019 · Dresden → Berlin | CAUGHT (2023 convictions), part returned | 4 | 4 | court rulings, SKD statements |
| 11 | Irish Crown Jewels | 1907 · Dublin Castle | NEVER FOUND | 4 | 3 | official 1908 Viceregal commission report |
| 12 | Tunnel 57 | 1964 · Berlin Wall | ESCAPED (57 people) | 4 | 4 | Berlin Wall Memorial; one death in the event: one neutral line |
| 13 | Banco Central, Fortaleza tunnel | 2005 · Fortaleza | PARTLY CAUGHT, money mostly not recovered | 3 | 4 | Brazilian federal police; check amounts in BRL and USD |
| 14 | Stalag Luft III "Great Escape" | 1944 · Sagan → Europe | 3 of 76 make it home | 4 | 4 | IWM, RAF Museum; 50 executed: one neutral sentence, no image |
| 15 | Helicopter jailbreak (Redoine Faïd) | 2018 · Réau prison → Paris region | CAUGHT (3 months later) | 3 | 4 | French prosecutor statements; a violent criminal: strict no-glorification, verdict first |

**The table is a backlog, not a source**: dates, verdicts and details in it are from memory and must be verified at
scripting time (drop the episode if the sources do not support the angle).
Ease = how much primary material is public and how mappable the route is; viral = recognisability × twist × loop.
Production order suggestion: Alcatraz (12 Jun anniversary), Mona Lisa (21 Aug), Hatton Garden (Easter weekend), Ghosn (29 Dec).
