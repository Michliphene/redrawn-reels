// Builds public/data/ussr1991.geojson from Natural Earth 1:50m (via world-atlas 2.0.2, NE v4.1.0).
// Natural Earth = public domain. Corrections applied for a 1991 depiction are listed in PROVENANCE below.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature, merge } from 'topojson-client';
import { geoContains, geoBounds } from 'd3-geo';
const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-50m.json');
const fc = feature(topo, topo.objects.countries);

// ISO 3166-1 numeric -> [code, English name] for the 15 Soviet republics
const SSR = {
  '643': ['RUS', 'Russia'], '804': ['UKR', 'Ukraine'], '112': ['BLR', 'Belarus'],
  '233': ['EST', 'Estonia'], '428': ['LVA', 'Latvia'], '440': ['LTU', 'Lithuania'],
  '498': ['MDA', 'Moldova'], '268': ['GEO', 'Georgia'], '051': ['ARM', 'Armenia'],
  '031': ['AZE', 'Azerbaijan'], '398': ['KAZ', 'Kazakhstan'], '860': ['UZB', 'Uzbekistan'],
  '795': ['TKM', 'Turkmenistan'], '417': ['KGZ', 'Kyrgyzstan'], '762': ['TJK', 'Tajikistan'],
};

const PROVENANCE = [];
const out = [];
for (const f of fc.features) {
  const b = geoBounds(f);
  // keep only the Eurasian/North-African window the camera can see
  const inWindow = b[1][0] > -25 && b[0][0] < 190 && b[1][1] > 5;
  if (!inWindow && !SSR[f.id]) continue;
  const ssr = SSR[f.id];
  out.push({
    type: 'Feature',
    id: ssr ? ssr[0] : `X${f.id ?? f.properties.name}`,
    properties: { name: ssr ? ssr[1] : f.properties.name, soviet: !!ssr },
    geometry: f.geometry,
  });
}

// FIX 1 — Crimea. NE 4.1 (de facto view) puts Crimea inside Russia. In 1991 Crimea was part of the
// Ukrainian SSR (transferred 1954), and it is internationally recognised as Ukraine (UNGA res. 68/262).
const rus = out.find((f) => f.id === 'RUS');
const ukr = out.find((f) => f.id === 'UKR');
const idx = rus.geometry.coordinates.findIndex((p) => geoContains({ type: 'Polygon', coordinates: p }, [34.1, 45.0]));
if (idx < 0) throw new Error('Crimea polygon not found');
const crimea = rus.geometry.coordinates.splice(idx, 1)[0];
if (ukr.geometry.type === 'Polygon') ukr.geometry = { type: 'MultiPolygon', coordinates: [ukr.geometry.coordinates] };
ukr.geometry.coordinates.push(crimea);
PROVENANCE.push('Crimea polygon moved from RUS to UKR (1991 status; UNGA 68/262).');

// Label anchors (hand-placed inside each republic, lon/lat) for readable labels
const LABEL = { RUS:[96,63], UKR:[31.5,49], BLR:[28,53.6], EST:[25.6,58.75], LVA:[25.4,56.85], LTU:[23.9,55.3],
  MDA:[28.5,47.3], GEO:[43.6,42.1], ARM:[44.9,40.25], AZE:[47.8,40.35], KAZ:[67,48.2], UZB:[63.8,41.6],
  TKM:[59,39.2], KGZ:[74.6,41.5], TJK:[71,38.7] };
for (const f of out) if (LABEL[f.id]) f.properties.label = LABEL[f.id];
// Outer outline of the USSR = union of the 15 republics (topology merge => no internal borders)
const outline = merge(topo, topo.objects.countries.geometries.filter((g) => SSR[g.id]));
out.push({ type: 'Feature', id: 'SOVIET_OUTLINE', properties: { name: 'USSR' }, geometry: outline });
fs.writeFileSync('public/data/ussr1991.geojson', JSON.stringify({
  type: 'FeatureCollection',
  source: 'Natural Earth 1:50m admin-0 v4.1.0 (public domain) via world-atlas@2.0.2',
  provenance: PROVENANCE,
  features: out,
}));
console.log(`wrote ${out.length} features;`, PROVENANCE);
