import { Injectable } from '@nestjs/common';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';

/**
 * No-op publisher — used until the real AMQP event bus is implemented (api-events-infra).
 * Events are acknowledged but not actually dispatched.
 */
@Injectable()
export class NoopDomainEventPublisher implements DomainEventPublisher {
  async publish(_events: DomainEvent[]): Promise<void> {
    // intentionally empty
  }
}
