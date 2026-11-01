import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/google-fonts/PermanentMarker';
import falas from './falas.json';
import env from './env.json';
import {C, FONT} from '../theme';

// "Gravei escondido, vale como prova?": bonecos minimalistas (Ana e Carlos), duas vozes e música livre.
// Linha do tempo gerada por voz/gerar_gravacao.py (falas.json).

const marker = loadFont();

type Clip = {n: number; at: number; frames: number; src: string; quem: 'A' | 'C'; texto: string; cena: string};
const D = falas as unknown as {capa: number; outro: number; total: number; clips: Clip[]; cenas: {id: string; ini: number; fim: number}[]};
export const GRAVACAO_TOTAL = D.total;
const clip = (n: number) => D.clips[n];
const END = (n: number) => D.clips[n].at + D.clips[n].frames;

const Ctx = createContext(0);
const useG = () => useCurrentFrame() + useContext(Ctx);
const speaking = (n: number, g: number) => g >= clip(n).at && g < END(n);
// Abertura da boca (0 a 1) a partir do volume real da fala, atualizada a 15 quadros por segundo.
const ENV = env as unknown as Record<string, number[]>;
const lvl = (ns: number[], g: number) => {
  const fr = g - (g % 2);
  for (const n of ns) {
    const c = clip(n);
    const i = fr - c.at;
    if (i >= 0 && i < c.frames) {
      const e = ENV[String(n)] ?? [];
      const v = 0.5 * (e[i] ?? 0) + 0.3 * (e[i - 1] ?? 0) + 0.2 * (e[i - 2] ?? 0);
      return Math.max(0, Math.min(1, (v - 0.08) / 0.75));
    }
  }
  return 0;
};

// ─── Poses (ângulos em graus a partir de "pendurado"; positivo = para o lado em que o boneco olha) ───
type Pose = {t: number; a1: number; a2: number; b1: number; b2: number; l1: number; l2: number; m1: number; m2: number};
const POSE: Record<string, Pose> = {
  idle: {t: 0, a1: 10, a2: 18, b1: -10, b2: -16, l1: 4, l2: 2, m1: -4, m2: -2},
  phone: {t: 0, a1: 70, a2: 165, b1: -8, b2: -14, l1: 6, l2: 0, m1: -8, m2: -2},
  angry: {t: -3, a1: 140, a2: 170, b1: -140, b2: -170, l1: 8, l2: 0, m1: -8, m2: 0},
  point: {t: 3, a1: 100, a2: 96, b1: -30, b2: 40, l1: 6, l2: 2, m1: -6, m2: -2},
  shrug: {t: 0, a1: 55, a2: 125, b1: -55, b2: -125, l1: 4, l2: 0, m1: -4, m2: 0},
  worry: {t: -4, a1: 14, a2: 22, b1: -14, b2: -22, l1: 3, l2: 2, m1: -3, m2: -2},
  sneak: {t: 14, a1: 40, a2: 150, b1: -24, b2: -50, l1: 30, l2: -8, m1: -22, m2: 8},
  grab: {t: 6, a1: 95, a2: 100, b1: -10, b2: -14, l1: 8, l2: 0, m1: -8, m2: -2},
  post: {t: -2, a1: 120, a2: 175, b1: -12, b2: -18, l1: 6, l2: 0, m1: -6, m2: 0},
};
const ease = (x: number) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const mix = (a: Pose, b: Pose, k: number): Pose => {
  const o: Record<string, number> = {};
  (Object.keys(a) as (keyof Pose)[]).forEach((key) => {
    o[key] = a[key] + (b[key] - a[key]) * k;
  });
  return o as unknown as Pose;
};
const poseAt = (f: number, keys: [number, string][]): Pose => {
  if (f <= keys[0][0]) return POSE[keys[0][1]];
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i][0]) {
      const [f0, p0] = keys[i - 1];
      const [f1, p1] = keys[i];
      return mix(POSE[p0], POSE[p1], ease((f - f0) / Math.max(1, f1 - f0)));
    }
  }
  return POSE[keys[keys.length - 1][1]];
};

