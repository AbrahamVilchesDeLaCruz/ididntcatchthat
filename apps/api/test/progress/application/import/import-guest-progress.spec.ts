import { type RequestImportGuestProgress } from '@/progress/application/import/import-guest-progress';
import { mock } from 'jest-mock-extended';
import { type UserFlashcardStatsRepository } from '@/progress/domain/user-flashcard-stats.repository';
import { type ProcessedEventsRepository } from '@/shared/domain/processed-events.repository';
import { type GuestAttemptRepository } from '@/progress/domain/guest-attempt.repository';
import { ImportGuestProgress } from '@/progress/application/import/import-guest-progress';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ProgressFlashcardIdMother } from '@test/progress/domain/progress-flashcard-id-mother';
import { UserFlashcardStatsMother } from '@test/progress/domain/user-flashcard-stats-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('progress/application/import ImportGuestProgress', () => {
  const statsRepository = mock<UserFlashcardStatsRepository>();
  const processedRepository = mock<ProcessedEventsRepository>();
  const guestAttemptRepository = mock<GuestAttemptRepository>();
  let useCase: ImportGuestProgress;

  const makeRequest = (
    eventId = UuidMother.random(),
  ): RequestImportGuestProgress => ({
    eventId,
    userId: ProgressUserIdMother.random().value,
    guestDeviceId: UuidMother.random(),
  });

  beforeEach(() => {
    statsRepository.search.mockReset();
    statsRepository.save.mockReset();
    processedRepository.exists.mockReset();
    processedRepository.save.mockReset();
    guestAttemptRepository.findByDeviceId.mockReset();
    statsRepository.save.mockResolvedValue(undefined);
    processedRepository.save.mockResolvedValue(undefined);
    useCase = new ImportGuestProgress(
      statsRepository,
      processedRepository,
      guestAttemptRepository,
    );
  });

  it('should skip when event was already processed (idempotency)', async () => {
    processedRepository.exists.mockResolvedValue(true);

    await useCase.execute(makeRequest());

    expect(guestAttemptRepository.findByDeviceId).not.toHaveBeenCalled();
    expect(statsRepository.save).not.toHaveBeenCalled();
  });

  it('should import attempts and mark event as processed on first run', async () => {
    const flashcardId = ProgressFlashcardIdMother.random().value;
    processedRepository.exists.mockResolvedValue(false);
    guestAttemptRepository.findByDeviceId.mockResolvedValue([
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

    await useCase.execute(makeRequest());

    expect(statsRepository.save).toHaveBeenCalledTimes(2);
    expect(processedRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should update existing stats if found for the same flashcard', async () => {
    const flashcardId = ProgressFlashcardIdMother.random().value;
    processedRepository.exists.mockResolvedValue(false);
    guestAttemptRepository.findByDeviceId.mockResolvedValue([
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

    await useCase.execute(makeRequest());

    const saved = statsRepository.save.mock.calls[0][0];
    expect(saved.timesPlayed).toBeGreaterThan(previousTimesPlayed);
  });
});
