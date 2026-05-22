---
name: api-validation
description: >
  ValidationPipe global, Payload/Query con class-validator en apps/api/.
  Trigger: Al configurar ValidationPipe en main.ts, crear Payload o Query DTOs con class-validator, o guards globales.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

# Skill: api-validation

## When to Use

- Al configurar el `ValidationPipe` global en `main.ts`
- Al crear un `Payload` (body) o `Query` (query params) con `class-validator`
- Al definir guards globales y filtros globales en bootstrap

---

## Bootstrap — main.ts

```typescript
// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@shared/infrastructure/http/filters/http-exception.filter';
import { ExceptionStatusRegistry } from '@shared/infrastructure/http/filters/exception-status.registry';
import { JwtAuthGuard } from '@shared/infrastructure/auth/guards/jwt-auth.guard';
import { LOGGER_SERVICE } from '@shared/domain/logger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // elimina propiedades no decoradas
      transform: false,             // NO transformar tipos — los primitivos llegan como string y se convierten en domain
      forbidNonWhitelisted: true,   // lanza error si llegan propiedades extra
    }),
  );

  const reflector = app.get(Reflector);
  const logger = app.get(LOGGER_SERVICE);

  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalFilters(
    new HttpExceptionFilter(new ExceptionStatusRegistry(), logger),
  );

  const port = app.get(ConfigService).get<number>('PORT') ?? 3000;
  await app.listen(port);
}

bootstrap();
```

**Por qué `transform: false`:**
El payload llega como string desde HTTP. La conversión de tipos ocurre en el constructor del Value Object en domain — no en el transporte. Si NestJS transforma, el dominio pierde control sobre la validación.

---

## Payload — Request Body

```typescript
// src/flashcards/infrastructure/controllers/create-flashcard/create-flashcard-post.payload.ts
import { ApiProperty } from '@nestjs/swagger';
import { UuidValueObject } from '@shared/domain/value-objects/uuid.value-object';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateFlashcardPostPayload {
  @ApiProperty({
    description: 'Optional client-provided UUID. If omitted, backend generates one.',
    example: UuidValueObject.random().value,
  })
  @ValidateIf((o) => o.id !== undefined)  // solo valida si el campo viene
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id?: string;

  @ApiProperty({
    description: 'The English phrase to learn',
    example: "I didn't catch that",
  })
  @IsString()
  @IsNotEmpty()
  phrase: string;

  @ApiProperty({
    description: 'Spanish translation',
    example: 'No entendí eso',
  })
  @IsString()
  @IsNotEmpty()
  translation: string;
}
```

### Reglas de Payload

- Nombre: `{Action}{Entity}{Method}Payload` → `CreateFlashcardPostPayload`
- Todos los campos son **strings o números primitivos** — sin Value Objects
- `@ValidateIf((o) => o.field !== undefined)` para campos opcionales — nunca `@IsOptional()` solo
- `@ApiProperty` en todos los campos — documentación Swagger obligatoria con `example`
- `example` usando el Value Object (`UuidValueObject.random().value`) — no strings hardcodeados

---

## Query — Query Params

```typescript
// src/flashcards/infrastructure/controllers/search-flashcards/search-flashcards-get.query.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchFlashcardsGetQuery {
  @ApiPropertyOptional({ example: 'catch', description: 'Filter by phrase content' })
  @IsOptional()
  @IsString()
  phrase?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)   // EXCEPCIÓN: query params siempre llegan como string — transformar aquí
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
```

**`@Type(() => Number)` en Query únicamente** — los query params de HTTP siempre son strings. Esta es la única excepción donde se transforma en el payload, porque no hay Value Object de por medio.

---

## Guard Global — JwtAuthGuard

El guard JWT es global. Los endpoints públicos se marcan con el decorator `@Public()`:

```typescript
// src/shared/infrastructure/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

```typescript
// src/shared/infrastructure/auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

Uso en controller:

```typescript
@Public()
@Post('guest')
async guestLogin(): Promise<void> { ... }
```

---

## Rules

- `whitelist: true` + `forbidNonWhitelisted: true` — **siempre** — rechaza campos extra
- `transform: false` — **siempre** — la transformación de tipos ocurre en domain
- **Excepción:** `@Type(() => Number)` en Query params para `page`, `limit` y similares — son strings en HTTP inevitablemente
- `@ValidateIf` para campos opcionales con validaciones adicionales — nunca `@IsOptional()` sin condición
- `@ApiProperty` en todos los campos de Payload y Query — Swagger es obligatorio
