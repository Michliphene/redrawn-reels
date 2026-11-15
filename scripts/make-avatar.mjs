// REDRAWN avatar: navy disc, orthographic globe (Natural Earth land, PD), one bold gold "redrawn" stroke. No text (unreadable at 110 px).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { geoOrthographic, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
const require = createRequire(import.meta.url);
const land = require('world-atlas/land-110m.json');
const S = 1080, R = 440;
const proj = geoOrthographic().rotate([20, -28]).scale(R).translate([S / 2, S / 2]).clipAngle(90);
const path = geoPath(proj);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
<defs><radialGradient id="bg" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#13203A"/><stop offset="1" stop-color="#0B1120"/></radialGradient>
<radialGradient id="sea" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#1A2B4D"/><stop offset="1" stop-color="#0E1A33"/></radialGradient>
<filter id="glow"><feGaussianBlur stdDeviation="10"/></filter></defs>
<rect width="${S}" height="${S}" fill="url(#bg)"/>
<circle cx="${S / 2}" cy="${S / 2}" r="${R}" fill="url(#sea)"/>
<path d="${path(geoGraticule10())}" fill="none" stroke="#24375C" stroke-width="2"/>
<path d="${path(feature(land, land.objects.land))}" fill="#3A4C72" stroke="#5A6E99" stroke-width="2"/>
<circle cx="${S / 2}" cy="${S / 2}" r="${R}" fill="none" stroke="#FFC94D" stroke-width="14"/>
<path d="M 250 760 C 400 640, 460 680, 560 520 S 720 340, 840 280" fill="none" stroke="#FFC94D" stroke-width="44" stroke-linecap="round" filter="url(#glow)" opacity="0.6"/>
<path d="M 250 760 C 400 640, 460 680, 560 520 S 720 340, 840 280" fill="none" stroke="#FFC94D" stroke-width="30" stroke-linecap="round"/>
<circle cx="250" cy="760" r="30" fill="#FFC94D"/><circle cx="840" cy="280" r="30" fill="#FFC94D"/>
</svg>`;
fs.writeFileSync(process.argv[2], svg);