// ─── Boneco ───
type FaceT = 'neutral' | 'smirk' | 'angry' | 'worry' | 'smile';
type Kind = 'ana' | 'carlos' | 'bia';
const COR: Record<Kind, string> = {ana: C.ice, carlos: '#FFFFFF', bia: '#8FA0C8'};
const pt = (x: number, y: number, len: number, ang: number): [number, number] => [x + len * Math.sin((ang * Math.PI) / 180), y + len * Math.cos((ang * Math.PI) / 180)];
const GROUND = 745;

const FaceSvg: React.FC<{c: [number, number]; col: string; face: FaceT; level: number}> = ({c, col, face, level}) => {
  const [x, y] = c;
  const t = {stroke: col, strokeWidth: 6, strokeLinecap: 'round' as const, fill: 'none'};
  const brows =
    face === 'angry' ? (
      <>
        <path d={`M ${x - 30} ${y - 22} L ${x - 8} ${y - 11}`} {...t} />
        <path d={`M ${x + 30} ${y - 22} L ${x + 8} ${y - 11}`} {...t} />
      </>
    ) : face === 'worry' ? (
      <>
        <path d={`M ${x - 30} ${y - 11} L ${x - 8} ${y - 22}`} {...t} />
        <path d={`M ${x + 30} ${y - 11} L ${x + 8} ${y - 22}`} {...t} />
      </>
    ) : face === 'smirk' ? (
      <path d={`M ${x + 6} ${y - 20} L ${x + 30} ${y - 25}`} {...t} />
    ) : null;
  const mouth = level > 0.1 ? (
    <ellipse cx={x} cy={y + 18 + 4 * level} rx={7 + 7 * level} ry={3 + 12 * level} fill={C.navyDeep} stroke={col} strokeWidth={5} />
  ) : face === 'smile' ? (
    <path d={`M ${x - 14} ${y + 14} Q ${x} ${y + 30} ${x + 14} ${y + 14}`} {...t} />
  ) : face === 'smirk' ? (
    <path d={`M ${x - 12} ${y + 18} Q ${x + 4} ${y + 24} ${x + 16} ${y + 8}`} {...t} />
  ) : face === 'angry' ? (
    <path d={`M ${x - 12} ${y + 25} Q ${x} ${y + 14} ${x + 12} ${y + 25}`} {...t} />
  ) : face === 'worry' ? (
    <path d={`M ${x - 12} ${y + 22} Q ${x - 6} ${y + 16} ${x} ${y + 22} T ${x + 12} ${y + 22}`} {...t} />
  ) : (
    <path d={`M ${x - 10} ${y + 20} L ${x + 10} ${y + 20}`} {...t} />
  );
  return (
    <>
      <circle cx={x - 16} cy={y - 2} r={5.5} fill={col} />
      <circle cx={x + 16} cy={y - 2} r={5.5} fill={col} />
      {brows}
      {mouth}
    </>
  );
};

