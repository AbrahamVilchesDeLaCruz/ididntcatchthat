import { type DomainEvent } from '@/shared/domain/domain-event';

export interface DomainEventPublisher {
  publish(events: DomainEvent[]): Promise<void>;
}

export const DOMAIN_EVENT_PUBLISHER = Symbol('DomainEventPublisher');
