import { mock } from 'jest-mock-extended';
import { StreakBrokenCronJob } from '@/identity/user/application/update-streak/streak-broken-cron.job';
import { type UserRepository } from '@/identity/user/domain/user.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type Logger } from '@/shared/domain/logger';
import { StreakBrokenEvent } from '@/identity/user/domain/events/streak-broken.event';
import { UserMother } from '@test/identity/user/domain/user-mother';

describe('identity/user/application/update-streak StreakBrokenCronJob', () => {
  const userRepository = mock<UserRepository>();
  const publisher = mock<DomainEventPublisher>();
  const logger = mock<Logger>();
  let job: StreakBrokenCronJob;

  beforeEach(() => {
    userRepository.findWithStaleStreak.mockReset();
    userRepository.save.mockReset();
    publisher.publish.mockReset();
    logger.info.mockReset();
    publisher.publish.mockResolvedValue(undefined);
    userRepository.save.mockResolvedValue(undefined);
    job = new StreakBrokenCronJob(userRepository, publisher, logger);
  });

  it('should reset stale streaks and publish StreakBrokenEvent', async () => {
    const staleUser = UserMother.random({
      currentStreak: 3,
      longestStreak: 5,
      lastActivityDate: new Date('2026-06-01'),
    });
    userRepository.findWithStaleStreak.mockResolvedValueOnce([staleUser]);

    await job.handleCron();

    expect(userRepository.findWithStaleStreak).toHaveBeenCalledTimes(1);
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
    userRepository.findWithStaleStreak.mockResolvedValueOnce([]);

    await job.handleCron();

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });
});
