"""Narração do vídeo "Split payment: o imposto no meio do Pix" (voz do Carlos) com o tempo de cada palavra para a legenda karaokê.

Saída: public/voz/split/<n>.mp3 e src/split/falas.json. A chave do Google TTS fica em ~/.config/jcjuridico-video/google-tts.key e nunca é impressa.
"""
import base64, hashlib, json, re, subprocess, urllib.request
from pathlib import Path
import numpy as np

FPS = 30
ROOT = Path(__file__).resolve().parent.parent
KEY = (Path.home() / '.config/jcjuridico-video/google-tts.key').read_text().strip()
VOZ, RATE = 'pt-BR-Chirp3-HD-Schedar', 1.1
cache = ROOT / 'voz/cache'; cache.mkdir(exist_ok=True)
out = ROOT / 'public/voz/split'; out.mkdir(parents=True, exist_ok=True)

# (cena, texto falado, legenda na tela (palavras em *...* ganham destaque), pausa antes em segundos)
FALAS = [
    ('gancho', 'Em dois mil e vinte e sete, o imposto vai sair no meio do Pix.', 'Em *2027*, o imposto vai sair no *meio do Pix.*', 0.0),
    ('gancho', 'E no final, tem uma parte que afeta direto o advogado.', 'E no final, tem uma parte que afeta *direto o advogado.*', 0.15),
    ('split', 'O nome é split payment: pagamento dividido.', 'O nome é *split payment:* pagamento dividido.', 0.2),
    ('split', 'Uma empresa paga mil reais para outra.', 'Uma empresa paga *R$ 1.000* para outra.', 0.15),
    ('split', 'No caminho, o banco separa o imposto, a C B S e o I B S,', 'No caminho, o banco *separa o imposto*, a CBS e o IBS,', 0.15),
    ('split', 'e manda direto para o governo.', 'e manda *direto para o governo.*', 0.05),
    ('split', 'Quem vendeu recebe só o valor líquido.', 'Quem vendeu recebe só o *valor líquido.*', 0.15),
    ('calma', 'Calma. Pelo cronograma previsto, começa em dois mil e vinte e sete, opcional, e só entre empresas.',
     'Calma. Pelo cronograma previsto, começa em *2027*, *opcional*, e só *entre empresas.*', 0.2),
    ('calma', 'Pix entre pessoas não muda. E não é imposto novo: muda o jeito de recolher.',
     'Pix entre pessoas *não muda.* E não é imposto novo: muda o *jeito de recolher.*', 0.15),
    ('advogado', 'Agora, a parte que quase ninguém fala: o advogado.', 'Agora, a parte que quase ninguém fala: *o advogado.*', 0.2),
    ('advogado', 'Quando uma empresa paga os seus honorários, o split também pode separar o imposto ali.',
     'Quando uma empresa paga os seus *honorários*, o split também pode *separar o imposto* ali.', 0.15),
    ('advogado', 'A boa notícia: a advocacia tem redução de trinta por cento nas alíquotas do I B S e da C B S.',
     'A boa notícia: a advocacia tem *redução de 30%* nas alíquotas do IBS e da CBS.', 0.15),
    ('fazer', 'Então, revise os contratos de honorários: o preço é com ou sem tributo?',
     'Então, *revise os contratos* de honorários: o preço é *com ou sem tributo?*', 0.2),
    ('fazer', 'E planeje o caixa, porque o dinheiro vai chegar mais leve.', 'E *planeje o caixa*, porque o dinheiro vai chegar *mais leve.*', 0.15),
    ('fecho', 'Salve esse vídeo e mande para o seu contador.', '*Salve* esse vídeo e mande para o seu *contador.*', 0.2),
    ('fecho', 'E comenta aqui: você cobra seus honorários com ou sem tributo?', 'E *comenta aqui:* você cobra seus honorários *com ou sem tributo?*', 0.25),
]


