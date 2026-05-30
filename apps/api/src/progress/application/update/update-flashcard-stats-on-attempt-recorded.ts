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
import { FlashcardStatsUpdater } from './flashcard-stats-updater';

@Injectable()
export class FlashcardStatsUpdaterOnAttemptRecorded extends Subscriber {
  readonly queueName = 'progress.update_flashcard_stats_on_attempt_recorded';
  readonly eventName = 'ididntcatchthat.gaming.attempts.attempt.recorded';
  readonly exchangeName = 'ididntcatchthat.gaming.attempts.attempt.recorded';
  readonly domainEvent = AttemptRecordedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(FlashcardStatsUpdater)
    private readonly updater: FlashcardStatsUpdater,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as AttemptRecordedAttributes;
    if (attrs.userId === null) return;
    await this.updater.execute({
      userId: attrs.userId,
      flashcardId: attrs.flashcardId,
      correct: attrs.correct,
      mode: attrs.mode,
    });
  }
}
