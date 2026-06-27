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
import { AchievementGameCompletedEvaluator } from '@/achievement/application/unlock/achievement-game-completed-evaluator';

@Injectable()
export class UnlockAchievementOnGameCompleted extends Subscriber {
  readonly queueName = 'achievement.unlock_achievement_on_game_completed';
  readonly eventName = 'ididntcatchthat.gaming.games.game.completed';
  readonly exchangeName = 'ididntcatchthat.gaming.games.game.completed';
  readonly domainEvent = GameCompletedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly evaluator: AchievementGameCompletedEvaluator,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as GameCompletedAttributes;
    await this.evaluator.evaluate(attrs);
  }
}
