// Builds public/data/antarctica.geojson: Antarctica (Natural Earth 1:50m via world-atlas 2.0.2, public domain)
// cut into the claim sectors of the seven claimant states, plus the unclaimed sector.
// Sector limits (meridians) are the ones each state publishes; overlaps are their own pieces so that the
// board never stacks two slabs on the same ground:
//   NOR 20°W–44°38'E · AUS 44°38'E–136°11'E and 142°02'E–160°E · FRA 136°11'E–142°02'E · NZL 160°E–150°W
//   unclaimed 150°W–90°W · CHL 90°W–53°W · GBR 80°W–20°W · ARG 74°W–25°W
// Limits of the method (logged in SOURCES.md):
//  - the claims are cut from the NE coastline + ice shelves (claims formally run to the pole, and most to 60°S
//    at sea; the sea part is not drawn);
//  - Norway's claim historically had no defined inland limit (Norway's 2015 clarification: to the pole) — drawn
//    to the pole like the others;
//  - Peter I Island (Norway, inside the unclaimed sector) is too small for the 1:50m data and is not drawn.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoArea, geoBounds, geoCentroid, geoRotation } from 'd3-geo';
import * as turf from '@turf/turf';
const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-50m.json');
const fc = feature(topo, topo.objects.countries);
const ant = fc.features.find((f) => f.id === '010');
if (!ant) throw new Error('Antarctica not found');

const DMS = (d, m) => d + m / 60;
const E1 = DMS(44, 38), E2 = DMS(136, 11), E3 = DMS(142, 2);

// NE stores the mainland as a pole ring with the coastline as its "hole". For planar work, rebuild it as one
// lon/lat polygon: the coastline from -180 to 180, closed along the pole (y = -90).
const LAND = [];
for (const poly of ant.geometry.coordinates) {
  const poleRing = poly[0].every((q) => q[1] < -89.9);
  if (!poleRing) { LAND.push(poly); continue; }
  for (const coast of poly.slice(1)) {
    const r = coast.slice(0, -1);
    let k = r.findIndex((q, i) => Math.abs(r[(i + 1) % r.length][0] - q[0]) > 180);
    const ring = [...r.slice(k + 1), ...r.slice(0, k + 1)];
    const first = ring[0], last = ring[ring.length - 1];
    const e0 = first[0] < 0 ? -180 : 180, e1 = -e0;
    LAND.push([[ [e0, first[1]], ...ring, [e1, last[1]], [e1, -90], [e0, -90], [e0, first[1]] ]]);
  }
}
const landFeature = turf.feature({ type: 'MultiPolygon', coordinates: LAND });

// planar intersection in lon/lat space is exact for meridian-bounded sectors (meridians are straight lines there)
function sector(lonA, lonB) {
  const parts = [];
  const box = (a, b) => turf.bboxPolygon([a, -90, b, -55]);
  const ranges = lonA <= lonB ? [[lonA, lonB]] : [[lonA, 180], [-180, lonB]];
  for (const [a, b] of ranges) {
    const x = turf.intersect(turf.featureCollection([landFeature, box(a, b)]));
    if (!x) continue;
    if (x.geometry.type === 'Polygon') parts.push(x.geometry.coordinates);
    else parts.push(...x.geometry.coordinates);
  }
  // d3 wants clockwise exterior rings on the sphere: rewind any ring whose spherical area is > hemisphere
  const fixed = parts.map((poly) => poly.map((ring) => {
    const g = { type: 'Polygon', coordinates: [ring] };
    return geoArea(g) > 2 * Math.PI ? ring.slice().reverse() : ring;
  }));
  return { type: 'MultiPolygon', coordinates: fixed };
}
const sqkm = (g) => geoArea(g) * 6371.0088 ** 2;

