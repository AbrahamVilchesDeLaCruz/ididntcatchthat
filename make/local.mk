# make/local.mk
# LOCAL profile — self-contained stack with no Doppler and no paid services.
# Reads COMPOSE_LOCAL and ensure-docker from the root Makefile.
# Vars used here are declared locally so this file works standalone if sourced.

API_DIR    = apps/api
CLIENT_DIR = apps/client

.PHONY: local-setup local-up local-down local-dev local-dev-api local-seed \
        local-start \
        local-logs local-status local-reset local-dev-client local-shell-db

# ─── LOCAL (no Doppler, .env.local) ───────────────────────────────────────────

local-start: local-up local-seed ## Start full local stack + seed data (one-shot onboarding)

local-setup: ## Copy .env.example → .env.local (api + client)
	@test -f $(API_DIR)/.env.local || cp $(API_DIR)/.env.example $(API_DIR)/.env.local
	@test -f $(CLIENT_DIR)/.env.local || cp $(CLIENT_DIR)/.env.example $(CLIENT_DIR)/.env.local
	@echo "✅ Local env files ready ($(API_DIR)/.env.local, $(CLIENT_DIR)/.env.local)"

local-up: local-setup ## Start full local stack in Docker (no seed — run `local-seed` after, or `local-start` for both)
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
