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
    """Desenha um post na identidade "JC Explica" e devolve a lista de mídias (JPEGs no repositório).
    Fundo alternado: claro nos posts das 9h, navy nos das 19h."""
    k, t = post['id'], post['tipo']
    fundo = 'claro' if post['hora'] < '12:00' else 'navy'
    tema = post.get('kicker', '')
    midia = []

    def salvar(spec, n):
        png = os.path.join(TMP, f'{k}_{n:02d}.png')
        P.explica(dict(spec, fundo=fundo), png)
        midia.append(jpg(png, f'{k}_{n:02d}.jpg'))
        return png

    if t == 'fato':
        capa = salvar(dict(tema=tema, title=post['title'], size=post.get('size', 64), sub=post['sub'], base=post['base']), 1)
    elif t == 'numero':
        capa = salvar(dict(tema=tema, numero=post['number'], unidade=post['unit'], title=post['title'], sub=post['sub'],
                           base=post.get('base')), 1)
    elif t == 'quiz':
        capa = salvar(dict(tema='Verdadeiro ou falso?', title=post['pergunta'], size=post.get('size', 72),
                           sub='Pense na resposta e **arraste para o lado.**', swipe=True), 1)
        salvar(dict(tema='Resposta', title=f"**{post['resposta']}.**", size=110, sub=post['explicacao'], base=post['base'],
                    right='2/2'), 2)
    elif t in ('lista', 'mitos'):
        itens = post['itens']
        n = len(itens)
        capa = salvar(dict(tema=tema, title=post['title'], size=post.get('size', 72), sub=post.get('sub'), swipe=True), 1)
        for i, (a, b, base) in enumerate(itens):
            if t == 'mitos':
                spec = dict(tema='Mito', title=f'“{a}”', size=58, sub=f'**Na verdade:** {b}', base=base)
            else:
                spec = dict(tema=tema, title=a, size=62, sub=b, base=base)
            salvar(dict(spec, right=sl(i + 1, n)), i + 2)
        salvar(dict(tema=tema, title=post.get('fim', 'Salve e **compartilhe**'), sub=post.get('fim_sub', 'Envie para quem precisa saber disso.'),
                    cta=post.get('cta', 'SALVE ESTE POST')), n + 2)
    else:
        raise ValueError(t)
    # story com a capa do post (vai ao ar 2 minutos depois do feed)
    st = os.path.join(TMP, f'{k}_story.png')
    P.story(capa, st, fundo)
    return midia, jpg(st, f'{k}_story.jpg'), fundo


# Posts do Metricool em novembro (12h): ganham story pelo agendador próprio às 12h02, com a capa de cada um.
METRICOOL = [(3, '03_pdf_01'), (4, '04_calculos_01'), (5, '05_bpc'), (6, '06_pergunta'), (9, '09_agenda'), (10, '10_rescisao_01'),
             (11, '11_advogai'), (12, '12_modelos'), (13, '13_parceiros'), (16, '16_checklist'), (17, '17_financeiro'),
             (18, '18_descontos_01'), (19, '19_marketplace'), (20, '20_consciencia'), (23, '23_funil'), (24, '24_painel'),
             (25, '25_cnis'), (26, '26_equipe'), (27, '27_blackfriday'), (30, '30_13salario')]


def mais_2min(hora):
    h, m = map(int, hora.split(':'))
    return f'{h:02d}:{m + 2:02d}'


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
        midia, story, _ = desenhar(p)
        tipo = 'imagem' if len(midia) == 1 else 'carrossel'
        legenda = p['legenda'].strip() + '\n\n' + p['tags']
        assert len(legenda) <= 2200 and legenda.count('#') <= 30, p['id']
        base_id = f"2026-11-{p['dia']:02d}-{p['id']}"
        agenda.append({'id': base_id, 'quando': f"2026-11-{p['dia']:02d}T{p['hora']}:00-03:00",
                       'tipo': tipo, 'midia': midia, 'legenda': legenda, 'ativo': True})
        agenda.append({'id': base_id + '-story', 'quando': f"2026-11-{p['dia']:02d}T{mais_2min(p['hora'])}:00-03:00",
                       'tipo': 'story', 'midia': [story], 'ativo': True})
    for i, (dia, nome) in enumerate(METRICOOL):
        st = os.path.join(TMP, f'metricool_{nome}_story.png')
        P.story(os.path.join(RAIZ, 'v21', nome + '.png'), st, 'claro' if i % 2 == 0 else 'navy')
        agenda.append({'id': f'2026-11-{dia:02d}-metricool-story', 'quando': f'2026-11-{dia:02d}T12:02:00-03:00', 'tipo': 'story',
                       'midia': [jpg(st, f'metricool_{nome}_story.jpg')], 'ativo': True})
    caminho = os.path.join(RAIZ, 'agendador', 'agenda.json')
    agenda += [a for a in json.load(open(caminho, encoding='utf-8'))['posts'] if not a['id'].startswith('2026-11-')]
    agenda.sort(key=lambda a: a['quando'])
    with open(caminho, 'w', encoding='utf-8') as f:
        json.dump({'posts': agenda}, f, ensure_ascii=False, indent=2)
    print(len(agenda), 'itens na agenda,', sum(len(a['midia']) for a in agenda), 'imagens')


if __name__ == '__main__':
    main()
