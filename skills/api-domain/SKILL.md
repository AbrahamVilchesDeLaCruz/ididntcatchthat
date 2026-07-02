---
name: api-domain
description: "Convenciones de la capa Domain en la API: AggregateRoot, Value Objects, Repository interface y Domain Errors. Trigger: Al crear o modificar aggregates, value objects, interfaces de repositorio o errores de dominio en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## When to Use

- Al crear un nuevo aggregate root
- Al crear o modificar un value object
- Al definir una interface de repositorio
- Al crear un error de dominio

> Usa los templates de `assets/aggregate-root.template.md` y `assets/value-object.template.md`.
> Lee `references/docs.md` para invariants vs. domain errors y referencias DDD.

## Critical Patterns

### Aggregate Root

Extiende `AggregateRoot<Primitives>` — typed con sus primitivos para forzar `fromPrimitives` y `toPrimitives`.

```typescript
// shared/domain/aggregate-root.ts
export abstract class AggregateRoot<Primitives> {
  private domainEvents: DomainEvent[] = [];

  abstract toPrimitives(): Primitives;

  protected record(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
}
```

```typescript
// flashcards/domain/flashcard.ts
type FlashcardPrimitives = {
  id: string;
  front: string;
  back: string;
};

export class Flashcard extends AggregateRoot<FlashcardPrimitives> {
  constructor(
    readonly id: FlashcardId,
    readonly front: string,
    readonly back: string,
  ) {
    super();
  }

  static fromPrimitives(p: FlashcardPrimitives): Flashcard {
    return new Flashcard(new FlashcardId(p.id), p.front, p.back);
  }

  toPrimitives(): FlashcardPrimitives {
    return { id: this.id.value, front: this.front, back: this.back };
  }
}
```

**Reglas:**

- Sin decoradores NestJS ni TypeORM
- Siempre `fromPrimitives()` estático y `toPrimitives()` de instancia
- `Primitives` solo contiene `string`, `number`, `boolean`, `Date`
- Lógica de negocio aquí — nunca en los casos de uso

### Value Objects

Jerarquía: `ValueObject<T>` → `StringValueObject` / `NumberValueObject` → concreto.

```typescript
// shared/domain/value-object.ts
export abstract class ValueObject<T> {
  constructor(readonly value: T) {}

  equals(other: ValueObject<T>): boolean {
    return this.value === other.value;
  }
}

// shared/domain/string-value-object.ts
export abstract class StringValueObject extends ValueObject<string> {}
```

```typescript
// flashcards/domain/flashcard-id.ts
export class FlashcardId extends StringValueObject {
  constructor(value: string) {
    super(value);
    if (!value?.trim()) throw new FlashcardIdEmpty();
  }

  static generate(): FlashcardId {
    return new FlashcardId(crypto.randomUUID());
  }
}
```

**Reglas:**

- Sin sufijo `VO` ni `ValueObject` en nombre de archivo ni clase
- Validación en el constructor — lanza error de dominio si inválido
- `equals()` heredado — no reimplementar

### Repository Interface

Contrato fijo de 4 métodos — sin métodos ad-hoc por feature.

```typescript
// flashcards/domain/flashcard.repository.ts
export interface FlashcardRepository {
  match(criteria: Criteria): Promise<Flashcard[]>;
  search(id: FlashcardId): Promise<Flashcard | null>;
  save(flashcard: Flashcard): Promise<void>;
  remove(id: FlashcardId): Promise<void>;
}
```

| Método            | Semántica                               |
| ----------------- | --------------------------------------- |
| `match(criteria)` | Búsqueda con filtros, orden, paginación |
| `search(id)`      | Por id — retorna `null` si no existe    |
| `save(aggregate)` | Crea o actualiza (upsert)               |
| `remove(id)`      | Elimina por id                          |

### Domain Errors

```typescript
// shared/domain/domain-error.ts
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// flashcards/domain/flashcard-not-found.ts
export class FlashcardNotFound extends DomainError {
  constructor(id: string) {
    super(`Flashcard with id ${id} not found`);
  }
}
```

**Reglas:**

- Nombre: `{Entidad}{Problema}` — sin sufijo `Error` ni `Exception`
- Extienden `DomainError` — nunca `Error` directamente
- Solo describen QUÉ pasó — el controller decide el HTTP status

## Anti-patterns

```typescript
// ❌ Decoradores de framework en domain
@Entity() export class Flashcard {}

// ❌ Sufijo en value object
export class FlashcardIdVO {}

// ❌ Métodos ad-hoc en repositorio
interface FlashcardRepository {
  findByFront(front: string): Promise<Flashcard[]>; // usar match(criteria)
}

// ❌ Lógica de negocio fuera del aggregate
async execute(front: string): Promise<void> {
  if (front.length > 500) throw new Error('too long'); // esto va en el VO o entidad
}
```