const Boneco: React.FC<{kind: Kind; x: number; pose: Pose; face: FaceT; mouth?: number; flip?: boolean; s?: number; phone?: boolean; sweat?: boolean; lift?: number}> = ({
  kind,
  x,
  pose,
  face,
  mouth = 0,
  flip = false,
  s = 1.12,
  phone = false,
  sweat = false,
  lift = 0,
}) => {
  const frame = useCurrentFrame();
  const col = COR[kind];
  const S: [number, number] = [0, -148];
  const e1 = pt(S[0], S[1], 78, pose.a1);
  const h1 = pt(e1[0], e1[1], 72, pose.a2);
  const e2 = pt(S[0], S[1], 78, pose.b1);
  const h2 = pt(e2[0], e2[1], 72, pose.b2);
  const k1 = pt(8, 0, 104, pose.l1);
  const f1 = pt(k1[0], k1[1], 104, pose.l2);
  const k2 = pt(-8, 0, 104, pose.m1);
  const f2 = pt(k2[0], k2[1], 104, pose.m2);
  const hc: [number, number] = [0, -221];
  const line = {stroke: col, strokeWidth: 13, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none'};
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <g transform={`translate(${x}, ${GROUND - 208 * s - lift}) scale(${(flip ? -1 : 1) * s}, ${s})`}>
      <ellipse cx={0} cy={210 + lift / s} rx={95} ry={14} fill="rgba(0,0,0,0.28)" />
      <polyline points={`8,0 ${k1[0]},${k1[1]} ${f1[0]},${f1[1]}`} {...line} />
      <polyline points={`-8,0 ${k2[0]},${k2[1]} ${f2[0]},${f2[1]}`} {...line} />
      <g transform={`rotate(${pose.t})`}>
        <polyline points={`${S[0]},${S[1]} ${e2[0]},${e2[1]} ${h2[0]},${h2[1]}`} {...line} />
        <line x1={0} y1={0} x2={0} y2={-165} {...line} />
        {kind === 'carlos' && <polygon points="0,-150 -11,-134 0,-100 11,-134" fill={C.bordoLight} />}
        <polyline points={`${S[0]},${S[1]} ${e1[0]},${e1[1]} ${h1[0]},${h1[1]}`} {...line} />
        {phone && (
          <g transform={`translate(${h1[0]}, ${h1[1]}) rotate(${pose.a2 - 180})`}>
            <rect x={-19} y={-60} width={38} height={64} rx={8} fill={C.navyDeep} stroke="#fff" strokeWidth={5} />
            <circle cx={0} cy={-46} r={6} fill={C.bordoLight} opacity={blink ? 1 : 0.25} />
          </g>
        )}
        <circle cx={hc[0]} cy={hc[1]} r={50} fill={C.navyDeep} stroke={col} strokeWidth={13} />
        {kind === 'ana' && (
          <>
            <path d={`M ${hc[0] + 30} ${hc[1] - 36} Q ${hc[0] + 86} ${hc[1] - 38} ${hc[0] + 70} ${hc[1] + 24}`} {...line} strokeWidth={10} />
            <path d={`M ${hc[0] - 44} ${hc[1] - 14} Q ${hc[0]} ${hc[1] - 76} ${hc[0] + 44} ${hc[1] - 14}`} {...line} strokeWidth={9} />
          </>
        )}
        {kind === 'carlos' && (
          <>
            <line x1={hc[0] - 22} y1={hc[1] - 52} x2={hc[0] - 30} y2={hc[1] - 74} {...line} strokeWidth={9} />
            <line x1={hc[0]} y1={hc[1] - 56} x2={hc[0]} y2={hc[1] - 80} {...line} strokeWidth={9} />
            <line x1={hc[0] + 22} y1={hc[1] - 52} x2={hc[0] + 32} y2={hc[1] - 74} {...line} strokeWidth={9} />
          </>
        )}
        {kind === 'bia' && (
          <>
            <path d={`M ${hc[0] - 50} ${hc[1] - 6} Q ${hc[0] - 60} ${hc[1] + 24} ${hc[0] - 42} ${hc[1] + 38}`} {...line} strokeWidth={9} />
            <path d={`M ${hc[0] + 50} ${hc[1] - 6} Q ${hc[0] + 60} ${hc[1] + 24} ${hc[0] + 42} ${hc[1] + 38}`} {...line} strokeWidth={9} />
          </>
        )}
        <FaceSvg c={hc} col={col} face={face} level={mouth} />
        {sweat && (
          <path
            transform={`translate(${hc[0] + 66}, ${hc[1] - 20 + ((frame * 1.2) % 46)})`}
            d="M0,-16 C9,-2 11,8 0,12 C-11,8 -9,-2 0,-16 Z"
            fill={C.ice}
            opacity={1 - ((frame * 1.2) % 46) / 60}
          />
        )}
      </g>
    </g>
  );
};

