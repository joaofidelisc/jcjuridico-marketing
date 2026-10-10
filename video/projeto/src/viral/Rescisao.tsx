import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {F, Paper, ShotCard, Title, Body} from '../funil/ui';
import {Voice, sceneDur} from '../voz/Voice';
import {FONT} from '../theme';

// Vídeo viral "Quanto tempo você leva?": rescisão completa calculada contra o relógio.
// O cronômetro corre em tempo real durante a cena "Corrida" (o que aparece é o tempo de verdade do vídeo).

const IMG = {w: 1336, h: 678}; // prints recortados (sem menu lateral e cabeçalho)
const RACE = 450; // 15 s de corrida
const CARD = {width: 980, height: 900, top: 470};

export const V_SCENES = [
  {id: 'Gancho', dur: sceneDur('viral', 'Gancho', 125)},
  {id: 'Corrida', dur: RACE},
  {id: 'Resultado', dur: sceneDur('viral', 'Resultado', 300)},
  {id: 'Chamada', dur: sceneDur('viral', 'Chamada', 120)},
];
export const V_TOTAL = V_SCENES.reduce((a, s) => a + s.dur, 0);

const fmt = (frames: number, fps: number) => {
  const t = Math.max(0, frames) / fps;
  const s = Math.floor(t);
  const cs = Math.floor((t - s) * 100);
  return `00:${String(s).padStart(2, '0')},${String(cs).padStart(2, '0')}`;
};

const Stopwatch: React.FC<{frames: number; running: boolean; top?: number; size?: number}> = ({frames, running, top = 170, size = 150}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const angle = (frames / fps) * 360;
  const pulse = running ? 1 : 1 + 0.03 * Math.sin(frame / 5);
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, transform: `scale(${pulse})`}}>
      <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 100 100">
        <circle cx="50" cy="56" r="38" fill="#fff" stroke={F.bordo} strokeWidth="7" />
        <rect x="42" y="6" width="16" height="10" rx="3" fill={F.bordo} />
        <line x1="50" y1="56" x2={50 + 28 * Math.sin((angle * Math.PI) / 180)} y2={56 - 28 * Math.cos((angle * Math.PI) / 180)} stroke={F.ink} strokeWidth="6" strokeLinecap="round" />
        <circle cx="50" cy="56" r="5" fill={F.ink} />
      </svg>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: size, color: running ? F.ink : F.bordo, fontVariantNumeric: 'tabular-nums', letterSpacing: -2}}>{fmt(frames, fps)}</div>
    </div>
  );
};

