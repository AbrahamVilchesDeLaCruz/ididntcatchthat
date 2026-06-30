import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import {
  GameCompletedEvent,
  type GameCompletedAttributes,
} from '@/gaming/domain/events/game-completed.event';
import { AchievementProgressUpdater } from '@/achievement/progress/application/update/achievement-progress-updater';
import { GameCompletedAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/game-completed-achievement-unlocker';
import { StudyCompletedAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/study-completed-achievement-unlocker';

@Injectable()
export class UnlockUserAchievementOnGameCompleted extends Subscriber {
  readonly queueName = 'achievement.unlock_achievement_on_game_completed';
  readonly eventName = GameCompletedEvent.EVENT_NAME;
  readonly exchangeName = GameCompletedEvent.EVENT_NAME;
  readonly domainEvent = GameCompletedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly progressUpdater: AchievementProgressUpdater,
    private readonly gameUnlocker: GameCompletedAchievementUnlocker,
    private readonly studyUnlocker: StudyCompletedAchievementUnlocker,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as GameCompletedAttributes;
    if (attrs.userId === null) return;

    const progress = await this.progressUpdater.applyGameCompleted(attrs);

    if (attrs.mode === 'study') {
      await this.studyUnlocker.execute(attrs, progress);
      return;
    }

    if (attrs.mode === 'game') {
      await this.gameUnlocker.execute(attrs, progress);
    }
  }
}
