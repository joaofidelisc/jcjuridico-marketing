import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {TopLogo} from '../components/FeatureScene';
import {Headline, Kicker} from '../components/Headline';
import {C, FONT} from '../theme';

// Cálculos disponíveis no sistema, por área.
const AREAS: {area: string; items: string[]}[] = [
  {
    area: 'Previdenciário',
    items: [
      'Análise Previdenciária (CNIS)',
      'Planejamento Previdenciário - RGPS',
      'Liquidação de Sentença',
      'Contribuições em Atraso ao INSS',
      'BPC/LOAS',
      'Descontos indevidos (Fraude INSS)',
    ],
  },
  {area: 'Trabalhista', items: ['Rescisão do Contrato', 'Horas Extras e Reflexos', 'Apuração do Ponto', 'Revisão do FGTS']},
  {area: 'Cível', items: ['Atualização de Débitos', 'Pensão Alimentícia', 'Parcelamento art. 916 CPC']},
  {area: 'Tributário', items: ['Ações Tributárias', 'Fazenda Pública', 'Comparação de Regimes']},
  {area: 'Bancário', items: ['Tarifas abusivas']},
  {area: 'Penal', items: ['Dosimetria da Pena']},
];
const TOTAL = AREAS.reduce((a, b) => a + b.items.length, 0);

export const Catalogo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = Math.round(interpolate(frame, [20, 70], [0, TOTAL], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  let k = 0;
  return (
    <AbsoluteFill>
      <Background />
      <TopLogo />
      <div style={{position: 'absolute', top: 320, left: 70, right: 70}}>
        <Kicker text="O coração do sistema" delay={2} />
        <div style={{height: 24}} />
        <Headline text={`**${n} cálculos** prontos para usar`} size={80} delay={6} />
      </div>
      <div style={{position: 'absolute', top: 650, left: 60, right: 60, display: 'flex', flexWrap: 'wrap', columnGap: 40, rowGap: 30}}>
        {AREAS.map((a, ai) => {
          const hp = spring({frame: frame - 30 - ai * 24, fps, config: {damping: 200}});
          return (
            <div key={a.area} style={{width: a.items.length === 1 ? 460 : '100%'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: hp, marginBottom: 14}}>
                <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, color: '#fff', textTransform: 'uppercase', letterSpacing: 3}}>{a.area}</div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontWeight: 800,
                    fontSize: 26,
                    color: '#fff',
                    background: C.bordoLight,
                    borderRadius: 30,
                    padding: '4px 18px',
                  }}
                >
                  {a.items.length}
                </div>
                <div style={{flex: 1, height: 2, background: 'rgba(255,255,255,0.2)'}} />
              </div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
                {a.items.map((t) => {
                  const p = spring({frame: frame - 36 - ai * 24 - k++ * 3, fps, config: {damping: 200}});
                  return (
                    <div
                      key={t}
                      style={{
                        fontFamily: FONT,
                        fontWeight: 600,
                        fontSize: 27,
                        color: C.navy,
                        background: '#fff',
                        borderRadius: 18,
                        padding: '12px 20px',
                        opacity: p,
                        transform: `translateY(${interpolate(p, [0, 1], [24, 0])}px)`,
                        boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                      }}
                    >
                      {t}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
