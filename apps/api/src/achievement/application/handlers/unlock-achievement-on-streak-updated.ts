import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import {
  StreakUpdatedEvent,
  type StreakUpdatedAttributes,
} from '@/identity/user/domain/events/streak-updated.event';
import { AchievementUnlocker } from '@/achievement/application/unlock/achievement-unlocker';

@Injectable()
export class UnlockAchievementOnStreakUpdated extends Subscriber {
  readonly queueName = 'achievement.unlock_achievement_on_streak_updated';
  readonly eventName = StreakUpdatedEvent.EVENT_NAME;
  readonly exchangeName = StreakUpdatedEvent.EVENT_NAME;
  readonly domainEvent = StreakUpdatedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly unlocker: AchievementUnlocker,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as StreakUpdatedAttributes;
    if (attrs.newStreak >= 7) {
      await this.unlocker.unlock(attrs.userId, 'streak_7');
    }
    if (attrs.newStreak >= 30) {
      await this.unlocker.unlock(attrs.userId, 'streak_30');
    }
  }
}
