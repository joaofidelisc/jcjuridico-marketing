#!/usr/bin/env python3
"""Agendador de posts do @jcjuridico.br pela API oficial do Instagram (Meta).

Roda pelo cron a cada poucos minutos. A cada execução:
  1. baixa a agenda (agenda.json) do repositório jcjuridico-marketing;
  2. publica os posts cujo horário já chegou e que ainda não foram publicados;
  3. registra o resultado em estado.db (SQLite), para nunca publicar o mesmo post duas vezes;
  4. renova o token de acesso quando ele passa de 50 dias (o token longo do Instagram vale 60).

Só usa a biblioteca padrão do Python (nada para instalar na VM).

Configuração (arquivo .env ao lado deste script, permissão 600):
  IG_USER_ID=...           id da conta do Instagram
  IG_TOKEN=...             token de acesso (instagram_business_basic + instagram_business_content_publish)
  GRAPH_HOST=graph.facebook.com    (token de usuário do sistema do login unificado, não expira; use graph.instagram.com para token do login do Instagram)
  AGENDA_URL=https://api.github.com/repos/joaofidelisc/jcjuridico-marketing/contents/agendador/agenda.json?ref=main
  MIDIA_BASE=https://raw.githubusercontent.com/joaofidelisc/jcjuridico-marketing/main/
  TOLERANCIA_MIN=120       atraso máximo para ainda publicar (ex.: VM fora do ar); depois disso marca 'perdido'

Uso:
  publicar.py              publica o que estiver no horário
  publicar.py --simular    só mostra o que faria (não chama a API de publicação)
  publicar.py --status     lista a agenda com a situação de cada post
  publicar.py --verificar  confere o token e a conta (não publica)
  publicar.py --repetir ID libera um post que falhou para nova tentativa na próxima execução
  publicar.py --testar ID  envia as mídias do post à Meta e confere se ficam prontas, SEM publicar
"""
import datetime as dt
import fcntl
import json
import os
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
VERSAO_API = 'v23.0'
UTC = dt.timezone.utc


def log(msg):
    print(f'{dt.datetime.now(UTC):%Y-%m-%d %H:%M:%S}Z {msg}', flush=True)


