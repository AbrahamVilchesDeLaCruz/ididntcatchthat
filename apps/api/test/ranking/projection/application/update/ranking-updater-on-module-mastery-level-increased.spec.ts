import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type RecordRankingModuleMastery } from '@/ranking/projection/application/update/record-ranking-module-mastery';
import { RankingUpdaterOnModuleMasteryLevelIncreased } from '@/ranking/projection/application/update/ranking-updater-on-module-mastery-level-increased';
import { ModuleMasteryLevelIncreasedEvent } from '@/progress/domain/events/module-mastery-level-increased.event';
import { ModuleMasteryLevelIncreasedEventMother } from '@test/progress/domain/module-mastery-level-increased-event-mother';
import { ModuleMasteryLevelMother } from '@test/progress/domain/module-mastery-level-mother';
import { ModuleNameMother } from '@test/progress/domain/module-name-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('ranking/projection/application/update RankingUpdaterOnModuleMasteryLevelIncreased', () => {
  const consumer = mock<DomainEventConsumer>();
  const recorder = mock<RecordRankingModuleMastery>();
  let handler: RankingUpdaterOnModuleMasteryLevelIncreased;

  beforeEach(() => {
    recorder.execute.mockReset();
    recorder.execute.mockResolvedValue(undefined);
    handler = new RankingUpdaterOnModuleMasteryLevelIncreased(
      consumer,
      recorder,
    );
  });

  it('should delegate to RecordRankingModuleMastery', async () => {
    const userId = UserIdMother.random().value;
    const module = ModuleNameMother.nativeSounds().value;
    const level = ModuleMasteryLevelMother.intermediate();
    const event = ModuleMasteryLevelIncreasedEventMother.withLevel(level, {
      userId,
      module,
    });

    await handler.on(event);

    expect(recorder.execute).toHaveBeenCalledWith({
      userId,
      module,
      level,
    });
  });

  it('should subscribe to ModuleMasteryLevelIncreasedEvent', () => {
    expect(handler.eventName).toBe(ModuleMasteryLevelIncreasedEvent.EVENT_NAME);
  });
});
