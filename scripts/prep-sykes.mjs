// Builds public/data/sykes1916.geojson for `sykes-picot-1916` (REDRAWN topic #11).
//
// 1. Countries: Natural Earth 1:50m admin-0 (public domain) via world-atlas@2.0.2 (NE v4.1.0).
//    The subject pieces show the post-war settlement AS OF 1926 (the date the reel ends on):
//      TUR    Turkey minus HATAY (Hatay = Sanjak of Alexandretta: French-mandate Syria until 1939)
//      HATAY  approximate province outline cut from NE's Turkey (see HATAY_CUT; soft precision)
//      SYR    Syria + the Golan (NE 4.1 puts the Golan in Israel, de facto view; in 1923–1926 it was in
//             French-mandate Syria, and it is internationally recognised as Syrian territory today)
//      LBN    Lebanon
//      PAL    Mandatory Palestine = NE Israel (minus the Golan) ∪ NE Palestine (West Bank + Gaza)
//      TRJ    Transjordan = NE Jordan (generalised; the Jordan–Saudi line was adjusted in 1965)
//      IRQ    Iraq
//    Saudi Arabia, Kuwait, Iran, Egypt, Cyprus… are scenery (not part of the 1916 deal; not declared).
//
// 2. The 1916 zones: digitised from the map signed by Sykes and Georges-Picot on 8 May 1916
//    (UK National Archives MPK 1/426; Wikimedia Commons, public domain; 1280 px scan).
//    The scan was georeferenced from its own graticule (17 meridian labels top, 13 bottom, 10 parallel labels
//    on the edges) with a two-standard-parallel conic model: residual 2.5 px ≈ 3 km. Zone outlines were traced by
//    hand on that scan (± ~5 px ≈ 6 km, more along the faint Anatolian edge) → APPROXIMATE, said on screen.
//      SP_BLUE   French direct control ("blue area")      SP_RED  British direct control ("red area") + Haifa/Acre
//      SP_BROWN  international administration (Palestine)  SP_LINES the A/B dividing line + the northern limit of A
//    Zones A and B are letters on the original map, not coloured areas: they are labels, not pieces.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature, merge } from 'topojson-client';
import * as turf from '@turf/turf';
const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-50m.json');
const land = require('world-atlas/land-50m.json');
const geoms = topo.objects.countries.geometries;
const fc = feature(topo, topo.objects.countries);
const byId = (id) => fc.features.find((f) => f.id === id);
const PROVENANCE = [];

// ---- georeference of the 1916 scan (fitted in this session, see header) ----
const APEX = [616.11593925, -6627.21028814], N = 0.010293750777955937, A = 10586.87, K = -93.23;
const Cfit = -N * 41.303329995291335; // c = -n·λ0 (central meridian 41.30°E)
const px2ll = ([x, y]) => {
  const th = Math.atan2(x - APEX[0], y - APEX[1]), r = Math.hypot(x - APEX[0], y - APEX[1]);
  return [+((th - Cfit) / N).toFixed(3), +((r - A) / K).toFixed(3)];
};
const ring = (pts) => { const r = pts.map(px2ll); r.push(r[0]); return r; };

// blue area: Anatolian edge from the NW, the inland edge of the coastal strip, the sea side (clipped by land later)
const BLUE_PX = [
  [225, 275], [255, 255], [270, 245], [285, 225], [290, 205], [300, 202], [340, 222], [370, 240], [400, 270], [420, 305],
  [435, 330], [450, 340], [480, 350], [500, 357], [510, 352], [550, 352], [575, 350], [615, 352], [625, 380], [625, 400],
  [625, 450], [625, 488], [500, 497], [375, 504], [315, 530], [265, 565], [250, 580], [245, 600], [240, 650], [238, 700],
  [240, 740], [230, 775], [210, 800], [185, 830], [175, 850], [167, 862],
  [135, 860], [110, 860], [80, 760], [40, 640], [5, 560], [5, 505], [25, 500], [60, 488], [110, 465], [145, 452],
  [170, 428], [200, 395], [215, 370], [225, 330],
];
const BROWN_PX = [[135, 860], [167, 862], [170, 900], [168, 950], [160, 998], [75, 1000], [60, 930], [100, 860]];
const HAIFA_PX = [[118, 872], [136, 868], [141, 881], [136, 896], [118, 896]];
const RED_PX = [
  [915, 750], [945, 745], [990, 860], [1020, 905], [1080, 925], [1115, 960],
  [1125, 980], [1115, 1050], [1150, 1050], [1152, 1095], [1200, 1135], [1235, 1180], [1180, 1215], [1095, 1185],
  [975, 1095], [825, 1000], [810, 845],
];
const AB_LINE_PX = [[172, 900], [210, 912], [250, 925], [275, 930], [295, 922], [440, 850], [595, 750], [780, 675], [830, 625], [870, 600], [905, 565]];
const A_NORTH_PX = [[625, 488], [700, 485], [870, 485], [885, 515], [905, 565]];

