import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import {
  RankingProfileUpdatedEvent,
  type RankingProfileUpdatedAttributes,
} from '@/identity/user/domain/events/ranking-profile-updated.event';
import { SyncRankingProfile } from '@/ranking/projection/application/update/sync-ranking-profile';

@Injectable()
export class RankingUpdaterOnRankingProfileUpdated extends Subscriber {
  readonly queueName = 'ranking.update_ranking_on_ranking_profile_updated';
  readonly eventName = RankingProfileUpdatedEvent.EVENT_NAME;
  readonly exchangeName = RankingProfileUpdatedEvent.EVENT_NAME;
  readonly domainEvent = RankingProfileUpdatedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly syncer: SyncRankingProfile,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as RankingProfileUpdatedAttributes;
    await this.syncer.execute({
      userId: attrs.userId,
      showInRanking: attrs.showInRanking,
      nickname: attrs.nickname,
    });
  }
}
