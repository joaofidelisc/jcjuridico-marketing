import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Background} from './Background';
import {Headline, Kicker, SubText} from './Headline';

export const TopLogo: React.FC = () => (
  <div style={{position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
    <Img src={staticFile('logo_white.png')} style={{height: 120}} />
  </div>
);

// Cena padrão de recurso: rótulo, título, tela do sistema e frase de apoio.
export const FeatureScene: React.FC<{
  kicker: string;
  title: string;
  sub: string;
  children: React.ReactNode; // tela/arte central
  screenTop?: number;
  subTop?: number;
}> = ({kicker, title, sub, children, screenTop = 800, subTop = 1560}) => (
  <AbsoluteFill>
    <Background />
    <TopLogo />
    <div style={{position: 'absolute', top: 330, left: 80, right: 80}}>
      <Kicker text={kicker} delay={2} />
      <div style={{height: 26}} />
      <Headline text={title} size={86} delay={6} />
    </div>
    <div style={{position: 'absolute', top: screenTop, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      {children}
    </div>
    <div style={{position: 'absolute', top: subTop, left: 110, right: 110}}>
      <SubText text={sub} delay={24} />
    </div>
  </AbsoluteFill>
);
