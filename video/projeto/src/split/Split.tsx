import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/google-fonts/JetBrainsMono';
import falas from './falas.json';
import {C, FONT} from '../theme';

// "Split payment: o imposto no meio do Pix": blocos isométricos, tubo neon, legenda palavra por palavra e efeitos sonoros.
// Linha do tempo gerada por voz/gerar_split.py (falas.json). Música de fundo baixa: "Tech Explainer Background (Modern Digital)" (Pixabay, livre).

const mono = loadFont('normal', {weights: ['700', '800']}).fontFamily;
type Word = {w: string; f: number};
type Clip = {n: number; at: number; frames: number; src: string; cena: string; words: Word[]};
const D = falas as unknown as {outro: number; total: number; clips: Clip[]; cenas: {id: string; ini: number; fim: number}[]};
export const SPLIT_TOTAL = D.total;
const clip = (n: number) => D.clips[n];
const END = (n: number) => clip(n).at + clip(n).frames;
// quadro (absoluto) em que a palavra k da fala n começa a ser dita
const W = (n: number, k: number) => clip(n).at + clip(n).words[Math.min(k, clip(n).words.length - 1)].f;
const iniDe = (id: string) => D.cenas.find((c) => c.id === id)!.ini;

const Ctx = createContext(0);
const useG = () => useCurrentFrame() + useContext(Ctx);
const cl = (x: number) => Math.max(0, Math.min(1, x));
const sp = (g: number, at: number, damping = 13, stiffness = 170) => spring({frame: g - at, fps: 30, config: {damping, stiffness}});
const lin = (g: number, a: number, b: number) => cl((g - a) / Math.max(1, b - a));
const io = (k: number) => k * k * (3 - 2 * k);

// ─── Projeção isométrica (x para a direita-baixo, y para a esquerda-baixo, z para cima) ───
const OX = 540;
const OY = 560;
const P = (x: number, y: number, z: number): [number, number] => [OX + (x - y) * 0.866, OY + (x + y) * 0.5 - z];
const pts = (...ps: [number, number][]) => ps.map((p) => p.join(',')).join(' ');

type Tone = 'white' | 'bordo' | 'ice' | 'navy';
const TONE: Record<Tone, [string, string, string]> = {
  white: ['#F5F8FF', '#C8D3EC', '#97A6C9'],
  bordo: ['#E35B74', '#BA2842', '#86182C'],
  ice: ['#D9E8FF', '#96BEFA', '#6E96D8'],
  navy: ['#2A4A92', '#183470', '#0E1D3F'],
};

const Box: React.FC<{x: number; y: number; z?: number; w: number; d: number; h: number; tone?: Tone; label?: string; side?: string; fs?: number; glow?: boolean; opacity?: number}> = ({
  x,
  y,
  z = 0,
  w,
  d,
  h,
  tone = 'white',
  label,
  side,
  fs = 26,
  glow = false,
  opacity = 1,
}) => {
  const [top, left, right] = TONE[tone];
  const [lx, ly] = P(x, y + d, z + h);
  const [rx, ry] = P(x + w, y + d, z + h);
  const ink = tone === 'white' || tone === 'ice' ? C.navy : '#fff';
  return (
    <g opacity={opacity}>
      <polygon points={pts(P(x, y + d, z), P(x + w, y + d, z), P(x + w, y, z), P(x + w, y, z - 2))} fill="rgba(0,0,0,0)" />
      {z <= 0 && <ellipse cx={P(x + w / 2, y + d / 2, 0)[0]} cy={P(x + w / 2, y + d / 2, 0)[1]} rx={(w + d) * 0.62} ry={(w + d) * 0.24} fill="rgba(0,0,0,0.35)" style={{filter: 'blur(14px)'}} />}
      <polygon points={pts(P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h))} fill={left} />
      <polygon points={pts(P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h))} fill={right} />
      <polygon points={pts(P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h))} fill={top} style={glow ? {filter: `drop-shadow(0 0 18px ${C.ice})`} : undefined} />
      {label && (
        <text transform={`matrix(0.866,0.5,0,1,${lx},${ly})`} x={w / 2} y={Math.min(h - 10, 18 + fs)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={ink}>
          {label}
        </text>
      )}
      {side && (
        <text transform={`matrix(0.866,-0.5,0,1,${rx},${ry})`} x={d / 2} y={Math.min(h - 10, 18 + fs)} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs * 0.8} fill={ink} opacity={0.85}>
          {side}
        </text>
      )}
    </g>
  );
};

