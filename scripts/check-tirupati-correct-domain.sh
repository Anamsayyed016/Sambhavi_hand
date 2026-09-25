#!/usr/bin/env bash
set -euo pipefail
set -a
. /var/www/sambhavi-handloom/shared/.env
set +a
cd /var/www/sambhavi-handloom/current

node <<'NODE'
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const row = await prisma.product.findUnique({
    where: { slug: 'tirupati-durga-puja-special' },
    select: { id: true, sku: true, slug: true, status: true, image: true, images: true, name: true },
  })
  console.log('DB_ROW', JSON.stringify(row, null, 2))
}
main().finally(() => prisma.$disconnect())
NODE

HOST='sambhaviheritagereimagined.com'
URL="https://${HOST}/product/tirupati-durga-puja-special"
echo "=== FETCH $URL ==="
CODE=$(curl -sL -A 'Mozilla/5.0' -o /tmp/tirupati-pdp.html -w '%{http_code}' --connect-timeout 15 "$URL" || echo FAIL)
echo "HTTP=$CODE bytes=$(wc -c < /tmp/tirupati-pdp.html)"
echo "view_image_labels:"
grep -oE 'View image [0-9]+' /tmp/tirupati-pdp.html | sort | uniq -c || true
echo "WA0131=$(grep -o 'WA0131' /tmp/tirupati-pdp.html | wc -l)"
echo "WA0137=$(grep -o 'WA0137' /tmp/tirupati-pdp.html | wc -l)"
echo "PRIMARY=$(grep -o 'file_00000000436c821197f216240f4cd1d4' /tmp/tirupati-pdp.html | wc -l)"
python3 - <<'PY'
import re
html=open('/tmp/tirupati-pdp.html',encoding='utf-8',errors='replace').read()
t=re.search(r'<title>[^<]+', html)
print('title:', t.group(0) if t else None)
print('404?', 'could not be found' in html)
imgs=re.findall(r'https://res\.cloudinary\.com/tcjtyr02/image/upload/[^\s"\\]+', html)
uniq=list(dict.fromkeys(imgs))
print('unique cloudinary in HTML:', len(uniq))
for u in uniq:
    print(' ', u)
print('View image count:', len(re.findall(r'View image \d+', html)))
# look for images array in flight/RSC
for pat in [r'"images":\[(.*?)\]', r'images\\":\[(.*?)\]']:
    ms=re.findall(pat, html)
    for m in ms[:5]:
        if 'WA013' in m or 'cloudinary' in m or 'file_000' in m:
            print('IMAGES_PAYLOAD:', m[:600])
PY

# also via local upstream if public fails
if ! grep -q 'View image\|WA0131' /tmp/tirupati-pdp.html; then
  echo '=== FALLBACK local nginx with correct Host ==='
  CODE=$(curl -skL -H "Host: $HOST" --resolve "${HOST}:443:127.0.0.1" -o /tmp/tirupati-pdp.html -w '%{http_code}' "https://${HOST}/product/tirupati-durga-puja-special" || echo FAIL)
  echo "HTTP=$CODE bytes=$(wc -c < /tmp/tirupati-pdp.html)"
  grep -oE 'View image [0-9]+' /tmp/tirupati-pdp.html | sort | uniq -c || true
  echo "WA0131=$(grep -o 'WA0131' /tmp/tirupati-pdp.html | wc -l)"
fi
