# Use Case Spec Patterns — Reference

## Patrón canónico de test de use case

Los use cases se instancian directamente con `new` en `beforeEach` — no se usa DI container en tests.
Los imports de src usan el alias `@/`; los imports de test usan `@test/`.

```typescript
// apps/api/test/flashcards/application/create/flashcard-creator.spec.ts
import { mock } from 'jest-mock-extended';
import { type FlashcardRepository } from '@/flashcards/domain/flashcard.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { FlashcardCreator } from '@/flashcards/application/create/flashcard-creator';
import { FlashcardCreatedEvent } from '@/flashcards/domain/events/flashcard-created.event';
import { FlashcardMother } from '@test/flashcards/domain/flashcard-mother';
import { RequestFlashcardCreatorMother } from './request-flashcard-creator-mother';
import { JestTimers } from '@test/shared/jest-timers';

describe('flashcards/application/create FlashcardCreator', () => {
  const repository = mock<FlashcardRepository>();
  const publisher = mock<DomainEventPublisher>();
  let creator: FlashcardCreator;

  beforeEach(() => {
    JestTimers.setup();
    repository.save.mockReset();
    publisher.publish.mockReset();
    publisher.publish.mockResolvedValue(undefined);

    creator = new FlashcardCreator(repository, publisher);
  });

  afterEach(() => JestTimers.teardown());

  it('should save the flashcard and publish the created event', async () => {
    const request = RequestFlashcardCreatorMother.random();
    const expected = FlashcardMother.from(request);

    await creator.execute(request.front, request.back);

    expect(repository.save).toHaveBeenCalledWith(expected);
    expect(publisher.publish.mock.calls[0][0][0]).toBeInstanceOf(FlashcardCreatedEvent);
  });

  it('should not save nor publish when front is empty', async () => {
    await expect(creator.execute('', 'back')).rejects.toThrow(FlashcardFrontEmpty);

    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
```

## Object Mothers — implementaciones completas

### MotherCreator (raíz)

```typescript
// apps/api/test/shared/domain/mother-creator.ts
import { faker, type Faker } from '@faker-js/faker';

export class MotherCreator {
  static random(): Faker {
    return faker;
  }
}
```

### Primitive Mothers

```typescript
// apps/api/test/shared/domain/string-mother.ts
export class StringMother {
  static random(): string { return MotherCreator.random().lorem.word(); }
  static sentence(): string { return MotherCreator.random().lorem.sentence(); }
  static ofLength(length: number): string {
    return MotherCreator.random().string.alpha({ length });
  }
  static email(): string {
    return MotherCreator.random().internet.email().toLowerCase();
  }
  static alphanumeric(length: number): string {
    return MotherCreator.random().string.alphanumeric({ length });
  }
  static ip(): string {
    return MotherCreator.random().internet.ipv4();
  }
}

// apps/api/test/shared/domain/uuid-mother.ts
export class UuidMother {
  static random(): string { return MotherCreator.random().string.uuid(); }
}
```

> **Nota**: No existe `NumberMother` en el proyecto. Usa `faker.number.int(...)` directamente en los Mothers de dominio cuando se necesite un número, o añade un método específico al Mother del aggregate.

### JestTimers helper

```typescript
// apps/api/test/shared/jest-timers.ts
import { jest } from '@jest/globals';

const FIXED_DATE = new Date('2026-01-01T12:00:00Z');

export class JestTimers {
  static setup(date: Date = FIXED_DATE): void {
    jest.useFakeTimers().setSystemTime(date);
  }

  static teardown(): void {
    jest.useRealTimers();
  }
}
```

Usar solo cuando el aggregate o evento depende de `new Date()`:

```typescript
beforeEach(() => {
  JestTimers.setup();
  // ...
});

afterEach(() => JestTimers.teardown());
```

### Value Object Mother

```typescript
// apps/api/test/flashcards/domain/flashcard-id-mother.ts
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { FlashcardId } from '@/flashcards/domain/flashcard-id';

export class FlashcardIdMother {
  static random(): FlashcardId {
    return new FlashcardId(UuidMother.random());
  }

  static invalid(): string {
    return 'not-a-uuid';
  }
}
```

### Aggregate Mother

```typescript
// apps/api/test/flashcards/domain/flashcard-mother.ts
import { Flashcard } from '@/flashcards/domain/flashcard';
import { FlashcardIdMother } from './flashcard-id-mother';
import { StringMother } from '@test/shared/domain/string-mother';

export class FlashcardMother {
  static create(id: string, front: string, back: string): Flashcard {
    return Flashcard.fromPrimitives({ id, front, back });
  }

  static from(request: RequestFlashcardCreator): Flashcard {
    return this.create(request.id, request.front, request.back);
  }

  static random(overrides?: Partial<{ id: string; front: string; back: string }>): Flashcard {
    return this.create(
      overrides?.id ?? FlashcardIdMother.random().value,
      overrides?.front ?? StringMother.sentence(),
      overrides?.back ?? StringMother.sentence(),
    );
  }
}
```

### Request Mother

```typescript
// apps/api/test/flashcards/application/create/request-flashcard-creator-mother.ts
import { type RequestFlashcardCreator } from '@/flashcards/application/create/flashcard-creator';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { StringMother } from '@test/shared/domain/string-mother';

export class RequestFlashcardCreatorMother {
  static random(overrides?: Partial<RequestFlashcardCreator>): RequestFlashcardCreator {
    return {
      id: overrides?.id ?? UuidMother.random(),
      front: overrides?.front ?? StringMother.sentence(),
      back: overrides?.back ?? StringMother.sentence(),
    };
  }
}
```

## Mocks con jest-mock-extended

```typescript
const repository = mock<FlashcardRepository>();
repository.save.mockResolvedValueOnce(undefined);
expect(repository.save).toHaveBeenCalledWith(expected);

// ❌ En cambio, NO hacer:
const repository = { save: jest.fn(), search: jest.fn() }; // no tipado
```

## Nomenclatura del describe

```typescript
describe('{bc}/application/{verb} {ClassName}', () => {
  describe('when {scenario}', () => {
    it('should {expected behavior}', async () => { ... });
  });
});

// Ejemplo real
describe('gaming/application/complete GameCompleter', () => {
  it('should complete a game and return summary', async () => { ... });
  it('should throw GameNotFound when game does not exist', async () => { ... });
});
```

## E2E tests

Los E2E tests viven en `test/{bc}/infrastructure/` y usan `supertest` con `createTestApp()`.

```typescript
// apps/api/test/gaming/infrastructure/start-game-post.e2e-spec.ts
import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../../shared/infrastructure/create-test-app';

describe('gaming/game StartGamePostController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApp();
    // seed / cleanup de DB si se necesita
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should return 201 with gameId when valid payload is sent', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/games')
      .set('Authorization', `Bearer ${token}`)
      .send({ mode: 'game', cardCount: 10 })
      .expect(201);

    expect(res.body.data.gameId).toBeDefined();
  });
});
```

`createTestApp()` vive en `test/shared/infrastructure/create-test-app.ts` y:
- Levanta el `AppModule` real con `Test.createTestingModule`
- Reemplaza servicios externos (AI, audio) por stubs
- Reemplaza `DomainEventPublisher` por `E2eDomainEventPublisher`
- Aplica `ValidationPipe`, `cookieParser` y el prefijo global `v1`
