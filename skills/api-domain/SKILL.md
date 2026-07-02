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
// content/flashcard/domain/flashcard.ts
export type FlashcardPrimitives = {
  id: string;
  expression: string;
  meaning: string;
  category: string;
  audioStatus: string;
  createdBy: string;
};

export class Flashcard extends AggregateRoot<FlashcardPrimitives> {
  public constructor(
    public readonly id: FlashcardId,
    private _expression: Expression,
    private _meaning: Meaning,
    private _category: Category,
    private _audioStatus: AudioStatus,
    public readonly createdBy: string,
  ) {
    super();
  }

  get expression(): Expression { return this._expression; }
  get meaning(): Meaning { return this._meaning; }
  get category(): Category { return this._category; }
  get audioStatus(): AudioStatus { return this._audioStatus; }

  // Factory para nuevas entidades — registra el domain event de creación
  static create(id: string, expression: string, meaning: string, category: string, createdBy: string): Flashcard {
    const flashcard = new Flashcard(
      new FlashcardId(id),
      new Expression(expression),
      new Meaning(meaning),
      new Category(category),
      new AudioStatus(AudioStatusValue.Pending),
      createdBy,
    );
    flashcard.record(new FlashcardCreatedEvent(flashcard.id.value, flashcard.toPrimitives()));
    return flashcard;
  }

  // Factory para reconstitución desde persistencia — sin domain events
  static fromPrimitives(p: FlashcardPrimitives): Flashcard {
    return new Flashcard(
      new FlashcardId(p.id),
      new Expression(p.expression),
      new Meaning(p.meaning),
      new Category(p.category),
      new AudioStatus(p.audioStatus),
      p.createdBy,
    );
  }

  toPrimitives(): FlashcardPrimitives {
    return {
      id: this.id.value,
      expression: this.expression.value,
      meaning: this.meaning.value,
      category: this.category.value,
      audioStatus: this.audioStatus.value,
      createdBy: this.createdBy,
    };
  }
}
```

**Reglas:**

- Sin decoradores NestJS ni TypeORM
- Dos factories estáticas: `create()` para entidades nuevas (registra eventos), `fromPrimitives()` para reconstitución desde persistencia (sin eventos)
- `Primitives` contiene tipos escalares: `string`, `number`, `boolean`, `Date`, `null` — se permiten arrays y objetos primitivos anidados para entidades hijas
- Estado mutable (campos que cambian tras la creación) → `private _campo` con getter público
- Estado inmutable (no cambia tras la creación) → `public readonly campo` directamente en el constructor
- Lógica de negocio aquí — nunca en los casos de uso

### Value Objects

Jerarquía para IDs: `ValueObject<string>` → `StringValueObject` → `UuidValueObject` → `XxxId`.
Jerarquía para campos de texto: `ValueObject<string>` → `StringValueObject` → concreto.

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

// shared/domain/uuid-value-object.ts — capa intermedia para IDs UUID
export abstract class UuidValueObject extends StringValueObject {
  protected static readonly UUID_REGEX = /^[0-9a-f]{8}-...-4...-[89ab]...-...$/i;

  static isValid(value: string): boolean { return UuidValueObject.UUID_REGEX.test(value); }
  static random(): string { return randomUUID(); }
}
```

```typescript
// shared/domain/flashcard-id.ts  ← los IDs globales van en shared/domain/
import { UuidValueObject } from '@/shared/domain/uuid-value-object';
import { FlashcardIdInvalid } from '@/shared/domain/exceptions/flashcard-id-invalid';

export class FlashcardId extends UuidValueObject {
  constructor(value: string) {
    if (!UuidValueObject.isValid(value)) throw new FlashcardIdInvalid(value);
    super(value);
  }

  static generate(): FlashcardId {
    return new FlashcardId(UuidValueObject.random());
  }
}
```

```typescript
// content/flashcard/domain/expression.ts  ← VOs propios del BC en su domain/
import { StringValueObject } from '@/shared/domain/string-value-object';

export class Expression extends StringValueObject {
  private static readonly MAX_LENGTH = 200;

  constructor(value: string) {
    super(value);
    if (!value?.trim()) throw new ExpressionEmpty();
    if (value.length > Expression.MAX_LENGTH) throw new ExpressionTooLong();
  }
}
```

