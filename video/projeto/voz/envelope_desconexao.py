"""Volume da fala por frame (0 a 1) de cada fala do vídeo "mensagem do chefe", para sincronizar a boca dos bonecos.
Lê src/desconexao/falas.json e grava src/desconexao/env.json (chave = número da fala)."""
import json, subprocess
from pathlib import Path
import numpy as np

FPS, SR = 30, 16000
ROOT = Path(__file__).resolve().parent.parent
falas = json.loads((ROOT / 'src/desconexao/falas.json').read_text())
out = {}
for c in falas['clips']:
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(ROOT / 'public' / c['src']), '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(float) / 32768
    hop = SR // FPS
    rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) if i < len(x) else 0 for i in range(0, len(x), hop)])
    ref = np.percentile(rms[rms > 0], 95) if (rms > 0).any() else 1
    out[str(c['n'])] = [round(float(min(1, v / ref)), 3) for v in rms]
(ROOT / 'src/desconexao/env.json').write_text(json.dumps(out))
print({k: len(v) for k, v in out.items()})
