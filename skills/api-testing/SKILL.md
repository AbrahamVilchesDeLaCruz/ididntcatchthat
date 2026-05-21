---
name: api-testing
description: >
  Convenciones de testing en la API: pirámide de tests, Object Mother, estructura de /test, mocks con jest-mock-extended.
  Trigger: Al crear o modificar tests en apps/api/, al crear Object Mothers, o al mockear puertos.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## When to Use

- Al crear un test de use case o domain service
- Al crear un Object Mother para aggregate, value object o request
- Al mockear un repositorio, publisher u otro puerto
- Al estructurar la carpeta `/test`

## Critical Patterns

### Pirámide de tests

```
         /\
        /  \   E2E (pocos, lentos)
       /────\
      /      \  Integration — Application con mocks de puerto
     /────────\
    /          \  Unit — Domain (muchos, rápidos)
   /────────────\
```

- **Unit**: aggregates, value objects, domain services — rápidos, sin I/O
- **Integration**: use cases con puertos mockeados — nunca adaptadores concretos
- **E2E**: flujos HTTP completos — pocos, solo los caminos críticos

### Estructura de /test

Replica exactamente la estructura de `/src`. Si el contexto tiene módulo intermedio, el test también.

```
api/src/contexts/flashcards/
├── application/create/flashcard-creator.ts
└── domain/flashcard.ts

api/test/contexts/flashcards/
├── application/create/
│   ├── flashcard-creator.spec.ts
│   └── request-flashcard-creator-mother.ts
└── domain/
    ├── flashcard-mother.ts
    ├── flashcard-id-mother.ts
    └── audio-url-mother.ts
```

Mothers compartidos para primitivas reutilizables:

```
api/test/contexts/shared/domain/
├── string-mother.ts
├── date-mother.ts
├── uuid-mother.ts
└── boolean-mother.ts
```

### Object Mother

Cada aggregate/value object tiene su Mother. Tres métodos canónicos:

```typescript
// test/contexts/flashcards/domain/flashcard-mother.ts
import { Flashcard } from "src/contexts/flashcards/domain/flashcard";
import { FlashcardIdMother } from "./flashcard-id-mother";
import { StringMother } from "../../shared/domain/string-mother";

export class FlashcardMother {
  static create(id: string, front: string, back: string): Flashcard {
    return Flashcard.fromPrimitives({ id, front, back });
  }

  static from(request: RequestFlashcardCreator): Flashcard {
    return this.create(request.id, request.front, request.back);
  }

  static random(
    overrides?: Partial<{
      id: string;
      front: string;
      back: string;
    }>,
  ): Flashcard {
    return this.create(
      overrides?.id ?? FlashcardIdMother.random().value,
      overrides?.front ?? StringMother.sentence(),
      overrides?.back ?? StringMother.sentence(),
    );
  }
}
```

**Reglas:**

- Cada Mother en su propio archivo — nunca inline en el spec
- `random(overrides?)` para el caso base — siempre acepta overrides parciales
- `from(request)` cuando el use case recibe un objeto de request
- `create(...)` con parámetros explícitos para casos con valores concretos
- Value Object Mothers exponen `invalid()` cuando el test lo necesita
- Reutilizar Mothers de `shared/domain/` antes de usar Faker directo

### Test de use case — patrón canónico

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

### Mocks con jest-mock-extended

| Puerto                  | Estrategia                     |
| ----------------------- | ------------------------------ |
| Repository              | `mock<FlashcardRepository>()`  |
| DomainEventPublisher    | `mock<DomainEventPublisher>()` |
| Domain services / ports | `mock<PortOrService>()`        |

```typescript
// ✅ mock tipado
const repository = mock<FlashcardRepository>();
repository.save.mockResolvedValueOnce(undefined);
expect(repository.save).toHaveBeenCalledWith(expected);

// ❌ jest.fn() suelto para puertos tipados
const repository = { save: jest.fn() };
```

**Reglas:**

- `container.reset()` siempre primero en `beforeEach`
- Resetear solo los métodos que el test usa
- Congelar el reloj con `jest.useFakeTimers()` si el aggregate o evento dependen de `new Date()`
- Verificar payload del evento, metadata del publisher y DTO de respuesta cuando aplique
- En flujos fallidos: afirmar explícitamente que `save()` y `publish()` no fueron llamados
- Un comportamiento por test — múltiples `expect` si prueban el mismo comportamiento observable

### Nomenclatura del describe

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

## Anti-patterns

```typescript
// ❌ Instanciar adaptador concreto en test de dominio o aplicación
const repository = new TypeOrmFlashcardRepository(dataSource);

// ❌ Estado compartido entre tests
let sharedFlashcard: Flashcard; // fuera de beforeEach

// ❌ Strings mágicos cuando existe un Mother
const flashcard = Flashcard.fromPrimitives({ id: "123", front: "test", back: "test" });
// ✅
const flashcard = FlashcardMother.random();

// ❌ Mother inline en el spec
const mother = { id: uuid(), front: faker.lorem.word() }; // va en su archivo

// ❌ jest.fn() para puertos tipados
const repository = { save: jest.fn(), search: jest.fn() };
```
