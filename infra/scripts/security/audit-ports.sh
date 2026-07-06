#!/usr/bin/env bash
# Audit listening ports, Docker publish mappings, UFW and iptables DOCKER chains.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_common.sh
source "${SCRIPT_DIR}/_common.sh"

log_section "All TCP listeners (ss -tlnp)"
require_command ss
run_as_root ss -tlnp || true

log_section "Docker container port mappings"
require_command docker
docker ps --format 'table {{.Names}}\t{{.Ports}}' || true

log_section "Sensitive ports quick check"
for port in "${SENSITIVE_PORTS[@]}"; do
  if run_as_root ss -tlnp "( sport = :${port} )" 2>/dev/null | grep -q LISTEN; then
    echo "LISTENING: ${port}"
    run_as_root ss -tlnp "( sport = :${port} )" 2>/dev/null || true
  fi
done

log_section "UFW status"
if command -v ufw >/dev/null 2>&1; then
  run_as_root ufw status verbose || true
else
  echo "ufw not installed"
fi

log_section "iptables DOCKER chain (first 25 rules)"
if command -v iptables >/dev/null 2>&1; then
  run_as_root iptables -L DOCKER -n --line-numbers 2>/dev/null | head -25 || true
  log_section "iptables DOCKER-USER chain"
  run_as_root iptables -L DOCKER-USER -n --line-numbers 2>/dev/null || true
else
  echo "iptables not available"
fi

echo ""
echo "Audit complete. Review any 0.0.0.0 bindings on sensitive ports above."
