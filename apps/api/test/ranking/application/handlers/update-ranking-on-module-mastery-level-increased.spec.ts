import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type RankingUpdater } from '@/ranking/application/update/ranking-updater';
import { UpdateRankingOnModuleMasteryLevelIncreased } from '@/ranking/application/handlers/update-ranking-on-module-mastery-level-increased';
import { ModuleMasteryLevelIncreasedEvent } from '@/progress/domain/events/module-mastery-level-increased.event';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('ranking/application/handlers UpdateRankingOnModuleMasteryLevelIncreased', () => {
  const consumer = mock<DomainEventConsumer>();
  const updater = mock<RankingUpdater>();
  let handler: UpdateRankingOnModuleMasteryLevelIncreased;

  beforeEach(() => {
    updater.recordModuleMastery.mockReset();
    updater.recordModuleMastery.mockResolvedValue(undefined);
    handler = new UpdateRankingOnModuleMasteryLevelIncreased(consumer, updater);
  });

  it('should delegate to RankingUpdater', async () => {
    const userId = UuidMother.random();
    const event = new ModuleMasteryLevelIncreasedEvent(userId, {
      userId,
      module: 'native_sounds',
      newLevel: 2,
      previousLevel: 1,
      occurredAt: new Date().toISOString(),
    });

    await handler.on(event);

    expect(updater.recordModuleMastery).toHaveBeenCalledWith(
      userId,
      'native_sounds',
      2,
    );
  });
});
