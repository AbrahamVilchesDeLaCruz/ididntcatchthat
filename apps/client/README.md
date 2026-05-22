# Client — ididntcatchthat

Frontend del proyecto **ididntcatchthat** — plataforma gamificada de aprendizaje de inglés centrada en fonética real y connected speech.

Construido con **React 19 + Vite** siguiendo el patrón **Pods + Container/Presentational**.

---

## Arquitectura

```
src/
├── common/        ← Componentes reutilizables sin dominio (Button, Input, Modal)
├── common-app/    ← Reutilizables ligados al dominio (CreateFlashcardPopup)
├── core/          ← Router, auth, API client, interceptores, providers globales
├── layout/        ← Plantillas visuales (Sidebar, Topbar, AppShell)
├── containers/    ← Pods organizados por dominio
└── views/         ← Páginas que seleccionan layout + renderizan pods
```

### Estructura interna de un pod

```
containers/{feature}/
├── api/
│   ├── {feature}.api-model.ts   ← tipos raw de la API
│   └── {feature}.api.ts         ← llamadas HTTP + hooks TanStack Query
├── hooks/
│   ├── use{Feature}State.ts
│   └── use{Feature}Handlers.ts
├── components/
│   └── {Feature}{Part}.tsx
├── {Feature}Container.tsx        ← lógica, queries, routing
├── {Feature}Component.tsx        ← UI pura, solo props
├── {feature}.mapper.ts
├── {feature}.types.ts
└── index.ts
```

**Regla de oro**: Container = mundo exterior (queries, routing, Zustand). Component = mundo de la UI (props, sub-componentes, estilos).

---

## Stack

| Tech           | Rol                                              |
| -------------- | ------------------------------------------------ |
| React 19       | UI principal                                     |
| TypeScript     | Lenguaje — modo estricto, sin `any`              |
| Vite           | Bundler y dev server                             |
| TailwindCSS    | Estilos utilitarios                              |
| TanStack Query | Server state y caché — nunca `useState` + fetch  |
| Zustand        | Client state (UI, sesión)                        |
| Zod            | Validación de respuestas de API                  |
| Vitest + RTL   | Unit e integration testing                       |
| Playwright     | E2E testing                                      |
| MSW            | Mock de API en tests                             |

---

## Comandos

```bash
# Desde apps/client/

# ─── Desarrollo ───────────────────────────────────────────────────────────────
pnpm dev              # Dev server Vite (usar desde raíz: make dev-client)

# ─── Linting ──────────────────────────────────────────────────────────────────
pnpm lint             # ESLint --fix

# ─── Unit tests ───────────────────────────────────────────────────────────────
pnpm test             # Vitest run — single pass
pnpm test:watch       # TDD loop — re-run on change
pnpm test:cov         # Vitest + coverage → coverage/
pnpm test:ui          # Vitest UI en browser

# ─── E2E tests ────────────────────────────────────────────────────────────────
pnpm test:e2e         # Playwright
pnpm test:e2e:ui      # Playwright con UI interactiva

# ─── All ──────────────────────────────────────────────────────────────────────
pnpm test:all         # Unit + E2E secuencial

# ─── CI ───────────────────────────────────────────────────────────────────────
pnpm test:ci          # Vitest + coverage + verbose
pnpm test:e2e:ci      # Playwright --reporter=github
```

---

## Documentación relacionada

- [Frontend Architecture](../../docs/frontend-architecture.md) — pods, container/presentational, convenciones
- [ADRs](../../docs/adr/) — decisiones de arquitectura
