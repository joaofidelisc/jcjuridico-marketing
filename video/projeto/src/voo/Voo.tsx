import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/google-fonts/PermanentMarker';
import falas from './falas.json';
import env from './env.json';
import {C, FONT} from '../theme';

// "Voo atrasado: direitos hora a hora": bonecos minimalistas (Ana e Carlos), efeitos e música livre.
// Linha do tempo gerada por voz/gerar_voo.py (falas.json).

const marker = loadFont();

type Clip = {n: number; at: number; frames: number; src: string; quem: 'A' | 'C' | 'F'; texto: string; cena: string};
const D = falas as unknown as {capa: number; outro: number; total: number; clips: Clip[]; cenas: {id: string; ini: number; fim: number}[]};
export const VOO_TOTAL = D.total;
const clip = (n: number) => D.clips[n];
const END = (n: number) => D.clips[n].at + D.clips[n].frames;

const Ctx = createContext(0);
const useG = () => useCurrentFrame() + useContext(Ctx);

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
type Kind = 'ana' | 'carlos' | 'bia' | 'filho';
const COR: Record<Kind, string> = {ana: C.ice, carlos: '#FFFFFF', bia: '#8FA0C8', filho: '#F07A90'};
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
        {kind === 'filho' && (
          <>
            <path d={`M ${hc[0] - 48} ${hc[1] - 18} Q ${hc[0]} ${hc[1] - 82} ${hc[0] + 48} ${hc[1] - 18} Z`} fill={col} />
            <path d={`M ${hc[0] - 40} ${hc[1] - 22} L ${hc[0] - 88} ${hc[1] - 14}`} {...line} strokeWidth={11} />
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

const Legenda: React.FC = () => {
  const g = useG();
  const cl = D.clips.find((c) => g >= c.at - 3 && g < c.at + c.frames + 10);
  if (!cl) return null;
  const k = spring({frame: g - cl.at + 3, fps: 30, config: {damping: 14, stiffness: 190}});
  const parts = cl.texto.split('**');
  return (
    <div style={{position: 'absolute', top: 1010, left: 70, right: 70, textAlign: 'center', opacity: Math.min(1, k * 1.6), transform: `scale(${0.94 + 0.06 * k})`}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 30, padding: '8px 22px', marginBottom: 18}}>
        <div style={{width: 18, height: 18, borderRadius: 9, background: cl.quem === 'A' ? C.ice : cl.quem === 'F' ? '#F07A90' : '#fff'}} />
        <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: 2}}>{cl.quem === 'A' ? 'ANA' : cl.quem === 'F' ? 'LUCAS (FILHO)' : 'CARLOS'}</span>
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


// ─── Cenas ───
const iniDe = (id: string) => D.cenas.find((c) => c.id === id)!.ini;

const Fundo2 = Fundo;

const Cena: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill>
    <Fundo2 />
    <Topo />
    {children}
    <Legenda />
  </AbsoluteFill>
);

const Sfx: React.FC<{at: number; src?: string; v?: number}> = ({at, src = 'viral/ding.wav', v = 0.5}) => {
  const ini = useContext(Ctx);
  return (
    <Sequence from={Math.max(0, at - ini)} layout="none">
      <Audio src={staticFile(src)} volume={v} />
    </Sequence>
  );
};

// quadro (absoluto) em que a palavra k da fala n começa, estimado pelo tamanho das palavras da legenda
const W = (n: number, k: number) => {
  const ws = clip(n).texto.replace(/\*\*/g, '').split(' ');
  const tot = ws.reduce((s, w) => s + w.length + 1, 0);
  const ate = ws.slice(0, Math.min(k, ws.length)).reduce((s, w) => s + w.length + 1, 0);
  return clip(n).at + Math.round((ate / tot) * clip(n).frames * 0.92);
};

type IcoT = 'wifi' | 'food' | 'bed' | 'swap' | 'receipt';
const Ico: React.FC<{icon: IcoT}> = ({icon}) => {
  const p = {stroke: '#fff', strokeWidth: 7, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <g>
      <circle r={36} fill={C.bordoLight} />
      <g {...p}>
        {icon === 'wifi' && (
          <>
            <path d="M -22 -6 Q 0 -26 22 -6" />
            <path d="M -13 4 Q 0 -8 13 4" />
            <circle cy={14} r={3} fill="#fff" />
          </>
        )}
        {icon === 'food' && (
          <>
            <path d="M -14 -20 L -14 20 M -20 -20 L -20 -6 Q -14 0 -8 -6 L -8 -20" />
            <path d="M 12 20 L 12 -20 Q 22 -12 20 4 L 12 4" />
          </>
        )}
        {icon === 'bed' && (
          <>
            <path d="M -24 16 L -24 -14 M -24 6 L 24 6 L 24 16 M -24 -2 L 24 -2 L 24 6" />
            <circle cx={-12} cy={-8} r={5} fill="#fff" />
          </>
        )}
        {icon === 'swap' && (
          <>
            <path d="M -20 -8 L 20 -8 L 10 -18 M 20 8 L -20 8 L -10 18" />
          </>
        )}
        {icon === 'receipt' && (
          <>
            <path d="M -16 -22 L 16 -22 L 16 22 L 8 16 L 0 22 L -8 16 L -16 22 Z" />
            <path d="M -8 -10 L 8 -10 M -8 0 L 8 0" />
          </>
        )}
      </g>
    </g>
  );
};

