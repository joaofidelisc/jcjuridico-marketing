"""Post de 31/10/2026: posse do presidente em 5/1 e dos governadores em 6/1 (EC 111/2021, primeira vez em 2027). Neutro."""
import os, sys
sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
O = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'v20')
P.hero_number(dict(kicker='VOCÊ SABIA?', number='5/1', unit='NOVA DATA DA POSSE', num_size=330,
                   title='Acabou a posse em **1º de janeiro**',
                   sub='Pela EC 111/2021, a partir de 2027 o presidente toma posse em 5 de janeiro e os governadores, em 6 de janeiro.',
                   dark=True), f'{O}/posse_31.png')
from PIL import Image
Image.open(f'{O}/posse_31.png').convert('RGB').save(f'{O}/posse_31.jpg', quality=92)
print('ok')
