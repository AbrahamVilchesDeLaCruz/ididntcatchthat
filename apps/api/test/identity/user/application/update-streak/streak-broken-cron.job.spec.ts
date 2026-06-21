import { mock } from 'jest-mock-extended';
import { type Repository, type SelectQueryBuilder } from 'typeorm';
import { StreakBrokenCronJob } from '@/identity/user/application/update-streak/streak-broken-cron.job';
import { type UserRepository } from '@/identity/user/domain/user.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type Logger } from '@/shared/domain/logger';
import { type UserEntity } from '@/identity/user/infrastructure/persistence/user.entity';
import { StreakBrokenEvent } from '@/identity/user/domain/events/streak-broken.event';
import { UserMother } from '@test/identity/user/domain/user-mother';

describe('identity/user/application/update-streak StreakBrokenCronJob', () => {
  const userRepo = mock<Repository<UserEntity>>();
  const userRepository = mock<UserRepository>();
  const publisher = mock<DomainEventPublisher>();
  const logger = mock<Logger>();
  let job: StreakBrokenCronJob;

  const staleEntity = (): UserEntity => {
    const user = UserMother.random({
      currentStreak: 3,
      longestStreak: 5,
      lastActivityDate: new Date('2026-06-01'),
    });
    const primitives = user.toPrimitives();

    return {
      id: primitives.id,
      email: primitives.email,
      passwordHash: primitives.passwordHash,
      nickname: primitives.nickname,
      avatarUrl: primitives.avatarUrl,
      role: primitives.role,
      oauthProvider: primitives.oauthProvider,
      showInRanking: primitives.showInRanking,
      currentStreak: primitives.currentStreak,
      longestStreak: primitives.longestStreak,
      lastActivityDate: primitives.lastActivityDate,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    };
  };

  beforeEach(() => {
    userRepo.createQueryBuilder.mockReset();
    userRepository.save.mockReset();
    publisher.publish.mockReset();
    logger.info.mockReset();
    publisher.publish.mockResolvedValue(undefined);
    userRepository.save.mockResolvedValue(undefined);
    job = new StreakBrokenCronJob(userRepo, userRepository, publisher, logger);
  });

  it('should reset stale streaks and publish StreakBrokenEvent', async () => {
    const entity = staleEntity();
    const qb = mock<SelectQueryBuilder<UserEntity>>();
    qb.where.mockReturnValue(qb);
    qb.andWhere.mockReturnValue(qb);
    qb.getMany.mockResolvedValue([entity]);
    userRepo.createQueryBuilder.mockReturnValue(qb);

    await job.handleCron();

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    expect(publisher.publish.mock.calls[0][0][0]).toBeInstanceOf(
      StreakBrokenEvent,
    );
    expect(logger.info).toHaveBeenCalledWith('Broken stale streaks', {
      count: 1,
    });
  });

  it('should do nothing when there are no stale users', async () => {
    const qb = mock<SelectQueryBuilder<UserEntity>>();
    qb.where.mockReturnValue(qb);
    qb.andWhere.mockReturnValue(qb);
    qb.getMany.mockResolvedValue([]);
    userRepo.createQueryBuilder.mockReturnValue(qb);

    await job.handleCron();

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });
});
