import { UserAchievement } from '@/achievement/user-achievement/domain/user-achievement';
import { AchievementUnlockedEvent } from '@/achievement/user-achievement/domain/events/achievement-unlocked.event';
import { AchievementKey } from '@/achievement/shared/domain/achievement-key';
import { AchievementCategory } from '@/achievement/shared/domain/achievement-category';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/user-achievement/domain UserAchievement', () => {
  it('should record AchievementUnlocked event when unlocking', () => {
    const userId = UserIdMother.random();
    const key = AchievementKey.create('first_game');
    const category = AchievementCategory.create('game');

    const achievement = UserAchievement.unlock(userId, key, category);
    const events = achievement.pullDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(AchievementUnlockedEvent);
    expect(events[0].attributes).toMatchObject({
      userId: userId.value,
      achievementKey: 'first_game',
      category: 'game',
    });
  });
});
