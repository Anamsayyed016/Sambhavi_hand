#!/usr/bin/env bash
# Manual rollback to previous Sambhavi port/release.
# Does NOT touch AFTIONIX.
set -euo pipefail

APP_ROOT="${APP_ROOT:-/var/www/sambhavi-handloom}"
SHARED_DIR="$APP_ROOT/shared"
ACTIVE_PORT_FILE="$SHARED_DIR/active-port"
PREV_PORT_FILE="$SHARED_DIR/previous-port"
NGINX_UPSTREAM_SNIPPET="${NGINX_UPSTREAM_SNIPPET:-/etc/nginx/snippets/sambhavi-upstream.conf}"
PUBLIC_URL="${PUBLIC_URL:-https://sambhaviheritagereimagined.com}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BLUE_PORT=3001
GREEN_PORT=3002

log() { echo "[rollback $(date -u +%H:%M:%S)] $*"; }
fail() { echo "[rollback ERROR] $*" >&2; exit 1; }

[[ -f "$ACTIVE_PORT_FILE" ]] || fail "missing $ACTIVE_PORT_FILE"
[[ -f "$PREV_PORT_FILE" ]] || fail "missing $PREV_PORT_FILE (no previous port recorded)"

ACTIVE_PORT="$(tr -d '[:space:]' < "$ACTIVE_PORT_FILE")"
PREV_PORT="$(tr -d '[:space:]' < "$PREV_PORT_FILE")"

if [[ "$PREV_PORT" != "$BLUE_PORT" && "$PREV_PORT" != "$GREEN_PORT" ]]; then
  fail "invalid previous port: $PREV_PORT"
fi

if [[ "$PREV_PORT" == "$BLUE_PORT" ]]; then
  PREV_NAME="sambhavi-blue"
  CUR_NAME="sambhavi-green"
else
  PREV_NAME="sambhavi-green"
  CUR_NAME="sambhavi-blue"
fi

log "active=$ACTIVE_PORT → rollback to $PREV_PORT ($PREV_NAME)"

# Ensure previous process is running
if ! pm2 describe "$PREV_NAME" >/dev/null 2>&1; then
  fail "PM2 process $PREV_NAME is not running — cannot rollback without rebuild. Start previous release manually."
fi

bash "$SCRIPT_DIR/healthcheck.sh" "$PREV_PORT" "/"

cat > "$NGINX_UPSTREAM_SNIPPET" <<EOF
# Managed by Sambhavi rollback.sh
upstream sambhavi_backend {
    server 127.0.0.1:${PREV_PORT};
    keepalive 64;
}
EOF

nginx -t || fail "nginx -t failed — aborting rollback switch"
systemctl reload nginx

CODE="$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 -L "$PUBLIC_URL" || true)"
[[ "$CODE" == "200" ]] || fail "public site not healthy after rollback (HTTP $CODE)"

echo "$PREV_PORT" > "$ACTIVE_PORT_FILE"
# Swap previous pointer
echo "$ACTIVE_PORT" > "$PREV_PORT_FILE"

log "stopping failed color: $CUR_NAME"
pm2 delete "$CUR_NAME" >/dev/null 2>&1 || true
pm2 save

log "ROLLBACK SUCCESS — traffic on $PREV_PORT ($PREV_NAME)"
