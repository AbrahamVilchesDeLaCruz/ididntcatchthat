---
name: api-testing
description: "Convenciones de testing en la API: pirámide de tests, Object Mother, estructura de /test, mocks con jest-mock-extended. Trigger: Al crear o modificar tests en apps/api/, al crear Object Mothers, o al mockear puertos."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## When to Use

- Al crear un test de use case o domain service
- Al crear un Object Mother para aggregate, value object o request
- Al mockear un repositorio, publisher u otro puerto
- Al estructurar la carpeta `/test`

> Lee `references/docs.md` para skills relacionadas, ADRs y documentación externa.

> Lee `references/use-case-spec.md` para el patrón canónico completo del test de use case, implementaciones completas de Mothers, mocks y nomenclatura de describe.
> La plantilla genérica de Object Mother está en `assets/object-mother.template.md`.

---

## Pirámide de tests

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
- **E2E**: flujos HTTP completos — solo los caminos críticos

---

## Estructura de `/test`

Replica exactamente la estructura de `/src`:

```
apps/api/src/flashcards/
├── application/create/flashcard-creator.ts
└── domain/flashcard.ts

apps/api/test/flashcards/
├── application/create/
│   ├── flashcard-creator.spec.ts
│   └── request-flashcard-creator-mother.ts
└── domain/
    ├── flashcard-mother.ts
    ├── flashcard-id-mother.ts
    └── audio-url-mother.ts
```

Mothers de primitivos compartidos:

```
apps/api/test/shared/domain/
├── mother-creator.ts    ← faker vive aquí — único punto de cambio
├── string-mother.ts
├── uuid-mother.ts
├── date-mother.ts
└── boolean-mother.ts
```

Helper de timers compartido:

```
apps/api/test/shared/jest-timers.ts   ← JestTimers.setup() / teardown()
```

---

## Jerarquía de Mothers

```
MotherCreator          ← faker — único punto de cambio de librería
      ↓
StringMother / UuidMother / NumberMother
      ↓
FlashcardIdMother      ← Mother del VO, usa UuidMother
      ↓
FlashcardMother        ← compone los Mothers de sus VOs
      ↓
RequestFlashcardCreatorMother  ← Mother del Request* del use case
```

**Regla**: faker solo vive en `MotherCreator`. Nunca importar faker directamente en un Mother de dominio.

---

## Mocks

| Puerto | Estrategia |
|---|---|
| Repository | `mock<FlashcardRepository>()` |
| DomainEventPublisher | `mock<DomainEventPublisher>()` |
| Domain services / ports | `mock<PortOrService>()` |

---

## Reglas

- Los use cases se instancian directamente con `new UseCase(dep1, dep2, ...)` en `beforeEach` — no se usa DI container
- Resetear solo los métodos que el test usa (`.mockReset()`)
- Usar `JestTimers.setup()` / `JestTimers.teardown()` (de `@test/shared/jest-timers`) cuando el aggregate o evento dependen de `new Date()`
- Cada Mother en su propio archivo — nunca inline en el spec
- `random(overrides?)` siempre acepta overrides parciales
- `from(request)` cuando el use case recibe un objeto de request
- Value Object Mothers exponen `invalid()` cuando el test lo necesita
- Un comportamiento por test
- Imports de src usan el alias `@/`; imports de test usan `@test/`

---

## Anti-patterns

```typescript
// ❌ Adaptador concreto en test de aplicación
const repository = new TypeOrmFlashcardRepository(dataSource);

// ❌ Estado compartido entre tests
let sharedFlashcard: Flashcard; // fuera de beforeEach

// ❌ String mágico cuando existe un Mother
const flashcard = Flashcard.fromPrimitives({ id: "123", front: "test", back: "test" });

// ❌ Mother inline en el spec
const mother = { id: uuid(), front: faker.lorem.word() };

// ❌ jest.fn() para puertos tipados
const repository = { save: jest.fn(), search: jest.fn() };
```
