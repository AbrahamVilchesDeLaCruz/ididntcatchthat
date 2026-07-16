# API Agent — ididntcatchthat

> **Scope**: Todo el código en `apps/api/`. Para otros scopes, regresa al orquestador: [../../AGENTS.md](../../AGENTS.md)

---

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|---|---|
| Crear o modificar aggregates, value objects, repositorios, domain errors | `api-domain` |
| Crear o modificar casos de uso o domain services | `api-application` |
| Crear o modificar controllers, entidades TypeORM, repositorios, módulos | `api-infrastructure` |
| Crear o modificar domain events, registrar eventos en aggregates | `api-domain-events` |
| Crear o modificar tests, Object Mothers, mocks de puertos | `api-testing` |
| Construir queries con filtros, orden o paginación | `api-criteria` |
| Crear domain errors o registrar excepciones en un módulo | `api-error-handler` |
| Diseñar o implementar endpoints REST o acciones DDD | `api-rest` |
| Auditar o refactorizar un bounded context (límites, submódulos, deuda) | `api-bc-review` |
| Implementar auth, guards, strategies, @CurrentUser, voters | `api-auth` |
| Crear o modificar SharedModule, shared interno, validación de env | `api-shared` |
| Definir o implementar EventBus, DomainEventConsumer, Handler abstract | `api-events` |
| Implementar AmqpMessageBus, HandlersBootstrapper, retry, DLQ | `api-events-infra` |
| Definir tokens de DI, registrar providers, inyectar interfaces | `api-di` |
| Crear migraciones TypeORM o seeds | `api-migrations` |
| Definir formato de respuesta HTTP, envelope, paginación | `api-response` |
| Configurar ValidationPipe, Payload, Query con class-validator | `api-validation` |
| Configurar logging, métricas, traces, OpenTelemetry, Grafana | `api-observability` |
| Creating new skills | `skill-creator` |
| After creating or modifying a skill | `skill-sync` |

---

## Architecture

Clean Architecture con Screaming Architecture por feature:

```
apps/api/src/
├── {feature}/
│   ├── domain/           ← aggregates, value objects, interfaces de repositorio, domain errors
│   ├── application/      ← casos de uso, domain services
│   └── infrastructure/
│       ├── controllers/  ← un controller por acción + payload/query junto a él
│       ├── framework/    ← NestJS modules + exception registries
│       └── persistence/  ← TypeORM entities + repositorios
├── shared/               ← AggregateRoot, ValueObject, DomainError, Criteria base classes
└── main.ts
```

**Regla de oro**: dependencias apuntan hacia adentro. `infrastructure` depende de `application`, `application` depende de `domain`. Nunca al revés.

### Módulos DDD dentro de un Bounded Context

Cuando un BC tiene **múltiples agregados**, se organiza por módulos DDD (Vaughn Vernon, IDDD):

```
apps/api/src/{bc}/
├── {module-a}/           ← dueño del agregado A
│   ├── domain/
│   ├── application/
│   └── infrastructure/
│       ├── controllers/
│       └── persistence/
├── {module-b}/           ← dueño del agregado B
│   ├── domain/
│   ├── application/
│   └── infrastructure/
│       ├── controllers/
│       └── persistence/
└── shared/               ← lo que cruza módulos dentro del BC
    ├── domain/           ← VOs o interfaces compartidas entre módulos
    └── infrastructure/
        ├── framework/    ← NestJS module del BC, exception registry, wiring
        └── persistence/  ← stubs o repos compartidos
```

**Reglas:**
- Si un BC tiene submódulos, **no puede haber capas sueltas (`domain/`, `application/`, `infrastructure/`) en la raíz del BC** — todo va en submódulos o en `shared/`
- Un módulo = un agregado o concepto cohesivo (no una entidad cualquiera)
- `shared/` dentro del BC es solo para lo que cruza módulos; el NestJS module del BC entero va en `shared/infrastructure/framework/`
- Los tests espejean la misma estructura: `test/{bc}/{module}/`

---

## Stack

| Tech | Rol |
|---|---|
| NestJS + TypeScript | Framework principal |
| TypeORM | ORM — solo en `infrastructure/` |
| Class Validator | Validación de payloads HTTP en controllers |
| PostgreSQL (Aiven) | Base de datos |
| Jest + Faker.js + jest-mock-extended | Testing |
| OpenAPI / Swagger | Contrato de API |
| ElevenLabs | Generación de audio (backoffice) |
| DeepSeek | Generación de ejemplos y fonética (backoffice) |

---

## Code Rules

- **TypeScript** estricto — no usar `any`
- **TypeORM** solo en `infrastructure/persistence/` — nunca en domain ni application
- Errores de dominio como clases tipadas: `throw new FlashcardNotFound(id)`
- Servicios externos (ElevenLabs, DeepSeek) solo en `infrastructure/` — interfaces en `domain/`
- Path aliases en todos los imports — nunca rutas relativas largas

