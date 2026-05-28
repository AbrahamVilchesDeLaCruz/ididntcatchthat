import { type DomainEvent } from '@/shared/domain/domain-event';
import { type DomainEventConsumer } from './domain-event-consumer';

export abstract class Handler {
  abstract get queueName(): string;
  abstract get eventName(): string;
  abstract get exchangeName(): string;
  abstract get domainEvent(): new (...args: unknown[]) => DomainEvent;

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
