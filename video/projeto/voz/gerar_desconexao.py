"""Narração do vídeo "Chefe mandou mensagem fora do horário" com duas vozes (Ana: Sulafat, Carlos: Schedar).

Saída: public/voz/desconexao/<n>.mp3 e src/desconexao/falas.json (início, duração, quem fala, legenda e cena de cada fala).
A chave do Google TTS fica em ~/.config/jcjuridico-video/google-tts.key e nunca é impressa.
"""
import base64, hashlib, json, subprocess, urllib.request
from pathlib import Path

FPS = 30
ROOT = Path(__file__).resolve().parent.parent
KEY = (Path.home() / '.config/jcjuridico-video/google-tts.key').read_text().strip()
VOZ = {'A': ('pt-BR-Chirp3-HD-Sulafat', 1.0), 'C': ('pt-BR-Chirp3-HD-Schedar', 1.08)}
cache = ROOT / 'voz/cache'
cache.mkdir(exist_ok=True)
out = ROOT / 'public/voz/desconexao'
out.mkdir(parents=True, exist_ok=True)

# (cena, quem, texto falado, legenda na tela, pausa antes em segundos)
FALAS = [
    ('gancho', 'C', 'Dez e quarenta e sete da noite, e o chefe quer o relatório agora!', '**22h47** e o chefe quer o relatório **agora!**', 0.0),
    ('gancho', 'A', 'Calma, Carlos. Antes de responder, você precisa saber uma coisa.', 'Calma, Carlos. **Antes de responder**, você precisa saber uma coisa.', 0.3),
    ('gancho', 'C', 'Se eu não responder, ele me demite?', 'Se eu **não responder**, ele me demite?', 0.2),
    ('gancho', 'A', 'Respira. Já te explico.', 'Respira. **Já te explico.**', 0.3),
    ('regra', 'A', 'Fora do expediente, o seu tempo é seu. Em regra, você não é obrigado a responder na hora.',
     'Fora do expediente, **o seu tempo é seu.** Em regra, você **não é obrigado** a responder na hora.', 0.3),
    ('hora', 'A', 'Mas se a empresa cobra resposta e você trabalha depois do horário, isso pode virar hora extra, com adicional de no mínimo cinquenta por cento.',
     'Mas se a empresa **cobra resposta** e você trabalha depois do horário, pode virar **hora extra**, com adicional de no mínimo **50%.**', 0.3),
    ('hora', 'C', 'Mas eu só respondi um okay!', 'Mas eu só respondi um **“ok”!**', 0.3),
    ('hora', 'A', 'Um okay isolado é pouco. Mas, se vira rotina, esse tempo pode ser contado.',
     'Um “ok” isolado é pouco. Mas **se vira rotina**, esse tempo pode ser contado.', 0.25),
    ('plantao', 'A', 'Ficar de plantão, esperando ser chamado, é sobreaviso, e pode ser pago à parte.',
     'Ficar de **plantão**, esperando ser chamado, é **sobreaviso**, e pode ser **pago à parte.**', 0.3),
    ('prova', 'A', 'E guarde os prints, com dia e hora. Quem pede o direito precisa provar.',
     'E **guarde os prints**, com dia e hora. Quem pede o direito **precisa provar.**', 0.3),
    ('prova', 'C', 'Eu tirei print até do bom dia dele.', 'Eu tirei print até do **bom dia** dele.', 0.3),
    ('fecho', 'A', 'Salva esse vídeo e manda pra quem nunca desliga o WhatsApp do trabalho.',
     '**Salva** esse vídeo e manda pra quem **nunca desliga** o WhatsApp do trabalho.', 0.3),
    ('fecho', 'C', 'Boa noite, chefe.', '**Boa noite**, chefe.', 0.4),
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
    clips.append({'n': n, 'at': t, 'frames': frames, 'src': f'voz/desconexao/{n}.mp3', 'quem': quem, 'texto': leg, 'cena': cena})
    t += frames
list(cenas.values())[-1]['fim'] = t + TAIL + 18
OUTRO = 84
total = list(cenas.values())[-1]['fim'] + OUTRO
(ROOT / 'src/desconexao').mkdir(exist_ok=True)
(ROOT / 'src/desconexao/falas.json').write_text(json.dumps({'capa': CAPA, 'outro': OUTRO, 'total': total, 'clips': clips, 'cenas': list(cenas.values())},
                                                       ensure_ascii=False, indent=1))
print('total', total, 'frames =', round(total / FPS, 1), 's;', len(clips), 'falas')
