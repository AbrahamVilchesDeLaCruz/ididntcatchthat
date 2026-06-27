.PHONY: up up-prod down down-prod restart restart-prod build rebuild \
        dev dev-infra dev-api dev-client \
        local-up local-down local-wait local-setup local-seed local-dev local-dev-api local-dev-client \
        logs logs-api logs-client ps \
        obs-up obs-down obs-logs \
        tunnel-dev tunnel-prod \
        clean purge prune clean-dangling \
        deploy-prod deploy-dev \
        vps-ps-prod vps-ps-dev \
        vps-logs-prod vps-logs-dev \
        vps-restart-prod vps-restart-dev \
        test\:e2e\:up test\:e2e\:down \
        test\:api\:unit test\:api\:e2e test\:api \
        test\:client\:unit test\:client\:e2e test\:client \
        test\:all \
        help

VPS_HOST     ?= $(shell doppler secrets get VPS_HOST --plain 2>/dev/null)

COMPOSE       = docker compose
COMPOSE_DEV   = doppler run --config dev  -- $(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml
COMPOSE_PROD  = doppler run --config prd  -- $(COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml
COMPOSE_TEST  = $(COMPOSE) -f docker-compose.test.yml
COMPOSE_LOCAL = $(COMPOSE) -f docker-compose.local.yml

API_DIR   = apps/api
CLIENT_DIR = apps/client

PROD_DIR = /opt/ididntcatchthat
DEV_DIR  = /opt/ididntcatchthat-dev

COMPOSE_VPS_PROD = doppler run --config prd -- $(COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml
COMPOSE_VPS_DEV  = doppler run --config dev -- $(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml

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

# ─── Dev (local) ──────────────────────────────────────────────────────────────

up: ## Build and start all services (dev)
	$(ensure-docker)
	@$(MAKE) clean-dangling
	$(COMPOSE_DEV) up -d --build

down: ## Stop all services (dev)
	$(ensure-docker)
	$(COMPOSE_DEV) down

restart: down up ## Restart all services (dev)

# ─── Prod ─────────────────────────────────────────────────────────────────────

up-prod: ## Build and start all services (prod)
	$(ensure-docker)
	@$(MAKE) clean-dangling
	$(COMPOSE_PROD) up -d --build

down-prod: ## Stop all services (prod)
	$(ensure-docker)
	$(COMPOSE_PROD) down

restart-prod: down-prod up-prod ## Restart all services (prod)

# ─── Local dev servers (no Docker) ───────────────────────────────────────────
# Doppler dev AMQP_URI uses hostname "rabbitmq" (Docker network). Host-side dev
# rewrites it to localhost and expects `make dev-infra` (RabbitMQ container).

dev-infra: ## RabbitMQ only (:5672) — required before make dev / make dev-api
	$(ensure-docker)
	$(COMPOSE_DEV) up -d rabbitmq --wait

dev: dev-infra ## Hot-reload api + client (Doppler); starts RabbitMQ if needed
	doppler run --command 'export AMQP_URI=$${AMQP_URI/rabbitmq/localhost}; export VITE_API_PROXY_TARGET=http://localhost:$${PORT:-3000}; pnpm --filter @ididntcatchthat/api start:dev & pnpm --filter @ididntcatchthat/client dev'

dev-api: dev-infra ## API hot-reload with Doppler (AMQP → localhost)
	doppler run --command 'export AMQP_URI=$${AMQP_URI/rabbitmq/localhost}; pnpm --filter @ididntcatchthat/api start:dev'

dev-client: ## Client Vite HMR with Doppler
	doppler run --command 'export VITE_API_PROXY_TARGET=http://localhost:$${PORT:-3000}; pnpm --filter @ididntcatchthat/client dev'

# ─── Local profile (no Doppler, no paid services) ─────────────────────────────

local-up: ## Start local infra (Postgres :5434, RabbitMQ :5674, MinIO :9000)
	$(ensure-docker)
	$(COMPOSE_LOCAL) up -d postgres rabbitmq minio --wait
	$(COMPOSE_LOCAL) --profile init up minio-init --no-deps

local-down: ## Stop local infra
	$(ensure-docker)
	$(COMPOSE_LOCAL) --profile init down
	$(COMPOSE_LOCAL) down

local-wait: ## Wait until local infra is healthy
	$(ensure-docker)
	$(COMPOSE_LOCAL) up -d postgres rabbitmq minio --wait

local-setup: ## Copy .env.local.example → .env.local (api + client) if missing
	@test -f $(API_DIR)/.env.local || cp $(API_DIR)/.env.local.example $(API_DIR)/.env.local
	@test -f $(CLIENT_DIR)/.env.local || cp $(CLIENT_DIR)/.env.local.example $(CLIENT_DIR)/.env.local
	@echo "✅ Local env files ready ($(API_DIR)/.env.local, $(CLIENT_DIR)/.env.local)"

local-seed: local-wait ## Run migrations + demo seed against local Postgres
	@pnpm --filter @ididntcatchthat/api seed:local

local-dev-api: ## Start API with .env.local (no Doppler)
	@pnpm --filter @ididntcatchthat/api start:dev

local-dev-client: ## Start client with .env.local (no Doppler)
	@pnpm --filter @ididntcatchthat/client dev

local-dev: local-up local-setup ## Start infra + api + client dev servers (no Doppler)
	@echo "🚀 Starting API (:3000) and Client (:5173) with local profile..."
	@pnpm --filter @ididntcatchthat/api start:dev & \
	pnpm --filter @ididntcatchthat/client dev

# ─── Build ────────────────────────────────────────────────────────────────────

build: ## Build all images (dev)
	$(ensure-docker)
	$(COMPOSE_DEV) build

rebuild: ## Force rebuild all images without cache (dev)
	$(ensure-docker)
	$(COMPOSE_DEV) build --no-cache

# ─── Observability (dev) ──────────────────────────────────────────────────────

obs-up: ## Start observability stack only (Prometheus + Grafana + Loki)
	$(ensure-docker)
	$(COMPOSE_DEV) up -d prometheus grafana loki

obs-down: ## Stop observability stack
	$(ensure-docker)
	$(COMPOSE_DEV) stop prometheus grafana loki

obs-logs: ## Tail logs from observability services
	$(COMPOSE_DEV) logs -f prometheus grafana loki

# ─── Logs ─────────────────────────────────────────────────────────────────────

logs: ## Tail logs from all services
	$(COMPOSE_DEV) logs -f

logs-api: ## Tail logs from api only
	$(COMPOSE_DEV) logs -f api

logs-client: ## Tail logs from client only
	$(COMPOSE_DEV) logs -f client

# ─── Status ───────────────────────────────────────────────────────────────────

ps: ## Show status of all containers
	$(COMPOSE_DEV) ps

# ─── Cleanup ──────────────────────────────────────────────────────────────────

clean-dangling: ## Remove dangling images (untagged)
	docker image prune -f

clean: down clean-dangling ## Stop containers and remove dangling images
	docker container prune -f

purge: clean ## ⚠️  Also removes volumes (deletes all data)
	$(COMPOSE_DEV) down -v
	docker volume prune -f

prune: ## ☢️  Nuclear: removes all unused Docker resources
	docker system prune -af --volumes

# ─── Observability tunnels ────────────────────────────────────────────────────

tunnel-dev: ## Open SSH tunnel to dev observability (Prometheus :9090, Grafana :3002, Loki :3100)
	@echo "🔭 Tunnel open → Prometheus: http://localhost:9090  Grafana: http://localhost:3002"
	@echo "   Press Ctrl+C to close."
	ssh -L 9090:localhost:9090 -L 3002:localhost:3002 -L 3100:localhost:3100 $(VPS_HOST) -N

tunnel-prod: ## Open SSH tunnel to prod observability (Prometheus :9091, Grafana :3003, Loki :3101)
	@echo "🔭 Tunnel open → Prometheus: http://localhost:9091  Grafana: http://localhost:3003"
	@echo "   Press Ctrl+C to close."
	ssh -L 9091:localhost:9091 -L 3003:localhost:3003 -L 3101:localhost:3101 $(VPS_HOST) -N

# ─── Tests ────────────────────────────────────────────────────────────────────
# E2E infra: local Docker Postgres — no Doppler needed.
# To add more infra services (RabbitMQ, Redis…) add them to docker-compose.test.yml
# and mirror them in .github/workflows/ci.yml under `services:`.

test\:e2e\:up: ## Start E2E test infrastructure (Postgres on :5433)
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

test\:api: ## Run all API tests — unit + E2E with combined coverage (starts infra, runs all, stops infra)
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

# ─── Help ─────────────────────────────────────────────────────────────────────

help: ## Show this help message
	@grep -E '^[a-zA-Z_:\\-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sed -E 's/\\:/-/g; s/:.*## / ## /' \
		| awk 'BEGIN {FS = " ## "}; {printf "  \033[36m%-26s\033[0m %s\n", $$1, $$2}'

# ─── VPS Deploy ───────────────────────────────────────────────────────────────

deploy-prod: ## [VPS] Sync main + build + recreate prod containers
	git -C $(PROD_DIR) fetch origin
	git -C $(PROD_DIR) reset --hard origin/main
	doppler run --config prd --project ididntcatchthat -- docker compose -f $(PROD_DIR)/docker-compose.yml -f $(PROD_DIR)/docker-compose.prod.yml up -d --build

deploy-dev: ## [VPS] Sync dev + build + recreate dev containers
	git -C $(DEV_DIR) fetch origin
	git -C $(DEV_DIR) reset --hard origin/dev
	doppler run --config dev --project ididntcatchthat -- docker compose -f $(DEV_DIR)/docker-compose.yml -f $(DEV_DIR)/docker-compose.dev.yml up -d --build

deploy-dev-no-cache: ## [VPS] Sync dev + build sin cache + recreate dev containers
	git -C $(DEV_DIR) fetch origin
	git -C $(DEV_DIR) reset --hard origin/dev
	doppler run --config dev --project ididntcatchthat -- docker compose -f $(DEV_DIR)/docker-compose.yml -f $(DEV_DIR)/docker-compose.dev.yml build --no-cache
	doppler run --config dev --project ididntcatchthat -- docker compose -f $(DEV_DIR)/docker-compose.yml -f $(DEV_DIR)/docker-compose.dev.yml up -d

vps-ps-prod: ## [VPS] Status de containers prod
	doppler run --config prd --project ididntcatchthat -- docker compose -f $(PROD_DIR)/docker-compose.yml -f $(PROD_DIR)/docker-compose.prod.yml ps

vps-ps-dev: ## [VPS] Status de containers dev
	doppler run --config dev --project ididntcatchthat -- docker compose -f $(DEV_DIR)/docker-compose.yml -f $(DEV_DIR)/docker-compose.dev.yml ps

vps-logs-prod: ## [VPS] Logs prod (tail)
	doppler run --config prd --project ididntcatchthat -- docker compose -f $(PROD_DIR)/docker-compose.yml -f $(PROD_DIR)/docker-compose.prod.yml logs -f

vps-logs-dev: ## [VPS] Logs dev (tail)
	doppler run --config dev --project ididntcatchthat -- docker compose -f $(DEV_DIR)/docker-compose.yml -f $(DEV_DIR)/docker-compose.dev.yml logs -f

vps-restart-prod: ## [VPS] Restart prod containers
	doppler run --config prd --project ididntcatchthat -- docker compose -f $(PROD_DIR)/docker-compose.yml -f $(PROD_DIR)/docker-compose.prod.yml restart

vps-restart-dev: ## [VPS] Restart dev containers
	doppler run --config dev --project ididntcatchthat -- docker compose -f $(DEV_DIR)/docker-compose.yml -f $(DEV_DIR)/docker-compose.dev.yml restart

.DEFAULT_GOAL := help