// Tubo neon sólido ao longo do eixo x (de x0 a x1), ligando os blocos, com faixas de luz correndo por cima
const Tube: React.FC<{x0: number; x1: number; y: number; z: number; on?: number; color?: string}> = ({x0, x1, y, z, on = 1}) => {
  const g = useCurrentFrame();
  const r = 16;
  const xe = x0 + (x1 - x0) * on;
  if (xe - x0 < 2) return null;
  const n = Math.floor((xe - x0) / 56);
  const off = (g * 7) % 56;
  return (
    <g>
      <ellipse cx={P((x0 + xe) / 2, y, 0)[0]} cy={P((x0 + xe) / 2, y, 0)[1]} rx={(xe - x0) * 0.5} ry={34} fill="rgba(150,190,250,0.16)" style={{filter: 'blur(18px)'}} />
      <Box x={x0} y={y - r} z={z - r} w={xe - x0} d={2 * r} h={2 * r} tone="ice" />
      {Array.from({length: n}).map((_, i) => {
        const xa = x0 + off + i * 56;
        if (xa + 22 > xe) return null;
        return <polygon key={i} points={pts(P(xa, y - 6, z + r + 1), P(xa + 22, y - 6, z + r + 1), P(xa + 22, y + 6, z + r + 1), P(xa, y + 6, z + r + 1))} fill="#fff" />;
      })}
    </g>
  );
};

// Tubo sólido ao longo do eixo y (de y0 a y1), na cor bordô (caminho do imposto)
const TubeY: React.FC<{x: number; y0: number; y1: number; z: number; on?: number}> = ({x, y0, y1, z, on = 1}) => {
  const ye = y1 + (y0 - y1) * (1 - on);
  if (y0 - ye < 2) return null;
  return <Box x={x - 15} y={ye} z={z - 15} w={30} d={y0 - ye} h={30} tone="bordo" />;
};

// Pacote (cubo pequeno) com rótulo flutuante
const Pacote: React.FC<{x: number; y: number; z: number; s?: number; tone?: Tone; tag?: string; k?: number}> = ({x, y, z, s = 70, tone = 'ice', tag, k = 1}) => {
  if (k <= 0.01) return null;
  const q = s * k;
  const [tx, ty] = P(x, y, z + q + 34);
  return (
    <g>
      <Box x={x - q / 2} y={y - q / 2} z={z - q / 2} w={q} d={q} h={q} tone={tone} glow />
      {tag && (
        <g transform={`translate(${tx}, ${ty}) scale(${k})`}>
          <rect x={-tag.length * 10.5 - 22} y={-30} width={tag.length * 21 + 44} height={50} rx={12} fill={tone === 'bordo' ? C.bordoLight : '#fff'} />
          <text y={6} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={28} fill={tone === 'bordo' ? '#fff' : C.navy}>
            {tag}
          </text>
        </g>
      )}
    </g>
  );
};

