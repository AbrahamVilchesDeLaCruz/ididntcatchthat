import { Inject, Injectable } from '@nestjs/common';
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
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { UserId } from '@/shared/domain/user-id';
import { FlashcardId } from '@/shared/domain/flashcard-id';
import { type RequestGuestProgressImporter } from './request-import-guest-progress';

export type { RequestGuestProgressImporter };

const USE_CASE_NAME = 'GuestProgressImporter';

@Injectable()
export class GuestProgressImporter {
  constructor(
    @Inject(USER_FLASHCARD_STATS_REPOSITORY)
    private readonly statsRepository: UserFlashcardStatsRepository,
    @Inject(PROCESSED_EVENTS_REPOSITORY)
    private readonly processedRepository: ProcessedEventsRepository,
    @Inject(GUEST_ATTEMPT_REPOSITORY)
    private readonly guestAttemptRepository: GuestAttemptRepository,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute({
    eventId,
    userId,
    guestDeviceId,
  }: RequestGuestProgressImporter): Promise<void> {
    const alreadyProcessed = await this.processedRepository.exists(
      eventId,
      USE_CASE_NAME,
    );
    if (alreadyProcessed) return;

    const uid = new UserId(userId);
    const attempts =
      await this.guestAttemptRepository.findByDeviceId(guestDeviceId);

    for (const attempt of attempts) {
      const fid = new FlashcardId(attempt.flashcardId);
      let stats = await this.statsRepository.search(uid, fid);
      stats ??= UserFlashcardStats.create(uid, fid);

      if (attempt.mode === 'study') {
        stats.recordStudy(attempt.correct);
      } else {
        stats.recordPlay(attempt.correct);
      }

      await this.statsRepository.save(stats);
    }

    await this.processedRepository.save(eventId, USE_CASE_NAME);

    this.logger.info('Guest progress imported', {
      userId,
      guestDeviceId,
      attemptsCount: attempts.length,
    });
  }
}
