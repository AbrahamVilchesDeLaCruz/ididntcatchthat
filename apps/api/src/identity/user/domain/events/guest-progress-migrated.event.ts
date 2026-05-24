import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

type GuestProgressMigratedAttributes = {
  userId: string;
  deviceId: string;
  guestDeviceId: string;
};

export class GuestProgressMigratedEvent extends DomainEvent {
  static readonly EVENT_NAME =
    'ididntcatchthat.identity.user.guest_progress_migrated';

  constructor(
    aggregateId: string,
    attributes: GuestProgressMigratedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return GuestProgressMigratedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): GuestProgressMigratedEvent {
    return new GuestProgressMigratedEvent(
      aggregateId,
      attributes as GuestProgressMigratedAttributes,
      eventId,
      occurredOn,
    );
  }
}
