import React from 'react';
import { ease, hit, hop, life, pop, ramp } from '../studio/motion';
import { displayCut } from '../studio/fonts';
import { Bulb, C, Check, Circle, Coin, Cross, Guy, Hand, Ink, Note, PaperBall, Plaster, POSE, bob, joints, seg, type Joints, type Pose, type Pt } from './ink';

/**
 * One page of the notebook per scene type. Every page is drawn in its own 1080×1920 frame (the camera rests on
 * it exactly), reads only its own cues, and is a pure function of time.
 */
export type A = { type: string; t: number; beat: string; [k: string]: any };
export type PanelProps = { t: number; acts: A[]; def: any; from: number; end: number };
const one = (acts: A[], type: string, t?: number) => acts.find((a) => a.type === type && !(t != null && a.until != null && t >= a.until));
const all = (acts: A[], type: string) => acts.filter((a) => a.type === type);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const GROUND = 1095;
const Ground: React.FC<{ y?: number; x0?: number; x1?: number; seed?: number }> = ({ y = GROUND, x0 = 70, x1 = 1010, seed = 900 }) => <Ink pts={seg([x0, y], [x1, y], 10)} seed={seed} w={5} c={C.pencil} />;

/* ------------------------------------------------------------------ duel: ten failures vs one A+ */
const LX = 285, RX = 775;
const PLASTERS: [keyof Joints, number, number, number][] = [
  ['head', -16, -12, 30], ['head', 10, 10, -25], ['sh', -6, 18, 80], ['sh', 6, 40, 15], ['hip', -4, -26, 0],
  ['handL', 4, -18, 50], ['handR', -4, -16, -40], ['footL', 6, -24, 70], ['footR', -6, -26, -60], ['hip', 8, -46, 20],
];
export const DuelPanel: React.FC<PanelProps> = ({ t, acts, def }) => {
  const L = acts.find((a) => a.type === 'light' && a.side === 'left' && !(a.until != null && t >= a.until));
  const R = acts.find((a) => a.type === 'light' && a.side === 'right' && !(a.until != null && t >= a.until));
  const shine = acts.find((a) => a.type === 'shine');
  const lit = !!L && t >= L.t, dim = !!R && t >= R.t;
  const lp: Pose = lit ? POSE.cheer(t) : { ...POSE.stand(t), mood: 'flat' };
  const rp: Pose = dim ? { ...POSE.shrug(), armR: 70 } : { ...POSE.stand(t, 2), armR: 160, mood: 'smile' };
  const s = 2.15;
  return (
    <g>
      <Ground />
      <Ink pts={[[RX - 110, GROUND], [RX - 110, GROUND - 62], [RX + 110, GROUND - 62], [RX + 110, GROUND]]} seed={120} w={6} fill="#EDE6D2" />
      <Guy x={LX} y={GROUND - (lit ? hop(t, L!.t, 0.45) * 40 : 0)} s={s} pose={lp} hero seed={130}>
        {(j) => PLASTERS.map(([k, dx, dy, rot], i) => {
          const base = j[k] as Pt; const from: Pt = [base[0] + dx, base[1] + dy];
          const a = -170 + (i / (PLASTERS.length - 1)) * 160, to: Pt = [j.head[0] + Math.cos((a * Math.PI) / 180) * 92, j.head[1] + Math.sin((a * Math.PI) / 180) * 92];
          const p = lit ? ease.out3(ramp(t, L!.t + i * 0.06, 0.45)) : 0;
          const x = lerp(from[0], to[0], p), y = lerp(from[1], to[1], p) - Math.sin(p * Math.PI) * 30;
          return <g key={i}>{p < 1 && (def.leftProp === 'pages' ? <g opacity={1 - p}><Note x={x} y={y} s={0.62} rot={rot * 0.4 * (1 - p)} seed={150 + i} /></g> : <Plaster x={x} y={y} rot={rot * (1 - p)} opacity={1 - p} s={0.75} />)}{p > 0 && <Bulb x={x} y={y} s={0.48 * Math.min(1.15, pop(t, L!.t + i * 0.06, 0.4))} seed={140 + i} />}</g>;
        })}
      </Guy>
      <Guy x={RX} y={GROUND - 62} s={s} pose={rp} seed={160}>
        {(j) => (
          <g transform={`translate(${j.handR[0]} ${j.handR[1] - (dim ? 0 : 28)}) rotate(${dim ? 18 : 0})`}>
            <Ink pts={[[-30, -40], [30, -40], [30, 34], [-30, 34]]} seed={170} w={4} fill="#FFFFFF" close amp={0.6} />
            <text x={0} y={18} textAnchor="middle" style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 52 }} fill={C.red}>{def.badge ?? 'A+'}</text>
          </g>
        )}
      </Guy>
      {shine && t >= shine.t && life(t, shine.t, 1.6) > 0 && [0, 1, 2, 3, 4, 5].map((k) => {
        const a = (k / 6) * Math.PI * 2 + 0.3, r0 = 70, r1 = 70 + 34 * ease.out3(ramp(t, shine.t, 0.3));
        const cx = RX + 100, cy = GROUND - 62 - 400;
        return <Ink key={k} pts={[[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]]} seed={180 + k} w={5} c={C.red} opacity={life(t, shine.t, 1.6)} />;
      })}
      {dim && (() => {
        const o = ease.out3(ramp(t, R!.t, 0.35)), hx = RX + 30, hy = GROUND - 62 - 340;
        return (
          <g opacity={o}>
            <Circle cx={hx - 30} cy={hy - 40} r={8} seed={190} w={4} fill={C.paper} />
            <Circle cx={hx - 50} cy={hy - 80} r={13} seed={191} w={4} fill={C.paper} />
            <Ink pts={[[hx - 150, hy - 140], [hx - 120, hy - 200], [hx - 40, hy - 215], [hx + 30, hy - 190], [hx + 40, hy - 130], [hx - 20, hy - 100], [hx - 110, hy - 100]]} seed={192} w={5} fill="#FFFFFF" close />
            <text x={hx - 55} y={hy - 125} textAnchor="middle" style={{ ...displayCut(800, 75), fontSize: 92 }} fill={C.red} transform={`scale(1)`}>{def.bubble ?? '0'}</text>
          </g>
        );
      })()}
      <Hand x={530} y={890} size={86} c={C.red} rot={-6}>vs.</Hand>
      <Hand x={LX} y={1150} size={62} c={lit ? C.ink : C.red} hl={lit ? C.mint : undefined}>{lit ? def.leftLit ?? '10 lessons' : def.leftLabel ?? '10 failures'}</Hand>
      <Hand x={RX - 10} y={1150} size={62} c={dim ? C.red : C.ink}>{dim ? def.rightDim ?? '0 lessons' : def.rightLabel ?? 'perfect record'}</Hand>
    </g>
  );
};

/* ------------------------------------------------------------------ race: failing = falling behind? */
export const RacePanel: React.FC<PanelProps> = ({ t, acts, from }) => {
  const trip = one(acts, 'trip');
  const tt = trip?.t ?? 1e9;
  const y = 1060, dt = Math.max(0, t - from);
  return (
    <g>
      <Ink pts={seg([70, y], [1010, y], 12)} seed={300} w={5} c={C.pencil} />
      <Ink pts={[[985, y - 18], [1010, y], [985, y + 18]]} seed={301} w={5} c={C.pencil} />
      <Hand x={920} y={y + 56} size={42} c={C.pencil} anchor="end">progress</Hand>
      {[0, 1, 2, 3, 4].map((i) => {
        const hero = i === 1, ph = dt * 11 + i * 1.3;
        const x0 = 100 + i * 165;
        if (hero && t >= tt) {
          const fx = x0 + 120 * Math.max(0, tt - from) + 50 * ease.out3(ramp(t, tt, 0.4));
          const f = ease.out3(ramp(t, tt, 0.35));
          return <Guy key={i} x={fx} y={y} s={1.5} hero seed={310 + i * 10} pose={{ ...POSE.run(ph * (1 - f)), rot: 86 * f, armL: lerp(0, 150, f), armR: lerp(20, 160, f), mood: 'o' }} />;
        }
        const x = x0 + 120 * dt * (hero ? 1 : 1 + 0.12 * Math.max(0, t - tt));
        return <Guy key={i} x={x} y={y + bob(ph, 8)} s={1.5} hero={hero} c={hero ? C.ink : C.pencil} seed={310 + i * 10} pose={POSE.run(ph)} />;
      })}
      {t < tt + 0.1 && (() => {
        const hx = 100 + 165 + 120 * dt + 6, o = ramp(t, from + 0.2, 0.2) * (1 - ramp(t, tt - 0.1, 0.2));
        return (
          <g opacity={o}>
            <Hand x={hx - 70} y={770} size={68} c={C.red} rot={-8}>you</Hand>
            <Ink pts={[[hx - 50, 790], [hx - 26, 830], [hx - 8, 862]]} seed={340} w={5} c={C.red} />
            <Ink pts={[[hx - 30, 852], [hx - 8, 864], [hx - 6, 840]]} seed={341} w={5} c={C.red} />
          </g>
        );
      })()}
      {trip && t >= tt + 0.35 && (() => {
        const hx = 265 + 120 * Math.max(0, tt - from) + 50;
        const o = ramp(t, tt + 0.35, 0.2);
        return (
          <g opacity={o}>
            <Hand x={Math.min(hx, 760)} y={800} size={70} c={C.red} rot={-4}>falling behind?</Hand>
            <Ink pts={[[Math.min(hx, 760), 830], [hx + 60, 920], [hx + 90, 995]]} seed={330} w={5} c={C.red} draw={ramp(t, tt + 0.4, 0.3)} />
            <Ink pts={[[hx + 70, 975], [hx + 92, 1000], [hx + 106, 972]]} seed={331} w={5} c={C.red} draw={ramp(t, tt + 0.65, 0.15)} />
          </g>
        );
      })()}
    </g>
  );
};

