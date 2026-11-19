import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { readFormat, videoLengthIssue } from './format.mjs';

const VERSION = 1;
const ID = /^[a-z0-9][a-z0-9-]*$/;
const SHA = /^[a-f0-9]{64}$/;
const TEXT = /\.(?:json|geojson|md|txt|mjs|js|ts|tsx|py|sh|svg|css)$/i;
const digest = (value) => createHash('sha256').update(value).digest('hex');
const recordDigest = (value) => digest(JSON.stringify(value));
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const episodeDir = (id) => `public/episodes/${id}`;
const defaultManifest = (id) => `out/${id}.render.json`;
const defaultApproval = (id) => `deliverables/${id}/RELEASE.json`;

function isInside(root, target) {
  const relative = path.relative(root, target);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function localPath(root, ref) {
  if (!nonempty(ref)) throw new Error('A workspace path is required');
  const base = path.resolve(root);
  const absolute = path.resolve(base, ref);
  if (!isInside(base, absolute)) throw new Error(`Path outside the workspace: ${ref}`);
  let existing = absolute;
  while (!fs.existsSync(existing)) existing = path.dirname(existing);
  if (!isInside(fs.realpathSync(base), fs.realpathSync(existing))) {
    throw new Error(`Path resolves outside the workspace: ${ref}`);
  }
  return { absolute, relative: path.relative(base, absolute).split(path.sep).join('/') };
}

function fileBytes(root, ref) {
  const { absolute, relative } = localPath(root, ref);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) throw new Error(`Missing file: ${relative}`);
  return { path: relative, bytes: fs.readFileSync(absolute) };
}

function fileHash({ path: ref, bytes }, exact = false) {
  return { path: ref, sha256: digest(!exact && TEXT.test(ref) ? bytes.toString('utf8').replace(/\r\n/g, '\n') : bytes) };
}

export function artifact(root, ref) {
  return fileHash(fileBytes(root, ref));
}

function readJson(root, ref) {
  return JSON.parse(fileBytes(root, ref).bytes.toString('utf8'));
}

