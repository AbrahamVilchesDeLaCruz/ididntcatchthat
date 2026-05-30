import { type OwnerType } from '@/identity/session/domain/user-session';
import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export type SessionStartedAttributes = {
  ownerId: string;
  ownerType: OwnerType;
  deviceId: string;
};

export class SessionStartedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.identity.session.started';

  constructor(
    aggregateId: string,
    attributes: SessionStartedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return SessionStartedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): SessionStartedEvent {
    return new SessionStartedEvent(
      aggregateId,
      attributes as SessionStartedAttributes,
      eventId,
      occurredOn,
    );
  }
}
