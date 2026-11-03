"""Narração do vídeo "Pensão acaba aos 18?" com duas vozes (Ana: Sulafat, Carlos: Schedar).

Saída: public/voz/pensao/<n>.mp3 e src/pensao/falas.json (início, duração, quem fala, legenda e cena de cada fala).
A chave do Google TTS fica em ~/.config/jcjuridico-video/google-tts.key e nunca é impressa.
"""
import base64, hashlib, json, subprocess, urllib.request
from pathlib import Path

FPS = 30
ROOT = Path(__file__).resolve().parent.parent
KEY = (Path.home() / '.config/jcjuridico-video/google-tts.key').read_text().strip()
VOZ = {'A': ('pt-BR-Chirp3-HD-Sulafat', 1.0), 'C': ('pt-BR-Chirp3-HD-Schedar', 1.08), 'F': ('pt-BR-Chirp3-HD-Puck', 1.12)}
cache = ROOT / 'voz/cache'
cache.mkdir(exist_ok=True)
out = ROOT / 'public/voz/pensao'
out.mkdir(parents=True, exist_ok=True)

# (cena, quem, texto falado, legenda na tela, pausa antes em segundos)
FALAS = [
    ('gancho', 'C', 'Parabéns, filho! Dezoito anos! E sabe o melhor presente? Acabou a pensão!', 'Parabéns, filho! **18 anos!** E o melhor presente: **acabou a pensão!**', 0.0),
    ('gancho', 'F', 'Ué, pai... mas eu ainda tô na faculdade.', 'Ué, pai... mas eu ainda tô na **faculdade.**', 0.3),
    ('gancho', 'A', 'Calma, Carlos. Não é bem assim.', 'Calma, Carlos. **Não é bem assim.**', 0.3),
    ('regra', 'A', 'Fazer dezoito anos não encerra a pensão sozinho. Para parar de pagar, é preciso uma decisão judicial.',
     'Fazer 18 anos **não encerra** a pensão sozinho. Para parar de pagar, é preciso **decisão judicial.**', 0.3),
    ('regra', 'A', 'E o filho tem o direito de se manifestar no processo.', 'E o filho tem o direito de **se manifestar** no processo.', 0.25),
    ('regra', 'F', 'Eu vou me manifestar, sim!', 'Eu vou **me manifestar**, sim!', 0.25),
    ('estudo', 'A', 'Se ele ainda estuda, numa faculdade ou num curso técnico, a Justiça costuma manter a pensão, conforme o caso.',
     'Se ele **ainda estuda**, numa faculdade ou curso técnico, a Justiça **costuma manter** a pensão, conforme o caso.', 0.3),
    ('estudo', 'C', 'E se eu simplesmente parar de pagar?', 'E se eu simplesmente **parar de pagar?**', 0.3),
    ('risco', 'A', 'Aí a dívida continua. E atraso de pensão pode levar até à prisão civil.', 'Aí a **dívida continua.** E atraso de pensão pode levar até à **prisão civil.**', 0.3),
    ('risco', 'C', 'Tá bom, tá bom. Vou procurar um advogado.', 'Tá bom, tá bom. Vou **procurar um advogado.**', 0.3),
    ('fecho', 'A', 'Salva esse vídeo e manda pra quem acha que a pensão acaba no aniversário.', '**Salva** esse vídeo e manda pra quem acha que a pensão **acaba no aniversário.**', 0.3),
    ('fecho', 'F', 'E o meu presente, pai?', 'E o meu **presente**, pai?', 0.4),
]


def tts(text, voice, rate):
    h = hashlib.sha1(f'{voice}|{rate}|{text}'.encode()).hexdigest()[:16]
    f = cache / f'{h}.mp3'
    if not f.exists():
        body = {'input': {'text': text}, 'voice': {'languageCode': 'pt-BR', 'name': voice},
                'audioConfig': {'audioEncoding': 'MP3', 'sampleRateHertz': 44100, 'speakingRate': rate}}
        req = urllib.request.Request('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + KEY,
                                     data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
        f.write_bytes(base64.b64decode(json.load(urllib.request.urlopen(req))['audioContent']))
    return f


def dur(f):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)], capture_output=True, text=True)
    return float(r.stdout)


CAPA = 78          # 2,6 s de capa "arquivo.mp4"
LEAD, TAIL = 14, 20  # respiro antes e depois de cada cena
t = CAPA + LEAD
clips, cenas = [], {}
for n, (cena, quem, fala, leg, pausa) in enumerate(FALAS):
    voice, rate = VOZ[quem]
    src = tts(fala, voice, rate)
    dst = out / f'{n}.mp3'
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(src), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
                    '-ar', '44100', '-b:a', '160k', str(dst)], check=True)
    frames = round(dur(dst) * FPS)
    if cena not in cenas:
        if cenas:  # fecha a cena anterior
            ant = list(cenas.values())[-1]
            ant['fim'] = t + TAIL
            t += TAIL + LEAD
        cenas[cena] = {'id': cena, 'ini': t - LEAD}
    else:
        t += round(pausa * FPS)
    clips.append({'n': n, 'at': t, 'frames': frames, 'src': f'voz/pensao/{n}.mp3', 'quem': quem, 'texto': leg, 'cena': cena})
    t += frames
list(cenas.values())[-1]['fim'] = t + TAIL + 18
OUTRO = 84
total = list(cenas.values())[-1]['fim'] + OUTRO
(ROOT / 'src/pensao').mkdir(exist_ok=True)
(ROOT / 'src/pensao/falas.json').write_text(json.dumps({'capa': CAPA, 'outro': OUTRO, 'total': total, 'clips': clips, 'cenas': list(cenas.values())},
                                                       ensure_ascii=False, indent=1))
print('total', total, 'frames =', round(total / FPS, 1), 's;', len(clips), 'falas')
