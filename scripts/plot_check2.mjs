import fs from 'node:fs';
import { geoAlbers, geoPath } from 'd3-geo';
const d = JSON.parse(fs.readFileSync(process.argv[2]));
const proj = geoAlbers().scale(1100).translate([480, 330]);
const path = geoPath(proj);
const col = { LAND: '#1f2738', US1803: '#2F5A94', LOUISIANA: '#D9822B' };
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600"><rect width="960" height="600" fill="#0b1120"/>`;
for (const f of d.features) { if (col[f.id]) svg += `<path d="${path(f)}" fill="${col[f.id]}" stroke="#fff" stroke-width="0.6"/>`; }
const s = d.features.find((f) => f.id === 'STATES_TODAY'); svg += `<path d="${path(s)}" fill="none" stroke="#ffffff55" stroke-width="0.5"/>`;
fs.writeFileSync(process.argv[3], svg + '</svg>');
