"""Meme 'print de post' para o 2º turno: card branco no estilo de post de rede social sobre o fundo navy da marca.

Neutro: não cita candidato, partido ou número. Sem métricas inventadas (curtidas etc.) nem barra de ações no card.
"""
import os
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image, ImageDraw

O = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'v20')
W, H = P.W, P.H

img = P.background('dark')
P.top_logo(img, True, 'center', 120)

falas = [('Brasil:', 'esquerda ou direita?'), ('Advogado:', 'meu prazo vence amanhã.')]
x0, x1 = 90, W - 90
fs = P.font(50, 'Regular')
fb = P.font(50, 'ExtraBold')
d = ImageDraw.Draw(img)
# altura do card a partir do texto
linhas = []
for quem, fala in falas:
    cur, ls = quem, []
    for w in fala.split():
        t = cur + ' ' + w
        if d.textlength(t, font=fb) <= x1 - x0 - 110:
            cur = t
        else:
            ls.append(cur); cur = w
    ls.append(cur)
    linhas.append(ls)
corpo = sum(len(l) for l in linhas) * 66 + (len(linhas) - 1) * 44
ch = 190 + corpo + 40
y0 = (H - ch) // 2 + 40
P.shadowed(img, (x0, y0, x1, y0 + ch), 36, fill=P.WHITE, shadow=(0, 0, 0, 140), blur=28, dy=20)
d = ImageDraw.Draw(img)
# cabeçalho: avatar com o logo, nome e @
av = 92
d.ellipse((x0 + 50, y0 + 46, x0 + 50 + av, y0 + 46 + av), fill=P.NAVY)
lg = P.logo(62, 'white')
img.paste(lg, (x0 + 50 + (av - lg.width) // 2, y0 + 46 + (av - lg.height) // 2), lg)
d.text((x0 + 50 + av + 24, y0 + 74), 'JC Jurídico', font=P.font(34, 'ExtraBold'), fill=P.INK, anchor='lm')
d.text((x0 + 50 + av + 24, y0 + 114), '@jcjuridico.br', font=P.font(28, 'Regular'), fill=P.GRAY, anchor='lm')
# falas: quem fala em negrito, a fala em regular
y = y0 + 150 + 86
for (quem, fala), ls in zip(falas, linhas):
    for i, l in enumerate(ls):
        x = x0 + 55
        if i == 0:
            d.text((x, y), quem, font=fb, fill=P.NAVY, anchor='ls')
            x += d.textlength(quem + ' ', font=fb)
            l = l[len(quem):].strip()
        d.text((x, y), l, font=fs, fill=P.INK, anchor='ls')
        y += 66
    y += 44
P.footer(img, True)
img.save(f'{O}/eleicoes_25c.png')
print('ok')
