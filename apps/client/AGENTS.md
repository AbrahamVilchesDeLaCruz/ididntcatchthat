# Client Agent — ididntcatchthat

> **Scope**: Todo el código en `apps/client/`. Para otros scopes, regresa al orquestador: [../../AGENTS.md](../../AGENTS.md)

---

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|---|---|
| Crear un pod nuevo o agregar archivos a uno existente | `client-pods` |
| Crear o modificar un Container o Component | `client-container-presentational` |
| Agregar queries, mutations o query keys | `client-query` |
| Crear o modificar `api/`, mapper, o types | `client-api` |
| Crear o modificar hooks del pod o globales | `client-hooks` |
| Escribir tests (unit, integration, E2E) | `client-testing` |
| Creating new skills | `skill-creator` |
| After creating or modifying a skill | `skill-sync` |

---

## Architecture

Pods + Container-Presentational pattern.

> Referencia completa: [docs/engineering/frontend-architecture.md](../../docs/engineering/frontend-architecture.md)

```
apps/client/src/
├── common/        ← Componentes reutilizables sin dominio (Button, Input, Modal)
├── common-app/    ← Reutilizables pero ligados al dominio (CreateFlashcardPopup)
├── core/          ← Router, auth, API client, interceptores, providers globales
├── layout/        ← Plantillas visuales (Sidebar, Topbar, AppShell)
├── containers/    ← Pods organizados por dominio
└── views/         ← Páginas que seleccionan layout + renderizan pods
```

### Estructura interna de un pod

```
containers/{feature}/
├── api/
│   ├── index.ts
│   ├── {feature}.api-model.ts
│   └── {feature}.api.ts
├── hooks/
│   ├── use{Feature}{Concern}.ts
│   └── index.ts
├── components/
│   └── {Feature}{Part}.tsx
├── {Feature}Container.tsx
├── {Feature}Component.tsx
├── {feature}.mapper.ts
├── {feature}.types.ts
└── index.ts
```

**Regla de oro**: Container = mundo exterior (queries, routing, Zustand). Component = mundo de la UI (useState, useEffect, sub-componentes).

---

## Stack

| Tech | Rol |
|---|---|
| React + TypeScript | UI principal |
| Vite | Bundler y dev server |
| TailwindCSS | Estilos utilitarios |
| TanStack Query | Server state y caché |
| Zustand | Client state (UI, sesión) |
| Vitest + RTL | Unit e integration testing |
| Playwright | E2E testing |
| MSW | Mock de API en tests |

---

## Code Rules

- **TypeScript** estricto — no usar `any`
- **TanStack Query** para todo lo que venga del servidor — nunca `useState` + `useEffect` para fetching
- **Zustand** solo para estado del cliente (no cache del servidor)
- **Zod** para validar respuestas de API en `core/`
- Path aliases en todos los imports
- Un pod NO importa de otro pod

---

## Commands

```bash
# Desde apps/client/
pnpm dev              # Dev server (Vite)
pnpm lint             # ESLint --fix

# ─── Unit tests ───────────────────────────────────────────────────────────────
pnpm test             # Vitest run — single pass (pass si no hay tests aún)
pnpm test:watch       # TDD loop — re-run on change
pnpm test:cov         # Vitest + coverage → coverage/
pnpm test:ui          # Vitest UI en browser (visualización interactiva)

# ─── E2E tests ────────────────────────────────────────────────────────────────
pnpm test:e2e         # Playwright (requiere instalación previa)
pnpm test:e2e:ui      # Playwright con UI interactiva

# ─── All ──────────────────────────────────────────────────────────────────────
pnpm test:all         # Unit + E2E secuencial

# ─── CI ───────────────────────────────────────────────────────────────────────
pnpm test:ci          # Vitest + coverage + verbose (GitHub Actions)
pnpm test:e2e:ci      # Playwright --reporter=github (GitHub Actions)
```

**Config Vitest:** `vitest.config.ts` — separado de `vite.config.ts` intencionalmente.
**Setup:** `src/test/setup.ts` — importa `@testing-library/jest-dom`.
**Coverage thresholds:** 80% branches / functions / lines / statements

---

## Available Skills

| Skill | Description | URL |
|---|---|---|
| `client-pods` | Estructura de pods, naming, cuándo crear qué | [SKILL.md](../../skills/client-pods/SKILL.md) |
| `client-container-presentational` | Contrato Container/Component, responsabilidades, prohibiciones | [SKILL.md](../../skills/client-container-presentational/SKILL.md) |
| `client-query` | TanStack Query: queries, mutations, query keys, invalidación | [SKILL.md](../../skills/client-query/SKILL.md) |
| `client-api` | Capa api/: api-model, api.ts, mapper, ViewModel types | [SKILL.md](../../skills/client-api/SKILL.md) |
| `client-hooks` | Hooks del pod [State, Handlers], hooks globales, cuándo extraer | [SKILL.md](../../skills/client-hooks/SKILL.md) |
| `client-testing` | Vitest + RTL (unit/integration), Playwright E2E, MSW | [SKILL.md](../../skills/client-testing/SKILL.md) |
| `skill-creator` | Crea nuevas skills | [SKILL.md](../../skills/skill-creator/SKILL.md) |
| `skill-sync` | Sincroniza skills a AGENTS.md | [SKILL.md](../../skills/skill-sync/SKILL.md) |
