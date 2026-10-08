import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Headline, SubText} from '../components/Headline';
import {C, FONT} from '../theme';

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 2, fps, config: {damping: 14}});
  const pill = spring({frame: frame - 30, fps, config: {damping: 12}});
  const pulse = 1 + Math.sin(frame / 7) * 0.025 * (frame > 45 ? 1 : 0);
  return (
    <AbsoluteFill>
      <Background variant="deep" />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 56, padding: '0 80px'}}>
        <Img src={staticFile('logo_white.png')} style={{height: 230, opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`}} />
        <Headline text="Teste **grátis** por 30 dias" size={104} delay={10} />
        <SubText text="Sem compromisso. Cancele quando quiser." delay={22} size={46} />
        <div
          style={{
            marginTop: 20,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 52,
            color: C.navy,
            background: '#fff',
            padding: '30px 64px',
            borderRadius: 80,
            transform: `scale(${pill * pulse})`,
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          }}
        >
          jcjuridico.com.br
        </div>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 36, color: C.ice, opacity: pill}}>@jcjuridico.br</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
