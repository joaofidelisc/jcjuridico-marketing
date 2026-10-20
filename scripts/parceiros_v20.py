"""Carrossel 'Programa de Parceiros' (21/10/2026) no estilo v2 da skill jc-juridico-posts.

Fundo claro (pearl) em todos os slides. Capa com um cupom ilustrado ("cupom com o seu nome") como gancho.
Sem percentuais: os valores de desconto e comissão são definidos por parceiro no sistema.
"""
import os
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image, ImageDraw

O = os.path.join(os.path.dirname(__file__), '..', 'v20')
os.makedirs(O, exist_ok=True)


def cupom(path, cy=955):
    """Desenha um cupom (ticket) navy com picote, rótulo e código 'DR.SEUNOME' sobre a capa."""
    img = Image.open(path).convert('RGB')
    w, h = 820, 270
    x0, y0 = (P.W - w) // 2, cy - h // 2
    camada = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(camada)
    # sombra suave
    sombra = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sombra).rounded_rectangle((x0 + 6, y0 + 22, x0 + w + 6, y0 + h + 22), 34, fill=(14, 29, 63, 70))
    from PIL import ImageFilter
    sombra = sombra.filter(ImageFilter.GaussianBlur(22))
    img.paste(sombra, (0, 0), sombra)
    d.rounded_rectangle((x0, y0, x0 + w, y0 + h), 34, fill=P.NAVY + (255,))
    # recortes laterais do ticket (cor do fundo)
    fundo = img.getpixel((x0 - 30, cy))
    xp = x0 + 210
    for cx in (xp,):
        d.ellipse((cx - 26, y0 - 26, cx + 26, y0 + 26), fill=fundo + (255,))
        d.ellipse((cx - 26, y0 + h - 26, cx + 26, y0 + h + 26), fill=fundo + (255,))
    # picote
    for yy in range(y0 + 40, y0 + h - 36, 22):
        d.line((xp, yy, xp, yy + 11), fill=(150, 170, 210, 255), width=4)
    img.paste(camada, (0, 0), camada)
    d = ImageDraw.Draw(img)
    # lado esquerdo: ícone de porcentagem
    cx, cyy = x0 + 105, cy
    d.ellipse((cx - 54, cyy - 54, cx + 54, cyy + 54), outline=(150, 190, 250), width=6)
    d.text((cx, cyy + 2), '%', font=P.font(72, 'ExtraBold'), fill=P.WHITE, anchor='mm')
    # lado direito: rótulo e código
    tx = xp + 44
    d.text((tx, cy - 92), 'SEU CUPOM EXCLUSIVO', font=P.font(24, 'Bold'), fill=(150, 190, 250))
    d.text((tx, cy - 56), 'DR.SEUNOME', font=P.font(62, 'Black'), fill=P.WHITE)
    d.line((tx, cy + 26, x0 + w - 44, cy + 26), fill=(60, 90, 150), width=2)
    d.text((tx, cy + 42), 'Desconto para quem assina', font=P.font(25, 'Medium'), fill=(214, 224, 246))
    d.text((tx, cy + 76), 'e comissão para você', font=P.font(25, 'Medium'), fill=(214, 224, 246))
    img.save(path)


TOTAL = 5
dir_ = lambda i: f'{i}/{TOTAL}  ·  Deslize  →'

# 1) Capa: gancho
capa = f'{O}/parceiros_01.png'
P.statement(dict(bg='pearl', kicker='PROGRAMA DE PARCEIROS', title='Advogado, que tal ter um **cupom com o seu nome?**',
                 sub='Use o JC Jurídico, indique para colegas e **ganhe com isso.**', swipe=True), capa)
cupom(capa)

# 2-4) Os três ganhos
passos = [
    ('01', 'VOCÊ PAGA **MENOS**', 'Advogados parceiros têm **desconto na própria assinatura** do JC Jurídico.',
     'O desconto vale a partir da sua próxima cobrança.', 'check'),
    ('02', 'SEU COLEGA TAMBÉM **ECONOMIZA**', 'Quem assina com o seu cupom ganha **desconto na assinatura.** O cupom é aplicado automaticamente pelo seu link.',
     'Você indica uma ferramenta que já usa no dia a dia.', 'users'),
    ('03', 'VOCÊ GANHA **A CADA PAGAMENTO**', 'Comissão **recorrente** sobre cada mensalidade do indicado, enquanto ele for assinante.',
     'Acompanhe as indicações no seu painel e receba por PIX.', 'chart'),
]
for i, (n, t, sub, co, ic) in enumerate(passos):
    arq = f'{O}/parceiros_{i + 2:02d}.png'
    P.step(dict(num=n, title=t, sub=sub, callout=co, dark=False, right=dir_(i + 2)), arq)
    # ícone desenhado à parte, menor e mais baixo, para os anéis não encostarem no quadro de texto
    img = Image.open(arq).convert('RGB')
    P.icon_art(img, ic, P.W // 2, 990, 105, color=P.WHITE, fill=P.NAVY, ringcolor=P.NAVY)
    img.save(arq)

# 5) Chamada
P.statement(dict(bg='pearl', title='Quer ser **advogado parceiro?**',
                 sub='Envie uma mensagem no **direct do @jcjuridico.br** e receba o seu cupom. O programa é para advogados que já usam o JC Jurídico.',
                 icon='users', icon_r=105, cta='CHAME A GENTE NO DIRECT'), f'{O}/parceiros_05.png')
print('ok', sorted(os.listdir(O)))
