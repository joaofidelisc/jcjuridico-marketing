import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Body, F, Title} from '../funil/ui';
import {FONT} from '../theme';

// Texto com **destaque** em bordô e marca-texto (identidade clara).
export const Headline: React.FC<{text: string; size?: number; delay?: number; align?: 'center' | 'left'; color?: string}> = ({
  text,
  size = 88,
  delay = 0,
  align = 'center',
  color = F.ink,
}) => <Title text={text} size={size} delay={delay} align={align} color={color} />;

export const SubText: React.FC<{text: string; delay?: number; size?: number}> = ({text, delay = 0, size = 46}) => (
  <Body text={text} delay={delay} size={size} align="center" />
);

export const Kicker: React.FC<{text: string; delay?: number}> = ({text, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 30,
        letterSpacing: 8,
        color: F.bordo,
        textTransform: 'uppercase',
        opacity: p,
        textAlign: 'center',
        transform: `translateY(${interpolate(p, [0, 1], [12, 0])}px)`,
      }}
    >
      {text}
    </div>
  );
};
