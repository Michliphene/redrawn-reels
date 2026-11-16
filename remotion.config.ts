import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setConcurrency(4);
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? null);
// The DA v2 world is WebGL. A cloud container has no GPU: `swangle` (software) always works there.
// On a machine with a GPU, export REMOTION_GL=angle (macOS/Windows) or angle-egl (Linux) for speed.
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as any) ?? (process.platform === 'linux' ? 'swangle' : 'angle'));
