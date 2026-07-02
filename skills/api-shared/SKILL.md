---
name: api-shared
description: "SharedModule global, bounded context shared, env validation Joi en apps/api/. Trigger: Al crear o modificar SharedModule, añadir validación de variables de entorno con Joi, o infraestructura transversal."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## When to Use

- Al crear o modificar el módulo `SharedModule` global
- Al crear un shared interno de un bounded context
- Al añadir validación de variables de entorno
- Al registrar infraestructura transversal (DB, Criteria, filtros globales)

> Lee `references/docs.md` para skills relacionadas, ADRs y documentación externa.

> Lee `references/module-patterns.md` para los módulos completos (`SharedModule`, `FlashcardsSharedModule`) y el schema Joi de variables de entorno.

---

## Structure

```
src/
└── shared/
    ├── domain/
    │   ├── criteria/               ← Criteria, Filters, Order (pure domain)
    │   └── value-objects/          ← UuidValueObject, StringValueObject, etc.
    ├── application/                ← interfaces agnósticas (Logger, EventBus, etc.)
    └── infrastructure/
        ├── persistence/
        │   └── migrations/
        ├── config/
        │   └── env.validation.ts   ← Joi schema
        └── shared.module.ts        ← @Global() — se importa UNA vez en AppModule
```

### Shared interno por bounded context

```
src/
└── flashcards/
    └── shared/
        ├── domain/
        │   └── flashcard.repository.ts   ← interface del repositorio
        └── infrastructure/
            └── flashcards-shared.module.ts
```

---

## Env Validation — Joi (esencial)

```typescript
// src/shared/infrastructure/config/env.validation.ts
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  // ... ver references/module-patterns.md para schema completo
});
```

**Reglas de env:**
- `abortEarly: false` siempre — ver todos los errores de una
- `.required()` en todo lo que no tiene default — falla en bootstrap, no en runtime
- **Joi para env** — no Zod. Es la integración nativa de `@nestjs/config`

---

## Criteria + TypeORM

El patrón Criteria se aplica **directamente en cada repositorio** con QueryBuilder — no hay un converter compartido. Cada repositorio aplica sus propios filtros porque puede tener relaciones y aliases distintos.

Ver implementación canónica en skill `api-criteria`.

---

## Reglas

- `SharedModule` se importa **una sola vez** en `AppModule` — es `@Global()`
- Los bounded context shared modules **no son globales** — se importan explícitamente
- `synchronize: false` **siempre** — las migraciones son la fuente de verdad del schema
- La validación de env falla en bootstrap — si falta una variable, la app no arranca
- BC shared modules exportan **solo el token de DI** — nunca la implementación concreta
