#!/bin/bash
# Uso: TV_DEVICE=tv npm run install-tv -- dist/com.shinchaneros.tv_1.1.1_all.ipk
set -euo pipefail
cd "$(dirname "$0")/.."
IPK="${1:-}"
if [ -z "$IPK" ]; then
  IPK=$(ls -t dist/*.ipk 2>/dev/null | head -n 1 || true)
fi
if [ -z "${IPK:-}" ] || [ ! -f "$IPK" ]; then
  echo "No hay .ipk. Ejecuta antes: npm run package"
  exit 1
fi
DEVICE="${TV_DEVICE:-tv}"
ares-install --device "$DEVICE" "$IPK"
ares-launch --device "$DEVICE" com.shinchaneros.tv
