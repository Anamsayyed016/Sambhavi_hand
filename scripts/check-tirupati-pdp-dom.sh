#!/bin/bash
set -euo pipefail
HTML=$(curl -sL 'https://sambhaviheritagereimagined.com/product/tirupati-durga-puja-special')
echo "=== aria View image labels ==="
echo "$HTML" | grep -oE 'View image [0-9]+' | sort | uniq -c
echo "=== product gallery filenames (WA0131/WA0137/primary) ==="
echo "$HTML" | grep -oE 'file_00000000436c821197f216240f4cd1d4[^\"[:space:]]*|IMG-20260924-WA0137[^\"[:space:]]*|IMG-20260924-WA0131[^\"[:space:]]*' | sed 's/[?\"].*//' | sort | uniq -c
echo "=== button count with View image ==="
echo "$HTML" | grep -c 'View image' || true
