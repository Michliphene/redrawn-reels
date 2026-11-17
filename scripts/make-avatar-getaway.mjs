// THE GETAWAY avatar: a dark desk, one torch-lit pool of file paper, the channel mark — a dotted escape route that
// ends in a red X. No text (unreadable at 110 px). Usage: node scripts/make-avatar-getaway.mjs <out.svg> [out.png]
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // the machine's pre-installed Playwright
const S = 1080;
const route = 'M 215 800 C 330 800, 340 560, 520 590 S 700 760, 790 360';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
<defs>
 <radialGradient id="pool" cx="50%" cy="52%" r="50%">
  <stop offset="0" stop-color="#E6D9BC"/><stop offset="0.55" stop-color="#C9B994"/><stop offset="0.78" stop-color="#5A4C38"/><stop offset="1" stop-color="#070605"/>
 </radialGradient>
 <pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="none"/><circle cx="2" cy="2" r="1.4" fill="#070605" opacity="0.10"/></pattern>
</defs>
<rect width="${S}" height="${S}" fill="#070605"/>
<circle cx="540" cy="560" r="560" fill="url(#pool)"/>
<rect width="${S}" height="${S}" fill="url(#dots)"/>
<path d="${route}" fill="none" stroke="#070605" stroke-opacity="0.35" stroke-width="58" stroke-linecap="round" stroke-dasharray="6 74" transform="translate(10 14)"/>
<path d="${route}" fill="none" stroke="#E0312B" stroke-width="54" stroke-linecap="round" stroke-dasharray="6 74"/>
<circle cx="215" cy="800" r="40" fill="#1A1612"/>
<g transform="translate(800 330) rotate(-6)" stroke-linecap="round">
 <path d="M -105 -105 L 105 105 M 105 -105 L -105 105" stroke="#070605" stroke-opacity="0.35" stroke-width="82" transform="translate(10 14)"/>
 <path d="M -105 -105 L 105 105 M 105 -105 L -105 105" stroke="#E0312B" stroke-width="74"/>
</g>
</svg>`;
fs.writeFileSync(process.argv[2], svg);
if (process.argv[3]) {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: S, height: S } });
  await p.setContent(`<html><body style="margin:0">${svg}</body></html>`); await p.screenshot({ path: process.argv[3] }); await b.close();
}
