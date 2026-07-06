#!/usr/bin/env bash
# Shared helpers for VPS security audit scripts.
set -euo pipefail

readonly SENSITIVE_PORTS=(5672 15672 9090 3002 3100 3001 4001 3000 4000 5432 9000)

log_section() {
  echo ""
  echo "=== $1 ==="
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: required command not found: $1" >&2
    exit 1
  fi
}

detect_public_interface() {
  ip route | awk '/default/ {print $5; exit}'
}

detect_public_ip() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsS --max-time 5 ifconfig.me 2>/dev/null || true
  fi
}

run_as_root() {
  if [[ "${EUID}" -eq 0 ]]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    echo "ERROR: root or sudo required for: $*" >&2
    exit 1
  fi
}