const TileTop: React.FC<{at: number; titulo: string; sub: string; icon: IcoT; y?: number}> = ({at, titulo, sub, icon, y = 162}) => {
  const frame = useCurrentFrame();
  const k = spring({frame: frame - at, fps: 30, config: {damping: 14, stiffness: 150}});
  return (
    <g transform={`translate(${300}, ${y - (1 - k) * 40})`} opacity={k}>
      <rect width={415} height={118} rx={24} fill="rgba(14,29,63,0.92)" stroke={C.ice} strokeWidth={3} />
      <g transform="translate(62, 59) scale(0.85)">
        <Ico icon={icon} />
      </g>
      <text x={118} y={52} fontFamily={FONT} fontWeight={800} fontSize={28} fill="#fff">
        {titulo}
      </text>
      <text x={118} y={88} fontFamily={FONT} fontWeight={500} fontSize={22} fill={C.soft}>
        {sub}
      </text>
    </g>
  );
};

// Painel de partidas com o voo atrasado e o contador de atraso
const Painel: React.FC<{atraso: string; at?: number}> = ({atraso, at = 0}) => {
  const f = useCurrentFrame();
  const blink = Math.floor(f / 12) % 2 === 0;
  const k = spring({frame: f - at, fps: 30, config: {damping: 9, stiffness: 200}});
  return (
    <g transform="translate(150, 0)">
      <rect width={780} height={140} rx={20} fill="#05070F" stroke="rgba(150,190,250,0.5)" strokeWidth={3} />
      <text x={30} y={42} fontFamily={FONT} fontWeight={800} fontSize={22} letterSpacing={4} fill={C.ice}>
        PARTIDAS
      </text>
      <text x={30} y={105} fontFamily="monospace" fontWeight={700} fontSize={40} fill="#FFD27A">
        JC 2026  RECIFE
      </text>
      <rect x={430} y={68} width={190} height={50} rx={8} fill={blink ? C.bordoLight : 'rgba(186,40,66,0.35)'} />
      <text x={525} y={103} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#fff">
        ATRASADO
      </text>
      {atraso && (
        <g transform={`translate(700, 93) scale(${k})`}>
          <circle r={56} fill="#fff" />
          <text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.bordo}>
            {atraso}
          </text>
        </g>
      )}
    </g>
  );
};

const Mala: React.FC<{x: number}> = ({x}) => (
  <g transform={`translate(${x}, ${GROUND})`}>
    <rect x={-40} y={-120} width={80} height={110} rx={14} fill={C.bordoLight} stroke="#fff" strokeWidth={5} />
    <path d="M -16 -120 L -16 -150 L 16 -150 L 16 -120" stroke="#fff" strokeWidth={6} fill="none" />
    <circle cx={-24} cy={-4} r={7} fill="#fff" />
    <circle cx={24} cy={-4} r={7} fill="#fff" />
  </g>
);

const Pill: React.FC<{x: number; y: number; at: number; txt: string}> = ({x, y, at, txt}) => {
  const f = useCurrentFrame();
  const k = spring({frame: f - at, fps: 30, config: {damping: 10, stiffness: 200}});
  return (
    <g transform={`translate(${x}, ${y}) scale(${k})`} opacity={Math.min(1, k * 2)}>
      <rect x={-txt.length * 8.5 - 26} y={-27} width={txt.length * 17 + 52} height={54} rx={27} fill="#fff" />
      <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={25} fill={C.navy}>
        {txt}
      </text>
    </g>
  );
};

const Gancho: React.FC = () => {
  const g = useG();
  const ini = iniDe('gancho');
  const car = poseAt(g, [[0, 'angry'], [END(0), 'angry'], [END(0) + 12, 'worry']]);
  return (
    <Cena>
      <Stage>
        <Painel atraso="" />
        <Mala x={930} />
        <Boneco kind="carlos" x={780} flip pose={car} face="angry" mouth={lvl([0], g)} sweat={g > clip(0).at + 20} />
        <Boneco kind="ana" x={260} pose={poseAt(g, [[clip(1).at - 6, 'phone'], [clip(1).at + 10, 'point']])} face="smile" mouth={lvl([1], g)} phone={g < clip(1).at + 6} />
      </Stage>
      <Sfx at={ini} src="sfx/chime.wav" v={0.6} />
      <Sfx at={clip(0).at + 8} src="sfx/boom.wav" v={0.5} />
      <Sfx at={clip(1).at} src="sfx/pop.wav" v={0.5} />
    </Cena>
  );
};

