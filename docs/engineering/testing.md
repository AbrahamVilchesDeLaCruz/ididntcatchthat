# Testing

> Cómo se ejecutan realmente los tests en este monorepo.

---

## Pirámide de tests

```
         ┌─────────────────┐
         │      E2E        │  ← supertest contra app NestJS real + Postgres Docker
         ├─────────────────┤
         │  Integración    │  ← (no aplica aún — los E2E cubren este nivel)
         ├─────────────────┤
         │    Unitarios    │  ← use cases + domain con jest-mock-extended
         └─────────────────┘
```

---

## Tests unitarios (`*.spec.ts`)

### ¿Qué cubren?

- Domain: Value Objects, Aggregates, entidades.
- Application: Use Cases — mocks de repositorios con `jest-mock-extended`.

### Cómo ejecutarlos

```bash
# Desde la raíz del monorepo
pnpm test                          # todos los workspaces

# Solo la API
pnpm --filter @ididntcatchthat/api test

# Con coverage
pnpm --filter @ididntcatchthat/api test:cov

# En modo watch (desarrollo)
pnpm --filter @ididntcatchthat/api test:watch
```

### Runner

- **Jest** con `ts-jest`
- Config: `apps/api/jest.config.ts`
- Pattern: `test/**/*.spec.ts`
- `NODE_OPTIONS=--experimental-vm-modules` — necesario para ESM con `jest-mock-extended`

### Convenciones

- Un archivo `*.spec.ts` por use case / domain object
- Object Mother para fixtures: `*-mother.ts` junto al spec
- Mocks via `jest-mock-extended` — no `jest.fn()` manual
- `describe`, `it`, `expect`, `beforeEach` son **globals** — no importar desde `@jest/globals`

---

## Tests E2E (`*.e2e-spec.ts`)

### ¿Qué cubren?

El contrato HTTP real: levanta la app NestJS completa contra una DB Postgres de test y hace requests HTTP reales via `supertest`. Validan que los controllers, guards, use cases y repositorios funcionan de punta a punta.

### Infraestructura requerida

Los E2E necesitan Postgres corriendo **en puerto 5433** (no 5432 — no interferir con instancias locales).

#### Localmente

```bash
# 1. Levantar Postgres de test (Docker)
make test:e2e:up

# 2. Correr los tests
pnpm --filter @ididntcatchthat/api test:e2e

# 3. Bajar infraestructura
make test:e2e:down
```

O todo de una vez (sube, corre, baja):

```bash
make test:e2e
```

#### En CI (GitHub Actions)

El workflow `.github/workflows/ci.yml` levanta el servicio Postgres directamente como `service`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: ididntcatchthat_test
    ports:
      - 5433:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

**No se usa Doppler en el step de E2E** — las vars vienen de `.env.test` commiteado (solo contiene valores de test, sin secretos reales).

### Variables de entorno para tests E2E

Las vars se cargan automáticamente desde `apps/api/.env.test` via `test/setup-env.ts` (registrado en `jest.e2e.config.ts` bajo `setupFiles`).

```bash
# apps/api/.env.test (commiteado — sin secretos)
NODE_ENV=test
DATABASE_URL=postgres://test:test@localhost:5433/ididntcatchthat_test
JWT_SECRET=test-jwt-secret-at-least-32-chars-long
JWT_REFRESH_SECRET=test-jwt-refresh-secret-at-least-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d
FRONTEND_URL=http://localhost:5173
```

### Docker Compose de test

`docker-compose.test.yml` en la raíz del monorepo:

- **Imagen**: `postgres:16-alpine`
- **Puerto**: `5433:5432` (no colisiona con instancias locales en 5432)
- **Storage**: `tmpfs` — efímero, se destruye al parar el contenedor
- **Healthcheck**: `pg_isready` — el `--wait` en Docker Compose espera a que esté listo antes de continuar

### Migraciones en E2E

Las migraciones se corren **una sola vez** al iniciar la DB de test. La DB es ephemeral (tmpfs) — cada `make test:e2e:down` la destruye. Si cambia el schema, se aplica en el próximo `make test:e2e:up` automáticamente (TypeORM `migrationsRun: true`).

