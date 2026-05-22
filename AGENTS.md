# ididntcatchthat — AI Orchestrator

> Plataforma gamificada de aprendizaje de inglés centrada en fonética real, connected speech y expresiones nativas. Desarrollada como TFM.

## Role of This File

This is the **monorepo orchestrator**. Its job is to:

1. Route work to the correct scope based on which app is being modified.
2. Auto-invoke the correct skill before starting any action that has a known pattern.
3. Provide monorepo-wide conventions that apply to every scope.

Load the scope `AGENTS.md` as soon as you know which app you are working in. Do not work from this file alone for scope-specific tasks.

---

## Sub-Agent Routing

| If the work is in...                              | Load this agent                                          |
| ------------------------------------------------- | -------------------------------------------------------- |
| `apps/api/` — NestJS, Clean Architecture, TypeOrm | [apps/api/AGENTS.md](apps/api/AGENTS.md)                 |
| `apps/client/` — React, TanStack Query, Zustand   | [apps/client/AGENTS.md](apps/client/AGENTS.md)           |
| `skills/` — AI agent skills for this repo         | [skills/skill-sync/SKILL.md](skills/skill-sync/SKILL.md) |

---

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action                                                | Skill           |
| ----------------------------------------------------- | --------------- |
| After creating or modifying a skill                   | `skill-sync`    |
| Creating new skills                                   | `skill-creator` |
| AGENTS.md Available Skills or Auto-invoke out of sync | `skill-sync`    |
| Creating a branch, opening a PR, or merging code      | `git-workflow`  |
| Before implementing any new feature, use case, hook or component | `tdd-workflow` |

---

## Available Skills

| Skill                | Scope  | Description                                                      | URL                                            |
| -------------------- | ------ | ---------------------------------------------------------------- | ---------------------------------------------- |
| `tdd-workflow`       | global | Workflow TDD obligatorio: Red→Green→Refactor antes de cualquier código nuevo | [SKILL.md](skills/tdd-workflow/SKILL.md) |
| `skill-creator`      | global | Crea nuevas skills siguiendo el spec del repo                    | [SKILL.md](skills/skill-creator/SKILL.md)      |
| `skill-sync`         | global | Sincroniza skills a las tablas de AGENTS.md                      | [SKILL.md](skills/skill-sync/SKILL.md)         |
| `git-workflow`       | global | Branching, naming, merge strategy y PRs para este repo           | [SKILL.md](skills/git-workflow/SKILL.md)       |
| `api-domain`         | api    | AggregateRoot, Value Objects, Repository interface, DomainErrors | [SKILL.md](skills/api-domain/SKILL.md)         |
| `api-application`    | api    | Use Cases, Domain Services, convenciones de inyección            | [SKILL.md](skills/api-application/SKILL.md)    |
| `api-infrastructure` | api    | Controllers, TypeORM entities, repositorios, módulos NestJS      | [SKILL.md](skills/api-infrastructure/SKILL.md) |
| `api-domain-events`  | api    | Domain Events — definición, naming, registro en aggregates       | [SKILL.md](skills/api-domain-events/SKILL.md)  |
| `api-testing`        | api    | Pirámide de tests, Object Mother, jest-mock-extended             | [SKILL.md](skills/api-testing/SKILL.md)        |
| `api-criteria`       | api    | Criteria — filtros, orden, paginación, flujo controller→uc→repo  | [SKILL.md](skills/api-criteria/SKILL.md)       |
| `api-error-handler`  | api    | GlobalExceptionRegistry, filtros por módulo, HttpExceptionFilter | [SKILL.md](skills/api-error-handler/SKILL.md)  |
| `api-rest`           | api    | Convenciones RESTful + acciones DDD con POST                     | [SKILL.md](skills/api-rest/SKILL.md)            |
| `api-auth`           | api    | JWT, OAuth Google, guest token, guards, @CurrentUser, voters     | [SKILL.md](skills/api-auth/SKILL.md)            |
| `api-shared`         | api    | SharedModule global, bounded context shared, env validation Joi  | [SKILL.md](skills/api-shared/SKILL.md)          |
| `api-events`         | api    | EventBus interface, DomainEventConsumer, Handler abstract        | [SKILL.md](skills/api-events/SKILL.md)          |
| `api-events-infra`   | api    | AmqpMessageBus, HandlersBootstrapper, retry, DLQ, idempotencia   | [SKILL.md](skills/api-events-infra/SKILL.md)    |
| `api-di`             | api    | Tokens Symbol, registro de providers, inyección sin acoplamiento | [SKILL.md](skills/api-di/SKILL.md)              |
| `api-migrations`     | api    | TypeORM migrations formato, seeds idempotentes                   | [SKILL.md](skills/api-migrations/SKILL.md)      |
| `api-response`       | api    | Envelope de respuesta, paginación, commands sin body             | [SKILL.md](skills/api-response/SKILL.md)        |
| `api-validation`     | api    | ValidationPipe global, Payload/Query con class-validator         | [SKILL.md](skills/api-validation/SKILL.md)      |
| `api-observability`  | api    | Logger interface, pino, métricas Prometheus, OTel traces         | [SKILL.md](skills/api-observability/SKILL.md)   |
| `client-pods`                    | client | Estructura de pods, naming, cuándo crear qué                     | [SKILL.md](skills/client-pods/SKILL.md)                    |
| `client-container-presentational`| client | Contrato Container/Component, responsabilidades, prohibiciones   | [SKILL.md](skills/client-container-presentational/SKILL.md)|
| `client-query`                   | client | TanStack Query: queries, mutations, query keys, invalidación     | [SKILL.md](skills/client-query/SKILL.md)                   |
| `client-api`                     | client | Capa api/: api-model, api.ts, mapper, ViewModel types            | [SKILL.md](skills/client-api/SKILL.md)                     |
| `client-hooks`                   | client | Hooks del pod [State, Handlers], hooks globales, cuándo extraer  | [SKILL.md](skills/client-hooks/SKILL.md)                   |
| `client-testing`                 | client | Vitest + RTL (unit/integration), Playwright E2E, MSW             | [SKILL.md](skills/client-testing/SKILL.md)                 |

