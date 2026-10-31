"""Carrossel JC Explica de 31/10/2026: voto nulo não anula a eleição (e por que se diz que ajuda quem está ganhando)."""
import os
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
TMP = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'voto')
os.makedirs(TMP, exist_ok=True)
F = 'navy'
SLIDES = [
    dict(tema='Verdadeiro ou falso?', title='Se mais da metade votar nulo, **a eleição é anulada?**', size=70,
         sub='Pense na resposta e **arraste para o lado.**', swipe=True),
    dict(tema='Resposta', title='**Falso.**', size=110,
         sub='Votos brancos e nulos **não entram na conta**. Vence quem tiver a maioria dos votos válidos, ou seja, dados a algum candidato.',
         base='CF, art. 77, § 2º.', right='1/4  ·  Deslize  →'),
    dict(tema='De onde vem o mito?', title='A lei fala em **nova eleição**, mas não por voto nulo', size=60, sub_size=31,
         sub='O Código Eleitoral manda fazer nova eleição quando a **nulidade** atinge mais da metade dos votos. Isso vale para votos anulados '
             'pela Justiça Eleitoral, como em fraude ou candidato cassado, e **não para o voto nulo do eleitor**.',
         base='Código Eleitoral, art. 224.', right='2/4  ·  Deslize  →'),
    dict(tema='E o "voto em quem está ganhando"?', title='O nulo **diminui a conta** da maioria', size=62, sub_size=31,
         sub='Como os nulos saem da conta, sobram menos votos válidos, e quem lidera precisa de menos votos para passar de 50%. '
             'Exemplo: com 100 votos e 20 nulos, **bastam 41 votos para vencer**, e não 51.',
         base='Lei das Eleições (Lei 9.504/1997), art. 2º.', right='3/4  ·  Deslize  →'),
    dict(tema='Resumindo', title='Na eleição, **só o voto válido** decide', size=72,
         sub='Branco e nulo são direitos do eleitor, mas não mudam o resultado nem anulam a eleição.', cta='SALVE E COMPARTILHE', right='4/4'),
]
for i, s in enumerate(SLIDES, 1):
    png = os.path.join(TMP, f'{i}.png')
    P.explica(dict(s, fundo=F), png)
    Image.open(png).convert('RGB').save(os.path.join(RAIZ, 'v23', f'voto_nulo_31_{i:02d}.jpg'), quality=90, optimize=True)
P.story(os.path.join(TMP, '1.png'), os.path.join(TMP, 'story.png'), F)
Image.open(os.path.join(TMP, 'story.png')).convert('RGB').save(os.path.join(RAIZ, 'v23', 'voto_nulo_31_story.jpg'), quality=90, optimize=True)
grade = Image.new('RGB', (5 * 550, 675), 'gray')
for i in range(5):
    grade.paste(Image.open(os.path.join(TMP, f'{i + 1}.png')).resize((540, 675)), (i * 550, 0))
grade.save(os.path.join(TMP, 'grade.jpg'), quality=85)
print(os.path.join(TMP, 'grade.jpg'))
