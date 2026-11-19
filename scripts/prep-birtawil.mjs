// public/data/birtawil.geojson — the land no country claims (Egypt–Sudan border).
// Sources (public domain): Natural Earth 1:50m admin-0 via world-atlas@2.0.2 for the countries (NE draws the 1899 line,
// 22°N); Natural Earth 10m admin_0_disputed_areas for Bir Tawil and the Halaib (Halayib) Triangle, extracted into
// scripts/data/ne10m_bir_tawil_halaib.json.
//  - BIRT: Bir Tawil (south of 22°N; Egyptian under the 1902 line, Sudanese under the 1899 line → claimed by neither)
//  - HALAIB: Halaib Triangle (north of 22°N; Egyptian under 1899, Sudanese under 1902 → claimed by both; run by Egypt)
//  - L1899: the 22nd parallel; L1902: the administrative line = the non-22°N edges of the two areas.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoArea, geoBounds } from 'd3-geo';
const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-50m.json');
const fc = feature(topo, topo.objects.countries);
const dis = JSON.parse(fs.readFileSync('scripts/data/ne10m_bir_tawil_halaib.json', 'utf8'));
const R = 6371.0088, km2 = (g) => Math.round(geoArea(g) * R * R);
const clockwise = (g) => {
  const fix = (ring) => (geoArea({ type: 'Polygon', coordinates: [ring] }) > 2 * Math.PI ? ring.slice().reverse() : ring);
  return g.type === 'Polygon' ? { type: 'Polygon', coordinates: g.coordinates.map(fix) } : { type: 'MultiPolygon', coordinates: g.coordinates.map((p) => p.map(fix)) };
};
const bt = clockwise(dis.features.find((f) => f.properties.name === 'Bir Tawil').geometry);
const hl = clockwise(dis.features.find((f) => f.properties.name === 'Halayib Triangle').geometry);
const out = [];
const COUNTRY = { '818': ['EGY', 'Egypt'], '729': ['SDN', 'Sudan'] };
for (const f of fc.features) {
  const b = geoBounds(f);
  if (!(b[1][0] > 15 && b[0][0] < 50 && b[1][1] > 5 && b[0][1] < 38)) continue;
  const c = COUNTRY[f.id];
  out.push({ type: 'Feature', id: c ? c[0] : `X${f.id ?? f.properties.name}`, properties: { name: c ? c[1] : f.properties.name }, geometry: f.geometry });
}
out.push({ type: 'Feature', id: 'BIRT', properties: { name: 'Bir Tawil', focus: true, label: [33.75, 21.87] }, geometry: bt });
out.push({ type: 'Feature', id: 'HALAIB', properties: { name: 'Halaib Triangle', focus: true, label: [35.6, 22.35] }, geometry: hl });
out.push({ type: 'Feature', id: 'FOCUS_OUTLINE', properties: { name: 'Bir Tawil' }, geometry: bt });
// the two lines
const par = []; for (let x = 31.43; x <= 36.88; x += 0.25) par.push([+x.toFixed(2), 22]);
const edge = (g, keep) => {
  const rings = g.type === 'Polygon' ? [g.coordinates[0]] : g.coordinates.map((p) => p[0]);
  const r = rings.sort((a, b) => b.length - a.length)[0];
  // longest contiguous run of kept points, in ring order (the ring is rotated so a run never wraps)
  const ring = r.slice(0, -1); const k0 = ring.findIndex((p) => !keep(p[1]));
  const rot = [...ring.slice(k0), ...ring.slice(0, k0)];
  let best = [], cur = [];
  for (const p of rot) { if (keep(p[1])) cur.push(p); else { if (cur.length > best.length) best = cur; cur = []; } }
  if (cur.length > best.length) best = cur;
  return best;
};
const btEdge = edge(bt, (y) => y < 21.995);
const hlEdge = edge(hl, (y) => y > 22.005);
out.push({ type: 'Feature', id: 'L1899', properties: { name: '1899 line', ghost: true, lines: true }, geometry: { type: 'LineString', coordinates: par } });
out.push({ type: 'Feature', id: 'L1902', properties: { name: '1902 line', ghost: true, lines: true }, geometry: { type: 'MultiLineString', coordinates: [btEdge, hlEdge] } });
const A = { birTawil: km2(bt), halaib: km2(hl) };
fs.writeFileSync('public/data/birtawil.geojson', JSON.stringify({ type: 'FeatureCollection', source: 'Natural Earth 1:50m admin-0 + 10m disputed areas (PD)', areaKm2: A,
  lines: { L1899: par, L1902_birTawil: btEdge, L1902_halaib: hlEdge }, features: out }));
console.log('areas km²', A, 'ratio', (A.halaib / A.birTawil).toFixed(1), 'BT sq mi', Math.round(A.birTawil / 2.58999), 'HL sq mi', Math.round(A.halaib / 2.58999));
console.log('edges', btEdge.length, hlEdge.length, JSON.stringify(btEdge.slice(0,3)), JSON.stringify(hlEdge.slice(-3)));
