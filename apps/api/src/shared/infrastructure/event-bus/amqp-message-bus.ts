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

const RETRY_DELAYS = [1000, 5000, 10000];

@Injectable()
export class AmqpMessageBus
  implements DomainEventPublisher, DomainEventConsumer, OnModuleDestroy
{
  private model: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor(
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
    private readonly config: ConfigService,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close().catch(() => undefined);
    await this.model?.close().catch(() => undefined);
    this.channel = null;
    this.model = null;
  }

  // ── Setup ────────────────────────────────────────────────────────────────────

  private async setupQueues(
    queueName: string,
    exchangeName: string,
    bindingKey: string,
  ): Promise<void> {
    const ch = await this.getChannel();

    await ch.assertExchange(exchangeName, 'direct', { durable: true });

    await ch.assertQueue(queueName, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': `${queueName}.dead_letter`,
      },
    });

    await ch.assertQueue(`${queueName}.retry`, { durable: true });
    await ch.assertQueue(`${queueName}.dead_letter`, { durable: true });

    await ch.bindQueue(queueName, exchangeName, bindingKey);
    this.logger.info('Queues set up', { queueName, exchangeName });
  }

  // ── Consume ──────────────────────────────────────────────────────────────────

  async consume(
    queueName: string,
    eventName: string,
    exchangeName: string,
    DomainEventClass: new (...args: unknown[]) => DomainEvent,
    handler: (event: DomainEvent) => Promise<void>,
  ): Promise<void> {
    await this.setupQueues(queueName, exchangeName, eventName);
    const ch = await this.getChannel();
    await ch.prefetch(1);

    await ch.consume(queueName, (msg: ConsumeMessage | null) => {
      void (async (): Promise<void> => {
        if (!msg) return;
        try {
          const message = JSON.parse(msg.content.toString()) as Record<
            string,
            unknown
          >;
          const event = this.instantiateDomainEvent(DomainEventClass, message);
          await handler(event);
          try {
            ch.ack(msg);
          } catch {
            // Channel may have been closed during shutdown — message will be
            // requeued automatically by the broker.
          }
        } catch (error) {
          try {
            ch.nack(msg, false, false);
            await this.handleRetry(msg, error as Error);
          } catch {
            // Channel may have been closed during shutdown.
          }
        }
      })();
    });

    this.logger.info('Consumer registered', { queueName });
  }

  // ── Publish ──────────────────────────────────────────────────────────────────

  async publish(events: DomainEvent[]): Promise<void> {
    const ch = await this.getChannel();

    for (const event of events) {
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
            data: event.attributes,
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

  // ── Retry & DLQ ──────────────────────────────────────────────────────────────

  private async handleRetry(msg: ConsumeMessage, error: Error): Promise<void> {
    const retryCount =
      (msg.properties.headers?.retries as number | undefined) ?? 0;
    const queueName = msg.fields.routingKey;
    const content = msg.content;

    if (retryCount < RETRY_DELAYS.length) {
      const delay = RETRY_DELAYS[retryCount];
      const ch = await this.getChannel();
      this.logger.warn('Retrying message', {
        queueName,
        attempt: retryCount + 1,
        delayMs: delay,
      });
      ch.sendToQueue(`${queueName}.retry`, content, {
        expiration: String(delay),
        headers: { ...msg.properties.headers, retries: retryCount + 1 },
      });
    } else {
      const ch = await this.getChannel();
      this.logger.error('Message exhausted retries → DLQ', error, {
        queueName,
      });
      ch.sendToQueue(`${queueName}.dead_letter`, content, {
        headers: {
          reason: error.message,
          exhausted_at: new Date().toISOString(),
        },
      });
    }
  }

  // ── Connection ────────────────────────────────────────────────────────────────

  private async getModel(): Promise<ChannelModel> {
    if (!this.model) {
      const uri = this.config.getOrThrow<string>('AMQP_URI');
      this.model = await connect(uri);
      this.model.on('close', () => {
        this.logger.warn('AMQP connection closed');
        this.model = null;
        this.channel = null;
      });
    }
    return this.model;
  }

  private async getChannel(): Promise<Channel> {
    if (!this.channel) {
      const model = await this.getModel();
      this.channel = await model.createChannel();
      this.channel.on('error', () => {
        this.channel = null;
      });
    }
    return this.channel;
  }

  private instantiateDomainEvent(
    DomainEventClass: new (...args: unknown[]) => DomainEvent,
    message: Record<string, unknown>,
  ): DomainEvent {
    if (!message.data) {
      throw new Error(
        `Invalid domain event payload: ${JSON.stringify(message)}`,
      );
    }
    return new DomainEventClass(
      message.aggregateId,
      message.data,
      message.eventId,
      message.occurredOn ? new Date(message.occurredOn as string) : undefined,
    );
  }
}
