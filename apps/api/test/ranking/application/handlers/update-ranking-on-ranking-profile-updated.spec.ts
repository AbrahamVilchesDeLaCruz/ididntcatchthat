import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { UpdateRankingOnRankingProfileUpdated } from '@/ranking/application/handlers/update-ranking-on-ranking-profile-updated';
import { type RankingUpdater } from '@/ranking/application/update/ranking-updater';
import { RankingProfileUpdatedEvent } from '@/identity/user/domain/events/ranking-profile-updated.event';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('ranking/application/handlers UpdateRankingOnRankingProfileUpdated', () => {
  const consumer = mock<DomainEventConsumer>();
  const updater = mock<RankingUpdater>();
  let handler: UpdateRankingOnRankingProfileUpdated;

  beforeEach(() => {
    updater.syncProfile.mockReset();
    updater.syncProfile.mockResolvedValue(undefined);
    handler = new UpdateRankingOnRankingProfileUpdated(consumer, updater);
  });

  it('should sync ranking profile on RankingProfileUpdated', async () => {
    const userId = UserIdMother.random().value;
    const event = new RankingProfileUpdatedEvent(userId, {
      userId,
      showInRanking: true,
      nickname: 'rankhero',
    });

    await handler.on(event);

    expect(updater.syncProfile).toHaveBeenCalledWith(userId, true, 'rankhero');
  });
});
