# Use Case Spec Patterns — Reference

## Patrón canónico de test de use case

```typescript
// test/contexts/flashcards/application/create/flashcard-creator.spec.ts
import { mock } from "jest-mock-extended";

const FIXED_DATE = new Date("2026-01-01T12:00:00Z");

describe("flashcards/application/create FlashcardCreator", () => {
  const repository = mock<FlashcardRepository>();
  const publisher = mock<DomainEventPublisher>();
  let creator: FlashcardCreator;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(FIXED_DATE);

    container.reset();
    repository.save.mockReset();
    publisher.publish.mockReset();

    container.registerInstance<FlashcardRepository>(FLASHCARD_REPOSITORY, repository);
    container.registerInstance<DomainEventPublisher>(DOMAIN_EVENT_PUBLISHER, publisher);

    creator = container.resolve(FlashcardCreator);
  });

  afterEach(() => jest.useRealTimers());

  it("should save the flashcard and publish the created event", async () => {
    const request = RequestFlashcardCreatorMother.random();
    const expected = FlashcardMother.from(request);

    await creator.execute(request.front, request.back);

    expect(repository.save).toHaveBeenCalledWith(expected);
    expect(publisher.publish.mock.calls[0][0][0]).toBeInstanceOf(FlashcardCreatedEvent);
  });

  it("should not save nor publish when front is empty", async () => {
    await expect(creator.execute("", "back")).rejects.toThrow(FlashcardFrontEmpty);

    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
```

## Object Mothers — implementaciones completas

### MotherCreator (raíz)

```typescript
// test/contexts/shared/domain/mother-creator.ts
import { faker, type Faker } from '@faker-js/faker';

export class MotherCreator {
  static random(): Faker {
    return faker;
  }
}
```

### Primitive Mothers

```typescript
// test/contexts/shared/domain/string-mother.ts
export class StringMother {
  static random(): string { return MotherCreator.random().lorem.word(); }
  static sentence(): string { return MotherCreator.random().lorem.sentence(); }
  static ofLength(length: number): string {
    return MotherCreator.random().string.alpha({ length });
  }
}

// test/contexts/shared/domain/uuid-mother.ts
export class UuidMother {
  static random(): string { return MotherCreator.random().string.uuid(); }
}

// test/contexts/shared/domain/number-mother.ts
export class NumberMother {
  static between(min: number, max: number): number {
    return MotherCreator.random().number.int({ min, max });
  }
}
```

### Value Object Mother

```typescript
// test/contexts/flashcards/domain/flashcard-id-mother.ts
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
// test/contexts/flashcards/domain/flashcard-mother.ts
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
// test/contexts/flashcards/application/create/request-flashcard-creator-mother.ts
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
describe('{context}/application/{verb} {ClassName}', () => {
  describe('when {scenario}', () => {
    it('should {expected behavior}', async () => { ... });
  });
});

// Ejemplo
describe('flashcards/application/create FlashcardCreator', () => {
  describe('when front is empty', () => {
    it('should throw FlashcardFrontEmpty', async () => { ... });
  });
});
```