function writeJson(root, ref, data) {
  const { absolute } = localPath(root, ref);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  const temporary = `${absolute}.${randomUUID()}.part`;
  try {
    fs.writeFileSync(temporary, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
    fs.renameSync(temporary, absolute);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

function resolveEpisode(root, selector) {
  if (!ID.test(selector ?? '')) throw new Error('Supply an episode id or a unique episode number');
  if (!/^\d+$/.test(selector)) {
    const ep = readJson(root, `${episodeDir(selector)}/episode.json`);
    if (ep.id !== selector) throw new Error(`Episode id does not match its directory: ${selector}`);
    return selector;
  }
  const base = localPath(root, 'public/episodes').absolute;
  const matches = fs.readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && ID.test(entry.name))
    .map((entry) => entry.name)
    .filter((id) => fs.existsSync(path.join(base, id, 'episode.json')) &&
      readJson(root, `${episodeDir(id)}/episode.json`).episode === Number(selector))
    .sort();
  if (matches.length !== 1) {
    throw new Error(matches.length ? `Ambiguous episode number ${selector}; use an id: ${matches.join(', ')}` : `Unknown episode number ${selector}`);
  }
  return resolveEpisode(root, matches[0]);
}

function tree(root, dir) {
  const source = localPath(root, dir).absolute;
  if (!fs.existsSync(source)) return [];
  return fs.readdirSync(source, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.')) return [];
    const ref = `${dir}/${entry.name}`;
    return entry.isDirectory() ? tree(root, ref) : [ref];
  });
}

function inputs(root, id, recipe) {
  const ep = readJson(root, `${episodeDir(id)}/episode.json`);
  const audioId = ep.audio ?? id;
  if (!ID.test(audioId)) throw new Error(`Invalid audio episode id: ${audioId}`);
  const paths = [
    `${episodeDir(id)}/episode.json`, `${episodeDir(id)}/SOURCES.md`, 'public/studio.json',
    ...['voice.wav', 'music.wav', 'timings.json'].map((name) => `${episodeDir(audioId)}/${name}`),
    ...['public/fonts', 'public/sfx'].flatMap((dir) => tree(root, dir)),
  ];
  if (audioId !== id) paths.push(`${episodeDir(audioId)}/episode.json`);
  if (ep.data) paths.push(`public/${ep.data}`);
  const voiceProof = `${episodeDir(audioId)}/voice.provenance.json`;
  if (fs.existsSync(localPath(root, voiceProof).absolute)) paths.push(voiceProof);
  if (recipe.engine === 'remotion') {
    paths.push('package-lock.json', ...tree(root, 'src'), ...tree(root, 'public/assets'));
    for (const file of ['package.json', 'remotion.config.ts', 'tsconfig.json', 'scripts/render.mjs', 'scripts/render-tools.mjs', 'pipeline/render.sh', 'pipeline/music.sh', 'pipeline/tts.py']) {
      if (fs.existsSync(localPath(root, file).absolute)) paths.push(file);
    }
  } else {
    if (typeof recipe.project !== 'string' || !/^raea\/[a-z0-9-]+$/.test(recipe.project)) {
      throw new Error('A raea recipe requires the project path raea/<project>');
    }
    const composition = tree(root, `${recipe.project}/compositions`)
      .filter((file) => !file.startsWith(`${recipe.project}/compositions/media`));
    const media = tree(root, `${recipe.project}/media`);
    if (!composition.some((file) => file.endsWith('.tsx')) || !media.length) {
      throw new Error('The raea composition and prepared media must exist before taking a snapshot');
    }
    paths.push(...composition, ...media, `${recipe.project}/render.sh`, `${recipe.project}/setup.sh`);
  }
  return [...new Set(paths)].sort().map((ref) => artifact(root, ref));
}

export function snapshot(root, id, recipe) {
  if (!ID.test(id) || !['remotion', 'raea'].includes(recipe?.engine)) throw new Error('A known episode and render engine are required');
  if (recipe.engine === 'remotion' && ![1, 2].includes(recipe.effectiveDa)) {
    throw new Error('A Remotion snapshot requires an explicit effective DA of 1 or 2');
  }
  const files = inputs(root, id, recipe);
  return { version: VERSION, episodeId: id, recipe, inputs: files, inputsSha256: recordDigest(files) };
}

function checkSnapshot(root, id, saved) {
  if (saved?.version !== VERSION || saved.episodeId !== id || !Array.isArray(saved.inputs) ||
      saved.inputsSha256 !== recordDigest(saved.inputs)) throw new Error('Invalid render input snapshot');
  const current = snapshot(root, id, saved.recipe);
  if (current.inputsSha256 !== saved.inputsSha256) {
    const before = new Map(saved.inputs.map((entry) => [entry.path, entry.sha256]));
    const after = new Map(current.inputs.map((entry) => [entry.path, entry.sha256]));
    const changed = [...new Set([...before.keys(), ...after.keys()])].find((name) => before.get(name) !== after.get(name));
    throw new Error(`Render input changed: ${changed}`);
  }
}

function tool(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`${command} failed: ${result.error?.message ?? result.stderr.trim()}`);
  return result;
}

function inspectVideo(filename) {
  if (path.extname(filename).toLowerCase() !== '.mp4') throw new Error('The delivery artifact must be an MP4');
  const probe = JSON.parse(tool('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', filename]).stdout);
  const video = probe.streams.filter((stream) => stream.codec_type === 'video' && !stream.disposition?.attached_pic);
  const audio = probe.streams.filter((stream) => stream.codec_type === 'audio');
  if (video.length !== 1 || audio.length !== 1 || !probe.format?.format_name?.split(',').includes('mp4')) {
    throw new Error('Expected an MP4 with one video stream and one audio stream');
  }
  const measurement = tool('ffmpeg', [
    '-nostdin', '-hide_banner', '-nostats', '-i', filename, '-map', '0:a:0',
    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-vn', '-f', 'null', '-',
  ]).stderr.match(/\{\s*"input_i"[^}]*\}/s);
  if (!measurement) throw new Error('FFmpeg did not report integrated loudness and true peak');
  const levels = JSON.parse(measurement[0]);
  const [num, den] = video[0].avg_frame_rate.split('/').map(Number);
  return {
    width: video[0].width, height: video[0].height, fps: num / den, duration: Number(probe.format.duration),
    videoCodec: video[0].codec_name, audioCodec: audio[0].codec_name,
    lufs: Number(levels.input_i), truePeak: Number(levels.input_tp),
  };
}

