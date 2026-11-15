// public/data/korea1945.geojson — Natural Earth 1:50m via world-atlas@2 (public domain).
// KOREA_N38 / KOREA_S38: the whole peninsula (NK ∪ SK as drawn by NE) split at exactly 38°N (1945 zones).
// DPRK / ROK: today's states; their shared border = the 1953 Military Demarcation Line (NE generalisation).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature, merge } from 'topojson-client';
import * as turf from '@turf/turf';
const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-50m.json');
const land = require('world-atlas/land-50m.json');
const geoms = topo.objects.countries.geometries;
const korea = { type: 'Feature', geometry: merge(topo, geoms.filter((g) => g.id === '408' || g.id === '410')), properties: {} };
const box = (s, n) => turf.polygon([[[123, s], [131, s], [131, n], [123, n], [123, s]]]);
const north = turf.intersect(turf.featureCollection([korea, box(38, 44)]));
const south = turf.intersect(turf.featureCollection([korea, box(33, 38)]));
const fc = feature(topo, topo.objects.countries);
const dprk = fc.features.find((f) => f.id === '408'), rok = fc.features.find((f) => f.id === '410');
const d3wind = (f) => turf.rewind(f, { reverse: true });
const out = [
  { type: 'Feature', id: 'LAND', properties: { name: 'land' }, geometry: feature(land, land.objects.land).geometry ?? feature(land, land.objects.land).features[0].geometry },
  { type: 'Feature', id: 'KOREA_N38', properties: { name: 'North of 38°N', focus: true, label: [127.0, 40.3] }, geometry: d3wind(north).geometry },
  { type: 'Feature', id: 'KOREA_S38', properties: { name: 'South of 38°N', focus: true, label: [127.8, 36.4] }, geometry: d3wind(south).geometry },
  { type: 'Feature', id: 'DPRK', properties: { name: 'North Korea', focus: true, hidden: true, label: [127.0, 40.3] }, geometry: dprk.geometry },
  { type: 'Feature', id: 'ROK', properties: { name: 'South Korea', focus: true, hidden: true, label: [127.8, 36.4] }, geometry: rok.geometry },
  { type: 'Feature', id: 'FOCUS_OUTLINE', properties: { name: 'Korea' }, geometry: korea.geometry },
];
fs.writeFileSync('public/data/korea1945.geojson', JSON.stringify({ type: 'FeatureCollection', source: 'Natural Earth 1:50m (public domain) via world-atlas@2', features: out }));
// how far the armistice line strays from 38°N (for SOURCES: Kaesong / Sokcho swap)
console.log('Kaesong in DPRK:', turf.booleanPointInPolygon([126.55, 37.97], dprk), ' Sokcho in ROK:', turf.booleanPointInPolygon([128.59, 38.21], rok));