// Placa neon (texto grande com brilho) sobre o palco
const Neon: React.FC<{x: number; y: number; txt: string; k: number; size?: number; color?: string; sub?: string}> = ({x, y, txt, k, size = 92, color = C.ice, sub}) => (
  <g transform={`translate(${x}, ${y}) scale(${0.6 + 0.4 * k})`} opacity={cl(k * 1.5)}>
    <rect x={-txt.length * size * 0.36 - 40} y={-size * 0.95} width={txt.length * size * 0.72 + 80} height={size * 1.35 + (sub ? 56 : 0)} rx={22} fill="rgba(7,15,40,0.85)" stroke={color} strokeWidth={4} style={{filter: `drop-shadow(0 0 22px ${color})`}} />
    <text y={size * 0.12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill="#fff" style={{filter: `drop-shadow(0 0 12px ${color})`}}>
      {txt}
    </text>
    {sub && (
      <text y={size * 0.12 + 58} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={26} fill={color} letterSpacing={3}>
        {sub}
      </text>
    )}
  </g>
);

const Check: React.FC<{x: number; y: number; k: number; ok?: boolean; r?: number}> = ({x, y, k, ok = true, r = 34}) => (
  <g transform={`translate(${x}, ${y}) scale(${k})`} opacity={cl(k * 2)}>
    <circle r={r} fill={ok ? '#22A97A' : C.bordoLight} stroke="#fff" strokeWidth={5} />
    {ok ? (
      <path d={`M ${-r * 0.45} 0 L ${-r * 0.12} ${r * 0.32} L ${r * 0.48} ${-r * 0.32}`} stroke="#fff" strokeWidth={r * 0.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d={`M ${-r * 0.4} ${-r * 0.4} L ${r * 0.4} ${r * 0.4} M ${r * 0.4} ${-r * 0.4} L ${-r * 0.4} ${r * 0.4}`} stroke="#fff" strokeWidth={r * 0.2} strokeLinecap="round" />
    )}
  </g>
);

// ─── Moldura: fundo, piso isométrico, topo e legenda karaokê ───
const Piso: React.FC = () => {
  const ls: React.ReactNode[] = [];
  for (let i = -8; i <= 8; i++) {
    const a = P(i * 110, -900, 0);
    const b = P(i * 110, 900, 0);
    const c = P(-900, i * 110, 0);
    const d = P(900, i * 110, 0);
    ls.push(<line key={`a${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(150,190,250,0.07)" strokeWidth={2} />);
    ls.push(<line key={`b${i}`} x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} stroke="rgba(150,190,250,0.07)" strokeWidth={2} />);
  }
  return <g>{ls}</g>;
};

const Fundo: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 38%, #1B3A7A 0%, ${C.navy} 45%, ${C.navyDeep} 100%)`}} />
);

const Topo: React.FC<{tag: string}> = ({tag}) => {
  const f = useCurrentFrame();
  const k = spring({frame: f - 2, fps: 30, config: {damping: 14, stiffness: 180}});
  return (
    <>
      <div style={{position: 'absolute', top: 92, left: 64, fontFamily: mono, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: 'rgba(214,224,246,0.7)'}}>JCJURIDICO.BR · SPLIT PAYMENT</div>
      <div style={{position: 'absolute', top: 136, left: 64, transform: `translateX(${(1 - k) * -60}px)`, opacity: k, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(150,190,250,0.14)', border: `2px solid ${C.ice}`, borderRadius: 12, padding: '8px 18px'}}>
        <div style={{width: 14, height: 14, borderRadius: 7, background: C.ice, boxShadow: `0 0 12px ${C.ice}`}} />
        <span style={{fontFamily: mono, fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: 3}}>{tag}</span>
      </div>
      <Img src={staticFile('logo_white.png')} style={{position: 'absolute', top: 70, right: 64, height: 100}} />
    </>
  );
};

const Karaoke: React.FC = () => {
  const g = useG();
  const c = D.clips.find((x) => g >= x.at - 2 && g < x.at + x.frames + 8);
  if (!c) return null;
  let destaque = false;
  return (
    <div style={{position: 'absolute', top: 1360, left: 64, right: 64, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.32}}>
      {c.words.map((w, i) => {
        const ini = c.at + w.f;
        const dito = g >= ini;
        const abre = w.w.startsWith('*');
        if (abre) destaque = true;
        const hi = destaque;
        if (w.w.replace(/[.,:?!]+$/, '').endsWith('*')) destaque = false;
        const txt = w.w.replace(/\*/g, '');
        const k = spring({frame: g - ini, fps: 30, config: {damping: 12, stiffness: 260}});
        return (
          <span key={i} style={{display: 'inline-block', margin: '2px 0', opacity: dito ? 1 : 0.28, transform: `translateY(${dito ? (1 - k) * 14 : 0}px) scale(${dito ? 0.92 + 0.08 * k : 1})`, color: hi && dito ? '#fff' : '#fff', background: hi && dito ? C.bordoLight : 'transparent', borderRadius: 10, padding: '0 10px', textShadow: '0 4px 18px rgba(0,0,0,0.5)'}}>
            {txt}
          </span>
        );
      })}
    </div>
  );
};

const Base: React.FC<{texto: string; sub?: string; at: number}> = ({texto, sub, at}) => {
  const f = useCurrentFrame();
  const k = spring({frame: f - at, fps: 30, config: {damping: 16, stiffness: 150}});
  return (
    <div style={{position: 'absolute', left: 64, right: 64, top: 1690, opacity: k, transform: `translateY(${(1 - k) * 40}px)`, background: 'rgba(7,15,40,0.8)', border: '2px solid rgba(150,190,250,0.4)', borderRadius: 22, padding: '18px 30px 20px 40px'}}>
      <div style={{position: 'absolute', left: 0, top: 18, bottom: 18, width: 9, borderRadius: 5, background: C.bordoLight}} />
      <div style={{fontFamily: mono, fontWeight: 800, fontSize: 20, letterSpacing: 5, color: C.ice}}>BASE LEGAL</div>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, color: '#fff', marginTop: 4}}>{texto}</div>
      {sub && <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 24, color: C.soft, marginTop: 2}}>{sub}</div>}
    </div>
  );
};

// efeito sonoro em quadro absoluto
const Sfx: React.FC<{at: number; s: string; v?: number}> = ({at, s, v = 0.5}) => {
  const ini = useContext(Ctx);
  if (at - ini < 0) return null;
  return (
    <Sequence from={at - ini} layout="none">
      <Audio src={staticFile(`sfx/${s}.wav`)} volume={v} />
    </Sequence>
  );
};

// palco com câmera: zoom lento contínuo + empurrão rápido nos momentos de impacto
const Palco: React.FC<{children: React.ReactNode; z0?: number; z1?: number; punch?: number[]; cy?: number}> = ({children, z0 = 1, z1 = 1.08, punch = [], cy = 560}) => {
  const f = useCurrentFrame();
  const g = useG();
  const ini = useContext(Ctx);
  const cena = D.cenas.find((c) => c.ini === ini)!;
  const base = z0 + (z1 - z0) * io(cl((g - cena.ini) / (cena.fim - cena.ini)));
  const kick = punch.reduce((acc, p) => acc + (g >= p ? 0.06 * Math.exp(-(g - p) / 5) : 0), 0);
  const shake = punch.reduce((acc, p) => acc + (g >= p && g < p + 8 ? Math.sin(f * 2.7) * 6 * (1 - (g - p) / 8) : 0), 0);
  const s = base + kick;
  return (
    <svg width={1080} height={1180} viewBox="0 0 1080 1180" style={{position: 'absolute', top: 210, left: 0, overflow: 'visible'}}>
      <g transform={`translate(${540 + shake}, ${cy}) scale(${s}) translate(-540, -${cy})`}>
        <Piso />
        {children}
      </g>
    </svg>
  );
};

const Cena: React.FC<{tag: string; children: React.ReactNode}> = ({tag, children}) => {
  const f = useCurrentFrame();
  const flash = interpolate(f, [0, 6], [0.35, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Fundo />
      {children}
      <Topo tag={tag} />
      <Karaoke />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

// posição de um pacote que percorre o tubo de xa até xb entre os quadros a e b
const viagem = (g: number, a: number, b: number, xa: number, xb: number) => xa + (xb - xa) * io(lin(g, a, b));

// ─── Cenas ───
const Gancho: React.FC = () => {
  const g = useG();
  const tMeio = W(0, 7); // "meio"
  const parte = lin(g, tMeio - 4, tMeio + 22);
  const px = viagem(g, 12, tMeio + 40, -250, 250);
  const kTit = sp(g, 4, 12, 200);
  const sai = lin(g, END(0) + 4, END(0) + 16);
  return (
    <Cena tag="O IMPOSTO NO PIX">
      <Palco punch={[tMeio]} z0={0.93} z1={1.02}>
        <Tube x0={-250} x1={250} y={60} z={50} on={lin(g, 0, 14)} />
        <Box x={-470} y={-40} w={210} d={200} h={230} label="EMPRESA A" fs={30} />
        <Box x={260} y={-40} w={210} d={200} h={230} label="EMPRESA B" fs={30} />
        {g < tMeio + 40 && <Pacote x={px} y={60} z={50} tag="PIX" k={sp(g, 10)} />}
        <Pacote x={0} y={60} z={50 + 230 * io(parte)} tone="bordo" tag="IMPOSTO" k={g >= tMeio - 4 ? sp(g, tMeio - 4, 9, 200) : 0} s={84} />
        {g >= tMeio + 40 && <Pacote x={viagem(g, tMeio + 40, tMeio + 70, 0, 250)} y={60} z={50} tag="PIX" s={56} />}
      </Palco>
      <div style={{position: 'absolute', top: 260, left: 0, right: 0, textAlign: 'center', opacity: kTit * (1 - sai), transform: `scale(${0.85 + 0.15 * kTit})`}}>
        <div style={{display: 'inline-block', fontFamily: FONT, fontWeight: 900, fontSize: 92, lineHeight: 1.02, color: '#fff', textShadow: `0 0 30px ${C.ice}`}}>
          O IMPOSTO NO
          <br />
          <span style={{background: C.bordoLight, padding: '0 22px', borderRadius: 16}}>MEIO DO PIX</span>
        </div>
      </div>
      <Sfx at={2} s="whoosh" v={0.6} />
      <Sfx at={tMeio - 4} s="boom" v={0.9} />
      <Sfx at={tMeio} s="pop" v={0.7} />
      <Sfx at={clip(1).at} s="glitch" v={0.5} />
    </Cena>
  );
};

const SplitCena: React.FC = () => {
  const g = useG();
  const ini = iniDe('split');
  const kNeon = sp(g, clip(2).at + 4, 10, 180);
  const t3 = W(3, 3); // "R$ 1.000"
  const chega = W(4, 3); // "separa"
  const px = viagem(g, t3 - 6, chega, -250, 0);
  const sobe = lin(g, clip(5).at, clip(5).at + 26);
  const segue = lin(g, clip(6).at, clip(6).at + 30);
  const dividido = g >= chega;
  return (
    <Cena tag="SPLIT PAYMENT">
      <Palco punch={[clip(2).at + 4, chega]} z0={0.92} z1={0.98}>
        <Box x={-90} y={-330} w={180} d={150} h={190} z={0} label="GOVERNO" side="CBS · IBS" fs={26} opacity={lin(g, chega - 10, chega + 6)} />
        <TubeY x={0} y0={20} y1={-180} z={70} on={lin(g, chega, chega + 14)} />
        <Tube x0={-250} x1={250} y={60} z={50} />
        <Box x={-470} y={-40} w={210} d={200} h={230} label="EMPRESA A" fs={30} />
        <Box x={260} y={-40} w={210} d={200} h={230} label="EMPRESA B" fs={30} />
        <Box x={-70} y={10} w={140} d={100} h={130} tone="navy" label="BANCO" fs={24} />
        {!dividido && g >= t3 - 8 && <Pacote x={px} y={60} z={150} tag="R$ 1.000" k={sp(g, t3 - 8)} s={80} />}
        {dividido && (
          <>
            <Pacote x={0} y={60 - 315 * io(sobe)} z={150 - 70 * io(lin(g, clip(5).at - 6, clip(5).at + 6))} tone="bordo" tag="CBS + IBS" s={54} k={sp(g, chega - 2, 10, 200) * (1 - lin(g, clip(5).at + 26, clip(5).at + 32))} />
            <Pacote x={250 * io(segue)} y={60} z={150 - 100 * io(segue)} tag={g >= clip(6).at ? 'LÍQUIDO' : 'R$ ...'} s={66} />
          </>
        )}
      </Palco>
      {g < clip(3).at + 6 && <div style={{position: 'absolute', inset: 0}}><svg width={1080} height={1920}><Neon x={540} y={430} txt="SPLIT PAYMENT" k={kNeon} size={90} sub="= PAGAMENTO DIVIDIDO" /></svg></div>}
      <Sfx at={clip(2).at - 10} s="riser" v={0.5} />
      <Sfx at={clip(2).at + 4} s="boom" v={0.8} />
      <Sfx at={t3 - 6} s="whoosh" v={0.6} />
      <Sfx at={chega} s="glitch" v={0.6} />
      <Sfx at={clip(5).at + 30} s="kaching" v={0.7} />
      <Sfx at={clip(6).at + 28} s="pop" v={0.7} />
      <Base texto="LC 214/2025, arts. 31 a 35" sub="Recolhimento da CBS e do IBS na liquidação do pagamento" at={clip(5).at - ini} />
    </Cena>
  );
};

const Calma: React.FC = () => {
  const g = useG();
  const tiles: [string, number][] = [
    ['2027', W(7, 6)],
    ['OPCIONAL', W(7, 7)],
    ['SÓ ENTRE EMPRESAS', W(7, 10)],
  ];
  const fase2 = clip(8).at;
  const out1 = lin(g, fase2 - 6, fase2 + 6);
  const tNovo = W(8, 5); // "não é imposto novo"
  const pixX = viagem(g, fase2 + 6, fase2 + 40, -190, 190);
  return (
    <Cena tag="CALMA">
      <Palco punch={[tNovo + 8]} z0={1.0} z1={1.06}>
        {g < fase2 + 6 &&
          tiles.map(([t, at], i) => {
            const k = sp(g, at, 11, 200);
            const z = 40 + (1 - k) * 260;
            const [cx, cy] = P(-260 + i * 260, -60 + i * 60, z + 46);
            return (
              <g key={t} opacity={cl(k * 2) * (1 - out1)}>
                <Box x={-370 + i * 260} y={-160 + i * 60} z={z} w={230} d={150} h={40} tone="ice" />
                <text x={cx} y={cy + 28} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={t.length > 10 ? 30 : 44} fill="#fff" style={{filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))'}}>
                  {t}
                </text>
                <Check x={cx} y={cy - 70} k={k} />
              </g>
            );
          })}
        {g >= fase2 - 6 && (
          <g opacity={lin(g, fase2 - 6, fase2 + 6)}>
            <Tube x0={-190} x1={190} y={60} z={40} />
            <Box x={-380} y={-20} w={160} d={150} h={150} label="VOCÊ" fs={28} />
            <Box x={220} y={-20} w={160} d={150} h={150} label="AMIGO" fs={28} />
            <Pacote x={pixX} y={60} z={40} tag="PIX" s={60} />
            <Check x={P(0, 60, 240)[0]} y={P(0, 60, 240)[1]} k={sp(g, W(8, 3), 10, 200)} r={44} />
          </g>
        )}
      </Palco>
      {g >= tNovo && (
        <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center'}}>
          <div style={{display: 'inline-block', transform: `rotate(-6deg) scale(${2.2 - 1.2 * sp(g, tNovo, 14, 260)})`, opacity: cl(sp(g, tNovo, 14, 260) * 2), border: `8px solid ${C.bordoLight}`, color: '#fff', background: 'rgba(186,40,66,0.9)', borderRadius: 18, padding: '10px 30px', fontFamily: FONT, fontWeight: 900, fontSize: 60}}>NÃO É IMPOSTO NOVO</div>
        </div>
      )}
      {g < tiles[0][1] + 4 && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <Neon x={540} y={700} txt="CALMA" k={sp(g, iniDe('calma') + 4, 10, 180) * (1 - lin(g, tiles[0][1] - 4, tiles[0][1] + 4))} size={130} sub="ENTENDA O CRONOGRAMA" />
        </svg>
      )}
      {tiles.map(([t, at]) => (
        <Sfx key={t} at={at} s="stamp" v={0.6} />
      ))}
      <Sfx at={fase2 + 6} s="whoosh" v={0.5} />
      <Sfx at={iniDe('calma') + 4} s="boom" v={0.7} />
      <Sfx at={W(8, 3)} s="pop" v={0.7} />
      <Sfx at={tNovo} s="stamp" v={0.9} />
    </Cena>
  );
};

const Balanca: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => {
  const f = useCurrentFrame();
  const a = Math.sin(f / 10) * 6;
  const p = {stroke: '#fff', strokeWidth: 9, strokeLinecap: 'round' as const, fill: 'none'};
  return (
    <g transform={`translate(${x}, ${y}) scale(${k})`} opacity={cl(k * 2)} style={{filter: `drop-shadow(0 0 16px ${C.ice})`}}>
      <line x1={0} y1={-70} x2={0} y2={60} {...p} />
      <line x1={-60} y1={60} x2={60} y2={60} {...p} />
      <g transform={`rotate(${a} 0 -50)`}>
        <line x1={-80} y1={-50} x2={80} y2={-50} {...p} />
        <path d="M -80 -50 L -104 0 L -56 0 Z" {...p} strokeWidth={6} fill={C.ice} />
        <path d="M 80 -50 L 56 0 L 104 0 Z" {...p} strokeWidth={6} fill={C.ice} />
      </g>
    </g>
  );
};

const Advogado: React.FC = () => {
  const g = useG();
  const ini = iniDe('advogado');
  const kOf = sp(g, W(9, 7), 10, 170);
  const t10 = clip(10).at;
  const tHon = W(10, 5); // "honorários"
  const tSep = W(10, 11); // "separar"
  const px = viagem(g, tHon - 6, tSep, -260, 40);
  const depois = g >= tSep;
  const t30 = W(11, 6); // "redução de 30%"
  const enc = 1 - 0.3 * io(lin(g, t30, t30 + 18));
  const cam = g < t10 ? 1.18 : 1.0;
  return (
    <Cena tag="E O ADVOGADO?">
      <Palco punch={[W(9, 7), tSep, t30]} z0={cam} z1={cam + 0.05}>
        {g >= t10 - 4 && (
          <g opacity={lin(g, t10 - 4, t10 + 8)}>
            <Tube x0={-260} x1={160} y={60} z={50} />
            <Box x={-480} y={-40} w={210} d={200} h={230} label="EMPRESA" side="CLIENTE" fs={30} />
            {!depois && <Pacote x={px} y={60} z={50} tag="HONORÁRIOS" s={70} k={sp(g, tHon - 8)} />}
            {depois && (
              <>
                <Pacote x={40 + 120 * io(lin(g, tSep, tSep + 24))} y={60} z={50} tag="HONORÁRIOS" s={60} />
                <Pacote x={40} y={60 - 120 * io(lin(g, tSep, tSep + 20))} z={50 + 220 * io(lin(g, tSep, tSep + 20))} tone="bordo" tag={g >= t30 + 6 ? 'IBS/CBS −30%' : 'IBS/CBS'} s={84 * enc} />
              </>
            )}
          </g>
        )}
        <Box x={160} y={-60} w={260} d={240} h={290} tone="white" label="ADVOCACIA" side="ESCRITÓRIO" fs={32} opacity={cl(kOf * 2)} />
        <Balanca x={P(290, 60, 290)[0]} y={P(290, 60, 290)[1] - 110} k={kOf} />
      </Palco>
      {g < W(9, 7) + 6 && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <Neon x={540} y={700} txt="E O ADVOGADO?" k={sp(g, ini + 4, 10, 180) * (1 - lin(g, W(9, 7) - 4, W(9, 7) + 6))} size={96} sub="A PARTE QUE NINGUÉM CONTA" />
        </svg>
      )}
      {g >= t30 && (
        <div style={{position: 'absolute', top: 236, right: 56, transform: `rotate(8deg) scale(${sp(g, t30, 9, 220)})`}}>
          <div style={{width: 190, height: 190, borderRadius: 95, background: '#22A97A', border: '8px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 70, color: '#fff', boxShadow: '0 0 40px rgba(34,169,122,0.7)'}}>−30%</div>
        </div>
      )}
      <Sfx at={ini + 2} s="glitch" v={0.6} />
      <Sfx at={W(9, 7) - 14} s="riser" v={0.6} />
      <Sfx at={W(9, 7)} s="boom" v={0.9} />
      <Sfx at={tHon - 6} s="whoosh" v={0.6} />
      <Sfx at={tSep} s="glitch" v={0.6} />
      <Sfx at={t30} s="kaching" v={0.8} />
      <Base texto="LC 214/2025, art. 127" sub="Redução de 30% do IBS e da CBS para profissões intelectuais, como a advocacia" at={t30 + 10 - ini} />
    </Cena>
  );
};

const Fazer: React.FC = () => {
  const g = useG();
  const t13 = clip(13).at;
  const kDoc = sp(g, clip(12).at + 2, 12, 170);
  const tCom = W(12, 8); // "com ou sem tributo?"
  const alterna = g >= tCom ? Math.floor((g - tCom) / 10) % 2 : -1;
  const fase2 = g >= t13 - 4;
  const nivel = 1 - 0.28 * io(lin(g, W(13, 7), W(13, 7) + 24));
  return (
    <Cena tag="O QUE FAZER">
      <Palco punch={[t13]} z0={1.05} z1={1.12}>
        {!fase2 && (
          <g opacity={cl(kDoc * 2)} transform={`translate(0, ${(1 - kDoc) * -200})`}>
            <Box x={-230} y={-200} w={460} d={340} h={22} tone="white" />
            {(() => {
              const [x0, y0] = P(-230, -200, 22);
              return (
                <g transform={`matrix(0.866,0.5,-0.866,0.5,${x0},${y0})`}>
                  <text x={40} y={70} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.navy}>
                    CONTRATO DE
                  </text>
                  <text x={40} y={110} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.bordo}>
                    HONORÁRIOS
                  </text>
                  {[150, 175, 200].map((y) => (
                    <rect key={y} x={40} y={y} width={300} height={10} rx={5} fill="#C8D3EC" />
                  ))}
                  {['COM TRIBUTO', 'SEM TRIBUTO'].map((t, i) => (
                    <g key={t} transform={`translate(40, ${240 + i * 50})`}>
                      <rect width={34} height={34} rx={8} fill="#fff" stroke={C.navy} strokeWidth={4} />
                      {alterna === i && <path d="M 6 18 L 14 26 L 28 8" stroke={C.bordoLight} strokeWidth={6} fill="none" strokeLinecap="round" />}
                      <text x={50} y={27} fontFamily={mono} fontWeight={800} fontSize={26} fill={C.navy}>
                        {t}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })()}
          </g>
        )}
        {fase2 && (
          <g opacity={lin(g, t13 - 4, t13 + 8)}>
            <Box x={-140} y={-100} w={280} d={220} h={60} tone="navy" label="CAIXA" fs={28} />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const vis = i / 6 < nivel - 0.05;
              return vis ? <Box key={i} x={-90} y={-40} z={60 + i * 34} w={180} d={110} h={30} tone="ice" /> : null;
            })}
            <Pacote x={180} y={60} z={60 + 230 * (1 - io(lin(g, W(13, 7), W(13, 7) + 24)))} tone="bordo" s={60} k={1 - lin(g, W(13, 7) + 20, W(13, 7) + 28)} tag="IMPOSTO" />
          </g>
        )}
      </Palco>
      <Sfx at={clip(12).at + 2} s="whoosh" v={0.6} />
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} at={tCom + i * 10} s="pop" v={0.45} />
      ))}
      <Sfx at={t13} s="stamp" v={0.7} />
      <Sfx at={W(13, 7)} s="glitch" v={0.5} />
    </Cena>
  );
};

