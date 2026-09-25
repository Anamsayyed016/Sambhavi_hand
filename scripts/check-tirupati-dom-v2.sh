#!/usr/bin/env bash
set -euo pipefail
curl -sL -A 'Mozilla/5.0' -o /tmp/tirupati-pdp.html -w 'HTTP=%{http_code} BYTES=%{size_download}\n' \
  'https://sambhavihandloom.com/product/tirupati-durga-puja-special'
echo "wc=$(wc -c < /tmp/tirupati-pdp.html)"
echo "view_image_count=$(grep -o 'View image' /tmp/tirupati-pdp.html | wc -l)"
grep -oE 'View image [0-9]+' /tmp/tirupati-pdp.html | sort | uniq -c || true
echo "WA0131=$(grep -o 'WA0131' /tmp/tirupati-pdp.html | wc -l)"
echo "WA0137=$(grep -o 'WA0137' /tmp/tirupati-pdp.html | wc -l)"
echo "PRIMARY=$(grep -o 'file_00000000436c821197f216240f4cd1d4' /tmp/tirupati-pdp.html | wc -l)"
python3 - <<'PY'
import re
html=open('/tmp/tirupati-pdp.html','r',encoding='utf-8',errors='replace').read()
print('title snippet:', re.search(r'<title>[^<]+', html).group(0) if '<title>' in html else 'no title')
# Find RSC payload image arrays containing WA0131
for m in re.finditer(r'.{0,80}WA0131.{0,80}', html):
    print('CTX:', m.group(0).replace('\n',' ')[:200])
    break
# Count button elements with View image nearby
print('aria View image labels:', len(re.findall(r'View image \d+', html)))
# Check for self.__next_f or flight data with images
imgs=re.findall(r'https://res\.cloudinary\.com/tcjtyr02/image/upload/[^"\\]+', html)
uniq=[]
for u in imgs:
    if u not in uniq: uniq.append(u)
print('unique cloudinary urls in html:', len(uniq))
for u in uniq:
    print(' ', u)
PY
