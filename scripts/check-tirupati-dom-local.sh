#!/usr/bin/env bash
set -euo pipefail
# Hit local nginx / app directly (public DNS may be unreachable from VPS)
for URL in \
  'http://127.0.0.1/product/tirupati-durga-puja-special' \
  'http://localhost:3000/product/tirupati-durga-puja-special' \
  'https://127.0.0.1/product/tirupati-durga-puja-special'
do
  echo "=== TRY $URL ==="
  CODE=$(curl -skL -A 'Mozilla/5.0' -o /tmp/tirupati-pdp.html -w '%{http_code}' --connect-timeout 5 "$URL" || echo FAIL)
  echo "HTTP=$CODE bytes=$(wc -c < /tmp/tirupati-pdp.html 2>/dev/null || echo 0)"
  if [[ "${CODE}" =~ ^2 ]]; then
    break
  fi
done
echo "view_image_count=$(grep -o 'View image' /tmp/tirupati-pdp.html 2>/dev/null | wc -l)"
grep -oE 'View image [0-9]+' /tmp/tirupati-pdp.html 2>/dev/null | sort | uniq -c || true
echo "WA0131=$(grep -o 'WA0131' /tmp/tirupati-pdp.html 2>/dev/null | wc -l)"
echo "WA0137=$(grep -o 'WA0137' /tmp/tirupati-pdp.html 2>/dev/null | wc -l)"
echo "PRIMARY=$(grep -o 'file_00000000436c821197f216240f4cd1d4' /tmp/tirupati-pdp.html 2>/dev/null | wc -l)"
python3 - <<'PY'
import re
try:
    html=open('/tmp/tirupati-pdp.html','r',encoding='utf-8',errors='replace').read()
except Exception as e:
    print('no html', e); raise SystemExit
t=re.search(r'<title>[^<]+', html)
print('title:', t.group(0) if t else 'none')
imgs=re.findall(r'https://res\.cloudinary\.com/tcjtyr02/image/upload/[^"\\]+', html)
uniq=[]
for u in imgs:
    if u not in uniq: uniq.append(u)
print('unique cloudinary urls in html:', len(uniq))
for u in uniq:
    print(' ', u)
print('aria View image labels:', len(re.findall(r'View image \d+', html)))
PY
# nginx sites
echo '--- nginx listen ---'
ss -lntp | grep -E ':80|:443|:3000' || true
