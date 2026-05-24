import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export type SessionRotatedAttributes = {
  newSessionId: string;
  ownerId: string;
};

export class SessionRotatedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.identity.session.rotated';

  constructor(
    aggregateId: string,
    attributes: SessionRotatedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return SessionRotatedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): SessionRotatedEvent {
    return new SessionRotatedEvent(
      aggregateId,
      attributes as SessionRotatedAttributes,
      eventId,
      occurredOn,
    );
  }
}
