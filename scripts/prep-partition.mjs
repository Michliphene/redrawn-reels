// Builds public/data/partition1947.geojson for `partition-1947` (REDRAWN topic #12).
// Natural Earth 1:50m admin-0 (public domain) via world-atlas@2.0.2 (NE v4.1.0).
//
// Pieces (focus):
//   IND      India minus the former princely state of Jammu & Kashmir (see KASHMIR_CUT)
//   PAK_W    West Pakistan  = NE Pakistan minus its part of the former princely state
//   PAK_E    East Pakistan  = NE Bangladesh (East Bengal + Sylhet), shown green 1947–1971
//   BGD      Bangladesh     = same outline, hidden until 1971 (revealed when PAK_E sinks)
//   KASHMIR  Jammu & Kashmir: the parts of the former princely state that NE gives to India and Pakistan,
//            merged, never coloured for either side: DISPUTED (status since Oct 1947; no internationally agreed border).
//            Aksai Chin / Shaksgam (administered by China, claimed by India) stay in China's scenery piece: they are not
//            part of this story; said in SOURCES.md.
//   FOCUS_OUTLINE  British India 1947 ≈ India ∪ Pakistan ∪ Bangladesh (Burma separated in 1937; Nepal, Bhutan and
//            Ceylon were never part of it; Portuguese Goa and French Pondicherry are too small to show).
// Ghost lines:
//   RADCLIFFE  the Punjab part (NE India–Pakistan border between 29.9°N and 32.6°N) and the whole India–Bangladesh
//              border (Bengal + Sylhet awards). NE draws today's line: later enclave exchanges (2015) are invisible at
//              this scale.
// KASHMIR_CUT is a hand-made approximate outline of the princely state's southern and western edges
// (Jammu/Punjab, Ladakh/Himachal, Azad Kashmir & Gilgit-Baltistan / Khyber Pakhtunkhwa); precision ≈ 10–20 km.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature, merge, mesh } from 'topojson-client';
import * as turf from '@turf/turf';
const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-50m.json');
const geoms = topo.objects.countries.geometries;
const fc = feature(topo, topo.objects.countries);
const byId = (id) => fc.features.find((f) => f.id === id);
const IND = '356', PAK = '586', BGD = '050';

const KASHMIR_CUT = turf.polygon([[
  [74.6, 32.45], [75.35, 32.25], [75.65, 32.35], [75.95, 32.65], [76.35, 32.85], [76.8, 33.2], [77.3, 32.85],
  [77.9, 32.7], [78.4, 32.5], [79.6, 32.3], [81.0, 33.0], [81.0, 37.6], [74.6, 37.4], [73.0, 36.95], [72.45, 36.4],
  [72.4, 35.9], [73.1, 35.4], [73.65, 34.95], [73.33, 34.5], [73.42, 34.1], [73.45, 33.6], [73.65, 33.1], [74.05, 32.85],
  [74.6, 32.45],
]]);
const ind0 = byId(IND), pak0 = byId(PAK), bgd = byId(BGD);
const cut = (f) => turf.difference(turf.featureCollection([f, KASHMIR_CUT]));
const part = (f) => turf.intersect(turf.featureCollection([f, KASHMIR_CUT]));
const ind = cut(ind0), pakW = cut(pak0);
const kashmir = turf.union(turf.featureCollection([part(ind0), part(pak0)]));

const d3 = (f) => turf.rewind(f, { reverse: true }).geometry;
const out = [];
for (const f of fc.features) {
  if ([IND, PAK, BGD].includes(f.id)) continue;
  const b = turf.bbox(f);
  if (b[2] < 40 || b[0] > 120 || b[3] < -12 || b[1] > 60) continue;
  out.push({ type: 'Feature', id: `X${f.id ?? f.properties.name.replace(/\W/g, '')}`, properties: { name: f.properties.name }, geometry: f.geometry });
}
const SUBJECT = [
  ['IND', 'India', ind, [78.6, 22.0], false],
  ['PAK_W', 'Pakistan', pakW, [69.0, 29.0], false],
  ['PAK_E', 'East Pakistan', bgd, [90.2, 23.9], false],
  ['BGD', 'Bangladesh', bgd, [90.2, 23.9], true],
  ['KASHMIR', 'Kashmir (disputed)', kashmir, [75.6, 34.6], false],
];
for (const [id, name, f, label, hidden] of SUBJECT) out.push({ type: 'Feature', id, properties: { name, label, focus: true, ...(hidden ? { hidden: true } : {}), ...(id === 'PAK_E' ? { noAllLabel: true } : {}) }, geometry: d3(f) });
out.push({ type: 'Feature', id: 'FOCUS_OUTLINE', properties: { name: 'British India (1947)' }, geometry: merge(topo, geoms.filter((g) => [IND, PAK, BGD].includes(g.id))) });

// Radcliffe line(s): shared borders from the topology
const shared = (a, b) => mesh(topo, topo.objects.countries, (x, y) => (x.id === a && y.id === b) || (x.id === b && y.id === a));
const punjab = turf.bboxClip(turf.feature(shared(IND, PAK)), [60, 29.9, 90, 32.6]).geometry;
const bengal = shared(IND, BGD);
const lines = [...(punjab.type === 'LineString' ? [punjab.coordinates] : punjab.coordinates), ...bengal.coordinates].filter((l) => l.length > 1);
out.push({ type: 'Feature', id: 'RADCLIFFE', properties: { name: 'Radcliffe Line', ghost: true, lines: true }, geometry: { type: 'MultiLineString', coordinates: lines } });

fs.writeFileSync('public/data/partition1947.geojson', JSON.stringify({
  type: 'FeatureCollection',
  source: 'Natural Earth 1:50m admin-0 v4.1.0 (public domain) via world-atlas@2.0.2',
  provenance: ['Kashmir = parts of the former princely state administered by India and Pakistan (approximate cut), shown as DISPUTED; Aksai Chin left in China scenery.'],
  features: out,
}));

const where = (pt) => SUBJECT.filter(([id, , f]) => !['BGD'].includes(id) && turf.booleanPointInPolygon(pt, f)).map(([id]) => id).join(',') || '-';
console.log(`wrote ${out.length} features; Radcliffe segments: ${lines.length}`);
for (const [n, p] of Object.entries({ Srinagar: [74.8, 34.08], Jammu: [74.86, 32.73], Leh: [77.58, 34.15], Muzaffarabad: [73.47, 34.37], Gilgit: [74.31, 35.92],
  Pathankot: [75.65, 32.27], Manali: [77.19, 32.24], Islamabad: [73.05, 33.68], Chitral: [71.79, 35.85], Abbottabad: [73.21, 34.17], Mirpur: [73.75, 33.15], Lahore: [74.34, 31.55], Amritsar: [74.87, 31.63], Dhaka: [90.41, 23.81], Kolkata: [88.36, 22.57] }))
  console.log(n.padEnd(13), where(p));
const km = (a, b) => Math.round(turf.distance(a, b));
console.log('Lahore–Dhaka', km([74.34, 31.55], [90.41, 23.81]), 'km; closest wings (Punjab border 74.6E,31N → Bangladesh west border 88.9E,24.3N):', km([74.6, 31.0], [88.05, 24.3]), 'km');
