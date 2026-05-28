import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type UserFlashcardStatsRepository } from '@/progress/domain/user-flashcard-stats.repository';
import { type ProcessedEventsRepository } from '@/shared/domain/processed-events.repository';
import { type GuestAttemptRepository } from '@/progress/domain/guest-attempt.repository';
import { ImportGuestProgressOnGuestProgressMigrated } from '@/progress/application/handlers/import-guest-progress-on-guest-progress-migrated';
import { GuestProgressMigratedEvent } from '@/identity/user/domain/events/guest-progress-migrated.event';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ProgressFlashcardIdMother } from '@test/progress/domain/progress-flashcard-id-mother';
import { UserFlashcardStatsMother } from '@test/progress/domain/user-flashcard-stats-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('progress/application/handlers ImportGuestProgressOnGuestProgressMigrated', () => {
  const consumer = mock<DomainEventConsumer>();
  const statsRepository = mock<UserFlashcardStatsRepository>();
  const processedRepository = mock<ProcessedEventsRepository>();
  const guestAttemptRepository = mock<GuestAttemptRepository>();
  let handler: ImportGuestProgressOnGuestProgressMigrated;

  const makeEvent = (
    eventId = UuidMother.random(),
  ): GuestProgressMigratedEvent => {
    return new GuestProgressMigratedEvent(
      ProgressUserIdMother.random().value,
      {
        userId: ProgressUserIdMother.random().value,
        deviceId: UuidMother.random(),
        guestDeviceId: UuidMother.random(),
      },
      eventId,
    );
  };

  beforeEach(() => {
    statsRepository.search.mockReset();
    statsRepository.save.mockReset();
    processedRepository.exists.mockReset();
    processedRepository.save.mockReset();
    guestAttemptRepository.findByDeviceId.mockReset();
    statsRepository.save.mockResolvedValue(undefined);
    processedRepository.save.mockResolvedValue(undefined);
    handler = new ImportGuestProgressOnGuestProgressMigrated(
      consumer,
      statsRepository,
      processedRepository,
      guestAttemptRepository,
    );
  });

  it('should skip when event was already processed (idempotency)', async () => {
    processedRepository.exists.mockResolvedValue(true);

    await handler.handle(makeEvent());

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

    await handler.handle(makeEvent());

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

    await handler.handle(makeEvent());

    const saved = statsRepository.save.mock.calls[0][0];
    expect(saved.timesPlayed).toBeGreaterThan(previousTimesPlayed);
  });
});
