/**
 * STUDIO tokens — the numbers every series shares. Change a value here and every engine follows.
 * All sizes are in pixels of the 1080×1920 master frame.
 */
export const W = 1080, H = 1920, FPS = 30;

/**
 * Platform safe area. Reels / TikTok / Shorts draw their own interface over the video:
 *   - a header (tabs, camera) over the first ~230 px,
 *   - the account name, description and comment field over everything below ~1450 px,
 *   - the like / comment / share column over the right ~150 px of the lower half.
 * Measured on phone screenshots of Reels (Nov 2026). Nothing the viewer must READ may sit outside this box;
 * the world (map, table, scenery) is full-bleed and continues under the interface.
 */
export const SAFE = {
  top: 250, bottom: 1440, left: 64, right: 1016,
  /** below `railFrom`, text must also stay left of `railX` (action buttons column) */
  railFrom: 860, railX: 930,
} as const;

/** Fixed bands inside the safe area. One job per band, so cues can never collide. */
export const ZONES = {
  /** series tag · episode number · chapter progress */
  hud: { top: 250, bottom: 304 },
  /** title on the hook, then one kicker per chapter (left aligned) */
  title: { top: 318, bottom: 600 },
  /** where the subject of the world is framed (camera principal point = its centre) */
  stage: { top: 560, bottom: 1130 },
  /** word-synced captions, two lines max */
  captions: { top: 1170, bottom: 1410 },
} as const;
export const STAGE_CENTER_Y = (ZONES.stage.top + ZONES.stage.bottom) / 2;

/** Type scale (px). `display` sizes assume the condensed display face. */
export const TYPE = {
  hud: 26, kicker: 34, whisper: 54, title: 104, titleLong: 84, caption: 92, number: 190, label: 44, source: 24,
} as const;

/** Layer order of a v2 frame, back to front. */
export const LAYERS = ['world (low-res 3D)', 'anchored labels', 'cards', 'title / HUD', 'captions', 'finish'] as const;