/* ------------------------------------------------------------------ class: every mistake costs a grade */
const ROWS = [790, 870, 950, 1030];
export const ClassPanel: React.FC<PanelProps> = ({ t, acts, def }) => {
  const marks = all(acts, 'mark');
  const n = marks.filter((a) => t >= a.t).length;
  const grades: string[] = def.grades ?? ['A', 'B', 'C', 'D', 'F'];
  const g = grades[Math.min(n, grades.length - 1)];
  const last = marks.filter((a) => t >= a.t).pop();
  const slump = ease.out3(Math.min(1, n / 4 + (last ? ramp(t, last.t, 0.3) * 0 : 0)));
  // the red pen travels to the row it is about to mark
  const nextI = Math.min(marks.length - 1, n);
  const target = marks[nextI];
  const prevY = ROWS[Math.max(0, nextI - 1)] ?? ROWS[0];
  const penY = target ? lerp(prevY, ROWS[nextI], ease.inOut3(ramp(t, target.t - 0.3, 0.3))) : ROWS[ROWS.length - 1];
  return (
    <g>
      <Ground />
      {/* the test, pinned to the wall */}
      <g transform="translate(500 600) rotate(-2)">
        <Ink pts={[[0, 0], [400, 0], [400, 500], [0, 500]]} seed={400} w={5} fill="#FFFFFF" close />
        <Hand x={36} y={84} size={64} anchor="start">Test</Hand>
        <Circle cx={318} cy={78} r={54} seed={402} w={6} c={C.red} />
        <g transform={`translate(318 78) scale(${last ? 1 + hit(t, last.t, 0.06, 0.35) * 0.35 : 1})`}>
          <text x={0} y={30} textAnchor="middle" style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 96 }} fill={C.red}>{g}</text>
        </g>
        {ROWS.map((ry, i) => {
          const y0 = ry - 600 - 30, m = marks[i];
          return (
            <g key={i}>
              <Ink pts={[[34, y0 - 16], [66, y0 - 16], [66, y0 + 16], [34, y0 + 16]]} seed={410 + i} w={4} close amp={0.6} />
              <Ink pts={seg([92, y0], [350 - i * 30, y0], 4)} seed={420 + i} w={4} c={C.pencil} />
              {m && t >= m.t && <Cross x={50} y={y0} s={1.3} draw={ramp(t, m.t, 0.25)} seed={430 + i * 2} />}
            </g>
          );
        })}
      </g>
      {/* the red pen */}
      {n < marks.length + 1 && (
        <g transform={`translate(${560 + 60} ${penY - 40 + (target && t >= target.t - 0.05 && t < target.t + 0.25 ? 18 : 0)}) rotate(35)`}>
          <Ink pts={[[0, 0], [22, -12], [150, -12], [150, 12], [22, 12]]} seed={440} w={4} fill={C.red} close amp={0.6} />
          <Ink pts={[[0, 0], [22, -12], [22, 12]]} seed={441} w={4} fill="#FFFFFF" close amp={0.4} />
        </g>
      )}
      {/* the student shrinks a little with each mark */}
      <Guy x={230} y={GROUND} s={1.55} seed={450} hero pose={POSE.desk(slump)} />
      <Ink pts={[[120, 950], [440, 950]]} seed={460} w={7} />
      <Ink pts={[[150, 950], [150, GROUND]]} seed={461} w={6} />
      <Ink pts={[[410, 950], [410, GROUND]]} seed={462} w={6} />
      {n >= 2 && <g opacity={ramp(t, marks[1].t, 0.2)}><Ink pts={[[318, 770], [312, 790], [318, 800], [324, 790], [318, 770]]} seed={470} w={3.5} c="#4A8FD9" fill="#BFE0FF" close amp={0.5} /></g>}
    </g>
  );
};

/* ------------------------------------------------------------------ bin: mistakes vs what works */
export const BinPanel: React.FC<PanelProps> = ({ t, acts, from, def }) => {
  const ign = one(acts, 'ignore'), fly = one(acts, 'fly');
  const tf = fly?.t ?? 1e9;
  const hand: Pt = [272, 880], bin: Pt = [490, 1000];
  const tosses = Array.from({ length: 14 }, (_, k) => from + 0.15 + k * 0.36).filter((x) => x < tf - 0.4);
  const throwArm = Math.max(0, ...tosses.map((x) => hop(t, x - 0.12, 0.32)), hop(t, tf - 0.12, 0.4));
  const turned = t >= tf + 0.3;
  const pl = ramp(t, tf, 1.0), pe = ease.inOut3(pl);
  const plane: Pt = [lerp(hand[0], 690, pe), lerp(hand[1], 700, pe) - Math.sin(pe * Math.PI) * 260];
  return (
    <g>
      <Ground />
      {tosses.map((x, k) => {
        if (t < x) return null;
        const p = ramp(t, x, 0.45);
        const rest: Pt = [bin[0] + ((k % 4) - 1.5) * 26, 1060 - Math.floor(k / 4) * 22];
        const pos: Pt = p < 1 ? [lerp(hand[0], rest[0], p), lerp(hand[1], rest[1], p) - Math.sin(p * Math.PI) * 200] : rest;
        return <PaperBall key={k} x={pos[0]} y={pos[1]} r={17} seed={500 + k * 3} />;
      })}
      <Ink pts={[[bin[0] - 82, 960], [bin[0] + 82, 960], [bin[0] + 62, GROUND], [bin[0] - 62, GROUND]]} seed={540} w={6} fill="rgba(200,210,225,0.55)" close />
      {[-40, 0, 40].map((dx, k) => <Ink key={k} pts={[[bin[0] + dx * 1.2, 975], [bin[0] + dx, GROUND - 12]]} seed={541 + k} w={3.5} c={C.pencil} />)}
      <Hand x={bin[0]} y={905} size={60} c={C.red}>{def.binLabel ?? 'mistakes'}</Hand>
      {ign && t >= ign.t && <>
        <Ink pts={[[bin[0] - 110, 890], [bin[0] - 60, 875], [bin[0] - 10, 895], [bin[0] + 40, 875], [bin[0] + 110, 888]]} seed={545} w={7} c={C.ink} draw={ramp(t, ign.t, 0.3)} />
        <Hand x={bin[0]} y={835} size={54} c={C.ink} opacity={ramp(t, ign.t + 0.25, 0.2)}>{def.ignoreLabel ?? 'nobody counts these'}</Hand>
      </>}
      <Guy x={190} y={GROUND} s={1.75} seed={550} hero pose={{ ...POSE.stand(t), armR: 30 + 130 * throwArm, mood: t >= tf ? 'smile' : 'flat' }} />
      {/* the judge looks the other way until something works */}
      <Guy x={800} y={GROUND} s={1.75} seed={560} dir={turned ? -1 : 1} pose={turned ? { ...POSE.stand(t), armL: -150, armR: 20, mood: 'smile' } : { ...POSE.stand(t), armL: 40, mood: 'flat' }}>
        {(j) => <g transform={`translate(${j.handL[0]} ${j.handL[1]}) rotate(${turned ? 160 : 20})`}><Ink pts={[[-22, -6], [22, -6], [22, 50], [-22, 50]]} seed={565} w={4} fill="#E9D7B4" close amp={0.5} /></g>}
      </Guy>
      {fly && t >= tf && pl < 1.2 && (
        <g transform={`translate(${plane[0]} ${plane[1]}) rotate(${-25 + pe * 40}) scale(1.5)`}>
          <Ink pts={[[-34, -10], [36, 0], [-34, 14], [-16, 0]]} seed={570} w={4} fill="#FFFFFF" close amp={0.6} />
          <Ink pts={[[-16, 0], [36, 0]]} seed={571} w={3} amp={0.4} />
        </g>
      )}
      {fly && t >= tf && <Ink pts={Array.from({ length: 12 }, (_, i) => { const p = (i / 11) * Math.min(pe, 1); return [lerp(hand[0], 690, p), lerp(hand[1], 700, p) - Math.sin(p * Math.PI) * 260] as Pt; })} seed={575} w={3} c={C.pencil} dash="10 12" />}
      {fly && t >= tf + 0.45 && <>
        <Check x={640} y={830} s={1.7} draw={ramp(t, tf + 0.45, 0.3)} c={C.mint} />
        <Hand x={660} y={640} size={64} hl={C.mint} opacity={ramp(t, tf + 0.55, 0.2)}>{def.worksLabel ?? 'what works'}</Hand>
      </>}
    </g>
  );
};