def carregar_env():
    caminho = os.path.join(AQUI, '.env')
    env = {}
    if os.path.exists(caminho):
        for linha in open(caminho, encoding='utf-8'):
            linha = linha.strip()
            if linha and not linha.startswith('#') and '=' in linha:
                k, v = linha.split('=', 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    env.setdefault('GRAPH_HOST', 'graph.instagram.com')
    # API do GitHub (sem o cache de ~5 min do raw.githubusercontent); 60 leituras/hora sem token, o cron faz 12
    env.setdefault('AGENDA_URL', 'https://api.github.com/repos/joaofidelisc/jcjuridico-marketing/contents/agendador/agenda.json?ref=main')
    env.setdefault('MIDIA_BASE', 'https://raw.githubusercontent.com/joaofidelisc/jcjuridico-marketing/main/')
    env.setdefault('TOLERANCIA_MIN', '120')
    return env


# ─── Estado local ──────────────────────────────────────────────────────────────
def abrir_db():
    db = sqlite3.connect(os.path.join(AQUI, 'estado.db'))
    db.execute("""CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY, situacao TEXT, quando TEXT, media_id TEXT, link TEXT, erro TEXT, atualizado TEXT)""")
    db.execute('CREATE TABLE IF NOT EXISTS token (valor TEXT, renovado TEXT)')
    return db


def marcar(db, pid, situacao, quando, media_id=None, link=None, erro=None):
    db.execute('INSERT OR REPLACE INTO posts VALUES (?,?,?,?,?,?,?)',
               (pid, situacao, quando, media_id, link, erro, dt.datetime.now(UTC).isoformat()))
    db.commit()


def situacao(db, pid):
    r = db.execute('SELECT situacao FROM posts WHERE id=?', (pid,)).fetchone()
    return r[0] if r else None


def token_atual(db, env):
    """O token renovado fica no banco; o do .env é só o primeiro."""
    r = db.execute('SELECT valor, renovado FROM token').fetchone()
    if r:
        return r[0], dt.datetime.fromisoformat(r[1])
    return env['IG_TOKEN'], None


# ─── API ───────────────────────────────────────────────────────────────────────
class ErroApi(Exception):
    pass


def chamar(env, token, metodo, caminho, params=None):
    params = dict(params or {})
    params['access_token'] = token
    url = f"https://{env['GRAPH_HOST']}/{VERSAO_API}/{caminho}"
    dados = None
    if metodo == 'GET':
        url += '?' + urllib.parse.urlencode(params)
    else:
        dados = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(url, data=dados, method=metodo)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        corpo = e.read().decode(errors='replace')
        try:
            msg = json.loads(corpo).get('error', {}).get('message', corpo)
        except ValueError:
            msg = corpo
        raise ErroApi(f'{e.code} em {caminho}: {msg[:300]}') from None


def renovar_token_se_preciso(db, env, token, renovado):
    if env['GRAPH_HOST'] != 'graph.instagram.com':
        return token  # token de usuário do sistema (Facebook) não expira
    if renovado and dt.datetime.now(UTC) - renovado < dt.timedelta(days=50):
        return token
    if renovado is None:
        # primeira execução: considera o token do .env como recém-gerado
        db.execute('DELETE FROM token')
        db.execute('INSERT INTO token VALUES (?,?)', (token, dt.datetime.now(UTC).isoformat()))
        db.commit()
        return token
    url = 'https://graph.instagram.com/refresh_access_token?' + urllib.parse.urlencode(
        {'grant_type': 'ig_refresh_token', 'access_token': token})
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            novo = json.load(r)['access_token']
    except Exception as e:  # noqa: BLE001 - registra e segue com o token atual
        log(f'AVISO: não consegui renovar o token: {e}')
        return token
    db.execute('DELETE FROM token')
    db.execute('INSERT INTO token VALUES (?,?)', (novo, dt.datetime.now(UTC).isoformat()))
    db.commit()
    log('token renovado')
    return novo


def aguardar_pronto(env, token, container_id, limite_s=600):
    """Vídeos (e às vezes imagens) precisam ser processados antes da publicação."""
    inicio = time.time()
    while time.time() - inicio < limite_s:
        st = chamar(env, token, 'GET', container_id, {'fields': 'status_code,status'})
        cod = st.get('status_code')
        if cod in ('FINISHED', 'PUBLISHED'):
            return
        if cod in ('ERROR', 'EXPIRED'):
            raise ErroApi(f'processamento falhou: {st.get("status")}')
        time.sleep(10)
    raise ErroApi('tempo esgotado esperando o processamento da mídia')


def publicar(env, token, post):
    uid = env['IG_USER_ID']
    urls = [m if m.startswith('http') else env['MIDIA_BASE'] + m for m in post['midia']]
    tipo = post.get('tipo') or ('carrossel' if len(urls) > 1 else 'imagem')
    legenda = post.get('legenda', '')
    if tipo == 'imagem':
        c = chamar(env, token, 'POST', f'{uid}/media', {'image_url': urls[0], 'caption': legenda})['id']
        aguardar_pronto(env, token, c, 120)
    elif tipo == 'carrossel':
        filhos = []
        for u in urls:
            p = {'is_carousel_item': 'true'}
            p.update({'media_type': 'VIDEO', 'video_url': u} if u.lower().endswith('.mp4') else {'image_url': u})
            fid = chamar(env, token, 'POST', f'{uid}/media', p)['id']
            aguardar_pronto(env, token, fid)
            filhos.append(fid)
        c = chamar(env, token, 'POST', f'{uid}/media', {'media_type': 'CAROUSEL', 'children': ','.join(filhos), 'caption': legenda})['id']
        aguardar_pronto(env, token, c, 120)
    elif tipo == 'reels':
        p = {'media_type': 'REELS', 'video_url': urls[0], 'caption': legenda, 'share_to_feed': 'true'}
        if post.get('capa_ms') is not None:
            p['thumb_offset'] = str(post['capa_ms'])
        c = chamar(env, token, 'POST', f'{uid}/media', p)['id']
        aguardar_pronto(env, token, c)
    elif tipo == 'story':
        # Stories não têm legenda; links, enquetes e figurinhas não são suportados pela API.
        u = urls[0]
        p = {'media_type': 'STORIES'}
        p.update({'video_url': u} if u.lower().endswith('.mp4') else {'image_url': u})
        c = chamar(env, token, 'POST', f'{uid}/media', p)['id']
        aguardar_pronto(env, token, c)
    else:
        raise ErroApi(f'tipo desconhecido: {tipo}')
    media_id = chamar(env, token, 'POST', f'{uid}/media_publish', {'creation_id': c})['id']
    link = None
    try:
        link = chamar(env, token, 'GET', media_id, {'fields': 'permalink'}).get('permalink')
    except ErroApi:
        pass
    if post.get('primeiro_comentario') and tipo != 'story':
        try:
            chamar(env, token, 'POST', f'{media_id}/comments', {'message': post['primeiro_comentario']})
        except ErroApi as e:
            log(f'AVISO: post publicado, mas o primeiro comentário falhou: {e}')
    return media_id, link


# ─── Agenda ────────────────────────────────────────────────────────────────────
def baixar_agenda(env):
    url = env['AGENDA_URL']
    if url.startswith('https://raw.'):  # evita cópia antiga em cache
        url += ('&' if '?' in url else '?') + f't={int(time.time())}'
    req = urllib.request.Request(url, headers={'Accept': 'application/vnd.github.raw', 'User-Agent': 'jc-agendador'})
    with urllib.request.urlopen(req, timeout=30) as r:
        dados = json.load(r)
    posts = []
    for p in dados.get('posts', []):
        if p.get('ativo', True):
            p['_quando'] = dt.datetime.fromisoformat(p['quando'])
            posts.append(p)
    return sorted(posts, key=lambda p: p['_quando'])


def main():
    args = set(sys.argv[1:])
    env = carregar_env()
    trava = open(os.path.join(AQUI, '.trava'), 'w')
    try:
        fcntl.flock(trava, fcntl.LOCK_EX | fcntl.LOCK_NB)  # nunca roda duas vezes ao mesmo tempo
    except BlockingIOError:
        return
    db = abrir_db()
    agora = dt.datetime.now(UTC)

    if '--repetir' in args:
        pid = sys.argv[sys.argv.index('--repetir') + 1]
        db.execute("DELETE FROM posts WHERE id=? AND situacao IN ('falhou','perdido')", (pid,))
        db.commit()
        print('liberado:', pid)
        return

    if '--testar' in args:
        pid = sys.argv[sys.argv.index('--testar') + 1]
        post = next(p for p in baixar_agenda(env) if p['id'] == pid)
        token, _ = token_atual(db, env)
        for m in post['midia']:
            u = m if m.startswith('http') else env['MIDIA_BASE'] + m
            p = {'is_carousel_item': 'true'} if len(post['midia']) > 1 else {}
            p.update({'media_type': 'VIDEO', 'video_url': u} if u.lower().endswith('.mp4') else {'image_url': u})
            c = chamar(env, token, 'POST', f"{env['IG_USER_ID']}/media", p)['id']
            aguardar_pronto(env, token, c, 120)
            print('ok (não publicado):', m)
        return

    if '--verificar' in args:
        token, _ = token_atual(db, env)
        conta = chamar(env, token, 'GET', 'me' if env['GRAPH_HOST'] == 'graph.instagram.com' else env['IG_USER_ID'],
                       {'fields': 'id,username'})
        print('conta:', conta)
        lim = chamar(env, token, 'GET', f"{env['IG_USER_ID']}/content_publishing_limit", {'fields': 'quota_usage,config'})
        print('limite de publicação:', lim)
        return

    posts = baixar_agenda(env)
    if '--status' in args:
        for p in posts:
            print(f"{p['_quando'].astimezone(dt.timezone(dt.timedelta(hours=-3))):%d/%m %H:%M}  {situacao(db, p['id']) or 'agendado':10}  {p['id']}")
        return

    tolerancia = dt.timedelta(minutes=int(env['TOLERANCIA_MIN']))
    devidos = [p for p in posts if p['_quando'] <= agora and situacao(db, p['id']) not in ('publicado', 'perdido', 'falhou')]
    if not devidos:
        return
    if '--simular' in args:
        for p in devidos:
            print('publicaria:', p['id'], p['quando'], len(p['midia']), 'mídia(s)')
        return
    token, renovado = token_atual(db, env)
    token = renovar_token_se_preciso(db, env, token, renovado)
    for p in devidos:
        if agora - p['_quando'] > tolerancia:
            marcar(db, p['id'], 'perdido', p['quando'], erro='horário passou da tolerância sem publicar')
            log(f"PERDIDO {p['id']} (agendado para {p['quando']})")
            continue
        try:
            media_id, link = publicar(env, token, p)
            marcar(db, p['id'], 'publicado', p['quando'], media_id, link)
            log(f"PUBLICADO {p['id']} {link or media_id}")
        except Exception as e:  # noqa: BLE001 - registra a falha e não tenta de novo sozinho
            marcar(db, p['id'], 'falhou', p['quando'], erro=str(e)[:500])
            log(f"FALHOU {p['id']}: {e}")


if __name__ == '__main__':
    main()