// ─── Elementos de cena ───
const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={1080} height={800} viewBox="0 0 1080 800" style={{position: 'absolute', top: 230, left: 0}}>
    <line x1={90} y1={GROUND} x2={990} y2={GROUND} stroke="rgba(150,190,250,0.22)" strokeWidth={4} strokeLinecap="round" />
    {children}
  </svg>
);

const Fundo: React.FC = () => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.navyDeep} 0%, ${C.navy} 62%, #12285C 100%)`}}>
    <div style={{position: 'absolute', right: -110, bottom: 110, fontFamily: FONT, fontWeight: 900, fontSize: 1100, lineHeight: 1, color: 'rgba(150,190,250,0.07)'}}>§</div>
  </AbsoluteFill>
);

const Topo: React.FC = () => (
  <>
    <div style={{position: 'absolute', top: 110, left: 70, display: 'flex', alignItems: 'center', gap: 18}}>
      <div style={{background: '#fff', color: C.navy, fontFamily: FONT, fontWeight: 800, fontSize: 30, padding: '12px 26px', borderRadius: 40}}>JC EXPLICA</div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: C.ice, letterSpacing: 2}}>DIREITO DO DIA A DIA</div>
    </div>
    <Img src={staticFile('logo_white.png')} style={{position: 'absolute', top: 70, right: 70, height: 110}} />
  </>
);

const Badge: React.FC<{x: number; y: number; ok: boolean; at: number; label: string}> = ({x, y, ok, at, label}) => {
  const frame = useCurrentFrame();
  const k = spring({frame: frame - at, fps: 30, config: {damping: 9, stiffness: 170}});
  const col = ok ? '#22A97A' : C.bordoLight;
  return (
    <g transform={`translate(${x}, ${y}) scale(${k})`} opacity={Math.min(1, k * 2)}>
      <circle r={66} fill={col} stroke="#fff" strokeWidth={7} />
      {ok ? <path d="M -30 2 L -10 24 L 32 -20" stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M -26 -26 L 26 26 M 26 -26 L -26 26" stroke="#fff" strokeWidth={14} strokeLinecap="round" />}
      <rect x={-Math.max(96, label.length * 10 + 30)} y={84} width={Math.max(192, label.length * 20 + 60)} height={46} rx={23} fill="#fff" />
      <text x={0} y={116} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.navy}>
        {label}
      </text>
    </g>
  );
};

const Legenda: React.FC = () => {
  const g = useG();
  const cl = D.clips.find((c) => g >= c.at - 3 && g < c.at + c.frames + 10);
  if (!cl) return null;
  const k = spring({frame: g - cl.at + 3, fps: 30, config: {damping: 14, stiffness: 190}});
  const parts = cl.texto.split('**');
  return (
    <div style={{position: 'absolute', top: 1010, left: 70, right: 70, textAlign: 'center', opacity: Math.min(1, k * 1.6), transform: `scale(${0.94 + 0.06 * k})`}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 30, padding: '8px 22px', marginBottom: 18}}>
        <div style={{width: 18, height: 18, borderRadius: 9, background: cl.quem === 'A' ? C.ice : '#fff'}} />
        <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: 2}}>{cl.quem === 'A' ? 'ANA' : 'CARLOS'}</span>
      </div>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.3, color: '#fff'}}>
        {parts.map((t, i) =>
          i % 2 === 1 ? (
            <span key={i} style={{background: C.bordoLight, padding: '0 14px', borderRadius: 12, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>
              {t}
            </span>
          ) : (
            <span key={i}>{t}</span>
          ),
        )}
      </div>
    </div>
  );
};

