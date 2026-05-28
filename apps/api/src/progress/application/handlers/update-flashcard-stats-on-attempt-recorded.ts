import { Inject, Injectable } from '@nestjs/common';
import { Handler } from '@/shared/application/handler';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import {
  AttemptRecordedEvent,
  type AttemptRecordedAttributes,
} from '@/gaming/domain/events/attempt-recorded.event';
import {
  type UserFlashcardStatsRepository,
  USER_FLASHCARD_STATS_REPOSITORY,
} from '@/progress/domain/user-flashcard-stats.repository';
import { UserFlashcardStats } from '@/progress/domain/user-flashcard-stats';
import { UserId } from '@/shared/domain/user-id';
import { FlashcardId } from '@/shared/domain/flashcard-id';

@Injectable()
export class UpdateFlashcardStatsOnAttemptRecorded extends Handler {
  readonly queueName = 'progress.update_flashcard_stats_on_attempt_recorded';
  readonly eventName = 'ididntcatchthat.gaming.attempts.attempt.recorded';
  readonly exchangeName = 'ididntcatchthat.gaming.attempts.attempt.recorded';
  readonly domainEvent = AttemptRecordedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(USER_FLASHCARD_STATS_REPOSITORY)
    private readonly repository: UserFlashcardStatsRepository,
  ) {
    super(consumer);
  }

  async handle(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as AttemptRecordedAttributes;

    if (attrs.userId === null) return;

    const userId = new UserId(attrs.userId);
    const flashcardId = new FlashcardId(attrs.flashcardId);

    let stats = await this.repository.search(userId, flashcardId);
    stats ??= UserFlashcardStats.create(userId, flashcardId);

    if (attrs.mode === 'study') {
      stats.recordStudy(attrs.correct);
    } else {
      stats.recordPlay(attrs.correct);
    }

    await this.repository.save(stats);
  }
}
