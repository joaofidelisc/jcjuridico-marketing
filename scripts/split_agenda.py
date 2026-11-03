"""Reels "split payment" em 03/11 às 18h (story 18h05); sai o post "cobrança em dobro" das 19h de 03/11.
O Reels "mensagem do chefe" (v26), que não foi ao ar em 02/11, entra em 04/11 às 18h (story 18h05)."""
import json
import os
import subprocess
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image, ImageDraw

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
V27 = os.path.join(RAIZ, 'v27')
cap = os.path.join(V27, 'capa.png')
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '1.6', '-i', os.path.join(V27, 'split_payment.mp4'), '-frames:v', '1', cap], check=True)
st = Image.open(cap).convert('RGB').resize((1080, 1920))
P.pill(st, 540, 1580, 'NOVO REELS NO FEED', fill=P.WHITE, fg=P.NAVY, size=34, padx=46, pady=22, weight='ExtraBold')
ImageDraw.Draw(st).text((540, 1670), '@jcjuridico.br', font=P.font(34, 'Bold'), fill=P.ICE, anchor='mm')
st.save(os.path.join(V27, 'split_story.jpg'), 'JPEG', quality=90)
os.remove(cap)

LEG = ("Em 2027, o imposto vai sair no meio do pagamento. E quase ninguém está explicando o que isso muda para o advogado.\n\n"
       "É o split payment (pagamento dividido): na hora em que o pagamento é liquidado, o banco separa a CBS e o IBS e manda direto "
       "para o governo. Quem vendeu recebe o valor líquido.\n\n"
       "O que já se sabe:\n"
       "• Pelo cronograma previsto, começa em 2027, de forma opcional e só entre empresas.\n"
       "• Pix entre pessoas não muda.\n"
       "• Não é imposto novo: muda o jeito de recolher.\n\n"
       "E o advogado?\n"
       "• Quando uma empresa paga honorários, o split também pode separar o imposto ali.\n"
       "• A advocacia tem redução de 30% nas alíquotas do IBS e da CBS (profissões intelectuais regulamentadas).\n"
       "• Escritórios no Simples Nacional seguem regras próprias.\n"
       "• Vale revisar os contratos de honorários (preço com ou sem tributo) e planejar o caixa.\n\n"
       "Base legal: LC 214/2025, arts. 31 a 35 (split payment) e art. 127 (redução de 30%). O cronograma ainda pode mudar.\n\n"
       "Salve este vídeo e mande para o seu contador.\n\n"
       "#reformatributaria #splitpayment #advocacia #advogado #tributario #ibs #cbs")

p = os.path.join(RAIZ, 'agendador', 'agenda.json')
ag = json.load(open(p, encoding='utf-8'))
for x in ag['posts']:
    if x['id'] in ('2026-11-03-cobranca-dobro', '2026-11-03-cobranca-dobro-story'):
        x['ativo'] = False
    if x['id'] == '2026-11-02-desconexao-video':
        x['id'], x['quando'] = '2026-11-04-desconexao-video', '2026-11-04T18:00:00-03:00'
    if x['id'] == '2026-11-02-desconexao-video-story':
        x['id'], x['quando'] = '2026-11-04-desconexao-video-story', '2026-11-04T18:05:00-03:00'
ids = {'2026-11-03-split-video', '2026-11-03-split-video-story'}
ag['posts'] = [x for x in ag['posts'] if x['id'] not in ids] + [
    {'id': '2026-11-03-split-video', 'quando': '2026-11-03T18:00:00-03:00', 'tipo': 'reels', 'midia': ['v27/split_payment.mp4'],
     'legenda': LEG, 'capa_ms': 1600, 'ativo': True},
    {'id': '2026-11-03-split-video-story', 'quando': '2026-11-03T18:05:00-03:00', 'tipo': 'story', 'midia': ['v27/split_story.jpg'], 'ativo': True},
]
ag['posts'].sort(key=lambda a: a['quando'])
json.dump(ag, open(p, 'w'), ensure_ascii=False, indent=2)
print('agenda atualizada;', len(LEG), 'caracteres')
