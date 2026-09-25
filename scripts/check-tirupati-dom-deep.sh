#!/usr/bin/env bash
set -euo pipefail
URL="https://sambhavihandloom.com/product/tirupati-durga-puja-special"
OUT=/tmp/tirupati-pdp.html
CODE=$(curl -sL -o "$OUT" -w "%{http_code}" -A "Mozilla/5.0" "$URL")
echo "HTTP=$CODE bytes=$(wc -c < "$OUT")"
echo "--- aria-label View image ---"
grep -oE 'aria-label=\\"View image [0-9]+\\"|aria-label="View image [0-9]+"|aria-label='"'"'View image [0-9]+'"'"'' "$OUT" | sort | uniq -c || true
echo "--- escaped JSON images in RSC ---"
python3 - <<'PY'
import re, json
html=open('/tmp/tirupati-pdp.html','r',encoding='utf-8',errors='replace').read()
# count filename occurrences
for name in ['WA0131','WA0137','file_00000000436c821197f216240f4cd1d4']:
    print(f'{name}: {html.count(name)}')
# find images arrays near tirupati
m=re.findall(r'IMG-20260924-WA013[0-9]+\.jpg', html)
print('WA jpg refs:', sorted(set(m)), 'total', len(m))
# look for View image in any encoding
print('raw View image count:', html.count('View image'))
print('button count approx:', html.count('View image'))
# extract next data flight payloads containing images
idxs=[m.start() for m in re.finditer(r'tirupati-durga-puja-special', html)]
print('slug mentions:', len(idxs))
# Try to find images":[ pattern
for pat in [r'"images":\[([^\]]{0,2000})\]', r'images\\":\[([^\]]{0,2000})\]']:
    found=re.findall(pat, html)
    if found:
        print('pat', pat, 'hits', len(found))
        for f in found[:3]:
            print(' sample:', f[:400])
PY
# also hit next image optimizer for each
echo "--- next/image optimizer ---"
for path in \
  "/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Ftcjtyr02%2Fimage%2Fupload%2Fv1790243072%2Ffile_00000000436c821197f216240f4cd1d4.png&w=96&q=75" \
  "/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Ftcjtyr02%2Fimage%2Fupload%2Fv1790243073%2FIMG-20260924-WA0137.jpg&w=96&q=75" \
  "/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Ftcjtyr02%2Fimage%2Fupload%2Fv1790243074%2FIMG-20260924-WA0131.jpg&w=96&q=75"
do
  echo "PATH=$path"
  curl -sI -A "Mozilla/5.0" "https://sambhavihandloom.com$path" | tr -d '\r' | head -n 8
done
