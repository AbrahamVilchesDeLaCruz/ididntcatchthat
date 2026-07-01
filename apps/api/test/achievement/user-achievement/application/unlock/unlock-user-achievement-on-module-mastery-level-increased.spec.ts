import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { UnlockUserAchievementOnModuleMasteryLevelIncreased } from '@/achievement/user-achievement/application/unlock/unlock-user-achievement-on-module-mastery-level-increased';
import { type ModuleMasteryAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/module-mastery-achievement-unlocker';
import { ModuleMasteryLevelIncreasedEvent } from '@/progress/domain/events/module-mastery-level-increased.event';
import { ModuleMasteryLevelIncreasedEventMother } from '@test/progress/domain/module-mastery-level-increased-event-mother';
import { ModuleMasteryLevelMother } from '@test/progress/domain/module-mastery-level-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

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
    const userId = UserIdMother.random().value;
    const newLevel = ModuleMasteryLevelMother.intermediate();
    const event = ModuleMasteryLevelIncreasedEventMother.withLevel(newLevel, {
      userId,
    });

    await handler.on(event);

    expect(unlocker.execute).toHaveBeenCalledWith({
      userId,
      newLevel,
    });
  });

  it('should subscribe to ModuleMasteryLevelIncreasedEvent', () => {
    expect(handler.eventName).toBe(ModuleMasteryLevelIncreasedEvent.EVENT_NAME);
  });
});
