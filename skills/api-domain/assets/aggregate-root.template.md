# Template — AggregateRoot

Reemplazá `__EntityName__` por el nombre del aggregate (ej: `Flashcard`).

```typescript
import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { __EntityName__Id } from './__entity-name__-id';
import { __EntityName__CreatedEvent } from './events/__entity-name__-created.event';

// ─── Primitives ──────────────────────────────────────────────────────────────
// Todos los campos como tipos primitivos (string, number, boolean, Date, null)
// Se permiten arrays y objetos primitivos anidados para entidades hijas
export type __EntityName__Primitives = {
  id: string;
  // añadir campos aquí
  createdAt: Date;
};

// ─── Aggregate ───────────────────────────────────────────────────────────────
export class __EntityName__ extends AggregateRoot<__EntityName__Primitives> {

  public constructor(
    public readonly id: __EntityName__Id,
    // Estado inmutable → public readonly directamente en constructor
    // Estado mutable → private _campo + getter público
    private readonly _createdAt: Date,
  ) {
    super();
  }

  // ── Getters para estado mutable ───────────────────────────────────────────
  // get campo(): Type { return this._campo; }

  // ── Factory para nuevas entidades — registra domain events ────────────────

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

  // ── Factory para reconstitución desde persistencia — sin domain events ────

  static fromPrimitives(primitives: __EntityName__Primitives): __EntityName__ {
    return new __EntityName__(
      new __EntityName__Id(primitives.id),
      primitives.createdAt,
    );
  }

  // ── toPrimitives ─────────────────────────────────────────────────────────

  toPrimitives(): __EntityName__Primitives {
    return {
      id: this.id.value,
      createdAt: this._createdAt,
    };
  }
}
```

## Decisión: `public` vs `private` en constructor

| Estado | Modificador | Patrón |
| --- | --- | --- |
| Inmutable (no cambia tras creación) | `public readonly campo` | Se expone directamente |
| Mutable (puede cambiar por métodos del aggregate) | `private _campo` + getter | Se controla el acceso |