const Hora: React.FC<{id: string; atraso: string; fala: number; titulo: string; sub: string; icon: IcoT; base: string; baseSub: string; resp: number}> = ({
  id,
  atraso,
  fala,
  titulo,
  sub,
  icon,
  base,
  baseSub,
  resp,
}) => {
  const g = useG();
  const ini = iniDe(id);
  const a = clip(fala);
  const tTile = W(fala, 4);
  return (
    <Cena>
      <Stage>
        <Painel atraso={atraso} at={6} />
        <Mala x={930} />
        <Boneco kind="ana" x={230} pose={poseAt(g, [[a.at - 6, 'idle'], [a.at + 12, 'point']])} face="smile" mouth={lvl([fala], g)} />
        <Boneco
          kind="carlos"
          x={780}
          flip
          pose={poseAt(g, [[0, 'worry'], [clip(resp).at - 4, 'worry'], [clip(resp).at + 8, icon === 'wifi' ? 'phone' : 'angry']])}
          face={g >= clip(resp).at ? 'smile' : 'worry'}
          mouth={lvl([resp], g)}
          phone={icon === 'wifi' && g >= clip(resp).at}
        />
        <TileTop at={tTile - ini} titulo={titulo} sub={sub} icon={icon} />
      </Stage>
      <Sfx at={ini} src="sfx/whoosh.wav" v={0.5} />
      <Sfx at={ini + 6} src="sfx/stamp.wav" v={0.6} />
      <Sfx at={tTile} src={icon === 'food' ? 'sfx/kaching.wav' : 'sfx/pop.wav'} v={0.6} />
      <Sfx at={clip(resp).at} src={icon === 'wifi' ? 'sfx/msg.wav' : 'sfx/pop.wav'} v={0.5} />
      <Base texto={base} sub={baseSub} at={tTile + 16 - ini} />
    </Cena>
  );
};

const Hora1: React.FC = () => <Hora id="hora1" atraso="+1h" fala={2} resp={3} titulo="COMUNICAÇÃO" sub="internet e telefone" icon="wifi" base="Resolução ANAC 400/2016, art. 27, I" baseSub="Atraso superior a 1 hora" />;
const Hora2: React.FC = () => <Hora id="hora2" atraso="+2h" fala={4} resp={5} titulo="ALIMENTAÇÃO" sub="voucher ou refeição" icon="food" base="Resolução ANAC 400/2016, art. 27, II" baseSub="Atraso superior a 2 horas" />;

const Hora4: React.FC = () => {
  const g = useG();
  const ini = iniDe('hora4');
  const a = clip(6);
  const b = clip(7);
  const c = clip(8);
  const tTile = W(6, 4);
  const opc: [string, number][] = [
    ['OUTRO VOO', W(7, 5)],
    ['REEMBOLSO INTEGRAL', W(7, 7)],
    ['OUTRO TRANSPORTE', W(7, 10)],
  ];
  return (
    <Cena>
      <Stage>
        <Painel atraso="+4h" at={6} />
        <Mala x={930} />
        <Boneco kind="ana" x={230} pose={poseAt(g, [[a.at - 6, 'idle'], [a.at + 12, 'point']])} face="smile" mouth={lvl([6, 7], g)} />
        <Boneco kind="carlos" x={780} flip pose={poseAt(g, [[0, 'worry'], [c.at - 4, 'worry'], [c.at + 8, 'angry']])} face={g >= b.at ? 'smile' : 'worry'} mouth={lvl([8], g)} />
        {g < b.at + 4 && <TileTop at={tTile - ini} titulo="HOSPEDAGEM" sub="pernoite + transporte" icon="bed" />}
        {opc.map(([t, at], i) => (
          <Pill key={t} x={540} y={185 + i * 62} at={at - ini} txt={t} />
        ))}
      </Stage>
      <Sfx at={ini} src="sfx/whoosh.wav" v={0.5} />
      <Sfx at={ini + 6} src="sfx/stamp.wav" v={0.6} />
      <Sfx at={tTile} src="sfx/pop.wav" v={0.6} />
      {opc.map(([t, at]) => (
        <Sfx key={t} at={at} src="sfx/pop.wav" v={0.6} />
      ))}
      <Sfx at={c.at + 6} src="sfx/kaching.wav" v={0.5} />
      <Base texto="Resolução ANAC 400/2016, arts. 21 e 27, III" sub="Atraso superior a 4 horas: hospedagem e escolha do passageiro" at={tTile + 16 - ini} />
    </Cena>
  );
};

