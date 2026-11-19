// public/data/getaway-003-monalisa.geojson — western Europe of 1911–1913, country scale, France and Italy as the subjects (Paris → Florence).
// Modern borders are used as a base map only: the reel shows two cities and a train route, no border claim
// (in 1911 Alsace-Lorraine was German and Italy's NE border differed; no border is labelled or dated on screen).
// Sources: world-atlas@2 countries-50m (Natural Earth 1:50m) + Natural Earth 1:10m rivers (the Seine, so the Paris close-ups
// have a landmark), all public domain; rivers downloaded once to data/raw/ (gitignored). No approximate area in this episode.
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
const require = createRequire(import.meta.url);
const world = require('world-atlas/countries-50m.json');

const KEEP = { Belgium: ['BE', [4.65, 50.62]], Netherlands: ['NL', [5.6, 52.2]], France: ['FR', [2.6, 47.2], true], Germany: ['DE', [9.8, 51.0]],
  Luxembourg: ['LU', [6.1, 49.75]], Switzerland: ['CH', [8.2, 46.8]], Italy: ['IT', [12.4, 42.6], true], Austria: ['AT', [14.2, 47.5]],
  'United Kingdom': ['GB', [-1.6, 52.6]], Denmark: ['DK', [9.2, 56.0]], Spain: ['ES', [-3.6, 40.3]], Czechia: ['CZ', [15.4, 49.8]], Poland: ['PL', [19.2, 52.1]], Ireland: ['IE', [-8.0, 53.2]] };
const out = [];
for (const f of feature(world, world.objects.countries).features) {
  const k = KEEP[f.properties.name];
  if (!k) continue;
  out.push({ type: 'Feature', id: k[0], properties: { name: f.properties.name, label: k[1], ...(k[2] ? { focus: true } : {}) }, geometry: f.geometry });
}
const RAW = 'data/raw/ne_10m_rivers_lake_centerlines.geojson';
if (!fs.existsSync(RAW)) {
  fs.mkdirSync(path.dirname(RAW), { recursive: true });
  const r = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson');
  if (!r.ok) throw new Error(`rivers download failed: ${r.status}`);
  fs.writeFileSync(RAW, Buffer.from(await r.arrayBuffer()));
}
const seine = [];
for (const f of JSON.parse(fs.readFileSync(RAW, 'utf8')).features) {
  if (f.properties.name !== 'Seine') continue;
  const ls = f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const l of ls) seine.push(l);
}
out.push({ type: 'Feature', id: 'SEINE', properties: { name: 'Seine', river: true, width: 0.6 }, geometry: { type: 'MultiLineString', coordinates: seine } });
const missing = Object.keys(KEEP).filter((n) => !out.some((f) => f.properties.name === n));
if (missing.length) console.warn('not found in world-atlas:', missing.join(', '));

fs.writeFileSync('public/data/getaway-003-monalisa.geojson', JSON.stringify({ type: 'FeatureCollection',
  source: 'world-atlas@2 countries-50m (Natural Earth, PD); modern borders as a base map only', features: out }));
console.log('wrote', out.map((f) => f.id).join(', '));
