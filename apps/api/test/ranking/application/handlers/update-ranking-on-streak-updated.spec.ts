import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type RankingUpdater } from '@/ranking/application/update/ranking-updater';
import { UpdateRankingOnStreakUpdated } from '@/ranking/application/handlers/update-ranking-on-streak-updated';
import { StreakUpdatedEvent } from '@/identity/user/domain/events/streak-updated.event';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('ranking/application/handlers UpdateRankingOnStreakUpdated', () => {
  const consumer = mock<DomainEventConsumer>();
  const updater = mock<RankingUpdater>();
  let handler: UpdateRankingOnStreakUpdated;

  beforeEach(() => {
    updater.recordStreakUpdated.mockReset();
    updater.recordStreakUpdated.mockResolvedValue(undefined);
    handler = new UpdateRankingOnStreakUpdated(consumer, updater);
  });

  it('should delegate to RankingUpdater', async () => {
    const userId = UuidMother.random();
    const event = new StreakUpdatedEvent(userId, {
      userId,
      newStreak: 5,
      previousStreak: 4,
      occurredAt: new Date().toISOString(),
    });

    await handler.on(event);

    expect(updater.recordStreakUpdated).toHaveBeenCalledWith(userId, 5);
  });
});
