"""Carrossel de 31/10/2026 (19h): 5 coisas proibidas no trabalho que parecem normais. Estilo print de post."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
from tweet_cards import card

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
TMP = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'trab')
os.makedirs(TMP, exist_ok=True)
N = 7
S = [
    dict(texto='5 coisas que são **PROIBIDAS por lei no trabalho**, mas quase todo mundo acha normal.\n\n(A 4ª acontece todo dia.)', size=52, selo='DIREITO DO TRABALHO'),
    dict(texto='**1. Descontar do salário quando o caixa fecha negativo.**\n\nSó é permitido se houver acordo prévio ou se ficar provado que o funcionário agiu de propósito (dolo).',
         base='CLT, art. 462, § 1º'),
    dict(texto='**2. Proibir ou cronometrar as idas ao banheiro.**\n\nA Justiça do Trabalho tem condenado empresas a pagar indenização por dano moral por essa prática.',
         base='CF, art. 5º, X, e jurisprudência do TST'),
    dict(texto='**3. Mudar o horário ou o turno sem a concordância do funcionário**, quando a mudança prejudica a rotina dele.\n\nAlteração no contrato só vale com acordo e sem prejuízo.',
         base='CLT, art. 468'),
    dict(texto='**4. Exigir que o funcionário chegue 15 minutos antes, todo dia, sem bater o ponto.**\n\nTempo à disposição da empresa é tempo de trabalho. Passou de 10 minutos no dia, conta como hora extra.',
         base='CLT, arts. 4º e 58, § 1º, e Súmula 366 do TST'),
    dict(texto='**5. Não pagar hora extra porque o funcionário "é de confiança".**\n\nSó fica sem controle de jornada quem tem cargo de gestão de verdade e recebe gratificação de pelo menos 40%.',
         base='CLT, art. 62, II e parágrafo único'),
    dict(texto='**Qual desses você já viu acontecer?** Conta aqui nos comentários.\n\nManda esse post no grupo (em off) para quem precisa saber disso e **salve para consultar depois.**', size=48),
]
saidas = []
for i, s in enumerate(S, 1):
    png = os.path.join(TMP, f'{i}.png')
    card(dict(s, right=f'{i}/{N}' + ('  ·  Deslize  →' if i < N else '')), png)
    jpg = os.path.join(RAIZ, 'v23', f'trabalho_31_{i:02d}.jpg')
    Image.open(png).convert('RGB').save(jpg, quality=90, optimize=True)
    saidas.append(png)
sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
P.story(saidas[0], os.path.join(TMP, 'story.png'), 'navy')
Image.open(os.path.join(TMP, 'story.png')).convert('RGB').save(os.path.join(RAIZ, 'v23', 'trabalho_31_story.jpg'), quality=90, optimize=True)
g = Image.new('RGB', (N * 410, 512), 'gray')
for i, p in enumerate(saidas):
    g.paste(Image.open(p).resize((405, 506)), (i * 410, 3))
g.save(os.path.join(TMP, 'grade.jpg'), quality=85)
print(os.path.join(TMP, 'grade.jpg'))
