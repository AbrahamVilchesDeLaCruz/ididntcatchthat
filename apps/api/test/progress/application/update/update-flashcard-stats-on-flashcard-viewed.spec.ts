import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type FlashcardStatsUpdater } from '@/progress/application/update/flashcard-stats-updater';
import { FlashcardStatsUpdaterOnFlashcardViewed } from '@/progress/application/update/update-flashcard-stats-on-flashcard-viewed';
import { FlashcardViewedEvent } from '@/gaming/domain/events/flashcard-viewed.event';
import { FlashcardViewedEventMother } from '@test/gaming/domain/flashcard-viewed-event-mother';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ProgressFlashcardIdMother } from '@test/progress/domain/progress-flashcard-id-mother';
import { GameModeMother } from '@test/gaming/domain/game-mode-mother';

describe('progress/application/update FlashcardStatsUpdaterOnFlashcardViewed', () => {
  const consumer = mock<DomainEventConsumer>();
  const updater = mock<FlashcardStatsUpdater>();
  let subscriber: FlashcardStatsUpdaterOnFlashcardViewed;

  beforeEach(() => {
    updater.execute.mockReset();
    updater.execute.mockResolvedValue(undefined);
    subscriber = new FlashcardStatsUpdaterOnFlashcardViewed(consumer, updater);
  });

  it('should skip when userId is null (guest)', async () => {
    await subscriber.on(FlashcardViewedEventMother.guest());

    expect(updater.execute).not.toHaveBeenCalled();
  });

  it('should delegate to use case with study mode and recordStudy semantics', async () => {
    const userId = ProgressUserIdMother.random().value;
    const flashcardId = ProgressFlashcardIdMother.random().value;
    const event = FlashcardViewedEventMother.random({ userId, flashcardId });

    await subscriber.on(event);

    expect(updater.execute).toHaveBeenCalledWith({
      userId,
      flashcardId,
      correct: false,
      mode: GameModeMother.study().value,
    });
  });

  it('should subscribe to FlashcardViewedEvent', () => {
    expect(subscriber.eventName).toBe(FlashcardViewedEvent.EVENT_NAME);
  });
});
