import { Injectable } from '@nestjs/common';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { AmqpMessageBus } from '@/shared/infrastructure/event-bus/amqp-message-bus';

/**
 * E2E-only publisher: runs domain event handlers in-process after app init
 * so progress/ranking side effects do not depend on RabbitMQ delivery timing.
 */
@Injectable()
export class E2eDomainEventPublisher implements DomainEventPublisher {
  constructor(private readonly messageBus: AmqpMessageBus) {}

  async publish(events: DomainEvent[]): Promise<void> {
    await this.messageBus.dispatchInProcess(events);
  }
}
