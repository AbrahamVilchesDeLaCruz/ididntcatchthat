import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

type UserRegisteredAttributes = {
  email: string;
  nickname: string;
  deviceId: string;
};

export class UserRegisteredEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.identity.user.registered';

  constructor(
    aggregateId: string,
    attributes: UserRegisteredAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return UserRegisteredEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): UserRegisteredEvent {
    return new UserRegisteredEvent(
      aggregateId,
      attributes as UserRegisteredAttributes,
      eventId,
      occurredOn,
    );
  }
}
