"""Calendário de novembro/2026: 20 posts (imagens e carrosséis) no estilo v2 da skill jc-juridico-posts.

Baseado no conteúdo de outubro (cálculos, gestão, AdvogAI, parceiros, planos), com novidades
(relatório em PDF com a marca do escritório, §14 do BPC/LOAS) e datas de novembro
(Consciência Negra, Black Friday, 1ª parcela do 13º).

Saída: v21/<dia>_<nome>[_NN].png. Todos os dados de prints e do PDF são fictícios.
"""
import os
import sys

sys.path.insert(0, '/home/cardozo/.claude/skills/jc-juridico-posts/scripts')
import jc_post2 as P
from PIL import Image, ImageDraw, ImageFilter

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
O = os.path.join(RAIZ, 'v21')
TELAS = os.path.join(RAIZ, 'video', 'projeto', 'public', 'telas')
AVATAR = os.path.join(RAIZ, 'video', 'projeto', 'public', 'advogai', 'avatar-sem-fundo.png')
PDF = os.path.join(RAIZ, 'v21', 'fontes', 'pdf-demo.png')  # relatório de demonstração (dados fictícios)
os.makedirs(O, exist_ok=True)
T = lambda n: os.path.join(TELAS, n)
W, H = P.W, P.H

CR = (216, 60, 1568, 737)
AG = (292, 145, 1536, 730)
FIN = (216, 60, 1568, 740)
DASH = (216, 60, 1568, 784)


def cores(dark):
    return dict(tc=P.WHITE if dark else P.NAVY, sub=(214, 224, 246) if dark else P.GRAY, hl=P.BORDO_L if dark else P.BORDO,
                bold=P.WHITE if dark else P.BORDO, kick=P.ICE if dark else P.BORDO)


def fundo(bg):
    return P.background('dark' if bg == 'dark' else bg)


def cabecalho(img, spec, dark, y=280):
    c = cores(dark)
    if spec.get('kicker'):
        P.kicker(img, 70, y - 8, spec['kicker'], c['kick'], 24)
        y += 46
    y = P.rich(img, 70, y, spec['title'], spec.get('size', 66), W - 140, c['tc'], c['hl'], P.WHITE, caps=True, lh=1.2)
    if spec.get('sub'):
        y = P.para(img, 70, y + 14, spec['sub'], spec.get('sub_size', 30), W - 140, c['sub'], bold_color=c['bold'])
    if spec.get('callout'):
        y = P.callout(img, 70, y + 22, W - 140, spec['callout'], dark)
    return y


def rodape(img, spec, dark):
    if spec.get('cta'):
        P.pill(img, W // 2, H - 205, spec['cta'], fill=P.WHITE if dark else P.BORDO, fg=P.NAVY if dark else P.WHITE, size=28, padx=48,
               pady=20, weight='ExtraBold')
    P.footer(img, dark, right=spec.get('right'))
    if spec.get('swipe'):
        P.swipe(img, dark)


