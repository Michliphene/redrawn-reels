// PRICED IN HOURS ep.1 — groceries in minutes of work, Sep 1984 vs Sep 2026.
// Usage: node scripts/prep-pih-groceries.mjs [--offline]
// Fetches FRED series (CSV endpoint, no key) into data/fred/ (falls back to the committed copy),
// computes every number shown or spoken, ASSERTS the script's claims, writes public/data/pih-groceries.json.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const OFFLINE = process.argv.includes('--offline');
const SERIES = {
  wage: 'AHETPI', // avg hourly earnings, production & nonsupervisory employees, total private ($/h, SA)
  cheddar: 'APU0000710212', chicken: 'APU0000706111', eggs: 'APU0000708111',
  bread: 'APU0000702111', gas: 'APU000074714', beef: 'APU0000703112',
  food: 'CUUR0000SAF11', // CPI-U food at home (NSA)
};
const load = (id) => {
  const p = `data/fred/${id}.csv`;
  if (!OFFLINE) {
    try {
      const txt = execFileSync('curl', ['-sS', '--fail', '--http1.1', '--connect-timeout', '10', '--max-time', '25',
        `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`]).toString();
      if (txt.startsWith('observation_date') || txt.startsWith('DATE')) fs.writeFileSync(p, txt);
    } catch { console.warn(`! ${id}: FRED unreachable, using committed copy`); }
  }
  const m = new Map();
  for (const l of fs.readFileSync(p, 'utf8').trim().split('\n').slice(1)) {
    const [d, v] = l.split(','); if (v && v !== '.' && !isNaN(+v)) m.set(d, +v);
  }
  return m;
};
const S = Object.fromEntries(Object.entries(SERIES).map(([k, id]) => [k, load(id)]));
const BASE = '1984-09-01';
const NOW = [...S.wage.keys()].filter((d) => Object.values(S).every((s) => s.has(d))).at(-1);
const NOW_Y = +NOW.slice(0, 4);
const min = (item, d) => (S[item].get(d) / S.wage.get(d)) * 60;
const sept = (item, from, to) => {
  const pts = [];
  for (let y = from; y <= to; y++) { const d = `${y}-09-01`; if (S[item].has(d) && S.wage.has(d)) pts.push([y, +min(item, d).toFixed(3)]); }
  return pts;
};

// ---------- numbers ----------
const items = [
  { k: 'cheddar', label: 'Cheddar', unit: 'per lb', emoji: 'cheese_wedge' },
  { k: 'chicken', label: 'Chicken', unit: 'whole, per lb', emoji: 'poultry_leg' },
  { k: 'eggs', label: 'Eggs', unit: 'a dozen', emoji: 'egg' },
  { k: 'bread', label: 'Bread', unit: 'white, per lb', emoji: 'bread' },
  { k: 'gas', label: 'Gas', unit: 'per gallon', emoji: 'fuel_pump' },
  { k: 'beef', label: 'Ground beef', unit: 'per lb', emoji: 'cut_of_meat' },
].map((it) => ({ ...it, then: +min(it.k, BASE).toFixed(3), now: +min(it.k, NOW).toFixed(3),
  priceThen: S[it.k].get(BASE), priceNow: S[it.k].get(NOW) }));
const I = Object.fromEntries(items.map((i) => [i.k, i]));
const beef = sept('beef', 1984, NOW_Y), chicken = sept('chicken', 1984, NOW_Y);
const beefLow = beef.reduce((a, b) => (b[1] < a[1] ? b : a));
const eggMonths = [...S.eggs.keys()].filter((d) => S.wage.has(d)).map((d) => [d, min('eggs', d)]);
const eggPeak = eggMonths.reduce((a, b) => (b[1] > a[1] ? b : a));
const base = S.food.get(BASE) / S.wage.get(BASE);
const basket = [];
for (let y = 1984; y <= NOW_Y; y++) {
  const d = `${y}-09-01`;
  if (S.food.has(d) && S.wage.has(d)) basket.push([y, +((S.food.get(d) / S.wage.get(d) / base - 1) * 100).toFixed(2)]);
}
const at = (pts, x) => pts.find((p) => p[0] === x)[1];
const basketPeak = basket.reduce((a, b) => (b[1] > a[1] ? b : a));
const basketNow = basket.at(-1)[1];

