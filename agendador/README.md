# Agendador de posts (API oficial do Instagram)

Roda na VM (`~/jc-agendador`) pelo cron a cada 5 minutos e publica o que estiver em `agenda.json`.

## Formato de `agenda.json`

```json
{
  "posts": [
    {
      "id": "2026-12-01-exemplo",
      "quando": "2026-12-01T12:00:00-03:00",
      "tipo": "imagem",
      "midia": ["v22/exemplo.jpg"],
      "legenda": "Texto do post com #hashtags",
      "primeiro_comentario": "opcional",
      "ativo": true
    }
  ]
}
```

- `tipo`: `imagem`, `carrossel` (até 10 mídias), `reels` (um `.mp4`, `capa_ms` opcional) ou `story` (uma imagem ou um `.mp4`, sem legenda).
- `midia`: caminhos no repositório (viram links do raw.githubusercontent) ou URLs completas. Imagens precisam ser **JPEG**: use `preparar.py` para converter os PNGs.
- `id` precisa ser único: é ele que impede publicar o mesmo post duas vezes.
- Story 9:16 (1080x1920). Links, enquetes e figurinhas não são suportados pela API.

## Na VM

```
cd ~/jc-agendador
python3 publicar.py --status      # agenda e situação de cada post
python3 publicar.py --verificar   # confere token e limite diário (100 posts / 24 h)
python3 publicar.py --repetir ID  # libera um post que falhou
tail agendador.log
```
