---
name: api-events-infra
description: >
  AmqpMessageBus, HandlersBootstrapper, retry, DLQ, idempotencia en apps/api/.
  Trigger: Al implementar AmqpMessageBus, configurar HandlersBootstrapper, o entender retry y DLQ.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

# Skill: api-events-infra

## When to Use

- Al implementar `AmqpMessageBus` (EventBus + DomainEventConsumer)
- Al configurar `HandlersBootstrapper` y registro de handlers en módulos
- Al entender retry, DLQ e idempotencia

---

## AmqpMessageBus

Implementa `EventBus` (domain) y `DomainEventConsumer` (application). Toda la mecánica de RabbitMQ vive aquí.

```typescript
// src/shared/infrastructure/event-bus/amqp-message-bus.ts
import { Injectable } from '@nestjs/common';
import { connect, Connection, Channel, ConsumeMessage } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@shared/domain/event-bus';
import { DomainEvent } from '@shared/domain/domain-event';
import { DomainEventConsumer } from '@shared/application/domain-event-consumer';
import { Logger, LOGGER_SERVICE } from '@shared/domain/logger';
import { Inject } from '@shared/infrastructure/di/inject';

const RETRY_DELAYS = [1000, 5000, 10000]; // ms — backoff exponencial

@Injectable()
export class AmqpMessageBus implements EventBus, DomainEventConsumer {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  constructor(
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
    private readonly config: ConfigService,
  ) {}

  // ── Setup — auto al arrancar ──────────────────────────────────────────────

  private async setupQueues(queueName: string, exchangeName: string, bindingKey: string): Promise<void> {
    const ch = await this.getChannel();
    const exchangeType = this.config.get<string>('amqp.exchange_type');

    await ch.assertExchange(exchangeName, exchangeType, { durable: true });

    await ch.assertQueue(queueName, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': `${queueName}.dead_letter`,
      },
    });

    // .retry sin TTL fijo — el TTL lo pone cada mensaje (expiration)
    await ch.assertQueue(`${queueName}.retry`, { durable: true });
    await ch.assertQueue(`${queueName}.dead_letter`, { durable: true });

    await ch.bindQueue(queueName, exchangeName, bindingKey);
    this.logger.info('Queues set up', { queueName, exchangeName });
  }

  // ── Consume ───────────────────────────────────────────────────────────────

  async consume(
    queueName: string,
    eventName: string,
    exchangeName: string,
    DomainEventClass: new (...args: any[]) => DomainEvent,
    handler: (event: DomainEvent) => Promise<void>,
  ): Promise<void> {
    await this.setupQueues(queueName, exchangeName, eventName);
    const ch = await this.getChannel();
    await ch.prefetch(1);

    await ch.consume(queueName, async (msg: ConsumeMessage | null) => {
      if (!msg) return;
      try {
        const message = JSON.parse(msg.content.toString());
        const event = this.instantiateDomainEvent(DomainEventClass, message);
        await handler(event);
        ch.ack(msg);
      } catch (error) {
        ch.nack(msg, false, false);
        await this.handleError(msg, error as Error);
      }
    });

    this.logger.info('Consumer registered', { queueName });
  }

  // ── Publish ───────────────────────────────────────────────────────────────

  async publish(events: DomainEvent[]): Promise<void> {
    const ch = await this.getChannel();
    const exchange = this.config.get<string>('amqp.exchange_name');

    for (const event of events) {
      ch.publish(
        exchange,
        event.eventName,
        Buffer.from(JSON.stringify(event.toPrimitives())),
        {
          contentType: 'application/json',
          messageId: event.eventId,
          timestamp: event.occurredOn.getTime(),
          deliveryMode: 2, // persistent
          headers: { retries: 0, type: event.eventName },
        },
      );
    }
  }

  // ── Retry & DLQ ───────────────────────────────────────────────────────────

  private async handleError(msg: ConsumeMessage, error: Error): Promise<void> {
    const retryCount: number = msg.properties.headers?.retries ?? 0;
    const queueName = msg.fields.routingKey;
    const message = JSON.parse(msg.content.toString());

    if (retryCount < RETRY_DELAYS.length) {
      const delay = RETRY_DELAYS[retryCount];
      const ch = await this.getChannel();
      this.logger.warn('Retrying message', { queueName, attempt: retryCount + 1, delayMs: delay });
      ch.sendToQueue(`${queueName}.retry`, Buffer.from(JSON.stringify(message)), {
        expiration: String(delay), // TTL dinámico — backoff exponencial
        headers: { ...msg.properties.headers, retries: retryCount + 1 },
      });
    } else {
      const ch = await this.getChannel();
      this.logger.error('Message exhausted retries → DLQ', error, { queueName });
      ch.sendToQueue(`${queueName}.dead_letter`, Buffer.from(JSON.stringify(message)), {
        headers: { reason: error.message, exhausted_at: new Date().toISOString() },
      });
    }
  }

  // ── Connection ────────────────────────────────────────────────────────────

  private async getConnection(): Promise<Connection> {
    if (!this.connection) {
      this.connection = await connect(this.config.get<string>('amqp.uri'));
      this.connection.on('close', () => {
        this.logger.warn('AMQP connection closed');
        this.connection = null;
        this.channel = null;
      });
    }
    return this.connection;
  }

  private async getChannel(): Promise<Channel> {
    if (!this.channel) {
      const conn = await this.getConnection();
      this.channel = await conn.createChannel();
      this.channel.on('error', () => { this.channel = null; });
    }
    return this.channel;
  }

  private instantiateDomainEvent(
    DomainEventClass: new (...args: any[]) => DomainEvent,
    message: any,
  ): DomainEvent {
    if (!message.data) throw new Error(`Invalid domain event: ${JSON.stringify(message)}`);
    return new DomainEventClass(message.aggregateId, message.data, message.eventId, new Date(message.occurredOn));
  }
}
```