function technicalIssue(m, id = '', fmt = readFormat(process.cwd())) {
  if (!m || m.width !== 1080 || m.height !== 1920 || m.fps !== 30) return 'Expected 1080×1920 at 30 fps';
  if (m.videoCodec !== 'h264' || m.audioCodec !== 'aac') return 'Expected H.264 video and AAC audio';
  const length = videoLengthIssue(fmt, id, m.duration);
  if (length) return length;
  if (!Number.isFinite(m.lufs) || Math.abs(m.lufs + 14) > 1.5) return 'Integrated loudness outside −14 ± 1.5 LUFS';
  if (!Number.isFinite(m.truePeak) || m.truePeak > -1) return 'True peak above −1 dBTP or unavailable';
  return null;
}

export function capture(root, id, saved, videoRef, inspect = inspectVideo) {
  checkSnapshot(root, id, saved);
  const video = artifact(root, videoRef);
  const technical = inspect(localPath(root, videoRef).absolute);
  sameFile(root, video, 'Video');
  checkSnapshot(root, id, saved);
  return { ...saved, video, technical, capturedAt: new Date().toISOString() };
}

function sameFile(root, saved, label, exact = false) {
  if (!saved || !SHA.test(saved.sha256 ?? '')) throw new Error(`${label} hash is required`);
  const current = fileHash(fileBytes(root, saved.path), exact);
  if (current.path !== saved.path || current.sha256 !== saved.sha256) throw new Error(`${label} changed: ${saved.path}`);
  return current;
}

function kitInventory(root, id, dir) {
  const folder = localPath(root, dir).relative;
  if (folder !== `deliverables/${id}` && !folder.startsWith(`deliverables/${id}/`)) {
    throw new Error('The kit must be inside the episode deliverables directory');
  }
  const found = (name) => fs.existsSync(localPath(root, `${folder}/${name}`).absolute);
  const files = ['POST.md', ...['POSTING.md', 'cover_9x16.png', 'cover_3x4.jpg', 'thumb_9x16.png', 'thumb_3x4.jpg', 'thumb_16x9.png'].filter(found)]
    .sort().map((entry) => artifact(root, `${folder}/${entry}`));
  if (!found('cover_9x16.png') && !found('thumb_9x16.png')) throw new Error('A 9:16 cover is required for the kit');
  if (found('thumb_16x9.png') && !(found('thumb_9x16.png') && found('thumb_3x4.jpg'))) {
    throw new Error('The designed thumbnail set is missing a 9:16 or 3:4 file');
  }
  return { dir: folder, files, sha256: recordDigest(files) };
}

function readRender(root, id, manifestPath) {
  const file = fileBytes(root, manifestPath);
  const manifest = JSON.parse(file.bytes.toString('utf8'));
  checkSnapshot(root, id, manifest);
  sameFile(root, manifest.video, 'Video');
  return {
    manifest, identity: {
      episodeId: id, renderSha256: fileHash(file).sha256, videoSha256: manifest.video.sha256,
      inputsSha256: manifest.inputsSha256, engine: manifest.recipe.engine,
      ...(manifest.recipe.engine === 'remotion' ? { effectiveDa: manifest.recipe.effectiveDa } : {}),
    },
  };
}

function checkedRender(root, id, { manifest, identity }) {
  if (manifest.recipe.preflightSkipped === true) throw new Error('Render preflight was skipped; make a checked render for delivery');
  const problem = technicalIssue(manifest.technical, id, readFormat(root));
  if (problem) throw new Error(problem);
  return {
    version: VERSION, ...identity, sourcesSha256: artifact(root, `${episodeDir(id)}/SOURCES.md`).sha256,
  };
}

function claimsInventory(root, id) {
  const file = fileBytes(root, `${episodeDir(id)}/CLAIMS.json`);
  const { claims } = JSON.parse(file.bytes.toString('utf8'));
  if (!Array.isArray(claims) || !claims.length) throw new Error('CLAIMS.json must list the episode claim inventory');
  const byId = new Map();
  for (const entry of claims) {
    if (!ID.test(entry?.id ?? '') || byId.has(entry.id) ||
        !['claim', 'unit', 'period'].every((key) => nonempty(entry[key]))) {
      throw new Error('CLAIMS.json needs unique claim ids with a claim, unit and period');
    }
    byId.set(entry.id, entry);
  }
  return { sha256: fileHash(file).sha256, byId };
}

