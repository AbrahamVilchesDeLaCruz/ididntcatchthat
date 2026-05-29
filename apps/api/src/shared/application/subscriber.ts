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
