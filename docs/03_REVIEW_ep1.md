# Critical review — Ep.1 "How 1 country became 15"

## Accuracy
- ✅ Sequence & key dates cross-checked (RFE/RL, LRT, Euronews + reference books). Remaining checks on a primary source: Kyrgyzstan 31 Aug; Kazakhstan 16 Dec.
- ⚠️ "Fell apart in under two years": counts from 11 Mar 1990 to 25 Dec 1991 (21 months). Defensible; someone could argue the process started in 1988 (Estonian sovereignty declaration, Nov 1988).
- ⚠️ "Within ten days" (21→31 Aug) is right for *declarations*; recognition came later (Baltics recognised by the USSR on 6 Sep 1991).
- ⚠️ "Soviet troops attack the TV tower" — the TV tower *and* the radio-TV building were stormed; simplification acceptable.
- ⚠️ Belarus 25 Aug, Azerbaijan 30 Aug, Armenia 23 Sep: "dates vary" (see SOURCES). Consider an on-screen "DATES VARY" tag in v2.
- ✅ Russia never shown with an "independence" date (correct).
- ✅ Crimea fixed (Natural Earth's de facto default would have shown 1991 Crimea as Russian — a factual error *and* a political trap).

## Map
- Natural Earth borders are 2019-era; tiny post-1991 demarcation changes invisible at this scale.
- Equal-area projection (azimuthal) = sizes are honest; Russia looks less "Mercator-huge" than people expect — good.

## Rhythm
- 60.2 s total, 13 beats ≈ 4.6 s each: dense. The six-name list (beat 7) is fast (~0.75 s/name) — works as a "wave" effect but labels overlap in the west. v2: zoom into the west for Ukraine/Belarus/Moldova then cut to the Caucasus/Central Asia.
- Hook text + "USSR" label appear at frame 0 ✔. Loop ending tested by ear on the script; visually the last frame (fit view) matches the first framing ✔.

## English naturalness
- Short, spoken, present tense — native-sounding. "Fourteen civilians die" is blunt but neutral.
- Kokoro voice is good but flatter than ElevenLabs; emphasis on "fifteen" / "still" would benefit from a better TTS.

## Pronunciation (checked via phoneme output, not by ear)
Corrected via lexicon: Gorbachev (/ˈɡɔːrbətʃɒf/ instead of "-shev"), Belavezha (/ˌbɛləˈvɛʒə/), Kazakhstan, Kyrgyzstan; years written in words ("nineteen ninety") because raw "1990" was read "nineteen hundred ninety". Captions still display digits via the `{1990|nineteen ninety}` markup.

## Over-simplification risks
- Viewers may read "15 countries" as the end of the story — omits the frozen conflicts (Transnistria, Abkhazia, South Ossetia, Karabakh). Mention in caption text.
- Comments will raise Crimea / "Russia sold out" / "the West caused it" debates — the pinned sources comment is the answer.

## Technical limits of v1
- Word timings are **estimated** inside each sentence (phoneme-weighted); sentence boundaries are exact. ElevenLabs `/with-timestamps` would make highlighting exact.
- Music is a procedural drone (zero rights issue) — functional, not exciting. Swap for a track from TikTok's Commercial Music Library or a CC0 track.

## v2 — ElevenLabs voice (update)
- Voice: **Brian** (ElevenLabs premade, American, narration), model `eleven_multilingual_v2`, speed 1.12, pauses capped at 0.28 s → 55.8 s total.
- Word timings are now **exact** (character alignment from `/with-timestamps`), so word-by-word captions and map cues (`atWord`) are frame-accurate.
- Whole script synthesised in one request → continuous intonation across sentences.
- Pronunciation: "Belavezha" respelled "Byeh-lah-VYEH-zha" for the voice only (captions keep the real spelling). multilingual_v2 does not accept IPA phoneme tags, so the Kokoro lexicon does not carry over — **check Gorbachev / Kyrgyzstan / Belavezha by ear**.
- Responses are cached per (voice, text, settings) in `public/episodes/<id>/.el_*.json`: re-renders cost no credits. If ElevenLabs fails, the pipeline falls back to Kokoro automatically.
