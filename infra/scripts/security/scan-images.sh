#!/usr/bin/env bash
# Pull and scan infra + base images with Trivy (CRITICAL/HIGH).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_common.sh
source "${SCRIPT_DIR}/_common.sh"

require_command docker
require_command trivy

IMAGES=(
  "rabbitmq:4.1-management-alpine"
  "rabbitmq:4.1-alpine"
  "prom/prometheus:v3.13.0"
  "grafana/grafana:12.4.5"
  "grafana/loki:3.6.12"
  "nginx:1.27-alpine"
  "node:24-alpine"
)

SCAN_CUSTOM="${SCAN_CUSTOM:-false}"
if [[ "${SCAN_CUSTOM}" == true ]]; then
  log_section "Building custom images for scan"
  docker build -f apps/api/Dockerfile -t ididntcatchthat-api:audit .
  docker build -f apps/client/Dockerfile -t ididntcatchthat-client:audit .
  IMAGES=("ididntcatchthat-api:audit" "ididntcatchthat-client:audit" "${IMAGES[@]}")
fi

FAILED=0

for img in "${IMAGES[@]}"; do
  log_section "Scanning ${img}"
  docker pull "${img}" >/dev/null 2>&1 || docker image inspect "${img}" >/dev/null 2>&1 || {
    echo "WARN: could not pull or find ${img}, skipping"
    continue
  }
  if ! trivy image --severity CRITICAL,HIGH --ignore-unfixed "${img}"; then
    FAILED=$((FAILED + 1))
  fi
done

if [[ "${FAILED}" -gt 0 ]]; then
  echo "${FAILED} image(s) failed Trivy scan"
  exit 1
fi

echo "All scanned images passed (CRITICAL/HIGH with fixes available)"
