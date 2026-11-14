import fs from 'node:fs';
import { createRequire } from 'node:module';
import { geoAlbers, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
const require = createRequire('/home/user/redrawn-reels/package.json');
const us = require('us-atlas/states-10m.json');
const d = JSON.parse(fs.readFileSync(process.argv[2]));
const proj = geoAlbers().scale(1100).translate([480, 330]);
const path = geoPath(proj);
const col = { 'Luisiana': '#e07b39aa', 'United States of America': '#3c6fb4aa', 'Spain': '#c9b33aaa', 'Viceroyalty of New Spain': '#9c89b8aa', "Rupert's Land": '#7fb77e88' };
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600"><rect width="960" height="600" fill="#0b1120"/>`;
for (const f of d.features) { const c = col[f.properties.NAME]; if (c) svg += `<path d="${path(f)}" fill="${c}" stroke="#fff" stroke-width="0.6"/>`; }
svg += `<path d="${path(mesh(us, us.objects.states))}" fill="none" stroke="#ffffff66" stroke-width="0.5"/>`;
svg += `</svg>`;
fs.writeFileSync(process.argv[3], svg);
