"""Carrossel de 31/10/2026 (noite): 5 coisas proibidas no trabalho que parecem normais. Série JC Explica (fundo navy)."""
import os
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
TMP = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'trab')
os.makedirs(TMP, exist_ok=True)
F = 'navy'
T = 'Direito do trabalho'
N = 7
S = [
    dict(tema=T, title='5 coisas **proibidas por lei** no trabalho que quase todo mundo acha normais', size=64,
         sub='E a 4ª acontece **todo dia**. Arraste para o lado.', swipe=True),
    dict(tema=T, title='1. Descontar do salário quando **o caixa fecha negativo**', size=58,
         sub='Só é permitido se houver acordo prévio ou se ficar provado que o funcionário agiu de propósito (dolo).', base='CLT, art. 462, § 1º.'),
    dict(tema=T, title='2. Proibir ou **cronometrar** as idas ao banheiro', size=58,
         sub='A Justiça do Trabalho tem condenado empresas a pagar **indenização por dano moral** por essa prática.',
         base='CF, art. 5º, X, e jurisprudência do TST.'),
    dict(tema=T, title='3. Mudar o horário ou o turno **sem concordância**', size=58,
         sub='Quando a mudança prejudica a rotina do funcionário, ela não vale. Alteração no contrato exige acordo e **ausência de prejuízo**.',
         base='CLT, art. 468.'),
    dict(tema=T, title='4. Exigir chegar **15 minutos antes** sem bater o ponto', size=58,
         sub='Tempo à disposição da empresa é tempo de trabalho. Passou de **10 minutos no dia**, conta como hora extra.',
         base='CLT, arts. 4º e 58, § 1º, e Súmula 366 do TST.'),
    dict(tema=T, title='5. Negar hora extra porque o funcionário **"é de confiança"**', size=58,
         sub='Só fica sem controle de jornada quem tem cargo de gestão de verdade e recebe **gratificação de pelo menos 40%**.',
         base='CLT, art. 62, II e parágrafo único.'),
    dict(tema=T, title='Qual desses você **já viu acontecer?**', size=72,
         sub='Conta nos comentários, manda no grupo (em off) para quem precisa saber disso e **salve para consultar depois.**',
         cta='SALVE E COMPARTILHE'),
]
saidas = []
for i, s in enumerate(S, 1):
    png = os.path.join(TMP, f'e{i}.png')
    P.explica(dict(s, fundo=F, right=None if i == 1 else f'{i - 1}/{N - 1}' + ('  ·  Deslize  →' if i < N else '')), png)
    Image.open(png).convert('RGB').save(os.path.join(RAIZ, 'v23', f'trabalho_explica_31_{i:02d}.jpg'), quality=90, optimize=True)
    saidas.append(png)
P.story(saidas[0], os.path.join(TMP, 'estory.png'), F)
Image.open(os.path.join(TMP, 'estory.png')).convert('RGB').save(os.path.join(RAIZ, 'v23', 'trabalho_explica_31_story.jpg'), quality=90, optimize=True)
g = Image.new('RGB', (N * 410, 512), 'gray')
for i, p in enumerate(saidas):
    g.paste(Image.open(p).resize((405, 506)), (i * 410, 3))
g.save(os.path.join(TMP, 'egrade.jpg'), quality=85)
print(os.path.join(TMP, 'egrade.jpg'))
