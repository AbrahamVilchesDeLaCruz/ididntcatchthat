# Domain Event Template

Copy this template when creating a new domain event. Replace all `{Placeholders}`.

## File: `{context}/domain/events/{entity}-{past-verb}.event.ts`

```typescript
import { DomainEvent, type DomainEventAttributes } from '@/shared/domain/domain-event';

// 1. Define the attributes type (primitives only — no domain objects)
export type {Entity}{PastVerb}Attributes = {
  id: string;
  // Add primitive fields from the aggregate
};

export class {Entity}{PastVerb}Event extends DomainEvent {
  // 2. Static constant following: {namespace}.{context}.{module?}.{entity}.{past-verb}
  static readonly EVENT_NAME = 'ididntcatchthat.{context}.{entity}.{past-verb}';

  constructor(
    aggregateId: string,
    attributes: {Entity}{PastVerb}Attributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  // 3. Instance method — returns the static constant
  eventName(): string {
    return {Entity}{PastVerb}Event.EVENT_NAME;
  }

  // 4. fromPrimitives — required for deserialization (AMQP consumer)
  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): {Entity}{PastVerb}Event {
    return new {Entity}{PastVerb}Event(
      aggregateId,
      attributes as {Entity}{PastVerb}Attributes,
      eventId,
      occurredOn,
    );
  }
}
```

## Registering in the Aggregate

```typescript
// In {Entity}.{pastVerb}() method or {Entity}.create() factory:
this.record(
  new {Entity}{PastVerb}Event(
    this.id.value,
    {
      id: this.id.value,
      // other primitive fields
    },
  ),
);
```

## Naming Convention

```
Event class:  {Entity}{PastVerb}Event
              FlashcardCreatedEvent
              GameCompletedEvent
              AttemptRecordedEvent

EVENT_NAME:   ididntcatchthat.{context}.{module}.{entity}.{past-verb}  ← module is optional
              ididntcatchthat.content.flashcard.created
              ididntcatchthat.gaming.games.game.completed
              ididntcatchthat.gaming.attempts.attempt.recorded

File:         {entity}-{past-verb}.event.ts
              flashcard-created.event.ts
              game-completed.event.ts
```

## Checklist

- [ ] `static readonly EVENT_NAME` — mayúsculas, en la clase
- [ ] `eventName()` — método de instancia que retorna `EVENT_NAME`
- [ ] Constructor acepta `eventId?` y `occurredOn?` opcionales (para replay)
- [ ] `fromPrimitives()` estático — necesario para el consumer AMQP
- [ ] Atributos son **solo primitivos** — sin Value Objects ni clases de dominio
- [ ] Namespace correcto: `ididntcatchthat.{context}.{module?}.{entity}.{past-verb}`
- [ ] El evento se registra en el aggregate con `this.record()` — nunca fuera
