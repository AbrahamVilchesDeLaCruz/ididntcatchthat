import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type SyncRankingProfile } from '@/ranking/projection/application/update/sync-ranking-profile';
import { RankingUpdaterOnRankingProfileUpdated } from '@/ranking/projection/application/update/ranking-updater-on-ranking-profile-updated';
import { RankingProfileUpdatedEvent } from '@/identity/user/domain/events/ranking-profile-updated.event';
import { RankingProfileUpdatedEventMother } from '@test/identity/user/domain/ranking-profile-updated-event-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';

describe('ranking/projection/application/update RankingUpdaterOnRankingProfileUpdated', () => {
  const consumer = mock<DomainEventConsumer>();
  const syncer = mock<SyncRankingProfile>();
  let handler: RankingUpdaterOnRankingProfileUpdated;

  beforeEach(() => {
    syncer.execute.mockReset();
    syncer.execute.mockResolvedValue(undefined);
    handler = new RankingUpdaterOnRankingProfileUpdated(consumer, syncer);
  });

  it('should delegate to SyncRankingProfile', async () => {
    const userId = UserIdMother.random().value;
    const nickname = NicknameMother.random().value;
    const event = RankingProfileUpdatedEventMother.optedIn({
      userId,
      nickname,
    });

    await handler.on(event);

    expect(syncer.execute).toHaveBeenCalledWith({
      userId,
      showInRanking: true,
      nickname,
    });
  });

  it('should subscribe to RankingProfileUpdatedEvent', () => {
    expect(handler.eventName).toBe(RankingProfileUpdatedEvent.EVENT_NAME);
  });
});
