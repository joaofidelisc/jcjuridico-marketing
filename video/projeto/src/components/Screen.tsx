import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../theme';

type Crop = [number, number, number, number]; // x0, y0, x1, y1 no print original

// Janela de navegador com um recorte do print do sistema, entrando e com zoom lento (Ken Burns).
export const Screen: React.FC<{
  src: string;
  crop: Crop;
  imgW: number;
  imgH: number;
  width: number;
  delay?: number;
  zoomTo?: number;
  pan?: [number, number]; // deslocamento final em % do recorte
  label?: string;
}> = ({src, crop, imgW, imgH, width, delay = 6, zoomTo = 1.08, pan = [0, 0], label = 'jcjuridico.com.br'}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const enter = spring({frame: frame - delay, fps, config: {damping: 200}});
  const t = interpolate(frame, [delay, durationInFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const [x0, y0, x1, y1] = crop;
  const cw = x1 - x0;
  const ch = y1 - y0;
  const scale = width / cw;
  const height = ch * scale;
  const z = interpolate(t, [0, 1], [1, zoomTo]);
  const px = interpolate(t, [0, 1], [0, pan[0]]);
  const py = interpolate(t, [0, 1], [0, pan[1]]);
  return (
    <div
      style={{
        width,
        borderRadius: 28,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 40px 90px rgba(0,0,0,0.45)',
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [80, 0])}px) scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
      }}
    >
      <div style={{height: 56, background: '#EEF1F7', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />
        ))}
        <div
          style={{
            marginLeft: 18,
            flex: 1,
            height: 32,
            borderRadius: 16,
            background: '#fff',
            color: '#5A6478',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 18,
            fontFamily: 'Montserrat',
          }}
        >
          {label}
        </div>
      </div>
      <div style={{width, height, overflow: 'hidden', position: 'relative'}}>
        <Img
          src={staticFile(src)}
          style={{
            position: 'absolute',
            width: imgW * scale,
            height: imgH * scale,
            left: -x0 * scale,
            top: -y0 * scale,
            transformOrigin: `${(x0 + cw / 2) * scale}px ${(y0 + ch / 2) * scale}px`,
            transform: `translate(${px}%, ${py}%) scale(${z})`,
          }}
        />
      </div>
    </div>
  );
};

export const Glow: React.FC = () => <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 2px ${C.ice}`}} />;
