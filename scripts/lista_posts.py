"""Lista dos posts de feed ainda agendados (agendador próprio + Metricool): data, hora, canal, tipo, título e descrição.
Saída: agendador/lista-posts.html e agendador/lista-posts.csv. Stories ficam de fora (cada post tem o seu, 2 min depois)."""
import csv
import datetime as dt
import html
import json
import os
import re
import sys

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
sys.path.insert(0, os.path.join(RAIZ, 'agendador'))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import painel
from novembro_v22_conteudo import POSTS

DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']
limpa = lambda s: re.sub(r'\*\*', '', s or '').replace('\n', ' ').strip()

# Posts do Metricool (12h, aprovados lá)
METRICOOL = [
    (3, 'Relatório em PDF com a marca do seu escritório', 'carrossel (6)', 'Logotipo e nome do escritório, cliente, processo, resultado item a item e assinatura com OAB, em todos os cálculos.'),
    (4, 'Os 18 cálculos do JC Jurídico, área por área', 'carrossel (6)', 'Previdenciário, trabalhista, cível, bancário, tributário e penal, todos com relatório em PDF.'),
    (5, 'BPC/LOAS: benefício de até 1 salário mínimo fica fora da conta', 'imagem', 'Art. 20, § 14, da LOAS: o benefício de idoso ou pessoa com deficiência da família não entra na renda per capita.'),
    (6, 'Qual cálculo mais toma o seu tempo?', 'imagem', 'Post de engajamento: pergunta aos advogados nos comentários.'),
    (9, 'Comece a semana com a agenda em dia', 'imagem', 'Agenda do sistema com prazos, audiências e consultas, por dia, semana ou mês.'),
    (10, 'As 5 verbas da rescisão sem justa causa', 'carrossel (7)', 'Saldo de salário, aviso prévio proporcional, 13º, férias com 1/3 e multa de 40% do FGTS.'),
    (11, 'Pergunte para a AdvogAI', 'imagem', 'A assistente de IA do sistema, com exemplos de perguntas.'),
    (12, '52 modelos prontos para adaptar e protocolar', 'imagem', 'Biblioteca de Modelos: petições, contratos, procurações e recursos.'),
    (13, 'Programa de Parceiros: cupom com o seu nome', 'imagem', 'Parceiro paga menos, o colega tem desconto e há comissão recorrente por indicação.'),
    (16, 'Checklist de segunda-feira', 'imagem', 'Prazos da semana, retornos pendentes, contas a receber e documentos dos clientes.'),
    (17, 'Quanto o escritório lucrou este mês?', 'imagem', 'Painel financeiro: receitas, despesas, lucro líquido e valores a receber.'),
    (18, 'Descontos no benefício que o cliente não autorizou', 'carrossel (5)', 'Roteiro em 3 passos e o cálculo de Descontos indevidos do sistema.'),
    (19, 'Marketplace: precisa de correspondente em outra cidade?', 'imagem', 'Publique a demanda com tipo de serviço, cidade, prazo e valor.'),
    (20, 'Dia Nacional de Zumbi e da Consciência Negra', 'imagem', 'Feriado nacional desde 2024; Estatuto da Igualdade Racial e Lei 14.532/2023.'),
    (23, 'Funil Jurídico: sem ideia do que postar esta semana?', 'imagem', 'Planejador de conteúdo a partir das áreas de atuação e do público.'),
    (24, 'O escritório inteiro em uma tela', 'imagem', 'Painel com casos ativos, receita do mês, clientes e próximos compromissos.'),
    (25, 'O que conferir no CNIS do cliente', 'imagem', 'Vínculos sem data de fim, remunerações em branco, indicadores de pendência e recolhimentos em atraso.'),
    (26, 'Escritório com equipe? Todos no mesmo sistema', 'imagem', 'Equipe de 2, 5 ou 10 usuários e logotipo do escritório nos PDFs.'),
    (27, 'Black Friday: até R$ 1.080 de economia por ano', 'imagem', 'Economia real do plano anual frente ao mensal, sem desconto inventado.'),
    (30, 'Hoje vence a 1ª parcela do 13º salário', 'imagem', 'Lei 4.749/1965 e o 13º proporcional na rescisão.'),
]


