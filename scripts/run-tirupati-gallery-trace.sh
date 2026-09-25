#!/usr/bin/env bash
set -euo pipefail
set -a
. /var/www/sambhavi-handloom/shared/.env
set +a
cd /var/www/sambhavi-handloom/current
node scripts/trace-tirupati-gallery-pipeline.js
echo "---HEADERS---"
for u in \
  "https://res.cloudinary.com/tcjtyr02/image/upload/v1790243072/file_00000000436c821197f216240f4cd1d4.png" \
  "https://res.cloudinary.com/tcjtyr02/image/upload/v1790243073/IMG-20260924-WA0137.jpg" \
  "https://res.cloudinary.com/tcjtyr02/image/upload/v1790243074/IMG-20260924-WA0131.jpg"
do
  echo "URL=$u"
  curl -sI "$u" | tr -d '\r' | grep -iE 'HTTP/|content-type|content-length|x-cld'
done
echo "---DOM_BUTTONS---"
HTML=$(curl -sL "https://sambhavihandloom.com/product/tirupati-durga-puja-special")
echo "$HTML" | grep -oE 'aria-label="View image [0-9]+"' | sort | uniq -c
echo "thumb_button_total=$(echo "$HTML" | grep -oE 'aria-label="View image [0-9]+"' | wc -l)"
echo "WA0131_count=$(echo "$HTML" | grep -o 'IMG-20260924-WA0131.jpg' | wc -l)"
echo "WA0137_count=$(echo "$HTML" | grep -o 'IMG-20260924-WA0137.jpg' | wc -l)"
echo "primary_count=$(echo "$HTML" | grep -o 'file_00000000436c821197f216240f4cd1d4.png' | wc -l)"
rm -f scripts/trace-tirupati-gallery-pipeline.js