---

## Commands

```bash
# Desde apps/api/
pnpm start:dev        # Dev server con hot-reload
pnpm lint             # ESLint --fix sobre src/ y test/

# ─── Unit tests ───────────────────────────────────────────────────────────────
pnpm test             # Unit tests (pass si no hay tests aún)
pnpm test:watch       # TDD loop — re-run on change
pnpm test:cov         # Unit tests + coverage → coverage/unit/

# ─── E2E tests ────────────────────────────────────────────────────────────────
pnpm test:e2e         # E2E tests (requiere DB corriendo: make up)
pnpm test:e2e:watch   # E2E en watch mode
pnpm test:e2e:cov     # E2E + coverage → coverage/e2e/

# ─── All ──────────────────────────────────────────────────────────────────────
pnpm test:all         # Unit + E2E secuencial

# ─── CI ───────────────────────────────────────────────────────────────────────
pnpm test:ci          # Unit + coverage --ci --forceExit (GitHub Actions)
pnpm test:e2e:ci      # E2E + coverage --ci --forceExit (GitHub Actions)

# ─── Debug ────────────────────────────────────────────────────────────────────
pnpm test:debug       # Jest con inspector de Node
```

**Configs Jest:**
- `jest.config.ts` — unit tests (`src/**/*.spec.ts`)
- `jest.e2e.config.ts` — E2E tests (`test/**/*.e2e-spec.ts`)

**Coverage thresholds (unit):** 90% branches / 100% functions / 100% lines / 100% statements

---

## Available Skills

| Skill | Scope | Description | URL |
|---|---|---|---|
| `api-domain`           | api    | AggregateRoot, Value Objects, Repository interface, DomainErrors | [SKILL.md](../../skills/api-domain/SKILL.md)           |
| `api-application`      | api    | Use Cases, Domain Services, convenciones de inyección            | [SKILL.md](../../skills/api-application/SKILL.md)      |
| `api-infrastructure`   | api    | Controllers, TypeORM entities, repositorios, módulos NestJS      | [SKILL.md](../../skills/api-infrastructure/SKILL.md)   |
| `api-domain-events`    | api    | Domain Events — definición, naming, registro en aggregates       | [SKILL.md](../../skills/api-domain-events/SKILL.md)    |
| `api-testing`          | api    | Pirámide de tests, Object Mother, jest-mock-extended             | [SKILL.md](../../skills/api-testing/SKILL.md)          |
| `api-criteria`         | api    | Criteria — filtros, orden, paginación, flujo controller→uc→repo  | [SKILL.md](../../skills/api-criteria/SKILL.md)         |
| `api-error-handler`    | api    | GlobalExceptionRegistry, filtros por módulo, HttpExceptionFilter | [SKILL.md](../../skills/api-error-handler/SKILL.md)    |
| `api-rest`             | api    | Convenciones RESTful + acciones DDD con POST                     | [SKILL.md](../../skills/api-rest/SKILL.md)             |
| `api-bc-review`        | api    | Auditoría DDD de bounded contexts: límites, submódulos, checklist | [SKILL.md](../../skills/api-bc-review/SKILL.md)        |
| `api-auth`             | api    | JWT, OAuth Google, guest token, guards, @CurrentUser, voters     | [SKILL.md](../../skills/api-auth/SKILL.md)             |
| `api-shared`           | api    | SharedModule global, bounded context shared, env validation Joi  | [SKILL.md](../../skills/api-shared/SKILL.md)           |
| `api-events`           | api    | EventBus interface, DomainEventConsumer, Handler abstract        | [SKILL.md](../../skills/api-events/SKILL.md)           |
| `api-events-infra`     | api    | AmqpMessageBus, HandlersBootstrapper, retry, DLQ, idempotencia   | [SKILL.md](../../skills/api-events-infra/SKILL.md)     |
| `api-di`               | api    | Tokens Symbol, registro de providers, inyección sin acoplamiento | [SKILL.md](../../skills/api-di/SKILL.md)               |
| `api-migrations`       | api    | TypeORM migrations formato, seeds idempotentes                   | [SKILL.md](../../skills/api-migrations/SKILL.md)       |
| `api-response`         | api    | Envelope de respuesta, paginación, commands sin body             | [SKILL.md](../../skills/api-response/SKILL.md)         |
| `api-validation`       | api    | ValidationPipe global, Payload/Query con class-validator         | [SKILL.md](../../skills/api-validation/SKILL.md)       |
| `api-observability`    | api    | Logger interface, pino, métricas Prometheus, OTel traces         | [SKILL.md](../../skills/api-observability/SKILL.md)    |
| `skill-creator`        | global | Crea nuevas skills                                               | [SKILL.md](../../skills/skill-creator/SKILL.md)        |
| `skill-sync`           | global | Sincroniza skills a AGENTS.md                                    | [SKILL.md](../../skills/skill-sync/SKILL.md)           |
