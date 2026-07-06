.PHONY: local-setup local-up local-down local-dev local-dev-api local-seed \
        up down dev dev-api dev-client \
        up-prod down-prod \
        test\:e2e\:up test\:e2e\:down \
        test\:api\:unit test\:api\:e2e test\:api \
        test\:client\:unit test\:client\:e2e test\:client \
        test\:all \
        obs-up obs-down \
        tunnel-dev tunnel-prod \
        vps-deploy-prod vps-deploy-dev \
        vps-ps-prod vps-ps-dev \
        vps-logs-prod vps-logs-dev \
        vps-restart-prod vps-restart-dev \
        nginx-setup nginx-reload \
        security-audit security-audit-ports security-audit-rabbitmq security-audit-ssh \
        security-probe-external security-verify security-hotfix-iptables \
        security-scan-images security-rotate-rabbitmq \
        rebuild clean purge prune \
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

local-dev-api: ## Run api on host only (.env.local, hot-reload)
	@pnpm --filter @ididntcatchthat/api start:dev

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
	doppler run --command 'export AMQP_URI=$${AMQP_URI/rabbitmq/localhost}; export VITE_API_PROXY_TARGET=http://localhost:$${PORT:-3000}; pnpm --filter @ididntcatchthat/api start:dev & pnpm --filter @ididntcatchthat/client dev'

dev-api: ## Run api on host only (Doppler, hot-reload)
	$(ensure-docker)
	$(COMPOSE_DEV_HOST) up -d rabbitmq --wait
	doppler run --command 'export AMQP_URI=$${AMQP_URI/rabbitmq/localhost}; pnpm --filter @ididntcatchthat/api start:dev'

dev-client: ## Run client Vite HMR (Doppler)
	doppler run --command 'export VITE_API_PROXY_TARGET=http://localhost:$${PORT:-3000}; pnpm --filter @ididntcatchthat/client dev'

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

# ─── OBSERVABILITY ────────────────────────────────────────────────────────────

obs-up: ## Start observability stack only (Prometheus + Grafana + Loki)
	$(ensure-docker)
	$(COMPOSE_DEV) up -d prometheus grafana loki

obs-down: ## Stop observability stack
	$(ensure-docker)
	$(COMPOSE_DEV) stop prometheus grafana loki

tunnel-dev: ## Open SSH tunnel to dev observability (Prometheus :9090, Grafana :3002, Loki :3100)
	@echo "🔭 Tunnel open → Prometheus: http://localhost:9090  Grafana: http://localhost:3002  Loki: http://localhost:3100"
	@echo "   (services bound to 127.0.0.1 on VPS — tunnel required)"
	@echo "   Press Ctrl+C to close."
	ssh -L 9090:localhost:9090 -L 3002:localhost:3002 -L 3100:localhost:3100 $(VPS_HOST) -N

tunnel-prod: ## Open SSH tunnel to prod observability (Prometheus :9091, Grafana :3003, Loki :3101)
	@echo "🔭 Tunnel open → Prometheus: http://localhost:9091  Grafana: http://localhost:3003"
	@echo "   Press Ctrl+C to close."
	ssh -L 9091:localhost:9091 -L 3003:localhost:3003 -L 3101:localhost:3101 $(VPS_HOST) -N

# ─── VPS ──────────────────────────────────────────────────────────────────────

vps-deploy-prod: ## [VPS] Sync main + build + recreate prod containers
	git -C $(PROD_DIR) fetch origin
	git -C $(PROD_DIR) reset --hard origin/main
	doppler run --config prd --project ididntcatchthat -- \
		docker compose --project-directory $(PROD_DIR) \
		-f $(PROD_DIR)/infra/docker-compose.yml \
		-f $(PROD_DIR)/infra/docker-compose.prod.yml \
		up -d --build