**Reglas:**

- Sin sufijo `VO` ni `ValueObject` en nombre de archivo ni clase
- IDs de aggregates extienden `UuidValueObject` (no `StringValueObject` directamente) — validación UUID antes del `super()`
- IDs compartidos entre BCs van en `shared/domain/`; VOs propios del BC van en su `domain/`
- Validación en el constructor — lanza `DomainException` si inválido
- `equals()` heredado — no reimplementar

### Repository Interface

El contrato base incluye `match`, `search`, `save`, `remove`. Cada aggregate puede añadir métodos adicionales según sus necesidades (p. ej. `count`, `saveAll`). Se exporta también el Symbol de DI junto a la interface.

```typescript
// content/flashcard/domain/flashcard.repository.ts
import { type Criteria } from '@/shared/domain/criteria';
import { type Flashcard } from './flashcard';
import { type FlashcardId } from '@/shared/domain/flashcard-id';

export interface FlashcardRepository {
  match(criteria: Criteria): Promise<Flashcard[]>;
  count(criteria: Criteria): Promise<number>;
  search(id: FlashcardId): Promise<Flashcard | null>;
  save(flashcard: Flashcard): Promise<void>;
  saveAll(flashcards: Flashcard[]): Promise<void>;
  remove(id: FlashcardId): Promise<void>;
}

export const FLASHCARD_REPOSITORY = Symbol('FlashcardRepository');
```

| Método            | Semántica                               |
| ----------------- | --------------------------------------- |
| `match(criteria)` | Búsqueda con filtros, orden, paginación |
| `count(criteria)` | Cuenta sin traer entidades              |
| `search(id)`      | Por id — retorna `null` si no existe    |
| `save(aggregate)` | Crea o actualiza (upsert)               |
| `saveAll(list)`   | Upsert en lote (cuando aplique)         |
| `remove(id)`      | Elimina por id                          |

### Domain Errors

La clase base es `DomainException`, ubicada en `shared/domain/exceptions/domain-exception.ts`.
Las excepciones de cada BC van en su `domain/exceptions/` subfolder.

```typescript
// shared/domain/exceptions/domain-exception.ts
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// content/flashcard/domain/exceptions/flashcard-not-found.ts
import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class FlashcardNotFound extends DomainException {
  constructor() {
    super(`Flashcard not found`);
  }
}
```

**Reglas:**

- Nombre: `{Entidad}{Problema}` — sin sufijo `Error` ni `Exception`
- Extienden `DomainException` — nunca `Error` directamente
- Ubicación: `{bc}/domain/exceptions/` (subfolder, no en la raíz de `domain/`)
- Solo describen QUÉ pasó — el controller decide el HTTP status

## Anti-patterns

```typescript
// ❌ Decoradores de framework en domain
@Entity() export class Flashcard {}

// ❌ Sufijo en value object
export class FlashcardIdVO {}

// ❌ ID que extiende StringValueObject en lugar de UuidValueObject
export class FlashcardId extends StringValueObject { /* mal */ }

// ❌ Validación de UUID como empty-check en lugar de formato
export class FlashcardId extends UuidValueObject {
  constructor(value: string) {
    super(value);
    if (!value?.trim()) throw new FlashcardIdEmpty(); // mal — no valida UUID
  }
}

// ❌ DomainError en lugar de DomainException
export class FlashcardNotFound extends DomainError {} // DomainError no existe

// ❌ Métodos ad-hoc en repositorio que pueden resolverse con criteria
interface FlashcardRepository {
  findByExpression(expr: string): Promise<Flashcard[]>; // usar match(criteria)
}

// ❌ Lógica de negocio fuera del aggregate
async execute(expression: string): Promise<void> {
  if (expression.length > 200) throw new Error('too long'); // esto va en el VO
}

// ❌ fromPrimitives para crear entidades nuevas (sin eventos)
const flashcard = Flashcard.fromPrimitives({ id, expression, ... }); // usar create()
```
