import { Inject, Injectable } from '@nestjs/common';
import { Handler } from '@/shared/application/handler';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { GuestProgressMigratedEvent } from '@/identity/user/domain/events/guest-progress-migrated.event';
import {
  type UserFlashcardStatsRepository,
  USER_FLASHCARD_STATS_REPOSITORY,
} from '@/progress/domain/user-flashcard-stats.repository';
import {
  type ProcessedEventsRepository,
  PROCESSED_EVENTS_REPOSITORY,
} from '@/shared/domain/processed-events.repository';
import {
  type GuestAttemptRepository,
  GUEST_ATTEMPT_REPOSITORY,
} from '@/progress/domain/guest-attempt.repository';
import { UserFlashcardStats } from '@/progress/domain/user-flashcard-stats';
import { UserId } from '@/shared/domain/user-id';
import { FlashcardId } from '@/shared/domain/flashcard-id';

const HANDLER_NAME = 'ImportGuestProgressOnGuestProgressMigrated';

@Injectable()
export class ImportGuestProgressOnGuestProgressMigrated extends Handler {
  readonly queueName =
    'progress.import_guest_progress_on_guest_progress_migrated';
  readonly eventName = GuestProgressMigratedEvent.EVENT_NAME;
  readonly exchangeName = GuestProgressMigratedEvent.EVENT_NAME;
  readonly domainEvent = GuestProgressMigratedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(USER_FLASHCARD_STATS_REPOSITORY)
    private readonly statsRepository: UserFlashcardStatsRepository,
    @Inject(PROCESSED_EVENTS_REPOSITORY)
    private readonly processedRepository: ProcessedEventsRepository,
    @Inject(GUEST_ATTEMPT_REPOSITORY)
    private readonly guestAttemptRepository: GuestAttemptRepository,
  ) {
    super(consumer);
  }

  async handle(event: DomainEvent): Promise<void> {
    const alreadyProcessed = await this.processedRepository.exists(
      event.eventId,
      HANDLER_NAME,
    );
    if (alreadyProcessed) return;

    const attrs = event.attributes as {
      userId: string;
      guestDeviceId: string;
    };

    const userId = new UserId(attrs.userId);
    const attempts = await this.guestAttemptRepository.findByDeviceId(
      attrs.guestDeviceId,
    );

    for (const attempt of attempts) {
      const flashcardId = new FlashcardId(attempt.flashcardId);
      let stats = await this.statsRepository.search(userId, flashcardId);
      stats ??= UserFlashcardStats.create(userId, flashcardId);

      if (attempt.mode === 'study') {
        stats.recordStudy(attempt.correct);
      } else {
        stats.recordPlay(attempt.correct);
      }

      await this.statsRepository.save(stats);
    }

    await this.processedRepository.save(event.eventId, HANDLER_NAME);
  }
}
