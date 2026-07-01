import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';
import { type AchievementCategoryValue } from '@/achievement/shared/domain/achievement-category';

export interface AchievementUnlockedAttributes extends DomainEventAttributes {
  userId: string;
  achievementKey: string;
  category: AchievementCategoryValue;
  unlockedAt: string;
}

export class AchievementUnlockedEvent extends DomainEvent {
  static readonly EVENT_NAME =
    'ididntcatchthat.achievement.user_achievement.unlocked';

  constructor(
    aggregateId: string,
    attributes: AchievementUnlockedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return AchievementUnlockedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    attributes: AchievementUnlockedAttributes,
    eventId: string,
    occurredOn: Date,
  ): AchievementUnlockedEvent {
    return new AchievementUnlockedEvent(
      aggregateId,
      attributes,
      eventId,
      occurredOn,
    );
  }
}
