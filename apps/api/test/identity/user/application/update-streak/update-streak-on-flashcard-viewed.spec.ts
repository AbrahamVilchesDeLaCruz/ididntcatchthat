import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type StreakUpdater } from '@/identity/user/application/update-streak/streak-updater';
import { StreakUpdaterOnFlashcardViewed } from '@/identity/user/application/update-streak/update-streak-on-flashcard-viewed';
import { FlashcardViewedEvent } from '@/gaming/domain/events/flashcard-viewed.event';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { DateMother } from '@test/shared/domain/date-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('identity/user/application/update-streak StreakUpdaterOnFlashcardViewed', () => {
  const consumer = mock<DomainEventConsumer>();
  const updater = mock<StreakUpdater>();
  let handler: StreakUpdaterOnFlashcardViewed;

  beforeEach(() => {
    updater.execute.mockReset();
    updater.execute.mockResolvedValue(undefined);
    handler = new StreakUpdaterOnFlashcardViewed(consumer, updater);
  });

  it('should skip when userId is null', async () => {
    const event = new FlashcardViewedEvent(UuidMother.random(), {
      gameId: UuidMother.random(),
      userId: null,
      flashcardId: UuidMother.random(),
      mode: 'study',
      viewedAt: DateMother.recent().toISOString(),
    });

    await handler.on(event);

    expect(updater.execute).not.toHaveBeenCalled();
  });

  it('should delegate to StreakUpdater', async () => {
    const userId = UserIdMother.random().value;
    const viewedAt = DateMother.recent().toISOString();
    const event = new FlashcardViewedEvent(UuidMother.random(), {
      gameId: UuidMother.random(),
      userId,
      flashcardId: UuidMother.random(),
      mode: 'study',
      viewedAt,
    });

    await handler.on(event);

    expect(updater.execute).toHaveBeenCalledWith({
      userId,
      activityDate: viewedAt,
    });
  });
});
