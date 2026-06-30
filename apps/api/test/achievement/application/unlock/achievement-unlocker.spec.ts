import { mock } from 'jest-mock-extended';
import { AchievementUnlocker } from '@/achievement/application/unlock/achievement-unlocker';
import { type UserAchievementRepository } from '@/achievement/domain/user-achievement.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { AchievementUnlockedEvent } from '@/achievement/domain/events/achievement-unlocked.event';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/application/unlock AchievementUnlocker', () => {
  const repository = mock<UserAchievementRepository>();
  const publisher = mock<DomainEventPublisher>();
  let unlocker: AchievementUnlocker;

  beforeEach(() => {
    repository.exists.mockReset();
    repository.save.mockReset();
    publisher.publish.mockReset();
    unlocker = new AchievementUnlocker(repository, publisher);
  });

  it('should unlock a new achievement and publish event', async () => {
    const userId = UserIdMother.random().value;
    repository.exists.mockResolvedValueOnce(false);

    const unlocked = await unlocker.unlock(userId, 'first_game');

    expect(unlocked).toBe(true);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const events = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(AchievementUnlockedEvent);
  });

  it('should be idempotent when achievement already exists', async () => {
    const userId = UserIdMother.random().value;
    repository.exists.mockResolvedValueOnce(true);

    const unlocked = await unlocker.unlock(userId, 'first_game');

    expect(unlocked).toBe(false);
    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
