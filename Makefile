# Root Makefile — thin dispatcher. All targets live in included modules under make/.
# Run `make help` (default goal) to see every available target.
#
# Module layout:
#   make/local.mk    self-contained local stack (no Doppler, .env.local)
#   make/dev.mk      dev/prod stacks (Doppler, remote DB + R2)
#   make/test.mk     unit and E2E test runners
#   make/server.mk   VPS deploys, nginx, security audits, observability tunnels

.PHONY: help

# ─── Shared variables (used by ≥2 modules) ────────────────────────────────────

COMPOSE       = docker compose --project-directory .
COMPOSE_LOCAL = $(COMPOSE) -p ididntcatchthat-local -f infra/docker-compose.local.yml
COMPOSE_DEV        = doppler run --config dev  -- $(COMPOSE) -p ididntcatchthat-dev  -f infra/docker-compose.yml -f infra/docker-compose.dev.yml
COMPOSE_DEV_HOST   = $(COMPOSE_DEV) -f infra/docker-compose.dev-host.yml
COMPOSE_PROD  = doppler run --config prd  -- $(COMPOSE) -p ididntcatchthat-prod -f infra/docker-compose.yml -f infra/docker-compose.prod.yml
COMPOSE_TEST  = $(COMPOSE) -p ididntcatchthat-test -f infra/docker-compose.test.yml

# ─── Docker daemon guard (used by all modules that touch docker) ─────────────

define ensure-docker
	@if ! docker info > /dev/null 2>&1; then \
		echo "⚙️  Docker is not running. Attempting to start..."; \
		if [ "$$(uname)" = "Darwin" ]; then \
			open -a Docker; \
			echo "⏳ Waiting for Docker Desktop..."; \
			for i in $$(seq 1 30); do \
				docker info > /dev/null 2>&1 && break; \
				sleep 2; \
			done; \
		elif [ "$$(uname)" = "Linux" ]; then \
			sudo systemctl start docker; \
		fi; \
		if ! docker info > /dev/null 2>&1; then \
			echo "❌ Docker failed to start. Please start it manually."; \
			exit 1; \
		fi; \
		echo "✅ Docker is running."; \
	fi
endef

# ─── Module includes ─────────────────────────────────────────────────────────

include make/local.mk
include make/dev.mk
include make/test.mk
include make/server.mk

# ─── Help ────────────────────────────────────────────────────────────────────

help: ## Show this help message
	@grep -hE '^[a-zA-Z_:\\-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sed -E 's/\\:/-/g; s/:.*## / ## /' \
		| awk 'BEGIN {FS = " ## "}; {printf "  \033[36m%-26s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
