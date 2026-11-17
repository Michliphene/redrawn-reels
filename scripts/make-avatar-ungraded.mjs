// UNGRADED avatar: squared paper, the yellow-headed hero (the series' recurring stick figure) circled in red pen.
// No text (unreadable at 110 px). Usage: node scripts/make-avatar-ungraded.mjs <out.png>
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const S = 1080;
const h = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const wob = (pts, seed, a = 4) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${(x + (h(seed + i) - 0.5) * a).toFixed(1)} ${(y + (h(seed + i + 50) - 0.5) * a).toFixed(1)}`).join(' ');
const circ = (cx, cy, r, n, seed, a = 5, sweep = 1) => Array.from({ length: n + 1 }, (_, i) => { const t = (i / n) * Math.PI * 2 * sweep - Math.PI / 2; return [cx + Math.cos(t) * (r + (h(seed + i) - 0.5) * a * 2), cy + Math.sin(t) * (r + (h(seed + i) - 0.5) * a * 2)]; });
const INK = '#1E2A5A', RED = '#D9344A', HL = '#FFE04A';
const font = fs.readFileSync('public/fonts/Caveat-latin-700.woff2').toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
<defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#D3E3EE" stroke-width="3"/></pattern></defs>
<rect width="${S}" height="${S}" fill="#F7F2E4"/><rect width="${S}" height="${S}" fill="url(#g)"/>
<path d="${wob([[150, 0], [150, S]], 3, 2)}" stroke="#E98C93" stroke-width="4" fill="none"/>
<!-- the hero: highlighter head, shoulders -->
<path d="${wob(circ(560, 470, 215, 28, 10, 5), 11, 3)}Z" fill="${HL}" stroke="${INK}" stroke-width="22" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="500" cy="440" r="19" fill="${INK}"/><circle cx="624" cy="440" r="19" fill="${INK}"/>
<path d="${wob([[490, 540], [530, 590], [585, 600], [640, 560], [660, 530]], 40, 3)}" stroke="${INK}" stroke-width="20" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${wob([[220, 1000], [270, 800], [400, 735], [560, 720], [720, 735], [850, 800], [900, 1000]], 60, 6)}" stroke="${INK}" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<!-- the teacher's red circle, drawn around the hero and left open: ungraded -->
<path d="${wob(circ(560, 520, 395, 44, 80, 6, 0.93), 81, 5)}" stroke="${RED}" stroke-width="26" fill="none" stroke-linecap="round" opacity="0.95"/>
<!-- a lightbulb pops over the head: the lesson -->
<g transform="translate(850 190)"><circle r="70" fill="${HL}" stroke="${INK}" stroke-width="16"/><path d="M-30 78H30V108H-30Z" fill="#F7F2E4" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/>
${[0, 1, 2, 3, 4].map((k) => { const a = (-160 + k * 35) * Math.PI / 180; return `<path d="M${Math.cos(a) * 100} ${Math.sin(a) * 100 - 6}L${Math.cos(a) * 140} ${Math.sin(a) * 140 - 6}" stroke="${RED}" stroke-width="14" stroke-linecap="round"/>`; }).join('')}</g>
</svg>`;
const out = process.argv[2] ?? 'ungraded-avatar.png';
fs.writeFileSync(out.replace(/\.png$/, '.svg'), svg);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: S, height: S } });
await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
await page.screenshot({ path: out });
await browser.close();
console.log('avatar ->', out);
