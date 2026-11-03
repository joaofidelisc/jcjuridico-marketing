"""Reels "pensão acaba aos 18?" (Ana, Carlos e o filho) no lugar do carrossel da pensão: 04/11 às 19h, story às 19h05."""
import json
import os
import subprocess
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image, ImageDraw

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
V28 = os.path.join(RAIZ, 'v28')
cap = os.path.join(V28, 'capa.png')
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '1.9', '-i', os.path.join(V28, 'pensao_18.mp4'), '-frames:v', '1', cap], check=True)
st = Image.open(cap).convert('RGB').resize((1080, 1920))
P.pill(st, 540, 1500, 'NOVO REELS NO FEED', fill=P.WHITE, fg=P.NAVY, size=34, padx=46, pady=22, weight='ExtraBold')
ImageDraw.Draw(st).text((540, 1590), '@jcjuridico.br', font=P.font(34, 'Bold'), fill=P.ICE, anchor='mm')
st.save(os.path.join(V28, 'pensao_story.jpg'), 'JPEG', quality=90)
os.remove(cap)

LEG = ("O filho fez 18 anos. A pensão acaba automaticamente?\n\n"
       "Não. Completar 18 anos não encerra a pensão sozinho. Segundo o STJ, o cancelamento da pensão do filho que atingiu a maioridade "
       "depende de decisão judicial, e o filho tem o direito de se manifestar.\n\n"
       "Atenção:\n"
       "• Se o filho ainda estuda (faculdade ou curso técnico), a Justiça costuma manter a pensão, conforme o caso.\n"
       "• Parar de pagar por conta própria não apaga a dívida: as parcelas continuam vencendo.\n"
       "• Atraso de pensão pode levar à prisão civil.\n\n"
       "Base legal: STJ, Súmula 358; Código Civil, arts. 1.694 e 1.695; CPC, art. 528, §§ 3º e 7º.\n\n"
       "Cada caso tem detalhes. Procure um advogado de sua confiança.\n\n"
       "Salve este vídeo e mande para quem acha que a pensão acaba no aniversário.\n\n"
       "#pensaoalimenticia #direitodefamilia #direito #vocesabia #familia #advocacia #advogado")

p = os.path.join(RAIZ, 'agendador', 'agenda.json')
ag = json.load(open(p, encoding='utf-8'))
for x in ag['posts']:
    if x['id'] in ('2026-11-04-pensao-18', '2026-11-04-pensao-18-story'):
        x['ativo'] = False
ids = {'2026-11-04-pensao-video', '2026-11-04-pensao-video-story'}
ag['posts'] = [x for x in ag['posts'] if x['id'] not in ids] + [
    {'id': '2026-11-04-pensao-video', 'quando': '2026-11-04T19:00:00-03:00', 'tipo': 'reels', 'midia': ['v28/pensao_18.mp4'],
     'legenda': LEG, 'capa_ms': 1900, 'ativo': True},
    {'id': '2026-11-04-pensao-video-story', 'quando': '2026-11-04T19:05:00-03:00', 'tipo': 'story', 'midia': ['v28/pensao_story.jpg'], 'ativo': True},
]
ag['posts'].sort(key=lambda a: a['quando'])
json.dump(ag, open(p, 'w'), ensure_ascii=False, indent=2)
print('agenda atualizada;', len(LEG), 'caracteres')
