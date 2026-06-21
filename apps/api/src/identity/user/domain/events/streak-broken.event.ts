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
  static readonly EVENT_NAME = 'idct.identity.streaks.streak.broken';

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
}
