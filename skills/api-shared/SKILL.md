---
name: api-shared
description: "SharedModule global, bounded context shared, env validation Joi en apps/api/. Trigger: Al crear o modificar SharedModule, añadir validación de variables de entorno con Joi, o infraestructura transversal."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.1"
---

## When to Use

- Al crear o modificar el módulo `SharedModule` global
- Al crear un shared interno de un bounded context
- Al añadir validación de variables de entorno
- Al registrar infraestructura transversal (logger, event bus, filtros globales)

> Lee `references/docs.md` para skills relacionadas, ADRs y documentación externa.

> Lee `references/module-patterns.md` para los módulos completos (`SharedModule`, `AppModule`, `AchievementModule`) y el schema Joi de variables de entorno.

---

## Structure

```
src/
└── shared/
    ├── domain/
    │   ├── criteria.ts                  ← Criteria (pure domain, un solo archivo)
    │   ├── aggregate-root.ts
    │   ├── domain-event.ts
    │   ├── domain-event-publisher.ts    ← interface del EventBus (port)
    │   ├── logger.ts                    ← interface del Logger (port)
    │   ├── value-object.ts
    │   ├── string-value-object.ts
    │   ├── uuid-value-object.ts
    │   ├── user-id.ts
    │   ├── flashcard-id.ts
    │   └── exceptions/                  ← excepciones de dominio transversales
    ├── application/
    │   ├── subscriber.ts                ← abstract Subscriber
    │   └── domain-event-consumer.ts     ← interface del consumer
    └── infrastructure/
        ├── persistence/
        │   ├── inbox/                   ← ProcessedEventEntity, TypeOrmProcessedEventsRepository
        │   ├── migrations/
        │   └── typeorm/
        │       ├── typeorm-data-source-options.ts  ← buildTypeOrmDataSourceOptions()
        │       └── typeorm.config.cli.ts
        ├── config/
        │   ├── env.validation.ts        ← Joi schema
        │   └── use-stub-adapters.ts
        ├── framework/
        │   └── shared.module.ts         ← @Global() — se importa UNA vez en AppModule
        ├── auth/
        │   └── auth.module.ts           ← JWT + Google + Guest strategies
        ├── event-bus/
        │   ├── amqp-message-bus.ts      ← implements DOMAIN_EVENT_PUBLISHER + DOMAIN_EVENT_CONSUMER
        │   └── subscribers-bootstrapper.ts
        ├── exceptions/
        │   ├── global-exception-registry.ts
        │   └── http-exception.filter.ts
        └── logger/
            └── pino-logger.ts           ← implements LOGGER_SERVICE
```

### Shared interno por bounded context

Los bounded contexts con múltiples submódulos tienen un `shared/` propio que contiene:
- **`domain/`** — value objects, interfaces o constantes que cruzan submódulos dentro del BC
- **`infrastructure/framework/`** — el módulo NestJS del BC completo (wiring), exception registry del BC

```
src/
└── achievement/
    └── shared/
        ├── domain/
        │   ├── achievement-key.ts          ← VO compartido entre submódulos
        │   ├── achievement-category.ts     ← VO compartido
        │   └── exceptions/                 ← errores de dominio del BC
        └── infrastructure/
            └── framework/
                ├── achievement.module.ts           ← NestJS module del BC completo
                └── achievement-exception-registry.ts
```

---

## Env Validation — Joi (esencial)

```typescript
// src/shared/infrastructure/config/env.validation.ts
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  // ... ver references/module-patterns.md para schema completo
});
```

**Reglas de env:**
- `abortEarly: false` siempre — ver todos los errores de una
- `.required()` en todo lo que no tiene default — falla en bootstrap, no en runtime
- **Joi para env** — no Zod. Es la integración nativa de `@nestjs/config`
- La configuración vive en `ConfigModule.forRoot()` **en `AppModule`**, no en `SharedModule`

---

## ConfigModule y TypeORM — van en AppModule

`ConfigModule.forRoot()` y `TypeOrmModule.forRootAsync()` se configuran en **`AppModule`**, no en `SharedModule`.

- `ConfigModule` se declara `isGlobal: true` para que `ConfigService` esté disponible en todos los módulos
- TypeORM se configura mediante `buildTypeOrmDataSourceOptions()` que parsea `DATABASE_URL`
- `SharedModule` no importa ni re-exporta `ConfigModule` ni `TypeOrmModule`

---

## SharedModule — lo que exporta

`SharedModule` provee infraestructura transversal que todos los módulos necesitan sin importarla explícitamente:

| Token / clase | Implementación | Descripción |
|---|---|---|
| `LOGGER_SERVICE` | `PinoLogger` | Logger estructurado |
| `DOMAIN_EVENT_PUBLISHER` | `AmqpMessageBus` | Publica eventos al bus |
| `DOMAIN_EVENT_CONSUMER` | `AmqpMessageBus` | Consume eventos del bus |
| `GlobalExceptionRegistry` | — | Registry central de excepciones |
| `HttpExceptionFilter` | — | Filtro HTTP global (vía `APP_FILTER`) |

---

## Criteria + TypeORM

El patrón Criteria se aplica **directamente en cada repositorio** con QueryBuilder — no hay un converter compartido. Cada repositorio aplica sus propios filtros porque puede tener relaciones y aliases distintos.

Ver implementación canónica en skill `api-criteria`.

---

## Reglas

- `SharedModule` se importa **una sola vez** en `AppModule` — es `@Global()`
- `ConfigModule` y `TypeOrmModule` se configuran en `AppModule`, no en `SharedModule`
- Los bounded context modules **no son globales** — se importan explícitamente en `AppModule`
- `synchronize: false` **siempre** — las migraciones son la fuente de verdad del schema
- La validación de env falla en bootstrap — si falta una variable, la app no arranca
- BC modules exportan solo lo que otros BCs necesitan (tokens de repositorio o domain services)
