import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {SubText} from '../components/Headline';
import {C, FONT} from '../theme';

export const Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 2, fps, config: {damping: 12, stiffness: 90}});
  const line = spring({frame: frame - 14, fps, config: {damping: 200}});
  return (
    <AbsoluteFill>
      <Background logo={false} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 40}}>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 40, letterSpacing: 10, color: C.bordo, opacity: s}}>CONHEÇA O</div>
        <Img src={staticFile('logo_color.png')} style={{height: 380, transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`, opacity: s}} />
        <div style={{width: interpolate(line, [0, 1], [0, 220]), height: 8, borderRadius: 4, background: C.bordo}} />
        <div style={{padding: '0 120px'}}>
          <SubText text="A gestão do seu escritório em um só sistema." delay={18} size={52} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
