import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { UnlockAchievementOnModuleMasteryLevelIncreased } from '@/achievement/application/handlers/unlock-achievement-on-module-mastery-level-increased';
import { type AchievementUnlocker } from '@/achievement/application/unlock/achievement-unlocker';
import { ModuleMasteryLevelIncreasedEvent } from '@/progress/domain/events/module-mastery-level-increased.event';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('achievement/application/handlers UnlockAchievementOnModuleMasteryLevelIncreased', () => {
  const consumer = mock<DomainEventConsumer>();
  const unlocker = mock<AchievementUnlocker>();
  let handler: UnlockAchievementOnModuleMasteryLevelIncreased;

  beforeEach(() => {
    unlocker.unlock.mockReset();
    unlocker.unlock.mockResolvedValue(true);
    handler = new UnlockAchievementOnModuleMasteryLevelIncreased(
      consumer,
      unlocker,
    );
  });

  it('should unlock module mastery achievements when thresholds are met', async () => {
    const userId = UuidMother.random();
    const event = new ModuleMasteryLevelIncreasedEvent(userId, {
      userId,
      module: 'native_sounds',
      previousLevel: 2,
      newLevel: 3,
      occurredAt: new Date().toISOString(),
    });

    await handler.on(event);

    expect(unlocker.unlock).toHaveBeenCalledWith(userId, 'module_mastery_2');
    expect(unlocker.unlock).toHaveBeenCalledWith(userId, 'module_mastery_3');
  });

  it('should not unlock module mastery achievements below thresholds', async () => {
    const userId = UuidMother.random();
    const event = new ModuleMasteryLevelIncreasedEvent(userId, {
      userId,
      module: 'native_sounds',
      previousLevel: 0,
      newLevel: 1,
      occurredAt: new Date().toISOString(),
    });

    await handler.on(event);

    expect(unlocker.unlock).not.toHaveBeenCalled();
  });
});
