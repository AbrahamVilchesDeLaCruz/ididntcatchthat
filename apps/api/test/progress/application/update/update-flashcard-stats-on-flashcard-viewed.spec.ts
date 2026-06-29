import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type FlashcardStatsUpdater } from '@/progress/application/update/flashcard-stats-updater';
import { FlashcardStatsUpdaterOnFlashcardViewed } from '@/progress/application/update/update-flashcard-stats-on-flashcard-viewed';
import { FlashcardViewedEvent } from '@/gaming/domain/events/flashcard-viewed.event';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ProgressFlashcardIdMother } from '@test/progress/domain/progress-flashcard-id-mother';

describe('progress/application/update FlashcardStatsUpdaterOnFlashcardViewed', () => {
  const consumer = mock<DomainEventConsumer>();
  const updater = mock<FlashcardStatsUpdater>();
  let subscriber: FlashcardStatsUpdaterOnFlashcardViewed;

  const makeEvent = (overrides?: {
    userId?: string | null;
  }): FlashcardViewedEvent => {
    return new FlashcardViewedEvent('game-id', {
      gameId: 'game-id',
      userId:
        overrides?.userId !== undefined
          ? overrides.userId
          : ProgressUserIdMother.random().value,
      flashcardId: ProgressFlashcardIdMother.random().value,
      mode: 'study',
      viewedAt: new Date().toISOString(),
    });
  };

  beforeEach(() => {
    updater.execute.mockReset();
    updater.execute.mockResolvedValue(undefined);
    subscriber = new FlashcardStatsUpdaterOnFlashcardViewed(consumer, updater);
  });

  it('should skip when userId is null (guest)', async () => {
    await subscriber.on(makeEvent({ userId: null }));

    expect(updater.execute).not.toHaveBeenCalled();
  });

  it('should delegate to use case with study mode and recordStudy semantics', async () => {
    const userId = ProgressUserIdMother.random().value;
    const flashcardId = ProgressFlashcardIdMother.random().value;
    const event = new FlashcardViewedEvent('game-id', {
      gameId: 'game-id',
      userId,
      flashcardId,
      mode: 'study',
      viewedAt: new Date().toISOString(),
    });

    await subscriber.on(event);

    expect(updater.execute).toHaveBeenCalledWith({
      userId,
      flashcardId,
      correct: false,
      mode: 'study',
    });
  });

  it('should subscribe to FlashcardViewedEvent', () => {
    expect(subscriber.eventName).toBe(
      'ididntcatchthat.gaming.views.flashcard.viewed',
    );
  });
});