export function releasePacket(root, id, manifestPath = defaultManifest(id), kitDir = `deliverables/${id}`) {
  const render = readRender(root, id, manifestPath);
  return { ...checkedRender(root, id, render), kit: kitInventory(root, id, kitDir), claimsSha256: claimsInventory(root, id).sha256 };
}

function checkEvidence(root, packet, kind, review) {
  const ref = sameFile(root, review.evidence, `${kind} evidence`);
  const evidence = readJson(root, ref.path);
  if (evidence.kind !== kind || evidence.episodeId !== packet.episodeId ||
      evidence.videoSha256 !== packet.videoSha256 || evidence.renderSha256 !== packet.renderSha256 ||
      evidence.inputsSha256 !== packet.inputsSha256) throw new Error(`Stale ${kind} evidence`);
  const measured = evidence.status === 'complete' && evidence.timeline?.renderInputsVerified === true;
  const raeaManual = packet.engine === 'raea' && evidence.status === 'incomplete' &&
    evidence.timeline?.status === 'incomplete' && review.timelineReviewedManually === true;
  if ((!measured && !raeaManual) || evidence.missingMeasurements?.length ||
      !Array.isArray(evidence.artifacts) || !evidence.artifacts.some((entry) => /\.jpg$/.test(entry?.path ?? ''))) {
    throw new Error(`Incomplete ${kind} evidence`);
  }
  const folder = path.posix.dirname(ref.path);
  for (const entry of evidence.artifacts) {
    if (!nonempty(entry?.path) || !/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*$/.test(entry.path)) throw new Error('Invalid evidence artifact name');
    sameFile(root, { ...entry, path: `${folder}/${entry.path}` }, `${kind} evidence artifact`, true);
  }
}

function checkApproval(root, packet, approval) {
  if (approval?.version !== VERSION || approval.episodeId !== packet.episodeId ||
      approval.renderSha256 !== packet.renderSha256 || approval.videoSha256 !== packet.videoSha256) {
    throw new Error('The approval refers to another render manifest or video');
  }
  if (packet.kit.sha256 !== approval.kit?.sha256 || recordDigest(packet.kit.files) !== recordDigest(approval.kit?.files)) {
    throw new Error('The kit changed since approval');
  }
  if (!Array.isArray(approval.reviews) || approval.reviews.length !== 2) throw new Error('Technical and virality reviews are required');
  for (const kind of ['technical', 'virality']) {
    const reference = approval.reviews.find((item) => item?.kind === kind);
    if (reference?.receipt) sameFile(root, reference.receipt, `${kind} receipt`);
    const review = reference?.receipt ? readJson(root, reference.receipt.path) : reference;
    if (review?.kind !== kind || review.status !== 'complete' || review.videoSha256 !== packet.videoSha256 ||
        review.renderSha256 !== packet.renderSha256 ||
        !nonempty(review.reviewer) || !Array.isArray(review.openP1)) throw new Error(`Missing, incomplete or stale ${kind} review`);
    if (review.openP1.length) throw new Error(`Open P1 in ${kind} review: ${review.openP1.join(', ')}`);
    sameFile(root, review.report, `${kind} report`);
    checkEvidence(root, packet, kind, review);
  }
  const owner = approval.owner;
  if (!nonempty(owner?.by) || !nonempty(owner.at) || !Number.isFinite(Date.parse(owner.at)) ||
      owner.videoSha256 !== packet.videoSha256 || owner.kitSha256 !== packet.kit.sha256 ||
      owner.renderSha256 !== packet.renderSha256 ||
      owner.listening !== true || owner.rights !== true) {
    throw new Error('Owner approval of this video and kit, with listening and rights checks, is required');
  }
  const sources = owner.sources;
  const inventory = claimsInventory(root, packet.episodeId);
  if (sources?.status !== 'approved' || sources.sha256 !== packet.sourcesSha256 ||
      sources.inventorySha256 !== inventory.sha256 || approval.claimsSha256 !== inventory.sha256 ||
      !Array.isArray(sources.claims) || !sources.claims.length) {
    throw new Error('Human source approval is required for the current SOURCES.md and CLAIMS.json');
  }
  const seen = new Set();
  for (const entry of sources.claims) {
    const expected = inventory.byId.get(entry?.id);
    if (!expected || seen.has(entry.id)) throw new Error(`Unknown or repeated claim id in owner source approval: ${entry?.id}`);
    seen.add(entry.id);
    if (!nonempty(entry.reference)) throw new Error(`Human source approval requires a source reference for ${entry.id}`);
    for (const field of ['claim', 'unit', 'period']) {
      if (entry[field] !== expected[field]) throw new Error(`Source approval ${field} does not match the inventory for ${entry.id}`);
    }
  }
  const uncovered = [...inventory.byId.keys()].filter((id) => !seen.has(id));
  if (uncovered.length) throw new Error(`Claim ids without human source approval: ${uncovered.join(', ')}`);
}

