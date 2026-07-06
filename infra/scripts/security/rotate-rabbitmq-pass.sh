#!/usr/bin/env bash
# Rotate RABBITMQ_PASS in Doppler (dev config) and print redeploy steps.
# Requires: doppler CLI authenticated. Set ROTATE_CONFIRM=yes to apply.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_common.sh
source "${SCRIPT_DIR}/_common.sh"

CONFIG="${DOPPLER_CONFIG:-dev}"
PROJECT="${DOPPLER_PROJECT:-ididntcatchthat}"

require_command doppler
require_command openssl

NEW_PASS="$(openssl rand -base64 32)"

log_section "RabbitMQ password rotation (${PROJECT}/${CONFIG})"

echo "This will:"
echo "  1. Set RABBITMQ_PASS in Doppler (${CONFIG})"
echo "  2. Require redeploy: make deploy-dev (or vps-deploy-dev on VPS)"
echo ""
echo "Ensure AMQP_URI in Doppler uses \${RABBITMQ_USER}:\${RABBITMQ_PASS} or update manually after rotation."
echo ""

if [[ "${ROTATE_CONFIRM:-}" != "yes" ]]; then
  echo "Dry run — generated password (NOT applied):"
  echo "  RABBITMQ_PASS=${NEW_PASS}"
  echo ""
  echo "To apply: ROTATE_CONFIRM=yes DOPPLER_CONFIG=${CONFIG} $0"
  exit 0
fi

doppler secrets set "RABBITMQ_PASS=${NEW_PASS}" --config "${CONFIG}" --project "${PROJECT}"

echo ""
echo "RABBITMQ_PASS rotated in Doppler (${CONFIG})."
echo "Next steps on VPS:"
echo "  cd /opt/ididntcatchthat-dev && make deploy-dev"
echo "  make security-verify"
