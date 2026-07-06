#!/usr/bin/env bash
# Probe public IP for sensitive ports. Exits 1 if any port accepts a connection.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_common.sh
source "${SCRIPT_DIR}/_common.sh"

require_command nc

PUBLIC_IP="${PUBLIC_IP:-$(detect_public_ip)}"
if [[ -z "${PUBLIC_IP}" ]]; then
  echo "ERROR: could not detect public IP. Set PUBLIC_IP manually." >&2
  exit 1
fi

PORTS=(5672 15672 9090 3100 3002 5432 3001 4001 3000 4000)
LEAKS=0

log_section "External probe against ${PUBLIC_IP}"

for port in "${PORTS[@]}"; do
  if nc -zv -w3 "${PUBLIC_IP}" "${port}" >/dev/null 2>&1; then
    echo "LEAK: port ${port} is reachable from this host"
    LEAKS=$((LEAKS + 1))
  else
    echo "OK: port ${port} closed or filtered"
  fi
done

echo ""
if [[ "${LEAKS}" -gt 0 ]]; then
  echo "FAILED: ${LEAKS} sensitive port(s) reachable externally"
  exit 1
fi

echo "PASSED: no sensitive ports reachable on ${PUBLIC_IP}"
