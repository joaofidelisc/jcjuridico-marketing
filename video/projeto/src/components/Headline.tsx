import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';

// Texto com **destaque**; palavras entram em sequência.
export const Headline: React.FC<{
  text: string;
  size?: number;
  delay?: number;
  align?: 'center' | 'left';
  color?: string;
}> = ({text, size = 88, delay = 0, align = 'center', color = C.white}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // Agrupa palavras destacadas consecutivas em uma única caixa.
  const tokens: {w: string; hl: boolean}[] = [];
  text.split('**').forEach((part, i) => {
    const words = part.split(' ').filter(Boolean);
    if (i % 2 === 1) {
      if (words.length) tokens.push({w: words.join(' '), hl: true});
    } else {
      words.forEach((w) => tokens.push({w, hl: false}));
    }
  });
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.12,
        color,
        textAlign: align,
        textTransform: 'uppercase',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        columnGap: size * 0.26,
        rowGap: size * 0.12,
      }}
    >
      {tokens.map((t, i) => {
        const p = spring({frame: frame - delay - i * 3, fps, config: {damping: 200}});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
              background: t.hl ? C.bordoLight : 'transparent',
              padding: t.hl ? `0 ${size * 0.14}px` : 0,
              borderRadius: size * 0.12,
            }}
          >
            {t.w}
          </span>
        );
      })}
    </div>
  );
};

export const SubText: React.FC<{text: string; delay?: number; size?: number}> = ({
  text,
  delay = 0,
  size = 46,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.35,
        color: C.soft,
        textAlign: 'center',
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [24, 0])}px)`,
      }}
    >
      {text}
    </div>
  );
};

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
        color: C.ice,
        textTransform: 'uppercase',
        opacity: p,
        textAlign: 'center',
      }}
    >
      {text}
    </div>
  );
};
