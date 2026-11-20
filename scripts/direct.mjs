#!/usr/bin/env node
// Local creative brief + structural comparison. No generation, network or mutations.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, 'public/episodes', id, 'episode.json'), 'utf8'));

export function signature(spec) {
  const sceneTypes = [...new Set(Object.values(spec.scenes ?? {}).map((s) => s.type))];
  const sequence = (spec.beats ?? []).filter((b) => b.scene || b.camera).map((b) => b.scene ? spec.scenes?.[b.scene]?.type : b.camera.cut ? 'cut' : 'travel');
  return { opening: spec.direction?.opening ?? ((spec.da ?? 1) >= 2 ? 'crane' : 'flat'),
    sequence: sequence.join(' > '), sceneTypes, direction: spec.creative?.direction ?? 'unrecorded',
    sound: spec.creative?.sound ?? (spec.direction?.sound ?? 'automatic'),
    composition: spec.creative?.composition ?? 'default bands', rhythm: spec.creative?.rhythm ?? 'automatic' };
}

export function propose(spec) {
  const sig = signature(spec);
  if (sig.sceneTypes.includes('bars') || /compare|versus| vs|profit|rent|card|border|line/i.test(JSON.stringify(spec.beats)))
    return { direction: 'evidence-bench', reason: 'The subject contains a comparison or claim to inspect. Hold the evidence together; cut when the comparison changes.', opening: 'hold', composition: 'A shared scale with evidence side by side', rhythm: 'Hold for reading; one decisive change on the turning point', sound: 'Dry accent on the revealed evidence, silence between accents' };
  if (sig.sceneTypes.includes('product') || sig.sceneTypes.includes('slice'))
    return { direction: 'follow-one-object', reason: 'A tangible object can carry the explanation. Start close and reveal its context.', opening: 'reveal', composition: 'Object fills the stage, then travels through one continuous set', rhythm: 'Detail → context → consequence', sound: 'One tactile motif tied to the object' };
  return { direction: 'pressure', reason: 'A transformation can build through accumulation or subtraction. Use only deadlines established in the sources.', opening: 'hold', composition: 'Start wide enough to show the stakes; tighten as the state changes', rhythm: 'Deliberate setup, accelerating events, held payoff', sound: 'Sparse impacts on meaningful state changes' };
}

export function compare(spec, recent) {
  const a = signature(spec);
  return recent.map((e) => {
    const b = signature(e);
    const same = ['opening', 'sequence', 'direction', 'composition', 'rhythm', 'sound'].filter((k) => a[k] === b[k] && a[k] !== 'unrecorded');
    return { id: e.id, same, signature: b };
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [id, ...args] = process.argv.slice(2);
    if (!id || !/^[a-z0-9-]+$/.test(id)) throw new Error('usage: npm run direct -- <id> [--recent id1,id2,id3] [--references principles.json]');
    const value = (k) => args[args.indexOf(k) + 1];
    const spec = read(id);
    const recent = args.includes('--recent') ? value('--recent').split(',').map(read) : (() => {
      const all = fs.readdirSync(path.join(ROOT, 'public/episodes')).filter((d) => fs.existsSync(path.join(ROOT, 'public/episodes', d, 'episode.json'))).map(read)
        .filter((e) => e.id !== id && (e.seriesId ?? e.series) === (spec.seriesId ?? spec.series) && !e.remasterOf && !e.audio)
        .sort((a, b) => (b.episode ?? 0) - (a.episode ?? 0) || a.id.localeCompare(b.id));
      return all.slice(0, 3);
    })();
    const references = args.includes('--references') ? JSON.parse(fs.readFileSync(value('--references'), 'utf8')) : spec.creative?.references ?? [];
    if (!Array.isArray(references) || references.some((r) => !r.source || !r.principle)) throw new Error('References require [{source, principle}]; record an observed principle, not a copied sequence.');
    const report = { episode: id, subject: spec.title, proposed: propose(spec), selected: spec.creative ?? null,
      references, comparisons: compare(spec, recent), note: 'Structural overlap is a review prompt, not an audience metric. Change at least two meaningful staging choices or explain the repeat in creative.thesis. Existing episodes without metadata are inferred, not visually certified.' };
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
