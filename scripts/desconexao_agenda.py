"""Reels "mensagem do chefe fora do horário" em 02/11 às 18h (story 18h05) pelo agendador; o carrossel de herança das 19h sai da agenda."""
import json
import os
import subprocess
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image, ImageDraw

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(RAIZ, 'video', 'projeto', 'out', 'desconexao-chefe.mp4')
V26 = os.path.join(RAIZ, 'v26')
os.makedirs(V26, exist_ok=True)
DEST = os.path.join(V26, 'desconexao_chefe.mp4')
subprocess.run(['cp', SRC, DEST], check=True)

cap = os.path.join(V26, 'capa.png')
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '2.3', '-i', DEST, '-frames:v', '1', cap], check=True)
st = Image.open(cap).convert('RGB').resize((1080, 1920))
P.pill(st, 540, 1500, 'NOVO REELS NO FEED', fill=P.WHITE, fg=P.NAVY, size=34, padx=46, pady=22, weight='ExtraBold')
ImageDraw.Draw(st).text((540, 1590), '@jcjuridico.br', font=P.font(34, 'Bold'), fill=P.ICE, anchor='mm')
st.save(os.path.join(V26, 'desconexao_story.jpg'), 'JPEG', quality=90)
os.remove(cap)

LEG = ("O chefe mandou mensagem às 22h47. Você é obrigado a responder?\n\n"
       "Em regra, não. Fora do expediente, o seu tempo é seu.\n\n"
       "Mas atenção:\n"
       "• Se a empresa cobra resposta e você trabalha depois do horário, esse tempo pode virar hora extra, com adicional de no mínimo 50%.\n"
       "• Ficar de plantão, esperando ser chamado, pode caracterizar sobreaviso, que pode ser pago à parte.\n"
       "• Guarde os prints, com dia e hora: quem pede o direito precisa provar os fatos.\n\n"
       "Base legal: CF, art. 7º, XIII e XVI; CLT, art. 6º (parágrafo único), art. 66 e art. 818; TST, Súmula 428.\n\n"
       "Cada caso tem detalhes. Procure um advogado de sua confiança.\n\n"
       "Salve este vídeo e mande para quem nunca desliga o WhatsApp do trabalho.\n\n"
       "#direitododtrabalho #direitotrabalhista #horaextra #sobreaviso #vocesabia #clt #advocacia")
LEG = LEG.replace('#direitododtrabalho', '#direitodotrabalho')

p = os.path.join(RAIZ, 'agendador', 'agenda.json')
ag = json.load(open(p, encoding='utf-8'))
for x in ag['posts']:
    if x['id'] in ('2026-11-02-heranca-mitos', '2026-11-02-heranca-mitos-story'):
        x['ativo'] = False
ids = {'2026-11-02-desconexao-video', '2026-11-02-desconexao-video-story'}
ag['posts'] = [x for x in ag['posts'] if x['id'] not in ids] + [
    {'id': '2026-11-02-desconexao-video', 'quando': '2026-11-02T18:00:00-03:00', 'tipo': 'reels', 'midia': ['v26/desconexao_chefe.mp4'],
     'legenda': LEG, 'capa_ms': 2300, 'ativo': True},
    {'id': '2026-11-02-desconexao-video-story', 'quando': '2026-11-02T18:05:00-03:00', 'tipo': 'story', 'midia': ['v26/desconexao_story.jpg'], 'ativo': True},
]
ag['posts'].sort(key=lambda a: a['quando'])
json.dump(ag, open(p, 'w'), ensure_ascii=False, indent=2)
print('agenda atualizada;', len(LEG), 'caracteres na legenda')
