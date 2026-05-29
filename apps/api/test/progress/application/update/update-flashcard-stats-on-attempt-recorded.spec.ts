import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type UpdateFlashcardStats } from '@/progress/application/update/update-flashcard-stats';
import { UpdateFlashcardStatsOnAttemptRecorded } from '@/progress/application/update/update-flashcard-stats-on-attempt-recorded';
import { AttemptRecordedEvent } from '@/gaming/domain/events/attempt-recorded.event';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ProgressFlashcardIdMother } from '@test/progress/domain/progress-flashcard-id-mother';

describe('progress/application/update UpdateFlashcardStatsOnAttemptRecorded', () => {
  const consumer = mock<DomainEventConsumer>();
  const useCase = mock<UpdateFlashcardStats>();
  let subscriber: UpdateFlashcardStatsOnAttemptRecorded;

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
    useCase.execute.mockReset();
    useCase.execute.mockResolvedValue(undefined);
    subscriber = new UpdateFlashcardStatsOnAttemptRecorded(consumer, useCase);
  });

  it('should skip when userId is null (guest)', async () => {
    await subscriber.on(makeEvent({ userId: null }));

    expect(useCase.execute).not.toHaveBeenCalled();
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

    expect(useCase.execute).toHaveBeenCalledWith({
      userId,
      flashcardId,
      correct: true,
      mode: 'game',
    });
  });

  it('should subscribe to AttemptRecordedEvent', () => {
    expect(subscriber.eventName).toBe(
      'ididntcatchthat.gaming.attempts.attempt.recorded',
    );
  });
});
