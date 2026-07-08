import { Injectable } from '@nestjs/common';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { AmqpMessageBus } from '@/shared/infrastructure/event-bus/amqp-message-bus';

/**
 * E2E-only publisher: routes ALL events in-process via the registered
 * subscribers. External adapters (ElevenLabs, R2, DeepSeek) are already
 * stubbed; the event bus is internal infrastructure, so a real broker is
 * not needed in E2E. RabbitMQ behaviour is covered by dedicated broker
 * tests; per-handler behaviour is covered by unit tests.
 */
@Injectable()
export class E2eDomainEventPublisher implements DomainEventPublisher {
  constructor(private readonly messageBus: AmqpMessageBus) {}

  async publish(events: DomainEvent[]): Promise<void> {
    await this.messageBus.dispatchInProcess(events);
  }
}