/* ------------------------------------------------------------------ shop: an online store, three products */
const CARD_X = [250, 510, 770];
export const ShopPanel: React.FC<PanelProps> = ({ t, acts }) => {
  const open = one(acts, 'open'), launches = all(acts, 'launch'), bulb = one(acts, 'bulb');
  if (!open || t < open.t - 0.05) return <g><Ground y={1120} /></g>;
  const o = ease.back(ramp(t, open.t, 0.4), 1.4);
  const sale = launches.find((a) => a.outcome === 'sale'), flop = launches.find((a) => a.outcome === 'flop'), ign = launches.find((a) => a.outcome === 'ignored');
  const owner: Pose = sale && t >= sale.t + 0.8 ? POSE.cheer(t) : ign && t >= ign.t + 0.3 ? POSE.shrug() : flop && t >= flop.t + 0.8 ? { ...POSE.stand(t), armR: 165, tilt: 18, mood: 'sad' } : { ...POSE.stand(t), armR: 120, mood: 'smile' };
  return (
    <g>
      <Ground y={1120} />
      <g transform={`translate(510 805) scale(${o}) translate(-510 -805)`}>
        <Ink pts={[[110, 560], [910, 560], [910, 1050], [110, 1050]]} seed={600} w={6} fill="#FFFFFF" close />
        <Ink pts={seg([110, 625], [910, 625], 8)} seed={601} w={5} />
        {[C.red, C.hl, C.mint].map((c, k) => <circle key={k} cx={150 + k * 34} cy={593} r={11} fill={c} stroke={C.ink} strokeWidth={3} />)}
        <Ink pts={[[270, 575], [700, 575], [700, 611], [270, 611]]} seed={602} w={3.5} close fill="#F1EEE6" amp={0.6} />
        <Hand x={290} y={605} size={40} anchor="start" c={C.pencil}>my-store.shop</Hand>
        {launches.slice(0, 3).map((a, i) => {
          const cx = CARD_X[i];
          const p = pop(t, a.t, 0.35); if (p <= 0) return null;
          const fall = a.outcome === 'flop' ? ease.in3(ramp(t, a.t + 0.45, 0.45)) : 0;
          const land = a.outcome === 'flop' && t >= a.t + 0.9;
          const dim = a.outcome === 'ignored' ? ramp(t, a.t + 0.4, 0.4) : 0;
          return (
            <g key={i}>
              {!land && (
                <g transform={`translate(${cx} ${800 + fall * 300}) rotate(${fall * 80}) scale(${p})`} opacity={1 - dim * 0.45}>
                  <Ink pts={[[-100, -130], [100, -130], [100, 130], [-100, 130]]} seed={610 + i} w={5} fill={C.paper} close />
                  <Ink pts={[[-45, -20], [25, -20], [25, 50], [-45, 50]]} seed={620 + i} w={5} fill={a.outcome === 'sale' ? C.mint : '#E8E2D2'} close />
                  <Ink pts={[[-45, -20], [-20, -45], [50, -45], [25, -20]]} seed={625 + i} w={5} fill="#FFFFFF" close />
                  <Ink pts={[[25, -20], [50, -45], [50, 25], [25, 50]]} seed={628 + i} w={5} fill="#D9D2BF" close />
                  <Ink pts={seg([-60, 90], [60, 90], 3)} seed={631 + i} w={4} c={C.pencil} />
                </g>
              )}
              {land && <g>
                <Ink pts={[[cx - 60, 1118], [cx - 50, 1080], [cx + 40, 1090], [cx + 60, 1118]]} seed={640} w={5} fill="#E8E2D2" close />
                {[-1, 1].map((sx) => <Ink key={sx} pts={[[cx + sx * 75, 1100], [cx + sx * 105, 1080]]} seed={641 + sx} w={4} c={C.pencil} />)}
              </g>}
              {a.outcome === 'sale' && [0, 1, 2].map((j) => { const at = a.t + 0.9 + j * 0.22; if (t < at) return null; return <g key={j} transform={`translate(0 ${-hop(t, at, 0.35) * 50})`}><Coin x={cx - 46 + j * 46} y={690} seed={650 + j} /></g>; })}
            </g>
          );
        })}
        {bulb && t >= bulb.t && launches.slice(0, 3).map((a, i) => (
          <Ink key={i} pts={[[CARD_X[i], 680], [lerp(CARD_X[i], 150, 0.5), 600], [175, 540]]} seed={660 + i} w={4} c={C.red} dash="12 10" draw={ramp(t, bulb.t + i * 0.12, 0.35)} />
        ))}
      </g>
      {/* visitors walk past the second product without stopping; one stops at the third */}
      {ign && t >= ign.t + 0.15 && [0, 1].map((k) => {
        const p = ramp(t, ign.t + 0.15 + k * 0.35, 2.4); if (p >= 1) return null;
        const ph = (t - ign.t) * 10 + k;
        return <Guy key={k} x={lerp(-60, 1120, p)} y={1120 + bob(ph, 5)} s={0.95} c={C.pencil} seed={670 + k * 10} pose={{ ...POSE.walk(ph), tilt: -20, mood: 'flat' }} />;
      })}
      {sale && t >= sale.t + 0.1 && (() => {
        const p = ease.out3(ramp(t, sale.t + 0.1, 0.8)), ph = (t - sale.t) * 10;
        return <Guy x={lerp(1140, 955, p)} y={1120 + (p < 1 ? bob(ph, 5) : 0)} s={0.95} c={C.pencil} seed={690} dir={-1} pose={p < 1 ? POSE.walk(ph) : { ...POSE.stand(t), armR: 120, mood: 'smile' }} />;
      })()}
      <Guy x={150} y={1120} s={1.15} seed={700} hero pose={owner} />
      {launches.slice(0, 3).map((a, i) => {
        const cx = CARD_X[i] + (510 - CARD_X[i]) * (1 - o);
        if (a.outcome === 'flop' && t >= a.t + 0.9) return <Hand key={i} x={cx} y={1000} size={64} c={C.red} rot={-6} halo>flop!</Hand>;
        if (a.outcome === 'ignored' && t >= a.t + 0.4) return <g key={i}><Hand x={cx} y={1000} size={60} c={C.pencil} halo>ignored</Hand><Hand x={cx + 70} y={690} size={46} c={C.pencil} opacity={0.5 + 0.5 * Math.sin(t * 5)}>zzz</Hand></g>;
        if (a.outcome === 'sale' && t >= a.t + 0.4) return <Hand key={i} x={cx} y={1000} size={60} hl={C.mint} halo>a few sales</Hand>;
        return null;
      })}
      {bulb && t >= bulb.t && <Bulb x={150} y={505} s={1.25 * Math.min(1.1, pop(t, bulb.t, 0.4))} seed={710} />}
    </g>
  );
};

