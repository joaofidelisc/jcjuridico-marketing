import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FeatureScene} from '../components/FeatureScene';
import {Screen} from '../components/Screen';
import {C, FONT} from '../theme';

const Chip: React.FC<{text: string; delay: number; active?: boolean}> = ({text, delay, active}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 32,
        color: active ? '#fff' : C.navy,
        background: active ? C.bordo : '#fff',
        border: active ? 'none' : '2px solid #E4E1DA',
        padding: '16px 28px',
        borderRadius: 40,
        opacity: p,
        transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})`,
      }}
    >
      {text}
    </div>
  );
};

const Arrow: React.FC<{delay: number}> = ({delay}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{color: C.bordo, fontSize: 40, fontWeight: 800, opacity: o, fontFamily: FONT}}>→</div>;
};

export const Clientes: React.FC = () => (
  <FeatureScene kicker="Gestão de clientes" title="Do primeiro contato ao **contrato**" sub="Saiba quem aguarda retorno e quem está pronto para fechar." subTop={1600}>
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 50}}>
      <Screen src="telas/crm.jpg" imgW={1568} imgH={784} crop={[686, 258, 1536, 540]} width={920} zoomTo={1.1} />
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <Chip text="Lead" delay={30} />
        <Arrow delay={38} />
        <Chip text="Consulta" delay={42} />
        <Arrow delay={50} />
        <Chip text="Cliente fechado" delay={54} active />
      </div>
    </div>
  </FeatureScene>
);

export const Agenda: React.FC = () => (
  <FeatureScene kicker="Agenda" title="Prazos e audiências **sob controle**" sub="Reuniões, consultas, audiências e prazos por dia, semana ou mês.">
    <Screen src="telas/agenda_s1.jpg" imgW={1568} imgH={784} crop={[292, 145, 1536, 730]} width={940} zoomTo={1.25} pan={[4, -6]} />
  </FeatureScene>
);

export const Biblioteca: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [10, 50], [0, 52], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <FeatureScene kicker="Biblioteca de modelos" title="Peças prontas para **adaptar**" sub="Petições, contratos, procurações e recursos." screenTop={1000} subTop={1640}>
      <div style={{position: 'absolute', top: -330, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, color: C.navy}}>
        <span style={{fontSize: 260, fontWeight: 900, lineHeight: 1}}>{n}</span>
        <span style={{fontSize: 48, fontWeight: 700, marginLeft: 20, color: C.bordo}}>modelos</span>
      </div>
      <Screen src="telas/biblioteca.jpg" imgW={1568} imgH={737} crop={[244, 300, 1536, 737]} width={920} zoomTo={1.08} delay={14} />
    </FeatureScene>
  );
};

export const Marketplace: React.FC = () => (
  <FeatureScene kicker="Marketplace" title="Apoio em **outras cidades**" sub="Publique demandas de audiências e diligências para outros advogados." screenTop={620} subTop={1630}>
    <Screen src="telas/marketplace_form.jpg" imgW={1568} imgH={784} crop={[567, 102, 1000, 686]} width={640} zoomTo={1.06} label="Nova Demanda" />
  </FeatureScene>
);
