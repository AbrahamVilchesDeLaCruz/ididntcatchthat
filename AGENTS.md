# ididntcatchthat — AI Orchestrator

> Plataforma gamificada de aprendizaje de inglés centrada en fonética real, connected speech y expresiones nativas. Desarrollada como TFM.

## Role of This File

This is the **monorepo orchestrator**. Its job is to:

1. Route work to the correct scope based on which app is being modified.
2. Auto-invoke the correct skill before starting any action that has a known pattern.
3. Provide monorepo-wide conventions that apply to every scope.

Load the scope `AGENTS.md` as soon as you know which app you are working in. Do not work from this file alone for scope-specific tasks.

---

## Sub-Agent Routing

| If the work is in...                              | Load this agent                                          |
| ------------------------------------------------- | -------------------------------------------------------- |
| `apps/api/` — NestJS, Clean Architecture, TypeOrm | [apps/api/AGENTS.md](apps/api/AGENTS.md)                 |
| `apps/client/` — React, TanStack Query, Zustand   | [apps/client/AGENTS.md](apps/client/AGENTS.md)           |
| `skills/` — AI agent skills for this repo         | [skills/skill-sync/SKILL.md](skills/skill-sync/SKILL.md) |

---

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action                                                | Skill            |
| ----------------------------------------------------- | ---------------- |
| After creating or modifying a skill                   | `skill-sync`     |
| Creating new skills                                   | `skill-creator`  |
| AGENTS.md Available Skills or Auto-invoke out of sync | `skill-sync`     |
| Creating a branch, opening a PR, or merging code      | `git-workflow`   |

---

## Available Skills

| Skill           | Description                                                   | URL                                          |
| --------------- | ------------------------------------------------------------- | -------------------------------------------- |
| `skill-creator` | Crea nuevas skills siguiendo el spec del repo                 | [SKILL.md](skills/skill-creator/SKILL.md)    |
| `skill-sync`    | Sincroniza skills a las tablas de AGENTS.md                   | [SKILL.md](skills/skill-sync/SKILL.md)       |
| `git-workflow`  | Branching, naming, merge strategy y PRs para este repo        | [SKILL.md](skills/git-workflow/SKILL.md)     |

---

## Project Structure

```
ididntcatchthat/
├── apps/
│   ├── api/          ← NestJS backend (Clean Architecture)
│   └── client/       ← React frontend
├── skills/           ← AI agent skills (fuente de verdad)
├── prompts/          ← Prompts usados durante el desarrollo
├── docs/             ← Documentación del proyecto
├── infra/            ← Docker Compose, observabilidad
└── AGENTS.md         ← Este archivo
```

---

## Stack

| Layer          | Tech                                                          |
| -------------- | ------------------------------------------------------------- |
| Frontend       | React, TypeScript, Vite, TailwindCSS, TanStack Query, Zustand, Zod |
| Backend        | NestJS, TypeScript, TypeORM, Class Validator                        |
| Database       | PostgreSQL (Aiven)                                            |
| CDN            | Cloudflare (audio files)                                      |
| Testing        | Vitest, Jest, Playwright                                      |
| Observabilidad | OpenTelemetry, Prometheus, Grafana, Loki                      |
| Infra          | VPS, Docker, GitHub Actions                                   |

---

## Monorepo-wide Code Style

- **TypeScript** estricto en todos los paquetes — no usar `any`
- **Zod and Class Validator** para validación cliente-servidor`
- **Conventional Commits**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`
- **ESLint + Prettier** — no commitear código sin pasar linting
- **Imports**: usar path aliases, nunca rutas relativas largas

---

## Commit Guidelines

```
feat(flashcards): add spaced repetition algorithm
fix(audio): handle ElevenLabs timeout gracefully
refactor(pronunciation): extract scoring to domain service
test(flashcards): add unit tests for review scheduler
```

---

## Documentation & Diagrams

- Toda la documentación en Markdown dentro de `docs/`
- Diagramas con **Mermaid** embebido en `.md` — sin imágenes externas
- ADRs en `docs/adr/` para decisiones arquitectónicas importantes
