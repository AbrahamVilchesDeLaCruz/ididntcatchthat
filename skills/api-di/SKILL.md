---
name: api-di
description: "Tokens Symbol, registro de providers, inyección sin acoplamiento en apps/api/. Trigger: Al definir tokens de inyección, registrar providers en módulos, o inyectar dependencias en use cases o controllers."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---


## When to Use

- Al definir el token de inyección para un repositorio, servicio o cualquier abstracción
- Al registrar providers en un módulo
- Al inyectar dependencias en use cases o controllers

> Usa el template de `assets/di-tokens.template.md` al añadir tokens y módulos a un nuevo BC.
> Lee `references/docs.md` para el rationale de Symbol vs string y docs externos.

---

## Concept

El dominio y la aplicación **no deben saber que NestJS existe**. Para lograrlo, cada interfaz tiene un token de inyección propio que no importa nada de `@nestjs/common`.

```
Interface (domain)       → define el contrato
Token (domain/shared)    → Symbol — el identificador de DI
Implementation (infra)   → clase concreta que implementa la interface
Registration (module)    → NestJS conecta token → implementación
Injection (use case)     → @Inject(TOKEN) — único punto de contacto con NestJS
```

---

## Token Definition

Los tokens son `Symbol` — no strings (colisiones), no clases de NestJS (acoplamiento).

```typescript
// src/flashcards/shared/domain/flashcard.repository.ts
import { Criteria } from '@shared/domain/criteria/criteria';
import { Flashcard } from './flashcard';
import { FlashcardId } from './value-objects/flashcard-id';

export interface FlashcardRepository {
  match(criteria: Criteria): Promise<Flashcard[]>;
  search(id: FlashcardId): Promise<Flashcard | null>;
  save(flashcard: Flashcard): Promise<void>;
  remove(id: FlashcardId): Promise<void>;
}

// El token vive junto a la interface — en domain
export const FLASHCARD_REPOSITORY = Symbol('FlashcardRepository');
```

El patrón se replica para cualquier abstracción:

```typescript
// src/shared/domain/event-bus.ts
export interface EventBus { ... }
export const EVENT_BUS = Symbol('EventBus');

// src/shared/domain/logger.ts
export interface Logger { ... }
export const LOGGER_SERVICE = Symbol('Logger');
```

---

## Registration in Module

```typescript
// src/flashcards/shared/infrastructure/flashcards-shared.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardTypeOrmRepository } from './persistence/flashcard.typeorm-repository';
import { FlashcardTypeOrmEntity } from './persistence/flashcard.typeorm-entity';
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

---

## Injection in Use Case

```typescript
// src/flashcards/application/create-flashcard.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { FlashcardRepository, FLASHCARD_REPOSITORY } from '@flashcards/shared/domain/flashcard.repository';
import { EventBus, EVENT_BUS } from '@shared/domain/event-bus';

@Injectable()
export class CreateFlashcardUseCase {
  constructor(
    @Inject(FLASHCARD_REPOSITORY) private readonly repository: FlashcardRepository,
    @Inject(EVENT_BUS) private readonly eventBus: EventBus,
  ) {}
}
```

**Regla:** El tipo del parámetro es la **interface** — nunca la implementación concreta. `@Inject(TOKEN)` es el único rastro de NestJS en application/domain.

---

## Naming Conventions

| Abstracción | Token | Formato |
|---|---|---|
| Repositorio | `FLASHCARD_REPOSITORY` | `SCREAMING_SNAKE_CASE` sin sufijo |
| EventBus | `EVENT_BUS` | igual |
| Logger | `LOGGER_SERVICE` | igual |
| Config | `CONFIG_SERVICE` | igual |

---

## Rules

- Los tokens son `Symbol` — **siempre**
- El token se define en el mismo archivo que la interface — en la capa de domain o shared/domain
- Los use cases inyectan por **interface** — nunca por clase concreta
- Los módulos son los únicos que conocen las implementaciones concretas (TypeORM, RabbitMQ, etc.)
- Un módulo exporta el **token** — nunca la clase de implementación
