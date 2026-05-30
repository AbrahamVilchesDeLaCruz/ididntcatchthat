---
name: api-events
description: >
  EventBus interface, DomainEventConsumer, Subscriber abstract en apps/api/.
  Trigger: Al definir el EventBus, crear un Subscriber concreto en application, o entender el flujo de domain events.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

# Skill: api-events

## When to Use

- Al definir el `EventBus` interface o `DomainEventConsumer` interface
- Al crear un `Subscriber` concreto en application
- Al entender el flujo de eventos y la regla de dependencia

---

## Concepts

```
DomainEvent           ← lo que pasó (flashcard.created)
EventBus              ← interface domain — publica eventos
DomainEventConsumer   ← interface application — consume eventos
Subscriber            ← abstract application — puro, sin NestJS
AmqpMessageBus        ← infrastructure — implementa ambas interfaces
SubscribersBootstrapper ← infrastructure — OnModuleInit, arranca subscribers
```

Regla de dependencia:

```
Domain         → DomainEvent, EventBus interface
Application    → Subscriber (abstract), DomainEventConsumer interface
Infrastructure → AmqpMessageBus, SubscribersBootstrapper, módulos NestJS
```

Flujo completo:

```
UseCase
  → eventBus.publish(aggregate.pullDomainEvents())
    → AmqpMessageBus.publish() → RabbitMQ exchange
      → cola del subscriber
        → SubscribersBootstrapper.onModuleInit() → subscriber.init()
          → AmqpMessageBus.consume() → setupQueues() automático
            → subscriber.on(event) → UseCase correspondiente
```

---

## Domain — EventBus interface

```typescript
// src/shared/domain/event-bus.ts
import { DomainEvent } from './domain-event';

export interface EventBus {
  publish(events: DomainEvent[]): Promise<void>;
}

export const EVENT_BUS = Symbol('EventBus');
```

---

## Application — DomainEventConsumer interface

```typescript
// src/shared/application/domain-event-consumer.ts
import { DomainEvent } from '@shared/domain/domain-event';

export interface DomainEventConsumer {
  consume(
    queueName: string,
    eventName: string,
    exchangeName: string,
    domainEvent: new (...args: never) => DomainEvent,
    on: (event: DomainEvent) => Promise<void>,
  ): Promise<void>;
}

export const DOMAIN_EVENT_CONSUMER = Symbol('DomainEventConsumer');
```

---

## Application — Subscriber abstract

**Cero imports de NestJS** — clase pura de application:

```typescript
// src/shared/application/subscriber.ts
import { type DomainEvent } from '@/shared/domain/domain-event';
import { type DomainEventConsumer } from './domain-event-consumer';

type DomainEventClass = new (...args: never) => DomainEvent;

export abstract class Subscriber {
  abstract get queueName(): string;
  abstract get eventName(): string;
  abstract get exchangeName(): string;
  abstract get domainEvent(): DomainEventClass;

  abstract on(event: DomainEvent): Promise<void>;

  constructor(protected readonly consumer: DomainEventConsumer) {}

  async init(): Promise<void> {
    await this.consumer.consume(
      this.queueName,
      this.eventName,
      this.exchangeName,
      this.domainEvent,
      this.on.bind(this),
    );
  }
}
```

> **¿Por qué `never` en `DomainEventClass`?**
> En TypeScript los parámetros de funciones/constructores son **contravariantes**.
> `unknown[]` haría fallar a cualquier subclase con parámetros tipados.
> `never` en posición de parámetro es el supertipo correcto — acepta cualquier
> firma de constructor sin necesitar `any` ni `eslint-disable`.

---

## Application — Subscriber concreto

El subscriber vive **en la misma carpeta del use case que dispara**, no en una carpeta `subscribers/` propia.

```
progress/application/
  update/
    update-flashcard-stats.ts                        ← use case
    request-update-flashcard-stats.ts                ← type del request
    update-flashcard-stats-on-attempt-recorded.ts    ← subscriber
```

```typescript
// src/progress/application/update/update-flashcard-stats-on-attempt-recorded.ts
import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import {
  AttemptRecordedEvent,
  type AttemptRecordedAttributes,
} from '@/gaming/domain/events/attempt-recorded.event';
import { UpdateFlashcardStats } from './update-flashcard-stats';

@Injectable()
export class UpdateFlashcardStatsOnAttemptRecorded extends Subscriber {
  readonly queueName = 'progress.update_flashcard_stats_on_attempt_recorded';
  readonly eventName = AttemptRecordedEvent.EVENT_NAME;
  readonly exchangeName = AttemptRecordedEvent.EVENT_NAME;
  readonly domainEvent = AttemptRecordedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly useCase: UpdateFlashcardStats,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as AttemptRecordedAttributes;
    if (attrs.userId === null) return;
    await this.useCase.execute({
      userId: attrs.userId,
      flashcardId: attrs.flashcardId,
      correct: attrs.correct,
      mode: attrs.mode,
    });
  }
}
```

---

## Infrastructure — SubscribersBootstrapper

```typescript
// src/shared/infrastructure/event-bus/subscribers-bootstrapper.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type Subscriber } from '@/shared/application/subscriber';

export const SUBSCRIBERS = Symbol('Subscribers');

@Injectable()
export class SubscribersBootstrapper implements OnModuleInit {
  constructor(@Inject(SUBSCRIBERS) private readonly subscribers: Subscriber[]) {}

  async onModuleInit(): Promise<void> {
    await Promise.all(this.subscribers.map((s) => s.init()));
  }
}
```

---

## Queue Naming

```
<bounded-context>.<acción>_on_<evento_pasado>

progress.update_flashcard_stats_on_attempt_recorded
content.generate_flashcard_audio_on_flashcard_examples_completed
identity.send_welcome_email_on_user_registered
```

Las colas `.retry` y `.dead_letter` se crean automáticamente — ver `api-events-infra`.

---

## Rules

- `Subscriber` abstract — **cero imports de `@nestjs/common`**
- `@Inject` + `@Injectable` en el subscriber concreto son la única excepción permitida
- `OnModuleInit` vive en infrastructure (`SubscribersBootstrapper`) — nunca en application
- `on()` **siempre delega a un UseCase** — sin lógica de negocio propia
- El subscriber vive **junto al use case que dispara** — nunca en carpeta `subscribers/` independiente
- `eventBus.publish()` se llama **después** de `repository.save()` — nunca antes
- Ver implementación de infrastructure: `api-events-infra`
