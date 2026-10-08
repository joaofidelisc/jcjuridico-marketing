import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';
import {Body, F, Paper, Points, Progress, ShotCard, StepTag, Title} from './ui';

const W = 772; // largura dos prints do Funil Jurídico
const H = 652;
const CARD = {width: 940, height: 820, top: 540};

const pop = (frame: number, fps: number, delay: number, damping = 200) => spring({frame: frame - delay, fps, config: {damping}});

// 1. Gancho
export const FHook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, fps, 40, 12);
  return (
    <AbsoluteFill>
      <Paper />
      <div style={{position: 'absolute', top: 520, left: 80, right: 80}}>
        <Title text="Falta tempo para cuidar do **Instagram** do escritório?" size={104} delay={4} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1160,
          left: 80,
          width: 300,
          height: 300,
          borderRadius: 70,
          border: `10px solid ${F.ink}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${p}) rotate(${interpolate(p, [0, 1], [-12, -6])}deg)`,
        }}
      >
        <div style={{width: 120, height: 120, borderRadius: 60, border: `10px solid ${F.ink}`}} />
        <div style={{position: 'absolute', top: 34, right: 40, width: 22, height: 22, borderRadius: 11, background: F.bordo}} />
      </div>
      <div style={{position: 'absolute', top: 1220, left: 440, right: 80}}>
        <Body text="Ideias que não saem do papel, semanas sem publicar e posts sem objetivo." delay={34} size={44} />
      </div>
    </AbsoluteFill>
  );
};

// 2. Problema
export const FProblema: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items = ['Posts sem estratégia', 'Semanas sem publicar', 'Nenhuma chamada para ação'];
  return (
    <AbsoluteFill>
      <Paper />
      <div style={{position: 'absolute', top: 360, left: 80, right: 80}}>
        <Title text="Publicar sem planejamento **não traz clientes.**" size={96} delay={2} />
      </div>
      <div style={{position: 'absolute', top: 900, left: 80, right: 80, display: 'flex', flexDirection: 'column', gap: 34}}>
        {items.map((t, i) => {
          const d = 30 + i * 30;
          const p = pop(frame, fps, d);
          const strike = interpolate(frame, [d + 12, d + 24], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <div
              key={t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 30,
                background: '#fff',
                border: `2px solid ${F.line}`,
                borderRadius: 26,
                padding: '34px 36px',
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
              }}
            >
              <div style={{width: 60, height: 60, borderRadius: 30, background: F.bordoSoft, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width="30" height="30" viewBox="0 0 24 24">
                  <path d="M6 6l12 12M18 6L6 18" stroke={F.bordo} strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{position: 'relative', fontFamily: FONT, fontWeight: 700, fontSize: 46, color: F.muted}}>
                {t}
                <div style={{position: 'absolute', left: 0, top: '52%', height: 4, width: `${strike}%`, background: F.bordo}} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 3. Apresentação
export const FApresenta: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, fps, 2, 14);
  return (
    <AbsoluteFill>
      <Paper logo={false} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 50, padding: '0 80px'}}>
        <Img src={staticFile('logo_color.png')} style={{height: 190, transform: `scale(${p})`}} />
        <Body text="Conheça o" delay={10} size={50} align="center" color={F.ink} />
        <Title text="**Funil Jurídico**" size={128} delay={14} align="center" />
        <Body text="O planejador de conteúdo do JC Jurídico que monta a semana de posts do seu escritório." delay={30} size={44} align="center" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 4. Visão geral dos 3 passos
export const FPassos: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const steps = [
    ['01', 'Dados', 'Conte sobre o escritório'],
    ['02', 'Configuração', 'Escolha dias e formato'],
    ['03', 'Resultado', 'Receba o plano da semana'],
  ];
  return (
    <AbsoluteFill>
      <Paper />
      <div style={{position: 'absolute', top: 340, left: 80, right: 80}}>
        <Title text="Tudo em **3 passos**" size={104} delay={2} />
      </div>
      <div style={{position: 'absolute', top: 680, left: 80, right: 80, display: 'flex', flexDirection: 'column', gap: 40}}>
        {steps.map(([n, t, d], i) => {
          const p = pop(frame, fps, 18 + i * 22);
          return (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 40, opacity: p, transform: `translateX(${interpolate(p, [0, 1], [80, 0])}px)`}}>
              <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 170, lineHeight: 1, color: 'transparent', WebkitTextStroke: `4px ${F.bordo}`, width: 260}}>{n}</div>
              <div>
                <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 60, color: F.ink}}>{t}</div>
                <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 40, color: F.muted, marginTop: 6}}>{d}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const StepHeader: React.FC<{n: string; label: string; title: string; step: number}> = ({n, label, title, step}) => (
  <>
    <Paper />
    <Progress active={step} />
    <div style={{position: 'absolute', top: 220, left: 70, right: 70}}>
      <StepTag n={n} label={label} delay={2} />
      <div style={{height: 30}} />
      <Title text={title} size={78} delay={6} />
    </div>
  </>
);

