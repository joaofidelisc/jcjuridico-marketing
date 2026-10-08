import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {Hook} from './scenes/Hook';
import {Brand} from './scenes/Brand';
import {Calculos, AdvogAI, Financeiro, FunilJuridico} from './scenes/Telas';
import {Clientes, Agenda, Biblioteca, Marketplace} from './scenes/Features';
import {Recap} from './scenes/Recap';
import {CTA} from './scenes/CTA';

export const TRANSITION = 12;

// Ordem do vídeo: nome, componente, duração (frames) e transição de entrada.
export const SCENES: {id: string; name: string; C: React.FC; dur: number; tr: 'fade' | 'slide'}[] = [
  {id: 'Abertura', name: 'Abertura', C: Hook, dur: 120, tr: 'fade'},
  {id: 'Marca', name: 'Marca', C: Brand, dur: 90, tr: 'fade'},
  {id: 'Calculos', name: 'Cálculos', C: Calculos, dur: 240, tr: 'slide'},
  {id: 'AdvogAI', name: 'AdvogAI', C: AdvogAI, dur: 255, tr: 'slide'},
  {id: 'Clientes', name: 'Clientes', C: Clientes, dur: 135, tr: 'slide'},
  {id: 'Agenda', name: 'Agenda', C: Agenda, dur: 135, tr: 'slide'},
  {id: 'Financeiro', name: 'Financeiro', C: Financeiro, dur: 240, tr: 'slide'},
  {id: 'Funil', name: 'Funil Jurídico', C: FunilJuridico, dur: 225, tr: 'slide'},
  {id: 'Biblioteca', name: 'Biblioteca', C: Biblioteca, dur: 120, tr: 'slide'},
  {id: 'Marketplace', name: 'Marketplace', C: Marketplace, dur: 120, tr: 'slide'},
  {id: 'Resumo', name: 'Resumo', C: Recap, dur: 135, tr: 'fade'},
  {id: 'Chamada', name: 'Chamada', C: CTA, dur: 165, tr: 'fade'},
];
export const TOTAL = SCENES.reduce((a, s) => a + s.dur, 0) - TRANSITION * (SCENES.length - 1);

const Music: React.FC<{src: string}> = ({src}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const vol = interpolate(frame, [0, fps, durationInFrames - 2.5 * fps, durationInFrames], [0, 0.85, 0.85, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <Audio src={staticFile(src)} volume={vol} />;
};

export const JCPromo: React.FC<{music: string}> = ({music}) => {
  const {fps} = useVideoConfig();
  const t = linearTiming({durationInFrames: TRANSITION});
  return (
    <AbsoluteFill style={{backgroundColor: '#070F28'}}>
      <TransitionSeries>
        {SCENES.map((s, i) => (
          <React.Fragment key={s.id}>
            {i > 0 && (
              <TransitionSeries.Transition presentation={s.tr === 'fade' ? fade() : slide({direction: 'from-right'})} timing={t} />
            )}
            <TransitionSeries.Sequence name={s.name} durationInFrames={s.dur} premountFor={fps}>
              <s.C />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>
      <Music src={music} />
    </AbsoluteFill>
  );
};
