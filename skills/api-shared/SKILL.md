# Skill: api-shared

## When to Use

- Al crear o modificar el módulo `SharedModule` global
- Al crear un shared interno de un bounded context
- Al añadir validación de variables de entorno
- Al registrar infraestructura transversal (DB, Criteria, filtros globales)

---

## Structure

```
src/
└── shared/
    ├── domain/
    │   ├── criteria/               ← Criteria, Filters, Order, Pagination (pure domain)
    │   └── value-objects/          ← UuidValueObject, StringValueObject, etc.
    ├── application/                ← interfaces agnósticas (Logger, EventBus, etc.)
    └── infrastructure/
        ├── persistence/
        │   ├── typeorm/
        │   │   ├── typeorm.config.ts
        │   │   └── criteria/       ← TypeOrmCriteriaConverter, QueryCriteria
        │   └── migrations/
        ├── config/
        │   └── env.validation.ts   ← Joi schema
        └── shared.module.ts        ← @Global() — se importa UNA vez en AppModule
```

### Shared interno por bounded context

Cada bounded context que necesite exportar algo entre sus propios módulos usa un shared interno:

```
src/
└── flashcards/
    └── shared/
        ├── domain/
        │   └── flashcard.repository.ts   ← interface del repositorio
        └── infrastructure/
            └── flashcards-shared.module.ts
```

El `FlashcardsSharedModule` exporta solo lo que otros módulos del mismo bounded context necesitan. El `SharedModule` global exporta infraestructura transversal (DB, Criteria, Logger, EventBus).

---

## SharedModule — Global

```typescript
// src/shared/infrastructure/shared.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envValidationSchema } from './config/env.validation';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,  // muestra TODOS los errores, no solo el primero
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,   // NUNCA true en producción — usar migrations
        migrationsRun: false, // correr migrations manualmente o en bootstrap
      }),
    }),
  ],
  exports: [ConfigModule, TypeOrmModule],
})
export class SharedModule {}
```

---

## Env Validation — Joi

```typescript
// src/shared/infrastructure/config/env.validation.ts
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),

  // Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // Auth
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),

  // RabbitMQ
  RABBITMQ_URL: Joi.string().uri().required(),
});
```

**Reglas:**
- `abortEarly: false` — siempre, para ver todos los errores de una
- Defaults explícitos para valores con fallback razonable
- `.required()` en todo lo que no tiene default — falla rápido en arranque
- **Joi para env** — no Zod. Es la integración nativa de `@nestjs/config`

---

## Bounded Context Shared Module

```typescript
// src/flashcards/shared/infrastructure/flashcards-shared.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardTypeOrmEntity } from './persistence/flashcard.typeorm-entity';
import { FlashcardTypeOrmRepository } from './persistence/flashcard.typeorm-repository';
import { FLASHCARD_REPOSITORY } from '../domain/flashcard.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FlashcardTypeOrmEntity])],
  providers: [
    {
      provide: FLASHCARD_REPOSITORY,
      useClass: FlashcardTypeOrmRepository,
    },
  ],
  exports: [FLASHCARD_REPOSITORY],
})
export class FlashcardsSharedModule {}
```

**Regla:** El shared interno exporta SOLO el token de DI (`FLASHCARD_REPOSITORY`), nunca la implementación concreta. Los use cases dependen de la interfaz, no de TypeORM.

---

## Criteria + TypeORM

El `SharedModule` registra el `TypeOrmCriteriaConverter` como provider global para que cualquier repositorio lo inyecte:

```typescript
// En SharedModule providers:
providers: [TypeOrmCriteriaConverter],
exports: [TypeOrmCriteriaConverter],
```

```typescript
// src/shared/infrastructure/persistence/typeorm/criteria/typeorm-criteria.converter.ts
import { Injectable } from '@nestjs/common';
import { Criteria } from '@shared/domain/criteria/criteria';
import { SelectQueryBuilder } from 'typeorm';

@Injectable()
export class TypeOrmCriteriaConverter {
  apply<T>(qb: SelectQueryBuilder<T>, criteria: Criteria): SelectQueryBuilder<T> {
    // aplicar filters, order, pagination al query builder
    return qb;
  }
}
```

---

## Rules

- `SharedModule` se importa **una sola vez** en `AppModule` — es `@Global()`
- Los bounded context shared modules **no son globales** — se importan explícitamente
- `synchronize: false` **siempre** — las migraciones son la fuente de verdad del schema
- La validación de env falla en bootstrap — nunca en runtime. Si falta una variable, la app no arranca
