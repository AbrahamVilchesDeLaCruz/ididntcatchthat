import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type FlashcardStatsUpdater } from '@/progress/application/update/flashcard-stats-updater';
import { type RandomModuleProgressUpdater } from '@/progress/application/update/random-module-progress-updater';
import { FlashcardStatsUpdaterOnAttemptRecorded } from '@/progress/application/update/update-flashcard-stats-on-attempt-recorded';
import { AttemptRecordedEvent } from '@/gaming/domain/events/attempt-recorded.event';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ProgressFlashcardIdMother } from '@test/progress/domain/progress-flashcard-id-mother';

describe('progress/application/update FlashcardStatsUpdaterOnAttemptRecorded', () => {
  const consumer = mock<DomainEventConsumer>();
  const flashcardStatsUpdater = mock<FlashcardStatsUpdater>();
  const randomModuleProgressUpdater = mock<RandomModuleProgressUpdater>();
  let subscriber: FlashcardStatsUpdaterOnAttemptRecorded;

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
    flashcardStatsUpdater.execute.mockReset();
    randomModuleProgressUpdater.executeForRandomAttempt.mockReset();
    flashcardStatsUpdater.execute.mockResolvedValue(undefined);
    randomModuleProgressUpdater.executeForRandomAttempt.mockResolvedValue(
      undefined,
    );
    subscriber = new FlashcardStatsUpdaterOnAttemptRecorded(
      consumer,
      flashcardStatsUpdater,
      randomModuleProgressUpdater,
    );
  });

  it('should skip when userId is null (guest)', async () => {
    await subscriber.on(makeEvent({ userId: null }));

    expect(flashcardStatsUpdater.execute).not.toHaveBeenCalled();
    expect(
      randomModuleProgressUpdater.executeForRandomAttempt,
    ).not.toHaveBeenCalled();
  });

  it('should delegate to use case with event attributes', async () => {
    const userId = ProgressUserIdMother.random().value;
    const flashcardId = ProgressFlashcardIdMother.random().value;
    const event = new AttemptRecordedEvent('game-id', {
      gameId: 'game-id',
      userId,
      flashcardId,
      correct: true,
      mode: 'game',
      answeredAt: new Date().toISOString(),
    });

    await subscriber.on(event);

    expect(flashcardStatsUpdater.execute).toHaveBeenCalledWith({
      userId,
      flashcardId,
      correct: true,
      mode: 'game',
    });
    expect(
      randomModuleProgressUpdater.executeForRandomAttempt,
    ).toHaveBeenCalledWith({
      userId,
      gameId: 'game-id',
      flashcardId,
    });
  });

  it('should not update random module progress for study attempts', async () => {
    const userId = ProgressUserIdMother.random().value;

    await subscriber.on(makeEvent({ userId, mode: 'study' }));

    expect(flashcardStatsUpdater.execute).toHaveBeenCalled();
    expect(
      randomModuleProgressUpdater.executeForRandomAttempt,
    ).not.toHaveBeenCalled();
  });

  it('should subscribe to AttemptRecordedEvent', () => {
    expect(subscriber.eventName).toBe(
      'ididntcatchthat.gaming.attempts.attempt.recorded',
    );
  });
});
