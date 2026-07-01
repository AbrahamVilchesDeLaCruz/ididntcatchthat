import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type RecordRankingGameCompleted } from '@/ranking/projection/application/update/record-ranking-game-completed';
import { RankingUpdaterOnGameCompleted } from '@/ranking/projection/application/update/ranking-updater-on-game-completed';
import { GameCompletedEventMother } from '@test/gaming/domain/game-completed-event-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { DateMother } from '@test/shared/domain/date-mother';

describe('ranking/projection/application/update RankingUpdaterOnGameCompleted', () => {
  const consumer = mock<DomainEventConsumer>();
  const recorder = mock<RecordRankingGameCompleted>();
  let handler: RankingUpdaterOnGameCompleted;

  beforeEach(() => {
    recorder.execute.mockReset();
    recorder.execute.mockResolvedValue(undefined);
    handler = new RankingUpdaterOnGameCompleted(consumer, recorder);
  });

  it('should skip when userId is null', async () => {
    await handler.on(GameCompletedEventMother.guest());

    expect(recorder.execute).not.toHaveBeenCalled();
  });

  it('should delegate to RecordRankingGameCompleted', async () => {
    const userId = UserIdMother.random().value;
    const finishedAt = DateMother.recent().toISOString();
    const event = GameCompletedEventMother.random({ userId, finishedAt });

    await handler.on(event);

    expect(recorder.execute).toHaveBeenCalledWith({
      userId,
      mode: event.attrs.mode,
      finishedAt,
    });
  });
});