---

## HandlersBootstrapper

`OnModuleInit` vive aquí — nunca en application:

```typescript
// src/shared/infrastructure/event-bus/handlers-bootstrapper.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Handler } from '@shared/application/handler';

export const HANDLERS = Symbol('Handlers');

@Injectable()
export class HandlersBootstrapper implements OnModuleInit {
  constructor(@Inject(HANDLERS) private readonly handlers: Handler[]) {}

  async onModuleInit(): Promise<void> {
    await Promise.all(this.handlers.map((h) => h.init()));
  }
}
```

---

## Registration en módulos

```typescript
// src/flashcards/infrastructure/framework/flashcards.module.ts
@Module({
  providers: [
    CreateFlashcardAudioOnFlashcardCreated,
    {
      provide: HANDLERS,
      useExisting: CreateFlashcardAudioOnFlashcardCreated,
      multi: true, // cada módulo añade sus handlers al array global
    },
    HandlersBootstrapper,
    {
      provide: DOMAIN_EVENT_CONSUMER,
      useClass: AmqpMessageBus,
    },
    {
      provide: EVENT_BUS,
      useClass: AmqpMessageBus,
    },
  ],
})
export class FlashcardsModule {}
```

---

## Retry Policy

| Intento | Delay | Mecanismo |
|---|---|---|
| 1 | 1s | `expiration: "1000"` en `.retry` → devuelve a cola principal vía DLX |
| 2 | 5s | `expiration: "5000"` en `.retry` → devuelve a cola principal vía DLX |
| 3 | 10s | `expiration: "10000"` en `.retry` → devuelve a cola principal vía DLX |
| 4 | — | → `.dead_letter` — espera intervención manual |

El `expiration` es **por mensaje**, no por cola — permite backoff exponencial con una sola `.retry` queue.

### Recuperación de DLQ

```bash
# Tras aplicar el fix, re-encolar mensajes de dead_letter a la cola principal
rabbitmqadmin move messages \
  --source-queue=create_flashcard_audio_on_flashcard_created.dead_letter \
  --destination-queue=create_flashcard_audio_on_flashcard_created
```

---

## Idempotencia

### Opción A — Natural (por defecto)

```typescript
async handle(event: DomainEvent): Promise<void> {
  const existing = await this.repo.search(id);
  if (existing) return; // ya procesado — salida limpia
  await this.useCase.execute({ ... });
}
```

### Opción B — Inbox table (operaciones críticas irreversibles)

```typescript
async handle(event: DomainEvent): Promise<void> {
  if (await this.inboxRepo.exists(event.eventId)) return;
  await this.useCase.execute({ ... });
  await this.inboxRepo.save(event.eventId, event.eventName);
}
```

Tabla: `processed_events(event_id UUID PK, event_name, processed_at)` — purgar > 30 días.

> Decisión completa: [ADR 019](../../docs/adr/019-event-bus-strategy.md)