/* ------------------------------------------------------------------ pile: thousands of crumpled tries, and the climb */
const P0: Pt = [110, 1105], P1: Pt = [650, 1100], P2: Pt = [905, 690];
export const pilePt = (u: number): Pt => [(1 - u) ** 2 * P0[0] + 2 * (1 - u) * u * P1[0] + u * u * P2[0], (1 - u) ** 2 * P0[1] + 2 * (1 - u) * u * P1[1] + u * u * P2[1]];
export const climbAt = (t: number, acts: A[]) => {
  let p = 0;
  for (const a of all(acts, 'walk')) if (t >= a.t) p += (a.to - p) * ease.inOut3(ramp(t, a.t, a.dur ?? 1.5));
  return p;
};
const BALLS: { u: number; dy: number; r: number }[] = [];
for (let k = 0; k < 30; k++) for (let row = 0; row < 4; row++) {
  const u = (k + (row % 2) * 0.5) / 30;
  const base = pilePt(u);
  const dy = 20 + row * 40;
  if (base[1] + dy < 1092) BALLS.push({ u, dy, r: 19 - row });
}
export const PilePanel: React.FC<PanelProps> = ({ t, acts }) => {
  const count = one(acts, 'count'), halt = one(acts, 'halt');
  const walks = all(acts, 'walk');
  const resume = halt ? walks.find((w) => w.t > halt.t) : undefined;
  const u = climbAt(t, acts);
  const stopped = !!halt && t >= halt.t && (!resume || t < resume.t);
  const uHalt = halt ? climbAt(halt.t, acts) : 0;
  // when does the climber pass u during the resumed walk? (sampled once per ball)
  const passAt = (ub: number) => {
    if (!resume) return 1e9;
    if (ub <= uHalt) return resume.t + ub * 0.5;
    for (let k = 0; k <= 60; k++) { const tk = resume.t + (k / 60) * (resume.dur ?? 1.5); if (climbAt(tk, acts) >= ub) return tk; }
    return 1e9;
  };
  const [gx, gy] = pilePt(u);
  const slope = Math.atan2(pilePt(Math.min(1, u + 0.02))[1] - gy, pilePt(Math.min(1, u + 0.02))[0] - gx) * (180 / Math.PI);
  const ph = u * 70;
  const top = u > 0.985;
  return (
    <g>
      <Ground />
      <Ink pts={[...Array.from({ length: 16 }, (_, i) => pilePt(i / 15).map((v, k) => v + (k ? 6 : 0)) as Pt), [985, GROUND]]} seed={800} w={5} c={C.pencil} />
      {BALLS.map((bl, i) => {
        const [bx, by] = pilePt(bl.u);
        const at = passAt(bl.u);
        const f = ramp(t, at, 0.3);
        const grey = stopped && bl.u <= uHalt + 0.02;
        return f > 0.5
          ? <Note key={i} x={bx + ((i * 37) % 13) - 6} y={by + bl.dy} s={0.75 * Math.min(1.15, pop(t, at, 0.3))} rot={((i * 53) % 30) - 15} seed={810 + i} />
          : <PaperBall key={i} x={bx + ((i * 37) % 13) - 6} y={by + bl.dy} r={bl.r * (1 - f)} seed={810 + i * 3} c={grey ? '#9A9AA8' : C.ink} />;
      })}
      {count && t >= count.t && (() => {
        const v = Math.round(count.value * ease.out3(ramp(t, count.t, count.dur ?? 2)));
        return (
          <g opacity={ramp(t, count.t, 0.15)}>
            <text x={60} y={680} style={{ ...displayCut(800, 75), fontSize: 168 }} fill={C.ink}>{v.toLocaleString('en-US')}</text>
            <Hand x={64} y={750} size={58} c={C.red} anchor="start">failed prototypes</Hand>
            <Hand x={64} y={800} size={44} c={C.ink} anchor="start">— James Dyson's own account</Hand>
          </g>
        );
      })()}
      {stopped && <>
        <Hand x={330} y={990} size={56} c={C.red} rot={-5} opacity={ramp(t, halt!.t + 0.3, 0.2)}>all for nothing?</Hand>
      </>}
      <Guy x={gx} y={gy + 4 + (stopped ? 0 : bob(ph, 5))} s={1.35} seed={850} hero pose={stopped ? POSE.sit() : top ? POSE.cheer(t) : { ...POSE.walk(ph), lean: 10 + Math.max(0, -slope) * 0.3, mood: 'flat' }} />
      {top && <Bulb x={905} y={560} s={1.7 * Math.min(1.1, pop(t, resume ? resume.t + (resume.dur ?? 1.5) * 0.92 : 0, 0.4))} seed={870} />}
    </g>
  );
};