// 1. Gancho
const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stamp = spring({frame: frame - 98, fps, config: {damping: 9, stiffness: 160}});
  return (
    <AbsoluteFill>
      <Paper label="JC Jurídico" />
      <Stopwatch frames={0} running={false} top={300} size={130} />
      <div style={{position: 'absolute', top: 640, left: 80, right: 80}}>
        <Title text="Quanto tempo você leva para calcular uma **rescisão completa?**" size={96} delay={4} />
      </div>
      <div style={{position: 'absolute', top: 1360, left: 80, right: 80}}>
        <Body text="Aviso prévio, 13º, férias com 1/3 e multa do FGTS." delay={30} size={46} />
      </div>
      {frame >= 96 && (
        <div style={{position: 'absolute', top: 1560, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 110,
              color: '#fff',
              background: F.bordo,
              padding: '14px 60px',
              borderRadius: 26,
              transform: `scale(${interpolate(stamp, [0, 1], [2.2, 1])}) rotate(-4deg)`,
              opacity: Math.min(1, stamp * 2),
              boxShadow: '0 24px 60px rgba(139,26,43,0.35)',
            }}
          >
            VALENDO!
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// 2. Corrida: preenchimento campo a campo, com zoom no campo e o cronômetro correndo.
const STEPS = [
  {at: 45, label: 'Salário', value: 'R$ 3.200', rect: [10, 180, 550, 265], mark: [50, 213, 393, 253]},
  {at: 117, label: 'Aviso prévio', value: 'Indenizado', rect: [10, 258, 550, 342], mark: [50, 290, 393, 330]},
  {at: 193, label: 'Admissão', value: '10/03/2022', rect: [370, 258, 910, 342], mark: [410, 290, 753, 330]},
  {at: 267, label: 'Demissão', value: '30/09/2026', rect: [10, 335, 550, 420], mark: [50, 367, 393, 407]},
  {at: 341, label: 'Saldo do FGTS', value: 'R$ 9.800', rect: [10, 575, 550, 665], mark: [50, 608, 393, 648]},
] as const;

const Corrida: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const current = [...STEPS].reverse().find((s) => frame >= s.at);
  const chip = current ? spring({frame: frame - current.at, fps, config: {damping: 14}}) : 0;
  return (
    <AbsoluteFill>
      <Paper label="JC Jurídico" />
      <Stopwatch frames={frame} running />
      <ShotCard
        {...CARD}
        imgW={IMG.w}
        imgH={IMG.h}
        shots={[
          {src: 'viral/r0.jpg', from: 0},
          ...STEPS.map((s, i) => ({src: `viral/r${i + 1}.jpg`, from: s.at})),
          {src: 'viral/r6.jpg', from: 440},
        ]}
        cams={[
          {at: 0, rect: [20, 30, 780, 678]},
          ...STEPS.map((s) => ({at: s.at - 22, rect: [...s.rect] as [number, number, number, number]})),
          {at: 395, rect: [20, 30, 780, 678]},
        ]}
        marks={STEPS.map((s) => ({rect: [...s.mark] as [number, number, number, number], from: s.at, to: s.at + 55}))}
      />
      <div style={{position: 'absolute', top: 1450, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        {current && frame < 395 ? (
          <div
            style={{
              fontFamily: FONT,
              fontSize: 54,
              background: '#fff',
              border: `3px solid ${F.line}`,
              borderRadius: 28,
              padding: '22px 40px',
              boxShadow: '0 18px 40px rgba(20,33,61,0.10)',
              transform: `scale(${interpolate(chip, [0, 1], [0.85, 1])})`,
              opacity: chip,
            }}
          >
            <span style={{color: F.muted, fontWeight: 600}}>{current.label}: </span>
            <span style={{color: F.ink, fontWeight: 800}}>{current.value}</span>
          </div>
        ) : frame >= 395 ? (
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 58,
              color: '#fff',
              background: F.bordo,
              borderRadius: 28,
              padding: '22px 56px',
              transform: `scale(${interpolate(frame, [395, 405, 412], [1, 0.92, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`,
            }}
          >
            Calcular verbas rescisórias
          </div>
        ) : null}
      </div>
      {/* tique-taque a cada segundo */}
      {Array.from({length: Math.floor(RACE / fps)}, (_, i) => (
        <Sequence key={i} from={i * fps} durationInFrames={10} layout="none">
          <Audio src={staticFile('viral/tick.wav')} volume={0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// 3. Resultado: cronômetro parado e as verbas destacadas uma a uma.
const ROWS: [number, number, number, number][] = [
  [801, 204, 1323, 241], // aviso prévio 42 dias
  [801, 241, 1323, 314], // 13º
  [801, 314, 1323, 388], // férias + 1/3
  [801, 482, 1323, 521], // multa 40% FGTS
  [801, 536, 1323, 571], // total líquido
];

const Resultado: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const badge = spring({frame: frame - 4, fps, config: {damping: 10}});
  const at = [40, 95, 135, 190, 245];
  return (
    <AbsoluteFill>
      <Paper label="JC Jurídico" />
      <Stopwatch frames={RACE} running={false} />
      <ShotCard
        {...CARD}
        imgW={IMG.w}
        imgH={IMG.h}
        shots={[{src: 'viral/r6.jpg', from: 0}]}
        cams={[{at: 0, rect: [790, 90, 1336, 678]}]}
        marks={ROWS.map((r, i) => ({rect: r, from: at[i], to: i === ROWS.length - 1 ? 9999 : at[i + 1]}))}
      />
      <div style={{position: 'absolute', top: 1440, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${badge})`, textAlign: 'center', fontFamily: FONT}}>
          <div style={{fontSize: 40, fontWeight: 700, color: F.muted}}>Total líquido estimado</div>
          <div style={{fontSize: 96, fontWeight: 900, color: F.ink, letterSpacing: -2}}>R$ 17.111,11</div>
        </div>
      </div>
      <Sequence from={0} durationInFrames={30} layout="none">
        <Audio src={staticFile('viral/ding.wav')} volume={0.7} />
      </Sequence>
    </AbsoluteFill>
  );
};

// 4. Chamada para comentar
const Chamada: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 20, fps, config: {damping: 12}});
  return (
    <AbsoluteFill>
      <Paper label="JC Jurídico" logo={false} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 50, padding: '0 80px'}}>
        <Title text="E você, **quanto tempo** leva?" size={112} delay={2} align="center" />
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 52,
            color: '#fff',
            background: F.bordo,
            borderRadius: 60,
            padding: '24px 56px',
            transform: `scale(${p})`,
          }}
        >
          Conta aqui nos comentários
        </div>
        <Img src={staticFile('logo_color.png')} style={{height: 150, marginTop: 40, opacity: p}} />
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 38, color: F.ink, opacity: p}}>@jcjuridico.br</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const C = {Gancho, Corrida, Resultado, Chamada} as Record<string, React.FC>;

export const ViralRescisao: React.FC<{music: string}> = ({music}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  let start = 0;
  const vol = interpolate(frame, [0, fps, V_TOTAL - 2 * fps, V_TOTAL], [0, 0.14, 0.14, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: F.paper}}>
      {V_SCENES.map((s) => {
        const from = start;
        start += s.dur;
        const S = C[s.id];
        return (
          <Sequence key={s.id} from={from} durationInFrames={s.dur} name={s.id}>
            <S />
            <Voice video="viral" id={s.id} />
          </Sequence>
        );
      })}
      <Audio src={staticFile(music)} volume={vol} />
    </AbsoluteFill>
  );
};
