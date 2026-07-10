# make/dev.mk
# DEV and PROD profiles — require Doppler CLI and access to remote services
# (Aiven Postgres, Cloudflare R2, ElevenLabs, DeepSeek).
# Reads COMPOSE_DEV, COMPOSE_PROD and ensure-docker from the root Makefile.

.PHONY: up down dev dev-api dev-client up-prod down-prod

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
