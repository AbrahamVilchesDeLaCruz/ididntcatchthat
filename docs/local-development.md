# Local Development Profile

Perfil **autocontenido** para ejecutar ididntcatchthat sin Doppler, sin Aiven, sin Cloudflare R2 ni APIs de pago (ElevenLabs, DeepSeek).

Pensado para evaluación del TFM, onboarding de revisores y desarrollo offline.

---

## Modos disponibles

| Modo | Comando principal | Hot-reload | Cuándo usarlo |
|------|-------------------|------------|---------------|
| **Docker completo** | `make local-up` | No | Onboarding rápido, QA, revisores |
| **Host (dev)** | `make local-dev` | Sí | Desarrollo activo, iterar código |

---

## Quick start — Docker completo (sin hot-reload)

```bash
pnpm install
make local-up    # env setup + infra + api + client en Docker
make local-seed  # migraciones + usuario demo + flashcards
```

Abre http://localhost:4001

## Quick start — Host con hot-reload

```bash
pnpm install
make local-dev   # env setup + infra en Docker + api & client en host
make local-seed  # migraciones + usuario demo + flashcards
```

Abre http://localhost:5173

---

## Qué incluye

| Componente | Local Docker (`make local-up`) | Local Dev (`make local-dev`) | Dev (Doppler) |
|------------|-------------------------------|------------------------------|----------------|
| Secrets | `.env.local` (gitignored) | `.env.local` (gitignored) | Doppler `dev` |
| PostgreSQL | Docker `:5434` | Docker `:5434` | Aiven dev |
| RabbitMQ | Docker `:5674` | Docker `:5674` | Docker / remoto |
| Object storage | MinIO `:9000` (S3-compatible) | MinIO `:9000` | Cloudflare R2 |
| ElevenLabs / DeepSeek | Stubs (`USE_STUB_ADAPTERS=true`) | Stubs | APIs reales |
| Google OAuth | Dummy (no funciona) | Dummy | OAuth real |
| API | Docker `:3000` | Host `:3000` | Docker `:3001` |
| Client | Docker `:4001` | Vite `:5173` | Docker `:4001` |

---

## Comandos Make

| Comando | Descripción |
|---------|-------------|
| `make local-setup` | Copia `apps/api/.env.example` y `apps/client/.env.example` → `.env.local` |
| `make local-up` | Levanta stack completo en Docker (api, client, postgres, rabbitmq, minio) |
| `make local-down` | Para todo el stack local |
| `make local-seed` | Migraciones + seed demo (idempotente) |
| `make local-dev` | Infra en Docker + API y Client en host (hot-reload) |
| `make local-dev-api` | Solo API en host (hot-reload) |

Equivalente sin Make (modo host):

```bash
docker compose --project-directory . -f infra/docker-compose.local.yml up -d postgres rabbitmq minio --wait
cp apps/api/.env.example apps/api/.env.local
cp apps/client/.env.example apps/client/.env.local
pnpm --filter @ididntcatchthat/api seed:local
pnpm --filter @ididntcatchthat/api start:dev
pnpm --filter @ididntcatchthat/client dev
```

---

## Credenciales demo

Tras `make local-seed`:

| Campo | Valor |
|-------|-------|
| Email | `demo@local.dev` |
| Password | `DemoLocal123!` |
| Rol | `admin` (backoffice) |

También puedes jugar como **guest** sin registrarte.

---

## Puertos

| Servicio | Docker (`make local-up`) | Host (`make local-dev`) |
|----------|--------------------------|-------------------------|
| API | 3000 | 3000 |
| Client | 4001 | 5173 (Vite) |
| PostgreSQL | 5434 | 5434 |
| RabbitMQ AMQP | 5674 | 5674 |
| RabbitMQ UI | 15674 | 15674 |
| MinIO API | 9000 | 9000 |
| MinIO Console | 9001 | 9001 |

MinIO console: usuario `localminio`, password `localminio`.

---

## Variables de entorno

Plantillas commiteadas (copiar a `.env.local`):

- [`apps/api/.env.example`](../apps/api/.env.example)
- [`apps/client/.env.example`](../apps/client/.env.example)

Flag principal:

```bash
USE_STUB_ADAPTERS=true
```

Cuando está activo, la API usa stubs para DeepSeek (generación de borradores y sugerencia de ejemplos), ElevenLabs y almacenamiento local. El almacenamiento de audio sigue usando `R2AudioStorage` apuntando a MinIO.

---

## Arquitectura

### Docker completo (`make local-up`)

```mermaid
flowchart LR
  Browser["Browser :4001"] --> Client["Client nginx :4001"]
  Client --> API["API :3000"]
  API --> PG["Postgres :5434"]
  API --> RMQ["RabbitMQ :5674"]
  API --> Stubs["Stub AI adapters"]
  API --> MinIO["MinIO :9000"]
```

### Host con hot-reload (`make local-dev`)

```mermaid
flowchart LR
  Browser["Browser :5173"] --> Vite["Vite dev server :5173"]
  Vite --> API["API :3000 (host)"]
  API --> PG["Postgres :5434 (Docker)"]
  API --> RMQ["RabbitMQ :5674 (Docker)"]
  API --> Stubs["Stub AI adapters"]
  API --> MinIO["MinIO :9000 (Docker)"]
```

---

## Seed

El seed inserta:

- 1 usuario admin demo
- 20 flashcards repartidas en 4 módulos (`audio_status = ready`)

Es **idempotente**: si `demo@local.dev` ya existe, no duplica datos.

Script: `pnpm --filter @ididntcatchthat/api seed:local`

---

## Limitaciones conocidas

1. **Google OAuth** — requiere credenciales reales; en local usa email/password o guest.
2. **Audio de flashcards seed** — URLs de demo públicas (requieren internet para reproducir).
3. **Nuevos audios generados** — suben a MinIO local; el bucket debe existir (`minio-init` lo crea automáticamente en `make local-up`/`make local-dev`).
4. **Demo completa** — para experiencia 100% producción, usar [ididntcatchthat.com](https://ididntcatchthat.com).

---

## Troubleshooting

### Puerto ocupado

Comprueba que `:5434`, `:5674`, `:9000` estén libres. El perfil E2E usa `:5433` y `:5673` — no deberían conflictuar.

### Seed falla con "connection refused"

```bash
make local-up
docker compose --project-directory . -f infra/docker-compose.local.yml ps
```

Espera a que Postgres esté healthy antes de `make local-seed`.

### MinIO bucket no existe

```bash
docker compose --project-directory . -f infra/docker-compose.local.yml logs minio-init
docker compose --project-directory . -f infra/docker-compose.local.yml --profile init up minio-init
```

### API no carga `.env.local`

Ejecuta comandos desde la raíz con `pnpm --filter` o desde `apps/api/` donde existe el archivo `.env.local`.

---

## Ver también

- [ADR-016: Estrategia de entornos](./adr/016-environments-strategy.md)
- [ADR-017: Secrets con Doppler](./adr/017-secrets-doppler.md) — flujo del desarrollador principal
