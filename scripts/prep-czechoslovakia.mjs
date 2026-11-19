// public/data/czechoslovakia1993.geojson — Natural Earth 1:50m admin-0 via world-atlas@2.0.2 (public domain).
// CZE and SVK as they are today; their shared border is the 1993 Czech–Slovak line (the old internal border of the
// federation, unchanged at the split; small exchanges of land in later border treaties are below 1:50m detail).
// FOCUS_OUTLINE = Czechoslovakia (topology merge of the two). Scenery: Europe window.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature, merge } from 'topojson-client';
import { geoBounds } from 'd3-geo';
const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-50m.json');
const fc = feature(topo, topo.objects.countries);
const FOCUS = { '203': ['CZE', 'Czechia', [15.3, 49.8]], '703': ['SVK', 'Slovakia', [19.6, 48.75]] };
const out = [];
for (const f of fc.features) {
  const b = geoBounds(f);
  const inWindow = b[1][0] > -12 && b[0][0] < 45 && b[1][1] > 34 && b[0][1] < 72;
  const fo = FOCUS[f.id];
  if (!inWindow && !fo) continue;
  out.push({ type: 'Feature', id: fo ? fo[0] : `X${f.id ?? f.properties.name}`,
    properties: fo ? { name: fo[1], focus: true, label: fo[2] } : { name: f.properties.name }, geometry: f.geometry });
}
out.push({ type: 'Feature', id: 'FOCUS_OUTLINE', properties: { name: 'Czechoslovakia' },
  geometry: merge(topo, topo.objects.countries.geometries.filter((g) => FOCUS[g.id])) });
fs.writeFileSync('public/data/czechoslovakia1993.geojson', JSON.stringify({ type: 'FeatureCollection', source: 'Natural Earth 1:50m admin-0 v4.1.0 (PD) via world-atlas@2.0.2', features: out }));
console.log('wrote', out.length, 'features');
