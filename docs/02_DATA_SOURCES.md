# Border data — sources & precision limits

| Source | Coverage | Licence | Precision / caveats | Use for |
|---|---|---|---|---|
| **Natural Earth** admin-0 (1:110m/50m/10m) — used via npm `world-atlas@2.0.2` (= NE v4.1.0) | Present day | Public domain | Generalised coastlines at 50m (fine for phone). **De facto point of view: NE 4.1 puts Crimea in Russia** — verified in this session, corrected in `scripts/prep-ussr.mjs`. NE ≥5.1 ships "point-of-view" variants; always check disputed areas (Crimea, Kosovo, Kashmir, W. Sahara, Taiwan, N. Cyprus, Somaliland) | Modern & post-1945 maps where borders haven't moved |
| **historical-basemaps** (A. Ourednik) | Snapshots −123000 → 2010 (fixed years: …1880, 1900, 1914, 1920, 1938, 1945, 1960, 1994, 2000, 2010) | **GPL-3.0** (verified) — attribution + share-alike; using a GeoJSON as input to a video is generally fine, but redistributing modified data must stay GPL | Author says "work in progress, verify before academic use". Field `BORDERPRECISION` 1=approximate, 2=moderate, 3=legal. Snapshots only: events between years (e.g. 1772/1793 partitions of Poland) **not** present → must hand-edit | Pre-1900 overviews, empires |
| **CShapes 2.0** (ETH Zürich / ICR) | 1886–2019, borders with start/end dates | Check — believed CC BY-NC-SA 4.0 (**NC = problem if monetised**) | Very good for state borders, no sub-state units; colonial units simplified | 20th-century topics (Africa, Yugoslavia, Germany) |
| **Atlas of Historical County Boundaries** (Newberry Library) | US states/counties 1629–2000, day-precise | Free download, credit required (verify terms) | Excellent, legal-text based | US expansion (#2, #3, #5) |
| **OpenHistoricalMap** | Patchy, worldwide | CC0 | Quality varies per contributor | Gap-filling |
| **Ancient World Mapping Center** (UNC) | Roman world | Open (verify: CC BY) | Provinces approximate; "borders" of ancient states are often zones, not lines | #17 |
| **Commercial (reference only):** Euratlas, GeaCron | Year-by-year | Paid licence | Good, but don't copy without licence | Cross-checking |

**General limits to say on screen when relevant:** pre-modern borders are zones of control, not lines; maps of empires usually show *claimed* territory at peak; area figures for the Mongol, British and Roman empires vary between sources by 10–30 %.
