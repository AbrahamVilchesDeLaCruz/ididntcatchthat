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
import { StreakUpdater } from '@/identity/user/application/update-streak/streak-updater';

@Injectable()
export class StreakUpdaterOnGameCompleted extends Subscriber {
  readonly queueName = 'identity.update_streak_on_game_completed';
  readonly eventName = 'ididntcatchthat.gaming.games.game.completed';
  readonly exchangeName = 'ididntcatchthat.gaming.games.game.completed';
  readonly domainEvent = GameCompletedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(StreakUpdater) private readonly updater: StreakUpdater,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as GameCompletedAttributes;
    if (attrs.userId === null) return;

    await this.updater.execute({
      userId: attrs.userId,
      activityDate: attrs.finishedAt,
    });
  }
}
