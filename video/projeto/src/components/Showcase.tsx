import React, {useContext} from 'react';
import {SceneDur} from '../voz/Voice';
import {Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';

type Rect = [number, number, number, number]; // x0, y0, x1, y1 no print

export type Focus = {rect: Rect; from: number; to: number; caption: string};

// Barra de navegador comum às janelas.
export const BrowserBar: React.FC<{label?: string}> = ({label = 'jcjuridico.com.br'}) => (
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
        fontFamily: FONT,
      }}
    >
      {label}
    </div>
  </div>
);

const useEnter = (delay: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 200}});
};

const focusAlpha = (frame: number, f: Focus) =>
  interpolate(frame, [f.from, f.from + 10, f.to - 8, f.to], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// Tela inteira do sistema (nada cortado) com destaque na área em foco e uma lupa ampliada abaixo.
export const Showcase: React.FC<{
  src: string;
  imgW: number;
  imgH: number;
  width: number;
  top: number;
  focus: Focus[];
  calloutTop: number;
  calloutMaxH: number;
  calloutW?: number;
}> = ({src, imgW, imgH, width, top, focus: rawFocus, calloutTop, calloutMaxH, calloutW = 960}) => {
  const sceneEnd = useContext(SceneDur);
  // O último destaque permanece até o fim da cena, que pode ter sido estendida pela narração.
  const focus = rawFocus.map((f, i) => (i === rawFocus.length - 1 ? {...f, to: Math.max(f.to, sceneEnd + 20)} : f));
  const frame = useCurrentFrame();
  const enter = useEnter(4);
  const s = width / imgW;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top,
          left: (1080 - width) / 2,
          width,
          borderRadius: 24,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 30px 80px rgba(20,33,61,0.18)', border: '2px solid #E4E1DA',
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [80, 0])}px) scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
        }}
      >
        <BrowserBar />
        <div style={{position: 'relative', width, height: imgH * s, overflow: 'hidden'}}>
          <Img src={staticFile(src)} style={{width, height: imgH * s, display: 'block'}} />
          {focus.map((f, i) => {
            const a = focusAlpha(frame, f);
            const [x0, y0, x1, y1] = f.rect;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x0 * s,
                  top: y0 * s,
                  width: (x1 - x0) * s,
                  height: (y1 - y0) * s,
                  borderRadius: 10,
                  border: `4px solid ${C.bordo}`,
                  boxShadow: `0 0 0 9999px rgba(20,33,61,${0.2 * a})`,
                  opacity: a,
                }}
              />
            );
          })}
        </div>
      </div>
      {focus.map((f, i) => {
        const a = focusAlpha(frame, f);
        if (a <= 0) return null;
        const [x0, y0, x1, y1] = f.rect;
        const cw = x1 - x0;
        const ch = y1 - y0;
        const k = Math.min(calloutW / cw, calloutMaxH / ch);
        const w = cw * k;
        const h = ch * k;
        const rise = interpolate(a, [0, 1], [40, 0]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: calloutTop,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 22,
              opacity: a,
              transform: `translateY(${rise}px)`,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 36,
                color: '#fff',
                background: C.bordo,
                padding: '12px 30px',
                borderRadius: 40,
                maxWidth: 960,
                textAlign: 'center',
              }}
            >
              {f.caption}
            </div>
            <div
              style={{
                width: w,
                height: h,
                borderRadius: 22,
                overflow: 'hidden',
                position: 'relative',
                background: '#fff',
                border: `4px solid ${C.bordo}`,
                boxShadow: '0 24px 60px rgba(20,33,61,0.18)',
              }}
            >
              <Img
                src={staticFile(src)}
                style={{position: 'absolute', width: imgW * k, height: imgH * k, left: -x0 * k, top: -y0 * k}}
              />
            </div>
          </div>
        );
      })}
    </>
  );
};

// Janela alta que rola a tela do sistema de cima a baixo.
export const ScrollScreen: React.FC<{
  src: string;
  imgW: number;
  imgH: number;
  width: number;
  viewH: number;
  top: number;
  scrollFrom: number;
  scrollTo: number;
}> = ({src, imgW, imgH, width, viewH, top, scrollFrom, scrollTo}) => {
  const frame = useCurrentFrame();
  const enter = useEnter(4);
  const s = width / imgW;
  const maxScroll = imgH * s - viewH;
  const y = interpolate(frame, [scrollFrom, scrollTo], [0, maxScroll], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: (1080 - width) / 2,
        width,
        borderRadius: 24,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 30px 80px rgba(20,33,61,0.18)', border: '2px solid #E4E1DA',
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [80, 0])}px) scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
      }}
    >
      <BrowserBar />
      <div style={{position: 'relative', width, height: viewH, overflow: 'hidden'}}>
        <Img src={staticFile(src)} style={{position: 'absolute', top: -y, left: 0, width, height: imgH * s}} />
      </div>
    </div>
  );
};
