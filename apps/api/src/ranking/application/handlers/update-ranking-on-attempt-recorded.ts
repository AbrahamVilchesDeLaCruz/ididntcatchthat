import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import {
  AttemptRecordedEvent,
  type AttemptRecordedAttributes,
} from '@/gaming/domain/events/attempt-recorded.event';
import { RankingUpdater } from '@/ranking/application/update/ranking-updater';

@Injectable()
export class UpdateRankingOnAttemptRecorded extends Subscriber {
  readonly queueName = 'ranking.update_ranking_on_attempt_recorded';
  readonly eventName = 'ididntcatchthat.gaming.attempts.attempt.recorded';
  readonly exchangeName = 'ididntcatchthat.gaming.attempts.attempt.recorded';
  readonly domainEvent = AttemptRecordedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(RankingUpdater)
    private readonly updater: RankingUpdater,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as AttemptRecordedAttributes;
    if (attrs.userId === null) return;

    await this.updater.recordAttempt(
      attrs.userId,
      attrs.mode,
      attrs.correct,
      attrs.answeredAt,
    );
  }
}
