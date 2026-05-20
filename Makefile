.PHONY: up up-prod down down-prod restart restart-prod build rebuild \
        dev dev-api dev-client \
        logs logs-api logs-client ps \
        clean purge prune clean-dangling \
        help

COMPOSE      = docker compose
COMPOSE_DEV  = doppler run --config dev  -- $(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml
COMPOSE_PROD = doppler run --config prd  -- $(COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml

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

dev: ## Start api + client dev servers with Doppler (no Docker)
	doppler run --command "pnpm --filter @ididntcatchthat/api start:dev & pnpm --filter @ididntcatchthat/client dev"

dev-api: ## Start api dev server with Doppler (no Docker)
	doppler run -- pnpm --filter @ididntcatchthat/api start:dev

dev-client: ## Start client dev server with Doppler (no Docker)
	doppler run -- pnpm --filter @ididntcatchthat/client dev

# ─── Build ────────────────────────────────────────────────────────────────────

build: ## Build all images (dev)
	$(ensure-docker)
	$(COMPOSE_DEV) build

rebuild: ## Force rebuild all images without cache (dev)
	$(ensure-docker)
	$(COMPOSE_DEV) build --no-cache

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

# ─── Help ─────────────────────────────────────────────────────────────────────

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