// 5. Passo 1: dados do perfil
export const FPasso1: React.FC = () => (
  <AbsoluteFill>
    <StepHeader n="01" label="Dados" title="Conte sobre o **seu escritório**" step={1} />
    <ShotCard
      {...CARD}
      imgW={W}
      imgH={H}
      delay={8}
      shots={[
        {src: 'funil/dados_vazio.jpg', from: 0},
        {src: 'funil/dados_areas.jpg', from: 100},
        {src: 'funil/dados_ok.jpg', from: 200},
      ]}
      cams={[
        {at: 60, rect: [20, 395, 470, 540]},
        {at: 200, rect: [20, 330, 560, 540]},
        {at: 300},
      ]}
    />
    <Points
      top={1400}
      items={[
        {t: 'Suas áreas de atuação', at: 64},
        {t: 'O público que você atende', at: 204},
        {t: 'O diferencial do escritório', at: 245},
      ]}
    />
  </AbsoluteFill>
);

// 6. Passo 2: configuração
export const FPasso2: React.FC = () => (
  <AbsoluteFill>
    <StepHeader n="02" label="Configuração" title="Escolha **quando e como** postar" step={2} />
    <ShotCard
      {...CARD}
      imgW={W}
      imgH={H}
      delay={8}
      shots={[
        {src: 'funil/config_vazio.jpg', from: 0},
        {src: 'funil/config_ok.jpg', from: 80},
      ]}
      cams={[
        {at: 85, rect: [20, 135, 500, 240]},
        {at: 165, rect: [20, 245, 385, 480]},
        {at: 240, rect: [385, 245, 752, 480]},
        {at: 310},
      ]}
    />
    <Points
      top={1400}
      items={[
        {t: 'Dias de postagem', at: 88},
        {t: 'Posts, stories ou ambos', at: 168},
        {t: 'Tom de voz da comunicação', at: 243},
      ]}
    />
  </AbsoluteFill>
);

// 7. Passo 3: gerar e receber o plano
export const FPasso3: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const press = interpolate(frame, [24, 28, 32], [1, 0.94, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const loading = frame >= 30;
  const btn = interpolate(frame, [70, 78], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bp = pop(frame, fps, 4);
  return (
    <AbsoluteFill>
      <StepHeader n="03" label="Resultado" title="Seu plano da semana, **pronto**" step={3} />
      {btn > 0 && (
        <div style={{position: 'absolute', top: 860, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: btn * bp}}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 50,
              color: '#fff',
              background: F.bordo,
              borderRadius: 26,
              padding: '36px 64px',
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              transform: `scale(${press})`,
              boxShadow: '0 24px 50px rgba(139,26,43,0.3)',
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    border: '6px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    transform: `rotate(${frame * 14}deg)`,
                  }}
                />
                Gerando...
              </>
            ) : (
              <>Gerar Planejamento ➤</>
            )}
          </div>
        </div>
      )}
      {frame >= 74 && (
        <ShotCard
          {...CARD}
          imgW={W}
          imgH={1429}
          delay={74}
          shots={[{src: 'funil/result.jpg', from: 0}]}
          cams={[
            {at: 74, rect: [0, 0, 772, 652]},
            {at: 140, rect: [15, 320, 520, 450]},
            {at: 235, rect: [15, 455, 530, 620]},
          ]}
        />
      )}
      <Points
        top={1400}
        items={[
          {t: 'Conteúdo por etapa do funil', at: 144},
          {t: 'Calendário da semana organizado', at: 238},
        ]}
      />
    </AbsoluteFill>
  );
};

