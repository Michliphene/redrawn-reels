// public/data/poland1945.geojson — Poland's 1945 westward shift.
// Sources: Poland 1938 from aourednik/historical-basemaps world_1938 (GPL-3.0, BORDERPRECISION 3 = legal borders,
// generalised), extracted into scripts/data/hb1938_poland.json; Poland today and land from Natural Earth 1:50m (PD)
// via world-atlas@2.0.2. Derived pieces (GPL-3.0 because they derive from historical-basemaps):
//  - CORE: land Polish both before and after 1945
//  - EAST: pre-war Poland east of the new border (to the USSR in 1945; today Ukraine, Belarus, Lithuania)
//  - WEST: land Poland gained in 1945 (former German territory east of the Oder–Neisse line, + Danzig)
// Slivers below 400 km² (the two sources' generalisations disagreeing along shared borders) are dropped.
// The post-1945 border is today's (a 1951 Polish–Soviet exchange of ~480 km² each way is below this detail).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoArea } from 'd3-geo';
import * as turf from '@turf/turf';
const require = createRequire(import.meta.url);
const world = require('world-atlas/countries-50m.json');
const landTopo = require('world-atlas/land-50m.json');
const countries = feature(world, world.objects.countries).features;
const R = 6371.0088, km2 = (g) => Math.round(geoArea(g) * R * R);
const OLD = JSON.parse(fs.readFileSync('scripts/data/hb1938_poland.json', 'utf8')).features[0];
const NEW = countries.find((f) => f.id === '616');
const fix = (g) => {
  if (!g) return null;
  const polys = (g.type === 'Polygon' ? [g.coordinates] : g.coordinates)
    .map((p) => p.map((ring) => (geoArea({ type: 'Polygon', coordinates: [ring] }) > 2 * Math.PI ? ring.slice().reverse() : ring)))
    .filter((p) => km2({ type: 'Polygon', coordinates: p }) >= 400);
  return polys.length ? { type: 'MultiPolygon', coordinates: polys } : null;
};
// turf works in RFC 7946 winding; d3 wants the opposite — rewind both inputs for turf, fix the outputs for d3
const T = (f) => turf.rewind(turf.feature(f.geometry), { reverse: false });
const core = fix(turf.intersect(turf.featureCollection([T(OLD), T(NEW)]))?.geometry);
const east = fix(turf.difference(turf.featureCollection([T(OLD), T(NEW)]))?.geometry);
const west = fix(turf.difference(turf.featureCollection([T(NEW), T(OLD)]))?.geometry);
const out = [];
const land = feature(landTopo, landTopo.objects.land);
out.push({ type: 'Feature', id: 'LAND', properties: { name: 'land' }, geometry: land.features?.[0]?.geometry ?? land.geometry });
out.push({ type: 'Feature', id: 'CORE', properties: { name: 'Poland', focus: true, label: [20.0, 52.0] }, geometry: core });
out.push({ type: 'Feature', id: 'EAST', properties: { name: 'Eastern Poland (pre-war)', focus: true, label: [26.0, 51.3] }, geometry: east });
out.push({ type: 'Feature', id: 'WEST', properties: { name: 'Former German east', focus: true, hidden: true, label: [16.3, 52.6] }, geometry: west });
// no FOCUS_OUTLINE: its dark footprint of today's Poland would show under the 1938 map
const A = { old1938: km2(fix(OLD.geometry)), today: km2(fix(NEW.geometry)), core: km2(core), east: km2(east), west: km2(west) };
fs.writeFileSync('public/data/poland1945.geojson', JSON.stringify({ type: 'FeatureCollection',
  source: 'historical-basemaps world_1938 (GPL-3.0) + Natural Earth 1:50m (PD); derived pieces GPL-3.0', areaKm2: A, features: out }));
console.log('areas km²', A, 'east/old', (A.east / A.old1938).toFixed(3), 'west/old', (A.west / A.old1938).toFixed(3), 'today/old', (A.today / A.old1938).toFixed(3));