const Fecho: React.FC = () => {
  const g = useG();
  const c = clip(14);
  const k = sp(g, c.at + 2, 9, 200);
  const kC = sp(g, W(14, 7), 10, 200);
  return (
    <Cena tag="SALVE ESTE VÍDEO">
      <Palco z0={1.0} z1={1.06}>
        <Box x={-110} y={-110} w={220} d={220} h={220 * k} tone="bordo" glow />
        <g transform={`translate(${P(0, 0, 220)[0]}, ${P(0, 0, 220)[1] - 150}) scale(${k})`}>
          <path d="M -60 -90 L 60 -90 L 60 90 L 0 50 L -60 90 Z" fill="#fff" style={{filter: `drop-shadow(0 0 24px ${C.ice})`}} />
        </g>
      </Palco>
      <div style={{position: 'absolute', top: 1150, left: 0, right: 0, textAlign: 'center', opacity: kC, transform: `scale(${0.8 + 0.2 * kC})`}}>
        <span style={{fontFamily: mono, fontWeight: 800, fontSize: 34, color: C.ice, letterSpacing: 3}}>→ ENVIE PARA O SEU CONTADOR</span>
      </div>
      <Sfx at={c.at + 2} s="boom" v={0.8} />
      <Sfx at={W(14, 7)} s="pop" v={0.7} />
      <Base texto="LC 214/2025" sub="Cronograma previsto pela Receita Federal e pelo Comitê Gestor; pode mudar" at={20} />
    </Cena>
  );
};

