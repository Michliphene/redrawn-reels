# EP 11 — Who really drew the Middle East (Sykes-Picot myth-bust) · sources & fact sheet

Topic #11 of the REDRAWN bible ("Sykes-Picot didn't draw these borders"), format D (myth-bust).

## Script (as spoken)
1. Two men drew these borders in 1916. That's the myth.
2. In May 1916, Britain and France secretly carve up the Ottoman Empire's Arab lands.
3. Mark Sykes and François Georges-Picot sign this map.
4. Blue for France. Red for Britain. A and B: their zones of influence. Palestine: international.
5. 1917: Russia's new Bolshevik rulers publish it.
6. Then the plan falls apart.
7. 1918: France lets Britain have Mosul.
8. 1920: France gets Syria and Lebanon. Britain gets Iraq, and Palestine too.
9. 1921: Britain creates Transjordan. It's not on the map.
10. 1923: Turkey wins its war. France's northern zone is gone.
11. 1926: Mosul is confirmed in Iraq.
12. Lay the plan over the result.
13. The idea survived: Britain and France split the region. The lines? Mostly not.
14. Wars, treaties, ten years of deals. Yet the story is still… → (loop) "Two men drew these borders in 1916."

## Facts used
| Claim | Value | Source / note |
|---|---|---|
| Secret Anglo-French agreement, Russia assenting, on the partition of the Ottoman Empire | 1916 | Britannica "Sykes-Picot Agreement"; 1914-1918-online encyclopedia |
| **Date** | **dates vary**: map signed 8 May 1916; exchange of letters 9–16 May 1916; often given as 16 May (History.com), sometimes 19 May → screen says **"May 1916"** only | UK National Archives MPK 1/426 catalogue; Wikipedia; History.com |
| Negotiators | Sir Mark Sykes (Britain), François Georges-Picot (France); both signed the map | UK National Archives MPK 1/426 ("Signed: Sir Mark Sykes and Fr. Georges-Picot, 8 May 1916") |
| Zones | blue = French direct control; red = British direct control; A and B = an Arab state or confederation under French (A) / British (B) influence; brown = international administration (Palestine); Haifa/Acre to Britain | Britannica; text of the agreement (Boston University copy); MPK 1/426 |
| Mosul in zone A (French), Kirkuk in zone B, Baghdad and Basra in the red area | — | McMaster map-library script; checked on our digitised map (`scripts/prep-sykes.mjs` prints the tests) |
| Bolsheviks publish it ("1917" on voice; date block 23 Nov 1917) | 23 Nov 1917 (Izvestia / Pravda), Manchester Guardian 26 Nov 1917. One source says 22 Nov (summary) → screen date is "November 1917" | Marx Memorial Library; Wikipedia; Middle East Journal editor's blog |
| France concedes Mosul to Britain (and accepts British Palestine) | 1 Dec 1918, verbal Clemenceau–Lloyd George understanding; formalised later (1919–20) | Wikipedia "1918 Clemenceau–Lloyd George Agreement"; FRUS Paris Peace Conference vol. V; Martin Kramer chronology |
| Mandates: France → Syria and Lebanon; Britain → Iraq (Mesopotamia) and Palestine | San Remo conference, 25 Apr 1920; League of Nations confirmed the Syria–Lebanon and Palestine mandates in 1922 (Iraq: Anglo-Iraqi treaty instead of a confirmed mandate) | Wikipedia "Partition of the Ottoman Empire"; Encyclopedia.com |
| Brown (international) area not applied: Palestine becomes a British mandate | 1920/1922 | 1914-1918-online ("Mosul and Palestine… now went to Britain") |
| Transjordan created by Britain; "not on the map" = not a unit of the 1916 map | Emirate of Transjordan, April 1921 (after the Cairo Conference, March 1921). Not a named unit on the 1916 map (its land lay in zone B) | standard references (Britannica "Jordan – history") |
| Turkey: war of independence won; French zone in Anatolia lost | France evacuated Cilicia under the Franco-Turkish Ankara agreement (Oct 1921); Treaty of Lausanne 24 Jul 1923 set Turkey's borders with the Syrian and Iraqi mandates (except Mosul) | TCF "Beyond bad borders"; Foreign Policy (2015); Wikipedia "Treaty of Lausanne" |
| Mosul confirmed in Iraq | League of Nations Council decision 16 Dec 1925; Turkey–UK–Iraq frontier treaty, Ankara, 5 Jun 1926 → screen "1926" | Wikipedia "Treaty of Ankara (1926)", "Mosul question" |
| "The idea survived… the lines mostly did not" | Henry Laurens: borders largely renegotiated 1916–1922, the initial map "bears no resemblance" to today; Kursun (2020) "Sykes-Picot myth"; Encyclopedia.com: the post-war settlement "closely mirrored" the Anglo-French division of influence | see **Debated points** |
| "ten years of deals" | 1916 → 1926 | arithmetic |