const Base: React.FC<{texto: string; sub?: string; at?: number}> = ({texto, sub, at = 20}) => {
  const frame = useCurrentFrame();
  const k = spring({frame: frame - at, fps: 30, config: {damping: 16, stiffness: 150}});
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 1500, opacity: k, transform: `translateY(${(1 - k) * 40}px)`, background: C.navy, border: '2px solid rgba(150,190,250,0.4)', borderRadius: 26, padding: '24px 34px 26px 44px', boxShadow: '0 16px 40px rgba(0,0,0,0.4)'}}>
      <div style={{position: 'absolute', left: 0, top: 22, bottom: 22, width: 10, borderRadius: 5, background: C.bordoLight}} />
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 20, letterSpacing: 6, color: C.ice}}>BASE LEGAL</div>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, color: '#fff', marginTop: 8}}>{texto}</div>
      {sub && <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 28, color: C.soft, marginTop: 4}}>{sub}</div>}
    </div>
  );
};

const Sfx: React.FC<{g: number; at: number; src?: string; v?: number}> = ({at, src = 'viral/ding.wav', v = 0.5}) => {
  const ini = useContext(Ctx);
  return (
    <Sequence from={Math.max(0, at - ini)} layout="none">
      <Audio src={staticFile(src)} volume={v} />
    </Sequence>
  );
};

const Cena: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill>
    <Fundo />
    <Topo />
    {children}
    <Legenda />
  </AbsoluteFill>
);

// ─── Cenas ───
const Gancho: React.FC = () => {
  const g = useG();
  const frame = useCurrentFrame();
  const ana = poseAt(g, [[0, 'phone'], [clip(3).at, 'phone'], [clip(3).at + 18, 'point']]);
  const car = poseAt(g, [[0, 'idle'], [clip(0).at - 4, 'idle'], [clip(0).at + 8, 'angry'], [END(2), 'angry'], [END(2) + 14, 'worry']]);
  const blink = Math.floor(frame / 10) % 2 === 0;
  return (
    <Cena>
      <Stage>
        <Boneco kind="ana" x={300} pose={ana} face="smirk" mouth={lvl([1, 3], g)} phone={g < clip(3).at + 10} />
        <Boneco kind="carlos" x={790} flip pose={car} face={g < END(2) + 6 ? 'angry' : 'worry'} mouth={lvl([0, 2], g)} sweat={g > clip(2).at + 24} />
      </Stage>
      {g < clip(3).at + 14 && (
        <div style={{position: 'absolute', top: 200, left: 70, display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: '#fff'}}>
          <div style={{width: 24, height: 24, borderRadius: 12, background: C.bordoLight, opacity: blink ? 1 : 0.2}} />
          REC
        </div>
      )}
    </Cena>
  );
};

const Regra: React.FC = () => {
  const g = useG();
  const c = clip(4);
  const ana = poseAt(g, [[c.at - 10, 'idle'], [c.at + 10, 'point']]);
  return (
    <Cena>
      <Stage>
        <Boneco kind="ana" x={300} pose={ana} face="smile" mouth={lvl([4], g)} />
        <Boneco kind="carlos" x={790} flip pose={POSE.worry} face="worry" />
        <Badge x={570} y={200} ok at={c.at + 52 - D.cenas[1].ini} label="VALE" />
      </Stage>
      <Sfx g={g} at={c.at + 52} />
      <Base texto="STF · RE 583.937 (Tema 237)" sub="Gravação ambiental feita por um dos interlocutores" at={c.at + 60 - D.cenas[1].ini} />
    </Cena>
  );
};

