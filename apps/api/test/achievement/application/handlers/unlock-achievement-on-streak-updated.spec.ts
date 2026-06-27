import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { UnlockAchievementOnStreakUpdated } from '@/achievement/application/handlers/unlock-achievement-on-streak-updated';
import { type AchievementUnlocker } from '@/achievement/application/unlock/achievement-unlocker';
import { StreakUpdatedEvent } from '@/identity/user/domain/events/streak-updated.event';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('achievement/application/handlers UnlockAchievementOnStreakUpdated', () => {
  const consumer = mock<DomainEventConsumer>();
  const unlocker = mock<AchievementUnlocker>();
  let handler: UnlockAchievementOnStreakUpdated;

  beforeEach(() => {
    unlocker.unlock.mockReset();
    unlocker.unlock.mockResolvedValue(true);
    handler = new UnlockAchievementOnStreakUpdated(consumer, unlocker);
  });

  it('should unlock streak achievements when thresholds are met', async () => {
    const userId = UuidMother.random();
    const event = new StreakUpdatedEvent(userId, {
      userId,
      previousStreak: 29,
      newStreak: 30,
      occurredAt: new Date().toISOString(),
    });

    await handler.on(event);

    expect(unlocker.unlock).toHaveBeenCalledWith(userId, 'streak_7');
    expect(unlocker.unlock).toHaveBeenCalledWith(userId, 'streak_30');
  });

  it('should not unlock streak achievements below thresholds', async () => {
    const userId = UuidMother.random();
    const event = new StreakUpdatedEvent(userId, {
      userId,
      previousStreak: 2,
      newStreak: 3,
      occurredAt: new Date().toISOString(),
    });

    await handler.on(event);

    expect(unlocker.unlock).not.toHaveBeenCalled();
  });
});
