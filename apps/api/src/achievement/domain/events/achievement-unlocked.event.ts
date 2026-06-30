import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';
import { type AchievementCategory } from '@/achievement/domain/achievement-catalog';

export interface AchievementUnlockedAttributes extends DomainEventAttributes {
  userId: string;
  achievementKey: string;
  category: AchievementCategory;
  unlockedAt: string;
}

export class AchievementUnlockedEvent extends DomainEvent {
  static readonly EVENT_NAME =
    'ididntcatchthat.achievement.user_achievement.unlocked';

  constructor(
    aggregateId: string,
    readonly attrs: AchievementUnlockedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attrs, eventId, occurredOn);
  }

  eventName(): string {
    return AchievementUnlockedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    attrs: AchievementUnlockedAttributes,
    eventId: string,
    occurredOn: Date,
  ): AchievementUnlockedEvent {
    return new AchievementUnlockedEvent(
      aggregateId,
      attrs,
      eventId,
      occurredOn,
    );
  }
}
