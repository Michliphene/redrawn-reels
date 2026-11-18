import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import type { TimedAction } from '../lib/types';
import { FPS } from '../lib/theme';

/** Sound design derived from the same cue list as the visuals: no manual placement. */
export const Sfx: React.FC<{ actions: TimedAction[] }> = ({ actions }) => {
  const cues: { t: number; f: string; v: number }[] = [{ t: 0, f: 'boom', v: 0.7 }];
  for (const a of actions) {
    if (a.type === 'declare' && a.t > 0.05 && !a.quiet) cues.push({ t: a.t, f: 'pop', v: 0.45 });
    if (a.type === 'portrait') cues.push({ t: a.t, f: 'whoosh', v: 0.35 });
    if (a.type === 'portrait' && a.stampAt != null) cues.push({ t: a.stampAt, f: 'stamp', v: 0.8 });
    if (a.type === 'units' && a.kind !== 'crowd') cues.push({ t: a.t, f: 'rumble', v: 0.7 });
    if (a.type === 'dissolve' || a.type === 'shake') cues.push({ t: a.t, f: 'boom', v: 0.6 });
    if (a.type === 'flagSwap' || a.type === 'archive' || a.type === 'path') cues.push({ t: a.t, f: 'whoosh', v: 0.4 });
    if (a.type === 'bigNumber' || a.type === 'callout' || a.type === 'ghost') cues.push({ t: a.t, f: 'pop', v: 0.5 });
    if (a.type === 'callout' && a.stampAt != null) cues.push({ t: a.stampAt, f: 'stamp', v: 0.8 });
  }
  // one sound per instant: several pieces claimed on the same word play one pop, not a stack of them
  const once = cues.filter((c, i) => !cues.some((d, j) => j < i && d.f === c.f && Math.abs(d.t - c.t) < 0.05));
  return (
    <>
      {once.map((c, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(c.t * FPS))} durationInFrames={FPS * 3} layout="none">
          <Audio src={staticFile(`sfx/${c.f}.wav`)} volume={c.v} />
        </Sequence>
      ))}
    </>
  );
};
