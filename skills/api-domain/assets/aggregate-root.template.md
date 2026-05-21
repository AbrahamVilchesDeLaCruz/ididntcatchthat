# Template — AggregateRoot

Reemplazá `__EntityName__` por el nombre del aggregate (ej: `Flashcard`).

```typescript
import { AggregateRoot } from '@shared/domain/aggregate-root';

// ─── Primitives ──────────────────────────────────────────────────────────────
// Todos los campos como tipos primitivos (string, number, boolean, Date)
type __EntityName__Primitives = {
  id: string;
  // añadir campos aquí
  createdAt: Date;
};

// ─── Aggregate ───────────────────────────────────────────────────────────────
export class __EntityName__ extends AggregateRoot<__EntityName__Primitives> {

  private constructor(
    private readonly _id: __EntityName__Id,
    // añadir Value Objects aquí
    private readonly _createdAt: Date,
  ) {
    super();
  }

  // ── Factory methods ──────────────────────────────────────────────────────────

  static create(params: {
    id: string;
    // añadir params aquí
  }): __EntityName__ {
    const entity = new __EntityName__(
      new __EntityName__Id(params.id),
      new Date(),
    );

    entity.record(new __EntityName__CreatedEvent(params.id, { /* data */ }));
    return entity;
  }

  static fromPrimitives(primitives: __EntityName__Primitives): __EntityName__ {
    return new __EntityName__(
      new __EntityName__Id(primitives.id),
      primitives.createdAt,
    );
  }

  // ── Getters ──────────────────────────────────────────────────────────────────

  get id(): __EntityName__Id { return this._id; }

  // ── toPrimitives ─────────────────────────────────────────────────────────────

  toPrimitives(): __EntityName__Primitives {
    return {
      id: this._id.value,
      createdAt: this._createdAt,
    };
  }
}
```
