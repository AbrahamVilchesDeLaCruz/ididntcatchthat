import { type RequestGuestProgressImporter } from '@/progress/application/import/guest-progress-importer';
import { mock } from 'jest-mock-extended';
import { type Logger } from '@/shared/domain/logger';
import { type UserFlashcardStatsRepository } from '@/progress/domain/user-flashcard-stats.repository';
import { type ProcessedEventsRepository } from '@/shared/domain/processed-events.repository';
import { type GuestAttemptRepository } from '@/progress/domain/guest-attempt.repository';
import { GuestProgressImporter } from '@/progress/application/import/guest-progress-importer';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ProgressFlashcardIdMother } from '@test/progress/domain/progress-flashcard-id-mother';
import { UserFlashcardStatsMother } from '@test/progress/domain/user-flashcard-stats-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('progress/application/import GuestProgressImporter', () => {
  const statsRepository = mock<UserFlashcardStatsRepository>();
  const processedRepository = mock<ProcessedEventsRepository>();
  const guestAttemptRepository = mock<GuestAttemptRepository>();
  const logger = mock<Logger>();
  let importer: GuestProgressImporter;

  const makeRequest = (
    eventId = UuidMother.random(),
  ): RequestGuestProgressImporter => ({
    eventId,
    userId: ProgressUserIdMother.random().value,
    guestDeviceId: UuidMother.random(),
    gameIds: [UuidMother.random()],
  });

  beforeEach(() => {
    statsRepository.search.mockReset();
    statsRepository.save.mockReset();
    processedRepository.exists.mockReset();
    processedRepository.save.mockReset();
    guestAttemptRepository.findByGameIds.mockReset();
    statsRepository.save.mockResolvedValue(undefined);
    processedRepository.save.mockResolvedValue(undefined);
    importer = new GuestProgressImporter(
      statsRepository,
      processedRepository,
      guestAttemptRepository,
      logger,
    );
  });

  it('should skip when event was already processed (idempotency)', async () => {
    processedRepository.exists.mockResolvedValue(true);

    await importer.execute(makeRequest());

    expect(guestAttemptRepository.findByGameIds).not.toHaveBeenCalled();
    expect(statsRepository.save).not.toHaveBeenCalled();
  });

  it('should import attempts and mark event as processed on first run', async () => {
    const flashcardId = ProgressFlashcardIdMother.random().value;
    processedRepository.exists.mockResolvedValue(false);
    guestAttemptRepository.findByGameIds.mockResolvedValue([
      {
        flashcardId,
        correct: true,
        mode: 'game',
        answeredAt: new Date().toISOString(),
      },
      {
        flashcardId,
        correct: false,
        mode: 'study',
        answeredAt: new Date().toISOString(),
      },
    ]);
    statsRepository.search.mockResolvedValue(null);

    await importer.execute(makeRequest());

    expect(statsRepository.save).toHaveBeenCalledTimes(2);
    expect(processedRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should update existing stats if found for the same flashcard', async () => {
    const flashcardId = ProgressFlashcardIdMother.random().value;
    processedRepository.exists.mockResolvedValue(false);
    guestAttemptRepository.findByGameIds.mockResolvedValue([
      {
        flashcardId,
        correct: true,
        mode: 'game',
        answeredAt: new Date().toISOString(),
      },
    ]);
    const existing = UserFlashcardStatsMother.withAccuracy(0.5);
    const previousTimesPlayed = existing.timesPlayed;
    statsRepository.search.mockResolvedValue(existing);

    await importer.execute(makeRequest());

    const saved = statsRepository.save.mock.calls[0][0];
    expect(saved.timesPlayed).toBeGreaterThan(previousTimesPlayed);
  });
});
