"""Post de planos (23/10/2026): deixa claro o preço no plano anual e no mensal, com a economia do anual.

Preços conferidos em system_settings (produção) em 20/10/2026:
mensal 119 / 179 / 289; anual 948 / 1428 / 2388 (12x no cartão = 79 / 119 / 199 por mês).
"""
import os
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import ImageDraw

O = os.path.join(os.path.dirname(__file__), '..', 'v20')
os.makedirs(O, exist_ok=True)

PLANOS = [
    # nome, mensal, anual (total), descrição, destaque
    ('Básico', 119, 948, 'Até 2 usuários · cálculos selecionados', False),
    ('Profissional', 179, 1428, 'Até 5 usuários · todos os cálculos', True),
    ('Avançado', 289, 2388, 'Até 10 usuários · todas as funções', False),
]


def brl(v):
    return f'R$ {v:,.0f}'.replace(',', '.')


def planos(out):
    W = P.W
    img = P.background('dark')
    P.top_logo(img, True, 'center', 110)
    y = P.rich(img, 80, 225, 'Planos do JC Jurídico: **economize no anual**', 62, W - 160, P.WHITE, P.BORDO_L, P.WHITE, align='center', caps=True)
    y = P.para(img, 110, y + 6, 'No plano anual você paga em **12x no cartão** e economiza cerca de 1/3 em relação ao mensal.', 27, W - 220,
               (214, 224, 246), align='center', bold_color=P.WHITE)
    y += 26
    for nome, mensal, anual, desc, destaque in PLANOS:
        h = 196
        box = (80, y, W - 80, y + h)
        por_mes = anual / 12
        economia = mensal * 12 - anual
        if destaque:
            P.shadowed(img, box, 30, fill=P.WHITE, shadow=(0, 0, 0, 120))
            tc, sc, pc, ec = P.NAVY, P.GRAY, P.BORDO, P.BORDO
            d = ImageDraw.Draw(img)
            d.rounded_rectangle((110, y - 22, 320, y + 20), 21, fill=P.BORDO)
            d.text((215, y - 1), 'MAIS ESCOLHIDO', font=P.font(19, 'ExtraBold'), fill=P.WHITE, anchor='mm')
        else:
            P.shadowed(img, box, 30, fill=(20, 44, 98), shadow=(0, 0, 0, 100), outline=(60, 96, 170))
            tc, sc, pc, ec = P.WHITE, (176, 192, 226), P.WHITE, P.ICE
            d = ImageDraw.Draw(img)
        # esquerda: plano, recursos e economia no anual
        d.text((120, y + 50), nome, font=P.font(42, 'ExtraBold'), fill=tc, anchor='lm')
        d.text((120, y + 100), desc, font=P.font(22, 'Regular'), fill=sc, anchor='lm')
        d.text((120, y + 146), f'Economize {brl(economia)} por ano', font=P.font(23, 'Bold'), fill=ec, anchor='lm')
        # direita: anual em destaque e mensal logo abaixo
        d.text((W - 120, y + 30), 'PLANO ANUAL · 12X DE', font=P.font(18, 'Bold'), fill=sc, anchor='rm')
        d.text((W - 120, y + 78), brl(por_mes), font=P.font(56, 'Black'), fill=pc, anchor='rm')
        d.text((W - 120, y + 124), f'total {brl(anual)} por ano', font=P.font(20, 'Regular'), fill=sc, anchor='rm')
        d.text((W - 120, y + 160), f'ou {brl(mensal)}/mês no mensal', font=P.font(22, 'SemiBold'), fill=tc, anchor='rm')
        y += h + 26
    P.pill(img, W // 2, y + 22, 'COMECE COM 30 DIAS GRÁTIS', fill=P.BORDO_L, fg=P.WHITE, size=28, padx=52, pady=22, weight='ExtraBold')
    P.footer(img, True)
    img.save(out)


planos(f'{O}/planos_23.png')
print('ok')
