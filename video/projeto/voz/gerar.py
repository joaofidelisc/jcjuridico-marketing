"""Gera a narração (Google Cloud TTS) de cada cena a partir de narracao.json.

Saídas: public/voz/<video>/<cena>-<n>.mp3 e src/voz/clips.json (início em frames e duração de cada fala).
A chave fica em ~/.config/jcjuridico-video/google-tts.key e nunca é impressa.
"""
import base64, hashlib, json, os, subprocess, urllib.request
from pathlib import Path

FPS = 30
GAP = 6  # frames mínimos entre duas falas da mesma cena
ROOT = Path(__file__).resolve().parent.parent
KEY = (Path.home() / '.config/jcjuridico-video/google-tts.key').read_text().strip()
cfg = json.loads((ROOT / 'voz/narracao.json').read_text())
cache = ROOT / 'voz/cache'
cache.mkdir(exist_ok=True)


def tts(text: str) -> Path:
    h = hashlib.sha1((cfg['voz'] + text).encode()).hexdigest()[:16]
    f = cache / f'{h}.mp3'
    if not f.exists():
        body = {
            'input': {'text': text},
            'voice': {'languageCode': 'pt-BR', 'name': cfg['voz']},
            'audioConfig': {'audioEncoding': 'MP3', 'sampleRateHertz': 44100},
        }
        req = urllib.request.Request(
            'https://texttospeech.googleapis.com/v1/text:synthesize?key=' + KEY,
            data=json.dumps(body).encode(),
            headers={'Content-Type': 'application/json'},
        )
        f.write_bytes(base64.b64decode(json.load(urllib.request.urlopen(req))['audioContent']))
    return f


def duration(f: Path) -> float:
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)], capture_output=True, text=True)
    return float(out.stdout)


clips = {}
for video, scenes in cfg['videos'].items():
    outdir = ROOT / 'public/voz' / video
    outdir.mkdir(parents=True, exist_ok=True)
    clips[video] = {}
    for scene, items in scenes.items():
        end = 0
        lst = []
        for n, it in enumerate(items):
            src = tts(it['text'])
            dst = outdir / f'{scene}-{n}.mp3'
            # normaliza o volume da fala para ficar igual em todas as cenas
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(src), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-b:a', '160k', str(dst)], check=True)
            dur = duration(dst)
            at = max(it['at'], end + GAP)
            end = at + round(dur * FPS)
            lst.append({'at': at, 'src': f'voz/{video}/{scene}-{n}.mp3', 'frames': round(dur * FPS)})
        clips[video][scene] = lst
        print(video, scene, 'termina no frame', end)

(ROOT / 'src/voz/clips.json').write_text(json.dumps(clips, ensure_ascii=False, indent=1))
