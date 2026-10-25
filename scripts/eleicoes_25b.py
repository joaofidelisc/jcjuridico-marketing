"""Versão no estilo v2 do post neutro de eleições: fundo navy, título com destaque e três 'placas' em pílula.

A primeira versão (cenário ilustrado de estrada, eleicoes_25.py) foi reprovada por fugir do estilo do feed.
"""
import os
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image, ImageDraw

O = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'v20')
W, H = P.W, P.H


def seta(d, cx, cy, s, k, cor):
    d.polygon([(cx + k * s, cy), (cx, cy - s * 0.75), (cx, cy - s * 0.28), (cx - k * s, cy - s * 0.28),
               (cx - k * s, cy + s * 0.28), (cx, cy + s * 0.28), (cx, cy + s * 0.75)], fill=cor)


img = P.background('dark')
P.top_logo(img, True, 'center', 130)
y = P.rich(img, 80, 300, 'Nem esquerda, nem direita.', 78, W - 160, P.WHITE, P.BORDO_L, P.WHITE, align='center', caps=True, lh=1.15)
y = P.rich(img, 80, y + 10, '**Só JC Jurídico.**', 78, W - 160, P.WHITE, P.BORDO_L, P.WHITE, align='center', caps=True, lh=1.15)
y = P.para(img, 130, y + 28, 'O caminho do advogado é outro: **prazo em dia, cálculo certo e cliente bem atendido.**', 31, W - 260,
           (214, 224, 246), align='center', bold_color=P.WHITE)

# três "placas": laterais apagadas, a do meio em destaque
cy = max(y + 150, 880)
lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(lay)
for x0, x1 in ((70, 330), (750, 1010)):
    d.rounded_rectangle((x0, cy - 48, x1, cy + 48), 48, fill=(255, 255, 255, 18), outline=(255, 255, 255, 60), width=2)
img.paste(lay, (0, 0), lay)
d = ImageDraw.Draw(img)
apagado = (120, 140, 186)
seta(d, 104, cy, 16, -1, apagado)
d.text((222, cy), 'ESQUERDA', font=P.font(26, 'Bold'), fill=apagado, anchor='mm')
seta(d, 976, cy, 16, 1, apagado)
d.text((858, cy), 'DIREITA', font=P.font(26, 'Bold'), fill=apagado, anchor='mm')
P.shadowed(img, (360, cy - 62, 720, cy + 62), 62, fill=P.WHITE, shadow=(0, 0, 0, 120))
d = ImageDraw.Draw(img)
d.polygon([(540, cy - 40), (560, cy - 18), (548, cy - 18), (548, cy - 8), (532, cy - 8), (532, cy - 18), (520, cy - 18)], fill=P.BORDO)
d.text((540, cy + 22), 'JC JURÍDICO', font=P.font(36, 'Black'), fill=P.NAVY, anchor='mm')

P.footer(img, True)
img.save(f'{O}/eleicoes_25b.png')
print('ok')