const Participar: React.FC = () => {
  const g = useG();
  const a = clip(5);
  const car = poseAt(g, [[0, 'sneak'], [clip(6).at, 'sneak'], [clip(6).at + 16, 'worry']]);
  const ini = D.cenas[2].ini;
  return (
    <Cena>
      <Stage>
        <Boneco kind="ana" x={190} pose={POSE.idle} face="smile" mouth={lvl([5], g)} s={1.05} />
        <Boneco kind="bia" x={500} flip pose={POSE.idle} face="smile" s={1.05} />
        <g opacity={0.9}>
          <rect x={290} y={236} width={130} height={62} rx={30} fill="#fff" />
          <circle cx={322} cy={267} r={7} fill={C.navy} />
          <circle cx={355} cy={267} r={7} fill={C.navy} />
          <circle cx={388} cy={267} r={7} fill={C.navy} />
        </g>
        <Boneco kind="carlos" x={870} flip pose={car} face={g >= clip(6).at ? 'worry' : 'neutral'} mouth={lvl([6], g)} s={1.0} phone sweat={g >= clip(6).at + 10} />
        <polygon points="838,745 902,745 892,690 848,690" fill={C.bordo} />
        {[-52, -26, 0, 26, 52].map((ang, i) => (
          <ellipse key={i} cx={870} cy={600} rx={22} ry={82} fill="#2F8F6B" transform={`rotate(${ang} 870 690)`} />
        ))}
        <Badge x={345} y={150} ok at={14} label="PARTICIPA" />
        <Badge x={870} y={165} ok={false} at={a.at + Math.round(a.frames * 0.55) - ini} label="SÓ ESCUTANDO" />
      </Stage>
      <Sfx g={g} at={ini + 14} />
      <Sfx g={g} at={a.at + Math.round(a.frames * 0.55)} src="viral/tick.wav" v={0.7} />
      <Base texto="CF, art. 5º, X" sub="Direito à intimidade e à vida privada" at={a.at + 40 - ini} />
    </Cena>
  );
};

const Tile: React.FC<{y: number; at: number; titulo: string; sub: string; icon: 'lock' | 'urna'}> = ({y, at, titulo, sub, icon}) => {
  const frame = useCurrentFrame();
  const k = spring({frame: frame - at, fps: 30, config: {damping: 14, stiffness: 150}});
  return (
    <g transform={`translate(${390 + (1 - k) * 120}, ${y})`} opacity={k}>
      <rect width={640} height={200} rx={28} fill="rgba(255,255,255,0.09)" stroke={C.ice} strokeWidth={3} />
      <g transform="translate(50, 100)" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {icon === 'lock' ? (
          <>
            <rect x={-34} y={-8} width={68} height={52} rx={10} fill={C.bordoLight} />
            <path d="M -20 -8 L -20 -28 A 20 20 0 0 1 20 -28 L 20 -8" />
          </>
        ) : (
          <>
            <rect x={-40} y={-10} width={80} height={54} rx={8} fill={C.bordoLight} />
            <path d="M -20 -10 L -20 -34 L 20 -34 L 20 -10" />
            <path d="M -12 -22 L -4 -14 L 12 -30" />
          </>
        )}
      </g>
      <text x={130} y={92} fontFamily={FONT} fontWeight={800} fontSize={32} fill="#fff">
        {titulo}
      </text>
      <text x={130} y={138} fontFamily={FONT} fontWeight={500} fontSize={28} fill={C.soft}>
        {sub}
      </text>
    </g>
  );
};

const Excecoes: React.FC = () => {
  const g = useG();
  const c = clip(7);
  const ini = D.cenas[3].ini;
  const ana = poseAt(g, [[c.at - 6, 'idle'], [c.at + 14, 'point']]);
  return (
    <Cena>
      <Stage>
        <Boneco kind="ana" x={200} pose={ana} face="smile" mouth={lvl([7], g)} />
        <Tile y={250} at={c.at + 40 - ini} titulo="SIGILO PROFISSIONAL" sub="regra própria" icon="lock" />
        <Tile y={500} at={c.at + 72 - ini} titulo="PROCESSO ELEITORAL" sub="regra própria" icon="urna" />
      </Stage>
      <Sfx g={g} at={c.at + 40} src="viral/tick.wav" v={0.7} />
      <Sfx g={g} at={c.at + 72} src="viral/tick.wav" v={0.7} />
    </Cena>
  );
};

