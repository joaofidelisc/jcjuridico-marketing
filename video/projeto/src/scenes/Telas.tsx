import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {TopLogo} from '../components/FeatureScene';
import {Headline, Kicker, SubText} from '../components/Headline';
import {Showcase, ScrollScreen} from '../components/Showcase';
import {C, FONT} from '../theme';

const Header: React.FC<{kicker: string; title: string}> = ({kicker, title}) => (
  <>
    <TopLogo />
    <div style={{position: 'absolute', top: 320, left: 70, right: 70}}>
      <Kicker text={kicker} delay={2} />
      <div style={{height: 24}} />
      <Headline text={title} size={80} delay={6} />
    </div>
  </>
);

// Horas extras: formulário e relatório técnico completos, depois cada parte ampliada.
export const Calculos: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Header kicker="Cálculos jurídicos" title="Cálculos **em segundos**" />
    <Showcase
      src="telas/he_full.jpg"
      imgW={1350}
      imgH={652}
      width={980}
      top={600}
      calloutTop={1180}
      calloutMaxH={560}
      focus={[
        {rect: [25, 135, 780, 560], from: 30, to: 125, caption: 'Você preenche os dados do caso'},
        {rect: [790, 200, 1335, 490], from: 125, to: 240, caption: 'Reflexos em DSR, 13º, férias e FGTS'},
      ]}
    />
  </AbsoluteFill>
);

export const Financeiro: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Header kicker="Financeiro" title="Seu financeiro **em um painel**" />
    <Showcase
      src="telas/fin_full.jpg"
      imgW={1350}
      imgH={1050}
      width={860}
      top={600}
      calloutTop={1360}
      calloutMaxH={400}
      focus={[
        {rect: [25, 95, 670, 297], from: 30, to: 100, caption: 'Receita recebida e lucro líquido'},
        {rect: [540, 470, 1250, 740], from: 100, to: 170, caption: 'Receitas e despesas mês a mês'},
        {rect: [25, 830, 800, 1045], from: 170, to: 240, caption: 'Lançamentos com status de pagamento'},
      ]}
    />
  </AbsoluteFill>
);

export const FunilJuridico: React.FC = () => (
  <AbsoluteFill>
    <Background variant="deep" />
    <Header kicker="Funil Jurídico" title="Seu Instagram **planejado**" />
    <ScrollScreen src="telas/funil_result.jpg" imgW={772} imgH={1429} width={940} viewH={1000} top={600} scrollFrom={45} scrollTo={200} />
    <div style={{position: 'absolute', top: 1690, left: 90, right: 90}}>
      <SubText text="Posts e stories da semana, com legenda e hashtags, organizados por etapa do funil." delay={20} size={40} />
    </div>
  </AbsoluteFill>
);

// Recriação fiel do chat da AdvogAI (pergunta real feita no sistema).
const PERGUNTA = 'Como as horas extras refletem no 13º salário?';
const RESPOSTA = [
  'As horas extras habituais entram na base de cálculo do 13º salário.',
  'Na prática, soma-se ao salário-base a média das horas extras feitas no ano.',
  'Em resumo: quanto mais horas extras ao longo do ano, maior será o 13º.',
];

const Bubble: React.FC<{side: 'left' | 'right'; children: React.ReactNode; appear: number}> = ({side, children, appear}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - appear, fps, config: {damping: 200}});
  const right = side === 'right';
  return (
    <div style={{display: 'flex', justifyContent: right ? 'flex-end' : 'flex-start', opacity: p, transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`}}>
      <div
        style={{
          maxWidth: 680,
          fontFamily: FONT,
          fontSize: 32,
          lineHeight: 1.42,
          padding: '22px 28px',
          borderRadius: 26,
          borderBottomRightRadius: right ? 6 : 26,
          borderBottomLeftRadius: right ? 26 : 6,
          background: right ? C.bordo : '#fff',
          color: right ? '#fff' : '#1F2937',
          border: right ? 'none' : '2px solid #E5E7EB',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const AdvogAI: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - 4, fps, config: {damping: 200}});
  const typed = Math.round(interpolate(frame, [22, 58], [0, PERGUNTA.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const sent = frame >= 64;
  const thinking = frame >= 72 && frame < 100;
  const words = RESPOSTA.join(' \n ').split(' ');
  const shown = Math.floor(interpolate(frame, [100, 200], [0, words.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const answer = words.slice(0, shown).join(' ').split(' \n ').filter(Boolean);
  return (
    <AbsoluteFill>
      <Background />
      <Header kicker="Inteligência artificial" title="Tire dúvidas com a **AdvogAI**" />
      <div
        style={{
          position: 'absolute',
          top: 600,
          left: 70,
          right: 70,
          height: 1120,
          borderRadius: 30,
          overflow: 'hidden',
          background: '#F7F8FB',
          boxShadow: '0 40px 90px rgba(0,0,0,0.45)',
          display: 'flex',
          flexDirection: 'column',
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [80, 0])}px)`,
        }}
      >
        <div style={{background: `linear-gradient(90deg, ${C.navyDeep}, #3A1424)`, padding: '26px 32px', display: 'flex', alignItems: 'center', gap: 22}}>
          <Img src={staticFile('telas/advogai-avatar.png')} style={{width: 84, height: 84, borderRadius: 42, border: '3px solid #fff'}} />
          <div style={{fontFamily: FONT, color: '#fff'}}>
            <div style={{fontSize: 36, fontWeight: 800}}>AdvogAI</div>
            <div style={{fontSize: 24, opacity: 0.8}}>Sua assistente inteligente</div>
          </div>
        </div>
        <div style={{flex: 1, padding: '34px 30px', display: 'flex', flexDirection: 'column', gap: 26, justifyContent: 'flex-start'}}>
          <Bubble side="left" appear={10}>
            Olá! Sou a AdvogAI, sua assistente virtual. Como posso ajudar você hoje?
          </Bubble>
          {sent && (
            <Bubble side="right" appear={64}>
              {PERGUNTA}
            </Bubble>
          )}
          {thinking && (
            <Bubble side="left" appear={72}>
              <div style={{display: 'flex', gap: 10, padding: '6px 0'}}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{width: 14, height: 14, borderRadius: 7, background: '#9CA3AF', opacity: 0.4 + 0.6 * Math.abs(Math.sin((frame - i * 4) / 5))}} />
                ))}
              </div>
            </Bubble>
          )}
          {frame >= 100 && (
            <Bubble side="left" appear={100}>
              {answer.map((par, i) => (
                <p key={i} style={{margin: i ? '16px 0 0' : 0, fontWeight: i === 2 ? 700 : 400}}>
                  {par}
                </p>
              ))}
            </Bubble>
          )}
        </div>
        <div style={{padding: '20px 26px', borderTop: '2px solid #E5E7EB', background: '#fff'}}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 30,
              border: `2px solid ${frame < 64 && frame > 16 ? '#22C55E' : '#E5E7EB'}`,
              borderRadius: 18,
              padding: '20px 24px',
              color: typed && !sent ? '#1F2937' : '#9CA3AF',
            }}
          >
            {sent || typed === 0 ? 'Pergunte algo...' : PERGUNTA.slice(0, typed)}
            {!sent && typed > 0 && <span style={{opacity: Math.floor(frame / 8) % 2 ? 1 : 0}}>|</span>}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1745, left: 90, right: 90}}>
        <SubText text="Pergunte sobre cálculos, prazos e legislação, a qualquer hora." delay={150} size={38} />
      </div>
    </AbsoluteFill>
  );
};
