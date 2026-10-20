import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import clips from '../voz/clips.json';
import {F, Paper, Title} from '../funil/ui';
import {Voice, sceneDur} from '../voz/Voice';
import {FONT} from '../theme';
import {AvatarAdvogAI, Fala, falaAtual, progressoFala} from './Avatar';

// Vídeo de apresentação da AdvogAI: ela mesma apresenta (voz 4, Sulafat) o que faz pelo escritório.
// As conversas mostradas são exemplos com dados fictícios da conta de demonstração.

type Clip = Fala & {text: string};
const FALAS = (clips as unknown as Record<string, Record<string, Clip[]>>).advogai;

// ─── Peças visuais ───────────────────────────────────────────────────────────

/** Avatar dentro do círculo lilás, com a cabeça saindo pelo topo. */
const AvatarCirculo: React.FC<{d: number; left: number; top: number; falas: Fala[]; delay?: number}> = ({d, left, top, falas, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entra = spring({frame: frame - delay, fps, config: {damping: 14}});
  const k = d / 800;
  return (
    <div style={{position: 'absolute', left, top, width: d, height: d}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: d / 2,
          background: 'radial-gradient(circle at 50% 40%, #CFC9FF, #B9B1F7)',
          transform: `scale(${entra})`,
        }}
      />
      <div style={{position: 'absolute', left: 0, top: -300 * k, width: d, height: 1100 * k, overflow: 'hidden', borderRadius: `0 0 ${d / 2}px ${d / 2}px`, opacity: entra}}>
        <div style={{position: 'absolute', left: -110 * k, top: 120 * k, transform: `translateY(${interpolate(entra, [0, 1], [120 * k, 0])}px)`}}>
          <AvatarAdvogAI size={1020 * k} falas={falas} />
        </div>
      </div>
    </div>
  );
};

/** Legenda com as palavras acendendo conforme a fala. */
const Legenda: React.FC<{falas: Clip[]; size?: number}> = ({falas, size = 52}) => {
  const frame = useCurrentFrame();
  const f = falaAtual(frame, falas);
  if (!f) return null;
  const palavras = f.text.split(' ');
  const ditas = Math.ceil(progressoFala(frame, f) * palavras.length);
  return (
    <div style={{fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.25, textAlign: 'center', letterSpacing: -0.5}}>
      {palavras.map((p, i) => (
        <span key={i} style={{color: i < ditas ? F.ink : 'rgba(20,33,61,0.38)'}}>
          {p}{' '}
        </span>
      ))}
    </div>
  );
};

/** Texto com **negrito**. */
const Rico: React.FC<{t: string}> = ({t}) => (
  <>
    {t.split('**').map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : <React.Fragment key={i}>{p}</React.Fragment>))}
  </>
);

type Msg = {quem: 'eu' | 'ia'; texto: string; at: number; botao?: string};

