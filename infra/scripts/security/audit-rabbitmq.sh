#!/usr/bin/env bash
# Audit RabbitMQ logs and broker state for a dev or prod stack.
# Usage: audit-rabbitmq.sh [dev|prod|all]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_common.sh
source "${SCRIPT_DIR}/_common.sh"

STACK="${1:-all}"

audit_stack() {
  local stack="$1"
  local container="ididntcatchthat-rabbitmq-${stack}"
  local audit_log="/tmp/rabbitmq-auth-audit-${stack}.log"

  log_section "RabbitMQ audit: ${stack} (${container})"

  if ! docker ps --format '{{.Names}}' | grep -qx "${container}"; then
    echo "Container not running: ${container} (skipped)"
    return 0
  fi

  log_section "Full auth/connection log extract"
  docker logs "${container}" 2>&1 \
    | grep -iE 'login|authenticated|access refused|guest|closing AMQP|accepting AMQP|successfully authenticated|logged in' \
    > "${audit_log}" || true
  echo "Lines in ${audit_log}: $(wc -l < "${audit_log}" | tr -d ' ')"

  if grep -qiE 'successfully authenticated|logged in' "${audit_log}" 2>/dev/null; then
    echo "WARNING: possible successful authentication events found:"
    grep -iE 'successfully authenticated|logged in' "${audit_log}" || true
  fi

  if grep -qi 'guest' "${audit_log}" 2>/dev/null; then
    echo "WARNING: guest-related log lines found:"
    grep -i 'guest' "${audit_log}" | tail -20 || true
  fi

  log_section "rabbitmqctl list_users"
  docker exec "${container}" rabbitmqctl list_users 2>/dev/null || echo "rabbitmqctl unavailable"

  log_section "rabbitmqctl list_permissions"
  docker exec "${container}" rabbitmqctl list_permissions -p / 2>/dev/null || true

  log_section "rabbitmqctl list_queues"
  docker exec "${container}" rabbitmqctl list_queues name messages consumers 2>/dev/null || true

  log_section "Management HTTP log tail (if exposed)"
  docker logs "${container}" 2>&1 | grep -iE 'HTTP|management|15672' | tail -50 || true
}

case "${STACK}" in
  dev) audit_stack dev ;;
  prod) audit_stack prod ;;
  all)
    audit_stack dev
    audit_stack prod
    ;;
  *)
    echo "Usage: $0 [dev|prod|all]" >&2
    exit 1
    ;;
esac