export function deliveryStatus(root, id, options = {}) {
  try {
    const file = options.manifest ?? defaultManifest(id);
    if (!fs.existsSync(localPath(root, file).absolute)) return { status: 'missing', reason: 'No versioned render manifest' };
    const render = readRender(root, id, file);
    const { manifest } = render;
    const packet = checkedRender(root, id, render);
    const approvalPath = options.approval ?? defaultApproval(id);
    if (!fs.existsSync(localPath(root, approvalPath).absolute)) {
      return { status: 'blocked', reason: 'No release approval for this render', video: manifest.video };
    }
    const approval = readJson(root, approvalPath);
    const kit = kitInventory(root, id, approval.kit?.dir ?? `deliverables/${id}`);
    checkApproval(root, { ...packet, kit }, approval);
    return { status: 'ready', reason: 'Reviewed version and owner approval match', video: manifest.video, kit };
  } catch (error) {
    return { status: 'blocked', reason: error.message };
  }
}

function main(args) {
  const root = process.cwd();
  const [command, selector, ...rest] = args;
  if (command === 'artifact' && selector && !rest.length) {
    console.log(JSON.stringify(artifact(root, selector), null, 2));
    return;
  }
  const commands = {
    snapshot: ['engine', 'da', 'output', 'recipe'],
    capture: ['snapshot', 'video', 'manifest'],
    inspect: ['manifest'],
    packet: ['manifest', 'kit'],
    status: ['manifest', 'approval', 'json'],
    verify: ['manifest', 'approval'],
  };
  if (!Object.hasOwn(commands, command)) throw new Error('Usage: delivery.mjs <snapshot|capture|inspect|packet|status|verify> <episode> or artifact <path>');
  const { values } = parseArgs({ args: rest, options: Object.fromEntries(commands[command].map((key) =>
    [key, { type: key === 'json' ? 'boolean' : 'string' }])) });
  const id = resolveEpisode(root, selector);
  if (command === 'snapshot') {
    const extras = values.recipe ? readJson(root, values.recipe) : {};
    const recipe = { ...extras, engine: values.engine, ...(values.da ? { effectiveDa: Number(values.da) } : {}) };
    writeJson(root, values.output, snapshot(root, id, recipe));
  } else if (command === 'capture') {
    const captured = capture(root, id, readJson(root, values.snapshot), values.video);
    writeJson(root, values.manifest ?? defaultManifest(id), captured);
    const problem = technicalIssue(captured.technical, id, readFormat(root));
    if (problem) console.error(`Review export captured; delivery blocked: ${problem}`);
  } else if (command === 'inspect') {
    console.log(JSON.stringify(readRender(root, id, values.manifest ?? defaultManifest(id)).identity));
  } else if (command === 'packet') {
    console.log(JSON.stringify(releasePacket(root, id, values.manifest, values.kit), null, 2));
  } else {
    const decision = deliveryStatus(root, id, values);
    if (values.json) console.log(JSON.stringify(decision));
    else if (decision.status === 'ready') {
      console.log(`VIDEO=${decision.video.path}`);
      for (const entry of decision.kit.files) {
        if (!entry.path.endsWith('/POSTING.md')) console.log(`KIT=${entry.path}`);
      }
    } else {
      console.error(`${decision.status}: ${decision.reason}`);
    }
    if (command === 'verify' && decision.status !== 'ready') process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