/* ------------------------------------------------------------------ drafts: a writer, a pile of crossed-out endings, up to two counts */
const Sheet: React.FC<{ x: number; y: number; rot?: number; seed?: number; crossed?: boolean; s?: number }> = ({ x, y, rot = 0, seed = 1, crossed = true, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <Ink pts={[[-62, -78], [62, -78], [62, 78], [-62, 78]]} seed={seed} w={4} fill="#FFFFFF" close amp={0.8} />
    {[-50, -30, -10].map((yy, k) => <Ink key={k} pts={[[-44, yy], [40 - k * 10, yy]]} seed={seed + k + 1} w={2.6} c={C.pencil} amp={0.5} />)}
    <text x={0} y={34} textAnchor="middle" style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 34 }} fill={C.ink}>The End</text>
    {crossed && <Ink pts={[[-50, 30], [-10, 20], [30, 32], [52, 22]]} seed={seed + 9} w={5} c={C.red} amp={1} />}
  </g>
);
export const DraftsPanel: React.FC<PanelProps> = ({ t, acts, from }) => {
  const counts = all(acts, 'count').filter((c) => !(c.until != null && t >= c.until));
  const dt = Math.max(0, t - from);
  const writing = Math.sin(t * 14) * 10;
  const fly = (dt % 0.9) / 0.9;
  return (
    <g>
      <Ground />
      {/* the pile of endings that did not make it */}
      {Array.from({ length: 9 }, (_, k) => <Sheet key={k} x={790 + ((k * 37) % 23) - 11} y={1012 - k * 14} rot={((k * 53) % 26) - 13} seed={1000 + k * 7} />)}
      {/* the writer at his desk */}
      <Guy x={230} y={GROUND} s={1.6} seed={1100} hero pose={{ ...POSE.desk(0.25), armR: 75 + writing, mood: 'flat' }} />
      <Ink pts={[[120, 950], [470, 950]]} seed={1110} w={7} />
      <Ink pts={[[150, 950], [150, GROUND]]} seed={1111} w={6} />
      <Ink pts={[[440, 950], [440, GROUND]]} seed={1112} w={6} />
      <Sheet x={380} y={930} rot={-80} s={0.55} seed={1120} crossed={false} />
      {/* one more page leaves the desk for the pile, on a loop */}
      <Sheet x={lerp(400, 790, fly)} y={lerp(930, 905, fly) - Math.sin(fly * Math.PI) * 25} rot={-40 + fly * 380} s={0.6} seed={1130} />
      {counts.slice(0, 2).map((c, i) => {
        if (t < c.t) return null;
        const v = Math.round(c.value * ease.out3(ramp(t, c.t, c.dur ?? 0.8)));
        const x = i === 0 ? 64 : 520;
        return (
          <g key={i} opacity={ramp(t, c.t, 0.15)} transform={`translate(${x} 0)`}>
            <text x={0} y={680} style={{ ...displayCut(800, 75), fontSize: 168 }} fill={i === 0 ? C.ink : C.red}>{v.toLocaleString('en-US')}</text>
            <Hand x={4} y={748} size={50} c={i === 0 ? C.ink : C.red} anchor="start">{c.label}</Hand>
            {c.sub && <Hand x={4} y={796} size={40} c={C.pencil} anchor="start">{c.sub}</Hand>}
          </g>
        );
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ versions: three drafts side by side */
const VX = [190, 485, 770];
export const VersionsPanel: React.FC<PanelProps> = ({ t, acts }) => {
  const drafts = all(acts, 'draft');
  const last = drafts[2];
  return (
    <g>
      <Ground />
      {drafts.slice(0, 3).map((a, i) => {
        const p = pop(t, a.t, 0.35); if (p <= 0) return null;
        const cx = VX[i], tone = a.tone ?? ['messy', 'stiff', 'good'][i];
        return (
          <g key={i}>
            <g transform={`translate(${cx} 800) rotate(${(i - 1) * 3}) scale(${p})`}>
              <Ink pts={[[-120, -170], [120, -170], [120, 170], [-120, 170]]} seed={1200 + i} w={5} fill={tone === 'good' ? '#FFFFFF' : '#FBFAF5'} close />
              <text x={-96} y={-120} style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 40 }} fill={C.pencil}>{`draft ${i + 1}`}</text>
              {tone === 'messy' && Array.from({ length: 6 }, (_, k) => (
                <Ink key={k} pts={Array.from({ length: 7 }, (_, m) => [-95 + m * 30, -70 + k * 38 + ((m + k) % 2 ? -10 : 10)] as Pt)} seed={1210 + k} w={4} c={C.ink} amp={2.5} />
              ))}
              {tone === 'messy' && [0, 1].map((k) => <Ink key={`x${k}`} pts={[[-90, -40 + k * 110], [90, -10 + k * 110]]} seed={1220 + k} w={6} c={C.red} />)}
              {tone === 'stiff' && Array.from({ length: 7 }, (_, k) => <line key={k} x1={-95} y1={-70 + k * 34} x2={95} y2={-70 + k * 34} stroke={C.pencil} strokeWidth={5} />)}
              {tone === 'good' && Array.from({ length: 5 }, (_, k) => <Ink key={k} pts={seg([-95, -70 + k * 40], [95 - (k % 2) * 40, -70 + k * 40], 4)} seed={1230 + k} w={4} c={C.ink} amp={0.8} />)}
              {tone === 'good' && <rect x={-95} y={20} width={150} height={22} fill={C.mint} opacity={0.75} />}
              {tone === 'good' && <Check x={60} y={120} s={1.1} c={C.mint} draw={ramp(t, a.t + 0.3, 0.3)} />}
            </g>
            {t >= a.t + 0.3 && <Hand x={cx} y={1035} size={50} c={tone === 'good' ? C.ink : tone === 'messy' ? C.red : C.pencil} hl={tone === 'good' ? C.mint : undefined} halo>{a.label}</Hand>}
          </g>
        );
      })}
      {last && t >= last.t + 0.35 && <Guy x={VX[2] + 40} y={630} s={0.9} hero seed={1250} pose={POSE.cheer(t)} />}
    </g>
  );
};

/* ------------------------------------------------------------------ rule: one card, turned over on `turn` */
export const RulePanel: React.FC<PanelProps> = ({ t, acts, def, from }) => {
  const turn = one(acts, 'turn');
  const k = turn ? ramp(t, turn.t, 0.5) : 0;
  const back = k >= 0.5;
  const sx = Math.abs(Math.cos(k * Math.PI));
  const inP = pop(t, from + 0.1, 0.4);
  const side = back ? { small: def.backSmall ?? 'out here', text: def.back ?? '', fill: C.mint, c: C.ink } : { small: def.frontSmall ?? 'at school', text: def.front ?? '', fill: '#FFFFFF', c: C.red };
  const lines = String(side.text).split('\n');
  return (
    <g>
      <Ground />
      <g transform={`translate(520 840) scale(${sx * inP} ${inP}) rotate(${back ? 2 : -2})`}>
        <rect x={-372} y={-212} width={760} height={440} fill="rgba(0,0,0,0.12)" />
        <Ink pts={[[-380, -220], [380, -220], [380, 220], [-380, 220]]} seed={1300} w={6} fill={side.fill} close />
        <text x={-330} y={-150} style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 54 }} fill={C.pencil}>{side.small}</text>
        {lines.map((l, i) => <text key={i} x={0} y={-20 + i * 120 - (lines.length - 1) * 30} textAnchor="middle" style={{ ...displayCut(800, 75), fontSize: 112 }} fill={side.c}>{l}</text>)}
      </g>
      <Guy x={150} y={GROUND} s={1.3} hero seed={1310} pose={back ? POSE.cheer(t) : { ...POSE.stand(t), armR: 120, mood: 'flat' }} />
    </g>
  );
};

/* ------------------------------------------------------------------ plane: a doodled bomber (top view), holes, tape, the missing spots */
const PL = { cx: 540, cy: 800 };
const pl = (x: number, y: number): Pt => [PL.cx + x, PL.cy + y];
const PL_FUS: Pt[] = [[0, -300], [30, -270], [36, -150], [34, 230], [18, 280], [0, 290], [-18, 280], [-34, 230], [-36, -150], [-30, -270]].map(([x, y]) => pl(x, y));
const PL_WING_R: Pt[] = [[34, -70], [430, -20], [430, 30], [34, 40]].map(([x, y]) => pl(x, y));
const PL_WING_L: Pt[] = [[-34, -70], [-430, -20], [-430, 30], [-34, 40]].map(([x, y]) => pl(x, y));
const PL_TAIL: Pt[] = [[34, 210], [160, 240], [160, 268], [34, 262], [-34, 262], [-160, 268], [-160, 240], [-34, 210]].map(([x, y]) => pl(x, y));
const PL_ENG: Pt[] = [[-265, -55], [-135, -70], [135, -70], [265, -55]].map(([x, y]) => pl(x, y));
const PL_HOLES: Pt[] = (() => {
  const out: Pt[] = [];
  for (let i = 0; out.length < 34 && i < 900; i++) {
    const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1, u = Math.abs(Math.sin(i * 78.233) * 12345.678) % 1, v = Math.abs(Math.sin(i * 39.425) * 9876.54) % 1;
    let x = 0, y = 0;
    if (r < 0.6) { const sd = u < 0.5 ? -1 : 1; x = sd * (60 + v * 350); y = -40 + (Math.abs(x) - 60) * 0.1 + ((i * 37) % 50); }
    else if (r < 0.8) { x = (u - 0.5) * 44; y = -110 + v * 300; }
    else { const sd = u < 0.5 ? -1 : 1; x = sd * (45 + v * 100); y = 222 + ((i * 13) % 30); }
    if ([[-265, -55], [-135, -70], [135, -70], [265, -55]].some(([ex, ey]) => Math.abs(x - ex) < 46 && Math.abs(y - ey) < 52)) continue;
    out.push(pl(x, y));
  }
  return out;
})();
export const PlanePanel: React.FC<PanelProps> = ({ t, acts }) => {
  const holes = one(acts, 'holes'), circle = one(acts, 'circle'), ghost = one(acts, 'ghost');
  const live = (a?: A) => !!a && t >= a.t && !(a.until != null && t >= a.until);
  const patches = all(acts, 'patch').filter((a) => live(a));
  const tape = (part: string) => { const a = patches.find((x) => x.part === part); return a ? Math.min(1.1, pop(t, a.t, 0.3)) : 0; };
  const Tape: React.FC<{ x: number; y: number; w: number; h: number; rot: number; k: number }> = ({ x, y, w, h, rot, k }) => k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}><rect x={-w / 2} y={-h / 2} width={w} height={h} fill={C.tape} stroke="rgba(120,90,30,0.4)" strokeWidth={2} /></g>
  );
  return (
    <g>
      {live(ghost) && (() => {
        const g = ramp(t, ghost!.t, 2.4);
        return (
          <g transform={`translate(${250 - 120 * g} ${600 + 560 * g * g}) rotate(${-20 - 70 * g}) scale(0.34) translate(${-PL.cx} ${-PL.cy})`} opacity={Math.min(1, 3 * (1 - g))}>
            {[PL_FUS, PL_WING_R, PL_WING_L, PL_TAIL].map((pts, i) => <Ink key={i} pts={pts} seed={2000 + i} w={9} c={C.pencil} close dash="18 14" />)}
            {PL_ENG.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={26} fill={C.red} />)}
          </g>
        );
      })()}
      {live(ghost) && <Hand x={64} y={500} size={58} c={C.red} anchor="start" rot={-4} opacity={ramp(t, ghost!.t + 0.3, 0.3)} halo>never came back</Hand>}
      <Ink pts={PL_WING_L} seed={2010} w={7} fill="#FFFFFF" close />
      <Ink pts={PL_WING_R} seed={2011} w={7} fill="#FFFFFF" close />
      <Ink pts={PL_TAIL} seed={2012} w={7} fill="#FFFFFF" close />
      <Ink pts={PL_FUS} seed={2013} w={7} fill="#FFFFFF" close />
      {PL_ENG.map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={30} seed={2020 + i} w={6} fill={C.paper} />)}
      <Ink pts={[pl(-14, -255), pl(14, -255), pl(12, -228), pl(-12, -228)]} seed={2030} w={4} close fill="#D9ECF7" amp={0.6} />
      <Tape x={pl(-230, 0)[0]} y={pl(-230, 0)[1]} w={260} h={60} rot={-6} k={tape('wings')} />
      <Tape x={pl(230, 0)[0]} y={pl(230, 0)[1]} w={260} h={60} rot={5} k={tape('wings')} />
      <Tape x={pl(0, 240)[0]} y={pl(0, 240)[1]} w={300} h={52} rot={-3} k={tape('tail')} />
      {holes && t >= holes.t && !(holes.until != null && t >= holes.until) && PL_HOLES.map(([x, y], i) => {
        const at = holes.t + (i / PL_HOLES.length) * (holes.dur ?? 1.0);
        if (t < at) return null;
        const k = Math.min(1.3, pop(t, at, 0.2));
        return <g key={i}><circle cx={x} cy={y} r={9 * k} fill={C.red} /><circle cx={x - 2} cy={y - 2} r={3 * k} fill="#FFFFFF" opacity={0.6} /></g>;
      })}
      {live(circle) && <>
        {PL_ENG.map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={50} seed={2040 + i} w={7} c={C.red} draw={ramp(t, circle!.t + i * 0.12, 0.3)} />)}
        <Hand x={760} y={640} size={58} c={C.red} rot={-3} opacity={ramp(t, circle!.t + 0.5, 0.25)} halo>no holes here?!</Hand>
      </>}
    </g>
  );
};

