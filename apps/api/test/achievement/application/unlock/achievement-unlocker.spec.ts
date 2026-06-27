import { mock } from 'jest-mock-extended';
import { AchievementUnlocker } from '@/achievement/application/unlock/achievement-unlocker';
import { type UserAchievementRepository } from '@/achievement/domain/user-achievement.repository';
import { UserAchievement } from '@/achievement/domain/user-achievement';
import { UserId } from '@/shared/domain/user-id';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/application/unlock AchievementUnlocker', () => {
  const repository = mock<UserAchievementRepository>();
  let unlocker: AchievementUnlocker;

  beforeEach(() => {
    repository.findByUserId.mockReset();
    repository.save.mockReset();
    unlocker = new AchievementUnlocker(repository);
  });

  it('should unlock a new achievement', async () => {
    const userId = UserIdMother.random().value;
    repository.findByUserId.mockResolvedValueOnce([]);

    const unlocked = await unlocker.unlock(userId, 'first_game');

    expect(unlocked).toBe(true);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('should be idempotent when achievement already exists', async () => {
    const userId = UserIdMother.random().value;
    repository.findByUserId.mockResolvedValueOnce([
      UserAchievement.unlock(new UserId(userId), 'first_game'),
    ]);

    const unlocked = await unlocker.unlock(userId, 'first_game');

    expect(unlocked).toBe(false);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