### Runner E2E

- **Jest** con `ts-jest`
- Config: `apps/api/jest.e2e.config.ts`
- Pattern: `test/**/*.e2e-spec.ts`
- Flag `--runInBand` — los tests E2E corren **en serie**, no en paralelo (comparten la misma DB)
- `NODE_OPTIONS=--experimental-vm-modules`

### Convenciones E2E

- Un archivo `*.e2e-spec.ts` por funcionalidad (ej: `register-login-auth.e2e-spec.ts`)
- El helper `createTestApp()` en `test/shared/infrastructure/create-test-app.ts` — centraliza el bootstrap de la app de test
- Limpieza de datos: cada suite borra sus propios registros en `afterEach` / `afterAll`
- Emails y nicknames únicos por suite via `Date.now()` — evita colisiones entre suites paralelas (aunque corren en serie)
- Cookie extraction: `res.headers['set-cookie'][0].split(';')[0]` — el header `Cookie` solo acepta `key=value`

---

## Comandos de referencia rápida

| Comando                                         | Qué hace                             |
| ----------------------------------------------- | ------------------------------------ |
| `pnpm test`                                     | Unit tests en todos los workspaces   |
| `pnpm --filter @ididntcatchthat/api test`       | Unit tests solo API                  |
| `pnpm --filter @ididntcatchthat/api test:cov`   | Unit tests + coverage                |
| `pnpm --filter @ididntcatchthat/api test:watch` | Unit tests en modo watch             |
| `make test:e2e`                                 | E2E completo: up + run + down        |
| `make test:e2e:up`                              | Solo levantar Postgres de test       |
| `pnpm --filter @ididntcatchthat/api test:e2e`   | Solo correr E2E (requiere DB activa) |
| `make test:e2e:down`                            | Bajar y destruir Postgres de test    |
| `pnpm test:all`                                 | Unit + E2E en todos los workspaces   |
| `pnpm test:ci`                                  | Unit + coverage en modo CI           |

---

## Estructura de archivos de test

```
apps/api/
├── jest.config.ts              ← config unit tests
├── jest.e2e.config.ts          ← config E2E tests
├── .env.test                   ← vars de entorno para E2E (commiteado)
└── test/
    ├── setup-env.ts            ← carga .env.test antes del bootstrap de NestJS
    ├── shared/
    │   ├── domain/             ← Object Mothers base (MotherCreator, UuidMother…)
    │   └── infrastructure/
    │       └── create-test-app.ts  ← helper: bootstrap NestJS para E2E
    └── identity/
        ├── domain/             ← Object Mothers del BC identity
        ├── application/        ← unit specs + mothers de use cases
        └── infrastructure/     ← E2E specs
            ├── guest-auth-post.e2e-spec.ts
            ├── register-login-auth.e2e-spec.ts
            ├── refresh-logout-auth.e2e-spec.ts
            └── guards.e2e-spec.ts
```

---

## Cobertura

La cobertura se genera con `--coverage` y se escribe en:

- Unit: `apps/api/coverage/unit/`
- E2E: `apps/api/coverage/e2e/`

En CI, la cobertura se recoge para el reporte pero **no hay threshold mínimo** configurado — el objetivo es visibilidad, no bloqueo de merge.

---

## Gotchas conocidos

| Problema                                | Causa                                            | Solución                                                   |
| --------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| `connect ECONNREFUSED 127.0.0.1:5433`   | Postgres de test no está corriendo               | `make test:e2e:up`                                         |
| `SSL required` en E2E                   | TypeORM en modo no-test usa SSL                  | `ssl: false` cuando `NODE_ENV=test` en `typeorm.config.ts` |
| `422` en vez de `400` en validación     | `errorHttpStatusCode: 422` en `ValidationPipe`   | Esperado — usar 422 en los specs                           |
| Tests E2E interfieren entre sí          | Datos compartidos en DB                          | Usar emails/nicknames únicos via `Date.now()`              |
| Cookie inválida en `POST /auth/refresh` | Se pasa el valor con atributos (`; HttpOnly; …`) | `.split(';')[0]` al extraer de `set-cookie`                |
