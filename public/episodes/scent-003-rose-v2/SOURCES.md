# SILLAGE N°3 remaster (scent-003-rose-v2) — The $12,000 flower · raea on sillage-kit (luxury pass v3)

Status: **scripted, voiced, rendered in `raea/sillage-003-rose/`**. Format C (guess: "how many petals for one kilo?",
answer at beat 9). Images: AI illustrations (Nano Banana, gpt-image), see `raea/sillage-003-rose/media/manifest.json`.

Access note: read through search-engine extracts (BNR, BTA, Givaudan, Scento). **The owner ticks every ⚠ line before posting.**

## Script (13 beats, 60.82 s)
1. One kilo of this oil sells for about 12,000 dollars. It comes from a single flower. Guess how many it takes.
2. Bulgaria. The Rose Valley, around Kazanlak. This valley makes about half of the world's rose oil.
3. The flower is the Damask rose. And its harvest is short: late May to mid-June.
4. Pickers start before sunrise. By late morning, the heat drives the scent out of the petals, so they stop.
5. Every flower is picked by hand, one at a time. No machine does it.
6. Then, copper stills. Steam carries the oil out of the petals, and it floats to the top.
7. Every year since 1903, Kazanlak throws a festival for the harvest.
8. So. How many flowers for one kilo of oil? Three. Two. One.
9. Three to five tonnes of flowers. Sources vary. Most say about three and a half.
10. For a single gram, more than a thousand petals.
11. And the farmer? In 2025, about one dollar fifty for a kilo of flowers.
12. Our calculation: three and a half tonnes of flowers bring about 5,300 dollars.
13. All those mornings, for one kilo.  (loops into 1)