// 8. O que é cada etapa do funil
export const FEtapas: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bands = [
    {c: F.topo, t: 'Topo · Atrair', d: 'Alcança quem ainda não conhece você', w: 960},
    {c: F.meio, t: 'Meio · Relacionar', d: 'Gera confiança e autoridade', w: 800},
    {c: F.fundo, t: 'Fundo · Converter', d: 'Convida para a consulta', w: 640},
  ];
  return (
    <AbsoluteFill>
      <Paper />
      <div style={{position: 'absolute', top: 260, left: 80, right: 80}}>
        <Title text="Cada post tem **um objetivo**" size={92} delay={2} />
      </div>
      <div style={{position: 'absolute', top: 620, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        {bands.map((b, i) => {
          const p = pop(frame, fps, 20 + i * 30);
          const next = bands[i + 1]?.w ?? b.w - 180;
          const inset = ((b.w - next) / 2 / b.w) * 100;
          return (
            <div
              key={b.t}
              style={{
                width: b.w,
                height: 300,
                background: b.c,
                clipPath: `polygon(0 0, 100% 0, ${100 - inset}% 100%, ${inset}% 100%)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [-60, 0])}px)`,
                fontFamily: FONT,
                color: '#fff',
                textAlign: 'center',
                padding: '0 50px',
              }}
            >
              <div style={{fontSize: 48, fontWeight: 800, whiteSpace: 'nowrap'}}>{b.t}</div>
              <div style={{fontSize: 34, fontWeight: 500, marginTop: 10, opacity: 0.95}}>{b.d}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 1660, left: 90, right: 90}}>
        <Body text="Assim o seu Instagram leva o seguidor do primeiro contato até a consulta." delay={120} size={40} align="center" />
      </div>
    </AbsoluteFill>
  );
};

// 9. Post pronto para publicar
export const FPost: React.FC = () => (
  <AbsoluteFill>
    <Paper />
    <div style={{position: 'absolute', top: 230, left: 70, right: 70}}>
      <Title text="Cada post vem **pronto para publicar**" size={80} delay={2} />
    </div>
    <ShotCard
      width={940}
      height={820}
      top={540}
      imgW={732}
      imgH={652}
      delay={6}
      shots={[{src: 'funil/post.jpg', from: 0}]}
      cams={[
        {at: 50, rect: [15, 95, 717, 215]},
        {at: 150, rect: [15, 225, 717, 350]},
        {at: 250, rect: [15, 340, 717, 395]},
        {at: 335},
      ]}
    />
    <Points
      top={1400}
      items={[
        {t: 'Legenda e chamada para ação', at: 54},
        {t: 'Roteiro para Reels', at: 154},
        {t: 'Hashtags e marcar como feito', at: 254},
      ]}
    />
  </AbsoluteFill>
);

const Cards: React.FC<{title: string; items: {icon: React.ReactNode; t: string}[]}> = ({title, items}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Paper />
      <div style={{position: 'absolute', top: 280, left: 80, right: 80}}>
        <Title text={title} size={92} delay={2} />
      </div>
      <div style={{position: 'absolute', top: 640, left: 80, right: 80, display: 'flex', flexDirection: 'column', gap: 28}}>
        {items.map((it, i) => {
          const p = pop(frame, fps, 20 + i * 26);
          return (
            <div
              key={it.t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 34,
                background: '#fff',
                border: `2px solid ${F.line}`,
                borderLeft: `10px solid ${F.bordo}`,
                borderRadius: 24,
                padding: '34px 36px',
                opacity: p,
                transform: `translateX(${interpolate(p, [0, 1], [90, 0])}px)`,
                boxShadow: '0 14px 40px rgba(20,33,61,0.07)',
              }}
            >
              <div style={{width: 84, height: 84, borderRadius: 22, background: F.bordoSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                {it.icon}
              </div>
              <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 42, lineHeight: 1.25, color: F.ink}}>{it.t}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const I = (d: string) => (
  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke={F.bordo} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICON = {
  clock: I('M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'),
  target: I('M12 12h.01M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M16 8l5-5'),
  shield: I('M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4'),
  cal: I('M4 6h16v14H4zM4 10h16M8 3v4M16 3v4'),
  chart: I('M4 20V10M10 20V4M16 20v-7M22 20H2'),
  star: I('M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z'),
  users: I('M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM22 20v-2a4 4 0 0 0-3-3.9M16 4.1a4 4 0 0 1 0 7.8'),
  news: I('M4 5h13v14H6a2 2 0 0 1-2-2V5zM17 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5'),
  scale: I('M12 3v18M5 7h14M5 7l-3 7h6l-3-7zM19 7l-3 7h6l-3-7zM8 21h8'),
};

// 10. No que otimiza
export const FOtimiza: React.FC = () => (
  <Cards
    title="No que o Funil **otimiza**"
    items={[
      {icon: ICON.clock, t: 'Planejamento da semana em poucos minutos'},
      {icon: ICON.target, t: 'Temas alinhados às suas áreas e ao seu público'},
      {icon: ICON.news, t: 'Assuntos em alta pesquisados na internet'},
      {icon: ICON.cal, t: 'Dias, formatos e legendas já definidos'},
      {icon: ICON.shield, t: 'Sugestões com atenção à ética da advocacia'},
    ]}
  />
);

// 11. O que o escritório ganha
export const FGanhos: React.FC = () => (
  <Cards
    title="O que o escritório **ganha**"
    items={[
      {icon: ICON.chart, t: 'Presença constante nas redes sociais'},
      {icon: ICON.star, t: 'Autoridade na sua área de atuação'},
      {icon: ICON.users, t: 'Mais pessoas chegando até você'},
      {icon: ICON.scale, t: 'Mais tempo para o que importa: advogar'},
    ]}
  />
);

// 12. Chamada final
export const FCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pill = pop(frame, fps, 30, 12);
  const pulse = 1 + Math.sin(frame / 7) * 0.02 * (frame > 45 ? 1 : 0);
  return (
    <AbsoluteFill>
      <Paper logo={false} footer={false} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 48, padding: '0 80px'}}>
        <Img src={staticFile('logo_color.png')} style={{height: 200, opacity: pop(frame, fps, 2)}} />
        <Title text="Teste o **Funil Jurídico** grátis por 30 dias" size={92} delay={8} align="center" />
        <Body text="Junto com cálculos, agenda, clientes e financeiro, no JC Jurídico." delay={22} size={42} align="center" />
        <div
          style={{
            marginTop: 20,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 52,
            color: '#fff',
            background: F.bordo,
            padding: '30px 64px',
            borderRadius: 80,
            transform: `scale(${pill * pulse})`,
            boxShadow: '0 24px 60px rgba(139,26,43,0.35)',
          }}
        >
          jcjuridico.com.br
        </div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 38, color: F.ink, opacity: pill}}>@jcjuridico.br</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Extra do passo 2: opção "Usar notícias atuais" (a IA pesquisa na web os assuntos em alta).
const Chip: React.FC<{t: string; at: number; color: string}> = ({t, at, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 34,
        color,
        background: '#fff',
        border: `3px solid ${color}`,
        borderRadius: 40,
        padding: '14px 28px',
        opacity: p,
        transform: `scale(${interpolate(p, [0, 1], [0.7, 1])})`,
      }}
    >
      {t}
    </div>
  );
};

export const FNoticias: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const showShot = frame < 150;
  const shotOut = interpolate(frame, [130, 150], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ill = pop(frame, fps, 150);
  const query = 'notícias e tendências do Brasil';
  const typed = Math.round(interpolate(frame, [165, 205], [0, query.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const card = pop(frame, fps, 270);
  return (
    <AbsoluteFill>
      <Paper />
      <Progress active={2} />
      <div style={{position: 'absolute', top: 220, left: 70, right: 70}}>
        <StepTag n="+" label="Notícias atuais" delay={2} />
        <div style={{height: 30}} />
        <Title text="A IA pesquisa os **assuntos do momento**" size={78} delay={6} />
      </div>
      {showShot && (
        <div style={{opacity: shotOut}}>
          <ShotCard
            {...CARD}
            imgW={W}
            imgH={H}
            delay={6}
            shots={[
              {src: 'funil/config_ok.jpg', from: 0},
              {src: 'funil/config_news.jpg', from: 70},
            ]}
            marks={[{rect: [20, 492, 752, 563], from: 30, to: 150}]}
          />
        </div>
      )}
      {frame >= 150 && (
        <div style={{position: 'absolute', top: 560, left: 70, right: 70, opacity: ill, transform: `translateY(${interpolate(ill, [0, 1], [50, 0])}px)`}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              background: '#fff',
              border: `2px solid ${F.line}`,
              borderRadius: 50,
              padding: '26px 34px',
              boxShadow: '0 18px 44px rgba(20,33,61,0.10)',
              fontFamily: FONT,
              fontSize: 38,
              color: F.ink,
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={F.bordo} strokeWidth="2.6" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <span style={{fontWeight: 600}}>{query.slice(0, typed)}</span>
            <span style={{opacity: typed < query.length && Math.floor(frame / 8) % 2 ? 1 : 0, color: F.bordo}}>|</span>
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', marginTop: 40}}>
            <Chip t="Notícias da sua área" at={212} color={F.topo} />
            <Chip t="Assuntos em alta" at={224} color={F.meio} />
            <Chip t="Tendências do Brasil" at={236} color={F.fundo} />
          </div>
          <div
            style={{
              marginTop: 50,
              background: '#fff',
              border: `2px solid ${F.line}`,
              borderRadius: 28,
              padding: '30px 34px',
              boxShadow: '0 24px 60px rgba(20,33,61,0.12)',
              fontFamily: FONT,
              opacity: card,
              transform: `translateY(${interpolate(card, [0, 1], [50, 0])}px)`,
            }}
          >
            <div style={{fontSize: 26, fontWeight: 700, color: F.muted, letterSpacing: 3}}>NO SEU POST</div>
            <div style={{display: 'flex', gap: 18, alignItems: 'flex-start', marginTop: 18, background: '#F6F7F9', border: `2px solid ${F.line}`, borderRadius: 18, padding: '20px 22px'}}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={F.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
                <path d="M4 5h13v14H6a2 2 0 0 1-2-2V5zM17 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5" />
              </svg>
              <div style={{fontSize: 32, lineHeight: 1.4, color: F.ink}}>
                <b>Tendência:</b> o assunto em alta que inspirou o tema do post
              </div>
            </div>
            <div style={{marginTop: 22, fontSize: 30, fontWeight: 700, color: F.ink}}>Fontes das notícias</div>
            <div style={{marginTop: 8, fontSize: 30, color: F.bordo, textDecoration: 'underline'}}>links das matérias consultadas</div>
          </div>
        </div>
      )}
      <Points
        top={1400}
        items={[
          {t: 'Ative “Usar notícias atuais”', at: 30},
          {t: 'A IA pesquisa na internet', at: 165},
          {t: 'Posts ligados ao que está em alta', at: 275},
        ]}
      />
    </AbsoluteFill>
  );
};
