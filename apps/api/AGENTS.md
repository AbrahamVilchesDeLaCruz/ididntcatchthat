# API Agent — ididntcatchthat

> **Scope**: Todo el código en `apps/api/`. Para otros scopes, regresa al orquestador: [../../AGENTS.md](../../AGENTS.md)

---

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|---|---|
| Crear o modificar aggregates, value objects, repositorios, domain errors | `api-domain` |
| Crear o modificar casos de uso o domain services | `api-application` |
| Crear o modificar controllers, entidades TypeORM, repositorios, módulos | `api-infrastructure` |
| Crear o modificar domain events, registrar eventos en aggregates | `api-domain-events` |
| Crear o modificar tests, Object Mothers, mocks de puertos | `api-testing` |
| Construir queries con filtros, orden o paginación | `api-criteria` |
| Crear domain errors o registrar excepciones en un módulo | `api-error-handler` |
| Diseñar o implementar endpoints REST o acciones DDD | `api-rest` |
| Implementar auth, guards, strategies, @CurrentUser, voters | `api-auth` |
| Creating new skills | `skill-creator` |
| After creating or modifying a skill | `skill-sync` |

---

## Architecture

Clean Architecture con Screaming Architecture por feature:

```
apps/api/src/
├── {feature}/
│   ├── domain/           ← aggregates, value objects, interfaces de repositorio, domain errors
│   ├── application/      ← casos de uso, domain services
│   └── infrastructure/
│       ├── controllers/  ← un controller por acción + payload/query junto a él
│       ├── framework/    ← NestJS modules + exception registries
│       └── persistence/  ← TypeORM entities + repositorios
├── shared/               ← AggregateRoot, ValueObject, DomainError, Criteria base classes
└── main.ts
```

**Regla de oro**: dependencias apuntan hacia adentro. `infrastructure` depende de `application`, `application` depende de `domain`. Nunca al revés.

---

## Stack

| Tech | Rol |
|---|---|
| NestJS + TypeScript | Framework principal |
| TypeORM | ORM — solo en `infrastructure/` |
| Class Validator | Validación de payloads HTTP en controllers |
| PostgreSQL (Aiven) | Base de datos |
| Jest + Faker.js + jest-mock-extended | Testing |
| OpenAPI / Swagger | Contrato de API |
| ElevenLabs | Generación de audio (backoffice) |
| Azure Speech | Evaluación de pronunciación |

---

## Code Rules

- **TypeScript** estricto — no usar `any`
- **TypeORM** solo en `infrastructure/persistence/` — nunca en domain ni application
- Errores de dominio como clases tipadas: `throw new FlashcardNotFound(id)`
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

| Skill | Scope | Description | URL |
|---|---|---|---|
| `api-domain`           | api    | AggregateRoot, Value Objects, Repository interface, DomainErrors | [SKILL.md](../../skills/api-domain/SKILL.md)           |
| `api-application`      | api    | Use Cases, Domain Services, convenciones de inyección            | [SKILL.md](../../skills/api-application/SKILL.md)      |
| `api-infrastructure`   | api    | Controllers, TypeORM entities, repositorios, módulos NestJS      | [SKILL.md](../../skills/api-infrastructure/SKILL.md)   |
| `api-domain-events`    | api    | Domain Events — definición, naming, registro en aggregates       | [SKILL.md](../../skills/api-domain-events/SKILL.md)    |
| `api-testing`          | api    | Pirámide de tests, Object Mother, jest-mock-extended             | [SKILL.md](../../skills/api-testing/SKILL.md)          |
| `api-criteria`         | api    | Criteria — filtros, orden, paginación, flujo controller→uc→repo  | [SKILL.md](../../skills/api-criteria/SKILL.md)         |
| `api-error-handler`    | api    | GlobalExceptionRegistry, filtros por módulo, HttpExceptionFilter | [SKILL.md](../../skills/api-error-handler/SKILL.md)    |
| `api-rest`             | api    | Convenciones RESTful + acciones DDD con POST                     | [SKILL.md](../../skills/api-rest/SKILL.md)             |
| `api-auth`             | api    | JWT, OAuth Google, guest token, guards, @CurrentUser, voters     | [SKILL.md](../../skills/api-auth/SKILL.md)             |
| `skill-creator`        | global | Crea nuevas skills                                               | [SKILL.md](../../skills/skill-creator/SKILL.md)        |
| `skill-sync`           | global | Sincroniza skills a AGENTS.md                                    | [SKILL.md](../../skills/skill-sync/SKILL.md)           |
