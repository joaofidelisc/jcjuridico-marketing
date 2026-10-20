"""Carrossel de 27/10 ('5 recursos em um só sistema') gerado de novo com o notebook na proporção correta."""
import os
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P

BASE = '/home/cardozo/Projects/jcjuridico-marketing/video/projeto/public/telas'
P1 = lambda n: f'{BASE}/{n}'
P2 = lambda n: f'{BASE}/{n}'
CR = (216, 60, 1568, 737); AG = (292, 145, 1536, 730); FIN = (216, 60, 1568, 740); CRM2 = (686, 255, 1536, 540)
O = os.path.join(os.path.dirname(__file__), '..', 'v20')
os.makedirs(O, exist_ok=True)

P.hero_number(dict(number='5', unit='RECURSOS', title='O escritório inteiro **em um só sistema**', sub='Cálculos, clientes, agenda, financeiro e modelos.',
                   swipe=True, num_size=420, dark=False), f'{O}/t27_01.png')
mods = [('01', 'CÁLCULOS **JURÍDICOS**', 'Previdenciário, trabalhista e cível reunidos em um só lugar.', 'Cálculos prontos em segundos, com relatório técnico.', P1('calculos.jpg'), CR),
        ('02', 'GESTÃO **DE CLIENTES**', 'Acompanhe cada contato do primeiro retorno ao fechamento.', 'Funil com Lead, Consulta e Cliente fechado.', P2('crm.jpg'), CRM2),
        ('03', 'AGENDA **INTEGRADA**', 'Compromissos e prazos organizados em um só calendário.', 'Visão por dia, semana e mês.', P2('agenda_s1.jpg'), AG),
        ('04', 'CONTROLE **FINANCEIRO**', 'Acompanhe a saúde financeira do escritório.', 'Receitas, despesas, lucro líquido e pendências.', P2('financeiro.jpg'), FIN),
        ('05', 'BIBLIOTECA **DE MODELOS**', 'Peças prontas para adaptar ao caso e protocolar.', '52 modelos de petições, contratos e procurações.', P1('biblioteca.jpg'), CR)]
for i, (n, t, sub, co, shot, crop) in enumerate(mods):
    P.step(dict(num=n, title=t, sub=sub, callout=co, shot=shot, crop=crop, dark=False, right=f'{i + 1}/5  ·  Deslize  →'), f'{O}/t27_{i + 2:02d}.png')
P.statement(dict(bg='pearl', title='Experimente **com calma**', sub='São 30 dias de teste gratuito para conhecer todos esses recursos na rotina do seu escritório.',
                 icon='clock', icon_r=110, cta='CRIE SUA CONTA · LINK NA BIO'), f'{O}/t27_07.png')
print('ok')
