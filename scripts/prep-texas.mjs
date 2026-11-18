// Builds public/data/texas1836.geojson for REDRAWN "Texas could split into five states".
// Sources: us-atlas@3 states-10m (US Census, public domain), world-atlas 50m countries (Natural Earth, PD).
//  - TX: today's Texas (focus).
//  - CLAIM: the Republic of Texas claim beyond today's Texas, per the Boundary Act of 19 Dec 1836 (Rio Grande to its
//    source, due north to 42°N, then the 1819 Adams–Onís line: west along 42°N… back down the Arkansas River to 100°W,
//    down 100°W to the Red River). APPROXIMATE: the Rio Grande and the Arkansas are drawn through a dozen known
//    points each (towns on the rivers), not traced; shown with the label "approximate" on screen.
//  - SPLIT: four ILLUSTRATIVE lines dividing Texas in five (no official division exists) — labelled "illustration".
//  - scenery: lower-48 states, Mexico, Canada.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoArea, geoBounds, geoContains } from 'd3-geo';
const require = createRequire(import.meta.url);
const us = require('us-atlas/states-10m.json');
const world = require('world-atlas/countries-50m.json');
const states = feature(us, us.objects.states).features;
const countries = feature(world, world.objects.countries).features;
const R = 6371.0088;
const km2 = (g) => geoArea(g) * R * R;
const clockwise = (ring) => (geoArea({ type: 'Polygon', coordinates: [ring] }) > 2 * Math.PI ? ring.slice().reverse() : ring);

const tx = states.find((f) => f.properties.name === 'Texas');
const out = [];
out.push({ type: 'Feature', id: 'TX', properties: { name: 'Texas', focus: true, label: [-99.3, 31.3] }, geometry: tx.geometry });

// Rio Grande (El Paso → source) and Arkansas (source → 100°W), through towns on each river
const RIO = [[-106.53, 31.78], [-106.78, 32.31], [-107.15, 32.9], [-106.89, 34.06], [-106.75, 34.66], [-106.65, 35.08], [-106.52, 35.5], [-106.08, 35.99], [-105.75, 36.55], [-105.85, 37.05], [-105.87, 37.47], [-106.35, 37.68], [-106.93, 37.84], [-107.55, 37.79]];
const ARK = [[-106.3, 39.25], [-106.1, 38.85], [-106.0, 38.53], [-105.24, 38.44], [-104.6, 38.27], [-103.54, 38.0], [-102.62, 38.09], [-101.75, 37.99], [-100.87, 37.97], [-100.0, 37.75]];
const ring = [
  [-106.62, 32.0], ...RIO.slice(1), [-107.55, 42.0], [-106.3, 42.0], ...ARK,
  [-100.0, 36.5], [-103.0, 36.5], [-103.0, 32.0], [-106.62, 32.0],
];
const claim = { type: 'Polygon', coordinates: [clockwise(ring)] };
out.push({ type: 'Feature', id: 'CLAIM', properties: { name: 'Claimed by the Republic of Texas', focus: true, hidden: true, label: [-105.2, 37.0] }, geometry: claim });
out.push({ type: 'Feature', id: 'FOCUS_OUTLINE', properties: { name: 'Texas' }, geometry: tx.geometry });

// four illustrative split lines, kept only where they run inside Texas
const inside = (p) => geoContains(tx, p);
const clip = (a, b) => {
  const runs = []; let cur = [];
  const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.03);
  for (let i = 0; i <= n; i++) {
    const p = [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n];
    if (inside(p)) cur.push(p); else if (cur.length) { runs.push(cur); cur = []; }
  }
  if (cur.length) runs.push(cur);
  return runs.filter((r) => r.length > 1);
};
const SPLIT = [
  ...clip([-101.6, 37], [-101.6, 28]),
  ...clip([-97.9, 34.5], [-97.9, 25.5]),
  ...clip([-101.6, 31.4], [-97.9, 31.4]),
  ...clip([-97.9, 31.0], [-93.4, 31.0]),
];
out.push({ type: 'Feature', id: 'SPLIT', properties: { name: 'Five Texases (illustration)', ghost: true, lines: true, label: [-99.3, 31.3] }, geometry: { type: 'MultiLineString', coordinates: SPLIT } });

// scenery
for (const f of states) {
  if (f.properties.name === 'Texas') continue;
  const b = geoBounds(f); if (b[0][0] < -126 || b[0][1] < 24) continue; // lower 48 only
  out.push({ type: 'Feature', id: `S${f.id}`, properties: { name: f.properties.name }, geometry: f.geometry });
}
for (const [id, name] of [['484', 'Mexico'], ['124', 'Canada']]) {
  const f = countries.find((c) => c.id === id);
  out.push({ type: 'Feature', id: `X${id}`, properties: { name }, geometry: f.geometry });
}

const A = { texas: Math.round(km2(tx.geometry)), claim: Math.round(km2(claim)) };
fs.writeFileSync('public/data/texas1836.geojson', JSON.stringify({
  type: 'FeatureCollection',
  source: 'us-atlas@3 (US Census, PD) + Natural Earth 1:50m (PD); 1836 claim drawn from the Boundary Act through river towns (approximate)',
  areaKm2: A,
  features: out,
}));
console.log('areas km²', A, 'republic total', A.texas + A.claim, 'sq mi', Math.round((A.texas + A.claim) / 2.58999), 'claim sq mi', Math.round(A.claim / 2.58999));
