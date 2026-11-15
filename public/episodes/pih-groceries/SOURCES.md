# PRICED IN HOURS ep.1 — Groceries vs. 1984 (in minutes of work)

All numbers are computed by `scripts/prep-pih-groceries.mjs` from FRED CSVs (committed in `data/fred/`, fetched 2026-11-10)
and **asserted** against the script below: if FRED revises a value so that a spoken claim is no longer true, the prep fails.

**Method.** Minutes of work = BLS average retail price ÷ average hourly earnings of production & nonsupervisory employees,
total private (AHETPI) × 60. Same month every year (September) to avoid mixing seasons. Latest common month: Sep 2026.

## Script
1. 18% less work than in 1984. That's your grocery cart today. Except for one item.
2. The trick: price food in minutes of work. In 1984, non-managers in the private sector made $8.55 an hour. Today, $32.63.
3. A pound of cheddar: 21 minutes of work then. 11 now.
4. Chicken: 5.5 minutes, now under 4.
5. Eggs: 6 minutes then. 12 at the 2025 peak. About 4 today.
6. Bread? Cheaper too. Gas? Dead flat: 8 minutes then, 8 now.
7. But one item went the other way. Ground beef: 9 minutes then. 12.5 today.
8. And it's recent. In 1998, beef bottomed out at 6 minutes. Since then, it has doubled. Chicken? Cheaper.
9. Now the whole cart. In 1990, it took 7% more work. By 2004, only 2% less.
10. The real drop came after 2014.
11. So, measured in your time, the whole cart now costs… *(loops into line 1)*

## Facts table
| Claim | Value (computed) | Series |
|---|---|---|
| Hourly pay Sep 1984 / Sep 2026 | $8.55 / $32.63 | AHETPI |
| Cheddar, 1 lb | 21.52 → 11.28 min (−48%) | APU0000710212 |
| Chicken, whole, 1 lb | 5.54 → 3.79 min (−32%) | APU0000706111 |
| Eggs, grade A large, dozen | 5.99 → 4.18 min (−30%); peak 12.04 min in Mar 2025 ($6.227, pay $31.02) | APU0000708111 |
| Bread, white pan, 1 lb | 3.78 → 3.37 min (−11%) | APU0000702111 |
| Gasoline, regular, 1 gal | 8.44 → 8.24 min (−2%) | APU000074714 |
| Ground beef, 100% beef, 1 lb | 8.90 → 12.49 min (+40%); low 6.23 min in Sep 1998 (×2.0 since) | APU0000703112 |
| Chicken 1998 → 2026 | 4.92 → 3.79 min | APU0000706111 |
| Whole cart (CPI food at home ÷ pay), vs Sep 1984 | 1990 +7.3% (peak) · 2004 −2.2% · 2014 −3.0% · 2026 −18.2% | CUUR0000SAF11 / AHETPI |

## Limits & wording choices (say them if challenged)
- **Pre-tax** pay; ignores taxes, benefits and household size. "Your" = the average private-sector non-manager (~ most hourly workers), not every viewer.
- AHETPI is seasonally adjusted, BLS average prices and CPI are not: comparing the same month limits the bias.
- BLS average prices are US city averages of a fixed item definition; quality/size changes are not adjusted.
- The 6 items are chosen for recognisability; the headline (−18%) uses the whole food-at-home CPI, not those 6.
- No cause is claimed for beef's rise or for the post-2014 drop (debated: cattle cycle, wage growth, etc.).
- Gas looks "flat" partly because Sep 2026 prices are high (FRED shows a 2026 spike); stated as a fact, not explained.

## References
- FRED, Federal Reserve Bank of St. Louis — series above: https://fred.stlouisfed.org/series/AHETPI (and each APU id)
- BLS, Average Price Data (AP) and CPI-U: https://www.bls.gov/cpi/factsheets/average-prices.htm

## Pinned comment
Sources: BLS average prices + CPI food at home, and average hourly earnings of production & nonsupervisory workers (AHETPI), all via FRED (St. Louis Fed). Minutes of work = price ÷ hourly pay, September 1984 vs September 2026, pre-tax. Not financial advice.
What should we price in hours next: rent, a new car, or college?
