// public/data/alaska1867.geojson — sources: us-atlas@3 (US Census, public domain), world-atlas land (Natural Earth, PD).
// 1867 accuracy: modern national borders are NOT drawn (they'd be anachronistic in Eurasia/Canada); only:
//  - LAND: all land, no borders
//  - USA48: outer border of the contiguous US (unchanged since the 1853 Gadsden Purchase)
//  - ALASKA: modern state outline. Its eastern border follows the 1825 Anglo-Russian convention; the
//    panhandle line was disputed with Britain/Canada until the 1903 Alaska Boundary Tribunal.
//  - TEXAS_GHOST: Texas rotated on the sphere onto Alaska's centroid (true size comparison).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature, merge } from 'topojson-client';
import { geoCentroid, geoRotation } from 'd3-geo';
const require = createRequire(import.meta.url);
const us = require('us-atlas/states-10m.json');
const land = require('world-atlas/land-50m.json');
const states = us.objects.states.geometries;
const out = [];
out.push({ type: 'Feature', id: 'LAND', properties: { name: 'land' }, geometry: feature(land, land.objects.land).features?.[0]?.geometry ?? feature(land, land.objects.land).geometry });
out.push({ type: 'Feature', id: 'USA48', properties: { name: 'United States' },
  geometry: merge(us, states.filter((g) => !['Alaska', 'Hawaii'].includes(g.properties.name) && +g.id < 60)) });
const ak = feature(us, states.find((g) => g.properties.name === 'Alaska'));
out.push({ type: 'Feature', id: 'ALASKA', properties: { name: 'Alaska', focus: true, label: [-152, 64.5] }, geometry: ak.geometry });
out.push({ type: 'Feature', id: 'FOCUS_OUTLINE', properties: { name: 'Alaska' }, geometry: ak.geometry });
// Texas moved (rigid rotation on the sphere => same true area & shape) onto Alaska's centroid
const tx = feature(us, states.find((g) => g.properties.name === 'Texas'));
const A = geoCentroid(tx), B = [-151, 63.5];
const r1 = geoRotation([-A[0], -A[1]]), r2 = geoRotation([-B[0], -B[1]]);
const mv = (p) => r2.invert(r1(p));
const mapCoords = (c) => (typeof c[0] === 'number' ? mv(c) : c.map(mapCoords));
out.push({ type: 'Feature', id: 'TEXAS_GHOST', properties: { name: 'Texas', ghost: true, label: B }, geometry: { type: tx.geometry.type, coordinates: mapCoords(tx.geometry.coordinates) } });
fs.writeFileSync('public/data/alaska1867.geojson', JSON.stringify({ type: 'FeatureCollection', source: 'us-atlas@3 (Census, PD) + Natural Earth land 1:50m (PD)', features: out }));
console.log('wrote', out.map((f) => f.id).join(', '));
