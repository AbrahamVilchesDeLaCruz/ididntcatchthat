# ADR-016: Estrategia de entornos

**Status**: Accepted  
**Date**: 2026-05-20  
**Deciders**: Abraham Vilches de la Cruz

---

## Context

El proyecto necesita una estrategia clara para gestionar múltiples entornos (local, CI, producción) con bases de datos aisladas, variables de entorno seguras y flujos de trabajo reproducibles.

---

## Decision

### Cuatro entornos

| Entorno | Quién lo usa | Base de datos | Secrets |
|---|---|---|---|
| `local` | Evaluación / tribunal / clone sin cuentas | PostgreSQL + MinIO en Docker (`:5434`) | `.env.local` (ver [local-development.md](../local-development.md)) |
| `dev` | Desarrollador en local | Aiven dev | Doppler `dev` |
| `test` | GitHub Actions (CI) | PostgreSQL en Docker (runner) | Doppler `test` |
| `prod` | VPS de producción | Aiven prod | Doppler `prod` |

### Perfil local (evaluación sin Doppler)

Autocontenido para quien clona el repo sin acceso a servicios de pago:

```bash
make local-setup && make local-up && make local-seed && make local-dev
```

- Postgres + RabbitMQ + MinIO en Docker
- Stubs para ElevenLabs / DeepSeek (`USE_STUB_ADAPTERS=true`)
- MinIO sustituye R2 (mismo adapter S3)
- Seed idempotente con usuario `demo@local.dev`

Ver guía: [docs/local-development.md](../local-development.md)

### Local — dev (Doppler)

El desarrollador trabaja con hot-reload directo via pnpm. Docker solo orquesta `api` y `client` para validar builds de producción. La DB vive en Aiven dev — no hay postgres en Docker local.

```bash
# Dev diario — sin Docker
doppler run -- pnpm --filter @ididntcatchthat/api start:dev
doppler run -- pnpm --filter @ididntcatchthat/client dev

# Validar build de producción
make up
```

### CI — test

GitHub Actions levanta contenedores efímeros de PostgreSQL y RabbitMQ en el runner para cada ejecución. Los secrets de unit tests vienen de Doppler via `DOPPLER_TOKEN` (GitHub Secret). Los tests E2E usan `.env.test` directamente — sin Doppler — para aislar completamente el entorno. La DB se crea en caliente y se destruye al terminar el job.

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_DB: ididntcatchthat_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
  rabbitmq:
    image: rabbitmq:4.1-alpine
```

### Prod — VPS

Todo contenedorizado via Docker Compose. Los secrets llegan a los contenedores via Doppler CLI integrado en el entrypoint o via variables inyectadas en el deploy. La DB es Aiven prod — nunca en Docker en producción.

### Por qué no PostgreSQL local en Docker

- Aiven tiene free tier suficiente para dev
- Evita divergencia entre schema local y remoto
- Un entorno menos que mantener
- Los devs siempre trabajan contra datos reales de dev (no fixtures inventados)

### Por qué PostgreSQL en Docker solo en CI

- El runner de GitHub Actions es efímero — tiene sentido usar una DB efímera
- Aísla completamente los tests — no hay riesgo de contaminar dev o prod
- Más rápido que conectar a Aiven desde CI (latencia de red)
- Control total sobre el estado inicial de la DB en cada run

---

## Alternatives Considered

### PostgreSQL en Docker también en local (perfil `local`)
Añadido como **perfil opcional** para evaluación del TFM — no reemplaza el flujo Doppler+Aiven del desarrollador principal. Coexiste con `dev`.

### PostgreSQL en Docker también en local (dev diario)
Más aislado pero añade fricción al onboarding y divergencia potencial con Aiven. Descartado para dev diario — Aiven dev es suficiente y más realista.

### Un solo entorno de DB para CI y dev
Riesgo de contaminación de datos entre runs de CI y trabajo de dev. Descartado.

### Sin Doppler — `.env` files por entorno
Escala mal, secrets en disco, riesgo de commitear por accidente. Descartado — ver ADR-017.

---

## Consequences

- ✅ Entornos completamente aislados — imposible contaminar prod desde dev o CI
- ✅ CI reproducible — DB fresca en cada run
- ✅ Dev realista — misma DB engine (PostgreSQL) en todos los entornos
- ✅ Sin fricción de Docker en dev diario — hot-reload directo
- ⚠️ Requiere cuenta Aiven con 3 bases de datos (free tier cubre esto)
- ⚠️ Requiere Doppler CLI instalado en la máquina del desarrollador
