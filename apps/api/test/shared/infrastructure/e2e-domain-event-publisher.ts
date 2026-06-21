import { Injectable } from '@nestjs/common';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { AmqpMessageBus } from '@/shared/infrastructure/event-bus/amqp-message-bus';

/**
 * E2E-only publisher:
 * - gaming/progress/ranking/identity events → in-process (deterministic in CI)
 * - content events → RabbitMQ (avoids corrupting flashcards via nested sync handlers)
 */
@Injectable()
export class E2eDomainEventPublisher implements DomainEventPublisher {
  constructor(private readonly messageBus: AmqpMessageBus) {}

  async publish(events: DomainEvent[]): Promise<void> {
    const contentEvents: DomainEvent[] = [];
    const syncEvents: DomainEvent[] = [];

    for (const event of events) {
      if (event.eventName().startsWith('ididntcatchthat.content.')) {
        contentEvents.push(event);
      } else {
        syncEvents.push(event);
      }
    }

    if (syncEvents.length > 0) {
      await this.messageBus.dispatchInProcess(syncEvents);
    }
    if (contentEvents.length > 0) {
      await this.messageBus.publish(contentEvents);
    }
  }
}
