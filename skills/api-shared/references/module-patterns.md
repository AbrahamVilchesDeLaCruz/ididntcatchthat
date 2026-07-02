# Module Patterns — Reference

## `SharedModule` global completo

```typescript
// src/shared/infrastructure/framework/shared.module.ts
import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { LOGGER_SERVICE } from '@/shared/domain/logger';
import { DOMAIN_EVENT_PUBLISHER } from '@/shared/domain/domain-event-publisher';
import { DOMAIN_EVENT_CONSUMER } from '@/shared/application/domain-event-consumer';
import { HealthGetController } from '../controllers/health-get.controller';
import { PinoLogger } from '../logger/pino-logger';
import { GlobalExceptionRegistry } from '../exceptions/global-exception-registry';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { AmqpMessageBus } from '../event-bus/amqp-message-bus';

@Global()
@Module({
  controllers: [HealthGetController],
  providers: [
    {
      provide: LOGGER_SERVICE,
      useClass: PinoLogger,
    },
    GlobalExceptionRegistry,
    HttpExceptionFilter,
    {
      provide: APP_FILTER,
      useExisting: HttpExceptionFilter,
    },
    // Event bus — singleton compartido por todos los módulos
    AmqpMessageBus,
    { provide: DOMAIN_EVENT_PUBLISHER, useExisting: AmqpMessageBus },
    { provide: DOMAIN_EVENT_CONSUMER, useExisting: AmqpMessageBus },
  ],
  exports: [
    LOGGER_SERVICE,
    GlobalExceptionRegistry,
    HttpExceptionFilter,
    DOMAIN_EVENT_PUBLISHER,
    DOMAIN_EVENT_CONSUMER,
  ],
})
export class SharedModule {}
```

> **Importante**: `SharedModule` **no** contiene `ConfigModule` ni `TypeOrmModule`.
> Estos se configuran en `AppModule` (ver sección siguiente).

---

## `AppModule` — ConfigModule + TypeORM + wiring global

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'node:path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SharedModule } from './shared/infrastructure/framework/shared.module';
import { buildTypeOrmDataSourceOptions } from './shared/infrastructure/persistence/typeorm/typeorm-data-source-options';
import { envValidationSchema } from './shared/infrastructure/config/env.validation';
// ... BC modules

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), '.env.local'),
        join(process.cwd(), '.env'),
      ],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => buildTypeOrmDataSourceOptions(),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
        skipIf: (): boolean => process.env.NODE_ENV === 'test',
      },
      {
        name: 'auth',
        ttl: 60_000,
        limit: 10,
        skipIf: (): boolean => process.env.NODE_ENV === 'test',
      },
    ]),
    SharedModule,
    // IdentityModule, ContentModule, GamingModule, ...
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

---

## TypeORM Data Source Options

TypeORM se configura con `DATABASE_URL` (una sola variable), no con variables separadas por campo:

```typescript
// src/shared/infrastructure/persistence/typeorm/typeorm-data-source-options.ts
export function buildTypeOrmDataSourceOptions(options?: {
  migrationsRun?: boolean;
  logging?: boolean;
}): DataSourceOptions {
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';
  const dbUrl = parseDatabaseUrl(process.env.DATABASE_URL);

  return {
    type: 'postgres',
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '5432', 10),
    username: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', ''),
    ssl: resolveDbSsl(dbUrl.hostname),
    entities: typeOrmEntities,
    migrations: typeOrmMigrations,
    migrationsTableName: 'migrations',
    migrationsRun: options?.migrationsRun ?? !isProd,
    synchronize: false,   // NUNCA true en producción
    logging: options?.logging ?? (!isProd && !isTest),
  };
}
```

---

## Bounded Context Module completo

Los BC modules son módulos NestJS completos que cablea todo el BC: repositorios, use cases, controllers, subscribers y el exception registry. Viven en `{bc}/shared/infrastructure/framework/`.