/* ------------------------------------------------------------------ gym: 1,024 students flip a coin, tails sit down */
const GN = 1024, GC = 32, GS = 18, GX = 540, GY = 862;
const GRANK: number[] = (() => { const ids = Array.from({ length: GN }, (_, i) => i); ids.sort((a, b) => (Math.abs(Math.sin(a * 91.7 + 3) * 4375.85) % 1) - (Math.abs(Math.sin(b * 91.7 + 3) * 4375.85) % 1)); const r = new Array(GN); ids.forEach((id, k) => { r[id] = k; }); return r; })();
const gOut = (i: number) => { const k = GRANK[i]; if (k === 0) return 99; let r = 1; while ((k & ((1 << r) - 1)) === 0) r++; return r; };
const gXY = (i: number): Pt => [GX + ((i % GC) - (GC - 1) / 2) * GS, GY + (Math.floor(i / GC) - (GC - 1) / 2) * GS];
const GWIN = GRANK.indexOf(0);
const gRound = (t: number, acts: A[]) => { const r = acts.find((a) => a.type === 'rounds'); return r && t >= r.t ? Math.min(10, Math.floor((t - r.t) / ((r.dur ?? 4) / 10)) + 1) : 0; };
export const GymPanel: React.FC<PanelProps> = ({ t, acts }) => {
  const spawn = one(acts, 'spawn'), winner = one(acts, 'winner');
  if (!spawn || t < spawn.t) return <g><Ground /></g>;
  const round = gRound(t, acts);
  const rr = acts.find((a) => a.type === 'rounds');
  const per = (rr?.dur ?? 4) / 10;
  const w = winner && t >= winner.t ? ease.back(ramp(t, winner.t, 0.5), 1.3) : 0;
  const [wx, wy] = gXY(GWIN);
  const alive = GN >> round;
  return (
    <g>
      <text x={60} y={520} style={{ ...displayCut(800, 75), fontSize: 140 }} fill={round >= 10 ? C.red : C.ink}>{alive.toLocaleString('en-US')}</text>
      <Hand x={64} y={566} size={50} c={C.red} anchor="start">{round === 0 ? 'students, all standing' : round >= 10 ? 'ten heads in a row' : `still standing · flip ${round}`}</Hand>
      {Array.from({ length: GN }, (_, i) => {
        if (i === GWIN) return null;
        const [x, y] = gXY(i);
        const born = spawn.t + (Math.hypot(x - GX, y - GY) / 420) * 0.8;
        if (t < born) return null;
        const out = gOut(i);
        const down = round >= out;
        const tOut = rr ? rr.t + (out - 1) * per : 1e9;
        const k = down ? ramp(t, tOut, 0.25) : 0;
        return down
          ? <line key={i} x1={x - 4} y1={y + 2} x2={x + 4} y2={y + 2} stroke={C.pencil} strokeWidth={2} opacity={0.35 + 0.65 * (1 - k)} />
          : <circle key={i} cx={x} cy={y} r={6 * Math.min(1, pop(t, born, 0.2))} fill={C.paper} stroke={C.ink} strokeWidth={2.4} />;
      })}
      {w > 0
        ? <Guy x={lerp(wx, GX, Math.min(1, w))} y={lerp(wy, 1100, Math.min(1, w))} s={0.4 + 1.2 * Math.min(1, w)} hero seed={2100} pose={POSE.cheer(t)}>
            {(j) => <g transform={`translate(${j.head[0]} ${j.head[1] - 30})`}><Ink pts={[[-22, 6], [-26, -18], [-10, -4], [0, -24], [10, -4], [26, -18], [22, 6]]} seed={2101} w={4} fill={C.hl} close amp={0.6} /></g>}
          </Guy>
        : <circle cx={wx} cy={wy} r={6.5} fill={C.hl} stroke={C.ink} strokeWidth={2.6} />}
    </g>
  );
};

/* ------------------------------------------------------------------ stage: the lucky winner gives a talk; the 1,023 who sat down */
export const StagePanel: React.FC<PanelProps> = ({ t, acts, def }) => {
  const secret = one(acts, 'secret'), crowd = one(acts, 'crowd');
  const live = (a?: A) => !!a && t >= a.t && !(a.until != null && t >= a.until);
  return (
    <g>
      {/* spotlight */}
      <path d="M 470 360 L 260 1000 L 820 1000 L 610 360 Z" fill={C.hl} opacity={0.22} />
      <Ink pts={[[200, 1000], [880, 1000], [880, 1050], [200, 1050]]} seed={2200} w={6} fill="#EDE6D2" close />
      <Guy x={540} y={1000} s={1.55} hero seed={2210} pose={{ ...POSE.stand(t), armR: 150 + Math.sin(t * 5) * 12, armL: 40, mood: 'smile' }}>
        {(j) => <g>
          <g transform={`translate(${j.head[0]} ${j.head[1] - 30})`}><Ink pts={[[-22, 6], [-26, -18], [-10, -4], [0, -24], [10, -4], [26, -18], [22, 6]]} seed={2211} w={4} fill={C.hl} close amp={0.6} /></g>
          <g transform={`translate(${j.handL[0]} ${j.handL[1]})`}><Ink pts={[[0, 0], [10, -30]]} seed={2212} w={5} /><Circle cx={12} cy={-38} r={10} seed={2213} w={4} fill={C.ink} /></g>
        </g>}
      </Guy>
      {live(secret) && (
        <g transform={`translate(540 520) scale(${Math.min(1.05, pop(t, secret!.t, 0.35))}) rotate(-2)`}>
          <Ink pts={[[-300, -70], [300, -70], [300, 70], [-300, 70]]} seed={2220} w={5} fill="#FFFFFF" close />
          <Hand x={0} y={-10} size={50} c={C.pencil}>{def.secretSmall ?? 'my secret:'}</Hand>
          <Hand x={0} y={48} size={70} c={C.red}>{def.secret ?? 'lucky socks'}</Hand>
        </g>
      )}
      {/* the ones who sat down, in front of the stage */}
      {live(crowd) && Array.from({ length: 40 }, (_, i) => {
        const row = Math.floor(i / 10), col = i % 10;
        const x = 120 + col * 92 + (row % 2) * 40, y = 1085 + row * 26;
        const at = crowd!.t + (col + row * 2) * 0.03;
        if (t < at || x > 1000) return null;
        return <g key={i} opacity={ramp(t, at, 0.2)}><Circle cx={x} cy={y} r={15} seed={2300 + i} w={3.5} c={C.pencil} fill={C.paper} /></g>;
      })}
      {live(crowd) && <Hand x={540} y={1160} size={58} c={C.red} halo opacity={ramp(t, crowd!.t + 0.4, 0.25)}>{def.crowdLabel ?? '1,023 who sat down'}</Hand>}
    </g>
  );
};