---

## Project Structure

```
ididntcatchthat/
├── apps/
│   ├── api/          ← NestJS backend (Clean Architecture)
│   └── client/       ← React frontend
├── skills/           ← AI agent skills (fuente de verdad)
├── prompts/          ← Prompts usados durante el desarrollo
├── docs/             ← Documentación del proyecto
├── infra/            ← Docker Compose, observabilidad
└── AGENTS.md         ← Este archivo
```

---

## Stack

| Layer          | Tech                                                               |
| -------------- | ------------------------------------------------------------------ |
| Frontend       | React, TypeScript, Vite, TailwindCSS, TanStack Query, Zustand, Zod |
| Backend        | NestJS, TypeScript, TypeORM, Class Validator                       |
| Database       | PostgreSQL (Aiven)                                                 |
| CDN            | Cloudflare (audio files)                                           |
| Testing        | Vitest, Jest, Playwright                                           |
| Observabilidad | OpenTelemetry, Prometheus, Grafana, Loki                           |
| Infra          | VPS, Docker, GitHub Actions                                        |

---

## Monorepo-wide Code Style

- **TypeScript** estricto en todos los paquetes — no usar `any`
- **Zod and Class Validator** para validación cliente-servidor`
- **Conventional Commits**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `ci`, `revert`
- **ESLint + Prettier** — no commitear código sin pasar linting — enforced por Husky
- **Imports**: usar path aliases, nunca rutas relativas largas

---

## Git Hooks (Husky)

Configurados en `.husky/` a nivel raíz del monorepo.

| Hook | Herramienta | Qué hace |
| ------------- | ----------- | ------------------------------------------------------------ |
| `pre-commit`  | lint-staged | ESLint --fix + Prettier --write sobre archivos staged únicamente |
| `commit-msg`  | commitlint  | Valida que el mensaje siga Conventional Commits              |

**lint-staged** corre eslint y prettier **solo sobre los archivos staged** — no sobre todo el proyecto. Rápido, < 2s.

**tsc --noEmit** NO está en pre-commit — va en CI. El ESLint con `recommendedTypeChecked` cubre type-safety por archivo.

**Tipos válidos en commit-msg:** `feat` | `fix` | `docs` | `chore` | `refactor` | `test` | `perf` | `ci` | `revert`

Config commitlint: `commitlint.config.ts` en la raíz.

---

## Scripts raíz (monorepo)

Desde la raíz del monorepo, estos scripts propagan el comando a todos los workspaces:

```bash
pnpm lint          # ESLint en api + client
pnpm test          # Unit tests en api + client
pnpm test:e2e      # E2E tests en api + client
pnpm test:all      # Unit + E2E en api + client
pnpm test:ci       # Tests + coverage en modo CI (GitHub Actions)
```

> Para correr solo en un workspace: `pnpm --filter @ididntcatchthat/api test`

---

## Commit Guidelines

```
feat(flashcards): add spaced repetition algorithm
fix(audio): handle ElevenLabs timeout gracefully
refactor(pronunciation): extract scoring to domain service
test(flashcards): add unit tests for review scheduler
```

---

## Documentation & Diagrams

- Toda la documentación en Markdown dentro de `docs/`
- Diagramas con **Mermaid** embebido en `.md` — sin imágenes externas
- ADRs en `docs/adr/` para decisiones arquitectónicas importantes