/** Cartão do chat da AdvogAI (mesmo visual do sistema), com pergunta, "digitando" e resposta. */
const Chat: React.FC<{msgs: Msg[]; top: number}> = ({msgs, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entra = spring({frame: frame - 4, fps, config: {damping: 200}});
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 70,
        right: 70,
        borderRadius: 30,
        overflow: 'hidden',
        background: '#F7F8FB',
        border: `2px solid ${F.line}`,
        boxShadow: '0 30px 70px rgba(20,33,61,0.14)',
        opacity: entra,
        transform: `translateY(${interpolate(entra, [0, 1], [60, 0])}px)`,
      }}
    >
      <div style={{background: `linear-gradient(90deg, #070F28, #3A1424)`, padding: '22px 30px', display: 'flex', alignItems: 'center', gap: 20}}>
        <Img src={staticFile('telas/advogai-avatar.png')} style={{width: 72, height: 72, borderRadius: 36, border: '3px solid #fff'}} />
        <div style={{fontFamily: FONT, color: '#fff'}}>
          <div style={{fontSize: 32, fontWeight: 800}}>AdvogAI</div>
          <div style={{fontSize: 22, opacity: 0.8}}>Sua assistente inteligente</div>
        </div>
      </div>
      <div style={{padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 20, minHeight: 470}}>
        {msgs.map((m, i) => {
          if (frame < m.at) return null;
          const p = spring({frame: frame - m.at, fps, config: {damping: 200}});
          const eu = m.quem === 'eu';
          // "digitando..." antes da resposta da IA
          const digitando = !eu && frame < m.at + 22;
          const palavras = m.texto.split(' ');
          const n = eu ? palavras.length : Math.floor(interpolate(frame, [m.at + 22, m.at + 22 + palavras.length * 2.2], [0, palavras.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
          return (
            <div key={i} style={{display: 'flex', justifyContent: eu ? 'flex-end' : 'flex-start', opacity: p, transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`}}>
              <div
                style={{
                  maxWidth: 760,
                  fontFamily: FONT,
                  fontSize: 31,
                  lineHeight: 1.42,
                  padding: '20px 26px',
                  borderRadius: 26,
                  borderBottomRightRadius: eu ? 6 : 26,
                  borderBottomLeftRadius: eu ? 26 : 6,
                  background: eu ? '#8B1A2B' : '#fff',
                  color: eu ? '#fff' : '#1F2937',
                  border: eu ? 'none' : '2px solid #E5E7EB',
                }}
              >
                {digitando ? (
                  <div style={{display: 'flex', gap: 10, padding: '8px 0'}}>
                    {[0, 1, 2].map(j => (
                      <div key={j} style={{width: 13, height: 13, borderRadius: 7, background: '#9CA3AF', opacity: 0.4 + 0.6 * Math.abs(Math.sin((frame - j * 4) / 5))}} />
                    ))}
                  </div>
                ) : (
                  <>
                    {palavras.slice(0, n).join(' ').split('\n').map((linha, j) => (
                      <div key={j} style={{marginTop: j ? 8 : 0}}>
                        <Rico t={linha} />
                      </div>
                    ))}
                    {m.botao && n >= palavras.length && (
                      <div style={{marginTop: 16, display: 'inline-block', fontWeight: 700, fontSize: 28, color: '#fff', background: '#8B1A2B', borderRadius: 16, padding: '12px 22px'}}>
                        {m.botao} →
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Cabecalho: React.FC<{n: string; kicker: string; titulo: string}> = ({n, kicker, titulo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 2, fps, config: {damping: 200}});
  return (
    <div style={{position: 'absolute', top: 200, left: 70, right: 70}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: p, fontFamily: FONT}}>
        <div style={{fontSize: 32, fontWeight: 800, color: '#fff', background: F.bordo, borderRadius: 14, padding: '6px 16px'}}>{n}</div>
        <div style={{fontSize: 30, fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase', color: F.bordo}}>{kicker}</div>
      </div>
      <div style={{height: 24}} />
      <Title text={titulo} size={74} delay={6} />
    </div>
  );
};

// ─── Cenas ───────────────────────────────────────────────────────────────────

const Intro: React.FC = () => (
  <AbsoluteFill>
    <Paper label="AdvogAI" />
    <div style={{position: 'absolute', top: 230, left: 70, right: 70}}>
      <Title text="Olá, eu sou a **AdvogAI**" size={92} delay={4} align="center" />
    </div>
    <div style={{position: 'absolute', top: 470, left: 80, right: 80}}>
      <Legenda falas={FALAS.Intro} />
    </div>
    <AvatarCirculo d={800} left={140} top={860} falas={FALAS.Intro} />
  </AbsoluteFill>
);

/** Cena de recurso: título, conversa de exemplo e a AdvogAI falando no canto. */
const Recurso: React.FC<{id: string; n: string; kicker: string; titulo: string; msgs: Msg[]}> = ({id, n, kicker, titulo, msgs}) => (
  <AbsoluteFill>
    <Paper label="AdvogAI" />
    <Cabecalho n={n} kicker={kicker} titulo={titulo} />
    <Chat msgs={msgs} top={500} />
    <AvatarCirculo d={420} left={590} top={1260} falas={FALAS[id]} delay={6} />
    <div style={{position: 'absolute', top: 1290, left: 70, width: 500}}>
      <Legenda falas={FALAS[id]} size={38} />
    </div>
  </AbsoluteFill>
);

const Duvidas = () => (
  <Recurso
    id="Duvidas"
    n="1"
    kicker="Tira dúvidas"
    titulo="Cálculos, prazos e **legislação**"
    msgs={[
      {quem: 'eu', texto: 'Como as horas extras refletem no 13º salário?', at: 30},
      {quem: 'ia', texto: 'As horas extras habituais entram na base do 13º. Na prática, soma-se ao salário-base a **média das horas extras** feitas no ano.', at: 60},
    ]}
  />
);

const Calculo = () => (
  <Recurso
    id="Calculo"
    n="2"
    kicker="Explica seus cálculos"
    titulo="O resultado em **linguagem simples**"
    msgs={[
      {quem: 'eu', texto: 'O que significa este resultado?', at: 30},
      {quem: 'ia', texto: 'Na rescisão sem justa causa, o total de **R$ 17.111,11** soma aviso prévio de 42 dias, 13º, férias com 1/3 e a multa de 40% do FGTS.', at: 60},
    ]}
  />
);

const Dados = () => (
  <Recurso
    id="Dados"
    n="3"
    kicker="Consulta seus dados"
    titulo="Agenda, clientes e **financeiro**"
    msgs={[
      {quem: 'eu', texto: 'Quais são meus compromissos desta semana?', at: 30},
      {quem: 'ia', texto: 'Você tem 3 compromissos:\n• **9/10** Consulta com Marina Souza\n• **13/10** Prazo da contestação de Paulo Menezes\n• **14/10** Audiência de Roberto Lima', at: 60},
    ]}
  />
);

const Cadastro = () => (
  <Recurso
    id="Cadastro"
    n="4"
    kicker="Cadastra pelo chat"
    titulo="É só **conversar**"
    msgs={[
      {quem: 'eu', texto: 'Cadastre uma audiência amanhã às 14h.', at: 30},
      {quem: 'ia', texto: 'Claro! Qual é o **nome do cliente** e o número do processo?', at: 60},
      {quem: 'eu', texto: 'Roberto Lima, processo 1001234-56.', at: 150},
      {quem: 'ia', texto: 'Pronto! Audiência cadastrada na sua **agenda**.', at: 180},
    ]}
  />
);

const Navegacao = () => (
  <Recurso
    id="Navegacao"
    n="5"
    kicker="Leva à tela certa"
    titulo="Sem procurar nos **menus**"
    msgs={[
      {quem: 'eu', texto: 'Quero cadastrar um novo cliente.', at: 30},
      {quem: 'ia', texto: 'Você pode fazer isso em **Gestão de Clientes**. Quer que eu te leve até o formulário?', at: 60, botao: 'Abrir cadastro de cliente'},
    ]}
  />
);

const Seguranca: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 8, fps, config: {damping: 12}});
  return (
    <AbsoluteFill>
      <Paper label="AdvogAI" />
      <div style={{position: 'absolute', top: 260, left: 70, right: 70}}>
        <Title text="Só os dados do **seu escritório**" size={86} delay={4} align="center" />
      </div>
      <div style={{position: 'absolute', top: 600, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${p})`}}>
        <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke={F.bordo} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" fill="#F4E3E6" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>
      <div style={{position: 'absolute', top: 860, left: 80, right: 80}}>
        <Legenda falas={FALAS.Seguranca} size={48} />
      </div>
      <AvatarCirculo d={620} left={230} top={1130} falas={FALAS.Seguranca} />
    </AbsoluteFill>
  );
};

const Chamada: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pill = spring({frame: frame - 120, fps, config: {damping: 12}});
  return (
    <AbsoluteFill>
      <Paper label="AdvogAI" logo={false} footer={false} />
      <Img src={staticFile('logo_color.png')} style={{position: 'absolute', top: 120, left: 450, width: 180}} />
      <div style={{position: 'absolute', top: 360, left: 70, right: 70}}>
        <Title text="Teste **grátis** por 30 dias" size={100} delay={4} align="center" />
      </div>
      <div style={{position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: pill}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 52, color: '#fff', background: F.bordo, padding: '26px 60px', borderRadius: 70, transform: `scale(${pill})`, boxShadow: '0 24px 60px rgba(139,26,43,0.3)'}}>
          jcjuridico.com.br
        </div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 38, color: F.ink}}>@jcjuridico.br</div>
      </div>
      <AvatarCirculo d={760} left={160} top={1060} falas={FALAS.Chamada} />
    </AbsoluteFill>
  );
};

// ─── Composição ──────────────────────────────────────────────────────────────

const CENAS: {id: string; C: React.FC; base: number}[] = [
  {id: 'Intro', C: Intro, base: 330},
  {id: 'Duvidas', C: Duvidas, base: 270},
  {id: 'Calculo', C: Calculo, base: 290},
  {id: 'Dados', C: Dados, base: 300},
  {id: 'Cadastro', C: Cadastro, base: 300},
  {id: 'Navegacao', C: Navegacao, base: 250},
  {id: 'Seguranca', C: Seguranca, base: 170},
  {id: 'Chamada', C: Chamada, base: 270},
];
const DURS = CENAS.map(c => sceneDur('advogai', c.id, c.base));
export const ADVOGAI_TOTAL = DURS.reduce((a, b) => a + b, 0);

export const AdvogAIApresentacao: React.FC<{music: string}> = ({music}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const vol = interpolate(frame, [0, fps, ADVOGAI_TOTAL - 2 * fps, ADVOGAI_TOTAL], [0, 0.16, 0.16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  let start = 0;
  return (
    <AbsoluteFill style={{background: F.paper}}>
      {CENAS.map((c, i) => {
        const from = start;
        start += DURS[i];
        return (
          <Sequence key={c.id} from={from} durationInFrames={DURS[i]} name={c.id}>
            <Transicao dur={DURS[i]}>
              <c.C />
            </Transicao>
            <Voice video="advogai" id={c.id} />
          </Sequence>
        );
      })}
      <Audio src={staticFile(music)} volume={vol} />
    </AbsoluteFill>
  );
};

/** Entrada e saída suaves de cada cena (fade curto). */
const Transicao: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8, dur - 8, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};
