import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type RankingUpdater } from '@/ranking/application/update/ranking-updater';
import { UpdateRankingOnGameCompleted } from '@/ranking/application/handlers/update-ranking-on-game-completed';
import { GameCompletedEventMother } from '@test/gaming/domain/game-completed-event-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { DateMother } from '@test/shared/domain/date-mother';

describe('ranking/application/handlers UpdateRankingOnGameCompleted', () => {
  const consumer = mock<DomainEventConsumer>();
  const updater = mock<RankingUpdater>();
  let handler: UpdateRankingOnGameCompleted;

  beforeEach(() => {
    updater.recordGameCompleted.mockReset();
    updater.recordGameCompleted.mockResolvedValue(undefined);
    handler = new UpdateRankingOnGameCompleted(consumer, updater);
  });

  it('should skip when userId is null', async () => {
    await handler.on(GameCompletedEventMother.guest());

    expect(updater.recordGameCompleted).not.toHaveBeenCalled();
  });

  it('should delegate to RankingUpdater', async () => {
    const userId = UserIdMother.random().value;
    const finishedAt = DateMother.recent().toISOString();
    const event = GameCompletedEventMother.random({ userId, finishedAt });

    await handler.on(event);

    expect(updater.recordGameCompleted).toHaveBeenCalledWith(
      userId,
      event.attrs.mode,
      finishedAt,
    );
  });
});
