---
name: api-domain-events
description: >
  Convenciones de Domain Events en la API: definición, naming, atributos y registro en aggregates.
  Trigger: Al crear o modificar domain events, o al registrar eventos en un aggregate en apps/api/.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## When to Use

- Al crear un nuevo domain event
- Al registrar un evento en un aggregate con `record()`
- Al definir el `eventName` (key) de un evento

## Critical Patterns

### DomainEvent base class

```typescript
// shared/domain/domain-event.ts
export abstract class DomainEvent {
  private _metadata: EventMetadata = {};

  constructor(
    public readonly aggregateId: string,
    public readonly attributes: DomainEventAttributes,
    public readonly eventId: string = UuidValueObject.random().value,
    public readonly occurredOn: Date = DateTimeValueObject.now().value,
  ) {}

  abstract eventName(): string;

  get metadata(): Readonly<EventMetadata> {
    return this._metadata;
  }

  /**
   * Attach (or merge) operational metadata to the event.
   * Called by the publisher before dispatching, and by the bus when
   * reconstructing the event from persistence.
   */
  withMetadata(metadata: EventMetadata): this {
    this._metadata = { ...this._metadata, ...metadata };
    return this;
  }
  
  decode(): string {
    const data = {
      aggregateId: this.aggregateId,
      attributes: this.attributes,
      metadata: this._metadata,
      eventId: this.eventId,
      occurredOn: this.occurredOn.getTime(),
    };

    return JSON.stringify(data);
  }

  encode(data: string): DomainEventAttributes {
    return JSON.parse(data);
  }
}
```

### Definición de un evento

Nombre: `{Aggregate}{ActionPast}Event` — PascalCase, sufijo `Event`.

```typescript
// flashcards/domain/flashcard-created.event.ts
export class FlashcardCreatedEvent extends DomainEvent {
  readonly eventName = "ididntcatchthat.flashcards.flashcard.created";

  eventName(): string {
    return FlashcardCreatedEvent.eventName;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredAt: Date,
    attributes: Record<string, unknown>,
  ): FlashcardCreatedEvent {
    return new FlashcardCreatedEvent(aggregateId, attributes, eventId, occurredAt);
  }
}
```

### Naming del eventName (key)

Formato: `<project>.<bounded_context>.<module?>.<aggregate>.<action_past>`

```
ididntcatchthat.flashcards.flashcard.created
ididntcatchthat.catalogs.flashcards.flashcard.created   ← con módulo intermedio
ididntcatchthat.flashcards.flashcard.reviewed
ididntcatchthat.flashcards.flashcard.removed
```

**Reglas:**

- Todo en `snake_case` — sin mayúsculas, sin guiones
- El bounded context es el nombre de la carpeta de feature
- El módulo es opcional — solo cuando hay agrupación explícita dentro del bounded context
- La acción en participio pasado en inglés: `created`, `updated`, `removed`, `reviewed`

### Registro en el aggregate

```typescript
// flashcards/domain/flashcard.ts
markAsCreated(): void {
  this.record(
    new FlashcardCreatedEvent(this.id.value, this.toPrimitives()),
  );
}
```

Los `attributes()` corresponden a los campos relevantes del aggregate — por lo general equivalen a `toPrimitives()` o un subconjunto.

### Ubicación de archivos

```
flashcards/domain/
├── flashcard.ts
├── flashcard-created.event.ts
├── flashcard-reviewed.event.ts
└── flashcard-removed.event.ts
```

## Anti-patterns

```typescript
// ❌ Sin sufijo Event
export class FlashcardCreated extends DomainEvent {}

// ❌ eventName con camelCase
readonly eventName = 'ididntcatchthat.flashCards.flashcard.created';

// ❌ attributes() retorna la entidad completa
attributes() { return this; }

// ❌ Disparar eventos fuera del aggregate
this.record(new FlashcardCreatedEvent(...)); // en use case — va dentro del aggregate
```

## Pendiente

- Subscribers y dispatching — se define cuando se plantee RabbitMQ / bus de eventos