def tts(text):
    h = hashlib.sha1(f'{VOZ}|{RATE}|{text}'.encode()).hexdigest()[:16]
    f = cache / f'{h}.mp3'
    if not f.exists():
        body = {'input': {'text': text}, 'voice': {'languageCode': 'pt-BR', 'name': VOZ},
                'audioConfig': {'audioEncoding': 'MP3', 'sampleRateHertz': 44100, 'speakingRate': RATE}}
        req = urllib.request.Request('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + KEY,
                                     data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
        f.write_bytes(base64.b64decode(json.load(urllib.request.urlopen(req))['audioContent']))
    return f


def envelope(f):
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(f), '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(float) / 32768
    hop = 16000 // FPS
    return np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop + 1, hop)])


def trechos(texto):
    """Divide o texto em trechos que terminam em pontuação (vírgula, dois-pontos, ponto, interrogação)."""
    out, cur = [], []
    for tk in texto.split():
        cur.append(tk)
        if tk.rstrip('*')[-1:] in ',.:?!;':
            out.append(' '.join(cur)); cur = []
    if cur:
        out.append(' '.join(cur))
    return out


PAUSA = {',': 0.22, ':': 0.32, ';': 0.3, '.': 0.42, '?': 0.42, '!': 0.42}
SR = 44100


def pcm(f):
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', str(f), '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                                        capture_output=True, check=True).stdout, np.int16)


def aparar(x, lim=350):
    """Tira o silêncio do começo e do fim de um trecho sintetizado."""
    on = np.where(np.abs(x.astype(int)) > lim)[0]
    return x[max(0, on[0] - 600):on[-1] + 1500] if len(on) else x


def falar(fala, leg, dst):
    """Sintetiza cada trecho em separado e junta com pausas; devolve as palavras da legenda com o quadro de início."""
    pf, pl = trechos(fala), trechos(leg)
    assert len(pf) == len(pl), (pf, pl)
    partes, words, pos = [], [], 0
    for i, (tf, tl) in enumerate(zip(pf, pl)):
        x = aparar(pcm(tts(tf)))
        ini_f = pos / SR * FPS
        dur_f = len(x) / SR * FPS
        ws = tl.split()
        peso = np.array([len(re.sub(r'[^\wÀ-ú%$]', '', w)) + 2 for w in ws], float)
        st = np.concatenate([[0], np.cumsum(peso)[:-1]]) / peso.sum() * dur_f * 0.95
        words += [{'w': w, 'f': int(ini_f + s0)} for w, s0 in zip(ws, st)]
        partes.append(x); pos += len(x)
        if i < len(pf) - 1:
            sil = np.zeros(int(SR * PAUSA.get(tf.rstrip()[-1], 0.2)), np.int16)
            partes.append(sil); pos += len(sil)
    raw = dst.with_suffix('.raw')
    raw.write_bytes(np.concatenate(partes).tobytes())
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', str(raw),
                    '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-ar', '44100', '-b:a', '160k', str(dst)], check=True)
    raw.unlink()
    return words


t, clips, cenas = 6, [], {}
for n, (cena, fala, leg, pausa) in enumerate(FALAS):
    dst = out / f'{n}.mp3'
    words = falar(fala, leg, dst)
    frames = len(envelope(dst))
    if cena not in cenas:
        if cenas:
            list(cenas.values())[-1]['fim'] = t + 8
            t += 8
        cenas[cena] = {'id': cena, 'ini': t if cenas else 0}
    t += round(pausa * FPS)
    clips.append({'n': n, 'at': t, 'frames': frames, 'src': f'voz/split/{n}.mp3', 'cena': cena, 'words': words})
    t += frames
list(cenas.values())[-1]['fim'] = t + 30
OUTRO = 60
total = list(cenas.values())[-1]['fim'] + OUTRO
(ROOT / 'src/split').mkdir(exist_ok=True)
(ROOT / 'src/split/falas.json').write_text(json.dumps({'outro': OUTRO, 'total': total, 'clips': clips, 'cenas': list(cenas.values())}, ensure_ascii=False))
print('total', total, 'frames =', round(total / FPS, 1), 's;', [(c['id'], round(c['ini'] / 30, 1)) for c in cenas.values()])
