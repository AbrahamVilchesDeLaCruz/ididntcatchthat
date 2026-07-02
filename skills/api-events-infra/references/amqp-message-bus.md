# AmqpMessageBus — Full Implementation

## `AmqpMessageBus` completo

```typescript
// src/shared/infrastructure/event-bus/amqp-message-bus.ts
import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  connect,
  type ChannelModel,
  type Channel,
  type ConsumeMessage,
} from 'amqplib';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type Logger } from '@/shared/domain/logger';
import { LOGGER_SERVICE } from '@/shared/domain/logger';
import { InvalidEventPayload } from '@/shared/domain/exceptions/invalid-event-payload';

const RETRY_DELAYS = [1000, 5000, 10000]; // ms — backoff exponencial
const RECONNECT_DELAY_MS = 5000;

type ConsumerRegistration = {
  queueName: string;
  eventName: string;
  exchangeName: string;
  DomainEventClass: new (...args: unknown[]) => DomainEvent;
  handler: (event: DomainEvent) => Promise<void>;
};

@Injectable()
export class AmqpMessageBus
  implements DomainEventPublisher, DomainEventConsumer, OnModuleDestroy
{
  private model: ChannelModel | null = null;
  /** Mutex: prevents concurrent connect() calls from creating two connections */
  private modelPromise: Promise<ChannelModel> | null = null;
  private channel: Channel | null = null;
  private readonly registeredConsumers: ConsumerRegistration[] = [];

  constructor(
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
    private readonly config: ConfigService,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close().catch(() => undefined);
    await this.model?.close().catch(() => undefined);
    this.channel = null;
    this.model = null;
    this.modelPromise = null;
  }

  // ── Setup ────────────────────────────────────────────────────────────────

  private async setupQueues(
    queueName: string,
    exchangeName: string,
    bindingKey: string,
  ): Promise<void> {
    const ch = await this.getChannel();

    // Exchange type is always 'direct' — hardcoded, not from config
    await ch.assertExchange(exchangeName, 'direct', { durable: true });

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
    DomainEventClass: new (...args: unknown[]) => DomainEvent,
    handler: (event: DomainEvent) => Promise<void>,
  ): Promise<void> {
    this.registeredConsumers.push({
      queueName, eventName, exchangeName, DomainEventClass, handler,
    });
    await this.setupQueues(queueName, exchangeName, eventName);
    const ch = await this.getChannel();
    await ch.prefetch(1);

    await ch.consume(queueName, (msg: ConsumeMessage | null) => {
      void (async (): Promise<void> => {
        if (!msg) return;
        try {
          const message = JSON.parse(msg.content.toString()) as Record<string, unknown>;
          const event = this.instantiateDomainEvent(DomainEventClass, message);
          await handler(event);
          try {
            ch.ack(msg);
          } catch {
            // Channel may have been closed during shutdown.
          }
        } catch (error) {
          try {
            ch.nack(msg, false, false);
            await this.handleRetry(msg, queueName, error as Error);
          } catch {
            // Channel may have been closed during shutdown.
          }
        }
      })();
    });

    this.logger.info('Consumer registered', { queueName });
  }

  // ── Publish ───────────────────────────────────────────────────────────────

  /**
   * Invokes registered in-process handlers without publishing to RabbitMQ.
   * Used by E2E tests to avoid flaky cross-BC async delivery in CI.
   */
  async dispatchInProcess(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const eventName = event.eventName();
      for (const reg of this.registeredConsumers) {
        if (reg.eventName !== eventName) continue;
        const domainEvent = this.instantiateDomainEvent(reg.DomainEventClass, {
          aggregateId: event.aggregateId,
          eventId: event.eventId,
          occurredOn: event.occurredOn.toISOString(),
          data: event.attributes,
        });
        await reg.handler(domainEvent);
      }
    }
  }

  async publish(events: DomainEvent[]): Promise<void> {
    const ch = await this.getChannel();

    for (const event of events) {
      // Cada evento tiene su propio exchange nombrado con el eventName
      const exchangeName = event.eventName();
      await ch.assertExchange(exchangeName, 'direct', { durable: true });
      ch.publish(
        exchangeName,
        event.eventName(),
        Buffer.from(
          JSON.stringify({
            aggregateId: event.aggregateId,
            eventId: event.eventId,
            occurredOn: event.occurredOn,
            data: event.attributes, // ← campo "data", no "attributes" ni toPrimitives()
          }),
        ),
        {
          contentType: 'application/json',
          messageId: event.eventId,
          timestamp: event.occurredOn.getTime(),
          deliveryMode: 2,
          headers: { retries: 0, type: event.eventName() },
        },
      );
    }
  }

  // ── Retry & DLQ ───────────────────────────────────────────────────────────

  private async handleRetry(
    msg: ConsumeMessage,
    queueName: string, // pasado como parámetro — NO se lee de msg.fields.routingKey
    error: Error,
  ): Promise<void> {
    const retryCount =
      (msg.properties.headers?.retries as number | undefined) ?? 0;
    const content = msg.content; // bytes originales — sin re-serializar

    if (retryCount < RETRY_DELAYS.length) {
      const delay = RETRY_DELAYS[retryCount];
      const ch = await this.getChannel();
      this.logger.warn('Retrying message', { queueName, attempt: retryCount + 1, delayMs: delay });
      ch.sendToQueue(`${queueName}.retry`, content, {
        expiration: String(delay),
        headers: { ...msg.properties.headers, retries: retryCount + 1 },
      });
    } else {
      const ch = await this.getChannel();
      this.logger.error('Message exhausted retries → DLQ', error, { queueName });
      ch.sendToQueue(`${queueName}.dead_letter`, content, {
        headers: { reason: error.message, exhausted_at: new Date().toISOString() },
      });
    }
  }

  // ── Connection ────────────────────────────────────────────────────────────

  private async getModel(): Promise<ChannelModel> {
    if (!this.modelPromise) {
      const uri = this.config.getOrThrow<string>('AMQP_URI'); // env var directa
      this.modelPromise = connect(uri)
        .then((model) => {
          this.model = model;
          model.on('close', () => {
            this.logger.warn('AMQP connection closed — scheduling reconnect');
            this.model = null;
            this.modelPromise = null;
            this.channel = null;
            setTimeout(() => { void this.reconnect(); }, RECONNECT_DELAY_MS);
          });
          model.on('error', (err: Error) => {
            this.logger.error('AMQP connection error', err, {});
          });
          return model;
        })
        .catch((err: Error) => {
          this.modelPromise = null;
          throw err;
        });
    }
    return this.modelPromise;
  }

  private async reconnect(): Promise<void> {
    this.logger.info('AMQP reconnecting…', {});
    try {
      await this.getModel();
      for (const reg of this.registeredConsumers) {
        await this.consume(reg.queueName, reg.eventName, reg.exchangeName, reg.DomainEventClass, reg.handler);
      }
      this.logger.info('AMQP reconnected and consumers restored', { consumers: this.registeredConsumers.length });
    } catch (err) {
      this.logger.error('AMQP reconnect failed — retrying', err as Error, {});
      setTimeout(() => { void this.reconnect(); }, RECONNECT_DELAY_MS);
    }
  }

  private async getChannel(): Promise<Channel> {
    if (!this.channel) {
      const model = await this.getModel();
      this.channel = await model.createChannel();
      this.channel.on('error', () => { this.channel = null; });
    }
    return this.channel;
  }

  private instantiateDomainEvent(
    DomainEventClass: new (...args: unknown[]) => DomainEvent,
    message: Record<string, unknown>,
  ): DomainEvent {
    // Payload usa campo "data" para atributos — validar su presencia
    if (!message.data) {
      throw new InvalidEventPayload(JSON.stringify(message));
    }
    return new DomainEventClass(
      message.aggregateId,
      message.data,
      message.eventId,
      message.occurredOn ? new Date(message.occurredOn as string) : undefined,
    );
  }
}
```

