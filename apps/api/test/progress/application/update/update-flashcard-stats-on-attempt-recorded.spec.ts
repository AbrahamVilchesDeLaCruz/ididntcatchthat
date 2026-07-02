import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type FlashcardStatsUpdater } from '@/progress/application/update/flashcard-stats-updater';
import { type RandomModuleProgressUpdater } from '@/progress/application/update/random-module-progress-updater';
import { FlashcardStatsUpdaterOnAttemptRecorded } from '@/progress/application/update/update-flashcard-stats-on-attempt-recorded';
import { AttemptRecordedEvent } from '@/gaming/domain/events/attempt-recorded.event';
import { AttemptRecordedEventMother } from '@test/gaming/domain/attempt-recorded-event-mother';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ProgressFlashcardIdMother } from '@test/progress/domain/progress-flashcard-id-mother';
import { GameModeMother } from '@test/gaming/domain/game-mode-mother';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';

describe('progress/application/update FlashcardStatsUpdaterOnAttemptRecorded', () => {
  const consumer = mock<DomainEventConsumer>();
  const flashcardStatsUpdater = mock<FlashcardStatsUpdater>();
  const randomModuleProgressUpdater = mock<RandomModuleProgressUpdater>();
  let subscriber: FlashcardStatsUpdaterOnAttemptRecorded;

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
    await subscriber.on(AttemptRecordedEventMother.guest());

    expect(flashcardStatsUpdater.execute).not.toHaveBeenCalled();
    expect(
      randomModuleProgressUpdater.executeForRandomAttempt,
    ).not.toHaveBeenCalled();
  });

  it('should delegate to use case with event attributes', async () => {
    const userId = ProgressUserIdMother.random().value;
    const flashcardId = ProgressFlashcardIdMother.random().value;
    const gameId = GameIdMother.random().value;
    const event = AttemptRecordedEventMother.random({
      userId,
      flashcardId,
      gameId,
      correct: true,
      mode: GameModeMother.game().value,
    });

    await subscriber.on(event);

    expect(flashcardStatsUpdater.execute).toHaveBeenCalledWith({
      userId,
      flashcardId,
      correct: true,
      mode: GameModeMother.game().value,
    });
    expect(
      randomModuleProgressUpdater.executeForRandomAttempt,
    ).toHaveBeenCalledWith({
      userId,
      gameId,
      flashcardId,
    });
  });

  it('should not update random module progress for study attempts', async () => {
    const userId = ProgressUserIdMother.random().value;

    await subscriber.on(
      AttemptRecordedEventMother.random({
        userId,
        mode: GameModeMother.study().value,
      }),
    );

    expect(flashcardStatsUpdater.execute).toHaveBeenCalled();
    expect(
      randomModuleProgressUpdater.executeForRandomAttempt,
    ).not.toHaveBeenCalled();
  });

  it('should subscribe to AttemptRecordedEvent', () => {
    expect(subscriber.eventName).toBe(AttemptRecordedEvent.EVENT_NAME);
  });
});
