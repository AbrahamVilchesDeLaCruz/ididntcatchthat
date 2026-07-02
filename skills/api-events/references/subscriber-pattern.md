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
    flashcard-stats-updater.ts                        ← use case
    random-module-progress-updater.ts                 ← use case
    update-flashcard-stats-on-attempt-recorded.ts     ← subscriber
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
import { FlashcardStatsUpdater } from './flashcard-stats-updater';
import { RandomModuleProgressUpdater } from './random-module-progress-updater';

@Injectable()
export class FlashcardStatsUpdaterOnAttemptRecorded extends Subscriber {
  readonly queueName = 'progress.update_flashcard_stats_on_attempt_recorded';
  readonly eventName = 'ididntcatchthat.gaming.attempts.attempt.recorded';
  readonly exchangeName = 'ididntcatchthat.gaming.attempts.attempt.recorded';
  readonly domainEvent = AttemptRecordedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(FlashcardStatsUpdater)
    private readonly flashcardStatsUpdater: FlashcardStatsUpdater,
    @Inject(RandomModuleProgressUpdater)
    private readonly randomModuleProgressUpdater: RandomModuleProgressUpdater,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as AttemptRecordedAttributes;
    if (attrs.userId === null) return;

    await this.flashcardStatsUpdater.execute({
      userId: attrs.userId,
      flashcardId: attrs.flashcardId,
      correct: attrs.correct,
      mode: attrs.mode,
    });

    if (attrs.mode === 'game') {
      await this.randomModuleProgressUpdater.executeForRandomAttempt({
        userId: attrs.userId,
        gameId: attrs.gameId,
        flashcardId: attrs.flashcardId,
      });
    }
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
    // Use cases
    FlashcardStatsUpdater,
    RandomModuleProgressUpdater,

    // Event subscribers
    FlashcardStatsUpdaterOnAttemptRecorded,
    {
      provide: SUBSCRIBERS,
      useFactory: (s1: FlashcardStatsUpdaterOnAttemptRecorded): Subscriber[] => [s1],
      inject: [FlashcardStatsUpdaterOnAttemptRecorded],
    },
    SubscribersBootstrapper,
  ],
})
export class ProgressModule {}
```

> `DOMAIN_EVENT_CONSUMER` y `DOMAIN_EVENT_PUBLISHER` se proveen en `SharedModule` — no es necesario redeclararlos en cada módulo de BC.
