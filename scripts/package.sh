#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="dist"
mkdir -p "$OUT"
if command -v ares-package >/dev/null 2>&1; then
  ares-package app service -o "$OUT"
  ls -lh "$OUT"
else
  echo "ares-cli no instalado. Instala con: npm i -g @webos-tools/cli"
  echo "Luego: ares-package app service -o dist"
  exit 1
fi
