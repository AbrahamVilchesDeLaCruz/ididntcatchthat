# make/test.mk
# Test profiles — unit and E2E for API and client.
# Reads COMPOSE_TEST and ensure-docker from the root Makefile.

.PHONY: test\:e2e\:up test\:e2e\:down \
        test\:api\:unit test\:api\:e2e test\:api \
        test\:client\:unit test\:client\:e2e test\:client \
        test\:all

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
