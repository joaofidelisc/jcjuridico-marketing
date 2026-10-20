import React from 'react';
import {AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import clips from '../voz/clips.json';
import {F, Paper, Title} from '../funil/ui';
import {Voice} from '../voz/Voice';
import {FONT} from '../theme';
import {AvatarAdvogAI, Fala, falaAtual, progressoFala} from './Avatar';

type Clip = Fala & {text: string};
const FALAS = (clips as unknown as Record<string, Record<string, Clip[]>>).advogai.Teste;
export const ADVOGAI_TESTE_DUR = FALAS[FALAS.length - 1].at + FALAS[FALAS.length - 1].frames + 30;

// Legenda grande, com as palavras acendendo conforme a fala avança (para quem assiste sem som).
const Legenda: React.FC = () => {
  const frame = useCurrentFrame();
  const f = falaAtual(frame, FALAS);
  if (!f) return null;
  const palavras = f.text.split(' ');
  const ditas = Math.ceil(progressoFala(frame, f) * palavras.length);
  return (
    <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 52, lineHeight: 1.25, textAlign: 'center', letterSpacing: -0.5}}>
      {palavras.map((p, i) => (
        <span key={i} style={{color: i < ditas ? F.ink : 'rgba(20,33,61,0.38)'}}>
          {p}{' '}
        </span>
      ))}
    </div>
  );
};

export const AdvogAITeste: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entra = spring({frame, fps, config: {damping: 14}});
  return (
    <AbsoluteFill>
      <Paper label="AdvogAI" />
      <div style={{position: 'absolute', top: 230, left: 70, right: 70}}>
        <Title text="Olá, eu sou a **AdvogAI**" size={92} delay={4} align="center" />
      </div>
      <div style={{position: 'absolute', top: 470, left: 80, right: 80, minHeight: 200}}>
        <Legenda />
      </div>
      {/* círculo lilás, a cor original do avatar */}
      <div
        style={{
          position: 'absolute',
          left: 140,
          top: 860,
          width: 800,
          height: 800,
          borderRadius: 400,
          background: 'radial-gradient(circle at 50% 40%, #CFC9FF, #B9B1F7)',
          transform: `scale(${entra})`,
        }}
      />
      {/* recorte: aberto em cima (a cabeça sai do círculo) e redondo embaixo (acompanha o círculo) */}
      <div style={{position: 'absolute', left: 140, top: 560, width: 800, height: 1100, overflow: 'hidden', borderRadius: '0 0 400px 400px', opacity: entra}}>
        <div style={{position: 'absolute', left: -110, top: 120, transform: `translateY(${interpolate(entra, [0, 1], [120, 0])}px)`}}>
          <AvatarAdvogAI size={1020} falas={FALAS} />
        </div>
      </div>
      <Voice video="advogai" id="Teste" />
      <Audio src={staticFile('music/726_ext.mp3')} volume={0.12} />
    </AbsoluteFill>
  );
};
