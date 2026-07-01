import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export interface StreakBrokenAttributes extends DomainEventAttributes {
  userId: string;
  brokenStreak: number;
  occurredAt: string;
}

export class StreakBrokenEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.identity.streak.broken';

  constructor(
    aggregateId: string,
    readonly attrs: StreakBrokenAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attrs, eventId, occurredOn);
  }

  eventName(): string {
    return StreakBrokenEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): StreakBrokenEvent {
    return new StreakBrokenEvent(
      aggregateId,
      attributes as StreakBrokenAttributes,
      eventId,
      occurredOn,
    );
  }
}
