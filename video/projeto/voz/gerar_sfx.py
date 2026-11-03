"""Efeitos sonoros sintetizados (sem direitos de terceiros): whoosh, pop, ka-ching, boom, riser, stamp e glitch -> public/sfx/*.wav"""
import wave
from pathlib import Path
import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / 'public/sfx'
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)
t_ = lambda d: np.arange(int(SR * d)) / SR


def salvar(nome, x, ganho=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * ganho
    with wave.open(str(OUT / f'{nome}.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def passa_banda(x, f0, f1):
    """Filtro passa-faixa variável simples (ressonador de 2ª ordem com frequência de f0 a f1)."""
    y = np.zeros_like(x); y1 = y2 = 0.0
    fs = np.linspace(f0, f1, len(x))
    for i, v in enumerate(x):
        w0 = 2 * np.pi * fs[i] / SR; r = 0.985
        y0 = v * (1 - r) + 2 * r * np.cos(w0) * y1 - r * r * y2
        y[i] = y0; y2, y1 = y1, y0
    return y


def env(n, a, d):
    e = np.ones(n); ka = int(SR * a); kd = int(SR * d)
    e[:ka] = np.linspace(0, 1, ka); e[-kd:] *= np.linspace(1, 0, kd) ** 2
    return e


t = t_(0.45); salvar('whoosh', passa_banda(rng.normal(size=len(t)), 300, 2600) * np.sin(np.pi * t / t[-1]) ** 2, 0.7)
t = t_(0.12); salvar('pop', np.sin(2 * np.pi * (900 - 2600 * t) * t) * np.exp(-t * 38), 0.7)
t = t_(0.9)
bell = sum(a * np.sin(2 * np.pi * f * t) for f, a in ((2637, 1), (3520, .7), (5274, .35), (7040, .2)))
bell2 = np.concatenate([np.zeros(int(SR * .09)), bell[:-int(SR * .09)]])
clk = np.concatenate([rng.normal(size=int(SR * .02)) * np.linspace(1, 0, int(SR * .02)), np.zeros(len(t) - int(SR * .02))])
salvar('kaching', (bell * .6 + bell2) * np.exp(-t * 5) + clk * .8, 0.75)
t = t_(0.7); salvar('boom', np.sin(2 * np.pi * (40 + 70 * np.exp(-t * 9)) * t) * np.exp(-t * 4.5) + rng.normal(size=len(t)) * np.exp(-t * 60) * .3, 0.9)
t = t_(0.9); salvar('riser', (passa_banda(rng.normal(size=len(t)), 400, 5000) * 0.6 + np.sin(2 * np.pi * (200 + 500 * t ** 2) * t) * .3) * (t / t[-1]) ** 2, 0.6)
t = t_(0.22); salvar('stamp', np.sin(2 * np.pi * (90 + 120 * np.exp(-t * 30)) * t) * np.exp(-t * 18) + rng.normal(size=len(t)) * np.exp(-t * 45) * .5, 0.9)
t = t_(0.25)
g = np.sign(np.sin(2 * np.pi * 180 * t)) * (rng.random(len(t)) > .4) * env(len(t), .005, .05)
salvar('glitch', g * .5 + rng.normal(size=len(t)) * (np.floor(t * 40) % 2) * .3, 0.45)
print(sorted(p.name for p in OUT.iterdir()))
