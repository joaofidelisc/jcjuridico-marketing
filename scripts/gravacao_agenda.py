"""Publica o vídeo "gravei escondido" (Reels) hoje às 18h pelo agendador e move o post do flagrante para 23/11 (19h)."""
import json
import os
import subprocess
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image, ImageDraw

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(RAIZ, 'video', 'projeto', 'out', 'gravacao-escondido-v2.mp4')
V25 = os.path.join(RAIZ, 'v25')
os.makedirs(V25, exist_ok=True)
DEST = os.path.join(V25, 'gravacao_escondido.mp4')
subprocess.run(['cp', SRC, DEST], check=True)

# Story com o quadro da capa (1,9 s) + chamada
cap = os.path.join(V25, 'capa.png')
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '1.9', '-i', DEST, '-frames:v', '1', cap], check=True)
st = Image.open(cap).convert('RGB').resize((1080, 1920))
P.pill(st, 540, 1500, 'NOVO REELS NO FEED', fill=P.WHITE, fg=P.NAVY, size=34, padx=46, pady=22, weight='ExtraBold')
d = ImageDraw.Draw(st)
d.text((540, 1590), '@jcjuridico.br', font=P.font(34, 'Bold'), fill=P.ICE, anchor='mm')
st.save(os.path.join(V25, 'gravacao_story.jpg'), 'JPEG', quality=90)
os.remove(cap)

LEG = ("Gravei a conversa sem a pessoa saber. Vale como prova?\n\n"
       "Na maioria dos casos, vale. Para o STF (Tema 237), a gravação feita por quem participa da conversa é prova lícita, mesmo sem avisar o outro.\n\n"
       "Mas atenção:\n"
       "• Só vale se você participa da conversa. Gravar a conversa dos outros, sem estar nela, pode dar problema.\n"
       "• Sigilo profissional e processo eleitoral têm regra própria.\n"
       "• Usar como prova é uma coisa. Divulgar o áudio na internet pode gerar indenização.\n\n"
       "Base legal: STF, RE 583.937 (Tema 237); CF, art. 5º, X; Código Civil, arts. 186 e 927.\n\n"
       "Cada caso tem detalhes. Procure um advogado de sua confiança.\n\n"
       "Salve este vídeo e mande para quem vive dizendo \"eu gravei\".\n\n"
       "#direito #vocesabia #provas #gravacao #direitos #advocacia #advogado")

p = os.path.join(RAIZ, 'agendador', 'agenda.json')
ag = json.load(open(p, encoding='utf-8'))
posts = ag['posts']
# 1) flagrante vai para 23/11 19h; o V/F de gravar conversa (23/11) sai, porque o vídeo cobre o tema
for x in posts:
    if x['id'] == '2026-11-23-gravar-conversa' or x['id'] == '2026-11-23-gravar-conversa-story':
        x['ativo'] = False
    if x['id'] == '2026-11-01-flagrante':
        x['id'], x['quando'] = '2026-11-23-flagrante', '2026-11-23T19:00:00-03:00'
    if x['id'] == '2026-11-01-flagrante-story':
        x['id'], x['quando'] = '2026-11-23-flagrante-story', '2026-11-23T19:02:00-03:00'
# 2) vídeo de hoje
ids = {'2026-11-01-gravacao-video', '2026-11-01-gravacao-video-story'}
ag['posts'] = [x for x in posts if x['id'] not in ids] + [
    {'id': '2026-11-01-gravacao-video', 'quando': '2026-11-01T18:00:00-03:00', 'tipo': 'reels', 'midia': ['v25/gravacao_escondido.mp4'],
     'legenda': LEG, 'capa_ms': 1900, 'ativo': True},
    {'id': '2026-11-01-gravacao-video-story', 'quando': '2026-11-01T18:05:00-03:00', 'tipo': 'story', 'midia': ['v25/gravacao_story.jpg'], 'ativo': True},
]
ag['posts'].sort(key=lambda a: a['quando'])
json.dump(ag, open(p, 'w'), ensure_ascii=False, indent=2)
print('agenda atualizada')
