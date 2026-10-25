"""Meme de 25/10/2026 (2º turno): placa de estrada com 'Esquerda' e 'Direita' e o carro seguindo pelo meio, 'JC Jurídico'.

Neutro: sem candidato, número, partido ou cores associadas a algum lado (placas no verde padrão de rodovia).
"""
import os
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image, ImageDraw, ImageFilter

O = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'v20')
W, H = P.W, P.H
VERDE = (0, 104, 71)        # verde de placa de rodovia
ASFALTO = (64, 70, 84)
ASFALTO_C = (84, 90, 104)
CHAO = (236, 231, 220)
HZ = 690                    # linha do horizonte


def ceu(img):
    d = ImageDraw.Draw(img)
    for y in range(HZ):
        t = y / HZ
        c = tuple(int(a + (b - a) * t) for a, b in zip((214, 228, 246), (246, 244, 238)))
        d.line((0, y, W, y), fill=c)
    d.rectangle((0, HZ, W, H), fill=CHAO)


def estrada(img):
    """Pista que sobe do rodapé e se divide em três: esquerda, direita e a rampa do meio."""
    d = ImageDraw.Draw(img)
    base_y = H - 130
    # ramos esquerdo e direito (curvam para as laterais no horizonte)
    d.polygon([(250, base_y), (520, 900), (300, HZ), (150, HZ), (0, 820), (0, base_y)], fill=ASFALTO)
    d.polygon([(830, base_y), (560, 900), (780, HZ), (930, HZ), (W, 820), (W, base_y)], fill=ASFALTO)
    # tronco e rampa do meio (reta até o horizonte)
    d.polygon([(250, base_y), (830, base_y), (600, HZ), (480, HZ)], fill=ASFALTO_C)
    # faixas laterais brancas da rampa
    d.line([(250, base_y), (480, HZ)], fill=(240, 240, 240), width=6)
    d.line([(830, base_y), (600, HZ)], fill=(240, 240, 240), width=6)
    # faixa central tracejada (perspectiva)
    y, h = base_y - 20, 70
    while y > HZ + 10:
        t = (y - HZ) / (base_y - HZ)
        w = 4 + 8 * t
        d.rectangle((W // 2 - w / 2, y - h * t, W // 2 + w / 2, y), fill=(250, 214, 90))
        y -= h * t * 2.1 + 6
    # bordas brancas dos ramos laterais
    d.line([(0, 820), (150, HZ)], fill=(240, 240, 240), width=5)
    d.line([(W, 820), (930, HZ)], fill=(240, 240, 240), width=5)


def carro(img, cx, y, w):
    """Carro navy visto de trás, seguindo pela rampa do meio."""
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    h = int(w * 0.62)
    x0, y0 = cx - w // 2, y
    d.ellipse((x0 - 10, y0 + h - 18, x0 + w + 10, y0 + h + 22), fill=(0, 0, 0, 70))
    lay = lay.filter(ImageFilter.GaussianBlur(6))
    d = ImageDraw.Draw(lay)
    # rodas
    d.rounded_rectangle((x0 + 10, y0 + h - 30, x0 + 54, y0 + h + 8), 8, fill=(20, 22, 30, 255))
    d.rounded_rectangle((x0 + w - 54, y0 + h - 30, x0 + w - 10, y0 + h + 8), 8, fill=(20, 22, 30, 255))
    # carroceria e teto
    d.rounded_rectangle((x0 + 30, y0, x0 + w - 30, y0 + h * 0.5), 26, fill=P.NAVY + (255,))
    d.rounded_rectangle((x0, y0 + h * 0.36, x0 + w, y0 + h - 10), 24, fill=P.NAVY + (255,))
    # vidro traseiro
    d.rounded_rectangle((x0 + 48, y0 + 14, x0 + w - 48, y0 + h * 0.42), 16, fill=(150, 190, 250, 255))
    # lanternas
    d.rounded_rectangle((x0 + 14, y0 + h * 0.5, x0 + 62, y0 + h * 0.62), 6, fill=(205, 40, 60, 255))
    d.rounded_rectangle((x0 + w - 62, y0 + h * 0.5, x0 + w - 14, y0 + h * 0.62), 6, fill=(205, 40, 60, 255))
    # placa do carro
    pw, ph = 120, 36
    d.rounded_rectangle((cx - pw // 2, y0 + h * 0.66, cx + pw // 2, y0 + h * 0.66 + ph), 6, fill=(255, 255, 255, 255))
    d.text((cx, y0 + h * 0.66 + ph / 2), 'JC 2026', font=P.font(22, 'ExtraBold'), fill=P.NAVY + (255,), anchor='mm')
    img.paste(lay, (0, 0), lay)


def seta(d, cx, cy, s, dir_, cor):
    """Seta grossa: dir_ = 'l', 'r' ou 'u'."""
    if dir_ == 'u':
        pts = [(cx, cy - s), (cx + s * 0.8, cy - s * 0.1), (cx + s * 0.3, cy - s * 0.1), (cx + s * 0.3, cy + s), (cx - s * 0.3, cy + s),
               (cx - s * 0.3, cy - s * 0.1), (cx - s * 0.8, cy - s * 0.1)]
    else:
        k = -1 if dir_ == 'l' else 1
        pts = [(cx + k * s, cy), (cx + k * s * 0.1, cy - s * 0.8), (cx + k * s * 0.1, cy - s * 0.3), (cx - k * s, cy - s * 0.3),
               (cx - k * s, cy + s * 0.3), (cx + k * s * 0.1, cy + s * 0.3), (cx + k * s * 0.1, cy + s * 0.8)]
    d.polygon(pts, fill=cor)


def placas(img, top):
    d = ImageDraw.Draw(img)
    # pórtico
    for px in (96, W - 96):
        d.rectangle((px - 9, top + 40, px + 9, HZ + 40), fill=(150, 156, 168))
    d.rectangle((70, top + 16, W - 70, top + 30), fill=(150, 156, 168))
    hh = 230
    y0 = top + 40
    boxes = [(80, 370, 'ESQUERDA', 'l', VERDE), (390, 690, 'JC JURÍDICO', 'u', P.NAVY), (710, 1000, 'DIREITA', 'r', VERDE)]
    for x0, x1, txt, dr, cor in boxes:
        meio = dr == 'u'
        yy0 = y0 - (24 if meio else 0)
        P.shadowed(img, (x0, yy0, x1, y0 + hh), 18, fill=cor, shadow=(0, 0, 0, 70), blur=12, dy=8)
        d = ImageDraw.Draw(img)
        d.rounded_rectangle((x0 + 8, yy0 + 8, x1 - 8, y0 + hh - 8), 12, outline=(255, 255, 255), width=4)
        cx = (x0 + x1) // 2
        if meio:
            d.text((cx, yy0 + 40), 'SAÍDA', font=P.font(20, 'ExtraBold'), fill=P.ICE, anchor='mm')
            seta(d, cx, yy0 + 112, 44, 'u', P.WHITE)
            size = 40
            while d.textlength(txt, font=P.font(size, 'Black')) > x1 - x0 - 40:
                size -= 2
            d.text((cx, y0 + hh - 52), txt, font=P.font(size, 'Black'), fill=P.WHITE, anchor='mm')
        else:
            seta(d, cx, y0 + 80, 44, dr, P.WHITE)
            d.text((cx, y0 + 172), txt, font=P.font(36, 'ExtraBold'), fill=P.WHITE, anchor='mm')


def meme(out):
    img = Image.new('RGB', (W, H), P.WHITE)
    ceu(img)
    estrada(img)
    carro(img, W // 2, 905, 230)
    P.top_logo(img, False, 'center', 100)
    y = P.rich(img, 70, 190, 'Nem esquerda, nem direita. **Só JC Jurídico.**', 54, W - 140, P.NAVY, P.BORDO, P.WHITE, align='center', caps=True, lh=1.18)
    placas(img, max(y + 10, 330))
    # rodapé sobre faixa clara para ler sobre o asfalto
    ImageDraw.Draw(img).rectangle((0, H - 130, W, H), fill=P.PEARL)
    P.footer(img, False)
    img.save(out)


meme(f'{O}/eleicoes_25.png')
print('ok')
