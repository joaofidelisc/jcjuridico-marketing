import React, {createContext} from 'react';
import {Sequence, staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import clips from './clips.json';

// Falas geradas por voz/gerar.py (Google Cloud TTS, voz Sulafat).
type Clip = {at: number; src: string; frames: number};
const CLIPS = clips as Record<string, Record<string, Clip[]>>;

// Duração da cena: a base visual, estendida até a última fala terminar (+ respiro).
export const sceneDur = (video: string, id: string, base: number) => {
  const c = CLIPS[video]?.[id];
  if (!c?.length) return base;
  const last = c[c.length - 1];
  return Math.max(base, last.at + last.frames + 24);
};

// Duração da cena atual, para componentes que precisam segurar o último destaque até o fim.
export const SceneDur = createContext(0);

export const Voice: React.FC<{video: string; id: string}> = ({video, id}) => (
  <>
    {(CLIPS[video]?.[id] ?? []).map((c) => (
      <Sequence key={c.src} from={c.at} durationInFrames={c.frames + 6} layout="none">
        <Audio src={staticFile(c.src)} />
      </Sequence>
    ))}
  </>
);