vps-deploy-dev: ## [VPS] Sync dev + build + recreate dev containers
	git -C $(DEV_DIR) fetch origin
	git -C $(DEV_DIR) reset --hard origin/dev
	doppler run --config dev --project ididntcatchthat -- \
		docker compose --project-directory $(DEV_DIR) \
		-f $(DEV_DIR)/infra/docker-compose.yml \
		-f $(DEV_DIR)/infra/docker-compose.dev.yml \
		up -d --build

deploy-dev: vps-deploy-dev ## Alias for vps-deploy-dev
deploy-prod: vps-deploy-prod ## Alias for vps-deploy-prod

vps-ps-prod: ## [VPS] Status of prod containers
	doppler run --config prd --project ididntcatchthat -- \
		docker compose --project-directory $(PROD_DIR) \
		-f $(PROD_DIR)/infra/docker-compose.yml \
		-f $(PROD_DIR)/infra/docker-compose.prod.yml ps

vps-ps-dev: ## [VPS] Status of dev containers
	doppler run --config dev --project ididntcatchthat -- \
		docker compose --project-directory $(DEV_DIR) \
		-f $(DEV_DIR)/infra/docker-compose.yml \
		-f $(DEV_DIR)/infra/docker-compose.dev.yml ps

vps-logs-prod: ## [VPS] Tail prod logs
	doppler run --config prd --project ididntcatchthat -- \
		docker compose --project-directory $(PROD_DIR) \
		-f $(PROD_DIR)/infra/docker-compose.yml \
		-f $(PROD_DIR)/infra/docker-compose.prod.yml logs -f

vps-logs-dev: ## [VPS] Tail dev logs
	doppler run --config dev --project ididntcatchthat -- \
		docker compose --project-directory $(DEV_DIR) \
		-f $(DEV_DIR)/infra/docker-compose.yml \
		-f $(DEV_DIR)/infra/docker-compose.dev.yml logs -f

vps-restart-prod: ## [VPS] Restart prod containers
	doppler run --config prd --project ididntcatchthat -- \
		docker compose --project-directory $(PROD_DIR) \
		-f $(PROD_DIR)/infra/docker-compose.yml \
		-f $(PROD_DIR)/infra/docker-compose.prod.yml restart

vps-restart-dev: ## [VPS] Restart dev containers
	doppler run --config dev --project ididntcatchthat -- \
		docker compose --project-directory $(DEV_DIR) \
		-f $(DEV_DIR)/infra/docker-compose.yml \
		-f $(DEV_DIR)/infra/docker-compose.dev.yml restart

# ─── nginx (host VPS) ─────────────────────────────────────────────────────────
# Run nginx-setup once after cloning on the VPS.
# After that, git pull + nginx-reload is enough after any infra/nginx/*.conf change.

NGINX_AVAILABLE = /etc/nginx/sites-available
NGINX_ENABLED   = /etc/nginx/sites-enabled
NGINX_SRC       = $(PROD_DIR)/infra/nginx

nginx-setup: ## [VPS] Replace nginx site configs with symlinks to repo (run once)
	@echo "→ Removing existing site files and creating symlinks to $(NGINX_SRC)..."
	sudo rm -f $(NGINX_AVAILABLE)/ididntcatchthat.com
	sudo rm -f $(NGINX_AVAILABLE)/api.ididntcatchthat.com
	sudo rm -f $(NGINX_AVAILABLE)/dev.ididntcatchthat.com
	sudo rm -f $(NGINX_AVAILABLE)/api.dev.ididntcatchthat.com
	sudo ln -s $(NGINX_SRC)/ididntcatchthat.com.conf        $(NGINX_AVAILABLE)/ididntcatchthat.com
	sudo ln -s $(NGINX_SRC)/api.ididntcatchthat.com.conf    $(NGINX_AVAILABLE)/api.ididntcatchthat.com
	sudo ln -s $(NGINX_SRC)/dev.ididntcatchthat.com.conf    $(NGINX_AVAILABLE)/dev.ididntcatchthat.com
	sudo ln -s $(NGINX_SRC)/api.dev.ididntcatchthat.com.conf $(NGINX_AVAILABLE)/api.dev.ididntcatchthat.com
	sudo ln -sf $(NGINX_AVAILABLE)/ididntcatchthat.com        $(NGINX_ENABLED)/ididntcatchthat.com
	sudo ln -sf $(NGINX_AVAILABLE)/api.ididntcatchthat.com    $(NGINX_ENABLED)/api.ididntcatchthat.com
	sudo ln -sf $(NGINX_AVAILABLE)/dev.ididntcatchthat.com    $(NGINX_ENABLED)/dev.ididntcatchthat.com
	sudo ln -sf $(NGINX_AVAILABLE)/api.dev.ididntcatchthat.com $(NGINX_ENABLED)/api.dev.ididntcatchthat.com
	$(MAKE) nginx-reload

