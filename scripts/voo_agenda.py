"""Reels "voo atrasado: direitos hora a hora" (Ana e Carlos) em 06/11 às 18h, story às 18h05. O post "golpe do Pix" das 19h continua."""
import json
import os
import subprocess
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image, ImageDraw

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
V29 = os.path.join(RAIZ, 'v29')
cap = os.path.join(V29, 'capa.png')
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '1.9', '-i', os.path.join(V29, 'voo_atrasado.mp4'), '-frames:v', '1', cap], check=True)
st = Image.open(cap).convert('RGB').resize((1080, 1920))
P.pill(st, 540, 1500, 'NOVO REELS NO FEED', fill=P.WHITE, fg=P.NAVY, size=34, padx=46, pady=22, weight='ExtraBold')
ImageDraw.Draw(st).text((540, 1590), '@jcjuridico.br', font=P.font(34, 'Bold'), fill=P.ICE, anchor='mm')
st.save(os.path.join(V29, 'voo_story.jpg'), 'JPEG', quality=90)
os.remove(cap)

LEG = ("Voo atrasado? A companhia aérea tem obrigações, e elas aumentam a cada hora.\n\n"
       "• Mais de 1 hora: comunicação (internet, telefone).\n"
       "• Mais de 2 horas: alimentação (voucher ou refeição).\n"
       "• Mais de 4 horas: hospedagem, se houver pernoite, e transporte de ida e volta.\n"
       "• Atraso de mais de 4 horas: você escolhe entre reacomodação em outro voo, reembolso integral ou outro meio de transporte.\n\n"
       "Guarde cartão de embarque, notas e prints. Se houve prejuízo, pode caber indenização, conforme o caso.\n\n"
       "Base legal: Resolução ANAC 400/2016, arts. 21 e 27; CDC, art. 14.\n\n"
       "Cada caso tem detalhes. Procure um advogado de sua confiança.\n\n"
       "Salve este vídeo e marque quem vai viajar no fim do ano.\n\n"
       "#voo #anac #direitodoconsumidor #viagem #vocesabia #direito #advocacia")

p = os.path.join(RAIZ, 'agendador', 'agenda.json')
ag = json.load(open(p, encoding='utf-8'))
ids = {'2026-11-06-voo-video', '2026-11-06-voo-video-story'}
ag['posts'] = [x for x in ag['posts'] if x['id'] not in ids] + [
    {'id': '2026-11-06-voo-video', 'quando': '2026-11-06T18:00:00-03:00', 'tipo': 'reels', 'midia': ['v29/voo_atrasado.mp4'],
     'legenda': LEG, 'capa_ms': 1900, 'ativo': True},
    {'id': '2026-11-06-voo-video-story', 'quando': '2026-11-06T18:05:00-03:00', 'tipo': 'story', 'midia': ['v29/voo_story.jpg'], 'ativo': True},
]
ag['posts'].sort(key=lambda a: a['quando'])
json.dump(ag, open(p, 'w'), ensure_ascii=False, indent=2)
print('agenda atualizada;', len(LEG), 'caracteres')
