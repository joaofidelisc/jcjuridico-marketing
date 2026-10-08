import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {SceneDur, Voice, sceneDur} from '../voz/Voice';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';
import {F} from './ui';
import {FApresenta, FCTA, FEtapas, FGanhos, FHook, FOtimiza, FPassos, FPasso1, FPasso2, FPasso3, FPost, FProblema, FNoticias} from './scenes';

export const F_TRANSITION = 14;

type Scene = {id: string; C: React.FC; dur: number; tr: 'fade' | 'wipe'};
export const F_SCENES: Scene[] = ([
  {id: 'F-Gancho', C: FHook, dur: 120, tr: 'fade'},
  {id: 'F-Problema', C: FProblema, dur: 190, tr: 'wipe'},
  {id: 'F-Apresenta', C: FApresenta, dur: 150, tr: 'wipe'},
  {id: 'F-Passos', C: FPassos, dur: 110, tr: 'wipe'},
  {id: 'F-Passo1', C: FPasso1, dur: 345, tr: 'wipe'},
  {id: 'F-Passo2', C: FPasso2, dur: 345, tr: 'wipe'},
  {id: 'F-Noticias', C: FNoticias, dur: 380, tr: 'wipe'},
  {id: 'F-Passo3', C: FPasso3, dur: 320, tr: 'wipe'},
  {id: 'F-Etapas', C: FEtapas, dur: 240, tr: 'wipe'},
  {id: 'F-Post', C: FPost, dur: 360, tr: 'wipe'},
  {id: 'F-Otimiza', C: FOtimiza, dur: 240, tr: 'wipe'},
  {id: 'F-Ganhos', C: FGanhos, dur: 210, tr: 'wipe'},
  {id: 'F-Chamada', C: FCTA, dur: 180, tr: 'fade'},
] as Scene[]).map((s) => ({...s, dur: sceneDur('funil', s.id, s.dur)}));
export const F_TOTAL = F_SCENES.reduce((a, s) => a + s.dur, 0) - F_TRANSITION * (F_SCENES.length - 1);

const Music: React.FC<{src: string}> = ({src}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const vol = interpolate(frame, [0, fps, durationInFrames - 2.5 * fps, durationInFrames], [0, 0.2, 0.2, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <Audio src={staticFile(src)} volume={vol} />;
};

export const FunilPromo: React.FC<{music: string}> = ({music}) => {
  const {fps} = useVideoConfig();
  const t = linearTiming({durationInFrames: F_TRANSITION});
  return (
    <AbsoluteFill style={{backgroundColor: F.paper}}>
      <TransitionSeries>
        {F_SCENES.map((s, i) => (
          <React.Fragment key={s.id}>
            {i > 0 && (
              s.tr === 'fade' ? (
                <TransitionSeries.Transition presentation={fade()} timing={t} />
              ) : (
                <TransitionSeries.Transition presentation={wipe({direction: i % 2 ? 'from-right' : 'from-bottom'})} timing={t} />
              )
            )}
            <TransitionSeries.Sequence name={s.id} durationInFrames={s.dur} premountFor={fps}>
              <SceneDur.Provider value={s.dur}>
                <s.C />
                <Voice video="funil" id={s.id} />
              </SceneDur.Provider>
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>
      <Music src={music} />
    </AbsoluteFill>
  );
};
