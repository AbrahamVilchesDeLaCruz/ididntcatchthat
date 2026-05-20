# Client Agent — ididntcatchthat

> **Scope**: Todo el código en `apps/client/`. Para otros scopes, regresa al orquestador: [../../AGENTS.md](../../AGENTS.md)

---

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|---|---|
| Creating new skills | `skill-creator` |
| After creating or modifying a skill | `skill-sync` |

---

## Architecture

Atomic Design + Container/Presentational pattern:

```
apps/client/src/
├── features/             ← features completas (flashcards, pronunciation...)
│   └── {feature}/
│       ├── components/   ← componentes presentacionales
│       ├── containers/   ← componentes con lógica y queries
│       ├── hooks/        ← hooks del feature
│       └── api/          ← llamadas con TanStack Query
├── components/           ← componentes atómicos compartidos
├── store/                ← Zustand (solo client state)
└── main.tsx
```

**Regla de oro**: los componentes presentacionales no saben nada de queries ni estado global. Reciben todo por props.

---

## Stack

| Tech | Rol |
|---|---|
| React + TypeScript | UI principal |
| Vite | Bundler y dev server |
| TailwindCSS | Estilos utilitarios |
| TanStack Query | Server state y caché |
| Zustand | Client state (UI, sesión) |
| Vitest | Unit e integration testing |
| Playwright | E2E testing |

---

## Code Rules

- **TypeScript** estricto — no usar `any`
- **TanStack Query** para todo lo que venga del servidor — nunca `useState` + `useEffect` para fetching
- **Zustand** solo para estado del cliente (no cache del servidor)
- **Zod** para validar respuestas de API — contratos en `packages/contracts/`
- Path aliases en todos los imports

---

## Commands

```bash
# Desde apps/client/
npm run dev         # Dev server
npm run test        # Vitest
npm run test:e2e    # Playwright
npm run lint        # ESLint
```

---

## Available Skills

| Skill | Description | URL |
|---|---|---|
| `skill-creator` | Crea nuevas skills | [SKILL.md](../../skills/skill-creator/SKILL.md) |
| `skill-sync` | Sincroniza skills a AGENTS.md | [SKILL.md](../../skills/skill-sync/SKILL.md) |