def texto(spec, out):
    """Título alinhado à esquerda + arte (print em cartão, notebook, ícone ou avatar) no espaço livre."""
    bg = spec.get('bg', 'pearl')
    dark = bg == 'dark'
    img = fundo(bg)
    P.top_logo(img, dark, 'left', 120)
    if spec.get('num'):
        ImageDraw.Draw(img).text((W - 70, 120), spec['num'], font=P.font(210, 'Black'), fill=(30, 62, 130) if dark else (232, 226, 214), anchor='ra')
    y = cabecalho(img, spec, dark, spec.get('y', 280))
    bottom = H - 150 - (110 if (spec.get('cta') or spec.get('swipe')) else 0)
    top = y + 40
    if spec.get('card'):
        shot, crop = spec['card']
        s = Image.open(shot)
        cw, ch = (crop[2] - crop[0], crop[3] - crop[1]) if crop else s.size
        w = min(spec.get('card_w', 820), int((bottom - top - 20) * cw / ch))
        hh = int(ch * w / cw)
        P.card_shot(img, shot, crop, (W - w) // 2, top + max(0, (bottom - top - hh) // 2), w, border=(226, 229, 240) if not dark else None)
    elif spec.get('shot'):
        # tela 16:10 + moldura e base (~60 px): largura limitada pelo espaço até o rodapé
        w = min(spec.get('shot_w', 800), int((bottom - top - 70) * 1.6))
        P.laptop(img, spec['shot'], spec.get('crop'), W // 2, top + max(0, (bottom - top - 70 - int(w / 1.6)) // 2), w)
    elif spec.get('avatar'):
        av = Image.open(AVATAR).convert('RGBA')
        bb = av.getbbox()
        av = av.crop(bb)
        hh = min(bottom - top, spec.get('avatar_h', 520))
        av = av.resize((int(av.width * hh / av.height), hh), Image.LANCZOS)
        img.paste(av, (spec.get('avatar_x', W - av.width - 40), bottom - hh + 30), av)
    elif spec.get('icon'):
        free = bottom - top
        r = min(spec.get('icon_r', 115), int(free / 2 / 1.6))
        if r >= 55:
            if dark:
                P.icon_art(img, spec['icon'], W // 2, top + free // 2, r)
            else:
                P.icon_art(img, spec['icon'], W // 2, top + free // 2, r, color=P.WHITE, fill=P.NAVY, ringcolor=P.NAVY)
    rodape(img, spec, dark)
    img.save(out)
    return img


def lista(spec, out):
    """Lista de itens em cartões (claro ou escuro), com número ou check à esquerda."""
    bg = spec.get('bg', 'pearl')
    dark = bg == 'dark'
    img = fundo(bg)
    P.top_logo(img, dark, 'left', 120)
    if spec.get('num'):
        d = ImageDraw.Draw(img)
        d.text((W - 70, 120), spec['num'], font=P.font(210, 'Black'), fill=(30, 62, 130) if dark else (232, 226, 214), anchor='ra')
    y = cabecalho(img, spec, dark, spec.get('y', 300)) + 34
    items = spec['items']
    bottom = H - 150 - (110 if (spec.get('cta') or spec.get('swipe')) else 0)
    gap = 18
    ih = min(spec.get('max_h', 150), (bottom - y - gap * (len(items) - 1)) // len(items))
    y += max(0, (bottom - y - (ih * len(items) + gap * (len(items) - 1))) // 2)
    for i, it in enumerate(items):
        t, sub = it if isinstance(it, tuple) else (it, None)
        box = (70, y, W - 70, y + ih)
        if dark:
            lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(lay).rounded_rectangle(box, 22, fill=(255, 255, 255, 20), outline=(255, 255, 255, 60), width=2)
            img.paste(lay, (0, 0), lay)
        else:
            P.shadowed(img, box, 22, fill=P.WHITE, shadow=(10, 20, 60, 40), blur=16, dy=8, outline=(226, 228, 238))
        d = ImageDraw.Draw(img)
        cx, cy, r = 70 + 30 + 26, y + ih // 2, 26
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=P.BORDO_L if dark else P.NAVY)
        mark = spec.get('marks', 'num')
        if mark == 'num':
            d.text((cx, cy), str(i + 1), font=P.font(26, 'ExtraBold'), fill=P.WHITE, anchor='mm')
        else:
            d.line([(cx - 11, cy + 1), (cx - 3, cy + 9), (cx + 12, cy - 8)], fill=P.WHITE, width=5, joint='curve')
        tx = cx + r + 28
        ts = spec.get('item_size', 31)
        if sub:
            d.text((tx, cy - 20), t, font=P.font(ts, 'ExtraBold'), fill=P.WHITE if dark else P.NAVY, anchor='lm')
            d.text((tx, cy + 22), sub, font=P.font(23, 'Regular'), fill=(190, 204, 232) if dark else P.GRAY, anchor='lm')
        else:
            d.text((tx, cy), t, font=P.font(ts, 'Bold'), fill=P.WHITE if dark else P.NAVY, anchor='lm')
        y += ih + gap
    rodape(img, spec, dark)
    img.save(out)


def passo_icone(n, title, sub, callout, icon, dark, right, out):
    """Slide de passo (layout step) com ícone desenhado embaixo, sem encostar no texto."""
    texto(dict(bg='dark' if dark else 'pearl', num=n, y=300, title=title, size=64, sub=sub, callout=callout, icon=icon, icon_r=100, right=right), out)


def cupom(path, cy):
    """Cupom (ticket) navy com picote e código 'DR.SEUNOME' (mesmo desenho do carrossel de parceiros)."""
    img = Image.open(path).convert('RGB')
    w, h = 820, 270
    x0, y0 = (W - w) // 2, cy - h // 2
    sombra = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sombra).rounded_rectangle((x0 + 6, y0 + 22, x0 + w + 6, y0 + h + 22), 34, fill=(14, 29, 63, 70))
    sombra = sombra.filter(ImageFilter.GaussianBlur(22))
    img.paste(sombra, (0, 0), sombra)
    camada = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(camada)
    d.rounded_rectangle((x0, y0, x0 + w, y0 + h), 34, fill=P.NAVY + (255,))
    fundo_px = img.getpixel((x0 - 30, cy))
    xp = x0 + 210
    d.ellipse((xp - 26, y0 - 26, xp + 26, y0 + 26), fill=fundo_px + (255,))
    d.ellipse((xp - 26, y0 + h - 26, xp + 26, y0 + h + 26), fill=fundo_px + (255,))
    for yy in range(y0 + 40, y0 + h - 36, 22):
        d.line((xp, yy, xp, yy + 11), fill=(150, 170, 210, 255), width=4)
    img.paste(camada, (0, 0), camada)
    d = ImageDraw.Draw(img)
    cx = x0 + 105
    d.ellipse((cx - 54, cy - 54, cx + 54, cy + 54), outline=(150, 190, 250), width=6)
    d.text((cx, cy + 2), '%', font=P.font(72, 'ExtraBold'), fill=P.WHITE, anchor='mm')
    tx = xp + 44
    d.text((tx, cy - 92), 'SEU CUPOM EXCLUSIVO', font=P.font(24, 'Bold'), fill=(150, 190, 250))
    d.text((tx, cy - 56), 'DR.SEUNOME', font=P.font(62, 'Black'), fill=P.WHITE)
    d.line((tx, cy + 26, x0 + w - 44, cy + 26), fill=(60, 90, 150), width=2)
    d.text((tx, cy + 42), 'Desconto para quem assina', font=P.font(25, 'Medium'), fill=(214, 224, 246))
    d.text((tx, cy + 76), 'e comissão para você', font=P.font(25, 'Medium'), fill=(214, 224, 246))
    img.save(path)


def balões(path, perguntas, x, y, w):
    """Perguntas em balões de conversa (lado esquerdo), para o post da AdvogAI."""
    img = Image.open(path).convert('RGB')
    f = P.font(25, 'SemiBold')
    for q in perguntas:
        d = ImageDraw.Draw(img)
        linhas = P._wrap(d, q, f, w - 56)
        h = 34 + len(linhas) * 34
        P.shadowed(img, (x, y, x + w, y + h), 24, fill=P.WHITE, shadow=(10, 20, 60, 45), blur=14, dy=8, outline=(226, 228, 238))
        d = ImageDraw.Draw(img)
        d.polygon([(x + 30, y + h - 2), (x + 54, y + h - 2), (x + 26, y + h + 22)], fill=P.WHITE)
        for i, l in enumerate(linhas):
            d.text((x + 28, y + 34 + i * 34), l, font=f, fill=P.NAVY, anchor='lm')
        y += h + 40
    img.save(path)


def numero_grande(spec, out):
    """Número de destaque (ex.: valor em reais) ajustado à largura, com selo logo abaixo e espaçamento medido."""
    img = P.background('dark')
    P.top_logo(img, True, 'left', 120)
    d = ImageDraw.Draw(img)
    d.text((W // 2, 420), ' '.join(spec['kicker'].upper()), font=P.font(26, 'Bold'), fill=P.ICE, anchor='mm')
    size = 260
    while d.textlength(spec['number'], font=P.font(size, 'Black')) > W - 140:
        size -= 6
    f = P.font(size, 'Black')
    bb = d.textbbox((W // 2, 480), spec['number'], font=f, anchor='mt')
    d.text((W // 2 + 7, 489), spec['number'], font=f, fill=(4, 10, 30), anchor='mt')
    d.text((W // 2, 480), spec['number'], font=f, fill=P.WHITE, anchor='mt')
    y = bb[3] + 70
    P.pill(img, W // 2, y, spec['unit'], fill=P.BORDO_L, fg=P.WHITE, size=36, padx=48, pady=20, weight='ExtraBold')
    y = P.rich(img, 80, y + 80, spec['title'], 56, W - 160, P.WHITE, P.BORDO_L, P.WHITE, align='center', caps=True)
    for i, linha in enumerate(spec['sub'].split('\n')):  # quebras manuais (valores em reais não podem quebrar)
        d.text((W // 2, y + 40 + i * 42), linha, font=P.font(29, 'Regular'), fill=(214, 224, 246), anchor='mm')
    P.footer(img, True)
    img.save(out)


def sl(n, total):
    return f'{n}/{total}  ·  Deslize  →'


# ─── 03/11 (ter) · Carrossel: relatório em PDF com a marca do escritório (pérola) ──────────────
def post_pdf():
    k = '03_pdf'
    texto(dict(bg='pearl', kicker='NOVIDADE NO JC JURÍDICO', title='Relatório em PDF **com a marca do seu escritório**', size=58,
               sub='Logotipo, cliente, processo e assinatura em **todos os cálculos.**',
               card=(PDF, (60, 0, 1180, 660)), card_w=860, swipe=True), f'{O}/{k}_01.png')
    slides = [
        ('LOGOTIPO E **NOME DO ESCRITÓRIO**', 'O logotipo cadastrado em Equipe aparece no topo de todos os relatórios, também para os membros da equipe.', (60, 0, 1180, 618)),
        ('CLIENTE, PROCESSO **E RESPONSÁVEL**', 'Informe o cliente e o número do processo antes de exportar. O responsável sai com a OAB formatada.', (100, 285, 1140, 615)),
        ('RESULTADO **ITEM A ITEM**', 'Os dados informados e cada verba do cálculo, com o total em destaque e a fundamentação legal.', (100, 625, 1140, 1240)),
        ('ASSINATURA **COM OAB**', 'Data, linha de assinatura, nome do advogado, OAB e escritório no fim do relatório.', (100, 1250, 1140, 1540)),
    ]
    for i, (t, sub, crop) in enumerate(slides):
        texto(dict(bg='pearl', title=t, sub=sub, size=58, card=(PDF, crop), card_w=940, right=sl(i + 1, 4)), f'{O}/{k}_{i + 2:02d}.png')
    P.statement(dict(bg='pearl', title='Vale para **todos os cálculos**', sub='Previdenciários, trabalhistas, cíveis, tributários, bancários e penais. Basta clicar em **Exportar PDF** no resultado.',
                     icon='doc', icon_r=105, cta='CONHEÇA · LINK NA BIO'), f'{O}/{k}_06.png')


# ─── 04/11 (qua) · Carrossel: os 18 cálculos (escuro) ─────────────────────────────────────────
def post_calculos():
    k = '04_calculos'
    P.hero_number(dict(number='18', unit='CÁLCULOS', title='Prontos para usar **no seu escritório**', sub='Deslize e veja quais são, área por área.',
                       swipe=True, num_size=380, dark=True), f'{O}/{k}_01.png')
    areas = [
        ('PREVIDENCIÁRIO · 6', 'Do CNIS **à liquidação**', ['Análise Previdenciária (CNIS)', 'Planejamento Previdenciário - RGPS', 'Liquidação de Sentença',
                                                              'Contribuições em Atraso ao INSS', 'BPC/LOAS', 'Descontos indevidos (Fraude INSS)']),
        ('TRABALHISTA · 4', 'Da rescisão **ao ponto**', ['Rescisão do Contrato', 'Horas Extras e Reflexos', 'Apuração do Ponto', 'Revisão do FGTS']),
        ('CÍVEL E BANCÁRIO · 4', 'Débitos, pensão **e tarifas**', ['Atualização de Débitos', 'Pensão Alimentícia', 'Parcelamento art. 916 CPC', 'Tarifas abusivas']),
        ('TRIBUTÁRIO E PENAL · 4', 'Tributos **e dosimetria**', ['Ações Tributárias', 'Fazenda Pública', 'Comparação de Regimes', 'Dosimetria da Pena']),
    ]
    for i, (kick, t, items) in enumerate(areas):
        lista(dict(bg='dark', kicker=kick, title=t, size=62, items=items, marks='check', max_h=118, right=sl(i + 1, 4)), f'{O}/{k}_{i + 2:02d}.png')
    P.statement(dict(bg='dark', title='Todos com **relatório em PDF**', sub='Cada cálculo gera um relatório com a marca do seu escritório, pronto para o cliente.',
                     icon='calc', icon_r=110, cta='TESTE GRÁTIS · LINK NA BIO'), f'{O}/{k}_06.png')


# ─── Posts únicos ──────────────────────────────────────────────────────────────────────────────
def unicos():
    # 05/11 (qui) · BPC/LOAS e o §14 (branco)
    texto(dict(bg='white', kicker='BPC/LOAS · ART. 20, §14', title='Benefício de até 1 salário mínimo **fica fora da conta**',
               sub='O BPC ou benefício previdenciário de até 1 salário mínimo pago a **idoso com 65 anos ou mais ou a pessoa com deficiência** do grupo familiar não entra no cálculo da renda per capita.',
               callout='Marque o membro que recebe esse benefício e veja a renda considerada no resultado.', icon='users', icon_r=95), f'{O}/05_bpc.png')
    # 06/11 (sex) · Engajamento (escuro)
    P.statement(dict(bg='dark', kicker='CONTE PARA NÓS', title='Qual cálculo **mais toma o seu tempo?**',
                     sub='Rescisão, BPC/LOAS, atualização de débitos ou contribuições em atraso? **Responda nos comentários.**', icon='clock', icon_r=110),
                f'{O}/06_pergunta.png')
    # 09/11 (seg) · Agenda (pérola, notebook)
    texto(dict(bg='pearl', kicker='SEGUNDA-FEIRA', title='Comece a semana **com a agenda em dia**', sub='Prazos, audiências e consultas em um só calendário, com visão por **dia, semana ou mês.**',
               shot=T('agenda_s1.jpg'), crop=AG, shot_w=860), f'{O}/09_agenda.png')
    # 11/11 (qua) · AdvogAI (pérola, avatar + perguntas)
    texto(dict(bg='pearl', kicker='ADVOGAI', title='Pergunte **para a AdvogAI**', size=70,
               sub='A assistente do JC Jurídico responde dúvidas sobre **cálculos, prazos e legislação.**',
               avatar=True, avatar_h=600, avatar_x=520), f'{O}/11_advogai.png')
    balões(f'{O}/11_advogai.png', ['Explique o resultado deste cálculo de rescisão.', 'Quais compromissos tenho esta semana?',
                                   'Cadastre a cliente Maria Santos.'], 70, 700, 470)
    # 12/11 (qui) · 52 modelos (escuro)
    P.hero_number(dict(number='52', unit='MODELOS', title='Prontos para **adaptar e protocolar**',
                       sub='Petições, contratos, procurações e recursos na Biblioteca de Modelos.', num_size=400, dark=True), f'{O}/12_modelos.png')
    # 13/11 (sex) · Parceiros (pérola, cupom)
    capa = f'{O}/13_parceiros.png'
    P.statement(dict(bg='pearl', kicker='PROGRAMA DE PARCEIROS', title='Já usa o JC Jurídico? **Indique e ganhe.**', size=76,
                     sub='Cupom com o seu nome, desconto na sua assinatura e **comissão a cada indicação.**', cta='CHAME A GENTE NO DIRECT'), capa)
    cupom(capa, 915)
    # 16/11 (seg) · Checklist de segunda (branco)
    P.checklist(dict(bg='white', kicker='ROTINA DO ESCRITÓRIO', title='Checklist **de segunda-feira**', sub='Quatro pontos para revisar antes de começar a semana.',
                     items=[('calendar', 'Prazos da semana', 'Audiências, perícias e prazos processuais.'),
                            ('users', 'Retornos pendentes', 'Contatos que aguardam resposta no funil.'),
                            ('chart', 'Contas a receber', 'Honorários e parcelas em aberto.'),
                            ('doc', 'Documentos dos clientes', 'O que falta para protocolar.')]), f'{O}/16_checklist.png')
    # 17/11 (ter) · Financeiro (escuro, notebook)
    texto(dict(bg='dark', kicker='FINANCEIRO', title='Quanto o escritório **lucrou este mês?**', sub='Receitas, despesas, lucro líquido e valores a receber **em um só painel.**',
               shot=T('financeiro.jpg'), crop=FIN, shot_w=860), f'{O}/17_financeiro.png')
    # 19/11 (qui) · Marketplace (escuro, formulário)
    texto(dict(bg='dark', kicker='MARKETPLACE', title='Precisa de **correspondente** em outra cidade?',
               sub='Publique a demanda com tipo de serviço, cidade, prazo e valor e acompanhe tudo em **Minhas Demandas.**',
               card=(T('marketplace_form.jpg'), (567, 102, 1000, 686)), card_w=560), f'{O}/19_marketplace.png')
    # 20/11 (sex) · Dia Nacional de Zumbi e da Consciência Negra (editorial, sem venda)
    PAL = dict(bg=(250, 248, 244), ink=P.NAVY, accent=P.BORDO, sage=(240, 226, 229), hl=(240, 226, 229), wm=(238, 234, 226),
               text=P.GRAY, line=(214, 218, 230))
    P.editorial(dict(kicker='20 de novembro', title='Dia Nacional de Zumbi e da **Consciência Negra**', size=78, mark='20', mark_size=330,
                     sub='Feriado nacional desde 2024, a data lembra que a igualdade racial também se constrói na advocacia, com a aplicação do '
                         '**Estatuto da Igualdade Racial** e o combate ao racismo e à injúria racial.'), f'{O}/20_consciencia.png', PAL)
    # 23/11 (seg) · Funil Jurídico (escuro, resultado)
    texto(dict(bg='dark', kicker='FUNIL JURÍDICO', title='Sem ideia do que **postar esta semana?**',
               sub='Informe suas áreas de atuação e o seu público e receba um **planejamento de conteúdo** para o perfil do escritório.',
               card=(T('funil_result.jpg'), (0, 0, 772, 640)), card_w=640), f'{O}/23_funil.png')
    # 24/11 (ter) · Painel geral (pérola, notebook)
    texto(dict(bg='pearl', kicker='PAINEL', title='O escritório inteiro **em uma tela**', sub='Casos ativos, receita do mês, clientes e próximos compromissos **no mesmo painel.**',
               shot=T('dashboard.jpg'), crop=DASH, shot_w=860), f'{O}/24_painel.png')
    # 25/11 (qua) · CNIS (escuro, lista)
    lista(dict(bg='dark', kicker='DIREITO PREVIDENCIÁRIO', title='O que conferir **no CNIS** do cliente', size=62,
               sub='Antes do pedido ou do planejamento, revise estes pontos.',
               items=[('Vínculos sem data de fim', 'Podem exigir CTPS, ficha ou rescisão.'),
                      ('Remunerações em branco', 'Meses sem salário de contribuição informado.'),
                      ('Indicadores de pendência', 'Siglas que pedem acerto antes da contagem.'),
                      ('Recolhimentos em atraso', 'Contribuinte individual pago fora do prazo.')], max_h=140), f'{O}/25_cnis.png')
    # 26/11 (qui) · Equipe (pérola)
    P.statement(dict(bg='pearl', kicker='EQUIPE', title='Escritório com equipe? **Todos no mesmo sistema**',
                     sub='Até 10 usuários, conforme o plano, com o **logotipo do escritório** nos relatórios de todos.', icon='users', icon_r=110),
                f'{O}/26_equipe.png')
    # 27/11 (sex) · Black Friday (escuro): economia real do plano anual, sem desconto inventado
    numero_grande(dict(kicker='BLACK FRIDAY', number='R$ 1.080', unit='DE ECONOMIA POR ANO', title='no **plano anual** do JC Jurídico',
                       sub='Plano Avançado: 12x de R$ 199 no anual,\ncontra R$ 289/mês no mensal.\nNo Profissional, a economia é de R$ 720 por ano.'),
                  f'{O}/27_blackfriday.png')
    # 30/11 (seg) · 1ª parcela do 13º (branco)
    texto(dict(bg='white', kicker='30 DE NOVEMBRO', title='Hoje vence a **1ª parcela do 13º salário**',
               sub='Pela Lei 4.749/1965, a primeira parcela é paga até 30 de novembro e a segunda até 20 de dezembro.',
               callout='Na rescisão, o 13º proporcional e o indenizado pelo aviso prévio entram no cálculo.', icon='calendar', icon_r=95), f'{O}/30_13salario.png')


# ─── 10/11 (ter) · Carrossel: verbas da rescisão sem justa causa (escuro) ─────────────────────
def post_rescisao():
    k = '10_rescisao'
    P.hero_number(dict(number='5', unit='VERBAS', title='da rescisão **sem justa causa**', sub='Deslize e confira se nenhuma ficou de fora.',
                       swipe=True, num_size=420, dark=True), f'{O}/{k}_01.png')
    verbas = [
        ('01', 'SALDO **DE SALÁRIO**', 'Os dias trabalhados no mês da dispensa.', 'Calculado a partir do salário e da data de demissão.', 'calendar'),
        ('02', 'AVISO PRÉVIO **PROPORCIONAL**', '30 dias, mais 3 por ano completo de serviço, até 90 dias (Lei 12.506/2011).', 'O sistema conta os anos do contrato e mostra os dias de aviso.', 'clock'),
        ('03', '13º **PROPORCIONAL**', '1/12 por mês trabalhado no ano, contando a projeção do aviso indenizado.', 'Os avos aparecem no relatório, como 9/12.', 'calc'),
        ('04', 'FÉRIAS **+ 1/3**', 'Férias vencidas e proporcionais, sempre com o terço constitucional.', 'Férias e terço em linhas separadas do relatório.', 'check'),
        ('05', 'MULTA **DE 40% DO FGTS**', 'Sobre os depósitos do contrato, além do saque do saldo.', 'Informe o saldo do FGTS e a multa entra no total.', 'chart'),
    ]
    for i, (n, t, sub, co, ic) in enumerate(verbas):
        passo_icone(n, t, sub, co, ic, True, sl(i + 1, 5), f'{O}/{k}_{i + 2:02d}.png')
    P.statement(dict(bg='dark', title='Todas as verbas **em um só cálculo**', sub='No JC Jurídico, você informa os dados do contrato e recebe o relatório com cada verba detalhada.',
                     icon='calc', icon_r=110, cta='SALVE PARA CONSULTAR'), f'{O}/{k}_07.png')


# ─── 18/11 (qua) · Carrossel: descontos indevidos no benefício (pérola) ───────────────────────
def post_descontos():
    k = '18_descontos'
    P.statement(dict(bg='pearl', kicker='DIREITO PREVIDENCIÁRIO', title='Descontos no benefício **que o cliente não autorizou?**',
                     sub='Veja um roteiro em 3 passos para organizar o caso.', icon='shield', icon_r=100, swipe=True), f'{O}/{k}_01.png')
    passos = [
        ('01', 'IDENTIFIQUE **OS DESCONTOS**', 'No histórico de créditos do benefício, localize as rubricas de mensalidade associativa ou de terceiros.', 'Guarde o extrato: ele é a base do cálculo e da petição.', 'doc'),
        ('02', 'LEVANTE **PERÍODO E VALORES**', 'Anote a competência de início, o valor de cada desconto e se ele ainda está ativo.', 'Esses são os dados que você informa no cálculo.', 'calendar'),
        ('03', 'CALCULE **A RESTITUIÇÃO**', 'Some os valores descontados com atualização monetária.', 'O cálculo de Descontos indevidos soma tudo e gera o relatório em PDF.', 'calc'),
    ]
    for i, (n, t, sub, co, ic) in enumerate(passos):
        passo_icone(n, t, sub, co, ic, False, sl(i + 1, 3), f'{O}/{k}_{i + 2:02d}.png')
    P.statement(dict(bg='pearl', title='Salve **para o próximo caso**', sub='E envie a um colega que também atua com direito previdenciário.',
                     icon='check', icon_r=105, cta='SALVE ESTE POST'), f'{O}/{k}_05.png')


if __name__ == '__main__':
    post_pdf()
    post_calculos()
    post_rescisao()
    post_descontos()
    unicos()
    print('ok', len(os.listdir(O)))
