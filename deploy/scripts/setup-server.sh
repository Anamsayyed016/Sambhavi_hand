#!/usr/bin/env bash
# One-time Hostinger setup for Sambhavi blue-green layout.
# Safe to re-run. Does NOT modify AFTIONIX Nginx or PM2.
set -euo pipefail

APP_ROOT="${APP_ROOT:-/var/www/sambhavi-handloom}"
REPO_URL="${REPO_URL:-https://github.com/Anamsayyed016/Sambhavi_hand.git}"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/sambhaviheritagereimagined.com}"
NGINX_UPSTREAM_SNIPPET="${NGINX_UPSTREAM_SNIPPET:-/etc/nginx/snippets/sambhavi-upstream.conf}"
ACTIVE_PORT="${ACTIVE_PORT:-3001}"

log() { echo "[setup] $*"; }

mkdir -p "$APP_ROOT/releases" "$APP_ROOT/shared" /etc/nginx/snippets

if [[ ! -d "$APP_ROOT/repo/.git" ]]; then
  if [[ -d "$APP_ROOT/.git" ]]; then
    log "moving existing checkout to $APP_ROOT/repo"
    # If flat checkout exists, use it as the mirror
    mkdir -p "$APP_ROOT/repo"
    # Prefer cloning fresh mirror to avoid moving a live tree mid-flight
    git clone "$REPO_URL" "$APP_ROOT/repo"
  else
    git clone "$REPO_URL" "$APP_ROOT/repo"
  fi
fi

if [[ ! -f "$APP_ROOT/shared/.env" ]]; then
  if [[ -f "$APP_ROOT/.env" ]]; then
    log "copying existing .env → shared/.env (original left in place)"
    cp "$APP_ROOT/.env" "$APP_ROOT/shared/.env"
  else
    log "creating empty shared/.env — fill DATABASE_URL etc. manually"
    cat > "$APP_ROOT/shared/.env" <<'EOF'
# Sambhavi production environment (not in git)
DATABASE_URL=
EOF
  fi
fi

echo "$ACTIVE_PORT" > "$APP_ROOT/shared/active-port"

cat > "$NGINX_UPSTREAM_SNIPPET" <<EOF
upstream sambhavi_backend {
    server 127.0.0.1:${ACTIVE_PORT};
    keepalive 64;
}
EOF

log "Nginx site must proxy to http://sambhavi_backend"
log "If still using hard-coded :3001, update $NGINX_SITE location / block to:"
cat <<'EOF'

    include /etc/nginx/snippets/sambhavi-upstream.conf;

    location / {
        proxy_pass http://sambhavi_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

EOF

log "After editing the site file:"
log "  nginx -t && systemctl reload nginx"
log "Setup directories ready under $APP_ROOT"
