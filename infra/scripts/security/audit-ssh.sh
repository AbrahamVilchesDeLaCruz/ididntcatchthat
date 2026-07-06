#!/usr/bin/env bash
# Audit SSH hardening: fail2ban status and recent auth failures.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_common.sh
source "${SCRIPT_DIR}/_common.sh"

log_section "fail2ban service"
if command -v systemctl >/dev/null 2>&1; then
  run_as_root systemctl status fail2ban --no-pager 2>/dev/null || echo "fail2ban not running"
else
  echo "systemctl not available"
fi

log_section "fail2ban sshd jail"
if command -v fail2ban-client >/dev/null 2>&1; then
  run_as_root fail2ban-client status sshd 2>/dev/null || echo "sshd jail not configured"
else
  echo "fail2ban-client not installed"
fi

log_section "Recent SSH failures (auth.log)"
if [[ -f /var/log/auth.log ]]; then
  run_as_root grep -iE 'Failed password|Invalid user' /var/log/auth.log 2>/dev/null | tail -30 || true
elif [[ -f /var/log/secure ]]; then
  run_as_root grep -iE 'Failed password|Invalid user' /var/log/secure 2>/dev/null | tail -30 || true
else
  echo "No auth.log or secure log found"
fi

log_section "PermitRootLogin"
if [[ -f /etc/ssh/sshd_config ]]; then
  run_as_root grep -E '^PermitRootLogin|^#PermitRootLogin' /etc/ssh/sshd_config 2>/dev/null || true
fi
