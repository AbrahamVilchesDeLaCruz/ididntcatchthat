# API Agent — ididntcatchthat

> **Scope**: Todo el código en `apps/api/`. Para otros scopes, regresa al orquestador: [../../AGENTS.md](../../AGENTS.md)

---

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|---|---|
| Creating new skills | `skill-creator` |
| After creating or modifying a skill | `skill-sync` |

---

## Architecture

Clean Architecture con Screaming Architecture por feature:

```
apps/api/src/
├── {feature}/
│   ├── domain/           ← entidades, value objects, interfaces de repositorio
│   ├── application/      ← casos de uso, DTOs, servicios de aplicación
│   └── infrastructure/   ← repositorios Prisma, adaptadores externos
├── shared/               ← utilidades compartidas entre features
└── main.ts
```

**Regla de oro**: dependencias apuntan hacia adentro. `infrastructure` depende de `application`, `application` depende de `domain`. Nunca al revés.

---

## Stack

| Tech | Rol |
|---|---|
| NestJS + TypeScript | Framework principal |
| TypeORM | ORM — solo en `infrastructure/` |
| Class Validator | Validación de DTOs |
| PostgreSQL (Aiven) | Base de datos |
| Jest | Testing |
| OpenAPI / Swagger | Contrato de API |
| ElevenLabs | Generación de audio (backoffice) |
| Azure Speech | Evaluación de pronunciación |

---

## Code Rules

- **TypeScript** estricto — no usar `any`
- **Prisma** solo en `infrastructure/persistence/` — nunca en domain ni application
- Errores de dominio como clases tipadas: `throw new FlashcardNotFoundError(id)`
- Servicios externos (ElevenLabs, Azure) solo en `infrastructure/` — interfaces en `domain/`
- Path aliases en todos los imports — nunca rutas relativas largas

---

## Commands

```bash
# Desde apps/api/
npm run dev         # Dev server con hot-reload
npm run test        # Todos los tests
npm run test:unit   # Solo unit tests
npm run test:e2e    # Tests E2E
npm run test:cov    # Coverage
```

---

## Available Skills

| Skill | Description | URL |
|---|---|---|
| `skill-creator` | Crea nuevas skills | [SKILL.md](../../skills/skill-creator/SKILL.md) |
| `skill-sync` | Sincroniza skills a AGENTS.md | [SKILL.md](../../skills/skill-sync/SKILL.md) |
