# REVIEW — SILLAGE N°6 "It was never whale vomit" (ambergris) · raea

26 Nov 2026. Video: `raea/sillage-006-ambergris/out/sillage.mp4` (copy in `deliverables/scent-006-ambergris/`), 65.7 s,
−13.7 LUFS, `raea check` 0 errors / 14 warns (short-on-screen texts).

Pass 1 reports: `docs/review/scent-006-ambergris-pass1.md` (reel-reviewer, 6.5/10) and
`docs/review/scent-006-ambergris-virality-pass1.md` (virality-reviewer, 76/100).

## Applied after pass 1 (no new voice)
- Hook: cut to the 3D lump on "It sold", big "$1.5M"; "280 lb · Yemen, 2021" under 127 KG (frame 0 = last frame).
- Flacon fills on "ambroxide" (1.3 s); camera travels lump → flacon on "ambrein"; whisper "the main smell".
- Restored the hedge on screen: "It mostly leaves the other way".
- Captions: 40-char lines, no line ending on a small word or bare number, "E U," merged to "EU,", rose = keywords only.
- Pearls moved so the flacon no longer cuts the frame; series badge at y 264; larger, closer cards; shorter light band.
- No dash before "WHALE VOMIT"; "Charles II's eggs" on "Eggs"; "÷ 127 kg · our calculation" held for the whole beat.
- Lump rebuilt as a pitted rock; "often found inside" on a plum chip (contrast error in raea check).

## Not applied (owner's call)
- History plate shows a Chinese-style bronze incense burner under "Egypt: incense": regenerate a generic/Egyptian censer.
- Virality fix #2 (US-law tease right after the bust) needs a new voice recording (ElevenLabs credits).
- Thin gold moulding line visible behind the lump in the "$1.5M" shot.

## Kit v3 rebuild (26 Nov 2026, owner: "refais le reel avec les nouveaux enhancements")
`raea/sillage-006-ambergris-v2/` on `raea/sillage-kit` (commit 7671a3e): same voice/timings, content in `reel.json`.
Video: `raea/sillage-006-ambergris-v2/out/sillage.mp4` (copy `deliverables/scent-006-ambergris/sillage-006-ambergris-kit.mp4`),
65.7 s, −13.7 LUFS, kit pre-flight 0 ✗, `raea check` 0 errors / 56 warns (mostly word-by-word captions on screen < 1 s).
- 7 new photoreal Nano Banana plates (kit style suffix), full frame; the 3D lump and pearls are gone (the kit has no
  such objects): "$1.5M" sits on a photo-style lump plate, "1 in 100" on the flacon.
- Flacon empty → fills on "ambroxide" → drains at "price"; loop returns to the boat with the hook text.
- Floating petals off on every shot (off-theme for a sea subject).
- History plate regenerated: alabaster censer instead of the Chinese-style bronze.
- Not yet run: reel-reviewer / virality-reviewer on this build.

## Kit build, pass 1 reviews → fixes (27 Nov 2026)
Reviews: `docs/review/scent-006-ambergris-kit-pass1.md` (7.5/10), `docs/review/scent-006-ambergris-kit-virality-pass1.md` (79/100).
Re-render: 65.7 s, −13.7 LUFS, kit pre-flight 0 ✗, `raea check` 0 errors / 53 warns (word-by-word captions < 1 s).
- P1 myth: "Never vomit." on the lump plate from "It was" (≈ 1.6 s); name shot starts on "ambergris".
- Name shot: crane camera (no cap in the logotype) + US-law tease "illegal to own in the US ↓" from "French".
- "1 in 100" on the whale plate (kit has no dot grid); "…like dung" held 0.4 s longer.
- Price: "$12" first, "a gram · $1.5M ÷ 127 kg" + OUR CALCULATION on "a"; $12 held until "shortcut".
- Juice #9A6420 with `juiceGlow` 0.12; slow camera on the history plate; tight crop on the lump for "sweet & earthy".
- Kit (affects every kit episode): top scrim fitted to each shot's text stack (`scrim.top.fitPad`, composition and
  validator share `scrimHold()` in `src/core.ts`), base scrim `to` 0.30 / `fadeTo` 0.42, bottom from 0.62;
  `juiceGlow` option in reel.json. N°3 v2 pre-flight still 0 ✗.
- Still open: liquid reads cream more than amber; the light sweep briefly whitens the whole flacon on "ambroxide".
