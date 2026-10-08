import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../theme';

export const Background: React.FC<{variant?: 'navy' | 'deep'}> = ({variant = 'navy'}) => {
  const frame = useCurrentFrame();
  const gx = interpolate(frame, [0, 300], [70, 40], {extrapolateRight: 'clamp'});
  const gy = interpolate(frame, [0, 300], [12, 22], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill
      style={{
        background:
          variant === 'deep'
            ? `radial-gradient(circle at ${gx}% ${gy}%, rgba(40,100,220,0.45), transparent 45%), radial-gradient(circle at 15% 92%, rgba(139,26,43,0.35), transparent 40%), linear-gradient(180deg, ${C.navyDeep} 0%, #0B1A44 100%)`
            : `radial-gradient(circle at ${gx}% ${gy}%, rgba(40,100,220,0.35), transparent 45%), radial-gradient(circle at 10% 95%, rgba(139,26,43,0.28), transparent 38%), linear-gradient(180deg, ${C.navyDeep} 0%, #10265C 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2px)',
          backgroundSize: '54px 54px',
        }}
      />
    </AbsoluteFill>
  );
};