/* ------------------------------------------------------------------ tryout: the team list, a short kid and a tall friend, the "cut" that wasn't */
const BOARD = { x: 560, y: 650, w: 370, h: 300 };
export const TryoutPanel: React.FC<PanelProps> = ({ t, acts, def }) => {
  const live = (a?: A) => !!a && t >= a.t && !(a.until != null && t >= a.until);
  const stamp = one(acts, 'stamp'), unstamp = one(acts, 'unstamp'), height = one(acts, 'height'), cry = one(acts, 'cry'), practice = one(acts, 'practice'), bubble = one(acts, 'bubble');
  const sad = live(cry) && !live(practice);
  const shooting = live(practice);
  const ph = shooting ? (t - practice!.t) % 1.1 / 1.1 : 0;
  const shots = shooting ? Math.floor((t - practice!.t) / 1.1) + 1 : 0;
  const hero: Pose = shooting ? { ...POSE.stand(t), armR: ph < 0.25 ? 170 : 150 - ph * 60, armL: ph < 0.25 ? 160 : 40, mood: 'flat' } : sad ? { ...POSE.stand(t), armL: 10, armR: -10, tilt: 16, mood: 'sad' } : { ...POSE.stand(t), mood: 'flat' };
  return (
    <g>
      <Ground />
      {/* the team list pinned on the wall */}
      <Ink pts={[[BOARD.x, BOARD.y], [BOARD.x + BOARD.w, BOARD.y], [BOARD.x + BOARD.w, BOARD.y + BOARD.h], [BOARD.x, BOARD.y + BOARD.h]]} seed={3000} w={5} fill="#FFFFFF" close />
      <circle cx={BOARD.x + BOARD.w / 2} cy={BOARD.y + 8} r={9} fill={C.red} />
      <Hand x={BOARD.x + 30} y={BOARD.y + 64} size={46} anchor="start">{def.colA ?? 'Varsity'}</Hand>
      <Hand x={BOARD.x + 210} y={BOARD.y + 64} size={46} anchor="start">{def.colB ?? 'JV'}</Hand>
      {[0, 1, 2, 3, 4].map((k) => <Ink key={k} pts={[[BOARD.x + 30, BOARD.y + 110 + k * 42], [BOARD.x + 150 - (k % 2) * 20, BOARD.y + 110 + k * 42]]} seed={3010 + k} w={3} c={C.pencil} amp={0.5} />)}
      {[0, 1, 2, 3, 4].map((k) => k === 2
        ? <Hand key={k} x={BOARD.x + 210} y={BOARD.y + 122 + k * 42} size={40} c={C.ink} anchor="start" hl={live(unstamp) ? C.hl : undefined}>{def.name ?? 'Michael'}</Hand>
        : <Ink key={k} pts={[[BOARD.x + 210, BOARD.y + 110 + k * 42], [BOARD.x + 330 - (k % 2) * 25, BOARD.y + 110 + k * 42]]} seed={3020 + k} w={3} c={C.pencil} amp={0.5} />)}
      {live(stamp) && (() => {
        const k = Math.min(1.15, pop(t, stamp!.t, 0.25)), x = live(unstamp) ? ease.out3(ramp(t, unstamp!.t, 0.3)) : 0;
        return (
          <g transform={`translate(${BOARD.x + BOARD.w / 2} ${BOARD.y + BOARD.h / 2}) rotate(-12) scale(${k * (1 + (1 - Math.min(1, k)) * 0.6)})`}>
            <rect x={-140} y={-62} width={280} height={124} rx={12} fill="none" stroke={C.red} strokeWidth={10} opacity={0.9} />
            <text x={0} y={34} textAnchor="middle" style={{ ...displayCut(800, 75), fontSize: 110 }} fill={C.red} opacity={0.9}>CUT</text>
            {x > 0 && <Ink pts={[[-160, -30], [-80, 20], [0, -20], [80, 30], [160, -10]]} seed={3030} w={12} c={C.ink} draw={x} />}
          </g>
        );
      })()}
      {live(unstamp) && <Hand x={BOARD.x + BOARD.w / 2} y={BOARD.y + BOARD.h + 70} size={64} c={C.ink} hl={C.mint} opacity={ramp(t, unstamp!.t + 0.3, 0.2)}>{def.truth ?? 'not cut: JV'}</Hand>}
      {/* the two friends */}
      <Guy x={190} y={GROUND} s={1.3} hero seed={3040} pose={hero} />
      <Guy x={390} y={GROUND} s={1.75} c={C.pencil} seed={3050} pose={{ ...POSE.stand(t, 1), mood: 'smile' }} />
      {live(height) && <>
        <Hand x={190} y={790} size={52} c={C.red} opacity={ramp(t, height!.t, 0.2)}>{def.heightA ?? `5'9"`}</Hand>
        <Hand x={330} y={668} size={52} c={C.ink} opacity={ramp(t, height!.t + 0.3, 0.2)}>{def.heightB ?? `6'7"`}</Hand>
      </>}
      {sad && [0, 1].map((k) => { const p = ((t - cry!.t) * 0.9 + k * 0.5) % 1; return <Ink key={k} pts={[[205 + k * 18, 860 + p * 60], [200 + k * 18, 878 + p * 60], [210 + k * 18, 878 + p * 60]]} seed={3060 + k} w={3} c="#4A8FD9" fill="#BFE0FF" close amp={0.4} />; })}
      {/* practice: the ball goes up again and again, the tally grows */}
      {shooting && (() => {
        const bx = lerp(250, 470, ph), by = 820 - Math.sin(ph * Math.PI) * 330;
        return <g>
          <Ink pts={[[440, 600], [520, 600]]} seed={3070} w={6} c={C.red} />
          <Ink pts={[[445, 604], [460, 650], [500, 650], [515, 604]]} seed={3071} w={3} c={C.pencil} />
          <Circle cx={bx} cy={by} r={20} seed={3072} w={4} fill="#F08A3C" />
          <Hand x={64} y={1150} size={56} c={C.ink} anchor="start">{'practice: ' + '|'.repeat(Math.min(14, shots + 3))}</Hand>
        </g>;
      })()}
      {live(bubble) && (
        <g opacity={ramp(t, bubble!.t, 0.2)}>
          <Ink pts={[[60, 470], [470, 470], [470, 580], [260, 580], [220, 630], [215, 580], [60, 580]]} seed={3080} w={5} fill="#FFFFFF" close />
          <Hand x={265} y={545} size={60} c={C.ink}>{def.quote ?? '"I got cut."'}</Hand>
        </g>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ nos: letters come back stamped NO, then a kid asks for more */
export const NosPanel: React.FC<PanelProps> = ({ t, acts, def }) => {
  const live = (a?: A) => !!a && t >= a.t && !(a.until != null && t >= a.until);
  const nos = one(acts, 'nos'), kid = one(acts, 'kid'), more = one(acts, 'more'), book = one(acts, 'book');
  const n = nos ? nos.count ?? 12 : 0;
  const got = nos && t >= nos.t ? Math.min(n, Math.floor((t - nos.t) / ((nos.dur ?? 2.4) / n)) + 1) : 0;
  return (
    <g>
      <Ground />
      <Guy x={170} y={GROUND} s={1.45} hero seed={3100} pose={{ ...POSE.desk(live(kid) ? 0 : Math.min(0.6, got / 20)), armR: 75 + Math.sin(t * 12) * 8, mood: live(more) ? 'smile' : got > 6 ? 'sad' : 'flat' }} />
      <Ink pts={[[70, 950], [380, 950]]} seed={3110} w={7} />
      <Ink pts={[[100, 950], [100, GROUND]]} seed={3111} w={6} />
      <Ink pts={[[350, 950], [350, GROUND]]} seed={3112} w={6} />
      {/* the rejection letters pile up */}
      {Array.from({ length: got }, (_, k) => {
        const x = 520 + ((k * 41) % 90) - 45, y = 1060 - k * 22;
        const p = nos ? ramp(t, nos.t + k * ((nos.dur ?? 2.4) / n), 0.25) : 1;
        return (
          <g key={k} transform={`translate(${lerp(900, x, ease.out3(p))} ${lerp(500, y, ease.out3(p))}) rotate(${((k * 29) % 24) - 12})`}>
            <Ink pts={[[-70, -40], [70, -40], [70, 40], [-70, 40]]} seed={3120 + k} w={3.5} fill="#FFFFFF" close amp={0.6} />
            <Ink pts={[[-70, -40], [0, 5], [70, -40]]} seed={3140 + k} w={2.5} c={C.pencil} amp={0.5} />
            <text x={0} y={22} textAnchor="middle" style={{ ...displayCut(800, 75), fontSize: 44 }} fill={C.red}>NO</text>
          </g>
        );
      })}
      {got > 0 && !live(kid) && <Hand x={520} y={720} size={64} c={C.red}>{`no. ${got}`}</Hand>}
      {/* the boss hands the chapters to his daughter */}
      {live(kid) && (() => {
        const k = ease.out3(ramp(t, kid!.t, 0.6));
        return <g opacity={k}>
          <Guy x={700} y={GROUND} s={1.5} c={C.pencil} seed={3160} pose={{ ...POSE.stand(t), armR: 70, mood: 'flat' }} />
          <Guy x={860} y={GROUND} s={0.95} hero seed={3170} pose={{ ...POSE.stand(t), armL: 70, armR: 80, mood: live(more) ? 'smile' : 'o' }}>
            {(j) => <g transform={`translate(${j.handR[0] + 6} ${j.handR[1] - 10}) rotate(-10)`}><Ink pts={[[-30, -40], [30, -40], [30, 30], [-30, 30]]} seed={3175} w={3.5} fill="#FFFFFF" close amp={0.5} />{[-24, -10, 4].map((yy, i) => <line key={i} x1={-20} y1={yy} x2={20} y2={yy} stroke={C.pencil} strokeWidth={2.5} />)}</g>}
          </Guy>
        </g>;
      })()}
      {live(more) && (
        <g transform={`translate(760 640) scale(${Math.min(1.1, pop(t, more!.t, 0.35))})`}>
          <Ink pts={[[-150, -70], [150, -70], [150, 50], [30, 50], [0, 100], [-10, 50], [-150, 50]]} seed={3180} w={5} fill="#FFFFFF" close />
          <text x={0} y={18} textAnchor="middle" style={{ ...displayCut(800, 75), fontSize: 92 }} fill={C.red}>{def.moreText ?? 'MORE!'}</text>
        </g>
      )}
      {live(book) && (
        <g transform={`translate(420 640) rotate(-6) scale(${Math.min(1.1, pop(t, book!.t, 0.4))})`}>
          <Ink pts={[[-130, -170], [130, -170], [130, 170], [-130, 170]]} seed={3190} w={6} fill="#C9372C" close />
          <Ink pts={[[-110, -170], [-110, 170]]} seed={3191} w={4} c="#7A1F18" />
          <text x={10} y={-40} textAnchor="middle" style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 64 }} fill="#FFE04A">{def.bookA ?? 'Harry'}</text>
          <text x={10} y={30} textAnchor="middle" style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 64 }} fill="#FFE04A">{def.bookB ?? 'Potter'}</text>
          <Ink pts={[[-20, 80], [0, 110], [20, 80], [40, 110]]} seed={3192} w={4} c="#FFE04A" />
        </g>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ late: an age line to 62, a contract, and a number with no source */
export const LatePanel: React.FC<PanelProps> = ({ t, acts, def }) => {
  const live = (a?: A) => !!a && t >= a.t && !(a.until != null && t >= a.until);
  const age = one(acts, 'age'), sign = one(acts, 'sign'), myth = one(acts, 'myth');
  const target = def.age ?? 62;
  const a = age && t >= age.t ? target * ease.inOut3(ramp(t, age.t, age.dur ?? 2.4)) : 0;
  const X0 = 110, X1 = 960, Y = 1000;
  const ax = X0 + (X1 - X0) * (a / 80);
  return (
    <g>
      <Ink pts={seg([X0, Y], [X1, Y], 12)} seed={3200} w={5} c={C.ink} />
      {[0, 10, 20, 30, 40, 50, 60, 70, 80].map((k) => <g key={k}><Ink pts={[[X0 + (X1 - X0) * (k / 80), Y - 12], [X0 + (X1 - X0) * (k / 80), Y + 12]]} seed={3210 + k} w={3} c={C.pencil} amp={0.4} /><Hand x={X0 + (X1 - X0) * (k / 80)} y={Y + 56} size={38} c={C.pencil}>{String(k)}</Hand></g>)}
      <Hand x={X1 - 10} y={Y + 104} size={40} c={C.pencil} anchor="end">age</Hand>
      <Guy x={ax} y={Y - 4 + (age && a < target ? bob(t * 9, 5) : 0)} s={1.25} hero seed={3220} pose={age && a < target - 0.5 ? POSE.walk(t * 9) : live(sign) ? POSE.cheer(t) : POSE.stand(t)} />
      {a > 1 && <text x={64} y={700} style={{ ...displayCut(800, 75), fontSize: 150 }} fill={C.ink}>{`age ${Math.round(a)}`}</text>}
      {live(sign) && (
        <g transform={`translate(780 700) rotate(4) scale(${Math.min(1.08, pop(t, sign!.t, 0.35))})`}>
          <Ink pts={[[-150, -130], [150, -130], [150, 130], [-150, 130]]} seed={3230} w={5} fill="#FFFFFF" close />
          <Hand x={0} y={-74} size={42} c={C.ink}>{def.contract ?? 'franchise deal'}</Hand>
          {[-30, -2, 26].map((yy, i) => <line key={i} x1={-110} y1={yy} x2={110 - i * 30} y2={yy} stroke={C.pencil} strokeWidth={3} />)}
          <Ink pts={[[-100, 90], [-60, 64], [-30, 96], [10, 66], [40, 94], [90, 70]]} seed={3231} w={5} c={C.ink} draw={ramp(t, sign!.t + 0.3, 0.5)} />
          <Hand x={0} y={170} size={44} c={C.red}>{def.year ?? '#1 · 1952'}</Hand>
        </g>
      )}
      {live(myth) && (() => {
        const o = ramp(t, myth!.t, 0.2), q = ramp(t, myth!.t + 1.2, 0.3);
        return <g opacity={o}>
          <rect x={50} y={420} width={575} height={320} fill={C.paper} />
          <text x={80} y={560} style={{ ...displayCut(800, 75), fontSize: 130 }} fill={C.red} opacity={1 - q * 0.45}>{def.mythText ?? '1,009 NO’S'}</text>
          {q > 0 && <Ink pts={[[70, 520], [380, 500], [690, 530]]} seed={3240} w={11} c={C.ink} draw={q} />}
          <Hand x={84} y={640} size={54} c={C.ink} anchor="start" opacity={q}>{def.mythNote ?? 'source? nobody can find one'}</Hand>
          <g transform="translate(560 690)" opacity={q}><Circle cx={0} cy={0} r={34} seed={3241} w={6} /><Ink pts={[[24, 24], [62, 62]]} seed={3242} w={9} /></g>
        </g>;
      })()}
    </g>
  );
};

/* ------------------------------------------------------------------ shrink: three big legends shrink into the small true versions */
export const ShrinkPanel: React.FC<PanelProps> = ({ t, acts, def }) => {
  const live = (a?: A) => !!a && t >= a.t && !(a.until != null && t >= a.until);
  const legends = one(acts, 'legends');
  const shrinks = all(acts, 'shrink');
  const big: string[] = def.big ?? ['CUT!', '12 NO’S', '1,009 NO’S'];
  const small: string[] = def.small ?? ['JV team', 'a pile of no’s', 'a late start'];
  if (!live(legends)) return <g><Ground /></g>;
  return (
    <g>
      <Ground />
      {big.map((b, i) => {
        const s = shrinks[i] && t >= shrinks[i].t ? ease.inOut3(ramp(t, shrinks[i].t, 0.5)) : 0;
        const y = 640 + i * 170, x = 540;
        const k = Math.min(1.08, pop(t, legends!.t + i * 0.15, 0.35));
        return (
          <g key={i}>
            <g transform={`translate(${x} ${y}) scale(${k * (1 - 0.75 * s)}) rotate(${(i - 1) * 3})`} opacity={1 - s}>
              <text x={0} y={40} textAnchor="middle" style={{ ...displayCut(800, 75), fontSize: 140 }} fill={C.red}>{b}</text>
            </g>
            {s > 0 && <g opacity={s} transform={`translate(${x} ${y}) rotate(${(i - 1) * -3})`}>
              <Ink pts={[[-170, -46], [170, -46], [170, 46], [-170, 46]]} seed={3300 + i} w={4} fill={C.note} close />
              <Hand x={0} y={18} size={56} c={C.ink}>{small[i]}</Hand>
            </g>}
          </g>
        );
      })}
    </g>
  );
};

export const PANELS: Record<string, React.FC<PanelProps>> = { duel: DuelPanel, race: RacePanel, class: ClassPanel, bin: BinPanel, shop: ShopPanel, pile: PilePanel, drafts: DraftsPanel, versions: VersionsPanel, rule: RulePanel, plane: PlanePanel, gym: GymPanel, stage: StagePanel, tryout: TryoutPanel, nos: NosPanel, late: LatePanel, shrink: ShrinkPanel };
export { joints };
