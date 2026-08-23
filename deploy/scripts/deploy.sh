#!/usr/bin/env bash
# Zero-downtime blue-green deploy for Sambhavi Handloom ONLY.
# Does NOT touch AFTIONIX (port 3000).
#
# Usage: deploy.sh <COMMIT_SHA>
set -euo pipefail

COMMIT_SHA="${1:?COMMIT_SHA required}"
APP_ROOT="${APP_ROOT:-/var/www/sambhavi-handloom}"
REPO_DIR="${REPO_DIR:-$APP_ROOT/repo}"
RELEASES_DIR="$APP_ROOT/releases"
SHARED_DIR="$APP_ROOT/shared"
CURRENT_LINK="$APP_ROOT/current"
ACTIVE_PORT_FILE="$SHARED_DIR/active-port"
NGINX_UPSTREAM_SNIPPET="${NGINX_UPSTREAM_SNIPPET:-/etc/nginx/snippets/sambhavi-upstream.conf}"
REPO_URL="${REPO_URL:-https://github.com/Anamsayyed016/Sambhavi_hand.git}"
KEEP_RELEASES="${KEEP_RELEASES:-3}"
PUBLIC_URL="${PUBLIC_URL:-https://sambhaviheritagereimagined.com}"

BLUE_PORT=3001
GREEN_PORT=3002
# AFTIONIX uses 3000 — never use it for Sambhavi

log() { echo "[deploy $(date -u +%H:%M:%S)] $*"; }
fail() { echo "[deploy ERROR] $*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "missing command: $1"
}

require_cmd git
require_cmd pnpm
require_cmd pm2
require_cmd curl
require_cmd nginx
require_cmd node

mkdir -p "$RELEASES_DIR" "$SHARED_DIR"

if [[ ! -f "$SHARED_DIR/.env" ]]; then
  log "WARNING: $SHARED_DIR/.env not found — continuing without shared env (create it before DB features)."
fi

if [[ ! -f "$ACTIVE_PORT_FILE" ]]; then
  echo "$BLUE_PORT" > "$ACTIVE_PORT_FILE"
fi

ACTIVE_PORT="$(tr -d '[:space:]' < "$ACTIVE_PORT_FILE")"
if [[ "$ACTIVE_PORT" != "$BLUE_PORT" && "$ACTIVE_PORT" != "$GREEN_PORT" ]]; then
  fail "invalid active port in $ACTIVE_PORT_FILE: $ACTIVE_PORT"
fi

if [[ "$ACTIVE_PORT" == "$BLUE_PORT" ]]; then
  NEW_PORT="$GREEN_PORT"
  NEW_NAME="sambhavi-green"
  OLD_NAME="sambhavi-blue"
else
  NEW_PORT="$BLUE_PORT"
  NEW_NAME="sambhavi-blue"
  OLD_NAME="sambhavi-green"
fi

RELEASE_DIR="$RELEASES_DIR/$COMMIT_SHA"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log "commit=$COMMIT_SHA active=$ACTIVE_PORT new=$NEW_PORT ($NEW_NAME)"

# --- Prepare git mirror ---
if [[ ! -d "$REPO_DIR/.git" ]]; then
  log "cloning repository mirror into $REPO_DIR"
  git clone "$REPO_URL" "$REPO_DIR"
fi

git -C "$REPO_DIR" fetch --force origin main
git -C "$REPO_DIR" fetch --force origin "$COMMIT_SHA" || true

# --- Create release from exact commit ---
if [[ -d "$RELEASE_DIR" ]]; then
  log "release dir already exists, rebuilding in place: $RELEASE_DIR"
  rm -rf "$RELEASE_DIR"
fi

mkdir -p "$RELEASE_DIR"
git -C "$REPO_DIR" archive --format=tar "$COMMIT_SHA" | tar -x -C "$RELEASE_DIR"
log "extracted $COMMIT_SHA → $RELEASE_DIR"

# Shared env (do not overwrite shared/.env)
if [[ -f "$SHARED_DIR/.env" ]]; then
  ln -sfn "$SHARED_DIR/.env" "$RELEASE_DIR/.env"
fi

cd "$RELEASE_DIR"

export CI=true
export NODE_ENV=production

log "pnpm install --frozen-lockfile"
pnpm install --frozen-lockfile

