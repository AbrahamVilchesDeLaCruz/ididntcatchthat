# ADR-014: CI con path filters por app

**Date**: 2026-05-20  
**Status**: Accepted

## Context

El workflow de CI inicial corría los jobs de `api` y `client` en cada PR independientemente de qué archivos habían cambiado. Un PR que solo toca `apps/client/` ejecutaba innecesariamente el job de `api` y viceversa.

Adicionalmente, las branch protection rules exigían que `ci / api` y `ci / client` pasaran antes de mergear — pero con path filters, un job que no corre queda como `skipped`, no como `passed`, lo que bloquearía el merge.

## Decision

Dividir el CI en cuatro jobs:

1. **`ci / detect changes`** — siempre corre, detecta qué paths cambiaron y expone outputs booleanos
2. **`ci / api`** — solo corre si `apps/api/**` tiene cambios
3. **`ci / client`** — solo corre si `apps/client/**` tiene cambios
4. **`ci / docker build & scan`** — corre si `apps/api/**`, `apps/client/**` o `infra/**` (Dockerfiles, compose files, Makefile) tienen cambios; construye ambas imágenes y las escanea con Trivy buscando CVEs CRITICAL/HIGH

El filtro `infra` cubre: `apps/api/Dockerfile`, `apps/client/Dockerfile`, `docker-compose*.yml`, `infra/**`, `Makefile`.

El **único required status check** en las branch protection rules es `ci / detect changes`. Los demás jobs son opcionales — si no corren (`skipped`), no bloquean el merge.

## Rationale

- Un PR que solo toca `apps/client/` no debería pagar el coste de correr el CI de `api`
- `dorny/paths-filter` es la acción estándar de la industria para este patrón — mantenida activamente, ampliamente usada
- Separar el job de detección de cambios del job de CI permite que las branch protection rules siempre tengan un check que evaluar (`ci / detect changes` siempre pasa o falla)
- GitHub marca los jobs con `if: false` como `skipped` — no como `passed` — por eso no pueden ser required checks

## Alternatives Considered

- **`on.pull_request.paths`** a nivel de workflow: descartado porque si el workflow no se activa, GitHub no registra ningún check y las branch protection rules bloquean el merge indefinidamente
- **Un solo job con matrix**: descartado — la matrix no soporta `if` condicional por entrada de forma limpia, y el nombre del check quedaría `ci (api)` en lugar de `ci / api`
- **Mantener CI sin path filters**: descartado — innecesariamente lento y no escala cuando las apps crezcan

## Consequences

- Branch protection rules en `main` y `dev` exigen solo `ci / detect changes` como required check
- `ci / api`, `ci / client` y `ci / docker build & scan` son informativos — si corren, deben pasar; si no corren, no bloquean
- Cambios en Dockerfiles, compose files o infra disparan el job de Docker aunque no haya cambios en el código de la app
- Añadir una tercera app (`apps/xxx`) solo requiere agregar una entrada en `paths-filter` y un nuevo job