```typescript
// src/achievement/shared/infrastructure/framework/achievement.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@/shared/infrastructure/framework/shared.module';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';
import { SUBSCRIBERS, SubscribersBootstrapper } from '@/shared/infrastructure/event-bus/subscribers-bootstrapper';

import { USER_ACHIEVEMENT_REPOSITORY } from '@/achievement/user-achievement/domain/user-achievement.repository';
import { USER_ACHIEVEMENT_PROGRESS_REPOSITORY } from '@/achievement/progress/domain/user-achievement-progress.repository';
import { UserAchievementEntity } from '@/achievement/user-achievement/infrastructure/persistence/user-achievement.entity';
import { UserAchievementProgressEntity } from '@/achievement/progress/infrastructure/persistence/user-achievement-progress.entity';
import { TypeOrmUserAchievementRepository } from '@/achievement/user-achievement/infrastructure/persistence/typeorm-user-achievement.repository';
import { TypeOrmUserAchievementProgressRepository } from '@/achievement/progress/infrastructure/persistence/typeorm-user-achievement-progress.repository';

import { AchievementCatalog } from '@/achievement/catalog/domain/achievement-catalog';
import { AchievementsSearcher } from '@/achievement/user-achievement/application/search/achievements-searcher';
import { SearchAchievementsGetController } from '@/achievement/user-achievement/infrastructure/controllers/search-achievements-get.controller';
import { AchievementExceptionRegistry } from './achievement-exception-registry';
// ... más use cases y subscribers

@Module({
  imports: [
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([
      UserAchievementEntity,
      UserAchievementProgressEntity,
    ]),
  ],
  controllers: [SearchAchievementsGetController],
  providers: [
    // Repositories — se registran con token de DI
    { provide: USER_ACHIEVEMENT_REPOSITORY, useClass: TypeOrmUserAchievementRepository },
    { provide: USER_ACHIEVEMENT_PROGRESS_REPOSITORY, useClass: TypeOrmUserAchievementProgressRepository },

    // Domain services
    AchievementCatalog,

    // Use cases
    AchievementsSearcher,

    // Subscribers — wired vía useFactory
    {
      provide: SUBSCRIBERS,
      useFactory: (/* ...subscribers */): Subscriber[] => [/* ... */],
      inject: [/* ... */],
    },
    SubscribersBootstrapper,

    // Exception registry del BC
    AchievementExceptionRegistry,
  ],
  exports: [
    AchievementCatalog,           // domain service — necesitado por otros BCs
    USER_ACHIEVEMENT_REPOSITORY,  // token de repositorio — nunca la implementación concreta
  ],
})
export class AchievementModule {}
```

**Claves del patrón BC module:**
- Importa `SharedModule` y `AuthModule` (no los declara globales)
- Registra sus entidades con `TypeOrmModule.forFeature([...])`
- Usa tokens (`FLASHCARD_REPOSITORY`, `LOGGER_SERVICE`) — nunca clases concretas directamente en `inject`
- Exporta solo lo que otros BCs necesitan — tokens de DI o domain services

---

## `env.validation.ts` completo — schema Joi

```typescript
// src/shared/infrastructure/config/env.validation.ts
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:4001'),
  CORS_ORIGIN: Joi.string().default('http://localhost:4001,http://localhost:5173'),
  USE_STUB_ADAPTERS: Joi.boolean()
    .truthy('true', '1', 1)
    .falsy('false', '0', 0)
    .default(false),

  // Database — una sola URL con todas las credenciales
  DATABASE_URL: Joi.string().required(),
  DATABASE_CA_CERT: Joi.string().optional(),

  // Auth
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),

  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),

  // RabbitMQ — AMQP_URI (no RABBITMQ_URL)
  AMQP_URI: Joi.string().required(),

  // DeepSeek AI
  DEEPSEEK_API_KEY: Joi.string().required(),

  // ElevenLabs
  ELEVEN_LABS_API_KEY: Joi.string().required(),
  ELEVENLABS_VOICE_ID_AMERICAN: Joi.string().required(),
  ELEVENLABS_VOICE_ID_BRITISH: Joi.string().required(),
  ELEVENLABS_VOICE_ID_AUSTRALIAN: Joi.string().required(),

  // Cloudflare R2
  CLOUD_STORAGE: Joi.string().uri().required(),
  CLOUD_STORAGE_PUBLIC_URL: Joi.string().uri().required(),
  CLOUD_STORAGE_ACCESS_KEY_ID: Joi.string().required(),
  CLOUD_STORAGE_SECRET_ACCESS_KEY: Joi.string().required(),
  CLOUD_STORAGE_BUCKET: Joi.string().required(),

  // Observability
  LOKI_URL: Joi.string().uri().optional(),
  LOG_LEVEL: Joi.string()
    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal')
    .default('info'),
});
```

**Diferencias clave respecto a un schema básico:**
- `DATABASE_URL` única en lugar de variables separadas (`DB_HOST`, `DB_PORT`, `DB_USER`, etc.)
- No existe `JWT_REFRESH_SECRET` — el refresh está gestionado de otra manera
- `AMQP_URI` para RabbitMQ (no `RABBITMQ_URL`)
- `USE_STUB_ADAPTERS` — flag para sustituir adaptadores reales por stubs en local/test
- `LOKI_URL` es opcional (observabilidad puede estar desactivada)
