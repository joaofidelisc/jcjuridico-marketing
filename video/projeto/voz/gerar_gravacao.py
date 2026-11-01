"""Narração do vídeo "Gravei escondido, vale como prova?" com duas vozes (Ana: Sulafat, Carlos: Schedar).

Saída: public/voz/gravacao/<n>.mp3 e src/gravacao/falas.json (início, duração, quem fala, legenda e cena de cada fala).
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
out = ROOT / 'public/voz/gravacao'
out.mkdir(parents=True, exist_ok=True)

# (cena, quem, texto falado, legenda na tela, pausa antes em segundos)
FALAS = [
    ('gancho', 'C', 'Eu nunca disse isso!', 'Eu **nunca** disse isso!', 0.0),
    ('gancho', 'A', 'Disse, sim. Eu gravei.', 'Disse, sim. **Eu gravei.**', 0.25),
    ('gancho', 'C', 'Gravou escondido?! Isso é ilegal! Você nem me avisou!', 'Gravou **escondido?!** Isso é ilegal! Você nem me avisou!', 0.2),
    ('gancho', 'A', 'Calma, Carlos. Vale como prova. Já te explico.', 'Calma, Carlos. **Vale como prova.** Já te explico.', 0.3),
    ('regra', 'A', 'Para o S T F, a gravação feita por quem participa da conversa é prova lícita, mesmo sem avisar o outro.',
     'Para o STF, a gravação feita por **quem participa da conversa** é prova lícita, mesmo sem avisar o outro.', 0.3),
    ('participar', 'A', 'O segredo é participar. Gravar a conversa dos outros, sem estar nela, não vale, e ainda dá problema.',
     'O segredo é **participar**. Gravar a conversa dos outros, sem estar nela, **não vale** e ainda dá problema.', 0.3),
    ('participar', 'C', 'Eu estava só... passando por aqui.', 'Eu estava só... **passando por aqui.**', 0.35),
    ('excecoes', 'A', 'Tem exceções: conversas protegidas por sigilo profissional e o processo eleitoral têm regra própria.',
     'Tem exceções: **sigilo profissional** e **processo eleitoral** têm regra própria.', 0.3),
    ('divulgar', 'C', 'Então eu posto o áudio na internet!', 'Então eu **posto o áudio** na internet!', 0.3),
    ('divulgar', 'A', 'Calma! Usar como prova é uma coisa. Divulgar pode gerar indenização.',
     'Calma! Usar como prova é uma coisa. **Divulgar** pode gerar **indenização.**', 0.2),
    ('fecho', 'A', 'Salva esse vídeo e manda pra quem vive dizendo: eu gravei.', '**Salva** esse vídeo e manda pra quem vive dizendo: **“eu gravei”.**', 0.3),
    ('fecho', 'C', 'Eu vou apagar aquele áudio do grupo.', 'Eu vou **apagar** aquele áudio do grupo.', 0.4),
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
    clips.append({'n': n, 'at': t, 'frames': frames, 'src': f'voz/gravacao/{n}.mp3', 'quem': quem, 'texto': leg, 'cena': cena})
    t += frames
list(cenas.values())[-1]['fim'] = t + TAIL + 18
OUTRO = 84
total = list(cenas.values())[-1]['fim'] + OUTRO
(ROOT / 'src/gravacao').mkdir(exist_ok=True)
(ROOT / 'src/gravacao/falas.json').write_text(json.dumps({'capa': CAPA, 'outro': OUTRO, 'total': total, 'clips': clips, 'cenas': list(cenas.values())},
                                                       ensure_ascii=False, indent=1))
print('total', total, 'frames =', round(total / FPS, 1), 's;', len(clips), 'falas')
