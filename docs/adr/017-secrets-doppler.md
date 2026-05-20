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
├── dev   → desarrollo local (Aiven dev, keys de test de ElevenLabs/Azure)
├── test  → CI — GitHub Actions (DB local Docker, keys de test)
└── prod  → VPS producción (Aiven prod, keys de prod)
```

### Uso por entorno

**Local (dev)**
```bash
# Correr api con secrets inyectados
doppler run -- pnpm --filter @ididntcatchthat/api start:dev

# Correr client (no necesita secrets — solo VITE_API_URL)
doppler run -- pnpm --filter @ididntcatchthat/client dev
```

**CI — GitHub Actions**

Doppler Service Token almacenado en GitHub Secrets (`DOPPLER_TOKEN_TEST`). El workflow usa la GitHub Action oficial de Doppler para inyectar variables antes de correr los tests.

```yaml
- uses: dopplerhq/cli-action@v3
- run: doppler run -- pnpm test
  env:
    DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN_TEST }}
```

**Prod — VPS**

Doppler CLI instalado en el VPS. El entrypoint del contenedor inyecta secrets en runtime:

```dockerfile
CMD ["doppler", "run", "--", "node", "dist/main"]
```

O via variables de entorno en el deploy script — el token de prod está en el VPS como variable de sistema, nunca en el repo.

### Variables requeridas por entorno

| Variable | dev | test | prod |
|---|---|---|---|
| `DATABASE_URL` | Aiven dev connection string | `postgresql://test:test@localhost:5432/ididntcatchthat_test` | Aiven prod connection string |
| `PORT` | `3000` | `3000` | `3000` |
| `NODE_ENV` | `development` | `test` | `production` |
| `ELEVENLABS_API_KEY` | key de test | key de test | key de prod |
| `AZURE_SPEECH_KEY` | key de test | key de test | key de prod |
| `VITE_API_URL` | `http://localhost:3000` | `http://localhost:3000` | `https://api.ididntcatchthat.com` |

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