const Dica: React.FC = () => {
  const g = useG();
  const ini = iniDe('dica');
  const a = clip(9);
  const tT = W(9, 2);
  return (
    <Cena>
      <Stage>
        <Boneco kind="ana" x={230} pose={poseAt(g, [[a.at - 6, 'idle'], [a.at + 12, 'point']])} face="smile" mouth={lvl([9], g)} />
        <Mala x={930} />
        <Boneco kind="carlos" x={780} flip pose={POSE.phone} face="smile" phone />
        <TileTop at={tT - ini} titulo="COMPROVANTES" sub="embarque, notas e prints" icon="receipt" y={40} />
      </Stage>
      <Sfx at={ini} src="sfx/whoosh.wav" v={0.5} />
      <Sfx at={tT} src="sfx/shutter.wav" v={0.7} />
      <Sfx at={tT + 10} src="sfx/shutter.wav" v={0.6} />
      <Base texto="CDC, art. 14" sub="O fornecedor responde pelos danos causados por falha no serviço" at={W(9, 10) - ini} />
    </Cena>
  );
};

const Fecho: React.FC = () => {
  const g = useG();
  const ini = iniDe('fecho');
  const a = clip(10);
  const c = clip(11);
  const k = spring({frame: g - a.at - 20, fps: 30, config: {damping: 10, stiffness: 160}});
  return (
    <Cena>
      <Stage>
        <Boneco kind="ana" x={260} pose={poseAt(g, [[a.at - 10, 'idle'], [a.at + 12, 'point']])} face="smile" mouth={lvl([10], g)} />
        <Mala x={930} />
        <Boneco kind="carlos" x={780} flip pose={poseAt(g, [[0, 'phone'], [c.at - 4, 'phone'], [c.at + 10, 'shrug']])} face={g >= c.at ? 'smirk' : 'smile'} mouth={lvl([11], g)} phone={g < c.at + 6} />
        <g transform={`translate(${520 + (1 - k) * 60}, 150) scale(${Math.max(0.01, k)})`} opacity={Math.min(1, k * 2)}>
          <rect x={-140} y={-38} width={280} height={76} rx={38} fill="#fff" />
          <path d="M -86 -18 L -50 -18 L -50 22 L -68 10 L -86 22 Z" fill={C.bordoLight} />
          <text x={-30} y={12} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.navy}>
            SALVE
          </text>
        </g>
      </Stage>
      <Sfx at={ini} src="sfx/whoosh.wav" v={0.5} />
      <Sfx at={a.at + 20} src="sfx/pop.wav" v={0.7} />
      <Sfx at={c.at} src="sfx/gulp.wav" v={0.5} />
    </Cena>
  );
};

const SCENE: Record<string, React.ReactNode> = {
  gancho: <Gancho />,
  hora1: <Hora1 />,
  hora2: <Hora2 />,
  hora4: <Hora4 />,
  dica: <Dica />,
  fecho: <Fecho />,
};

const Capa: React.FC = () => {
  const f = useCurrentFrame();
  const txt = 'voo_atrasado.mp4';
  const n = Math.min(txt.length, Math.floor(f / 2));
  const blink = Math.floor(f / 10) % 2 === 0;
  return (
    <AbsoluteFill style={{background: '#05070F', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 130, left: 80, fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.bordoLight, opacity: blink ? 1 : 0.3}}>ATRASADO</div>
      <div style={{fontFamily: marker.fontFamily, fontSize: 90, color: C.ice, textAlign: 'center', whiteSpace: 'nowrap'}}>
        {txt.slice(0, n)}
        <span style={{opacity: blink ? 1 : 0}}>|</span>
      </div>
      <div style={{fontFamily: marker.fontFamily, fontSize: 54, color: '#fff', marginTop: 26, opacity: interpolate(f, [40, 54], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>by: JC Jurídico</div>
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

export const VooAtrasado: React.FC = () => (
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
    {Array.from({length: 21}).map((_, i) => (
      <Sequence key={`tap${i}`} from={i * 2} durationInFrames={6} layout="none">
        <Audio src={staticFile('sfx/tap.wav')} volume={0.5} />
      </Sequence>
    ))}
    <Sequence from={D.total - D.outro} layout="none">
      <Audio src={staticFile('sfx/whoosh.wav')} volume={0.5} />
    </Sequence>
    <Audio
      src={staticFile('music/pixabay-sneaky-quirky.mp3')}
      volume={(f) => {
        const falando = D.clips.some((c) => f >= c.at - 4 && f < c.at + c.frames + 4);
        const base = interpolate(f, [0, 15, D.total - 45, D.total - 4], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return base * (falando ? 0.07 : 0.13);
      }}
    />
  </AbsoluteFill>
);