def main():
    est, _ = painel.situacoes()
    agenda = json.load(open(os.path.join(RAIZ, 'agendador', 'agenda.json'), encoding='utf-8'))['posts']
    cont = {f"2026-11-{p['dia']:02d}-{p['id']}": p for p in POSTS}
    extra = {'2026-11-04-direitos-trabalhador': ('5 direitos do trabalhador que a empresa não conta',
             'Exame preventivo de câncer (3 dias/ano), doação de sangue, consulta do filho, intervalo de almoço não concedido (+50%) e férias pagas até 2 dias antes.')}
    linhas = []
    for a in agenda:
        if a['tipo'] == 'story' or not a.get('ativo', True) or est.get(a['id'], {}).get('situacao') in ('publicado', 'perdido', 'falhou'):
            continue
        q = dt.datetime.fromisoformat(a['quando'])
        p = cont.get(a['id'])
        if p:
            t = p['tipo']
            if t == 'numero':
                titulo, desc = f"{limpa(p['number'])} {limpa(p['unit']).lower()}: {limpa(p['title'])}", limpa(p['sub'])
            elif t == 'quiz':
                titulo = limpa(p['pergunta'])
                desc = f"Verdadeiro ou falso. Resposta: {p['resposta']}. {limpa(p['explicacao'])}"
            elif t in ('lista', 'mitos'):
                titulo = limpa(p['title'])
                desc = ('Mitos: ' if t == 'mitos' else 'Itens: ') + '; '.join(limpa(i[0]) for i in p['itens']) + '.'
            else:
                titulo, desc = limpa(p['title']), limpa(p['sub'])
            base = limpa(p.get('base', '')) or ', '.join(sorted({limpa(i[2]) for i in p.get('itens', [])}))[:120]
        else:
            titulo, desc = extra.get(a['id'], (a['id'], ''))
            base = ''
        tipo = 'imagem' if a['tipo'] == 'imagem' else f"carrossel ({len(a['midia'])})"
        linhas.append((q, 'Agendador próprio', tipo, titulo, desc))
    for dia, titulo, tipo, desc in METRICOOL:
        linhas.append((dt.datetime(2026, 11, dia, 12, 0, tzinfo=dt.timezone(dt.timedelta(hours=-3))), 'Metricool', tipo, titulo, desc))
    linhas.sort(key=lambda l: l[0])
    out = os.path.join(RAIZ, 'agendador')
    with open(os.path.join(out, 'lista-posts.csv'), 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f, delimiter=';')
        w.writerow(['Data', 'Hora', 'Canal', 'Tipo', 'Título', 'Descrição'])
        for q, canal, tipo, titulo, desc in linhas:
            w.writerow([f'{q:%d/%m} ({DIAS[q.weekday()]})', f'{q:%H:%M}', canal, tipo, titulo, desc])
    trs = ''
    dia_ant = None
    for q, canal, tipo, titulo, desc in linhas:
        if q.date() != dia_ant:
            dia_ant = q.date()
            trs += f'<tr class="dia"><td colspan="5">{DIAS[q.weekday()]}, {q:%d/%m}</td></tr>'
        trs += (f'<tr><td class="h">{q:%H:%M}</td><td><span class="c {"m" if canal == "Metricool" else ""}">{"Metricool" if canal == "Metricool" else "Agendador"}</span></td>'
                f'<td class="t">{html.escape(tipo)}</td><td><b>{html.escape(titulo)}</b></td><td>{html.escape(desc)}</td></tr>')
    pag = f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Posts agendados</title><style>
:root{{--navy:#0e1d3f;--bordo:#8b1a2b}} body{{font:14px/1.45 system-ui,sans-serif;margin:0;background:#faf8f4;color:#141c32}}
main{{max-width:1100px;margin:0 auto;padding:16px}} h1{{color:var(--navy);margin:6px 0}} table{{width:100%;border-collapse:collapse;background:#fff}}
td{{padding:7px 9px;border-bottom:1px solid #eee;vertical-align:top}} tr.dia td{{background:#0e1d3f;color:#fff;font-weight:700;text-transform:capitalize}}
.h{{white-space:nowrap;font-weight:700}} .t{{white-space:nowrap;color:#545c70}} .c{{background:#e8ecf8;color:#0e1d3f;border-radius:999px;padding:1px 9px;font-size:12px}} .c.m{{background:#f5ced4;color:#8b1a2b}}
@media(max-width:700px){{td:nth-child(3){{display:none}}}}</style></head><body><main>
<h1>Posts de feed agendados · @jcjuridico.br</h1><p>{len(linhas)} posts. Cada um tem também um story, 2 minutos depois (no Metricool, às 12h02, pelo agendador).</p>
<table>{trs}</table></main></body></html>'''
    open(os.path.join(out, 'lista-posts.html'), 'w', encoding='utf-8').write(pag)
    print(len(linhas), 'posts')


if __name__ == '__main__':
    main()
