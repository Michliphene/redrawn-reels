// public/data/getaway-001-dbcooper.geojson — the Pacific Northwest of 24 Nov 1971, state scale.
// Sources (all public domain):
//   - us-atlas@3 states-10m (US Census Bureau cartographic boundaries)
//   - world-atlas@2 countries-50m (Natural Earth 1:50m) for Canada and Mexico
//   - Natural Earth 1:10m rivers_lake_centerlines (v5, nvkelso/natural-earth-vector) for the Columbia River,
//     downloaded once to data/raw/ (gitignored)
// State borders have not changed since 1971. Nothing contested here.
// DROPZONE is NOT a measured area: it is a deliberately broad ellipse over southwest Washington (Lewis River /
// Ariel – Battle Ground – Washougal), the region named by the FBI's 1971 estimate AND by the later alternative
// theories (see SOURCES.md "Debated points"). It is drawn translucent and always labelled DISPUTED.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
const require = createRequire(import.meta.url);
const us = require('us-atlas/states-10m.json');
const world = require('world-atlas/countries-50m.json');

const RAW = 'data/raw/ne_10m_rivers_lake_centerlines.geojson';
if (!fs.existsSync(RAW)) {
  fs.mkdirSync(path.dirname(RAW), { recursive: true });
  const r = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson');
  if (!r.ok) throw new Error(`rivers download failed: ${r.status}`);
  fs.writeFileSync(RAW, Buffer.from(await r.arrayBuffer()));
}
const rivers = JSON.parse(fs.readFileSync(RAW, 'utf8'));

const out = [];
const STATES = { Washington: ['WA', [-120.6, 47.4], true], Oregon: ['OR', [-120.6, 43.9], true], Idaho: ['ID', [-114.6, 44.2]], Nevada: ['NV', [-116.9, 39.3]],
  California: ['CA', [-120.6, 37.6]], Montana: ['MT', [-109.6, 47.0]], Utah: ['UT', [-111.7, 39.3]], Wyoming: ['WY', [-107.5, 43.0]], Arizona: ['AZ', [-111.7, 34.3]] };
for (const g of us.objects.states.geometries) {
  const s = STATES[g.properties.name];
  if (!s) continue;
  out.push({ type: 'Feature', id: s[0], properties: { name: g.properties.name, label: s[1], ...(s[2] ? { focus: true } : {}) }, geometry: feature(us, g).geometry });
}
for (const f of feature(world, world.objects.countries).features) {
  if (f.properties.name === 'Canada') out.push({ type: 'Feature', id: 'CAN', properties: { name: 'Canada' }, geometry: f.geometry });
  if (f.properties.name === 'Mexico') out.push({ type: 'Feature', id: 'MEX', properties: { name: 'Mexico' }, geometry: f.geometry });
}

// Columbia River, clipped to the window of the reel (Pacific mouth → eastern Washington)
const inWin = ([lon, lat]) => lon > -124.3 && lon < -116.5 && lat > 45.3 && lat < 49.2;
const lines = [];
for (const f of rivers.features) {
  if (f.properties.name !== 'Columbia') continue;
  const ls = f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const l of ls) {
    let cur = [];
    for (const p of l) { if (inWin(p)) cur.push(p); else { if (cur.length > 1) lines.push(cur); cur = []; } }
    if (cur.length > 1) lines.push(cur);
  }
}
out.push({ type: 'Feature', id: 'COLUMBIA', properties: { name: 'Columbia River', river: true, width: 0.016 }, geometry: { type: 'MultiLineString', coordinates: lines } });

// broad, approximate area (see header) — an ellipse of ±0.42° lon × ±0.27° lat
const C = [-122.5, 45.88], RX = 0.42, RY = 0.27, ring = [];
for (let i = 0; i <= 64; i++) { const a = (i / 64) * 2 * Math.PI; ring.push([C[0] + RX * Math.cos(a), C[1] + RY * Math.sin(a)]); }
ring.reverse(); // clockwise for d3 (exterior ring of a small polygon)
out.push({ type: 'Feature', id: 'DROPZONE', properties: { name: 'Approximate drop area (disputed)', ghost: true, label: C }, geometry: { type: 'Polygon', coordinates: [ring] } });

fs.writeFileSync('public/data/getaway-001-dbcooper.geojson', JSON.stringify({ type: 'FeatureCollection',
  source: 'us-atlas@3 (US Census, PD) + Natural Earth 1:50m countries + 1:10m rivers (PD); DROPZONE = approximate, disputed', features: out }));
console.log('wrote', out.map((f) => f.id).join(', '), `· Columbia: ${lines.length} part(s), ${lines.flat().length} points`);
