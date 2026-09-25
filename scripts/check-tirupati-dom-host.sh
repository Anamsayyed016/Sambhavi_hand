#!/usr/bin/env bash
set -euo pipefail
HOST='sambhavihandloom.com'
for URL in \
  "https://${HOST}/product/tirupati-durga-puja-special" \
  "http://127.0.0.1/product/tirupati-durga-puja-special" \
  "https://127.0.0.1/product/tirupati-durga-puja-special"
do
  echo "=== TRY $URL Host=$HOST ==="
  CODE=$(curl -skL -A 'Mozilla/5.0' -H "Host: $HOST" -o /tmp/tirupati-pdp.html -w '%{http_code}' --connect-timeout 8 --resolve "${HOST}:443:127.0.0.1" --resolve "${HOST}:80:127.0.0.1" "$URL" || echo FAIL)
  echo "HTTP=$CODE bytes=$(wc -c < /tmp/tirupati-pdp.html 2>/dev/null || echo 0)"
  if [[ "${CODE}" =~ ^2 ]]; then
    break
  fi
done
# fallback: curl public via resolve to self
if ! grep -q 'View image\|tirupati\|WA013' /tmp/tirupati-pdp.html 2>/dev/null; then
  echo '=== TRY resolve public hostname to 127.0.0.1 ==='
  CODE=$(curl -skL -A 'Mozilla/5.0' --resolve "${HOST}:443:127.0.0.1" -o /tmp/tirupati-pdp.html -w '%{http_code}' "https://${HOST}/product/tirupati-durga-puja-special" || echo FAIL)
  echo "HTTP=$CODE bytes=$(wc -c < /tmp/tirupati-pdp.html)"
fi
echo "view_image_count=$(grep -o 'View image' /tmp/tirupati-pdp.html 2>/dev/null | wc -l)"
grep -oE 'View image [0-9]+' /tmp/tirupati-pdp.html 2>/dev/null | sort | uniq -c || true
echo "WA0131=$(grep -o 'WA0131' /tmp/tirupati-pdp.html 2>/dev/null | wc -l)"
echo "WA0137=$(grep -o 'WA0137' /tmp/tirupati-pdp.html 2>/dev/null | wc -l)"
echo "PRIMARY=$(grep -o 'file_00000000436c821197f216240f4cd1d4' /tmp/tirupati-pdp.html 2>/dev/null | wc -l)"
python3 - <<'PY'
import re
html=open('/tmp/tirupati-pdp.html','r',encoding='utf-8',errors='replace').read()
t=re.search(r'<title>[^<]+', html)
print('title:', t.group(0) if t else 'none')
print('is 404?', 'This page could not be found' in html)
imgs=re.findall(r'https://res\.cloudinary\.com/tcjtyr02/image/upload/[^"\\]+', html)
uniq=[]
for u in imgs:
    if u not in uniq: uniq.append(u)
print('unique cloudinary urls in html:', len(uniq))
for u in uniq:
    print(' ', u)
print('aria View image labels:', len(re.findall(r'View image \d+', html)))
# Also dump product payload from RSC if present
m=re.search(r'"images":(\[[^\]]*\])', html)
if m: print('images json:', m.group(1)[:500])
m2=re.search(r'images\\":(\[[^\]]*\])', html)
if m2: print('images escaped:', m2.group(1)[:500])
PY
