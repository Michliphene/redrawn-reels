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
export const DuelPanel: React.FC<PanelProps> = ({ t, acts }) => {
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
          return <g key={i}>{p < 1 && <Plaster x={x} y={y} rot={rot * (1 - p)} opacity={1 - p} s={0.75} />}{p > 0 && <Bulb x={x} y={y} s={0.48 * Math.min(1.15, pop(t, L!.t + i * 0.06, 0.4))} seed={140 + i} />}</g>;
        })}
      </Guy>
      <Guy x={RX} y={GROUND - 62} s={s} pose={rp} seed={160}>
        {(j) => (
          <g transform={`translate(${j.handR[0]} ${j.handR[1] - (dim ? 0 : 28)}) rotate(${dim ? 70 : 0})`}>
            <Ink pts={[[-30, -40], [30, -40], [30, 34], [-30, 34]]} seed={170} w={4} fill="#FFFFFF" close amp={0.6} />
            <text x={0} y={18} textAnchor="middle" style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 52 }} fill={C.red}>A+</text>
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
            <text x={hx - 55} y={hy - 125} textAnchor="middle" style={{ ...displayCut(800, 75), fontSize: 92 }} fill={C.red} transform={`scale(1)`}>0</text>
          </g>
        );
      })()}
      <Hand x={530} y={890} size={86} c={C.red} rot={-6}>vs.</Hand>
      <Hand x={LX} y={1150} size={62} c={lit ? C.ink : C.red} hl={lit ? C.mint : undefined}>{lit ? '10 lessons' : '10 failures'}</Hand>
      <Hand x={RX - 10} y={1150} size={62} c={dim ? C.red : C.ink}>{dim ? '0 lessons' : 'perfect record'}</Hand>
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
export const BinPanel: React.FC<PanelProps> = ({ t, acts, from }) => {
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
      <Hand x={bin[0]} y={905} size={60} c={C.red}>mistakes</Hand>
      {ign && t >= ign.t && <>
        <Ink pts={[[bin[0] - 110, 890], [bin[0] - 60, 875], [bin[0] - 10, 895], [bin[0] + 40, 875], [bin[0] + 110, 888]]} seed={545} w={7} c={C.ink} draw={ramp(t, ign.t, 0.3)} />
        <Hand x={bin[0]} y={835} size={54} c={C.ink} opacity={ramp(t, ign.t + 0.25, 0.2)}>nobody counts these</Hand>
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
        <Hand x={660} y={640} size={64} hl={C.mint} opacity={ramp(t, tf + 0.55, 0.2)}>what works</Hand>
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

export const PANELS: Record<string, React.FC<PanelProps>> = { duel: DuelPanel, race: RacePanel, class: ClassPanel, bin: BinPanel, shop: ShopPanel, pile: PilePanel };
export { joints };