nginx-reload: ## [VPS] Validate nginx config and reload
	sudo nginx -t && sudo systemctl reload nginx

# ─── SECURITY (VPS) ───────────────────────────────────────────────────────────
# Run from repo root on the VPS (/opt/ididntcatchthat-dev or /opt/ididntcatchthat).
# See docs/vps-security.md and docs/infra/docker-image-audit.md

security-audit: ## [VPS] Full security audit (ports, rabbitmq dev+prod, ssh)
	@bash infra/scripts/security/audit-ports.sh
	@bash infra/scripts/security/audit-rabbitmq.sh all
	@bash infra/scripts/security/audit-ssh.sh

security-audit-ports: ## [VPS] Listening ports, Docker mappings, UFW, iptables
	@bash infra/scripts/security/audit-ports.sh

security-audit-rabbitmq: ## [VPS] RabbitMQ logs + rabbitmqctl (STACK=dev|prod|all)
	@bash infra/scripts/security/audit-rabbitmq.sh $${STACK:-all}

security-audit-ssh: ## [VPS] fail2ban status and recent SSH failures
	@bash infra/scripts/security/audit-ssh.sh

security-probe-external: ## [VPS] nc probe public IP for sensitive ports (exit 1 if leak)
	@bash infra/scripts/security/probe-external.sh

security-verify: ## [VPS] Post-deploy check — ports audit + external probe
	@bash infra/scripts/security/audit-ports.sh
	@bash infra/scripts/security/probe-external.sh

security-hotfix-iptables: ## [VPS] Temporary DOCKER-USER block (confirm each rule)
	@bash infra/scripts/security/hotfix-docker-user.sh

security-scan-images: ## Scan infra Docker images with Trivy (CRITICAL/HIGH)
	@bash infra/scripts/security/scan-images.sh

security-rotate-rabbitmq: ## Rotate RABBITMQ_PASS in Doppler (ROTATE_CONFIRM=yes to apply)
	@bash infra/scripts/security/rotate-rabbitmq-pass.sh

# ─── CLEANUP ──────────────────────────────────────────────────────────────────

rebuild: ## Force rebuild all images without cache (dev)
	$(ensure-docker)
	$(COMPOSE_DEV) build --no-cache

clean: down ## Stop dev containers and remove dangling images
	docker image prune -f
	docker container prune -f

purge: ## ⚠️  Stop local stack and remove all volumes (deletes all data)
	$(ensure-docker)
	-$(COMPOSE_LOCAL) --profile init down -v 2>/dev/null
	-$(COMPOSE_TEST) down -v 2>/dev/null
	docker image prune -f
	docker volume prune -f

prune: ## ☢️  Nuclear: removes all unused Docker resources
	docker system prune -af --volumes

# ─── HELP ─────────────────────────────────────────────────────────────────────

help: ## Show this help message
	@grep -E '^[a-zA-Z_:\\-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sed -E 's/\\:/-/g; s/:.*## / ## /' \
		| awk 'BEGIN {FS = " ## "}; {printf "  \033[36m%-26s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
