# SILLAGE N°1 · What's really in your perfume · raea, 61 s

Myth-bust reel: "Perfume isn't just flowers." Voice, timings and sources: `public/episodes/scent-001-notjustflowers/`.
Supersedes `raea/sillage-bottle` (36 s, flowers only).

## The set
A glass flacon on a velvet plinth at the centre of a ring of nine stations. Each station: one framed AI plate
(credited in its corner) and, when there is one, the ingredient in 3D on a pedestal. The bottle fills one layer per
ingredient; on "lab" the three animal layers turn to the lab colour (the myth-bust happens inside the bottle).

| Beat | Station / shot |
|---|---|
| hook | inside the ring, wide lens on the bottle, jasmine falling (what everybody expects) → **cut** on "whale's" to the whale plate |
| ambergris · fixative | ambergris plate + 3D lump; close on the bottle, first layer |
| musk · beaver | musk deer plate + musk pod; beaver plate (castoreum) |
| twist | lab plate + molecule; the animal layers glow pink |
| flowers → jasmine · rose · vanilla · vetiver | round the plant side of the ring, one station per note |
| pullback | top-down on the whole ring, every name |
| loop | back to the frame-0 pose on "remember:" |

## Plates (all AI, all labelled on screen and in the pinned comment)
Made on 19 Nov 2026 in the owner's browser session: Gemini (Nano Banana) and ChatGPT (gpt-image).
Originals in `media/plates/{nb,gpt}_*.{jpg,png}`, 3:4 crops used on screen in `media/plates/p_*.jpg`.

| Plate | Model | Prompt (short) |
|---|---|---|
| ambergris | Nano Banana | raw lump of ambergris on dark wet sand at dusk, sea foam behind |
| musk | Nano Banana | male musk deer in a misty Himalayan pine forest at dusk |
| jasmine | Nano Banana | hands (no faces) picking jasmine at dawn near Grasse, wicker basket |
| rose | Nano Banana | Damask rose field, Rose Valley, Bulgaria, sunrise |
| vetiver | Nano Banana | freshly dug vetiver roots on a wooden table, Haiti |
| whale | gpt-image | sperm whale in the deep ocean, light shafts |
| beaver | gpt-image | Eurasian beaver on a riverbank at dusk |
| lab | gpt-image | perfumer's lab bench, vials, pink flask, molecule model |
| vanilla | gpt-image | vanilla orchid hand-pollinated with a bamboo splinter (fingertips only) |

Shared style in every prompt: cinematic editorial photograph, deep plum and near-black, rose-champagne light,
vertical 3:4, no text, no logo, no faces. No real person is pictured (Edmond Albius is named, never shown).

## Run it
```bash
raea/sillage-notjustflowers/setup.sh    # voice, music, sfx, fonts, plates → compositions/media
raea/sillage-notjustflowers/render.sh   # → out/sillage.mp4 + raea check
```
