// public/data/getaway-002-antwerp.geojson — western Europe of Feb 2003, country scale, Belgium as the subject.
// Source: world-atlas@2 countries-50m (Natural Earth 1:50m, public domain). Borders unchanged since 2003; nothing contested.
// WOODS is NOT a measured place: a deliberately broad ellipse over the E19 corridor between Antwerp and Brussels
// (Mechelen – Vilvoorde), the only location the sources give for the dumped rubbish ("near the E19 motorway between
// Antwerp and Brussels"). It is drawn translucent and always labelled APPROX. (SOURCES.md, debated point 6).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
const require = createRequire(import.meta.url);
const world = require('world-atlas/countries-50m.json');

const KEEP = { Belgium: ['BE', [4.65, 50.62], true], Netherlands: ['NL', [5.6, 52.2]], France: ['FR', [2.6, 47.2]], Germany: ['DE', [9.8, 51.0]],
  Luxembourg: ['LU', [6.1, 49.75]], Switzerland: ['CH', [8.2, 46.8]], Italy: ['IT', [11.0, 44.4]], Austria: ['AT', [14.2, 47.5]],
  'United Kingdom': ['GB', [-1.6, 52.6]], Denmark: ['DK', [9.2, 56.0]], Spain: ['ES', [-3.6, 40.3]], Czechia: ['CZ', [15.4, 49.8]], Poland: ['PL', [19.2, 52.1]], Ireland: ['IE', [-8.0, 53.2]] };
const out = [];
for (const f of feature(world, world.objects.countries).features) {
  const k = KEEP[f.properties.name];
  if (!k) continue;
  out.push({ type: 'Feature', id: k[0], properties: { name: f.properties.name, label: k[1], ...(k[2] ? { focus: true } : {}) }, geometry: f.geometry });
}
const missing = Object.keys(KEEP).filter((n) => !out.some((f) => f.properties.name === n));
if (missing.length) console.warn('not found in world-atlas:', missing.join(', '));

const C = [4.46, 51.04], RX = 0.13, RY = 0.1, ring = [];
for (let i = 0; i <= 64; i++) { const a = (i / 64) * 2 * Math.PI; ring.push([C[0] + RX * Math.cos(a), C[1] + RY * Math.sin(a)]); }
ring.reverse();
out.push({ type: 'Feature', id: 'WOODS', properties: { name: 'Woods by the E19 (approximate)', ghost: true, label: C }, geometry: { type: 'Polygon', coordinates: [ring] } });

fs.writeFileSync('public/data/getaway-002-antwerp.geojson', JSON.stringify({ type: 'FeatureCollection',
  source: 'world-atlas@2 countries-50m (Natural Earth, PD); WOODS = approximate area, see prep script', features: out }));
console.log('wrote', out.map((f) => f.id).join(', '));