## Debated points (shown neutrally)
- **How much Sykes-Picot shaped the region is debated.** Many historians (Laurens; Kursun 2020; TCF 2016; The American
  Interest 2016) say the 1916 lines did not become today's borders; others stress that the Anglo-French division it set up
  did shape the mandates (Encyclopedia.com; Cambridge "Sykes-Picot and artificial states"). The script says both:
  "The idea survived… The lines? Mostly not." It never says Sykes-Picot "had no effect".
- No single cause is claimed for any later border.

## Map (`scripts/prep-sykes.mjs` → `public/data/sykes1916.geojson`)
- Countries: Natural Earth 1:50m (world-atlas 2.0.2 = NE 4.1.0, public domain), shown **as of 1926**:
  - **Hatay** (Sanjak of Alexandretta) cut out of Turkey and shown with French Syria: it went to Turkey only in 1939.
    Province outline approximate.
  - **Golan** moved from NE's Israel (NE 4.1 de facto view) to Syria: in French-mandate Syria after the 1923 boundary
    agreement; internationally recognised as Syrian today.
  - **Palestine** piece = NE Israel (minus the Golan) ∪ NE Palestine, standing for Mandatory Palestine. No internal line is
    drawn because none existed in 1920–1926. Name on screen: "Palestine" (the mandate's name).
  - **Transjordan** = NE Jordan (generalised; its southern border with Saudi Arabia was adjusted in 1965 — not visible at
    this scale, not claimed).
  - Saudi Arabia, Kuwait, Iran, Egypt, Cyprus: scenery, never declared (not part of the 1916 deal).
- **1916 zones: digitised from the signed map itself** (UK National Archives MPK 1/426, 1280 px Commons scan),
  georeferenced from its own graticule (conic model, residual ≈ 2.5 px ≈ 3 km), outlines traced by hand
  (± ≈ 6 km; the faint Anatolian edge of the blue area is the least precise). Zones are clipped to land and to the
  Ottoman side (Cyprus and Persia excluded). Checks printed by the script: Mosul north of the A/B line, Kirkuk south,
  Baghdad and Basra in red, Jerusalem in brown, Beirut / Adana / Sivas / Diyarbakir in blue, Damascus and Aleppo not.
  → treat as **approximate**; the review must check that no zone edge is used to make a precise claim.

## Images
- The signed map: "MPK1-426 Sykes Picot Agreement Map signed 8 May 1916.jpg" — UK National Archives MPK 1/426,
  Wikimedia Commons, public domain (published before 1929 / UK Crown work, expired). Credit on screen:
  "UK National Archives MPK 1/426 · public domain". File: `public/assets/images/sykes_picot_map_1916.jpg`.
- Flags: UK and France stickers (flag-icons, MIT) — today's designs, identical in 1916 for both.
- No portraits (no PD photo fetched yet; the signatures on the map stand in for them).

## References
- Britannica, Sykes-Picot Agreement: https://www.britannica.com/event/Sykes-Picot-Agreement
- 1914-1918-online, Sykes-Picot Agreement: https://encyclopedia.1914-1918-online.net/article/sykes-picot-agreement/
- UK National Archives, MPK 1/426: https://discovery.nationalarchives.gov.uk/details/r/C3980447
- Public Domain Review, "The Map That Changed the Middle East (1916)": https://publicdomainreview.org/collection/the-map-that-changed-the-middle-east-1916/
- History.com, Britain and France conclude Sykes-Picot agreement: https://www.history.com/this-day-in-history/may-16/britain-and-france-conclude-sykes-picot-agreement
- Boston University, text of the agreement: https://www.bu.edu/mzank/Jerusalem/tx/Sykes-Picot.htm
- McMaster University map library script: https://macsphere.mcmaster.ca/bitstream/11375/25475/2/SykesPicot_VideoScript_GordBeck.pdf
- Marx Memorial Library, revelation of the secret treaties (1917): https://www.marx-memorial-library.org.uk/node/1639
- Middle East Journal editor's blog, 1917 publication: https://mideasti.blogspot.com/2016/05/more-sykes-picot-unraveling-1917.html
- 1918 Clemenceau–Lloyd George Agreement: https://en.wikipedia.org/wiki/1918_Clemenceau%E2%80%93Lloyd_George_Agreement_(Middle_East)
- FRUS, Paris Peace Conference vol. V: https://history.state.gov/historicaldocuments/frus1919Parisv05/d1
- Martin Kramer, Sykes-Picot chronology: https://martinkramer.org/wp-content/uploads/2025/09/sykes-picot.pdf
- Treaty of Ankara (1926): https://en.wikipedia.org/wiki/Treaty_of_Ankara_(1926) · Mosul question: https://en.wikipedia.org/wiki/Mosul_question
- TCF, "Beyond bad borders": https://tcf.org/content/report/beyond-bad-borders-how-nationalism-imperialism-and-power-politics-shaped-the-modern-middle-east/
- Kursun (2020), "The Sykes-Picot myth" (Aberystwyth): https://pure.aber.ac.uk/ws/portalfiles/portal/38179060/Jan2020_9_1_Kursun_Sykes_Picot_Myth.pdf
- The American Interest (2016): https://www.the-american-interest.com/2016/05/16/the-bullshistory-of-sykes-picot/
- Cambridge, "Sykes-Picot and artificial states": https://www.cambridge.org/core/services/aop-cambridge-core/content/view/535345E5393DD5D17EF33F0D616FA365/S2398772300002919a.pdf/sykes-picot-and-artificial-states.pdf
- Foreign Policy (2015): https://foreignpolicy.com/2015/08/10/sykes-picot-treaty-of-sevres-modern-turkey-middle-east-borders-turkey/
- Encyclopedia.com, Sykes-Picot Agreement (1916): https://www.encyclopedia.com/humanities/encyclopedias-almanacs-transcripts-and-maps/sykes-picot-agreement-1916

## To tick before posting (owner)
- [ ] Listen: "Georges-Picot", "François", "Transjordan", "Mosul".
- [ ] Transjordan "April 1921" and San Remo "25 April 1920" against Britannica (not opened from the cloud session).
- [ ] Zone outlines vs the scan (stills sheet).

## Pinned comment (EN)
Sources: the signed 1916 map (UK National Archives MPK 1/426, public domain), Britannica, the 1918 Clemenceau–Lloyd George
understanding, the Treaty of Lausanne (1923) and the 1926 Ankara frontier treaty. The 1916 zones are traced from that map,
so their edges are approximate. Historians still debate how much Sykes-Picot shaped the region: the Anglo-French split
survived, the lines mostly didn't.
👉 Which border would you have guessed came straight from 1916?
