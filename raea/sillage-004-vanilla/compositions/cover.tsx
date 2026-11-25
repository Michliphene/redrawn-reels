/** SILLAGE N°4 cover (DA §5): title of 5 words in the safe band, the signature bottle recognisable without motion. */
import { AbsoluteFill, Composition, registerRoot, staticFile } from "raea";
const FONTS = `
@font-face { font-family: "Bricolage"; src: url("${staticFile("fonts/BricolageGrotesque-latin.ttf")}"); font-weight: 200 800; }
@font-face { font-family: "Instrument"; src: url("${staticFile("fonts/InstrumentSerif-Italic-latin.ttf")}"); font-style: italic; }
@font-face { font-family: "JBMono"; src: url("${staticFile("fonts/JetBrainsMono-latin.ttf")}"); }`;
function Cover() {
  return (
    <AbsoluteFill style={{ background: "#190F18" }}>
      <style>{FONTS}</style>
      <img src={staticFile("plates/s_pods.jpg")} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(25,15,24,0.96) 0%, rgba(25,15,24,0.75) 26%, rgba(25,15,24,0) 46%)" }} />
      <div style={{ position: "absolute", left: 90, top: 250, display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 30, letterSpacing: "0.24em", color: "#190F18", background: "#E9A5B7", padding: "9px 16px 8px 19px", borderRadius: 4 }}>SILLAGE</div>
        <div style={{ fontFamily: "JBMono", fontWeight: 700, fontSize: 30, letterSpacing: "0.12em", color: "#E9A5B7" }}>N°4</div>
      </div>
      <div style={{ position: "absolute", left: 90, top: 330, width: 880, fontFamily: "Bricolage", fontWeight: 800, fontSize: 96, lineHeight: 0.98, letterSpacing: "-0.015em", textTransform: "uppercase", color: "#FFF2DD" }}>
        The boy behind<br />every <span style={{ color: "#E9A5B7" }}>vanilla</span> pod
      </div>
      <div style={{ position: "absolute", left: 92, top: 548, fontFamily: "Instrument", fontStyle: "italic", fontSize: 58, color: "#D6B477" }}>1841 · one flower, one thumb</div>
    </AbsoluteFill>
  );
}
registerRoot(() => <Composition id="cover" component={Cover} width={1080} height={1920} fps={30} durationInFrames={1} />);
