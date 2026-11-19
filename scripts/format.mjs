// Length rule shared by the pre-flight, the board and the delivery gate (values live in public/studio.json).
import fs from 'node:fs';
import path from 'node:path';

export function readFormat(root) {
  const f = JSON.parse(fs.readFileSync(path.join(root, 'public/studio.json'), 'utf8')).format ?? {};
  return { minSeconds: 60, voiceMin: 61, voiceMax: 70, maxSeconds: 75, legacyShort: [], ...f };
}

export const isLegacyShort = (fmt, id) => fmt.legacyShort.includes(id);

// Problem with a video length, or null. Legacy episodes keep the old 30 s floor.
export function videoLengthIssue(fmt, id, seconds) {
  const min = isLegacyShort(fmt, id) ? 30 : fmt.minSeconds;
  if (!Number.isFinite(seconds) || seconds < min || seconds > fmt.maxSeconds) return `Duration outside ${min}–${fmt.maxSeconds} s`;
  return null;
}

// Warning about a voice length, or null.
export function voiceLengthNote(fmt, id, seconds) {
  if (!Number.isFinite(seconds)) return null;
  if (isLegacyShort(fmt, id)) return seconds > fmt.maxSeconds ? 'too long' : null;
  if (seconds < fmt.voiceMin) return `under ${fmt.voiceMin} s (new reels last at least ${fmt.minSeconds} s)`;
  if (seconds > fmt.voiceMax) return `over ${fmt.voiceMax} s`;
  return null;
}
