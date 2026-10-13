#!/bin/bash
# Instala el .ipk en la TV por SSH/ares. Uso: TV_IP=192.168.1.50 bash scripts/install-tv.sh dist/*.ipk
set -euo pipefail
IPK="${1:-$(ls -t dist/*.ipk 2>/dev/null | head -n 1)}"
if [ -z "${IPK:-}" ] || [ ! -f "$IPK" ]; then
  echo "No hay .ipk. Ejecuta antes: npm run package"
  exit 1
fi
if [ -z "${TV_IP:-}" ]; then
  echo "Define TV_IP. Ejemplo: TV_IP=192.168.1.50 bash scripts/install-tv.sh"
  exit 1
fi
ares-install --device tv "$IPK"
ares-launch --device tv com.shinchaneros.tv
