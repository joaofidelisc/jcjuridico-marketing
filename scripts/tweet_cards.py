"""Carrossel no estilo "print de post" (card branco com @jcjuridico.br sobre o fundo da marca): conteúdo com cara nativa.

Cada slide: texto curto em card branco, com trechos em **negrito**; opcional uma linha de base legal no pé do card.
"""
import os
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image, ImageDraw

W, H = P.W, P.H


def paragrafos(img, x, y, texto, size, maxw):
    """Parágrafos separados por linha em branco, com espaço entre eles."""
    for i, par in enumerate(texto.split('\n\n')):
        if i:
            y += int(size * 0.55)
        y = P.para(img, x, y, par.replace('\n', ' '), size, maxw, P.INK, weight='Medium', lh=1.38, bold_color=P.NAVY)
    return y


def card(spec, out):
    navy = spec.get('fundo', 'navy') == 'navy'
    img = P.background('dark') if navy else Image.new('RGB', (W, H), P.PEARL)
    P.top_logo(img, navy, 'center', 110)
    x0, x1 = 80, W - 80
    d = ImageDraw.Draw(img)
    # mede o texto num rascunho para centralizar o card
    tmp = Image.new('RGB', (W, H))
    yb = paragrafos(tmp, x0 + 52, 0, spec['texto'], spec.get('size', 44), x1 - x0 - 104)
    hb = yb + (70 if spec.get('base') else 0)
    ch = 150 + hb + 50
    y0 = max(220, (H - ch) // 2 + 20)
    P.shadowed(img, (x0, y0, x1, y0 + ch), 36, fill=P.WHITE, shadow=(0, 0, 0, 140 if navy else 50), blur=28, dy=20,
               outline=None if navy else (228, 230, 238))
    d = ImageDraw.Draw(img)
    av = 86
    d.ellipse((x0 + 50, y0 + 44, x0 + 50 + av, y0 + 44 + av), fill=P.NAVY)
    lg = P.logo(58, 'white')
    img.paste(lg, (x0 + 50 + (av - lg.width) // 2, y0 + 44 + (av - lg.height) // 2), lg)
    d.text((x0 + 50 + av + 22, y0 + 70), 'JC Jurídico', font=P.font(32, 'ExtraBold'), fill=P.INK, anchor='lm')
    d.text((x0 + 50 + av + 22, y0 + 108), '@jcjuridico.br', font=P.font(26, 'Regular'), fill=P.GRAY, anchor='lm')
    if spec.get('selo'):
        P.pill(img, x1 - 50 - P._measure(d, spec['selo'], P.font(22, 'ExtraBold')) / 2 - 22, y0 + 88, spec['selo'], fill=P.BORDO, fg=P.WHITE,
               size=22, padx=22, pady=12, weight='ExtraBold')
    y = paragrafos(img, x0 + 52, y0 + 160, spec['texto'], spec.get('size', 44), x1 - x0 - 104)
    if spec.get('base'):
        d = ImageDraw.Draw(img)
        d.line((x0 + 52, y + 14, x1 - 52, y + 14), fill=(230, 232, 240), width=2)
        d.text((x0 + 52, y + 50), spec['base'], font=P.font(24, 'SemiBold'), fill=P.BORDO, anchor='lm')
    P.footer(img, navy, right=spec.get('right'))
    img.save(out)
