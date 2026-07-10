.PHONY: local-setup local-up local-down local-dev local-dev-api local-seed \
        local-logs local-status local-reset local-dev-client local-shell-db \
        up down dev dev-api dev-client \
        up-prod down-prod \
        test\:e2e\:up test\:e2e\:down \
        test\:api\:unit test\:api\:e2e test\:api \
        test\:client\:unit test\:client\:e2e test\:client \
        test\:all \
        help

VPS_HOST     ?= $(shell doppler secrets get VPS_HOST --plain 2>/dev/null)

COMPOSE       = docker compose --project-directory .
COMPOSE_LOCAL = $(COMPOSE) -p ididntcatchthat-local -f infra/docker-compose.local.yml
COMPOSE_DEV        = doppler run --config dev  -- $(COMPOSE) -p ididntcatchthat-dev  -f infra/docker-compose.yml -f infra/docker-compose.dev.yml
COMPOSE_DEV_HOST   = $(COMPOSE_DEV) -f infra/docker-compose.dev-host.yml
COMPOSE_PROD  = doppler run --config prd  -- $(COMPOSE) -p ididntcatchthat-prod -f infra/docker-compose.yml -f infra/docker-compose.prod.yml
COMPOSE_TEST  = $(COMPOSE) -p ididntcatchthat-test -f infra/docker-compose.test.yml

API_DIR    = apps/api
CLIENT_DIR = apps/client

PROD_DIR = /opt/ididntcatchthat
DEV_DIR  = /opt/ididntcatchthat-dev

# ─── Docker daemon guard ──────────────────────────────────────────────────────

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

# ─── LOCAL (no Doppler, .env.local) ───────────────────────────────────────────

local-setup: ## Copy .env.example → .env.local (api + client)
	@test -f $(API_DIR)/.env.local || cp $(API_DIR)/.env.example $(API_DIR)/.env.local
	@test -f $(CLIENT_DIR)/.env.local || cp $(CLIENT_DIR)/.env.example $(CLIENT_DIR)/.env.local
	@echo "✅ Local env files ready ($(API_DIR)/.env.local, $(CLIENT_DIR)/.env.local)"

local-up: local-setup ## Start full local stack in Docker (api, client, postgres, rabbitmq, minio)
	$(ensure-docker)
	$(COMPOSE_LOCAL) up -d --build --wait
	$(COMPOSE_LOCAL) --profile init up minio-init --no-deps

local-down: ## Stop local stack
	$(ensure-docker)
	$(COMPOSE_LOCAL) --profile init down
	$(COMPOSE_LOCAL) down

local-seed: ## Run migrations + demo seed against local Postgres
	@pnpm --filter @ididntcatchthat/api seed:local

local-dev: local-setup ## Start infra in Docker + run api & client on host (hot-reload, .env.local)
	$(ensure-docker)
	$(COMPOSE_LOCAL) up -d postgres rabbitmq minio --wait
	$(COMPOSE_LOCAL) --profile init up minio-init --no-deps
	@echo "🚀 Starting API (:3000) and Client (:5173) with local profile..."
	@pnpm --filter @ididntcatchthat/api start:dev & \
	pnpm --filter @ididntcatchthat/client dev

local-dev-api: local-setup ## Run api on host only (.env.local, hot-reload). Requires `local-up` or `local-dev` running first.
	$(ensure-docker)
	@docker exec ididntcatchthat-postgres-local pg_isready -U local > /dev/null 2>&1 || \
		(echo "❌ Local Postgres is not running. Run 'make local-up' or 'make local-dev' first." && exit 1)
	@pnpm --filter @ididntcatchthat/api start:dev

local-dev-client: local-setup ## Run client on host only (.env.local, Vite HMR)
	@pnpm --filter @ididntcatchthat/client dev

local-logs: ## Tail logs from all local services
	$(ensure-docker)
	$(COMPOSE_LOCAL) logs -f

local-status: ## Status of local containers
	$(ensure-docker)
	$(COMPOSE_LOCAL) ps

local-reset: ## ⚠️  Stop, remove volumes, re-up, re-seed (DESTROYS ALL LOCAL DATA)
	@echo "⚠️  This will DELETE all local Postgres, MinIO, and RabbitMQ data."
	@read -p "Continue? [y/N] " r && [ "$$r" = "y" ] || exit 1
	$(ensure-docker)
	-$(COMPOSE_LOCAL) --profile init down -v
	$(COMPOSE_LOCAL) down -v
	$(MAKE) local-up
	$(MAKE) local-seed

local-shell-db: ## Open psql shell in local Postgres
	$(ensure-docker)
	$(COMPOSE_LOCAL) exec postgres psql -U local -d ididntcatchthat_local

