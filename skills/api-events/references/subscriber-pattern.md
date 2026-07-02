# Subscriber Pattern — Reference

## `Subscriber` abstract (application)

**Cero imports de NestJS** — clase pura:

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

## Subscriber concreto — ejemplo completo

El subscriber vive **junto al use case que dispara**, no en una carpeta `subscribers/` propia:

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

## `SubscribersBootstrapper` (infrastructure)

```typescript
// src/shared/infrastructure/event-bus/subscribers-bootstrapper.ts
export const SUBSCRIBERS = Symbol('Subscribers');

@Injectable()
export class SubscribersBootstrapper implements OnModuleInit {
  constructor(@Inject(SUBSCRIBERS) private readonly subscribers: Subscriber[]) {}

  async onModuleInit(): Promise<void> {
    await Promise.all(this.subscribers.map((s) => s.init()));
  }
}
```

## Registro en módulo NestJS

```typescript
@Module({
  providers: [
    UpdateFlashcardStatsOnAttemptRecorded,
    {
      provide: SUBSCRIBERS,
      useExisting: UpdateFlashcardStatsOnAttemptRecorded,
      multi: true,
    },
    SubscribersBootstrapper,
    { provide: DOMAIN_EVENT_CONSUMER, useClass: AmqpMessageBus },
    { provide: EVENT_BUS, useClass: AmqpMessageBus },
  ],
})
export class ProgressModule {}
```
