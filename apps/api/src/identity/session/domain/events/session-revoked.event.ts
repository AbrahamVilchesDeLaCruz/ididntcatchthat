import { type OwnerType } from '@/identity/session/domain/user-session';
import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export type SessionRevokedAttributes = {
  ownerId: string;
  ownerType: OwnerType;
};

export class SessionRevokedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.identity.session.revoked';

  constructor(
    aggregateId: string,
    attributes: SessionRevokedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return SessionRevokedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): SessionRevokedEvent {
    return new SessionRevokedEvent(
      aggregateId,
      attributes as SessionRevokedAttributes,
      eventId,
      occurredOn,
    );
  }
}