# ─── DEV (Doppler dev, external DB) ───────────────────────────────────────────

up: ## Start full dev stack in Docker (Doppler)
	$(ensure-docker)
	docker image prune -f
	$(COMPOSE_DEV) up -d --build

down: ## Stop dev stack
	$(ensure-docker)
	$(COMPOSE_DEV) down

dev: ## Start RabbitMQ in Docker + run api & client on host (Doppler, hot-reload)
	$(ensure-docker)
	$(COMPOSE_DEV_HOST) up -d rabbitmq --wait
	doppler run --command 'export AMQP_URI=$${AMQP_URI/rabbitmq/localhost}; unset VITE_API_URL; export VITE_API_PROXY_TARGET=http://localhost:$${PORT:-3000}; pnpm --filter @ididntcatchthat/api start:dev & pnpm --filter @ididntcatchthat/client dev'

dev-api: ## Run api on host only (Doppler, hot-reload)
	$(ensure-docker)
	$(COMPOSE_DEV_HOST) up -d rabbitmq --wait
	doppler run --command 'export AMQP_URI=$${AMQP_URI/rabbitmq/localhost}; pnpm --filter @ididntcatchthat/api start:dev'

dev-client: ## Run client Vite HMR (Doppler)
	doppler run --command 'unset VITE_API_URL; export VITE_API_PROXY_TARGET=http://localhost:$${PORT:-3000}; pnpm --filter @ididntcatchthat/client dev'

# ─── PROD (Doppler prd) ────────────────────────────────────────────────────────

up-prod: ## Start full prod stack in Docker (Doppler)
	$(ensure-docker)
	docker image prune -f
	$(COMPOSE_PROD) up -d --build

down-prod: ## Stop prod stack
	$(ensure-docker)
	$(COMPOSE_PROD) down

# ─── TEST ─────────────────────────────────────────────────────────────────────

test\:e2e\:up: ## Start E2E test infrastructure (Postgres :5433, RabbitMQ :5673)
	$(ensure-docker)
	$(COMPOSE_TEST) up -d --wait

test\:e2e\:down: ## Stop and remove E2E test infrastructure
	$(ensure-docker)
	$(COMPOSE_TEST) down -v

test\:api\:unit: ## Run API unit tests only
	pnpm --filter @ididntcatchthat/api test

test\:api\:e2e: ## Run API E2E tests (starts infra, runs tests, stops infra)
	$(ensure-docker)
	$(COMPOSE_TEST) up -d --wait
	pnpm --filter @ididntcatchthat/api test:e2e:ci; \
	EXIT_CODE=$$?; \
	$(COMPOSE_TEST) down -v; \
	exit $$EXIT_CODE

test\:api: ## Run all API tests — unit + E2E with combined coverage
	$(ensure-docker)
	$(COMPOSE_TEST) up -d --wait; \
	pnpm --filter @ididntcatchthat/api test:cov:all; \
	EXIT_CODE=$$?; \
	$(COMPOSE_TEST) down -v; \
	exit $$EXIT_CODE

test\:client\:unit: ## Run client unit tests only
	pnpm --filter @ididntcatchthat/client test

test\:client\:e2e: ## Run client E2E tests only
	pnpm --filter @ididntcatchthat/client test:e2e

test\:client: ## Run all client tests — unit + E2E
	pnpm --filter @ididntcatchthat/client test && \
	pnpm --filter @ididntcatchthat/client test:e2e

test\:all: ## Run all tests — API (unit + E2E) + client (unit + E2E)
	$(ensure-docker)
	pnpm --filter @ididntcatchthat/api test; \
	API_UNIT=$$?; \
	$(COMPOSE_TEST) up -d --wait; \
	pnpm --filter @ididntcatchthat/api test:e2e:ci; \
	API_E2E=$$?; \
	$(COMPOSE_TEST) down -v; \
	pnpm --filter @ididntcatchthat/client test; \
	CLIENT_UNIT=$$?; \
	pnpm --filter @ididntcatchthat/client test:e2e; \
	CLIENT_E2E=$$?; \
	exit $$(( API_UNIT || API_E2E || CLIENT_UNIT || CLIENT_E2E ))


# ─── OPS (VPS, nginx, security, observability, cleanup) ──────────────────────
# Operational commands live in infra/Makefile.ops — pulled in here so they
# still resolve and appear in `make help`.

include infra/Makefile.ops

# ─── HELP ─────────────────────────────────────────────────────────────────────

help: ## Show this help message
	@grep -hE '^[a-zA-Z_:\\-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sed -E 's/\\:/-/g; s/:.*## / ## /' \
		| awk 'BEGIN {FS = " ## "}; {printf "  \033[36m%-26s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
