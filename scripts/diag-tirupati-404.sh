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
    select: {
      id: true,
      sku: true,
      slug: true,
      status: true,
      active: true,
      image: true,
      images: true,
      name: true,
    },
  })
  console.log(JSON.stringify(row, null, 2))
  // also list nginx server_name
}
main().finally(() => prisma.$disconnect())
NODE
echo '--- nginx server_name ---'
grep -R "server_name" /etc/nginx/sites-enabled/ 2>/dev/null | head -40 || grep -R "server_name" /etc/nginx/conf.d/ 2>/dev/null | head -40 || true
echo '--- try common hosts ---'
for H in sambhavihandloom.com www.sambhavihandloom.com sambhaviheritagereimagined.com www.sambhaviheritagereimagined.com; do
  CODE=$(curl -skL -H "Host: $H" -o /tmp/p.html -w '%{http_code}' --connect-timeout 5 "https://127.0.0.1/product/tirupati-durga-puja-special" || echo FAIL)
  TITLE=$(python3 -c "import re;h=open('/tmp/p.html',encoding='utf-8',errors='replace').read();m=re.search(r'<title>[^<]+',h);print(m.group(0) if m else '')" 2>/dev/null || true)
  VIEWS=$(grep -o 'View image' /tmp/p.html 2>/dev/null | wc -l)
  echo "Host=$H HTTP=$CODE views=$VIEWS title=$TITLE"
done
# docker app direct
echo '--- docker :3000 with Host ---'
CODE=$(curl -sL -H 'Host: sambhavihandloom.com' -o /tmp/p.html -w '%{http_code}' --connect-timeout 5 'http://127.0.0.1:3000/product/tirupati-durga-puja-special' || echo FAIL)
echo "HTTP=$CODE"
python3 - <<'PY'
import re
html=open('/tmp/p.html',encoding='utf-8',errors='replace').read()
print('title', re.search(r'<title>[^<]+', html).group(0) if '<title>' in html else None)
print('bytes', len(html))
print('views', len(re.findall(r'View image \d+', html)))
print('WA0131', html.count('WA0131'))
print('404?', 'could not be found' in html)
# unique cloudinary
imgs=re.findall(r'https://res\.cloudinary\.com/tcjtyr02/image/upload/[^"\\]+', html)
uniq=list(dict.fromkeys(imgs))
print('cloudinary', len(uniq))
for u in uniq: print(' ', u)
PY