const landGeom = feature(land, land.objects.land);
const landF = landGeom.type === 'FeatureCollection' ? landGeom.features[0] : landGeom;
// zones are clipped to land, and to the Ottoman side of the frontiers: Cyprus (British since 1878) and Persia stay out
// (where the traced edge strays over them it is digitisation error, not part of the agreement)
const notOttoman = fc.features.filter((f) => ['196', '364'].includes(f.id) || f.properties.name === 'N. Cyprus');
const clipToLand = (poly) => {
  let z = turf.intersect(turf.featureCollection([turf.polygon([ring(poly)]), landF]));
  for (const o of notOttoman) z = turf.difference(turf.featureCollection([z, o])) ?? z;
  return z;
};
const blue = clipToLand(BLUE_PX), brown = clipToLand(BROWN_PX);
const redMain = clipToLand(RED_PX), haifa = clipToLand(HAIFA_PX);
const red = turf.union(turf.featureCollection([redMain, haifa]));
// the brown area does not include the Haifa/Acre enclave (British)
const brownNet = turf.difference(turf.featureCollection([brown, haifa]));

// ---- 1926 pieces ----
const tur0 = byId('792'), syr0 = byId('760'), isr0 = byId('376'), pse0 = byId('275');
const HATAY_CUT = turf.polygon([[[35.4, 37.12], [36.2, 37.05], [36.52, 36.92], [36.70, 36.62], [36.80, 36.2], [36.8, 35.5], [35.4, 35.5], [35.4, 37.12]]]);
const hatay = turf.intersect(turf.featureCollection([tur0, HATAY_CUT]));
const tur = turf.difference(turf.featureCollection([tur0, HATAY_CUT]));
PROVENANCE.push('HATAY cut from NE Turkey with an approximate province outline: part of French-mandate Syria 1920–1939.');
const GOLAN_CUT = turf.polygon([[[35.66, 32.68], [35.66, 32.9], [35.63, 33.0], [35.64, 33.2], [35.68, 33.26], [35.85, 33.36], [36.05, 33.3], [36.05, 32.6], [35.66, 32.68]]]);
const golan = turf.intersect(turf.featureCollection([isr0, GOLAN_CUT]));
const isr = turf.difference(turf.featureCollection([isr0, GOLAN_CUT]));
const syr = turf.union(turf.featureCollection([syr0, golan]));
PROVENANCE.push('Golan moved from NE Israel (de facto view) to Syria: French-mandate Syria in 1923–1926; internationally recognised as Syrian.');
const pal = turf.union(turf.featureCollection([isr, pse0]));
PROVENANCE.push('PAL = NE Israel (minus Golan) ∪ NE Palestine, standing for Mandatory Palestine (1920/22–1948).');