const Moeda: React.FC<{x: number; at: number}> = ({x, at}) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  if (f < 0) return null;
  const y = 170 + Math.min(f, 40) * 12 + (f > 40 ? Math.sin((f - 40) * 0.4) * 6 : 0);
  return (
    <g transform={`translate(${x}, ${y}) rotate(${f * 6})`}>
      <circle r={40} fill={C.ice} stroke="#fff" strokeWidth={6} />
      <text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.navy}>
        R$
      </text>
    </g>
  );
};

const Divulgar: React.FC = () => {
  const g = useG();
  const frame = useCurrentFrame();
  const ini = D.cenas[4].ini;
  const c4 = clip(8);
  const c5 = clip(9);
  const anaX = interpolate(g, [c5.at - 10, c5.at + 26], [300, 520], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ana = poseAt(g, [[0, 'worry'], [c5.at - 10, 'worry'], [c5.at + 20, 'grab']]);
  const car = poseAt(g, [[0, 'idle'], [c4.at - 4, 'idle'], [c4.at + 10, 'post']]);
  const pulse = 1 + 0.05 * Math.sin(frame / 3);
  const tCoin = c5.at + Math.round(c5.frames * 0.62) - ini;
  return (
    <Cena>
      <Stage>
        <Boneco kind="ana" x={anaX} pose={ana} face={g >= c5.at ? 'angry' : 'worry'} mouth={lvl([9], g)} />
        <Boneco kind="carlos" x={800} flip pose={car} face={g >= c5.at ? 'worry' : 'smirk'} mouth={lvl([8], g)} phone sweat={g >= c5.at + 30} />
        {g >= c4.at && g < END(9) && (
          <g transform={`translate(800, 120) scale(${pulse})`}>
            <rect x={-110} y={-30} width={220} height={60} rx={30} fill={C.bordoLight} stroke="#fff" strokeWidth={4} />
            <text y={11} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#fff">
              ▲ POSTAR
            </text>
          </g>
        )}
        {[560, 690, 960].map((x, i) => (
          <Moeda key={x} x={x} at={tCoin + i * 9} />
        ))}
      </Stage>
      <Sfx g={g} at={c5.at + Math.round(c5.frames * 0.62)} src="viral/ding.wav" v={0.5} />
      <Base texto="CF, art. 5º, X · Código Civil, arts. 186 e 927" sub="Intimidade, honra e indenização" at={c5.at + 20 - ini} />
    </Cena>
  );
};

const Fecho: React.FC = () => {
  const g = useG();
  const frame = useCurrentFrame();
  const ini = D.cenas[5].ini;
  const a = clip(10);
  const c = clip(11);
  const k = spring({frame: g - a.at - 40, fps: 30, config: {damping: 10, stiffness: 160}});
  const apagou = interpolate(g, [c.at + 40, c.at + 64], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Cena>
      <Stage>
        <Boneco kind="ana" x={290} pose={poseAt(g, [[a.at - 10, 'idle'], [a.at + 12, 'point']])} face="smile" mouth={lvl([10], g)} />
        <Boneco kind="carlos" x={800} flip pose={poseAt(g, [[0, 'shrug'], [c.at - 6, 'shrug'], [c.at + 10, 'phone']])} face={g >= c.at ? 'smirk' : 'worry'} mouth={lvl([11], g)} phone={g >= c.at} />
        <g transform={`translate(${530 + (1 - k) * 60}, 210) scale(${Math.max(0.01, k)})`} opacity={Math.min(1, k * 2)}>
          <rect x={-140} y={-38} width={280} height={76} rx={38} fill="#fff" />
          <path d="M -86 -18 L -50 -18 L -50 22 L -68 10 L -86 22 Z" fill={C.bordoLight} />
          <text x={-30} y={12} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.navy}>
            SALVE
          </text>
        </g>
        <g transform="translate(655, 330)" opacity={g >= c.at ? 1 - apagou * 0.6 : 0}>
          <rect width={330} height={92} rx={46} fill="rgba(255,255,255,0.14)" stroke={C.ice} strokeWidth={3} />
          <polygon points="36,26 36,66 70,46" fill="#fff" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <rect key={i} x={92 + i * 18} y={46 - (8 + ((i * 7) % 5) * 7)} width={8} height={(8 + ((i * 7) % 5) * 7) * 2} rx={4} fill={C.ice} />
          ))}
          {apagou > 0 && <path d={`M 20 -10 L ${20 + 290 * apagou} ${102 * apagou - 10}`} stroke={C.bordoLight} strokeWidth={10} strokeLinecap="round" />}
        </g>
      </Stage>
      <Sfx g={g} at={a.at + 40} />
      <Sfx g={g} at={c.at + 52} src="viral/tick.wav" v={0.8} />
    </Cena>
  );
};

