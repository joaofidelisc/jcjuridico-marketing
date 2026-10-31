#!/usr/bin/env python3
"""Gera agendador/painel.html: a agenda do agendador próprio com miniaturas, legendas e a situação de cada post na VM.

Uso (no computador, dentro do repositório):  python3 agendador/painel.py   e abra agendador/painel.html no navegador.
A situação (agendado, publicado, falhou, perdido) vem da VM por SSH; sem acesso, o painel mostra só a agenda.
As miniaturas vão embutidas no HTML, então o arquivo abre em qualquer lugar.
"""
import base64
import datetime as dt
import html
import io
import json
import os
import subprocess

from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
VM = 'ubuntu@201.23.65.233'
DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']


def miniatura(caminho, largura):
    im = Image.open(os.path.join(RAIZ, caminho)).convert('RGB')
    im.thumbnail((largura, largura * 2))
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=72)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()


def situacoes():
    try:
        saida = subprocess.run(['ssh', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=8', VM,
                                'cd ~/jc-agendador && python3 -c "import sqlite3;print(\'\\n\'.join(\'|\'.join(map(str,r)) for r in '
                                'sqlite3.connect(\'estado.db\').execute(\'select id,situacao,link,erro from posts\')))"'],
                               capture_output=True, text=True, timeout=30).stdout
    except Exception:  # noqa: BLE001 - sem VM, o painel sai só com a agenda
        return {}, False
    est = {}
    for linha in saida.splitlines():
        partes = linha.split('|')
        if len(partes) == 4:
            est[partes[0]] = {'situacao': partes[1], 'link': None if partes[2] == 'None' else partes[2],
                              'erro': None if partes[3] == 'None' else partes[3]}
    return est, True


def main():
    posts = json.load(open(os.path.join(AQUI, 'agenda.json'), encoding='utf-8'))['posts']
    est, online = situacoes()
    agora = dt.datetime.now(dt.timezone(dt.timedelta(hours=-3)))
    blocos, dia_atual = [], None
    cores = {'publicado': '#1f7a4d', 'falhou': '#b3261e', 'perdido': '#8a5a00', 'agendado': '#3b5bdb'}
    for p in posts:
        q = dt.datetime.fromisoformat(p['quando'])
        dia = q.strftime('%Y-%m-%d')
        if dia != dia_atual:
            dia_atual = dia
            blocos.append(f'<h2 id="d{dia}">{DIAS[q.weekday()]}, {q:%d/%m}</h2>')
        e = est.get(p['id'], {})
        sit = e.get('situacao') or ('agendado' if p.get('ativo', True) else 'inativo')
        story = p['tipo'] == 'story'
        thumbs = ''.join(f'<img src="{miniatura(m, 120 if story else 220)}" loading="lazy">' for m in p['midia'])
        extra = ''
        if e.get('link'):
            extra += f' · <a href="{html.escape(e["link"])}" target="_blank">ver no Instagram</a>'
        if e.get('erro'):
            extra += f'<div class="erro">{html.escape(e["erro"])}</div>'
        legenda = html.escape(p.get('legenda', '')).replace('\n', '<br>')
        tipo = {'imagem': 'Feed · imagem', 'carrossel': f'Feed · carrossel ({len(p["midia"])})', 'reels': 'Reels',
                'story': 'Story'}[p['tipo']]
        blocos.append(f'''<article class="{'story' if story else 'feed'}">
  <header><b>{q:%H:%M}</b> <span class="tipo">{tipo}</span>
  <span class="sit" style="background:{cores.get(sit, '#666')}">{sit}</span>{extra}</header>
  <div class="thumbs">{thumbs}</div>
  {'' if story else f'<details><summary>Legenda</summary><p>{legenda}</p></details>'}
  <code>{html.escape(p['id'])}</code>
</article>''')
    aviso = '' if online else '<p class="aviso">Sem acesso à VM agora: mostrando só a agenda, sem a situação de cada post.</p>'
    pagina = f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Agenda JC Jurídico</title>
<style>
:root{{--navy:#0e1d3f;--bordo:#8b1a2b;--bg:#faf8f4;--card:#fff;--muted:#545c70}}
body{{margin:0;font:15px/1.5 system-ui,sans-serif;background:var(--bg);color:#141c32}}
main{{max-width:980px;margin:0 auto;padding:16px}}
h1{{color:var(--navy);margin:8px 0 0}} h2{{color:var(--bordo);border-bottom:2px solid #e2ddd2;padding-top:18px;text-transform:capitalize}}
article{{background:var(--card);border:1px solid #e6e2d8;border-radius:12px;padding:12px;margin:10px 0}}
article.story{{background:#f3f1ec}}
header{{display:flex;gap:10px;align-items:center;flex-wrap:wrap}}
.tipo{{color:var(--muted)}} .sit{{color:#fff;border-radius:999px;padding:1px 10px;font-size:13px}}
.thumbs{{display:flex;gap:6px;overflow-x:auto;margin:10px 0}} .thumbs img{{border-radius:8px;border:1px solid #ddd}}
details p{{white-space:normal;color:#2a3150}} code{{color:#999;font-size:12px}}
.erro{{color:#b3261e;margin-top:4px}} .aviso{{background:#fff3cd;padding:8px 12px;border-radius:8px}}
</style></head><body><main>
<h1>Agenda do Instagram · @jcjuridico.br</h1>
<p>Gerado em {agora:%d/%m/%Y %H:%M}. Publicação pelo agendador próprio (VM). Posts do Metricool não aparecem aqui, só os stories deles.</p>
{aviso}
{''.join(blocos)}
</main></body></html>'''
    saida = os.path.join(AQUI, 'painel.html')
    with open(saida, 'w', encoding='utf-8') as f:
        f.write(pagina)
    print(saida, len(posts), 'itens', '(com situação da VM)' if online else '(sem VM)')


if __name__ == '__main__':
    main()
