#!/usr/bin/env bash
# Health-check a local Sambhavi release.
# Usage: healthcheck.sh <port> [path]
set -euo pipefail

PORT="${1:?port required}"
PATH_CHECK="${2:-/}"
RETRIES="${HEALTH_RETRIES:-5}"
SLEEP_SECS="${HEALTH_SLEEP:-3}"
URL="http://127.0.0.1:${PORT}${PATH_CHECK}"

for ((i = 1; i <= RETRIES; i++)); do
  echo "[health] attempt ${i}/${RETRIES}: ${URL}"
  CODE="$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$URL" || echo "000")"
  if [[ "$CODE" == "200" || "$CODE" == "301" || "$CODE" == "302" || "$CODE" == "308" ]]; then
    echo "[health] OK (${CODE})"
    exit 0
  fi
  echo "[health] got HTTP ${CODE}"
  sleep "$SLEEP_SECS"
done

echo "[health] FAILED after ${RETRIES} attempts: ${URL}" >&2
exit 1