## `SubscribersBootstrapper`

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

## Registration en módulos NestJS

`AmqpMessageBus` se registra **una sola vez** en `SharedModule` como singleton:

```typescript
// shared/infrastructure/framework/shared.module.ts
@Global()
@Module({
  providers: [
    AmqpMessageBus,
    { provide: DOMAIN_EVENT_PUBLISHER, useExisting: AmqpMessageBus },
    { provide: DOMAIN_EVENT_CONSUMER, useExisting: AmqpMessageBus },
    // ...
  ],
  exports: [DOMAIN_EVENT_PUBLISHER, DOMAIN_EVENT_CONSUMER, /* ... */],
})
export class SharedModule {}
```

Los módulos BC NO re-registran `AmqpMessageBus`. Solo registran sus subscribers via `useFactory` que devuelve un array:

```typescript
// gaming/infrastructure/framework/gaming.module.ts
import { SUBSCRIBERS, SubscribersBootstrapper } from '@/shared/infrastructure/event-bus/subscribers-bootstrapper';
import { type Subscriber } from '@/shared/application/subscriber';

@Module({
  imports: [SharedModule, /* ... */],
  providers: [
    MigrateGuestGamesOnGuestProgressMigrated,
    {
      provide: SUBSCRIBERS,
      useFactory: (
        onGuestMigrated: MigrateGuestGamesOnGuestProgressMigrated,
      ): Subscriber[] => [onGuestMigrated],
      inject: [MigrateGuestGamesOnGuestProgressMigrated],
    },
    SubscribersBootstrapper,
    // ...
  ],
})
export class GamingModule {}
```

> **Importante:** SUBSCRIBERS usa `useFactory` que retorna un array, **nunca** `useExisting + multi: true`.

## Recuperación de DLQ

```bash
# Patrón genérico — sustituir por la cola real (ver docs/domain/rabbitmq-design.md)
rabbitmqadmin move messages \
  --source-queue=<queue_name>.dead_letter \
  --destination-queue=<queue_name>

# Ejemplo real:
rabbitmqadmin move messages \
  --source-queue=enrich_flashcard_on_flashcard_created.dead_letter \
  --destination-queue=enrich_flashcard_on_flashcard_created
```
