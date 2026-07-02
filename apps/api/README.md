# API — ididntcatchthat

Backend del proyecto **ididntcatchthat** — plataforma gamificada de aprendizaje de inglés centrada en fonética real y connected speech.

Construido con **NestJS** siguiendo **Clean Architecture** (Screaming Architecture por feature).

---

## Arquitectura

```
src/
├── {feature}/
│   ├── domain/           ← aggregates, value objects, interfaces de repositorio, domain errors
│   ├── application/      ← casos de uso, domain services
│   └── infrastructure/
│       ├── controllers/  ← un controller por acción HTTP
│       ├── framework/    ← módulos NestJS + exception registries
│       └── persistence/  ← TypeORM entities + repositorios
├── shared/               ← AggregateRoot, ValueObject, DomainError, Criteria, Logger
└── main.ts
```

**Regla de oro**: las dependencias apuntan hacia adentro — `infrastructure` → `application` → `domain`. Nunca al revés.

---

## Stack

| Tech             | Rol                                        |
| ---------------- | ------------------------------------------ |
| NestJS           | Framework principal                        |
| TypeScript       | Lenguaje — modo estricto, sin `any`        |
| TypeORM          | ORM — solo en `infrastructure/persistence/`|
| Class Validator  | Validación de payloads HTTP                |
| PostgreSQL       | Base de datos (Aiven managed)              |
| pino + pino-loki | Logging estructurado → stdout + Loki       |
| prom-client      | Métricas Prometheus en `/metrics`          |
| Swagger          | Contrato de API en `/docs` (no-prod)       |
| Jest             | Unit tests + E2E tests                     |

---

## Comandos

```bash
# Desde apps/api/

# ─── Desarrollo ───────────────────────────────────────────────────────────────
pnpm start:dev        # Dev server con hot-reload (usar desde raíz: make dev-api)

# ─── Linting ──────────────────────────────────────────────────────────────────
pnpm lint             # ESLint --fix sobre src/ y test/

# ─── Unit tests ───────────────────────────────────────────────────────────────
pnpm test             # Unit tests (pass si no hay tests aún)
pnpm test:watch       # TDD loop — re-run on change
pnpm test:cov         # Unit tests + coverage → coverage/unit/

# ─── E2E tests ────────────────────────────────────────────────────────────────
pnpm test:e2e         # E2E tests (requiere DB: make up)
pnpm test:e2e:watch   # E2E en watch mode
pnpm test:e2e:cov     # E2E + coverage → coverage/e2e/

# ─── All ──────────────────────────────────────────────────────────────────────
pnpm test:all         # Unit + E2E secuencial

# ─── CI ───────────────────────────────────────────────────────────────────────
pnpm test:ci          # Unit + coverage --ci --forceExit
pnpm test:e2e:ci      # E2E + coverage --ci --forceExit
```

---

## Endpoints disponibles

| Método | Ruta       | Descripción                              |
| ------ | ---------- | ---------------------------------------- |
| `GET`  | `/health`  | Health check — responde `{ status: "ok" }` |
| `GET`  | `/metrics` | Métricas Prometheus (prom-client, scrape) |
| `GET`  | `/v1/metrics/summary` | Snapshot JSON de métricas (admin JWT) |
| `GET`  | `/docs`    | Swagger UI (solo en non-production)      |

---

## Variables de entorno

Gestionadas con **Doppler**. Ver [docs/deployment.md](../../docs/deployment.md) para la lista completa.

| Variable       | Descripción                              |
| -------------- | ---------------------------------------- |
| `NODE_ENV`     | `development` \| `production`            |
| `PORT`         | Puerto de escucha (default: `3000`)      |
| `DATABASE_URL` | Connection string de PostgreSQL          |
| `LOKI_URL`     | URL de Loki — si no está, solo stdout    |
| `LOG_LEVEL`    | Nivel mínimo de log (default: `info`)    |

---

## Documentación relacionada

- [ADRs](../../docs/adr/) — decisiones de arquitectura
- [Observability](../../docs/observability.md) — setup de métricas y logs
- [Deployment](../../docs/deployment.md) — deploy al VPS
