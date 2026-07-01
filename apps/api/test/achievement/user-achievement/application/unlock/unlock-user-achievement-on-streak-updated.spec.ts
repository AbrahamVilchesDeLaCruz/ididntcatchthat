import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { UnlockUserAchievementOnStreakUpdated } from '@/achievement/user-achievement/application/unlock/unlock-user-achievement-on-streak-updated';
import { type StreakAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/streak-achievement-unlocker';
import { StreakUpdatedEvent } from '@/identity/user/domain/events/streak-updated.event';
import { StreakUpdatedEventMother } from '@test/identity/user/domain/streak-updated-event-mother';
import { StreakCountMother } from '@test/identity/user/domain/streak-count-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/user-achievement/application/unlock UnlockUserAchievementOnStreakUpdated', () => {
  const consumer = mock<DomainEventConsumer>();
  const unlocker = mock<StreakAchievementUnlocker>();
  let handler: UnlockUserAchievementOnStreakUpdated;

  beforeEach(() => {
    unlocker.execute.mockReset();
    handler = new UnlockUserAchievementOnStreakUpdated(consumer, unlocker);
  });

  it('should delegate streak updated events to the unlocker', async () => {
    const userId = UserIdMother.random().value;
    const newStreak = StreakCountMother.month();
    const event = StreakUpdatedEventMother.withStreak(newStreak, { userId });

    await handler.on(event);

    expect(unlocker.execute).toHaveBeenCalledWith({
      userId,
      newStreak,
    });
  });

  it('should subscribe to StreakUpdatedEvent', () => {
    expect(handler.eventName).toBe(StreakUpdatedEvent.EVENT_NAME);
  });
});
