import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import envelopes from '../voz/envelopes.json';

// Avatar da AdvogAI animado em camadas: corpo sem boca (base.png), quadros da boca feitos a partir do
// sorriso original (abertura comandada pelo volume da voz) e piscadas.
// Coordenadas no espaço da imagem original (1024 × 1024).

const ENV = envelopes as Record<string, number[]>;
export type Fala = {at: number; src: string; frames: number};

const NIVEIS_BOCA = 6; // advogai/boca-0.png (sorriso original) a boca-5.png (mais aberta)

/**
 * Nível da boca (0 a 5) no frame atual. Atualiza a cada 2 frames (15 por segundo, como em animação)
 * e usa uma média curta do volume para não tremer.
 */
const nivelBoca = (frame: number, falas: Fala[]): number => {
  const fr = frame - (frame % 2);
  for (const f of falas) {
    const i = fr - f.at;
    if (i >= 0 && i < f.frames) {
      const env = ENV[f.src] ?? [];
      const v = 0.5 * (env[i] ?? 0) + 0.3 * (env[i - 1] ?? 0) + 0.2 * (env[i - 2] ?? 0);
      const n = Math.max(0, Math.min(1, (v - 0.08) / 0.75));
      return Math.round(n * (NIVEIS_BOCA - 1));
    }
  }
  return 0;
};

// Piscada: fecha em 2 frames, fica 1 fechada, abre em 2 (a cada ~3,4 s, com variação).
const piscada = (frame: number): number => {
  const ciclo = 102;
  const t = (frame + 37) % ciclo;
  const extra = Math.floor((frame + 37) / ciclo) % 3 === 1 ? 14 : 0; // às vezes pisca um pouco depois
  const k = t - extra;
  if (k < 0 || k > 5) return 0;
  return [0.5, 1, 1, 0.5, 0, 0][k];
};

// Quadros da piscada (advogai/olho-<lado>-1 = meio fechado, -2 = fechado), gerados a partir do desenho original.
const OLHOS = [
  {lado: 'esq', x: 396, y: 334, w: 76, h: 54},
  {lado: 'dir', x: 526, y: 334, w: 80, h: 54},
];

const Olhos: React.FC<{size: number; fech: number}> = ({size, fech}) => {
  if (fech <= 0) return null;
  const q = fech >= 0.9 ? 2 : 1;
  const k = size / 1024;
  return (
    <>
      {OLHOS.map(o => (
        <Img
          key={o.lado}
          src={staticFile(`advogai/olho-${o.lado}-${q}.png`)}
          style={{position: 'absolute', left: o.x * k, top: o.y * k, width: o.w * k, height: o.h * k}}
        />
      ))}
    </>
  );
};

export const AvatarAdvogAI: React.FC<{size: number; falas: Fala[]}> = ({size, falas}) => {
  const frame = useCurrentFrame();
  const nivel = nivelBoca(frame, falas);
  const fech = piscada(frame);
  const bob = Math.sin(frame / 18) * 5 + nivel * 0.6;
  const giro = Math.sin(frame / 47) * 0.9;
  const resp = 1 + Math.sin(frame / 26) * 0.006;
  return (
    <div style={{position: 'relative', width: size, height: size, transform: `translateY(${bob}px) rotate(${giro}deg) scale(${resp})`, transformOrigin: '50% 100%'}}>
      <Img src={staticFile('advogai/base.png')} style={{position: 'absolute', inset: 0, width: size, height: size}} />
      {/* boca: quadros feitos a partir do sorriso original (o lábio de baixo desce conforme a fala) */}
      <Img
        src={staticFile(`advogai/boca-${nivel}.png`)}
        style={{position: 'absolute', left: (422 / 1024) * size, top: (446 / 1024) * size, width: (168 / 1024) * size, height: (102 / 1024) * size}}
      />
      <Olhos size={size} fech={fech} />
    </div>
  );
};

/** Texto da fala atual, para a legenda. */
export const falaAtual = <T extends Fala & {text?: string}>(frame: number, falas: T[]): T | null =>
  falas.find(f => frame >= f.at - 4 && frame < f.at + f.frames + 6) ?? null;

export const progressoFala = (frame: number, f: Fala) => interpolate(frame, [f.at, f.at + f.frames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