// ---------- assertions: the script in episode.json is only valid if all of these hold ----------
const errs = [];
const near = (v, target, tol, what) => { if (Math.abs(v - target) > tol) errs.push(`${what}: ${v.toFixed(3)} (script ~${target})`); };
const ok = (c, what) => { if (!c) errs.push(what); };
ok(NOW === '2026-09-01', `latest common month is ${NOW}: update the script dates`);
near(S.wage.get(BASE), 8.55, 0.001, 'wage 1984'); near(S.wage.get(NOW), 32.63, 0.001, 'wage now');
near(I.cheddar.then, 21.5, 0.05, 'cheddar then'); near(I.cheddar.now, 11.3, 0.05, 'cheddar now');
near(I.chicken.then, 5.5, 0.05, 'chicken then'); ok(I.chicken.now < 4, 'chicken now < 4');
near(I.eggs.then, 6, 0.05, 'eggs then'); near(I.eggs.now, 4.2, 0.05, 'eggs now');
ok(eggPeak[0] === '2025-03-01', `egg peak month ${eggPeak[0]}`); near(eggPeak[1], 12, 0.1, 'egg peak minutes');
ok(I.bread.now < I.bread.then, 'bread cheaper');
near(I.gas.then, 8.4, 0.05, 'gas then'); near(I.gas.now, 8.2, 0.05, 'gas now');
near(I.beef.then, 8.9, 0.05, 'beef then'); near(I.beef.now, 12.5, 0.05, 'beef now');
near(I.beef.now / I.beef.then - 1, 0.40, 0.01, 'beef +40%');
ok(beefLow[0] === 1998, `beef low year ${beefLow[0]}`); near(beefLow[1], 6.2, 0.05, 'beef low ~6');
near(I.beef.now / beefLow[1], 2, 0.05, 'beef doubled since 1998');
ok(at(chicken, 1998) > I.chicken.now, 'chicken cheaper since 1998');
ok(basketPeak[0] === 1990, `basket peak year ${basketPeak[0]}`); near(basketPeak[1], 7, 0.5, 'basket 1990 +7%');
near(at(basket, 2004), -2, 0.5, 'basket 2004 -2%');
ok(at(basket, 2014) - basketNow > 0.75 * -basketNow, 'most of the drop after 2014');
near(at(basket, 2014), -3, 0.5, 'basket 2014 still only ~3% less');
near(basketNow, -18, 0.5, 'basket now -18%');
if (errs.length) { console.error('ASSERTIONS FAILED\n- ' + errs.join('\n- ')); process.exit(1); }

const month = (d) => new Date(d + 'T00:00:00Z').toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const out = {
  base: BASE, now: NOW, baseLabel: month(BASE), nowLabel: month(NOW),
  wage: { then: S.wage.get(BASE), now: S.wage.get(NOW) },
  charts: {
    board: { type: 'thenNow', title: 'Minutes of work to buy it', legend: [month(BASE), month(NOW)], suffix: ' min', decimals: 1,
      items: items.map(({ k, label, unit, emoji, then, now }) => ({ k, label, unit, emoji, then, now })) },
    beef: { type: 'line', title: 'Ground beef vs. chicken: minutes of work per lb', suffix: ' min', decimals: 1, yMin: 0, yMax: 16, xFrom: 1984, xTo: NOW_Y,
      series: [{ k: 'beef', label: 'Ground beef', color: '#FF5A4E', emoji: 'cut_of_meat', points: beef },
               { k: 'chicken', label: 'Chicken', color: '#3DDC84', emoji: 'poultry_leg', points: chicken }] },
    basket: { type: 'line', title: 'Work time to buy the US grocery cart, vs. 1984', suffix: '%', decimals: 0, signed: true, yMin: -20, yMax: 20, xFrom: 1984, xTo: NOW_Y,
      refY: 0, refLabel: '1984 level',
      series: [{ k: 'basket', label: 'Groceries', color: '#FFC94D', emoji: 'shopping_cart', points: basket }] },
  },
  facts: { eggPeak: { month: eggPeak[0], minutes: +eggPeak[1].toFixed(2), price: S.eggs.get(eggPeak[0]), wage: S.wage.get(eggPeak[0]) },
    beefLow: { year: beefLow[0], minutes: beefLow[1] }, basketPeak: { year: basketPeak[0], pct: basketPeak[1] },
    basket2004: at(basket, 2004), basket2014: at(basket, 2014), basketNow },
};
fs.writeFileSync('public/data/pih-groceries.json', JSON.stringify(out, null, 1));
console.log(`wage ${out.wage.then} -> ${out.wage.now} (${BASE} -> ${NOW})`);
console.table(items.map((i) => ({ item: i.label, then: i.then.toFixed(2), now: i.now.toFixed(2), delta: `${((i.now / i.then - 1) * 100).toFixed(1)}%` })));
console.log(JSON.stringify(out.facts));
console.log('all assertions OK -> public/data/pih-groceries.json');
