# AmqpMessageBus — Full Implementation

## `AmqpMessageBus` completo

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

  // ── Setup ────────────────────────────────────────────────────────────────

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
    DomainEventClass: new (...args: never) => DomainEvent,
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
        event.eventName(),
        Buffer.from(JSON.stringify(event.toPrimitives())),
        {
          contentType: 'application/json',
          messageId: event.eventId,
          timestamp: event.occurredOn.getTime(),
          deliveryMode: 2, // persistent
          headers: { retries: 0, type: event.eventName() },
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
    DomainEventClass: new (...args: never) => DomainEvent,
    message: Record<string, unknown>,
  ): DomainEvent {
    if (!message['aggregateId']) throw new Error(`Invalid domain event: ${JSON.stringify(message)}`);
    return new (DomainEventClass as unknown as new (
      aggregateId: string,
      attributes: DomainEventAttributes,
      eventId?: string,
      occurredOn?: Date,
    ) => DomainEvent)(
      message['aggregateId'] as string,
      message['attributes'] as DomainEventAttributes,
      message['eventId'] as string | undefined,
      message['occurredOn'] ? new Date(message['occurredOn'] as string) : undefined,
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

```typescript
// gaming/infrastructure/framework/gaming.module.ts
@Module({
  providers: [
    MigrateGuestGamesOnGuestProgressMigrated, // subscriber concreto
    {
      provide: SUBSCRIBERS,
      useExisting: MigrateGuestGamesOnGuestProgressMigrated,
      multi: true, // cada módulo añade sus subscribers al array global
    },
    SubscribersBootstrapper,
    { provide: DOMAIN_EVENT_CONSUMER, useClass: AmqpMessageBus },
    { provide: EVENT_BUS, useClass: AmqpMessageBus },
  ],
})
export class GamingModule {}
```

## Recuperación de DLQ

```bash
rabbitmqadmin move messages \
  --source-queue=create_flashcard_audio_on_flashcard_created.dead_letter \
  --destination-queue=create_flashcard_audio_on_flashcard_created
```
