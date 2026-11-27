/** SILLAGE N°6 (ambergris) on the shared kit (raea/sillage-kit). All content lives in reel.json. */
import { Composition, registerRoot } from "raea";
import TIMINGS from "./timings.json";
import DATA from "./reel.json";
import FLAGS from "./flags.json";
import { SillageReel } from "../../sillage-kit/src/reel";
import TOK from "../../sillage-kit/tokens.json";

const Reel = () => <SillageReel data={DATA as any} timings={TIMINGS as any} flags={FLAGS as any} />;
registerRoot(() => <Composition id="sillage" component={Reel} width={TOK.canvas.width} height={TOK.canvas.height} fps={TOK.canvas.fps} durationInFrames={Math.ceil((TIMINGS.duration + 0.5) * TOK.canvas.fps)} />);