const SCENE: Record<string, React.ReactNode> = {
  gancho: <Gancho />,
  regra: <Regra />,
  participar: <Participar />,
  excecoes: <Excecoes />,
  divulgar: <Divulgar />,
  fecho: <Fecho />,
};

const Capa: React.FC = () => {
  const f = useCurrentFrame();
  const txt = 'gravei_escondido.mp4';
  const n = Math.min(txt.length, Math.floor(f / 2));
  const blink = Math.floor(f / 10) % 2 === 0;
  return (
    <AbsoluteFill style={{background: '#05070F', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 130, left: 80, display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT, fontWeight: 800, fontSize: 34, color: '#fff'}}>
        <div style={{width: 26, height: 26, borderRadius: 13, background: C.bordoLight, opacity: blink ? 1 : 0.2}} />
        REC
      </div>
      <div style={{fontFamily: marker.fontFamily, fontSize: 86, color: C.ice, textAlign: 'center', whiteSpace: 'nowrap'}}>
        {txt.slice(0, n)}
        <span style={{opacity: blink ? 1 : 0}}>|</span>
      </div>
      <div style={{fontFamily: marker.fontFamily, fontSize: 54, color: '#fff', marginTop: 26, opacity: interpolate(f, [44, 58], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>by: JC Jurídico</div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const k = spring({frame: f, fps: 30, config: {damping: 16}});
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.navyDeep}, ${C.navy})`, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{transform: `scale(${0.9 + 0.1 * k})`, opacity: k, textAlign: 'center'}}>
        <Img src={staticFile('logo_white.png')} style={{height: 300}} />
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 62, color: '#fff', marginTop: 40}}>Direito explicado</div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 62, color: C.ice}}>com base legal</div>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 36, color: C.soft, marginTop: 30}}>@jcjuridico.br · link na bio</div>
      </div>
    </AbsoluteFill>
  );
};

export const GravacaoEscondida: React.FC<{music: string}> = ({music}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={0} durationInFrames={D.capa}>
      <Capa />
    </Sequence>
    {D.cenas.map((c) => (
      <Sequence key={c.id} from={c.ini} durationInFrames={c.fim - c.ini}>
        <Ctx.Provider value={c.ini}>{SCENE[c.id]}</Ctx.Provider>
      </Sequence>
    ))}
    <Sequence from={D.total - D.outro} durationInFrames={D.outro}>
      <Outro />
    </Sequence>
    {D.clips.map((c) => (
      <Sequence key={c.n} from={c.at} durationInFrames={c.frames + 6} layout="none">
        <Audio src={staticFile(c.src)} />
      </Sequence>
    ))}
    <Audio src={staticFile(music)} volume={(f) => interpolate(f, [0, 20, D.total - 50, D.total - 6], [0, 0.12, 0.12, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
  </AbsoluteFill>
);
