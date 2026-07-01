import { Inject, Injectable } from '@nestjs/common';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { type UserSession } from '@/identity/session/domain/user-session';

@Injectable()
export class SessionEventPublisher {
  constructor(
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
  ) {}

  async publishFromSessions(...sessions: UserSession[]): Promise<void> {
    const events = sessions.flatMap((s) => s.pullDomainEvents());
    await this.publishEvents(events);
  }

  async publishEvents(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) return;
    await this.publisher.publish(events);
  }
}
