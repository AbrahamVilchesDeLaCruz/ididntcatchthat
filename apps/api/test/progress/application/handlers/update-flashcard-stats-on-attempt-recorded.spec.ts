import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type UserFlashcardStatsRepository } from '@/progress/domain/user-flashcard-stats.repository';
import { UpdateFlashcardStatsOnAttemptRecorded } from '@/progress/application/handlers/update-flashcard-stats-on-attempt-recorded';
import { AttemptRecordedEvent } from '@/gaming/domain/events/attempt-recorded.event';
import { UserFlashcardStatsMother } from '@test/progress/domain/user-flashcard-stats-mother';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ProgressFlashcardIdMother } from '@test/progress/domain/progress-flashcard-id-mother';

describe('progress/application/handlers UpdateFlashcardStatsOnAttemptRecorded', () => {
  const consumer = mock<DomainEventConsumer>();
  const repository = mock<UserFlashcardStatsRepository>();
  let handler: UpdateFlashcardStatsOnAttemptRecorded;

  const makeEvent = (overrides?: {
    userId?: string | null;
    mode?: string;
    correct?: boolean;
  }): AttemptRecordedEvent => {
    return new AttemptRecordedEvent('game-id', {
      gameId: 'game-id',
      userId:
        overrides?.userId !== undefined
          ? overrides.userId
          : ProgressUserIdMother.random().value,
      flashcardId: ProgressFlashcardIdMother.random().value,
      correct: overrides?.correct ?? true,
      mode: overrides?.mode ?? 'game',
      answeredAt: new Date().toISOString(),
    });
  };

  beforeEach(() => {
    repository.search.mockReset();
    repository.save.mockReset();
    repository.save.mockResolvedValue(undefined);
    handler = new UpdateFlashcardStatsOnAttemptRecorded(consumer, repository);
  });

  it('should skip when userId is null (guest)', async () => {
    await handler.handle(makeEvent({ userId: null }));

    expect(repository.search).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should create and save new stats when none exist', async () => {
    repository.search.mockResolvedValue(null);

    await handler.handle(makeEvent({ mode: 'game', correct: true }));

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.timesPlayed).toBe(1);
    expect(saved.correctCount).toBe(1);
  });

  it('should update existing stats when found', async () => {
    const existing = UserFlashcardStatsMother.withAccuracy(0.5);
    const previousTimesPlayed = existing.timesPlayed;
    repository.search.mockResolvedValue(existing);

    await handler.handle(makeEvent({ mode: 'game', correct: false }));

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.timesPlayed).toBe(previousTimesPlayed + 1);
  });

  it('should call recordStudy when mode is study', async () => {
    repository.search.mockResolvedValue(null);

    await handler.handle(makeEvent({ mode: 'study', correct: true }));

    const saved = repository.save.mock.calls[0][0];
    expect(saved.timesStudied).toBe(1);
    expect(saved.timesPlayed).toBe(0);
  });
});
