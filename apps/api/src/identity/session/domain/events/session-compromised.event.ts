import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export type SessionCompromisedAttributes = {
  ownerId: string;
  tokenId: string;
};

export class SessionCompromisedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.identity.session.compromised';

  constructor(
    aggregateId: string,
    attributes: SessionCompromisedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return SessionCompromisedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): SessionCompromisedEvent {
    return new SessionCompromisedEvent(
      aggregateId,
      attributes as SessionCompromisedAttributes,
      eventId,
      occurredOn,
    );
  }
}