const d3 = (f) => turf.rewind(f, { reverse: true }).geometry; // d3-geo wants clockwise exteriors
const SUBJECT = [
  ['TUR', 'Turkey', tur, [34.0, 39.0]],
  ['HATAY', 'Alexandretta', hatay, [36.25, 36.35]],
  ['SYR', 'Syria', syr, [38.6, 35.0]],
  ['LBN', 'Lebanon', byId('422'), [35.85, 33.95]],
  ['PAL', 'Palestine', pal, [34.95, 31.4]],
  ['TRJ', 'Transjordan', byId('400'), [36.9, 30.9]],
  ['IRQ', 'Iraq', byId('368'), [43.6, 33.0]],
];
const SKIP = new Set(['792', '760', '376', '275', '422', '400', '368']);
const out = [];
for (const f of fc.features) {
  if (SKIP.has(f.id)) continue;
  const b = turf.bbox(f);
  if (b[2] < 10 || b[0] > 75 || b[3] < 5 || b[1] > 58) continue; // the window the camera can see
  out.push({ type: 'Feature', id: `X${f.id ?? f.properties.name.replace(/\W/g, '')}`, properties: { name: f.properties.name }, geometry: f.geometry });
}
for (const [id, name, f, label] of SUBJECT) out.push({ type: 'Feature', id, properties: { name, label, focus: true }, geometry: d3(f) });
const outline = merge(topo, geoms.filter((g) => ['792', '760', '376', '275', '422', '400', '368'].includes(g.id)));
out.push({ type: 'Feature', id: 'FOCUS_OUTLINE', properties: { name: 'Ottoman Arab provinces and Anatolia (approx.)' }, geometry: outline });
out.push({ type: 'Feature', id: 'SP_BLUE', properties: { name: 'Blue area (France)', ghost: true, label: [37.0, 37.6] }, geometry: d3(blue) });
// the part of the blue area that ended up in Turkey (1923 beat: "France's northern zone is gone")
const blueNorth = turf.intersect(turf.featureCollection([blue, tur]));
out.push({ type: 'Feature', id: 'SP_BLUE_N', properties: { name: 'Blue area, Anatolian part', ghost: true }, geometry: d3(blueNorth) });
out.push({ type: 'Feature', id: 'SP_RED', properties: { name: 'Red area (Britain)', ghost: true, label: [45.2, 32.0] }, geometry: d3(red) });
out.push({ type: 'Feature', id: 'SP_BROWN', properties: { name: 'Brown area (international)', ghost: true, label: [34.9, 31.8] }, geometry: d3(brownNet) });
out.push({ type: 'Feature', id: 'SP_LINES', properties: { name: '1916 A/B line', ghost: true, lines: true },
  geometry: { type: 'MultiLineString', coordinates: [AB_LINE_PX.map(px2ll), A_NORTH_PX.map(px2ll)] } });

fs.writeFileSync('public/data/sykes1916.geojson', JSON.stringify({
  type: 'FeatureCollection',
  source: 'Natural Earth 1:50m admin-0 v4.1.0 (public domain) via world-atlas@2.0.2; 1916 zones digitised from UK National Archives MPK 1/426 (public domain)',
  provenance: PROVENANCE,
  features: out,
}));

// checks quoted in SOURCES.md
const inside = (pt, f) => turf.booleanPointInPolygon(pt, f);
const abAt = (lon) => { const l = turf.lineString(AB_LINE_PX.map(px2ll)); const m = turf.lineIntersect(l, turf.lineString([[lon, 20], [lon, 45]])); return m.features[0]?.geometry.coordinates[1]; };
console.log(`wrote ${out.length} features`);
console.log('A/B line endpoints:', px2ll(AB_LINE_PX[0]), '→', px2ll(AB_LINE_PX.at(-1)));
console.log('Mosul 36.34N vs A/B line at 43.13E:', abAt(43.13)?.toFixed(2), '(Mosul north of it = zone A)');
console.log('Kirkuk 35.47N vs A/B line at 44.39E:', abAt(44.39)?.toFixed(2), '(Kirkuk south of it = zone B)');
console.log('Baghdad in red:', inside([44.36, 33.31], red), ' Basra in red:', inside([47.81, 30.51], red), ' Damascus in blue:', inside([36.29, 33.51], blue), ' Beirut (inland edge) in blue:', inside([35.56, 33.87], blue));
console.log('Jerusalem in brown:', inside([35.22, 31.78], brownNet), ' Adana in blue:', inside([35.32, 37.0], blue), ' Sivas in blue:', inside([37.02, 39.75], blue), ' Diyarbakir in blue:', inside([40.22, 37.91], blue));
console.log('Aleppo in blue:', inside([37.16, 36.2], blue), ' Haifa (inland edge) in red:', inside([35.03, 32.79], red));
const area = (f) => Math.round(turf.area(f) / 1e6);
console.log('areas km2  blue', area(blue), 'red', area(red), 'brown', area(brownNet), '| TUR', area(tur), 'HATAY', area(hatay), 'Golan', area(golan));
