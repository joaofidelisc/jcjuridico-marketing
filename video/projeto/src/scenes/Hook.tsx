import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Headline} from '../components/Headline';
import {C, FONT} from '../theme';

const NOTES = [
  {t: 'Prazo dia 12?', x: 120, y: 360, r: -8},
  {t: 'Cálculo de HE', x: 640, y: 300, r: 6},
  {t: 'Ligar p/ cliente', x: 150, y: 1430, r: 5},
  {t: 'Honorários: R$ ?', x: 600, y: 1500, r: -6},
  {t: 'Planilha_final_v3.xlsx', x: 320, y: 1660, r: 3},
];

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Background variant="deep" />
      {NOTES.map((n, i) => {
        const p = spring({frame: frame - 4 - i * 5, fps, config: {damping: 14, stiffness: 120}});
        const drift = Math.sin((frame + i * 20) / 18) * 6;
        return (
          <div
            key={n.t}
            style={{
              position: 'absolute',
              left: n.x,
              top: n.y + drift,
              transform: `rotate(${n.r}deg) scale(${p})`,
              background: i % 2 ? '#FFF6C8' : '#FFFFFF',
              color: C.navy,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 34,
              padding: '22px 30px',
              borderRadius: 10,
              boxShadow: '0 16px 36px rgba(20,33,61,0.14)',
              border: '2px solid #E4E1DA',
              opacity: interpolate(frame, [95, 115], [1, 0.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            }}
          >
            {n.t}
          </div>
        );
      })}
      <AbsoluteFill style={{justifyContent: 'center', padding: '0 80px'}}>
        <Headline text="Seu escritório ainda vive de **planilhas** e anotações soltas?" size={96} delay={10} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
