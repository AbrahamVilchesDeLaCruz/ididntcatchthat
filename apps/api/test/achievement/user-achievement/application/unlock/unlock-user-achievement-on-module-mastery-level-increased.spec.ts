import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { UnlockUserAchievementOnModuleMasteryLevelIncreased } from '@/achievement/user-achievement/application/unlock/unlock-user-achievement-on-module-mastery-level-increased';
import { type ModuleMasteryAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/module-mastery-achievement-unlocker';
import { ModuleMasteryLevelIncreasedEvent } from '@/progress/domain/events/module-mastery-level-increased.event';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('achievement/user-achievement/application/unlock UnlockUserAchievementOnModuleMasteryLevelIncreased', () => {
  const consumer = mock<DomainEventConsumer>();
  const unlocker = mock<ModuleMasteryAchievementUnlocker>();
  let handler: UnlockUserAchievementOnModuleMasteryLevelIncreased;

  beforeEach(() => {
    unlocker.execute.mockReset();
    handler = new UnlockUserAchievementOnModuleMasteryLevelIncreased(
      consumer,
      unlocker,
    );
  });

  it('should delegate module mastery events to the unlocker', async () => {
    const userId = UuidMother.random();
    const event = new ModuleMasteryLevelIncreasedEvent(userId, {
      userId,
      module: 'native_sounds',
      previousLevel: 1,
      newLevel: 2,
      occurredAt: new Date().toISOString(),
    });

    await handler.on(event);

    expect(unlocker.execute).toHaveBeenCalledWith({
      userId,
      newLevel: 2,
    });
  });
});
