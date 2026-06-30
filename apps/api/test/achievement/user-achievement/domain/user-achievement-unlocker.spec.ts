import { mock } from 'jest-mock-extended';
import { UserAchievementUnlocker } from '@/achievement/user-achievement/domain/user-achievement-unlocker';
import { type UserAchievementRepository } from '@/achievement/user-achievement/domain/user-achievement.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type Logger } from '@/shared/domain/logger';
import { AchievementCatalog } from '@/achievement/catalog/domain/achievement-catalog';
import { AchievementUnlockedEvent } from '@/achievement/user-achievement/domain/events/achievement-unlocked.event';
import { AchievementKey } from '@/achievement/shared/domain/achievement-key';
import { AchievementKeyValue } from '@/achievement/shared/domain/achievement-key-values';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/user-achievement/domain UserAchievementUnlocker', () => {
  const repository = mock<UserAchievementRepository>();
  const publisher = mock<DomainEventPublisher>();
  const logger = mock<Logger>();
  const catalog = new AchievementCatalog();
  let unlocker: UserAchievementUnlocker;

  beforeEach(() => {
    repository.search.mockReset();
    repository.save.mockReset();
    publisher.publish.mockReset();
    logger.info.mockReset();
    unlocker = new UserAchievementUnlocker(
      repository,
      publisher,
      logger,
      catalog,
    );
  });

  it('should unlock a new achievement and publish event', async () => {
    const userId = UserIdMother.random().value;
    const key = AchievementKey.create(AchievementKeyValue.FirstGame);
    repository.search.mockResolvedValueOnce(null);

    await unlocker.unlock(userId, key);

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const events = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(AchievementUnlockedEvent);
    expect(logger.info).toHaveBeenCalledWith('Achievement unlocked', {
      userId,
      achievementKey: AchievementKeyValue.FirstGame,
      category: 'game',
    });
  });

  it('should be idempotent when achievement already exists', async () => {
    const userId = UserIdMother.random().value;
    const key = AchievementKey.create(AchievementKeyValue.FirstGame);
    repository.search.mockResolvedValueOnce(
      {} as Awaited<ReturnType<UserAchievementRepository['search']>>,
    );

    await unlocker.unlock(userId, key);

    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });
});