if [[ -f "prisma/schema.prisma" ]]; then
  log "prisma generate"
  pnpm exec prisma generate
  if [[ -n "${DATABASE_URL:-}" || ( -f .env && grep -q '^DATABASE_URL=.\+' .env ) ]]; then
    if [[ -d "prisma/migrations" ]] && compgen -G "prisma/migrations/*/migration.sql" >/dev/null; then
      log "prisma migrate deploy"
      pnpm exec prisma migrate deploy
    else
      log "no Prisma migrations to deploy — skipping"
    fi
  else
    log "DATABASE_URL not set — skipping migrate deploy"
  fi
fi

log "pnpm build"
pnpm build

# --- Start new color on inactive port (keep old running) ---
log "starting $NEW_NAME on port $NEW_PORT"
pm2 delete "$NEW_NAME" >/dev/null 2>&1 || true

PORT="$NEW_PORT" NODE_ENV=production pm2 start pnpm \
  --name "$NEW_NAME" \
  --cwd "$RELEASE_DIR" \
  -- start -- -p "$NEW_PORT"

pm2 save

log "health-check new instance"
bash "$SCRIPT_DIR/healthcheck.sh" "$NEW_PORT" "/"

# --- Switch Nginx upstream only for Sambhavi ---
log "updating Nginx upstream → $NEW_PORT"
cat > "$NGINX_UPSTREAM_SNIPPET" <<EOF
# Managed by Sambhavi deploy.sh — do not edit AFTIONIX configs
upstream sambhavi_backend {
    server 127.0.0.1:${NEW_PORT};
    keepalive 64;
}
EOF

if ! nginx -t; then
  log "nginx -t FAILED — leaving traffic on $ACTIVE_PORT; stopping new process"
  pm2 delete "$NEW_NAME" >/dev/null 2>&1 || true
  pm2 save
  fail "nginx config test failed; rollback of new process done; old traffic unchanged"
fi

systemctl reload nginx
log "nginx reloaded"

# Public verification
log "public health-check $PUBLIC_URL"
PUBLIC_OK=0
for ((i = 1; i <= 5; i++)); do
  CODE="$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 -L "$PUBLIC_URL" || true)"
  if [[ "$CODE" == "200" ]]; then
    PUBLIC_OK=1
    break
  fi
  log "public check attempt $i failed (HTTP $CODE)"
  sleep 3
done

if [[ "$PUBLIC_OK" -ne 1 ]]; then
  log "public health FAILED — reverting Nginx to $ACTIVE_PORT"
  cat > "$NGINX_UPSTREAM_SNIPPET" <<EOF
upstream sambhavi_backend {
    server 127.0.0.1:${ACTIVE_PORT};
    keepalive 64;
}
EOF
  nginx -t && systemctl reload nginx || true
  pm2 delete "$NEW_NAME" >/dev/null 2>&1 || true
  pm2 save
  fail "public health check failed; traffic restored to port $ACTIVE_PORT"
fi

# --- Promote ---
if [[ -f "$SHARED_DIR/current-release" ]]; then
  cp "$SHARED_DIR/current-release" "$SHARED_DIR/previous-release"
fi
echo "$ACTIVE_PORT" > "$SHARED_DIR/previous-port"
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"
echo "$NEW_PORT" > "$ACTIVE_PORT_FILE"
echo "$COMMIT_SHA" > "$SHARED_DIR/current-release"

# Stop old Sambhavi color only (never AFTIONIX)
log "stopping previous Sambhavi process: $OLD_NAME"
pm2 delete "$OLD_NAME" >/dev/null 2>&1 || true
# Legacy single-process name from pre-blue-green era
pm2 delete sambhavi-handloom >/dev/null 2>&1 || true
pm2 save

# --- Retention: keep N successful releases ---
log "pruning old releases (keep $KEEP_RELEASES)"
mapfile -t ALL_RELEASES < <(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -nr | awk '{print $2}')
COUNT=0
for rel in "${ALL_RELEASES[@]}"; do
  COUNT=$((COUNT + 1))
  if [[ "$COUNT" -gt "$KEEP_RELEASES" ]]; then
    # never delete current
    if [[ "$(readlink -f "$CURRENT_LINK")" == "$(readlink -f "$rel")" ]]; then
      continue
    fi
    log "removing old release $rel"
    rm -rf "$rel"
  fi
done

log "SUCCESS: $COMMIT_SHA live on port $NEW_PORT ($NEW_NAME)"
log "current → $RELEASE_DIR"
