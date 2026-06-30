import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { UnlockUserAchievementOnStreakUpdated } from '@/achievement/user-achievement/application/unlock/unlock-user-achievement-on-streak-updated';
import { type StreakAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/streak-achievement-unlocker';
import { StreakUpdatedEvent } from '@/identity/user/domain/events/streak-updated.event';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('achievement/user-achievement/application/unlock UnlockUserAchievementOnStreakUpdated', () => {
  const consumer = mock<DomainEventConsumer>();
  const unlocker = mock<StreakAchievementUnlocker>();
  let handler: UnlockUserAchievementOnStreakUpdated;

  beforeEach(() => {
    unlocker.execute.mockReset();
    handler = new UnlockUserAchievementOnStreakUpdated(consumer, unlocker);
  });

  it('should delegate streak updated events to the unlocker', async () => {
    const userId = UuidMother.random();
    const event = new StreakUpdatedEvent(userId, {
      userId,
      previousStreak: 29,
      newStreak: 30,
      occurredAt: new Date().toISOString(),
    });

    await handler.on(event);

    expect(unlocker.execute).toHaveBeenCalledWith({
      userId,
      newStreak: 30,
    });
  });
});
