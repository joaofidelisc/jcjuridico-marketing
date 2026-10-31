"""Novembro/2026, série educativa: 60 posts (2 por dia, 9h e 19h) publicados pelo agendador próprio (VM).

Conteúdo em scripts/novembro_v22_conteudo.py. Este script:
  1. desenha cada post no estilo v2 (fato, número, quiz, lista e mitos);
  2. grava as imagens em JPEG em v22/ (a API do Instagram só aceita JPEG);
  3. gera agendador/agenda.json com todos os posts (sem mexer no Metricool).
"""
import json
import os
import shutil
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import jc_post2 as P
from PIL import Image, ImageDraw
from novembro_v21 import texto, sl
from novembro_v22_conteudo import POSTS

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
O = os.path.join(RAIZ, 'v22')
TMP = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'jc_v22_png')
W, H = P.W, P.H
BASE = 'BASE LEGAL'


def jpg(png, nome):
    """Converte o PNG desenhado em JPEG dentro de v22/ e devolve o caminho relativo ao repositório."""
    Image.open(png).convert('RGB').save(os.path.join(O, nome), 'JPEG', quality=90, optimize=True, progressive=True)
    return f'v22/{nome}'


def numero(spec, out):
    """Número/palavra de destaque ajustado à largura, selo logo abaixo, título e texto (fundo escuro ou claro)."""
    dark = spec['bg'] == 'dark'
    img = P.background('dark' if dark else spec['bg'])
    P.top_logo(img, dark, 'left', 120)
    d = ImageDraw.Draw(img)
    d.text((W // 2, 330), ' '.join(spec['kicker'].upper()), font=P.font(26, 'Bold'), fill=P.ICE if dark else P.BORDO, anchor='mm')
    size = 300
    while d.textlength(spec['number'], font=P.font(size, 'Black')) > W - 160:
        size -= 6
    f = P.font(size, 'Black')
    bb = d.textbbox((W // 2, 390), spec['number'], font=f, anchor='mt')
    d.text((W // 2 + 7, 399), spec['number'], font=f, fill=(4, 10, 30) if dark else (225, 228, 238), anchor='mt')
    d.text((W // 2, 390), spec['number'], font=f, fill=P.WHITE if dark else P.NAVY, anchor='mt')
    y = bb[3] + 70
    P.pill(img, W // 2, y, spec['unit'], fill=P.BORDO_L if dark else P.BORDO, fg=P.WHITE, size=34, padx=46, pady=20, weight='ExtraBold')
    y = P.rich(img, 80, y + 76, spec['title'], 54, W - 160, P.WHITE if dark else P.NAVY, P.BORDO_L if dark else P.BORDO, P.WHITE,
               align='center', caps=True)
    y = P.para(img, 120, y + 12, spec['sub'], 29, W - 240, (214, 224, 246) if dark else P.GRAY, align='center',
               bold_color=P.WHITE if dark else P.BORDO)
    if spec.get('base'):
        d = ImageDraw.Draw(img)
        d.text((W // 2, H - 160), spec['base'], font=P.font(22, 'SemiBold'), fill=P.ICE if dark else P.GRAY, anchor='mm')
    P.footer(img, dark)
    img.save(out)


def desenhar(post):
    """Desenha um post e devolve a lista de mídias (caminhos dos JPEGs no repositório)."""
    k, bg, t = post['id'], post['bg'], post['tipo']
    midia = []

    def salvar(fn, spec, n):
        png = os.path.join(TMP, f'{k}_{n:02d}.png')
        fn(spec, png)
        midia.append(jpg(png, f'{k}_{n:02d}.jpg'))

    if t == 'fato':
        salvar(texto, dict(bg=bg, kicker=post['kicker'], title=post['title'], size=post.get('size', 64), sub=post['sub'],
                           callout=post['base'], callout_label=BASE, icon=post.get('icon', 'scale'), icon_r=100), 1)
    elif t == 'numero':
        salvar(numero, post, 1)
    elif t == 'quiz':
        salvar(P.statement, dict(bg=bg, kicker='VERDADEIRO OU FALSO?', title=post['pergunta'], size=post.get('size', 74),
                                 sub='Pense na resposta e **arraste para o lado.**', icon=post.get('icon', 'scale'), icon_r=95, swipe=True), 1)
        salvar(texto, dict(bg=bg, kicker='RESPOSTA', title=f"**{post['resposta']}.**", size=110, sub=post['explicacao'],
                           callout=post['base'], callout_label=BASE, icon='check' if post['resposta'] == 'Verdadeiro' else 'shield',
                           icon_r=90, right='2/2'), 2)
    elif t in ('lista', 'mitos'):
        itens = post['itens']
        n = len(itens)
        salvar(P.statement, dict(bg=bg, kicker=post['kicker'], title=post['title'], size=post.get('size', 76), sub=post.get('sub'),
                                 icon=post.get('icon', 'scale'), icon_r=100, swipe=True), 1)
        for i, (a, b, base) in enumerate(itens):
            if t == 'mitos':
                spec = dict(bg=bg, kicker='MITO', title=f'“{a}”', size=56, sub=f'**Na verdade:** {b}', sub_size=34, callout=base, callout_label=BASE,
                            icon='shield', icon_r=90, right=sl(i + 1, n), num=f'{i + 1:02d}', y=300)
            else:
                spec = dict(bg=bg, title=a, size=62, sub=b, sub_size=34, callout=base, callout_label=BASE, icon=post.get('icon_itens', 'check'),
                            icon_r=90, right=sl(i + 1, n), num=f'{i + 1:02d}', y=300)
            salvar(texto, spec, i + 2)
        salvar(P.statement, dict(bg=bg, title=post.get('fim', 'Salve e **compartilhe**'),
                                 sub=post.get('fim_sub', 'Envie para quem precisa saber disso.'), icon='users', icon_r=100,
                                 cta=post.get('cta', 'SALVE ESTE POST')), n + 2)
    else:
        raise ValueError(t)
    return midia


def main():
    if os.path.isdir(O):
        shutil.rmtree(O)
    os.makedirs(O)
    os.makedirs(TMP, exist_ok=True)
    agenda = []
    ids = set()
    for p in POSTS:
        assert p['id'] not in ids, p['id']
        ids.add(p['id'])
        midia = desenhar(p)
        tipo = 'imagem' if len(midia) == 1 else 'carrossel'
        legenda = p['legenda'].strip() + '\n\n' + p['tags']
        assert len(legenda) <= 2200 and legenda.count('#') <= 30, p['id']
        agenda.append({'id': f"2026-11-{p['dia']:02d}-{p['id']}", 'quando': f"2026-11-{p['dia']:02d}T{p['hora']}:00-03:00",
                       'tipo': tipo, 'midia': midia, 'legenda': legenda, 'ativo': True})
    agenda.sort(key=lambda a: a['quando'])
    with open(os.path.join(RAIZ, 'agendador', 'agenda.json'), 'w', encoding='utf-8') as f:
        json.dump({'posts': agenda}, f, ensure_ascii=False, indent=2)
    print(len(agenda), 'posts,', sum(len(a['midia']) for a in agenda), 'imagens')


if __name__ == '__main__':
    main()