## What changed from N°3 (data coherence, kit P6)
- **One currency (USD).** The farmer's price is sourced in euros (BGN 2.50 ≈ €1.28 per kg of flowers, 2025). Converted
  at the ECB euro reference rate of 31 Dec 2025, **1 EUR = 1.1750 USD** (ECB daily reference rates, 31 Dec 2025
  <https://www.ecb.europa.eu/stats/exchange/eurofxref/shared/pdf/2025/12/20251231.pdf>) → €1.28 × 1.175 = **$1.504 ≈ $1.50**,
  labelled "our conversion" on screen. ⚠ The harvest was paid in June 2025: a June rate would give a slightly lower
  figure; the owner may prefer the ECB 2025 annual average once checked.
- **Our calculation**: 3,500 kg × $1.504 = $5,264 → **≈ $5,300** (the screen line shows 3,500 kg × $1.50 = $5,250,
  also within 1 % of $5,300). Recomputed by `raea/sillage-kit/tools/validate.mjs`.
- **One unit** for the mass of raw material: "flowers" everywhere (BNR counts kg of rose *blossoms*). Beat 9 said
  "tonnes of petals" before. Beat 10 counts petals (a number, not a mass) and keeps "petals".
- The rest of the facts table below is unchanged from N°3; rows 11–12 are superseded by the two lines above.

## Facts table
| # | Claim (on screen) | Source | Status |
|---|---|---|---|
| 1 | Bulgarian rose oil ≈ $12,000/kg ("$11,580 spring 2025, $12,854 autumn 2025, $12,000 spring 2026") → on screen "≈ $12,000 / kg · 2025–26" | Scento, *Perfume ingredient prices 2026* (citing Ultra International) <https://www.scento.com/blog/perfume-ingredient-prices-2026> | ⚠ broker benchmark, not an official price |
| 2 | Rose Valley / Kazanlak is the centre of Bulgarian oil-rose growing | Givaudan "Rose Oil Bulgaria" <https://www.givaudan.com/print/2738681>; BTA <https://bta.bg/en/news/673353> | ⚠ tick |
| 3 | Bulgaria ≈ half of world rose oil ("almost half" Givaudan; "more than half" BNR) → "about half" | Givaudan (above); BNR <https://bnr.bg/en/post/100837137> | ⚠ sources vary, undated → wording "about half" |
| 4 | The oil rose is *Rosa damascena* (Damask rose, "Kazanlak rose") | BNR (above); AramcoWorld, *The long wandering of the Damascus rose* (2022) | ⚠ tick |
| 5 | Harvest late May → mid-June | National Geographic (Rose Festival); BTA/BNR yearly picking notices (e.g. 19 May–2 June by village) | ⚠ varies by year and village |
| 6 | Picking starts before sunrise; oil content peaks early (4–8 am); picking ends by 9 am–noon | BTA (above): "before sunrise… by 9 am… 4–8 am"; Vagabond <https://vagabond.bg/six-am-valley-roses-5014> | ⚠ hours vary → no hour on screen |
| 7 | Picked by hand ("can only be done by hand") | Vagabond / BNR picking reports | ⚠ tick |
| 8 | Steam distillation in copper stills; the oil is skimmed from the top | omda.bg *Rose oil production* <https://www.omda.bg/public/engl/ethnography/rose_oil_production.htm>; AramcoWorld | ⚠ tick |
| 9 | 3,000–5,000 kg of petals for 1 kg of oil; average ≈ 3.5 t | BNR <https://bnr.bg/en/post/101658605> (3,000–5,000 kg); premiumbeautynews (≈3,500 kg); omda.bg (avg 3.5 t, 3–5 t); Reuters via FashionNetwork (4 t) | ⚠ **SOURCES VARY** — shown on screen |
| 10 | "For one gram of rose oil, more than 1,000 rose petals must be plucked by hand" | picking report quoted in search extract (BNR/Vagabond) | ⚠ find the exact page; drop beat 10 if not found |
| 11 | 2025 purchase price ≈ BGN 2.50 / €1.28 per kg of rose blossoms | BNR <https://bnr.bg/en/post/101652293> (record-low yield, low purchase price) | ⚠ another report says BGN 1.6 (€0.8): price moved during the season |
| 13 | Kazanlak Rose Festival held since 1903 | BNR *Rose festival in Kazanluk celebrates 120th anniversary* <https://bnr.bg/en/post/101832408>; Wikipedia "Rose Festival, Bulgaria" | ⚠ tick |
| 12 | 3,500 kg × €1.28 ≈ €4,480 → "≈ €4,500" | **our calculation** (labelled on screen) | computed |

Debated / careful wording
- No cause is claimed for the gap between the flower price and the oil price (distillation, labour, trading are not
  shown). The screen shows two numbers and labels the euro sum "our calculation"; currencies are kept as sourced (€ for
  flowers, $ for the oil benchmark), no conversion.
- "About half" of world production: older press figure, no recent FAO statistic found.

## Images
AI illustrations, painterly (cabinet des songes): valley at dawn, pickers seen from behind or far away (no faces),
hands with blossoms (no face), a copper still. Never presented as photos of a real farm or distillery.
The bottle and the oil are 3D.

## Pinned comment (draft, v2)
Sources: as below. Prices: Bulgarian rose oil ≈ $12,000 per kg (Scento / Ultra International, 2025–26). The farmers' 2025 price, BGN 2.50 ≈ €1.28 per kg of flowers (BNR), is converted at the ECB rate of 31 Dec 2025 (1.1750): ≈ $1.50. ≈ $5,300 is our calculation: 3,500 kg × $1.504.

## Pinned comment (N°3 original)
Sources: BNR (Bulgarian National Radio) reports on the 2025 harvest (≈ €1.28 per kg of flowers; 3,000–5,000 kg of
petals per kg of oil); BTA (picking before sunrise); Givaudan (Rose Valley ≈ half of world rose oil); omda.bg (copper
stills, average 3.5 t); Scento / Ultra International (≈ $12,000 per kg, 2025–26). The ≈ €4,500 is our calculation
(3,500 kg × €1.28). Images: AI illustrations (Nano Banana, gpt-image). Bottle: 3D.
