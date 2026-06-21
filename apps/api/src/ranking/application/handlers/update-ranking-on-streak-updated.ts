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
import { RankingUpdater } from '@/ranking/application/update/ranking-updater';

@Injectable()
export class UpdateRankingOnStreakUpdated extends Subscriber {
  readonly queueName = 'ranking.update_ranking_on_streak_updated';
  readonly eventName = StreakUpdatedEvent.EVENT_NAME;
  readonly exchangeName = StreakUpdatedEvent.EVENT_NAME;
  readonly domainEvent = StreakUpdatedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(RankingUpdater)
    private readonly updater: RankingUpdater,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as StreakUpdatedAttributes;
    await this.updater.recordStreakUpdated(attrs.userId, attrs.newStreak);
  }
}
