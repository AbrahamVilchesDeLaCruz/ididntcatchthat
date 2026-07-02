import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export interface StreakUpdatedAttributes extends DomainEventAttributes {
  userId: string;
  previousStreak: number;
  newStreak: number;
  occurredAt: string;
}

export class StreakUpdatedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.identity.streak.updated';

  constructor(
    aggregateId: string,
    readonly attrs: StreakUpdatedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attrs, eventId, occurredOn);
  }

  eventName(): string {
    return StreakUpdatedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): StreakUpdatedEvent {
    return new StreakUpdatedEvent(
      aggregateId,
      attributes as StreakUpdatedAttributes,
      eventId,
      occurredOn,
    );
  }
}
