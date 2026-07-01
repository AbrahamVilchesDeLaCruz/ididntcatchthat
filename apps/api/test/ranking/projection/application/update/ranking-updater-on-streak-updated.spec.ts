import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type RecordRankingStreakUpdated } from '@/ranking/projection/application/update/record-ranking-streak-updated';
import { RankingUpdaterOnStreakUpdated } from '@/ranking/projection/application/update/ranking-updater-on-streak-updated';
import { StreakUpdatedEvent } from '@/identity/user/domain/events/streak-updated.event';
import { StreakUpdatedEventMother } from '@test/identity/user/domain/streak-updated-event-mother';
import { StreakCountMother } from '@test/identity/user/domain/streak-count-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('ranking/projection/application/update RankingUpdaterOnStreakUpdated', () => {
  const consumer = mock<DomainEventConsumer>();
  const recorder = mock<RecordRankingStreakUpdated>();
  let handler: RankingUpdaterOnStreakUpdated;

  beforeEach(() => {
    recorder.execute.mockReset();
    recorder.execute.mockResolvedValue(undefined);
    handler = new RankingUpdaterOnStreakUpdated(consumer, recorder);
  });

  it('should delegate to RecordRankingStreakUpdated', async () => {
    const userId = UserIdMother.random().value;
    const newStreak = StreakCountMother.week();
    const event = StreakUpdatedEventMother.withStreak(newStreak, { userId });

    await handler.on(event);

    expect(recorder.execute).toHaveBeenCalledWith({
      userId,
      newStreak,
    });
  });

  it('should subscribe to StreakUpdatedEvent', () => {
    expect(handler.eventName).toBe(StreakUpdatedEvent.EVENT_NAME);
  });
});
