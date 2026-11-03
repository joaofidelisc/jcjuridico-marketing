"""Narração do vídeo "Voo atrasado: direitos hora a hora" com duas vozes (Ana: Sulafat, Carlos: Schedar).

Saída: public/voz/voo/<n>.mp3 e src/voo/falas.json (início, duração, quem fala, legenda e cena de cada fala).
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
out = ROOT / 'public/voz/voo'
out.mkdir(parents=True, exist_ok=True)

# (cena, quem, texto falado, legenda na tela, pausa antes em segundos)
FALAS = [
    ('gancho', 'C', 'Voo atrasado de novo! E eu vou ficar aqui sem nada?', 'Voo **atrasado** de novo! E eu vou ficar aqui **sem nada?**', 0.0),
    ('gancho', 'A', 'Calma, Carlos. A companhia tem obrigações, e elas aumentam a cada hora.', 'Calma, Carlos. A companhia tem **obrigações**, e elas aumentam **a cada hora.**', 0.3),
    ('hora1', 'A', 'Passou de uma hora de atraso? Ela deve oferecer comunicação, como internet e telefone.', 'Passou de **1 hora?** Ela deve oferecer **comunicação**, como internet e telefone.', 0.3),
    ('hora1', 'C', 'Já é alguma coisa. Qual é a senha do Wi-Fi?', 'Já é alguma coisa. Qual é a **senha do Wi-Fi?**', 0.25),
    ('hora2', 'A', 'Passou de duas horas? Alimentação adequada, como um voucher ou uma refeição.', 'Passou de **2 horas?** **Alimentação** adequada, como voucher ou refeição.', 0.3),
    ('hora2', 'C', 'Agora sim! Cadê o lanche?', 'Agora sim! **Cadê o lanche?**', 0.25),
    ('hora4', 'A', 'Passou de quatro horas? Hospedagem, se tiver pernoite, e o transporte de ida e volta.', 'Passou de **4 horas?** **Hospedagem**, se tiver pernoite, e o **transporte** de ida e volta.', 0.3),
    ('hora4', 'A', 'E aí você escolhe: ser reacomodado em outro voo, receber o reembolso integral, ou ir por outro meio de transporte.',
     'E aí você escolhe: **outro voo**, **reembolso integral** ou **outro transporte.**', 0.3),
    ('hora4', 'C', 'Eu escolho chegar na praia!', 'Eu escolho **chegar na praia!**', 0.25),
    ('dica', 'A', 'E guarde os comprovantes. Se você teve prejuízo, pode caber indenização, conforme o caso.', 'E **guarde os comprovantes.** Se teve prejuízo, pode caber **indenização**, conforme o caso.', 0.3),
    ('fecho', 'A', 'Salva esse vídeo e marca quem vai viajar no fim do ano.', '**Salva** esse vídeo e **marca** quem vai viajar no fim do ano.', 0.3),
    ('fecho', 'C', 'Já salvei. E o meu lanche?', 'Já salvei. E o meu **lanche?**', 0.4),
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
    clips.append({'n': n, 'at': t, 'frames': frames, 'src': f'voz/voo/{n}.mp3', 'quem': quem, 'texto': leg, 'cena': cena})
    t += frames
list(cenas.values())[-1]['fim'] = t + TAIL + 18
OUTRO = 84
total = list(cenas.values())[-1]['fim'] + OUTRO
(ROOT / 'src/voo').mkdir(exist_ok=True)
(ROOT / 'src/voo/falas.json').write_text(json.dumps({'capa': CAPA, 'outro': OUTRO, 'total': total, 'clips': clips, 'cenas': list(cenas.values())},
                                                       ensure_ascii=False, indent=1))
print('total', total, 'frames =', round(total / FPS, 1), 's;', len(clips), 'falas')
