# RECEIPTS #004 — The iPhone is a storefront (Apple) · v2 (raea floor pass)

Same voice, script, timings and figures as `apple-iphone` (`"audio": "apple-iphone"`). Nothing below changed except the
on-screen source line ("Source: Apple 10-K (SEC filing), fiscal 2026", same filing). What changed on screen and why is
in `docs/REVIEW_apple-iphone-v2.md`.

Format: E · One object (the buyer's $1,000), explainer spine. DA 2.

## Script (voice)
1. Spend $1,000 on Apple devices, and about $390 is left once they're built.
2. That's huge for hardware. But it's not Apple's best business.
3. Follow the $1,000.
4. About $610 pays to make the devices.
5. $390 is left. Apple doesn't say how much of that is the iPhone alone.
6. Now the money that comes after. Apps, iCloud, ads, AppleCare.
7. Of every $100 of services, about $76 is left after costs.
8. Services are only about a quarter of Apple's sales. But they bring 40% of what's left after costs.
9. That's $94B last year. Two thirds of what all the devices made.
10. So the iPhone isn't just the product. It's the storefront.
11. And it all starts when you… → (loop) spend $1,000 on Apple devices…

## Facts table — Apple Form 10-K, fiscal year ended 26 Sep 2026 (US$ millions)
| Line | FY2026 | FY2025 | Check |
|---|---|---|---|
| iPhone net sales | 254,098 | | |
| Services net sales | 123,301 | 109,158 (≈ $109.2B) | |
| Total net sales | 478,834 | 416,161 (≈ $416.2B) | |
| Products net sales | 355,533 | | 478,834 − 123,301 (our calculation) |
| Products gross margin | 139,659 (39.3 %) | 112,887 (36.8 %) | 139,659 / 355,533 = 39.28 % ✓ |
| Services gross margin | 93,943 (76.2 %) | 82,314 (75.4 %) | 93,943 / 123,301 = 76.19 % ✓ |
| Total gross margin | 233,602 (48.8 %) | 195,201 (46.9 %) | 139,659 + 93,943 ✓ · / 478,834 = 48.79 % ✓ |
| Products cost of sales | 215,874 | | 355,533 − 139,659 (our calculation) |
| R&D | 45,765 | 34,550 | |
| SG&A | 29,774 | 27,601 | |
| Operating income | 158,063 | 133,050 | 233,602 − 45,765 − 29,774 ✓ |
| Net income | ≈ 132,200 | | |
(FY2025 net sales split: only the totals above were used; not on screen.)

| On screen / spoken | Value | Derivation |
|---|---|---|
| "$1,000 of Apple devices", "FY2026" | framing unit | Products net sales scaled to $1,000 |
| "$390 left once they're built" / "$390 left · all devices" | 1,000 × 39.3 % = $393 → "about $390" | Products gross margin %, our calculation |
| "$610 pays to make the devices" | 1,000 × 60.7 % = $607 → "about $610" | 100 % − 39.3 %, our calculation (61 tiles) |
| "iPhone alone: not disclosed" | Apple reports gross margin for Products and Services only, not per device | 10-K gross margin table |
| "$76 of every $100 of services left after costs", $24 cost | 76.2 % / 23.8 % | Services gross margin % (76 + 24 tiles) |
| "26% of sales", "about a quarter" | 123,301 / 478,834 = 25.75 % | our calculation |
| "40% of what's left after costs" / "of gross profit" | 93,943 / 233,602 = 40.2 % | our calculation |
| "$94B last year" | 93,943 | Services gross margin |
| "$234B gross profit", bars 139.7 → "$140B" devices / 93.9 → "$94B" services | 233,602 / 139,659 / 93,943 | 10-K |
| "Two thirds of what all the devices made" / "≈ 2/3" | 93,943 / 139,659 = 0.673 | our calculation |
| "Apps, iCloud, ads, AppleCare" | 10-K Services: advertising, AppleCare, cloud services, digital content (App Store), payment services | 10-K Item 1 |

## Simplifications and debated points
- **Not one iPhone.** Apple does not disclose the cost or margin of a single iPhone. Every per-$1,000 figure is the
  average of ALL Apple devices (iPhone, Mac, iPad, wearables) in fiscal 2026. The voice says "Apple devices" and the
  screen says "all devices" / "iPhone alone: not disclosed". iPhone = 53 % of total net sales (254,098 / 478,834).
- **"Left after costs" = gross margin**, before R&D ($45.8B) and SG&A ($29.8B), which Apple does not split between
  products and services. It is not profit per device. Pinned comment says so.
- **"Built" / "cost of making them"** = Products cost of sales (materials, manufacturing, shipping, warranty and
  similar costs as defined by Apple), not only the factory bill of materials.
- **FY2026 products margin was helped by tariff refunds** (10-K: increase "due primarily to … product mix and tariff
  refunds", partly offset by higher costs incl. memory). FY2025 products margin was 36.8 %. Mentioned in the pinned comment.
- **Services revenue for the App Store is Apple's commission** (net), so "$76 left" is on Apple's own services revenue,
  not on what users spend in apps.
- "Ads" includes licensing (e.g. search-engine default payments) inside Apple's advertising category; not named on screen.
- One secondary source (sec-api.io, Aug 2026, partial year) gave a different services share of gross profit (39.1 %);
  the full-year 10-K figures above give 40.2 %.
- "Storefront" is our framing; Apple describes Services as a separate category. The video shows the numbers behind it.

## Pinned comment
Every number is from Apple's fiscal 2026 annual report (year ended 26 Sep 2026). "Left after costs" = gross margin:
39.3 % on devices, 76.2 % on services. Apple doesn't disclose the iPhone on its own, so the $1,000 is the average of
all Apple devices (our calculation). Services = 26 % of sales but 40 % of gross profit (our calculation: $93.9B of
$233.6B). Before R&D and other expenses. Device margin was helped by tariff refunds this year (36.8 % in FY2025).
Not financial advice. Phone drawn in code, no logo.

## Verification status
SEC and investor-relations sites are blocked from the cloud session. Figures taken from search results quoting the
10-K (gross margin table) and the Q4 FY2026 earnings release (statement of operations); every subtotal above
reproduces exactly. **Owner: tick the 9 lines of the first table against the 10-K before posting.**

## References
- Apple Form 10-K FY2026: https://www.sec.gov/Archives/edgar/data/0000320193/000032019326000026/aapl-20260926.htm
- Apple Q4 FY2026 results (8-K exhibit 99.1): https://www.sec.gov/Archives/edgar/data/0000320193/000032019326000024/a8-kex991q4202609262026.htm
- 10-K PDF (Apple IR): https://s2.q4cdn.com/470004039/files/doc_earnings/2026/q4/filing/10K-Q4-2026-as-filed.pdf

## Rights
No logo, no Apple trade dress: the phone is a generic slab drawn in code (`Phone` in `src/money/props3d.tsx`).
"Apple", "iPhone", "iCloud", "AppleCare" as words only.
