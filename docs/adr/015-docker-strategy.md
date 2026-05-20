# ADR-015: Docker Strategy

**Status**: Accepted  
**Date**: 2026-05-20  
**Deciders**: Abraham Vilches de la Cruz

---

## Context

El proyecto necesita una estrategia de contenedores que permita:

- Builds reproducibles en cualquier entorno (local, CI, VPS)
- Imágenes de producción livianas y seguras
- Flujo de trabajo simple para dev diario
- Limpieza automática de recursos Docker obsoletos

---

## Decision

### Estructura

Cada app tiene su propio `Dockerfile` con **multi-stage build**. La orquestación vive en un único `docker-compose.yml` en la raíz. El `Makefile` en raíz es el punto de entrada único para todos los comandos Docker.

```
apps/api/Dockerfile       ← Stage 1: builder (Node + pnpm + nest build)
                          ← Stage 2: runtime (node:24-alpine + dist + prod deps)
apps/client/Dockerfile    ← Stage 1: builder (Node + pnpm + vite build)
                          ← Stage 2: runtime (nginx:alpine + dist estático)
apps/client/nginx.conf    ← SPA fallback + cache headers
docker-compose.yml        ← orquesta api + client
Makefile                  ← comandos: up, down, build, clean, purge, prune
```

### Multi-stage build — por qué

El stage `builder` incluye devDependencies, TypeScript compiler, CLI de NestJS/Vite, etc. El stage `runtime` solo copia el artefacto compilado (`dist/`) y las dependencias de producción. Resultado: imágenes ~10x más livianas y sin superficie de ataque innecesaria.

### Gestión de recursos — niveles de limpieza

| Comando               | Qué hace                      | Cuándo usarlo                      |
| --------------------- | ----------------------------- | ---------------------------------- |
| `make clean-dangling` | Elimina imágenes sin tag      | Automático en cada `make up`       |
| `make clean`          | Containers parados + dangling | Limpieza rutinaria                 |
| `make purge`          | clean + volumes               | ⚠️ Borra datos locales             |
| `make prune`          | `docker system prune -af`     | ☢️ Nuclear — liberar espacio total |

`clean-dangling` corre automáticamente antes de cada `make up` para evitar acumulación de imágenes obsoletas tras rebuilds.

### Client: nginx como runtime

Vite produce un bundle estático. En producción no tiene sentido correr un proceso Node — nginx es más eficiente, tiene mejor manejo de assets estáticos y permite configurar cache headers correctamente. El `nginx.conf` incluye SPA fallback (`try_files $uri /index.html`) y headers de cache para assets inmutables.

### Context de build desde raíz

Ambos `Dockerfile` usan `context: .` (raíz del monorepo) en el `docker-compose.yml`. Esto permite copiar `pnpm-workspace.yaml` y `pnpm-lock.yaml` que viven en raíz — necesarios para que pnpm resuelva el workspace correctamente.

---

## Alternatives Considered

### docker-compose por app + orquestador en raíz

Tres archivos `docker-compose` (uno por app + root). Más complejo de mantener, variables compartidas duplicadas, debugging más difícil. Descartado a favor de un único `docker-compose.yml`.

### Sin Makefile (usar docker compose directamente)

Requiere recordar flags y comandos. El Makefile actúa como documentación ejecutable y centraliza la gestión de limpieza.

---

## Consequences

- ✅ Builds reproducibles — pnpm lockfile garantiza dependencias exactas
- ✅ Imágenes livianas — multi-stage elimina devDependencies del runtime
- ✅ SPA routing funciona en producción — nginx fallback configurado
- ✅ Limpieza automática de dangling images en cada `make up`
- ⚠️ Variables de entorno no gestionadas aún — se integrarán con Doppler (ADR pendiente)
- ⚠️ Sin base de datos en Docker por ahora — PostgreSQL via Aiven en prod, local cuando se necesite