const SCENE: Record<string, React.ReactNode> = {
  gancho: <Gancho />,
  split: <SplitCena />,
  calma: <Calma />,
  advogado: <Advogado />,
  fazer: <Fazer />,
  fecho: <Fecho />,
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const k = spring({frame: f, fps: 30, config: {damping: 16}});
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #1B3A7A, ${C.navyDeep})`, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{transform: `scale(${0.9 + 0.1 * k})`, opacity: k, textAlign: 'center'}}>
        <Img src={staticFile('logo_white.png')} style={{height: 280}} />
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 60, color: '#fff', marginTop: 40}}>Direito explicado</div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 60, color: C.ice}}>com base legal</div>
        <div style={{fontFamily: mono, fontWeight: 700, fontSize: 32, color: C.soft, marginTop: 30}}>@jcjuridico.br · link na bio</div>
      </div>
    </AbsoluteFill>
  );
};

export const SplitPayment: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {D.cenas.map((c) => (
      <Sequence key={c.id} from={c.ini} durationInFrames={c.fim - c.ini}>
        <Ctx.Provider value={c.ini}>{SCENE[c.id]}</Ctx.Provider>
      </Sequence>
    ))}
    <Sequence from={D.total - D.outro} durationInFrames={D.outro}>
      <Outro />
      <Audio src={staticFile('sfx/whoosh.wav')} volume={0.5} />
    </Sequence>
    {D.clips.map((c) => (
      <Sequence key={c.n} from={c.at} durationInFrames={c.frames + 6} layout="none">
        <Audio src={staticFile(c.src)} />
      </Sequence>
    ))}
    <Audio
      src={staticFile('music/pixabay-tech-explainer.mp3')}
      volume={(f) => {
        const falando = D.clips.some((c) => f >= c.at - 4 && f < c.at + c.frames + 4);
        const base = interpolate(f, [0, 15, D.total - 45, D.total - 4], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return base * (falando ? 0.07 : 0.13);
      }}
    />
  </AbsoluteFill>
);
