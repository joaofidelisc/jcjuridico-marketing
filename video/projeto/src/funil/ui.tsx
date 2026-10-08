import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';

// Identidade do vídeo do Funil Jurídico: fundo claro, tinta navy, destaque bordô e as cores das etapas do funil.
export const F = {
  paper: '#FAFAF7',
  paper2: '#F1EEE8',
  ink: '#14213D',
  muted: '#5B6476',
  bordo: '#8B1A2B',
  bordoSoft: '#F4E3E6',
  topo: '#2F5BD3',
  meio: '#D98300',
  fundo: '#0E9F6E',
  line: '#E4E1DA',
};

const useP = (delay: number, damping = 200) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping}});
};

// Fundo claro: brilho rosado suave, grade de pontos discreta, logo no topo e rodapé com o site.
export const Paper: React.FC<{logo?: boolean; footer?: boolean}> = ({logo = true, footer = true}) => {
  const frame = useCurrentFrame();
  const gx = interpolate(frame, [0, 400], [85, 70], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${gx}% 92%, rgba(139,26,43,0.10), transparent 42%), radial-gradient(circle at 8% 8%, rgba(47,91,211,0.06), transparent 35%), ${F.paper}`,
      }}
    >
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(20,33,61,0.07) 2px, transparent 2px)', backgroundSize: '44px 44px'}} />
      {logo && <Img src={staticFile('logo_color.png')} style={{position: 'absolute', top: 76, left: 64, height: 78}} />}
      {footer && (
        <div
          style={{
            position: 'absolute',
            left: 70,
            right: 70,
            bottom: 64,
            borderTop: `2px solid ${F.line}`,
            paddingTop: 22,
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 600,
            color: F.muted,
            letterSpacing: 1,
          }}
        >
          <span>jcjuridico.com.br</span>
          <span style={{color: F.bordo}}>Funil Jurídico</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// Título alinhado à esquerda, em caixa normal; trechos entre ** ganham marca-texto bordô.
export const Title: React.FC<{text: string; size?: number; delay?: number; color?: string; align?: 'left' | 'center'}> = ({
  text,
  size = 92,
  delay = 0,
  color = F.ink,
  align = 'left',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tokens: {w: string; hl: boolean}[] = [];
  text.split('**').forEach((part, i) =>
    part
      .split(' ')
      .filter(Boolean)
      .forEach((w) => tokens.push({w, hl: i % 2 === 1})),
  );
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.1,
        letterSpacing: -1.5,
        color,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        columnGap: size * 0.24,
        rowGap: size * 0.08,
      }}
    >
      {tokens.map((t, i) => {
        const p = spring({frame: frame - delay - i * 2.5, fps, config: {damping: 200}});
        const mark = interpolate(frame, [delay + 10 + i * 2.5, delay + 22 + i * 2.5], [0, 100], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <span
            key={i}
            style={{
              position: 'relative',
              isolation: 'isolate',
              display: 'inline-block',
              whiteSpace: 'nowrap',
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
              color: t.hl ? F.bordo : color,
            }}
          >
            {t.hl && (
              <span
                style={{
                  position: 'absolute',
                  left: -6,
                  bottom: size * 0.06,
                  height: size * 0.3,
                  width: `calc(${mark}% + 12px)`,
                  background: F.bordoSoft,
                  zIndex: -1,
                  borderRadius: 6,
                }}
              />
            )}
            {t.w}
          </span>
        );
      })}
    </div>
  );
};

export const Body: React.FC<{text: string; delay?: number; size?: number; align?: 'left' | 'center'; color?: string}> = ({
  text,
  delay = 0,
  size = 42,
  align = 'left',
  color = F.muted,
}) => {
  const p = useP(delay);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.4,
        color,
        textAlign: align,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
      }}
    >
      {text}
    </div>
  );
};

// Rótulo de etapa: "Passo 01" com traço.
export const StepTag: React.FC<{n: string; label: string; delay?: number; color?: string}> = ({n, label, delay = 0, color = F.bordo}) => {
  const p = useP(delay);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: p, fontFamily: FONT}}>
      <div style={{fontSize: 34, fontWeight: 800, color: '#fff', background: color, borderRadius: 14, padding: '8px 18px'}}>{n}</div>
      <div style={{width: interpolate(p, [0, 1], [0, 60]), height: 4, background: color, borderRadius: 2}} />
      <div style={{fontSize: 32, fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase', color}}>{label}</div>
    </div>
  );
};

// Progresso dos 3 passos, no canto superior direito.
export const Progress: React.FC<{active: number}> = ({active}) => (
  <div style={{position: 'absolute', top: 92, right: 70, display: 'flex', gap: 12}}>
    {[1, 2, 3].map((i) => (
      <div key={i} style={{width: i === active ? 70 : 34, height: 12, borderRadius: 6, background: i <= active ? F.bordo : F.line}} />
    ))}
  </div>
);

export type Shot = {src: string; from: number};
export type Cam = {at: number; rect?: [number, number, number, number]}; // rect em px do print; sem rect = tela inteira

// Print do sistema num cartão claro: troca de imagens em sequência e câmera que aproxima áreas.
export const ShotCard: React.FC<{
  shots: Shot[];
  imgW: number;
  imgH: number;
  width: number;
  height: number;
  top: number;
  cams?: Cam[];
  delay?: number;
  marks?: {rect: [number, number, number, number]; from: number; to: number}[]; // contornos de destaque
}> = ({shots, imgW, imgH, width, height, top, cams = [], delay = 0, marks = []}) => {
  const frame = useCurrentFrame();
  const p = useP(delay);
  const base = width / imgW;
  // Câmera: interpola entre os pontos definidos (zoom e deslocamento).
  const pts = [{at: 0, rect: undefined as Cam['rect']}, ...cams].map((c) => {
    if (!c.rect) return {at: c.at, z: 1, cx: imgW / 2, cy: Math.min(imgH, height / base) / 2};
    const [x0, y0, x1, y1] = c.rect;
    const z = Math.min(width / ((x1 - x0) * base), height / ((y1 - y0) * base));
    return {at: c.at, z, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2};
  });
  const ats = pts.map((q) => q.at);
  const ease = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: Easing.inOut(Easing.cubic)};
  let z = pts[0].z;
  let cx = pts[0].cx;
  let cy = pts[0].cy;
  for (let i = 1; i < pts.length; i++) {
    const t = interpolate(frame, [ats[i], ats[i] + 32], [0, 1], ease);
    z = z + (pts[i].z - z) * t;
    cx = cx + (pts[i].cx - cx) * t;
    cy = cy + (pts[i].cy - cy) * t;
  }
  const s = base * z;
  let left = width / 2 - cx * s;
  let topImg = height / 2 - cy * s;
  left = Math.min(0, Math.max(width - imgW * s, left));
  topImg = Math.min(0, Math.max(height - imgH * s, topImg));
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: (1080 - width) / 2,
        width,
        height,
        borderRadius: 30,
        overflow: 'hidden',
        background: '#fff',
        border: `2px solid ${F.line}`,
        boxShadow: '0 30px 80px rgba(20,33,61,0.16)',
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [70, 0])}px)`,
      }}
    >
      {shots.map((sh, i) => {
        const next = shots[i + 1];
        const o = interpolate(frame, [sh.from, sh.from + 8], [i === 0 ? 1 : 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const out = next ? interpolate(frame, [next.from, next.from + 8], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
        if (frame < sh.from && i > 0) return null;
        return (
          <Img
            key={sh.src}
            src={staticFile(sh.src)}
            style={{position: 'absolute', left, top: topImg, width: imgW * s, height: imgH * s, opacity: o * out}}
          />
        );
      })}
      {marks.map((m, i) => {
        const o = interpolate(frame, [m.from, m.from + 8, m.to - 8, m.to], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const pulse = 1 + 0.015 * Math.sin((frame - m.from) / 4);
        const [x0, y0, x1, y1] = m.rect;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: left + x0 * s - 8,
              top: topImg + y0 * s - 8,
              width: (x1 - x0) * s + 16,
              height: (y1 - y0) * s + 16,
              border: `5px solid ${F.bordo}`,
              borderRadius: 22,
              opacity: o,
              transform: `scale(${pulse})`,
              boxShadow: '0 0 0 9999px rgba(250,250,247,0.55)',
            }}
          />
        );
      })}
    </div>
  );
};

// Lista com marcadores: o item atual fica em destaque e os anteriores ficam mais suaves.
export const Points: React.FC<{items: {t: string; at: number}[]; top: number; color?: string}> = ({items, top, color = F.bordo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const current = items.reduce((acc, it, i) => (frame >= it.at ? i : acc), -1);
  return (
    <div style={{position: 'absolute', top, left: 80, right: 80, display: 'flex', flexDirection: 'column', gap: 18}}>
      {items.map((it, i) => {
        const p = spring({frame: frame - it.at, fps, config: {damping: 200}});
        const on = i === current;
        return (
          <div
            key={it.t}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 26,
              padding: '18px 24px',
              borderRadius: 22,
              background: on ? '#fff' : 'transparent',
              border: `2px solid ${on ? F.line : 'transparent'}`,
              boxShadow: on ? '0 14px 34px rgba(20,33,61,0.08)' : 'none',
              opacity: p * (on ? 1 : 0.5),
              transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px)`,
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                border: `4px solid ${color}`,
                background: on ? color : 'transparent',
                color: on ? '#fff' : color,
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 42, color: F.ink}}>{it.t}</div>
          </div>
        );
      })}
    </div>
  );
};
