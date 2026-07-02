# Module Patterns — Reference

## `SharedModule` global completo

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
        abortEarly: false, // muestra TODOS los errores, no solo el primero
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
        synchronize: false,   // NUNCA true en producción
        migrationsRun: false,
      }),
    }),
  ],
  exports: [ConfigModule, TypeOrmModule],
})
export class SharedModule {}
```

## Bounded Context Shared Module completo

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
  exports: [FLASHCARD_REPOSITORY], // solo el token — nunca la implementación concreta
})
export class FlashcardsSharedModule {}
```

## `env.validation.ts` completo — schema Joi

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
