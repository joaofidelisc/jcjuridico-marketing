"""Destaques do Instagram (@jcjuridico.br): capas (1080x1920, ícone no centro) e stories de cada destaque.

Os stories reaproveitam artes já publicadas (carrosséis e posts) sobre o fundo da marca, com o nome do destaque e a posição
(n/N) no topo. Saída em v24/: capa_<nome>.png e destaque_<nome>_<nn>.jpg. Os stories são agendados pelo agendador próprio
(ver agendador/agenda.json) e, depois de publicados, montados em destaque a partir do arquivo de stories.
"""
import os
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image, ImageDraw, ImageFilter

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
O = os.path.join(RAIZ, 'v24')
TMP = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'destaques')
AVATAR = os.path.join(RAIZ, 'video', 'projeto', 'public', 'advogai', 'avatar-sem-fundo.png')
W, SH = P.W, 1920
os.makedirs(O, exist_ok=True)
os.makedirs(TMP, exist_ok=True)
R = lambda *p: os.path.join(RAIZ, *p)


def fundo():
    return P.background('dark').resize((W, SH), Image.LANCZOS)


def capa(nome, tipo):
    """Capa do destaque: ícone grande com anéis sobre o fundo navy (só o círculo central aparece no perfil)."""
    img = fundo()
    if tipo == 'avatar':
        d = ImageDraw.Draw(img)
        for k, a in ((1.5, 40), (1.28, 70), (1.12, 110)):
            r = 330 * k
            d.ellipse((540 - r, 960 - r, 540 + r, 960 + r), outline=P.ICE, width=3)
        d.ellipse((540 - 330, 960 - 330, 540 + 330, 960 + 330), fill=P.PEARL)
        av = Image.open(AVATAR).convert('RGBA')
        bb = av.getbbox()
        av = av.crop((bb[0], bb[1], bb[2], bb[1] + (bb[2] - bb[0]))).resize((640, 640), Image.LANCZOS)
        m = Image.new('L', (640, 640), 0)
        ImageDraw.Draw(m).ellipse((0, 0, 640, 640), fill=255)
        mask = Image.composite(av.split()[3], Image.new('L', (640, 640), 0), m)
        img.paste(av, (540 - 320, 960 - 320), mask)
    elif tipo == '§':
        d = ImageDraw.Draw(img)
        d.ellipse((540 - 330, 960 - 330, 540 + 330, 960 + 330), fill=(24, 54, 120))
        d.ellipse((540 - 330, 960 - 330, 540 + 330, 960 + 330), outline=P.ICE, width=4)
        d.text((540, 975), '§', font=P.font(520, 'Black'), fill=P.WHITE, anchor='mm')
    else:
        P.icon_art(img, tipo, 540, 960, 230)
    img.convert('RGB').save(os.path.join(O, f'capa_{nome}.png'))


def slide(src, titulo, n, total, saida):
    """Story de destaque: arte 1080x1350 centralizada sobre o fundo da marca, com o título e n/N no topo."""
    st = fundo()
    pw = 1000
    a = Image.open(src).convert('RGB')
    a = a.resize((pw, int(pw * a.height / a.width)), Image.LANCZOS)
    x0, y0 = (W - pw) // 2, (SH - a.height) // 2 + 30
    sh = Image.new('RGBA', (W, SH), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((x0, y0 + 24, x0 + pw, y0 + a.height + 24), 30, fill=(0, 0, 0, 130))
    sh = sh.filter(ImageFilter.GaussianBlur(26))
    st.paste(sh, (0, 0), sh)
    m = Image.new('L', a.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, a.width, a.height), 30, fill=255)
    st.paste(a, (x0, y0), m)
    P.pill(st, W // 2, 270, f'{titulo}  ·  {n}/{total}', fill=P.WHITE, fg=P.NAVY, size=30, padx=40, pady=18, weight='ExtraBold')
    st.convert('RGB').save(saida, 'JPEG', quality=90, optimize=True)


def nova(nome, spec, fn=None):
    """Gera uma arte nova (1080x1350) para completar um destaque."""
    png = os.path.join(TMP, nome + '.png')
    (fn or P.explica)(spec, png)
    return png


DEST = {}
DEST['comece-aqui'] = ('COMECE AQUI', 'scale', [R('v20', f't27_0{i}.png') for i in range(1, 8)])
DEST['calculos'] = ('CÁLCULOS', 'calc', [R('v21', f'04_calculos_0{i}.png') for i in range(1, 7)])
DEST['advogai'] = ('ADVOGAI', 'avatar', [
    R('v21', '11_advogai.png'),
    nova('advogai_2', dict(tema='AdvogAI', fundo='navy', title='Tudo **dentro do sistema**', size=68,
                           sub='Explica o resultado dos cálculos em linguagem simples, tira dúvidas sobre prazos e legislação, consulta a agenda, '
                               'os clientes e o financeiro e faz cadastros pelo chat. **Só com os dados do seu escritório.**', sub_size=31)),
])
DEST['planos'] = ('PLANOS', 'chart', [
    R('v20', 'planos_23.png'),
    nova('planos_2', dict(number='30', unit='DIAS GRÁTIS', title='Teste o JC Jurídico **sem compromisso**',
                          sub='Crie a sua conta pelo link na bio e comece o teste.', num_size=420, dark=True), P.hero_number),
])
DEST['parceiros'] = ('PARCEIROS', 'users', [R('v20', f'parceiros_0{i}.png') for i in range(1, 6)])
DEST['jc-explica'] = ('JC EXPLICA', '§', [
    nova('explica_1', dict(tema='JC Explica', fundo='claro', title='Direito explicado **sem complicação**', size=68,
                           sub='Toda semana, uma regra, um direito ou uma curiosidade jurídica, **sempre com a base legal.** Salve e compartilhe.')),
    R('v23', 'consumidor_01_01.jpg'),
    R('v23', 'trabalho_explica_31_01.jpg'),
])

if __name__ == '__main__':
    todos = {}
    for nome, (titulo, tipo, fontes) in DEST.items():
        capa(nome, tipo)
        todos[nome] = []
        for i, f in enumerate(fontes, 1):
            saida = os.path.join(O, f'destaque_{nome}_{i:02d}.jpg')
            slide(f, titulo, i, len(fontes), saida)
            todos[nome].append(saida)
    # folha de revisão: capas + stories
    linhas = len(DEST)
    mx = max(len(v) for v in todos.values())
    w, h = 150, 267
    sheet = Image.new('RGB', ((mx + 1) * (w + 6), linhas * (h + 6)), 'gray')
    for r, (nome, arqs) in enumerate(todos.items()):
        c = Image.open(os.path.join(O, f'capa_{nome}.png')).resize((w, h))
        sheet.paste(c, (0, r * (h + 6)))
        for i, a in enumerate(arqs):
            sheet.paste(Image.open(a).resize((w, h)), ((i + 1) * (w + 6), r * (h + 6)))
    sheet.save(os.path.join(TMP, 'folha.jpg'), quality=85)
    print(sum(len(v) for v in todos.values()), 'stories;', os.path.join(TMP, 'folha.jpg'))
