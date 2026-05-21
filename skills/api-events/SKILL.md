# Skill: api-events

## When to Use

- Al definir el `EventBus` interface o `DomainEventConsumer` interface
- Al crear un `Handler` concreto en application
- Al entender el flujo de eventos y la regla de dependencia

---

## Concepts

```
DomainEvent           ← lo que pasó (flashcard.created)
EventBus              ← interface domain — publica eventos
DomainEventConsumer   ← interface application — consume eventos
Handler               ← abstract application — puro, sin NestJS
AmqpMessageBus        ← infrastructure — implementa ambas interfaces
HandlersBootstrapper  ← infrastructure — OnModuleInit, arranca handlers
```

Regla de dependencia:

```
Domain         → DomainEvent, EventBus interface
Application    → Handler (abstract), DomainEventConsumer interface
Infrastructure → AmqpMessageBus, HandlersBootstrapper, módulos NestJS
```

Flujo completo:

```
UseCase
  → eventBus.publish(aggregate.pullDomainEvents())
    → AmqpMessageBus.publish() → RabbitMQ exchange
      → cola del handler
        → HandlersBootstrapper.onModuleInit() → handler.init()
          → AmqpMessageBus.consume() → setupQueues() automático
            → handler.handle(event) → UseCase correspondiente
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
    domainEvent: new (...args: any[]) => DomainEvent,
    handler: (event: DomainEvent) => Promise<void>,
  ): Promise<void>;
}

export const DOMAIN_EVENT_CONSUMER = Symbol('DomainEventConsumer');
```

## Application — Handler abstract

**Cero imports de NestJS** — clase pura de application:

```typescript
// src/shared/application/handler.ts
import { DomainEvent } from '@shared/domain/domain-event';
import { DomainEventConsumer } from './domain-event-consumer';

export abstract class Handler {
  abstract get queueName(): string;
  abstract get eventName(): string;
  abstract get exchangeName(): string;
  abstract get domainEvent(): new (...args: any[]) => DomainEvent;

  abstract handle(event: DomainEvent): Promise<void>;

  constructor(protected readonly consumer: DomainEventConsumer) {}

  async init(): Promise<void> {
    await this.consumer.consume(
      this.queueName,
      this.eventName,
      this.exchangeName,
      this.domainEvent,
      this.handle.bind(this),
    );
  }
}
```

## Application — Handler concreto

```typescript
// src/flashcards/application/event-handlers/create-flashcard-audio-on-flashcard-created.ts
import { Inject } from '@nestjs/common'; // único import de NestJS — solo para DI
import { Handler } from '@shared/application/handler';
import { DomainEventConsumer, DOMAIN_EVENT_CONSUMER } from '@shared/application/domain-event-consumer';
import { DomainEvent } from '@shared/domain/domain-event';
import { FlashcardCreatedEvent } from '@flashcards/domain/events/flashcard-created.event';
import { CreateFlashcardAudioUseCase } from '../create-flashcard-audio.use-case';

export class CreateFlashcardAudioOnFlashcardCreated extends Handler {
  readonly queueName    = 'create_flashcard_audio_on_flashcard_created';
  readonly eventName    = FlashcardCreatedEvent.EVENT_NAME;
  readonly exchangeName = FlashcardCreatedEvent.EVENT_NAME;
  readonly domainEvent  = FlashcardCreatedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly useCase: CreateFlashcardAudioUseCase,
  ) {
    super(consumer);
  }

  async handle(event: DomainEvent): Promise<void> {
    const e = event as FlashcardCreatedEvent;
    const existing = await this.audioRepo.search(e.flashcardId);
    if (existing) return; // idempotencia — opción A
    await this.useCase.execute({ flashcardId: e.flashcardId });
  }
}
```

---

## Queue Naming

```
<acción>_on_<aggregate>_<evento_pasado>

create_flashcard_audio_on_flashcard_created
send_welcome_email_on_user_registered
notify_review_due_on_session_completed
```

Las colas `.retry` y `.dead_letter` se crean automáticamente — ver `api-events-infra`.

---

## Rules

- `Handler` abstract — **cero imports de `@nestjs/common`**
- `@Inject` en el constructor del handler concreto es la única excepción permitida
- `OnModuleInit` vive en infrastructure (`HandlersBootstrapper`) — nunca en application
- `handle()` siempre llama a un UseCase — sin lógica de negocio propia
- `eventBus.publish()` se llama **después** de `repository.save()` — nunca antes
- Ver implementación de infrastructure: `api-events-infra`
