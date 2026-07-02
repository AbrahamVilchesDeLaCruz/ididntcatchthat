# Prompt: Validar Docker + Doppler setup

Usa este prompt para validar que el setup completo de Docker, Docker Compose, Makefile y Doppler es correcto antes de mergear.

---

## Contexto

Este monorepo tiene:
- `apps/api` — NestJS 11, Node 24, pnpm workspace
- `apps/client` — React 19 + Vite 8, build estático servido por nginx
- 3 entornos: `dev` (local), `test` (CI), `prd` (producción)
- Secrets gestionados con Doppler
- DB: Aiven en dev/prod, PostgreSQL en Docker solo en CI

---

## Checklist de validación

### 1. Doppler configurado

```bash
doppler me
# Esperado: workplace Personal, proyecto ididntcatchthat

doppler secrets --config dev
# Esperado: PORT, NODE_ENV, VITE_API_URL presentes
```

### 2. Variables inyectadas correctamente

```bash
doppler run -- printenv PORT
# Esperado: 3000

doppler run -- printenv NODE_ENV
# Esperado: development
```

### 3. Docker arriba con make up

```bash
make up
# Esperado:
# ✅ Docker is running (o ya estaba corriendo)
# Dangling images eliminadas
# api y client levantados

make ps
# Esperado: ambos containers en estado "running"
```

### 4. API responde

```bash
curl http://localhost:3000
# Esperado: respuesta HTTP de NestJS
```

### 5. Client responde

```bash
curl http://localhost:8080
# Esperado: HTML del index.html de la SPA

curl http://localhost:8080/ruta-inexistente
# Esperado: mismo index.html (SPA fallback), NO 404
```

### 6. Builds separados funcionan

```bash
make rebuild
# Esperado: ambas imágenes buildeadas sin cache sin errores

docker images | grep ididntcatchthat
# Esperado:
# ididntcatchthat-api     local   <size menor a 300MB>
# ididntcatchthat-client  local   <size menor a 50MB>
```

### 7. Dev servers locales con Doppler (sin Docker)

```bash
make dev-api
# Esperado: NestJS arranca con variables de Doppler dev inyectadas

make dev-client
# Esperado: Vite dev server arranca con VITE_API_URL de Doppler
```

### 8. Limpieza

```bash
make clean
# Esperado: containers parados + dangling images eliminados

make down
make purge
# ⚠️ Solo en entorno de test — borra volumes
```

### 9. CI — GitHub Actions

Verificar que el workflow `.github/workflows/ci.yml` tiene:
- `dopplerhq/cli-action@v3` instalado antes de los tests
- `DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}` en el step de test
- Servicio `postgres:17-alpine` configurado con health check en el job `api`
- `DATABASE_URL` apuntando al postgres del runner (ya en Doppler config `test`)

---

## Red flags a reportar

- `make dev-api` falla con "Doppler token not found" → hacer `doppler setup`
- Imagen runtime incluye devDependencies
- SPA fallback devuelve 404
- CI tests corren sin Doppler (variables undefined)
- `docker-compose.dev.yml` o `docker-compose.prod.yml` no encontrado por Makefile
- `DATABASE_URL` no presente en config `test` de Doppler
