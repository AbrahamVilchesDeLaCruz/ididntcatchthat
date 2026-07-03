# ADR-017: Secrets Management con Doppler

**Status**: Accepted  
**Date**: 2026-05-20  
**Deciders**: Abraham Vilches de la Cruz

---

## Context

El proyecto maneja secrets sensibles: credenciales de Aiven (PostgreSQL), API keys de ElevenLabs y Azure Speech, y configuración por entorno. Necesitamos una estrategia que:

- Nunca exponga secrets en el repositorio
- Funcione en los 3 entornos (dev local, CI, prod VPS)
- Sea simple de usar en el día a día
- Escale cuando se sumen más servicios externos

---

## Decision

**Doppler** como fuente de verdad única para todos los secrets en todos los entornos.

### Proyecto y entornos en Doppler

```
Proyecto: ididntcatchthat
├── dev   → desarrollo local (Aiven dev, keys de test de ElevenLabs)
├── test  → CI — GitHub Actions (DB local Docker, keys de test)
└── prd   → VPS producción (Aiven prod, keys de prod)
```

> Los nombres de config en Doppler son `dev`, `test` y `prd` (no `prod`).

### Uso por entorno

**Local (dev)**
```bash
# Correr api con secrets inyectados
doppler run -- pnpm --filter @ididntcatchthat/api start:dev

# Correr client (no necesita secrets — solo VITE_API_URL)
doppler run -- pnpm --filter @ididntcatchthat/client dev
```

**CI — GitHub Actions**

Doppler Service Token almacenado en GitHub Secrets como `DOPPLER_TOKEN`. El workflow usa la GitHub Action oficial de Doppler para inyectar variables en los unit tests. Los tests E2E usan `.env.test` directamente y no necesitan Doppler.

```yaml
- uses: dopplerhq/cli-action@v3
- run: doppler run -- pnpm test:ci
  env:
    DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}
```

**Prod — VPS**

Doppler CLI instalado en el VPS. Los secrets se inyectan via `doppler run --` en el comando de deploy del Makefile. El compose recibe las variables interpoladas en `environment:` — no se usa `CMD doppler run` en el Dockerfile.

```bash
# Makefile deploy-prod
doppler run --config prd --project ididntcatchthat -- \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

El token de prod está configurado en el VPS via `doppler setup --scope /opt/ididntcatchthat`, nunca en el repo.

### Variables requeridas por entorno

La fuente de verdad para las variables requeridas es `apps/api/src/shared/infrastructure/config/env.validation.ts` (Joi schema). Las más relevantes:

| Variable | dev | test (`.env.test`) | prd |
|---|---|---|---|
| `NODE_ENV` | `development` | `test` | `production` |
| `PORT` | `3000` | `3000` | `3000` |
| `DATABASE_URL` | Aiven dev | `postgres://test:test@localhost:5433/...` | Aiven prod |
| `DATABASE_CA_CERT` | opcional | — | certificado CA de Aiven |
| `JWT_SECRET` | min 32 chars | fake (test only) | min 32 chars |
| `FRONTEND_URL` | `http://localhost:4001` | default Joi | `https://ididntcatchthat.com` |
| `CORS_ORIGIN` | `http://localhost:4001,...` | `http://localhost:5173` | dominio prod |
| `LOKI_URL` | opcional | — | URL interna Loki |
| `LOG_LEVEL` | `debug` | — | `info` |
| `ELEVEN_LABS_API_KEY` | key de test | fake | key de prod |
| `AMQP_URI` | RabbitMQ Doppler dev | `amqp://test:test@localhost:5673` | RabbitMQ prod |

### Lo que NUNCA va en el repo

- `.env`, `.env.local`, `.env.dev`, `.env.prod` — en `.gitignore`
- Tokens de Doppler
- Connection strings
- API keys

### Onboarding de nuevo desarrollador

```bash
# 1. Instalar Doppler CLI
brew install dopplerhq/cli/doppler   # macOS
# o
curl -Ls https://cli.doppler.com/install.sh | sh  # Linux

# 2. Autenticarse
doppler login

# 3. Configurar el proyecto
doppler setup  # seleccionar ididntcatchthat + dev

# 4. Listo — correr el proyecto
make dev
```

---

## Alternatives Considered

### `.env` files por entorno (`.env.dev`, `.env.prod`)
Escala mal, riesgo de commitear por accidente, secrets duplicados en cada máquina. Descartado.

### GitHub Secrets únicamente
Solo funciona en CI. Para local y VPS requiere gestión manual de archivos `.env`. Descartado.

### HashiCorp Vault
Overkill para este proyecto — requiere infraestructura propia y operación compleja. Descartado.

### Infisical (self-hosted)
Alternativa open source válida pero añade una dependencia más que mantener en el VPS. Si Doppler presenta problemas, Infisical es el fallback natural.

---

## Consequences

- ✅ Cero secrets en el repositorio
- ✅ Un único lugar para gestionar secrets de todos los entornos
- ✅ Auditoría de accesos incluida en Doppler
- ✅ Rotación de secrets sin tocar código ni redeploy
- ✅ Onboarding en 3 comandos
- ⚠️ Dependencia de servicio externo — si Doppler cae, no se puede arrancar el proyecto sin secrets en disco
- ⚠️ Free tier de Doppler: 5 proyectos, secrets ilimitados — suficiente para este TFM
