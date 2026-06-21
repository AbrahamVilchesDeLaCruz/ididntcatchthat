import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type StreakUpdater } from '@/identity/user/application/update-streak/streak-updater';
import { StreakUpdaterOnGameCompleted } from '@/identity/user/application/update-streak/update-streak-on-game-completed';
import { GameCompletedEventMother } from '@test/gaming/domain/game-completed-event-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { DateMother } from '@test/shared/domain/date-mother';

describe('identity/user/application/update-streak StreakUpdaterOnGameCompleted', () => {
  const consumer = mock<DomainEventConsumer>();
  const updater = mock<StreakUpdater>();
  let handler: StreakUpdaterOnGameCompleted;

  beforeEach(() => {
    updater.execute.mockReset();
    updater.execute.mockResolvedValue(undefined);
    handler = new StreakUpdaterOnGameCompleted(consumer, updater);
  });

  it('should skip when userId is null', async () => {
    await handler.on(GameCompletedEventMother.guest());

    expect(updater.execute).not.toHaveBeenCalled();
  });

  it('should delegate to StreakUpdater', async () => {
    const userId = UserIdMother.random().value;
    const finishedAt = DateMother.recent().toISOString();
    const event = GameCompletedEventMother.random({ userId, finishedAt });

    await handler.on(event);

    expect(updater.execute).toHaveBeenCalledWith({
      userId,
      activityDate: finishedAt,
    });
  });
});
