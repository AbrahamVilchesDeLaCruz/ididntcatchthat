import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type AchievementProgressUpdater } from '@/achievement/progress/application/update/achievement-progress-updater';
import { UpdateAchievementProgressOnFlashcardViewed } from '@/achievement/progress/application/update/update-achievement-progress-on-flashcard-viewed';
import { FlashcardViewedEvent } from '@/gaming/domain/events/flashcard-viewed.event';
import { FlashcardViewedEventMother } from '@test/gaming/domain/flashcard-viewed-event-mother';

describe('achievement/progress/application/update UpdateAchievementProgressOnFlashcardViewed', () => {
  const consumer = mock<DomainEventConsumer>();
  const progressUpdater = mock<AchievementProgressUpdater>();
  let handler: UpdateAchievementProgressOnFlashcardViewed;

  beforeEach(() => {
    progressUpdater.applyFlashcardViewed.mockReset();
    progressUpdater.applyFlashcardViewed.mockResolvedValue(null);
    handler = new UpdateAchievementProgressOnFlashcardViewed(
      consumer,
      progressUpdater,
    );
  });

  it('should delegate to AchievementProgressUpdater', async () => {
    const event = FlashcardViewedEventMother.random();

    await handler.on(event);

    expect(progressUpdater.applyFlashcardViewed).toHaveBeenCalledWith(
      event.attributes,
    );
  });

  it('should subscribe to FlashcardViewedEvent', () => {
    expect(handler.eventName).toBe(FlashcardViewedEvent.EVENT_NAME);
  });
});
