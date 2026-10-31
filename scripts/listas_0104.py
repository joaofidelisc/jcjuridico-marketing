"""Carrosséis JC Explica (fundo claro, 9h) que substituem os posts de 01/11 (silêncio) e 04/11 (câncer)."""
import os
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
TMP = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'listas')
os.makedirs(TMP, exist_ok=True)

POSTS = {
    'consumidor_01': ('Direito do consumidor', [
        dict(title='5 coisas que **lojas e bancos fazem** e são proibidas por lei', size=66,
             sub='Você provavelmente já passou por **pelo menos uma.** Arraste para o lado.', swipe=True),
        dict(title='1. Cobrar errado e **não devolver em dobro**', sub='Quem paga valor cobrado indevidamente tem direito à devolução **em dobro**, com correção, salvo engano justificável.',
             base='CDC, art. 42, parágrafo único.'),
        dict(title='2. Consumação mínima e **venda casada**', sub='Condicionar o fornecimento de um produto ou serviço à compra de outro é **prática abusiva.**',
             base='CDC, art. 39, I.'),
        dict(title='3. Mandar cartão ou produto **que você não pediu**', sub='O que chega sem pedido é considerado **amostra grátis**: não há obrigação de pagar.',
             base='CDC, art. 39, III e parágrafo único.'),
        dict(title='4. Negativar seu nome **sem avisar antes**', sub='O consumidor deve ser **comunicado por escrito** antes da inclusão no cadastro de inadimplentes.',
             base='CDC, art. 43, § 2º, e Súmula 359 do STJ.'),
        dict(title='5. Cobrar dívida **expondo ao ridículo**', sub='Na cobrança, o consumidor não pode ser exposto ao ridículo nem sofrer **constrangimento ou ameaça.**',
             base='CDC, art. 42.'),
        dict(title='Qual dessas **já aconteceu** com você?', size=72, sub='Conta nos comentários e **salve para consultar depois.**', cta='SALVE E COMPARTILHE'),
    ]),
    'direitos_trabalhador_04': ('Direito do trabalho', [
        dict(title='5 direitos do trabalhador que **a empresa não conta**', size=68,
             sub='O 1º é perfeito para o **Novembro Azul.** Arraste para o lado.', swipe=True),
        dict(title='1. Faltar para **exame preventivo de câncer**', sub='Até **3 dias a cada 12 meses**, sem desconto no salário, com comprovação.',
             base='CLT, art. 473, XII.'),
        dict(title='2. Folga para **doar sangue**', sub='**1 dia a cada 12 meses** de trabalho, com comprovação da doação.', base='CLT, art. 473, IV.'),
        dict(title='3. Levar o filho **ao médico**', sub='**1 dia por ano** para acompanhar filho de até 6 anos em consulta médica.', base='CLT, art. 473, XI.'),
        dict(title='4. Intervalo de almoço **não concedido**', sub='O tempo que faltou do intervalo é pago com **50% a mais.**', base='CLT, art. 71, § 4º.'),
        dict(title='5. Férias **pagas antes**', sub='O pagamento das férias deve ser feito **até 2 dias antes** do início.', base='CLT, art. 145.'),
        dict(title='Você **sabia de todos?**', size=76, sub='Marque um colega de trabalho e **salve para consultar depois.**', cta='SALVE E COMPARTILHE'),
    ]),
}

for nome, (tema, slides) in POSTS.items():
    pngs = []
    n = len(slides)
    for i, s in enumerate(slides, 1):
        png = os.path.join(TMP, f'{nome}_{i}.png')
        P.explica(dict(dict(size=60), **s, tema=tema, fundo='claro', right=None if i == 1 else f'{i - 1}/{n - 1}' + ('  ·  Deslize  →' if i < n else '')), png)
        Image.open(png).convert('RGB').save(os.path.join(RAIZ, 'v23', f'{nome}_{i:02d}.jpg'), quality=90, optimize=True)
        pngs.append(png)
    P.story(pngs[0], os.path.join(TMP, f'{nome}_story.png'), 'claro')
    Image.open(os.path.join(TMP, f'{nome}_story.png')).convert('RGB').save(os.path.join(RAIZ, 'v23', f'{nome}_story.jpg'), quality=90, optimize=True)
    g = Image.new('RGB', (n * 410, 512), 'gray')
    for i, p in enumerate(pngs):
        g.paste(Image.open(p).resize((405, 506)), (i * 410, 3))
    g.save(os.path.join(TMP, f'{nome}_grade.jpg'), quality=85)
print('ok')
