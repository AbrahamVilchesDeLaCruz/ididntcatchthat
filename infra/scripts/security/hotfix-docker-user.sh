#!/usr/bin/env bash
# Temporary DOCKER-USER iptables block for Docker-published sensitive ports.
# Usage: hotfix-docker-user.sh [--dry-run]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_common.sh
source "${SCRIPT_DIR}/_common.sh"

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

IFACE="${PUBLIC_IFACE:-$(detect_public_interface)}"
if [[ -z "${IFACE}" ]]; then
  echo "ERROR: could not detect public interface. Set PUBLIC_IFACE." >&2
  exit 1
fi

RULES=(
  "-i ${IFACE} -p tcp -m multiport --dports 5672,15672,9090,3002,3100 -j DROP"
  "-i ${IFACE} -p tcp -m multiport --dports 3001,4001,3000,4000 -j DROP"
)

log_section "DOCKER-USER hotfix on interface ${IFACE}"

for rule in "${RULES[@]}"; do
  cmd=(iptables -I DOCKER-USER ${rule})
  echo "${cmd[*]}"
  if [[ "${DRY_RUN}" == false ]]; then
    if [[ "${EUID}" -ne 0 ]]; then
      read -r -p "Apply iptables rule? [y/N] " confirm
      if [[ "${confirm}" != [yY] ]]; then
        echo "Skipped."
        continue
      fi
    fi
    run_as_root iptables -I DOCKER-USER ${rule}
  fi
done

if [[ "${DRY_RUN}" == true ]]; then
  echo "Dry run complete — no rules applied."
  exit 0
fi

log_section "Persist rules (Ubuntu netfilter-persistent)"
if command -v netfilter-persistent >/dev/null 2>&1; then
  run_as_root netfilter-persistent save
  echo "Rules saved via netfilter-persistent"
elif command -v apt-get >/dev/null 2>&1; then
  echo "Install persistence: sudo apt install -y iptables-persistent && sudo netfilter-persistent save"
else
  echo "Save manually: sudo iptables-save | sudo tee /etc/iptables/rules.v4"
fi

echo "Hotfix applied. Redeploy compose fix ASAP — this is not a permanent substitute."
