#!/usr/bin/env bash
# Instala o agendador na VM sem tocar nos containers do JC Jurídico.
# Roda como o usuário atual (sem sudo), pelo cron, com prioridade baixa e limites de memória e tempo.
set -euo pipefail
DEST="$HOME/jc-agendador"
mkdir -p "$DEST"
cp "$(dirname "$0")/publicar.py" "$DEST/"
chmod 700 "$DEST"
if [ ! -f "$DEST/.env" ]; then
  umask 077
  cat > "$DEST/.env" <<'ENV'
# Preencha e salve. Este arquivo não sai da VM.
IG_USER_ID=
IG_TOKEN=
GRAPH_HOST=graph.facebook.com
TOLERANCIA_MIN=120
ENV
fi
chmod 600 "$DEST/.env"
LINHA="*/5 * * * * cd $DEST && ulimit -v 300000 && nice -n 19 ionice -c3 timeout 900 /usr/bin/python3 publicar.py >> $DEST/agendador.log 2>&1"
( crontab -l 2>/dev/null | grep -v 'jc-agendador' || true ; echo "$LINHA" ) | crontab -
echo "instalado em $DEST"
crontab -l | grep jc-agendador