// pieces: [id, name, lonA, lonB, label [lon, lat]]
const PIECES = [
  ['NOR', 'Norway', -20, E1, [12, -75]],
  ['AUS', 'Australia', E1, E2, [95, -74]],
  ['FRA', 'France', E2, E3, [139, -68.8]],
  ['AUS2', 'Australia', E3, 160, [151, -73]],
  ['NZL', 'New Zealand', 160, -150, [-178, -80]],
  ['NONE', 'Unclaimed', -150, -90, [-118, -78]],
  ['CHL', 'Chile', -90, -80, [-85, -78]],
  ['CG', 'Chile + UK', -80, -74, [-77, -77]],
  ['TRI', 'Three claims', -74, -53, [-63, -73]],
  ['AG', 'Argentina + UK', -53, -25, [-40, -81]],
  ['GBR', 'United Kingdom', -25, -20, [-22.5, -80]],
];
const out = [];
const AREA = {};
for (const [id, name, a, b, label] of PIECES) {
  const geometry = sector(a, b);
  AREA[id] = Math.round(sqkm(geometry));
  out.push({ type: 'Feature', id, properties: { name, focus: true, label }, geometry });
}
// Australia's two sectors as one claim for the label; keep the two pieces (France sits between them)
const total = Math.round(sqkm(ant.geometry));
out.push({ type: 'Feature', id: 'FOCUS_OUTLINE', properties: { name: 'Antarctica' }, geometry: ant.geometry });

// Two copies of Texas (us-atlas, Census, PD), moved by a rigid rotation on the sphere (same true area and shape)
// onto the unclaimed sector, for the "more than twice the size of Texas" comparison.
const us = require('us-atlas/states-10m.json');
const tx = feature(us, us.objects.states.geometries.find((g) => g.properties.name === 'Texas'));
const TXC = geoCentroid(tx);
for (const [id, B] of [['TEXAS_A', [-122, -80.2]], ['TEXAS_B', [-108, -76.2]]]) {
  const r1 = geoRotation([-TXC[0], -TXC[1]]), r2 = geoRotation([-B[0], -B[1]]);
  const mv = (q) => r2.invert(r1(q));
  const mc = (c) => (typeof c[0] === 'number' ? mv(c) : c.map(mc));
  out.push({ type: 'Feature', id, properties: { name: 'Texas', ghost: true, label: B }, geometry: { type: tx.geometry.type, coordinates: mc(tx.geometry.coordinates) } });
}

// scenery: the southern tips of the continents that frame the table
for (const f of fc.features) {
  if (f.id === '010') continue;
  const b = geoBounds(f);
  if (b[0][1] > -28) continue;
  out.push({ type: 'Feature', id: `X${f.id ?? f.properties.name}`, properties: { name: f.properties.name }, geometry: f.geometry });
}

const claims = {
  GBR: AREA.GBR + AREA.CG + AREA.TRI + AREA.AG,
  ARG: AREA.TRI + AREA.AG,
  CHL: AREA.CHL + AREA.CG + AREA.TRI,
  NOR: AREA.NOR, AUS: AREA.AUS + AREA.AUS2, FRA: AREA.FRA, NZL: AREA.NZL, NONE: AREA.NONE,
};
fs.writeFileSync('public/data/antarctica.geojson', JSON.stringify({
  type: 'FeatureCollection',
  source: 'Natural Earth 1:50m admin-0 v4.1.0 (public domain) via world-atlas@2.0.2; sectors cut at the published claim meridians',
  provenance: ['Claims cut from NE land + ice-shelf polygon at published meridians (see SOURCES.md)', 'Overlaps are separate pieces: CG (CHL+GBR), TRI (ARG+CHL+GBR), AG (ARG+GBR)'],
  areaKm2: { total, pieces: AREA, claims },
  features: out,
}));
const TX = 695662; // Texas, km² (US Census)
console.log('pieces km²', AREA);
console.log('claims km²', claims, 'total', total);
console.log('unclaimed / Texas =', (AREA.NONE / TX).toFixed(2), ' unclaimed sq mi =', Math.round(AREA.NONE / 2.58999));
