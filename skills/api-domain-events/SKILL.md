---
name: api-domain-events
description: "Convenciones de Domain Events en la API: definición, naming, atributos y registro en aggregates. Trigger: Al crear o modificar domain events, o al registrar eventos en un aggregate en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## When to Use

- Al crear un nuevo domain event
- Al registrar un evento en un aggregate con `record()`
- Al definir el `EVENT_NAME` (key) de un evento
- Al implementar `fromPrimitives()` en un event para reconstrucción desde el bus

> Usa el template de `assets/domain-event.template.md` al crear un nuevo domain event.
> Lee `references/docs.md` para naming conventions, ADRs y skills relacionadas.

## Critical Patterns

### DomainEvent base class

```typescript
// shared/domain/domain-event.ts
export abstract class DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly attributes: DomainEventAttributes,
    public readonly eventId: string = crypto.randomUUID(),
    public readonly occurredOn: Date = new Date(),
  ) {}

  abstract eventName(): string;
}
```

### Definición de un evento — patrón canónico

Nombre: `{Aggregate}{ActionPast}Event` — PascalCase, sufijo `Event`.

```typescript
// content/flashcard/domain/events/flashcard-created.event.ts
import { DomainEvent, type DomainEventAttributes } from '@/shared/domain/domain-event';
import { type FlashcardPrimitives } from '../flashcard';

export class FlashcardCreatedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.content.flashcard.created';

  constructor(
    aggregateId: string,
    attributes: FlashcardPrimitives,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return FlashcardCreatedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): FlashcardCreatedEvent {
    return new FlashcardCreatedEvent(
      aggregateId,
      attributes as FlashcardPrimitives,
      eventId,
      occurredOn,
    );
  }
}
```

**Reglas:**

- `EVENT_NAME` es `static readonly` — nunca un campo de instancia
- `eventName()` es un método de instancia que devuelve la constante estática
- `attributes` tipado con el tipo específico del aggregate (ej: `FlashcardPrimitives`)
- `fromPrimitives()` es estático — firma fija: `(aggregateId, eventId, occurredOn, attributes)`
- `eventId` y `occurredOn` son opcionales en el constructor — el base class asigna defaults

### Naming del EVENT_NAME

Formato: `<project>.<bounded_context>.<module?>.<aggregate>.<action_past>`

```
ididntcatchthat.content.flashcard.created
ididntcatchthat.gaming.attempts.attempt.recorded
ididntcatchthat.gaming.game.completed
ididntcatchthat.achievement.catalog.achievement.unlocked   ← con módulo intermedio
```

**Reglas:**

- Todo en `snake_case` — sin mayúsculas, sin guiones
- El bounded context es el nombre de la carpeta raíz del BC
- El módulo es opcional — solo cuando hay submódulo explícito dentro del BC
- La acción en participio pasado en inglés: `created`, `updated`, `removed`, `recorded`, `completed`

### Registro en el aggregate

```typescript
// gaming/domain/game.ts
recordAttempt(flashcardId: string, correct: boolean, flashcardModule: string | null): Attempt {
  if (!this._status.isInProgress()) {
    throw new GameNotInProgress(this.id.value);
  }

  const attempt = Attempt.create(this.id.value, flashcardId, correct);
  this._attempts.push(attempt);

  this.record(
    new AttemptRecordedEvent(this.id.value, {
      gameId: this.id.value,
      userId: this.userId,
      flashcardId,
      flashcardModule,
      correct,
      mode: this.mode.value,
      answeredAt: attempt.answeredAt.toISOString(),
    }),
  );

  return attempt;
}
```

Los `attributes` contienen los campos relevantes del aggregate para el evento — habitualmente un subconjunto de `toPrimitives()` o los valores necesarios para los subscribers.

### Attributes tipado explícito

Cuando el evento tiene atributos específicos, extender `DomainEventAttributes`:

```typescript
// gaming/domain/events/attempt-recorded.event.ts
export interface AttemptRecordedAttributes extends DomainEventAttributes {
  gameId: string;
  userId: string | null;
  flashcardId: string;
  flashcardModule: string | null;
  correct: boolean;
  mode: string;
  answeredAt: string;
}

export class AttemptRecordedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.gaming.attempts.attempt.recorded';

  constructor(
    aggregateId: string,
    readonly attrs: AttemptRecordedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attrs, eventId, occurredOn);
  }

  eventName(): string {
    return AttemptRecordedEvent.EVENT_NAME;
  }
}
```

### Ubicación de archivos

```
{bc}/{module}/domain/
├── game.ts
└── events/
    ├── attempt-recorded.event.ts
    ├── game-completed.event.ts
    ├── game-paused.event.ts
    └── game-abandoned.event.ts
```

## Anti-patterns

```typescript
// ❌ eventName como propiedad de instancia — colisiona con el método abstracto
export class FlashcardCreatedEvent extends DomainEvent {
  readonly eventName = 'ididntcatchthat.content.flashcard.created'; // COMPILE ERROR
  eventName(): string { ... }                                        // DUPLICATE IDENTIFIER
}

// ✅ Correcto — static + método de instancia
export class FlashcardCreatedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.content.flashcard.created';
  eventName(): string { return FlashcardCreatedEvent.EVENT_NAME; }
}

// ❌ Sin sufijo Event
export class FlashcardCreated extends DomainEvent {}

// ❌ eventName con camelCase o guiones
static readonly EVENT_NAME = 'ididntcatchthat.contentFlashcard.created';

// ❌ Disparar eventos fuera del aggregate
// en use case:
this.record(new FlashcardCreatedEvent(...)); // va dentro del aggregate method

// ❌ fromPrimitives con parámetros en orden distinto
static fromPrimitives(attributes, aggregateId, ...): XxxEvent {} // orden fijo: aggregateId, eventId, occurredOn, attributes
```
