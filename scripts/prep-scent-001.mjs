// Builds public/data/scent-001-bottle.geojson for SILLAGE N°1 "What's inside your perfume" (pilot B, map format).
// Natural Earth 1:50m admin-0 v4.1.0 (public domain) via world-atlas@2.0.2. Present-day borders (the reel is set today).
// Corrections are listed in PROVENANCE and written into the file.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoCentroid } from 'd3-geo';
const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-50m.json');
const fc = feature(topo, topo.objects.countries);

// ISO 3166-1 numeric -> [id, English name, label anchor lon/lat]
const FOCUS = {
  '250': ['FRA', 'France', [2.4, 46.7]],
  '100': ['BGR', 'Bulgaria', [25.3, 42.75]],
  '792': ['TUR', 'Turkey', [34.5, 39.1]],
  '332': ['HTI', 'Haiti', [-72.7, 19.0]],
  '450': ['MDG', 'Madagascar', [46.7, -19.6]],
  '360': ['IDN', 'Indonesia', [116.5, -2.4]],
};
const PROVENANCE = [];
const out = [];
for (const f of fc.features) {
  if (f.properties.name === 'Antarctica') continue; // never on camera, and the projection tears it
  const hit = FOCUS[f.id];
  out.push({
    type: 'Feature',
    id: hit ? hit[0] : `X${f.id ?? f.properties.name}`,
    properties: { name: hit ? hit[1] : f.properties.name, ...(hit ? { focus: true, label: hit[2] } : {}) },
    geometry: f.geometry,
  });
}

// FIX 1 — France: keep metropolitan France + Corsica only. NE 50m puts French Guiana inside the France feature;
// it would stretch "fit FOCUS" to South America and is not part of the story (Grasse). Overseas parts become scenery.
const fra = out.find((f) => f.id === 'FRA');
if (fra.geometry.type !== 'MultiPolygon') throw new Error('France is expected as a MultiPolygon');
const keep = [], rest = [];
for (const poly of fra.geometry.coordinates) {
  const [lon, lat] = geoCentroid({ type: 'Polygon', coordinates: poly });
  (lon > -6 && lon < 10 && lat > 41 && lat < 52 ? keep : rest).push(poly);
}
fra.geometry.coordinates = keep;
if (rest.length) out.push({ type: 'Feature', id: 'XFRA_OVERSEAS', properties: { name: 'France (overseas)' }, geometry: { type: 'MultiPolygon', coordinates: rest } });
PROVENANCE.push(`France: ${rest.length} overseas polygon(s) (incl. French Guiana) split into scenery; metropolitan France + Corsica are the subject.`);

fs.writeFileSync('public/data/scent-001-bottle.geojson', JSON.stringify({
  type: 'FeatureCollection',
  source: 'Natural Earth 1:50m admin-0 v4.1.0 (public domain) via world-atlas@2.0.2',
  provenance: PROVENANCE,
  features: out,
}));
console.log(`scent-001-bottle.geojson: ${out.length} features, focus ${Object.values(FOCUS).map((x) => x[0]).join(' ')}`);
PROVENANCE.forEach((p) => console.log('  ' + p));
