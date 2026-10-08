import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {TopLogo} from '../components/FeatureScene';
import {Headline} from '../components/Headline';
import {C, FONT} from '../theme';

const ITEMS = ['18 cálculos jurídicos', 'AdvogAI, a IA do sistema', 'Gestão de clientes', 'Agenda e prazos', 'Controle financeiro', 'Funil Jurídico', 'Modelos de peças', 'Marketplace'];

export const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Background />
      <TopLogo />
      <div style={{position: 'absolute', top: 360, left: 80, right: 80}}>
        <Headline text="Tudo em **um só lugar**" size={92} delay={2} />
      </div>
      <div style={{position: 'absolute', top: 640, left: 130, right: 130, display: 'flex', flexDirection: 'column', gap: 22}}>
        {ITEMS.map((t, i) => {
          const p = spring({frame: frame - 14 - i * 6, fps, config: {damping: 200}});
          return (
            <div
              key={t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 30,
                opacity: p,
                transform: `translateX(${interpolate(p, [0, 1], [-60, 0])}px)`,
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.18)',
                borderRadius: 24,
                padding: '18px 30px',
              }}
            >
              <div style={{width: 64, height: 64, borderRadius: 32, background: C.bordoLight, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width="34" height="34" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 42, color: '#fff'}}>{t}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
