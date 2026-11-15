// public/data/louisiana1803.geojson
// Sources: us-atlas@3 states (US Census, public domain) + Natural Earth land (PD).
// LOUISIANA: conventional depiction (as on NPS / National Atlas maps). The 1803 treaty defined NO borders;
// the lines below follow the later-settled limits: Mississippi (east), Isle of Orleans (Bayou Manchac + lakes),
// Sabine–Red–Arkansas rivers (1819 Adams–Onís line, SW), Rocky Mountains continental divide (W), 49th parallel (N, 1818).
// Hand-digitised river/divide vertices (simplified, ~10–40 km accuracy) — shown on screen as approximate.
// US1803: states east of the Mississippi, minus Spanish Florida (all of FL, and AL/MS/LA south of 31°N, Pinckney 1795).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature, mesh } from 'topojson-client';
import * as turf from '@turf/turf';
const require = createRequire(import.meta.url);
const us = require('us-atlas/states-10m.json');
const land = require('world-atlas/land-50m.json');
const S = feature(us, us.objects.states).features;
const st = (n) => S.find((f) => f.properties.name === n);
const unionAll = (fs_) => fs_.reduce((a, b) => (a ? turf.union(turf.featureCollection([a, b])) : b), null);

const WEST = ['Louisiana', 'Arkansas', 'Missouri', 'Iowa', 'Minnesota', 'North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 'Oklahoma', 'Colorado', 'Wyoming', 'Montana'];
// clip polygon (lon,lat), counter-clockwise doesn't matter for turf.intersect
const clip = turf.polygon([[
  [-114.6, 49.6], [-95.15, 49.6], [-95.2, 47.24], // NE: Lake of the Woods -> Mississippi source (Itasca)
  [-94.88, 47.47], [-94.3, 47.45], [-93.53, 47.23], [-93.7, 46.53], [-94.2, 46.36], [-94.16, 45.56], [-93.6, 45.2], [-93.26, 44.98], [-92.8, 44.75], // Mississippi in MN
  [-80, 44.75], [-80, 31.05], [-91.66, 31.05], // 31.05 avoids a sliver along the LA–MS 31°N line // east side open (eastern states not in WEST set); 31°N back to the river
  [-91.55, 30.95], [-91.3, 30.65], [-91.19, 30.45], [-90.95, 30.33], [-90.47, 30.28], [-90.1, 30.2], [-89.75, 30.17], [-89.6, 30.05], [-89.0, 29.8], [-89.0, 28.0], // river to Baton Rouge, Bayou Manchac, lakes, Rigolets
  [-100.0, 28.0], [-100.0, 37.75], // Gulf -> 100th meridian (Red River boundary comes from the OK/TX state line) -> Arkansas River
  [-100.9, 37.97], [-102.04, 38.05], [-103.54, 37.98], [-104.6, 38.27], [-105.24, 38.44], [-106.0, 38.53], [-106.3, 39.25], // Arkansas River to its source
  [-105.9, 40.4], [-106.7, 41.0], [-107.6, 41.6], [-108.5, 42.3], [-108.9, 42.4], [-109.7, 43.2], [-110.6, 44.4], [-111.05, 44.5], // continental divide CO/WY
  [-112.3, 44.53], [-113.45, 44.85], [-113.95, 45.69], [-112.6, 45.9], [-112.3, 46.6], [-112.6, 47.5], [-113.2, 48.25], [-113.95, 49.0], [-114.6, 49.6], // divide MT
]]);
const westUnion = unionAll(WEST.map(st));
const lp = turf.intersect(turf.featureCollection([westUnion, clip]));

const EAST = ['Maine', 'New Hampshire', 'Vermont', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New York', 'New Jersey', 'Pennsylvania', 'Delaware', 'Maryland', 'District of Columbia',
  'Virginia', 'West Virginia', 'North Carolina', 'South Carolina', 'Georgia', 'Alabama', 'Mississippi', 'Tennessee', 'Kentucky', 'Ohio', 'Indiana', 'Illinois', 'Michigan', 'Wisconsin', 'Minnesota', 'Louisiana'];
let east = unionAll(EAST.map(st).filter(Boolean));
east = turf.difference(turf.featureCollection([east, lp]));
// Spanish West Florida: south of 31°N between the Mississippi and the Perdido/Florida line (AL, MS, LA parishes)
const westFlorida = turf.polygon([[[-91.7, 31.0], [-87.6, 31.0], [-87.6, 28.5], [-91.7, 28.5], [-91.7, 31.0]]]);
east = turf.difference(turf.featureCollection([east, westFlorida]));
// d3-geo wants clockwise exterior rings (turf returns counter-clockwise)
const d3wind = (f) => turf.rewind(f, { reverse: true });
const out = [];
out.push({ type: 'Feature', id: 'LAND', properties: { name: 'land' }, geometry: feature(land, land.objects.land).geometry ?? feature(land, land.objects.land).features[0].geometry });
out.push({ type: 'Feature', id: 'US1803', properties: { name: 'United States (1803)' }, geometry: d3wind(east).geometry });
out.push({ type: 'Feature', id: 'LOUISIANA', properties: { name: 'Louisiana', focus: true, label: [-99, 42] }, geometry: d3wind(lp).geometry });
out.push({ type: 'Feature', id: 'FOCUS_OUTLINE', properties: { name: 'Louisiana' }, geometry: d3wind(lp).geometry });
// today's state borders inside the purchase (for the "15 states" beat) — lines only
const states = mesh(us, us.objects.states, (a, b) => a !== b);
out.push({ type: 'Feature', id: 'STATES_TODAY', properties: { name: 'states today', ghost: true, lines: true }, geometry: states });
fs.writeFileSync('public/data/louisiana1803.geojson', JSON.stringify({ type: 'FeatureCollection', source: 'us-atlas@3 (PD) + Natural Earth land (PD); purchase limits hand-digitised (approximate)', features: out }));
const sqmi = (f) => (turf.area(f) / 2.58999e6);
console.log('LP area sq mi ≈', Math.round(sqmi(lp)), ' US1803 area sq mi ≈', Math.round(sqmi(east)));
